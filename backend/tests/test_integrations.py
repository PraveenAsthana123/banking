"""Tests for /api/admin/integrations endpoints."""

import pytest


class TestListIntegrations:

    def test_list_returns_200(self, client):
        resp = client.get("/api/admin/integrations")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


class TestSaveIntegration:

    def test_save_config(self, client):
        resp = client.post(
            "/api/admin/integrations?integration_id=pg",
            json={"config": {"host": "localhost", "port": 5432, "database": "testdb"}},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True

    def test_save_empty_config(self, client):
        resp = client.post(
            "/api/admin/integrations?integration_id=redis",
            json={"config": {}},
        )
        assert resp.status_code == 200


class TestTestConnection:

    def test_simulated_connection(self, client):
        """Non-pg/redis/restapi integrations get a simulated test."""
        # First save some config so the simulated test succeeds
        client.post(
            "/api/admin/integrations?integration_id=snowflake",
            json={"config": {"account": "test", "warehouse": "wh"}},
        )
        resp = client.post("/api/admin/integrations/snowflake/test")
        assert resp.status_code == 200
        data = resp.json()
        assert "success" in data
        assert "latency" in data
        assert "message" in data

    def test_connection_response_shape(self, client):
        resp = client.post("/api/admin/integrations/pg/test")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data["latency"], int)
        assert isinstance(data["message"], str)
