"""Uzbek text → sign translation.

``TextToSignTranslator`` is the extension point: the MVP ships
``DictionaryTranslator`` (word/phrase lookup). A future grammar-aware
translator implements the same protocol and is selected in the API layer.
"""

from app.services.translation.base import TextToSignTranslator
from app.services.translation.dictionary_translator import DictionaryTranslator

__all__ = ["DictionaryTranslator", "TextToSignTranslator"]
