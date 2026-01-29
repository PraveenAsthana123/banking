# ML Pipeline Documentation

## Overview

Comprehensive documentation for the Banking ML Pipeline covering 64 use cases across 8 departments.

## Documentation Index

### Training & Evaluation

| Document | Description |
|----------|-------------|
| [Model Training](./model_training.md) | Training pipeline, algorithms, hyperparameter tuning |
| [Model Testing](./model_testing.md) | Unit tests, integration tests, validation tests |
| [Model Evaluation](./model_evaluation.md) | Accuracy matrix, metrics, confusion matrices |
| [Model Performance](./model_performance.md) | Production monitoring, KPIs, alerting |

### Architecture Diagrams

| Document | Description |
|----------|-------------|
| [C4 Model](../architecture/c4_model.md) | System context, containers, components, deployment |
| [Sequence Diagrams](../diagrams/sequence_diagrams.md) | Pipeline execution flows |
| [Flowcharts](../diagrams/flowcharts.md) | Process flows, decision trees |
| [Data Flow](../diagrams/data_flow.md) | Data movement through the system |

### Use Case Documentation

| Department | Use Cases | Documentation |
|------------|-----------|---------------|
| Risk Management | 8 | [View](../use_cases/risk_management/) |
| Credit Analysis | 9 | [View](../use_cases/credit_analysis/) |
| Fraud Detection | 8 | [View](../use_cases/fraud_detection/) |
| Customer Analytics | 9 | [View](../use_cases/customer_analytics/) |
| Compliance | 8 | [View](../use_cases/compliance/) |
| Treasury | 7 | [View](../use_cases/treasury/) |
| Retail Banking | 7 | [View](../use_cases/retail_banking/) |
| Investment Banking | 8 | [View](../use_cases/investment_banking/) |

## Quick Reference

### Model Status Summary

| Status | Count | Description |
|--------|-------|-------------|
| Active | 52 | Models in production |
| Training | 7 | Models being trained |
| Pending | 5 | Awaiting implementation |
| **Total** | **64** | All use cases |

### Performance Overview

| Metric | Target | Current |
|--------|--------|---------|
| Average Accuracy | > 90% | 91.2% |
| P95 Latency | < 200ms | 85ms |
| Availability | 99.95% | 99.98% |
| Error Rate | < 0.1% | 0.02% |

### Department Performance

| Department | Active Models | Avg Accuracy | Avg Latency |
|------------|--------------|--------------|-------------|
| Risk Management | 6 | 91.1% | 81ms |
| Credit Analysis | 7 | 91.5% | 61ms |
| Fraud Detection | 7 | 94.2% | 44ms |
| Customer Analytics | 8 | 87.4% | 50ms |
| Compliance | 6 | 95.3% | 106ms |
| Treasury | 5 | 84.0% | 405ms |
| Retail Banking | 6 | 87.3% | 299ms |
| Investment Banking | 6 | 78.8% | 552ms |

## Pipeline Architecture

```
                    ┌─────────────────────────────────────────┐
                    │           DATA SOURCES                  │
                    │  Core Banking │ Credit Bureau │ Market  │
                    └──────────────────┬──────────────────────┘
                                       │
                    ┌──────────────────▼──────────────────────┐
                    │           DATA INGESTION                │
                    │     ETL │ API Connectors │ Files        │
                    └──────────────────┬──────────────────────┘
                                       │
    ┌──────────────────────────────────┼──────────────────────────────────┐
    │                                  │                                  │
    ▼                                  ▼                                  ▼
┌───────────┐                   ┌───────────┐                      ┌───────────┐
│  TRAINING │                   │ INFERENCE │                      │    RAG    │
│  PIPELINE │                   │  PIPELINE │                      │ PIPELINE  │
├───────────┤                   ├───────────┤                      ├───────────┤
│ Preprocess│                   │ Load Model│                      │ Embedding │
│ Train     │                   │ Predict   │                      │ Retrieval │
│ Validate  │                   │ Explain   │                      │ Generate  │
│ Register  │                   │ Log       │                      │ Respond   │
└─────┬─────┘                   └─────┬─────┘                      └─────┬─────┘
      │                               │                                  │
      └───────────────────────────────┼──────────────────────────────────┘
                                      │
                    ┌─────────────────▼──────────────────────┐
                    │           AI GOVERNANCE                │
                    │  Explainability │ Fairness │ Privacy   │
                    └─────────────────┬──────────────────────┘
                                      │
                    ┌─────────────────▼──────────────────────┐
                    │              OUTPUT                    │
                    │  Predictions │ Reports │ Dashboards   │
                    └─────────────────────────────────────────┘
```

## Getting Started

### 1. Training a New Model

```bash
# Run training pipeline
python -m src.pipelines.training --use-case credit_risk_scoring

# With custom config
python -m src.pipelines.training --use-case credit_risk_scoring --config configs/custom.yaml
```

### 2. Running Inference

```bash
# Single prediction
python -m src.pipelines.inference --use-case credit_risk_scoring --input data/sample.json

# Batch prediction
python -m src.pipelines.inference --use-case credit_risk_scoring --batch data/batch.csv
```

### 3. Viewing Performance

```bash
# Check model status
python -m src.monitoring.status --use-case credit_risk_scoring

# Generate performance report
python -m src.monitoring.report --department risk_management
```

## Support

- **Documentation Issues**: Create a PR in the docs repository
- **Pipeline Issues**: Contact the ML Platform team
- **Model Issues**: Contact the respective department team
