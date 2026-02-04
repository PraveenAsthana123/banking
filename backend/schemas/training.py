"""Request/response models for training endpoints."""

from typing import Any, Dict

from pydantic import BaseModel


class TrainingRequest(BaseModel):
    dataset_id: int
    target_column: str
    algorithm: str = "random_forest"
    test_size: float = 0.2
    hyperparams: Dict[str, Any] = {}


class TrainingStartResponse(BaseModel):
    job_id: int
    status: str
    message: str
