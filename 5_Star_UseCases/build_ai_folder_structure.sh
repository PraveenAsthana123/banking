#!/usr/bin/env bash
# Build the Enterprise AI Type folder hierarchy with symlinks to actual data
set -euo pipefail

BASE="/mnt/deepa/Banking/5_Star_UseCases"
AI_ROOT="$BASE/AI_Use_Cases"

# Clean previous structure
rm -rf "$AI_ROOT"

# =============================================
# 1. BUSINESS AI (Strategy & Direction)
# =============================================
BIZ="$AI_ROOT/1_Business_AI"

mkdir -p "$BIZ/ESG_Climate_Risk/UC-26-02_Climate_Stress_Simulation/DL"
ln -sfn "$BASE/F_ESG_Regulatory_and_Strategic/26_ESG_Reporting_and_Disclosure/data/UC-26-02" "$BIZ/ESG_Climate_Risk/UC-26-02_Climate_Stress_Simulation/DL/data"

mkdir -p "$BIZ/Strategy_Board_Office/UC-31-01_Portfolio_Optimization/ML"
ln -sfn "$BASE/G_Executive_and_Enterprise_Decisioning/31_Strategy_and_Board_Office/data/UC-31-01" "$BIZ/Strategy_Board_Office/UC-31-01_Portfolio_Optimization/ML/data"

mkdir -p "$BIZ/Strategy_Board_Office/UC-31-02_Scenario_Simulation/DL"
ln -sfn "$BASE/G_Executive_and_Enterprise_Decisioning/31_Strategy_and_Board_Office/data/UC-31-02" "$BIZ/Strategy_Board_Office/UC-31-02_Scenario_Simulation/DL/data"

mkdir -p "$BIZ/Treasury_Finance/UC-32-02_Macro_Stress_Testing/DL"
ln -sfn "$BASE/G_Executive_and_Enterprise_Decisioning/32_Treasury/data/UC-32-02" "$BIZ/Treasury_Finance/UC-32-02_Macro_Stress_Testing/DL/data"

mkdir -p "$BIZ/Transformation_Office/UC-35-01_Transformation_Portfolio/ML"
ln -sfn "$BASE/G_Executive_and_Enterprise_Decisioning/35_Transformation_Office/data" "$BIZ/Transformation_Office/UC-35-01_Transformation_Portfolio/ML/data"

# =============================================
# 2. DECISION INTELLIGENCE AI
# =============================================
DEC="$AI_ROOT/2_Decision_Intelligence_AI"

mkdir -p "$DEC/Dispute_Chargeback/UC-15-01_Dispute_Classification/ML"
ln -sfn "$BASE/C_Operations_and_Cost_Optimization/15_Dispute_and_Chargeback_Operations/data/UC-15-01" "$DEC/Dispute_Chargeback/UC-15-01_Dispute_Classification/ML/data"

mkdir -p "$DEC/Finance_FPA/UC-33-01_Capital_Allocation/ML"
ln -sfn "$BASE/G_Executive_and_Enterprise_Decisioning/33_Finance_FPA/data/UC-33-01" "$DEC/Finance_FPA/UC-33-01_Capital_Allocation/ML/data"

# =============================================
# 3. ANALYTIC AI (Predict, Score, Explain)
# =============================================
ANA="$AI_ROOT/3_Analytic_AI"

# Fraud Management
mkdir -p "$ANA/Fraud_Management/UC-06-01_Credit_Card_Fraud_Scoring/ML"
ln -sfn "$BASE/B_Risk_Fraud_and_Financial_Crime/06_Fraud_Management/data/UC-06-01" "$ANA/Fraud_Management/UC-06-01_Credit_Card_Fraud_Scoring/ML/data"

mkdir -p "$ANA/Fraud_Management/UC-06-02_Sequential_Fraud_Detection/DL"
ln -sfn "$BASE/B_Risk_Fraud_and_Financial_Crime/06_Fraud_Management/data/UC-06-02" "$ANA/Fraud_Management/UC-06-02_Sequential_Fraud_Detection/DL/data"

