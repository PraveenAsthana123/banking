"""File upload and dataset management."""

import json
import logging
from datetime import datetime
from pathlib import Path

import pandas as pd
from fastapi import APIRouter, Depends, File, UploadFile

from backend.core.config import Settings
from backend.core.dependencies import get_dataset_repo, get_audit_repo, get_settings
from backend.core.exceptions import DataError, ValidationError
from backend.repositories.audit_repo import AuditRepo
from backend.repositories.dataset_repo import DatasetRepo

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin", tags=["upload"])


def _read_dataframe(path: Path) -> pd.DataFrame:
    """Read a file into a DataFrame based on extension."""
    ext = path.suffix.lower()
    if ext == ".csv":
        return pd.read_csv(path)
    elif ext == ".json":
        return pd.read_json(path)
    elif ext in (".xlsx", ".xls"):
        return pd.read_excel(path)
    raise ValueError(f"Unsupported file type: {ext}")


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    repo: DatasetRepo = Depends(get_dataset_repo),
    audit: AuditRepo = Depends(get_audit_repo),
    settings: Settings = Depends(get_settings),
):
    """Upload CSV/JSON/Excel, parse with pandas, store file + metadata."""
    ext = Path(file.filename).suffix.lower()
    if ext not in settings.allowed_extensions:
        raise ValidationError(f"Unsupported file type '{ext}'. Allowed: {', '.join(settings.allowed_extensions)}")

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_name = "".join(c if c.isalnum() or c in "._-" else "_" for c in file.filename)
    dest = settings.upload_dir / f"{timestamp}_{safe_name}"

    size = 0
    with open(dest, "wb") as f:
        while chunk := await file.read(8192):
            size += len(chunk)
            if size > settings.max_upload_size:
                dest.unlink(missing_ok=True)
                raise ValidationError(f"File exceeds max size of {settings.max_upload_size // (1024*1024)} MB")
            f.write(chunk)

    try:
        df = _read_dataframe(dest)
    except Exception as e:
        dest.unlink(missing_ok=True)
        raise DataError(f"Failed to parse file: {e}")

    columns_info = []
    for col in df.columns:
        columns_info.append({
            "name": col,
            "dtype": str(df[col].dtype),
            "non_null": int(df[col].count()),
            "null_count": int(df[col].isnull().sum()),
            "unique": int(df[col].nunique()),
        })

    dataset_id = repo.create(
        name=Path(file.filename).stem,
        original_filename=file.filename,
        file_path=str(dest),
        file_size=size,
        rows=len(df),
        cols=len(df.columns),
        columns_json=json.dumps(columns_info),
    )

    audit.log("dataset_uploaded", f"Uploaded {file.filename} ({len(df)} rows, {len(df.columns)} cols)", entry_type="create")

    return {
        "id": dataset_id,
        "name": Path(file.filename).stem,
        "filename": file.filename,
        "rows": len(df),
        "cols": len(df.columns),
        "size": size,
        "columns": columns_info,
    }


@router.get("/datasets")
def list_datasets(repo: DatasetRepo = Depends(get_dataset_repo)):
    """List all uploaded datasets."""
    return repo.list_all()


@router.get("/datasets/{dataset_id}")
def get_dataset(dataset_id: int, repo: DatasetRepo = Depends(get_dataset_repo)):
    """Get dataset details including column info."""
    return repo.find_by_id(dataset_id)


@router.delete("/datasets/{dataset_id}")
def delete_dataset(
    dataset_id: int,
    repo: DatasetRepo = Depends(get_dataset_repo),
    audit: AuditRepo = Depends(get_audit_repo),
):
    """Remove dataset and its file."""
    info = repo.delete(dataset_id)
    audit.log("dataset_deleted", f"Deleted dataset '{info['name']}' (id={dataset_id})", entry_type="delete")
    return {"success": True, "message": f"Dataset {dataset_id} deleted"}
