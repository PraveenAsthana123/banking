#!/usr/bin/env python3
"""
Department 13: Data Governance & AI Governance
Generate synthetic datasets for all 7 use cases (UC-GOV-01 to UC-GOV-07).
"""

import os
import json
import random
import numpy as np
import pandas as pd

BASE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE, "data")
np.random.seed(13)
random.seed(13)


def generate_uc_gov_01():
    """UC-GOV-01: Data Quality & Anomaly Monitoring"""
    print("[UC-GOV-01] Data Quality & Anomaly Monitoring")
    n = 5000
    tables = np.random.choice(["uc_06_01_creditcard_fraud", "uc_07_02_lending_club", "uc_08_01_paysim",
                                "uc_09_01_collections", "uc_11_03_bank_txn", "uc_12_02_twcs",
                                "uc_32_01_fed_rates", "customer_master", "account_master", "transaction_log"], n)
    columns = np.random.choice(["amount", "balance", "date", "customer_id", "status", "rate",
                                 "score", "flag", "name", "address", "phone", "email"], n)
    check_date = pd.date_range("2024-01-01", periods=365, freq="D")
    dates = np.random.choice(check_date.strftime("%Y-%m-%d"), n)
    completeness = np.round(np.random.beta(8, 1, n) * 100, 2)
    uniqueness = np.round(np.random.beta(6, 2, n) * 100, 2)
    validity = np.round(np.random.beta(7, 1.5, n) * 100, 2)
    consistency = np.round(np.random.beta(5, 2, n) * 100, 2)
    timeliness = np.round(np.random.beta(6, 1.5, n) * 100, 2)
    overall_score = np.round((completeness + uniqueness + validity + consistency + timeliness) / 5, 2)
    anomaly_detected = (overall_score < 70).astype(int)
    anomaly_type = np.where(anomaly_detected == 1,
                            np.random.choice(["Null Spike", "Schema Drift", "Volume Drop", "Distribution Shift", "Duplicate Surge"], n),
                            "None")
    row_count = np.random.randint(1000, 5000000, n)
    null_count = np.round(row_count * (100 - completeness) / 100).astype(int)

    df = pd.DataFrame({
        "table_name": tables, "column_name": columns, "check_date": dates,
        "completeness_pct": completeness, "uniqueness_pct": uniqueness, "validity_pct": validity,
        "consistency_pct": consistency, "timeliness_pct": timeliness, "overall_dq_score": overall_score,
        "anomaly_detected": anomaly_detected, "anomaly_type": anomaly_type,
        "row_count": row_count, "null_count": null_count,
    })
    path = os.path.join(DATA, "UC-GOV-01", "csv", "data_quality_monitoring_unified.csv")
    df.to_csv(path, index=False)
    print(f"  Saved {len(df)} rows")
    return path, "uc_gov_01_data_quality", len(df)


def generate_uc_gov_02():
    """UC-GOV-02: Model Drift & Bias Detection"""
    print("[UC-GOV-02] Model Drift & Bias Detection")
    n = 3000
    model_ids = np.random.choice([f"MDL-{i:03d}" for i in range(1, 51)], n)
    model_names = np.random.choice(["Fraud Scorer", "Credit PD Model", "AML Alert Model",
                                     "Churn Predictor", "Collection Scorer", "Sentiment Classifier",
                                     "Attrition Predictor", "Demand Forecaster"], n)
    monitoring_date = pd.date_range("2024-01-01", periods=365, freq="D")
    dates = np.random.choice(monitoring_date.strftime("%Y-%m-%d"), n)
    accuracy = np.round(np.random.beta(8, 2, n) * 100, 2)
    precision = np.round(np.random.beta(7, 2.5, n) * 100, 2)
    recall = np.round(np.random.beta(6, 2.5, n) * 100, 2)
    f1 = np.round(2 * precision * recall / (precision + recall + 0.01), 2)
    auc_roc = np.round(np.random.beta(8, 2, n), 4)
    psi = np.round(np.abs(np.random.normal(0.05, 0.08, n)), 4)  # Population Stability Index
    csi = np.round(np.abs(np.random.normal(0.03, 0.06, n)), 4)  # Characteristic Stability Index
    drift_detected = (psi > 0.1).astype(int)
    # Bias metrics
    demographic_parity_diff = np.round(np.random.normal(0.02, 0.05, n), 4)
    equalized_odds_diff = np.round(np.random.normal(0.03, 0.04, n), 4)
    disparate_impact_ratio = np.round(np.random.uniform(0.7, 1.3, n), 4)
    bias_flag = ((np.abs(demographic_parity_diff) > 0.08) | (disparate_impact_ratio < 0.8)).astype(int)
    alert_level = np.where(drift_detected + bias_flag >= 2, "Critical",
                  np.where(drift_detected + bias_flag == 1, "Warning", "Normal"))

    df = pd.DataFrame({
        "model_id": model_ids, "model_name": model_names, "monitoring_date": dates,
        "accuracy": accuracy, "precision": precision, "recall": recall, "f1_score": f1,
        "auc_roc": auc_roc, "psi": psi, "csi": csi, "drift_detected": drift_detected,
        "demographic_parity_diff": demographic_parity_diff,
        "equalized_odds_diff": equalized_odds_diff,
        "disparate_impact_ratio": disparate_impact_ratio,
        "bias_flag": bias_flag, "alert_level": alert_level,
    })
    path = os.path.join(DATA, "UC-GOV-02", "csv", "model_drift_bias_unified.csv")
    df.to_csv(path, index=False)
    print(f"  Saved {len(df)} rows")
    return path, "uc_gov_02_model_drift", len(df)


