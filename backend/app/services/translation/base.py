from __future__ import annotations

from typing import Protocol

from app.models import LanguageVariant
from app.schemas.translation import TextToSignResponse


class TextToSignTranslator(Protocol):
    async def translate(self, text: str, variant: LanguageVariant | None) -> TextToSignResponse:
        """Translate already-validated Uzbek text into a sequence of signs."""
        ...
