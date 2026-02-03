"""Repository for the audit_log table."""

import logging
from typing import Any, Dict, List, Optional

from backend.core.config import Settings
from backend.repositories.base import SQLiteRepository

logger = logging.getLogger(__name__)


class AuditRepo(SQLiteRepository):

    def log(self, action: str, detail: str = "", user: str = "system", entry_type: str = "info") -> None:
        try:
            with self._connect() as conn:
                conn.execute(
                    "INSERT INTO audit_log (action, detail, user, entry_type) VALUES (?, ?, ?, ?)",
                    (action, detail, user, entry_type),
                )
        except Exception as e:
            logger.error("Failed to write audit log: %s", e)

    def list_recent(self, limit: int = 50, entry_type: Optional[str] = None) -> List[Dict[str, Any]]:
        with self._connect() as conn:
            query = "SELECT id, action, detail, user, entry_type, created_at FROM audit_log"
            params: list = []
            if entry_type:
                query += " WHERE entry_type = ?"
                params.append(entry_type)
            query += " ORDER BY created_at DESC LIMIT ?"
            params.append(limit)
            rows = conn.execute(query, params).fetchall()
        return [dict(r) for r in rows]
