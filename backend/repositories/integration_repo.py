"""Repository for the integrations table."""

import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from backend.core.config import Settings
from backend.core.exceptions import NotFoundError
from backend.repositories.base import SQLiteRepository

logger = logging.getLogger(__name__)

# Default integration definitions (UI metadata)
INTEGRATION_DEFS = [
    {"id": "pg", "name": "PostgreSQL", "icon": "database", "color": "#336791", "desc": "Primary relational database",
     "fields": [{"key": "host", "label": "Host", "type": "text", "placeholder": "localhost"}, {"key": "port", "label": "Port", "type": "text", "placeholder": "5432"}, {"key": "database", "label": "Database", "type": "text", "placeholder": "banking_ml"}, {"key": "username", "label": "Username", "type": "text", "placeholder": "admin"}, {"key": "password", "label": "Password", "type": "password", "placeholder": ""}, {"key": "ssl", "label": "SSL", "type": "select", "options": ["Enabled", "Disabled"]}]},
    {"id": "mysql", "name": "MySQL", "icon": "database", "color": "#4479A1", "desc": "Legacy transaction database",
     "fields": [{"key": "host", "label": "Host", "type": "text", "placeholder": "db.internal"}, {"key": "port", "label": "Port", "type": "text", "placeholder": "3306"}, {"key": "database", "label": "Database", "type": "text", "placeholder": "transactions"}, {"key": "username", "label": "Username", "type": "text", "placeholder": "root"}, {"key": "password", "label": "Password", "type": "password", "placeholder": ""}]},
    {"id": "mongo", "name": "MongoDB", "icon": "database", "color": "#47A248", "desc": "Document store for unstructured data",
     "fields": [{"key": "uri", "label": "Connection URI", "type": "text", "placeholder": "mongodb://..."}, {"key": "database", "label": "Database", "type": "text", "placeholder": "banking_docs"}, {"key": "collection", "label": "Collection", "type": "text", "placeholder": "documents"}]},
    {"id": "redis", "name": "Redis", "icon": "server", "color": "#DC382D", "desc": "In-memory cache & message broker",
     "fields": [{"key": "host", "label": "Host", "type": "text", "placeholder": "redis.internal"}, {"key": "port", "label": "Port", "type": "text", "placeholder": "6379"}, {"key": "password", "label": "Password", "type": "password", "placeholder": ""}, {"key": "dbIndex", "label": "DB Index", "type": "text", "placeholder": "0"}]},
    {"id": "snowflake", "name": "Snowflake", "icon": "cloud", "color": "#29B5E8", "desc": "Cloud data warehouse",
     "fields": [{"key": "account", "label": "Account", "type": "text", "placeholder": "org-account"}, {"key": "warehouse", "label": "Warehouse", "type": "text", "placeholder": "COMPUTE_WH"}, {"key": "database", "label": "Database", "type": "text", "placeholder": "BANKING"}, {"key": "schema", "label": "Schema", "type": "text", "placeholder": "PUBLIC"}, {"key": "user", "label": "User", "type": "text", "placeholder": ""}, {"key": "password", "label": "Password", "type": "password", "placeholder": ""}]},
    {"id": "whatsapp", "name": "WhatsApp Business", "icon": "message-square", "color": "#25D366", "desc": "Customer messaging channel",
     "fields": [{"key": "apiKey", "label": "API Key", "type": "password", "placeholder": ""}, {"key": "phoneId", "label": "Phone Number ID", "type": "text", "placeholder": ""}, {"key": "businessId", "label": "Business Account ID", "type": "text", "placeholder": ""}]},
    {"id": "gmail", "name": "Gmail", "icon": "mail", "color": "#EA4335", "desc": "Email integration for alerts",
     "fields": [{"key": "clientId", "label": "OAuth Client ID", "type": "text", "placeholder": ""}, {"key": "clientSecret", "label": "Client Secret", "type": "password", "placeholder": ""}, {"key": "redirectUri", "label": "Redirect URI", "type": "text", "placeholder": "https://..."}]},
    {"id": "gdrive", "name": "Google Drive", "icon": "cloud", "color": "#4285F4", "desc": "Document storage & sharing",
     "fields": [{"key": "clientId", "label": "OAuth Client ID", "type": "text", "placeholder": ""}, {"key": "clientSecret", "label": "Client Secret", "type": "password", "placeholder": ""}, {"key": "folderId", "label": "Folder ID", "type": "text", "placeholder": ""}]},
    {"id": "dropbox", "name": "Dropbox", "icon": "cloud", "color": "#0061FF", "desc": "Cloud file storage",
     "fields": [{"key": "appKey", "label": "App Key", "type": "text", "placeholder": ""}, {"key": "appSecret", "label": "App Secret", "type": "password", "placeholder": ""}, {"key": "accessToken", "label": "Access Token", "type": "password", "placeholder": ""}]},
    {"id": "slack", "name": "Slack", "icon": "message-square", "color": "#4A154B", "desc": "Team notifications & alerts",
     "fields": [{"key": "botToken", "label": "Bot Token", "type": "password", "placeholder": "xoxb-..."}, {"key": "signingSecret", "label": "Signing Secret", "type": "password", "placeholder": ""}, {"key": "channel", "label": "Channel", "type": "text", "placeholder": "#ml-alerts"}]},
    {"id": "restapi", "name": "REST API", "icon": "globe", "color": "#6366F1", "desc": "External API integration",
     "fields": [{"key": "baseUrl", "label": "Base URL", "type": "text", "placeholder": "https://api.example.com"}, {"key": "authType", "label": "Auth Type", "type": "select", "options": ["Bearer Token", "API Key", "Basic Auth"]}, {"key": "headers", "label": "Custom Headers (JSON)", "type": "text", "placeholder": '{"X-Custom": "value"}'}]},
    {"id": "s3", "name": "S3 / MinIO", "icon": "server", "color": "#FF9900", "desc": "Object storage for models & data",
     "fields": [{"key": "endpoint", "label": "Endpoint", "type": "text", "placeholder": "s3.amazonaws.com"}, {"key": "bucket", "label": "Bucket", "type": "text", "placeholder": "banking-ml-models"}, {"key": "accessKey", "label": "Access Key", "type": "text", "placeholder": ""}, {"key": "secretKey", "label": "Secret Key", "type": "password", "placeholder": ""}, {"key": "region", "label": "Region", "type": "text", "placeholder": "us-east-1"}]},
]

