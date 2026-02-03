"""Request/response models for alert endpoints."""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class AlertCreate(BaseModel):
    name: str
    alert_type: str
    metric: str
    threshold: float
    condition: str = "above"
    severity: str = "warning"
    enabled: bool = True
    webhook_url: str = ""
    email: str = ""


class AlertUpdate(BaseModel):
    name: Optional[str] = None
    alert_type: Optional[str] = None
    metric: Optional[str] = None
    threshold: Optional[float] = None
    condition: Optional[str] = None
    severity: Optional[str] = None
    enabled: Optional[bool] = None
    webhook_url: Optional[str] = None
    email: Optional[str] = None


class AlertSummary(BaseModel):
    id: int
    name: str
    alert_type: str
    metric: str
    threshold: float
    condition: str
    severity: str
    enabled: bool
    last_triggered: Optional[str] = None
    created_at: str
