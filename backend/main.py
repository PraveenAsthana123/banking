"""FastAPI entry point — production-grade Banking ML admin backend."""

import logging
import sqlite3
from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.core.auth import ApiKeyMiddleware
from backend.core.config import get_settings
from backend.core.error_handlers import register_error_handlers
from backend.core.logging_config import setup_logging
from backend.core.middleware import CorrelationIdMiddleware
from backend.database import init_db

from backend.routers import (
    upload,
    statistics,
    scoring,
    training,
    integrations,
    monitoring,
    jobs,
    text2sql,
    logs,
    metrics,
    audit,
    process,
    compare,
    alerts,
    regulatory,
    export,
)

setup_logging(level="INFO", json_format=True)
logger = logging.getLogger(__name__)


# ── Department data (migrated from Flask api_server.py) ──────────────────────

DEPARTMENTS = [
    {"id": "risk", "name": "Risk Management", "icon": "shield", "color": "#dc2626", "description": "Enterprise risk assessment and mitigation strategies"},
    {"id": "credit", "name": "Credit Analysis", "icon": "credit-card", "color": "#2563eb", "description": "Credit underwriting and portfolio management"},
    {"id": "fraud", "name": "Fraud Detection", "icon": "alert-triangle", "color": "#7c3aed", "description": "Real-time fraud prevention and detection systems"},
    {"id": "customer", "name": "Customer Analytics", "icon": "users", "color": "#059669", "description": "Customer insights and personalization"},
    {"id": "compliance", "name": "Compliance", "icon": "clipboard-check", "color": "#d97706", "description": "Regulatory compliance and reporting"},
    {"id": "treasury", "name": "Treasury", "icon": "landmark", "color": "#0891b2", "description": "Treasury operations and cash management"},
    {"id": "retail", "name": "Retail Banking", "icon": "building", "color": "#db2777", "description": "Retail banking products and services"},
    {"id": "investment", "name": "Investment Banking", "icon": "trending-up", "color": "#4f46e5", "description": "Investment analysis and portfolio management"},
]


def _query_results_db(sql: str, settings=None) -> list:
    """Execute a query against the results DB (read-only helper)."""
    if settings is None:
        settings = get_settings()
    if not settings.results_db.exists():
        return []
    try:
        conn = sqlite3.connect(str(settings.results_db))
        conn.row_factory = sqlite3.Row
        rows = conn.execute(sql).fetchall()
        conn.close()
        return [dict(r) for r in rows]
    except Exception as e:
        logger.warning("results_db query failed: %s", e)
        return []


def _query_job_status() -> List[Dict[str, Any]]:
    """Fetch use cases from ml_pipeline_results.db if available."""
    rows = _query_results_db(
        "SELECT use_case_key, status, created_at, updated_at FROM job_status ORDER BY updated_at DESC"
    )
    return [
        {"id": r["use_case_key"], "name": r["use_case_key"].replace("_", " ").title(),
         "status": r["status"] or "pending", "created_at": r["created_at"], "updated_at": r["updated_at"]}
        for r in rows
    ]


# ── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    logger.info("Backend started — admin DB initialized")
    yield
    logger.info("Backend shutting down")


# ── App ──────────────────────────────────────────────────────────────────────

settings = get_settings()

app = FastAPI(title="Banking ML Admin API", version="1.0.0", lifespan=lifespan)

# Middleware stack (order matters: outermost first)
app.add_middleware(CorrelationIdMiddleware)
app.add_middleware(ApiKeyMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register custom exception handlers
register_error_handlers(app)

# Mount admin routers
app.include_router(upload.router)
app.include_router(statistics.router)
app.include_router(scoring.router)
app.include_router(training.router)
app.include_router(integrations.router)
app.include_router(monitoring.router)
app.include_router(jobs.router)
app.include_router(text2sql.router)
app.include_router(logs.router)
app.include_router(metrics.router)
app.include_router(audit.router)
app.include_router(process.router)
app.include_router(compare.router)
app.include_router(alerts.router)
app.include_router(regulatory.router)
app.include_router(export.router)


# ── Public endpoints ─────────────────────────────────────────────────────────

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.get("/api/departments")
def get_departments():
    return DEPARTMENTS


@app.get("/api/departments/{dept_id}")
def get_department(dept_id: str):
    dept = next((d for d in DEPARTMENTS if d["id"] == dept_id), None)
    if not dept:
        return {"error": "Department not found"}
    return dept


@app.get("/api/use-cases")
def get_use_cases():
    return _query_job_status()


@app.get("/api/use-cases/{use_case_id}")
def get_use_case(use_case_id: str):
    ucs = _query_job_status()
    uc = next((u for u in ucs if u["id"] == use_case_id), None)
    if not uc:
        return {"error": "Use case not found"}
    return uc


@app.get("/api/pipelines")
def get_pipelines():
    rows = _query_results_db(
        "SELECT id, use_case_key, status, created_at, updated_at, error_message "
        "FROM job_status ORDER BY updated_at DESC LIMIT 50"
    )
    return [
        {"id": r["id"], "use_case_key": r["use_case_key"],
         "name": r["use_case_key"].replace("_", " ").title(),
         "status": r["status"] or "pending", "created_at": r["created_at"],
         "updated_at": r["updated_at"], "error_message": r["error_message"]}
        for r in rows
    ]


@app.get("/api/models")
def get_models():
    models = []
    for d in settings.model_dirs:
        if d.exists():
            for f in d.rglob("*.pkl"):
                models.append({
                    "id": f.stem,
                    "name": f.stem.replace("_", " ").title(),
                    "path": str(f),
                    "size": f.stat().st_size,
                    "modified": datetime.fromtimestamp(f.stat().st_mtime).isoformat(),
                })
    return models


@app.get("/api/stats")
def get_stats():
    ucs = _query_job_status()
    return {
        "total_use_cases": len(ucs),
        "total_pipelines": len(ucs),
        "departments": len(DEPARTMENTS),
        "active_models": len([u for u in ucs if u.get("status") == "completed"]),
    }
