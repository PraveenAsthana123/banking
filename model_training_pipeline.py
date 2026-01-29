#!/usr/bin/env python3
"""
Banking ML Model Training Pipeline
===================================
Comprehensive ML training pipeline for 97 banking use cases.
Implements classification, regression, time-series, NLP, CV, anomaly detection,
and optimization models with full benchmarking and evaluation.

Usage:
    python3 model_training_pipeline.py [--use-case UC_KEY] [--model-type ML_TYPE]
"""

import os
import sys
import json
import sqlite3
import logging
import time
import warnings
from datetime import datetime
from pathlib import Path
import joblib
import pickle

import numpy as np
import pandas as pd
from scipy import stats
from sklearn.model_selection import train_test_split, StratifiedKFold, KFold, cross_validate
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.impute import SimpleImputer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score,
    average_precision_score, matthews_corrcoef, cohen_kappa_score,
    mean_squared_error, mean_absolute_error, r2_score,
    silhouette_score, confusion_matrix, classification_report
)

# Classification models
from sklearn.linear_model import LogisticRegression, Ridge, Lasso, LinearRegression
from sklearn.ensemble import (
    RandomForestClassifier, RandomForestRegressor,
    VotingClassifier, VotingRegressor,
    StackingClassifier, StackingRegressor,
    IsolationForest
)
from sklearn.svm import SVC, SVR, OneClassSVM
from sklearn.neighbors import LocalOutlierFactor

# XGBoost and LightGBM
try:
    import xgboost as xgb
    HAS_XGB = True
except ImportError:
    HAS_XGB = False

try:
    import lightgbm as lgb
    HAS_LGB = True
except ImportError:
    HAS_LGB = False

# Optional: SMOTE for imbalanced data
try:
    from imblearn.over_sampling import SMOTE
    HAS_SMOTE = True
except ImportError:
    HAS_SMOTE = False

# Optional: Time series
try:
    from statsmodels.tsa.arima.model import ARIMA
    HAS_ARIMA = True
except ImportError:
    HAS_ARIMA = False

try:
    from prophet import Prophet
    HAS_PROPHET = False  # Disable by default due to dependencies
except ImportError:
    HAS_PROPHET = False

# Optional: PyTorch for deep learning
try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False

# Optional: Sentence transformers for NLP
try:
    from sentence_transformers import SentenceTransformer
    HAS_SBERT = True
except ImportError:
    HAS_SBERT = False

# Optional: scipy optimize
try:
    from scipy.optimize import linprog, minimize
    HAS_SCIPY_OPT = True
except ImportError:
    HAS_SCIPY_OPT = False

# Optional: DEAP for genetic algorithms
try:
    from deap import base, creator, tools, algorithms
    HAS_DEAP = True
except ImportError:
    HAS_DEAP = False

# Suppress specific warnings that are noisy but not actionable
warnings.filterwarnings('ignore', category=FutureWarning)  # sklearn deprecation warnings
warnings.filterwarnings('ignore', category=UserWarning, module='sklearn')  # sklearn convergence
warnings.filterwarnings('ignore', category=RuntimeWarning, message='divide by zero')
warnings.filterwarnings('ignore', category=RuntimeWarning, message='invalid value')

# Add script directory to path for local imports
_SCRIPT_DIR = Path(__file__).resolve().parent
if str(_SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPT_DIR))

# ==============================================================================
# CONFIGURATION (from centralized config module)
# ==============================================================================
from config import (
    UNIFIED_DB, RESULTS_DB as _RESULTS_DB, MAPPING_CSV as _MAPPING_CSV,
    USE_CASES_DIR, LOGS_DIR, LOG_LEVEL, LOG_FORMAT,
    get_db_connection, validate_use_case_key, get_log_file
)

DB_PATH = str(UNIFIED_DB)
RESULTS_DB = str(_RESULTS_DB)
MAPPING_CSV = str(_MAPPING_CSV)
BASE_PATH = str(USE_CASES_DIR)
LOG_DIR = str(LOGS_DIR)

