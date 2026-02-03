"""Custom exception taxonomy for the Banking ML platform.

All domain exceptions inherit from AppError. HTTP mapping is done in error_handlers.py.
Services and repositories raise these — never HTTPException.
"""


class AppError(Exception):
    """Base application error."""

    def __init__(self, message: str, detail: str = "") -> None:
        self.message = message
        self.detail = detail
        super().__init__(message)


class NotFoundError(AppError):
    """Resource not found."""


class ValidationError(AppError):
    """Request or business rule validation failure."""


class DataError(AppError):
    """Data loading, parsing, or quality issue."""


class ModelError(AppError):
    """Model loading, scoring, or training failure."""


class ExternalServiceError(AppError):
    """External service (Ollama, Redis, etc.) unavailable or failed."""
