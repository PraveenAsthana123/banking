"""Tests for /api/admin/jobs endpoints — list and cancel."""

import sqlite3
import pytest


class TestListJobs:

    def test_list_empty(self, client):
        resp = client.get("/api/admin/jobs")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_list_returns_seeded_job(self, client, seed_job):
        resp = client.get("/api/admin/jobs")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == seed_job
        assert data[0]["status"] == "queued"
        assert data[0]["job_type"] == "training"

    def test_list_multiple_jobs(self, client, init_db):
        conn = sqlite3.connect(str(init_db))
        for jtype in ("training", "scoring", "preprocessing"):
            conn.execute(
                "INSERT INTO jobs (job_type, status, progress, config_json, created_at) "
                "VALUES (?, 'queued', 0, '{}', datetime('now'))",
                (jtype,),
            )
        conn.commit()
        conn.close()

        resp = client.get("/api/admin/jobs")
        assert resp.status_code == 200
        assert len(resp.json()) == 3

    def test_job_fields(self, client, seed_job):
        data = client.get("/api/admin/jobs").json()[0]
        expected_fields = {"id", "job_type", "status", "progress", "error_message",
                           "started_at", "completed_at", "created_at"}
        assert expected_fields.issubset(set(data.keys()))


class TestCancelJob:

    def test_cancel_queued_job(self, client, seed_job):
        resp = client.post(f"/api/admin/jobs/{seed_job}/cancel")
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True

        # Verify status changed
        jobs = client.get("/api/admin/jobs").json()
        job = next(j for j in jobs if j["id"] == seed_job)
        assert job["status"] == "cancelled"

    def test_cancel_running_job(self, client, init_db):
        conn = sqlite3.connect(str(init_db))
        cursor = conn.execute(
            "INSERT INTO jobs (job_type, status, progress, config_json, created_at) "
            "VALUES ('training', 'running', 50, '{}', datetime('now'))"
        )
        job_id = cursor.lastrowid
        conn.commit()
        conn.close()

        resp = client.post(f"/api/admin/jobs/{job_id}/cancel")
        assert resp.status_code == 200

    def test_cancel_completed_job_fails(self, client, init_db):
        conn = sqlite3.connect(str(init_db))
        cursor = conn.execute(
            "INSERT INTO jobs (job_type, status, progress, config_json, created_at) "
            "VALUES ('training', 'completed', 100, '{}', datetime('now'))"
        )
        job_id = cursor.lastrowid
        conn.commit()
        conn.close()

        resp = client.post(f"/api/admin/jobs/{job_id}/cancel")
        assert resp.status_code == 400

    def test_cancel_nonexistent_job(self, client):
        resp = client.post("/api/admin/jobs/99999/cancel")
        assert resp.status_code == 404

    def test_cancel_already_cancelled_job(self, client, seed_job):
        # Cancel once
        client.post(f"/api/admin/jobs/{seed_job}/cancel")
        # Cancel again should fail (status is 'cancelled', not queued/running)
        resp = client.post(f"/api/admin/jobs/{seed_job}/cancel")
        assert resp.status_code == 400
