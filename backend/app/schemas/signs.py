from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import VerificationStatus


class CategoryRef(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    slug: str


class LanguageVariantRef(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    code: str
    name: str


class SignSummary(BaseModel):
    id: uuid.UUID
    gloss: str
    uzbek_label: str
    category: CategoryRef | None
    language_variant: LanguageVariantRef
    is_dynamic: bool
    has_video: bool = Field(description="At least one validated video exists")
    is_test_data: bool = Field(description="Development fixture — never a real sign")


class SignVideoOut(BaseModel):
    id: uuid.UUID
    url: str | None = Field(description="Null when media hosting is not configured")
    duration_ms: int
    video_format: str
    width: int | None
    height: int | None
    is_primary: bool


class SignDetail(SignSummary):
    description: str | None
    verification_status: VerificationStatus
    videos: list[SignVideoOut]
    updated_at: datetime


class Page[T](BaseModel):
    items: list[T]
    total: int = Field(ge=0)
    page: int = Field(ge=1)
    page_size: int = Field(ge=1)
    total_pages: int = Field(ge=0)


class CategoryWithCount(CategoryRef):
    sign_count: int = Field(ge=0)
