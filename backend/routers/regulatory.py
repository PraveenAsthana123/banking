"""Regulatory report generation — SR 11-7, model inventory, compliance summaries."""

import json
import logging
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends

from backend.core.config import Settings
from backend.core.dependencies import get_settings
from backend.core.exceptions import NotFoundError

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin/regulatory", tags=["regulatory"])


# ── Domain classification for risk assessment ─────────────────────────────────

HIGH_RISK_DOMAINS = {"fraud", "aml"}
MEDIUM_RISK_DOMAINS = {"credit", "collections", "cr", "col"}

DOMAIN_LABELS = {
    "fr": "Fraud Management",
    "fraud": "Fraud Management",
    "aml": "AML / Financial Crime",
    "cr": "Credit Risk",
    "credit": "Credit Risk",
    "col": "Collections",
    "collections": "Collections",
    "gov": "Governance",
    "hr": "Human Resources",
    "st": "Strategy",
    "cc": "Contact Center",
    "bo": "Branch Operations",
    "atm": "ATM Operations",
    "tf": "Treasury & Finance",
}


# ── SR 11-7 Report ────────────────────────────────────────────────────────────

@router.get("/sr11-7/{uc_id}")
def generate_sr11_7_report(uc_id: str, settings: Settings = Depends(get_settings)):
    """
    Generate SR 11-7 Model Risk Management report data for a use case.

    Returns structured JSON covering model identification, risk rating,
    performance metrics, data quality, limitations, and monitoring requirements.
    """
    summary = _load_summary(uc_id, settings)
    if not summary:
        raise NotFoundError(f"No summary.json found for use case '{uc_id}'.")

    domain = summary.get("domain", _extract_domain(uc_id))
    category = summary.get("category", DOMAIN_LABELS.get(domain, "General"))
    quality_score = summary.get("data_quality_score", 0.0)
    class_imbalance = summary.get("class_imbalance_ratio", 1.0)
    target_col = summary.get("target_column", "N/A")

    # Load model performance if available
    model_perf = _load_model_performance(uc_id, settings)
    accuracy = model_perf.get("accuracy", None)
    f1 = model_perf.get("f1_score", None)

    # Load governance scores
    gov_scores = _load_governance_scores(uc_id, settings)

    # Compute risk rating
    risk_rating = _compute_risk_rating(domain, quality_score, accuracy, class_imbalance)

    # Build SR 11-7 structured report
    now = datetime.now().isoformat()

    report = {
        "report_type": "SR 11-7 Model Risk Management",
        "generated_at": now,
        "use_case_id": uc_id,

        "model_identification": {
            "name": summary.get("label", uc_id.replace("_", " ").title()),
            "use_case_key": uc_id,
            "version": "1.0",
            "type": _infer_model_type(summary),
            "owner": category,
            "domain": domain,
            "category": category,
            "target_variable": target_col,
            "validation_date": summary.get("run_timestamp", now),
            "total_rows": summary.get("total_rows", 0),
            "total_columns": summary.get("total_columns", 0),
        },

        "risk_assessment": {
            "risk_rating": risk_rating,
            "risk_factors": _build_risk_factors(domain, quality_score, accuracy, class_imbalance),
            "domain_sensitivity": "High" if domain in HIGH_RISK_DOMAINS else (
                "Medium" if domain in MEDIUM_RISK_DOMAINS else "Low"
            ),
        },

        "model_performance": {
            "accuracy": accuracy,
            "f1_score": f1,
            "precision": model_perf.get("precision", None),
            "recall": model_perf.get("recall", None),
            "auc_roc": model_perf.get("auc_roc", None),
            "best_model": model_perf.get("best_model", None),
            "training_date": model_perf.get("training_date", None),
        },

        "data_quality_assessment": {
            "overall_score": quality_score,
            "trust_level": _trust_level(quality_score),
            "total_rows": summary.get("total_rows", 0),
            "total_columns": summary.get("total_columns", 0),
            "numeric_columns": summary.get("numeric_columns", 0),
            "categorical_columns": summary.get("categorical_columns", 0),
            "avg_missing_pct": summary.get("avg_missing_pct", 0.0),
            "duplicate_row_pct": summary.get("duplicate_row_pct", 0.0),
            "avg_outlier_pct": summary.get("avg_outlier_pct", 0.0),
            "class_imbalance_ratio": class_imbalance,
        },

        "governance_scores": gov_scores,

        "limitations_and_assumptions": _build_limitations(summary, model_perf),

        "ongoing_monitoring": {
            "recommended_review_frequency": "Quarterly" if risk_rating == "High" else (
                "Semi-Annual" if risk_rating == "Medium" else "Annual"
            ),
            "key_monitoring_metrics": [
                "Model accuracy / F1 score",
                "Data quality score",
                "Feature drift (PSI / KS statistics)",
                "Prediction distribution stability",
                "Class imbalance trends",
            ],
            "escalation_triggers": [
                f"Accuracy drops below {0.85 if risk_rating == 'High' else 0.80}",
                f"Data quality score falls below {80 if risk_rating == 'High' else 70}",
                "Feature drift exceeds 0.2 PSI threshold",
                "Significant shift in class distribution",
            ],
            "documentation_requirements": [
                "Model development documentation",
                "Validation report (this document)",
                "Ongoing performance monitoring reports",
                "Change management records",
                "Data lineage documentation",
            ],
        },
    }

    return report


