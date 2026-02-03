"""Ollama HTTP client for Text2SQL generation."""

import logging
import re
from typing import Optional

import requests

from backend.core.exceptions import ExternalServiceError

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a SQL expert. Given a natural language question and a database schema, generate a valid SQLite SELECT query.

Rules:
- Output ONLY the SQL query, no explanations
- Use only SELECT statements
- Never use INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, or TRUNCATE
- Use proper SQLite syntax
- Use double quotes for table/column names if they contain special characters
- Limit results to 100 rows unless the user asks for a specific limit
"""


class OllamaService:
    """Ollama LLM client with configurable base URL and model."""

    def __init__(self, base_url: str, model: str) -> None:
        self._base_url = base_url.rstrip("/")
        self._model = model

    def generate_sql_from_nl(self, natural_language: str, schema: str) -> str:
        """Call Ollama to convert natural language to SQL."""
        prompt = f"""Database Schema:
{schema}

Question: {natural_language}

SQL Query:"""

        try:
            response = requests.post(
                f"{self._base_url}/api/generate",
                json={
                    "model": self._model,
                    "prompt": prompt,
                    "system": SYSTEM_PROMPT,
                    "stream": False,
                    "options": {"temperature": 0.1, "num_predict": 500},
                },
                timeout=60,
            )
            response.raise_for_status()
            result = response.json()
            sql = result.get("response", "").strip()

            sql = _extract_sql(sql)

            if not sql:
                return "SELECT 1 -- Failed to generate SQL"

            return sql

        except requests.ConnectionError:
            logger.warning("Ollama not reachable at %s", self._base_url)
            return _fallback_sql(natural_language, schema)
        except Exception as e:
            logger.error("Ollama request failed: %s", e)
            return _fallback_sql(natural_language, schema)


# ── Pure helpers ──────────────────────────────────────────────────────────────

def _extract_sql(text: str) -> str:
    """Extract SQL from potential markdown code blocks."""
    match = re.search(r'```(?:sql)?\s*(SELECT.+?)```', text, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1).strip()

    lines = text.strip().split('\n')
    sql_lines = []
    collecting = False
    for line in lines:
        stripped = line.strip()
        if stripped.upper().startswith('SELECT') or collecting:
            collecting = True
            sql_lines.append(line)
            if stripped.endswith(';'):
                break

    if sql_lines:
        return '\n'.join(sql_lines).strip().rstrip(';') + ';'

    return text.strip()


def _fallback_sql(nl: str, schema: str) -> str:
    """Simple fallback SQL when Ollama is unavailable."""
    nl_lower = nl.lower()

    tables = re.findall(r'TABLE\s+(\w+)', schema)
    if not tables:
        return "SELECT 1 AS no_tables_found;"

    if "count" in nl_lower:
        for t in tables:
            if t.lower() in nl_lower:
                return f'SELECT COUNT(*) AS total FROM "{t}";'
        return f'SELECT COUNT(*) AS total FROM "{tables[0]}";'

    if "average" in nl_lower or "avg" in nl_lower:
        for t in tables:
            if t.lower() in nl_lower:
                return f'SELECT * FROM "{t}" LIMIT 100;'

    target = tables[0]
    for t in tables:
        if t.lower() in nl_lower:
            target = t
            break

    return f'SELECT * FROM "{target}" LIMIT 100;'


# ── Legacy compat shim ───────────────────────────────────────────────────────

def generate_sql_from_nl(natural_language: str, schema: str) -> str:
    """Legacy shim — prefer OllamaService."""
    from backend.core.dependencies import get_ollama_service
    return get_ollama_service().generate_sql_from_nl(natural_language, schema)
