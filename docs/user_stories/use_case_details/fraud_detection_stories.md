# Fraud Detection - Detailed Use Case Stories

## Department Overview

**Department**: Fraud Detection
**Use Cases**: 8
**Primary Stakeholders**: Fraud Analysts, Security Officers, Operations Team

---

## UC-FRAUD-001: Transaction Fraud Detection

### Stakeholder Stories

#### As a Fraud Analyst
**I want to** detect fraudulent transactions in real-time
**So that** I can prevent financial losses

#### As a Security Officer
**I want to** review flagged transactions
**So that** I can make final fraud determinations

#### As a Customer Service Rep
**I want to** see fraud alerts on customer accounts
**So that** I can assist customers with blocked transactions

#### As an Admin
**I want to** tune fraud detection thresholds
**So that** we balance fraud prevention with customer experience

---

### UI Specification

#### Input Section

```
┌─────────────────────────────────────────────────────────────────┐
│  1. INPUT - Transaction Analysis                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Analysis Mode: ● Real-time  ○ Batch  ○ Historical             │
│                                                                 │
│  Transaction Details                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Transaction ID:    [TXN-2025012814523698]               │   │
│  │ Account Number:    [****-****-****-4521]                │   │
│  │ Transaction Type:  [Purchase ▼]                          │   │
│  │ Amount:            [$_________]                          │   │
│  │ Currency:          [USD ▼]                               │   │
│  │ Timestamp:         [2025-01-28 14:52:36]                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Merchant Information                                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Merchant Name:     [________________]                    │   │
│  │ Merchant Category: [Retail ▼]                            │   │
│  │ Merchant Location: [________________]                    │   │
│  │ Terminal ID:       [________________]                    │   │
│  │ Entry Mode:        [Chip ▼]                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Device & Location                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Device ID:         [________________]                    │   │
│  │ IP Address:        [___.___.___.___]                     │   │
│  │ Geolocation:       [Lat: ____  Lon: ____]               │   │
│  │ Device Type:       [Mobile ▼]                            │   │
│  │ Browser/App:       [________________]                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Batch Upload (for batch mode):                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [📁 Drop CSV file here or click to upload]              │   │
│  │                                                          │   │
│  │  Supported: CSV, JSON (max 100MB, 1M records)           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Preview (5 of 1,000 transactions):                            │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ TXN ID      │ Amount   │ Merchant      │ Location  │ Time  ││
│  ├────────────────────────────────────────────────────────────┤│
│  │ TXN-001     │ $245.00  │ Amazon        │ Online    │ 14:52 ││
│  │ TXN-002     │ $1,250.00│ Best Buy      │ New York  │ 14:53 ││
│  │ TXN-003     │ $89.99   │ Walmart       │ Chicago   │ 14:53 ││
│  │ TXN-004     │ $3,500.00│ Wire Transfer │ -         │ 14:54 ││
│  │ TXN-005     │ $45.00   │ Gas Station   │ Miami     │ 14:55 ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Input Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Transaction ID | String | Yes | Unique identifier |
| Account Number | String | Yes | Masked card number |
| Transaction Type | Dropdown | Yes | Purchase/ATM/Transfer/etc. |
| Amount | Currency | Yes | > 0 |
| Currency | Dropdown | Yes | ISO currency code |
| Timestamp | DateTime | Yes | ISO format |
| Merchant Name | String | Yes | Merchant identifier |
| Merchant Category | Dropdown | Yes | MCC code |
| Entry Mode | Dropdown | Yes | Chip/Swipe/Manual/Online |
| Device ID | String | No | Device fingerprint |
| IP Address | String | No | Valid IP |
| Geolocation | Coordinates | No | Lat/Lon |

---

#### Process Section

```
┌─────────────────────────────────────────────────────────────────┐
│  2. PROCESS - Fraud Detection Engine                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Model Configuration                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Model Version:     [v3.2.1 (Production) ▼]              │   │
│  │ Algorithm:         Ensemble (XGBoost + Neural Network)   │   │
│  │ Accuracy:          97.3%                                 │   │
│  │ False Positive:    2.1%                                  │   │
│  │ Detection Rate:    97.8%                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Detection Rules                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ☑ ML Model Score                                        │   │
│  │ ☑ Velocity Checks (transactions per hour)               │   │
│  │ ☑ Geographic Anomaly Detection                          │   │
│  │ ☑ Amount Anomaly Detection                              │   │
│  │ ☑ Merchant Category Risk                                │   │
│  │ ☑ Device Fingerprint Analysis                           │   │
│  │ ☐ Manual Rules Override                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Risk Thresholds                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Auto-Approve:   Score < [0.3]                            │   │
│  │ Review Queue:   Score >= [0.3] and < [0.7]              │   │
│  │ Auto-Block:     Score >= [0.7]                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│         ┌──────────────────────────────────────┐               │
│         │     🔍 ANALYZE TRANSACTION           │               │
│         └──────────────────────────────────────┘               │
│                                                                 │
│  Processing Pipeline:                                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ✓ Data Validation         2ms                            │   │
│  │ ✓ Feature Extraction      5ms                            │   │
│  │ ✓ Velocity Check          3ms                            │   │
│  │ ● ML Model Inference      Processing...                  │   │
│  │ ○ Rule Engine             Pending                        │   │
│  │ ○ Decision Aggregation    Pending                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│  Total Latency Target: < 50ms                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Process Steps:**
1. **Data Validation** (2ms) - Verify transaction data completeness
2. **Feature Extraction** (5ms) - Extract 150+ fraud features
3. **Velocity Check** (3ms) - Check transaction frequency
4. **ML Model Inference** (15ms) - Run ensemble model
5. **Rule Engine** (10ms) - Apply business rules
6. **Decision Aggregation** (5ms) - Combine signals

