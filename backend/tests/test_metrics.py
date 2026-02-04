"""Tests for /api/admin/metrics endpoints."""

import sqlite3

import pytest


@pytest.fixture()
def seed_results_db(tmp_path):
    """Create a minimal ml_pipeline_results.db with test data."""
    db_path = tmp_path / "results.db"
    conn = sqlite3.connect(str(db_path))
    conn.execute("CREATE TABLE model_results (id INTEGER PRIMARY KEY, use_case_key TEXT, accuracy REAL)")
    conn.execute("INSERT INTO model_results VALUES (1, 'uc_fr_01', 0.95)")
    conn.execute("INSERT INTO model_results VALUES (2, 'uc_cr_01', 0.88)")
    conn.commit()
    conn.close()
    return db_path


@pytest.fixture()
def seed_preprocessing_db(tmp_path):
    """Create a minimal preprocessing_results.db with test data."""
    db_path = tmp_path / "preproc.db"
    conn = sqlite3.connect(str(db_path))
    conn.execute("CREATE TABLE preprocessing_log (id INTEGER PRIMARY KEY, use_case TEXT, status TEXT)")
    conn.execute("INSERT INTO preprocessing_log VALUES (1, 'uc_fr_01', 'completed')")
    conn.commit()
    conn.close()
    return db_path


class TestGetMetrics:

    def test_metrics_no_db(self, client):
        resp = client.get("/api/admin/metrics")
        assert resp.status_code == 200
        data = resp.json()
        assert "message" in data or "metrics" in data

    def test_metrics_with_db(self, client, seed_results_db):
        resp = client.get("/api/admin/metrics")
        assert resp.status_code == 200
        data = resp.json()
        assert "tables" in data
        assert "metrics" in data

    def test_metrics_filter_by_use_case(self, client, seed_results_db):
        resp = client.get("/api/admin/metrics?use_case=uc_fr_01")
        assert resp.status_code == 200


class TestGetPreprocessingMetrics:

    def test_preprocessing_no_db(self, client):
        resp = client.get("/api/admin/metrics/preprocessing")
        assert resp.status_code == 200
        data = resp.json()
        assert "message" in data or "metrics" in data

    def test_preprocessing_with_db(self, client, seed_preprocessing_db):
        resp = client.get("/api/admin/metrics/preprocessing")
        assert resp.status_code == 200
        data = resp.json()
        assert "tables" in data
        assert "metrics" in data