def generate_uc_gov_03():
    """UC-GOV-03: AI Risk Classification & Approval (ISO 42001)"""
    print("[UC-GOV-03] AI Risk Classification & Approval")
    n = 300
    ai_system_ids = [f"AIS-{i:04d}" for i in range(1, n + 1)]
    names = [f"AI System {i}" for i in range(1, n + 1)]
    departments = np.random.choice(["Fraud", "Credit", "AML", "Ops", "HR", "Contact Center",
                                     "Treasury", "Collections", "Branch", "IT"], n)
    risk_tiers = np.random.choice(["Minimal", "Limited", "High", "Unacceptable"], n, p=[0.3, 0.35, 0.3, 0.05])
    data_sensitivity = np.random.choice(["Public", "Internal", "Confidential", "Restricted"], n)
    human_impact = np.random.choice(["None", "Low", "Medium", "High", "Critical"], n)
    autonomy_level = np.random.choice(["Advisory", "Semi-Autonomous", "Fully Autonomous"], n, p=[0.5, 0.35, 0.15])
    explainability_score = np.round(np.random.uniform(1, 10, n), 1)
    fairness_score = np.round(np.random.uniform(1, 10, n), 1)
    robustness_score = np.round(np.random.uniform(1, 10, n), 1)
    transparency_score = np.round(np.random.uniform(1, 10, n), 1)
    overall_risk_score = np.round((explainability_score + fairness_score + robustness_score + transparency_score) / 4, 1)
    approval_status = np.random.choice(["Approved", "Conditional", "Under Review", "Rejected"], n, p=[0.4, 0.25, 0.25, 0.1])
    iso42001_aligned = np.random.choice([0, 1], n, p=[0.3, 0.7])
    last_review_date = pd.date_range("2023-06-01", periods=n, freq="2D").strftime("%Y-%m-%d")[:n]

    df = pd.DataFrame({
        "ai_system_id": ai_system_ids, "system_name": names, "department": departments,
        "risk_tier": risk_tiers, "data_sensitivity": data_sensitivity, "human_impact": human_impact,
        "autonomy_level": autonomy_level, "explainability_score": explainability_score,
        "fairness_score": fairness_score, "robustness_score": robustness_score,
        "transparency_score": transparency_score, "overall_risk_score": overall_risk_score,
        "approval_status": approval_status, "iso42001_aligned": iso42001_aligned,
        "last_review_date": last_review_date,
    })
    path = os.path.join(DATA, "UC-GOV-03", "csv", "ai_risk_classification_unified.csv")
    df.to_csv(path, index=False)
    print(f"  Saved {len(df)} rows")
    return path, "uc_gov_03_ai_risk", len(df)


