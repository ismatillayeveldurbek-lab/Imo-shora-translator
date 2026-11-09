from __future__ import annotations

from fastapi import status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings
from app.core.errors import AppError
from app.models import LanguageVariant, Sign
from app.services.dictionary import visibility_filter


async def resolve_variant(
    session: AsyncSession, settings: Settings, requested: str | None
) -> LanguageVariant | None:
    """Pick the language variant a translation runs against.

    Order: explicit request → DEFAULT_LANGUAGE_VARIANT → the only variant that
    has public signs. With several candidates the caller must choose: we never
    guess between sign language varieties. ``None`` means the public
    dictionary is empty.
    """
    code = requested or settings.default_language_variant
    if code is not None:
        variant = (
            await session.execute(select(LanguageVariant).where(LanguageVariant.code == code))
        ).scalar_one_or_none()
        hidden_test_variant = (
            variant is not None
            and variant.is_test_data
            and not (settings.dictionary_include_test_data and not settings.is_production)
        )
        if variant is None or hidden_test_variant:
            if requested:
                raise AppError(
                    "unknown_variant",
                    f"Unknown language variant '{requested}'",
                    status.HTTP_422_UNPROCESSABLE_CONTENT,
                )
            raise AppError(
                "variant_misconfigured",
                "DEFAULT_LANGUAGE_VARIANT does not match any language variant",
                status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return variant

    candidates = (
        (
            await session.execute(
                select(LanguageVariant)
                .join(Sign, Sign.language_variant_id == LanguageVariant.id)
                .where(visibility_filter(settings))
                .distinct()
                .order_by(LanguageVariant.code)
            )
        )
        .scalars()
        .all()
    )
    if len(candidates) > 1:
        raise AppError(
            "variant_required",
            "Several language variants are available; specify one",
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            details={"available": [v.code for v in candidates]},
        )
    return candidates[0] if candidates else None
