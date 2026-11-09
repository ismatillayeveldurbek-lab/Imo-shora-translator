"""Test fixtures. Tests run against a real PostgreSQL database.

Set TEST_DATABASE_URL to point at a disposable database (it is migrated to
head and its tables are truncated between tests).
"""

from __future__ import annotations

import os
import threading
from collections.abc import AsyncIterator
from pathlib import Path

import pytest
from alembic.config import Config
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from alembic import command
from app.core.config import Environment, Settings, get_settings
from app.main import create_app

TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL",
    "postgresql+asyncpg://uzsign:uzsign_dev_password@localhost:5432/uzsign_test",
)
BACKEND_DIR = Path(__file__).resolve().parents[1]


def _migrate() -> None:
    cfg = Config(str(BACKEND_DIR / "alembic.ini"))
    cfg.attributes["database_url"] = TEST_DATABASE_URL
    # env.py uses asyncio.run(); run in a thread so it never collides with a running loop.
    errors: list[BaseException] = []

    def target() -> None:
        try:
            command.upgrade(cfg, "head")
        except BaseException as exc:
            errors.append(exc)

    thread = threading.Thread(target=target)
    thread.start()
    thread.join()
    if errors:
        raise errors[0]


@pytest.fixture(scope="session", autouse=True)
def migrated_database() -> None:
    _migrate()


@pytest.fixture
def settings(tmp_path: Path) -> Settings:
    return Settings(
        environment=Environment.TEST,
        database_url=TEST_DATABASE_URL,
        model_artifacts_dir=tmp_path / "artifacts",
        max_request_body_bytes=4096,
        asr_provider=None,
    )


@pytest.fixture
async def app(settings: Settings) -> AsyncIterator[FastAPI]:
    application = create_app(settings)
    application.dependency_overrides[get_settings] = lambda: settings
    async with application.router.lifespan_context(application):
        yield application


@pytest.fixture
async def db(app: FastAPI) -> AsyncIterator[AsyncSession]:
    async with app.state.session_factory() as session:
        await session.execute(
            text(
                "TRUNCATE users, categories, language_variants, signs, sign_aliases, "
                "sign_videos, translation_history, model_versions RESTART IDENTITY CASCADE"
            )
        )
        await session.commit()
        yield session


@pytest.fixture
async def client(app: FastAPI, db: AsyncSession) -> AsyncIterator[AsyncClient]:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
