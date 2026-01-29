#!/usr/bin/env python3
"""
Load unified CSV files into a SQLite database.
Creates/recreates tables for each use case with all columns as TEXT.
"""

import os
import csv
import sqlite3
import sys
from datetime import datetime
from pathlib import Path

# Add parent directory to path for config imports
_PARENT_DIR = Path(__file__).resolve().parent.parent
if str(_PARENT_DIR) not in sys.path:
    sys.path.insert(0, str(_PARENT_DIR))

from config import UNIFIED_DB, USE_CASES_DIR

BASE = str(USE_CASES_DIR)
DB_PATH = str(UNIFIED_DB)
BATCH_SIZE = 10000

# Mapping: table_name -> path to unified CSV (relative to BASE)
TABLE_MAP = {
    "uc_06_01_creditcard_fraud": "B_Risk_Fraud_and_Financial_Crime/06_Fraud_Management/data/UC-06-01/creditcard_unified.csv",
    "uc_06_04_rba_auth": "B_Risk_Fraud_and_Financial_Crime/06_Fraud_Management/data/UC-06-04/rba_dataset_unified.csv",
    "uc_07_02_lending_club": "B_Risk_Fraud_and_Financial_Crime/07_Credit_Risk_Management/data/UC-07-02/lending_club_unified.csv",
    "uc_07_03_loan_data": "B_Risk_Fraud_and_Financial_Crime/07_Credit_Risk_Management/data/UC-07-03/loan_data_unified.csv",
    "uc_08_01_paysim": "B_Risk_Fraud_and_Financial_Crime/08_AML_Financial_Crime/data/UC-08-01/paysim_unified.csv",
    "uc_08_03_aml": "B_Risk_Fraud_and_Financial_Crime/08_AML_Financial_Crime/data/UC-08-03/aml_synthetic_unified.csv",
    "uc_09_01_collections": "B_Risk_Fraud_and_Financial_Crime/09_Collections_and_Recovery/data/UC-09-01/credit_card_default_unified.csv",
    "uc_11_03_bank_txn": "C_Operations_and_Cost_Optimization/11_Branch_Operations/data/UC-11-03/bank_transactions_unified.csv",
    "uc_12_02_twcs": "C_Operations_and_Cost_Optimization/12_Contact_Center_Operations/data/UC-12-02/twcs_unified.csv",
    "uc_16_01_data_quality": "D_Data_Governance_and_Platform/16_Data_Governance_and_Quality/data/UC-16-01/bank_transactions_unified.csv",
    "uc_32_01_fed_rates": "G_Executive_and_Enterprise_Decisioning/32_Treasury/data/UC-32-01/fed_rates_unified.csv",
}

# Columns to index for query performance
INDEX_COLUMNS = ["us_state", "us_city", "us_state_name",
                 "orig_us_state", "orig_us_city",
                 "dest_us_state", "dest_us_city",
                 "sender_us_state", "sender_us_city",
                 "receiver_us_state", "receiver_us_city"]


def sanitize_col(name):
    """Make column name safe for SQLite."""
    return name.replace(" ", "_").replace("-", "_").replace(".", "_").replace("/", "_").replace("[", "_").replace("]", "_")


def load_csv_to_table(conn, table_name, csv_path):
    """Load a single CSV into a SQLite table. Drop + recreate."""
    if not os.path.exists(csv_path):
        print(f"  SKIP {table_name}: file not found: {csv_path}")
        return 0

    with open(csv_path, 'r', encoding='utf-8', errors='replace') as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            print(f"  SKIP {table_name}: no headers")
            return 0

        cols = [sanitize_col(c) for c in reader.fieldnames]

        # Drop and create
        conn.execute(f"DROP TABLE IF EXISTS [{table_name}]")
        col_defs = ", ".join(f"[{c}] TEXT" for c in cols)
        conn.execute(f"CREATE TABLE [{table_name}] ({col_defs})")

        # Batch insert
        placeholders = ", ".join(["?"] * len(cols))
        insert_sql = f"INSERT INTO [{table_name}] ({', '.join(f'[{c}]' for c in cols)}) VALUES ({placeholders})"

        batch = []
        count = 0
        for row in reader:
            values = [row.get(orig, "") for orig in reader.fieldnames]
            batch.append(values)
            if len(batch) >= BATCH_SIZE:
                conn.executemany(insert_sql, batch)
                batch = []
            count += 1

        if batch:
            conn.executemany(insert_sql, batch)

        conn.commit()

        # Create indexes on location columns that exist in this table
        for col in INDEX_COLUMNS:
            sc = sanitize_col(col)
            if sc in cols:
                idx_name = f"idx_{table_name}_{sc}"
                conn.execute(f"CREATE INDEX IF NOT EXISTS [{idx_name}] ON [{table_name}] ([{sc}])")
        conn.commit()

        print(f"  {table_name}: {count:,} rows loaded ({len(cols)} columns)")
        return count


def main():
    print("=" * 60)
    print(f"LOAD UNIFIED CSVs INTO SQLITE")
    print(f"Database: {DB_PATH}")
    print(f"Started: {datetime.now().isoformat()}")
    print("=" * 60)

    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")

    total = 0
    for table_name, rel_path in TABLE_MAP.items():
        csv_path = os.path.join(BASE, rel_path)
        print(f"\n[{table_name}]")
        try:
            rows = load_csv_to_table(conn, table_name, csv_path)
            total += rows
        except Exception as e:
            print(f"  ERROR: {e}")

    conn.close()

    print("\n" + "=" * 60)
    print(f"DONE: {total:,} total rows in {DB_PATH}")
    print(f"Finished: {datetime.now().isoformat()}")
    print("=" * 60)


if __name__ == "__main__":
    main()
