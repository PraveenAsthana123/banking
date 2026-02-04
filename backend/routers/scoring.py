"""Model scoring endpoints — list models, score single/batch."""

import logging

from fastapi import APIRouter, Depends

from backend.core.dependencies import get_model_service, get_analysis_service
from backend.services.analysis import AnalysisService
from backend.services.model_service import ModelService
from backend.schemas.scoring import ScoreRequest, BatchScoreRequest

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin/scoring", tags=["scoring"])


@router.get("/models")
def list_models(svc: ModelService = Depends(get_model_service)):
    """List .pkl models from disk."""
    return svc.get_available_models()


@router.post("/score")
def score_record(req: ScoreRequest, svc: ModelService = Depends(get_model_service)):
    """Score a single record — returns probability + SHAP if available."""
    return svc.score_single(req.model_path, req.features)


@router.post("/batch")
def batch_score(
    req: BatchScoreRequest,
    model_svc: ModelService = Depends(get_model_service),
    analysis_svc: AnalysisService = Depends(get_analysis_service),
):
    """Batch-score an uploaded dataset."""
    df = analysis_svc.load_dataset_df(req.dataset_id)
    return model_svc.score_batch(req.model_path, df, req.target_column)
