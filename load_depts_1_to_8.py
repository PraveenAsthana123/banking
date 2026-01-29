#!/usr/bin/env python3
"""Load Departments 1-8 (52 use cases) into banking_unified.db."""
import os, sys, csv, sqlite3
from pathlib import Path

# Add script directory to path for local imports
_SCRIPT_DIR = Path(__file__).resolve().parent
if str(_SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPT_DIR))

from config import UNIFIED_DB, USE_CASES_DIR

DB_PATH = str(UNIFIED_DB)
BASE = str(USE_CASES_DIR)
BATCH_SIZE = 10000

TABLES = {
    # Dept 1: Fraud Management
    "uc_fr_01_fraud_scoring": "B_Risk_Fraud_and_Financial_Crime/01_Fraud_Management/data/UC-FR-01/csv/fraud_scoring_unified.csv",
    "uc_fr_02_sequential_fraud": "B_Risk_Fraud_and_Financial_Crime/01_Fraud_Management/data/UC-FR-02/csv/sequential_fraud_unified.csv",
    "uc_fr_03_merchant_device": "B_Risk_Fraud_and_Financial_Crime/01_Fraud_Management/data/UC-FR-03/csv/merchant_device_fraud_unified.csv",
    "uc_fr_04_copilot_usage": "B_Risk_Fraud_and_Financial_Crime/01_Fraud_Management/data/UC-FR-04/csv/fraud_copilot_usage_unified.csv",
    "uc_fr_05_fraud_exposure": "B_Risk_Fraud_and_Financial_Crime/01_Fraud_Management/data/UC-FR-05/csv/fraud_exposure_unified.csv",
    "uc_fr_06_fraud_decision": "B_Risk_Fraud_and_Financial_Crime/01_Fraud_Management/data/UC-FR-06/csv/fraud_decision_unified.csv",
    "uc_fr_07_false_positive": "B_Risk_Fraud_and_Financial_Crime/01_Fraud_Management/data/UC-FR-07/csv/false_positive_unified.csv",
    # Dept 2: Credit Risk
    "uc_cr_01_credit_scoring": "B_Risk_Fraud_and_Financial_Crime/02_Credit_Risk_Lending/data/UC-CR-01/csv/credit_scoring_unified.csv",
    "uc_cr_02_alt_scoring": "B_Risk_Fraud_and_Financial_Crime/02_Credit_Risk_Lending/data/UC-CR-02/csv/alt_credit_scoring_unified.csv",
    "uc_cr_03_approval": "B_Risk_Fraud_and_Financial_Crime/02_Credit_Risk_Lending/data/UC-CR-03/csv/credit_approval_unified.csv",
    "uc_cr_04_pricing": "B_Risk_Fraud_and_Financial_Crime/02_Credit_Risk_Lending/data/UC-CR-04/csv/risk_pricing_unified.csv",
    "uc_cr_05_copilot": "B_Risk_Fraud_and_Financial_Crime/02_Credit_Risk_Lending/data/UC-CR-05/csv/underwriter_copilot_unified.csv",
    "uc_cr_06_portfolio": "B_Risk_Fraud_and_Financial_Crime/02_Credit_Risk_Lending/data/UC-CR-06/csv/portfolio_monitoring_unified.csv",
    "uc_cr_07_simulator": "B_Risk_Fraud_and_Financial_Crime/02_Credit_Risk_Lending/data/UC-CR-07/csv/portfolio_simulator_unified.csv",
    # Dept 3: AML
    "uc_aml_01_alert_priority": "B_Risk_Fraud_and_Financial_Crime/03_AML_Financial_Crime/data/UC-AML-01/csv/aml_alert_priority_unified.csv",
    "uc_aml_02_network": "B_Risk_Fraud_and_Financial_Crime/03_AML_Financial_Crime/data/UC-AML-02/csv/network_laundering_unified.csv",
    "uc_aml_03_sar_narratives": "B_Risk_Fraud_and_Financial_Crime/03_AML_Financial_Crime/data/UC-AML-03/csv/sar_narratives_unified.csv",
    "uc_aml_04_copilot": "B_Risk_Fraud_and_Financial_Crime/03_AML_Financial_Crime/data/UC-AML-04/csv/aml_copilot_usage_unified.csv",
    "uc_aml_05_disposition": "B_Risk_Fraud_and_Financial_Crime/03_AML_Financial_Crime/data/UC-AML-05/csv/disposition_recommendation_unified.csv",
    "uc_aml_06_exposure": "B_Risk_Fraud_and_Financial_Crime/03_AML_Financial_Crime/data/UC-AML-06/csv/aml_risk_exposure_unified.csv",
    # Dept 4: Collections
    "uc_col_01_delinquency": "B_Risk_Fraud_and_Financial_Crime/04_Collections_Recovery/data/UC-COL-01/csv/delinquency_prediction_unified.csv",
    "uc_col_02_recovery": "B_Risk_Fraud_and_Financial_Crime/04_Collections_Recovery/data/UC-COL-02/csv/recovery_scoring_unified.csv",
    "uc_col_03_next_action": "B_Risk_Fraud_and_Financial_Crime/04_Collections_Recovery/data/UC-COL-03/csv/best_next_action_unified.csv",
    "uc_col_04_copilot": "B_Risk_Fraud_and_Financial_Crime/04_Collections_Recovery/data/UC-COL-04/csv/collection_copilot_unified.csv",
    "uc_col_05_roll_rate": "B_Risk_Fraud_and_Financial_Crime/04_Collections_Recovery/data/UC-COL-05/csv/roll_rate_monitoring_unified.csv",
    "uc_col_06_compliance": "B_Risk_Fraud_and_Financial_Crime/04_Collections_Recovery/data/UC-COL-06/csv/compliance_sentiment_unified.csv",
    # Dept 5: Contact Center
    "uc_cc_01_volume_forecast": "C_Operations_and_Cost_Optimization/05_Contact_Center/data/UC-CC-01/csv/call_volume_forecast_unified.csv",
    "uc_cc_02_agent_assist": "C_Operations_and_Cost_Optimization/05_Contact_Center/data/UC-CC-02/csv/agent_assist_unified.csv",
    "uc_cc_03_nbo": "C_Operations_and_Cost_Optimization/05_Contact_Center/data/UC-CC-03/csv/next_best_offer_unified.csv",
    "uc_cc_04_routing": "C_Operations_and_Cost_Optimization/05_Contact_Center/data/UC-CC-04/csv/call_routing_unified.csv",
    "uc_cc_05_qa": "C_Operations_and_Cost_Optimization/05_Contact_Center/data/UC-CC-05/csv/qa_compliance_unified.csv",
    "uc_cc_06_speech": "C_Operations_and_Cost_Optimization/05_Contact_Center/data/UC-CC-06/csv/speech_analytics_unified.csv",
    "uc_cc_07_retention": "C_Operations_and_Cost_Optimization/05_Contact_Center/data/UC-CC-07/csv/retention_engine_unified.csv",
    # Dept 6: Branch Operations
    "uc_bo_01_staffing": "C_Operations_and_Cost_Optimization/06_Branch_Operations/data/UC-BO-01/csv/branch_staffing_unified.csv",
    "uc_bo_02_queue": "C_Operations_and_Cost_Optimization/06_Branch_Operations/data/UC-BO-02/csv/queue_prediction_unified.csv",
    "uc_bo_03_footfall": "C_Operations_and_Cost_Optimization/06_Branch_Operations/data/UC-BO-03/csv/footfall_analytics_unified.csv",
    "uc_bo_04_churn": "C_Operations_and_Cost_Optimization/06_Branch_Operations/data/UC-BO-04/csv/branch_churn_unified.csv",
    "uc_bo_05_copilot": "C_Operations_and_Cost_Optimization/06_Branch_Operations/data/UC-BO-05/csv/branch_copilot_unified.csv",
    "uc_bo_06_allocation": "C_Operations_and_Cost_Optimization/06_Branch_Operations/data/UC-BO-06/csv/counter_allocation_unified.csv",
    # Dept 7: ATM
    "uc_atm_01_cash_demand": "C_Operations_and_Cost_Optimization/07_ATM_Cash_Operations/data/UC-ATM-01/csv/cash_demand_forecast_unified.csv",
    "uc_atm_02_routes": "C_Operations_and_Cost_Optimization/07_ATM_Cash_Operations/data/UC-ATM-02/csv/route_optimization_unified.csv",
    "uc_atm_03_health": "C_Operations_and_Cost_Optimization/07_ATM_Cash_Operations/data/UC-ATM-03/csv/atm_health_unified.csv",
    "uc_atm_04_surveillance": "C_Operations_and_Cost_Optimization/07_ATM_Cash_Operations/data/UC-ATM-04/csv/surveillance_metadata_unified.csv",
    "uc_atm_05_copilot": "C_Operations_and_Cost_Optimization/07_ATM_Cash_Operations/data/UC-ATM-05/csv/atm_copilot_unified.csv",
    "uc_atm_06_replenishment": "C_Operations_and_Cost_Optimization/07_ATM_Cash_Operations/data/UC-ATM-06/csv/replenishment_decision_unified.csv",
    # Dept 8: Treasury
    "uc_tf_01_liquidity": "G_Executive_and_Enterprise_Decisioning/08_Treasury_Finance/data/UC-TF-01/csv/liquidity_forecast_unified.csv",
    "uc_tf_02_capital": "G_Executive_and_Enterprise_Decisioning/08_Treasury_Finance/data/UC-TF-02/csv/capital_allocation_unified.csv",
    "uc_tf_03_ratios": "G_Executive_and_Enterprise_Decisioning/08_Treasury_Finance/data/UC-TF-03/csv/regulatory_ratios_unified.csv",
    "uc_tf_04_stress": "G_Executive_and_Enterprise_Decisioning/08_Treasury_Finance/data/UC-TF-04/csv/stress_testing_unified.csv",
    "uc_tf_05_copilot": "G_Executive_and_Enterprise_Decisioning/08_Treasury_Finance/data/UC-TF-05/csv/treasury_copilot_unified.csv",
    "uc_tf_06_funding_mix": "G_Executive_and_Enterprise_Decisioning/08_Treasury_Finance/data/UC-TF-06/csv/funding_mix_unified.csv",
    "uc_tf_07_cash_pool": "G_Executive_and_Enterprise_Decisioning/08_Treasury_Finance/data/UC-TF-07/csv/cash_pooling_unified.csv",
}