LOGS_DIR.mkdir(parents=True, exist_ok=True)
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format=LOG_FORMAT,
    handlers=[
        logging.FileHandler(get_log_file('ml_training')),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger("ml_training")

# ==============================================================================
# USE CASE REGISTRY - Full use cases with ML type classification
# ==============================================================================
USE_CASE_REGISTRY = {
    # Original 11 use cases
    "uc_06_01_creditcard_fraud": {
        "label": "UC-06-01: Credit Card Fraud Scoring",
        "target": "Class",
        "numeric_hints": ["Time", "Amount"] + [f"V{i}" for i in range(1, 29)],
        "category": "Fraud Management",
        "domain": "fraud",
        "ml_type": "classification",
    },
    "uc_06_04_rba_auth": {
        "label": "UC-06-04: Risk-Based Authentication",
        "target": "Is_Account_Takeover",
        "numeric_hints": ["Round_Trip_Time__ms_"],
        "category": "Fraud Management",
        "domain": "fraud",
        "ml_type": "classification",
    },
    "uc_07_02_lending_club": {
        "label": "UC-07-02: Lending Club Credit Scoring",
        "target": "loan_status",
        "numeric_hints": ["loan_amnt", "funded_amnt", "int_rate", "installment", "annual_inc",
                          "dti", "delinq_2yrs", "open_acc", "pub_rec", "revol_bal", "revol_util",
                          "total_acc", "total_pymnt", "total_rec_prncp", "total_rec_int"],
        "category": "Credit Risk",
        "domain": "credit",
        "ml_type": "classification",
    },
    "uc_07_03_loan_data": {
        "label": "UC-07-03: Credit Default Prediction",
        "target": "loan_status",
        "numeric_hints": ["loan_amnt", "funded_amnt", "int_rate", "installment", "annual_inc",
                          "dti", "delinq_2yrs", "open_acc", "revol_bal", "revol_util"],
        "category": "Credit Risk",
        "domain": "credit",
        "ml_type": "classification",
    },
    "uc_08_01_paysim": {
        "label": "UC-08-01: AML Alert Prioritization (PaySim)",
        "target": "isFraud",
        "numeric_hints": ["step", "amount", "oldbalanceOrg", "newbalanceOrig",
                          "oldbalanceDest", "newbalanceDest"],
        "category": "AML / Financial Crime",
        "domain": "aml",
        "ml_type": "classification",
    },
    "uc_08_03_aml": {
        "label": "UC-08-03: SAR Narrative / AML Detection",
        "target": "Is_laundering",
        "numeric_hints": ["Amount"],
        "category": "AML / Financial Crime",
        "domain": "aml",
        "ml_type": "classification",
    },
    "uc_09_01_collections": {
        "label": "UC-09-01: Default / Delinquency Prediction",
        "target": "default_payment_next_month",
        "numeric_hints": ["LIMIT_BAL", "AGE", "BILL_AMT1", "BILL_AMT2", "BILL_AMT3",
                          "BILL_AMT4", "BILL_AMT5", "BILL_AMT6", "PAY_AMT1", "PAY_AMT2",
                          "PAY_AMT3", "PAY_AMT4", "PAY_AMT5", "PAY_AMT6"],
        "category": "Collections & Recovery",
        "domain": "collections",
        "ml_type": "classification",
    },
    "uc_11_03_bank_txn": {
        "label": "UC-11-03: Bank Transaction Analysis",
        "target": None,
        "numeric_hints": ["CustAccountBalance", "TransactionAmount_(INR)"],
        "category": "Branch Operations",
        "domain": "branch",
        "ml_type": "anomaly",
    },
    "uc_12_02_twcs": {
        "label": "UC-12-02: Customer Sentiment Analysis",
        "target": "inbound",
        "numeric_hints": [],
        "category": "Contact Center",
        "domain": "contact_center",
        "ml_type": "nlp",
    },
    "uc_16_01_data_quality": {
        "label": "UC-16-01: Data Quality Monitoring",
        "target": None,
        "numeric_hints": ["CustAccountBalance", "TransactionAmount_(INR)"],
        "category": "Data Governance",
        "domain": "governance",
        "ml_type": "anomaly",
    },
    "uc_32_01_fed_rates": {
        "label": "UC-32-01: Treasury / Fed Rates",
        "target": None,
        "numeric_hints": ["Federal_Funds_Target_Rate", "Federal_Funds_Upper_Target",
                          "Federal_Funds_Lower_Target", "Effective_Federal_Funds_Rate",
                          "Real_GDP_(Percent_Change)", "Unemployment_Rate", "Inflation_Rate"],
        "category": "Treasury",
        "domain": "treasury",
        "ml_type": "timeseries",
    },
    # Department 14: Strategy / Transformation Office
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
        "ml_type": "optimization",
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
        "ml_type": "optimization",
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
        "ml_type": "classification",
    },
    "uc_st_04_transformation_risks": {
        "label": "UC-ST-04: Transformation Risk & Dependency Monitoring",
        "target": "escalated",
        "numeric_hints": ["risk_score", "dependency_count", "blocking_dependencies", "days_open"],
        "category": "Strategy / Transformation",
        "domain": "strategy",
        "ml_type": "classification",
    },
    "uc_st_05_copilot_usage": {
        "label": "UC-ST-05: Transformation Playbook Copilot",
        "target": None,
        "numeric_hints": ["relevance_score", "user_rating", "response_time_ms"],
        "category": "Strategy / Transformation",
        "domain": "strategy",
        "ml_type": "nlp",
    },
    "uc_st_06_funding_wave": {
        "label": "UC-ST-06: Funding Wave & Roadmap Optimization",
        "target": "recommended_action",
        "numeric_hints": ["funding_requested_k", "funding_approved_k", "approval_rate_pct",
                          "strategic_score", "feasibility_score", "urgency_score",
                          "composite_score", "resource_fte", "duration_months", "dependencies"],
        "category": "Strategy / Transformation",
        "domain": "strategy",
        "ml_type": "classification",
    },
    "uc_st_07_board_kpis": {
        "label": "UC-ST-07: Transformation KPI & Board Reporting",
        "target": "status",
        "numeric_hints": ["target_value", "actual_value", "variance"],
        "category": "Strategy / Transformation",
        "domain": "strategy",
        "ml_type": "classification",
    },
    # Department 13: Data & AI Governance
    "uc_gov_01_data_quality": {
        "label": "UC-GOV-01: Data Quality & Anomaly Monitoring",
        "target": "anomaly_detected",
        "numeric_hints": ["completeness_pct", "uniqueness_pct", "validity_pct",
                          "consistency_pct", "timeliness_pct", "overall_dq_score",
                          "row_count", "null_count"],
        "category": "Data & AI Governance",
        "domain": "governance",
        "ml_type": "classification",
    },
    "uc_gov_02_model_drift": {
        "label": "UC-GOV-02: Model Drift & Bias Detection",
        "target": "drift_detected",
        "numeric_hints": ["accuracy", "precision", "recall", "f1_score", "auc_roc",
                          "psi", "csi", "demographic_parity_diff",
                          "equalized_odds_diff", "disparate_impact_ratio"],
        "category": "Data & AI Governance",
        "domain": "governance",
        "ml_type": "classification",
    },
    "uc_gov_03_ai_risk": {
        "label": "UC-GOV-03: AI Risk Classification (ISO 42001)",
        "target": "approval_status",
        "numeric_hints": ["explainability_score", "fairness_score", "robustness_score",
                          "transparency_score", "overall_risk_score"],
        "category": "Data & AI Governance",
        "domain": "governance",
        "ml_type": "classification",
    },
    "uc_gov_04_data_lineage": {
        "label": "UC-GOV-04: Data Lineage & Provenance Tracking",
        "target": "quality_gate_passed",
        "numeric_hints": ["record_count", "latency_minutes"],
        "category": "Data & AI Governance",
        "domain": "governance",
        "ml_type": "classification",
    },
    "uc_gov_05_copilot_usage": {
        "label": "UC-GOV-05: AI Governance Policy Copilot",
        "target": None,
        "numeric_hints": ["relevance_score", "user_satisfaction", "response_time_ms"],
        "category": "Data & AI Governance",
        "domain": "governance",
        "ml_type": "nlp",
    },
    "uc_gov_06_ai_portfolio": {
        "label": "UC-GOV-06: AI Portfolio Prioritization (Governance)",
        "target": "approved",
        "numeric_hints": ["value_score", "effort_score", "risk_score",
                          "data_readiness", "governance_readiness", "priority_rank"],
        "category": "Data & AI Governance",
        "domain": "governance",
        "ml_type": "classification",
    },
    "uc_gov_07_ai_incidents": {
        "label": "UC-GOV-07: AI Kill-Switch & Incident Response",
        "target": "kill_switch_activated",
        "numeric_hints": ["response_time_minutes", "resolution_time_hours",
                          "impact_users", "impact_revenue_k"],
        "category": "Data & AI Governance",
        "domain": "governance",
        "ml_type": "classification",
    },
    # Department 12: Workforce / HR Management
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
        "ml_type": "classification",
    },
    "uc_hr_02_workforce_demand": {
        "label": "UC-HR-02: Workforce Demand Forecasting",
        "target": None,
        "numeric_hints": ["current_headcount", "demand_headcount", "gap",
                          "attrition_rate", "hiring_pipeline", "avg_time_to_fill_days",
                          "overtime_hours", "contractor_count"],
        "category": "Workforce / HR",
        "domain": "hr",
        "ml_type": "timeseries",
    },
    "uc_hr_03_hiring": {
        "label": "UC-HR-03: Hiring & Internal Mobility Recommendation",
        "target": "recommendation",
        "numeric_hints": ["experience_years", "skills_match_score", "culture_fit_score",
                          "interview_score", "assessment_score", "composite_score",
                          "time_to_decision_days"],
        "category": "Workforce / HR",
        "domain": "hr",
        "ml_type": "classification",
    },
    "uc_hr_04_copilot_usage": {
        "label": "UC-HR-04: HR Policy Copilot",
        "target": None,
        "numeric_hints": ["relevance_score", "user_satisfaction", "response_time_ms"],
        "category": "Workforce / HR",
        "domain": "hr",
        "ml_type": "nlp",
    },
    "uc_hr_05_performance_bias": {
        "label": "UC-HR-05: Performance & Bias Monitoring",
        "target": "fairness_flag",
        "numeric_hints": ["job_level", "performance_score", "salary_increase_pct",
                          "bonus_pct", "training_hours", "engagement_score"],
        "category": "Workforce / HR",
        "domain": "hr",
        "ml_type": "classification",
    },
    "uc_hr_06_resume_screening": {
        "label": "UC-HR-06: Resume Screening & Skills Extraction",
        "target": "screening_result",
        "numeric_hints": ["experience_years", "skill_count", "skills_match_pct",
                          "resume_quality_score"],
        "category": "Workforce / HR",
        "domain": "hr",
        "ml_type": "classification",
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
        "ml_type": "optimization",
    },
    # Department 1: Fraud Management
    "uc_fr_01_fraud_scoring": {
        "label": "UC-FR-01: Real-Time Fraud Scoring", "target": "is_fraud",
        "numeric_hints": ["amount", "hour", "day_of_week", "distance_from_home_km", "velocity_1h", "velocity_24h", "avg_txn_amount", "card_age_days", "fraud_score"],
        "category": "Fraud Management", "domain": "fraud", "ml_type": "classification"},
    "uc_fr_02_sequential_fraud": {
        "label": "UC-FR-02: Sequential Fraud Detection", "target": "is_fraud_sequence",
        "numeric_hints": ["sequence_num", "amount", "time_since_last_seconds", "geo_velocity_kmh"],
        "category": "Fraud Management", "domain": "fraud", "ml_type": "classification"},
    "uc_fr_03_merchant_device": {
        "label": "UC-FR-03: Merchant/Device Fraud Patterns", "target": "is_flagged",
        "numeric_hints": ["total_transactions", "total_amount", "fraud_transactions", "fraud_rate_pct", "avg_transaction_amount", "unique_cards", "unique_countries", "chargeback_rate_pct", "risk_score"],
        "category": "Fraud Management", "domain": "fraud", "ml_type": "classification"},
    "uc_fr_04_copilot_usage": {
        "label": "UC-FR-04: Fraud Investigation Copilot", "target": None,
        "numeric_hints": ["relevance_score", "user_rating", "response_time_ms"],
        "category": "Fraud Management", "domain": "fraud", "ml_type": "nlp"},
    "uc_fr_05_fraud_exposure": {
        "label": "UC-FR-05: Fraud Risk Exposure Monitoring", "target": None,
        "numeric_hints": ["fraud_count", "fraud_amount", "total_txn_count", "total_txn_amount", "fraud_rate_bps", "gross_loss", "recovery_amount", "net_loss"],
        "category": "Fraud Management", "domain": "fraud", "ml_type": "regression"},
    "uc_fr_06_fraud_decision": {
        "label": "UC-FR-06: Fraud Decision Optimization", "target": "actual_fraud",
        "numeric_hints": ["fraud_score", "amount"],
        "category": "Fraud Management", "domain": "fraud", "ml_type": "classification"},
    "uc_fr_07_false_positive": {
        "label": "UC-FR-07: False Positive Reduction", "target": "is_true_fraud",
        "numeric_hints": ["fraud_score", "amount", "customer_tenure_years", "avg_monthly_spend", "merchant_risk_score"],
        "category": "Fraud Management", "domain": "fraud", "ml_type": "classification"},
    # Department 2: Credit Risk & Lending
    "uc_cr_01_credit_scoring": {
        "label": "UC-CR-01: Credit Scoring (PD)", "target": "default",
        "numeric_hints": ["age", "annual_income", "employment_years", "loan_amount", "interest_rate", "dti", "credit_score", "delinquencies_2yr", "open_accounts", "revolving_utilization_pct", "total_credit_lines"],
        "category": "Credit Risk", "domain": "credit", "ml_type": "classification"},
    "uc_cr_02_alt_scoring": {
        "label": "UC-CR-02: Alternative Data Credit Scoring", "target": "default",
        "numeric_hints": ["bureau_score", "mobile_txn_count_30d", "utility_ontime_pct", "social_media_score", "ecommerce_spend_30d", "device_age_months", "location_stability_score", "income_proxy"],
        "category": "Credit Risk", "domain": "credit", "ml_type": "classification"},
    "uc_cr_03_approval": {
        "label": "UC-CR-03: Credit Approval Optimization", "target": "final_decision",
        "numeric_hints": ["credit_score", "dti", "loan_amount", "annual_income", "lti_ratio", "pd_score", "approved_rate_pct", "expected_loss"],
        "category": "Credit Risk", "domain": "credit", "ml_type": "classification"},
    "uc_cr_04_pricing": {
        "label": "UC-CR-04: Risk-Based Loan Pricing", "target": "loan_taken",
        "numeric_hints": ["pd_score", "lgd", "ead", "expected_loss", "base_rate", "risk_premium", "offered_rate_pct", "competitor_rate_pct", "margin_bps"],
        "category": "Credit Risk", "domain": "credit", "ml_type": "classification"},
    "uc_cr_05_copilot": {
        "label": "UC-CR-05: Underwriter Assist Copilot", "target": None,
        "numeric_hints": ["relevance_score", "user_rating", "response_time_ms"],
        "category": "Credit Risk", "domain": "credit", "ml_type": "nlp"},
    "uc_cr_06_portfolio": {
        "label": "UC-CR-06: Credit Portfolio Monitoring", "target": None,
        "numeric_hints": ["outstanding_balance_m", "dpd_30_pct", "dpd_60_pct", "dpd_90_pct", "nco_rate_pct", "provision_coverage_pct", "weighted_avg_fico"],
        "category": "Credit Risk", "domain": "credit", "ml_type": "regression"},
    "uc_cr_07_simulator": {
        "label": "UC-CR-07: Credit Portfolio Strategy Simulator", "target": None,
        "numeric_hints": ["origination_volume_m", "expected_pd", "expected_lgd", "expected_loss_m", "net_interest_margin_pct", "rwa_m", "roe_pct", "capital_required_m"],
        "category": "Credit Risk", "domain": "credit", "ml_type": "optimization"},
    # Department 3: AML / Financial Crime
    "uc_aml_01_alert_priority": {
        "label": "UC-AML-01: AML Alert Prioritization", "target": "is_true_positive",
        "numeric_hints": ["transaction_amount", "txn_count_30d", "alert_score", "investigation_hours"],
        "category": "AML / Financial Crime", "domain": "aml", "ml_type": "classification"},
    "uc_aml_02_network": {
        "label": "UC-AML-02: Network Laundering Detection", "target": "is_laundering",
        "numeric_hints": ["amount", "source_degree", "target_degree", "layer_depth"],
        "category": "AML / Financial Crime", "domain": "aml", "ml_type": "classification"},
    "uc_aml_03_sar_narratives": {
        "label": "UC-AML-03: SAR Narrative Drafting", "target": None,
        "numeric_hints": ["word_count"],
        "category": "AML / Financial Crime", "domain": "aml", "ml_type": "nlp"},
    "uc_aml_04_copilot": {
        "label": "UC-AML-04: AML Investigator Copilot", "target": None,
        "numeric_hints": ["relevance_score", "user_rating", "response_time_ms"],
        "category": "AML / Financial Crime", "domain": "aml", "ml_type": "nlp"},
    "uc_aml_05_disposition": {
        "label": "UC-AML-05: Alert Disposition Recommendation", "target": "recommended_action",
        "numeric_hints": ["alert_score", "prior_sars"],
        "category": "AML / Financial Crime", "domain": "aml", "ml_type": "classification"},
    "uc_aml_06_exposure": {
        "label": "UC-AML-06: AML Risk Exposure Dashboard", "target": None,
        "numeric_hints": ["total_alerts", "true_positives", "false_positives", "sars_filed", "avg_investigation_hours", "backlog_count", "regulatory_findings", "risk_exposure_m"],
        "category": "AML / Financial Crime", "domain": "aml", "ml_type": "regression"},
    # Department 4: Collections & Recovery
    "uc_col_01_delinquency": {
        "label": "UC-COL-01: Delinquency Prediction", "target": "will_default_6m",
        "numeric_hints": ["credit_score", "outstanding_balance", "months_since_last_payment", "payment_to_balance_ratio", "times_30dpd_12m", "times_60dpd_12m", "income_to_debt_ratio", "loan_age_months"],
        "category": "Collections & Recovery", "domain": "collections", "ml_type": "classification"},
    "uc_col_02_recovery": {
        "label": "UC-COL-02: Recovery Likelihood Scoring", "target": "actual_recovered",
        "numeric_hints": ["outstanding_balance", "prior_promises_kept", "prior_promises_broken", "contact_attempts", "successful_contacts", "last_payment_amount", "customer_tenure_months", "income_estimate", "recovery_score"],
        "category": "Collections & Recovery", "domain": "collections", "ml_type": "classification"},
    "uc_col_03_next_action": {
        "label": "UC-COL-03: Best Next Action", "target": "outcome",
        "numeric_hints": ["recovery_score", "discount_pct"],
        "category": "Collections & Recovery", "domain": "collections", "ml_type": "classification"},
    "uc_col_04_copilot": {
        "label": "UC-COL-04: Collections Agent Copilot", "target": None,
        "numeric_hints": ["relevance_score", "user_rating", "response_time_ms"],
        "category": "Collections & Recovery", "domain": "collections", "ml_type": "nlp"},
    "uc_col_05_roll_rate": {
        "label": "UC-COL-05: Roll-rate Portfolio Monitoring", "target": None,
        "numeric_hints": ["current_pct", "dpd30_pct", "dpd60_pct", "dpd90_pct", "dpd120_pct", "dpd180_plus_pct", "roll_rate_30_to_60", "roll_rate_60_to_90", "roll_rate_90_to_120", "cure_rate_30", "nco_rate_pct", "total_outstanding_m"],
        "category": "Collections & Recovery", "domain": "collections", "ml_type": "regression"},
    "uc_col_06_compliance": {
        "label": "UC-COL-06: Script Compliance & Sentiment", "target": "escalation_triggered",
        "numeric_hints": ["call_duration_seconds", "compliance_score"],
        "category": "Collections & Recovery", "domain": "collections", "ml_type": "classification"},
    # Department 5: Contact Center
    "uc_cc_01_volume_forecast": {
        "label": "UC-CC-01: Call Volume Forecasting", "target": None,
        "numeric_hints": ["call_volume", "chat_volume", "email_volume", "avg_wait_seconds", "avg_handle_time_seconds", "abandon_rate_pct", "fcr_rate_pct"],
        "category": "Contact Center", "domain": "contact_center", "ml_type": "timeseries"},
    "uc_cc_02_agent_assist": {
        "label": "UC-CC-02: Agent Assist Copilot", "target": None,
        "numeric_hints": ["relevance_score", "handle_time_reduction_pct", "csat_score"],
        "category": "Contact Center", "domain": "contact_center", "ml_type": "nlp"},
    "uc_cc_03_nbo": {
        "label": "UC-CC-03: Next Best Offer", "target": "offer_accepted",
        "numeric_hints": ["tenure_months", "products_held", "monthly_balance_avg", "last_interaction_days", "churn_risk_score", "cross_sell_propensity"],
        "category": "Contact Center", "domain": "contact_center", "ml_type": "classification"},
    "uc_cc_04_routing": {
        "label": "UC-CC-04: Intelligent Call Routing", "target": "correct_routing",
        "numeric_hints": ["intent_confidence", "transfer_count", "resolution_time_s", "csat"],
        "category": "Contact Center", "domain": "contact_center", "ml_type": "classification"},
    "uc_cc_05_qa": {
        "label": "UC-CC-05: QA & Compliance Monitoring", "target": "escalation_needed",
        "numeric_hints": ["qa_score", "compliance_score"],
        "category": "Contact Center", "domain": "contact_center", "ml_type": "classification"},
    "uc_cc_06_speech": {
        "label": "UC-CC-06: Speech Analytics", "target": None,
        "numeric_hints": ["duration_seconds", "word_count", "speaker_turns", "silence_pct", "talk_over_count", "agent_talk_ratio", "sentiment_score", "key_phrases_count", "transcription_confidence"],
        "category": "Contact Center", "domain": "contact_center", "ml_type": "nlp"},
    "uc_cc_07_retention": {
        "label": "UC-CC-07: Retention Decision Engine", "target": "outcome",
        "numeric_hints": ["churn_score", "lifetime_value", "tenure_months", "complaint_count_12m", "nps_score", "products_held", "monthly_revenue"],
        "category": "Contact Center", "domain": "contact_center", "ml_type": "classification"},
    # Department 6: Branch Operations
    "uc_bo_01_staffing": {
        "label": "UC-BO-01: Branch Staffing Optimization", "target": "sla_met",
        "numeric_hints": ["footfall", "tellers_needed", "advisors_needed", "actual_tellers", "actual_advisors", "avg_wait_minutes"],
        "category": "Branch Operations", "domain": "branch", "ml_type": "classification"},
    "uc_bo_02_queue": {
        "label": "UC-BO-02: Queue Time Prediction", "target": "sla_breach",
        "numeric_hints": ["queue_length", "active_counters", "avg_service_time_min", "predicted_wait_min", "actual_wait_min"],
        "category": "Branch Operations", "domain": "branch", "ml_type": "classification"},
    "uc_bo_03_footfall": {
        "label": "UC-BO-03: Footfall & Capacity Analytics", "target": None,
        "numeric_hints": ["footfall_count", "occupancy_pct", "zone_lobby", "zone_teller", "zone_advisor", "dwell_time_avg_min"],
        "category": "Branch Operations", "domain": "branch", "ml_type": "timeseries"},
    "uc_bo_04_churn": {
        "label": "UC-BO-04: Branch Customer Churn Risk", "target": "churned",
        "numeric_hints": ["tenure_months", "products_held", "monthly_visits", "avg_balance", "complaints_12m", "nps_score", "churn_risk_score"],
        "category": "Branch Operations", "domain": "branch", "ml_type": "classification"},
    "uc_bo_05_copilot": {
        "label": "UC-BO-05: Branch Ops Copilot", "target": None,
        "numeric_hints": ["relevance_score", "user_rating", "response_time_ms"],
        "category": "Branch Operations", "domain": "branch", "ml_type": "nlp"},
    "uc_bo_06_allocation": {
        "label": "UC-BO-06: Dynamic Counter Allocation", "target": "allocation_optimal",
        "numeric_hints": ["forecasted_footfall", "teller_txn_pct", "advisor_txn_pct", "recommended_tellers", "recommended_advisors", "wait_time_result_min"],
        "category": "Branch Operations", "domain": "branch", "ml_type": "optimization"},
    # Department 7: ATM & Cash Operations
    "uc_atm_01_cash_demand": {
        "label": "UC-ATM-01: Cash Demand Forecasting", "target": "stockout_event",
        "numeric_hints": ["withdrawal_amount", "deposit_amount", "transaction_count", "cash_level_pct"],
        "category": "ATM & Cash Ops", "domain": "atm", "ml_type": "classification"},
    "uc_atm_02_routes": {
        "label": "UC-ATM-02: Route Optimization", "target": "optimized",
        "numeric_hints": ["atm_count_in_route", "total_distance_km", "total_cash_loaded_k", "route_time_hours", "fuel_cost", "labor_cost", "distance_saved_pct"],
        "category": "ATM & Cash Ops", "domain": "atm", "ml_type": "optimization"},
    "uc_atm_03_health": {
        "label": "UC-ATM-03: ATM Health Prediction", "target": "actual_downtime_event",
        "numeric_hints": ["cpu_usage_pct", "memory_usage_pct", "disk_usage_pct", "network_latency_ms", "error_count_1h", "predicted_downtime_hours"],
        "category": "ATM & Cash Ops", "domain": "atm", "ml_type": "classification"},
    "uc_atm_04_surveillance": {
        "label": "UC-ATM-04: Surveillance & Tampering Detection", "target": "alert_generated",
        "numeric_hints": ["person_count", "skimmer_confidence"],
        "category": "ATM & Cash Ops", "domain": "atm", "ml_type": "cv"},
    "uc_atm_05_copilot": {
        "label": "UC-ATM-05: ATM Ops Copilot", "target": None,
        "numeric_hints": ["relevance_score", "user_rating", "response_time_ms"],
        "category": "ATM & Cash Ops", "domain": "atm", "ml_type": "nlp"},
    "uc_atm_06_replenishment": {
        "label": "UC-ATM-06: Dynamic Replenishment Decision", "target": "recommended_action",
        "numeric_hints": ["current_cash_level_pct", "forecasted_demand_24h", "forecasted_demand_48h", "days_until_stockout", "replenish_cost", "idle_cash_cost_daily", "optimal_load_amount"],
        "category": "ATM & Cash Ops", "domain": "atm", "ml_type": "optimization"},
    # Department 8: Treasury & Finance
    "uc_tf_01_liquidity": {
        "label": "UC-TF-01: Liquidity Forecasting & ALM", "target": None,
        "numeric_hints": ["total_deposits_m", "total_loans_m", "net_liquidity_m", "inflow_m", "outflow_m", "overnight_rate_pct", "lcr_pct", "nsfr_pct", "hqla_m", "stress_buffer_m"],
        "category": "Treasury & Finance", "domain": "treasury", "ml_type": "timeseries"},
    "uc_tf_02_capital": {
        "label": "UC-TF-02: Capital Allocation Optimization", "target": "recommended_action",
        "numeric_hints": ["allocated_capital_m", "risk_weighted_assets_m", "revenue_m", "net_income_m", "roe_pct", "raroc_pct", "economic_capital_m", "excess_capital_m"],
        "category": "Treasury & Finance", "domain": "treasury", "ml_type": "optimization"},
    "uc_tf_03_ratios": {
        "label": "UC-TF-03: Regulatory Ratio Monitoring", "target": "breach_flag",
        "numeric_hints": ["cet1_ratio_pct", "tier1_ratio_pct", "total_capital_ratio_pct", "leverage_ratio_pct", "lcr_pct", "nsfr_pct", "large_exposure_pct", "rwa_m", "buffer_over_minimum_pct"],
        "category": "Treasury & Finance", "domain": "treasury", "ml_type": "classification"},
    "uc_tf_04_stress": {
        "label": "UC-TF-04: Stress Testing & Scenario Simulation", "target": "passes_threshold",
        "numeric_hints": ["gdp_shock_pct", "unemployment_shock_pct", "interest_rate_shock_bps", "equity_shock_pct", "credit_loss_m", "market_loss_m", "operational_loss_m", "total_loss_m", "post_stress_cet1_pct"],
        "category": "Treasury & Finance", "domain": "treasury", "ml_type": "classification"},
    "uc_tf_05_copilot": {
        "label": "UC-TF-05: Treasury Policy Copilot", "target": None,
        "numeric_hints": ["relevance_score", "user_rating", "response_time_ms"],
        "category": "Treasury & Finance", "domain": "treasury", "ml_type": "nlp"},
    "uc_tf_06_funding_mix": {
        "label": "UC-TF-06: Funding Mix Decision Engine", "target": None,
        "numeric_hints": ["funding_need_m", "tenor_months", "deposits_rate_pct", "wholesale_rate_pct", "repo_rate_pct", "bond_rate_pct", "blended_cost_pct", "nsfr_impact_pct"],
        "category": "Treasury & Finance", "domain": "treasury", "ml_type": "optimization"},
    "uc_tf_07_cash_pool": {
        "label": "UC-TF-07: Cash Pooling & Liquidity Sweeping", "target": "execution_status",
        "numeric_hints": ["opening_balance_m", "target_balance_m", "sweep_amount_m", "interest_saving_daily"],
        "category": "Treasury & Finance", "domain": "treasury", "ml_type": "classification"},
    # Real Public Datasets
    "real_creditcard_fraud": {
        "label": "REAL: Credit Card Fraud (ULB 284K)", "target": "Class",
        "numeric_hints": ["Time", "Amount"] + [f"V{i}" for i in range(1, 29)],
        "category": "Fraud Management", "domain": "fraud", "ml_type": "classification"},
    "real_german_credit": {
        "label": "REAL: German Credit (UCI)", "target": "attr_20",
        "numeric_hints": [f"attr_{i}" for i in range(21)],
        "category": "Credit Risk", "domain": "credit", "ml_type": "classification"},
    "real_south_german_credit": {
        "label": "REAL: South German Credit (UCI)", "target": "kredit",
        "numeric_hints": ["laufkont", "laufzeit", "moral", "verw", "hoession", "sparkont", "besession", "rate", "famges", "bession", "pvession", "alter", "weitkam", "wession", "bishkam", "beression", "pers", "telession", "gaession", "kredit"],
        "category": "Credit Risk", "domain": "credit", "ml_type": "classification"},
    "real_bank_marketing": {
        "label": "REAL: Bank Marketing (UCI 41K)", "target": "y",
        "numeric_hints": ["age", "duration", "campaign", "pdays", "previous", "emp.var.rate", "cons.price.idx", "cons.conf.idx", "euribor3m", "nr.employed"],
        "category": "Branch Operations", "domain": "branch", "ml_type": "classification"},
    "real_fdic_bank_failures": {
        "label": "REAL: FDIC Bank Failures", "target": None,
        "numeric_hints": [],
        "category": "Branch Operations", "domain": "branch", "ml_type": "anomaly"},
    "real_atm_transactions": {
        "label": "REAL: ATM Transactions (India)", "target": None,
        "numeric_hints": ["No of Withdrawals", "No of Transfers", "No of Balance Enquiries"],
        "category": "ATM & Cash Ops", "domain": "atm", "ml_type": "timeseries"},
    "real_ibm_hr_attrition": {
        "label": "REAL: IBM HR Attrition (1470)", "target": "Attrition",
        "numeric_hints": ["Age", "DailyRate", "DistanceFromHome", "HourlyRate", "MonthlyIncome", "MonthlyRate", "NumCompaniesWorked", "PercentSalaryHike", "TotalWorkingYears", "YearsAtCompany", "YearsInCurrentRole", "YearsSinceLastPromotion", "YearsWithCurrManager"],
        "category": "Workforce / HR", "domain": "hr", "ml_type": "classification"},
    "real_hr_dataset_v9": {
        "label": "REAL: HR Dataset v9 (310)", "target": "Termd",
        "numeric_hints": ["Salary", "EngagementSurvey", "EmpSatisfaction", "SpecialProjectsCount", "DaysLateLast30", "Absences"],
        "category": "Workforce / HR", "domain": "hr", "ml_type": "classification"},
    "real_treasury_10yr": {
        "label": "REAL: Treasury 10Y Yield (FRED)", "target": None,
        "numeric_hints": ["DGS10"],
        "category": "Treasury & Finance", "domain": "treasury", "ml_type": "timeseries"},
    "real_treasury_2yr": {
        "label": "REAL: Treasury 2Y Yield (FRED)", "target": None,
        "numeric_hints": ["DGS2"],
        "category": "Treasury & Finance", "domain": "treasury", "ml_type": "timeseries"},
    "real_fed_funds_rate": {
        "label": "REAL: Fed Funds Rate (FRED)", "target": None,
        "numeric_hints": ["FEDFUNDS"],
        "category": "Treasury & Finance", "domain": "treasury", "ml_type": "timeseries"},
    "real_usd_eur_fx": {
        "label": "REAL: USD/EUR Exchange Rate (FRED)", "target": None,
        "numeric_hints": ["DEXUSEU"],
        "category": "Treasury & Finance", "domain": "treasury", "ml_type": "timeseries"},
    "real_avg_interest_rates": {
        "label": "REAL: US Avg Interest Rates (Treasury.gov)", "target": None,
        "numeric_hints": ["avg_interest_rate_amt"],
        "category": "Treasury & Finance", "domain": "treasury", "ml_type": "timeseries"},
}

