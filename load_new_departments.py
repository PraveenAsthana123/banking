#!/usr/bin/env python3
"""Load Department 12, 13, 14 datasets into banking_unified.db and preprocessing_results.db."""

import os
import sys
import csv
import sqlite3
from datetime import datetime
from pathlib import Path

# Add script directory to path for local imports
_SCRIPT_DIR = Path(__file__).resolve().parent
if str(_SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPT_DIR))

from config import UNIFIED_DB, USE_CASES_DIR

DB_PATH = str(UNIFIED_DB)
BATCH_SIZE = 10000
BASE = str(USE_CASES_DIR)

NEW_TABLES = {
    # Dept 14: Strategy / Transformation Office
    "uc_st_01_strategy_scenarios": "G_Executive_and_Enterprise_Decisioning/14_Strategy_Transformation_Office/data/UC-ST-01/csv/strategy_scenarios_unified.csv",
    "uc_st_02_ai_portfolio": "G_Executive_and_Enterprise_Decisioning/14_Strategy_Transformation_Office/data/UC-ST-02/csv/ai_portfolio_unified.csv",
    "uc_st_03_transformation_roi": "G_Executive_and_Enterprise_Decisioning/14_Strategy_Transformation_Office/data/UC-ST-03/csv/transformation_roi_unified.csv",
    "uc_st_04_transformation_risks": "G_Executive_and_Enterprise_Decisioning/14_Strategy_Transformation_Office/data/UC-ST-04/csv/transformation_risks_unified.csv",
    "uc_st_05_copilot_usage": "G_Executive_and_Enterprise_Decisioning/14_Strategy_Transformation_Office/data/UC-ST-05/csv/copilot_usage_unified.csv",
    "uc_st_06_funding_wave": "G_Executive_and_Enterprise_Decisioning/14_Strategy_Transformation_Office/data/UC-ST-06/csv/funding_wave_unified.csv",
    "uc_st_07_board_kpis": "G_Executive_and_Enterprise_Decisioning/14_Strategy_Transformation_Office/data/UC-ST-07/csv/board_kpis_unified.csv",
    # Dept 13: Data & AI Governance
    "uc_gov_01_data_quality": "D_Data_Governance_and_Platform/13_Data_AI_Governance/data/UC-GOV-01/csv/data_quality_monitoring_unified.csv",
    "uc_gov_02_model_drift": "D_Data_Governance_and_Platform/13_Data_AI_Governance/data/UC-GOV-02/csv/model_drift_bias_unified.csv",
    "uc_gov_03_ai_risk": "D_Data_Governance_and_Platform/13_Data_AI_Governance/data/UC-GOV-03/csv/ai_risk_classification_unified.csv",
    "uc_gov_04_data_lineage": "D_Data_Governance_and_Platform/13_Data_AI_Governance/data/UC-GOV-04/csv/data_lineage_unified.csv",
    "uc_gov_05_copilot_usage": "D_Data_Governance_and_Platform/13_Data_AI_Governance/data/UC-GOV-05/csv/governance_copilot_usage_unified.csv",
    "uc_gov_06_ai_portfolio": "D_Data_Governance_and_Platform/13_Data_AI_Governance/data/UC-GOV-06/csv/ai_portfolio_governance_unified.csv",
    "uc_gov_07_ai_incidents": "D_Data_Governance_and_Platform/13_Data_AI_Governance/data/UC-GOV-07/csv/ai_incidents_unified.csv",
    # Dept 12: Workforce / HR Management
    "uc_hr_01_attrition": "C_Operations_and_Cost_Optimization/12_Workforce_HR_Management/data/UC-HR-01/csv/employee_attrition_unified.csv",
    "uc_hr_02_workforce_demand": "C_Operations_and_Cost_Optimization/12_Workforce_HR_Management/data/UC-HR-02/csv/workforce_demand_unified.csv",
    "uc_hr_03_hiring": "C_Operations_and_Cost_Optimization/12_Workforce_HR_Management/data/UC-HR-03/csv/hiring_mobility_unified.csv",
    "uc_hr_04_copilot_usage": "C_Operations_and_Cost_Optimization/12_Workforce_HR_Management/data/UC-HR-04/csv/hr_copilot_usage_unified.csv",
    "uc_hr_05_performance_bias": "C_Operations_and_Cost_Optimization/12_Workforce_HR_Management/data/UC-HR-05/csv/performance_bias_unified.csv",
    "uc_hr_06_resume_screening": "C_Operations_and_Cost_Optimization/12_Workforce_HR_Management/data/UC-HR-06/csv/resume_screening_unified.csv",
    "uc_hr_07_workforce_sim": "C_Operations_and_Cost_Optimization/12_Workforce_HR_Management/data/UC-HR-07/csv/workforce_simulator_unified.csv",
}

def sanitize_col(name):
    return name.replace(" ", "_").replace("-", "_").replace(".", "_").replace("/", "_").replace("[", "_").replace("]", "_")

def load_csv(conn, table_name, csv_path):
    if not os.path.exists(csv_path):
        print(f"  SKIP {table_name}: {csv_path} not found")
        return 0
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        cols = [sanitize_col(c) for c in reader.fieldnames]
        conn.execute(f"DROP TABLE IF EXISTS [{table_name}]")
        conn.execute(f"CREATE TABLE [{table_name}] ({', '.join(f'[{c}] TEXT' for c in cols)})")
        placeholders = ", ".join(["?"] * len(cols))
        sql = f"INSERT INTO [{table_name}] ({', '.join(f'[{c}]' for c in cols)}) VALUES ({placeholders})"
        batch, count = [], 0
        for row in reader:
            batch.append([row.get(orig, "") for orig in reader.fieldnames])
            if len(batch) >= BATCH_SIZE:
                conn.executemany(sql, batch)
                batch = []
            count += 1
        if batch:
            conn.executemany(sql, batch)
        conn.commit()
        print(f"  {table_name}: {count:,} rows ({len(cols)} cols)")
        return count

def main():
    print("Loading Dept 12/13/14 into SQLite...")
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL")
    total = 0
    for table, rel in NEW_TABLES.items():
        total += load_csv(conn, table, os.path.join(BASE, rel))
    conn.close()
    print(f"\nDone: {total:,} total rows loaded into {DB_PATH}")

if __name__ == "__main__":
    main()
