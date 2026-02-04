"""Process runner — execute ML pipelines for specific use cases, manage data paths."""

import json
import logging
import os
import subprocess
import threading
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, UploadFile, File, Form

from backend.core.config import Settings
from backend.core.dependencies import get_settings, get_job_repo, get_audit_repo
from backend.core.exceptions import NotFoundError, ValidationError, DataError
from backend.core.utils import validate_use_case_key
from backend.repositories.audit_repo import AuditRepo
from backend.repositories.job_repo import JobRepo
from backend.schemas.process import ProcessRunRequest, ProcessRunResponse
from backend.schemas.common import SuccessResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin/process", tags=["process"])


def _build_preprocess_map(settings: Settings) -> dict:
    """Scan preprocessing_output/ and build UC ID -> directory mapping."""
    mapping: dict = {}
    output_dir = settings.output_dir
    if not output_dir.exists():
        return mapping
    for d in output_dir.iterdir():
        if not d.is_dir() or not d.name.startswith("uc_"):
            continue
        parts = d.name.split("_")
        if len(parts) >= 3:
            uc_prefix = f"UC-{parts[1].upper()}-{parts[2].upper()}"
            mapping[uc_prefix] = d.name
            if parts[1].isdigit():
                mapping[f"UC-{parts[1]}-{parts[2]}"] = d.name
    return mapping


def _list_files(directory: Path, extensions: set = None) -> list:
    """List data files in a directory."""
    if extensions is None:
        extensions = {".csv", ".json", ".xlsx", ".parquet", ".pkl", ".txt", ".pdf", ".html"}
    files = []
    try:
        for f in directory.iterdir():
            if f.is_file() and (not extensions or f.suffix.lower() in extensions):
                files.append({
                    "name": f.name,
                    "path": str(f),
                    "size": f.stat().st_size,
                    "modified": datetime.fromtimestamp(f.stat().st_mtime).isoformat(),
                    "type": f.suffix[1:] if f.suffix else "unknown",
                })
    except PermissionError:
        pass
    return files


def _find_uc_data_dir(uc_id: str, uc_path: str = "", *, settings: Settings) -> dict:
    """Find data directory and files for a use case."""
    use_cases_dir = settings.use_cases_dir
    output_dir = settings.output_dir

    result = {
        "uc_id": uc_id,
        "uc_path": uc_path,
        "data_dir": None,
        "preprocessing_dir": None,
        "files": [],
        "preprocessing_files": [],
        "total_size": 0,
        "has_data": False,
    }

    data_extensions = {".csv", ".json", ".xlsx", ".parquet", ".pkl", ".txt", ".pdf", ".html", ".zip"}

    # 1. Check 5_Star_UseCases path (from frontend pipelineUseCases.js)
    if uc_path:
        star_dir = use_cases_dir / uc_path
        if star_dir.exists():
            # Prefer data/ subdirectory, fall back to root
            data_sub = star_dir / "data"
            if data_sub.exists():
                result["data_dir"] = str(data_sub)
                result["files"] = _list_files(data_sub, data_extensions)
            else:
                result["data_dir"] = str(star_dir)
                result["files"] = _list_files(star_dir, data_extensions)
            # Also check repo/ subdirectory
            repo_sub = star_dir / "repo"
            if repo_sub.exists():
                result["files"].extend(_list_files(repo_sub, data_extensions))

    # 2. If no path given or path not found, search by UC ID pattern
    if not result["data_dir"]:
        for d in use_cases_dir.rglob(f"*{uc_id}*"):
            if d.is_dir():
                data_sub = d / "data"
                if data_sub.exists():
                    result["data_dir"] = str(data_sub)
                    result["files"] = _list_files(data_sub, data_extensions)
                else:
                    result["data_dir"] = str(d)
                    result["files"] = _list_files(d, data_extensions)
                break

    # Calculate total size
    result["total_size"] = sum(f["size"] for f in result["files"])

    # 3. Find preprocessing output directory
    # Try exact map first
    preprocess_map = _build_preprocess_map(settings)
    preprocess_name = preprocess_map.get(uc_id)
    if preprocess_name:
        preprocess_dir = output_dir / preprocess_name
        if preprocess_dir.exists():
            result["preprocessing_dir"] = str(preprocess_dir)
            result["preprocessing_files"] = _list_files(preprocess_dir)

    # If no exact match, try broader pattern matching
    if not result["preprocessing_dir"] and output_dir.exists():
        uc_clean = uc_id.replace("-", "_").lower()
        # Try multiple patterns: uc_fr_01, uc_fr, and also check folder name contains uc_id
        for d in output_dir.iterdir():
            if not d.is_dir():
                continue
            # Check if dir starts with the UC prefix (e.g., uc_fr_01 matches uc_fr_01_*)
            if d.name.startswith(uc_clean):
                result["preprocessing_dir"] = str(d)
                result["preprocessing_files"] = _list_files(d)
                break
            # Check partial match on the first two segments (e.g., uc_fr matches uc_fr_*)
            uc_parts = uc_clean.split("_")
            if len(uc_parts) >= 3:
                short_prefix = "_".join(uc_parts[:3])  # uc_fr_01
                if d.name.startswith(short_prefix):
                    result["preprocessing_dir"] = str(d)
                    result["preprocessing_files"] = _list_files(d)
                    break

    # 4. Also check for "real_" prefixed datasets in preprocessing_output
    if not result["preprocessing_dir"] and output_dir.exists():
        # Some use cases may match real_ datasets
        name_lower = (uc_path.split("/")[-1] if uc_path else uc_id).lower()
        for keyword in ["fraud", "credit", "marketing", "atm", "treasury", "german", "hr", "fdic", "fx"]:
            if keyword in name_lower:
                for d in output_dir.iterdir():
                    if d.is_dir() and keyword in d.name and d.name.startswith("real_"):
                        result["preprocessing_dir"] = str(d)
                        result["preprocessing_files"] = _list_files(d)
                        break
                if result["preprocessing_dir"]:
                    break

    result["has_data"] = len(result["files"]) > 0 or len(result["preprocessing_files"]) > 0
    return result