# ==============================================================================
# UTILITY FUNCTIONS
# ==============================================================================

def get_uc_folder(uc_key):
    """Get folder path for a use case from the mapping CSV."""
    try:
        mapping_df = pd.read_csv(MAPPING_CSV)
        # Extract UC ID from uc_key (e.g., uc_06_01_creditcard_fraud -> UC-06-01)
        if uc_key.startswith("uc_"):
            parts = uc_key.split("_")
            if len(parts) >= 3:
                uc_id = f"UC-{parts[1].upper()}-{parts[2].upper()}"
            else:
                return None
        elif uc_key.startswith("real_"):
            # Real datasets don't have folder mapping
            return None
        else:
            return None

        row = mapping_df[mapping_df['uc_id'] == uc_id]
        if len(row) > 0:
            folder = row.iloc[0]['folder_path']
            return os.path.join(BASE_PATH, folder)
    except Exception as e:
        log.warning(f"Could not find folder for {uc_key}: {e}")
    return None


def load_data(uc_key, config):
    """Load data from SQLite or CSV files."""
    # Try SQLite first
    try:
        conn = sqlite3.connect(DB_PATH)
        df = pd.read_sql(f"SELECT * FROM [{uc_key}] LIMIT 100000", conn)
        conn.close()
        if len(df) > 0:
            log.info(f"Loaded {len(df)} rows from SQLite for {uc_key}")
            return df
    except Exception as e:
        log.warning(f"Could not load from SQLite for {uc_key}: {e}")

    # Try CSV
    uc_folder = get_uc_folder(uc_key)
    if uc_folder:
        csv_path = os.path.join(uc_folder, "csv")
        if os.path.exists(csv_path):
            csv_files = [f for f in os.listdir(csv_path) if f.endswith('.csv')]
            if csv_files:
                csv_file = os.path.join(csv_path, csv_files[0])
                df = pd.read_csv(csv_file, nrows=100000)
                log.info(f"Loaded {len(df)} rows from CSV for {uc_key}")
                return df

    log.error(f"No data found for {uc_key}")
    return None


