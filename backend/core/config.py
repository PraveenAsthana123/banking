"""Pydantic BaseSettings — single source of truth for all backend configuration."""

import os
import sys
from functools import lru_cache
from pathlib import Path
from typing import List, Optional, Set

from pydantic_settings import BaseSettings
from pydantic import Field, model_validator

# Ensure project root is on the path for importing root config utilities
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))


def _default_base_dir() -> Path:
    return Path(os.environ.get("BANKING_BASE_DIR", str(PROJECT_ROOT)))


class Settings(BaseSettings):
    """Application settings loaded from environment variables with BANKING_ prefix."""

    # Base paths
    base_dir: Path = Field(default_factory=_default_base_dir)

    # Ollama / LLM
    ollama_base_url: str = Field(default="http://localhost:11434")
    ollama_model: str = Field(default="llama3.2")

    # Processing
    sample_limit: int = Field(default=500_000)
    max_workers: int = Field(default=8)

    # Upload
    max_upload_size: int = Field(default=500 * 1024 * 1024)
    allowed_extensions: Set[str] = Field(default={".csv", ".json", ".xlsx", ".xls"})

    # Logging
    log_level: str = Field(default="INFO")

    # Rate limiting
    rate_limit: int = Field(default=100, description="Admin API requests per minute per IP")

    # CORS
    cors_origins: List[str] = Field(
        default=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"]
    )

    model_config = {
        "env_prefix": "BANKING_",
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }

    # Computed paths — not loaded from env directly, derived from base_dir
    @property
    def use_cases_dir(self) -> Path:
        return Path(os.environ.get("BANKING_USE_CASES_DIR", str(self.base_dir / "5_Star_UseCases")))

    @property
    def logs_dir(self) -> Path:
        p = Path(os.environ.get("BANKING_LOGS_DIR", str(self.base_dir / "logs")))
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def output_dir(self) -> Path:
        p = Path(os.environ.get("BANKING_OUTPUT_DIR", str(self.base_dir / "preprocessing_output")))
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def unified_db(self) -> Path:
        return Path(os.environ.get("BANKING_UNIFIED_DB", str(self.base_dir / "banking_unified.db")))

    @property
    def results_db(self) -> Path:
        return Path(os.environ.get("BANKING_RESULTS_DB", str(self.base_dir / "ml_pipeline_results.db")))

    @property
    def preprocessing_db(self) -> Path:
        return Path(os.environ.get("BANKING_PREPROCESSING_DB", str(self.base_dir / "preprocessing_results.db")))

    @property
    def rag_cache_db(self) -> Path:
        return Path(os.environ.get("BANKING_RAG_CACHE_DB", str(self.base_dir / "rag_cache.db")))

    @property
    def admin_db(self) -> Path:
        return Path(os.environ.get("BANKING_ADMIN_DB", str(self.base_dir / "admin.db")))

    @property
    def vector_store_dir(self) -> Path:
        p = Path(os.environ.get("BANKING_VECTOR_STORE_DIR", str(self.base_dir / "vector_store")))
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def upload_dir(self) -> Path:
        p = self.base_dir / "uploads"
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def model_dirs(self) -> List[Path]:
        return [self.base_dir / "models", self.base_dir / "data" / "models", self.output_dir]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Cached singleton settings instance."""
    return Settings()
