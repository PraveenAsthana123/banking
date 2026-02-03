"""Repository for the datasets table."""

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

from backend.core.config import Settings
from backend.core.exceptions import NotFoundError
from backend.repositories.base import SQLiteRepository

logger = logging.getLogger(__name__)


class DatasetRepo(SQLiteRepository):

    def list_all(self) -> List[Dict[str, Any]]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT id, name, original_filename, file_size, rows, cols, created_at "
                "FROM datasets ORDER BY created_at DESC"
            ).fetchall()
        return [
            {"id": r["id"], "name": r["name"], "filename": r["original_filename"],
             "size": r["file_size"], "rows": r["rows"], "cols": r["cols"], "created_at": r["created_at"]}
            for r in rows
        ]

    def find_by_id(self, dataset_id: int) -> Dict[str, Any]:
        with self._connect() as conn:
            row = conn.execute("SELECT * FROM datasets WHERE id = ?", (dataset_id,)).fetchone()
        if not row:
            raise NotFoundError(f"Dataset {dataset_id} not found")
        return {
            "id": row["id"], "name": row["name"], "filename": row["original_filename"],
            "file_path": row["file_path"], "size": row["file_size"], "rows": row["rows"],
            "cols": row["cols"], "columns": json.loads(row["columns_json"]), "created_at": row["created_at"],
        }

    def find_by_file_path(self, file_path: str) -> Optional[Dict[str, Any]]:
        with self._connect() as conn:
            row = conn.execute("SELECT id FROM datasets WHERE file_path = ?", (file_path,)).fetchone()
        if row:
            return {"id": row["id"]}
        return None

    def create(self, name: str, original_filename: str, file_path: str,
               file_size: int, rows: int, cols: int, columns_json: str) -> int:
        with self._connect() as conn:
            cursor = conn.execute(
                "INSERT INTO datasets (name, original_filename, file_path, file_size, rows, cols, columns_json) "
                "VALUES (?, ?, ?, ?, ?, ?, ?)",
                (name, original_filename, file_path, file_size, rows, cols, columns_json),
            )
            return cursor.lastrowid

    def delete(self, dataset_id: int) -> Dict[str, str]:
        with self._connect() as conn:
            row = conn.execute("SELECT file_path, name FROM datasets WHERE id = ?", (dataset_id,)).fetchone()
            if not row:
                raise NotFoundError(f"Dataset {dataset_id} not found")
            filepath = Path(row["file_path"])
            if filepath.exists():
                filepath.unlink()
            conn.execute("DELETE FROM datasets WHERE id = ?", (dataset_id,))
        return {"name": row["name"]}

    def get_file_path(self, dataset_id: int) -> str:
        with self._connect() as conn:
            row = conn.execute("SELECT file_path FROM datasets WHERE id = ?", (dataset_id,)).fetchone()
        if not row:
            raise NotFoundError(f"Dataset {dataset_id} not found")
        return row["file_path"]