def safe_numeric(series):
    """Convert series to numeric safely."""
    return pd.to_numeric(series, errors='coerce')


# ==============================================================================
# DATA SPLITTING
# ==============================================================================

def split_data(df, config, uc_key):
    """
    Split data into train/val/test (70/15/15).
    For classification: stratified split
    For timeseries: temporal split
    For others: random split
    """
    target = config.get('target')
    ml_type = config.get('ml_type')

    # Get UC folder for saving splits
    uc_folder = get_uc_folder(uc_key)
    if uc_folder:
        splits_dir = os.path.join(uc_folder, "splits")
        os.makedirs(splits_dir, exist_ok=True)
    else:
        splits_dir = None

    # Remove rows with missing target (if target exists)
    if target and target in df.columns:
        df = df[df[target].notna()].copy()

    if len(df) < 10:
        log.warning(f"Insufficient data for {uc_key}: {len(df)} rows")
        return None, None, None

    # Timeseries: temporal split
    if ml_type == 'timeseries':
        # Sort by date column if exists
        date_cols = [c for c in df.columns if 'date' in c.lower() or 'time' in c.lower()]
        if date_cols:
            df = df.sort_values(date_cols[0]).reset_index(drop=True)

        n = len(df)
        train_end = int(n * 0.70)
        val_end = int(n * 0.85)

        df_train = df.iloc[:train_end].copy()
        df_val = df.iloc[train_end:val_end].copy()
        df_test = df.iloc[val_end:].copy()

    # Classification: stratified split
    elif ml_type == 'classification' and target and target in df.columns:
        try:
            # First split: train vs temp (70/30)
            df_train, df_temp = train_test_split(df, test_size=0.3, stratify=df[target], random_state=42)
            # Second split: val vs test (50/50 of temp = 15/15 of total)
            df_val, df_test = train_test_split(df_temp, test_size=0.5, stratify=df_temp[target], random_state=42)
        except Exception as e:
            log.warning(f"Stratified split failed for {uc_key}, using random: {e}")
            df_train, df_temp = train_test_split(df, test_size=0.3, random_state=42)
            df_val, df_test = train_test_split(df_temp, test_size=0.5, random_state=42)

    # Others: random split
    else:
        df_train, df_temp = train_test_split(df, test_size=0.3, random_state=42)
        df_val, df_test = train_test_split(df_temp, test_size=0.5, random_state=42)

    log.info(f"Split: train={len(df_train)}, val={len(df_val)}, test={len(df_test)}")

    # Save splits
    if splits_dir:
        df_train.to_csv(os.path.join(splits_dir, "train.csv"), index=False)
        df_val.to_csv(os.path.join(splits_dir, "val.csv"), index=False)
        df_test.to_csv(os.path.join(splits_dir, "test.csv"), index=False)
        log.info(f"Saved splits to {splits_dir}")

    # Apply SMOTE if minority class < 10% for classification
    if ml_type == 'classification' and target and target in df_train.columns and HAS_SMOTE:
        try:
            vc = df_train[target].value_counts()
            if len(vc) == 2:  # Binary classification
                minority_pct = vc.min() / vc.sum()
                if minority_pct < 0.10:
                    log.info(f"Applying SMOTE (minority class: {minority_pct:.2%})")
                    X_train = df_train.drop(columns=[target])
                    y_train = df_train[target]

                    # Only use numeric columns for SMOTE
                    numeric_cols = X_train.select_dtypes(include=[np.number]).columns.tolist()
                    if numeric_cols:
                        X_train_num = X_train[numeric_cols].fillna(0)
                        smote = SMOTE(random_state=42, k_neighbors=min(5, vc.min() - 1))
                        X_resampled, y_resampled = smote.fit_resample(X_train_num, y_train)

                        # Reconstruct dataframe
                        df_train_smote = pd.DataFrame(X_resampled, columns=numeric_cols)
                        df_train_smote[target] = y_resampled

                        # Add back non-numeric columns (duplicate from original)
                        for col in X_train.columns:
                            if col not in numeric_cols:
                                df_train_smote[col] = df_train[col].mode()[0] if len(df_train[col].mode()) > 0 else None

                        df_train = df_train_smote
                        log.info(f"SMOTE applied: new train size={len(df_train)}")
        except Exception as e:
            log.warning(f"SMOTE failed: {e}")

    return df_train, df_val, df_test


