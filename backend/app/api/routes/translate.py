from __future__ import annotations

from fastapi import APIRouter

from app.api.deps import AppSettings, DbSession
from app.schemas.common import ErrorResponse
from app.schemas.translation import TextToSignRequest, TextToSignResponse
from app.services.translation import DictionaryTranslator, TextToSignTranslator
from app.services.translation.variants import resolve_variant

router = APIRouter(prefix="/translate", tags=["translation"])


@router.post(
    "/text-to-sign",
    response_model=TextToSignResponse,
    responses={
        422: {"model": ErrorResponse, "description": "Invalid text, or variant missing/unknown"},
    },
    summary="Translate Uzbek text into a sequence of verified signs (dictionary lookup)",
    description=(
        "MVP translation by word/phrase lookup in the verified dictionary. It does NOT "
        "produce grammatical sign language sentences. Words without a verified sign are "
        "returned as `unmatched` segments. Input text is not stored."
    ),
)
async def text_to_sign(
    body: TextToSignRequest, db: DbSession, settings: AppSettings
) -> TextToSignResponse:
    variant = await resolve_variant(db, settings, body.variant)
    translator: TextToSignTranslator = DictionaryTranslator(db, settings)
    return await translator.translate(body.text, variant)
