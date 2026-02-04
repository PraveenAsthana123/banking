"""Real metrics from ml_pipeline_results.db."""

import logging
import sqlite3
from typing import Optional

from fastapi import APIRouter, Depends, Query

from backend.core.config import Settings
from backend.core.dependencies import get_settings
from backend.core.exceptions import DataError
from backend.core.utils import sanitize_table_name

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin/metrics", tags=["metrics"])


@router.get("")
def get_metrics(use_case: Optional[str] = Query(None), settings: Settings = Depends(get_settings)):
    """Get ML pipeline metrics from results DB."""
    if not settings.results_db.exists():
        return {"message": "ml_pipeline_results.db not found", "metrics": []}

    try:
        conn = sqlite3.connect(str(settings.results_db))
        conn.row_factory = sqlite3.Row

        tables = [r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]

        result = {"tables": tables, "metrics": []}

        for tbl in tables:
            safe_tbl = sanitize_table_name(tbl)
            if not safe_tbl:
                continue
            try:
                query = f'SELECT * FROM "{safe_tbl}"'
                params: list = []
                col_names = [c[1] for c in conn.execute(f'PRAGMA table_info("{safe_tbl}")').fetchall()]
                if use_case and "use_case_key" in col_names:
                    query += " WHERE use_case_key = ?"
                    params = [use_case]
                query += " ORDER BY rowid DESC LIMIT 50"
                rows = conn.execute(query, params).fetchall()
                result["metrics"].append({
                    "table": tbl,
                    "count": len(rows),
                    "data": [dict(r) for r in rows],
                })
            except Exception as e:
                result["metrics"].append({"table": tbl, "error": str(e)})

        conn.close()
        return result
    except Exception as e:
        raise DataError(f"Failed to read metrics: {e}")


@router.get("/preprocessing")
def get_preprocessing_metrics(settings: Settings = Depends(get_settings)):
    """Get preprocessing pipeline results."""
    if not settings.preprocessing_db.exists():
        return {"message": "preprocessing_results.db not found", "metrics": []}

    try:
        conn = sqlite3.connect(str(settings.preprocessing_db))
        conn.row_factory = sqlite3.Row
        tables = [r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]

        result = {"tables": tables, "metrics": []}
        for tbl in tables:
            safe_tbl = sanitize_table_name(tbl)
            if not safe_tbl:
                continue
            try:
                rows = conn.execute(f'SELECT * FROM "{safe_tbl}" ORDER BY rowid DESC LIMIT 50').fetchall()
                result["metrics"].append({
                    "table": tbl,
                    "count": len(rows),
                    "data": [dict(r) for r in rows],
                })
            except Exception as e:
                result["metrics"].append({"table": tbl, "error": str(e)})

        conn.close()
        return result
    except Exception as e:
        raise DataError(f"Failed to read preprocessing metrics: {e}")