# ==============================================================================
# DATA CLEANING
# ==============================================================================

def clean_data(df, config):
    """
    Clean data:
    - Remove duplicates
    - Cap outliers at IQR 1.5x
    - Impute missing values
    - Log transform skewed features
    - Detect edge cases
    """
    if df is None or len(df) == 0:
        return df, {}

    df = df.copy()
    edge_cases = []

    # Remove duplicates
    n_dup = df.duplicated().sum()
    if n_dup > 0:
        df = df.drop_duplicates()
        edge_cases.append(f"Removed {n_dup} duplicate rows")

    # Get numeric columns
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()

    # Cap outliers (IQR 1.5x)
    for col in numeric_cols:
        if df[col].notna().sum() > 0:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            lower = Q1 - 1.5 * IQR
            upper = Q3 + 1.5 * IQR

            n_outliers = ((df[col] < lower) | (df[col] > upper)).sum()
            if n_outliers > 0:
                df[col] = df[col].clip(lower, upper)
                if n_outliers > len(df) * 0.05:
                    edge_cases.append(f"{col}: {n_outliers} outliers capped")

    # Impute missing values
    # Numeric: median
    for col in numeric_cols:
        if df[col].isna().sum() > 0:
            median_val = df[col].median()
            df[col] = df[col].fillna(median_val)

    # Categorical: mode
    cat_cols = df.select_dtypes(include=['object']).columns.tolist()
    for col in cat_cols:
        if df[col].isna().sum() > 0:
            mode_val = df[col].mode()[0] if len(df[col].mode()) > 0 else 'MISSING'
            df[col] = df[col].fillna(mode_val)

    # Log transform if skew > 2
    for col in numeric_cols:
        if df[col].notna().sum() > 0:
            skew = df[col].skew()
            if abs(skew) > 2 and df[col].min() >= 0:
                df[col] = np.log1p(df[col])
                edge_cases.append(f"{col}: log transformed (skew={skew:.2f})")

    # Detect edge cases
    # Single-class columns
    for col in df.columns:
        if df[col].nunique() <= 1:
            edge_cases.append(f"{col}: single value (dropped)")
            df = df.drop(columns=[col])

    # Zero variance
    for col in numeric_cols:
        if col in df.columns and df[col].std() == 0:
            edge_cases.append(f"{col}: zero variance (dropped)")
            df = df.drop(columns=[col])

    # >50% missing
    for col in df.columns:
        missing_pct = df[col].isna().sum() / len(df)
        if missing_pct > 0.5:
            edge_cases.append(f"{col}: {missing_pct:.1%} missing (dropped)")
            df = df.drop(columns=[col])

    clean_stats = {
        'rows_after_cleaning': len(df),
        'edge_cases': edge_cases
    }

    return df, clean_stats


# ==============================================================================
# FEATURE PREPARATION
# ==============================================================================

def prepare_features(df_train, df_val, config):
    """Prepare features: encode categoricals, scale numerics."""
    target = config.get('target')

    # Separate features and target
    feature_cols = [c for c in df_train.columns if c != target]

    X_train = df_train[feature_cols].copy()
    X_val = df_val[feature_cols].copy()

    if target and target in df_train.columns:
        y_train = df_train[target].copy()
        y_val = df_val[target].copy()
    else:
        y_train = None
        y_val = None

    # Encode categorical columns
    cat_cols = X_train.select_dtypes(include=['object']).columns.tolist()
    for col in cat_cols:
        le = LabelEncoder()
        X_train[col] = le.fit_transform(X_train[col].astype(str))
        X_val[col] = X_val[col].astype(str).map(lambda x: le.transform([x])[0] if x in le.classes_ else -1)

    # Scale numeric columns
    numeric_cols = X_train.select_dtypes(include=[np.number]).columns.tolist()
    if numeric_cols:
        scaler = StandardScaler()
        X_train[numeric_cols] = scaler.fit_transform(X_train[numeric_cols])
        X_val[numeric_cols] = scaler.transform(X_val[numeric_cols])

    # Encode target if categorical
    if y_train is not None and y_train.dtype == 'object':
        le = LabelEncoder()
        y_train = le.fit_transform(y_train)
        y_val = le.transform(y_val)

    return X_train, X_val, y_train, y_val


# ==============================================================================
# MODEL TRAINING - CLASSIFICATION
# ==============================================================================

def train_classification(df_train, df_val, config, uc_key):
    """
    Train classification models:
    - Logistic Regression
    - Random Forest
    - XGBoost
    - LightGBM
    - SVM
    - Voting Ensemble
    - Stacking Ensemble
    """
    log.info(f"Training classification models for {uc_key}")

    # Clean data
    df_train, clean_stats_train = clean_data(df_train, config)
    df_val, clean_stats_val = clean_data(df_val, config)

    if df_train is None or len(df_train) < 10:
        return {}

    # Prepare features
    X_train, X_val, y_train, y_val = prepare_features(df_train, df_val, config)

    if y_train is None:
        log.warning(f"No target found for classification: {uc_key}")
        return {}

    results = {}

    # Logistic Regression
    try:
        start = time.time()
        lr = LogisticRegression(max_iter=1000, random_state=42)
        lr.fit(X_train, y_train)
        y_pred = lr.predict(X_val)
        y_proba = lr.predict_proba(X_val)[:, 1] if len(np.unique(y_train)) == 2 else None

        metrics = compute_classification_metrics(y_val, y_pred, y_proba)
        metrics['training_time'] = time.time() - start

        results['LogisticRegression'] = (lr, metrics)
        log.info(f"LR: accuracy={metrics['accuracy']:.4f}")
    except Exception as e:
        log.warning(f"LR failed: {e}")

    # Random Forest
    try:
        start = time.time()
        rf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
        rf.fit(X_train, y_train)
        y_pred = rf.predict(X_val)
        y_proba = rf.predict_proba(X_val)[:, 1] if len(np.unique(y_train)) == 2 else None

        metrics = compute_classification_metrics(y_val, y_pred, y_proba)
        metrics['training_time'] = time.time() - start

        results['RandomForest'] = (rf, metrics)
        log.info(f"RF: accuracy={metrics['accuracy']:.4f}")
    except Exception as e:
        log.warning(f"RF failed: {e}")

    # XGBoost
    if HAS_XGB:
        try:
            start = time.time()
            xgb_model = xgb.XGBClassifier(n_estimators=100, max_depth=6, learning_rate=0.1,
                                          random_state=42, n_jobs=-1, eval_metric='logloss')
            xgb_model.fit(X_train, y_train)
            y_pred = xgb_model.predict(X_val)
            y_proba = xgb_model.predict_proba(X_val)[:, 1] if len(np.unique(y_train)) == 2 else None

            metrics = compute_classification_metrics(y_val, y_pred, y_proba)
            metrics['training_time'] = time.time() - start

            results['XGBoost'] = (xgb_model, metrics)
            log.info(f"XGB: accuracy={metrics['accuracy']:.4f}")
        except Exception as e:
            log.warning(f"XGB failed: {e}")

    # LightGBM
    if HAS_LGB:
        try:
            start = time.time()
            lgb_model = lgb.LGBMClassifier(n_estimators=100, max_depth=6, learning_rate=0.1,
                                           random_state=42, n_jobs=-1, verbose=-1)
            lgb_model.fit(X_train, y_train)
            y_pred = lgb_model.predict(X_val)
            y_proba = lgb_model.predict_proba(X_val)[:, 1] if len(np.unique(y_train)) == 2 else None

            metrics = compute_classification_metrics(y_val, y_pred, y_proba)
            metrics['training_time'] = time.time() - start

            results['LightGBM'] = (lgb_model, metrics)
            log.info(f"LGBM: accuracy={metrics['accuracy']:.4f}")
        except Exception as e:
            log.warning(f"LGBM failed: {e}")

    # SVM (small datasets only)
    if len(X_train) < 10000:
        try:
            start = time.time()
            svm = SVC(kernel='rbf', probability=True, random_state=42)
            svm.fit(X_train, y_train)
            y_pred = svm.predict(X_val)
            y_proba = svm.predict_proba(X_val)[:, 1] if len(np.unique(y_train)) == 2 else None

            metrics = compute_classification_metrics(y_val, y_pred, y_proba)
            metrics['training_time'] = time.time() - start

            results['SVM'] = (svm, metrics)
            log.info(f"SVM: accuracy={metrics['accuracy']:.4f}")
        except Exception as e:
            log.warning(f"SVM failed: {e}")

    # Voting Ensemble (RF + XGB + LGBM)
    if 'RandomForest' in results and 'XGBoost' in results and 'LightGBM' in results:
        try:
            start = time.time()
            voting = VotingClassifier(
                estimators=[
                    ('rf', results['RandomForest'][0]),
                    ('xgb', results['XGBoost'][0]),
                    ('lgb', results['LightGBM'][0])
                ],
                voting='soft'
            )
            voting.fit(X_train, y_train)
            y_pred = voting.predict(X_val)
            y_proba = voting.predict_proba(X_val)[:, 1] if len(np.unique(y_train)) == 2 else None

            metrics = compute_classification_metrics(y_val, y_pred, y_proba)
            metrics['training_time'] = time.time() - start

            results['VotingEnsemble'] = (voting, metrics)
            log.info(f"Voting: accuracy={metrics['accuracy']:.4f}")
        except Exception as e:
            log.warning(f"Voting failed: {e}")

    # Stacking Ensemble (LR meta over RF + XGB + LGBM)
    if 'RandomForest' in results and 'XGBoost' in results and 'LightGBM' in results:
        try:
            start = time.time()
            stacking = StackingClassifier(
                estimators=[
                    ('rf', results['RandomForest'][0]),
                    ('xgb', results['XGBoost'][0]),
                    ('lgb', results['LightGBM'][0])
                ],
                final_estimator=LogisticRegression(max_iter=1000),
                cv=3
            )
            stacking.fit(X_train, y_train)
            y_pred = stacking.predict(X_val)
            y_proba = stacking.predict_proba(X_val)[:, 1] if len(np.unique(y_train)) == 2 else None

            metrics = compute_classification_metrics(y_val, y_pred, y_proba)
            metrics['training_time'] = time.time() - start

            results['StackingEnsemble'] = (stacking, metrics)
            log.info(f"Stacking: accuracy={metrics['accuracy']:.4f}")
        except Exception as e:
            log.warning(f"Stacking failed: {e}")

    return results


