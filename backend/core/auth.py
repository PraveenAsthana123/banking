"""API key authentication middleware for admin endpoints.

Usage:
    Set BANKING_API_KEY in environment or .env to require authentication.
    If not set, auth is disabled (development mode).

    Clients send:  Authorization: Bearer <api-key>
    Or header:     X-API-Key: <api-key>
"""

import logging
import os
from typing import Optional

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import JSONResponse, Response

logger = logging.getLogger(__name__)

# Paths that never require auth
PUBLIC_PATHS = frozenset({"/api/health", "/docs", "/openapi.json", "/redoc"})


class ApiKeyMiddleware(BaseHTTPMiddleware):
    """Validate API key on admin endpoints when BANKING_API_KEY is configured."""

    def __init__(self, app, api_key: Optional[str] = None):
        super().__init__(app)
        self._api_key = api_key or os.environ.get("BANKING_API_KEY")
        if self._api_key:
            logger.info("API key authentication ENABLED for admin endpoints")
        else:
            logger.info("API key authentication DISABLED (set BANKING_API_KEY to enable)")

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        if not self._api_key:
            return await call_next(request)

        path = request.url.path
        if path in PUBLIC_PATHS or not path.startswith("/api/admin"):
            return await call_next(request)

        # Check Authorization: Bearer <key> or X-API-Key header
        token = None
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
        if not token:
            token = request.headers.get("X-API-Key")

        if token != self._api_key:
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid or missing API key"},
            )

        return await call_next(request)
