"""Read real log files from disk."""

import logging
import re
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, Query

from backend.core.config import Settings
from backend.core.dependencies import get_settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin/logs", tags=["logs"])


@router.get("")
def get_logs(
    file: Optional[str] = Query(None, description="Log file name (without path)"),
    level: Optional[str] = Query(None, description="Filter by level: error, warn, info, debug"),
    search: Optional[str] = Query(None, description="Search text"),
    limit: int = Query(200, ge=1, le=2000),
    settings: Settings = Depends(get_settings),
):
    """Read real log files from disk."""
    logs_dir = settings.logs_dir
    if not logs_dir.exists():
        return {"files": [], "entries": [], "message": "No logs directory found"}

    log_files = sorted(logs_dir.glob("*.log"), key=lambda f: f.stat().st_mtime, reverse=True)

    if not log_files:
        return {"files": [], "entries": [], "message": "No log files found"}

    file_list = [{"name": f.name, "size": f.stat().st_size} for f in log_files]

    # Pick file to read
    target = None
    if file:
        target = (logs_dir / file).resolve()
        # Path traversal guard — must stay within logs_dir
        if not str(target).startswith(str(logs_dir.resolve())):
            return {"files": file_list, "entries": [], "message": "Invalid log file path"}
        if not target.exists() or not target.is_file():
            return {"files": file_list, "entries": [], "message": f"Log file '{file}' not found"}
    else:
        target = log_files[0]  # Most recently modified

    # Read last N lines
    entries = []
    try:
        lines = target.read_text(errors="replace").splitlines()
        log_pattern = re.compile(r'^(\S+ \S+)\s*-\s*(\S+)\s*-\s*(\w+)\s*-\s*(.+)$')

        for line in lines[-limit * 2:]:
            match = log_pattern.match(line)
            if match:
                ts, source, lvl, msg = match.groups()
                entry = {"ts": ts, "source": source, "level": lvl.lower(), "msg": msg}
            else:
                entry = {"ts": "", "source": "", "level": "info", "msg": line}

            if level and entry["level"] != level.lower():
                continue
            if search and search.lower() not in entry["msg"].lower() and search.lower() not in entry["source"].lower():
                continue
            entries.append(entry)

            if len(entries) >= limit:
                break

    except Exception as e:
        return {"files": file_list, "entries": [], "message": f"Error reading log: {e}"}

    entries.reverse()
    return {"files": file_list, "entries": entries, "current_file": target.name}


@router.get("/files")
def list_log_files(settings: Settings = Depends(get_settings)):
    """List available log files."""
    logs_dir = settings.logs_dir
    if not logs_dir.exists():
        return []
    return [
        {"name": f.name, "size": f.stat().st_size, "modified": f.stat().st_mtime}
        for f in sorted(logs_dir.glob("*.log"), key=lambda f: f.stat().st_mtime, reverse=True)
    ]
