from __future__ import annotations

from typing import Any

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings, get_settings
from app.models import LanguageVariant, VerificationStatus
from tests.factories import make_sign, make_variant

URL = "/api/translate/text-to-sign"


async def translate(client: AsyncClient, text: str, **extra: Any) -> dict[str, Any]:
    response = await client.post(URL, json={"text": text, **extra})
    assert response.status_code == 200, response.text
    body: dict[str, Any] = response.json()
    return body


def shape(body: dict[str, Any]) -> list[tuple[str, str]]:
    """(type, text) per segment, with the sign label for matches."""
    return [
        (s["type"], s["sign"]["uzbek_label"] if s["sign"] else s["text"]) for s in body["segments"]
    ]


@pytest.fixture
async def variant(db: AsyncSession) -> LanguageVariant:
    return await make_variant(db)


async def test_maps_words_and_reports_unmatched(
    client: AsyncClient, db: AsyncSession, variant: LanguageVariant
) -> None:
    await make_sign(db, variant, "salom")
    await make_sign(db, variant, "do‘st", aliases=("do'stim", "do'stlar"))
    await db.commit()

    body = await translate(client, "Salom, do‘stim! Qalaysan?")
    assert body["method"] == "dictionary_lookup"
    assert shape(body) == [("sign", "salom"), ("sign", "do‘st"), ("unmatched", "Qalaysan")]
    assert (body["matched_count"], body["unmatched_count"]) == (2, 1)
    assert body["unmatched_words"] == ["qalaysan"]
    # The segment quotes the user's exact input, not the normalized form.
    assert body["segments"][1]["text"] == "do‘stim"
    assert body["language_variant"]["code"] == variant.code


async def test_longest_phrase_wins(
    client: AsyncClient, db: AsyncSession, variant: LanguageVariant
) -> None:
    await make_sign(db, variant, "katta")
    await make_sign(db, variant, "rahmat")
    await make_sign(db, variant, "katta rahmat")
    await db.commit()

    body = await translate(client, "Katta rahmat, katta uy")
    assert shape(body) == [("sign", "katta rahmat"), ("sign", "katta"), ("unmatched", "uy")]
    assert body["segments"][0]["text"] == "Katta rahmat"


async def test_alias_takes_precedence_over_another_signs_label(
    client: AsyncClient, db: AsyncSession, variant: LanguageVariant
) -> None:
    await make_sign(db, variant, "ona", gloss="ONA-LABEL")
    await make_sign(db, variant, "onajon", gloss="ONA-ALIAS", aliases=("ona",))
    await db.commit()
    body = await translate(client, "ona")
    assert body["segments"][0]["sign"]["gloss"] == "ONA-ALIAS"


async def test_only_public_signs_are_used(
    client: AsyncClient, db: AsyncSession, variant: LanguageVariant
) -> None:
    await make_sign(db, variant, "salom")
    await make_sign(db, variant, "draft", status=VerificationStatus.DRAFT)
    await make_sign(db, variant, "novideo", video=None)
    await make_sign(db, variant, "fixture", is_test_data=True)
    await db.commit()
    body = await translate(client, "salom draft novideo fixture")
    assert [s["type"] for s in body["segments"]] == ["sign", "unmatched", "unmatched", "unmatched"]


async def test_includes_playable_video_when_hosting_configured(
    app: FastAPI, settings: Settings, db: AsyncSession, variant: LanguageVariant
) -> None:
    sign = await make_sign(db, variant, "salom")
    await db.commit()
    hosted = settings.model_copy(update={"media_public_base_url": "https://cdn.example"})
    app.dependency_overrides[get_settings] = lambda: hosted
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        body = await translate(client, "salom")
    assert body["segments"][0]["sign"]["video"] == {
        "url": f"https://cdn.example/signs/{sign.id}/main.mp4",
        "duration_ms": 1500,
        "video_format": "mp4",
    }


async def test_empty_dictionary_returns_all_unmatched(client: AsyncClient) -> None:
    body = await translate(client, "salom dunyo")
    assert body["language_variant"] is None
    assert body["unmatched_words"] == ["salom", "dunyo"]


async def test_several_variants_require_an_explicit_choice(
    client: AsyncClient, db: AsyncSession
) -> None:
    first, second = await make_variant(db), await make_variant(db)
    await make_sign(db, first, "salom")
    await make_sign(db, second, "salom")
    await db.commit()

    response = await client.post(URL, json={"text": "salom"})
    assert response.status_code == 422
    error = response.json()["error"]
    assert error["code"] == "variant_required"
    assert sorted(error["details"]["available"]) == sorted([first.code, second.code])

    body = await translate(client, "salom", variant=second.code)
    assert body["language_variant"]["code"] == second.code
    assert body["matched_count"] == 1


async def test_unknown_variant(client: AsyncClient) -> None:
    response = await client.post(URL, json={"text": "salom", "variant": "nope"})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "unknown_variant"


async def test_misconfigured_default_variant_is_503(
    app: FastAPI, settings: Settings, db: AsyncSession
) -> None:
    broken = settings.model_copy(update={"default_language_variant": "missing"})
    app.dependency_overrides[get_settings] = lambda: broken
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(URL, json={"text": "salom"})
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "variant_misconfigured"


@pytest.mark.parametrize("text", ["", "   ", "x" * 501])
async def test_rejects_invalid_text(client: AsyncClient, text: str) -> None:
    response = await client.post(URL, json={"text": text})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"


async def test_punctuation_only_text_has_no_segments(client: AsyncClient) -> None:
    body = await translate(client, "?!...")
    assert body["segments"] == []
