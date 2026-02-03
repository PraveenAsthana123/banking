"""Shared utility functions — deduplicated from multiple modules."""

import re

# Strict pattern: alphanumeric, hyphens, underscores only (e.g. UC-FR-01, uc_fr_01)
_UC_KEY_RE = re.compile(r"^[A-Za-z0-9_\-]{1,120}$")


def human_size(nbytes: int) -> str:
    """Convert bytes to human-readable format (B, KB, MB, GB, TB, PB)."""
    for unit in ("B", "KB", "MB", "GB", "TB"):
        if abs(nbytes) < 1024:
            return f"{nbytes:.1f} {unit}"
        nbytes /= 1024
    return f"{nbytes:.1f} PB"


def validate_use_case_key(uc_key: str) -> bool:
    """Return True if uc_key is safe to pass to subprocess / use in file paths."""
    return bool(_UC_KEY_RE.match(uc_key))


def sanitize_table_name(name: str) -> str:
    """Strip anything that isn't alphanumeric or underscore from a table name."""
    return re.sub(r"[^A-Za-z0-9_]", "", name)
