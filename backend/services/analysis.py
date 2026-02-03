"""Pandas/scipy EDA functions for real data analysis."""

import logging
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd

from backend.core.exceptions import DataError, NotFoundError
from backend.repositories.dataset_repo import DatasetRepo

logger = logging.getLogger(__name__)


class AnalysisService:
    """EDA service with dataset loading via injected repository."""

    def __init__(self, dataset_repo: DatasetRepo) -> None:
        self._repo = dataset_repo

    def load_dataset_df(self, dataset_id: int) -> pd.DataFrame:
        """Load a dataset from the admin DB into a DataFrame."""
        file_path = self._repo.get_file_path(dataset_id)
        path = Path(file_path)
        if not path.exists():
            raise NotFoundError(f"Dataset file not found on disk: {path}")

        ext = path.suffix.lower()
        try:
            if ext == ".csv":
                return pd.read_csv(path)
            elif ext == ".json":
                return pd.read_json(path)
            elif ext in (".xlsx", ".xls"):
                return pd.read_excel(path)
        except Exception as e:
            raise DataError(f"Failed to read dataset: {e}")

        raise DataError(f"Unsupported file type: {ext}")


# ── Standalone pure compute functions (no DB access) ─────────────────────────

def load_dataset_df(dataset_id: int) -> pd.DataFrame:
    """Legacy compat shim — uses default repo. Prefer AnalysisService."""
    from backend.core.dependencies import get_dataset_repo
    svc = AnalysisService(get_dataset_repo())
    return svc.load_dataset_df(dataset_id)


def compute_summary_stats(df: pd.DataFrame) -> dict:
    """Full EDA: describe(), dtypes, missing%, skewness, kurtosis."""
    numeric_df = df.select_dtypes(include=[np.number])

    columns = []
    for col in df.columns:
        info = {
            "name": col,
            "dtype": str(df[col].dtype),
            "count": int(df[col].count()),
            "null_count": int(df[col].isnull().sum()),
            "null_pct": round(df[col].isnull().mean() * 100, 2),
            "unique": int(df[col].nunique()),
        }
        if pd.api.types.is_numeric_dtype(df[col]):
            info["mean"] = _safe_float(df[col].mean())
            info["std"] = _safe_float(df[col].std())
            info["min"] = _safe_float(df[col].min())
            info["max"] = _safe_float(df[col].max())
            info["median"] = _safe_float(df[col].median())
            info["skewness"] = _safe_float(df[col].skew())
            info["kurtosis"] = _safe_float(df[col].kurtosis())
            info["q25"] = _safe_float(df[col].quantile(0.25))
            info["q75"] = _safe_float(df[col].quantile(0.75))
        elif pd.api.types.is_string_dtype(df[col]) or pd.api.types.is_categorical_dtype(df[col]):
            vc = df[col].value_counts().head(10)
            info["top_values"] = {str(k): int(v) for k, v in vc.items()}
        columns.append(info)

    return {
        "rows": len(df),
        "cols": len(df.columns),
        "columns": columns,
        "memory_usage": int(df.memory_usage(deep=True).sum()),
        "numeric_columns": list(numeric_df.columns),
        "categorical_columns": list(df.select_dtypes(include=["object", "category"]).columns),
    }


def compute_correlations(df: pd.DataFrame) -> dict:
    """Pearson + Spearman correlation matrices."""
    numeric_df = df.select_dtypes(include=[np.number])
    if numeric_df.empty:
        return {"message": "No numeric columns found", "pearson": {}, "spearman": {}}

    if len(numeric_df.columns) > 20:
        numeric_df = numeric_df.iloc[:, :20]

    features = list(numeric_df.columns)
    pearson = numeric_df.corr(method="pearson").fillna(0).values.tolist()
    spearman = numeric_df.corr(method="spearman").fillna(0).values.tolist()

    pearson = [[round(v, 4) for v in row] for row in pearson]
    spearman = [[round(v, 4) for v in row] for row in spearman]

    return {"features": features, "pearson": pearson, "spearman": spearman}


def compute_distributions(df: pd.DataFrame, bins: int = 20) -> dict:
    """Histogram data per numeric column."""
    numeric_df = df.select_dtypes(include=[np.number])
    distributions = {}

    for col in numeric_df.columns[:15]:
        series = numeric_df[col].dropna()
        if len(series) == 0:
            continue
        counts, edges = np.histogram(series, bins=bins)
        distributions[col] = {
            "counts": counts.tolist(),
            "bin_edges": [round(e, 4) for e in edges.tolist()],
            "labels": [f"{round(edges[i], 2)}-{round(edges[i+1], 2)}" for i in range(len(edges) - 1)],
        }

    return {"distributions": distributions}


