# Credit Analysis - Detailed Use Case Stories

## Department Overview

**Department**: Credit Analysis
**Use Cases**: 9
**Primary Stakeholders**: Credit Analysts, Loan Officers, Underwriters

---

## UC-CREDIT-001: Loan Approval

### Stakeholder Stories

#### As a Loan Officer
**I want to** get instant loan approval decisions
**So that** I can serve customers faster

#### As an Underwriter
**I want to** see detailed credit analysis
**So that** I can make informed decisions on edge cases

#### As a Branch Manager
**I want to** track approval rates
**So that** I can optimize branch performance

---

### UI Specification

#### Input Section

**Input Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Applicant ID | String | Yes | Unique identifier |
| Loan Type | Dropdown | Yes | Personal/Home/Auto/Business |
| Loan Amount | Currency | Yes | Within product limits |
| Loan Term | Integer | Yes | Product-specific range |
| Interest Rate | Float | No | Auto-calculated |
| Purpose | Dropdown | Yes | Loan purpose code |
| Collateral | Object | Conditional | For secured loans |
| Income Details | Object | Yes | Verified income |
| Employment | Object | Yes | Employment history |

#### Process Steps
1. Credit bureau pull
2. Income verification
3. Affordability calculation
4. Collateral valuation
5. Policy rule check
6. ML scoring
7. Decision generation

#### Output Fields
| Field | Type | Description |
|-------|------|-------------|
| Decision | Enum | APPROVE/REFER/DECLINE |
| Approved Amount | Currency | Sanctioned amount |
| Interest Rate | Float | Offered rate |
| Conditions | Array | Approval conditions |
| Risk Grade | String | Internal risk grade |
| DTI Ratio | Float | Debt-to-income ratio |

---

## UC-CREDIT-002 to UC-CREDIT-009

Similar detailed specifications for:
- Credit Limit Setting
- Default Prediction
- Early Warning System
- Debt Collection Optimization
- Alternative Credit Scoring
- Mortgage Risk Assessment
- Auto Loan Risk
- SME Lending

---

## Summary

| Use Case | Accuracy | Daily Volume | Avg Decision Time |
|----------|----------|--------------|-------------------|
| Loan Approval | 95.1% | 45,000 | 3.2 sec |
| Credit Limit | 91.3% | 32,000 | 2.1 sec |
| Default Prediction | 93.7% | 28,000 | 1.8 sec |
| Early Warning | 89.8% | 85,000 | 0.9 sec |
| Debt Collection | Training | - | - |
| Alt Credit Scoring | 87.6% | 12,000 | 4.5 sec |
| Mortgage Risk | 92.4% | 8,500 | 8.2 sec |
| Auto Loan | 90.2% | 15,000 | 2.5 sec |
| SME Lending | Pending | - | - |
