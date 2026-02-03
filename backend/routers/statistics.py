"""Real EDA and statistics on uploaded datasets."""

import json
import logging
from pathlib import Path

from fastapi import APIRouter, Depends

import pandas as pd

from backend.core.config import Settings
from backend.core.dependencies import get_settings, get_dataset_repo, get_analysis_service
from backend.core.exceptions import NotFoundError
from backend.repositories.dataset_repo import DatasetRepo
from backend.services.analysis import (
    AnalysisService,
    compute_class_distribution,
    compute_correlations,
    compute_distributions,
    compute_feature_engineering,
    compute_outliers,
    compute_summary_stats,
)
from backend.services.advanced_analysis import (
    compute_stability_analysis,
    compute_leakage_analysis,
    compute_fraud_taxonomy,
    compute_false_positive_analysis,
    compute_action_effectiveness,
    compute_segment_performance,
    compute_drift_adversarial,
    compute_calibration_analysis,
    compute_reject_inference,
    compute_data_quality_analysis,
    compute_explainability_analysis,
    compute_fairness_analysis,
    compute_cost_threshold_analysis,
    compute_hitl_analysis,
    compute_failure_mode_analysis,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin/stats", tags=["statistics"])


@router.get("/discover/{uc_id}")
def discover_dataset(
    uc_id: str,
    uc_path: str = "",
    settings: Settings = Depends(get_settings),
    repo: DatasetRepo = Depends(get_dataset_repo),
):
    """Find CSV for a use case, register in datasets table, return dataset_id."""
    csv_path = None

    if uc_path:
        star_dir = settings.use_cases_dir / uc_path
        data_sub = star_dir / "data"
        if data_sub.exists():
            csvs = list(data_sub.glob("*.csv"))
            if csvs:
                csv_path = csvs[0]

    if not csv_path:
        for match in settings.use_cases_dir.rglob(f"*{uc_id}*/csv/*.csv"):
            csv_path = match
            break

    if not csv_path:
        uc_clean = uc_id.replace("-", "_").lower()
        for match in settings.use_cases_dir.rglob(f"*{uc_clean}*.csv"):
            csv_path = match
            break

    if not csv_path:
        for match in settings.use_cases_dir.rglob(f"*{uc_id}*/*unified*.csv"):
            csv_path = match
            break

    if not csv_path:
        raise NotFoundError(f"No CSV dataset found for use case {uc_id}")

    csv_path = csv_path.resolve()
    file_path_str = str(csv_path)

    existing = repo.find_by_file_path(file_path_str)
    if existing:
        return {"dataset_id": existing["id"], "file_path": file_path_str, "uc_id": uc_id}

    try:
        df = pd.read_csv(csv_path, nrows=0)
        cols = list(df.columns)
        with open(csv_path, "r") as fh:
            row_count = sum(1 for _ in fh) - 1
    except Exception:
        cols = []
        row_count = 0

    dataset_id = repo.create(
        name=f"{uc_id} Dataset",
        original_filename=csv_path.name,
        file_path=file_path_str,
        file_size=csv_path.stat().st_size,
        rows=row_count,
        cols=len(cols),
        columns_json=json.dumps(cols),
    )

    return {"dataset_id": dataset_id, "file_path": file_path_str, "uc_id": uc_id}


@router.get("/{dataset_id}")
def get_stats(dataset_id: int, svc: AnalysisService = Depends(get_analysis_service)):
    """Full EDA: describe(), dtypes, missing%, skewness, kurtosis."""
    df = svc.load_dataset_df(dataset_id)
    return compute_summary_stats(df)


@router.get("/{dataset_id}/correlations")
def get_correlations(dataset_id: int, svc: AnalysisService = Depends(get_analysis_service)):
    """Pearson + Spearman correlation matrices."""
    df = svc.load_dataset_df(dataset_id)
    return compute_correlations(df)


@router.get("/{dataset_id}/distributions")
def get_distributions(dataset_id: int, svc: AnalysisService = Depends(get_analysis_service)):
    """Histogram data per numeric column."""
    df = svc.load_dataset_df(dataset_id)
    return compute_distributions(df)


@router.get("/{dataset_id}/outliers")
def get_outliers(dataset_id: int, svc: AnalysisService = Depends(get_analysis_service)):
    """IQR + Z-score outlier detection."""
    df = svc.load_dataset_df(dataset_id)
    return compute_outliers(df)


@router.get("/{dataset_id}/class-distribution")
def get_class_distribution(dataset_id: int, target_column: str = None, svc: AnalysisService = Depends(get_analysis_service)):
    """Analyze class distribution and imbalance for a target column."""
    df = svc.load_dataset_df(dataset_id)
    return compute_class_distribution(df, target_column)


@router.get("/{dataset_id}/feature-engineering")
def get_feature_engineering(dataset_id: int, target_column: str = None, svc: AnalysisService = Depends(get_analysis_service)):
    """Generate and analyze engineered features."""
    df = svc.load_dataset_df(dataset_id)
    return compute_feature_engineering(df, target_column)


# ═══════════════════════════════════════════════════════════════════════════════
# Advanced Bank-Grade Analyses (15 critical analyses)
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/{dataset_id}/stability")
def get_stability(dataset_id: int, target_column: str = None, svc: AnalysisService = Depends(get_analysis_service)):
    """PSI/CSI per feature, score stability by segment."""
    df = svc.load_dataset_df(dataset_id)
    return compute_stability_analysis(df, target_column)


@router.get("/{dataset_id}/leakage")
def get_leakage(dataset_id: int, target_column: str = None, svc: AnalysisService = Depends(get_analysis_service)):
    """Detect temporal, label, and operational leakage."""
    df = svc.load_dataset_df(dataset_id)
    return compute_leakage_analysis(df, target_column)


@router.get("/{dataset_id}/fraud-taxonomy")
def get_fraud_taxonomy(dataset_id: int, target_column: str = None, svc: AnalysisService = Depends(get_analysis_service)):
    """Fraud type coverage analysis."""
    df = svc.load_dataset_df(dataset_id)
    return compute_fraud_taxonomy(df, target_column)


@router.get("/{dataset_id}/false-positives")
def get_false_positives(dataset_id: int, target_column: str = None, svc: AnalysisService = Depends(get_analysis_service)):
    """False positive root cause analysis."""
    df = svc.load_dataset_df(dataset_id)
    return compute_false_positive_analysis(df, target_column)


@router.get("/{dataset_id}/action-effectiveness")
def get_action_effectiveness(dataset_id: int, target_column: str = None, svc: AnalysisService = Depends(get_analysis_service)):
    """Action effectiveness — decline/step-up/allow evaluation."""
    df = svc.load_dataset_df(dataset_id)
    return compute_action_effectiveness(df, target_column)


@router.get("/{dataset_id}/segment-performance")
def get_segment_performance(dataset_id: int, target_column: str = None, svc: AnalysisService = Depends(get_analysis_service)):
    """Segment-level performance decomposition."""
    df = svc.load_dataset_df(dataset_id)
    return compute_segment_performance(df, target_column)


@router.get("/{dataset_id}/drift-adversarial")
def get_drift_adversarial(dataset_id: int, target_column: str = None, svc: AnalysisService = Depends(get_analysis_service)):
    """Concept drift and adversarial adaptation analysis."""
    df = svc.load_dataset_df(dataset_id)
    return compute_drift_adversarial(df, target_column)


@router.get("/{dataset_id}/calibration")
def get_calibration(dataset_id: int, target_column: str = None, svc: AnalysisService = Depends(get_analysis_service)):
    """Score calibration, monotonicity, and meaning."""
    df = svc.load_dataset_df(dataset_id)
    return compute_calibration_analysis(df, target_column)


@router.get("/{dataset_id}/reject-inference")
def get_reject_inference(dataset_id: int, target_column: str = None, svc: AnalysisService = Depends(get_analysis_service)):
    """Reject inference — blind spot analysis."""
    df = svc.load_dataset_df(dataset_id)
    return compute_reject_inference(df, target_column)


@router.get("/{dataset_id}/data-quality")
def get_data_quality(dataset_id: int, target_column: str = None, svc: AnalysisService = Depends(get_analysis_service)):
    """Data quality, latency impact, and fallback analysis."""
    df = svc.load_dataset_df(dataset_id)
    return compute_data_quality_analysis(df, target_column)


@router.get("/{dataset_id}/explainability")
def get_explainability(dataset_id: int, target_column: str = None, svc: AnalysisService = Depends(get_analysis_service)):
    """Explainability stress testing."""
    df = svc.load_dataset_df(dataset_id)
    return compute_explainability_analysis(df, target_column)


@router.get("/{dataset_id}/fairness")
def get_fairness(dataset_id: int, target_column: str = None, svc: AnalysisService = Depends(get_analysis_service)):
    """Fairness and harm analysis."""
    df = svc.load_dataset_df(dataset_id)
    return compute_fairness_analysis(df, target_column)


@router.get("/{dataset_id}/cost-threshold")
def get_cost_threshold(dataset_id: int, target_column: str = None, svc: AnalysisService = Depends(get_analysis_service)):
    """Cost curve and threshold sensitivity."""
    df = svc.load_dataset_df(dataset_id)
    return compute_cost_threshold_analysis(df, target_column)


@router.get("/{dataset_id}/hitl")
def get_hitl(dataset_id: int, target_column: str = None, svc: AnalysisService = Depends(get_analysis_service)):
    """Human-in-the-loop analysis."""
    df = svc.load_dataset_df(dataset_id)
    return compute_hitl_analysis(df, target_column)


@router.get("/{dataset_id}/failure-modes")
def get_failure_modes(dataset_id: int, target_column: str = None, svc: AnalysisService = Depends(get_analysis_service)):
    """End-to-end failure mode analysis."""
    df = svc.load_dataset_df(dataset_id)
    return compute_failure_mode_analysis(df, target_column)
