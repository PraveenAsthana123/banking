"""Tests for public health / info endpoints: /api/health, /api/departments, /api/stats."""

import pytest


class TestHealthEndpoint:
    """GET /api/health"""

    def test_health_returns_200(self, client):
        resp = client.get("/api/health")
        assert resp.status_code == 200

    def test_health_has_status_healthy(self, client):
        data = client.get("/api/health").json()
        assert data["status"] == "healthy"

    def test_health_has_timestamp(self, client):
        data = client.get("/api/health").json()
        assert "timestamp" in data
        # ISO-format timestamp should contain 'T' or '-'
        assert "-" in data["timestamp"]


class TestDepartmentsEndpoint:
    """GET /api/departments"""

    def test_departments_returns_list(self, client):
        resp = client.get("/api/departments")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) > 0

    def test_department_has_required_fields(self, client):
        data = client.get("/api/departments").json()
        dept = data[0]
        for field in ("id", "name", "icon", "color", "description"):
            assert field in dept, f"Missing field: {field}"

    def test_known_departments_present(self, client):
        data = client.get("/api/departments").json()
        ids = {d["id"] for d in data}
        assert "risk" in ids
        assert "fraud" in ids
        assert "credit" in ids

    def test_get_single_department(self, client):
        resp = client.get("/api/departments/risk")
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == "risk"
        assert data["name"] == "Risk Management"

    def test_get_unknown_department(self, client):
        resp = client.get("/api/departments/nonexistent")
        assert resp.status_code == 200
        data = resp.json()
        assert "error" in data


class TestStatsEndpoint:
    """GET /api/stats"""

    def test_stats_returns_200(self, client):
        resp = client.get("/api/stats")
        assert resp.status_code == 200

    def test_stats_has_required_keys(self, client):
        data = client.get("/api/stats").json()
        for key in ("total_use_cases", "total_pipelines", "departments", "active_models"):
            assert key in data, f"Missing key: {key}"

    def test_stats_departments_count_matches(self, client):
        stats = client.get("/api/stats").json()
        depts = client.get("/api/departments").json()
        assert stats["departments"] == len(depts)

    def test_stats_values_are_non_negative(self, client):
        data = client.get("/api/stats").json()
        for key, val in data.items():
            assert isinstance(val, int)
            assert val >= 0, f"{key} should be >= 0, got {val}"
