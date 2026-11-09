"""FastAPI application factory."""

from __future__ import annotations

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import Settings, get_settings
from app.core.errors import register_exception_handlers
from app.core.logging import configure_logging
from app.core.middleware import RequestSizeLimitMiddleware, UnhandledErrorMiddleware
from app.db.session import build_engine, build_session_factory

logger = logging.getLogger("uzsign")


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    configure_logging(settings.log_level)

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        engine = build_engine(settings)
        app.state.engine = engine
        app.state.session_factory = build_session_factory(engine)
        logger.info(
            "Starting %s %s (%s)",
            settings.app_name,
            settings.app_version,
            settings.environment.value,
        )
        try:
            yield
        finally:
            await engine.dispose()

    app = FastAPI(
        title=f"{settings.app_name} API",
        version=settings.app_version,
        description=(
            "Backend for UzSign AI. Dictionary-based Uzbek text → sign lookup, "
            "sign recognition and speech transcription. Capabilities that depend on "
            "trained models report their real availability via /api/models/status."
        ),
        lifespan=lifespan,
        # Interactive docs are disabled in production to reduce attack surface.
        docs_url=None if settings.is_production else "/docs",
        redoc_url=None if settings.is_production else "/redoc",
        openapi_url=None if settings.is_production else "/openapi.json",
    )

    # Middleware added first runs innermost. Order (outer → inner):
    # CORS → request size limit → unhandled error → routes.
    app.add_middleware(UnhandledErrorMiddleware)
    app.add_middleware(RequestSizeLimitMiddleware, max_bytes=settings.max_request_body_bytes)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
    )
    register_exception_handlers(app)
    app.include_router(api_router)
    return app


app = create_app()
