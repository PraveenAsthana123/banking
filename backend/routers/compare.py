"""Use case comparison, portfolio ranking, and business-case endpoints."""

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, Query

from backend.core.config import Settings
from backend.core.dependencies import get_settings
from backend.core.exceptions import NotFoundError, ValidationError
from backend.schemas.compare import SideBySideRequest

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin/compare", tags=["compare"])

# ── Domain-to-department mapping ────────────────────────────────────────────

DOMAIN_DEPARTMENT_MAP = {
    "fraud": "Fraud Management",
    "credit": "Credit Risk",
    "aml": "AML / Compliance",
    "collections": "Collections",
    "hr": "Human Resources",
    "customer": "Customer Analytics",
    "treasury": "Treasury & Finance",
    "atm": "ATM Operations",
    "contact_center": "Contact Center",
    "branch": "Branch Operations",
    "governance": "AI Governance",
    "strategy": "Strategy",
}

# ── Banking industry ROI multipliers ────────────────────────────────────────

DOMAIN_ROI_CONFIG: Dict[str, Dict[str, Any]] = {
    "fraud": {
        "label": "Fraud Detection",
        "savings_per_unit_low": 50,
        "savings_per_unit_high": 200,
        "unit_description": "caught fraud case",
        "base_volume_fraction": 0.01,  # 1 % of rows are potential fraud events
        "implementation_cost_base": 350_000,
        "annual_maintenance_pct": 0.20,
    },
    "credit": {
        "label": "Credit Scoring",
        "default_rate_reduction_low": 0.005,
        "default_rate_reduction_high": 0.02,
        "avg_loan_value": 25_000,
        "portfolio_fraction": 1.0,
        "implementation_cost_base": 400_000,
        "annual_maintenance_pct": 0.18,
    },
    "aml": {
        "label": "AML Alert Triage",
        "savings_per_fp_low": 10_000,
        "savings_per_fp_high": 50_000,
        "false_positive_rate": 0.90,  # industry avg ~90 % FP
        "implementation_cost_base": 500_000,
        "annual_maintenance_pct": 0.22,
    },
    "customer": {
        "label": "Customer Churn Prevention",
        "savings_per_unit_low": 500,
        "savings_per_unit_high": 2_000,
        "churn_rate": 0.05,
        "implementation_cost_base": 250_000,
        "annual_maintenance_pct": 0.15,
    },
    "collections": {
        "label": "Collections Optimization",
        "recovery_improvement_low": 0.05,
        "recovery_improvement_high": 0.15,
        "avg_delinquent_balance": 8_000,
        "delinquency_rate": 0.04,
        "implementation_cost_base": 300_000,
        "annual_maintenance_pct": 0.18,
    },
    "hr": {
        "label": "HR Analytics",
        "savings_per_unit_low": 5_000,
        "savings_per_unit_high": 15_000,
        "unit_description": "optimized hire",
        "hire_fraction": 0.10,
        "implementation_cost_base": 200_000,
        "annual_maintenance_pct": 0.15,
    },
}

# Fallback for domains without specific config
DEFAULT_ROI_CONFIG = {
    "label": "General AI Use Case",
    "annual_savings_per_row_low": 0.50,
    "annual_savings_per_row_high": 2.00,
    "implementation_cost_base": 250_000,
    "annual_maintenance_pct": 0.18,
}

DISCOUNT_RATE = 0.10  # 10 % for NPV


# ── Helpers ─────────────────────────────────────────────────────────────────

def _load_summary(uc_dir: Path) -> Optional[Dict[str, Any]]:
    """Load summary.json from a use-case preprocessing directory."""
    summary_path = uc_dir / "summary.json"
    if not summary_path.exists():
        return None
    try:
        with open(summary_path) as f:
            return json.load(f)
    except Exception as e:
        logger.warning("Failed to load %s: %s", summary_path, e)
        return None


def _load_training_results(uc_dir: Path) -> Optional[Dict[str, Any]]:
    """Load training_results.json if it exists."""
    tr_path = uc_dir / "training_results.json"
    if not tr_path.exists():
        return None
    try:
        with open(tr_path) as f:
            return json.load(f)
    except Exception as e:
        logger.warning("Failed to load %s: %s", tr_path, e)
        return None


def _has_trained_model(uc_dir: Path) -> bool:
    """Check whether a models/ sub-directory with .pkl files exists."""
    models_dir = uc_dir / "models"
    if not models_dir.is_dir():
        return False
    return any(models_dir.glob("*.pkl"))


