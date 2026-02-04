"""Shared pytest fixtures for Banking ML backend tests.

Provides:
- Isolated temporary directory as BANKING_BASE_DIR so every test gets its own
  admin.db, uploads/, logs/, etc.
- A TestClient wired to the FastAPI app with the DB already initialised.
- Helpers for seeding test data.
"""

import os
import sqlite3
from pathlib import Path

import pytest
from fastapi.testclient import TestClient


# ---------------------------------------------------------------------------
# Patching helpers — must run before any backend imports touch the DB
# ---------------------------------------------------------------------------

@pytest.fixture(autouse=True)
def _isolate_env(tmp_path, monkeypatch):
    """Point every path-related env var at a disposable tmp_path.

    This runs before every test so that:
    - backend.config.ADMIN_DB  (legacy path used by database.py)
    - backend.core.config.Settings.admin_db  (pydantic property)
    all resolve inside *tmp_path* instead of the real project directory.
    """
    monkeypatch.setenv("BANKING_BASE_DIR", str(tmp_path))
    # Ensure admin.db, uploads/, logs/, preprocessing_output/ live in tmp
    monkeypatch.setenv("BANKING_ADMIN_DB", str(tmp_path / "admin.db"))
    monkeypatch.setenv("BANKING_RESULTS_DB", str(tmp_path / "results.db"))
    monkeypatch.setenv("BANKING_UNIFIED_DB", str(tmp_path / "unified.db"))
    monkeypatch.setenv("BANKING_PREPROCESSING_DB", str(tmp_path / "preproc.db"))
    monkeypatch.setenv("BANKING_RAG_CACHE_DB", str(tmp_path / "rag.db"))
    monkeypatch.setenv("BANKING_VECTOR_STORE_DIR", str(tmp_path / "vector_store"))
    monkeypatch.setenv("BANKING_LOGS_DIR", str(tmp_path / "logs"))
    monkeypatch.setenv("BANKING_OUTPUT_DIR", str(tmp_path / "preprocessing_output"))
    monkeypatch.setenv("BANKING_USE_CASES_DIR", str(tmp_path / "5_Star_UseCases"))

    # Remove API key so auth doesn't block normal tests
    monkeypatch.delenv("BANKING_API_KEY", raising=False)
    # Remove encryption key so it doesn't leak between tests
    monkeypatch.delenv("BANKING_ENCRYPTION_KEY", raising=False)
    # Disable rate limiting in tests
    monkeypatch.setenv("BANKING_RATE_LIMIT", "10000")

    # Create necessary subdirectories
    (tmp_path / "uploads").mkdir(exist_ok=True)
    (tmp_path / "logs").mkdir(exist_ok=True)
    (tmp_path / "preprocessing_output").mkdir(exist_ok=True)

    # Clear cached settings so each test picks up the new env
    from backend.core.config import get_settings
    get_settings.cache_clear()

    yield

    get_settings.cache_clear()


@pytest.fixture()
def db_path(tmp_path) -> Path:
    """Return the admin DB path for this test (already set by _isolate_env)."""
    return tmp_path / "admin.db"


@pytest.fixture()
def init_db(db_path):
    """Initialise the admin schema inside the temp DB.

    The app lifespan normally calls this, but TestClient with
    ``raise_server_exceptions=False`` may not, so routers that use repos
    need the tables to exist ahead of time.
    """
    from backend.database import SCHEMA_SQL
    conn = sqlite3.connect(str(db_path))
    conn.executescript(SCHEMA_SQL)
    conn.close()
    return db_path


@pytest.fixture()
def client(init_db) -> TestClient:
    """Synchronous TestClient for the FastAPI app.

    The ``init_db`` dependency ensures tables exist before any request is made.
    We reimport the app so that lifespan picks up the patched env vars.
    """
    from backend.main import app
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c


@pytest.fixture()
def seed_alert(init_db):
    """Insert a sample alert row and return its id."""
    conn = sqlite3.connect(str(init_db))
    cursor = conn.execute(
        "INSERT INTO alerts (name, metric, threshold, operator, uc_id, severity, enabled, created_at) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))",
        ("Test Alert", "accuracy", 0.85, ">", "all", "warning", 1),
    )
    alert_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return alert_id


@pytest.fixture()
def seed_job(init_db):
    """Insert a sample queued job and return its id."""
    conn = sqlite3.connect(str(init_db))
    cursor = conn.execute(
        "INSERT INTO jobs (job_type, status, progress, config_json, created_at) "
        "VALUES (?, ?, ?, ?, datetime('now'))",
        ("training", "queued", 0, "{}"),
    )
    job_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return job_id
