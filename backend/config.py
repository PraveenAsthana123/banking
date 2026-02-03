"""Backend-specific configuration, extending the root config."""

import sys
from pathlib import Path

# Add project root to path so we can import the root config
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from config import (
    BASE_DIR,
    UNIFIED_DB,
    RESULTS_DB,
    PREPROCESSING_DB,
    RAG_CACHE_DB,
    VECTOR_STORE_DIR,
    USE_CASES_DIR,
    LOGS_DIR,
    OUTPUT_DIR,
    OLLAMA_BASE_URL,
    OLLAMA_MODEL,
    SAMPLE_LIMIT,
    MAX_WORKERS,
    LOG_LEVEL,
    LOG_FORMAT,
    get_db_connection,
    get_log_file,
    validate_use_case_key,
    sanitize_table_name,
    get_trust_level,
)

# Upload configuration
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MAX_UPLOAD_SIZE = 500 * 1024 * 1024  # 500 MB
ALLOWED_EXTENSIONS = {".csv", ".json", ".xlsx", ".xls"}

# Admin database for backend-managed tables
ADMIN_DB = BASE_DIR / "admin.db"

# Model directories to scan
MODEL_DIRS = [
    BASE_DIR / "models",
    BASE_DIR / "data" / "models",
    OUTPUT_DIR,
]
