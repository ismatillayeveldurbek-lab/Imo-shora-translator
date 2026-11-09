from __future__ import annotations

from fastapi import APIRouter

from app.api.deps import AppSettings, DbSession
from app.schemas.system import ModelsStatusResponse
from app.services.model_status import (
    get_sign_recognition_status,
    get_speech_recognition_status,
)

router = APIRouter(prefix="/models", tags=["models"])


@router.get(
    "/status",
    response_model=ModelsStatusResponse,
    summary="Which AI capabilities are actually available",
)
async def models_status(db: DbSession, settings: AppSettings) -> ModelsStatusResponse:
    return ModelsStatusResponse(
        capabilities=[
            await get_sign_recognition_status(db, settings),
            get_speech_recognition_status(settings),
        ]
    )