def compute_classification_metrics(y_true, y_pred, y_proba=None):
    """Compute comprehensive classification metrics."""
    metrics = {}

    try:
        metrics['accuracy'] = float(accuracy_score(y_true, y_pred))
        metrics['precision'] = float(precision_score(y_true, y_pred, average='binary' if len(np.unique(y_true)) == 2 else 'weighted', zero_division=0))
        metrics['recall'] = float(recall_score(y_true, y_pred, average='binary' if len(np.unique(y_true)) == 2 else 'weighted', zero_division=0))
        metrics['f1'] = float(f1_score(y_true, y_pred, average='binary' if len(np.unique(y_true)) == 2 else 'weighted', zero_division=0))
        metrics['mcc'] = float(matthews_corrcoef(y_true, y_pred))
        metrics['cohen_kappa'] = float(cohen_kappa_score(y_true, y_pred))

        if y_proba is not None and len(np.unique(y_true)) == 2:
            metrics['auc_roc'] = float(roc_auc_score(y_true, y_proba))
            metrics['auc_pr'] = float(average_precision_score(y_true, y_proba))
        else:
            metrics['auc_roc'] = None
            metrics['auc_pr'] = None
    except Exception as e:
        log.warning(f"Metric computation failed: {e}")

    return metrics


# ==============================================================================
# MODEL TRAINING - REGRESSION
# ==============================================================================

def train_regression(df_train, df_val, config, uc_key):
    """
    Train regression models:
    - Linear Regression
    - Random Forest
    - XGBoost
    - LightGBM
    - SVR
    - Voting Ensemble
    - Stacking Ensemble
    """
    log.info(f"Training regression models for {uc_key}")

    # Clean data
    df_train, _ = clean_data(df_train, config)
    df_val, _ = clean_data(df_val, config)

    if df_train is None or len(df_train) < 10:
        return {}

    # Prepare features
    X_train, X_val, y_train, y_val = prepare_features(df_train, df_val, config)

    if y_train is None:
        log.warning(f"No target found for regression: {uc_key}")
        return {}

    results = {}

    # Linear Regression
    try:
        start = time.time()
        lr = LinearRegression()
        lr.fit(X_train, y_train)
        y_pred = lr.predict(X_val)

        metrics = compute_regression_metrics(y_val, y_pred, X_val.shape[1])
        metrics['training_time'] = time.time() - start

        results['LinearRegression'] = (lr, metrics)
        log.info(f"LinReg: r2={metrics['r2']:.4f}, rmse={metrics['rmse']:.4f}")
    except Exception as e:
        log.warning(f"LinReg failed: {e}")

    # Random Forest
    try:
        start = time.time()
        rf = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
        rf.fit(X_train, y_train)
        y_pred = rf.predict(X_val)

        metrics = compute_regression_metrics(y_val, y_pred, X_val.shape[1])
        metrics['training_time'] = time.time() - start

        results['RandomForest'] = (rf, metrics)
        log.info(f"RF: r2={metrics['r2']:.4f}, rmse={metrics['rmse']:.4f}")
    except Exception as e:
        log.warning(f"RF failed: {e}")

    # XGBoost
    if HAS_XGB:
        try:
            start = time.time()
            xgb_model = xgb.XGBRegressor(n_estimators=100, max_depth=6, learning_rate=0.1,
                                         random_state=42, n_jobs=-1)
            xgb_model.fit(X_train, y_train)
            y_pred = xgb_model.predict(X_val)

            metrics = compute_regression_metrics(y_val, y_pred, X_val.shape[1])
            metrics['training_time'] = time.time() - start

            results['XGBoost'] = (xgb_model, metrics)
            log.info(f"XGB: r2={metrics['r2']:.4f}, rmse={metrics['rmse']:.4f}")
        except Exception as e:
            log.warning(f"XGB failed: {e}")

    # LightGBM
    if HAS_LGB:
        try:
            start = time.time()
            lgb_model = lgb.LGBMRegressor(n_estimators=100, max_depth=6, learning_rate=0.1,
                                          random_state=42, n_jobs=-1, verbose=-1)
            lgb_model.fit(X_train, y_train)
            y_pred = lgb_model.predict(X_val)

            metrics = compute_regression_metrics(y_val, y_pred, X_val.shape[1])
            metrics['training_time'] = time.time() - start

            results['LightGBM'] = (lgb_model, metrics)
            log.info(f"LGBM: r2={metrics['r2']:.4f}, rmse={metrics['rmse']:.4f}")
        except Exception as e:
            log.warning(f"LGBM failed: {e}")

    # SVR (small datasets only)
    if len(X_train) < 5000:
        try:
            start = time.time()
            svr = SVR(kernel='rbf')
            svr.fit(X_train, y_train)
            y_pred = svr.predict(X_val)

            metrics = compute_regression_metrics(y_val, y_pred, X_val.shape[1])
            metrics['training_time'] = time.time() - start

            results['SVR'] = (svr, metrics)
            log.info(f"SVR: r2={metrics['r2']:.4f}, rmse={metrics['rmse']:.4f}")
        except Exception as e:
            log.warning(f"SVR failed: {e}")

    # Voting Ensemble
    if 'RandomForest' in results and 'XGBoost' in results and 'LightGBM' in results:
        try:
            start = time.time()
            voting = VotingRegressor(
                estimators=[
                    ('rf', results['RandomForest'][0]),
                    ('xgb', results['XGBoost'][0]),
                    ('lgb', results['LightGBM'][0])
                ]
            )
            voting.fit(X_train, y_train)
            y_pred = voting.predict(X_val)

            metrics = compute_regression_metrics(y_val, y_pred, X_val.shape[1])
            metrics['training_time'] = time.time() - start

            results['VotingEnsemble'] = (voting, metrics)
            log.info(f"Voting: r2={metrics['r2']:.4f}, rmse={metrics['rmse']:.4f}")
        except Exception as e:
            log.warning(f"Voting failed: {e}")

    # Stacking Ensemble
    if 'RandomForest' in results and 'XGBoost' in results and 'LightGBM' in results:
        try:
            start = time.time()
            stacking = StackingRegressor(
                estimators=[
                    ('rf', results['RandomForest'][0]),
                    ('xgb', results['XGBoost'][0]),
                    ('lgb', results['LightGBM'][0])
                ],
                final_estimator=Ridge(),
                cv=3
            )
            stacking.fit(X_train, y_train)
            y_pred = stacking.predict(X_val)

            metrics = compute_regression_metrics(y_val, y_pred, X_val.shape[1])
            metrics['training_time'] = time.time() - start

            results['StackingEnsemble'] = (stacking, metrics)
            log.info(f"Stacking: r2={metrics['r2']:.4f}, rmse={metrics['rmse']:.4f}")
        except Exception as e:
            log.warning(f"Stacking failed: {e}")

    return results


def compute_regression_metrics(y_true, y_pred, n_features):
    """Compute comprehensive regression metrics."""
    metrics = {}

    try:
        mse = mean_squared_error(y_true, y_pred)
        metrics['rmse'] = float(np.sqrt(mse))
        metrics['mae'] = float(mean_absolute_error(y_true, y_pred))
        metrics['r2'] = float(r2_score(y_true, y_pred))

        # Adjusted R2
        n = len(y_true)
        metrics['adjusted_r2'] = float(1 - (1 - metrics['r2']) * (n - 1) / (n - n_features - 1))

        # MAPE
        mask = y_true != 0
        if mask.sum() > 0:
            metrics['mape'] = float(np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100)
        else:
            metrics['mape'] = None
    except Exception as e:
        log.warning(f"Regression metric computation failed: {e}")

    return metrics


# ==============================================================================
# MODEL TRAINING - TIME SERIES
# ==============================================================================

def train_timeseries(df_train, df_val, config, uc_key):
    """
    Train time series models:
    - ARIMA
    - Prophet (if available)
    - XGBoost with lag features
    - Simple LSTM (if PyTorch available)
    """
    log.info(f"Training time series models for {uc_key}")

    results = {}

    # Find date and value columns
    date_cols = [c for c in df_train.columns if 'date' in c.lower() or 'time' in c.lower()]
    numeric_cols = df_train.select_dtypes(include=[np.number]).columns.tolist()

    if not date_cols or not numeric_cols:
        log.warning(f"No time series data found for {uc_key}")
        return results

    date_col = date_cols[0]
    value_col = numeric_cols[0]

    # Prepare time series data
    try:
        df_train[date_col] = pd.to_datetime(df_train[date_col], errors='coerce')
        df_val[date_col] = pd.to_datetime(df_val[date_col], errors='coerce')

        df_train = df_train.sort_values(date_col).dropna(subset=[date_col, value_col])
        df_val = df_val.sort_values(date_col).dropna(subset=[date_col, value_col])
    except Exception as e:
        log.warning(f"Date parsing failed: {e}")
        return results

    # ARIMA
    if HAS_ARIMA and len(df_train) > 10:
        try:
            start = time.time()
            model = ARIMA(df_train[value_col], order=(1, 1, 1))
            fitted = model.fit()
            forecast = fitted.forecast(steps=len(df_val))

            metrics = compute_timeseries_metrics(df_val[value_col].values, forecast)
            metrics['training_time'] = time.time() - start

            results['ARIMA'] = (fitted, metrics)
            log.info(f"ARIMA: rmse={metrics['rmse']:.4f}")
        except Exception as e:
            log.warning(f"ARIMA failed: {e}")

    # XGBoost with lag features
    if HAS_XGB and len(df_train) > 20:
        try:
            start = time.time()

            # Create lag features
            lags = [1, 2, 3, 7, 14]
            df_train_lag = df_train[[value_col]].copy()
            df_val_lag = df_val[[value_col]].copy()

            for lag in lags:
                df_train_lag[f'lag_{lag}'] = df_train_lag[value_col].shift(lag)
                df_val_lag[f'lag_{lag}'] = df_val_lag[value_col].shift(lag)

            df_train_lag = df_train_lag.dropna()
            df_val_lag = df_val_lag.dropna()

            if len(df_train_lag) > 10 and len(df_val_lag) > 0:
                X_train = df_train_lag.drop(columns=[value_col])
                y_train = df_train_lag[value_col]
                X_val = df_val_lag.drop(columns=[value_col])
                y_val = df_val_lag[value_col]

                xgb_model = xgb.XGBRegressor(n_estimators=100, max_depth=4, random_state=42)
                xgb_model.fit(X_train, y_train)
                y_pred = xgb_model.predict(X_val)

                metrics = compute_timeseries_metrics(y_val.values, y_pred)
                metrics['training_time'] = time.time() - start

                results['XGBoost_Lag'] = (xgb_model, metrics)
                log.info(f"XGB_Lag: rmse={metrics['rmse']:.4f}")
        except Exception as e:
            log.warning(f"XGBoost lag failed: {e}")

    # Simple baseline: naive forecast (last value)
    try:
        last_value = df_train[value_col].iloc[-1]
        naive_forecast = np.full(len(df_val), last_value)

        metrics = compute_timeseries_metrics(df_val[value_col].values, naive_forecast)
        metrics['training_time'] = 0.0

        results['Naive'] = (None, metrics)
        log.info(f"Naive: rmse={metrics['rmse']:.4f}")
    except Exception as e:
        log.warning(f"Naive forecast failed: {e}")

    return results


