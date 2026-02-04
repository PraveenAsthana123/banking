"""FastAPI entry point — production-grade Banking ML admin backend."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from backend.core.auth import ApiKeyMiddleware
from backend.core.config import get_settings
from backend.core.error_handlers import register_error_handlers
from backend.core.logging_config import setup_logging
from backend.core.middleware import CorrelationIdMiddleware, SecurityHeadersMiddleware, RateLimitMiddleware
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
    public,
)

setup_logging(level="INFO", json_format=True)
logger = logging.getLogger(__name__)


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
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware, requests_per_minute=100)
app.add_middleware(ApiKeyMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Register custom exception handlers
register_error_handlers(app)

# Mount public router (health, departments, use-cases, pipelines, models, stats)
app.include_router(public.router)

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
