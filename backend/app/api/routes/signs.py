from __future__ import annotations

import uuid
from typing import Annotated, Literal

from fastapi import APIRouter, Query, status

from app.api.deps import AppSettings, DbSession
from app.core.errors import AppError
from app.schemas.common import ErrorResponse
from app.schemas.signs import CategoryWithCount, Page, SignDetail, SignSummary
from app.services import dictionary
from app.services.text_normalization import UZBEK_ALPHABET

router = APIRouter(tags=["dictionary"])

UzbekLetter = Literal[UZBEK_ALPHABET]  # type: ignore[valid-type]


@router.get(
    "/signs",
    response_model=Page[SignSummary],
    summary="Search and browse the public sign dictionary",
    description=(
        "Only expert-verified signs with at least one validated video are listed. "
        "`q` matches the Uzbek label, gloss and registered word forms; apostrophe "
        "variants (', ‘, ’, ʻ, ʼ) are treated as equal. `letter` uses Uzbek alphabet "
        "letters including digraphs (o', g', sh, ch, ng)."
    ),
)
async def list_signs(
    db: DbSession,
    settings: AppSettings,
    q: Annotated[str | None, Query(max_length=100)] = None,
    category: Annotated[str | None, Query(max_length=120, pattern=r"^[a-z0-9-]+$")] = None,
    letter: UzbekLetter | None = None,
    variant: Annotated[str | None, Query(max_length=64)] = None,
    page: Annotated[int, Query(ge=1, le=10_000)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 24,
) -> Page[SignSummary]:
    return await dictionary.list_signs(
        db,
        settings,
        dictionary.SignQuery(
            q=q, category=category, letter=letter, variant=variant, page=page, page_size=page_size
        ),
    )


@router.get(
    "/signs/{sign_id}",
    response_model=SignDetail,
    responses={404: {"model": ErrorResponse, "description": "Sign not found or not public"}},
    summary="Public sign details with validated videos",
)
async def get_sign(sign_id: uuid.UUID, db: DbSession, settings: AppSettings) -> SignDetail:
    sign = await dictionary.get_sign(db, settings, sign_id)
    if sign is None:
        # Same response for missing and non-public signs: do not leak drafts.
        raise AppError("not_found", "Sign not found", status.HTTP_404_NOT_FOUND)
    return sign


@router.get(
    "/categories",
    response_model=list[CategoryWithCount],
    summary="Categories that contain public signs",
)
async def list_categories(db: DbSession, settings: AppSettings) -> list[CategoryWithCount]:
    return await dictionary.list_categories(db, settings)
