from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.core.config import Environment, Settings

STRONG_SECRET = "k" * 48


def test_production_rejects_default_secret() -> None:
    with pytest.raises(ValidationError, match="SECRET_KEY"):
        Settings(environment=Environment.PRODUCTION)


def test_production_rejects_wildcard_cors() -> None:
    with pytest.raises(ValidationError, match="CORS"):
        Settings(
            environment=Environment.PRODUCTION,
            secret_key=STRONG_SECRET,
            cors_origins=["*"],
        )


def test_production_accepts_safe_configuration() -> None:
    settings = Settings(
        environment=Environment.PRODUCTION,
        secret_key=STRONG_SECRET,
        cors_origins=["https://uzsign.example"],
    )
    assert settings.is_production


def test_cors_origins_parsed_from_comma_separated_env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("CORS_ORIGINS", "http://a.test, http://b.test")
    assert Settings().cors_origins == ["http://a.test", "http://b.test"]


def test_requires_async_postgres_driver() -> None:
    with pytest.raises(ValidationError, match="asyncpg"):
        Settings(database_url="postgresql://u:p@localhost/db")


def test_blank_asr_provider_means_not_configured() -> None:
    assert Settings(asr_provider="  ").asr_provider is None
