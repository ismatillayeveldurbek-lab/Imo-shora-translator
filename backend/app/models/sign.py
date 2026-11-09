from __future__ import annotations

import uuid

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    ForeignKey,
    ForeignKeyConstraint,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    Uuid,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, CreatedAtMixin, TimestampMixin
from app.models._types import str_enum
from app.models.enums import VerificationStatus, VideoValidationStatus


class LanguageVariant(TimestampMixin, Base):
    """A specific, community-defined sign language variety.

    Signs are always scoped to a variant: the same Uzbek word may have
    different signs in different varieties.
    """

    __tablename__ = "language_variants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    # Fixture variants exist only for development and are never shown publicly.
    is_test_data: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=text("false")
    )


class Category(TimestampMixin, Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)

    __table_args__ = (CheckConstraint("slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'", name="slug_format"),)


class Sign(TimestampMixin, Base):
    __tablename__ = "signs"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    # Gloss: conventional upper-case label for the sign, e.g. "SALOM".
    gloss: Mapped[str] = mapped_column(String(120), nullable=False)
    uzbek_label: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    category_id: Mapped[int | None] = mapped_column(
        ForeignKey("categories.id", ondelete="SET NULL"), index=True
    )
    language_variant_id: Mapped[int] = mapped_column(
        ForeignKey("language_variants.id", ondelete="RESTRICT"), nullable=False
    )
    is_dynamic: Mapped[bool] = mapped_column(Boolean, nullable=False)
    verification_status: Mapped[VerificationStatus] = mapped_column(
        str_enum(VerificationStatus, "verification_status"),
        nullable=False,
        default=VerificationStatus.DRAFT,
    )
    is_test_data: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=text("false")
    )

    category: Mapped[Category | None] = relationship(lazy="raise")
    language_variant: Mapped[LanguageVariant] = relationship(lazy="raise")
    videos: Mapped[list[SignVideo]] = relationship(
        back_populates="sign", cascade="all, delete-orphan", lazy="raise"
    )
    aliases: Mapped[list[SignAlias]] = relationship(
        back_populates="sign", cascade="all, delete-orphan", lazy="raise"
    )

    __table_args__ = (
        UniqueConstraint("language_variant_id", "gloss"),
        # Target for the composite FK from sign_aliases (keeps variants consistent).
        UniqueConstraint("id", "language_variant_id"),
        # Public listing: filter by status within a variant, ordered by label.
        Index(
            "ix_signs_public_listing", "language_variant_id", "verification_status", "uzbek_label"
        ),
    )


class SignAlias(CreatedAtMixin, Base):
    """Normalized Uzbek word forms that map to a sign (used by text→sign lookup).

    Uzbek is agglutinative ("kitob", "kitoblar", "kitobni"...), so a single sign
    needs several lookup keys. Keys are stored already normalized by the same
    normalizer the translation engine uses.
    """

    __tablename__ = "sign_aliases"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    sign_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False, index=True)
    # Denormalized from the sign so uniqueness can be enforced per variant;
    # the composite FK below guarantees it always equals the sign's variant.
    language_variant_id: Mapped[int] = mapped_column(Integer, nullable=False)
    normalized_text: Mapped[str] = mapped_column(String(200), nullable=False)

    sign: Mapped[Sign] = relationship(back_populates="aliases", lazy="raise")

    __table_args__ = (
        ForeignKeyConstraint(
            ["sign_id", "language_variant_id"],
            ["signs.id", "signs.language_variant_id"],
            ondelete="CASCADE",
            onupdate="CASCADE",
            name="fk_sign_aliases_sign_variant",
        ),
        # A phrase maps to at most one sign per variant -> deterministic lookup.
        UniqueConstraint("language_variant_id", "normalized_text"),
    )


class SignVideo(CreatedAtMixin, Base):
    __tablename__ = "sign_videos"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    sign_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("signs.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # Object key in S3-compatible storage (never a client-supplied path).
    storage_key: Mapped[str] = mapped_column(String(512), unique=True, nullable=False)
    duration_ms: Mapped[int] = mapped_column(Integer, nullable=False)
    video_format: Mapped[str] = mapped_column(String(16), nullable=False)
    width: Mapped[int | None] = mapped_column(Integer)
    height: Mapped[int | None] = mapped_column(Integer)
    validation_status: Mapped[VideoValidationStatus] = mapped_column(
        str_enum(VideoValidationStatus, "video_validation_status"),
        nullable=False,
        default=VideoValidationStatus.PENDING,
    )
    is_primary: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=text("false")
    )

    sign: Mapped[Sign] = relationship(back_populates="videos", lazy="raise")

    __table_args__ = (
        CheckConstraint("duration_ms > 0", name="duration_positive"),
        CheckConstraint("video_format IN ('mp4', 'webm')", name="video_format_allowed"),
        # At most one primary video per sign.
        Index(
            "uq_sign_videos_primary_per_sign",
            "sign_id",
            unique=True,
            postgresql_where=text("is_primary"),
        ),
    )
