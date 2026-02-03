"""Repository for the jobs table."""

import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from backend.core.config import Settings
from backend.core.exceptions import NotFoundError, ValidationError
from backend.repositories.base import SQLiteRepository

logger = logging.getLogger(__name__)


class JobRepo(SQLiteRepository):

    def list_all(self, limit: int = 100) -> List[Dict[str, Any]]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT id, job_type, status, progress, error_message, started_at, completed_at, created_at "
                "FROM jobs ORDER BY created_at DESC LIMIT ?",
                (limit,),
            ).fetchall()
        return [dict(r) for r in rows]

    def list_by_type(self, job_type: str) -> List[Dict[str, Any]]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT id, job_type, status, progress, error_message, started_at, completed_at, created_at "
                "FROM jobs WHERE job_type=? ORDER BY created_at DESC",
                (job_type,),
            ).fetchall()
        return [dict(r) for r in rows]

    def find_by_id(self, job_id: int) -> Dict[str, Any]:
        with self._connect() as conn:
            row = conn.execute("SELECT * FROM jobs WHERE id = ?", (job_id,)).fetchone()
        if not row:
            raise NotFoundError(f"Job {job_id} not found")
        return dict(row)

    def find_by_id_and_type(self, job_id: int, job_type: str) -> Dict[str, Any]:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT * FROM jobs WHERE id = ? AND job_type=?", (job_id, job_type)
            ).fetchone()
        if not row:
            raise NotFoundError(f"Job {job_id} not found")
        result = dict(row)
        result["config"] = json.loads(result.pop("config_json", "{}"))
        result["result"] = json.loads(result.pop("result_json", "{}"))
        return result

    def create(self, job_type: str, config: Optional[Dict] = None) -> int:
        config_json = json.dumps(config) if config else "{}"
        now = datetime.now().isoformat()
        with self._connect() as conn:
            cursor = conn.execute(
                "INSERT INTO jobs (job_type, status, progress, config_json, created_at) VALUES (?, 'queued', 0, ?, ?)",
                (job_type, config_json, now),
            )
            return cursor.lastrowid

    def update_status(self, job_id: int, status: str, error_message: str = None) -> None:
        now = datetime.now().isoformat()
        with self._connect() as conn:
            if error_message:
                conn.execute(
                    "UPDATE jobs SET status=?, error_message=?, completed_at=? WHERE id=?",
                    (status, error_message, now, job_id),
                )
            elif status in ("completed", "cancelled", "failed"):
                conn.execute(
                    "UPDATE jobs SET status=?, completed_at=? WHERE id=?",
                    (status, now, job_id),
                )
            elif status == "running":
                conn.execute(
                    "UPDATE jobs SET status=?, started_at=? WHERE id=?",
                    (status, now, job_id),
                )
            else:
                conn.execute("UPDATE jobs SET status=? WHERE id=?", (status, job_id))

    def update_progress(self, job_id: int, progress: int) -> None:
        with self._connect() as conn:
            conn.execute("UPDATE jobs SET progress=? WHERE id=?", (progress, job_id))

    def update_result(self, job_id: int, result: Dict[str, Any]) -> None:
        now = datetime.now().isoformat()
        with self._connect() as conn:
            conn.execute(
                "UPDATE jobs SET status='completed', progress=100, result_json=?, completed_at=? WHERE id=?",
                (json.dumps(result), now, job_id),
            )

    def cancel(self, job_id: int) -> None:
        with self._connect() as conn:
            row = conn.execute("SELECT status FROM jobs WHERE id=?", (job_id,)).fetchone()
            if not row:
                raise NotFoundError(f"Job {job_id} not found")
            if row["status"] not in ("queued", "running"):
                raise ValidationError(f"Cannot cancel job in '{row['status']}' state")
            conn.execute(
                "UPDATE jobs SET status='cancelled', completed_at=? WHERE id=?",
                (datetime.now().isoformat(), job_id),
            )