@router.get("/data-path/{uc_id}")
def get_data_path(uc_id: str, uc_path: str = "", settings: Settings = Depends(get_settings)):
    """Get data directory path and files for a use case."""
    return _find_uc_data_dir(uc_id, uc_path, settings=settings)


@router.post("/upload/{uc_id}")
async def upload_to_uc(
    uc_id: str,
    uc_path: str = Form(""),
    file: UploadFile = File(...),
    settings: Settings = Depends(get_settings),
    audit: AuditRepo = Depends(get_audit_repo),
):
    """Upload a data file to a use case's data directory."""
    # Determine target directory
    if uc_path:
        target_dir = settings.use_cases_dir / uc_path / "data"
    else:
        # Try to find existing data dir
        info = _find_uc_data_dir(uc_id, uc_path, settings=settings)
        if info["data_dir"]:
            target_dir = Path(info["data_dir"])
        else:
            # Create a new data dir under uploads
            target_dir = settings.base_dir / "uploads" / uc_id

    target_dir.mkdir(parents=True, exist_ok=True)

    # Validate file extension
    ext = Path(file.filename).suffix.lower()
    if ext not in {".csv", ".json", ".xlsx", ".xls", ".parquet", ".txt"}:
        raise ValidationError(f"Unsupported file type: {ext}")

    # Save file
    target_path = target_dir / file.filename
    content = await file.read()
    if len(content) > 500 * 1024 * 1024:
        raise ValidationError("File too large (max 500MB)")

    with open(target_path, "wb") as f:
        f.write(content)

    audit.log("file_uploaded", f"Uploaded {file.filename} to {uc_id}", entry_type="create")

    return {
        "success": True,
        "filename": file.filename,
        "size": len(content),
        "path": str(target_path),
        "uc_id": uc_id,
    }


def _run_pipeline_bg(
    job_id: int,
    req: ProcessRunRequest,
    job_repo: JobRepo,
    audit_repo: AuditRepo,
    base_dir: Path,
):
    """Run the ML pipeline in a background thread."""
    try:
        job_repo.update_status(job_id, "running")
        job_repo.update_progress(job_id, 5)

        uc_key = req.uc_id.replace("-", "_").lower()

        # Determine which pipeline to run
        if req.pipeline_type in ("full", "preprocessing"):
            # Run preprocessing pipeline
            cmd = [
                "python3", str(base_dir / "preprocessing_pipeline.py"),
                "--use-case", uc_key,
            ]
            if req.data_file:
                cmd.extend(["--input", req.data_file])

            job_repo.update_progress(job_id, 10)

            result = subprocess.run(
                cmd, capture_output=True, text=True, timeout=600, cwd=str(base_dir)
            )

            if result.returncode != 0:
                logger.warning("Preprocessing stderr: %s", result.stderr[:500])

            job_repo.update_progress(job_id, 40)

        if req.pipeline_type in ("full", "training"):
            # Run model training pipeline
            cmd = [
                "python3", str(base_dir / "model_training_pipeline.py"),
                "--use-case", uc_key,
            ]

            job_repo.update_progress(job_id, 50)

            result = subprocess.run(
                cmd, capture_output=True, text=True, timeout=1200, cwd=str(base_dir)
            )

            if result.returncode != 0:
                logger.warning("Training stderr: %s", result.stderr[:500])

            job_repo.update_progress(job_id, 80)

        if req.pipeline_type in ("full",):
            # Run full job scheduler
            cmd = [
                "python3", str(base_dir / "ml_job_scheduler.py"),
                "--use-case", uc_key,
            ]

            result = subprocess.run(
                cmd, capture_output=True, text=True, timeout=1800, cwd=str(base_dir)
            )

            job_repo.update_progress(job_id, 95)

        # Mark completed
        job_repo.update_status(job_id, "completed")
        job_repo.update_progress(job_id, 100)

        audit_repo.log("pipeline_completed", f"Pipeline {req.pipeline_type} completed for {req.uc_id}", entry_type="system")

    except subprocess.TimeoutExpired:
        job_repo.update_status(job_id, "failed", error_message="Pipeline timed out")
        audit_repo.log("pipeline_timeout", f"Pipeline timed out for {req.uc_id}", entry_type="error")

    except Exception as e:
        logger.exception("Pipeline failed for %s", req.uc_id)
        job_repo.update_status(job_id, "failed", error_message=str(e)[:500])
        audit_repo.log("pipeline_failed", f"Pipeline failed for {req.uc_id}: {e}", entry_type="error")


