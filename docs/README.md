# Banking ML Pipeline Documentation

## Overview

Complete documentation for the Banking ML Pipeline system supporting 64 use cases across 8 departments.

## Documentation Structure

```
docs/
├── README.md                    # This file
├── architecture/                # System architecture
│   ├── README.md               # Architecture overview
│   └── c4_model.md             # C4 model diagrams
├── diagrams/                    # Technical diagrams
│   ├── README.md               # Diagrams overview
│   ├── sequence_diagrams.md    # Process sequences
│   ├── flowcharts.md           # Process flows
│   └── data_flow.md            # Data movement
├── ml_pipeline/                 # ML pipeline documentation
│   ├── README.md               # Pipeline overview
│   ├── model_training.md       # Training pipeline
│   ├── model_testing.md        # Testing framework
│   ├── model_evaluation.md     # Evaluation metrics
│   └── model_performance.md    # Performance monitoring
└── use_cases/                   # Use case documentation
    ├── README.md               # Use case index
    ├── risk_management/        # 8 use cases
    ├── credit_analysis/        # 9 use cases
    ├── fraud_detection/        # 8 use cases
    ├── customer_analytics/     # 9 use cases
    ├── compliance/             # 8 use cases
    ├── treasury/               # 7 use cases
    ├── retail_banking/         # 7 use cases
    └── investment_banking/     # 8 use cases
```

## Quick Links

### Architecture
- [C4 Model](./architecture/c4_model.md) - System context, containers, components

### Diagrams
- [Sequence Diagrams](./diagrams/sequence_diagrams.md) - Process interactions
- [Flowcharts](./diagrams/flowcharts.md) - Decision flows
- [Data Flow](./diagrams/data_flow.md) - Data movement

### ML Pipeline
- [Model Training](./ml_pipeline/model_training.md) - Training process
- [Model Testing](./ml_pipeline/model_testing.md) - Test framework
- [Model Evaluation](./ml_pipeline/model_evaluation.md) - Accuracy matrix
- [Model Performance](./ml_pipeline/model_performance.md) - Monitoring

### Use Cases
- [All Use Cases](./use_cases/README.md) - 64 use case documentation

## System Summary

### Departments & Use Cases

| Department | Use Cases | Active | Training | Pending |
|------------|-----------|--------|----------|---------|
| Risk Management | 8 | 6 | 1 | 1 |
| Credit Analysis | 9 | 7 | 1 | 1 |
| Fraud Detection | 8 | 7 | 1 | 0 |
| Customer Analytics | 9 | 8 | 1 | 0 |
| Compliance | 8 | 6 | 1 | 1 |
| Treasury | 7 | 5 | 1 | 1 |
| Retail Banking | 7 | 6 | 1 | 0 |
| Investment Banking | 8 | 6 | 1 | 1 |
| **Total** | **64** | **51** | **8** | **5** |

### Performance Metrics

| Metric | Value |
|--------|-------|
| Total Daily Predictions | 12.5M |
| Average Model Accuracy | 91.2% |
| Average P95 Latency | 85ms |
| System Availability | 99.98% |
| Error Rate | 0.02% |

### Top Performing Models

| Rank | Model | Department | Accuracy | ROC-AUC |
|------|-------|------------|----------|---------|
| 1 | Sanctions Screening | Compliance | 98.1% | 99.5% |
| 2 | Transaction Fraud | Fraud Detection | 97.3% | 99.1% |
| 3 | Card Fraud | Fraud Detection | 96.8% | 98.8% |
| 4 | KYC Verification | Compliance | 96.2% | 98.5% |
| 5 | Loan Approval | Credit Analysis | 95.1% | 97.2% |

## Getting Started

### For Data Scientists
1. Review [Model Training](./ml_pipeline/model_training.md)
2. Check [Accuracy Matrix](./ml_pipeline/model_evaluation.md)
3. Explore specific [Use Cases](./use_cases/README.md)

### For Developers
1. Study [C4 Architecture](./architecture/c4_model.md)
2. Review [Data Flow](./diagrams/data_flow.md)
3. Check [Sequence Diagrams](./diagrams/sequence_diagrams.md)

### For Business Analysts
1. Browse [Use Cases](./use_cases/README.md) by department
2. Review [Performance Metrics](./ml_pipeline/model_performance.md)
3. Check [Flowcharts](./diagrams/flowcharts.md)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Update documentation
4. Submit a pull request

## Support

- **Technical Issues**: ML Platform Team
- **Documentation Updates**: DevOps Team
- **Use Case Questions**: Department Leads
