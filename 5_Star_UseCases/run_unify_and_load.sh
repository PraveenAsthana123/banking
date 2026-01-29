#!/usr/bin/env bash
# Unify banking CSV data and load into SQLite.
# Designed to be run manually or via cron.

set -euo pipefail

SCRIPT_DIR="/mnt/deepa/Banking/5_Star_UseCases"
LOG_DIR="/mnt/deepa/Banking/logs"

mkdir -p "$LOG_DIR"

echo "=========================================="
echo "Unify & Load Job: $(date -Iseconds)"
echo "=========================================="

echo ""
echo "--- Step 1: Unify CSVs ---"
cd "$SCRIPT_DIR"
python3 unify_data.py

echo ""
echo "--- Step 2: Load to SQLite ---"
python3 load_to_sqlite.py

echo ""
echo "=========================================="
echo "Job complete: $(date -Iseconds)"
echo "=========================================="