def compute_timeseries_metrics(y_true, y_pred):
    """Compute time series metrics."""
    metrics = {}

    try:
        metrics['rmse'] = float(np.sqrt(mean_squared_error(y_true, y_pred)))
        metrics['mae'] = float(mean_absolute_error(y_true, y_pred))

        # MAPE
        mask = y_true != 0
        if mask.sum() > 0:
            metrics['mape'] = float(np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100)
        else:
            metrics['mape'] = None

        # SMAPE
        denominator = (np.abs(y_true) + np.abs(y_pred)) / 2
        mask = denominator != 0
        if mask.sum() > 0:
            metrics['smape'] = float(np.mean(np.abs(y_true[mask] - y_pred[mask]) / denominator[mask]) * 100)
        else:
            metrics['smape'] = None

        # Directional accuracy
        if len(y_true) > 1:
            y_true_dir = np.diff(y_true) > 0
            y_pred_dir = np.diff(y_pred) > 0
            metrics['directional_accuracy'] = float(np.mean(y_true_dir == y_pred_dir))
        else:
            metrics['directional_accuracy'] = None
    except Exception as e:
        log.warning(f"Time series metric computation failed: {e}")

    return metrics


# ==============================================================================
# MODEL TRAINING - NLP
# ==============================================================================

def train_nlp(df_train, df_val, config, uc_key):
    """
    Train NLP models:
    - TF-IDF + Logistic Regression
    - TF-IDF + XGBoost
    - Sentence-BERT (if available)
    """
    log.info(f"Training NLP models for {uc_key}")

    results = {}

    # Find text column
    text_cols = [c for c in df_train.columns if 'text' in c.lower() or 'description' in c.lower()
                 or 'narrative' in c.lower() or 'tweet' in c.lower() or 'comment' in c.lower()]

    if not text_cols:
        log.warning(f"No text column found for NLP: {uc_key}")
        return results

    text_col = text_cols[0]
    target = config.get('target')

    # Clean text data
    df_train = df_train.dropna(subset=[text_col])
    df_val = df_val.dropna(subset=[text_col])

    if len(df_train) < 10:
        log.warning(f"Insufficient text data for {uc_key}")
        return results

    X_train_text = df_train[text_col].astype(str)
    X_val_text = df_val[text_col].astype(str)

    # TF-IDF + Logistic Regression
    try:
        start = time.time()

        vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        X_train_tfidf = vectorizer.fit_transform(X_train_text)
        X_val_tfidf = vectorizer.transform(X_val_text)

        if target and target in df_train.columns:
            y_train = df_train[target]
            y_val = df_val[target]

            # Encode if categorical
            if y_train.dtype == 'object':
                le = LabelEncoder()
                y_train = le.fit_transform(y_train)
                y_val = le.transform(y_val)

            lr = LogisticRegression(max_iter=1000, random_state=42)
            lr.fit(X_train_tfidf, y_train)
            y_pred = lr.predict(X_val_tfidf)
            y_proba = lr.predict_proba(X_val_tfidf)[:, 1] if len(np.unique(y_train)) == 2 else None

            metrics = compute_classification_metrics(y_val, y_pred, y_proba)
            metrics['training_time'] = time.time() - start

            results['TFIDF_LR'] = ((vectorizer, lr), metrics)
            log.info(f"TFIDF+LR: accuracy={metrics['accuracy']:.4f}")
    except Exception as e:
        log.warning(f"TFIDF+LR failed: {e}")

    # TF-IDF + XGBoost
    if HAS_XGB and target and target in df_train.columns:
        try:
            start = time.time()

            if 'TFIDF_LR' in results:
                vectorizer, _ = results['TFIDF_LR'][0]
                X_train_tfidf = vectorizer.transform(X_train_text)
                X_val_tfidf = vectorizer.transform(X_val_text)
            else:
                vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
                X_train_tfidf = vectorizer.fit_transform(X_train_text)
                X_val_tfidf = vectorizer.transform(X_val_text)

            y_train = df_train[target]
            y_val = df_val[target]

            if y_train.dtype == 'object':
                le = LabelEncoder()
                y_train = le.fit_transform(y_train)
                y_val = le.transform(y_val)

            xgb_model = xgb.XGBClassifier(n_estimators=100, max_depth=4, random_state=42, eval_metric='logloss')
            xgb_model.fit(X_train_tfidf, y_train)
            y_pred = xgb_model.predict(X_val_tfidf)
            y_proba = xgb_model.predict_proba(X_val_tfidf)[:, 1] if len(np.unique(y_train)) == 2 else None

            metrics = compute_classification_metrics(y_val, y_pred, y_proba)
            metrics['training_time'] = time.time() - start

            results['TFIDF_XGB'] = ((vectorizer, xgb_model), metrics)
            log.info(f"TFIDF+XGB: accuracy={metrics['accuracy']:.4f}")
        except Exception as e:
            log.warning(f"TFIDF+XGB failed: {e}")

    return results


# ==============================================================================
# MODEL TRAINING - COMPUTER VISION
# ==============================================================================

def train_cv(uc_key, config):
    """
    Train computer vision models (placeholder).
    Skips gracefully if no image data or dependencies unavailable.
    """
    log.info(f"CV training for {uc_key} - skipped (no image data pipeline)")
    return {}


# ==============================================================================
# MODEL TRAINING - ANOMALY DETECTION
# ==============================================================================

def train_anomaly(df_train, df_val, config, uc_key):
    """
    Train anomaly detection models:
    - Isolation Forest
    - Local Outlier Factor
    - One-Class SVM
    """
    log.info(f"Training anomaly detection models for {uc_key}")

    # Clean and prepare data
    df_train, _ = clean_data(df_train, config)
    df_val, _ = clean_data(df_val, config)

    if df_train is None or len(df_train) < 10:
        return {}

    # Use only numeric columns
    numeric_cols = df_train.select_dtypes(include=[np.number]).columns.tolist()
    X_train = df_train[numeric_cols].fillna(0)
    X_val = df_val[numeric_cols].fillna(0)

    # Scale
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)

    results = {}

    # Isolation Forest
    try:
        start = time.time()
        iso = IsolationForest(contamination=0.1, random_state=42, n_jobs=-1)
        iso.fit(X_train_scaled)
        y_pred = iso.predict(X_val_scaled)

        # Convert to binary (1 = normal, -1 = anomaly)
        anomaly_labels = (y_pred == -1).astype(int)

        metrics = {}
        metrics['contamination_rate'] = float(anomaly_labels.mean())

        if len(X_val_scaled) > 1:
            try:
                metrics['silhouette_score'] = float(silhouette_score(X_val_scaled, y_pred))
            except Exception:
                metrics['silhouette_score'] = None

        metrics['training_time'] = time.time() - start

        results['IsolationForest'] = (iso, metrics)
        log.info(f"IsoForest: contamination={metrics['contamination_rate']:.4f}")
    except Exception as e:
        log.warning(f"IsolationForest failed: {e}")

    # Local Outlier Factor
    try:
        start = time.time()
        lof = LocalOutlierFactor(contamination=0.1, novelty=True, n_jobs=-1)
        lof.fit(X_train_scaled)
        y_pred = lof.predict(X_val_scaled)

        anomaly_labels = (y_pred == -1).astype(int)

        metrics = {}
        metrics['contamination_rate'] = float(anomaly_labels.mean())

        if len(X_val_scaled) > 1:
            try:
                metrics['silhouette_score'] = float(silhouette_score(X_val_scaled, y_pred))
            except Exception:
                metrics['silhouette_score'] = None

        metrics['training_time'] = time.time() - start

        results['LOF'] = (lof, metrics)
        log.info(f"LOF: contamination={metrics['contamination_rate']:.4f}")
    except Exception as e:
        log.warning(f"LOF failed: {e}")

    # One-Class SVM (small datasets only)
    if len(X_train_scaled) < 5000:
        try:
            start = time.time()
            oc_svm = OneClassSVM(nu=0.1, kernel='rbf')
            oc_svm.fit(X_train_scaled)
            y_pred = oc_svm.predict(X_val_scaled)

            anomaly_labels = (y_pred == -1).astype(int)

            metrics = {}
            metrics['contamination_rate'] = float(anomaly_labels.mean())

            if len(X_val_scaled) > 1:
                try:
                    metrics['silhouette_score'] = float(silhouette_score(X_val_scaled, y_pred))
                except Exception:
                    metrics['silhouette_score'] = None

            metrics['training_time'] = time.time() - start

            results['OneClassSVM'] = (oc_svm, metrics)
            log.info(f"OneClassSVM: contamination={metrics['contamination_rate']:.4f}")
        except Exception as e:
            log.warning(f"OneClassSVM failed: {e}")

    return results


# ==============================================================================
# MODEL TRAINING - OPTIMIZATION
# ==============================================================================

