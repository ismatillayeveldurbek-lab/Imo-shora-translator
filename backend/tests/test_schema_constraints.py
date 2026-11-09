"""Database-level integrity rules that must hold regardless of API code."""

from __future__ import annotations

import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import LanguageVariant, Sign, SignAlias, SignVideo, User


async def _variant(db: AsyncSession, code: str) -> LanguageVariant:
    variant = LanguageVariant(code=code, name=code, is_test_data=True)
    db.add(variant)
    await db.flush()
    return variant


async def _sign(db: AsyncSession, variant: LanguageVariant, gloss: str = "TEST_A") -> Sign:
    sign = Sign(
        gloss=gloss,
        uzbek_label="a",
        language_variant_id=variant.id,
        is_dynamic=False,
        is_test_data=True,
    )
    db.add(sign)
    await db.flush()
    return sign


async def test_alias_variant_must_match_sign_variant(db: AsyncSession) -> None:
    v1, v2 = await _variant(db, "test-v1"), await _variant(db, "test-v2")
    sign = await _sign(db, v1)
    db.add(SignAlias(sign_id=sign.id, language_variant_id=v2.id, normalized_text="a"))
    with pytest.raises(IntegrityError):
        await db.flush()
    await db.rollback()


async def test_only_one_primary_video_per_sign(db: AsyncSession) -> None:
    sign = await _sign(db, await _variant(db, "test-v"))
    for key in ("a.mp4", "b.mp4"):
        db.add(
            SignVideo(
                sign_id=sign.id,
                storage_key=key,
                duration_ms=1000,
                video_format="mp4",
                is_primary=True,
            )
        )
    with pytest.raises(IntegrityError):
        await db.flush()
    await db.rollback()


async def test_video_format_is_restricted(db: AsyncSession) -> None:
    sign = await _sign(db, await _variant(db, "test-v"))
    db.add(SignVideo(sign_id=sign.id, storage_key="a.exe", duration_ms=10, video_format="exe"))
    with pytest.raises(IntegrityError):
        await db.flush()
    await db.rollback()


async def test_email_must_be_lowercase(db: AsyncSession) -> None:
    db.add(User(email="Admin@Example.com"))
    with pytest.raises(IntegrityError):
        await db.flush()
    await db.rollback()


async def test_gloss_unique_within_variant(db: AsyncSession) -> None:
    variant = await _variant(db, "test-v")
    await _sign(db, variant, "TEST_SAME")
    with pytest.raises(IntegrityError):
        await _sign(db, variant, "TEST_SAME")
    await db.rollback()
