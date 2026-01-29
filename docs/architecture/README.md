# Architecture Documentation

## Overview

System architecture documentation for the Banking ML Pipeline using the C4 model methodology.

## Document Index

| Document | Description |
|----------|-------------|
| [C4 Model](./c4_model.md) | Complete C4 architecture diagrams |

## C4 Model Overview

The C4 model provides four levels of abstraction:

### Level 1: System Context

Shows how the Banking ML Pipeline fits into the broader enterprise ecosystem:

- **Users**: Data Scientists, Business Analysts, Risk Managers, Compliance Officers
- **External Systems**: Core Banking, Credit Bureau, Market Data, Regulatory Systems
- **Integrations**: APIs, Batch files, Database connections

### Level 2: Container Diagram

Shows the major application containers:

- **Frontend**: React dashboard application
- **API Gateway**: FastAPI REST endpoints
- **ML Engine**: Model training and inference
- **RAG Pipeline**: Document retrieval and generation
- **Data Pipeline**: ETL and feature engineering
- **Governance Module**: Model monitoring and compliance

### Level 3: Component Diagram

Shows internal components of key containers:

- **API Components**: Authentication, routing, request handling
- **ML Components**: Training, inference, feature store
- **Data Components**: Ingestion, validation, transformation
- **Governance Components**: Explainability, fairness, monitoring

### Level 4: Code Diagram

Shows class-level design for critical modules:

- **Model interfaces and implementations**
- **Pipeline orchestration classes**
- **Data transformation utilities**

### Deployment Diagram

Shows infrastructure and deployment:

- **Kubernetes cluster configuration**
- **Database instances (PostgreSQL, ChromaDB)**
- **Model serving infrastructure**
- **Monitoring and logging stack**

## Architecture Principles

### 1. Modularity
- Separate concerns into distinct components
- Enable independent scaling and deployment
- Support plug-and-play model algorithms

### 2. Scalability
- Horizontal scaling for inference workloads
- Distributed training support
- Caching at multiple levels

### 3. Security
- Authentication and authorization
- Data encryption at rest and in transit
- PII protection and anonymization

### 4. Observability
- Comprehensive logging
- Metrics collection and dashboards
- Distributed tracing

### 5. Governance
- Model versioning and lineage
- Explainability and fairness tracking
- Regulatory compliance monitoring

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React, Vite, Recharts |
| **API** | FastAPI, Pydantic |
| **ML** | scikit-learn, XGBoost, LightGBM |
| **Data** | Pandas, NumPy, Polars |
| **Database** | PostgreSQL, ChromaDB |
| **Orchestration** | Apache Airflow |
| **Monitoring** | Prometheus, Grafana |
| **Deployment** | Docker, Kubernetes |

## Related Documentation

- [ML Pipeline](../ml_pipeline/README.md) - Training and evaluation docs
- [Diagrams](../diagrams/README.md) - Process flows and data flows
- [Use Cases](../use_cases/README.md) - All 64 use case documentation
