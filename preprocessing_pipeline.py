#!/usr/bin/env python3
"""
Banking Data Preprocessing Pipeline
====================================
Comprehensive EDA, data quality, outlier analysis, normalization,
standardization, and feature engineering for all 11 use case tables.

Saves quality scores and analysis results to SQLite for React Native UI consumption.
Exports JSON summaries per use case.

Usage:
    python3 preprocessing_pipeline.py [--use-case UC_NAME] [--output-dir DIR]
"""

import os
import sys
import json
import sqlite3
import argparse
import logging
import hashlib
from datetime import datetime
from collections import Counter, OrderedDict

import numpy as np
import pandas as pd
from scipy import stats

# ---------------------------------------------------------------------------
# Configuration (from centralized config module)
# ---------------------------------------------------------------------------
# Add script directory to path for local imports
_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if _SCRIPT_DIR not in sys.path:
    sys.path.insert(0, _SCRIPT_DIR)

from config import (
    UNIFIED_DB, PREPROCESSING_DB, OUTPUT_DIR as _OUTPUT_DIR, LOGS_DIR,
    SAMPLE_LIMIT as _SAMPLE_LIMIT, LOG_LEVEL, LOG_FORMAT,
    get_db_connection, validate_use_case_key, get_log_file
)

DB_PATH = str(UNIFIED_DB)
RESULTS_DB = str(PREPROCESSING_DB)
OUTPUT_DIR = str(_OUTPUT_DIR)
LOG_DIR = str(LOGS_DIR)
SAMPLE_LIMIT = _SAMPLE_LIMIT  # max rows to load per table for analysis