@router.post("/run", response_model=ProcessRunResponse)
def run_process(
    req: ProcessRunRequest,
    repo: JobRepo = Depends(get_job_repo),
    audit: AuditRepo = Depends(get_audit_repo),
    settings: Settings = Depends(get_settings),
):
    """Start a pipeline execution for a use case."""
    if not validate_use_case_key(req.uc_id):
        raise ValidationError(f"Invalid use case ID: {req.uc_id}")
    if req.pipeline_type not in ("full", "preprocessing", "training", "scoring"):
        raise ValidationError(f"Invalid pipeline type: {req.pipeline_type}")
    # Create job record
    job_id = repo.create(f"pipeline_{req.pipeline_type}_{req.uc_id}")

    audit.log("pipeline_started", f"Pipeline {req.pipeline_type} started for {req.uc_id}", entry_type="create")

    # Run in background thread
    thread = threading.Thread(
        target=_run_pipeline_bg,
        args=(job_id, req, repo, audit, settings.base_dir),
        daemon=True,
    )
    thread.start()

    return {
        "success": True,
        "job_id": job_id,
        "uc_id": req.uc_id,
        "pipeline_type": req.pipeline_type,
        "message": f"Pipeline '{req.pipeline_type}' started for {req.uc_id}",
    }


@router.get("/status/{job_id}")
def get_process_status(job_id: int, repo: JobRepo = Depends(get_job_repo)):
    """Get the status of a running pipeline job."""
    return repo.find_by_id(job_id)


@router.get("/results/{uc_id}")
def get_process_results(uc_id: str, uc_path: str = "", settings: Settings = Depends(get_settings)):
    """Get pipeline results — reads summary.json and full_report.json from preprocessing output."""
    info = _find_uc_data_dir(uc_id, uc_path, settings=settings)
    results = {
        "uc_id": uc_id,
        "has_results": False,
        "summary": None,
        "metrics": None,
        "data_profile": None,
        "preprocessing_dir": info.get("preprocessing_dir"),
        "data_dir": info.get("data_dir"),
        "file_count": len(info.get("files", [])),
        "preprocessing_file_count": len(info.get("preprocessing_files", [])),
    }

    preproc_dir = info.get("preprocessing_dir")
    if not preproc_dir:
        return results

    preproc_path = Path(preproc_dir)

    # Read summary.json if available
    summary_file = preproc_path / "summary.json"
    if summary_file.exists():
        try:
            results["summary"] = json.loads(summary_file.read_text())
            results["has_results"] = True
        except Exception:
            pass

    # Read full_report.json if available
    report_file = preproc_path / "full_report.json"
    if report_file.exists():
        try:
            report = json.loads(report_file.read_text())
            # Extract key metrics from report
            results["metrics"] = {
                "total_rows": report.get("total_rows") or report.get("num_rows"),
                "total_columns": report.get("total_columns") or report.get("num_columns"),
                "missing_pct": report.get("missing_pct") or report.get("missing_percentage"),
                "numeric_columns": report.get("numeric_columns"),
                "categorical_columns": report.get("categorical_columns"),
                "target_column": report.get("target_column") or report.get("target"),
                "class_balance": report.get("class_balance") or report.get("target_distribution"),
            }
            # Extract model metrics if available
            if "model_metrics" in report:
                results["metrics"]["model"] = report["model_metrics"]
            if "accuracy" in report:
                results["metrics"]["accuracy"] = report["accuracy"]
            if "feature_importance" in report:
                results["metrics"]["top_features"] = report["feature_importance"][:10] if isinstance(report["feature_importance"], list) else report["feature_importance"]
            results["has_results"] = True
        except Exception:
            pass

    # Read data profile if available
    profile_file = preproc_path / "data_profile.json"
    if profile_file.exists():
        try:
            results["data_profile"] = json.loads(profile_file.read_text())
            results["has_results"] = True
        except Exception:
            pass

    # Check for trained model files
    model_files = list(preproc_path.glob("*.pkl")) + list(preproc_path.glob("*.joblib"))
    if model_files:
        results["metrics"] = results.get("metrics") or {}
        results["metrics"]["trained_models"] = [
            {"name": f.stem, "size": f.stat().st_size, "modified": datetime.fromtimestamp(f.stat().st_mtime).isoformat()}
            for f in model_files
        ]
        results["has_results"] = True

    return results
