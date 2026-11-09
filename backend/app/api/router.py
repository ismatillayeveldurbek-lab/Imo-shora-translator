from __future__ import annotations

from fastapi import APIRouter

from app.api.routes import health, models_status
from app.schemas.common import ErrorResponse

api_router = APIRouter(
    prefix="/api",
    responses={
        422: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "Internal error"},
    },
)
api_router.include_router(health.router)
api_router.include_router(models_status.router)
