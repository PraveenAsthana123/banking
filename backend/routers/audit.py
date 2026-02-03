"""Audit trail of all admin actions."""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from backend.core.dependencies import get_audit_repo
from backend.repositories.audit_repo import AuditRepo

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin/audit", tags=["audit"])


class AuditEntry(BaseModel):
    action: str
    detail: str = ""
    user: str = "admin"
    entry_type: str = "info"


@router.get("")
def get_audit_log(
    limit: int = Query(50, ge=1, le=500),
    entry_type: Optional[str] = Query(None),
    repo: AuditRepo = Depends(get_audit_repo),
):
    """Get audit trail entries."""
    return repo.list_recent(limit=limit, entry_type=entry_type)


@router.post("")
def add_audit_entry(entry: AuditEntry, repo: AuditRepo = Depends(get_audit_repo)):
    """Manually add an audit entry."""
    repo.log(entry.action, entry.detail, entry.user, entry.entry_type)
    return {"success": True}