USE_CASES = {
    "uc_06_01_creditcard_fraud": {
        "label": "UC-06-01: Credit Card Fraud Scoring",
        "target": "Class",
        "numeric_hints": ["Time", "Amount"] + [f"V{i}" for i in range(1, 29)],
        "category": "Fraud Management",
        "domain": "fraud",
    },
    "uc_06_04_rba_auth": {
        "label": "UC-06-04: Risk-Based Authentication",
        "target": "Is_Account_Takeover",
        "numeric_hints": ["Round_Trip_Time__ms_"],
        "category": "Fraud Management",
        "domain": "fraud",
    },
    "uc_07_02_lending_club": {
        "label": "UC-07-02: Lending Club Credit Scoring",
        "target": "loan_status",
        "numeric_hints": ["loan_amnt", "funded_amnt", "int_rate", "installment", "annual_inc",
                          "dti", "delinq_2yrs", "open_acc", "pub_rec", "revol_bal", "revol_util",
                          "total_acc", "total_pymnt", "total_rec_prncp", "total_rec_int"],
        "category": "Credit Risk",
        "domain": "credit",
    },
    "uc_07_03_loan_data": {
        "label": "UC-07-03: Credit Default Prediction",
        "target": "loan_status",
        "numeric_hints": ["loan_amnt", "funded_amnt", "int_rate", "installment", "annual_inc",
                          "dti", "delinq_2yrs", "open_acc", "revol_bal", "revol_util"],
        "category": "Credit Risk",
        "domain": "credit",
    },
    "uc_08_01_paysim": {
        "label": "UC-08-01: AML Alert Prioritization (PaySim)",
        "target": "isFraud",
        "numeric_hints": ["step", "amount", "oldbalanceOrg", "newbalanceOrig",
                          "oldbalanceDest", "newbalanceDest"],
        "category": "AML / Financial Crime",
        "domain": "aml",
    },
    "uc_08_03_aml": {
        "label": "UC-08-03: SAR Narrative / AML Detection",
        "target": "Is_laundering",
        "numeric_hints": ["Amount"],
        "category": "AML / Financial Crime",
        "domain": "aml",
    },
    "uc_09_01_collections": {
        "label": "UC-09-01: Default / Delinquency Prediction",
        "target": "default_payment_next_month",
        "numeric_hints": ["LIMIT_BAL", "AGE", "BILL_AMT1", "BILL_AMT2", "BILL_AMT3",
                          "BILL_AMT4", "BILL_AMT5", "BILL_AMT6", "PAY_AMT1", "PAY_AMT2",
                          "PAY_AMT3", "PAY_AMT4", "PAY_AMT5", "PAY_AMT6"],
        "category": "Collections & Recovery",
        "domain": "collections",
    },
    "uc_11_03_bank_txn": {
        "label": "UC-11-03: Bank Transaction Analysis",
        "target": None,
        "numeric_hints": ["CustAccountBalance", "TransactionAmount_(INR)"],
        "category": "Branch Operations",
        "domain": "branch",
    },
    "uc_12_02_twcs": {
        "label": "UC-12-02: Customer Sentiment Analysis",
        "target": "inbound",
        "numeric_hints": [],
        "category": "Contact Center",
        "domain": "contact_center",
    },
    "uc_16_01_data_quality": {
        "label": "UC-16-01: Data Quality Monitoring",
        "target": None,
        "numeric_hints": ["CustAccountBalance", "TransactionAmount_(INR)"],
        "category": "Data Governance",
        "domain": "governance",
    },
    "uc_32_01_fed_rates": {
        "label": "UC-32-01: Treasury / Fed Rates",
        "target": None,
        "numeric_hints": ["Federal_Funds_Target_Rate", "Federal_Funds_Upper_Target",
                          "Federal_Funds_Lower_Target", "Effective_Federal_Funds_Rate",
                          "Real_GDP_(Percent_Change)", "Unemployment_Rate", "Inflation_Rate"],
        "category": "Treasury",
        "domain": "treasury",
    },
    # ---- Department 14: Strategy / Transformation Office ----
    "uc_st_01_strategy_scenarios": {
        "label": "UC-ST-01: Enterprise Strategy Scenario Simulator",
        "target": None,
        "numeric_hints": ["revenue_millions", "cost_millions", "profit_millions", "roi_pct",
                          "gdp_growth_pct", "inflation_pct", "interest_rate_pct",
                          "customer_growth_pct", "digital_adoption_pct", "nps_score",
                          "employee_count", "cost_income_ratio", "market_share_pct",
                          "risk_weighted_assets_millions", "capital_adequacy_ratio_pct"],
        "category": "Strategy / Transformation",
        "domain": "strategy",
    },
    "uc_st_02_ai_portfolio": {
        "label": "UC-ST-02: AI Portfolio Prioritization & Value Scoring",
        "target": None,
        "numeric_hints": ["priority_score", "revenue_impact_k", "cost_savings_k",
                          "implementation_cost_k", "risk_score", "strategic_alignment_score",
                          "data_readiness_score", "talent_readiness_score",
                          "time_to_value_months", "npv_k"],
        "category": "Strategy / Transformation",
        "domain": "strategy",
    },
    "uc_st_03_transformation_roi": {
        "label": "UC-ST-03: Transformation ROI Tracking",
        "target": "risk_flag",
        "numeric_hints": ["planned_benefit_k", "actual_benefit_k", "realization_pct",
                          "budget_k", "spend_k", "budget_variance_pct",
                          "milestone_completion_pct", "active_blockers", "fte_allocated",
                          "stakeholder_satisfaction"],
        "category": "Strategy / Transformation",
        "domain": "strategy",
    },
    "uc_st_04_transformation_risks": {
        "label": "UC-ST-04: Transformation Risk & Dependency Monitoring",
        "target": "escalated",
        "numeric_hints": ["risk_score", "dependency_count", "blocking_dependencies", "days_open"],
        "category": "Strategy / Transformation",
        "domain": "strategy",
    },
    "uc_st_05_copilot_usage": {
        "label": "UC-ST-05: Transformation Playbook Copilot",
        "target": None,
        "numeric_hints": ["relevance_score", "user_rating", "response_time_ms"],
        "category": "Strategy / Transformation",
        "domain": "strategy",
    },
    "uc_st_06_funding_wave": {
        "label": "UC-ST-06: Funding Wave & Roadmap Optimization",
        "target": "recommended_action",
        "numeric_hints": ["funding_requested_k", "funding_approved_k", "approval_rate_pct",
                          "strategic_score", "feasibility_score", "urgency_score",
                          "composite_score", "resource_fte", "duration_months", "dependencies"],
        "category": "Strategy / Transformation",
        "domain": "strategy",
    },
    "uc_st_07_board_kpis": {
        "label": "UC-ST-07: Transformation KPI & Board Reporting",
        "target": "status",
        "numeric_hints": ["target_value", "actual_value", "variance"],
        "category": "Strategy / Transformation",
        "domain": "strategy",
    },
    # ---- Department 13: Data & AI Governance ----
    "uc_gov_01_data_quality": {
        "label": "UC-GOV-01: Data Quality & Anomaly Monitoring",
        "target": "anomaly_detected",
        "numeric_hints": ["completeness_pct", "uniqueness_pct", "validity_pct",
                          "consistency_pct", "timeliness_pct", "overall_dq_score",
                          "row_count", "null_count"],
        "category": "Data & AI Governance",
        "domain": "governance",
    },
    "uc_gov_02_model_drift": {
        "label": "UC-GOV-02: Model Drift & Bias Detection",
        "target": "drift_detected",
        "numeric_hints": ["accuracy", "precision", "recall", "f1_score", "auc_roc",
                          "psi", "csi", "demographic_parity_diff",
                          "equalized_odds_diff", "disparate_impact_ratio"],
        "category": "Data & AI Governance",
        "domain": "governance",
    },
    "uc_gov_03_ai_risk": {
        "label": "UC-GOV-03: AI Risk Classification (ISO 42001)",
        "target": "approval_status",
        "numeric_hints": ["explainability_score", "fairness_score", "robustness_score",
                          "transparency_score", "overall_risk_score"],
        "category": "Data & AI Governance",
        "domain": "governance",
    },
    "uc_gov_04_data_lineage": {
        "label": "UC-GOV-04: Data Lineage & Provenance Tracking",
        "target": "quality_gate_passed",
        "numeric_hints": ["record_count", "latency_minutes"],
        "category": "Data & AI Governance",
        "domain": "governance",
    },
    "uc_gov_05_copilot_usage": {
        "label": "UC-GOV-05: AI Governance Policy Copilot",
        "target": None,
        "numeric_hints": ["relevance_score", "user_satisfaction", "response_time_ms"],
        "category": "Data & AI Governance",
        "domain": "governance",
    },
    "uc_gov_06_ai_portfolio": {
        "label": "UC-GOV-06: AI Portfolio Prioritization (Governance)",
        "target": "approved",
        "numeric_hints": ["value_score", "effort_score", "risk_score",
                          "data_readiness", "governance_readiness", "priority_rank"],
        "category": "Data & AI Governance",
        "domain": "governance",
    },
    "uc_gov_07_ai_incidents": {
        "label": "UC-GOV-07: AI Kill-Switch & Incident Response",
        "target": "kill_switch_activated",
        "numeric_hints": ["response_time_minutes", "resolution_time_hours",
                          "impact_users", "impact_revenue_k"],
        "category": "Data & AI Governance",
        "domain": "governance",
    },
    # ---- Department 12: Workforce / HR Management ----
    "uc_hr_01_attrition": {
        "label": "UC-HR-01: Employee Attrition Prediction",
        "target": "attrition",
        "numeric_hints": ["age", "job_level", "years_at_company", "years_in_role",
                          "monthly_income", "distance_from_home_km", "education",
                          "environment_satisfaction", "job_satisfaction", "work_life_balance",
                          "performance_rating", "training_times_last_year",
                          "num_companies_worked", "total_working_years"],
        "category": "Workforce / HR",
        "domain": "hr",
    },
    "uc_hr_02_workforce_demand": {
        "label": "UC-HR-02: Workforce Demand Forecasting",
        "target": None,
        "numeric_hints": ["current_headcount", "demand_headcount", "gap",
                          "attrition_rate", "hiring_pipeline", "avg_time_to_fill_days",
                          "overtime_hours", "contractor_count"],
        "category": "Workforce / HR",
        "domain": "hr",
    },
    "uc_hr_03_hiring": {
        "label": "UC-HR-03: Hiring & Internal Mobility Recommendation",
        "target": "recommendation",
        "numeric_hints": ["experience_years", "skills_match_score", "culture_fit_score",
                          "interview_score", "assessment_score", "composite_score",
                          "time_to_decision_days"],
        "category": "Workforce / HR",
        "domain": "hr",
    },
    "uc_hr_04_copilot_usage": {
        "label": "UC-HR-04: HR Policy Copilot",
        "target": None,
        "numeric_hints": ["relevance_score", "user_satisfaction", "response_time_ms"],
        "category": "Workforce / HR",
        "domain": "hr",
    },
    "uc_hr_05_performance_bias": {
        "label": "UC-HR-05: Performance & Bias Monitoring",
        "target": "fairness_flag",
        "numeric_hints": ["job_level", "performance_score", "salary_increase_pct",
                          "bonus_pct", "training_hours", "engagement_score"],
        "category": "Workforce / HR",
        "domain": "hr",
    },
    "uc_hr_06_resume_screening": {
        "label": "UC-HR-06: Resume Screening & Skills Extraction",
        "target": "screening_result",
        "numeric_hints": ["experience_years", "skill_count", "skills_match_pct",
                          "resume_quality_score"],
        "category": "Workforce / HR",
        "domain": "hr",
    },
    "uc_hr_07_workforce_sim": {
        "label": "UC-HR-07: Workforce Strategy Simulator",
        "target": None,
        "numeric_hints": ["current_fte", "projected_fte", "automation_impact_pct",
                          "reskilling_need_pct", "hiring_cost_k", "attrition_savings_k",
                          "productivity_index", "ai_augmented_roles_pct",
                          "total_workforce_cost_m"],
        "category": "Workforce / HR",
        "domain": "hr",
    },
    # ---- Department 1: Fraud Management ----
    "uc_fr_01_fraud_scoring": {"label": "UC-FR-01: Real-Time Fraud Scoring", "target": "is_fraud",
        "numeric_hints": ["amount", "hour", "day_of_week", "distance_from_home_km", "velocity_1h", "velocity_24h", "avg_txn_amount", "card_age_days", "fraud_score"],
        "category": "Fraud Management", "domain": "fraud"},
    "uc_fr_02_sequential_fraud": {"label": "UC-FR-02: Sequential Fraud Detection", "target": "is_fraud_sequence",
        "numeric_hints": ["sequence_num", "amount", "time_since_last_seconds", "geo_velocity_kmh"],
        "category": "Fraud Management", "domain": "fraud"},
    "uc_fr_03_merchant_device": {"label": "UC-FR-03: Merchant/Device Fraud Patterns", "target": "is_flagged",
        "numeric_hints": ["total_transactions", "total_amount", "fraud_transactions", "fraud_rate_pct", "avg_transaction_amount", "unique_cards", "unique_countries", "chargeback_rate_pct", "risk_score"],
        "category": "Fraud Management", "domain": "fraud"},
    "uc_fr_04_copilot_usage": {"label": "UC-FR-04: Fraud Investigation Copilot", "target": None,
        "numeric_hints": ["relevance_score", "user_rating", "response_time_ms"],
        "category": "Fraud Management", "domain": "fraud"},
    "uc_fr_05_fraud_exposure": {"label": "UC-FR-05: Fraud Risk Exposure Monitoring", "target": None,
        "numeric_hints": ["fraud_count", "fraud_amount", "total_txn_count", "total_txn_amount", "fraud_rate_bps", "gross_loss", "recovery_amount", "net_loss"],
        "category": "Fraud Management", "domain": "fraud"},
    "uc_fr_06_fraud_decision": {"label": "UC-FR-06: Fraud Decision Optimization", "target": "actual_fraud",
        "numeric_hints": ["fraud_score", "amount"],
        "category": "Fraud Management", "domain": "fraud"},
    "uc_fr_07_false_positive": {"label": "UC-FR-07: False Positive Reduction", "target": "is_true_fraud",
        "numeric_hints": ["fraud_score", "amount", "customer_tenure_years", "avg_monthly_spend", "merchant_risk_score"],
        "category": "Fraud Management", "domain": "fraud"},
    # ---- Department 2: Credit Risk & Lending ----
    "uc_cr_01_credit_scoring": {"label": "UC-CR-01: Credit Scoring (PD)", "target": "default",
        "numeric_hints": ["age", "annual_income", "employment_years", "loan_amount", "interest_rate", "dti", "credit_score", "delinquencies_2yr", "open_accounts", "revolving_utilization_pct", "total_credit_lines"],
        "category": "Credit Risk", "domain": "credit"},
    "uc_cr_02_alt_scoring": {"label": "UC-CR-02: Alternative Data Credit Scoring", "target": "default",
        "numeric_hints": ["bureau_score", "mobile_txn_count_30d", "utility_ontime_pct", "social_media_score", "ecommerce_spend_30d", "device_age_months", "location_stability_score", "income_proxy"],
        "category": "Credit Risk", "domain": "credit"},
    "uc_cr_03_approval": {"label": "UC-CR-03: Credit Approval Optimization", "target": "final_decision",
        "numeric_hints": ["credit_score", "dti", "loan_amount", "annual_income", "lti_ratio", "pd_score", "approved_rate_pct", "expected_loss"],
        "category": "Credit Risk", "domain": "credit"},
    "uc_cr_04_pricing": {"label": "UC-CR-04: Risk-Based Loan Pricing", "target": "loan_taken",
        "numeric_hints": ["pd_score", "lgd", "ead", "expected_loss", "base_rate", "risk_premium", "offered_rate_pct", "competitor_rate_pct", "margin_bps"],
        "category": "Credit Risk", "domain": "credit"},
    "uc_cr_05_copilot": {"label": "UC-CR-05: Underwriter Assist Copilot", "target": None,
        "numeric_hints": ["relevance_score", "user_rating", "response_time_ms"],
        "category": "Credit Risk", "domain": "credit"},
    "uc_cr_06_portfolio": {"label": "UC-CR-06: Credit Portfolio Monitoring", "target": None,
        "numeric_hints": ["outstanding_balance_m", "dpd_30_pct", "dpd_60_pct", "dpd_90_pct", "nco_rate_pct", "provision_coverage_pct", "weighted_avg_fico"],
        "category": "Credit Risk", "domain": "credit"},
    "uc_cr_07_simulator": {"label": "UC-CR-07: Credit Portfolio Strategy Simulator", "target": None,
        "numeric_hints": ["origination_volume_m", "expected_pd", "expected_lgd", "expected_loss_m", "net_interest_margin_pct", "rwa_m", "roe_pct", "capital_required_m"],
        "category": "Credit Risk", "domain": "credit"},
    # ---- Department 3: AML / Financial Crime ----
    "uc_aml_01_alert_priority": {"label": "UC-AML-01: AML Alert Prioritization", "target": "is_true_positive",
        "numeric_hints": ["transaction_amount", "txn_count_30d", "alert_score", "investigation_hours"],
        "category": "AML / Financial Crime", "domain": "aml"},
    "uc_aml_02_network": {"label": "UC-AML-02: Network Laundering Detection", "target": "is_laundering",
        "numeric_hints": ["amount", "source_degree", "target_degree", "layer_depth"],
        "category": "AML / Financial Crime", "domain": "aml"},
    "uc_aml_03_sar_narratives": {"label": "UC-AML-03: SAR Narrative Drafting", "target": None,
        "numeric_hints": ["word_count"],
        "category": "AML / Financial Crime", "domain": "aml"},
    "uc_aml_04_copilot": {"label": "UC-AML-04: AML Investigator Copilot", "target": None,
        "numeric_hints": ["relevance_score", "user_rating", "response_time_ms"],
        "category": "AML / Financial Crime", "domain": "aml"},
    "uc_aml_05_disposition": {"label": "UC-AML-05: Alert Disposition Recommendation", "target": "recommended_action",
        "numeric_hints": ["alert_score", "prior_sars"],
        "category": "AML / Financial Crime", "domain": "aml"},
    "uc_aml_06_exposure": {"label": "UC-AML-06: AML Risk Exposure Dashboard", "target": None,
        "numeric_hints": ["total_alerts", "true_positives", "false_positives", "sars_filed", "avg_investigation_hours", "backlog_count", "regulatory_findings", "risk_exposure_m"],
        "category": "AML / Financial Crime", "domain": "aml"},
    # ---- Department 4: Collections & Recovery ----
    "uc_col_01_delinquency": {"label": "UC-COL-01: Delinquency Prediction", "target": "will_default_6m",
        "numeric_hints": ["credit_score", "outstanding_balance", "months_since_last_payment", "payment_to_balance_ratio", "times_30dpd_12m", "times_60dpd_12m", "income_to_debt_ratio", "loan_age_months"],
        "category": "Collections & Recovery", "domain": "collections"},
    "uc_col_02_recovery": {"label": "UC-COL-02: Recovery Likelihood Scoring", "target": "actual_recovered",
        "numeric_hints": ["outstanding_balance", "prior_promises_kept", "prior_promises_broken", "contact_attempts", "successful_contacts", "last_payment_amount", "customer_tenure_months", "income_estimate", "recovery_score"],
        "category": "Collections & Recovery", "domain": "collections"},
    "uc_col_03_next_action": {"label": "UC-COL-03: Best Next Action", "target": "outcome",
        "numeric_hints": ["recovery_score", "discount_pct"],
        "category": "Collections & Recovery", "domain": "collections"},
    "uc_col_04_copilot": {"label": "UC-COL-04: Collections Agent Copilot", "target": None,
        "numeric_hints": ["relevance_score", "user_rating", "response_time_ms"],
        "category": "Collections & Recovery", "domain": "collections"},
    "uc_col_05_roll_rate": {"label": "UC-COL-05: Roll-rate Portfolio Monitoring", "target": None,
        "numeric_hints": ["current_pct", "dpd30_pct", "dpd60_pct", "dpd90_pct", "dpd120_pct", "dpd180_plus_pct", "roll_rate_30_to_60", "roll_rate_60_to_90", "roll_rate_90_to_120", "cure_rate_30", "nco_rate_pct", "total_outstanding_m"],
        "category": "Collections & Recovery", "domain": "collections"},
    "uc_col_06_compliance": {"label": "UC-COL-06: Script Compliance & Sentiment", "target": "escalation_triggered",
        "numeric_hints": ["call_duration_seconds", "compliance_score"],
        "category": "Collections & Recovery", "domain": "collections"},
    # ---- Department 5: Contact Center ----
    "uc_cc_01_volume_forecast": {"label": "UC-CC-01: Call Volume Forecasting", "target": None,
        "numeric_hints": ["call_volume", "chat_volume", "email_volume", "avg_wait_seconds", "avg_handle_time_seconds", "abandon_rate_pct", "fcr_rate_pct"],
        "category": "Contact Center", "domain": "contact_center"},
    "uc_cc_02_agent_assist": {"label": "UC-CC-02: Agent Assist Copilot", "target": None,
        "numeric_hints": ["relevance_score", "handle_time_reduction_pct", "csat_score"],
        "category": "Contact Center", "domain": "contact_center"},
    "uc_cc_03_nbo": {"label": "UC-CC-03: Next Best Offer", "target": "offer_accepted",
        "numeric_hints": ["tenure_months", "products_held", "monthly_balance_avg", "last_interaction_days", "churn_risk_score", "cross_sell_propensity"],
        "category": "Contact Center", "domain": "contact_center"},
    "uc_cc_04_routing": {"label": "UC-CC-04: Intelligent Call Routing", "target": "correct_routing",
        "numeric_hints": ["intent_confidence", "transfer_count", "resolution_time_s", "csat"],
        "category": "Contact Center", "domain": "contact_center"},
    "uc_cc_05_qa": {"label": "UC-CC-05: QA & Compliance Monitoring", "target": "escalation_needed",
        "numeric_hints": ["qa_score", "compliance_score"],
        "category": "Contact Center", "domain": "contact_center"},
    "uc_cc_06_speech": {"label": "UC-CC-06: Speech Analytics", "target": None,
        "numeric_hints": ["duration_seconds", "word_count", "speaker_turns", "silence_pct", "talk_over_count", "agent_talk_ratio", "sentiment_score", "key_phrases_count", "transcription_confidence"],
        "category": "Contact Center", "domain": "contact_center"},
    "uc_cc_07_retention": {"label": "UC-CC-07: Retention Decision Engine", "target": "outcome",
        "numeric_hints": ["churn_score", "lifetime_value", "tenure_months", "complaint_count_12m", "nps_score", "products_held", "monthly_revenue"],
        "category": "Contact Center", "domain": "contact_center"},
    # ---- Department 6: Branch Operations ----
    "uc_bo_01_staffing": {"label": "UC-BO-01: Branch Staffing Optimization", "target": "sla_met",
        "numeric_hints": ["footfall", "tellers_needed", "advisors_needed", "actual_tellers", "actual_advisors", "avg_wait_minutes"],
        "category": "Branch Operations", "domain": "branch"},
    "uc_bo_02_queue": {"label": "UC-BO-02: Queue Time Prediction", "target": "sla_breach",
        "numeric_hints": ["queue_length", "active_counters", "avg_service_time_min", "predicted_wait_min", "actual_wait_min"],
        "category": "Branch Operations", "domain": "branch"},
    "uc_bo_03_footfall": {"label": "UC-BO-03: Footfall & Capacity Analytics", "target": None,
        "numeric_hints": ["footfall_count", "occupancy_pct", "zone_lobby", "zone_teller", "zone_advisor", "dwell_time_avg_min"],
        "category": "Branch Operations", "domain": "branch"},
    "uc_bo_04_churn": {"label": "UC-BO-04: Branch Customer Churn Risk", "target": "churned",
        "numeric_hints": ["tenure_months", "products_held", "monthly_visits", "avg_balance", "complaints_12m", "nps_score", "churn_risk_score"],
        "category": "Branch Operations", "domain": "branch"},
    "uc_bo_05_copilot": {"label": "UC-BO-05: Branch Ops Copilot", "target": None,
        "numeric_hints": ["relevance_score", "user_rating", "response_time_ms"],
        "category": "Branch Operations", "domain": "branch"},
    "uc_bo_06_allocation": {"label": "UC-BO-06: Dynamic Counter Allocation", "target": "allocation_optimal",
        "numeric_hints": ["forecasted_footfall", "teller_txn_pct", "advisor_txn_pct", "recommended_tellers", "recommended_advisors", "wait_time_result_min"],
        "category": "Branch Operations", "domain": "branch"},
    # ---- Department 7: ATM & Cash Operations ----
    "uc_atm_01_cash_demand": {"label": "UC-ATM-01: Cash Demand Forecasting", "target": "stockout_event",
        "numeric_hints": ["withdrawal_amount", "deposit_amount", "transaction_count", "cash_level_pct"],
        "category": "ATM & Cash Ops", "domain": "atm"},
    "uc_atm_02_routes": {"label": "UC-ATM-02: Route Optimization", "target": "optimized",
        "numeric_hints": ["atm_count_in_route", "total_distance_km", "total_cash_loaded_k", "route_time_hours", "fuel_cost", "labor_cost", "distance_saved_pct"],
        "category": "ATM & Cash Ops", "domain": "atm"},
    "uc_atm_03_health": {"label": "UC-ATM-03: ATM Health Prediction", "target": "actual_downtime_event",
        "numeric_hints": ["cpu_usage_pct", "memory_usage_pct", "disk_usage_pct", "network_latency_ms", "error_count_1h", "predicted_downtime_hours"],
        "category": "ATM & Cash Ops", "domain": "atm"},
    "uc_atm_04_surveillance": {"label": "UC-ATM-04: Surveillance & Tampering Detection", "target": "alert_generated",
        "numeric_hints": ["person_count", "skimmer_confidence"],
        "category": "ATM & Cash Ops", "domain": "atm"},
    "uc_atm_05_copilot": {"label": "UC-ATM-05: ATM Ops Copilot", "target": None,
        "numeric_hints": ["relevance_score", "user_rating", "response_time_ms"],
        "category": "ATM & Cash Ops", "domain": "atm"},
    "uc_atm_06_replenishment": {"label": "UC-ATM-06: Dynamic Replenishment Decision", "target": "recommended_action",
        "numeric_hints": ["current_cash_level_pct", "forecasted_demand_24h", "forecasted_demand_48h", "days_until_stockout", "replenish_cost", "idle_cash_cost_daily", "optimal_load_amount"],
        "category": "ATM & Cash Ops", "domain": "atm"},
    # ---- Department 8: Treasury & Finance ----
    "uc_tf_01_liquidity": {"label": "UC-TF-01: Liquidity Forecasting & ALM", "target": None,
        "numeric_hints": ["total_deposits_m", "total_loans_m", "net_liquidity_m", "inflow_m", "outflow_m", "overnight_rate_pct", "lcr_pct", "nsfr_pct", "hqla_m", "stress_buffer_m"],
        "category": "Treasury & Finance", "domain": "treasury"},
    "uc_tf_02_capital": {"label": "UC-TF-02: Capital Allocation Optimization", "target": "recommended_action",
        "numeric_hints": ["allocated_capital_m", "risk_weighted_assets_m", "revenue_m", "net_income_m", "roe_pct", "raroc_pct", "economic_capital_m", "excess_capital_m"],
        "category": "Treasury & Finance", "domain": "treasury"},
    "uc_tf_03_ratios": {"label": "UC-TF-03: Regulatory Ratio Monitoring", "target": "breach_flag",
        "numeric_hints": ["cet1_ratio_pct", "tier1_ratio_pct", "total_capital_ratio_pct", "leverage_ratio_pct", "lcr_pct", "nsfr_pct", "large_exposure_pct", "rwa_m", "buffer_over_minimum_pct"],
        "category": "Treasury & Finance", "domain": "treasury"},
    "uc_tf_04_stress": {"label": "UC-TF-04: Stress Testing & Scenario Simulation", "target": "passes_threshold",
        "numeric_hints": ["gdp_shock_pct", "unemployment_shock_pct", "interest_rate_shock_bps", "equity_shock_pct", "credit_loss_m", "market_loss_m", "operational_loss_m", "total_loss_m", "post_stress_cet1_pct"],
        "category": "Treasury & Finance", "domain": "treasury"},
    "uc_tf_05_copilot": {"label": "UC-TF-05: Treasury Policy Copilot", "target": None,
        "numeric_hints": ["relevance_score", "user_rating", "response_time_ms"],
        "category": "Treasury & Finance", "domain": "treasury"},
    "uc_tf_06_funding_mix": {"label": "UC-TF-06: Funding Mix Decision Engine", "target": None,
        "numeric_hints": ["funding_need_m", "tenor_months", "deposits_rate_pct", "wholesale_rate_pct", "repo_rate_pct", "bond_rate_pct", "blended_cost_pct", "nsfr_impact_pct"],
        "category": "Treasury & Finance", "domain": "treasury"},
    "uc_tf_07_cash_pool": {"label": "UC-TF-07: Cash Pooling & Liquidity Sweeping", "target": "execution_status",
        "numeric_hints": ["opening_balance_m", "target_balance_m", "sweep_amount_m", "interest_saving_daily"],
        "category": "Treasury & Finance", "domain": "treasury"},
    # ---- Real Public Datasets ----
    "real_creditcard_fraud": {"label": "REAL: Credit Card Fraud (ULB 284K)", "target": "Class",
        "numeric_hints": ["Time", "Amount"] + [f"V{i}" for i in range(1, 29)],
        "category": "Fraud Management", "domain": "fraud"},
    "real_german_credit": {"label": "REAL: German Credit (UCI)", "target": "attr_20",
        "numeric_hints": [f"attr_{i}" for i in range(21)],
        "category": "Credit Risk", "domain": "credit"},
    "real_south_german_credit": {"label": "REAL: South German Credit (UCI)", "target": "kredit",
        "numeric_hints": ["laufkont", "laufzeit", "moral", "verw", "hoession", "sparkont", "besession", "rate", "famges", "bession", "pvession", "alter", "weitkam", "wession", "bishkam", "beression", "pers", "telession", "gaession", "kredit"],
        "category": "Credit Risk", "domain": "credit"},
    "real_bank_marketing": {"label": "REAL: Bank Marketing (UCI 41K)", "target": "y",
        "numeric_hints": ["age", "duration", "campaign", "pdays", "previous", "emp.var.rate", "cons.price.idx", "cons.conf.idx", "euribor3m", "nr.employed"],
        "category": "Branch Operations", "domain": "branch"},
    "real_fdic_bank_failures": {"label": "REAL: FDIC Bank Failures", "target": None,
        "numeric_hints": [],
        "category": "Branch Operations", "domain": "branch"},
    "real_atm_transactions": {"label": "REAL: ATM Transactions (India)", "target": None,
        "numeric_hints": ["No of Withdrawals", "No of Transfers", "No of Balance Enquiries"],
        "category": "ATM & Cash Ops", "domain": "atm"},
    "real_ibm_hr_attrition": {"label": "REAL: IBM HR Attrition (1470)", "target": "Attrition",
        "numeric_hints": ["Age", "DailyRate", "DistanceFromHome", "HourlyRate", "MonthlyIncome", "MonthlyRate", "NumCompaniesWorked", "PercentSalaryHike", "TotalWorkingYears", "YearsAtCompany", "YearsInCurrentRole", "YearsSinceLastPromotion", "YearsWithCurrManager"],
        "category": "Workforce / HR", "domain": "hr"},
    "real_hr_dataset_v9": {"label": "REAL: HR Dataset v9 (310)", "target": "Termd",
        "numeric_hints": ["Salary", "EngagementSurvey", "EmpSatisfaction", "SpecialProjectsCount", "DaysLateLast30", "Absences"],
        "category": "Workforce / HR", "domain": "hr"},
    "real_treasury_10yr": {"label": "REAL: Treasury 10Y Yield (FRED)", "target": None,
        "numeric_hints": ["DGS10"],
        "category": "Treasury & Finance", "domain": "treasury"},
    "real_treasury_2yr": {"label": "REAL: Treasury 2Y Yield (FRED)", "target": None,
        "numeric_hints": ["DGS2"],
        "category": "Treasury & Finance", "domain": "treasury"},
    "real_fed_funds_rate": {"label": "REAL: Fed Funds Rate (FRED)", "target": None,
        "numeric_hints": ["FEDFUNDS"],
        "category": "Treasury & Finance", "domain": "treasury"},
    "real_usd_eur_fx": {"label": "REAL: USD/EUR Exchange Rate (FRED)", "target": None,
        "numeric_hints": ["DEXUSEU"],
        "category": "Treasury & Finance", "domain": "treasury"},
    "real_avg_interest_rates": {"label": "REAL: US Avg Interest Rates (Treasury.gov)", "target": None,
        "numeric_hints": ["avg_interest_rate_amt"],
        "category": "Treasury & Finance", "domain": "treasury"},
}