---

#### Output Section

```
┌─────────────────────────────────────────────────────────────────┐
│  3. OUTPUT - Fraud Analysis Results                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    FRAUD SCORE                           │   │
│  │                                                          │   │
│  │           ┌─────────────────────┐                        │   │
│  │           │        0.89         │                        │   │
│  │           │    🚨 HIGH RISK     │                        │   │
│  │           │   AUTO-BLOCKED      │                        │   │
│  │           └─────────────────────┘                        │   │
│  │                                                          │   │
│  │    Confidence: 96%    |    Latency: 42ms                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Decision Details                                               │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Decision:        BLOCK                                     ││
│  │ Reason Code:     F-001 (Unusual Location + High Amount)   ││
│  │ Action Taken:    Transaction Declined                      ││
│  │ Customer Notified: SMS sent to ***-***-4521               ││
│  │ Case Created:    CASE-2025012814523                        ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Risk Signals Detected                                          │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Signal               │ Score │ Weight │ Contribution      ││
│  ├────────────────────────────────────────────────────────────┤│
│  │ 🚨 Location Anomaly  │ 0.95  │ 25%    │ +0.24 HIGH        ││
│  │ 🚨 Amount Anomaly    │ 0.88  │ 20%    │ +0.18 HIGH        ││
│  │ ⚠️ New Device        │ 0.75  │ 15%    │ +0.11 MEDIUM      ││
│  │ ⚠️ High Velocity     │ 0.65  │ 15%    │ +0.10 MEDIUM      ││
│  │ ✓ Valid Merchant     │ 0.20  │ 10%    │ +0.02 LOW         ││
│  │ ✓ Normal Time        │ 0.15  │ 10%    │ +0.02 LOW         ││
│  │ ✓ Chip Present       │ 0.10  │ 5%     │ +0.01 LOW         ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Account History Context                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Account Age:         3 years, 2 months                   │   │
│  │ Avg Transaction:     $125.00                             │   │
│  │ This Transaction:    $3,500.00 (28x average)             │   │
│  │ Last Location:       Chicago, IL (2 hours ago)           │   │
│  │ Current Location:    Lagos, Nigeria                      │   │
│  │ Previous Fraud:      0 confirmed cases                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Override Decision] [Create Case] [Contact Customer] [Export]  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Output Fields:**
| Field | Type | Description |
|-------|------|-------------|
| Fraud Score | Float | 0-1 fraud probability |
| Risk Level | Enum | LOW/MEDIUM/HIGH |
| Decision | Enum | APPROVE/REVIEW/BLOCK |
| Reason Codes | Array | Fraud indicator codes |
| Risk Signals | Array | Individual signal scores |
| Confidence | Percentage | Model confidence |
| Latency | Milliseconds | Processing time |
| Case ID | String | Created case reference |

---

#### Visualization Section

```
┌─────────────────────────────────────────────────────────────────┐
│  4. VISUALIZATION - Fraud Analytics Dashboard                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────┐  ┌─────────────────────────┐      │
│  │ Fraud Score Gauge       │  │ Risk Signal Radar       │      │
│  │                         │  │                         │      │
│  │      ╭─────────╮        │  │       Location          │      │
│  │    ╱      |      ╲      │  │          ▲              │      │
│  │   ╱   ████████    ╲     │  │    Amount ╱ ╲ Device    │      │
│  │  │     0.89        │    │  │         ╱   ╲           │      │
│  │   ╲               ╱     │  │   ──────●─────●───      │      │
│  │    ╲             ╱      │  │        ╱       ╲        │      │
│  │      ╰─────────╯        │  │  Time ╱         ╲ Merch │      │
│  │   LOW   MED   HIGH      │  │       ▼                 │      │
│  └─────────────────────────┘  └─────────────────────────┘      │
│                                                                 │
│  ┌─────────────────────────┐  ┌─────────────────────────┐      │
│  │ Transaction Map         │  │ Velocity Timeline       │      │
│  │                         │  │                         │      │
│  │    🔴 Lagos             │  │  5│    ▓                │      │
│  │       ↑                 │  │  4│    ▓▓               │      │
│  │    ⋮  Flight: 2hrs      │  │  3│▓   ▓▓               │      │
│  │    ⋮  Distance: 6,200mi │  │  2│▓▓  ▓▓  ▓            │      │
│  │       ↓                 │  │  1│▓▓▓ ▓▓▓ ▓▓           │      │
│  │    🟢 Chicago           │  │   └─────────────────    │      │
│  │                         │  │   12:00  13:00  14:00   │      │
│  └─────────────────────────┘  └─────────────────────────┘      │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Customer Transaction Pattern                               │ │
│  │                                                            │ │
│  │ $4K ─                                            🔴 Now   │ │
│  │       Normal Pattern                              │        │ │
│  │ $3K ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│─ ─ ─  │ │
│  │                                                   │        │ │
│  │ $2K ─                                             │        │ │
│  │                                                   │        │ │
│  │ $1K ─                                             │        │ │
│  │      ___    ___    ___    ___    ___    ___      │        │ │
│  │    ─/   \──/   \──/   \──/   \──/   \──/   \─────┼────   │ │
│  │      Jan    Feb    Mar    Apr    May    Jun    Jul        │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Visualization Types:**
| Chart | Purpose | Interactive Features |
|-------|---------|---------------------|
| Fraud Score Gauge | Show risk level visually | Color-coded zones |
| Risk Signal Radar | Multi-dimensional risk view | Hover for details |
| Transaction Map | Geographic anomaly | Zoom, distance calculation |
| Velocity Timeline | Transaction frequency | Time filter, zoom |
| Pattern Chart | Historical behavior | Anomaly highlighting |
| SHAP Waterfall | Feature contributions | Expand/collapse |

