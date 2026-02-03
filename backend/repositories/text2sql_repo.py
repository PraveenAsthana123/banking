"""Repository for the text2sql_history table."""

import logging
from typing import Any, Dict, List

from backend.core.config import Settings
from backend.repositories.base import SQLiteRepository

logger = logging.getLogger(__name__)


class Text2SqlRepo(SQLiteRepository):

    def save_query(self, natural_language: str, generated_sql: str) -> int:
        with self._connect() as conn:
            cursor = conn.execute(
                "INSERT INTO text2sql_history (natural_language, generated_sql) VALUES (?, ?)",
                (natural_language, generated_sql),
            )
            return cursor.lastrowid

    def mark_executed(self, sql: str, row_count: int) -> None:
        with self._connect() as conn:
            conn.execute(
                "UPDATE text2sql_history SET executed=1, row_count=? "
                "WHERE id=(SELECT MAX(id) FROM text2sql_history WHERE generated_sql=?)",
                (row_count, sql),
            )

    def list_history(self, limit: int = 20) -> List[Dict[str, Any]]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT id, natural_language, generated_sql, executed, row_count, created_at "
                "FROM text2sql_history ORDER BY created_at DESC LIMIT ?",
                (limit,),
            ).fetchall()
        return [dict(r) for r in rows]