# Columns added by the unify_data.py script (skip for domain analysis)
UNIFY_COLS = {
    "customer_first_name", "customer_last_name", "us_state", "us_state_name", "us_city",
    "orig_first_name", "orig_last_name", "orig_us_state", "orig_us_city",
    "dest_first_name", "dest_last_name", "dest_us_state", "dest_us_city",
    "sender_first_name", "sender_last_name", "sender_us_state", "sender_us_city",
    "receiver_first_name", "receiver_last_name", "receiver_us_state", "receiver_us_city",
    "country",
}

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
os.makedirs(LOG_DIR, exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(os.path.join(LOG_DIR, "preprocessing.log")),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger("preprocess")

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def safe_float(series: pd.Series) -> pd.Series:
    """Convert a pandas Series to numeric, coercing errors.

    Args:
        series: Input pandas Series with potentially mixed types

    Returns:
        Series with values converted to float, NaN for non-numeric
    """
    return pd.to_numeric(series, errors="coerce")


def iqr_bounds(series: pd.Series) -> tuple:
    """Return (lower, upper) IQR bounds for outlier detection.

    Uses the 1.5*IQR rule: values outside [Q1-1.5*IQR, Q3+1.5*IQR]
    are considered outliers.

    Args:
        series: Numeric pandas Series

    Returns:
        Tuple of (lower_bound, upper_bound)
    """
    q1 = series.quantile(0.25)
    q3 = series.quantile(0.75)
    iqr = q3 - q1
    return q1 - 1.5 * iqr, q3 + 1.5 * iqr


def compute_data_quality_score(report: dict) -> float:
    """Compute a 0-100 quality score from the analysis report.

    Scoring penalties:
        - Missing data: up to -25 points (0.5 * avg_missing_pct, max 25)
        - Duplicate rows: up to -15 points (0.3 * dup_pct, max 15)
        - Outliers: up to -10 points (0.2 * avg_outlier_pct, max 10)
        - Constant columns: up to -10 points (0.3 * const_pct, max 10)
        - Class imbalance: -5 to -10 points based on ratio

    Args:
        report: Dictionary containing analysis metrics

    Returns:
        Quality score between 0 and 100
    """
    score = 100.0
    # Penalize missing data
    avg_missing = report.get("avg_missing_pct", 0)
    score -= min(avg_missing * 0.5, 25)
    # Penalize duplicate rows
    dup_pct = report.get("duplicate_row_pct", 0)
    score -= min(dup_pct * 0.3, 15)
    # Penalize high outlier percentage
    avg_outlier = report.get("avg_outlier_pct", 0)
    score -= min(avg_outlier * 0.2, 10)
    # Penalize low cardinality ratio (constant columns)
    const_pct = report.get("constant_column_pct", 0)
    score -= min(const_pct * 0.3, 10)
    # Penalize class imbalance if target exists
    imbalance = report.get("class_imbalance_ratio", 1.0)
    if imbalance > 100:
        score -= 10
    elif imbalance > 10:
        score -= 5
    return max(round(score, 2), 0)


# ---------------------------------------------------------------------------
# Analysis Functions
# ---------------------------------------------------------------------------

def profile_column(series, col_name):
    """Return a detailed profile dict for a single column."""
    total = len(series)
    n_missing = int(series.isna().sum())
    n_unique = int(series.nunique())
    profile = {
        "column": col_name,
        "dtype": str(series.dtype),
        "total_count": total,
        "missing_count": n_missing,
        "missing_pct": round(n_missing / total * 100, 2) if total else 0,
        "unique_count": n_unique,
        "unique_pct": round(n_unique / total * 100, 2) if total else 0,
    }

    num = safe_float(series)
    valid_num = num.dropna()
    if len(valid_num) > total * 0.5:
        # Treat as numeric
        profile["inferred_type"] = "numeric"
        profile["mean"] = round(float(valid_num.mean()), 6)
        profile["std"] = round(float(valid_num.std()), 6)
        profile["min"] = round(float(valid_num.min()), 6)
        profile["q1"] = round(float(valid_num.quantile(0.25)), 6)
        profile["median"] = round(float(valid_num.median()), 6)
        profile["q3"] = round(float(valid_num.quantile(0.75)), 6)
        profile["max"] = round(float(valid_num.max()), 6)
        profile["skewness"] = round(float(valid_num.skew()), 4)
        profile["kurtosis"] = round(float(valid_num.kurtosis()), 4)
        # Outliers (IQR)
        lo, hi = iqr_bounds(valid_num)
        outliers = ((valid_num < lo) | (valid_num > hi)).sum()
        profile["outlier_count_iqr"] = int(outliers)
        profile["outlier_pct_iqr"] = round(outliers / len(valid_num) * 100, 2)
        # Z-score outliers (|z| > 3)
        if valid_num.std() > 0:
            z = np.abs((valid_num - valid_num.mean()) / valid_num.std())
            z_outliers = (z > 3).sum()
            profile["outlier_count_zscore"] = int(z_outliers)
            profile["outlier_pct_zscore"] = round(z_outliers / len(valid_num) * 100, 2)
        else:
            profile["outlier_count_zscore"] = 0
            profile["outlier_pct_zscore"] = 0.0
    else:
        profile["inferred_type"] = "categorical"
        top5 = series.value_counts().head(5)
        profile["top_values"] = {str(k): int(v) for k, v in top5.items()}
        profile["outlier_count_iqr"] = 0
        profile["outlier_pct_iqr"] = 0.0
        profile["outlier_count_zscore"] = 0
        profile["outlier_pct_zscore"] = 0.0

    return profile


def analyze_correlations(df, numeric_cols, top_n=20):
    """Return top correlated pairs."""
    if len(numeric_cols) < 2:
        return []
    # Ensure all columns are actually numeric
    numeric_df = df[numeric_cols].apply(pd.to_numeric, errors="coerce")
    corr = numeric_df.corr()
    pairs = []
    seen = set()
    for i in range(len(numeric_cols)):
        for j in range(i + 1, len(numeric_cols)):
            c1, c2 = numeric_cols[i], numeric_cols[j]
            val = corr.iloc[i, j]
            if pd.notna(val):
                pairs.append({"col1": c1, "col2": c2, "correlation": round(float(val), 4)})
    pairs.sort(key=lambda x: abs(x["correlation"]), reverse=True)
    return pairs[:top_n]


def analyze_target_distribution(df, target_col):
    """Return target distribution info."""
    if target_col is None or target_col not in df.columns:
        return {}
    vc = df[target_col].value_counts()
    dist = {str(k): int(v) for k, v in vc.items()}
    majority = vc.iloc[0] if len(vc) > 0 else 1
    minority = vc.iloc[-1] if len(vc) > 1 else majority
    return {
        "target_column": target_col,
        "class_distribution": dist,
        "n_classes": len(vc),
        "imbalance_ratio": round(majority / max(minority, 1), 2),
    }


def compute_normalization_stats(df, numeric_cols):
    """Compute min-max normalization parameters."""
    stats_list = []
    for c in numeric_cols:
        s = safe_float(df[c]).dropna()
        if len(s) == 0:
            continue
        mn, mx = float(s.min()), float(s.max())
        stats_list.append({
            "column": c,
            "min": round(mn, 6),
            "max": round(mx, 6),
            "range": round(mx - mn, 6),
        })
    return stats_list


def compute_standardization_stats(df, numeric_cols):
    """Compute z-score standardization parameters (mean, std)."""
    stats_list = []
    for c in numeric_cols:
        s = safe_float(df[c]).dropna()
        if len(s) == 0:
            continue
        stats_list.append({
            "column": c,
            "mean": round(float(s.mean()), 6),
            "std": round(float(s.std()), 6),
            "count": int(len(s)),
        })
    return stats_list


def suggest_feature_engineering(uc_key, config, profiles):
    """Suggest feature engineering steps based on use case domain and data profiles."""
    suggestions = []
    numeric_cols = [p["column"] for p in profiles if p.get("inferred_type") == "numeric"]
    categorical_cols = [p["column"] for p in profiles if p.get("inferred_type") == "categorical"]
    domain = config.get("domain", "")

    # Domain-specific suggestions
    if domain == "fraud":
        suggestions.append({"type": "velocity", "description": "Transaction velocity features (count/sum in time windows)"})
        suggestions.append({"type": "ratio", "description": "Amount-to-balance ratio features"})
        suggestions.append({"type": "encoding", "description": "Frequency encoding for high-cardinality categorical columns"})
        suggestions.append({"type": "time", "description": "Hour-of-day, day-of-week from timestamps"})

    elif domain == "credit":
        suggestions.append({"type": "ratio", "description": "Debt-to-income derived ratios"})
        suggestions.append({"type": "binning", "description": "Income/loan amount binning for non-linear effects"})
        suggestions.append({"type": "interaction", "description": "Grade × interest rate interaction terms"})
        suggestions.append({"type": "encoding", "description": "Ordinal encoding for grade/sub_grade"})
        suggestions.append({"type": "missing_indicator", "description": "Binary flags for columns with >5% missing values"})

    elif domain == "aml":
        suggestions.append({"type": "graph", "description": "Sender/receiver network degree features"})
        suggestions.append({"type": "velocity", "description": "Transaction frequency per account in time windows"})
        suggestions.append({"type": "ratio", "description": "Cross-border transaction ratio"})
        suggestions.append({"type": "encoding", "description": "Target encoding for payment type/currency"})

    elif domain == "collections":
        suggestions.append({"type": "aggregation", "description": "Rolling payment behavior (PAY_0..PAY_6 trends)"})
        suggestions.append({"type": "ratio", "description": "Utilization ratio (BILL_AMT / LIMIT_BAL)"})
        suggestions.append({"type": "trend", "description": "Payment amount trend (increasing/decreasing)"})

    elif domain == "branch":
        suggestions.append({"type": "time", "description": "Extract day-of-week, month, quarter from TransactionDate"})
        suggestions.append({"type": "aggregation", "description": "Customer-level aggregates (avg balance, txn count)"})
        suggestions.append({"type": "encoding", "description": "Location-based frequency encoding"})

    elif domain == "contact_center":
        suggestions.append({"type": "nlp", "description": "Text length, word count, sentiment polarity from tweet text"})
        suggestions.append({"type": "time", "description": "Response time calculation between tweets"})
        suggestions.append({"type": "encoding", "description": "Author frequency encoding"})

    elif domain == "treasury":
        suggestions.append({"type": "lag", "description": "Lag features for rates (1m, 3m, 6m, 12m)"})
        suggestions.append({"type": "rolling", "description": "Rolling mean/std for rates (3m, 6m, 12m windows)"})
        suggestions.append({"type": "diff", "description": "Rate change (diff) features"})
        suggestions.append({"type": "interaction", "description": "GDP × inflation interaction"})

    elif domain == "governance":
        suggestions.append({"type": "quality_flag", "description": "Generate missing/invalid data indicator flags per column"})
        suggestions.append({"type": "completeness", "description": "Row-level completeness score"})
        suggestions.append({"type": "consistency", "description": "Cross-field consistency checks"})
        suggestions.append({"type": "drift", "description": "PSI/CSI drift magnitude binning for alert thresholds"})
        suggestions.append({"type": "trend", "description": "Rolling quality/drift score trends over time"})

    elif domain == "strategy":
        suggestions.append({"type": "ratio", "description": "ROI, cost-income, benefit realization ratios"})
        suggestions.append({"type": "scoring", "description": "Composite weighted scores from multi-criteria inputs"})
        suggestions.append({"type": "trend", "description": "Period-over-period change for KPIs and financial metrics"})
        suggestions.append({"type": "binning", "description": "Risk flag binning (Green/Amber/Red) from continuous scores"})
        suggestions.append({"type": "interaction", "description": "Strategic alignment x feasibility interaction terms"})

    elif domain == "hr":
        suggestions.append({"type": "ratio", "description": "Satisfaction composite (avg of environment, job, work-life)"})
        suggestions.append({"type": "tenure", "description": "Tenure bins, years-since-last-promotion features"})
        suggestions.append({"type": "encoding", "description": "Ordinal encoding for education, job level"})
        suggestions.append({"type": "interaction", "description": "Overtime x satisfaction interaction for attrition risk"})
        suggestions.append({"type": "fairness", "description": "Demographic parity gap features for bias monitoring"})

    elif domain == "atm":
        suggestions.append({"type": "time", "description": "Day-of-week, payday, holiday features from date"})
        suggestions.append({"type": "lag", "description": "Lag features for cash demand (1d, 7d, 30d)"})
        suggestions.append({"type": "rolling", "description": "Rolling mean/std of withdrawal amounts"})
        suggestions.append({"type": "ratio", "description": "Cash level depletion rate, utilization ratio"})
        suggestions.append({"type": "geo", "description": "Route distance/time optimization features"})

    # General suggestions based on data characteristics
    high_missing = [p["column"] for p in profiles if p.get("missing_pct", 0) > 5]
    if high_missing:
        suggestions.append({
            "type": "imputation",
            "description": f"Impute columns with >5% missing: {high_missing[:5]}",
            "columns": high_missing,
        })

    high_skew = [p["column"] for p in profiles
                 if p.get("inferred_type") == "numeric" and abs(p.get("skewness", 0)) > 2]
    if high_skew:
        suggestions.append({
            "type": "transform",
            "description": f"Log/Box-Cox transform for highly skewed columns: {high_skew[:5]}",
            "columns": high_skew,
        })

    high_card_cat = [p["column"] for p in profiles
                     if p.get("inferred_type") == "categorical" and p.get("unique_count", 0) > 50]
    if high_card_cat:
        suggestions.append({
            "type": "encoding",
            "description": f"Target/frequency encoding for high-cardinality categoricals: {high_card_cat[:5]}",
            "columns": high_card_cat,
        })

    return suggestions


# ---------------------------------------------------------------------------
# Main pipeline per use case
# ---------------------------------------------------------------------------

def run_pipeline(uc_key, config, conn_src):
    """Run full preprocessing analysis for one use case. Returns report dict."""
    # Validate use case key to prevent SQL injection
    if not validate_use_case_key(uc_key):
        raise ValueError(f"Invalid use case key format: {uc_key}")

    label = config["label"]
    log.info(f"{'='*60}")
    log.info(f"START: {label} ({uc_key})")
    log.info(f"{'='*60}")

    start = datetime.now()

    # Load data - using bracket quoting for table names (SQLite safe identifier quoting)
    # uc_key has been validated above to contain only safe characters
    log.info(f"Loading data from table {uc_key} (limit {SAMPLE_LIMIT})...")
    df = pd.read_sql(f"SELECT * FROM [{uc_key}] LIMIT {SAMPLE_LIMIT}", conn_src)
    total_rows_db = pd.read_sql(f"SELECT COUNT(*) as cnt FROM [{uc_key}]", conn_src)["cnt"][0]
    log.info(f"Loaded {len(df)} rows, {len(df.columns)} columns (total in DB: {total_rows_db})")

    # Determine analysis columns (exclude unify columns)
    analysis_cols = [c for c in df.columns if c not in UNIFY_COLS and c != ""]
    log.info(f"Analysis columns: {len(analysis_cols)} (excluded {len(df.columns) - len(analysis_cols)} unify/meta cols)")

    # Convert hinted numeric columns
    for nc in config.get("numeric_hints", []):
        if nc in df.columns:
            df[nc] = safe_float(df[nc])

    # -----------------------------------------------------------------------
    # 1. EDA - Column Profiling
    # -----------------------------------------------------------------------
    log.info("Phase 1: Column profiling...")
    profiles = []
    for col in analysis_cols:
        profiles.append(profile_column(df[col], col))

    numeric_cols = [p["column"] for p in profiles if p.get("inferred_type") == "numeric"]
    categorical_cols = [p["column"] for p in profiles if p.get("inferred_type") == "categorical"]
    log.info(f"  Numeric: {len(numeric_cols)}, Categorical: {len(categorical_cols)}")

    # -----------------------------------------------------------------------
    # 2. Data Quality
    # -----------------------------------------------------------------------
    log.info("Phase 2: Data quality analysis...")

    # Missing data summary
    missing_summary = []
    for p in profiles:
        if p["missing_pct"] > 0:
            missing_summary.append({"column": p["column"], "missing_count": p["missing_count"],
                                    "missing_pct": p["missing_pct"]})
    missing_summary.sort(key=lambda x: x["missing_pct"], reverse=True)

    avg_missing = np.mean([p["missing_pct"] for p in profiles]) if profiles else 0

    # Duplicate rows
    n_dup = int(df[analysis_cols].duplicated().sum())
    dup_pct = round(n_dup / len(df) * 100, 2) if len(df) else 0

    # Constant columns
    const_cols = [p["column"] for p in profiles if p["unique_count"] <= 1]
    const_pct = round(len(const_cols) / len(analysis_cols) * 100, 2) if analysis_cols else 0

    data_quality = {
        "total_rows_loaded": len(df),
        "total_rows_in_db": int(total_rows_db),
        "total_columns": len(df.columns),
        "analysis_columns": len(analysis_cols),
        "numeric_columns": len(numeric_cols),
        "categorical_columns": len(categorical_cols),
        "avg_missing_pct": round(avg_missing, 2),
        "columns_with_missing": len(missing_summary),
        "missing_details": missing_summary[:30],
        "duplicate_rows": n_dup,
        "duplicate_row_pct": dup_pct,
        "constant_columns": const_cols,
        "constant_column_pct": const_pct,
    }

    # -----------------------------------------------------------------------
    # 3. Outlier Analysis
    # -----------------------------------------------------------------------
    log.info("Phase 3: Outlier analysis...")
    outlier_summary = []
    for p in profiles:
        if p.get("inferred_type") == "numeric":
            outlier_summary.append({
                "column": p["column"],
                "iqr_outliers": p["outlier_count_iqr"],
                "iqr_outlier_pct": p["outlier_pct_iqr"],
                "zscore_outliers": p.get("outlier_count_zscore", 0),
                "zscore_outlier_pct": p.get("outlier_pct_zscore", 0.0),
            })
    outlier_summary.sort(key=lambda x: x["iqr_outlier_pct"], reverse=True)

    avg_outlier = np.mean([o["iqr_outlier_pct"] for o in outlier_summary]) if outlier_summary else 0

    # -----------------------------------------------------------------------
    # 4. Correlation Analysis
    # -----------------------------------------------------------------------
    log.info("Phase 4: Correlation analysis...")
    correlations = analyze_correlations(df, numeric_cols)

    # -----------------------------------------------------------------------
    # 5. Target Distribution
    # -----------------------------------------------------------------------
    log.info("Phase 5: Target distribution...")
    target_info = analyze_target_distribution(df, config.get("target"))
    imbalance_ratio = target_info.get("imbalance_ratio", 1.0)

    # -----------------------------------------------------------------------
    # 6. Normalization Stats (Min-Max)
    # -----------------------------------------------------------------------
    log.info("Phase 6: Normalization parameters...")
    norm_stats = compute_normalization_stats(df, numeric_cols)

    # -----------------------------------------------------------------------
    # 7. Standardization Stats (Z-score)
    # -----------------------------------------------------------------------
    log.info("Phase 7: Standardization parameters...")
    std_stats = compute_standardization_stats(df, numeric_cols)

    # -----------------------------------------------------------------------
    # 8. Feature Engineering Suggestions
    # -----------------------------------------------------------------------
    log.info("Phase 8: Feature engineering suggestions...")
    fe_suggestions = suggest_feature_engineering(uc_key, config, profiles)

    # -----------------------------------------------------------------------
    # 9. Data Quality Score
    # -----------------------------------------------------------------------
    quality_input = {
        "avg_missing_pct": avg_missing,
        "duplicate_row_pct": dup_pct,
        "avg_outlier_pct": avg_outlier,
        "constant_column_pct": const_pct,
        "class_imbalance_ratio": imbalance_ratio,
    }
    quality_score = compute_data_quality_score(quality_input)
    log.info(f"Data Quality Score: {quality_score}/100")

    elapsed = (datetime.now() - start).total_seconds()
    log.info(f"DONE: {label} in {elapsed:.1f}s")

    # Build report
    report = {
        "use_case_key": uc_key,
        "label": label,
        "category": config["category"],
        "domain": config["domain"],
        "target_column": config.get("target"),
        "run_timestamp": datetime.now().isoformat(),
        "elapsed_seconds": round(elapsed, 2),
        "data_quality_score": quality_score,
        "data_quality": data_quality,
        "column_profiles": profiles,
        "outlier_summary": outlier_summary,
        "avg_outlier_pct": round(avg_outlier, 2),
        "correlation_top_pairs": correlations,
        "target_distribution": target_info,
        "normalization_params": norm_stats,
        "standardization_params": std_stats,
        "feature_engineering_suggestions": fe_suggestions,
    }
    return report


# ---------------------------------------------------------------------------
# SQLite Results Storage
# ---------------------------------------------------------------------------

def init_results_db(db_path):
    """Create results database tables."""
    conn = sqlite3.connect(db_path)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS preprocessing_runs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            use_case_key TEXT NOT NULL,
            label TEXT,
            category TEXT,
            domain TEXT,
            run_timestamp TEXT NOT NULL,
            elapsed_seconds REAL,
            data_quality_score REAL,
            total_rows INTEGER,
            total_columns INTEGER,
            numeric_columns INTEGER,
            categorical_columns INTEGER,
            avg_missing_pct REAL,
            duplicate_row_pct REAL,
            avg_outlier_pct REAL,
            constant_column_pct REAL,
            class_imbalance_ratio REAL,
            target_column TEXT,
            n_feature_suggestions INTEGER,
            report_json TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS column_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            run_id INTEGER,
            use_case_key TEXT,
            column_name TEXT,
            inferred_type TEXT,
            total_count INTEGER,
            missing_count INTEGER,
            missing_pct REAL,
            unique_count INTEGER,
            mean REAL,
            std REAL,
            min_val REAL,
            q1 REAL,
            median REAL,
            q3 REAL,
            max_val REAL,
            skewness REAL,
            kurtosis REAL,
            outlier_count_iqr INTEGER,
            outlier_pct_iqr REAL,
            outlier_count_zscore INTEGER,
            outlier_pct_zscore REAL,
            top_values_json TEXT,
            FOREIGN KEY (run_id) REFERENCES preprocessing_runs(id)
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS quality_scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            use_case_key TEXT NOT NULL,
            run_timestamp TEXT NOT NULL,
            quality_score REAL NOT NULL,
            avg_missing_pct REAL,
            duplicate_row_pct REAL,
            avg_outlier_pct REAL,
            constant_column_pct REAL,
            class_imbalance_ratio REAL
        )
    """)
    conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_runs_uc ON preprocessing_runs(use_case_key)
    """)
    conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_profiles_run ON column_profiles(run_id)
    """)
    conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_scores_uc ON quality_scores(use_case_key)
    """)
    conn.commit()
    return conn


