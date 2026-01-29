# Use Case Details - Stakeholder Stories

## Overview

Detailed stakeholder stories for all 64 use cases with comprehensive specifications for:
- Input fields and validation
- Process steps and configuration
- Output fields and formats
- Visualization and analytics

## Documents

| Document | Department | Use Cases | Stakeholders |
|----------|------------|-----------|--------------|
| [Risk Management Stories](./risk_management_stories.md) | Risk Management | 8 | Risk Managers, Credit Analysts |
| [Fraud Detection Stories](./fraud_detection_stories.md) | Fraud Detection | 8 | Fraud Analysts, Security Officers |
| [Credit Analysis Stories](./credit_analysis_stories.md) | Credit Analysis | 9 | Loan Officers, Underwriters |

## Use Case Template

Each use case includes:

### 1. Stakeholder Stories
- Admin perspective
- User perspective
- Analyst perspective
- Compliance perspective

### 2. Input Specification
```
┌─────────────────────────────────────────────────────────────────┐
│  1. INPUT - [Use Case Name]                                     │
├─────────────────────────────────────────────────────────────────┤
│  Data Source: ○ Manual Entry  ○ File Upload  ● Database        │
│  [Input fields with validation rules]                           │
│  [File upload for batch processing]                             │
│  [Data preview table]                                           │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Process Specification
```
┌─────────────────────────────────────────────────────────────────┐
│  2. PROCESS - Model Configuration                               │
├─────────────────────────────────────────────────────────────────┤
│  [Model settings and version]                                   │
│  [Processing options and checkboxes]                            │
│  [Threshold configuration]                                      │
│  [Run button and progress indicator]                            │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Output Specification
```
┌─────────────────────────────────────────────────────────────────┐
│  3. OUTPUT - Results                                            │
├─────────────────────────────────────────────────────────────────┤
│  [Primary score/decision display]                               │
│  [Results summary table]                                        │
│  [Breakdown and explanation]                                    │
│  [Export options]                                               │
└─────────────────────────────────────────────────────────────────┘
```

### 5. Visualization Specification
```
┌─────────────────────────────────────────────────────────────────┐
│  4. VISUALIZATION - Analytics                                   │
├─────────────────────────────────────────────────────────────────┤
│  [Score distribution chart]                                     │
│  [Feature importance chart]                                     │
│  [SHAP waterfall chart]                                         │
│  [Trend analysis]                                               │
│  [Interactive filters]                                          │
└─────────────────────────────────────────────────────────────────┘
```

### 6. Transaction History
```
┌─────────────────────────────────────────────────────────────────┐
│  5. TRANSACTION HISTORY - Execution Log                         │
├─────────────────────────────────────────────────────────────────┤
│  [Filter controls]                                              │
│  [Execution history table]                                      │
│  [Selected run details]                                         │
│  [Pagination]                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Input Field Standards

| Field Type | Validation | Example |
|------------|------------|---------|
| Customer ID | Alphanumeric, 10 chars | C001234567 |
| Amount | Currency, > 0 | $50,000.00 |
| Date | ISO format | 2025-01-28 |
| Score | Integer, range | 300-850 |
| Dropdown | Predefined values | [Select...] |
| File | Format, size limit | CSV, 100MB |

## Output Standards

| Output Type | Format | Example |
|-------------|--------|---------|
| Risk Score | 0-1 float | 0.72 |
| Category | Enum | LOW/MEDIUM/HIGH |
| Confidence | Percentage | 94% |
| Decision | Enum | APPROVE/REVIEW/DECLINE |
| Explanation | Array | Feature contributions |

## Visualization Standards

| Chart Type | Use Case | Interactivity |
|------------|----------|---------------|
| Gauge | Single score display | Animated |
| Bar | Category comparison | Hover, click |
| Line | Trends over time | Zoom, filter |
| Pie/Donut | Distribution | Segment click |
| Radar | Multi-dimensional | Hover |
| Waterfall | SHAP explanation | Expand/collapse |
| Map | Geographic data | Pan, zoom |
