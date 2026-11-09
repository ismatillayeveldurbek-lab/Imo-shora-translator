"""ASGI middleware."""

from __future__ import annotations

import json

from starlette.exceptions import HTTPException
from starlette.types import ASGIApp, Message, Receive, Scope, Send

from app.core.errors import error_body


class _BodyTooLarge(HTTPException):
    """Raised while streaming a body that exceeds the limit.

    Subclassing HTTPException lets the framework's exception handling turn it
    into a structured 413 response even when raised deep inside body parsing.
    """

    def __init__(self, max_bytes: int) -> None:
        super().__init__(status_code=413, detail=f"Request body exceeds {max_bytes} bytes")


class RequestSizeLimitMiddleware:
    """Rejects request bodies larger than ``max_bytes``.

    Checks ``Content-Length`` up front and also counts streamed (chunked)
    bytes, so a client cannot bypass the limit by omitting the header.
    """

    def __init__(self, app: ASGIApp, max_bytes: int) -> None:
        self.app = app
        self.max_bytes = max_bytes

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        for name, value in scope.get("headers", []):
            if name == b"content-length":
                try:
                    declared = int(value)
                except ValueError:
                    declared = -1
                if declared < 0 or declared > self.max_bytes:
                    await self._reject(send)
                    return

        received = 0
        response_started = False

        async def limited_receive() -> Message:
            nonlocal received
            message = await receive()
            if message["type"] == "http.request":
                received += len(message.get("body", b""))
                if received > self.max_bytes:
                    raise _BodyTooLarge(self.max_bytes)
            return message

        async def tracking_send(message: Message) -> None:
            nonlocal response_started
            if message["type"] == "http.response.start":
                response_started = True
            await send(message)

        try:
            await self.app(scope, limited_receive, tracking_send)
        except _BodyTooLarge:
            if not response_started:
                await self._reject(send)

    async def _reject(self, send: Send) -> None:
        body = json.dumps(
            error_body("payload_too_large", f"Request body exceeds {self.max_bytes} bytes")
        ).encode()
        await send(
            {
                "type": "http.response.start",
                "status": 413,
                "headers": [
                    (b"content-type", b"application/json"),
                    (b"content-length", str(len(body)).encode()),
                ],
            }
        )
        await send({"type": "http.response.body", "body": body})
