"""Request/response models for scoring endpoints."""

from typing import Any, Dict, Optional

from pydantic import BaseModel


class ScoreRequest(BaseModel):
    model_path: str
    features: Dict[str, Any]


class BatchScoreRequest(BaseModel):
    model_path: str
    dataset_id: int
    target_column: Optional[str] = None
