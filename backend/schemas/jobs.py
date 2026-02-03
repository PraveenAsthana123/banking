"""Request/response models for job endpoints."""

from typing import Any, Dict, Optional

from pydantic import BaseModel


class JobSummary(BaseModel):
    id: int
    job_type: str
    status: str
    progress: int
    error_message: Optional[str] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    created_at: str


class JobCancelResponse(BaseModel):
    success: bool = True
    message: str
