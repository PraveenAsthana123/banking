"""Tests for ApiKeyMiddleware authentication.

When BANKING_API_KEY is set, admin endpoints require the key.
Public endpoints (/api/health) remain open.

Because the middleware reads os.environ at __init__ time, and the main app
is a module-level singleton, we construct a *fresh* mini FastAPI app for the
auth-enabled tests so the middleware picks up the key via its constructor arg.
"""

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.core.auth import ApiKeyMiddleware

API_KEY = "test-key-123"


def _build_app_with_auth(api_key: str | None = None) -> FastAPI:
    """Build a minimal FastAPI app that mirrors the real routing, with auth middleware."""
    from backend.core.error_handlers import register_error_handlers
    from backend.core.middleware import CorrelationIdMiddleware
    from backend.routers import alerts as alerts_router

    app = FastAPI(title="Auth-Test App")

    # Middleware stack (order matters: outermost first)
    app.add_middleware(CorrelationIdMiddleware)
    app.add_middleware(ApiKeyMiddleware, api_key=api_key)

    register_error_handlers(app)

    # Mount only the routers we need for testing
    app.include_router(alerts_router.router)

    # Public endpoints
    @app.get("/api/health")
    def health():
        return {"status": "healthy"}

    @app.get("/api/departments")
    def departments():
        return [{"id": "risk"}]

    return app


@pytest.fixture()
def auth_client(init_db):
    """TestClient with API key authentication ENABLED."""
    app = _build_app_with_auth(api_key=API_KEY)
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c


@pytest.fixture()
def noauth_client(init_db):
    """TestClient with API key authentication DISABLED (key=None)."""
    app = _build_app_with_auth(api_key=None)
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c


class TestAuthDisabled:
    """When BANKING_API_KEY is not set, all endpoints are open."""

    def test_health_no_key(self, noauth_client):
        resp = noauth_client.get("/api/health")
        assert resp.status_code == 200

    def test_admin_endpoint_no_key_required(self, noauth_client):
        resp = noauth_client.get("/api/admin/alerts")
        assert resp.status_code == 200


class TestAuthEnabled:
    """When BANKING_API_KEY is set, admin endpoints require authentication."""

    def test_health_still_public(self, auth_client):
        resp = auth_client.get("/api/health")
        assert resp.status_code == 200

    def test_departments_still_public(self, auth_client):
        """Non-admin /api/ endpoints should not require auth."""
        resp = auth_client.get("/api/departments")
        assert resp.status_code == 200

    def test_admin_without_key_returns_401(self, auth_client):
        resp = auth_client.get("/api/admin/alerts")
        assert resp.status_code == 401
        assert "detail" in resp.json()

    def test_admin_with_bearer_token(self, auth_client):
        resp = auth_client.get(
            "/api/admin/alerts",
            headers={"Authorization": f"Bearer {API_KEY}"},
        )
        assert resp.status_code == 200

    def test_admin_with_x_api_key_header(self, auth_client):
        resp = auth_client.get(
            "/api/admin/alerts",
            headers={"X-API-Key": API_KEY},
        )
        assert resp.status_code == 200

    def test_admin_with_wrong_key_returns_401(self, auth_client):
        resp = auth_client.get(
            "/api/admin/alerts",
            headers={"Authorization": "Bearer wrong-key"},
        )
        assert resp.status_code == 401

    def test_admin_with_empty_bearer_returns_401(self, auth_client):
        resp = auth_client.get(
            "/api/admin/alerts",
            headers={"Authorization": "Bearer "},
        )
        assert resp.status_code == 401

    def test_admin_post_without_key_returns_401(self, auth_client):
        payload = {
            "name": "Auth test",
            "metric": "accuracy",
            "threshold": 0.5,
        }
        resp = auth_client.post("/api/admin/alerts", json=payload)
        assert resp.status_code == 401

    def test_admin_post_with_key_succeeds(self, auth_client):
        payload = {
            "name": "Auth test",
            "metric": "accuracy",
            "threshold": 0.5,
        }
        resp = auth_client.post(
            "/api/admin/alerts",
            json=payload,
            headers={"Authorization": f"Bearer {API_KEY}"},
        )
        assert resp.status_code == 200

    def test_admin_delete_without_key_returns_401(self, auth_client):
        resp = auth_client.delete("/api/admin/alerts/1")
        assert resp.status_code == 401

    def test_admin_put_without_key_returns_401(self, auth_client):
        resp = auth_client.put("/api/admin/alerts/1", json={"name": "x"})
        assert resp.status_code == 401

    def test_401_response_body_has_detail(self, auth_client):
        resp = auth_client.get("/api/admin/alerts")
        assert resp.status_code == 401
        body = resp.json()
        assert body["detail"] == "Invalid or missing API key"
