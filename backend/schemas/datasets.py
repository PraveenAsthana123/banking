"""Request/response models for dataset endpoints."""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class DatasetSummary(BaseModel):
    id: int
    name: str
    filename: str
    size: int
    rows: int
    cols: int
    created_at: str


class DatasetDetail(BaseModel):
    id: int
    name: str
    filename: str
    file_path: str
    size: int
    rows: int
    cols: int
    columns: List[str]
    created_at: str


class DatasetUploadResponse(BaseModel):
    id: int
    name: str
    filename: str
    size: int
    rows: int
    cols: int


class DatasetDeleteResponse(BaseModel):
    success: bool = True
    message: str
