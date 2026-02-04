"""Request/response models for export endpoints."""

from typing import List

from pydantic import BaseModel


class BatchExportRequest(BaseModel):
    uc_ids: List[str]
    format: str = "pdf"  # "pdf" or "excel"
