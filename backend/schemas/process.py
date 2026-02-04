"""Request/response models for process endpoints."""

from pydantic import BaseModel


class ProcessRunRequest(BaseModel):
    uc_id: str
    uc_path: str = ""
    pipeline_type: str = "full"  # full, preprocessing, training, scoring
    data_file: str = ""  # specific file to process


class ProcessRunResponse(BaseModel):
    success: bool
    job_id: int
    uc_id: str
    pipeline_type: str
    message: str