mkdir -p "$ANA/Fraud_Management/UC-06-03_Fraud_Complaints_Text/NLP"
ln -sfn "$BASE/B_Risk_Fraud_and_Financial_Crime/06_Fraud_Management/data/UC-06-03" "$ANA/Fraud_Management/UC-06-03_Fraud_Complaints_Text/NLP/data"

mkdir -p "$ANA/Fraud_Management/UC-06-04_RBA_Auth_Analysis/NLP"
ln -sfn "$BASE/B_Risk_Fraud_and_Financial_Crime/06_Fraud_Management/data/UC-06-04" "$ANA/Fraud_Management/UC-06-04_RBA_Auth_Analysis/NLP/data"

# Credit Risk & Lending
mkdir -p "$ANA/Credit_Risk_Lending/UC-07-01_Credit_Scoring_PD/ML"
ln -sfn "$BASE/B_Risk_Fraud_and_Financial_Crime/07_Credit_Risk_Management/data/UC-07-01" "$ANA/Credit_Risk_Lending/UC-07-01_Credit_Scoring_PD/ML/data"

mkdir -p "$ANA/Credit_Risk_Lending/UC-07-02_Lending_Club_Scoring/ML"
ln -sfn "$BASE/B_Risk_Fraud_and_Financial_Crime/07_Credit_Risk_Management/data/UC-07-02" "$ANA/Credit_Risk_Lending/UC-07-02_Lending_Club_Scoring/ML/data"

mkdir -p "$ANA/Credit_Risk_Lending/UC-07-03_Alternative_Data_Credit/DL"
ln -sfn "$BASE/B_Risk_Fraud_and_Financial_Crime/07_Credit_Risk_Management/data/UC-07-03" "$ANA/Credit_Risk_Lending/UC-07-03_Alternative_Data_Credit/DL/data"

mkdir -p "$ANA/Credit_Risk_Lending/UC-07-04_Financial_Statement_Parsing/NLP"
ln -sfn "$BASE/B_Risk_Fraud_and_Financial_Crime/07_Credit_Risk_Management/data/UC-07-04" "$ANA/Credit_Risk_Lending/UC-07-04_Financial_Statement_Parsing/NLP/data"

# AML / Financial Crime
mkdir -p "$ANA/AML_Financial_Crime/UC-08-01_AML_Alert_Prioritization/ML"
ln -sfn "$BASE/B_Risk_Fraud_and_Financial_Crime/08_AML_Financial_Crime/data/UC-08-01" "$ANA/AML_Financial_Crime/UC-08-01_AML_Alert_Prioritization/ML/data"

mkdir -p "$ANA/AML_Financial_Crime/UC-08-02_Graph_Laundering_Detection/DL"
ln -sfn "$BASE/B_Risk_Fraud_and_Financial_Crime/08_AML_Financial_Crime/data/UC-08-02" "$ANA/AML_Financial_Crime/UC-08-02_Graph_Laundering_Detection/DL/data"

# Collections & Recovery
mkdir -p "$ANA/Collections_Recovery/UC-09-01_Delinquency_Prediction/ML"
ln -sfn "$BASE/B_Risk_Fraud_and_Financial_Crime/09_Collections_and_Recovery/data/UC-09-01" "$ANA/Collections_Recovery/UC-09-01_Delinquency_Prediction/ML/data"

mkdir -p "$ANA/Collections_Recovery/UC-09-02_Default_Progression/DL"
ln -sfn "$BASE/B_Risk_Fraud_and_Financial_Crime/09_Collections_and_Recovery/data/UC-09-02" "$ANA/Collections_Recovery/UC-09-02_Default_Progression/DL/data"

mkdir -p "$ANA/Collections_Recovery/UC-09-03_Communication_Analysis/NLP"
ln -sfn "$BASE/B_Risk_Fraud_and_Financial_Crime/09_Collections_and_Recovery/data/UC-09-03" "$ANA/Collections_Recovery/UC-09-03_Communication_Analysis/NLP/data"

# Branch Operations
mkdir -p "$ANA/Branch_Operations/UC-11-03_Transaction_Analysis/ML"
ln -sfn "$BASE/C_Operations_and_Cost_Optimization/11_Branch_Operations/data/UC-11-03" "$ANA/Branch_Operations/UC-11-03_Transaction_Analysis/ML/data"

