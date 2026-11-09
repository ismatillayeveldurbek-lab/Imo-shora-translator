"""Import all models so Alembic autogenerate sees the full metadata."""

from app.models.enums import (
    ModelStatus,
    ModelTask,
    TranslationDirection,
    UserRole,
    VerificationStatus,
    VideoValidationStatus,
)
from app.models.model_version import ModelVersion
from app.models.sign import Category, LanguageVariant, Sign, SignAlias, SignVideo
from app.models.translation import TranslationHistory
from app.models.user import User

__all__ = [
    "Category",
    "LanguageVariant",
    "ModelStatus",
    "ModelTask",
    "ModelVersion",
    "Sign",
    "SignAlias",
    "SignVideo",
    "TranslationDirection",
    "TranslationHistory",
    "User",
    "UserRole",
    "VerificationStatus",
    "VideoValidationStatus",
]
