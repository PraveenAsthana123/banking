"""Request middleware — correlation ID, security headers, rate limiting."""

import logging
import time
import uuid
from collections import defaultdict
from typing import Dict, List, Tuple

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response, JSONResponse

logger = logging.getLogger(__name__)


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """Inject X-Correlation-ID on every request/response.

    If the client sends the header, it is preserved; otherwise a new UUID is generated.
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        correlation_id = request.headers.get("X-Correlation-ID") or str(uuid.uuid4())
        request.state.correlation_id = correlation_id
        response = await call_next(request)
        response.headers["X-Correlation-ID"] = correlation_id
        return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to every response."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Per-IP rate limiting on API endpoints.

    Default: 100 requests/minute for /api/admin/* endpoints.
    Returns 429 Too Many Requests with Retry-After header when exceeded.
    """

    def __init__(self, app, requests_per_minute: int = 100) -> None:
        super().__init__(app)
        self._rpm = requests_per_minute
        self._window = 60.0  # seconds
        self._requests: Dict[str, List[float]] = defaultdict(list)

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        path = request.url.path
        if not path.startswith("/api/admin"):
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        cutoff = now - self._window

        # Prune old entries
        timestamps = self._requests[client_ip]
        self._requests[client_ip] = [t for t in timestamps if t > cutoff]

        if len(self._requests[client_ip]) >= self._rpm:
            retry_after = int(self._window - (now - self._requests[client_ip][0]))
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests", "error_code": "RATE_LIMITED"},
                headers={"Retry-After": str(max(retry_after, 1))},
            )

        self._requests[client_ip].append(now)
        return await call_next(request)
