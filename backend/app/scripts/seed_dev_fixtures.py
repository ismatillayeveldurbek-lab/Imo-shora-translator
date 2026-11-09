"""Seed DEVELOPMENT FIXTURES — explicitly labeled test data, never real signs.

Everything created here:
  * belongs to the language variant ``dev-fixture`` (is_test_data = true),
  * has ``is_test_data = true`` and status ``draft`` (never ``verified``),
  * has a gloss starting with ``TEST_`` and no videos,
  * has lookup aliases (e.g. "salom") so text→sign can be exercised; they
    only resolve within the test variant, i.e. in development test-data mode.

Public endpoints exclude test data, so these rows exist only to exercise the
UI and API during development. The script refuses to run in production.

Usage:  uv run python -m app.scripts.seed_dev_fixtures
"""

from __future__ import annotations

import asyncio
import sys

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert

from app.core.config import get_settings
from app.db.session import build_engine, build_session_factory
from app.models import Category, LanguageVariant, Sign, SignAlias, VerificationStatus
from app.services.text_normalization import normalize_search_key

FIXTURE_VARIANT_CODE = "dev-fixture"

_CATEGORIES = [
    ("TEST — Salomlashish", "test-salomlashish"),
    ("TEST — Raqamlar", "test-raqamlar"),
]

# (gloss, uzbek_label, category_slug, is_dynamic, aliases)
_SIGNS = [
    ("TEST_SALOM", "salom (test)", "test-salomlashish", True, ("salom",)),
    ("TEST_RAHMAT", "rahmat (test)", "test-salomlashish", True, ("rahmat", "katta rahmat")),
    ("TEST_BIR", "bir (test)", "test-raqamlar", False, ("bir", "1")),
]


async def seed() -> None:
    settings = get_settings()
    if settings.is_production:
        print("Refusing to seed development fixtures in production.", file=sys.stderr)
        raise SystemExit(1)

    engine = build_engine(settings)
    factory = build_session_factory(engine)
    try:
        async with factory() as session, session.begin():
            await session.execute(
                insert(LanguageVariant)
                .values(
                    code=FIXTURE_VARIANT_CODE,
                    name="TEST MA'LUMOTI — haqiqiy imo-ishora tili varianti emas",
                    description="Faqat dasturlash va testlash uchun. Ommaga ko'rsatilmaydi.",
                    is_test_data=True,
                )
                .on_conflict_do_nothing(index_elements=["code"])
            )
            variant_id = (
                await session.execute(
                    select(LanguageVariant.id).where(LanguageVariant.code == FIXTURE_VARIANT_CODE)
                )
            ).scalar_one()

            await session.execute(
                insert(Category)
                .values([{"name": n, "slug": s} for n, s in _CATEGORIES])
                .on_conflict_do_nothing(index_elements=["slug"])
            )
            category_rows = await session.execute(
                select(Category.slug, Category.id).where(
                    Category.slug.in_([s for _, s in _CATEGORIES])
                )
            )
            category_ids = {slug: cid for slug, cid in category_rows.all()}

            await session.execute(
                insert(Sign)
                .values(
                    [
                        {
                            "gloss": gloss,
                            "uzbek_label": label,
                            "description": "Test yozuvi. Haqiqiy imo-ishora emas.",
                            "category_id": category_ids[slug],
                            "language_variant_id": variant_id,
                            "is_dynamic": dynamic,
                            "verification_status": VerificationStatus.DRAFT,
                            "is_test_data": True,
                        }
                        for gloss, label, slug, dynamic, _ in _SIGNS
                    ]
                )
                .on_conflict_do_nothing(index_elements=["language_variant_id", "gloss"])
            )
            sign_ids = {
                gloss: sid
                for gloss, sid in (
                    await session.execute(
                        select(Sign.gloss, Sign.id).where(Sign.language_variant_id == variant_id)
                    )
                ).all()
            }
            alias_rows = [
                {
                    "sign_id": sign_ids[gloss],
                    "language_variant_id": variant_id,
                    "normalized_text": normalize_search_key(alias),
                }
                for gloss, *_, aliases in _SIGNS
                for alias in aliases
            ]
            await session.execute(
                insert(SignAlias)
                .values(alias_rows)
                .on_conflict_do_nothing(index_elements=["language_variant_id", "normalized_text"])
            )
        print(f"Seeded development fixtures into variant '{FIXTURE_VARIANT_CODE}'.")
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