# Contact Center
mkdir -p "$ANA/Contact_Center/UC-12-01_Intent_Classification/ML"
ln -sfn "$BASE/C_Operations_and_Cost_Optimization/12_Contact_Center_Operations/data/UC-12-01" "$ANA/Contact_Center/UC-12-01_Intent_Classification/ML/data"

mkdir -p "$ANA/Contact_Center/UC-12-02_Sentiment_Analysis/NLP"
ln -sfn "$BASE/C_Operations_and_Cost_Optimization/12_Contact_Center_Operations/data/UC-12-02" "$ANA/Contact_Center/UC-12-02_Sentiment_Analysis/NLP/data"

mkdir -p "$ANA/Contact_Center/UC-12-03_Speech_To_Text/DL"
ln -sfn "$BASE/C_Operations_and_Cost_Optimization/12_Contact_Center_Operations/data/UC-12-03" "$ANA/Contact_Center/UC-12-03_Speech_To_Text/DL/data"

# Workforce
mkdir -p "$ANA/Workforce_Management/UC-14-03_Resume_Screening/NLP"
ln -sfn "$BASE/C_Operations_and_Cost_Optimization/14_Workforce_Management/data/UC-14-03" "$ANA/Workforce_Management/UC-14-03_Resume_Screening/NLP/data"

# IT Ops
mkdir -p "$ANA/IT_Operations/UC-21-03_Log_Analytics/NLP"
ln -sfn "$BASE/E_Technology_IT_and_Resilience/21_IT_Operations_AIOps/data/UC-21-03" "$ANA/IT_Operations/UC-21-03_Log_Analytics/NLP/data"

# ESG
mkdir -p "$ANA/ESG_Climate_Risk/UC-26-01_ESG_Scoring/ML"
ln -sfn "$BASE/F_ESG_Regulatory_and_Strategic/26_ESG_Reporting_and_Disclosure/data/UC-26-01" "$ANA/ESG_Climate_Risk/UC-26-01_ESG_Scoring/ML/data"

mkdir -p "$ANA/ESG_Climate_Risk/UC-26-03_ESG_Disclosure_Parsing/NLP"
ln -sfn "$BASE/F_ESG_Regulatory_and_Strategic/26_ESG_Reporting_and_Disclosure/data/UC-26-03" "$ANA/ESG_Climate_Risk/UC-26-03_ESG_Disclosure_Parsing/NLP/data"

mkdir -p "$ANA/ESG_Climate_Risk/UC-27-01_Climate_Risk_Modeling/DL"
ln -sfn "$BASE/F_ESG_Regulatory_and_Strategic/27_Climate_Risk_Management/data/UC-27-01" "$ANA/ESG_Climate_Risk/UC-27-01_Climate_Risk_Modeling/DL/data"

# Strategy
mkdir -p "$ANA/Strategy_Board_Office/UC-31-03_Strategy_Document_Analysis/NLP"
ln -sfn "$BASE/G_Executive_and_Enterprise_Decisioning/31_Strategy_and_Board_Office/data/UC-31-03" "$ANA/Strategy_Board_Office/UC-31-03_Strategy_Document_Analysis/NLP/data"

# Treasury
mkdir -p "$ANA/Treasury_Finance/UC-32-01_Liquidity_Forecasting/ML"
ln -sfn "$BASE/G_Executive_and_Enterprise_Decisioning/32_Treasury/data/UC-32-01" "$ANA/Treasury_Finance/UC-32-01_Liquidity_Forecasting/ML/data"

mkdir -p "$ANA/Treasury_Finance/UC-32-03_Financial_Report_Analysis/NLP"
ln -sfn "$BASE/G_Executive_and_Enterprise_Decisioning/32_Treasury/data/UC-32-03" "$ANA/Treasury_Finance/UC-32-03_Financial_Report_Analysis/NLP/data"

# Enterprise Risk
mkdir -p "$ANA/Enterprise_Risk/UC-34-01_Enterprise_Risk_Scoring/ML"
ln -sfn "$BASE/G_Executive_and_Enterprise_Decisioning/34_Enterprise_Risk_Management/data/UC-34-01" "$ANA/Enterprise_Risk/UC-34-01_Enterprise_Risk_Scoring/ML/data"

