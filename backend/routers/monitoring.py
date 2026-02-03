"""System and model monitoring — real data from psutil, filesystem, databases."""

import logging
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends

from backend.core.config import Settings
from backend.core.dependencies import get_settings
from backend.core.utils import human_size
from backend.services.system_monitor import get_system_metrics

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin/monitoring", tags=["monitoring"])


@router.get("/models")
def list_model_files(settings: Settings = Depends(get_settings)):
    """Real: check .pkl files on disk — sizes, dates."""
    models = []
    for d in settings.model_dirs:
        if not d.exists():
            continue
        for f in d.rglob("*.pkl"):
            stat = f.stat()
            models.append({
                "name": f.stem.replace("_", " ").title(),
                "path": str(f),
                "size": stat.st_size,
                "size_human": human_size(stat.st_size),
                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
            })
    return models


@router.get("/system")
def system_status():
    """Real: psutil CPU/memory/disk."""
    return get_system_metrics()


@router.get("/databases")
def database_status(settings: Settings = Depends(get_settings)):
    """Real: DB file sizes, table counts, row counts."""
    dbs = {
        "banking_unified": settings.unified_db,
        "ml_pipeline_results": settings.results_db,
        "preprocessing_results": settings.preprocessing_db,
        "rag_cache": settings.rag_cache_db,
    }
    result = []
    for name, path in dbs.items():
        entry = {"name": name, "path": str(path), "exists": path.exists()}
        if path.exists():
            import sqlite3
            entry["size"] = path.stat().st_size
            entry["size_human"] = human_size(path.stat().st_size)
            try:
                conn = sqlite3.connect(str(path))
                tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
                entry["tables"] = []
                for (tbl,) in tables:
                    try:
                        count = conn.execute(f'SELECT COUNT(*) FROM "{tbl}"').fetchone()[0]
                    except Exception:
                        count = -1
                    entry["tables"].append({"name": tbl, "rows": count})
                conn.close()
            except Exception as e:
                entry["error"] = str(e)
        result.append(entry)
    return result