def generate_uc_gov_04():
    """UC-GOV-04: End-to-End Data Lineage & Provenance Tracking"""
    print("[UC-GOV-04] Data Lineage & Provenance Tracking")
    n = 4000
    lineage_ids = [f"LIN-{i:05d}" for i in range(1, n + 1)]
    source_systems = np.random.choice(["Core Banking", "Card Platform", "AML System", "CRM",
                                        "Data Lake", "Data Warehouse", "API Gateway", "Kafka",
                                        "External Feed", "Manual Upload"], n)
    target_systems = np.random.choice(["Analytics DB", "ML Feature Store", "Dashboard", "Report",
                                        "Model Input", "Regulatory Report", "Data Mart", "API Output"], n)
    data_objects = np.random.choice(["customer_profile", "transaction_log", "account_balance",
                                      "risk_score", "fraud_alert", "credit_decision", "aml_sar",
                                      "kpi_metric", "model_output", "audit_log"], n)
    transformation_type = np.random.choice(["ETL", "ELT", "Streaming", "API Call", "Manual",
                                             "ML Pipeline", "Aggregation", "Join", "Filter"], n)
    record_count = np.random.randint(100, 10000000, n)
    latency_minutes = np.round(np.random.lognormal(2, 1.5, n), 1)
    quality_gate_passed = np.random.choice([0, 1], n, p=[0.15, 0.85])
    schema_version = np.random.choice(["v1.0", "v1.1", "v2.0", "v2.1", "v3.0"], n)
    last_updated = pd.date_range("2024-01-01", periods=365, freq="D")
    dates = np.random.choice(last_updated.strftime("%Y-%m-%d %H:%M:%S"), n)
    owner = np.random.choice(["Data Eng", "Analytics", "ML Ops", "Business", "Compliance"], n)

    df = pd.DataFrame({
        "lineage_id": lineage_ids, "source_system": source_systems, "target_system": target_systems,
        "data_object": data_objects, "transformation_type": transformation_type,
        "record_count": record_count, "latency_minutes": latency_minutes,
        "quality_gate_passed": quality_gate_passed, "schema_version": schema_version,
        "last_updated": dates, "owner": owner,
    })
    path = os.path.join(DATA, "UC-GOV-04", "csv", "data_lineage_unified.csv")
    df.to_csv(path, index=False)

    # Log samples
    log_lines = []
    for i in range(500):
        ts = f"2024-{random.randint(1,12):02d}-{random.randint(1,28):02d}T{random.randint(0,23):02d}:{random.randint(0,59):02d}:{random.randint(0,59):02d}"
        level = random.choice(["INFO", "WARN", "ERROR"])
        msg = random.choice([
            f"Pipeline {random.choice(['ETL','ML','Stream'])}-{random.randint(1,50):03d} completed in {random.randint(10,3600)}s",
            f"Schema change detected in {random.choice(['customer_profile','transaction_log','risk_score'])}",
            f"Quality gate {'PASSED' if random.random()>0.15 else 'FAILED'} for {random.choice(data_objects)}",
            f"Lineage break detected: {random.choice(source_systems[:5])} → {random.choice(target_systems[:5])}",
        ])
        log_lines.append(f"{ts} [{level}] {msg}")
    log_path = os.path.join(DATA, "UC-GOV-04", "logs", "lineage_pipeline.log")
    with open(log_path, "w") as f:
        f.write("\n".join(log_lines))

    print(f"  Saved {len(df)} rows + {len(log_lines)} log lines")
    return path, "uc_gov_04_data_lineage", len(df)