DEFS_BY_ID: Dict[str, Dict[str, Any]] = {d["id"]: d for d in INTEGRATION_DEFS}


class IntegrationRepo(SQLiteRepository):

    def ensure_seeded(self) -> None:
        with self._connect() as conn:
            existing = {r["id"] for r in conn.execute("SELECT id FROM integrations").fetchall()}
            for d in INTEGRATION_DEFS:
                if d["id"] not in existing:
                    conn.execute(
                        "INSERT INTO integrations (id, name, status) VALUES (?, ?, 'disconnected')",
                        (d["id"], d["name"]),
                    )

    def list_all(self) -> List[Dict[str, Any]]:
        self.ensure_seeded()
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT id, name, config_json, status, last_sync, updated_at FROM integrations ORDER BY name"
            ).fetchall()
        result = []
        for r in rows:
            defn = DEFS_BY_ID.get(r["id"], {})
            result.append({
                **defn,
                "id": r["id"], "name": r["name"], "status": r["status"],
                "lastSync": r["last_sync"] or "Never",
                "config": json.loads(r["config_json"] or "{}"),
                "records": 0, "errors": 0,
            })
        return result

    def find_by_id(self, integration_id: str) -> Dict[str, Any]:
        with self._connect() as conn:
            row = conn.execute("SELECT config_json FROM integrations WHERE id=?", (integration_id,)).fetchone()
        if not row:
            raise NotFoundError(f"Integration {integration_id} not found")
        return json.loads(row["config_json"] or "{}")

    def upsert(self, integration_id: str, config: Dict[str, Any]) -> None:
        self.ensure_seeded()
        with self._connect() as conn:
            conn.execute(
                "UPDATE integrations SET config_json=?, updated_at=? WHERE id=?",
                (json.dumps(config), datetime.now().isoformat(), integration_id),
            )

    def update_config(self, integration_id: str, status: str, last_sync: Optional[str] = None) -> None:
        with self._connect() as conn:
            if last_sync:
                conn.execute(
                    "UPDATE integrations SET status=?, last_sync=? WHERE id=?",
                    (status, last_sync, integration_id),
                )
            else:
                conn.execute("UPDATE integrations SET status=? WHERE id=?", (status, integration_id))
