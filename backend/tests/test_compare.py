"""Tests for /api/admin/compare endpoints."""

import json
from pathlib import Path

import pytest


class TestPortfolioRanking:

    def test_portfolio_empty(self, client):
        resp = client.get("/api/admin/compare/portfolio")
        assert resp.status_code == 200
        data = resp.json()
        assert "portfolio" in data or "total" in data

    def test_portfolio_with_sort(self, client):
        resp = client.get("/api/admin/compare/portfolio?sort_by=data_quality_score")
        assert resp.status_code == 200


class TestSideBySide:

    def test_side_by_side_empty(self, client):
        resp = client.post(
            "/api/admin/compare/side-by-side",
            json={"uc_ids": ["UC-FR-01", "UC-CR-01"]},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "use_cases" in data or "compared" in data or "not_found" in data

    def test_side_by_side_single(self, client):
        resp = client.post(
            "/api/admin/compare/side-by-side",
            json={"uc_ids": ["UC-FR-01"]},
        )
        assert resp.status_code == 200

    def test_side_by_side_missing_body(self, client):
        resp = client.post("/api/admin/compare/side-by-side", json={})
        assert resp.status_code == 422


class TestDepartmentSummary:

    def test_department_summary(self, client):
        resp = client.get("/api/admin/compare/department-summary")
        assert resp.status_code == 200
        data = resp.json()
        assert "departments" in data or "total_departments" in data


class TestBusinessCase:

    def test_business_case_no_data(self, client):
        resp = client.get("/api/admin/compare/business-case/UC-FR-01")
        assert resp.status_code in (200, 404)

    def test_business_case_with_summary(self, client, tmp_path):
        """Create a summary.json for a use case — dir name must match uc_id exactly."""
        preproc_dir = tmp_path / "preprocessing_output" / "UC-FR-01"
        preproc_dir.mkdir(parents=True)
        summary = {
            "total_rows": 10000,
            "data_quality_score": 0.9,
            "domain": "fraud",
            "accuracy": 0.95,
        }
        (preproc_dir / "summary.json").write_text(json.dumps(summary))

        resp = client.get("/api/admin/compare/business-case/UC-FR-01")
        assert resp.status_code == 200