def generate_uc_gov_05():
    """UC-GOV-05: AI Governance & Policy Copilot (RAG)"""
    print("[UC-GOV-05] AI Governance & Policy Copilot")
    policies = [
        {"id": "POL-001", "title": "AI Model Development Standard", "content": "All AI models must undergo peer review, validation testing, and bias assessment before deployment. Models classified as High Risk require MRM committee approval. Documentation must include model card, data lineage, performance metrics, and known limitations."},
        {"id": "POL-002", "title": "Data Quality Policy", "content": "All data assets must maintain minimum quality scores: Completeness >95%, Accuracy >98%, Timeliness <24h, Consistency >90%. Data stewards must be assigned for all critical data elements. Quality issues must be reported within 4 hours."},
        {"id": "POL-003", "title": "AI Ethics & Fairness Framework", "content": "AI systems must not discriminate based on protected characteristics. Fairness metrics (demographic parity, equalized odds, disparate impact ratio) must be monitored monthly. Any fairness violation triggers immediate review and potential model suspension."},
        {"id": "POL-004", "title": "Model Risk Management Policy", "content": "Models are classified into Tier 1 (critical), Tier 2 (significant), Tier 3 (limited). Tier 1 models require annual independent validation, monthly performance monitoring, and quarterly stress testing. Model inventory must be maintained and updated quarterly."},
        {"id": "POL-005", "title": "AI Incident Response Procedure", "content": "AI incidents classified as: P1 (production failure, immediate response), P2 (degraded performance, 4h response), P3 (minor issue, 24h response). Kill-switch capability required for all Tier 1 models. Post-incident review mandatory within 5 business days."},
        {"id": "POL-006", "title": "Data Privacy & AI Compliance", "content": "AI systems processing personal data must comply with GDPR, CCPA, and local regulations. Privacy impact assessments required before deployment. Data minimization principle: collect only what is necessary. Right to explanation for automated decisions affecting individuals."},
        {"id": "POL-007", "title": "ISO 42001 AI Management System", "content": "The organization adopts ISO 42001 as the framework for AI governance. Risk-based approach to AI lifecycle management. Regular internal audits and management reviews. Continuous improvement through PDCA cycle. Certification target: 2025 Q4."},
    ]
    text_path = os.path.join(DATA, "UC-GOV-05", "text", "governance_policies.json")
    with open(text_path, "w") as f:
        json.dump(policies, f, indent=2)

    # Usage log CSV
    n = 1500
    df = pd.DataFrame({
        "query_id": range(1, n + 1),
        "query_text": [random.choice([
            "What is the model validation requirement for Tier 1?",
            "How do we handle AI bias detection?",
            "What are the data quality thresholds?",
            "Explain the AI incident response process",
            "What does ISO 42001 require?",
            "How to classify AI risk tier?",
            "What fairness metrics must be monitored?",
        ]) for _ in range(n)],
        "policy_retrieved": np.random.choice([p["id"] for p in policies], n),
        "relevance_score": np.round(np.random.uniform(0.4, 1.0, n), 3),
        "user_satisfaction": np.random.choice([1, 2, 3, 4, 5], n, p=[0.03, 0.07, 0.15, 0.4, 0.35]),
        "response_time_ms": np.random.randint(80, 3000, n),
    })
    csv_path = os.path.join(DATA, "UC-GOV-05", "csv", "governance_copilot_usage_unified.csv")
    df.to_csv(csv_path, index=False)
    print(f"  Saved {len(policies)} policies, {len(df)} usage rows")
    return csv_path, "uc_gov_05_copilot_usage", len(df)


def generate_uc_gov_06():
    """UC-GOV-06: AI Portfolio Prioritization & Value Scoring"""
    print("[UC-GOV-06] AI Portfolio Prioritization & Value Scoring")
    n = 400
    df = pd.DataFrame({
        "initiative_id": [f"GOV-AI-{i:04d}" for i in range(1, n + 1)],
        "initiative_name": [f"AI Initiative {i}" for i in range(1, n + 1)],
        "domain": np.random.choice(["Fraud", "Credit", "AML", "Ops", "HR", "Contact Center",
                                     "Treasury", "Collections", "Governance", "Strategy"], n),
        "ai_type": np.random.choice(["ML", "DL", "NLP", "RAG", "CV", "Hybrid"], n),
        "risk_tier": np.random.choice(["Minimal", "Limited", "High"], n, p=[0.3, 0.4, 0.3]),
        "maturity": np.random.choice(["Ideation", "POC", "Pilot", "Production", "Scale"], n),
        "value_score": np.round(np.random.uniform(10, 100, n), 1),
        "effort_score": np.round(np.random.uniform(10, 100, n), 1),
        "risk_score": np.round(np.random.uniform(1, 10, n), 1),
        "data_readiness": np.round(np.random.uniform(1, 10, n), 1),
        "governance_readiness": np.round(np.random.uniform(1, 10, n), 1),
        "priority_rank": np.random.randint(1, n + 1, n),
        "approved": np.random.choice([0, 1], n, p=[0.3, 0.7]),
    })
    path = os.path.join(DATA, "UC-GOV-06", "csv", "ai_portfolio_governance_unified.csv")
    df.to_csv(path, index=False)
    print(f"  Saved {len(df)} rows")
    return path, "uc_gov_06_ai_portfolio", len(df)


