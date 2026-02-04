"""Model loading, prediction, and SHAP explanations."""

import logging
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd

from backend.core.config import Settings
from backend.core.exceptions import ModelError, NotFoundError

logger = logging.getLogger(__name__)


class ModelService:
    """Model loading and scoring with instance-level caching."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._cache: Dict[str, Any] = {}

    def _find_pkl_files(self) -> List[Path]:
        """Find all .pkl model files."""
        files: List[Path] = []
        for d in self._settings.model_dirs:
            if d.exists():
                files.extend(d.rglob("*.pkl"))
        return files

    def get_available_models(self) -> List[dict]:
        """List available .pkl models with metadata."""
        models = []
        for f in self._find_pkl_files():
            stat = f.stat()
            models.append({
                "name": f.stem.replace("_", " ").title(),
                "path": str(f),
                "size": stat.st_size,
                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            })
        return models

    def load_model(self, model_path: str) -> Any:
        """Load a model from disk with caching."""
        if model_path in self._cache:
            return self._cache[model_path]

        path = Path(model_path)
        if not path.exists():
            raise NotFoundError(f"Model file not found: {model_path}")

        import joblib
        model = joblib.load(path)
        self._cache[model_path] = model
        return model

    def score_single(self, model_path: str, features: Dict[str, Any]) -> dict:
        """Score a single record — returns probability + SHAP if available."""
        model = self.load_model(model_path)

        df = pd.DataFrame([features])
        df = df.select_dtypes(include=[np.number])
        df = df.fillna(0)

        if df.empty:
            raise ModelError("No numeric features provided")

        prediction = model.predict(df)[0]
        result = {
            "prediction": _to_python(prediction),
            "features": features,
            "model": model_path,
            "timestamp": datetime.now().isoformat(),
        }

        if hasattr(model, "predict_proba"):
            try:
                proba = model.predict_proba(df)[0]
                result["probabilities"] = [float(p) for p in proba]
                result["score"] = float(max(proba))
            except (ValueError, AttributeError) as e:
                logger.warning("predict_proba failed for model %s: %s", model_path, e)

        try:
            import shap
            explainer = shap.TreeExplainer(model)
            shap_values = explainer.shap_values(df)
            if isinstance(shap_values, list):
                shap_values = shap_values[1] if len(shap_values) > 1 else shap_values[0]
            result["shap_values"] = {col: float(sv) for col, sv in zip(df.columns, shap_values[0])}
        except ImportError:
            pass
        except Exception as e:
            logger.debug("SHAP failed: %s", e)

        return result

    def score_batch(self, model_path: str, df: pd.DataFrame, target_column: Optional[str] = None) -> dict:
        """Batch-score a DataFrame."""
        model = self.load_model(model_path)

        y_true = None
        if target_column and target_column in df.columns:
            y_true = df[target_column]
            df = df.drop(columns=[target_column])

        df_numeric = df.select_dtypes(include=[np.number]).fillna(0)

        if df_numeric.empty:
            raise ModelError("No numeric features in dataset")

        predictions = model.predict(df_numeric)
        result: Dict[str, Any] = {
            "total_records": len(df),
            "predictions": [_to_python(p) for p in predictions[:100]],
            "prediction_counts": {},
        }

        unique, counts = np.unique(predictions, return_counts=True)
        result["prediction_counts"] = {str(u): int(c) for u, c in zip(unique, counts)}

        if hasattr(model, "predict_proba"):
            try:
                probas = model.predict_proba(df_numeric)
                result["mean_probability"] = [float(p) for p in probas.mean(axis=0)]
                result["score_distribution"] = np.histogram(probas.max(axis=1), bins=20)[0].tolist()
            except (ValueError, AttributeError) as e:
                logger.warning("Batch predict_proba failed for model %s: %s", model_path, e)

        if y_true is not None:
            from sklearn.metrics import accuracy_score, f1_score
            try:
                result["accuracy"] = float(accuracy_score(y_true, predictions))
                result["f1"] = float(f1_score(y_true, predictions, average="weighted", zero_division=0))
            except (ValueError, TypeError) as e:
                logger.warning("Metric computation failed: %s", e)

        return result


# ── Standalone helpers ────────────────────────────────────────────────────────

def _to_python(val: Any) -> Any:
    """Convert numpy types to native Python for JSON serialization."""
    if isinstance(val, (np.integer,)):
        return int(val)
    elif isinstance(val, (np.floating,)):
        return float(val)
    elif isinstance(val, np.ndarray):
        return val.tolist()
    return val


# ── Legacy compat shims ──────────────────────────────────────────────────────

def get_available_models() -> List[dict]:
    """Legacy shim — prefer ModelService."""
    from backend.core.dependencies import get_model_service
    return get_model_service().get_available_models()


def score_single(model_path: str, features: Dict[str, Any]) -> dict:
    """Legacy shim — prefer ModelService."""
    from backend.core.dependencies import get_model_service
    return get_model_service().score_single(model_path, features)


def score_batch(model_path: str, dataset_id: int, target_column: Optional[str] = None) -> dict:
    """Legacy shim — prefer ModelService."""
    from backend.core.dependencies import get_model_service, get_analysis_service
    svc = get_model_service()
    analysis = get_analysis_service()
    df = analysis.load_dataset_df(dataset_id)
    return svc.score_batch(model_path, df, target_column)