def compute_outliers(df: pd.DataFrame) -> dict:
    """IQR + Z-score outlier detection."""
    numeric_df = df.select_dtypes(include=[np.number])
    results = {}

    for col in numeric_df.columns[:15]:
        series = numeric_df[col].dropna()
        if len(series) < 4:
            continue

        q1 = series.quantile(0.25)
        q3 = series.quantile(0.75)
        iqr = q3 - q1
        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr
        iqr_outliers = int(((series < lower) | (series > upper)).sum())

        mean = series.mean()
        std = series.std()
        if std > 0:
            z_scores = np.abs((series - mean) / std)
            z_outliers = int((z_scores > 3).sum())
        else:
            z_outliers = 0

        results[col] = {
            "iqr": {"q1": _safe_float(q1), "q3": _safe_float(q3), "iqr": _safe_float(iqr), "lower": _safe_float(lower), "upper": _safe_float(upper), "outlier_count": iqr_outliers},
            "zscore": {"mean": _safe_float(mean), "std": _safe_float(std), "threshold": 3.0, "outlier_count": z_outliers},
            "total_values": len(series),
        }

    return {"outliers": results}


def compute_class_distribution(df: pd.DataFrame, target_column: str = None) -> dict:
    """Analyze class distribution and imbalance for a target column."""
    candidate_columns = []
    for col in df.columns:
        nunique = df[col].nunique()
        if nunique <= 20 and nunique >= 2:
            candidate_columns.append({"name": col, "unique_values": nunique, "dtype": str(df[col].dtype)})

    if not target_column:
        for name in ["is_fraud", "Class", "label", "target", "fraud", "default"]:
            if name in df.columns and df[name].nunique() <= 20:
                target_column = name
                break
        if not target_column and candidate_columns:
            target_column = candidate_columns[0]["name"]

    if not target_column or target_column not in df.columns:
        return {"error": "No suitable target column found", "candidate_columns": candidate_columns}

    series = df[target_column].dropna()
    value_counts = series.value_counts().sort_index()
    total = len(series)
    majority_count = int(value_counts.max())
    minority_count = int(value_counts.min())
    imbalance_ratio = round(majority_count / max(minority_count, 1), 1)

    if imbalance_ratio < 2:
        severity = "balanced"
    elif imbalance_ratio < 5:
        severity = "moderate"
    elif imbalance_ratio < 10:
        severity = "significant"
    else:
        severity = "severe"

    recommendations = []
    if severity == "severe":
        recommendations = [
            {"method": "SMOTE", "description": "Synthetic Minority Over-sampling Technique to generate synthetic minority samples"},
            {"method": "Class Weights", "description": "Assign higher weights to minority class during model training"},
            {"method": "Random Undersampling", "description": "Reduce majority class samples to balance the dataset"},
            {"method": "Threshold Tuning", "description": "Adjust decision threshold to optimize for minority class recall"},
            {"method": "Ensemble Methods", "description": "Use BalancedRandomForest or EasyEnsemble for imbalanced data"},
        ]
    elif severity == "significant":
        recommendations = [
            {"method": "SMOTE", "description": "Generate synthetic minority samples"},
            {"method": "Class Weights", "description": "Use balanced class weights in model training"},
            {"method": "Threshold Tuning", "description": "Optimize decision threshold for better recall"},
        ]
    elif severity == "moderate":
        recommendations = [
            {"method": "Class Weights", "description": "Use balanced class weights"},
            {"method": "Stratified Sampling", "description": "Ensure balanced representation in train/test splits"},
        ]

    classes = []
    for val, count in value_counts.items():
        classes.append({"label": str(val), "count": int(count), "percentage": round(count / total * 100, 2)})

    return {
        "target_column": target_column, "total_samples": total, "num_classes": len(value_counts),
        "imbalance_ratio": imbalance_ratio, "severity": severity, "classes": classes,
        "recommendations": recommendations, "candidate_columns": candidate_columns,
    }


