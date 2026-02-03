"""Shared response models used across multiple routers."""

from pydantic import BaseModel


class SuccessResponse(BaseModel):
    success: bool = True
    message: str = ""


class ErrorResponse(BaseModel):
    detail: str
