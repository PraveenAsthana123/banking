"""Request/response models for compare endpoints."""

from typing import List

from pydantic import BaseModel


class SideBySideRequest(BaseModel):
    uc_ids: List[str]