def train_optimization(df, config, uc_key):
    """
    Train optimization models:
    - Linear programming (scipy)
    - XGBoost surrogate
    """
    log.info(f"Training optimization models for {uc_key}")

    results = {}

    # Linear programming (simple example)
    if HAS_SCIPY_OPT:
        try:
            start = time.time()

            # Simple LP: maximize sum of first numeric column subject to constraints
            numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
            if numeric_cols:
                c = -df[numeric_cols[0]].fillna(0).values[:10]  # Coefficients (negative for maximization)
                A_ub = np.ones((1, len(c)))
                b_ub = [len(c) * df[numeric_cols[0]].mean()]

                result = linprog(c, A_ub=A_ub, b_ub=b_ub, method='highs')

                metrics = {
                    'optimal_value': float(-result.fun) if result.success else None,
                    'success': result.success,
                    'training_time': time.time() - start
                }

                results['LinearProgramming'] = (result, metrics)
                log.info(f"LinProg: success={result.success}")
        except Exception as e:
            log.warning(f"Linear programming failed: {e}")

    # XGBoost surrogate (treat as regression problem)
    if HAS_XGB and len(df) > 20:
        try:
            start = time.time()

            numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
            if len(numeric_cols) >= 2:
                # Use first column as target, rest as features
                X = df[numeric_cols[1:]].fillna(0)
                y = df[numeric_cols[0]].fillna(0)

                X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)

                xgb_model = xgb.XGBRegressor(n_estimators=50, max_depth=4, random_state=42)
                xgb_model.fit(X_train, y_train)
                y_pred = xgb_model.predict(X_val)

                metrics = compute_regression_metrics(y_val, y_pred, X_val.shape[1])
                metrics['training_time'] = time.time() - start

                results['XGBoost_Surrogate'] = (xgb_model, metrics)
                log.info(f"XGB_Surrogate: r2={metrics['r2']:.4f}")
        except Exception as e:
            log.warning(f"XGBoost surrogate failed: {e}")

    return results


# ==============================================================================
# MODEL SAVING
# ==============================================================================

def save_models(models_dict, uc_key):
    """Save trained models to disk."""
    uc_folder = get_uc_folder(uc_key)
    if not uc_folder:
        return

    models_dir = os.path.join(uc_folder, "models")
    os.makedirs(models_dir, exist_ok=True)

    for model_name, (model, metrics) in models_dict.items():
        if model is not None:
            try:
                model_path = os.path.join(models_dir, f"{model_name}.pkl")
                joblib.dump(model, model_path)
                log.info(f"Saved {model_name} to {model_path}")
            except Exception as e:
                log.warning(f"Could not save {model_name}: {e}")


# ==============================================================================
# EVALUATION & BENCHMARKING
# ==============================================================================

def benchmark_models(models_dict, uc_key):
    """Rank models by performance and compute benchmark metrics."""
    if not models_dict:
        return {}

    benchmark = []

    for model_name, (model, metrics) in models_dict.items():
        entry = {
            'model_name': model_name,
            'training_time': metrics.get('training_time', 0),
            'inference_latency_ms': 0,  # Placeholder
            'model_size_kb': 0,  # Placeholder
        }

        # Add primary metric
        if 'accuracy' in metrics:
            entry['primary_metric'] = 'accuracy'
            entry['primary_value'] = metrics['accuracy']
        elif 'r2' in metrics:
            entry['primary_metric'] = 'r2'
            entry['primary_value'] = metrics['r2']
        elif 'rmse' in metrics:
            entry['primary_metric'] = 'rmse'
            entry['primary_value'] = -metrics['rmse']  # Negative for ranking
        elif 'silhouette_score' in metrics and metrics['silhouette_score']:
            entry['primary_metric'] = 'silhouette_score'
            entry['primary_value'] = metrics['silhouette_score']
        else:
            entry['primary_metric'] = 'none'
            entry['primary_value'] = 0

        # Model size
        try:
            if model is not None:
                import sys
                entry['model_size_kb'] = sys.getsizeof(pickle.dumps(model)) / 1024
        except Exception:
            pass

        benchmark.append(entry)

    # Rank by primary value (descending)
    benchmark.sort(key=lambda x: x['primary_value'], reverse=True)

    for i, entry in enumerate(benchmark):
        entry['rank'] = i + 1

    return {'benchmark': benchmark, 'best_model': benchmark[0]['model_name'] if benchmark else None}


def save_results(models_dict, benchmark, uc_key, config):
    """Save evaluation and benchmark results."""
    uc_folder = get_uc_folder(uc_key)
    if not uc_folder:
        return

    reports_dir = os.path.join(uc_folder, "reports")
    os.makedirs(reports_dir, exist_ok=True)

    # Model evaluation
    evaluation = {}
    for model_name, (model, metrics) in models_dict.items():
        evaluation[model_name] = metrics

    with open(os.path.join(reports_dir, "model_evaluation.json"), "w") as f:
        json.dump(evaluation, f, indent=2, default=str)

    # Benchmark
    with open(os.path.join(reports_dir, "benchmark.json"), "w") as f:
        json.dump(benchmark, f, indent=2, default=str)

    log.info(f"Saved results to {reports_dir}")


# ==============================================================================
# RESULTS DATABASE
# ==============================================================================

def init_results_db():
    """Initialize results database."""
    conn = sqlite3.connect(RESULTS_DB)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS model_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            use_case TEXT,
            model_name TEXT,
            ml_type TEXT,
            accuracy REAL,
            precision_score REAL,
            recall REAL,
            f1 REAL,
            auc_roc REAL,
            auc_pr REAL,
            mcc REAL,
            cohen_kappa REAL,
            rmse REAL,
            mae REAL,
            mape REAL,
            r2 REAL,
            adjusted_r2 REAL,
            smape REAL,
            directional_accuracy REAL,
            silhouette_score REAL,
            contamination_rate REAL,
            training_time REAL,
            timestamp TEXT
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS benchmarks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            use_case TEXT,
            model_name TEXT,
            rank INTEGER,
            primary_metric TEXT,
            primary_value REAL,
            training_time REAL,
            inference_latency_ms REAL,
            model_size_kb REAL,
            timestamp TEXT
        )
    """)

    conn.commit()
    return conn


def save_to_db(conn, uc_key, config, models_dict, benchmark):
    """Save results to database."""
    timestamp = datetime.now().isoformat()
    ml_type = config.get('ml_type')

    # Save model results
    for model_name, (model, metrics) in models_dict.items():
        conn.execute("""
            INSERT INTO model_results (
                use_case, model_name, ml_type, accuracy, precision_score, recall, f1,
                auc_roc, auc_pr, mcc, cohen_kappa, rmse, mae, mape, r2, adjusted_r2,
                smape, directional_accuracy, silhouette_score, contamination_rate,
                training_time, timestamp
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            uc_key, model_name, ml_type,
            metrics.get('accuracy'), metrics.get('precision'), metrics.get('recall'), metrics.get('f1'),
            metrics.get('auc_roc'), metrics.get('auc_pr'), metrics.get('mcc'), metrics.get('cohen_kappa'),
            metrics.get('rmse'), metrics.get('mae'), metrics.get('mape'), metrics.get('r2'), metrics.get('adjusted_r2'),
            metrics.get('smape'), metrics.get('directional_accuracy'),
            metrics.get('silhouette_score'), metrics.get('contamination_rate'),
            metrics.get('training_time'), timestamp
        ))

    # Save benchmarks
    for entry in benchmark.get('benchmark', []):
        conn.execute("""
            INSERT INTO benchmarks (
                use_case, model_name, rank, primary_metric, primary_value,
                training_time, inference_latency_ms, model_size_kb, timestamp
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            uc_key, entry['model_name'], entry['rank'], entry['primary_metric'], entry['primary_value'],
            entry['training_time'], entry['inference_latency_ms'], entry['model_size_kb'], timestamp
        ))

    conn.commit()


# ==============================================================================
# MAIN PIPELINE
# ==============================================================================

def run_pipeline(uc_key, config):
    """Run full pipeline for one use case."""
    log.info(f"{'='*80}")
    log.info(f"STARTING: {config['label']}")
    log.info(f"{'='*80}")

    start = time.time()

    # Load data
    df = load_data(uc_key, config)
    if df is None or len(df) < 10:
        log.error(f"Insufficient data for {uc_key}")
        return

    # Split data
    df_train, df_val, df_test = split_data(df, config, uc_key)
    if df_train is None:
        log.error(f"Data split failed for {uc_key}")
        return

    # Train models based on ml_type
    ml_type = config.get('ml_type')

    if ml_type == 'classification':
        models_dict = train_classification(df_train, df_val, config, uc_key)
    elif ml_type == 'regression':
        models_dict = train_regression(df_train, df_val, config, uc_key)
    elif ml_type == 'timeseries':
        models_dict = train_timeseries(df_train, df_val, config, uc_key)
    elif ml_type == 'nlp':
        models_dict = train_nlp(df_train, df_val, config, uc_key)
    elif ml_type == 'cv':
        models_dict = train_cv(uc_key, config)
    elif ml_type == 'anomaly':
        models_dict = train_anomaly(df_train, df_val, config, uc_key)
    elif ml_type == 'optimization':
        models_dict = train_optimization(df_train, config, uc_key)
    else:
        log.warning(f"Unknown ml_type: {ml_type}")
        models_dict = {}

    if not models_dict:
        log.warning(f"No models trained for {uc_key}")
        return

    # Benchmark
    benchmark = benchmark_models(models_dict, uc_key)

    # Save models
    save_models(models_dict, uc_key)

    # Save results
    save_results(models_dict, benchmark, uc_key, config)

    # Save to DB
    conn = init_results_db()
    save_to_db(conn, uc_key, config, models_dict, benchmark)
    conn.close()

    elapsed = time.time() - start
    log.info(f"COMPLETED: {config['label']} in {elapsed:.1f}s")
    log.info(f"Best model: {benchmark.get('best_model', 'N/A')}")
    log.info("")


# ==============================================================================
# MAIN
# ==============================================================================

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Banking ML Training Pipeline")
    parser.add_argument("--use-case", type=str, help="Run specific use case")
    parser.add_argument("--model-type", type=str, help="Filter by ML type")
    args = parser.parse_args()

    log.info("="*80)
    log.info("BANKING ML MODEL TRAINING PIPELINE")
    log.info(f"Started: {datetime.now().isoformat()}")
    log.info("="*80)

    # Filter use cases
    use_cases = USE_CASE_REGISTRY
    if args.use_case:
        if args.use_case in use_cases:
            use_cases = {args.use_case: use_cases[args.use_case]}
        else:
            log.error(f"Unknown use case: {args.use_case}")
            return

    if args.model_type:
        use_cases = {k: v for k, v in use_cases.items() if v.get('ml_type') == args.model_type}

    log.info(f"Processing {len(use_cases)} use cases")

    # Process each use case
    success_count = 0
    for uc_key, config in use_cases.items():
        try:
            run_pipeline(uc_key, config)
            success_count += 1
        except Exception as e:
            log.error(f"FAILED {uc_key}: {e}", exc_info=True)

    log.info("="*80)
    log.info(f"PIPELINE COMPLETE: {success_count}/{len(use_cases)} use cases processed")
    log.info(f"Finished: {datetime.now().isoformat()}")
    log.info("="*80)


if __name__ == "__main__":
    main()
