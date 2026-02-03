"""Base repository with SQLite connection management."""

import sqlite3
import logging
from contextlib import contextmanager
from pathlib import Path
from typing import Generator

from backend.core.config import Settings

logger = logging.getLogger(__name__)


class SQLiteRepository:
    """Base class for all SQLite repositories.

    Provides a `_connect()` context manager that yields a connection
    with WAL mode, foreign keys, and row_factory set.
    """

    def __init__(self, settings: Settings) -> None:
        self._db_path: Path = settings.admin_db

    @contextmanager
    def _connect(self) -> Generator[sqlite3.Connection, None, None]:
        """Context manager for database connections with auto-commit/rollback."""
        conn = sqlite3.connect(str(self._db_path))
        conn.row_factory = sqlite3.Row
        try:
            conn.execute("PRAGMA journal_mode=WAL")
            conn.execute("PRAGMA foreign_keys=ON")
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
