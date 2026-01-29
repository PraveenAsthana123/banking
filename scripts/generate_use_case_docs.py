#!/usr/bin/env python3
"""
Generate README documentation for all use cases
"""

import os
from pathlib import Path

# Use cases by department
USE_CASES = {
    "risk_management": [
        {"id": "credit_risk_scoring", "name": "Credit Risk Scoring", "accuracy": 94.2, "models": 3, "status": "Active",
         "description": "Predicts the likelihood of a borrower defaulting on a loan using historical data and behavioral patterns."},
        {"id": "market_risk_var", "name": "Market Risk VaR", "accuracy": 91.8, "models": 2, "status": "Active",
         "description": "Calculates Value at Risk (VaR) to measure potential losses in investment portfolios."},
        {"id": "operational_risk", "name": "Operational Risk Assessment", "accuracy": 88.5, "models": 1, "status": "Active",
         "description": "Identifies and quantifies operational risks including process failures, system issues, and human errors."},
        {"id": "liquidity_risk", "name": "Liquidity Risk Monitoring", "accuracy": 0, "models": 2, "status": "Training",
         "description": "Monitors and predicts liquidity positions to ensure adequate cash flow management."},
        {"id": "counterparty_risk", "name": "Counterparty Risk Analysis", "accuracy": 89.3, "models": 1, "status": "Active",
         "description": "Evaluates the risk of counterparty default in financial transactions and derivatives."},
        {"id": "concentration_risk", "name": "Concentration Risk", "accuracy": 0, "models": 0, "status": "Pending",
         "description": "Analyzes portfolio concentration to identify overexposure to specific sectors or entities."},
        {"id": "interest_rate_risk", "name": "Interest Rate Risk", "accuracy": 92.1, "models": 2, "status": "Active",
         "description": "Models sensitivity of portfolio values to changes in interest rates."},
        {"id": "currency_risk", "name": "Currency Risk Hedging", "accuracy": 90.4, "models": 1, "status": "Active",
         "description": "Predicts currency movements and optimizes hedging strategies for FX exposure."},
    ],
    "credit_analysis": [
        {"id": "loan_approval", "name": "Loan Approval Prediction", "accuracy": 95.1, "models": 4, "status": "Active",
         "description": "Automates loan approval decisions by predicting application outcomes based on applicant profiles."},
        {"id": "credit_limit", "name": "Credit Limit Optimization", "accuracy": 91.3, "models": 2, "status": "Active",
         "description": "Optimizes credit limits for customers based on risk profile and spending patterns."},
        {"id": "default_prediction", "name": "Default Prediction", "accuracy": 93.7, "models": 3, "status": "Active",
         "description": "Predicts probability of loan default within specified time horizons."},
        {"id": "early_warning", "name": "Early Warning System", "accuracy": 89.8, "models": 2, "status": "Active",
         "description": "Identifies early signs of financial distress in borrowers before default occurs."},
        {"id": "debt_collection", "name": "Debt Collection Priority", "accuracy": 0, "models": 1, "status": "Training",
         "description": "Prioritizes collection efforts based on recovery probability and customer value."},
        {"id": "credit_scoring", "name": "Alternative Credit Scoring", "accuracy": 87.6, "models": 2, "status": "Active",
         "description": "Uses alternative data sources to score thin-file or unbanked customers."},
        {"id": "mortgage_risk", "name": "Mortgage Risk Assessment", "accuracy": 92.4, "models": 2, "status": "Active",
         "description": "Evaluates mortgage applications for risk of default and property value changes."},
        {"id": "auto_loan", "name": "Auto Loan Underwriting", "accuracy": 90.2, "models": 1, "status": "Active",
         "description": "Automates underwriting decisions for auto loan applications."},
        {"id": "sme_lending", "name": "SME Lending Analysis", "accuracy": 0, "models": 0, "status": "Pending",
         "description": "Assesses creditworthiness of small and medium enterprises for lending decisions."},
    ],
    "fraud_detection": [
        {"id": "transaction_fraud", "name": "Transaction Fraud Detection", "accuracy": 97.3, "models": 5, "status": "Active",
         "description": "Real-time detection of fraudulent transactions using behavioral analysis and pattern recognition."},
        {"id": "card_fraud", "name": "Card Fraud Prevention", "accuracy": 96.8, "models": 3, "status": "Active",
         "description": "Prevents credit and debit card fraud through real-time transaction monitoring."},
        {"id": "identity_fraud", "name": "Identity Fraud Detection", "accuracy": 94.5, "models": 2, "status": "Active",
         "description": "Detects identity theft and synthetic identity fraud in account applications."},
        {"id": "application_fraud", "name": "Application Fraud Screening", "accuracy": 93.2, "models": 2, "status": "Active",
         "description": "Screens loan and account applications for fraudulent intent."},
        {"id": "aml_detection", "name": "AML Transaction Monitoring", "accuracy": 91.7, "models": 4, "status": "Active",
         "description": "Monitors transactions for money laundering patterns and suspicious activities."},
        {"id": "account_takeover", "name": "Account Takeover Prevention", "accuracy": 95.1, "models": 2, "status": "Active",
         "description": "Detects and prevents unauthorized access to customer accounts."},
        {"id": "synthetic_identity", "name": "Synthetic Identity Detection", "accuracy": 0, "models": 1, "status": "Training",
         "description": "Identifies synthetic identities created using real and fabricated information."},
        {"id": "insider_fraud", "name": "Insider Fraud Detection", "accuracy": 88.9, "models": 1, "status": "Active",
         "description": "Detects fraudulent activities by employees and internal actors."},
    ],
    "customer_analytics": [
        {"id": "churn_prediction", "name": "Churn Prediction", "accuracy": 91.4, "models": 3, "status": "Active",
         "description": "Predicts likelihood of customer attrition to enable proactive retention strategies."},
        {"id": "clv_prediction", "name": "Customer Lifetime Value", "accuracy": 88.7, "models": 2, "status": "Active",
         "description": "Estimates the total value a customer will bring over their relationship with the bank."},
        {"id": "segmentation", "name": "Customer Segmentation", "accuracy": 0, "models": 2, "status": "Active",
         "description": "Groups customers into segments based on behavior, value, and needs for targeted marketing."},
        {"id": "next_best_action", "name": "Next Best Action", "accuracy": 84.2, "models": 3, "status": "Active",
         "description": "Recommends the optimal next interaction or offer for each customer."},
        {"id": "product_recommendation", "name": "Product Recommendation", "accuracy": 86.5, "models": 4, "status": "Active",
         "description": "Suggests relevant banking products based on customer profile and behavior."},
        {"id": "cross_sell", "name": "Cross-Sell Propensity", "accuracy": 83.9, "models": 2, "status": "Active",
         "description": "Predicts likelihood of customers purchasing additional products."},
        {"id": "sentiment_analysis", "name": "Sentiment Analysis", "accuracy": 89.1, "models": 1, "status": "Active",
         "description": "Analyzes customer feedback and communications to gauge sentiment."},
        {"id": "customer_journey", "name": "Customer Journey Analytics", "accuracy": 0, "models": 1, "status": "Training",
         "description": "Maps and analyzes customer journeys across all touchpoints."},
        {"id": "attrition_risk", "name": "Attrition Risk Scoring", "accuracy": 90.3, "models": 2, "status": "Active",
         "description": "Scores customers based on risk of leaving for competitors."},
    ],
    "compliance": [
        {"id": "kyc_verification", "name": "KYC Verification", "accuracy": 96.2, "models": 3, "status": "Active",
         "description": "Automates Know Your Customer verification processes for onboarding."},
        {"id": "sanctions_screening", "name": "Sanctions Screening", "accuracy": 98.1, "models": 2, "status": "Active",
         "description": "Screens customers and transactions against global sanctions lists."},
        {"id": "pep_screening", "name": "PEP Screening", "accuracy": 95.4, "models": 1, "status": "Active",
         "description": "Identifies Politically Exposed Persons for enhanced due diligence."},
        {"id": "regulatory_reporting", "name": "Regulatory Reporting", "accuracy": 0, "models": 1, "status": "Active",
         "description": "Automates generation of regulatory reports and filings."},
        {"id": "document_verification", "name": "Document Verification", "accuracy": 94.7, "models": 2, "status": "Active",
         "description": "Verifies authenticity of identity documents using AI."},
        {"id": "adverse_media", "name": "Adverse Media Screening", "accuracy": 0, "models": 1, "status": "Training",
         "description": "Monitors news and media for negative information about customers."},
        {"id": "cdd_automation", "name": "CDD Automation", "accuracy": 91.3, "models": 2, "status": "Active",
         "description": "Automates Customer Due Diligence processes for risk assessment."},
        {"id": "fair_lending", "name": "Fair Lending Analysis", "accuracy": 0, "models": 1, "status": "Active",
         "description": "Analyzes lending decisions for bias and fair lending compliance."},
    ],
    "treasury": [
        {"id": "cash_forecasting", "name": "Cash Flow Forecasting", "accuracy": 89.4, "models": 3, "status": "Active",
         "description": "Predicts future cash flows for liquidity planning and management."},
        {"id": "liquidity_management", "name": "Liquidity Management", "accuracy": 87.2, "models": 2, "status": "Active",
         "description": "Optimizes liquidity positions across accounts and currencies."},
        {"id": "fx_prediction", "name": "FX Rate Prediction", "accuracy": 76.8, "models": 2, "status": "Active",
         "description": "Forecasts foreign exchange rate movements for trading and hedging."},
        {"id": "interest_optimization", "name": "Interest Rate Optimization", "accuracy": 82.1, "models": 1, "status": "Active",
         "description": "Optimizes interest rate exposure and pricing strategies."},
        {"id": "investment_allocation", "name": "Investment Allocation", "accuracy": 0, "models": 2, "status": "Training",
         "description": "Recommends optimal allocation of investment portfolios."},
        {"id": "hedge_optimization", "name": "Hedge Optimization", "accuracy": 84.5, "models": 1, "status": "Active",
         "description": "Optimizes hedging strategies to minimize risk exposure."},
        {"id": "collateral_management", "name": "Collateral Management", "accuracy": 0, "models": 0, "status": "Pending",
         "description": "Manages collateral requirements and optimization across transactions."},
    ],
    "retail_banking": [
        {"id": "deposit_prediction", "name": "Deposit Prediction", "accuracy": 85.3, "models": 2, "status": "Active",
         "description": "Forecasts deposit volumes and customer deposit behavior."},
        {"id": "branch_optimization", "name": "Branch Optimization", "accuracy": 0, "models": 1, "status": "Active",
         "description": "Optimizes branch network, staffing, and resource allocation."},
        {"id": "atm_cash_optimization", "name": "ATM Cash Optimization", "accuracy": 91.2, "models": 2, "status": "Active",
         "description": "Predicts ATM cash demand to optimize replenishment schedules."},
        {"id": "queue_management", "name": "Queue Management", "accuracy": 87.6, "models": 1, "status": "Active",
         "description": "Predicts branch traffic and optimizes queue management."},
        {"id": "pricing_optimization", "name": "Pricing Optimization", "accuracy": 83.4, "models": 2, "status": "Active",
         "description": "Optimizes pricing for retail banking products and services."},
        {"id": "channel_preference", "name": "Channel Preference", "accuracy": 0, "models": 1, "status": "Training",
         "description": "Predicts customer channel preferences for personalized engagement."},
        {"id": "account_opening", "name": "Account Opening Prediction", "accuracy": 88.9, "models": 1, "status": "Active",
         "description": "Predicts likelihood of customers opening new accounts."},
    ],
    "investment_banking": [
        {"id": "portfolio_optimization", "name": "Portfolio Optimization", "accuracy": 84.7, "models": 3, "status": "Active",
         "description": "Optimizes investment portfolios for risk-adjusted returns."},
        {"id": "stock_prediction", "name": "Stock Price Prediction", "accuracy": 72.3, "models": 4, "status": "Active",
         "description": "Predicts stock price movements using technical and fundamental analysis."},
        {"id": "sentiment_trading", "name": "Sentiment-Based Trading", "accuracy": 68.9, "models": 2, "status": "Active",
         "description": "Generates trading signals based on market sentiment analysis."},
        {"id": "risk_parity", "name": "Risk Parity Analysis", "accuracy": 86.2, "models": 1, "status": "Active",
         "description": "Implements risk parity strategies for portfolio construction."},
        {"id": "factor_investing", "name": "Factor Investing Models", "accuracy": 0, "models": 2, "status": "Training",
         "description": "Identifies and exploits factor premiums in investment strategies."},
        {"id": "market_making", "name": "Market Making Strategy", "accuracy": 79.4, "models": 2, "status": "Active",
         "description": "Optimizes market making strategies and pricing."},
        {"id": "ipo_pricing", "name": "IPO Pricing Analysis", "accuracy": 0, "models": 0, "status": "Pending",
         "description": "Analyzes and recommends IPO pricing based on market conditions."},
        {"id": "ma_valuation", "name": "M&A Valuation", "accuracy": 81.5, "models": 1, "status": "Active",
         "description": "Values companies for mergers and acquisitions analysis."},
    ],
}

