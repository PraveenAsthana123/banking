"""Tests for /api/admin/upload — file upload with valid and invalid extensions."""

import io
import pytest


class TestFileUpload:

    def _csv_bytes(self, content: str = "a,b,c\n1,2,3\n4,5,6\n") -> io.BytesIO:
        return io.BytesIO(content.encode("utf-8"))

    def test_upload_csv(self, client, tmp_path):
        files = {"file": ("test_data.csv", self._csv_bytes(), "text/csv")}
        resp = client.post("/api/admin/upload", files=files)
        assert resp.status_code == 200
        data = resp.json()
        assert data["rows"] == 2
        assert data["cols"] == 3
        assert data["name"] == "test_data"
        assert data["filename"] == "test_data.csv"
        assert "id" in data

    def test_upload_returns_column_info(self, client):
        csv = "name,age,score\nAlice,30,95.5\nBob,25,88.0\n"
        files = {"file": ("people.csv", io.BytesIO(csv.encode()), "text/csv")}
        resp = client.post("/api/admin/upload", files=files)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["columns"]) == 3
        col_names = [c["name"] for c in data["columns"]]
        assert "name" in col_names
        assert "age" in col_names
        assert "score" in col_names

    def test_upload_json(self, client):
        content = b'[{"x":1,"y":2},{"x":3,"y":4}]'
        files = {"file": ("data.json", io.BytesIO(content), "application/json")}
        resp = client.post("/api/admin/upload", files=files)
        assert resp.status_code == 200
        data = resp.json()
        assert data["rows"] == 2
        assert data["cols"] == 2

    def test_upload_invalid_extension_txt(self, client):
        files = {"file": ("readme.txt", io.BytesIO(b"hello"), "text/plain")}
        resp = client.post("/api/admin/upload", files=files)
        assert resp.status_code == 400

    def test_upload_invalid_extension_py(self, client):
        files = {"file": ("script.py", io.BytesIO(b"print('hi')"), "text/plain")}
        resp = client.post("/api/admin/upload", files=files)
        assert resp.status_code == 400

    def test_upload_invalid_extension_exe(self, client):
        files = {"file": ("malware.exe", io.BytesIO(b"\x00\x01"), "application/octet-stream")}
        resp = client.post("/api/admin/upload", files=files)
        assert resp.status_code == 400

    def test_upload_no_file(self, client):
        resp = client.post("/api/admin/upload")
        assert resp.status_code == 422  # FastAPI validation error

    def test_upload_malformed_csv(self, client):
        """A CSV that pandas can still parse (just oddly)."""
        files = {"file": ("bad.csv", io.BytesIO(b"a\n1\n2\n"), "text/csv")}
        resp = client.post("/api/admin/upload", files=files)
        assert resp.status_code == 200
        data = resp.json()
        assert data["cols"] == 1

    def test_uploaded_file_appears_in_datasets(self, client):
        files = {"file": ("listing_test.csv", self._csv_bytes(), "text/csv")}
        client.post("/api/admin/upload", files=files)

        resp = client.get("/api/admin/datasets")
        assert resp.status_code == 200
        datasets = resp.json()
        assert len(datasets) >= 1
        assert any(d["name"] == "listing_test" for d in datasets)

    def test_delete_dataset(self, client):
        files = {"file": ("to_delete.csv", self._csv_bytes(), "text/csv")}
        upload_resp = client.post("/api/admin/upload", files=files)
        ds_id = upload_resp.json()["id"]

        del_resp = client.delete(f"/api/admin/datasets/{ds_id}")
        assert del_resp.status_code == 200

        # Verify it is gone
        datasets = client.get("/api/admin/datasets").json()
        assert not any(d["id"] == ds_id for d in datasets)
