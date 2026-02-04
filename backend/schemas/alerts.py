"""Request/response models for alert endpoints."""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class AlertCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    metric: str
    threshold: float
    operator: str = ">"
    uc_id: str = "all"
    severity: str = "warning"


class AlertUpdate(BaseModel):
    name: Optional[str] = None
    metric: Optional[str] = None
    threshold: Optional[float] = None
    operator: Optional[str] = None
    uc_id: Optional[str] = None
    severity: Optional[str] = None
    enabled: Optional[int] = None


class AlertSummary(BaseModel):
    id: int
    name: str
    metric: str
    threshold: float
    operator: str
    uc_id: str
    severity: str
    enabled: int
    last_triggered: Optional[str] = None
    created_at: Optional[str] = None


class AlertCreateResponse(BaseModel):
    id: int
    message: str


class AlertCheckTriggered(BaseModel):
    alert_id: int
    alert_name: str
    uc_id: str
    metric: str
    current_value: float
    operator: str
    threshold: float
    severity: str
    triggered_at: str


class AlertCheckResponse(BaseModel):
    triggered: List[AlertCheckTriggered]
    total_alerts_checked: int
    total_use_cases_scanned: int
    triggered_count: int
    checked_at: str
