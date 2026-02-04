"""Integration configuration management."""

import logging
import time
from datetime import datetime

from fastapi import APIRouter, Depends

from backend.core.dependencies import get_integration_repo, get_audit_repo
from backend.repositories.audit_repo import AuditRepo
from backend.repositories.integration_repo import IntegrationRepo
from backend.schemas.common import SuccessResponse
from backend.schemas.integrations import IntegrationConfig, IntegrationTestResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin/integrations", tags=["integrations"])


@router.get("")
def list_integrations(repo: IntegrationRepo = Depends(get_integration_repo)):
    """List all integrations with their config and UI metadata."""
    return repo.list_all()


@router.post("", response_model=SuccessResponse)
def save_integration(
    integration_id: str,
    body: IntegrationConfig,
    repo: IntegrationRepo = Depends(get_integration_repo),
    audit: AuditRepo = Depends(get_audit_repo),
):
    """Save/update integration configuration."""
    repo.upsert(integration_id, body.config)
    audit.log("integration_configured", f"Config saved for {integration_id}", entry_type="modify")
    return SuccessResponse(message=f"Configuration saved for {integration_id}")


@router.post("/{integration_id}/test", response_model=IntegrationTestResponse)
def test_connection(
    integration_id: str,
    repo: IntegrationRepo = Depends(get_integration_repo),
):
    """Test integration connection. Performs a real check where possible."""
    repo.ensure_seeded()
    config = repo.find_by_id(integration_id)

    success = False
    message = "Connection test not implemented for this integration type"
    start = time.time()

    if integration_id == "pg":
        try:
            import psycopg2
            conn = psycopg2.connect(
                host=config.get("host", "localhost"),
                port=int(config.get("port", 5432)),
                database=config.get("database", ""),
                user=config.get("username", ""),
                password=config.get("password", ""),
                connect_timeout=5,
            )
            conn.close()
            success = True
            message = "Connection successful"
        except ImportError:
            message = "psycopg2 not installed"
        except Exception as e:
            message = f"Connection failed: {e}"
    elif integration_id == "redis":
        try:
            import redis as redis_lib
            r = redis_lib.Redis(
                host=config.get("host", "localhost"),
                port=int(config.get("port", 6379)),
                password=config.get("password") or None,
                db=int(config.get("dbIndex", 0)),
                socket_timeout=5,
            )
            r.ping()
            r.close()
            success = True
            message = "Connection successful"
        except ImportError:
            message = "redis package not installed"
        except Exception as e:
            message = f"Connection failed: {e}"
    elif integration_id == "restapi":
        try:
            import requests
            url = config.get("baseUrl", "")
            if url:
                resp = requests.get(url, timeout=5)
                success = resp.status_code < 500
                message = f"HTTP {resp.status_code}"
            else:
                message = "No base URL configured"
        except Exception as e:
            message = f"Connection failed: {e}"
    else:
        if config:
            success = True
            message = "Configuration saved (connection test simulated)"
        else:
            message = "No configuration provided"

    latency = int((time.time() - start) * 1000)

    if success:
        repo.update_config(integration_id, "connected", datetime.now().isoformat())

    return {"success": success, "latency": latency, "message": message}
