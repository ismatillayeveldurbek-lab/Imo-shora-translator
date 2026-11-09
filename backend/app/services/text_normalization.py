"""Uzbek (Latin script) text normalization.

Uzbek text in the wild spells the letters oʻ/gʻ and the tutuq belgisi (ʼ) with
many different apostrophe-like characters. For lookups we fold all of them
into a single ASCII apostrophe so that "o'zbek", "oʻzbek", "o‘zbek" and
"o’zbek" produce the same key.

The same function MUST be used for stored lookup keys (sign_aliases) and for
user queries; the SQL mirror ``search_key_sql`` is kept in sync by tests.
"""

from __future__ import annotations

import re
import unicodedata

from sqlalchemy import ColumnElement, SQLColumnExpression, func

# ‘ ’ ʻ ʼ ` ´ ʹ ′ — all folded to the ASCII apostrophe.
APOSTROPHE_VARIANTS = "\u2018\u2019\u02bb\u02bc\u0060\u00b4\u02b9\u2032"
CANONICAL_APOSTROPHE = "'"
_APOSTROPHE_TABLE = str.maketrans(dict.fromkeys(APOSTROPHE_VARIANTS, CANONICAL_APOSTROPHE))
_WHITESPACE = re.compile(r"\s+")


def normalize_search_key(text: str) -> str:
    """Lower-case, fold apostrophe variants and collapse whitespace."""
    text = unicodedata.normalize("NFC", text)
    text = text.translate(_APOSTROPHE_TABLE).lower()
    return _WHITESPACE.sub(" ", text).strip()


def search_key_sql(column: SQLColumnExpression[str]) -> ColumnElement[str]:
    """SQL equivalent of :func:`normalize_search_key` (without whitespace folding)."""
    return func.translate(
        func.lower(column), APOSTROPHE_VARIANTS, CANONICAL_APOSTROPHE * len(APOSTROPHE_VARIANTS)
    )


# Official Uzbek Latin alphabet, as search keys, in alphabetical order.
UZBEK_ALPHABET: tuple[str, ...] = (
    "a", "b", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q",
    "r", "s", "t", "u", "v", "x", "y", "z", "o'", "g'", "sh", "ch", "ng",
)  # fmt: skip

# Single letters whose key is a prefix of a digraph letter that must be excluded.
LETTER_EXCLUSIONS: dict[str, tuple[str, ...]] = {
    "o": ("o'",),
    "g": ("g'",),
    "s": ("sh",),
    "n": ("ng",),
}
