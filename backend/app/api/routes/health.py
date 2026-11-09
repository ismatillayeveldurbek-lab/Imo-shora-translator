from __future__ import annotations

import logging

from fastapi import APIRouter, Response, status
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.api.deps import AppSettings, DbSession
from app.schemas.system import HealthResponse

router = APIRouter(tags=["system"])
logger = logging.getLogger("uzsign.health")


@router.get(
    "/health",
    response_model=HealthResponse,
    responses={503: {"model": HealthResponse, "description": "A dependency is unavailable"}},
    summary="Service health including database connectivity",
)
async def health(db: DbSession, settings: AppSettings, response: Response) -> HealthResponse:
    database: str = "ok"
    try:
        await db.execute(text("SELECT 1"))
    except (SQLAlchemyError, OSError):
        logger.warning("Database health check failed", exc_info=True)
        database = "unavailable"

    healthy = database == "ok"
    if not healthy:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return HealthResponse(
        status="ok" if healthy else "degraded",
        version=settings.app_version,
        environment=settings.environment.value,
        database="ok" if healthy else "unavailable",
    )
