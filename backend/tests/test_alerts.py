"""CRUD tests for /api/admin/alerts endpoints."""

import pytest


class TestListAlerts:

    def test_list_empty(self, client):
        resp = client.get("/api/admin/alerts")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_list_returns_seeded_alert(self, client, seed_alert):
        resp = client.get("/api/admin/alerts")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == seed_alert
        assert data[0]["name"] == "Test Alert"


class TestCreateAlert:

    def test_create_valid(self, client):
        payload = {
            "name": "High Accuracy",
            "metric": "accuracy",
            "threshold": 0.95,
            "operator": ">",
            "severity": "critical",
        }
        resp = client.post("/api/admin/alerts", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert "id" in data
        assert data["id"] > 0

        # Verify it shows up in the list
        alerts = client.get("/api/admin/alerts").json()
        assert any(a["name"] == "High Accuracy" for a in alerts)

    def test_create_invalid_metric(self, client):
        payload = {
            "name": "Bad Metric",
            "metric": "nonexistent_metric",
            "threshold": 0.5,
        }
        resp = client.post("/api/admin/alerts", json=payload)
        assert resp.status_code == 400

    def test_create_invalid_operator(self, client):
        payload = {
            "name": "Bad Op",
            "metric": "accuracy",
            "threshold": 0.5,
            "operator": "LIKE",
        }
        resp = client.post("/api/admin/alerts", json=payload)
        assert resp.status_code == 400

    def test_create_invalid_severity(self, client):
        payload = {
            "name": "Bad Sev",
            "metric": "accuracy",
            "threshold": 0.5,
            "severity": "extreme",
        }
        resp = client.post("/api/admin/alerts", json=payload)
        assert resp.status_code == 400

    def test_create_missing_name(self, client):
        payload = {"metric": "accuracy", "threshold": 0.5}
        resp = client.post("/api/admin/alerts", json=payload)
        assert resp.status_code == 422  # pydantic validation

    def test_create_all_valid_metrics(self, client):
        """Ensure every documented metric is accepted."""
        valid_metrics = [
            "data_quality_score", "accuracy", "f1_score",
            "missing_pct", "drift_score", "latency_ms",
        ]
        for metric in valid_metrics:
            payload = {
                "name": f"Alert for {metric}",
                "metric": metric,
                "threshold": 0.5,
            }
            resp = client.post("/api/admin/alerts", json=payload)
            assert resp.status_code == 200, f"Metric '{metric}' should be valid"


class TestUpdateAlert:

    def test_update_name(self, client, seed_alert):
        resp = client.put(
            f"/api/admin/alerts/{seed_alert}",
            json={"name": "Renamed Alert"},
        )
        assert resp.status_code == 200

        alerts = client.get("/api/admin/alerts").json()
        updated = next(a for a in alerts if a["id"] == seed_alert)
        assert updated["name"] == "Renamed Alert"

    def test_update_threshold(self, client, seed_alert):
        resp = client.put(
            f"/api/admin/alerts/{seed_alert}",
            json={"threshold": 0.99},
        )
        assert resp.status_code == 200

    def test_update_nonexistent(self, client):
        resp = client.put("/api/admin/alerts/99999", json={"name": "Ghost"})
        assert resp.status_code == 404

    def test_update_invalid_metric(self, client, seed_alert):
        resp = client.put(
            f"/api/admin/alerts/{seed_alert}",
            json={"metric": "bogus"},
        )
        assert resp.status_code == 400

    def test_disable_alert(self, client, seed_alert):
        resp = client.put(
            f"/api/admin/alerts/{seed_alert}",
            json={"enabled": 0},
        )
        assert resp.status_code == 200
        alerts = client.get("/api/admin/alerts").json()
        alert = next(a for a in alerts if a["id"] == seed_alert)
        assert alert["enabled"] == 0


class TestDeleteAlert:

    def test_delete_existing(self, client, seed_alert):
        resp = client.delete(f"/api/admin/alerts/{seed_alert}")
        assert resp.status_code == 200

        alerts = client.get("/api/admin/alerts").json()
        assert len(alerts) == 0

    def test_delete_nonexistent(self, client):
        resp = client.delete("/api/admin/alerts/99999")
        assert resp.status_code == 404

    def test_delete_idempotent(self, client, seed_alert):
        """Deleting twice should return 404 on the second call."""
        client.delete(f"/api/admin/alerts/{seed_alert}")
        resp = client.delete(f"/api/admin/alerts/{seed_alert}")
        assert resp.status_code == 404


class TestCheckAlerts:

    def test_check_with_no_alerts(self, client):
        resp = client.post("/api/admin/alerts/check")
        assert resp.status_code == 200
        data = resp.json()
        assert data["triggered"] == []

    def test_check_with_alert_but_no_data(self, client, seed_alert):
        """Alert exists but no preprocessing_output data => nothing triggers."""
        resp = client.post("/api/admin/alerts/check")
        assert resp.status_code == 200
        data = resp.json()
        assert data["triggered_count"] == 0