---

#### Transaction History Section

```
┌─────────────────────────────────────────────────────────────────┐
│  5. TRANSACTION HISTORY - Fraud Detection Log                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Filter: [All ▼] [Today ▼] [Score > 0.5 ▼] [Search...]         │
│                                                                 │
│  Real-time Feed (Auto-refresh: ON 🟢)                          │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Time     │ TXN ID      │ Amount   │ Score │ Decision │ Act ││
│  ├────────────────────────────────────────────────────────────┤│
│  │ 14:55:23 │ TXN-9823    │ $89.00   │ 0.12  │ APPROVE  │ ✓   ││
│  │ 14:55:21 │ TXN-9822    │ $3,500   │ 0.89  │ BLOCK    │ 🚨  ││
│  │ 14:55:18 │ TXN-9821    │ $245.00  │ 0.45  │ REVIEW   │ ⚠️  ││
│  │ 14:55:15 │ TXN-9820    │ $52.00   │ 0.08  │ APPROVE  │ ✓   ││
│  │ 14:55:12 │ TXN-9819    │ $1,200   │ 0.67  │ REVIEW   │ ⚠️  ││
│  │ 14:55:09 │ TXN-9818    │ $35.00   │ 0.05  │ APPROVE  │ ✓   ││
│  │ 14:55:06 │ TXN-9817    │ $890.00  │ 0.23  │ APPROVE  │ ✓   ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Statistics (Last 24 hours)                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Total Transactions:     2,534,521                        │   │
│  │ Blocked (Auto):         512 (0.02%)                      │   │
│  │ Sent to Review:         1,245 (0.05%)                    │   │
│  │ Approved (Auto):        2,532,764 (99.93%)               │   │
│  │ Confirmed Fraud:        487                              │   │
│  │ False Positives:        25                               │   │
│  │ Detection Rate:         97.8%                            │   │
│  │ False Positive Rate:    2.1%                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## UC-FRAUD-002: Card Fraud Detection

### Stakeholder Stories

#### As a Card Operations Manager
**I want to** detect compromised cards quickly
**So that** I can minimize fraud losses

#### As a Fraud Investigator
**I want to** see card usage patterns
**So that** I can identify fraud rings

---

### Input/Process/Output

**Input:**
| Field | Type | Description |
|-------|------|-------------|
| Card Number | String | Masked PAN |
| Card Type | Dropdown | Credit/Debit/Prepaid |
| Transaction Data | Object | Transaction details |
| Card Velocity | Integer | Transactions in time window |
| Cross-border Flag | Boolean | International transaction |

**Process:**
1. Card profiling
2. Velocity analysis
3. Pattern matching
4. Network analysis
5. Risk scoring

**Output:**
| Field | Type | Description |
|-------|------|-------------|
| Card Risk Score | Float | Card-level fraud score |
| Compromise Indicator | Boolean | Card likely compromised |
| Block Recommendation | Boolean | Should block card |
| Fraud Pattern | String | Identified pattern type |
| Related Cards | Array | Potentially linked cards |

---

## UC-FRAUD-003: Identity Fraud Detection

### Input/Process/Output

**Input:**
| Field | Type | Description |
|-------|------|-------------|
| Personal Information | Object | Name, DOB, SSN, Address |
| Document Images | Files | ID, proof of address |
| Biometric Data | Object | Face, fingerprint |
| Device Data | Object | Device fingerprint |
| Application Data | Object | Application details |

**Process:**
1. Document verification
2. Biometric matching
3. Data consistency check
4. Fraud database lookup
5. Risk assessment

**Output:**
| Field | Type | Description |
|-------|------|-------------|
| Identity Score | Float | Identity verification score |
| Fraud Indicators | Array | Detected fraud signals |
| Document Status | Enum | VALID/SUSPECT/INVALID |
| Match Confidence | Float | Biometric match score |
| Recommendation | Enum | APPROVE/REVIEW/REJECT |

---

## UC-FRAUD-004: Application Fraud Detection

### Input/Process/Output

**Input:**
- Application form data
- Applicant identity info
- Income/employment data
- Credit history
- Previous applications

**Process:**
1. Data validation
2. Duplicate detection
3. Synthetic identity check
4. Income verification
5. Risk scoring

**Output:**
- Application risk score
- Fraud indicators
- Duplicate applications
- Verification results
- Decision recommendation

---

## UC-FRAUD-005: AML Detection

### Input/Process/Output

**Input:**
- Transaction history
- Customer profile
- Related party data
- Geographic data
- Watch lists

**Process:**
1. Transaction monitoring
2. Pattern detection
3. Network analysis
4. Sanctions screening
5. Risk rating

**Output:**
- SAR recommendation
- Risk rating
- Suspicious patterns
- Network visualization
- Regulatory flags

---

## UC-FRAUD-006: Account Takeover Detection

### Input/Process/Output

**Input:**
- Login activity
- Device information
- Behavioral data
- Session data
- Account changes

**Process:**
1. Device fingerprinting
2. Behavioral analysis
3. Location verification
4. Session analysis
5. Risk scoring

**Output:**
- ATO risk score
- Device trust score
- Behavioral anomalies
- Session risk
- Block recommendation

---

## UC-FRAUD-007: Synthetic Identity Detection

### Input/Process/Output

**Input:**
- Identity elements
- Credit file data
- Application history
- Address history
- Employment data

**Process:**
1. SSN validation
2. Identity element analysis
3. Credit bureau triangulation
4. Velocity analysis
5. Pattern detection

**Output:**
- Synthetic probability
- Identity anomalies
- Credit file flags
- Network connections
- Investigation priority

---

## UC-FRAUD-008: Insider Fraud Detection

### Input/Process/Output

**Input:**
- Employee activity logs
- Access patterns
- Transaction approvals
- Policy exceptions
- Communication data

**Process:**
1. Behavioral baseline
2. Anomaly detection
3. Access analysis
4. Collusion detection
5. Risk scoring

**Output:**
- Insider risk score
- Behavioral anomalies
- Access violations
- Suspicious patterns
- Investigation recommendations

---

## Summary Table

| Use Case | Real-time | Input Fields | Visualizations | SLA (ms) |
|----------|-----------|--------------|----------------|----------|
| Transaction Fraud | Yes | 12 | 6 | < 50 |
| Card Fraud | Yes | 5 | 4 | < 50 |
| Identity Fraud | No | 5 | 4 | < 5000 |
| Application Fraud | No | 5 | 4 | < 3000 |
| AML Detection | Both | 5 | 5 | < 1000 |
| Account Takeover | Yes | 5 | 5 | < 100 |
| Synthetic Identity | No | 5 | 4 | < 5000 |
| Insider Fraud | No | 5 | 4 | < 60000 |