def _infer_department(summary: Dict[str, Any]) -> str:
    """Derive a human-readable department from the summary's domain or category."""
    domain = summary.get("domain", "").lower()
    if domain in DOMAIN_DEPARTMENT_MAP:
        return DOMAIN_DEPARTMENT_MAP[domain]
    category = summary.get("category", "")
    if category:
        return category
    # Fallback: infer from uc_key prefix
    uc_key = summary.get("use_case_key", "")
    prefix_map = {
        "uc_fr_": "Fraud Management",
        "uc_cr_": "Credit Risk",
        "uc_aml_": "AML / Compliance",
        "uc_col_": "Collections",
        "uc_hr_": "Human Resources",
        "uc_bo_": "Branch Operations",
        "uc_cc_": "Contact Center",
        "uc_atm_": "ATM Operations",
        "uc_tf_": "Treasury & Finance",
        "uc_gov_": "AI Governance",
        "uc_st_": "Strategy",
    }
    for prefix, dept in prefix_map.items():
        if uc_key.startswith(prefix):
            return dept
    return "Other"


def _build_portfolio_entry(uc_dir: Path) -> Optional[Dict[str, Any]]:
    """Build a single portfolio row from a UC directory."""
    summary = _load_summary(uc_dir)
    if summary is None:
        return None
    has_model = _has_trained_model(uc_dir)
    department = _infer_department(summary)
    return {
        "uc_key": summary.get("use_case_key", uc_dir.name),
        "label": summary.get("label", uc_dir.name),
        "category": summary.get("category", ""),
        "domain": summary.get("domain", ""),
        "department": department,
        "total_rows": summary.get("total_rows", 0),
        "total_columns": summary.get("total_columns", 0),
        "numeric_columns": summary.get("numeric_columns", 0),
        "categorical_columns": summary.get("categorical_columns", 0),
        "data_quality_score": summary.get("data_quality_score", 0.0),
        "target_column": summary.get("target_column"),
        "class_imbalance_ratio": summary.get("class_imbalance_ratio"),
        "has_trained_model": has_model,
        "avg_missing_pct": summary.get("avg_missing_pct", 0.0),
        "avg_outlier_pct": summary.get("avg_outlier_pct", 0.0),
        "duplicate_row_pct": summary.get("duplicate_row_pct", 0.0),
        "n_feature_suggestions": summary.get("n_feature_suggestions", 0),
        "run_timestamp": summary.get("run_timestamp"),
    }


def _all_portfolio_entries(preprocess_root: Path) -> List[Dict[str, Any]]:
    """Scan preprocessing_output and build portfolio list."""
    entries: List[Dict[str, Any]] = []
    if not preprocess_root.is_dir():
        return entries
    for child in sorted(preprocess_root.iterdir()):
        if not child.is_dir():
            continue
        entry = _build_portfolio_entry(child)
        if entry is not None:
            entries.append(entry)
    return entries