def sanitize_col(name):
    return name.replace(" ", "_").replace("-", "_").replace(".", "_").replace("/", "_").replace("[", "_").replace("]", "_")

def load_csv(conn, table_name, csv_path):
    if not os.path.exists(csv_path):
        print(f"  SKIP {table_name}: not found"); return 0
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        cols = [sanitize_col(c) for c in reader.fieldnames]
        conn.execute(f"DROP TABLE IF EXISTS [{table_name}]")
        conn.execute(f"CREATE TABLE [{table_name}] ({', '.join(f'[{c}] TEXT' for c in cols)})")
        sql = f"INSERT INTO [{table_name}] ({', '.join(f'[{c}]' for c in cols)}) VALUES ({', '.join(['?']*len(cols))})"
        batch, count = [], 0
        for row in reader:
            batch.append([row.get(orig, "") for orig in reader.fieldnames])
            if len(batch) >= BATCH_SIZE:
                conn.executemany(sql, batch); batch = []
            count += 1
        if batch: conn.executemany(sql, batch)
        conn.commit()
        print(f"  {table_name}: {count:,} rows ({len(cols)} cols)")
        return count

def main():
    print("Loading Depts 1-8 (52 tables) into SQLite...")
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL")
    total = 0
    for t, rel in TABLES.items():
        total += load_csv(conn, t, os.path.join(BASE, rel))
    conn.close()
    print(f"\nDone: {total:,} total rows loaded")

if __name__ == "__main__": main()
