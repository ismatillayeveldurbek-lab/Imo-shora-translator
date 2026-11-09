from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, ForeignKey, Index, Text, Uuid
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, CreatedAtMixin
from app.models._types import str_enum
from app.models.enums import TranslationDirection


class TranslationHistory(CreatedAtMixin, Base):
    """Opt-in history. Rows are written only for users with ``history_opt_in``
    and are purged after ``expires_at`` by a retention job. No raw audio or
    video is ever stored here — only text and sign IDs.
    """

    __tablename__ = "translation_history"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    translation_direction: Mapped[TranslationDirection] = mapped_column(
        str_enum(TranslationDirection, "translation_direction"), nullable=False
    )
    input_text: Mapped[str | None] = mapped_column(Text)
    output_data: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        Index("ix_translation_history_user_created", "user_id", "created_at"),
        Index("ix_translation_history_expires_at", "expires_at"),
    )
