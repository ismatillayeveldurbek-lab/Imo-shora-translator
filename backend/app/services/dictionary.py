"""Public sign dictionary queries.

Visibility rule (single source of truth): a sign is public only when it is
expert-verified, is not test data, belongs to a non-test language variant and
has at least one validated video. In development, ``dictionary_include_test_data``
additionally exposes rows flagged ``is_test_data`` (clearly marked as such).
"""

from __future__ import annotations

import math
import uuid
from dataclasses import dataclass
from urllib.parse import quote

from sqlalchemy import ColumnElement, and_, exists, func, not_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import contains_eager, selectinload

from app.core.config import Settings
from app.models import (
    Category,
    LanguageVariant,
    Sign,
    SignAlias,
    SignVideo,
    VerificationStatus,
    VideoValidationStatus,
)
from app.schemas.signs import (
    CategoryRef,
    CategoryWithCount,
    LanguageVariantRef,
    Page,
    SignDetail,
    SignSummary,
    SignVideoOut,
)
from app.services.text_normalization import (
    LETTER_EXCLUSIONS,
    normalize_search_key,
    search_key_sql,
)

_has_validated_video = (
    exists()
    .where(
        SignVideo.sign_id == Sign.id,
        SignVideo.validation_status == VideoValidationStatus.VALIDATED,
    )
    .correlate(Sign)
)


def visibility_filter(settings: Settings) -> ColumnElement[bool]:
    """Condition on Sign (joined with LanguageVariant) for public visibility."""
    public = and_(
        Sign.verification_status == VerificationStatus.VERIFIED,
        Sign.is_test_data.is_(False),
        LanguageVariant.is_test_data.is_(False),
        _has_validated_video,
    )
    if settings.dictionary_include_test_data and not settings.is_production:
        return or_(public, Sign.is_test_data.is_(True))
    return public


@dataclass(frozen=True)
class SignQuery:
    q: str | None = None
    category: str | None = None
    letter: str | None = None
    variant: str | None = None
    page: int = 1
    page_size: int = 24


def _search_condition(raw_query: str) -> ColumnElement[bool]:
    key = normalize_search_key(raw_query)
    alias_match = (
        exists()
        .where(
            SignAlias.sign_id == Sign.id, SignAlias.normalized_text.contains(key, autoescape=True)
        )
        .correlate(Sign)
    )
    return or_(
        search_key_sql(Sign.uzbek_label).contains(key, autoescape=True),
        func.lower(Sign.gloss).contains(key, autoescape=True),
        alias_match,
    )


def _letter_condition(letter: str) -> ColumnElement[bool]:
    label_key = search_key_sql(Sign.uzbek_label)
    condition: ColumnElement[bool] = label_key.startswith(letter, autoescape=True)
    for longer in LETTER_EXCLUSIONS.get(letter, ()):
        condition = and_(condition, not_(label_key.startswith(longer, autoescape=True)))
    return condition


def _video_url(settings: Settings, storage_key: str) -> str | None:
    if settings.media_public_base_url is None:
        return None
    base = str(settings.media_public_base_url).rstrip("/")
    return f"{base}/{quote(storage_key, safe='/')}"


def _summary(sign: Sign, has_video: bool) -> SignSummary:
    return SignSummary(
        id=sign.id,
        gloss=sign.gloss,
        uzbek_label=sign.uzbek_label,
        category=CategoryRef.model_validate(sign.category) if sign.category else None,
        language_variant=LanguageVariantRef.model_validate(sign.language_variant),
        is_dynamic=sign.is_dynamic,
        has_video=has_video,
        is_test_data=sign.is_test_data,
    )


async def list_signs(
    session: AsyncSession, settings: Settings, query: SignQuery
) -> Page[SignSummary]:
    conditions: list[ColumnElement[bool]] = [visibility_filter(settings)]
    if query.q and query.q.strip():
        conditions.append(_search_condition(query.q))
    if query.category:
        conditions.append(Category.slug == query.category)
    if query.letter:
        conditions.append(_letter_condition(query.letter))
    if query.variant:
        conditions.append(LanguageVariant.code == query.variant)

    base = select(Sign).join(Sign.language_variant).outerjoin(Sign.category).where(*conditions)

    total = (
        await session.execute(
            select(func.count()).select_from(base.with_only_columns(Sign.id).subquery())
        )
    ).scalar_one()

    rows = await session.execute(
        base.add_columns(_has_validated_video.label("has_video"))
        .options(contains_eager(Sign.language_variant), contains_eager(Sign.category))
        .order_by(search_key_sql(Sign.uzbek_label), Sign.gloss, Sign.id)
        .limit(query.page_size)
        .offset((query.page - 1) * query.page_size)
    )
    items = [_summary(sign, has_video) for sign, has_video in rows.all()]
    return Page[SignSummary](
        items=items,
        total=total,
        page=query.page,
        page_size=query.page_size,
        total_pages=math.ceil(total / query.page_size) if total else 0,
    )


async def get_sign(
    session: AsyncSession, settings: Settings, sign_id: uuid.UUID
) -> SignDetail | None:
    sign = (
        await session.execute(
            select(Sign)
            .join(Sign.language_variant)
            .outerjoin(Sign.category)
            .where(Sign.id == sign_id, visibility_filter(settings))
            .options(
                contains_eager(Sign.language_variant),
                contains_eager(Sign.category),
                selectinload(Sign.videos),
            )
        )
    ).scalar_one_or_none()
    if sign is None:
        return None

    videos = sorted(
        (v for v in sign.videos if v.validation_status == VideoValidationStatus.VALIDATED),
        key=lambda v: (not v.is_primary, v.created_at),
    )
    summary = _summary(sign, has_video=bool(videos))
    return SignDetail(
        **summary.model_dump(),
        description=sign.description,
        verification_status=sign.verification_status,
        updated_at=sign.updated_at,
        videos=[
            SignVideoOut(
                id=v.id,
                url=_video_url(settings, v.storage_key),
                duration_ms=v.duration_ms,
                video_format=v.video_format,
                width=v.width,
                height=v.height,
                is_primary=v.is_primary,
            )
            for v in videos
        ],
    )


async def list_categories(session: AsyncSession, settings: Settings) -> list[CategoryWithCount]:
    """Categories that contain at least one publicly visible sign."""
    count = func.count(Sign.id)
    rows = await session.execute(
        select(Category.name, Category.slug, count)
        .join(Sign, Sign.category_id == Category.id)
        .join(Sign.language_variant)
        .where(visibility_filter(settings))
        .group_by(Category.id)
        .having(count > 0)
        .order_by(Category.name)
    )
    return [CategoryWithCount(name=n, slug=s, sign_count=c) for n, s, c in rows.all()]
