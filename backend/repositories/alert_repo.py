"""Repository for the alerts table."""

import logging
from datetime import datetime
from typing import Any, Dict, List

from backend.core.config import Settings
from backend.core.exceptions import NotFoundError, ValidationError
from backend.repositories.base import SQLiteRepository

logger = logging.getLogger(__name__)


class AlertRepo(SQLiteRepository):

    def list_all(self) -> List[Dict[str, Any]]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT id, name, metric, threshold, operator, uc_id, severity, "
                "enabled, last_triggered, created_at FROM alerts ORDER BY created_at DESC"
            ).fetchall()
        return [dict(r) for r in rows]

    def list_enabled(self) -> List[Dict[str, Any]]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT id, name, metric, threshold, operator, uc_id, severity "
                "FROM alerts WHERE enabled = 1"
            ).fetchall()
        return [dict(r) for r in rows]

    def create(self, name: str, metric: str, threshold: float, operator: str,
               uc_id: str, severity: str) -> int:
        now = datetime.now().isoformat()
        with self._connect() as conn:
            cursor = conn.execute(
                "INSERT INTO alerts (name, metric, threshold, operator, uc_id, severity, enabled, created_at) "
                "VALUES (?, ?, ?, ?, ?, ?, 1, ?)",
                (name, metric, threshold, operator, uc_id, severity, now),
            )
            return cursor.lastrowid

    def update(self, alert_id: int, **fields) -> None:
        updates = []
        values = []
        for field in ("name", "metric", "threshold", "operator", "uc_id", "severity", "enabled"):
            val = fields.get(field)
            if val is not None:
                updates.append(f"{field} = ?")
                values.append(val)

        if not updates:
            raise ValidationError("No fields to update.")

        values.append(alert_id)
        with self._connect() as conn:
            result = conn.execute(
                f"UPDATE alerts SET {', '.join(updates)} WHERE id = ?", values
            )
            if result.rowcount == 0:
                raise NotFoundError(f"Alert {alert_id} not found.")

    def delete(self, alert_id: int) -> None:
        with self._connect() as conn:
            result = conn.execute("DELETE FROM alerts WHERE id = ?", (alert_id,))
            if result.rowcount == 0:
                raise NotFoundError(f"Alert {alert_id} not found.")

    def update_last_triggered(self, alert_ids: List[int], timestamp: str) -> None:
        with self._connect() as conn:
            for aid in alert_ids:
                conn.execute("UPDATE alerts SET last_triggered = ? WHERE id = ?", (timestamp, aid))
