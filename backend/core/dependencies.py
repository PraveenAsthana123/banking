"""FastAPI Depends() factories for all shared dependencies.

Usage in routers:
    from backend.core.dependencies import get_settings, get_alert_repo
    @router.get("")
    def list_alerts(repo: AlertRepo = Depends(get_alert_repo)):
        ...
"""

from functools import lru_cache

from backend.core.config import Settings, get_settings as _get_settings


# ── Settings ─────────────────────────────────────────────────────────────────

def get_settings() -> Settings:
    """Cached settings dependency."""
    return _get_settings()


# ── Repositories (added in Phase 1) ─────────────────────────────────────────

def get_dataset_repo():
    from backend.repositories.dataset_repo import DatasetRepo
    return DatasetRepo(get_settings())


def get_alert_repo():
    from backend.repositories.alert_repo import AlertRepo
    return AlertRepo(get_settings())


def get_job_repo():
    from backend.repositories.job_repo import JobRepo
    return JobRepo(get_settings())


def get_integration_repo():
    from backend.repositories.integration_repo import IntegrationRepo
    return IntegrationRepo(get_settings())


def get_audit_repo():
    from backend.repositories.audit_repo import AuditRepo
    return AuditRepo(get_settings())


def get_text2sql_repo():
    from backend.repositories.text2sql_repo import Text2SqlRepo
    return Text2SqlRepo(get_settings())


# ── Services (added in Phase 3) ─────────────────────────────────────────────

def get_analysis_service():
    from backend.services.analysis import AnalysisService
    return AnalysisService(get_dataset_repo())


def get_model_service():
    from backend.services.model_service import ModelService
    return ModelService(get_settings())


def get_ollama_service():
    from backend.services.ollama_service import OllamaService
    settings = get_settings()
    return OllamaService(settings.ollama_base_url, settings.ollama_model)


def get_training_service():
    from backend.services.training_service import TrainingService
    return TrainingService(get_settings(), get_job_repo(), get_audit_repo())
