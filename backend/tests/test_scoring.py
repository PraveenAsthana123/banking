"""Tests for /api/admin/scoring endpoints."""

import pytest


class TestListModels:

    def test_list_models_empty(self, client):
        """No .pkl files on disk => empty list."""
        resp = client.get("/api/admin/scoring/models")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


class TestScoreRecord:

    def test_score_missing_model(self, client):
        payload = {
            "model_path": "/nonexistent/model.pkl",
            "features": {"amount": 100, "age": 30},
        }
        resp = client.post("/api/admin/scoring/score", json=payload)
        assert resp.status_code == 404

    def test_score_missing_fields(self, client):
        resp = client.post("/api/admin/scoring/score", json={})
        assert resp.status_code == 422


class TestBatchScore:

    def test_batch_missing_fields(self, client):
        resp = client.post("/api/admin/scoring/batch", json={})
        assert resp.status_code == 422

    def test_batch_invalid_dataset(self, client):
        payload = {
            "model_path": "/nonexistent/model.pkl",
            "dataset_id": 99999,
        }
        resp = client.post("/api/admin/scoring/batch", json=payload)
        # Should fail because dataset doesn't exist
        assert resp.status_code in (404, 500)