# ── Model Inventory ───────────────────────────────────────────────────────────

def _build_inventory(settings: Settings) -> List[dict]:
    """
    Build full model inventory across all use cases.

    For each UC: uc_id, name, domain, risk_rating, last_validated,
    model_type, accuracy, data_quality, status.
    """
    inventory = []

    if not settings.output_dir.exists():
        return inventory

    for summary_path in sorted(settings.output_dir.glob("*/summary.json")):
        try:
            data = json.loads(summary_path.read_text())
        except Exception:
            continue

        uc_id = data.get("use_case_key", summary_path.parent.name)
        domain = data.get("domain", _extract_domain(uc_id))
        quality_score = data.get("data_quality_score") or 0.0
        class_imbalance = data.get("class_imbalance_ratio") or 1.0

        model_perf = _load_model_performance(uc_id, settings)
        accuracy = model_perf.get("accuracy", None)

        risk_rating = _compute_risk_rating(domain, quality_score, accuracy, class_imbalance)

        # Determine status
        has_model = model_perf.get("best_model") is not None
        has_quality = quality_score > 0

        if has_model and has_quality:
            status = "active"
        elif has_quality:
            status = "pending"
        else:
            status = "retired"

        # Check for documentation
        full_report = summary_path.parent / "full_report.json"
        has_docs = full_report.exists()

        inventory.append({
            "uc_id": uc_id,
            "name": data.get("label", uc_id.replace("_", " ").title()),
            "domain": domain,
            "category": data.get("category", DOMAIN_LABELS.get(domain, "General")),
            "risk_rating": risk_rating,
            "last_validated": data.get("run_timestamp", ""),
            "model_type": _infer_model_type(data),
            "accuracy": accuracy,
            "data_quality": quality_score,
            "status": status,
            "has_documentation": has_docs,
            "total_rows": data.get("total_rows", 0),
            "target_column": data.get("target_column", "N/A"),
        })

    return inventory


@router.get("/model-inventory")
def model_inventory(settings: Settings = Depends(get_settings)):
    """
    Return full model inventory across all use cases.

    For each UC: uc_id, name, domain, risk_rating, last_validated,
    model_type, accuracy, data_quality, status.
    """
    return _build_inventory(settings)


# ── Compliance Summary ────────────────────────────────────────────────────────

