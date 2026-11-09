"""Dictionary-based translator (MVP).

Greedy longest-match over the token sequence: at each position the longest
phrase (up to MAX_PHRASE_TOKENS words) that maps to a public sign wins.
Lookup keys are registered word forms (sign_aliases) and the sign's own
Uzbek label. Words without a sign are returned as ``unmatched`` — never
guessed, fingerspelled or replaced.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings
from app.models import LanguageVariant, Sign, SignAlias, SignVideo, VideoValidationStatus
from app.schemas.signs import LanguageVariantRef
from app.schemas.translation import (
    Segment,
    TextToSignResponse,
    TranslatedSign,
    TranslatedVideo,
)
from app.services.dictionary import video_url, visibility_filter
from app.services.text_normalization import search_key_sql
from app.services.translation.tokenizer import Token, tokenize

MAX_PHRASE_TOKENS = 4


@dataclass(frozen=True, slots=True)
class _Match:
    start: int  # token index, inclusive
    end: int  # token index, exclusive
    sign_id: uuid.UUID | None


def _phrase_key(tokens: list[Token], start: int, end: int) -> str:
    return " ".join(t.key for t in tokens[start:end])


def _candidate_keys(tokens: list[Token]) -> set[str]:
    return {
        _phrase_key(tokens, i, j)
        for i in range(len(tokens))
        for j in range(i + 1, min(i + MAX_PHRASE_TOKENS, len(tokens)) + 1)
    }


class DictionaryTranslator:
    def __init__(self, session: AsyncSession, settings: Settings) -> None:
        self._session = session
        self._settings = settings

    async def _lookup(self, keys: set[str], variant: LanguageVariant) -> dict[str, uuid.UUID]:
        """Map phrase keys to sign IDs. Registered aliases take precedence over labels."""
        if not keys:
            return {}
        visible = visibility_filter(self._settings)
        label_key = search_key_sql(Sign.uzbek_label)
        label_rows = await self._session.execute(
            select(label_key, Sign.id)
            .join(Sign.language_variant)
            .where(Sign.language_variant_id == variant.id, label_key.in_(keys), visible)
            # Deterministic choice if two signs share a label: lowest gloss wins.
            .order_by(Sign.gloss.desc())
        )
        mapping: dict[str, uuid.UUID] = {key: sid for key, sid in label_rows.all()}
        alias_rows = await self._session.execute(
            select(SignAlias.normalized_text, Sign.id)
            .join(Sign, Sign.id == SignAlias.sign_id)
            .join(Sign.language_variant)
            .where(
                SignAlias.language_variant_id == variant.id,
                SignAlias.normalized_text.in_(keys),
                visible,
            )
        )
        mapping.update({key: sid for key, sid in alias_rows.all()})
        return mapping

    async def _signs(self, sign_ids: set[uuid.UUID]) -> dict[uuid.UUID, TranslatedSign]:
        if not sign_ids:
            return {}
        signs = (await self._session.execute(select(Sign).where(Sign.id.in_(sign_ids)))).scalars()
        videos = (
            await self._session.execute(
                select(SignVideo)
                .where(
                    SignVideo.sign_id.in_(sign_ids),
                    SignVideo.validation_status == VideoValidationStatus.VALIDATED,
                )
                .order_by(SignVideo.is_primary.desc(), SignVideo.created_at)
            )
        ).scalars()
        best_video: dict[uuid.UUID, SignVideo] = {}
        for candidate in videos:
            best_video.setdefault(candidate.sign_id, candidate)

        result: dict[uuid.UUID, TranslatedSign] = {}
        for sign in signs:
            video = best_video.get(sign.id)
            result[sign.id] = TranslatedSign(
                id=sign.id,
                gloss=sign.gloss,
                uzbek_label=sign.uzbek_label,
                is_test_data=sign.is_test_data,
                video=TranslatedVideo(
                    url=video_url(self._settings, video.storage_key),
                    duration_ms=video.duration_ms,
                    video_format=video.video_format,
                )
                if video
                else None,
            )
        return result

    async def translate(self, text: str, variant: LanguageVariant | None) -> TextToSignResponse:
        tokens = tokenize(text)
        lookup = await self._lookup(_candidate_keys(tokens), variant) if variant else {}

        matches: list[_Match] = []
        i = 0
        while i < len(tokens):
            for length in range(min(MAX_PHRASE_TOKENS, len(tokens) - i), 0, -1):
                sign_id = lookup.get(_phrase_key(tokens, i, i + length))
                if sign_id is not None:
                    matches.append(_Match(i, i + length, sign_id))
                    i += length
                    break
            else:
                matches.append(_Match(i, i + 1, None))
                i += 1

        signs = await self._signs({m.sign_id for m in matches if m.sign_id})
        segments: list[Segment] = []
        unmatched_words: list[str] = []
        for match in matches:
            first, last = tokens[match.start], tokens[match.end - 1]
            key = _phrase_key(tokens, match.start, match.end)
            sign = signs.get(match.sign_id) if match.sign_id else None
            segments.append(
                Segment(
                    type="sign" if sign else "unmatched",
                    text=text[first.start : last.end],
                    normalized=key,
                    start=first.start,
                    end=last.end,
                    sign=sign,
                )
            )
            if sign is None and key not in unmatched_words:
                unmatched_words.append(key)

        matched = sum(1 for s in segments if s.type == "sign")
        return TextToSignResponse(
            method="dictionary_lookup",
            input_text=text,
            language_variant=LanguageVariantRef.model_validate(variant) if variant else None,
            segments=segments,
            matched_count=matched,
            unmatched_count=len(segments) - matched,
            unmatched_words=unmatched_words,
        )
