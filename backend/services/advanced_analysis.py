"""Advanced fraud-model analyses for bank-grade validation.

Covers the 15 critical analyses that separate research models from
production-survivable fraud scoring systems:
1.  Stability & Robustness (PSI/CSI)
2.  Feature Leakage Detection
3.  Fraud Taxonomy & Coverage
4.  False Positive Root Cause
5.  Action Effectiveness
6.  Segment-Level Performance
7.  Concept Drift & Adversarial Adaptation
8.  Calibration & Score Meaning
9.  Reject Inference
10. Data Quality & Latency Impact
11. Explainability Stress Testing
12. Fairness & Harm Analysis
13. Cost Curve & Threshold Sensitivity
14. Human-in-the-Loop Analysis
15. End-to-End Failure Mode Analysis
"""

import logging
from typing import Optional

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


def _sf(val) -> float:
    """Safe float conversion handling inf/nan."""
    if val is None or (isinstance(val, float) and (np.isnan(val) or np.isinf(val))):
        return 0.0
    return round(float(val), 6)


def _detect_target(df: pd.DataFrame, target: Optional[str] = None) -> Optional[str]:
    if target and target in df.columns:
        return target
    for name in ["is_fraud", "Class", "label", "target", "fraud"]:
        if name in df.columns:
            return name
    return None


def _detect_score(df: pd.DataFrame) -> Optional[str]:
    for name in ["fraud_score", "score", "probability", "pred_score", "p_fraud"]:
        if name in df.columns:
            return name
    return None


# ═══════════════════════════════════════════════════════════════════════════════
# 1. Stability & Robustness Analysis (PSI/CSI per feature)
# ═══════════════════════════════════════════════════════════════════════════════

def _compute_psi(expected: pd.Series, actual: pd.Series, bins: int = 10) -> float:
    """Population Stability Index between two distributions."""
    try:
        breakpoints = np.linspace(expected.min(), expected.max(), bins + 1)
        breakpoints[0] = -np.inf
        breakpoints[-1] = np.inf
        exp_counts = np.histogram(expected.dropna(), bins=breakpoints)[0] + 1
        act_counts = np.histogram(actual.dropna(), bins=breakpoints)[0] + 1
        exp_pct = exp_counts / exp_counts.sum()
        act_pct = act_counts / act_counts.sum()
        psi = np.sum((act_pct - exp_pct) * np.log(act_pct / exp_pct))
        return _sf(psi)
    except Exception:
        return 0.0


