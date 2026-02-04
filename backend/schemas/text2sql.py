"""Request/response models for text2sql endpoints."""

from pydantic import BaseModel


class GenerateRequest(BaseModel):
    natural_language: str


class ExecuteRequest(BaseModel):
    sql: str
