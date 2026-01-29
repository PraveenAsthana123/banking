"""
Banking ML Pipeline API Server
Flask-based REST API for the React frontend
"""

import json
import logging
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional

from flask import Flask, jsonify, request
from flask_cors import CORS

from config import (
    GOVERNANCE_DB_PATH,
    JOB_STATUS_DB,
    PREPROCESSING_DB_PATH,
    get_db_connection,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Department configuration
DEPARTMENTS = [
    {
        "id": "risk",
        "name": "Risk Management",
        "icon": "shield",
        "color": "#dc2626",
        "description": "Enterprise risk assessment and mitigation strategies",
    },
    {
        "id": "credit",
        "name": "Credit Analysis",
        "icon": "credit-card",
        "color": "#2563eb",
        "description": "Credit underwriting and portfolio management",
    },
    {
        "id": "fraud",
        "name": "Fraud Detection",
        "icon": "alert-triangle",
        "color": "#7c3aed",
        "description": "Real-time fraud prevention and detection systems",
    },
    {
        "id": "customer",
        "name": "Customer Analytics",
        "icon": "users",
        "color": "#059669",
        "description": "Customer insights and personalization",
    },
    {
        "id": "compliance",
        "name": "Compliance",
        "icon": "clipboard-check",
        "color": "#d97706",
        "description": "Regulatory compliance and reporting",
    },
    {
        "id": "treasury",
        "name": "Treasury",
        "icon": "landmark",
        "color": "#0891b2",
        "description": "Treasury operations and cash management",
    },
    {
        "id": "retail",
        "name": "Retail Banking",
        "icon": "building",
        "color": "#db2777",
        "description": "Retail banking products and services",
    },
    {
        "id": "investment",
        "name": "Investment Banking",
        "icon": "trending-up",
        "color": "#4f46e5",
        "description": "Investment analysis and portfolio management",
    },
]


def get_use_cases_from_db() -> List[Dict[str, Any]]:
    """Fetch use cases from the job status database."""
    use_cases = []

    if not JOB_STATUS_DB.exists():
        return use_cases

    try:
        with get_db_connection(JOB_STATUS_DB) as conn:
            cursor = conn.execute("""
                SELECT use_case_key, status, created_at, updated_at
                FROM job_status
                ORDER BY updated_at DESC
            """)

            for row in cursor.fetchall():
                use_cases.append({
                    "id": row[0],
                    "name": row[0].replace("_", " ").title(),
                    "status": row[1] if row[1] else "pending",
                    "created_at": row[2],
                    "updated_at": row[3],
                })
    except Exception as e:
        logger.error(f"Error fetching use cases: {e}")

    return use_cases


def get_governance_scores(use_case_key: str) -> Optional[Dict[str, Any]]:
    """Fetch governance scores for a use case."""
    if not GOVERNANCE_DB_PATH.exists():
        return None

    try:
        with get_db_connection(GOVERNANCE_DB_PATH) as conn:
            cursor = conn.execute("""
                SELECT
                    explainability_score,
                    fairness_score,
                    robustness_score,
                    privacy_score,
                    overall_trust_level,
                    recommendations,
                    created_at
                FROM governance_scores
                WHERE use_case_key = ?
                ORDER BY created_at DESC
                LIMIT 1
            """, (use_case_key,))

            row = cursor.fetchone()
            if row:
                return {
                    "explainability": row[0],
                    "fairness": row[1],
                    "robustness": row[2],
                    "privacy": row[3],
                    "trust_level": row[4],
                    "recommendations": json.loads(row[5]) if row[5] else [],
                    "created_at": row[6],
                }
    except Exception as e:
        logger.error(f"Error fetching governance scores: {e}")

    return None


def get_pipeline_runs() -> List[Dict[str, Any]]:
    """Fetch recent pipeline runs."""
    runs = []

    if not JOB_STATUS_DB.exists():
        return runs

    try:
        with get_db_connection(JOB_STATUS_DB) as conn:
            cursor = conn.execute("""
                SELECT
                    id,
                    use_case_key,
                    status,
                    created_at,
                    updated_at,
                    error_message
                FROM job_status
                ORDER BY updated_at DESC
                LIMIT 50
            """)

            for row in cursor.fetchall():
                runs.append({
                    "id": row[0],
                    "use_case_key": row[1],
                    "name": row[1].replace("_", " ").title(),
                    "status": row[2] if row[2] else "pending",
                    "created_at": row[3],
                    "updated_at": row[4],
                    "error_message": row[5],
                })
    except Exception as e:
        logger.error(f"Error fetching pipeline runs: {e}")

    return runs


# ============== API Routes ==============

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
    })