TEMPLATE = '''# {name}

## Overview
| Attribute | Value |
|-----------|-------|
| **Use Case ID** | {use_case_id} |
| **Department** | {department} |
| **Status** | {status} |
| **Models Deployed** | {models} |
| **Current Accuracy** | {accuracy} |

## Description
{description}

## Business Objectives
- Improve decision-making accuracy
- Reduce manual processing time
- Ensure regulatory compliance
- Optimize operational efficiency
- Enable real-time insights

## Input Data

### Data Sources
| Source | Type | Frequency | Volume |
|--------|------|-----------|--------|
| Core Banking System | Database | Real-time | Variable |
| External Data | API | Real-time | Variable |
| Batch Files | File Upload | Daily | Variable |
| Historical Data | Database | Daily | Variable |

### Input Features
| Feature | Type | Description |
|---------|------|-------------|
| primary_id | String | Primary identifier |
| timestamp | DateTime | Event timestamp |
| numeric_features | Float | Numerical inputs |
| categorical_features | String | Categorical inputs |
| derived_features | Float | Calculated features |

### Data Quality Requirements
- Missing values: < 5% per feature
- Data freshness: < 24 hours
- Minimum records: 100 per batch

## Processing

### Pipeline Steps
1. **Data Ingestion** - Load data from sources
2. **Data Validation** - Schema and quality checks
3. **Feature Engineering** - Create derived features
4. **Preprocessing** - Handle missing values, encoding
5. **Model Inference** - Generate predictions
6. **Post-processing** - Apply business rules
7. **Output Generation** - Format and store results

### Model Architecture
| Component | Technology |
|-----------|------------|
| Algorithm | Ensemble Methods |
| Framework | scikit-learn / XGBoost |
| Feature Count | Variable |
| Training Data | Historical records |
| Validation | Cross-validation |

### Processing Parameters
```python
{{
    "batch_size": 1000,
    "threshold": 0.5,
    "max_workers": 4,
    "timeout_seconds": 300,
    "retry_attempts": 3
}}
```

## Output

### Output Schema
| Field | Type | Description |
|-------|------|-------------|
| record_id | String | Record identifier |
| prediction | Float | Model prediction |
| confidence | Float | Prediction confidence |
| category | String | Classification category |
| factors | Array | Contributing factors |
| recommendation | String | Action recommendation |

### Output Destinations
- Database: Results table
- API: Real-time endpoint
- File: Batch export (CSV/Parquet)
- Dashboard: Visualization

## Visualization

### Available Charts
1. **Distribution Chart** - Score/prediction distribution
2. **Trend Analysis** - Time series trends
3. **Feature Importance** - Top contributing features
4. **Performance Metrics** - Model performance over time
5. **Confusion Matrix** - Classification results

### Key Metrics Dashboard
- Total Records Processed
- Prediction Distribution
- Model Accuracy
- Processing Time
- Alert Count

## Transaction History

### Logging
All transactions are logged with:
- Transaction ID
- Timestamp
- Input/Output record counts
- Processing duration
- Status and errors

### Retention Policy
- Real-time logs: 7 days
- Daily summaries: 90 days
- Monthly reports: 7 years
- Audit logs: 10 years

## Governance

### Model Governance Scores
| Metric | Score | Status |
|--------|-------|--------|
| Explainability | 85-95 | Good-Excellent |
| Fairness | 80-90 | Good |
| Robustness | 85-95 | Good-Excellent |
| Privacy | 85-95 | Good-Excellent |

### Compliance
- Regulatory requirements met
- Documentation complete
- Audit trail maintained

### Monitoring
- Daily accuracy monitoring
- Weekly drift detection
- Monthly model review

## API Reference

### Endpoint
```
POST /api/v1/{dept_lower}/{use_case_id}
```

### Request Example
```json
{{
    "record_id": "R12345",
    "features": {{}}
}}
```

### Response Example
```json
{{
    "record_id": "R12345",
    "prediction": 0.85,
    "confidence": 0.92,
    "recommendation": "ACTION"
}}
```

## Dependencies

### Upstream
- Data preprocessing pipeline
- Feature store
- External data integrations

### Downstream
- Business workflows
- Reporting dashboards
- Regulatory systems

## Contact

| Role | Name | Email |
|------|------|-------|
| Product Owner | TBD | - |
| ML Engineer | TBD | - |
| Data Steward | TBD | - |

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-01 | Initial release |
'''

