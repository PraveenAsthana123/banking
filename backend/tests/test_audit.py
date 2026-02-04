"""Tests for /api/admin/audit endpoints."""

import sqlite3

import pytest


@pytest.fixture()
def seed_audit(init_db):
    """Insert sample audit log entries."""
    conn = sqlite3.connect(str(init_db))
    conn.execute(
        "INSERT INTO audit_log (action, detail, user, entry_type, created_at) VALUES (?, ?, ?, ?, datetime('now'))",
        ("test_action", "test detail", "admin", "info"),
    )
    conn.execute(
        "INSERT INTO audit_log (action, detail, user, entry_type, created_at) VALUES (?, ?, ?, ?, datetime('now'))",
        ("alert_created", "Created alert X", "system", "create"),
    )
    conn.commit()
    conn.close()


class TestGetAuditLog:

    def test_list_empty(self, client):
        resp = client.get("/api/admin/audit")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_list_returns_entries(self, client, seed_audit):
        resp = client.get("/api/admin/audit")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 2

    def test_limit_parameter(self, client, seed_audit):
        resp = client.get("/api/admin/audit?limit=1")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) <= 1

    def test_filter_by_entry_type(self, client, seed_audit):
        resp = client.get("/api/admin/audit?entry_type=create")
        assert resp.status_code == 200
        data = resp.json()
        assert all(e.get("entry_type") == "create" for e in data)

    def test_filter_by_entry_type_no_match(self, client, seed_audit):
        resp = client.get("/api/admin/audit?entry_type=delete")
        assert resp.status_code == 200
        assert resp.json() == []


class TestAddAuditEntry:

    def test_add_valid_entry(self, client):
        payload = {"action": "manual_test", "detail": "Testing audit", "user": "admin", "entry_type": "info"}
        resp = client.post("/api/admin/audit", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True

    def test_add_entry_appears_in_log(self, client):
        payload = {"action": "tracked_action", "detail": "Should appear in log"}
        resp = client.post("/api/admin/audit", json=payload)
        assert resp.status_code == 200

        log = client.get("/api/admin/audit").json()
        assert any(e["action"] == "tracked_action" for e in log)

    def test_add_entry_default_fields(self, client):
        payload = {"action": "minimal_entry"}
        resp = client.post("/api/admin/audit", json=payload)
        assert resp.status_code == 200

    def test_add_entry_missing_action(self, client):
        payload = {"detail": "no action field"}
        resp = client.post("/api/admin/audit", json=payload)
        assert resp.status_code == 422
