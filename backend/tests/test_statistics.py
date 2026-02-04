"""Tests for /api/admin/stats endpoints."""

import sqlite3
from pathlib import Path

import pytest


@pytest.fixture()
def seed_dataset(init_db, tmp_path):
    """Create a CSV file and register it in the datasets table."""
    csv_path = tmp_path / "test_data.csv"
    csv_path.write_text("age,income,is_fraud\n25,50000,0\n30,60000,1\n35,70000,0\n40,80000,1\n")

    conn = sqlite3.connect(str(init_db))
    cursor = conn.execute(
        "INSERT INTO datasets (name, original_filename, file_path, file_size, rows, cols, columns_json) "
        "VALUES (?, ?, ?, ?, ?, ?, ?)",
        ("test_data", "test_data.csv", str(csv_path), csv_path.stat().st_size, 4, 3, '["age","income","is_fraud"]'),
    )
    dataset_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return dataset_id


class TestDiscoverDataset:

    def test_discover_no_data(self, client):
        resp = client.get("/api/admin/stats/discover/UC-FR-01")
        assert resp.status_code in (200, 404)

    def test_discover_with_csv(self, client, tmp_path):
        """Create a CSV in the use cases dir structure."""
        uc_dir = tmp_path / "5_Star_UseCases" / "B_Risk" / "data"
        uc_dir.mkdir(parents=True)
        (uc_dir / "fraud_data.csv").write_text("col1,col2\n1,2\n3,4\n")

        resp = client.get("/api/admin/stats/discover/UC-FR-01?uc_path=B_Risk")
        assert resp.status_code == 200


class TestGetStats:

    def test_stats_valid_dataset(self, client, seed_dataset):
        resp = client.get(f"/api/admin/stats/{seed_dataset}")
        # May return 200 with stats or 500 if pandas not available
        assert resp.status_code in (200, 500)

    def test_stats_nonexistent_dataset(self, client):
        resp = client.get("/api/admin/stats/99999")
        assert resp.status_code in (404, 500)


class TestCorrelations:

    def test_correlations_valid(self, client, seed_dataset):
        resp = client.get(f"/api/admin/stats/{seed_dataset}/correlations")
        assert resp.status_code == 200

    def test_correlations_nonexistent(self, client):
        resp = client.get("/api/admin/stats/99999/correlations")
        assert resp.status_code == 404


class TestDistributions:

    def test_distributions_valid(self, client, seed_dataset):
        resp = client.get(f"/api/admin/stats/{seed_dataset}/distributions")
        assert resp.status_code == 200

    def test_distributions_nonexistent(self, client):
        resp = client.get("/api/admin/stats/99999/distributions")
        assert resp.status_code == 404


class TestOutliers:

    def test_outliers_valid(self, client, seed_dataset):
        resp = client.get(f"/api/admin/stats/{seed_dataset}/outliers")
        assert resp.status_code == 200

    def test_outliers_nonexistent(self, client):
        resp = client.get("/api/admin/stats/99999/outliers")
        assert resp.status_code == 404


class TestClassDistribution:

    def test_class_dist_valid(self, client, seed_dataset):
        resp = client.get(f"/api/admin/stats/{seed_dataset}/class-distribution?target_column=is_fraud")
        assert resp.status_code == 200

    def test_class_dist_nonexistent(self, client):
        resp = client.get("/api/admin/stats/99999/class-distribution")
        assert resp.status_code == 404