@router.get("/compliance-summary")
def compliance_summary(settings: Settings = Depends(get_settings)):
    """
    Aggregate compliance metrics across the full model inventory.

    Returns counts by risk rating, validation status, documentation,
    average quality/accuracy, and department risk concentrations.
    """
    inventory = _build_inventory(settings)

    if not inventory:
        return {
            "total_models": 0,
            "by_risk_rating": {"High": 0, "Medium": 0, "Low": 0},
            "by_status": {"active": 0, "pending": 0, "retired": 0},
            "validated_count": 0,
            "pending_validation_count": 0,
            "with_documentation": 0,
            "without_documentation": 0,
            "avg_data_quality": 0.0,
            "avg_model_accuracy": 0.0,
            "department_risk_concentration": [],
            "generated_at": datetime.now().isoformat(),
        }

    total = len(inventory)

    # Risk rating counts
    risk_counts = {"High": 0, "Medium": 0, "Low": 0}
    for item in inventory:
        risk_counts[item["risk_rating"]] = risk_counts.get(item["risk_rating"], 0) + 1

    # Status counts
    status_counts = {"active": 0, "pending": 0, "retired": 0}
    for item in inventory:
        status_counts[item["status"]] = status_counts.get(item["status"], 0) + 1

    # Documentation
    with_docs = sum(1 for i in inventory if i.get("has_documentation"))

    # Average data quality
    quality_scores = [i["data_quality"] for i in inventory if i["data_quality"] > 0]
    avg_quality = round(sum(quality_scores) / len(quality_scores), 2) if quality_scores else 0.0

    # Average accuracy (only where available)
    accuracies = [i["accuracy"] for i in inventory if i["accuracy"] is not None]
    avg_accuracy = round(sum(accuracies) / len(accuracies), 4) if accuracies else 0.0

    # Department risk concentration
    dept_risk: Dict[str, Dict[str, int]] = {}
    for item in inventory:
        cat = item.get("category", "Unknown")
        if cat not in dept_risk:
            dept_risk[cat] = {"High": 0, "Medium": 0, "Low": 0, "total": 0}
        dept_risk[cat][item["risk_rating"]] += 1
        dept_risk[cat]["total"] += 1

    # Sort by high-risk count descending
    dept_concentration = sorted(
        [{"department": k, **v} for k, v in dept_risk.items()],
        key=lambda x: (x["High"], x["Medium"]),
        reverse=True,
    )

    return {
        "total_models": total,
        "by_risk_rating": risk_counts,
        "by_status": status_counts,
        "validated_count": status_counts.get("active", 0),
        "pending_validation_count": status_counts.get("pending", 0),
        "with_documentation": with_docs,
        "without_documentation": total - with_docs,
        "avg_data_quality": avg_quality,
        "avg_model_accuracy": avg_accuracy,
        "department_risk_concentration": dept_concentration,
        "generated_at": datetime.now().isoformat(),
    }


# ── Helper functions ──────────────────────────────────────────────────────────

def _load_summary(uc_id: str, settings: Settings) -> Optional[dict]:
    """Load summary.json for a given use case."""
    summary_path = settings.output_dir / uc_id / "summary.json"
    if not summary_path.exists():
        return None
    try:
        return json.loads(summary_path.read_text())
    except Exception as e:
        logger.error("Failed to load summary for %s: %s", uc_id, e)
        return None


def _load_model_performance(uc_id: str, settings: Settings) -> dict:
    """
    Load model performance metrics from full_report.json or other sources.

    Returns dict with accuracy, f1_score, precision, recall, etc.
    """
    result = {}

    # Try full_report.json first
    full_report_path = settings.output_dir / uc_id / "full_report.json"
    if full_report_path.exists():
        try:
            report = json.loads(full_report_path.read_text())
            model_section = report.get("model_metrics", report.get("model_performance", {}))
            if model_section:
                for key in ("accuracy", "f1_score", "precision", "recall", "auc_roc", "best_model", "training_date"):
                    if key in model_section:
                        result[key] = model_section[key]
        except Exception:
            pass

    # Try governance scores from results DB for trust metrics
    if settings.results_db.exists():
        try:
            conn = sqlite3.connect(str(settings.results_db))
            conn.row_factory = sqlite3.Row
            row = conn.execute(
                "SELECT performance_ai FROM governance_scores WHERE use_case = ?",
                (uc_id,)
            ).fetchone()
            if row and row[0] is not None:
                # Use performance_ai as a proxy if no direct accuracy
                if "accuracy" not in result:
                    result["accuracy"] = round(row[0] / 100.0, 4) if row[0] > 1 else row[0]
            conn.close()
        except Exception:
            pass

    return result


def _load_governance_scores(uc_id: str, settings: Settings) -> dict:
    """Load governance trust scores from results DB."""
    if not settings.results_db.exists():
        return {}
    try:
        conn = sqlite3.connect(str(settings.results_db))
        conn.row_factory = sqlite3.Row
        row = conn.execute(
            "SELECT explainability, responsible_ai, trustworthy_ai, ethical_ai, "
            "governance_ai, sustainable_ai, portable_ai, performance_ai, "
            "overall_trust_score, trust_level FROM governance_scores WHERE use_case = ?",
            (uc_id,)
        ).fetchone()
        conn.close()
        if row:
            return {
                "explainability": row[0],
                "responsible_ai": row[1],
                "trustworthy_ai": row[2],
                "ethical_ai": row[3],
                "governance_ai": row[4],
                "sustainable_ai": row[5],
                "portable_ai": row[6],
                "performance_ai": row[7],
                "overall_trust_score": row[8],
                "trust_level": row[9],
            }
    except Exception as e:
        logger.warning("Could not load governance scores for %s: %s", uc_id, e)
    return {}


