"""Request/response models for integration endpoints."""

from typing import Any, Dict

from pydantic import BaseModel


class IntegrationConfig(BaseModel):
    config: Dict[str, Any] = {}


class IntegrationTestResponse(BaseModel):
    success: bool
    latency: int
    message: str
