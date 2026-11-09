"""Logging configuration. Logs never include request bodies, audio or video."""

from __future__ import annotations

import logging
import sys


def configure_logging(level: str) -> None:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s"))
    root = logging.getLogger()
    root.handlers[:] = [handler]
    root.setLevel(level.upper())
    # SQL statement logging is controlled by DATABASE_ECHO, not the root level.
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
