from __future__ import annotations

import uuid

from sqlalchemy import Boolean, CheckConstraint, String, Uuid, text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin
from app.models._types import str_enum
from app.models.enums import UserRole


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    # Stored lower-cased; uniqueness is enforced on the normalized value.
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False)
    # Nullable so external identity providers can be added without a password.
    password_hash: Mapped[str | None] = mapped_column(String(255))
    auth_provider_id: Mapped[str | None] = mapped_column(String(255), unique=True)
    role: Mapped[UserRole] = mapped_column(
        str_enum(UserRole, "user_role"), nullable=False, default=UserRole.USER
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default=text("true")
    )
    # Opt-in: translation history is stored only when the user enables it.
    history_opt_in: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=text("false")
    )

    __table_args__ = (CheckConstraint("email = lower(email)", name="email_lowercase"),)