def generate_readme(dept_name: str, dept_key: str, use_case: dict) -> str:
    """Generate README content for a use case."""
    dept_title = dept_name.replace("_", " ").title()
    accuracy_str = f"{use_case['accuracy']}%" if use_case['accuracy'] > 0 else "N/A"

    uc_num = USE_CASES[dept_key].index(use_case) + 1
    dept_prefix = dept_key[:4].upper()
    use_case_id = f"UC-{dept_prefix}-{uc_num:03d}"

    return TEMPLATE.format(
        name=use_case['name'],
        use_case_id=use_case_id,
        department=dept_title,
        status=use_case['status'],
        models=use_case['models'],
        accuracy=accuracy_str,
        description=use_case['description'],
        dept_lower=dept_key.replace("_", "-")
    )

def main():
    base_path = Path("/mnt/deepa/Banking/docs/use_cases")

    for dept_key, use_cases in USE_CASES.items():
        dept_path = base_path / dept_key
        dept_path.mkdir(parents=True, exist_ok=True)

        for uc in use_cases:
            readme_content = generate_readme(dept_key, dept_key, uc)
            readme_path = dept_path / f"{uc['id']}.md"

            # Skip if already exists (like credit_risk_scoring)
            if readme_path.exists():
                print(f"Skipping {readme_path} (already exists)")
                continue

            readme_path.write_text(readme_content)
            print(f"Created {readme_path}")

    print(f"\\nGenerated READMEs for {sum(len(ucs) for ucs in USE_CASES.values())} use cases")

if __name__ == "__main__":
    main()