mkdir -p "$ANA/Enterprise_Risk/UC-34-02_Stress_Testing_MonteCarlo/DL"
ln -sfn "$BASE/G_Executive_and_Enterprise_Decisioning/34_Enterprise_Risk_Management/data/UC-34-02" "$ANA/Enterprise_Risk/UC-34-02_Stress_Testing_MonteCarlo/DL/data"

mkdir -p "$ANA/Enterprise_Risk/UC-34-03_Risk_Report_Summarization/NLP"
ln -sfn "$BASE/G_Executive_and_Enterprise_Decisioning/34_Enterprise_Risk_Management/data/UC-34-03" "$ANA/Enterprise_Risk/UC-34-03_Risk_Report_Summarization/NLP/data"

# =============================================
# 4. TRANSACTIONAL / ASSISTIVE AI (Copilots)
# =============================================
TXN="$AI_ROOT/4_Transactional_Assistive_AI"

mkdir -p "$TXN/Fraud_Management/UC-06-05_Fraud_Investigation_Copilot/RAG"
ln -sfn "$BASE/B_Risk_Fraud_and_Financial_Crime/06_Fraud_Management/data/UC-06-05" "$TXN/Fraud_Management/UC-06-05_Fraud_Investigation_Copilot/RAG/data"

mkdir -p "$TXN/Credit_Risk_Lending/UC-07-05_Underwriter_Assist/RAG"
ln -sfn "$BASE/B_Risk_Fraud_and_Financial_Crime/07_Credit_Risk_Management/data/UC-07-05" "$TXN/Credit_Risk_Lending/UC-07-05_Underwriter_Assist/RAG/data"

mkdir -p "$TXN/AML_Financial_Crime/UC-08-03_SAR_Drafting_Assistant/NLP"
ln -sfn "$BASE/B_Risk_Fraud_and_Financial_Crime/08_AML_Financial_Crime/data/UC-08-03" "$TXN/AML_Financial_Crime/UC-08-03_SAR_Drafting_Assistant/NLP/data"

mkdir -p "$TXN/AML_Financial_Crime/UC-08-04_AML_Investigator_Copilot/RAG"
ln -sfn "$BASE/B_Risk_Fraud_and_Financial_Crime/08_AML_Financial_Crime/data/UC-08-04" "$TXN/AML_Financial_Crime/UC-08-04_AML_Investigator_Copilot/RAG/data"

mkdir -p "$TXN/Collections_Recovery/UC-09-04_Collections_Agent_Assist/RAG"
ln -sfn "$BASE/B_Risk_Fraud_and_Financial_Crime/09_Collections_and_Recovery/data/UC-09-04" "$TXN/Collections_Recovery/UC-09-04_Collections_Agent_Assist/RAG/data"

mkdir -p "$TXN/Branch_Operations/UC-11-05_Branch_Staff_Assistant/RAG"
ln -sfn "$BASE/C_Operations_and_Cost_Optimization/11_Branch_Operations/data/UC-11-05" "$TXN/Branch_Operations/UC-11-05_Branch_Staff_Assistant/RAG/data"

mkdir -p "$TXN/Contact_Center/UC-12-04_Agent_Assist_KB/RAG"
ln -sfn "$BASE/C_Operations_and_Cost_Optimization/12_Contact_Center_Operations/data/UC-12-04" "$TXN/Contact_Center/UC-12-04_Agent_Assist_KB/RAG/data"

mkdir -p "$TXN/ATM_Cash_Operations/UC-13-04_ATM_Troubleshoot_Assistant/RAG"
ln -sfn "$BASE/C_Operations_and_Cost_Optimization/13_ATM_and_Cash_Operations/data/UC-13-04" "$TXN/ATM_Cash_Operations/UC-13-04_ATM_Troubleshoot_Assistant/RAG/data"

mkdir -p "$TXN/Workforce_Management/UC-14-04_HR_Policy_Assistant/RAG"
ln -sfn "$BASE/C_Operations_and_Cost_Optimization/14_Workforce_Management/data/UC-14-04" "$TXN/Workforce_Management/UC-14-04_HR_Policy_Assistant/RAG/data"

