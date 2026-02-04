"""Request/response models for audit endpoints."""

from pydantic import BaseModel


class AuditEntry(BaseModel):
    action: str
    detail: str = ""
    user: str = "admin"
    entry_type: str = "info"
