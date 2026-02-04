"""Text2SQL with Ollama — schema introspection, SQL generation, safe execution."""

import logging
import re
import sqlite3
import time

from fastapi import APIRouter, Depends

from backend.core.config import Settings
from backend.core.dependencies import get_text2sql_repo, get_audit_repo, get_settings, get_ollama_service
from backend.core.exceptions import DataError, NotFoundError, ValidationError
from backend.core.utils import sanitize_table_name
from backend.repositories.audit_repo import AuditRepo
from backend.repositories.text2sql_repo import Text2SqlRepo
from backend.schemas.text2sql import GenerateRequest, ExecuteRequest
from backend.services.ollama_service import OllamaService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin/text2sql", tags=["text2sql"])

QUERY_TIMEOUT = 30


@router.get("/schema")
def get_schema(settings: Settings = Depends(get_settings)):
    """Real schema from banking_unified.db via PRAGMA."""
    if not settings.unified_db.exists():
        return {"tables": [], "message": "banking_unified.db not found"}

    tables = []
    try:
        conn = sqlite3.connect(str(settings.unified_db))
        cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        for (tbl_name,) in cursor.fetchall():
            safe_tbl = sanitize_table_name(tbl_name)
            if not safe_tbl:
                continue
            columns = []
            for col in conn.execute(f'PRAGMA table_info("{safe_tbl}")').fetchall():
                columns.append({
                    "cid": col[0], "name": col[1], "type": col[2],
                    "notnull": bool(col[3]), "pk": bool(col[5]),
                })
            row_count = 0
            try:
                row_count = conn.execute(f'SELECT COUNT(*) FROM "{safe_tbl}"').fetchone()[0]
            except sqlite3.OperationalError as e:
                logger.warning("Could not count rows for table %s: %s", safe_tbl, e)
            tables.append({"table": tbl_name, "columns": columns, "rows": row_count})
        conn.close()
    except Exception as e:
        raise DataError(f"Schema introspection failed: {e}")

    return {"tables": tables}


@router.post("/generate")
def generate_sql(
    req: GenerateRequest,
    repo: Text2SqlRepo = Depends(get_text2sql_repo),
    ollama: OllamaService = Depends(get_ollama_service),
    settings: Settings = Depends(get_settings),
):
    """NL -> Ollama llama3.2 -> SQL."""
    if not req.natural_language.strip():
        raise ValidationError("Query text is required")

    schema_info = get_schema(settings)
    schema_text = ""
    for t in schema_info.get("tables", []):
        cols = ", ".join(f'{c["name"]} {c["type"]}' for c in t["columns"])
        schema_text += f'TABLE {t["table"]} ({cols})\n'

    try:
        sql = ollama.generate_sql_from_nl(req.natural_language, schema_text)
    except Exception as e:
        raise DataError(f"SQL generation failed: {e}")

    repo.save_query(req.natural_language, sql)
    return {"sql": sql, "natural_language": req.natural_language}


@router.post("/execute")
def execute_sql(
    req: ExecuteRequest,
    repo: Text2SqlRepo = Depends(get_text2sql_repo),
    audit: AuditRepo = Depends(get_audit_repo),
    settings: Settings = Depends(get_settings),
):
    """Execute SELECT-only SQL on real DB. Safety: only SELECT allowed, read-only."""
    sql = req.sql.strip()

    normalized = re.sub(r'\s+', ' ', sql).strip().upper()
    if not normalized.startswith("SELECT"):
        raise ValidationError("Only SELECT statements are allowed")

    dangerous = ["INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "CREATE", "TRUNCATE", "EXEC", "GRANT", "REVOKE"]
    for kw in dangerous:
        if re.search(rf'\b{kw}\b', normalized):
            if kw == "CREATE" and "SELECT" in normalized:
                raise ValidationError(f"Statement contains forbidden keyword: {kw}")
            elif kw not in ("SELECT",):
                raise ValidationError(f"Statement contains forbidden keyword: {kw}")

    if not settings.unified_db.exists():
        raise NotFoundError("banking_unified.db not found")

    try:
        conn = sqlite3.connect(f"file:{settings.unified_db}?mode=ro", uri=True)
        conn.execute("PRAGMA query_only = ON")
        start = time.time()
        cursor = conn.execute(sql)
        columns = [desc[0] for desc in cursor.description] if cursor.description else []
        rows = cursor.fetchmany(1000)
        elapsed = time.time() - start
        total_rows = len(rows)
        has_more = bool(cursor.fetchone())
        conn.close()
    except sqlite3.OperationalError as e:
        raise ValidationError(f"SQL error: {e}")
    except Exception as e:
        raise DataError(f"Execution failed: {e}")

    repo.mark_executed(req.sql, total_rows)
    audit.log("sql_executed", f"Query returned {total_rows} rows in {elapsed:.2f}s", entry_type="info")

    return {
        "columns": columns,
        "rows": [list(r) for r in rows],
        "row_count": total_rows,
        "has_more": has_more,
        "elapsed_ms": int(elapsed * 1000),
    }


@router.get("/history")
def query_history(repo: Text2SqlRepo = Depends(get_text2sql_repo)):
    """Query history from DB."""
    return repo.list_history()
