"""SQLite connection manager and schema initialization for admin tables."""

import sqlite3
import logging
from contextlib import contextmanager
from typing import Generator

from backend.config import ADMIN_DB

logger = logging.getLogger(__name__)

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS datasets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    rows INTEGER NOT NULL DEFAULT 0,
    cols INTEGER NOT NULL DEFAULT 0,
    columns_json TEXT DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS integrations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    config_json TEXT DEFAULT '{}',
    status TEXT DEFAULT 'disconnected',
    last_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_type TEXT NOT NULL,
    status TEXT DEFAULT 'queued',
    progress INTEGER DEFAULT 0,
    config_json TEXT DEFAULT '{}',
    result_json TEXT DEFAULT '{}',
    error_message TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS text2sql_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    natural_language TEXT NOT NULL,
    generated_sql TEXT,
    executed INTEGER DEFAULT 0,
    row_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    detail TEXT,
    user TEXT DEFAULT 'system',
    entry_type TEXT DEFAULT 'info',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    metric TEXT NOT NULL,
    threshold REAL NOT NULL,
    operator TEXT DEFAULT '>',
    uc_id TEXT DEFAULT 'all',
    severity TEXT DEFAULT 'warning',
    enabled INTEGER DEFAULT 1,
    last_triggered TEXT,
    created_at TEXT
);
"""


@contextmanager
def get_admin_db() -> Generator[sqlite3.Connection, None, None]:
    """Context manager for admin database connections."""
    conn = sqlite3.connect(str(ADMIN_DB))
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


def init_db():
    """Initialize admin database tables."""
    with get_admin_db() as conn:
        conn.executescript(SCHEMA_SQL)
    logger.info("Admin database initialized at %s", ADMIN_DB)


def log_audit(action: str, detail: str = "", user: str = "system", entry_type: str = "info"):
    """Write an entry to the audit log."""
    try:
        with get_admin_db() as conn:
            conn.execute(
                "INSERT INTO audit_log (action, detail, user, entry_type) VALUES (?, ?, ?, ?)",
                (action, detail, user, entry_type),
            )
    except Exception as e:
        logger.error("Failed to write audit log: %s", e)
