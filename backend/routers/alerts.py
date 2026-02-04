"""Alert management — configure, evaluate, and trigger alerts on ML metrics."""

import json
import logging
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends

from backend.core.config import Settings
from backend.core.dependencies import get_alert_repo, get_audit_repo, get_settings
from backend.core.exceptions import ValidationError
from backend.repositories.alert_repo import AlertRepo
from backend.repositories.audit_repo import AuditRepo
from backend.schemas.alerts import AlertCreate, AlertUpdate, AlertCreateResponse, AlertCheckResponse
from backend.schemas.common import SuccessResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin/alerts", tags=["alerts"])

# ── Valid metrics that alerts can monitor ─────────────────────────────────────

VALID_METRICS = {
    "data_quality_score",
    "accuracy",
    "f1_score",
    "missing_pct",
    "drift_score",
    "latency_ms",
}

VALID_OPERATORS = {">", "<", "=", ">=", "<=", "!="}
VALID_SEVERITIES = {"critical", "warning", "info"}


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("")
def list_alerts(repo: AlertRepo = Depends(get_alert_repo)):
    """Return all configured alert rules."""
    return repo.list_all()


@router.post("", response_model=AlertCreateResponse)
def create_alert(
    body: AlertCreate,
    repo: AlertRepo = Depends(get_alert_repo),
    audit: AuditRepo = Depends(get_audit_repo),
):
    """Create a new alert rule."""
    if body.metric not in VALID_METRICS:
        raise ValidationError(f"Invalid metric '{body.metric}'. Must be one of: {sorted(VALID_METRICS)}")
    if body.operator not in VALID_OPERATORS:
        raise ValidationError(f"Invalid operator '{body.operator}'. Must be one of: {sorted(VALID_OPERATORS)}")
    if body.severity not in VALID_SEVERITIES:
        raise ValidationError(f"Invalid severity '{body.severity}'. Must be one of: {sorted(VALID_SEVERITIES)}")

    alert_id = repo.create(body.name, body.metric, body.threshold, body.operator, body.uc_id, body.severity)
    audit.log("alert_created", f"Alert '{body.name}' (id={alert_id}) on {body.metric} {body.operator} {body.threshold}")
    return {"id": alert_id, "message": "Alert created successfully"}


@router.put("/{alert_id}", response_model=SuccessResponse)
def update_alert(
    alert_id: int,
    body: AlertUpdate,
    repo: AlertRepo = Depends(get_alert_repo),
    audit: AuditRepo = Depends(get_audit_repo),
):
    """Update an existing alert rule."""
    if body.metric and body.metric not in VALID_METRICS:
        raise ValidationError(f"Invalid metric '{body.metric}'.")
    if body.operator and body.operator not in VALID_OPERATORS:
        raise ValidationError(f"Invalid operator '{body.operator}'.")
    if body.severity and body.severity not in VALID_SEVERITIES:
        raise ValidationError(f"Invalid severity '{body.severity}'.")

    fields = {k: v for k, v in body.model_dump().items() if v is not None}
    repo.update(alert_id, **fields)
    audit.log("alert_updated", f"Alert id={alert_id} updated: {list(fields.keys())}")
    return SuccessResponse(message=f"Alert {alert_id} updated successfully")


@router.delete("/{alert_id}", response_model=SuccessResponse)
def delete_alert(
    alert_id: int,
    repo: AlertRepo = Depends(get_alert_repo),
    audit: AuditRepo = Depends(get_audit_repo),
):
    """Delete an alert rule."""
    repo.delete(alert_id)
    audit.log("alert_deleted", f"Alert id={alert_id} deleted")
    return SuccessResponse(message=f"Alert {alert_id} deleted successfully")


@router.post("/check")
def check_alerts(
    repo: AlertRepo = Depends(get_alert_repo),
    audit: AuditRepo = Depends(get_audit_repo),
    settings: Settings = Depends(get_settings),
):
    """Manually trigger alert evaluation."""
    alerts = repo.list_enabled()
    if not alerts:
        return {"triggered": [], "message": "No enabled alerts configured."}

    uc_metrics = _collect_uc_metrics(settings.output_dir)
    triggered = []
    now = datetime.now().isoformat()

    for alert in alerts:
        target_ucs = uc_metrics.keys() if alert["uc_id"] == "all" else [alert["uc_id"]]
        for uc_id in target_ucs:
            if uc_id not in uc_metrics:
                continue
            current_value = uc_metrics[uc_id].get(alert["metric"])
            if current_value is None:
                continue
            if _evaluate_condition(current_value, alert["operator"], alert["threshold"]):
                triggered.append({
                    "alert_id": alert["id"],
                    "alert_name": alert["name"],
                    "uc_id": uc_id,
                    "metric": alert["metric"],
                    "current_value": round(current_value, 4),
                    "operator": alert["operator"],
                    "threshold": alert["threshold"],
                    "severity": alert["severity"],
                    "triggered_at": now,
                })

    fired_ids = list({t["alert_id"] for t in triggered})
    if fired_ids:
        repo.update_last_triggered(fired_ids, now)
        for t in triggered:
            audit.log(
                "alert_triggered",
                f"[{t['severity'].upper()}] {t['alert_name']}: {t['uc_id']} "
                f"{t['metric']}={t['current_value']} {t['operator']} {t['threshold']}",
                entry_type="warning" if t["severity"] != "critical" else "error",
            )

    return {
        "triggered": triggered,
        "total_alerts_checked": len(alerts),
        "total_use_cases_scanned": len(uc_metrics),
        "triggered_count": len(triggered),
        "checked_at": now,
    }


# ── Helpers ───────────────────────────────────────────────────────────────────

def _collect_uc_metrics(output_dir: Path) -> dict:
    """Scan preprocessing_output for summary.json files and extract metrics."""
    uc_metrics: dict = {}
    if not output_dir.exists():
        return uc_metrics

    for summary_path in output_dir.glob("*/summary.json"):
        try:
            data = json.loads(summary_path.read_text())
        except Exception:
            continue
        uc_id = data.get("use_case_key", summary_path.parent.name)
        metrics: dict = {}
        if "data_quality_score" in data:
            metrics["data_quality_score"] = float(data["data_quality_score"])
        if "avg_missing_pct" in data:
            metrics["missing_pct"] = float(data["avg_missing_pct"])

        full_report = summary_path.parent / "full_report.json"
        if full_report.exists():
            try:
                report = json.loads(full_report.read_text())
                model_metrics = report.get("model_metrics", {})
                if "accuracy" in model_metrics:
                    metrics["accuracy"] = float(model_metrics["accuracy"])
                if "f1_score" in model_metrics:
                    metrics["f1_score"] = float(model_metrics["f1_score"])
            except Exception:
                pass

        drift_path = summary_path.parent / "drift_report.json"
        if drift_path.exists():
            try:
                drift_data = json.loads(drift_path.read_text())
                if "drift_score" in drift_data:
                    metrics["drift_score"] = float(drift_data["drift_score"])
            except Exception:
                pass

        uc_metrics[uc_id] = metrics
    return uc_metrics


def _evaluate_condition(value: float, operator: str, threshold: float) -> bool:
    """Evaluate a numeric condition."""
    if operator == ">":
        return value > threshold
    elif operator == "<":
        return value < threshold
    elif operator == "=":
        return abs(value - threshold) < 1e-6
    elif operator == ">=":
        return value >= threshold
    elif operator == "<=":
        return value <= threshold
    elif operator == "!=":
        return abs(value - threshold) >= 1e-6
    return False
