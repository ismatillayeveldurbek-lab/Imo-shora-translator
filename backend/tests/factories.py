"""Test-only data builders. Everything here lives in the disposable test DB."""

from __future__ import annotations

import itertools

from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    Category,
    LanguageVariant,
    Sign,
    SignAlias,
    SignVideo,
    VerificationStatus,
    VideoValidationStatus,
)
from app.services.text_normalization import normalize_search_key

_counter = itertools.count()


async def make_variant(db: AsyncSession, *, is_test_data: bool = False) -> LanguageVariant:
    variant = LanguageVariant(
        code=f"variant-{next(_counter)}", name="Test variant", is_test_data=is_test_data
    )
    db.add(variant)
    await db.flush()
    return variant


async def make_category(db: AsyncSession, slug: str, name: str | None = None) -> Category:
    category = Category(slug=slug, name=name or slug)
    db.add(category)
    await db.flush()
    return category


async def make_sign(
    db: AsyncSession,
    variant: LanguageVariant,
    label: str,
    *,
    gloss: str | None = None,
    status: VerificationStatus = VerificationStatus.VERIFIED,
    video: VideoValidationStatus | None = VideoValidationStatus.VALIDATED,
    category: Category | None = None,
    is_test_data: bool = False,
    aliases: tuple[str, ...] = (),
) -> Sign:
    sign = Sign(
        gloss=gloss or f"G{next(_counter)}",
        uzbek_label=label,
        language_variant_id=variant.id,
        category_id=category.id if category else None,
        is_dynamic=True,
        verification_status=status,
        is_test_data=is_test_data,
    )
    db.add(sign)
    await db.flush()
    if video is not None:
        db.add(
            SignVideo(
                sign_id=sign.id,
                storage_key=f"signs/{sign.id}/main.mp4",
                duration_ms=1500,
                video_format="mp4",
                validation_status=video,
                is_primary=True,
            )
        )
    for alias in aliases:
        db.add(
            SignAlias(
                sign_id=sign.id,
                language_variant_id=variant.id,
                normalized_text=normalize_search_key(alias),
            )
        )
    await db.flush()
    return sign
