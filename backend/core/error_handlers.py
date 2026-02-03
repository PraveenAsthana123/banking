"""Global exception handlers — maps AppError subclasses to HTTP status codes.

Preserves {"detail": ...} shape for frontend compatibility.
"""

import logging
from typing import Callable, Dict, Type

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from backend.core.exceptions import (
    AppError,
    DataError,
    ExternalServiceError,
    ModelError,
    NotFoundError,
    ValidationError,
)

logger = logging.getLogger(__name__)

# Map exception type -> HTTP status code
_STATUS_MAP: Dict[Type[AppError], int] = {
    NotFoundError: 404,
    ValidationError: 400,
    DataError: 422,
    ModelError: 500,
    ExternalServiceError: 502,
}


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    """Handle all AppError subclasses with consistent JSON envelope."""
    status = _STATUS_MAP.get(type(exc), 500)
    body = {"detail": exc.message}
    if exc.detail:
        body["info"] = exc.detail
    if status >= 500:
        logger.error("%s: %s", type(exc).__name__, exc.message)
    else:
        logger.warning("%s: %s", type(exc).__name__, exc.message)
    return JSONResponse(status_code=status, content=body)


def register_error_handlers(app: FastAPI) -> None:
    """Register the global AppError handler on the FastAPI app."""
    app.add_exception_handler(AppError, app_error_handler)
