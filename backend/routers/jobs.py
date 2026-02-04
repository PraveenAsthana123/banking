"""Job tracking, vector DB stats, chunking stats."""

import logging
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends

from backend.core.config import Settings
from backend.core.dependencies import get_job_repo, get_audit_repo, get_settings
from backend.core.utils import sanitize_table_name
from backend.repositories.audit_repo import AuditRepo
from backend.repositories.job_repo import JobRepo
from backend.schemas.common import SuccessResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin/jobs", tags=["jobs"])


@router.get("")
def list_jobs(repo: JobRepo = Depends(get_job_repo)):
    """List all jobs from DB."""
    return repo.list_all()


@router.post("/{job_id}/cancel", response_model=SuccessResponse)
def cancel_job(
    job_id: int,
    repo: JobRepo = Depends(get_job_repo),
    audit: AuditRepo = Depends(get_audit_repo),
):
    """Cancel a running job."""
    repo.cancel(job_id)
    audit.log("job_cancelled", f"Job {job_id} cancelled", entry_type="modify")
    return SuccessResponse(message=f"Job {job_id} cancelled")


@router.get("/vectordb")
def vector_db_stats(settings: Settings = Depends(get_settings)):
    """ChromaDB/FAISS stats if vector store exists."""
    if not settings.vector_store_dir.exists():
        return {"exists": False, "message": "No vector store directory found"}

    total_size = 0
    file_count = 0
    index_files = []
    for f in settings.vector_store_dir.rglob("*"):
        if f.is_file():
            file_count += 1
            total_size += f.stat().st_size
            if f.suffix in (".faiss", ".index", ".bin", ".pkl"):
                index_files.append({
                    "name": f.name,
                    "size": f.stat().st_size,
                    "modified": datetime.fromtimestamp(f.stat().st_mtime).isoformat(),
                })

    chroma_collections = []
    chroma_db = settings.vector_store_dir / "chroma.sqlite3"
    if chroma_db.exists():
        import sqlite3
        try:
            conn = sqlite3.connect(str(chroma_db))
            tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
            for (tbl,) in tables:
                if "collection" in tbl.lower():
                    safe_tbl = sanitize_table_name(tbl)
                    if not safe_tbl:
                        continue
                    rows = conn.execute(f'SELECT * FROM "{safe_tbl}" LIMIT 20').fetchall()
                    for r in rows:
                        chroma_collections.append({"table": tbl, "data": list(r)})
            conn.close()
        except Exception as e:
            logger.warning("ChromaDB read failed: %s", e)

    return {
        "exists": True,
        "total_size": total_size,
        "file_count": file_count,
        "index_files": index_files,
        "chroma_collections": chroma_collections,
    }


@router.get("/chunking")
def chunking_stats(settings: Settings = Depends(get_settings)):
    """Stats from preprocessing_output directories."""
    if not settings.output_dir.exists():
        return {"exists": False, "message": "No preprocessing output directory found"}

    dirs = [d for d in settings.output_dir.iterdir() if d.is_dir()]
    total_files = 0
    total_size = 0
    dir_stats = []

    for d in dirs[:50]:
        files = list(d.rglob("*"))
        file_list = [f for f in files if f.is_file()]
        dir_size = sum(f.stat().st_size for f in file_list)
        total_files += len(file_list)
        total_size += dir_size
        dir_stats.append({"name": d.name, "files": len(file_list), "size": dir_size})

    return {
        "exists": True,
        "total_dirs": len(dirs),
        "total_files": total_files,
        "total_size": total_size,
        "directories": sorted(dir_stats, key=lambda x: x["size"], reverse=True)[:20],
    }