def _extract_domain(uc_id: str) -> str:
    """Extract domain prefix from use case key like 'uc_fr_01_...' -> 'fr'."""
    parts = uc_id.replace("-", "_").split("_")
    if len(parts) >= 2:
        # Skip 'uc' prefix, take domain part
        candidate = parts[1] if parts[0] in ("uc", "UC") else parts[0]
        if candidate in DOMAIN_LABELS:
            return candidate
    # Check for 'real_' prefix datasets
    if uc_id.startswith("real_"):
        return "general"
    return "general"


def _compute_risk_rating(
    domain: str,
    quality_score: float,
    accuracy: Optional[float],
    class_imbalance: float,
) -> str:
    """
    Compute model risk rating per SR 11-7 guidelines.

    High risk: fraud/AML models, or accuracy < 85%, or quality < 80%
    Medium risk: credit/collections, or accuracy 85-92%, or quality 80-90%
    Low risk: others with accuracy > 92% and quality > 90%
    """
    # Domain-based escalation
    if domain in HIGH_RISK_DOMAINS or domain in ("fr",):
        return "High"

    if domain in MEDIUM_RISK_DOMAINS:
        # Can still be High if metrics are bad
        if quality_score < 80 or (accuracy is not None and accuracy < 0.85):
            return "High"
        return "Medium"

    # Metric-based assessment
    if quality_score < 80:
        return "High"
    if accuracy is not None and accuracy < 0.85:
        return "High"

    if quality_score < 90:
        return "Medium"
    if accuracy is not None and accuracy < 0.92:
        return "Medium"

    return "Low"


def _build_risk_factors(
    domain: str,
    quality_score: float,
    accuracy: Optional[float],
    class_imbalance: float,
) -> List[str]:
    """Build list of risk factors contributing to the rating."""
    factors = []

    if domain in HIGH_RISK_DOMAINS or domain in ("fr",):
        factors.append(f"High-sensitivity domain: {DOMAIN_LABELS.get(domain, domain)}")
    if quality_score < 80:
        factors.append(f"Data quality score below 80%: {quality_score:.1f}")
    elif quality_score < 90:
        factors.append(f"Data quality score below 90%: {quality_score:.1f}")
    if accuracy is not None and accuracy < 0.85:
        factors.append(f"Model accuracy below 85%: {accuracy:.4f}")
    elif accuracy is not None and accuracy < 0.92:
        factors.append(f"Model accuracy below 92%: {accuracy:.4f}")
    if class_imbalance > 10:
        factors.append(f"Significant class imbalance: {class_imbalance:.1f}:1 ratio")

    if not factors:
        factors.append("No significant risk factors identified")

    return factors


def _infer_model_type(summary: dict) -> str:
    """Infer model type from summary metadata."""
    target = summary.get("target_column", "")
    cat_cols = summary.get("categorical_columns", 0)
    num_cols = summary.get("numeric_columns", 0)

    if not target or target == "N/A":
        return "Unsupervised / Analytical"

    # Binary classification indicators
    imbalance = summary.get("class_imbalance_ratio") or 1.0
    if imbalance > 1.0:
        return "Binary Classification"

    if num_cols > cat_cols:
        return "Regression / Classification"

    return "Classification"


def _trust_level(score: float) -> str:
    """Convert quality score to trust level."""
    if score >= 85:
        return "HIGH"
    elif score >= 70:
        return "MEDIUM"
    elif score >= 60:
        return "LOW"
    return "CRITICAL"


def _build_limitations(summary: dict, model_perf: dict) -> List[str]:
    """Build list of model limitations and assumptions."""
    limitations = []

    missing_pct = summary.get("avg_missing_pct", 0)
    if missing_pct > 5:
        limitations.append(f"Dataset has {missing_pct:.1f}% average missing values — imputation may affect results.")

    outlier_pct = summary.get("avg_outlier_pct", 0)
    if outlier_pct > 10:
        limitations.append(f"High outlier prevalence ({outlier_pct:.1f}%) may impact model stability.")

    imbalance = summary.get("class_imbalance_ratio", 1.0)
    if imbalance > 10:
        limitations.append(
            f"Severe class imbalance ({imbalance:.1f}:1) — model may be biased toward majority class."
        )

    dup_pct = summary.get("duplicate_row_pct", 0)
    if dup_pct > 1:
        limitations.append(f"Dataset contains {dup_pct:.1f}% duplicate rows.")

    if not model_perf:
        limitations.append("No trained model available — performance metrics are estimated or unavailable.")

    if not limitations:
        limitations.append("No significant limitations identified based on current data assessment.")

    return limitations