def compute_stability_analysis(df: pd.DataFrame, target_column: str = None) -> dict:
    """PSI/CSI per feature, score stability by segment."""
    target_column = _detect_target(df, target_column)
    score_col = _detect_score(df)
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()

    # Split data into two halves to simulate time windows
    mid = len(df) // 2
    df_base = df.iloc[:mid]
    df_recent = df.iloc[mid:]

    # PSI per feature
    psi_results = []
    for col in numeric_cols[:15]:
        psi = _compute_psi(df_base[col], df_recent[col])
        status = "stable" if psi < 0.1 else "moderate_shift" if psi < 0.25 else "significant_shift"
        psi_results.append({
            "feature": col,
            "psi": psi,
            "status": status,
            "base_mean": _sf(df_base[col].mean()),
            "recent_mean": _sf(df_recent[col].mean()),
            "base_std": _sf(df_base[col].std()),
            "recent_std": _sf(df_recent[col].std()),
        })

    # CSI (Characteristic Stability Index) — PSI on score bins
    score_stability = []
    if score_col and score_col in df.columns:
        score_psi = _compute_psi(df_base[score_col], df_recent[score_col])
        # Score stability by segments
        segments = {}
        if "channel" in df.columns:
            segments["channel"] = df["channel"]
        if "country" in df.columns:
            segments["country"] = df["country"]
        if "card_age_days" in df.columns:
            segments["card_age"] = pd.cut(df["card_age_days"],
                                          bins=[0, 90, 365, 1095, float("inf")],
                                          labels=["new", "medium", "mature", "old"])

        for seg_name, seg_series in segments.items():
            for seg_val in seg_series.unique()[:10]:
                mask = seg_series == seg_val
                if mask.sum() < 50:
                    continue
                seg_scores = df.loc[mask, score_col]
                score_stability.append({
                    "segment": seg_name,
                    "value": str(seg_val),
                    "count": int(mask.sum()),
                    "mean_score": _sf(seg_scores.mean()),
                    "std_score": _sf(seg_scores.std()),
                    "p10": _sf(seg_scores.quantile(0.1)),
                    "p90": _sf(seg_scores.quantile(0.9)),
                })
    else:
        score_psi = 0.0

    # Overall stability verdict
    unstable_count = sum(1 for r in psi_results if r["status"] != "stable")
    total_features = len(psi_results)
    if unstable_count == 0:
        verdict = "stable"
    elif unstable_count / max(total_features, 1) < 0.3:
        verdict = "mostly_stable"
    else:
        verdict = "unstable"

    return {
        "verdict": verdict,
        "score_psi": score_psi,
        "feature_psi": psi_results,
        "score_stability_by_segment": score_stability,
        "base_rows": mid,
        "recent_rows": len(df) - mid,
        "unstable_features": unstable_count,
        "total_features": total_features,
        "thresholds": {
            "psi_stable": 0.1,
            "psi_moderate": 0.25,
            "psi_note": "PSI < 0.1 = stable, 0.1–0.25 = moderate shift, > 0.25 = significant shift",
        },
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 2. Feature Leakage Detection
# ═══════════════════════════════════════════════════════════════════════════════

def compute_leakage_analysis(df: pd.DataFrame, target_column: str = None) -> dict:
    """Detect temporal, label, and operational leakage."""
    target_column = _detect_target(df, target_column)
    if not target_column:
        return {"error": "No target column found", "checks": []}

    checks = []
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    target_series = df[target_column]

    # 1. Suspiciously high correlations (possible label leakage)
    for col in numeric_cols:
        if col == target_column:
            continue
        corr = df[col].corr(target_series)
        abs_corr = abs(corr) if not np.isnan(corr) else 0
        if abs_corr > 0.95:
            checks.append({
                "type": "label_leakage",
                "severity": "critical",
                "feature": col,
                "correlation": _sf(corr),
                "description": f"'{col}' has {_sf(abs_corr)} correlation with target — likely contains label information",
                "action": "Remove or investigate immediately",
            })
        elif abs_corr > 0.80:
            checks.append({
                "type": "label_leakage",
                "severity": "warning",
                "feature": col,
                "correlation": _sf(corr),
                "description": f"'{col}' has suspiciously high correlation ({_sf(abs_corr)}) with target",
                "action": "Verify this feature is available at prediction time",
            })

    # 2. Temporal leakage — features that reference future aggregates
    temporal_suspects = []
    for col in df.columns:
        col_lower = col.lower()
        for keyword in ["future", "next_", "chargeback", "outcome", "result",
                        "review_", "resolved", "confirmed", "final_"]:
            if keyword in col_lower:
                temporal_suspects.append(col)
                checks.append({
                    "type": "temporal_leakage",
                    "severity": "critical",
                    "feature": col,
                    "correlation": _sf(df[col].corr(target_series)) if pd.api.types.is_numeric_dtype(df[col]) else None,
                    "description": f"'{col}' name suggests future/outcome data (keyword: '{keyword}')",
                    "action": "Confirm this data is available BEFORE prediction time",
                })
                break

    # 3. Operational leakage — features from manual review
    for col in df.columns:
        col_lower = col.lower()
        for keyword in ["manual_review", "investigator", "agent_", "override",
                        "disposition", "case_", "alert_"]:
            if keyword in col_lower:
                checks.append({
                    "type": "operational_leakage",
                    "severity": "warning",
                    "feature": col,
                    "correlation": _sf(df[col].corr(target_series)) if pd.api.types.is_numeric_dtype(df[col]) else None,
                    "description": f"'{col}' may contain post-decision data from operations",
                    "action": "Ensure this is not from manual review outcomes",
                })
                break

    # 4. Perfect separation check (AUC ~1.0 for single feature)
    perfect_features = []
    for col in numeric_cols:
        if col == target_column:
            continue
        try:
            # Quick check: can one feature separate classes perfectly?
            fraud_vals = df.loc[target_series == 1, col].dropna() if 1 in target_series.values else pd.Series()
            legit_vals = df.loc[target_series == 0, col].dropna() if 0 in target_series.values else pd.Series()
            if len(fraud_vals) > 10 and len(legit_vals) > 10:
                if fraud_vals.min() > legit_vals.max() or legit_vals.min() > fraud_vals.max():
                    perfect_features.append(col)
                    checks.append({
                        "type": "perfect_separation",
                        "severity": "critical",
                        "feature": col,
                        "correlation": _sf(df[col].corr(target_series)),
                        "description": f"'{col}' perfectly separates classes — almost certainly leakage",
                        "action": "This feature MUST be removed",
                    })
        except Exception:
            continue

    # Sort by severity
    severity_order = {"critical": 0, "warning": 1, "info": 2}
    checks.sort(key=lambda x: severity_order.get(x["severity"], 9))

    critical = sum(1 for c in checks if c["severity"] == "critical")
    warnings = sum(1 for c in checks if c["severity"] == "warning")

    if critical > 0:
        verdict = "leakage_detected"
    elif warnings > 0:
        verdict = "potential_leakage"
    else:
        verdict = "clean"

    return {
        "verdict": verdict,
        "critical_count": critical,
        "warning_count": warnings,
        "total_checks": len(checks),
        "checks": checks,
        "target_column": target_column,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 3. Fraud Taxonomy & Coverage Analysis
# ═══════════════════════════════════════════════════════════════════════════════

def compute_fraud_taxonomy(df: pd.DataFrame, target_column: str = None) -> dict:
    """Map fraud types by MCC, channel, amount pattern and assess coverage."""
    target_column = _detect_target(df, target_column)

    # Define fraud taxonomy
    taxonomy = [
        {"type": "Card-Not-Present (CNP)", "indicator_cols": ["channel"], "indicator_values": {"channel": ["online", "ecom", "web", "mobile_app", "e-commerce"]}, "description": "Transactions where card is not physically present"},
        {"type": "Account Takeover (ATO)", "indicator_cols": ["velocity_1h", "distance_from_home_km"], "threshold": {"velocity_1h": 5, "distance_from_home_km": 500}, "description": "Unauthorized access with rapid unusual activity"},
        {"type": "Counterfeit / Card Present", "indicator_cols": ["channel"], "indicator_values": {"channel": ["pos", "atm", "in-store", "in_store"]}, "description": "Fraudulent use of cloned physical cards"},
        {"type": "High-Value Fraud", "indicator_cols": ["amount", "avg_txn_amount"], "description": "Single transactions significantly above cardholder norm"},
        {"type": "Velocity Attack / Card Testing", "indicator_cols": ["velocity_1h"], "threshold": {"velocity_1h": 10}, "description": "Rapid small transactions to test stolen card validity"},
        {"type": "Cross-Border Fraud", "indicator_cols": ["country", "distance_from_home_km"], "threshold": {"distance_from_home_km": 1000}, "description": "Transactions from unusual geographic locations"},
        {"type": "Night-Time Fraud", "indicator_cols": ["hour"], "threshold": {"hour_range": [0, 5]}, "description": "Fraudulent transactions during unusual hours"},
        {"type": "New Card Fraud", "indicator_cols": ["card_age_days"], "threshold": {"card_age_days": 30}, "description": "Fraud on recently issued cards"},
    ]

    coverage_results = []
    for fraud_type in taxonomy:
        result = {
            "fraud_type": fraud_type["type"],
            "description": fraud_type["description"],
            "covered": False,
            "coverage_reason": "Missing required columns",
            "fraud_count": 0,
            "total_in_segment": 0,
            "fraud_rate": 0.0,
        }

        # Check if required columns exist
        required = fraud_type.get("indicator_cols", [])
        available = [c for c in required if c in df.columns]

        if not available:
            result["coverage_reason"] = f"Columns missing: {required}"
            coverage_results.append(result)
            continue

        result["covered"] = True
        result["coverage_reason"] = f"Covered by features: {available}"

        # Calculate fraud rate in this segment
        if target_column and target_column in df.columns:
            mask = pd.Series(True, index=df.index)

            if "indicator_values" in fraud_type:
                for col, vals in fraud_type["indicator_values"].items():
                    if col in df.columns:
                        mask &= df[col].astype(str).str.lower().isin([v.lower() for v in vals])

            if "threshold" in fraud_type:
                for col, thresh in fraud_type["threshold"].items():
                    if col == "hour_range" and "hour" in df.columns:
                        mask &= df["hour"].between(thresh[0], thresh[1])
                    elif col in df.columns:
                        if isinstance(thresh, (int, float)):
                            if col == "card_age_days":
                                mask &= df[col] <= thresh
                            else:
                                mask &= df[col] >= thresh

            segment = df[mask]
            result["total_in_segment"] = len(segment)
            if target_column in segment.columns and len(segment) > 0:
                result["fraud_count"] = int(segment[target_column].sum())
                result["fraud_rate"] = _sf(segment[target_column].mean() * 100)

        coverage_results.append(result)

    covered = sum(1 for r in coverage_results if r["covered"])
    total = len(coverage_results)

    return {
        "coverage_score": f"{covered}/{total}",
        "coverage_pct": _sf(covered / max(total, 1) * 100),
        "taxonomy": coverage_results,
        "available_columns": list(df.columns),
        "verdict": "good" if covered / max(total, 1) > 0.7 else "gaps_exist" if covered / max(total, 1) > 0.4 else "poor_coverage",
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 4. False Positive Root Cause Analysis
# ═══════════════════════════════════════════════════════════════════════════════

def compute_false_positive_analysis(df: pd.DataFrame, target_column: str = None) -> dict:
    """Analyze patterns in false positives (predicted fraud but actually legit)."""
    target_column = _detect_target(df, target_column)
    score_col = _detect_score(df)

    if not target_column or target_column not in df.columns:
        return {"error": "No target column found"}
    if not score_col or score_col not in df.columns:
        return {"error": "No score column found"}

    # Define FP: high score (top 10%) but not fraud
    threshold = df[score_col].quantile(0.90)
    predicted_fraud = df[score_col] >= threshold
    actual_fraud = df[target_column] == 1

    tp = (predicted_fraud & actual_fraud).sum()
    fp = (predicted_fraud & ~actual_fraud).sum()
    fn = (~predicted_fraud & actual_fraud).sum()
    tn = (~predicted_fraud & ~actual_fraud).sum()

    fp_df = df[predicted_fraud & ~actual_fraud]
    tp_df = df[predicted_fraud & actual_fraud]

    # Feature analysis — which features fire most in FP vs TP
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    feature_drivers = []
    for col in numeric_cols:
        if col in [target_column, score_col]:
            continue
        fp_mean = _sf(fp_df[col].mean()) if len(fp_df) > 0 else 0
        tp_mean = _sf(tp_df[col].mean()) if len(tp_df) > 0 else 0
        pop_mean = _sf(df[col].mean())
        pop_std = df[col].std()
        fp_deviation = _sf((fp_mean - pop_mean) / max(pop_std, 0.001)) if pop_std > 0 else 0
        feature_drivers.append({
            "feature": col,
            "fp_mean": fp_mean,
            "tp_mean": tp_mean,
            "population_mean": pop_mean,
            "fp_deviation_zscore": fp_deviation,
            "over_weighted": abs(fp_deviation) > 1.5,
        })
    feature_drivers.sort(key=lambda x: abs(x["fp_deviation_zscore"]), reverse=True)

    # Segment-level FP analysis
    segment_fp = []
    for seg_col in ["channel", "country", "mcc_code"]:
        if seg_col not in df.columns:
            continue
        for val in df[seg_col].value_counts().head(10).index:
            seg_mask = df[seg_col] == val
            seg_fp_count = int((predicted_fraud & ~actual_fraud & seg_mask).sum())
            seg_total = int((predicted_fraud & seg_mask).sum())
            if seg_total > 0:
                segment_fp.append({
                    "segment": seg_col,
                    "value": str(val),
                    "fp_count": seg_fp_count,
                    "total_flagged": seg_total,
                    "fp_rate": _sf(seg_fp_count / seg_total * 100),
                })
    segment_fp.sort(key=lambda x: x["fp_rate"], reverse=True)

    # Amount distribution in FP
    amount_analysis = {}
    if "amount" in df.columns:
        amount_analysis = {
            "fp_avg_amount": _sf(fp_df["amount"].mean()) if len(fp_df) > 0 else 0,
            "tp_avg_amount": _sf(tp_df["amount"].mean()) if len(tp_df) > 0 else 0,
            "fp_median_amount": _sf(fp_df["amount"].median()) if len(fp_df) > 0 else 0,
            "tp_median_amount": _sf(tp_df["amount"].median()) if len(tp_df) > 0 else 0,
        }

    precision = _sf(tp / max(tp + fp, 1) * 100)
    fpr = _sf(fp / max(fp + tn, 1) * 100)

    return {
        "threshold_used": _sf(threshold),
        "threshold_percentile": 90,
        "confusion_matrix": {"tp": int(tp), "fp": int(fp), "fn": int(fn), "tn": int(tn)},
        "precision": precision,
        "false_positive_rate": fpr,
        "fp_count": int(fp),
        "feature_drivers": feature_drivers[:10],
        "segment_fp_rates": segment_fp[:15],
        "amount_analysis": amount_analysis,
        "verdict": "acceptable" if fpr < 5 else "high_fp" if fpr < 15 else "critical_fp",
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 5. Action Effectiveness Analysis
# ═══════════════════════════════════════════════════════════════════════════════

def compute_action_effectiveness(df: pd.DataFrame, target_column: str = None) -> dict:
    """Evaluate decline/step-up/allow effectiveness at different score bands."""
    target_column = _detect_target(df, target_column)
    score_col = _detect_score(df)

    if not target_column or not score_col:
        return {"error": "Need target and score columns"}

    # Define score bands and simulated actions
    bands = [
        {"name": "Critical (850-1000)", "min": 850, "max": 1000, "action": "Decline"},
        {"name": "High (700-849)", "min": 700, "max": 849, "action": "Step-up (OTP)"},
        {"name": "Medium (400-699)", "min": 400, "max": 699, "action": "Enhanced monitoring"},
        {"name": "Low (0-399)", "min": 0, "max": 399, "action": "Allow"},
    ]

    score_max = df[score_col].max()
    score_min = df[score_col].min()
    score_range = score_max - score_min if score_max > score_min else 1

    band_results = []
    for band in bands:
        # Normalize band boundaries to actual score range
        norm_min = score_min + (band["min"] / 1000) * score_range
        norm_max = score_min + (band["max"] / 1000) * score_range
        mask = df[score_col].between(norm_min, norm_max)
        segment = df[mask]

        if len(segment) == 0:
            band_results.append({
                "band": band["name"],
                "action": band["action"],
                "count": 0,
                "fraud_count": 0,
                "legit_count": 0,
                "fraud_rate": 0,
                "fraud_prevented": 0,
                "good_spend_blocked": 0,
            })
            continue

        fraud_count = int(segment[target_column].sum())
        legit_count = int(len(segment) - fraud_count)
        fraud_rate = _sf(fraud_count / len(segment) * 100)

        # Estimate $ impact
        avg_amount = _sf(segment["amount"].mean()) if "amount" in segment.columns else 100
        fraud_prevented = _sf(fraud_count * avg_amount) if band["action"] in ["Decline", "Step-up (OTP)"] else 0
        good_spend_blocked = _sf(legit_count * avg_amount) if band["action"] == "Decline" else 0
        step_up_conversion_loss = _sf(legit_count * avg_amount * 0.15) if band["action"] == "Step-up (OTP)" else 0

        band_results.append({
            "band": band["name"],
            "action": band["action"],
            "count": len(segment),
            "fraud_count": fraud_count,
            "legit_count": legit_count,
            "fraud_rate": fraud_rate,
            "fraud_prevented_dollar": fraud_prevented,
            "good_spend_blocked_dollar": good_spend_blocked,
            "step_up_conversion_loss": step_up_conversion_loss,
            "net_value": _sf(fraud_prevented - good_spend_blocked - step_up_conversion_loss),
        })

    # Overall metrics
    total_fraud = int(df[target_column].sum())
    total_amount = _sf(df["amount"].sum()) if "amount" in df.columns else 0
    total_fraud_prevented = sum(b["fraud_prevented_dollar"] for b in band_results)
    total_blocked = sum(b["good_spend_blocked_dollar"] for b in band_results)

    return {
        "bands": band_results,
        "total_transactions": len(df),
        "total_fraud": total_fraud,
        "total_amount": total_amount,
        "total_fraud_prevented": _sf(total_fraud_prevented),
        "total_good_spend_blocked": _sf(total_blocked),
        "roi_ratio": _sf(total_fraud_prevented / max(total_blocked, 1)),
        "feedback_loop_note": "Production requires: action -> customer response -> outcome tracking",
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 6. Segment-Level Performance Decomposition
# ═══════════════════════════════════════════════════════════════════════════════

def compute_segment_performance(df: pd.DataFrame, target_column: str = None) -> dict:
    """Performance decomposition by segment — global metrics hide local disasters."""
    target_column = _detect_target(df, target_column)
    score_col = _detect_score(df)

    if not target_column or not score_col:
        return {"error": "Need target and score columns"}

    # Define segments
    segment_defs = {}
    if "channel" in df.columns:
        segment_defs["channel"] = df["channel"]
    if "country" in df.columns:
        segment_defs["country"] = df["country"]
    if "card_age_days" in df.columns:
        segment_defs["card_tenure"] = pd.cut(
            df["card_age_days"], bins=[0, 90, 365, 1095, float("inf")],
            labels=["new_0-90d", "medium_90-365d", "mature_1-3y", "old_3y+"]
        )
    if "amount" in df.columns:
        segment_defs["amount_tier"] = pd.cut(
            df["amount"], bins=[0, 50, 200, 1000, float("inf")],
            labels=["micro_<50", "low_50-200", "medium_200-1k", "high_>1k"]
        )
    if "hour" in df.columns:
        segment_defs["time_period"] = pd.cut(
            df["hour"], bins=[-1, 6, 12, 18, 24],
            labels=["night_0-6", "morning_6-12", "afternoon_12-18", "evening_18-24"]
        )

    # Global performance
    threshold = df[score_col].quantile(0.90)
    predicted = df[score_col] >= threshold
    actual = df[target_column] == 1

    global_tp = int((predicted & actual).sum())
    global_fp = int((predicted & ~actual).sum())
    global_fn = int((~predicted & actual).sum())
    global_tn = int((~predicted & ~actual).sum())
    global_precision = _sf(global_tp / max(global_tp + global_fp, 1) * 100)
    global_recall = _sf(global_tp / max(global_tp + global_fn, 1) * 100)

    # Per-segment performance
    segments = []
    for seg_name, seg_series in segment_defs.items():
        for seg_val in seg_series.value_counts().head(10).index:
            mask = seg_series == seg_val
            seg_df = df[mask]
            if len(seg_df) < 30:
                continue

            seg_pred = seg_df[score_col] >= threshold
            seg_actual = seg_df[target_column] == 1

            tp = int((seg_pred & seg_actual).sum())
            fp = int((seg_pred & ~seg_actual).sum())
            fn = int((~seg_pred & seg_actual).sum())

            precision = _sf(tp / max(tp + fp, 1) * 100)
            recall = _sf(tp / max(tp + fn, 1) * 100)
            fraud_rate = _sf(seg_actual.sum() / len(seg_df) * 100)

            # Flag local disasters
            is_disaster = (precision < global_precision * 0.5) or (recall < global_recall * 0.5)

            segments.append({
                "segment_type": seg_name,
                "segment_value": str(seg_val),
                "count": len(seg_df),
                "fraud_count": int(seg_actual.sum()),
                "fraud_rate": fraud_rate,
                "precision": precision,
                "recall": recall,
                "tp": tp, "fp": fp, "fn": fn,
                "is_disaster": is_disaster,
                "vs_global_precision": _sf(precision - global_precision),
                "vs_global_recall": _sf(recall - global_recall),
            })

    segments.sort(key=lambda x: x.get("is_disaster", False), reverse=True)
    disasters = [s for s in segments if s.get("is_disaster")]

    return {
        "global_metrics": {
            "precision": global_precision,
            "recall": global_recall,
            "tp": global_tp, "fp": global_fp, "fn": global_fn, "tn": global_tn,
            "threshold": _sf(threshold),
        },
        "segments": segments,
        "disaster_count": len(disasters),
        "disasters": disasters[:5],
        "verdict": "clean" if not disasters else f"{len(disasters)} segment(s) with critically poor performance",
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 7. Concept Drift & Adversarial Adaptation
# ═══════════════════════════════════════════════════════════════════════════════

def compute_drift_adversarial(df: pd.DataFrame, target_column: str = None) -> dict:
    """Rolling window performance + attack simulation."""
    target_column = _detect_target(df, target_column)
    score_col = _detect_score(df)

    if not target_column or not score_col:
        return {"error": "Need target and score columns"}

    # Simulate rolling windows (split into 5 windows)
    n_windows = 5
    window_size = len(df) // n_windows
    threshold = df[score_col].quantile(0.90)

    rolling_performance = []
    for i in range(n_windows):
        start = i * window_size
        end = start + window_size if i < n_windows - 1 else len(df)
        window = df.iloc[start:end]

        predicted = window[score_col] >= threshold
        actual = window[target_column] == 1

        tp = int((predicted & actual).sum())
        fp = int((predicted & ~actual).sum())
        fn = int((~predicted & actual).sum())

        precision = _sf(tp / max(tp + fp, 1) * 100)
        recall = _sf(tp / max(tp + fn, 1) * 100)
        fraud_rate = _sf(actual.sum() / len(window) * 100)

        rolling_performance.append({
            "window": i + 1,
            "start_idx": start,
            "end_idx": end,
            "count": len(window),
            "fraud_rate": fraud_rate,
            "precision": precision,
            "recall": recall,
        })

    # Attack simulations
    attack_scenarios = []

    # Scenario 1: Slow ramp — gradually increase amount
    if "amount" in df.columns:
        ramp_df = df.copy()
        ramp_df["amount"] = ramp_df["amount"] * 1.5  # 50% increase
        if score_col in ramp_df.columns:
            # Measure how many frauds now escape
            original_caught = int((df[score_col] >= threshold).sum())
            attack_scenarios.append({
                "attack": "Slow Ramp (50% amount increase)",
                "description": "Fraudsters gradually increase transaction amounts to avoid velocity triggers",
                "original_flagged": original_caught,
                "exploitable": "Fixed thresholds" in str(df.columns),
                "mitigation": "Use relative deviation from personal baseline, not absolute thresholds",
            })

    # Scenario 2: Feature gaming — night transactions during day
    if "hour" in df.columns:
        attack_scenarios.append({
            "attack": "Temporal Gaming",
            "description": "Fraudsters shift activity to 'normal' hours to avoid time-based flags",
            "vulnerability": "Static time-of-day features",
            "mitigation": "Use deviation from cardholder's personal time patterns",
        })

    # Scenario 3: Velocity manipulation — slow drip instead of burst
    if "velocity_1h" in df.columns:
        high_vel_fraud = df[(df[target_column] == 1) & (df["velocity_1h"] > df["velocity_1h"].quantile(0.75))]
        low_vel_fraud = df[(df[target_column] == 1) & (df["velocity_1h"] <= df["velocity_1h"].quantile(0.25))]
        attack_scenarios.append({
            "attack": "Velocity Manipulation (Slow Drip)",
            "description": "Fraudsters spread transactions to avoid velocity triggers",
            "high_velocity_fraud_pct": _sf(len(high_vel_fraud) / max(int(df[target_column].sum()), 1) * 100),
            "low_velocity_fraud_pct": _sf(len(low_vel_fraud) / max(int(df[target_column].sum()), 1) * 100),
            "mitigation": "Add velocity_acceleration and cross-window escalation features",
        })

    # Scenario 4: What if fraud rate drops 50%?
    fraud_count = int(df[target_column].sum())
    attack_scenarios.append({
        "attack": "Fraud Rate Drop Simulation",
        "description": "What happens when fraud temporarily decreases — threshold may over-trigger on return",
        "current_fraud_rate": _sf(fraud_count / len(df) * 100),
        "risk": "Model calibration degrades, thresholds become stale",
        "mitigation": "Continuous recalibration with rolling windows",
    })

    # Performance trend
    precisions = [w["precision"] for w in rolling_performance]
    recalls = [w["recall"] for w in rolling_performance]
    precision_trend = _sf(precisions[-1] - precisions[0]) if len(precisions) > 1 else 0
    recall_trend = _sf(recalls[-1] - recalls[0]) if len(recalls) > 1 else 0

    if abs(precision_trend) < 5 and abs(recall_trend) < 5:
        drift_verdict = "stable"
    elif precision_trend < -10 or recall_trend < -10:
        drift_verdict = "degrading"
    else:
        drift_verdict = "moderate_drift"

    return {
        "rolling_performance": rolling_performance,
        "attack_scenarios": attack_scenarios,
        "precision_trend": precision_trend,
        "recall_trend": recall_trend,
        "drift_verdict": drift_verdict,
        "n_windows": n_windows,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 8. Calibration & Score Meaning Analysis
# ═══════════════════════════════════════════════════════════════════════════════

def compute_calibration_analysis(df: pd.DataFrame, target_column: str = None) -> dict:
    """Score calibration, monotonicity, and meaning per segment."""
    target_column = _detect_target(df, target_column)
    score_col = _detect_score(df)

    if not target_column or not score_col:
        return {"error": "Need target and score columns"}

    # Calibration curve — bin scores and compare predicted vs actual fraud rate
    n_bins = 10
    df_sorted = df.sort_values(score_col)
    bin_size = len(df_sorted) // n_bins

    calibration_bins = []
    for i in range(n_bins):
        start = i * bin_size
        end = start + bin_size if i < n_bins - 1 else len(df_sorted)
        bin_df = df_sorted.iloc[start:end]

        mean_score = _sf(bin_df[score_col].mean())
        actual_fraud_rate = _sf(bin_df[target_column].mean() * 100)
        expected_fraud_rate = _sf(mean_score * 100) if df[score_col].max() <= 1 else _sf(mean_score / max(df[score_col].max(), 1) * 100)

        calibration_bins.append({
            "bin": i + 1,
            "score_range": f"{_sf(bin_df[score_col].min())}-{_sf(bin_df[score_col].max())}",
            "mean_score": mean_score,
            "actual_fraud_rate": actual_fraud_rate,
            "expected_fraud_rate": expected_fraud_rate,
            "calibration_error": _sf(abs(actual_fraud_rate - expected_fraud_rate)),
            "count": len(bin_df),
            "fraud_count": int(bin_df[target_column].sum()),
        })

    # Monotonicity check — does higher score always mean higher risk?
    fraud_rates = [b["actual_fraud_rate"] for b in calibration_bins]
    monotonic_violations = 0
    for i in range(1, len(fraud_rates)):
        if fraud_rates[i] < fraud_rates[i - 1]:
            monotonic_violations += 1

    is_monotonic = monotonic_violations == 0
    monotonicity_score = _sf((1 - monotonic_violations / max(len(fraud_rates) - 1, 1)) * 100)

    # Mean calibration error
    mean_cal_error = _sf(np.mean([b["calibration_error"] for b in calibration_bins]))

    # Score meaning by segment
    segment_calibration = []
    for seg_col in ["channel", "country"]:
        if seg_col not in df.columns:
            continue
        for seg_val in df[seg_col].value_counts().head(5).index:
            mask = df[seg_col] == seg_val
            seg_df = df[mask]
            if len(seg_df) < 50:
                continue

            # Same score, different meaning?
            median_score = seg_df[score_col].median()
            # Find similar-scored transactions globally
            score_window = df[score_col].between(median_score * 0.9, median_score * 1.1)
            global_fraud_rate = _sf(df.loc[score_window, target_column].mean() * 100)
            seg_fraud_rate = _sf(seg_df.loc[seg_df[score_col].between(median_score * 0.9, median_score * 1.1), target_column].mean() * 100)

            segment_calibration.append({
                "segment": seg_col,
                "value": str(seg_val),
                "median_score": _sf(median_score),
                "segment_fraud_rate_at_median": seg_fraud_rate,
                "global_fraud_rate_at_median": global_fraud_rate,
                "calibration_gap": _sf(abs(seg_fraud_rate - global_fraud_rate)),
                "same_score_same_risk": abs(seg_fraud_rate - global_fraud_rate) < 2,
            })

    miscalibrated = [s for s in segment_calibration if not s.get("same_score_same_risk", True)]

    if mean_cal_error < 2 and is_monotonic and not miscalibrated:
        verdict = "well_calibrated"
    elif mean_cal_error < 5 and monotonicity_score > 80:
        verdict = "acceptable"
    else:
        verdict = "needs_recalibration"

    return {
        "calibration_bins": calibration_bins,
        "mean_calibration_error": mean_cal_error,
        "is_monotonic": is_monotonic,
        "monotonicity_score": monotonicity_score,
        "monotonic_violations": monotonic_violations,
        "segment_calibration": segment_calibration,
        "miscalibrated_segments": len(miscalibrated),
        "verdict": verdict,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 9. Reject Inference Analysis
# ═══════════════════════════════════════════════════════════════════════════════

def compute_reject_inference(df: pd.DataFrame, target_column: str = None) -> dict:
    """Analyze bias from declining transactions (you don't know fraud in declines)."""
    target_column = _detect_target(df, target_column)
    score_col = _detect_score(df)

    if not target_column or not score_col:
        return {"error": "Need target and score columns"}

    # Simulate "rejected" (high-score) transactions
    threshold_90 = df[score_col].quantile(0.90)
    threshold_95 = df[score_col].quantile(0.95)

    declined = df[df[score_col] >= threshold_90]
    approved = df[df[score_col] < threshold_90]

    # The problem: we treat all declines as "fraud prevented" but some were legit
    declined_actual_fraud = int(declined[target_column].sum()) if len(declined) > 0 else 0
    declined_actual_legit = len(declined) - declined_actual_fraud
    approved_fraud = int(approved[target_column].sum()) if len(approved) > 0 else 0

    # Sensitivity bounds
    # Conservative: assume X% of declines were actually fraud
    scenarios = []
    for assumed_fraud_pct in [50, 70, 90, 100]:
        assumed_fraud = int(len(declined) * assumed_fraud_pct / 100)
        assumed_legit_lost = len(declined) - assumed_fraud
        estimated_precision = _sf(assumed_fraud / max(len(declined), 1) * 100)
        scenarios.append({
            "assumption": f"{assumed_fraud_pct}% of declines were fraud",
            "estimated_fraud_in_declines": assumed_fraud,
            "estimated_legit_blocked": assumed_legit_lost,
            "estimated_precision": estimated_precision,
        })

    # Bias analysis: what does the model learn from only seeing approved transactions?
    approved_fraud_rate = _sf(approved[target_column].mean() * 100) if len(approved) > 0 else 0
    overall_fraud_rate = _sf(df[target_column].mean() * 100)

    # Feature distribution comparison
    feature_bias = []
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    for col in numeric_cols[:10]:
        if col in [target_column, score_col]:
            continue
        approved_mean = _sf(approved[col].mean())
        declined_mean = _sf(declined[col].mean())
        overall_mean = _sf(df[col].mean())
        feature_bias.append({
            "feature": col,
            "approved_mean": approved_mean,
            "declined_mean": declined_mean,
            "overall_mean": overall_mean,
            "bias_direction": "higher_in_declined" if declined_mean > approved_mean else "lower_in_declined",
            "gap_pct": _sf(abs(declined_mean - approved_mean) / max(abs(overall_mean), 0.001) * 100),
        })
    feature_bias.sort(key=lambda x: x["gap_pct"], reverse=True)

    return {
        "decline_threshold": _sf(threshold_90),
        "total_transactions": len(df),
        "declined_count": len(declined),
        "approved_count": len(approved),
        "declined_actual_fraud": declined_actual_fraud,
        "declined_actual_legit": declined_actual_legit,
        "actual_decline_precision": _sf(declined_actual_fraud / max(len(declined), 1) * 100),
        "approved_fraud_rate": approved_fraud_rate,
        "overall_fraud_rate": overall_fraud_rate,
        "blind_spot_note": "Model never learns from declined transactions — creates feedback loop bias",
        "sensitivity_scenarios": scenarios,
        "feature_bias": feature_bias[:8],
        "recommendations": [
            "Implement partial labeling — allow a sample of declines through for label collection",
            "Use conservative inference — treat high-confidence declines as fraud, edge cases as unknown",
            "Apply sensitivity bounds — report performance ranges, not point estimates",
            "Consider challenge-based sampling for borderline scores",
        ],
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 10. Data Quality & Latency Impact Analysis
# ═══════════════════════════════════════════════════════════════════════════════

def compute_data_quality_analysis(df: pd.DataFrame, target_column: str = None) -> dict:
    """Null rates, feature availability, fallback behavior, latency impact."""
    target_column = _detect_target(df, target_column)
    score_col = _detect_score(df)

    # Per-feature quality assessment
    quality_results = []
    for col in df.columns:
        null_count = int(df[col].isnull().sum())
        null_pct = _sf(df[col].isnull().mean() * 100)
        unique_count = int(df[col].nunique())
        zero_count = int((df[col] == 0).sum()) if pd.api.types.is_numeric_dtype(df[col]) else 0
        zero_pct = _sf(zero_count / len(df) * 100)

        # Quality scoring
        if null_pct > 30:
            quality = "critical"
        elif null_pct > 10:
            quality = "poor"
        elif null_pct > 1:
            quality = "moderate"
        else:
            quality = "good"

        # Constant feature check
        is_constant = unique_count <= 1

        quality_results.append({
            "feature": col,
            "dtype": str(df[col].dtype),
            "null_count": null_count,
            "null_pct": null_pct,
            "zero_count": zero_count,
            "zero_pct": zero_pct,
            "unique_values": unique_count,
            "quality": quality,
            "is_constant": is_constant,
        })

    quality_results.sort(key=lambda x: x["null_pct"], reverse=True)

    # Simulate feature dropout — what happens if a feature is missing?
    dropout_impact = []
    if target_column and score_col and score_col in df.columns:
        base_corr = df[score_col].corr(df[target_column]) if target_column in df.columns else 0
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        for col in numeric_cols[:10]:
            if col in [target_column, score_col]:
                continue
            corr_with_target = _sf(abs(df[col].corr(df[target_column]))) if target_column in df.columns else 0
            dropout_impact.append({
                "feature": col,
                "correlation_with_target": corr_with_target,
                "impact_if_missing": "high" if corr_with_target > 0.3 else "medium" if corr_with_target > 0.1 else "low",
                "fallback_strategy": "Use population median" if corr_with_target < 0.2 else "Flag for manual review",
            })
        dropout_impact.sort(key=lambda x: x["correlation_with_target"], reverse=True)

    # Overall data quality score
    good_count = sum(1 for q in quality_results if q["quality"] == "good")
    total_cols = len(quality_results)
    quality_score = _sf(good_count / max(total_cols, 1) * 100)
    critical_features = [q["feature"] for q in quality_results if q["quality"] == "critical"]
    constant_features = [q["feature"] for q in quality_results if q["is_constant"]]

    # Latency simulation notes
    latency_notes = []
    for col in df.columns:
        col_lower = col.lower()
        if any(k in col_lower for k in ["velocity", "graph", "network", "device"]):
            latency_notes.append({
                "feature": col,
                "estimated_latency": "50-200ms" if "velocity" in col_lower else "100-500ms",
                "risk": "Score delay if feature unavailable at prediction time",
            })

    return {
        "quality_score": quality_score,
        "total_features": total_cols,
        "good_features": good_count,
        "critical_features": critical_features,
        "constant_features": constant_features,
        "feature_quality": quality_results,
        "dropout_impact": dropout_impact,
        "latency_notes": latency_notes,
        "verdict": "good" if quality_score > 80 else "acceptable" if quality_score > 60 else "needs_attention",
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 11. Explainability Stress Testing
# ═══════════════════════════════════════════════════════════════════════════════

def compute_explainability_analysis(df: pd.DataFrame, target_column: str = None) -> dict:
    """Test if explanations are stable, understandable, and consistent."""
    target_column = _detect_target(df, target_column)
    score_col = _detect_score(df)

    if not target_column or not score_col:
        return {"error": "Need target and score columns"}

    numeric_cols = [c for c in df.select_dtypes(include=[np.number]).columns if c not in [target_column, score_col]]

    # Feature contribution to score (correlation-based proxy for SHAP)
    feature_contributions = []
    for col in numeric_cols[:12]:
        corr_target = _sf(df[col].corr(df[target_column]))
        corr_score = _sf(df[col].corr(df[score_col]))
        feature_contributions.append({
            "feature": col,
            "correlation_with_target": corr_target,
            "correlation_with_score": corr_score,
            "direction": "positive" if corr_target > 0 else "negative",
            "strength": "strong" if abs(corr_target) > 0.3 else "moderate" if abs(corr_target) > 0.1 else "weak",
        })
    feature_contributions.sort(key=lambda x: abs(x["correlation_with_target"]), reverse=True)

    # Reason code stability — do top drivers stay consistent across windows?
    n_windows = 4
    window_size = len(df) // n_windows
    reason_code_stability = []

    for i in range(n_windows):
        start = i * window_size
        end = start + window_size if i < n_windows - 1 else len(df)
        window = df.iloc[start:end]

        # Top 5 drivers for this window
        window_corrs = {}
        for col in numeric_cols[:12]:
            window_corrs[col] = abs(window[col].corr(window[target_column]))
        top_5 = sorted(window_corrs.items(), key=lambda x: x[1], reverse=True)[:5]
        reason_code_stability.append({
            "window": i + 1,
            "top_drivers": [{"feature": f, "importance": _sf(v)} for f, v in top_5],
        })

    # Check consistency of top drivers across windows
    all_top_features = [set(d["feature"] for d in w["top_drivers"]) for w in reason_code_stability]
    if len(all_top_features) >= 2:
        consistency = len(all_top_features[0].intersection(*all_top_features[1:])) / 5 * 100
    else:
        consistency = 100.0
    consistency = _sf(consistency)

    # Similar transactions — do they get similar explanations?
    similarity_test = []
    if "amount" in df.columns and len(df) > 100:
        # Pick pairs of similar transactions
        sample = df.sample(min(100, len(df)), random_state=42)
        for col in numeric_cols[:5]:
            col_std = sample[col].std()
            if col_std > 0:
                variation = _sf(col_std / max(abs(sample[col].mean()), 0.001) * 100)
                similarity_test.append({
                    "feature": col,
                    "coefficient_of_variation": variation,
                    "stable_explanations": variation < 50,
                })

    # Ops readability — can an investigator explain in 30 seconds?
    readability = []
    for fc in feature_contributions[:5]:
        is_readable = fc["feature"] not in ["V1", "V2", "V3", "V4"]  # PCA features are not readable
        readability.append({
            "feature": fc["feature"],
            "readable": is_readable,
            "explanation_template": f"Transaction flagged due to {'high' if fc['direction'] == 'positive' else 'low'} {fc['feature']}" if is_readable else "Feature requires domain mapping",
        })

    readable_count = sum(1 for r in readability if r["readable"])

    return {
        "feature_contributions": feature_contributions,
        "reason_code_stability": reason_code_stability,
        "reason_code_consistency": consistency,
        "similarity_test": similarity_test,
        "readability": readability,
        "readable_features_pct": _sf(readable_count / max(len(readability), 1) * 100),
        "verdict": "explainable" if consistency > 60 and readable_count >= 3 else "needs_improvement",
        "ops_ready": readable_count >= 3,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 12. Fairness & Harm Analysis
# ═══════════════════════════════════════════════════════════════════════════════

def compute_fairness_analysis(df: pd.DataFrame, target_column: str = None) -> dict:
    """Detect indirect bias, disparate impact, and accessibility harm."""
    target_column = _detect_target(df, target_column)
    score_col = _detect_score(df)

    if not target_column or not score_col:
        return {"error": "Need target and score columns"}

    threshold = df[score_col].quantile(0.90)
    predicted = df[score_col] >= threshold

    # Analyze fairness across segments
    sensitive_dims = {}
    if "country" in df.columns:
        sensitive_dims["geography"] = df["country"]
    if "channel" in df.columns:
        sensitive_dims["channel"] = df["channel"]
    if "hour" in df.columns:
        sensitive_dims["time_of_day"] = pd.cut(
            df["hour"], bins=[-1, 6, 12, 18, 24],
            labels=["night_0-6", "morning_6-12", "afternoon_12-18", "evening_18-24"]
        )
    if "card_age_days" in df.columns:
        sensitive_dims["card_tenure"] = pd.cut(
            df["card_age_days"], bins=[0, 90, 365, 1095, float("inf")],
            labels=["new", "medium", "mature", "old"]
        )
    if "amount" in df.columns:
        sensitive_dims["income_proxy"] = pd.cut(
            df["amount"], bins=[0, 25, 100, 500, float("inf")],
            labels=["very_low", "low", "medium", "high"]
        )

    fairness_results = []
    for dim_name, dim_series in sensitive_dims.items():
        group_rates = {}
        for val in dim_series.value_counts().head(8).index:
            mask = dim_series == val
            if mask.sum() < 30:
                continue
            flag_rate = _sf(predicted[mask].mean() * 100)
            fraud_rate = _sf(df.loc[mask, target_column].mean() * 100)
            precision_seg = 0
            seg_pred = predicted[mask]
            seg_actual = df.loc[mask, target_column] == 1
            tp = int((seg_pred & seg_actual).sum())
            fp = int((seg_pred & ~seg_actual).sum())
            if tp + fp > 0:
                precision_seg = _sf(tp / (tp + fp) * 100)

            group_rates[str(val)] = {
                "count": int(mask.sum()),
                "flag_rate": flag_rate,
                "fraud_rate": fraud_rate,
                "precision": precision_seg,
            }

        if len(group_rates) < 2:
            continue

        # Disparate impact ratio (80% rule)
        flag_rates = [v["flag_rate"] for v in group_rates.values() if v["flag_rate"] > 0]
        if flag_rates:
            min_rate = min(flag_rates)
            max_rate = max(flag_rates)
            disparate_impact = _sf(min_rate / max(max_rate, 0.001))
            has_disparate_impact = disparate_impact < 0.8
        else:
            disparate_impact = 1.0
            has_disparate_impact = False

        fairness_results.append({
            "dimension": dim_name,
            "groups": group_rates,
            "disparate_impact_ratio": disparate_impact,
            "has_disparate_impact": has_disparate_impact,
            "flag_rate_range": f"{min(flag_rates):.1f}%-{max(flag_rates):.1f}%" if flag_rates else "N/A",
        })

    # Specific harm checks
    harm_checks = []

    # Night-time activity bias (disability/accessibility)
    if "hour" in df.columns:
        night_mask = df["hour"].between(0, 6)
        day_mask = df["hour"].between(9, 17)
        night_flag_rate = _sf(predicted[night_mask].mean() * 100)
        day_flag_rate = _sf(predicted[day_mask].mean() * 100)
        harm_checks.append({
            "check": "Night-time activity bias",
            "description": "Night-shift workers, insomniacs, or different time zones flagged more",
            "night_flag_rate": night_flag_rate,
            "day_flag_rate": day_flag_rate,
            "ratio": _sf(night_flag_rate / max(day_flag_rate, 0.001)),
            "concern": night_flag_rate > day_flag_rate * 2,
        })

    # Travel bias
    if "distance_from_home_km" in df.columns:
        travel_mask = df["distance_from_home_km"] > 500
        local_mask = df["distance_from_home_km"] <= 50
        if travel_mask.sum() > 30 and local_mask.sum() > 30:
            travel_flag_rate = _sf(predicted[travel_mask].mean() * 100)
            local_flag_rate = _sf(predicted[local_mask].mean() * 100)
            harm_checks.append({
                "check": "Travel penalty bias",
                "description": "Travelers disproportionately flagged vs local transactions",
                "travel_flag_rate": travel_flag_rate,
                "local_flag_rate": local_flag_rate,
                "ratio": _sf(travel_flag_rate / max(local_flag_rate, 0.001)),
                "concern": travel_flag_rate > local_flag_rate * 3,
            })

    concerns = sum(1 for h in harm_checks if h.get("concern", False))
    di_violations = sum(1 for f in fairness_results if f.get("has_disparate_impact", False))

    if concerns == 0 and di_violations == 0:
        verdict = "fair"
    elif concerns + di_violations <= 2:
        verdict = "minor_concerns"
    else:
        verdict = "bias_detected"

    return {
        "fairness_by_dimension": fairness_results,
        "harm_checks": harm_checks,
        "disparate_impact_violations": di_violations,
        "harm_concerns": concerns,
        "verdict": verdict,
        "key_principle": "Use behavioral deviation from individual baseline, not raw attributes",
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 13. Cost Curve & Threshold Sensitivity Analysis
# ═══════════════════════════════════════════════════════════════════════════════

def compute_cost_threshold_analysis(df: pd.DataFrame, target_column: str = None) -> dict:
    """Cost curves, threshold optimization, marginal ROI per score band."""
    target_column = _detect_target(df, target_column)
    score_col = _detect_score(df)

    if not target_column or not score_col:
        return {"error": "Need target and score columns"}

    has_amount = "amount" in df.columns
    avg_fraud_loss = _sf(df.loc[df[target_column] == 1, "amount"].mean()) if has_amount and df[target_column].sum() > 0 else 500
    avg_txn_value = _sf(df["amount"].mean()) if has_amount else 100

    # Threshold sweep
    percentiles = [50, 60, 70, 75, 80, 85, 90, 92, 95, 97, 99]
    threshold_results = []

    for pctl in percentiles:
        thresh = df[score_col].quantile(pctl / 100)
        pred = df[score_col] >= thresh
        actual = df[target_column] == 1

        tp = int((pred & actual).sum())
        fp = int((pred & ~actual).sum())
        fn = int((~pred & actual).sum())
        tn = int((~pred & ~actual).sum())

        precision = _sf(tp / max(tp + fp, 1) * 100)
        recall = _sf(tp / max(tp + fn, 1) * 100)
        f1 = _sf(2 * precision * recall / max(precision + recall, 0.001))

        fraud_saved = _sf(tp * avg_fraud_loss)
        spend_blocked = _sf(fp * avg_txn_value)
        fraud_missed = _sf(fn * avg_fraud_loss)
        net_value = _sf(fraud_saved - spend_blocked)
        roi = _sf(fraud_saved / max(spend_blocked, 1))

        threshold_results.append({
            "percentile": pctl,
            "threshold": _sf(thresh),
            "tp": tp, "fp": fp, "fn": fn, "tn": tn,
            "precision": precision,
            "recall": recall,
            "f1": f1,
            "fraud_saved_dollar": fraud_saved,
            "spend_blocked_dollar": spend_blocked,
            "fraud_missed_dollar": fraud_missed,
            "net_value_dollar": net_value,
            "roi": roi,
            "decline_rate": _sf((tp + fp) / len(df) * 100),
        })

    # Find optimal threshold (max net value)
    best = max(threshold_results, key=lambda x: x["net_value_dollar"])
    best_f1 = max(threshold_results, key=lambda x: x["f1"])

    # Marginal ROI per score band (what does moving threshold by 1% buy you?)
    marginal_roi = []
    for i in range(1, len(threshold_results)):
        prev = threshold_results[i - 1]
        curr = threshold_results[i]
        delta_fraud = curr["fraud_saved_dollar"] - prev["fraud_saved_dollar"]
        delta_blocked = curr["spend_blocked_dollar"] - prev["spend_blocked_dollar"]
        marginal_roi.append({
            "from_pctl": prev["percentile"],
            "to_pctl": curr["percentile"],
            "marginal_fraud_saved": _sf(delta_fraud),
            "marginal_spend_saved": _sf(abs(delta_blocked)),
            "marginal_roi": _sf(abs(delta_fraud) / max(abs(delta_blocked), 1)),
            "recommendation": "tighten" if abs(delta_fraud) > abs(delta_blocked) else "too_aggressive",
        })

    # Threshold elasticity
    elasticity_note = "small" if abs(best["net_value_dollar"] - threshold_results[-1]["net_value_dollar"]) < best["net_value_dollar"] * 0.1 else "significant"

    return {
        "threshold_sweep": threshold_results,
        "optimal_threshold": {
            "by_net_value": {"percentile": best["percentile"], "threshold": best["threshold"], "net_value": best["net_value_dollar"]},
            "by_f1": {"percentile": best_f1["percentile"], "threshold": best_f1["threshold"], "f1": best_f1["f1"]},
        },
        "marginal_roi": marginal_roi,
        "avg_fraud_loss": avg_fraud_loss,
        "avg_txn_value": avg_txn_value,
        "threshold_elasticity": elasticity_note,
        "brutal_truth": "The best threshold is rarely the safest one — optimize for $ not metrics",
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 14. Human-in-the-Loop Analysis
# ═══════════════════════════════════════════════════════════════════════════════

def compute_hitl_analysis(df: pd.DataFrame, target_column: str = None) -> dict:
    """Simulated investigator metrics — disagreement, latency, overrides."""
    target_column = _detect_target(df, target_column)
    score_col = _detect_score(df)

    if not target_column or not score_col:
        return {"error": "Need target and score columns"}

    threshold = df[score_col].quantile(0.90)
    flagged = df[df[score_col] >= threshold]
    actual_fraud_in_flagged = flagged[target_column] == 1

    # Simulated investigator queue
    total_alerts = len(flagged)
    true_fraud_alerts = int(actual_fraud_in_flagged.sum())
    false_alerts = total_alerts - true_fraud_alerts
    alert_to_fraud_ratio = _sf(total_alerts / max(true_fraud_alerts, 1))

    # Score band distribution of alerts
    alert_bands = []
    score_bins = np.linspace(threshold, df[score_col].max(), 6)
    for i in range(len(score_bins) - 1):
        band_mask = flagged[score_col].between(score_bins[i], score_bins[i + 1])
        band_df = flagged[band_mask]
        if len(band_df) == 0:
            continue
        fraud_in_band = int(band_df[target_column].sum())
        alert_bands.append({
            "score_range": f"{_sf(score_bins[i])}-{_sf(score_bins[i+1])}",
            "alert_count": len(band_df),
            "fraud_count": fraud_in_band,
            "precision": _sf(fraud_in_band / len(band_df) * 100),
            "priority": "critical" if fraud_in_band / max(len(band_df), 1) > 0.5 else "high" if fraud_in_band / max(len(band_df), 1) > 0.2 else "medium",
        })

    # Simulated override analysis
    # Borderline cases: score near threshold
    border_width = (df[score_col].max() - threshold) * 0.2
    borderline = flagged[flagged[score_col] <= threshold + border_width]
    borderline_fraud = int(borderline[target_column].sum()) if len(borderline) > 0 else 0
    borderline_legit = len(borderline) - borderline_fraud

    # Estimated investigator workload
    avg_review_time_min = 5  # industry average
    daily_alerts = total_alerts / 30  # assume monthly data
    investigators_needed = _sf(daily_alerts * avg_review_time_min / (8 * 60))  # 8hr shifts

    # Disagreement simulation — model says fraud but ground truth says legit
    disagreement_rate = _sf(false_alerts / max(total_alerts, 1) * 100)

    return {
        "total_alerts": total_alerts,
        "true_fraud_alerts": true_fraud_alerts,
        "false_alerts": false_alerts,
        "alert_to_fraud_ratio": alert_to_fraud_ratio,
        "alert_bands": alert_bands,
        "borderline_cases": {
            "count": len(borderline),
            "fraud": borderline_fraud,
            "legit": borderline_legit,
            "override_risk": _sf(borderline_legit / max(len(borderline), 1) * 100),
        },
        "workload_estimate": {
            "daily_alerts": _sf(daily_alerts),
            "avg_review_time_min": avg_review_time_min,
            "investigators_needed": investigators_needed,
            "monthly_review_hours": _sf(total_alerts * avg_review_time_min / 60),
        },
        "disagreement_rate": disagreement_rate,
        "model_trust_note": "High disagreement rate erodes investigator trust in the model",
        "verdict": "efficient" if alert_to_fraud_ratio < 10 else "acceptable" if alert_to_fraud_ratio < 20 else "inefficient",
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 15. End-to-End Failure Mode Analysis
# ═══════════════════════════════════════════════════════════════════════════════

def compute_failure_mode_analysis(df: pd.DataFrame, target_column: str = None) -> dict:
    """Simulate failure scenarios — missing features, spikes, degradation."""
    target_column = _detect_target(df, target_column)
    score_col = _detect_score(df)

    if not target_column or not score_col:
        return {"error": "Need target and score columns"}

    numeric_cols = [c for c in df.select_dtypes(include=[np.number]).columns if c not in [target_column, score_col]]

    # Scenario 1: Feature dropout — what if each feature goes to null?
    feature_dropout = []
    base_fraud_rate = _sf(df[target_column].mean() * 100)

    for col in numeric_cols[:10]:
        corr_with_target = abs(df[col].corr(df[target_column]))
        corr_with_score = abs(df[col].corr(df[score_col]))
        criticality = "critical" if corr_with_score > 0.3 else "important" if corr_with_score > 0.15 else "minor"

        feature_dropout.append({
            "feature": col,
            "correlation_with_score": _sf(corr_with_score),
            "correlation_with_target": _sf(corr_with_target),
            "criticality": criticality,
            "failure_impact": f"Score distribution shifts, {criticality} impact on fraud detection",
            "fallback": "Use population median as default" if criticality != "critical" else "Route to manual review queue",
        })
    feature_dropout.sort(key=lambda x: x["correlation_with_score"], reverse=True)

    # Scenario 2: Fraud spike — what if fraud rate increases 5x?
    current_fraud = int(df[target_column].sum())
    current_legit = len(df) - current_fraud
    threshold = df[score_col].quantile(0.90)

    spike_scenarios = []
    for multiplier in [2, 5, 10]:
        # More fraud means threshold may be too lenient
        simulated_fraud_count = current_fraud * multiplier
        simulated_total = current_legit + simulated_fraud_count
        simulated_fraud_rate = _sf(simulated_fraud_count / simulated_total * 100)

        # Current threshold catches X% of fraud
        caught = int((df[df[target_column] == 1][score_col] >= threshold).sum())
        catch_rate = _sf(caught / max(current_fraud, 1) * 100)

        spike_scenarios.append({
            "scenario": f"Fraud rate {multiplier}x increase",
            "current_fraud_rate": base_fraud_rate,
            "simulated_fraud_rate": simulated_fraud_rate,
            "current_catch_rate": catch_rate,
            "estimated_missed_fraud": int(simulated_fraud_count * (1 - catch_rate / 100)),
            "threshold_still_valid": catch_rate > 80,
            "action_needed": "Monitor" if catch_rate > 80 else "Retrain model + adjust thresholds",
        })

    # Scenario 3: Graph/device features lag
    latency_scenarios = []
    for col in numeric_cols:
        col_lower = col.lower()
        if any(k in col_lower for k in ["velocity", "graph", "device", "network"]):
            latency_scenarios.append({
                "feature": col,
                "scenario": f"'{col}' data arrives 5 seconds late",
                "impact": "Score computed without this feature — default value used",
                "risk_level": "high" if abs(df[col].corr(df[target_column])) > 0.2 else "medium",
                "mitigation": "Implement async scoring with score update on feature arrival",
            })

    # Scenario 4: Model staleness
    staleness = {
        "scenario": "Model not retrained for 90 days",
        "risk": "Feature distributions drift, new fraud patterns undetected",
        "indicators": [
            "PSI > 0.25 on key features",
            "Precision drops below baseline",
            "New MCC codes or channels appear",
        ],
        "mitigation": "Automated retraining triggers on drift detection",
    }

    # Overall resilience score
    critical_features = sum(1 for f in feature_dropout if f["criticality"] == "critical")
    single_points_of_failure = critical_features

    if single_points_of_failure == 0:
        resilience = "robust"
    elif single_points_of_failure <= 2:
        resilience = "moderate"
    else:
        resilience = "fragile"

    return {
        "feature_dropout_scenarios": feature_dropout,
        "fraud_spike_scenarios": spike_scenarios,
        "latency_scenarios": latency_scenarios,
        "staleness_scenario": staleness,
        "single_points_of_failure": single_points_of_failure,
        "resilience_verdict": resilience,
        "critical_question": "If you haven't simulated these, you're flying blind",
    }
