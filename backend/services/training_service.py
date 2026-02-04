"""Training service — extracted from training router."""

import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Any, Dict

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, confusion_matrix, f1_score, precision_score, recall_score, roc_auc_score,
)
from sklearn.model_selection import train_test_split

from backend.core.config import Settings
from backend.core.exceptions import DataError, ValidationError
from backend.repositories.audit_repo import AuditRepo
from backend.repositories.job_repo import JobRepo

logger = logging.getLogger(__name__)

ALGO_MAP = {
    "logistic_regression": LogisticRegression,
    "random_forest": RandomForestClassifier,
    "gradient_boosting": GradientBoostingClassifier,
}


class TrainingService:
    """Model training with job lifecycle management."""

    def __init__(self, settings: Settings, job_repo: JobRepo, audit_repo: AuditRepo) -> None:
        self._settings = settings
        self._job_repo = job_repo
        self._audit_repo = audit_repo

    def run_training(
        self,
        job_id: int,
        dataset_id: int,
        target_column: str,
        algorithm: str,
        test_size: float,
        hyperparams: Dict[str, Any],
    ) -> None:
        """Background training task — updates job status via repo."""
        try:
            self._job_repo.update_status(job_id, "running")

            from backend.services.analysis import load_dataset_df
            df = load_dataset_df(dataset_id)
            if target_column not in df.columns:
                raise ValidationError(f"Target column '{target_column}' not in dataset")

            y = df[target_column]
            X = df.drop(columns=[target_column])
            X = X.select_dtypes(include=[np.number])
            X = X.fillna(0)

            if len(X.columns) == 0:
                raise DataError("No numeric features found in dataset")

            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=42)

            self._job_repo.update_progress(job_id, 30)

            algo_cls = ALGO_MAP.get(algorithm)
            if not algo_cls:
                raise ValidationError(f"Unknown algorithm: {algorithm}")

            model = algo_cls(**hyperparams)
            model.fit(X_train, y_train)

            self._job_repo.update_progress(job_id, 70)

            y_pred = model.predict(X_test)
            y_proba = None
            if hasattr(model, "predict_proba"):
                try:
                    y_proba = model.predict_proba(X_test)
                except (ValueError, AttributeError) as e:
                    logger.warning("predict_proba failed for job %d: %s", job_id, e)

            acc = float(accuracy_score(y_test, y_pred))
            prec = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
            rec = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
            f1 = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))

            cm = confusion_matrix(y_test, y_pred).tolist()

            auc = None
            if y_proba is not None and len(np.unique(y_test)) == 2:
                try:
                    auc = float(roc_auc_score(y_test, y_proba[:, 1]))
                except (ValueError, IndexError) as e:
                    logger.warning("AUC-ROC calculation failed for job %d: %s", job_id, e)

            feature_importance: Dict[str, float] = {}
            if hasattr(model, "feature_importances_"):
                for fname, fval in zip(X.columns, model.feature_importances_):
                    feature_importance[fname] = float(fval)
            elif hasattr(model, "coef_"):
                coefs = np.abs(model.coef_).mean(axis=0) if model.coef_.ndim > 1 else np.abs(model.coef_[0])
                for fname, fval in zip(X.columns, coefs):
                    feature_importance[fname] = float(fval)

            # Save model
            model_dir = self._settings.base_dir / "models"
            model_dir.mkdir(exist_ok=True)
            model_path = model_dir / f"job_{job_id}_{algorithm}.pkl"

            import joblib
            joblib.dump(model, model_path)

            result = {
                "accuracy": acc, "precision": prec, "recall": rec, "f1": f1, "auc_roc": auc,
                "confusion_matrix": cm,
                "feature_importance": feature_importance,
                "model_path": str(model_path),
                "features": list(X.columns),
                "train_size": len(X_train),
                "test_size": len(X_test),
            }

            self._job_repo.update_result(job_id, result)
            self._job_repo.update_status(job_id, "completed")
            self._audit_repo.log("training_completed", f"Job {job_id}: {algorithm} accuracy={acc:.4f}", entry_type="create")

        except Exception as e:
            logger.error("Training job %d failed: %s", job_id, e)
            self._job_repo.update_status(job_id, "failed", error_message=str(e))
