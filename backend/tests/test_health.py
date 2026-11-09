from __future__ import annotations

from httpx import ASGITransport, AsyncClient

from app.core.config import Settings, get_settings
from app.main import create_app


async def test_health_ok(client: AsyncClient) -> None:
    response = await client.get("/api/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["database"] == "ok"
    assert body["environment"] == "test"


async def test_health_reports_unavailable_database(settings: Settings) -> None:
    broken = settings.model_copy(
        update={"database_url": "postgresql+asyncpg://nobody:x@127.0.0.1:1/none"}
    )
    app = create_app(broken)
    app.dependency_overrides[get_settings] = lambda: broken
    async with (
        app.router.lifespan_context(app),
        AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client,
    ):
        response = await client.get("/api/health")
    assert response.status_code == 503
    assert response.json()["status"] == "degraded"
    assert response.json()["database"] == "unavailable"


async def test_unknown_route_returns_structured_error(client: AsyncClient) -> None:
    response = await client.get("/api/does-not-exist")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "not_found"
