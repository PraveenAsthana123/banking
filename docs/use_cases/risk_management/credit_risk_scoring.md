# Credit Risk Scoring

## Overview
| Attribute | Value |
|-----------|-------|
| **Use Case ID** | UC-RISK-001 |
| **Department** | Risk Management |
| **Status** | Active |
| **Models Deployed** | 3 |
| **Current Accuracy** | 94.2% |

## Description
Credit Risk Scoring predicts the likelihood of a borrower defaulting on a loan. This model evaluates creditworthiness using historical data, financial metrics, and behavioral patterns to assign risk scores to loan applicants.

## Business Objectives
- Minimize loan default rates
- Optimize credit portfolio performance
- Ensure regulatory compliance (Basel III/IV)
- Reduce manual underwriting workload
- Enable real-time credit decisions

## Input Data

### Data Sources
| Source | Type | Frequency | Volume |
|--------|------|-----------|--------|
| Core Banking System | Database | Real-time | ~50K records/day |
| Credit Bureau | API | Real-time | ~30K queries/day |
| Application Data | File Upload | Batch | ~10K records/day |
| Transaction History | Database | Daily | ~500K records/day |

### Input Features
| Feature | Type | Description |
|---------|------|-------------|
| customer_id | String | Unique customer identifier |
| age | Integer | Customer age in years |
| income | Float | Annual income |
| employment_status | Categorical | Employment type |
| credit_score | Integer | External credit bureau score |
| debt_to_income | Float | Debt-to-income ratio |
| loan_amount | Float | Requested loan amount |
| loan_purpose | Categorical | Purpose of the loan |
| credit_history_length | Integer | Years of credit history |
| num_credit_accounts | Integer | Number of existing accounts |
| payment_history | Float | On-time payment percentage |
| utilization_ratio | Float | Credit utilization ratio |

### Data Quality Requirements
- Missing values: < 5% per feature
- Data freshness: < 24 hours
- Minimum records: 1,000 per batch

## Processing

### Pipeline Steps
1. **Data Ingestion** - Load data from multiple sources
2. **Data Validation** - Check schema and quality
3. **Feature Engineering** - Create derived features
4. **Preprocessing** - Handle missing values, encoding
5. **Model Inference** - Generate risk scores
6. **Post-processing** - Apply business rules
7. **Output Generation** - Format results

### Model Architecture
| Component | Technology |
|-----------|------------|
| Algorithm | XGBoost Classifier |
| Framework | scikit-learn |
| Feature Count | 45 |
| Training Data | 2M records |
| Validation | 5-fold CV |

### Processing Parameters
```python
{
    "batch_size": 1000,
    "threshold": 0.5,
    "max_workers": 4,
    "timeout_seconds": 300,
    "retry_attempts": 3
}
```

## Output

### Output Schema
| Field | Type | Description |
|-------|------|-------------|
| customer_id | String | Customer identifier |
| risk_score | Float | Risk score (0-1) |
| risk_category | String | LOW/MEDIUM/HIGH/CRITICAL |
| default_probability | Float | Probability of default |
| confidence | Float | Model confidence |
| top_factors | Array | Top 5 contributing factors |
| recommendation | String | APPROVE/REVIEW/REJECT |
| explanation | String | Human-readable explanation |

### Risk Categories
| Category | Score Range | Action |
|----------|-------------|--------|
| LOW | 0.00 - 0.25 | Auto-approve |
| MEDIUM | 0.25 - 0.50 | Standard review |
| HIGH | 0.50 - 0.75 | Enhanced review |
| CRITICAL | 0.75 - 1.00 | Auto-reject |

### Output Destinations
- Database: `credit_risk_scores` table
- API: Real-time scoring endpoint
- File: Daily batch export (CSV/Parquet)
- Dashboard: Real-time visualization

## Visualization

### Available Charts
1. **Risk Score Distribution** - Histogram of score distribution
2. **Risk Category Breakdown** - Pie chart by category
3. **Feature Importance** - Bar chart of top features
4. **Trend Analysis** - Time series of approval rates
5. **Confusion Matrix** - Model performance matrix
6. **ROC Curve** - Model discrimination ability

### Key Metrics Dashboard
- Total Applications Processed
- Approval Rate (%)
- Average Risk Score
- High Risk Alerts
- Model Accuracy
- Processing Time

## Transaction History

### Logging
All transactions are logged with:
- Transaction ID
- Timestamp
- Input record count
- Output record count
- Processing duration
- Status (Success/Failed)
- Error details (if any)

### Retention Policy
- Real-time logs: 7 days
- Daily summaries: 90 days
- Monthly reports: 7 years
- Audit logs: 10 years

## Governance

### Model Governance Scores
| Metric | Score | Status |
|--------|-------|--------|
| Explainability | 92/100 | Excellent |
| Fairness | 88/100 | Good |
| Robustness | 95/100 | Excellent |
| Privacy | 90/100 | Excellent |
| **Overall** | **91/100** | **Excellent** |

### Compliance
- Basel III/IV compliant
- GDPR compliant
- Fair lending requirements met
- Model documentation complete

### Monitoring
- Daily accuracy monitoring
- Weekly drift detection
- Monthly bias testing
- Quarterly model review

## API Reference

### Scoring Endpoint
```
POST /api/v1/risk/credit-score
```

### Request
```json
{
    "customer_id": "C12345",
    "age": 35,
    "income": 75000,
    "credit_score": 720,
    "loan_amount": 250000,
    "loan_purpose": "mortgage"
}
```

### Response
```json
{
    "customer_id": "C12345",
    "risk_score": 0.23,
    "risk_category": "LOW",
    "default_probability": 0.08,
    "confidence": 0.94,
    "recommendation": "APPROVE",
    "top_factors": [
        {"feature": "credit_score", "impact": 0.25},
        {"feature": "income", "impact": 0.18},
        {"feature": "payment_history", "impact": 0.15}
    ]
}
```

## Dependencies

### Upstream
- Data preprocessing pipeline
- Customer data ETL
- Credit bureau integration

### Downstream
- Loan approval workflow
- Risk reporting dashboard
- Regulatory reporting

## Contact

| Role | Name | Email |
|------|------|-------|
| Product Owner | Jane Smith | jane.smith@bank.com |
| ML Engineer | John Doe | john.doe@bank.com |
| Data Steward | Alice Johnson | alice.j@bank.com |

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| 2.3.1 | 2025-01-15 | Performance optimization |
| 2.3.0 | 2025-01-08 | Added SHAP explanations |
| 2.2.4 | 2024-12-20 | Bug fixes |
| 2.2.0 | 2024-12-01 | Model retrained |
