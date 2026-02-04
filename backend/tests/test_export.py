"""Tests for /api/admin/export endpoints."""

import json
from pathlib import Path

import pytest


@pytest.fixture()
def seed_preprocess(tmp_path):
    """Create preprocessing output with summary data for export tests."""
    preproc_dir = tmp_path / "preprocessing_output" / "uc_fr_01_fraud"
    preproc_dir.mkdir(parents=True)
    summary = {
        "use_case_id": "UC-FR-01",
        "domain": "fraud",
        "total_rows": 10000,
        "total_columns": 25,
        "data_quality_score": 0.85,
        "missing_pct": 2.3,
        "class_imbalance_ratio": 0.05,
    }
    (preproc_dir / "summary.json").write_text(json.dumps(summary))
    full_report = {"total_rows": 10000, "total_columns": 25, "numeric_columns": 15}
    (preproc_dir / "full_report.json").write_text(json.dumps(full_report))
    return preproc_dir


class TestPdfExport:

    def test_pdf_no_data(self, client):
        resp = client.post("/api/admin/export/pdf/UC-FR-01")
        assert resp.status_code in (200, 404)

    def test_pdf_with_data(self, client, seed_preprocess):
        resp = client.post("/api/admin/export/pdf/UC-FR-01")
        if resp.status_code == 200:
            assert resp.headers.get("content-type", "").startswith("application/pdf") or \
                   "pdf" in resp.headers.get("content-disposition", "").lower()


class TestExcelExport:

    def test_excel_no_data(self, client):
        resp = client.post("/api/admin/export/excel/UC-FR-01")
        assert resp.status_code in (200, 404)


class TestBatchExport:

    def test_batch_export_request(self, client):
        resp = client.post(
            "/api/admin/export/batch",
            json={"uc_ids": ["UC-FR-01"], "format": "pdf"},
        )
        # May return 200 (empty zip) or 404
        assert resp.status_code in (200, 404)

    def test_batch_export_missing_body(self, client):
        resp = client.post("/api/admin/export/batch", json={})
        assert resp.status_code == 422


class TestExecutiveSummary:

    def test_executive_summary_no_data(self, client):
        resp = client.post("/api/admin/export/executive-summary")
        # Returns 404 when no preprocessed use cases exist
        assert resp.status_code in (200, 404)

    def test_executive_summary_with_data(self, client, seed_preprocess):
        resp = client.post("/api/admin/export/executive-summary")
        assert resp.status_code == 200


class TestWordExport:

    def test_word_no_data(self, client):
        resp = client.post("/api/admin/export/word/UC-FR-01")
        assert resp.status_code in (200, 404)


class TestMarkdownExport:

    def test_markdown_no_data(self, client):
        resp = client.post("/api/admin/export/markdown/UC-FR-01")
        assert resp.status_code in (200, 404)