def save_report(conn, report):
    """Save a pipeline report to the results database."""
    dq = report["data_quality"]
    td = report.get("target_distribution", {})

    cur = conn.execute("""
        INSERT INTO preprocessing_runs (
            use_case_key, label, category, domain, run_timestamp, elapsed_seconds,
            data_quality_score, total_rows, total_columns, numeric_columns,
            categorical_columns, avg_missing_pct, duplicate_row_pct, avg_outlier_pct,
            constant_column_pct, class_imbalance_ratio, target_column,
            n_feature_suggestions, report_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        report["use_case_key"], report["label"], report["category"], report["domain"],
        report["run_timestamp"], report["elapsed_seconds"],
        report["data_quality_score"],
        dq["total_rows_loaded"], dq["total_columns"], dq["numeric_columns"],
        dq["categorical_columns"], dq["avg_missing_pct"], dq["duplicate_row_pct"],
        report["avg_outlier_pct"], dq["constant_column_pct"],
        td.get("imbalance_ratio", 1.0), report.get("target_column"),
        len(report["feature_engineering_suggestions"]),
        json.dumps(report, default=str),
    ))
    run_id = cur.lastrowid

    # Save column profiles
    for p in report["column_profiles"]:
        conn.execute("""
            INSERT INTO column_profiles (
                run_id, use_case_key, column_name, inferred_type, total_count,
                missing_count, missing_pct, unique_count, mean, std, min_val,
                q1, median, q3, max_val, skewness, kurtosis,
                outlier_count_iqr, outlier_pct_iqr, outlier_count_zscore,
                outlier_pct_zscore, top_values_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            run_id, report["use_case_key"], p["column"], p.get("inferred_type"),
            p["total_count"], p["missing_count"], p["missing_pct"], p["unique_count"],
            p.get("mean"), p.get("std"), p.get("min"), p.get("q1"), p.get("median"),
            p.get("q3"), p.get("max"), p.get("skewness"), p.get("kurtosis"),
            p.get("outlier_count_iqr", 0), p.get("outlier_pct_iqr", 0),
            p.get("outlier_count_zscore", 0), p.get("outlier_pct_zscore", 0),
            json.dumps(p.get("top_values")) if p.get("top_values") else None,
        ))

    # Save quality score
    conn.execute("""
        INSERT INTO quality_scores (
            use_case_key, run_timestamp, quality_score, avg_missing_pct,
            duplicate_row_pct, avg_outlier_pct, constant_column_pct, class_imbalance_ratio
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        report["use_case_key"], report["run_timestamp"], report["data_quality_score"],
        dq["avg_missing_pct"], dq["duplicate_row_pct"], report["avg_outlier_pct"],
        dq["constant_column_pct"], td.get("imbalance_ratio", 1.0),
    ))
    conn.commit()
    return run_id


# ---------------------------------------------------------------------------
# JSON export for React Native UI
# ---------------------------------------------------------------------------

def export_json(report, output_dir):
    """Export report as JSON files for UI consumption."""
    uc_dir = os.path.join(output_dir, report["use_case_key"])
    os.makedirs(uc_dir, exist_ok=True)

    # Full report
    with open(os.path.join(uc_dir, "full_report.json"), "w") as f:
        json.dump(report, f, indent=2, default=str)

    # Summary (lightweight for dashboard cards)
    summary = {
        "use_case_key": report["use_case_key"],
        "label": report["label"],
        "category": report["category"],
        "domain": report["domain"],
        "run_timestamp": report["run_timestamp"],
        "data_quality_score": report["data_quality_score"],
        "total_rows": report["data_quality"]["total_rows_in_db"],
        "total_columns": report["data_quality"]["total_columns"],
        "numeric_columns": report["data_quality"]["numeric_columns"],
        "categorical_columns": report["data_quality"]["categorical_columns"],
        "avg_missing_pct": report["data_quality"]["avg_missing_pct"],
        "duplicate_row_pct": report["data_quality"]["duplicate_row_pct"],
        "avg_outlier_pct": report["avg_outlier_pct"],
        "target_column": report.get("target_column"),
        "class_imbalance_ratio": report.get("target_distribution", {}).get("imbalance_ratio"),
        "n_feature_suggestions": len(report["feature_engineering_suggestions"]),
    }
    with open(os.path.join(uc_dir, "summary.json"), "w") as f:
        json.dump(summary, f, indent=2, default=str)

    # Column profiles
    with open(os.path.join(uc_dir, "column_profiles.json"), "w") as f:
        json.dump(report["column_profiles"], f, indent=2, default=str)

    # Missing data
    with open(os.path.join(uc_dir, "missing_data.json"), "w") as f:
        json.dump(report["data_quality"]["missing_details"], f, indent=2, default=str)

    # Outliers
    with open(os.path.join(uc_dir, "outliers.json"), "w") as f:
        json.dump(report["outlier_summary"], f, indent=2, default=str)

    # Correlations
    with open(os.path.join(uc_dir, "correlations.json"), "w") as f:
        json.dump(report["correlation_top_pairs"], f, indent=2, default=str)

    # Target distribution
    with open(os.path.join(uc_dir, "target_distribution.json"), "w") as f:
        json.dump(report.get("target_distribution", {}), f, indent=2, default=str)

    # Normalization params
    with open(os.path.join(uc_dir, "normalization_params.json"), "w") as f:
        json.dump(report["normalization_params"], f, indent=2, default=str)

    # Standardization params
    with open(os.path.join(uc_dir, "standardization_params.json"), "w") as f:
        json.dump(report["standardization_params"], f, indent=2, default=str)

    # Feature engineering suggestions
    with open(os.path.join(uc_dir, "feature_engineering.json"), "w") as f:
        json.dump(report["feature_engineering_suggestions"], f, indent=2, default=str)

    return uc_dir


def export_dashboard_json(all_reports, output_dir):
    """Export a master dashboard JSON combining all use cases."""
    dashboard = {
        "generated_at": datetime.now().isoformat(),
        "total_use_cases": len(all_reports),
        "use_cases": [],
    }

    for r in all_reports:
        dashboard["use_cases"].append({
            "key": r["use_case_key"],
            "label": r["label"],
            "category": r["category"],
            "domain": r["domain"],
            "quality_score": r["data_quality_score"],
            "total_rows": r["data_quality"]["total_rows_in_db"],
            "total_columns": r["data_quality"]["total_columns"],
            "numeric_columns": r["data_quality"]["numeric_columns"],
            "categorical_columns": r["data_quality"]["categorical_columns"],
            "avg_missing_pct": r["data_quality"]["avg_missing_pct"],
            "duplicate_row_pct": r["data_quality"]["duplicate_row_pct"],
            "avg_outlier_pct": r["avg_outlier_pct"],
            "target_column": r.get("target_column"),
            "imbalance_ratio": r.get("target_distribution", {}).get("imbalance_ratio"),
            "n_suggestions": len(r["feature_engineering_suggestions"]),
            "elapsed_seconds": r["elapsed_seconds"],
        })

    # Sort by quality score
    dashboard["use_cases"].sort(key=lambda x: x["quality_score"], reverse=True)

    # Aggregate stats
    scores = [u["quality_score"] for u in dashboard["use_cases"]]
    dashboard["avg_quality_score"] = round(np.mean(scores), 2) if scores else 0
    dashboard["min_quality_score"] = round(min(scores), 2) if scores else 0
    dashboard["max_quality_score"] = round(max(scores), 2) if scores else 0

    with open(os.path.join(output_dir, "dashboard.json"), "w") as f:
        json.dump(dashboard, f, indent=2, default=str)

    log.info(f"Dashboard JSON saved to {output_dir}/dashboard.json")
    return dashboard


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Banking Data Preprocessing Pipeline")
    parser.add_argument("--use-case", type=str, default=None,
                        help="Run only a specific use case key (e.g. uc_06_01_creditcard_fraud)")
    parser.add_argument("--output-dir", type=str, default=OUTPUT_DIR,
                        help="Output directory for JSON files")
    parser.add_argument("--results-db", type=str, default=RESULTS_DB,
                        help="Path to results SQLite database")
    args = parser.parse_args()

    os.makedirs(args.output_dir, exist_ok=True)

    log.info("=" * 60)
    log.info("BANKING DATA PREPROCESSING PIPELINE")
    log.info(f"Source DB: {DB_PATH}")
    log.info(f"Results DB: {args.results_db}")
    log.info(f"Output Dir: {args.output_dir}")
    log.info(f"Started: {datetime.now().isoformat()}")
    log.info("=" * 60)

    # Determine which use cases to run
    if args.use_case:
        if args.use_case not in USE_CASES:
            log.error(f"Unknown use case: {args.use_case}. Available: {list(USE_CASES.keys())}")
            sys.exit(1)
        targets = {args.use_case: USE_CASES[args.use_case]}
    else:
        targets = USE_CASES

    all_reports = []

    # Use context managers for proper resource cleanup
    try:
        conn_src = sqlite3.connect(DB_PATH)
        conn_src.execute("PRAGMA journal_mode=WAL")
        conn_res = init_results_db(args.results_db)

        for uc_key, config in targets.items():
            try:
                report = run_pipeline(uc_key, config, conn_src)
                run_id = save_report(conn_res, report)
                uc_dir = export_json(report, args.output_dir)
                all_reports.append(report)
                log.info(f"Saved: run_id={run_id}, JSON at {uc_dir}")
            except Exception as e:
                log.error(f"FAILED {uc_key}: {e}", exc_info=True)

        # Master dashboard
        if all_reports:
            export_dashboard_json(all_reports, args.output_dir)

    finally:
        # Ensure connections are always closed
        if 'conn_src' in locals():
            conn_src.close()
        if 'conn_res' in locals():
            conn_res.close()

    log.info("=" * 60)
    log.info(f"PIPELINE COMPLETE: {len(all_reports)}/{len(targets)} use cases processed")
    log.info(f"Finished: {datetime.now().isoformat()}")
    log.info("=" * 60)

    # Log summary table (use logging instead of print)
    log.info(f"\n{'Use Case':<45} {'Score':>6} {'Rows':>10} {'Cols':>5} {'Miss%':>6} {'Outl%':>6}")
    log.info("-" * 85)
    for r in sorted(all_reports, key=lambda x: x["data_quality_score"], reverse=True):
        dq = r["data_quality"]
        log.info(f"{r['label']:<45} {r['data_quality_score']:>6.1f} {dq['total_rows_in_db']:>10,} "
                 f"{dq['total_columns']:>5} {dq['avg_missing_pct']:>5.1f}% {r['avg_outlier_pct']:>5.1f}%")


if __name__ == "__main__":
    main()
