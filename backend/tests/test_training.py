"""Tests for /api/admin/training endpoints."""

import sqlite3
from unittest.mock import patch

import pytest


class TestStartTraining:

    @patch("backend.routers.training.threading.Thread")
    def test_start_valid_training(self, mock_thread, client):
        """Start training with valid request — thread is mocked."""
        mock_thread.return_value.start.return_value = None
        payload = {
            "dataset_id": 1,
            "target_column": "is_fraud",
            "algorithm": "random_forest",
            "test_size": 0.2,
            "hyperparams": {},
        }
        resp = client.post("/api/admin/training/start", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert "job_id" in data
        assert data["status"] == "queued"
        assert data["message"] == "Training job started"

    def test_start_invalid_algorithm(self, client):
        payload = {
            "dataset_id": 1,
            "target_column": "label",
            "algorithm": "invalid_algo",
        }
        resp = client.post("/api/admin/training/start", json=payload)
        assert resp.status_code == 400

    def test_start_missing_required_field(self, client):
        payload = {"algorithm": "random_forest"}
        resp = client.post("/api/admin/training/start", json=payload)
        assert resp.status_code == 422

    @patch("backend.routers.training.threading.Thread")
    def test_start_logistic_regression(self, mock_thread, client):
        mock_thread.return_value.start.return_value = None
        payload = {
            "dataset_id": 1,
            "target_column": "target",
            "algorithm": "logistic_regression",
        }
        resp = client.post("/api/admin/training/start", json=payload)
        assert resp.status_code == 200

    @patch("backend.routers.training.threading.Thread")
    def test_start_gradient_boosting(self, mock_thread, client):
        mock_thread.return_value.start.return_value = None
        payload = {
            "dataset_id": 1,
            "target_column": "target",
            "algorithm": "gradient_boosting",
        }
        resp = client.post("/api/admin/training/start", json=payload)
        assert resp.status_code == 200


class TestListTrainingJobs:

    def test_list_empty(self, client):
        resp = client.get("/api/admin/training/jobs")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_list_with_job(self, client, seed_job):
        resp = client.get("/api/admin/training/jobs")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 1


class TestGetTrainingJob:

    def test_get_existing_job(self, client, seed_job):
        resp = client.get(f"/api/admin/training/jobs/{seed_job}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == seed_job
        assert "config" in data
        assert "result" in data

    def test_get_nonexistent_job(self, client):
        resp = client.get("/api/admin/training/jobs/99999")
        assert resp.status_code == 404
