# Changelog

All notable changes to the Banking ML Platform are documented here.
Format follows [Conventional Commits](https://www.conventionalcommits.org/).

---

## [1.1.0] - 2026-02-03

### Added
- `pyproject.toml` with ruff, black, isort, mypy configuration (line-length=120, Python 3.11)
- `.pre-commit-config.yaml` with ruff, mypy, detect-secrets hooks
- `requirements-dev.txt` separating dev/test deps from production
- `.coveragerc` with 50% coverage gate and missing-line reporting
- `.github/workflows/ci.yml` — 3-job pipeline: lint, test, security scan
- `.github/pull_request_template.md` — PR checklist
- 13 new test files covering all previously untested routers:
  - `test_audit.py`, `test_integrations.py`, `test_training.py`, `test_scoring.py`
  - `test_text2sql.py`, `test_process.py`, `test_statistics.py`, `test_monitoring.py`
  - `test_compare.py`, `test_export.py`, `test_metrics.py`, `test_logs.py`, `test_regulatory.py`
- Configurable rate limiting via `BANKING_RATE_LIMIT` env var (Settings field)

### Changed
- `backend/core/dependencies.py` — added return type hints to all 10 DI factory functions
- `backend/services/training_service.py` — replaced 2 bare `except Exception: pass` with specific exceptions + logging
- `backend/services/model_service.py` — replaced 3 bare `except Exception: pass` with specific exceptions + logging
- `backend/routers/text2sql.py` — replaced 1 bare `except Exception: pass` with `sqlite3.OperationalError` + logging
- `backend/main.py` — rate limit now reads from `settings.rate_limit` instead of hardcoded 100
- `backend/core/config.py` — added `rate_limit` field (default 100 rpm)
- `pytest.ini` — added `--cov`, `--strict-markers`, `pythonpath`
- `Dockerfile` — increased healthcheck timeout to 10s, added start-period
- `requirements.txt` — moved test deps to `requirements-dev.txt`

### Fixed
- Test isolation: disabled rate limiting in test conftest (`BANKING_RATE_LIMIT=10000`)

---

## [1.0.0] - 2026-01-28

### Added (Phase 0-5 Refactoring)
- `backend/core/config.py` — Pydantic BaseSettings with `BANKING_` prefix
- `backend/core/exceptions.py` — AppError hierarchy (NotFoundError, ValidationError, DataError, ModelError)
- `backend/core/error_handlers.py` — exception-to-HTTP-response mapping
- `backend/core/middleware.py` — CorrelationIdMiddleware, SecurityHeadersMiddleware, RateLimitMiddleware
- `backend/core/auth.py` — API key middleware (env-driven, disabled in dev)
- `backend/core/encryption.py` — Fernet encryption for secrets in DB
- `backend/core/logging_config.py` — JSON structured logging with correlation_id
- `backend/core/dependencies.py` — Depends() factories for all repos + services
- `backend/core/utils.py` — shared helpers (sanitize_table_name, validate_use_case_key, human_size)
- Repository layer: AlertRepo, AuditRepo, DatasetRepo, IntegrationRepo, JobRepo, Text2SqlRepo
- Service layer: AnalysisService, ModelService, TrainingService, OllamaService, SystemMonitor
- Schema layer: Pydantic models for all request/response types
- 16 routers migrated to DI pattern (no SQL in routers)
- Database migration system with SCHEMA_SQL
- 7 initial test files: health, alerts, upload, jobs, encryption, utils, auth
