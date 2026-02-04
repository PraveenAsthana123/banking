"""Tests for /api/admin/logs endpoints."""

from pathlib import Path

import pytest


@pytest.fixture()
def seed_log_files(tmp_path):
    """Create log files for testing."""
    logs_dir = tmp_path / "logs"
    logs_dir.mkdir(exist_ok=True)

    log_content = (
        "2026-01-28 10:00:00 - backend.main - INFO - Server started\n"
        "2026-01-28 10:00:01 - backend.routers.alerts - WARNING - Alert threshold exceeded\n"
        "2026-01-28 10:00:02 - backend.services.training - ERROR - Training failed: OOM\n"
        "2026-01-28 10:00:03 - backend.core.auth - DEBUG - Auth check passed\n"
    )
    (logs_dir / "app.log").write_text(log_content)
    (logs_dir / "error.log").write_text("2026-01-28 10:00:02 - backend - ERROR - Something broke\n")
    return logs_dir


class TestGetLogs:

    def test_logs_no_directory(self, client):
        resp = client.get("/api/admin/logs")
        assert resp.status_code == 200
        data = resp.json()
        assert "entries" in data

    def test_logs_with_files(self, client, seed_log_files):
        resp = client.get("/api/admin/logs")
        assert resp.status_code == 200
        data = resp.json()
        assert "entries" in data
        assert "files" in data
        assert len(data["files"]) >= 1

    def test_logs_specific_file(self, client, seed_log_files):
        resp = client.get("/api/admin/logs?file=error.log")
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("current_file") == "error.log"

    def test_logs_filter_by_level(self, client, seed_log_files):
        resp = client.get("/api/admin/logs?level=error")
        assert resp.status_code == 200
        data = resp.json()
        for entry in data["entries"]:
            assert entry["level"] == "error"

    def test_logs_search_text(self, client, seed_log_files):
        resp = client.get("/api/admin/logs?file=app.log&search=training")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["entries"]) >= 1

    def test_logs_limit(self, client, seed_log_files):
        resp = client.get("/api/admin/logs?limit=1")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["entries"]) <= 1

    def test_logs_path_traversal_guard(self, client, seed_log_files):
        resp = client.get("/api/admin/logs?file=../../etc/passwd")
        assert resp.status_code == 200
        data = resp.json()
        assert data["entries"] == []
        assert "Invalid" in data.get("message", "")

    def test_logs_nonexistent_file(self, client, seed_log_files):
        resp = client.get("/api/admin/logs?file=nonexistent.log")
        assert resp.status_code == 200
        data = resp.json()
        assert data["entries"] == []


class TestListLogFiles:

    def test_list_no_logs(self, client):
        resp = client.get("/api/admin/logs/files")
        assert resp.status_code == 200

    def test_list_with_files(self, client, seed_log_files):
        resp = client.get("/api/admin/logs/files")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) >= 2
        for f in data:
            assert "name" in f
            assert "size" in f
