from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import Index, String, Text, UniqueConstraint, Uuid, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin
from app.models._types import str_enum
from app.models.enums import ModelStatus, ModelTask


class ModelVersion(TimestampMixin, Base):
    """Registry of trained model artifacts.

    ``evaluation_metadata`` must contain metrics produced by the evaluation
    pipeline on a held-out test split — never hand-entered numbers.
    """

    __tablename__ = "model_versions"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    model_name: Mapped[str] = mapped_column(String(120), nullable=False)
    model_version: Mapped[str] = mapped_column(String(64), nullable=False)
    task: Mapped[ModelTask] = mapped_column(str_enum(ModelTask, "model_task"), nullable=False)
    # Relative path inside MODEL_ARTIFACTS_DIR or an s3:// URI.
    artifact_uri: Mapped[str] = mapped_column(String(512), nullable=False)
    # List of {"class_index": int, "sign_id": uuid, "gloss": str}.
    supported_classes: Mapped[list[dict[str, Any]]] = mapped_column(JSONB, nullable=False)
    evaluation_metadata: Mapped[dict[str, Any]] = mapped_column(
        JSONB, nullable=False, server_default=text("'{}'::jsonb")
    )
    status: Mapped[ModelStatus] = mapped_column(
        str_enum(ModelStatus, "model_status"), nullable=False, default=ModelStatus.REGISTERED
    )
    notes: Mapped[str | None] = mapped_column(Text)

    __table_args__ = (
        UniqueConstraint("model_name", "model_version"),
        # At most one active model per task.
        Index(
            "uq_model_versions_active_task",
            "task",
            unique=True,
            postgresql_where=text("status = 'active'"),
        ),
    )
