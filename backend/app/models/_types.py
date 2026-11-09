"""Shared column type helpers."""

from __future__ import annotations

from enum import StrEnum

from sqlalchemy import Enum as SAEnum


def str_enum(enum_cls: type[StrEnum], name: str) -> SAEnum:
    """VARCHAR-backed enum with a named CHECK constraint, storing ``.value``."""
    return SAEnum(
        enum_cls,
        name=name,
        native_enum=False,
        create_constraint=True,
        length=32,
        values_callable=lambda members: [m.value for m in members],
        validate_strings=True,
    )
