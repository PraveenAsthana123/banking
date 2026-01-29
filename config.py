#!/usr/bin/env python3
"""
Centralized Configuration for Banking ML Pipeline
All paths and settings should be configured here or via environment variables.
"""

import os
import re
import sqlite3
from pathlib import Path
from typing import Optional, Generator, List
from contextlib import contextmanager

# =============================================================================
# BASE PATHS (configurable via environment variables)
# =============================================================================

def _get_base_dir() -> Path:
    """Get base directory from env or use script location."""
    env_path = os.environ.get('BANKING_BASE_DIR')
    if env_path:
        return Path(env_path)
    # Default: directory containing this config file
    return Path(__file__).resolve().parent

BASE_DIR = _get_base_dir()
USE_CASES_DIR = Path(os.environ.get('BANKING_USE_CASES_DIR', BASE_DIR / '5_Star_UseCases'))
LOGS_DIR = Path(os.environ.get('BANKING_LOGS_DIR', BASE_DIR / 'logs'))
OUTPUT_DIR = Path(os.environ.get('BANKING_OUTPUT_DIR', BASE_DIR / 'preprocessing_output'))

# =============================================================================
# DATABASE PATHS
# =============================================================================

UNIFIED_DB = Path(os.environ.get('BANKING_UNIFIED_DB', BASE_DIR / 'banking_unified.db'))
RESULTS_DB = Path(os.environ.get('BANKING_RESULTS_DB', BASE_DIR / 'ml_pipeline_results.db'))
PREPROCESSING_DB = Path(os.environ.get('BANKING_PREPROCESSING_DB', BASE_DIR / 'preprocessing_results.db'))
RAG_CACHE_DB = Path(os.environ.get('BANKING_RAG_CACHE_DB', BASE_DIR / 'rag_cache.db'))
VECTOR_STORE_DIR = Path(os.environ.get('BANKING_VECTOR_STORE_DIR', BASE_DIR / 'vector_store'))

# =============================================================================
# MAPPING FILES
# =============================================================================

MAPPING_CSV = USE_CASES_DIR / 'enterprise_ai_mapping.csv'

# =============================================================================
# OLLAMA / LLM CONFIGURATION
# =============================================================================

OLLAMA_BASE_URL = os.environ.get('OLLAMA_BASE_URL', 'http://localhost:11434')
OLLAMA_MODEL = os.environ.get('OLLAMA_MODEL', 'llama3.2')

# =============================================================================
# PROCESSING LIMITS
# =============================================================================

SAMPLE_LIMIT = int(os.environ.get('SAMPLE_LIMIT', '500000'))
MAX_WORKERS = int(os.environ.get('MAX_WORKERS', '8'))

# =============================================================================
# LOGGING CONFIGURATION
# =============================================================================

LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'

def get_log_file(name: str) -> Path:
    """Get log file path for a given component."""
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    return LOGS_DIR / f'{name}.log'

# =============================================================================
# DATABASE UTILITIES
# =============================================================================

@contextmanager
def get_db_connection(db_path: Path, wal_mode: bool = True) -> Generator[sqlite3.Connection, None, None]:
    """
    Context manager for database connections with proper cleanup.

    Automatically commits on success, rolls back on exception,
    and always closes the connection.

    Args:
        db_path: Path to the SQLite database file
        wal_mode: Enable WAL mode for better concurrent access (default: True)

    Yields:
        sqlite3.Connection object

    Usage:
        with get_db_connection(RESULTS_DB) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM table")
    """
    conn = sqlite3.connect(str(db_path))
    try:
        if wal_mode:
            conn.execute("PRAGMA journal_mode=WAL")
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

# =============================================================================
# VALIDATION UTILITIES
# =============================================================================

def validate_use_case_key(uc_key: str) -> bool:
    """
    Validate use case key format to prevent SQL injection.

    Valid patterns: UC-XX-XX, uc_xx_xx, real_xxx, etc.
    Must start with a letter and contain only alphanumeric, underscore, or hyphen.
    Maximum length is 64 characters.

    Args:
        uc_key: Use case identifier to validate

    Returns:
        True if valid, False otherwise

    Examples:
        >>> validate_use_case_key('UC-FR-01')
        True
        >>> validate_use_case_key('uc_fraud_detection')
        True
        >>> validate_use_case_key('123_invalid')
        False
        >>> validate_use_case_key('DROP TABLE users;--')
        False
    """
    # Allow alphanumeric, underscores, and hyphens only
    pattern = r'^[a-zA-Z][a-zA-Z0-9_\-]*$'
    if not re.match(pattern, uc_key):
        return False
    # Max length check
    if len(uc_key) > 64:
        return False
    return True

def sanitize_table_name(name: str) -> str:
    """
    Sanitize table name for safe SQL usage.

    Args:
        name: Proposed table name

    Returns:
        Sanitized table name (same as input if valid)

    Raises:
        ValueError: If name contains characters other than alphanumeric and underscore
    """
    # Remove any characters that aren't alphanumeric or underscore
    sanitized = re.sub(r'[^a-zA-Z0-9_]', '_', name)
    if sanitized != name:
        raise ValueError(f"Invalid table name: {name}")
    return sanitized

# =============================================================================
# TRUST LEVEL SCORING (centralized to avoid duplication)
# =============================================================================

def get_trust_level(score: float) -> str:
    """
    Convert numeric score to trust level string.
    Centralized to avoid duplication across modules.
    """
    if score >= 85:
        return 'HIGH'
    elif score >= 70:
        return 'MEDIUM'
    elif score >= 60:
        return 'LOW'
    else:
        return 'CRITICAL'

# =============================================================================
# ENSURE DIRECTORIES EXIST
# =============================================================================

def ensure_directories():
    """Create all required directories if they don't exist."""
    for dir_path in [LOGS_DIR, OUTPUT_DIR, VECTOR_STORE_DIR]:
        dir_path.mkdir(parents=True, exist_ok=True)

# Auto-create directories on import
ensure_directories()
