from __future__ import annotations

import uuid

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings, get_settings
from app.models import SignVideo, VerificationStatus, VideoValidationStatus
from tests.factories import make_category, make_sign, make_variant


def labels(body: dict[str, object]) -> list[str]:
    return [item["uzbek_label"] for item in body["items"]]  # type: ignore[attr-defined]


async def test_only_verified_signs_with_validated_video_are_public(
    client: AsyncClient, db: AsyncSession
) -> None:
    variant = await make_variant(db)
    test_variant = await make_variant(db, is_test_data=True)
    await make_sign(db, variant, "salom")
    await make_sign(db, variant, "draft", status=VerificationStatus.DRAFT)
    await make_sign(db, variant, "pending", status=VerificationStatus.PENDING_REVIEW)
    await make_sign(db, variant, "disabled", status=VerificationStatus.DISABLED)
    await make_sign(db, variant, "no video", video=None)
    await make_sign(db, variant, "pending video", video=VideoValidationStatus.PENDING)
    await make_sign(db, variant, "rejected video", video=VideoValidationStatus.REJECTED)
    await make_sign(db, variant, "fixture", is_test_data=True)
    await make_sign(db, test_variant, "test variant")
    await db.commit()

    body = (await client.get("/api/signs")).json()
    assert labels(body) == ["salom"]
    assert body["total"] == 1
    item = body["items"][0]
    assert item["has_video"] is True
    assert item["is_test_data"] is False
    assert item["language_variant"]["name"] == "Test variant"


async def test_dev_mode_lists_test_data_clearly_marked(
    app: FastAPI, settings: Settings, db: AsyncSession
) -> None:
    variant = await make_variant(db, is_test_data=True)
    await make_sign(
        db, variant, "fixture", status=VerificationStatus.DRAFT, video=None, is_test_data=True
    )
    await db.commit()

    dev = settings.model_copy(update={"dictionary_include_test_data": True})
    app.dependency_overrides[get_settings] = lambda: dev
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        body = (await client.get("/api/signs")).json()
    assert labels(body) == ["fixture"]
    assert body["items"][0]["is_test_data"] is True
    assert body["items"][0]["has_video"] is False


@pytest.mark.parametrize("query", ["o'zbek", "o‘zbek", "oʻzbek", "O’ZBEK", "zbek"])
async def test_search_ignores_apostrophe_variants(
    client: AsyncClient, db: AsyncSession, query: str
) -> None:
    variant = await make_variant(db)
    await make_sign(db, variant, "oʻzbek tili")
    await make_sign(db, variant, "rahmat")
    await db.commit()
    body = (await client.get("/api/signs", params={"q": query})).json()
    assert labels(body) == ["oʻzbek tili"]


async def test_search_matches_gloss_and_word_forms(client: AsyncClient, db: AsyncSession) -> None:
    variant = await make_variant(db)
    await make_sign(db, variant, "kitob", gloss="KITOB", aliases=("kitoblar", "kitobni"))
    await make_sign(db, variant, "daftar", gloss="DAFTAR")
    await db.commit()

    for query in ("KITOB", "kitoblar", "kitobni"):
        assert labels((await client.get("/api/signs", params={"q": query})).json()) == ["kitob"]


async def test_search_treats_sql_wildcards_literally(client: AsyncClient, db: AsyncSession) -> None:
    variant = await make_variant(db)
    await make_sign(db, variant, "salom")
    await db.commit()
    for query in ("%", "_", "s%m"):
        assert (await client.get("/api/signs", params={"q": query})).json()["total"] == 0


@pytest.mark.parametrize(
    ("letter", "expected"),
    [
        ("o", ["ota"]),
        ("o'", ["oʻrik"]),
        ("s", ["salom"]),
        ("sh", ["shahar"]),
        ("g", ["gul"]),
        ("g'", ["g‘isht"]),
    ],
)
async def test_letter_browsing_handles_uzbek_digraphs(
    client: AsyncClient, db: AsyncSession, letter: str, expected: list[str]
) -> None:
    variant = await make_variant(db)
    for label in ("ota", "oʻrik", "salom", "shahar", "gul", "g‘isht"):
        await make_sign(db, variant, label)
    await db.commit()
    body = (await client.get("/api/signs", params={"letter": letter})).json()
    assert labels(body) == expected


