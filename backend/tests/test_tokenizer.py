from __future__ import annotations

import pytest

from app.services.translation.tokenizer import tokenize


def surfaces(text: str) -> list[str]:
    return [t.surface for t in tokenize(text)]


def keys(text: str) -> list[str]:
    return [t.key for t in tokenize(text)]


def test_drops_punctuation_and_keeps_order() -> None:
    assert surfaces("Salom, do‘stim! Qalaysan?") == ["Salom", "do‘stim", "Qalaysan"]


@pytest.mark.parametrize("word", ["o'zbek", "o‘zbek", "o’zbek", "oʻzbek", "maʼno", "g‘isht"])
def test_internal_apostrophes_stay_in_the_word(word: str) -> None:
    assert surfaces(word) == [word]


def test_apostrophe_variants_share_a_key() -> None:
    assert keys("O‘zbek oʻzbek o'zbek") == ["o'zbek"] * 3


def test_quotes_are_not_part_of_words() -> None:
    assert surfaces("‘salom’ 'dunyo'") == ["salom", "dunyo"]


def test_hyphenated_compounds_and_numbers() -> None:
    assert surfaces("bir-biri 25 ta, yana -") == ["bir-biri", "25", "ta", "yana"]


def test_spans_point_into_the_original_text() -> None:
    text = "  Katta   rahmat!"
    for token in tokenize(text):
        assert text[token.start : token.end] == token.surface


def test_empty_and_punctuation_only() -> None:
    assert tokenize("") == []
    assert tokenize(" ...!? ") == []