mkdir -p "$TXN/IT_Operations/UC-21-04_IT_Ops_Runbook_Assistant/RAG"
ln -sfn "$BASE/E_Technology_IT_and_Resilience/21_IT_Operations_AIOps/data/UC-21-04" "$TXN/IT_Operations/UC-21-04_IT_Ops_Runbook_Assistant/RAG/data"

mkdir -p "$TXN/ESG_Climate_Risk/UC-26-04_ESG_Reporting_Copilot/RAG"
ln -sfn "$BASE/F_ESG_Regulatory_and_Strategic/26_ESG_Reporting_and_Disclosure/data/UC-26-04" "$TXN/ESG_Climate_Risk/UC-26-04_ESG_Reporting_Copilot/RAG/data"

mkdir -p "$TXN/Strategy_Board_Office/UC-31-04_Board_Strategy_Copilot/RAG"
ln -sfn "$BASE/G_Executive_and_Enterprise_Decisioning/31_Strategy_and_Board_Office/data/UC-31-04" "$TXN/Strategy_Board_Office/UC-31-04_Board_Strategy_Copilot/RAG/data"

mkdir -p "$TXN/Treasury_Finance/UC-32-04_Finance_Policy_Copilot/RAG"
ln -sfn "$BASE/G_Executive_and_Enterprise_Decisioning/32_Treasury/data/UC-32-04" "$TXN/Treasury_Finance/UC-32-04_Finance_Policy_Copilot/RAG/data"

mkdir -p "$TXN/Enterprise_Risk/UC-34-04_Risk_Policy_QA_Assistant/RAG"
ln -sfn "$BASE/G_Executive_and_Enterprise_Decisioning/34_Enterprise_Risk_Management/data/UC-34-04" "$TXN/Enterprise_Risk/UC-34-04_Risk_Policy_QA_Assistant/RAG/data"

# =============================================
# 5. OPERATIONAL AI (Efficiency)
# =============================================
OPS="$AI_ROOT/5_Operational_AI"

mkdir -p "$OPS/Branch_Operations/UC-11-01_Branch_Demand_Forecasting/ML"
ln -sfn "$BASE/C_Operations_and_Cost_Optimization/11_Branch_Operations/data/UC-11-01" "$OPS/Branch_Operations/UC-11-01_Branch_Demand_Forecasting/ML/data"

mkdir -p "$OPS/Branch_Operations/UC-11-02_Footfall_Prediction/DL"
ln -sfn "$BASE/C_Operations_and_Cost_Optimization/11_Branch_Operations/data/UC-11-02" "$OPS/Branch_Operations/UC-11-02_Footfall_Prediction/DL/data"

mkdir -p "$OPS/Branch_Operations/UC-11-04_Queue_Monitoring/CV"
ln -sfn "$BASE/C_Operations_and_Cost_Optimization/11_Branch_Operations/data/UC-11-04" "$OPS/Branch_Operations/UC-11-04_Queue_Monitoring/CV/data"

mkdir -p "$OPS/ATM_Cash_Operations/UC-13-01_Cash_Demand_Forecasting/ML"
ln -sfn "$BASE/C_Operations_and_Cost_Optimization/13_ATM_and_Cash_Operations/data/UC-13-01" "$OPS/ATM_Cash_Operations/UC-13-01_Cash_Demand_Forecasting/ML/data"

mkdir -p "$OPS/ATM_Cash_Operations/UC-13-02_Cash_Optimization/DL"
ln -sfn "$BASE/C_Operations_and_Cost_Optimization/13_ATM_and_Cash_Operations/data/UC-13-02" "$OPS/ATM_Cash_Operations/UC-13-02_Cash_Optimization/DL/data"

mkdir -p "$OPS/ATM_Cash_Operations/UC-13-03_ATM_Camera_Security/CV"
ln -sfn "$BASE/C_Operations_and_Cost_Optimization/13_ATM_and_Cash_Operations/data/UC-13-03" "$OPS/ATM_Cash_Operations/UC-13-03_ATM_Camera_Security/CV/data"

mkdir -p "$OPS/Workforce_Management/UC-14-01_Attrition_Prediction/ML"
ln -sfn "$BASE/C_Operations_and_Cost_Optimization/14_Workforce_Management/data/UC-14-01" "$OPS/Workforce_Management/UC-14-01_Attrition_Prediction/ML/data"

