"""Domain enumerations.

Stored as VARCHAR with CHECK constraints (not native PG enums) so new values
can be added with a simple migration.
"""

from __future__ import annotations

from enum import StrEnum


class UserRole(StrEnum):
    USER = "user"
    EDITOR = "editor"  # may create/edit dictionary drafts
    ADMIN = "admin"  # full management incl. verification and users


class VerificationStatus(StrEnum):
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    VERIFIED = "verified"  # validated by a qualified sign language expert
    REJECTED = "rejected"
    DISABLED = "disabled"  # previously published, withdrawn (e.g. found incorrect)


class VideoValidationStatus(StrEnum):
    PENDING = "pending"
    VALIDATED = "validated"
    REJECTED = "rejected"


class TranslationDirection(StrEnum):
    TEXT_TO_SIGN = "text_to_sign"
    SPEECH_TO_SIGN = "speech_to_sign"
    SIGN_TO_TEXT = "sign_to_text"


class ModelTask(StrEnum):
    STATIC_HAND_CLASSIFIER = "static_hand_classifier"  # Phase 1 of ML
    ISOLATED_SIGN_CLASSIFIER = "isolated_sign_classifier"  # LSTM/GRU
    CONTINUOUS_SIGN_RECOGNIZER = "continuous_sign_recognizer"
    SPEECH_RECOGNIZER = "speech_recognizer"


class ModelStatus(StrEnum):
    REGISTERED = "registered"  # artifact uploaded, not serving
    ACTIVE = "active"  # serving predictions (max one per task)
    DEPRECATED = "deprecated"