async def test_category_filter_and_category_counts(client: AsyncClient, db: AsyncSession) -> None:
    variant = await make_variant(db)
    greetings = await make_category(db, "salomlashish", "Salomlashish")
    family = await make_category(db, "oila", "Oila")
    empty = await make_category(db, "bosh", "Bo'sh")
    await make_sign(db, variant, "salom", category=greetings)
    await make_sign(db, variant, "rahmat", category=greetings)
    await make_sign(db, variant, "ona", category=family)
    await make_sign(db, variant, "ota", category=family, status=VerificationStatus.DRAFT)
    await make_sign(db, variant, "hidden", category=empty, video=None)
    await db.commit()

    body = (await client.get("/api/signs", params={"category": "salomlashish"})).json()
    assert labels(body) == ["rahmat", "salom"]

    categories = (await client.get("/api/categories")).json()
    assert categories == [
        {"name": "Oila", "slug": "oila", "sign_count": 1},
        {"name": "Salomlashish", "slug": "salomlashish", "sign_count": 2},
    ]


async def test_pagination(client: AsyncClient, db: AsyncSession) -> None:
    variant = await make_variant(db)
    for i in range(5):
        await make_sign(db, variant, f"so'z {i}")
    await db.commit()

    first = (await client.get("/api/signs", params={"page_size": 2})).json()
    last = (await client.get("/api/signs", params={"page_size": 2, "page": 3})).json()
    beyond = (await client.get("/api/signs", params={"page_size": 2, "page": 4})).json()
    assert (first["total"], first["total_pages"], len(first["items"])) == (5, 3, 2)
    assert len(last["items"]) == 1
    assert beyond["items"] == []


@pytest.mark.parametrize(
    "params",
    [{"page_size": 101}, {"page": 0}, {"letter": "w"}, {"category": "Bad Slug"}, {"q": "x" * 101}],
)
async def test_invalid_query_parameters(client: AsyncClient, params: dict[str, str | int]) -> None:
    response = await client.get("/api/signs", params=params)
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"


async def test_detail_returns_only_validated_videos_primary_first(
    app: FastAPI, settings: Settings, db: AsyncSession
) -> None:
    variant = await make_variant(db)
    sign = await make_sign(db, variant, "salom")
    db.add_all(
        [
            SignVideo(
                sign_id=sign.id,
                storage_key="signs/alt angle.webm",
                duration_ms=900,
                video_format="webm",
                validation_status=VideoValidationStatus.VALIDATED,
            ),
            SignVideo(
                sign_id=sign.id,
                storage_key="signs/bad.mp4",
                duration_ms=900,
                video_format="mp4",
                validation_status=VideoValidationStatus.REJECTED,
            ),
        ]
    )
    await db.commit()

    with_media = settings.model_copy(update={"media_public_base_url": "https://media.example/v/"})
    app.dependency_overrides[get_settings] = lambda: with_media
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        body = (await client.get(f"/api/signs/{sign.id}")).json()

    assert body["uzbek_label"] == "salom"
    assert body["verification_status"] == "verified"
    urls = [v["url"] for v in body["videos"]]
    assert urls == [
        f"https://media.example/v/signs/{sign.id}/main.mp4",
        "https://media.example/v/signs/alt%20angle.webm",
    ]
    assert body["videos"][0]["is_primary"] is True


async def test_detail_video_url_is_null_without_media_hosting(
    client: AsyncClient, db: AsyncSession
) -> None:
    sign = await make_sign(db, await make_variant(db), "salom")
    await db.commit()
    body = (await client.get(f"/api/signs/{sign.id}")).json()
    assert body["has_video"] is True
    assert body["videos"][0]["url"] is None


async def test_non_public_and_unknown_signs_are_404(client: AsyncClient, db: AsyncSession) -> None:
    draft = await make_sign(db, await make_variant(db), "draft", status=VerificationStatus.DRAFT)
    await db.commit()
    for sign_id in (draft.id, uuid.uuid4()):
        response = await client.get(f"/api/signs/{sign_id}")
        assert response.status_code == 404
        assert response.json()["error"]["code"] == "not_found"
    assert (await client.get("/api/signs/not-a-uuid")).status_code == 422
