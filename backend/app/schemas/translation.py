from __future__ import annotations

import uuid
from typing import Annotated, Literal

from pydantic import BaseModel, Field, StringConstraints

from app.schemas.signs import LanguageVariantRef

MAX_TEXT_LENGTH = 500

TranslationMethod = Literal["dictionary_lookup"]


class TextToSignRequest(BaseModel):
    text: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=1, max_length=MAX_TEXT_LENGTH)
    ]
    variant: Annotated[str | None, Field(max_length=64)] = Field(
        default=None, description="Language variant code; optional when only one exists"
    )


class TranslatedVideo(BaseModel):
    url: str | None = Field(description="Null when media hosting is not configured")
    duration_ms: int
    video_format: str


class TranslatedSign(BaseModel):
    id: uuid.UUID
    gloss: str
    uzbek_label: str
    is_test_data: bool
    video: TranslatedVideo | None


class Segment(BaseModel):
    type: Literal["sign", "unmatched"]
    text: str = Field(description="Exact span of the user's input")
    normalized: str
    start: int = Field(ge=0)
    end: int = Field(ge=0)
    sign: TranslatedSign | None = None


class TextToSignResponse(BaseModel):
    method: TranslationMethod = Field(
        description=(
            "dictionary_lookup: each word/phrase is mapped to a verified sign. Sign language "
            "grammar (word order, facial grammar, spatial reference) is NOT applied."
        )
    )
    input_text: str
    language_variant: LanguageVariantRef | None
    segments: list[Segment]
    matched_count: int = Field(ge=0)
    unmatched_count: int = Field(ge=0)
    unmatched_words: list[str] = Field(description="Distinct normalized words without a sign")