@app.route('/api/departments', methods=['GET'])
def get_departments():
    """Get all departments."""
    return jsonify(DEPARTMENTS)


@app.route('/api/departments/<dept_id>', methods=['GET'])
def get_department(dept_id: str):
    """Get a specific department."""
    dept = next((d for d in DEPARTMENTS if d["id"] == dept_id), None)
    if not dept:
        return jsonify({"error": "Department not found"}), 404
    return jsonify(dept)


@app.route('/api/use-cases', methods=['GET'])
def get_all_use_cases():
    """Get all use cases."""
    use_cases = get_use_cases_from_db()
    return jsonify(use_cases)


@app.route('/api/use-cases/<use_case_id>', methods=['GET'])
def get_use_case(use_case_id: str):
    """Get a specific use case."""
    use_cases = get_use_cases_from_db()
    use_case = next((uc for uc in use_cases if uc["id"] == use_case_id), None)

    if not use_case:
        return jsonify({"error": "Use case not found"}), 404

    # Add governance scores
    governance = get_governance_scores(use_case_id)
    if governance:
        use_case["governance"] = governance

    return jsonify(use_case)


@app.route('/api/pipelines', methods=['GET'])
def get_pipelines():
    """Get all pipeline runs."""
    runs = get_pipeline_runs()
    return jsonify(runs)


@app.route('/api/pipelines/<int:pipeline_id>', methods=['GET'])
def get_pipeline(pipeline_id: int):
    """Get a specific pipeline run."""
    runs = get_pipeline_runs()
    run = next((r for r in runs if r["id"] == pipeline_id), None)

    if not run:
        return jsonify({"error": "Pipeline not found"}), 404

    return jsonify(run)


@app.route('/api/governance/scores', methods=['GET'])
def get_all_governance_scores():
    """Get governance scores for all use cases."""
    scores = []
    use_cases = get_use_cases_from_db()

    for uc in use_cases:
        governance = get_governance_scores(uc["id"])
        if governance:
            scores.append({
                "use_case_id": uc["id"],
                "use_case_name": uc["name"],
                **governance,
            })

    return jsonify(scores)


@app.route('/api/analytics/summary', methods=['GET'])
def get_analytics_summary():
    """Get analytics summary."""
    use_cases = get_use_cases_from_db()
    runs = get_pipeline_runs()

    # Calculate statistics
    total_use_cases = len(use_cases)
    active_use_cases = len([uc for uc in use_cases if uc.get("status") == "completed"])

    total_runs = len(runs)
    successful_runs = len([r for r in runs if r.get("status") == "completed"])
    failed_runs = len([r for r in runs if r.get("status") == "failed"])

    return jsonify({
        "use_cases": {
            "total": total_use_cases,
            "active": active_use_cases,
        },
        "pipelines": {
            "total": total_runs,
            "successful": successful_runs,
            "failed": failed_runs,
            "success_rate": (successful_runs / total_runs * 100) if total_runs > 0 else 0,
        },
        "last_updated": datetime.now().isoformat(),
    })


@app.route('/api/models', methods=['GET'])
def get_models():
    """Get all models."""
    models = []

    # Check for model files in the data directory
    model_dirs = [
        Path("data/models"),
        Path("models"),
    ]

    for model_dir in model_dirs:
        if model_dir.exists():
            for model_file in model_dir.glob("**/*.pkl"):
                models.append({
                    "id": model_file.stem,
                    "name": model_file.stem.replace("_", " ").title(),
                    "path": str(model_file),
                    "size": model_file.stat().st_size,
                    "modified": datetime.fromtimestamp(model_file.stat().st_mtime).isoformat(),
                })

    return jsonify(models)


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get overall statistics."""
    use_cases = get_use_cases_from_db()
    runs = get_pipeline_runs()

    return jsonify({
        "total_use_cases": len(use_cases),
        "total_pipelines": len(runs),
        "departments": len(DEPARTMENTS),
        "active_models": len([uc for uc in use_cases if uc.get("status") == "completed"]),
    })


# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500


if __name__ == '__main__':
    logger.info("Starting Banking ML Pipeline API Server")
    app.run(host='0.0.0.0', port=8000, debug=True)
