from __future__ import annotations

import pytest
from sqlalchemy import literal, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.text_normalization import normalize_search_key, search_key_sql

VARIANTS = ["o'zbek", "o‘zbek", "o’zbek", "oʻzbek", "oʼzbek", "o`zbek", "O‘ZBEK"]


@pytest.mark.parametrize("text", VARIANTS)
def test_apostrophe_variants_fold_to_one_key(text: str) -> None:
    assert normalize_search_key(text) == "o'zbek"


def test_whitespace_and_case() -> None:
    assert normalize_search_key("  Katta   RAHMAT\n") == "katta rahmat"


def test_nfc_normalization() -> None:
    decomposed = "é"  # e + combining acute
    assert normalize_search_key(decomposed) == "é"


@pytest.mark.parametrize("text", [*VARIANTS, "G‘ISHT", "maʼno", "Sh"])
async def test_sql_mirror_matches_python(db: AsyncSession, text: str) -> None:
    sql_key = (await db.execute(select(search_key_sql(literal(text))))).scalar_one()
    assert sql_key == normalize_search_key(text)
