"""Errors must be structured AND carry CORS headers, or browsers hide them."""

from __future__ import annotations

from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from sqlalchemy.exc import OperationalError

from app.core.config import Settings, get_settings
from app.main import create_app

ORIGIN = "http://localhost:3000"


async def test_unexpected_error_is_structured_500_with_cors(app: FastAPI) -> None:
    @app.get("/_test/boom")
    async def boom() -> None:
        raise RuntimeError("secret internal detail")

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/_test/boom", headers={"Origin": ORIGIN})
    assert response.status_code == 500
    assert response.json()["error"]["code"] == "internal_error"
    assert "secret" not in response.text
    assert response.headers["access-control-allow-origin"] == ORIGIN


async def test_database_errors_become_503(app: FastAPI) -> None:
    @app.get("/_test/db-down")
    async def db_down() -> None:
        raise OperationalError("SELECT 1", {}, ConnectionRefusedError())

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/_test/db-down", headers={"Origin": ORIGIN})
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "database_unavailable"
    assert response.headers["access-control-allow-origin"] == ORIGIN


async def test_models_status_with_unreachable_database_is_503(settings: Settings) -> None:
    broken = settings.model_copy(
        update={"database_url": "postgresql+asyncpg://nobody:x@127.0.0.1:1/none"}
    )
    app = create_app(broken)
    app.dependency_overrides[get_settings] = lambda: broken
    async with (
        app.router.lifespan_context(app),
        AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client,
    ):
        response = await client.get("/api/models/status", headers={"Origin": ORIGIN})
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "database_unavailable"
    assert response.headers["access-control-allow-origin"] == ORIGIN