def _compute_business_case(summary: Dict[str, Any], training: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """Compute estimated ROI / business case for a single use case."""
    domain = summary.get("domain", "").lower()
    total_rows = summary.get("total_rows", 0)
    quality = summary.get("data_quality_score", 0.0)

    # Model accuracy proxy
    model_accuracy = 0.0
    best_model_name = None
    if training:
        # Try to pull accuracy from training results
        models = training.get("models", training.get("results", []))
        if isinstance(models, list):
            for m in models:
                acc = m.get("accuracy", m.get("test_accuracy", m.get("score", 0.0)))
                if acc > model_accuracy:
                    model_accuracy = acc
                    best_model_name = m.get("name", m.get("model", "unknown"))
        elif isinstance(models, dict):
            for name, metrics in models.items():
                acc = metrics.get("accuracy", metrics.get("test_accuracy", 0.0)) if isinstance(metrics, dict) else 0.0
                if acc > model_accuracy:
                    model_accuracy = acc
                    best_model_name = name
    # If no training results, estimate from data quality
    if model_accuracy == 0.0:
        model_accuracy = min(0.65 + (quality / 100) * 0.25, 0.92)
        best_model_name = "estimated (no training data)"

    effectiveness = model_accuracy * (quality / 100)

    # Domain-specific calculations
    cfg = DOMAIN_ROI_CONFIG.get(domain, None)
    implementation_cost = 0.0
    annual_savings = 0.0

    if cfg is None:
        # Generic fallback
        dc = DEFAULT_ROI_CONFIG
        low = dc["annual_savings_per_row_low"]
        high = dc["annual_savings_per_row_high"]
        midpoint = (low + high) / 2
        annual_savings = total_rows * midpoint * effectiveness
        implementation_cost = dc["implementation_cost_base"]
        annual_maintenance = implementation_cost * dc["annual_maintenance_pct"]
        detail = f"Generic: ${midpoint:.2f}/row x {total_rows:,} rows x {effectiveness:.2%} effectiveness"

    elif domain == "fraud":
        low, high = cfg["savings_per_unit_low"], cfg["savings_per_unit_high"]
        midpoint = (low + high) / 2
        fraud_events = total_rows * cfg["base_volume_fraction"]
        caught = fraud_events * effectiveness
        annual_savings = caught * midpoint
        implementation_cost = cfg["implementation_cost_base"]
        annual_maintenance = implementation_cost * cfg["annual_maintenance_pct"]
        detail = (f"Fraud: ~{int(fraud_events):,} potential fraud events, "
                  f"~{int(caught):,} caught @ ${midpoint:.0f}/case")

    elif domain == "credit":
        low, high = cfg["default_rate_reduction_low"], cfg["default_rate_reduction_high"]
        mid_reduction = (low + high) / 2 * effectiveness
        portfolio_value = total_rows * cfg["avg_loan_value"]
        annual_savings = portfolio_value * mid_reduction
        implementation_cost = cfg["implementation_cost_base"]
        annual_maintenance = implementation_cost * cfg["annual_maintenance_pct"]
        detail = (f"Credit: portfolio ${portfolio_value:,.0f}, "
                  f"default reduction {mid_reduction:.3%}")

    elif domain == "aml":
        low, high = cfg["savings_per_fp_low"], cfg["savings_per_fp_high"]
        midpoint = (low + high) / 2
        total_alerts = total_rows
        false_positives = total_alerts * cfg["false_positive_rate"]
        eliminated = false_positives * effectiveness
        annual_savings = eliminated * midpoint
        implementation_cost = cfg["implementation_cost_base"]
        annual_maintenance = implementation_cost * cfg["annual_maintenance_pct"]
        detail = (f"AML: ~{int(false_positives):,} FPs, ~{int(eliminated):,} eliminated "
                  f"@ ${midpoint:,.0f}/FP")

    elif domain == "customer":
        low, high = cfg["savings_per_unit_low"], cfg["savings_per_unit_high"]
        midpoint = (low + high) / 2
        churners = total_rows * cfg["churn_rate"]
        retained = churners * effectiveness
        annual_savings = retained * midpoint
        implementation_cost = cfg["implementation_cost_base"]
        annual_maintenance = implementation_cost * cfg["annual_maintenance_pct"]
        detail = (f"Churn: ~{int(churners):,} at risk, ~{int(retained):,} retained "
                  f"@ ${midpoint:,.0f}/customer")

    elif domain == "collections":
        low, high = cfg["recovery_improvement_low"], cfg["recovery_improvement_high"]
        mid_improvement = (low + high) / 2 * effectiveness
        delinquent_accounts = total_rows * cfg["delinquency_rate"]
        recovery_increase = delinquent_accounts * cfg["avg_delinquent_balance"] * mid_improvement
        annual_savings = recovery_increase
        implementation_cost = cfg["implementation_cost_base"]
        annual_maintenance = implementation_cost * cfg["annual_maintenance_pct"]
        detail = (f"Collections: ~{int(delinquent_accounts):,} delinquent accounts, "
                  f"{mid_improvement:.2%} recovery improvement")

    elif domain == "hr":
        low, high = cfg["savings_per_unit_low"], cfg["savings_per_unit_high"]
        midpoint = (low + high) / 2
        hires = total_rows * cfg["hire_fraction"]
        optimized = hires * effectiveness
        annual_savings = optimized * midpoint
        implementation_cost = cfg["implementation_cost_base"]
        annual_maintenance = implementation_cost * cfg["annual_maintenance_pct"]
        detail = (f"HR: ~{int(hires):,} hires, ~{int(optimized):,} optimized "
                  f"@ ${midpoint:,.0f}/hire")
    else:
        # Catch-all for mapped but unconfigured domains
        dc = DEFAULT_ROI_CONFIG
        midpoint = (dc["annual_savings_per_row_low"] + dc["annual_savings_per_row_high"]) / 2
        annual_savings = total_rows * midpoint * effectiveness
        implementation_cost = dc["implementation_cost_base"]
        annual_maintenance = implementation_cost * dc["annual_maintenance_pct"]
        detail = f"Generic ({domain}): ${midpoint:.2f}/row x {total_rows:,} rows"

    # Payback period (years)
    net_annual = annual_savings - annual_maintenance
    payback_period = (implementation_cost / net_annual) if net_annual > 0 else float("inf")

    # 5-year NPV
    npv = -implementation_cost
    for year in range(1, 6):
        npv += net_annual / ((1 + DISCOUNT_RATE) ** year)

    return {
        "uc_key": summary.get("use_case_key"),
        "label": summary.get("label"),
        "domain": domain,
        "department": _infer_department(summary),
        "data_metrics": {
            "total_rows": total_rows,
            "total_columns": summary.get("total_columns", 0),
            "data_quality_score": quality,
            "avg_missing_pct": summary.get("avg_missing_pct", 0.0),
            "avg_outlier_pct": summary.get("avg_outlier_pct", 0.0),
            "target_column": summary.get("target_column"),
            "class_imbalance_ratio": summary.get("class_imbalance_ratio"),
        },
        "model_metrics": {
            "model_accuracy": round(model_accuracy, 4),
            "best_model": best_model_name,
            "effectiveness_score": round(effectiveness, 4),
            "has_training_results": training is not None,
        },
        "financial_estimates": {
            "estimated_annual_savings": round(annual_savings, 2),
            "implementation_cost": round(implementation_cost, 2),
            "annual_maintenance_cost": round(annual_maintenance, 2),
            "net_annual_benefit": round(net_annual, 2),
            "payback_period_years": round(payback_period, 2) if payback_period != float("inf") else None,
            "five_year_npv": round(npv, 2),
            "five_year_roi_pct": round(((npv + implementation_cost) / implementation_cost) * 100, 1) if implementation_cost > 0 else 0.0,
            "calculation_detail": detail,
        },
        "recommendation": (
            "Strong invest" if npv > 500_000
            else "Invest" if npv > 100_000
            else "Conditional" if npv > 0
            else "Needs review"
        ),
    }


# ── Endpoints ───────────────────────────────────────────────────────────────

@router.get("/portfolio")
def portfolio_ranking(
    sort_by: str = Query("quality", description="Sort key: quality | rows | columns"),
    department: Optional[str] = Query(None, description="Filter by department (case-insensitive substring match)"),
    has_model: Optional[bool] = Query(None, description="Filter by has_trained_model flag"),
    settings: Settings = Depends(get_settings),
):
    """
    Return a ranked list of ALL use cases with key metrics for portfolio decisions.
    """
    entries = _all_portfolio_entries(settings.output_dir)

    # Filters
    if department:
        dept_lower = department.lower()
        entries = [e for e in entries if dept_lower in e["department"].lower()
                   or dept_lower in (e.get("domain") or "").lower()
                   or dept_lower in (e.get("category") or "").lower()]
    if has_model is not None:
        entries = [e for e in entries if e["has_trained_model"] == has_model]

    # Sorting
    sort_key_map = {
        "quality": lambda e: e.get("data_quality_score", 0.0),
        "rows": lambda e: e.get("total_rows", 0),
        "columns": lambda e: e.get("total_columns", 0),
    }
    key_fn = sort_key_map.get(sort_by, sort_key_map["quality"])
    entries.sort(key=key_fn, reverse=True)

    # Add rank
    for idx, entry in enumerate(entries, start=1):
        entry["rank"] = idx

    return {
        "total": len(entries),
        "sort_by": sort_by,
        "filters": {"department": department, "has_model": has_model},
        "portfolio": entries,
    }


@router.post("/side-by-side")
def side_by_side_comparison(body: SideBySideRequest, settings: Settings = Depends(get_settings)):
    """
    Return detailed side-by-side comparison for a set of use case IDs.
    Body: { "uc_ids": ["uc_fr_01_fraud_scoring", "uc_cr_01_credit_scoring", ...] }
    """
    if not body.uc_ids:
        raise ValidationError("uc_ids list cannot be empty.")
    if len(body.uc_ids) > 10:
        raise ValidationError("Compare at most 10 use cases at a time.")

    results: List[Dict[str, Any]] = []
    not_found: List[str] = []

    for uc_id in body.uc_ids:
        uc_dir = settings.output_dir / uc_id
        if not uc_dir.is_dir():
            not_found.append(uc_id)
            continue
        summary = _load_summary(uc_dir)
        if summary is None:
            not_found.append(uc_id)
            continue
        training = _load_training_results(uc_dir)
        entry: Dict[str, Any] = {
            "uc_key": summary.get("use_case_key", uc_id),
            "label": summary.get("label", uc_id),
            "summary": summary,
            "training_results": training,
            "column_breakdown": {
                "total": summary.get("total_columns", 0),
                "numeric": summary.get("numeric_columns", 0),
                "categorical": summary.get("categorical_columns", 0),
            },
            "has_trained_model": _has_trained_model(uc_dir),
            "department": _infer_department(summary),
        }
        results.append(entry)

    # Compute relative rankings within comparison set
    if results:
        metric_fields = [
            ("data_quality_score", True),   # higher is better
            ("total_rows", True),
            ("total_columns", True),
            ("avg_missing_pct", False),     # lower is better
            ("avg_outlier_pct", False),     # lower is better
        ]
        rankings: Dict[str, Dict[str, Any]] = {}
        highlights: Dict[str, Dict[str, str]] = {}

        for field, higher_better in metric_fields:
            values = [(r["uc_key"], r["summary"].get(field, 0.0)) for r in results]
            sorted_vals = sorted(values, key=lambda x: x[1], reverse=higher_better)
            rankings[field] = {uc: rank + 1 for rank, (uc, _) in enumerate(sorted_vals)}
            if sorted_vals:
                highlights[field] = {
                    "best": sorted_vals[0][0],
                    "worst": sorted_vals[-1][0],
                }

        for r in results:
            r["relative_rankings"] = {field: rankings[field].get(r["uc_key"]) for field, _ in metric_fields}

    return {
        "compared": len(results),
        "not_found": not_found,
        "highlights": highlights if results else {},
        "use_cases": results,
    }


@router.get("/department-summary")
def department_summary(settings: Settings = Depends(get_settings)):
    """
    Return aggregated metrics per department.
    """
    entries = _all_portfolio_entries(settings.output_dir)
    dept_map: Dict[str, Dict[str, Any]] = {}

    for e in entries:
        dept = e["department"]
        if dept not in dept_map:
            dept_map[dept] = {
                "department": dept,
                "use_case_count": 0,
                "quality_scores": [],
                "trained_model_count": 0,
                "total_rows": 0,
                "best_uc": None,
                "best_quality": -1.0,
            }
        bucket = dept_map[dept]
        bucket["use_case_count"] += 1
        bucket["quality_scores"].append(e["data_quality_score"])
        if e["has_trained_model"]:
            bucket["trained_model_count"] += 1
        bucket["total_rows"] += e["total_rows"]
        if e["data_quality_score"] > bucket["best_quality"]:
            bucket["best_quality"] = e["data_quality_score"]
            bucket["best_uc"] = {
                "uc_key": e["uc_key"],
                "label": e["label"],
                "data_quality_score": e["data_quality_score"],
            }

    summaries = []
    for dept, bucket in sorted(dept_map.items()):
        scores = bucket["quality_scores"]
        avg_quality = sum(scores) / len(scores) if scores else 0.0
        summaries.append({
            "department": dept,
            "use_case_count": bucket["use_case_count"],
            "avg_data_quality": round(avg_quality, 2),
            "trained_model_count": bucket["trained_model_count"],
            "total_rows": bucket["total_rows"],
            "best_performing_uc": bucket["best_uc"],
        })

    # Sort by use_case_count descending
    summaries.sort(key=lambda s: s["use_case_count"], reverse=True)

    return {
        "total_departments": len(summaries),
        "total_use_cases": sum(s["use_case_count"] for s in summaries),
        "departments": summaries,
    }


@router.get("/business-case/{uc_id}")
def business_case(uc_id: str, settings: Settings = Depends(get_settings)):
    """
    Compute an estimated business case / ROI for a specific use case.
    """
    uc_dir = settings.output_dir / uc_id
    if not uc_dir.is_dir():
        raise NotFoundError(f"Use case directory not found: {uc_id}")

    summary = _load_summary(uc_dir)
    if summary is None:
        raise NotFoundError(f"summary.json not found for: {uc_id}")

    training = _load_training_results(uc_dir)
    return _compute_business_case(summary, training)