def generate_uc_gov_07():
    """UC-GOV-07: AI Kill-Switch & Incident Response Automation"""
    print("[UC-GOV-07] AI Kill-Switch & Incident Response")
    n = 2000
    incident_ids = [f"INC-{i:05d}" for i in range(1, n + 1)]
    model_ids = np.random.choice([f"MDL-{i:03d}" for i in range(1, 51)], n)
    severity = np.random.choice(["P1", "P2", "P3", "P4"], n, p=[0.1, 0.2, 0.35, 0.35])
    incident_type = np.random.choice(["Model Failure", "Drift Detected", "Bias Alert",
                                       "Data Pipeline Break", "Latency Spike", "Security Event",
                                       "Compliance Violation", "Kill-Switch Triggered"], n)
    detection_method = np.random.choice(["Automated Monitor", "Manual Review", "Customer Complaint",
                                          "Audit Finding", "Regulator Flag"], n, p=[0.5, 0.2, 0.15, 0.1, 0.05])
    response_time_minutes = np.round(np.random.lognormal(3, 1.5, n), 1)
    resolution_time_hours = np.round(np.random.lognormal(2, 1.2, n), 1)
    kill_switch_activated = np.random.choice([0, 1], n, p=[0.85, 0.15])
    root_cause = np.random.choice(["Data Quality", "Model Decay", "Infrastructure", "Config Error",
                                    "External Factor", "Design Flaw", "Unknown"], n)
    impact_users = np.random.randint(0, 100000, n)
    impact_revenue_k = np.round(np.random.lognormal(3, 2, n), 2)
    post_mortem_complete = np.random.choice([0, 1], n, p=[0.3, 0.7])

    df = pd.DataFrame({
        "incident_id": incident_ids, "model_id": model_ids, "severity": severity,
        "incident_type": incident_type, "detection_method": detection_method,
        "response_time_minutes": response_time_minutes, "resolution_time_hours": resolution_time_hours,
        "kill_switch_activated": kill_switch_activated, "root_cause": root_cause,
        "impact_users": impact_users, "impact_revenue_k": impact_revenue_k,
        "post_mortem_complete": post_mortem_complete,
    })
    csv_path = os.path.join(DATA, "UC-GOV-07", "csv", "ai_incidents_unified.csv")
    df.to_csv(csv_path, index=False)

    # Incident logs
    log_lines = []
    for i in range(800):
        ts = f"2024-{random.randint(1,12):02d}-{random.randint(1,28):02d}T{random.randint(0,23):02d}:{random.randint(0,59):02d}:{random.randint(0,59):02d}"
        lvl = random.choice(["INFO", "WARN", "ERROR", "CRITICAL"])
        msg = random.choice([
            f"Kill-switch CHECK: MDL-{random.randint(1,50):03d} status=OK",
            f"ALERT: Model drift threshold exceeded PSI={random.uniform(0.1,0.5):.3f}",
            f"INCIDENT: Kill-switch ACTIVATED for MDL-{random.randint(1,50):03d}",
            f"RECOVERY: Model MDL-{random.randint(1,50):03d} restored after {random.randint(1,48)}h",
            f"AUDIT: Post-mortem completed for INC-{random.randint(1,2000):05d}",
        ])
        log_lines.append(f"{ts} [{lvl}] {msg}")
    log_path = os.path.join(DATA, "UC-GOV-07", "logs", "kill_switch.log")
    with open(log_path, "w") as f:
        f.write("\n".join(log_lines))

    print(f"  Saved {len(df)} rows + {len(log_lines)} log lines")
    return csv_path, "uc_gov_07_ai_incidents", len(df)


def main():
    print("=" * 60)
    print("DEPT 13: Data & AI Governance - Data Generation")
    print("=" * 60)
    results = []
    for fn in [generate_uc_gov_01, generate_uc_gov_02, generate_uc_gov_03,
               generate_uc_gov_04, generate_uc_gov_05, generate_uc_gov_06, generate_uc_gov_07]:
        path, table, count = fn()
        results.append({"path": path, "table": table, "count": count})
    manifest_path = os.path.join(DATA, "manifest.json")
    with open(manifest_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nGenerated {len(results)} datasets for Department 13")


if __name__ == "__main__":
    main()
