"""Tests for /api/admin/text2sql endpoints."""

import sqlite3

import pytest


@pytest.fixture()
def unified_db(tmp_path):
    """Create a minimal unified DB for text2sql tests."""
    db_path = tmp_path / "unified.db"
    conn = sqlite3.connect(str(db_path))
    conn.execute("CREATE TABLE transactions (id INTEGER PRIMARY KEY, amount REAL, is_fraud INTEGER)")
    conn.execute("INSERT INTO transactions VALUES (1, 100.50, 0)")
    conn.execute("INSERT INTO transactions VALUES (2, 9999.99, 1)")
    conn.commit()
    conn.close()
    return db_path


class TestGetSchema:

    def test_schema_no_db(self, client):
        resp = client.get("/api/admin/text2sql/schema")
        assert resp.status_code == 200
        data = resp.json()
        assert data["tables"] == [] or "message" in data

    def test_schema_with_db(self, client, unified_db):
        resp = client.get("/api/admin/text2sql/schema")
        assert resp.status_code == 200
        data = resp.json()
        assert "tables" in data
        if data["tables"]:
            table = data["tables"][0]
            assert "table" in table
            assert "columns" in table


class TestExecuteSql:

    def test_execute_select(self, client, unified_db):
        resp = client.post(
            "/api/admin/text2sql/execute",
            json={"sql": "SELECT * FROM transactions"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "columns" in data
        assert "rows" in data
        assert data["row_count"] == 2

    def test_execute_reject_insert(self, client, unified_db):
        resp = client.post(
            "/api/admin/text2sql/execute",
            json={"sql": "INSERT INTO transactions VALUES (3, 50, 0)"},
        )
        assert resp.status_code == 400

    def test_execute_reject_drop(self, client, unified_db):
        resp = client.post(
            "/api/admin/text2sql/execute",
            json={"sql": "DROP TABLE transactions"},
        )
        assert resp.status_code == 400

    def test_execute_reject_delete(self, client, unified_db):
        resp = client.post(
            "/api/admin/text2sql/execute",
            json={"sql": "DELETE FROM transactions WHERE id=1"},
        )
        assert resp.status_code == 400

    def test_execute_no_db(self, client):
        resp = client.post(
            "/api/admin/text2sql/execute",
            json={"sql": "SELECT 1"},
        )
        assert resp.status_code == 404

    def test_execute_invalid_sql(self, client, unified_db):
        resp = client.post(
            "/api/admin/text2sql/execute",
            json={"sql": "SELECT * FROM nonexistent_table"},
        )
        assert resp.status_code == 400

    def test_execute_with_limit(self, client, unified_db):
        resp = client.post(
            "/api/admin/text2sql/execute",
            json={"sql": "SELECT * FROM transactions LIMIT 1"},
        )
        assert resp.status_code == 200
        assert resp.json()["row_count"] == 1


class TestQueryHistory:

    def test_history_empty(self, client):
        resp = client.get("/api/admin/text2sql/history")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)