def compute_feature_engineering(df: pd.DataFrame, target_column: str = None) -> dict:
    """Generate advanced engineered features and analyze their properties."""
    generated_features = []
    feature_details = []
    engineered_df = pd.DataFrame()

    if not target_column:
        for name in ["is_fraud", "Class", "label", "target"]:
            if name in df.columns:
                target_column = name
                break

    if "amount" in df.columns and "avg_txn_amount" in df.columns:
        engineered_df["amount_to_avg_ratio"] = df["amount"] / df["avg_txn_amount"].replace(0, 1)
        feature_details.append({"name": "amount_to_avg_ratio", "formula": "amount / avg_txn_amount", "description": "Spending deviation from average transaction amount", "category": "Ratio"})

    if "velocity_1h" in df.columns and "velocity_24h" in df.columns:
        engineered_df["velocity_ratio"] = df["velocity_1h"] / np.maximum(df["velocity_24h"], 1)
        feature_details.append({"name": "velocity_ratio", "formula": "velocity_1h / max(velocity_24h, 1)", "description": "Burst detection — ratio of short-term to long-term velocity", "category": "Ratio"})

    if "amount" in df.columns:
        engineered_df["amount_log"] = np.log1p(df["amount"])
        feature_details.append({"name": "amount_log", "formula": "log1p(amount)", "description": "Log-transformed amount to normalize skewed distribution", "category": "Transform"})

    if "amount" in df.columns and "avg_txn_amount" in df.columns:
        engineered_df["is_high_amount"] = (df["amount"] > 2 * df["avg_txn_amount"]).astype(int)
        feature_details.append({"name": "is_high_amount", "formula": "1 if amount > 2 * avg_txn_amount", "description": "Flag for transactions exceeding 2x average amount", "category": "Binary"})

    if "hour" in df.columns:
        engineered_df["is_night"] = df["hour"].isin(range(0, 7)).astype(int)
        feature_details.append({"name": "is_night", "formula": "1 if hour in [0-6]", "description": "Nighttime transaction flag (12AM-6AM)", "category": "Binary"})

    if "day_of_week" in df.columns:
        engineered_df["is_weekend"] = df["day_of_week"].isin([5, 6]).astype(int)
        feature_details.append({"name": "is_weekend", "formula": "1 if day_of_week in [5, 6]", "description": "Weekend transaction flag (Saturday/Sunday)", "category": "Binary"})

    if "distance_from_home_km" in df.columns and "amount" in df.columns:
        engineered_df["distance_amount_interaction"] = df["distance_from_home_km"] * df["amount"]
        feature_details.append({"name": "distance_amount_interaction", "formula": "distance_from_home_km * amount", "description": "Risk interaction between distance and transaction amount", "category": "Interaction"})

    if "card_age_days" in df.columns:
        bins = [0, 90, 365, 1095, float("inf")]
        labels = ["new", "medium", "mature", "old"]
        engineered_df["card_age_bucket"] = pd.cut(df["card_age_days"], bins=bins, labels=labels).astype(str)
        feature_details.append({"name": "card_age_bucket", "formula": "bin(card_age_days): 0-90=new, 90-365=medium, 365-1095=mature, 1095+=old", "description": "Binned card age into lifecycle stages", "category": "Binning"})

    if "amount" in df.columns:
        mean_amt = df["amount"].mean()
        std_amt = df["amount"].std()
        if std_amt > 0:
            engineered_df["amount_zscore"] = (df["amount"] - mean_amt) / std_amt
        else:
            engineered_df["amount_zscore"] = 0.0
        feature_details.append({"name": "amount_zscore", "formula": "(amount - mean) / std", "description": "Z-score of amount for outlier detection", "category": "Transform"})

    if "velocity_1h" in df.columns and "velocity_24h" in df.columns:
        engineered_df["velocity_acceleration"] = df["velocity_1h"] - (df["velocity_24h"] / 24)
        feature_details.append({"name": "velocity_acceleration", "formula": "velocity_1h - (velocity_24h / 24)", "description": "Sudden spike detection in transaction velocity", "category": "Derived"})

    if engineered_df.empty:
        return {"message": "No features could be generated from available columns", "original_columns": list(df.columns), "features": [], "statistics": [], "correlations": [], "sample_data": []}

    statistics = []
    for col in engineered_df.columns:
        if engineered_df[col].dtype == "object":
            vc = engineered_df[col].value_counts().head(5)
            statistics.append({"name": col, "type": "categorical", "value_counts": {str(k): int(v) for k, v in vc.items()}})
        else:
            series = engineered_df[col].dropna()
            statistics.append({"name": col, "type": "numeric", "mean": _safe_float(series.mean()), "std": _safe_float(series.std()), "min": _safe_float(series.min()), "max": _safe_float(series.max()), "median": _safe_float(series.median())})

    correlations = []
    if target_column and target_column in df.columns:
        target_series = df[target_column]
        if pd.api.types.is_numeric_dtype(target_series):
            for col in engineered_df.columns:
                if engineered_df[col].dtype != "object":
                    corr = engineered_df[col].corr(target_series)
                    correlations.append({"feature": col, "correlation": _safe_float(corr), "abs_correlation": _safe_float(abs(corr))})
            correlations.sort(key=lambda x: x["abs_correlation"], reverse=True)

    sample_df = engineered_df.head(10).copy()
    sample_df = sample_df.replace([np.inf, -np.inf], np.nan).fillna(0)
    sample_data = sample_df.to_dict(orient="records")
    for row in sample_data:
        for k, v in row.items():
            if isinstance(v, float):
                row[k] = round(v, 4)

    return {
        "target_column": target_column, "original_columns": list(df.columns),
        "generated_features": list(engineered_df.columns), "feature_details": feature_details,
        "statistics": statistics, "correlations": correlations, "sample_data": sample_data, "total_rows": len(df),
    }


def _safe_float(val) -> float:
    """Convert to float, handling inf/nan."""
    if val is None or (isinstance(val, float) and (np.isnan(val) or np.isinf(val))):
        return 0.0
    return round(float(val), 6)
