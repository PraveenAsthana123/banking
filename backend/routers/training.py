"""Model training endpoints — start training, list/view jobs."""

import json
import logging
import threading
from typing import Any, Dict

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from backend.core.dependencies import get_job_repo, get_audit_repo, get_training_service
from backend.core.exceptions import NotFoundError, ValidationError
from backend.repositories.audit_repo import AuditRepo
from backend.repositories.job_repo import JobRepo
from backend.services.training_service import TrainingService, ALGO_MAP

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin/training", tags=["training"])


class TrainingRequest(BaseModel):
    dataset_id: int
    target_column: str
    algorithm: str = "random_forest"
    test_size: float = 0.2
    hyperparams: Dict[str, Any] = {}


@router.post("/start")
def start_training(
    req: TrainingRequest,
    repo: JobRepo = Depends(get_job_repo),
    audit: AuditRepo = Depends(get_audit_repo),
    training_svc: TrainingService = Depends(get_training_service),
):
    """Start a model training job in the background."""
    if req.algorithm not in ALGO_MAP:
        raise ValidationError(f"Unsupported algorithm. Choose from: {list(ALGO_MAP.keys())}")

    job_id = repo.create("training", req.model_dump())
    audit.log("training_started", f"Job {job_id}: {req.algorithm} on dataset {req.dataset_id}", entry_type="create")

    thread = threading.Thread(
        target=training_svc.run_training,
        args=(job_id, req.dataset_id, req.target_column, req.algorithm, req.test_size, req.hyperparams),
        daemon=True,
    )
    thread.start()

    return {"job_id": job_id, "status": "queued", "message": "Training job started"}


@router.get("/jobs")
def list_training_jobs(repo: JobRepo = Depends(get_job_repo)):
    """List training jobs."""
    return repo.list_by_type("training")


@router.get("/jobs/{job_id}")
def get_training_job(job_id: int, repo: JobRepo = Depends(get_job_repo)):
    """Get training job details including metrics."""
    row = repo.find_by_id_and_type(job_id, "training")
    if not row:
        raise NotFoundError("Training job not found")
    result = dict(row)
    result["config"] = json.loads(result.pop("config_json", "{}") or "{}")
    result["result"] = json.loads(result.pop("result_json", "{}") or "{}")
    return result
