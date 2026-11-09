"""Application settings loaded from environment variables.

All secrets come from the environment; nothing sensitive is hardcoded.
Production-only safety checks run at startup so a misconfigured
deployment fails fast instead of running insecurely.
"""

from __future__ import annotations

from enum import StrEnum
from functools import lru_cache
from pathlib import Path
from typing import Annotated

from pydantic import (
    AnyHttpUrl,
    Field,
    PostgresDsn,
    SecretStr,
    field_validator,
    model_validator,
)
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

_INSECURE_SECRET_MARKERS = ("change-me", "changeme", "dev-only")


class Environment(StrEnum):
    DEVELOPMENT = "development"
    TEST = "test"
    PRODUCTION = "production"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        # Repo-root .env first, then backend/.env (later files take precedence).
        env_file=("../.env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_name: str = "UzSign AI"
    app_version: str = "0.1.0"
    environment: Environment = Environment.DEVELOPMENT
    log_level: str = "INFO"

    database_url: PostgresDsn = Field(
        default=PostgresDsn(
            "postgresql+asyncpg://uzsign:uzsign_dev_password@localhost:5432/uzsign"
        ),
    )
    database_pool_size: int = Field(default=5, ge=1, le=50)
    database_max_overflow: int = Field(default=10, ge=0, le=100)
    database_echo: bool = False

    # Comma-separated in the environment, e.g. "http://localhost:3000,https://uzsign.uz"
    cors_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: ["http://localhost:3000"]
    )

    # Used for signing auth tokens (admin auth arrives in Phase 8).
    secret_key: SecretStr = SecretStr("dev-only-change-me-not-for-production")

    # Hard upper bound for any request body (bytes). Upload endpoints
    # may declare their own, stricter limits.
    max_request_body_bytes: int = Field(default=1_048_576, ge=1024)

    # Directory that holds versioned, trained model artifacts.
    model_artifacts_dir: Path = Path("../ml/checkpoints")

    # Base URL that sign video storage keys are appended to (e.g. a CDN or an
    # S3 bucket website endpoint). Unset = videos are not playable yet.
    media_public_base_url: AnyHttpUrl | None = None

    # DEVELOPMENT ONLY: also list rows flagged is_test_data in the public
    # dictionary (marked as test data in responses). Forbidden in production.
    dictionary_include_test_data: bool = False

    # Speech recognition is disabled until a validated Uzbek ASR backend is configured.
    asr_provider: str | None = None

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @field_validator("database_url")
    @classmethod
    def _require_async_driver(cls, value: PostgresDsn) -> PostgresDsn:
        if value.scheme != "postgresql+asyncpg":
            raise ValueError("DATABASE_URL must use the 'postgresql+asyncpg' scheme")
        return value

    @field_validator("asr_provider", "media_public_base_url", mode="before")
    @classmethod
    def _empty_to_none(cls, value: object) -> object:
        if isinstance(value, str) and not value.strip():
            return None
        return value

    @model_validator(mode="after")
    def _production_safety(self) -> Settings:
        if self.environment is Environment.PRODUCTION:
            secret = self.secret_key.get_secret_value()
            if len(secret) < 32 or any(m in secret.lower() for m in _INSECURE_SECRET_MARKERS):
                raise ValueError(
                    "SECRET_KEY must be a strong random value (>=32 chars) in production"
                )
            if "*" in self.cors_origins:
                raise ValueError("Wildcard CORS origin is not allowed in production")
            if self.dictionary_include_test_data:
                raise ValueError("DICTIONARY_INCLUDE_TEST_DATA must be disabled in production")
            if self.database_echo:
                raise ValueError("DATABASE_ECHO must be disabled in production")
        return self

    @property
    def is_production(self) -> bool:
        return self.environment is Environment.PRODUCTION

    @property
    def database_url_str(self) -> str:
        return str(self.database_url)


@lru_cache
def get_settings() -> Settings:
    return Settings()
