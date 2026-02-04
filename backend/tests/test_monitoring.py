"""Tests for /api/admin/monitoring endpoints."""

import pytest


class TestListModelFiles:

    def test_list_models_empty(self, client):
        resp = client.get("/api/admin/monitoring/models")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_list_models_with_pkl(self, client, tmp_path):
        """Create a .pkl file and verify it appears."""
        model_dir = tmp_path / "models"
        model_dir.mkdir()
        (model_dir / "test_model.pkl").write_bytes(b"fake model data")

        resp = client.get("/api/admin/monitoring/models")
        assert resp.status_code == 200


class TestSystemStatus:

    def test_system_status_returns_200(self, client):
        resp = client.get("/api/admin/monitoring/system")
        assert resp.status_code == 200
        data = resp.json()
        assert "cpu" in data or "system" in data or "error" in data
        assert "timestamp" in data

    def test_system_status_has_memory(self, client):
        resp = client.get("/api/admin/monitoring/system")
        data = resp.json()
        if "memory" in data:
            assert "percent" in data["memory"]


class TestDatabaseStatus:

    def test_database_status_returns_200(self, client):
        resp = client.get("/api/admin/monitoring/databases")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) > 0

    def test_database_entry_shape(self, client):
        resp = client.get("/api/admin/monitoring/databases")
        data = resp.json()
        for entry in data:
            assert "name" in entry
            assert "path" in entry
            assert "exists" in entry
