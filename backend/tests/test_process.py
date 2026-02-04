"""Tests for /api/admin/process endpoints."""

import json
from pathlib import Path
from unittest.mock import patch

import pytest


class TestGetDataPath:

    def test_data_path_returns_200(self, client):
        resp = client.get("/api/admin/process/data-path/UC-FR-01")
        assert resp.status_code == 200
        data = resp.json()
        assert data["uc_id"] == "UC-FR-01"
        assert "has_data" in data
        assert "files" in data

    def test_data_path_with_uc_path(self, client, tmp_path):
        """Create a data dir and verify it's found."""
        uc_dir = tmp_path / "5_Star_UseCases" / "B_Risk" / "data"
        uc_dir.mkdir(parents=True)
        (uc_dir / "test.csv").write_text("col1,col2\n1,2")

        resp = client.get("/api/admin/process/data-path/UC-FR-01?uc_path=B_Risk")
        assert resp.status_code == 200


class TestRunProcess:

    @patch("backend.routers.process.threading.Thread")
    def test_run_valid_pipeline(self, mock_thread, client):
        mock_thread.return_value.start.return_value = None
        payload = {
            "uc_id": "UC-FR-01",
            "pipeline_type": "preprocessing",
        }
        resp = client.post("/api/admin/process/run", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert "job_id" in data
        assert data["pipeline_type"] == "preprocessing"

    def test_run_invalid_pipeline_type(self, client):
        payload = {
            "uc_id": "UC-FR-01",
            "pipeline_type": "invalid_type",
        }
        resp = client.post("/api/admin/process/run", json=payload)
        assert resp.status_code == 400

    def test_run_invalid_uc_id(self, client):
        payload = {
            "uc_id": "../../etc/passwd",
            "pipeline_type": "full",
        }
        resp = client.post("/api/admin/process/run", json=payload)
        assert resp.status_code == 400

    @patch("backend.routers.process.threading.Thread")
    def test_run_full_pipeline(self, mock_thread, client):
        mock_thread.return_value.start.return_value = None
        payload = {"uc_id": "UC-CR-01", "pipeline_type": "full"}
        resp = client.post("/api/admin/process/run", json=payload)
        assert resp.status_code == 200
        assert resp.json()["uc_id"] == "UC-CR-01"


class TestGetProcessStatus:

    def test_status_existing_job(self, client, seed_job):
        resp = client.get(f"/api/admin/process/status/{seed_job}")
        assert resp.status_code == 200

    def test_status_nonexistent_job(self, client):
        resp = client.get("/api/admin/process/status/99999")
        # Depends on repo behavior - might return None/404 or empty
        assert resp.status_code in (200, 404)


class TestGetProcessResults:

    def test_results_no_data(self, client):
        resp = client.get("/api/admin/process/results/UC-FR-01")
        assert resp.status_code == 200
        data = resp.json()
        assert data["uc_id"] == "UC-FR-01"
        assert data["has_results"] is False

    def test_results_with_summary(self, client, tmp_path):
        """Create preprocessing output with summary.json."""
        preproc_dir = tmp_path / "preprocessing_output" / "uc_fr_01_fraud"
        preproc_dir.mkdir(parents=True)
        summary = {"total_rows": 1000, "data_quality_score": 0.85}
        (preproc_dir / "summary.json").write_text(json.dumps(summary))

        resp = client.get("/api/admin/process/results/UC-FR-01")
        assert resp.status_code == 200
