from __future__ import annotations

from collections.abc import AsyncIterator

from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from pydantic import BaseModel


class _Payload(BaseModel):
    text: str


async def test_rejects_declared_oversized_body(client: AsyncClient) -> None:
    response = await client.post("/api/health", content=b"x" * 10_000)
    assert response.status_code == 413
    assert response.json()["error"]["code"] == "payload_too_large"


async def test_rejects_streamed_oversized_body(app: FastAPI) -> None:
    @app.post("/_test/echo")
    async def echo(payload: _Payload) -> dict[str, int]:
        return {"length": len(payload.text)}

    async def chunks() -> AsyncIterator[bytes]:
        yield b'{"text": "'
        for _ in range(10):
            yield b"a" * 1000
        yield b'"}'

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # A generator body is sent without Content-Length (chunked).
        response = await client.post(
            "/_test/echo", content=chunks(), headers={"content-type": "application/json"}
        )
        assert response.status_code == 413
        assert response.json()["error"]["code"] == "payload_too_large"

        small = await client.post("/_test/echo", json={"text": "salom"})
        assert small.status_code == 200
        assert small.json() == {"length": 5}


async def test_validation_errors_are_structured(app: FastAPI) -> None:
    @app.post("/_test/validate")
    async def validate(payload: _Payload) -> dict[str, str]:
        return {"text": payload.text}

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/_test/validate", json={"wrong": 1})
    assert response.status_code == 422
    error = response.json()["error"]
    assert error["code"] == "validation_error"
    assert error["details"][0]["loc"] == ["body", "text"]
