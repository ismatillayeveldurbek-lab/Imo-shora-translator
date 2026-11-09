"""Uzbek (Latin) tokenizer for dictionary lookup.

Keeps apostrophes inside words (oʻzbek, maʼno, gʻisht) and hyphenated
compounds (bir-biri) intact, drops punctuation, and records each token's
character span in the original text so results can quote the user's input.
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass

from app.services.text_normalization import APOSTROPHE_VARIANTS, normalize_search_key

_APOSTROPHES = re.escape("'" + APOSTROPHE_VARIANTS)
_LETTER = r"[^\W\d_]"
# A word: letters, with apostrophes / hyphens allowed only *between* letters
# (so quotes like ‘salom’ are not part of the word). Numbers are separate tokens.
_TOKEN = re.compile(rf"{_LETTER}(?:{_LETTER}|[{_APOSTROPHES}](?={_LETTER})|-(?={_LETTER}))*|\d+")


@dataclass(frozen=True, slots=True)
class Token:
    surface: str  # as written by the user
    key: str  # normalized lookup key
    start: int
    end: int


def tokenize(text: str) -> list[Token]:
    text = unicodedata.normalize("NFC", text)
    return [
        Token(surface=m.group(), key=normalize_search_key(m.group()), start=m.start(), end=m.end())
        for m in _TOKEN.finditer(text)
    ]