mkdir -p "$OPS/Workforce_Management/UC-14-02_Workforce_Demand_Forecast/DL"
ln -sfn "$BASE/C_Operations_and_Cost_Optimization/14_Workforce_Management/data/UC-14-02" "$OPS/Workforce_Management/UC-14-02_Workforce_Demand_Forecast/DL/data"

mkdir -p "$OPS/IT_Operations/UC-21-01_Incident_Prediction/ML"
ln -sfn "$BASE/E_Technology_IT_and_Resilience/21_IT_Operations_AIOps/data/UC-21-01" "$OPS/IT_Operations/UC-21-01_Incident_Prediction/ML/data"

mkdir -p "$OPS/IT_Operations/UC-21-02_Root_Cause_Analysis/DL"
ln -sfn "$BASE/E_Technology_IT_and_Resilience/21_IT_Operations_AIOps/data/UC-21-02" "$OPS/IT_Operations/UC-21-02_Root_Cause_Analysis/DL/data"

mkdir -p "$OPS/Cybersecurity/UC-23-01_Threat_Detection/ML"
ln -sfn "$BASE/E_Technology_IT_and_Resilience/23_Cybersecurity/data/UC-23-01" "$OPS/Cybersecurity/UC-23-01_Threat_Detection/ML/data"

# =============================================
# 6. AUTONOMOUS AI (Restricted)
# =============================================
mkdir -p "$AI_ROOT/6_Autonomous_AI/_RESTRICTED_no_use_cases_yet"

# =============================================
# 7. GOVERNANCE & CONTROL AI (Mandatory Overlay)
# =============================================
GOV="$AI_ROOT/7_Governance_Control_AI"

mkdir -p "$GOV/Model_Risk_Management/UC-10-01_Model_Validation/ML"
ln -sfn "$BASE/B_Risk_Fraud_and_Financial_Crime/10_Model_Risk_Management/data" "$GOV/Model_Risk_Management/UC-10-01_Model_Validation/ML/data"

mkdir -p "$GOV/Data_Governance/UC-16-01_Data_Quality_Anomaly/ML"
ln -sfn "$BASE/D_Data_Governance_and_Platform/16_Data_Governance_and_Quality/data/UC-16-01" "$GOV/Data_Governance/UC-16-01_Data_Quality_Anomaly/ML/data"

mkdir -p "$GOV/Data_Governance/UC-16-02_Drift_Bias_Detection/DL"
ln -sfn "$BASE/D_Data_Governance_and_Platform/16_Data_Governance_and_Quality/data/UC-16-02" "$GOV/Data_Governance/UC-16-02_Drift_Bias_Detection/DL/data"

mkdir -p "$GOV/Data_Governance/UC-16-03_Data_Fairness_Analysis/ML"
ln -sfn "$BASE/D_Data_Governance_and_Platform/16_Data_Governance_and_Quality/data/UC-16-03" "$GOV/Data_Governance/UC-16-03_Data_Fairness_Analysis/ML/data"

mkdir -p "$GOV/Data_Governance/UC-16-04_Policy_Classification/NLP"
ln -sfn "$BASE/D_Data_Governance_and_Platform/16_Data_Governance_and_Quality/data/UC-16-04" "$GOV/Data_Governance/UC-16-04_Policy_Classification/NLP/data"

mkdir -p "$GOV/Data_Governance/UC-16-05_Governance_Audit_Copilot/RAG"
ln -sfn "$BASE/D_Data_Governance_and_Platform/16_Data_Governance_and_Quality/data/UC-16-05" "$GOV/Data_Governance/UC-16-05_Governance_Audit_Copilot/RAG/data"

mkdir -p "$GOV/Responsible_AI/UC-18-01_Fairness_Explainability/ML"
ln -sfn "$BASE/D_Data_Governance_and_Platform/18_Responsible_AI_Governance/data/UC-18-01" "$GOV/Responsible_AI/UC-18-01_Fairness_Explainability/ML/data"

echo "=== AI_Use_Cases folder structure built ==="
echo ""
echo "Hierarchy:"
find "$AI_ROOT" -maxdepth 1 -type d | sort
echo ""
echo "Total symlinks:"
find "$AI_ROOT" -type l | wc -l
