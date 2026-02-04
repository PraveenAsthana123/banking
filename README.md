# Banking AI/ML Platform

Enterprise-grade AI/ML governance and operations platform for banking use cases. This platform provides comprehensive tooling for managing AI models across fraud detection, credit risk, AML compliance, and 14+ banking departments.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Backend Architecture](#backend-architecture)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Core Pipelines](#core-pipelines)
- [Frontend Application](#frontend-application)
- [Use Case Framework](#use-case-framework)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Security](#security)
- [Testing](#testing)
- [Development](#development)

---

## Overview

The Banking AI/ML Platform is designed to:

- **Manage 70+ AI/ML use cases** across banking domains
- **Track model lifecycle** from development to production
- **Ensure governance compliance** with explainability (SHAP/LIME)
- **Provide role-based dashboards** for executives, data scientists, risk managers
- **Enable RAG-powered queries** on use case documentation

### Key Features

| Feature | Description |
|---------|-------------|
| Model Governance | Full lifecycle tracking, validation, and compliance |
| Role-Based Access | 8 user roles with customized dashboards |
| RAG Pipeline | Natural language queries on documentation |
| Real-time Analytics | Performance metrics and drift detection |
| Explainability | SHAP and LIME integration for model interpretability |
| Security Hardening | API key auth, rate limiting, security headers, encrypted secrets |
| Structured Logging | JSON-formatted logs with correlation IDs on every request |
| Repository Pattern | All SQL isolated in repository classes, parameterized queries only |
| Dependency Injection | FastAPI `Depends()` for all repos, services, and config |

---

## Architecture

```
                                    +------------------+
                                    |   Frontend UI    |
                                    |  (React + Vite)  |
                                    +--------+---------+
                                             |
                                             v
+------------------+              +----------+-----------+
|   Ollama LLM     |<------------>|    API Server        |
|   (llama3.2)     |              |  (FastAPI + Uvicorn) |
+------------------+              +----------+-----------+
                                             |
                          +------------------+------------------+
                          |                  |                  |
                          v                  v                  v
                +---------+------+  +--------+-------+  +------+---------+
                | Preprocessing  |  | ML Training    |  | RAG Pipeline   |
                | Pipeline       |  | Pipeline       |  |                |
                +---------+------+  +--------+-------+  +------+---------+
                          |                  |                  |
                          v                  v                  v
                +---------+------+  +--------+-------+  +------+---------+
                | preprocessing_ |  | ml_pipeline_   |  | vector_store/  |
                | results.db     |  | results.db     |  | (FAISS)        |
                +----------------+  +----------------+  +----------------+
                          |                  |
                          +------------------+
                                   |
                                   v
                        +----------+---------+
                        | banking_unified.db |
                        | (2.1 GB SQLite)    |
                        +--------------------+
```

---

## Backend Architecture

The backend follows a layered architecture with strict separation of concerns.

### Layer Diagram

```
Request
  |
  v
+---------------------------------------------------------------+
| Middleware Stack                                               |
|  CorrelationIdMiddleware -> SecurityHeadersMiddleware          |
|  -> RateLimitMiddleware -> ApiKeyMiddleware -> CORSMiddleware  |
|  -> GZipMiddleware                                            |
+---------------------------------------------------------------+
  |
  v
+---------------------------------------------------------------+
| Routers (HTTP only — no SQL, no business logic)               |
|  alerts, audit, compare, export, integrations, jobs, logs,    |
|  metrics, monitoring, process, public, regulatory, scoring,   |
|  statistics, text2sql, training, upload                       |
+---------------------------------------------------------------+
  |  Depends()
  v
+---------------------------------------------------------------+
| Services (class-based, constructor injection)                 |
|  AnalysisService, ModelService, OllamaService,                |
|  TrainingService                                              |
+---------------------------------------------------------------+
  |  Depends()
  v
+---------------------------------------------------------------+
| Repositories (ALL SQL lives here, parameterized queries only) |
|  AlertRepo, AuditRepo, DatasetRepo, IntegrationRepo,         |
|  JobRepo, Text2SqlRepo                                        |
+---------------------------------------------------------------+
  |
  v
+---------------------------------------------------------------+
| SQLite (WAL mode, busy_timeout=5000)                          |
+---------------------------------------------------------------+
```

### Design Patterns

| Pattern | Implementation |
|---------|---------------|
| **Repository** | All SQL in `backend/repositories/`. One class per table group. No SQL in routers or services. |
| **Dependency Injection** | FastAPI `Depends()` factories in `backend/core/dependencies.py` for settings, repos, and services. |
| **Exception Taxonomy** | `AppError` base class with `NotFoundError`, `ValidationError`, `DataError`, `ModelError`, `ExternalServiceError`. Mapped to HTTP status codes in `error_handlers.py`. |
| **Pydantic Schemas** | Request/response models in `backend/schemas/` for every endpoint. `response_model=` on all endpoint decorators. |
| **Settings** | Pydantic `BaseSettings` with `BANKING_` env prefix. No `os.environ.get()`. Single source of truth in `backend/core/config.py`. |

### Middleware Stack (applied in order)

| Middleware | Purpose |
|------------|---------|
| `CorrelationIdMiddleware` | Injects `X-Correlation-ID` header on every request/response for tracing |
| `SecurityHeadersMiddleware` | Adds `X-Content-Type-Options`, `X-Frame-Options`, `HSTS`, `CSP`, `Referrer-Policy`, `Permissions-Policy` |
| `RateLimitMiddleware` | Per-IP rate limiting (default: 100 req/min on `/api/admin/*`). Returns `429` with `Retry-After` header. |
| `ApiKeyMiddleware` | Env-driven API key auth (`BANKING_API_KEY`). Disabled when key is not set (dev mode). Protects `/api/admin/*`. |
| `CORSMiddleware` | Restricted origins from `BANKING_CORS_ORIGINS` config. Never `allow_origins=["*"]`. |
| `GZipMiddleware` | Response compression for payloads >1KB |

---

## Folder Structure

```
Banking/
├── backend/                       # Production-grade FastAPI backend
│   ├── core/                      # Framework infrastructure
│   │   ├── config.py              # Pydantic BaseSettings (BANKING_ prefix)
│   │   ├── dependencies.py        # Depends() factories for repos + services
│   │   ├── exceptions.py          # AppError hierarchy (NotFound, Validation, Data, Model, ExternalService)
│   │   ├── error_handlers.py      # Exception -> JSONResponse mapping
│   │   ├── middleware.py          # CorrelationId, SecurityHeaders, RateLimit middleware
│   │   ├── auth.py                # ApiKeyMiddleware (env-driven, disabled in dev)
│   │   ├── encryption.py          # Fernet encryption for secrets in DB
│   │   ├── logging_config.py      # JSON structured logging with correlation_id
│   │   └── utils.py               # Shared helpers (human_size, sanitize_table_name, validate_use_case_key)
│   ├── repositories/              # Data access layer (ALL SQL here)
│   │   ├── base.py                # SQLiteRepository base with _connect() context manager
│   │   ├── alert_repo.py          # Alert CRUD
│   │   ├── audit_repo.py          # Audit log operations
│   │   ├── dataset_repo.py        # Dataset metadata operations
│   │   ├── integration_repo.py    # Integration config operations
│   │   ├── job_repo.py            # Job status and progress tracking
│   │   └── text2sql_repo.py       # Text2SQL query history
│   ├── schemas/                   # Pydantic request/response models
│   │   ├── common.py              # SuccessResponse, ErrorResponse
│   │   ├── alerts.py              # AlertCreate, AlertUpdate, AlertCheckResponse
│   │   ├── audit.py               # AuditEntry
│   │   ├── compare.py             # SideBySideRequest
│   │   ├── datasets.py            # Dataset schemas
│   │   ├── export.py              # BatchExportRequest
│   │   ├── integrations.py        # IntegrationConfig, IntegrationTestResponse
│   │   ├── jobs.py                # Job schemas
│   │   ├── process.py             # ProcessRunRequest, ProcessRunResponse
│   │   ├── scoring.py             # ScoreRequest, BatchScoreRequest
│   │   ├── text2sql.py            # GenerateRequest, ExecuteRequest
│   │   └── training.py            # TrainingRequest, TrainingStartResponse
│   ├── services/                  # Business logic (class-based, DI)
│   │   ├── analysis.py            # AnalysisService — dataset analysis and profiling
│   │   ├── advanced_analysis.py   # Pure functions for statistical analysis
│   │   ├── model_service.py       # ModelService — scoring, model loading, SHAP
│   │   ├── ollama_service.py      # OllamaService — LLM integration
│   │   ├── training_service.py    # TrainingService — ML model training
│   │   └── system_monitor.py      # System resource monitoring
│   ├── routers/                   # HTTP-only endpoint handlers (thin)
│   │   ├── alerts.py              # Alert CRUD + threshold checking
│   │   ├── audit.py               # Audit log viewing
│   │   ├── compare.py             # Side-by-side model comparison
│   │   ├── export.py              # Report export (PDF, Excel, batch)
│   │   ├── integrations.py        # Integration config + connection testing
│   │   ├── jobs.py                # Job management
│   │   ├── logs.py                # Log file viewer
│   │   ├── metrics.py             # Use case metrics from unified DB
│   │   ├── monitoring.py          # System health monitoring
│   │   ├── process.py             # Pipeline runner + data path management
│   │   ├── public.py              # Public endpoints: /health, /departments, /stats
│   │   ├── regulatory.py          # Regulatory compliance reports
│   │   ├── scoring.py             # Model scoring (single + batch)
│   │   ├── statistics.py          # Dataset statistics and profiling
│   │   ├── text2sql.py            # Natural language to SQL
│   │   ├── training.py            # Model training job management
│   │   └── upload.py              # File upload + dataset management
│   ├── tests/                     # Test suite (115 tests)
│   │   ├── conftest.py            # Fixtures: isolated temp DB, test client, seed helpers
│   │   ├── test_alerts.py         # Alert CRUD + validation tests
│   │   ├── test_auth.py           # API key auth tests (enabled/disabled)
│   │   ├── test_encryption.py     # Fernet encryption round-trip tests
│   │   ├── test_health.py         # Health, departments, stats endpoint tests
│   │   ├── test_jobs.py           # Job lifecycle tests
│   │   ├── test_upload.py         # File upload + validation tests
│   │   └── test_utils.py          # Utility function tests (sanitize, validate, human_size)
│   ├── database.py                # Schema init + migration runner
│   └── main.py                    # FastAPI app: middleware stack, error handlers, routers
│
├── frontend/                      # React frontend application
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   │   ├── Header.jsx         # App header with navigation
│   │   │   ├── Sidebar.jsx        # Navigation sidebar with role switcher
│   │   │   ├── Icons.jsx          # Custom icon components
│   │   │   └── RoleDashboards.jsx # Role-specific dashboard components
│   │   ├── context/
│   │   │   └── RoleContext.jsx    # Role management context (8 roles)
│   │   ├── pages/                 # Page components
│   │   │   ├── Dashboard.jsx      # Main dashboard with role routing
│   │   │   ├── Models.jsx         # Model inventory and details
│   │   │   ├── Governance.jsx     # AI governance controls
│   │   │   ├── Analytics.jsx      # Performance analytics
│   │   │   ├── AIAssistant.jsx    # RAG-powered assistant
│   │   │   └── ...                # Additional pages
│   │   ├── styles/                # CSS stylesheets
│   │   ├── App.jsx                # Main app component with routing
│   │   └── main.jsx               # Application entry point
│   ├── package.json               # Node.js dependencies
│   └── vite.config.js             # Vite build configuration
│
├── 5_Star_UseCases/               # Production-ready use cases
│   ├── A_Core_Business_and_Revenue/
│   ├── B_Risk_Fraud_and_Financial_Crime/
│   │   ├── 01_Fraud_Management/
│   │   │   ├── data/
│   │   │   │   ├── UC-01-01/      # Real-Time Transaction Scoring
│   │   │   │   ├── UC-01-02/      # Account Takeover Detection
│   │   │   │   ├── UC-01-03/      # Synthetic Identity Detection
│   │   │   │   ├── UC-01-04/      # Merchant Fraud Detection
│   │   │   │   └── UC-01-05/      # First-Party Fraud Detection
│   │   │   └── download_and_generate.py
│   │   ├── 02_Credit_Risk_Lending/
│   │   ├── 03_AML_Financial_Crime/
│   │   └── 04_Collections_Recovery/
│   ├── C_Operations_and_Cost_Optimization/
│   │   ├── 05_Contact_Center/
│   │   ├── 06_Branch_Operations/
│   │   ├── 07_ATM_Cash_Operations/
│   │   └── 12_Workforce_HR_Management/
│   ├── D_Data_Governance_and_Platform/
│   │   └── 13_Data_AI_Governance/
│   ├── E_Technology_IT_and_Resilience/
│   ├── F_ESG_Regulatory_and_Strategic/
│   ├── G_Executive_and_Enterprise_Decisioning/
│   │   ├── 08_Treasury_Finance/
│   │   └── 14_Strategy_Transformation_Office/
│   ├── enterprise_ai_mapping.csv  # Master use case mapping
│   ├── ai_type_taxonomy.json      # AI category definitions
│   ├── 5star_master_table.csv     # Complete use case table
│   └── load_to_sqlite.py          # Database loader script
│
├── docs/                          # Documentation
│   ├── 5_Star_UseCases/           # Use case documentation
│   ├── architecture/              # System architecture docs
│   ├── ml_pipeline/               # ML pipeline documentation
│   ├── ui_specifications/         # UI/UX specifications
│   └── user_stories/              # User stories and requirements
│
├── scripts/                       # Utility scripts
├── logs/                          # Application logs
├── preprocessing_output/          # Preprocessing pipeline outputs
├── vector_store/                  # FAISS vector embeddings
│
├── *.py                           # Core ML pipeline scripts
├── config.yaml                    # Master YAML configuration
├── requirements.txt               # Python dependencies
├── .env.template                  # Environment variables template
├── pytest.ini                     # Test runner configuration
└── .gitignore                     # Git ignore rules
```

---

## Getting Started

### Prerequisites

- Python 3.9+ (tested on 3.9, 3.10, 3.11, 3.12)
- Node.js 18+ (tested on 18, 20, 22)
- Ollama (optional, for LLM features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/PraveenAsthana123/banking.git
   cd banking
   ```

2. **Set up Python environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Set up frontend**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Configure environment** (optional)
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

5. **Start Ollama** (optional, for RAG features)
   ```bash
   ollama serve
   ollama pull llama3.2
   ```

### Running the Application

**Start the API server:**
```bash
uvicorn backend.main:app --host 0.0.0.0 --port 5000 --reload
# Server runs at http://localhost:5000
# API docs at http://localhost:5000/docs (Swagger UI)
```

**Start the frontend (in another terminal):**
```bash
cd frontend
npm run dev
# UI runs at http://localhost:5173
```

---

## Core Pipelines

### 1. Preprocessing Pipeline (`preprocessing_pipeline.py`)

Handles data cleaning, transformation, and feature engineering.

```python
from preprocessing_pipeline import PreprocessingPipeline

pipeline = PreprocessingPipeline()
result = pipeline.process_use_case('UC-01-01')  # Fraud scoring
```

**Features:**
- Missing value imputation
- Outlier detection and handling
- Feature scaling and normalization
- Categorical encoding
- Data quality scoring

**Output:** `preprocessing_results.db`

---

### 2. Model Training Pipeline (`model_training_pipeline.py`)

Trains ML models for each use case with hyperparameter optimization.

```python
from model_training_pipeline import ModelTrainingPipeline

trainer = ModelTrainingPipeline()
trainer.train_use_case('UC-01-01', model_type='xgboost')
```

**Supported Models:**
- Random Forest
- XGBoost
- Logistic Regression
- Neural Networks (via sklearn)

**Output:** `ml_pipeline_results.db`, trained models in `models/`

---

### 3. AI Governance Pipeline (`ai_governance_pipeline.py`)

Provides model explainability and governance compliance.

```python
from ai_governance_pipeline import GovernancePipeline

governance = GovernancePipeline()
report = governance.generate_report('UC-01-01')
```

**Features:**
- SHAP explanations (global and local)
- LIME explanations
- Fairness metrics
- Model documentation generation
- Compliance scoring

---

### 4. RAG Pipeline (`rag_pipeline.py`)

Natural language interface to query use case documentation.

```python
from rag_pipeline import RAGPipeline

rag = RAGPipeline()
answer = rag.query("What is the ROI of the fraud detection model?")
```

**Features:**
- Document embedding (sentence-transformers)
- FAISS vector search
- Ollama LLM integration
- Query caching

See `RAG_PIPELINE_README.md` for detailed documentation.

---

### 5. Analytics Pipeline (`analytics_pipeline.py`)

Generates performance analytics and reports.

```python
from analytics_pipeline import AnalyticsPipeline

analytics = AnalyticsPipeline()
dashboard_data = analytics.get_department_metrics('Fraud_Management')
```

---

### 6. ML Job Scheduler (`ml_job_scheduler.py`)

Orchestrates pipeline execution and job management.

```bash
python ml_job_scheduler.py --schedule daily
```

**Features:**
- Cron-style scheduling
- Job queue management
- Failure recovery
- Email notifications (configurable)

---

## Frontend Application

The React frontend provides role-based dashboards for different user personas.

### User Roles

| Role | Description | Key Views |
|------|-------------|-----------|
| **Executive** | C-Suite strategic oversight | Portfolio overview, ROI metrics |
| **Business Owner** | Use case ownership | Value tracking, KPIs |
| **Data Scientist** | Model development | Experiments, model metrics |
| **Model Risk Manager** | Validation & compliance | Risk assessments, validation |
| **Operations** | Pipeline monitoring | Pipelines, incidents |
| **Compliance Officer** | Regulatory compliance | Audit trails, governance |
| **Fraud Analyst** | Alert investigation | Alert queues, case management |
| **Business Analyst** | Requirements & reporting | Reports, UAT status |

### Key Pages

- **Dashboard** (`/`) - Role-specific landing page
- **Models** (`/models`) - Model inventory and details
- **Governance** (`/governance`) - AI governance controls
- **Analytics** (`/analytics`) - Performance dashboards
- **AI Assistant** (`/ai-assistant`) - RAG-powered Q&A
- **Pipelines** (`/pipelines`) - Pipeline monitoring
- **Reports** (`/reports`) - Stakeholder reports

### Role Switching

The sidebar includes a role switcher dropdown that changes the dashboard view based on the selected role. This is managed by `RoleContext.jsx`.

---

## Use Case Framework

### 5-Star Rating System

Use cases are organized by maturity level:

| Rating | Status | Criteria |
|--------|--------|----------|
| 5-Star | Production | Full data, validated models, ROI proven |
| 4-Star | Validation | Complete data, models under review |
| 3-Star | Development | Partial data, models in training |
| 2-Star | Design | Requirements defined |
| 1-Star | Ideation | Concept only |

### Department Structure

7 major department groups with 14 subdepartments:

1. **A - Core Business & Revenue**
2. **B - Risk, Fraud & Financial Crime**
   - Fraud Management (5 use cases)
   - Credit Risk & Lending (5 use cases)
   - AML & Financial Crime (5 use cases)
   - Collections & Recovery (5 use cases)
3. **C - Operations & Cost Optimization**
   - Contact Center (5 use cases)
   - Branch Operations (5 use cases)
   - ATM & Cash Operations (5 use cases)
   - Workforce & HR (3 use cases)
4. **D - Data Governance & Platform**
   - Data & AI Governance (3 use cases)
5. **E - Technology, IT & Resilience**
6. **F - ESG, Regulatory & Strategic**
7. **G - Executive & Enterprise Decisioning**
   - Treasury & Finance (5 use cases)
   - Strategy & Transformation (3 use cases)

### AI Categories (7 Types)

1. **Business AI** - Strategic business intelligence
2. **Decision Intelligence AI** - Automated decision-making
3. **Analytic AI** - Predictive modeling
4. **Transactional Assistive AI** - Transaction support
5. **Operational AI** - Operations automation
6. **Autonomous AI** - Self-operating systems
7. **Governance Control AI** - Compliance automation

### Value Drivers (5 Types)

1. **Revenue Growth** - Revenue generation
2. **Cost Reduction / OPEX Optimization** - Cost efficiency
3. **Productivity & Speed** - Process acceleration
4. **Decision Intelligence** - Better decisions
5. **Visibility, Control & Governance** - Compliance

---

## API Reference

### Base URL
```
http://localhost:5000
```

### Public Endpoints (no auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check (status, timestamp) |
| GET | `/api/departments` | List all 14+ departments |
| GET | `/api/departments/{dept_id}` | Get single department details |
| GET | `/api/use-cases` | List all use cases with metadata |
| GET | `/api/pipelines` | List pipeline configurations |
| GET | `/api/models` | List deployed models |
| GET | `/api/stats` | Platform statistics (use case count, model count, etc.) |

### Admin Endpoints (`/api/admin/*` — auth required when `BANKING_API_KEY` is set)

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Datasets** | | |
| POST | `/api/admin/upload` | Upload dataset (CSV, JSON, XLSX, Parquet) |
| GET | `/api/admin/datasets` | List uploaded datasets |
| DELETE | `/api/admin/datasets/{id}` | Delete a dataset |
| **Statistics** | | |
| GET | `/api/admin/statistics/discover` | Discover datasets |
| GET | `/api/admin/statistics/{dataset_id}/summary` | Dataset summary stats |
| GET | `/api/admin/statistics/{dataset_id}/columns/{col}` | Column-level statistics |
| **Training** | | |
| POST | `/api/admin/training/start` | Start model training job |
| GET | `/api/admin/training/jobs` | List training jobs |
| GET | `/api/admin/training/jobs/{id}` | Get training job details + metrics |
| **Scoring** | | |
| GET | `/api/admin/scoring/models` | List available .pkl models |
| POST | `/api/admin/scoring/score` | Score a single record |
| POST | `/api/admin/scoring/batch` | Batch-score a dataset |
| **Alerts** | | |
| GET | `/api/admin/alerts` | List all alert rules |
| POST | `/api/admin/alerts` | Create alert rule |
| PUT | `/api/admin/alerts/{id}` | Update alert rule |
| DELETE | `/api/admin/alerts/{id}` | Delete alert rule |
| POST | `/api/admin/alerts/check` | Evaluate alert rules against data |
| **Process/Pipeline** | | |
| POST | `/api/admin/process/run` | Start ML pipeline for a use case |
| GET | `/api/admin/process/status/{job_id}` | Get pipeline job status |
| GET | `/api/admin/process/results/{uc_id}` | Get pipeline results |
| GET | `/api/admin/process/data-path/{uc_id}` | Get data directory for a use case |
| POST | `/api/admin/process/upload/{uc_id}` | Upload data to a use case |
| **Integrations** | | |
| GET | `/api/admin/integrations` | List integration configs |
| POST | `/api/admin/integrations` | Save integration config |
| POST | `/api/admin/integrations/{id}/test` | Test integration connection |
| **Text2SQL** | | |
| POST | `/api/admin/text2sql/generate` | Generate SQL from natural language |
| POST | `/api/admin/text2sql/execute` | Execute generated SQL |
| GET | `/api/admin/text2sql/history` | Query history |
| **Other** | | |
| GET | `/api/admin/jobs` | List all jobs |
| POST | `/api/admin/jobs/{id}/cancel` | Cancel a job |
| GET | `/api/admin/audit` | View audit log |
| GET | `/api/admin/monitoring/status` | System health and DB stats |
| POST | `/api/admin/export/batch` | Batch export reports |
| POST | `/api/admin/compare/side-by-side` | Side-by-side model comparison |

### Authentication

When `BANKING_API_KEY` is set, admin endpoints require one of:
```bash
# Bearer token
curl -H "Authorization: Bearer YOUR_KEY" http://localhost:5000/api/admin/datasets

# X-API-Key header
curl -H "X-API-Key: YOUR_KEY" http://localhost:5000/api/admin/datasets
```

### Response Format

**Success:**
```json
{"message": "Operation completed successfully"}
```

**Error (consistent envelope):**
```json
{"detail": "Human-readable message", "error_code": "NOT_FOUND"}
```

Every response includes `X-Correlation-ID` header for request tracing.

---

## Configuration

### Environment Variables

All backend settings use the `BANKING_` prefix and are managed via Pydantic `BaseSettings` in `backend/core/config.py`.

| Variable | Default | Description |
|----------|---------|-------------|
| `BANKING_BASE_DIR` | Auto-detected | Base directory path |
| `BANKING_CORS_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Allowed CORS origins (comma-separated) |
| `BANKING_API_KEY` | *(empty = auth disabled)* | API key for admin endpoints |
| `BANKING_RATE_LIMIT` | `100` | Max requests per minute per IP on admin endpoints |
| `BANKING_OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama LLM server URL |
| `BANKING_OLLAMA_MODEL` | `llama3.2` | Default LLM model name |
| `BANKING_LOG_LEVEL` | `INFO` | Logging level |
| `BANKING_ENCRYPTION_KEY` | Auto-generated | Fernet key for encrypting secrets in DB |

### Configuration Files

| File | Purpose |
|------|---------|
| `backend/core/config.py` | Pydantic `BaseSettings` — single source of truth for all config |
| `.env.template` | Documents all `BANKING_*` environment variables with defaults |
| `config.yaml` | Master YAML configuration for ML pipelines |

### Setting Up Environment

```bash
cp .env.template .env
# Edit .env with your settings
```

---

## Security

### Security Features

| Feature | Implementation | Location |
|---------|---------------|----------|
| **API Key Authentication** | Bearer token or `X-API-Key` header | `backend/core/auth.py` |
| **Rate Limiting** | Per-IP, 100 req/min on admin endpoints, 429 response | `backend/core/middleware.py` |
| **Security Headers** | CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy | `backend/core/middleware.py` |
| **Correlation IDs** | UUID on every request/response for tracing | `backend/core/middleware.py` |
| **Encryption at Rest** | Fernet symmetric encryption for passwords/API keys stored in DB | `backend/core/encryption.py` |
| **SQL Injection Prevention** | Parameterized queries in repos; `sanitize_table_name()` for dynamic table names | `backend/core/utils.py` |
| **CORS Restriction** | Origins from `BANKING_CORS_ORIGINS` config, never `*` | `backend/main.py` |
| **Input Validation** | Pydantic models for all request bodies; regex allowlist for subprocess args | `backend/schemas/`, `backend/core/utils.py` |
| **Path Traversal Prevention** | `.resolve()` + `startswith()` guards on file paths | `backend/routers/logs.py` |
| **File Upload Validation** | Extension allowlist + size limit (500MB) | `backend/routers/upload.py`, `backend/routers/process.py` |

### Security Headers (on every response)

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## Testing

### Running Tests

```bash
# Run all 115 tests
PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 python -m pytest backend/tests/ -v

# Run with coverage
PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 python -m pytest backend/tests/ --cov=backend --cov-report=html

# Run specific test file
PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 python -m pytest backend/tests/test_alerts.py -v
```

### Test Categories

| Category | Tests | File |
|----------|-------|------|
| Alert CRUD | Create, read, update, delete, check triggers | `test_alerts.py` |
| Authentication | Auth disabled/enabled, bearer token, X-API-Key, 401 responses | `test_auth.py` |
| Encryption | Round-trip, unicode, empty values, wrong key graceful failure | `test_encryption.py` |
| Health/Public | Health endpoint, departments, stats | `test_health.py` |
| Job Management | List, cancel queued/running/completed, idempotency | `test_jobs.py` |
| File Upload | CSV/JSON upload, invalid extensions, malformed data, delete | `test_upload.py` |
| Utilities | `validate_use_case_key`, `sanitize_table_name`, `human_size` | `test_utils.py` |

### Test Infrastructure

- Isolated temp DB per test session (`conftest.py`)
- FastAPI `TestClient` with dependency overrides
- No external services required (Ollama, Redis, PostgreSQL mocked)

---

## Development

### Code Style

- Python: PEP 8, 120 char line length
- JavaScript: ESLint with React plugin
- YAML: 2-space indentation

### Code Architecture Rules

| Rule | Details |
|------|---------|
| No SQL in routers | All SQL lives in `backend/repositories/` |
| No `HTTPException` in services | Raise domain exceptions (`NotFoundError`, `ValidationError`, etc.) |
| No global mutable state | Caches/maps in instance attributes, not module-level dicts |
| `response_model=` on all endpoints | Pydantic models for request and response |
| `Depends()` for everything | Settings, repos, and services injected via FastAPI DI |
| Parameterized queries only | No f-string SQL; `sanitize_table_name()` for dynamic table names |

### Database Schema

The platform uses SQLite for simplicity and portability:

| Database | Purpose |
|----------|---------|
| `banking_admin.db` | Admin state: datasets, alerts, jobs, integrations, audit log |
| `banking_unified.db` | Main data warehouse (2.1 GB) — use case metrics, results |
| `ml_pipeline_results.db` | ML training results |
| `preprocessing_results.db` | Data processing results |
| `rag_cache.db` | RAG query cache |

### Adding a New Use Case

1. Create data folder: `5_Star_UseCases/{dept}/data/UC-XX-XX/`
2. Add to mapping: `enterprise_ai_mapping.csv`
3. Create documentation in `docs/5_Star_UseCases/`
4. Run preprocessing: `python preprocessing_pipeline.py --use-case UC-XX-XX`
5. Train models: `python model_training_pipeline.py --use-case UC-XX-XX`

---

## Changelog

### Backend Refactoring (Phase 0-5)

Production-grade refactoring following industry coding standards.

#### Phase 0: Foundation
- Pydantic `BaseSettings` with `BANKING_` env prefix (`backend/core/config.py`)
- Custom exception taxonomy: `AppError` -> `NotFoundError`, `ValidationError`, `DataError`, `ModelError`, `ExternalServiceError`
- Global error handlers mapping exceptions to HTTP status codes
- `CorrelationIdMiddleware` injecting `X-Correlation-ID` on every request
- `ApiKeyMiddleware` with env-driven auth (disabled when key not set)
- Fernet encryption for secrets stored in DB
- JSON structured logging with correlation IDs
- DI factories in `backend/core/dependencies.py`

#### Phase 1: Repository Layer
- Created `SQLiteRepository` base class with `_connect()` context manager
- Extracted all SQL into 6 repository classes: `AlertRepo`, `AuditRepo`, `DatasetRepo`, `IntegrationRepo`, `JobRepo`, `Text2SqlRepo`
- WAL mode and `busy_timeout=5000` on all SQLite connections

#### Phase 2: Router Migration
- Migrated all 16 routers from raw `get_admin_db()` to injected repositories via `Depends()`
- Replaced `HTTPException` with domain exceptions in routers
- Eliminated all inline SQL from router files

#### Phase 3: Service Layer
- Converted to class-based services: `AnalysisService`, `ModelService`, `OllamaService`, `TrainingService`
- Constructor injection for all dependencies
- Moved `_model_cache` global into `ModelService` instance attribute

#### Phase 4: Schemas and Cleanup
- Extracted inline Pydantic models from 10 routers into `backend/schemas/` files
- Added `response_model=` to all endpoint decorators
- Moved inline endpoints from `main.py` to `backend/routers/public.py`
- Added `GZipMiddleware` for response compression
- Cleaned up unused imports across all routers

#### Phase 5: Security Hardening
- Added `SecurityHeadersMiddleware` (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- Added `RateLimitMiddleware` (per-IP, configurable via `BANKING_RATE_LIMIT`)
- Applied `sanitize_table_name()` to all dynamic SQL table references in `metrics.py`, `monitoring.py`, `jobs.py`, `text2sql.py`
- Eliminated module-level mutable state (`UC_PREPROCESS_MAP` in `process.py`)
- CORS restricted to configured origins (never `allow_origins=["*"]`)

#### Files Changed Summary

| Category | Files Created | Files Modified |
|----------|--------------|----------------|
| Core infrastructure | 8 | 0 |
| Repositories | 7 | 0 |
| Schemas | 12 | 0 |
| Services | 4 | 1 |
| Routers | 1 (`public.py`) | 16 |
| Tests | 7 | 0 |
| Config | 1 (`.env.template`) | 1 (`main.py`) |
| **Total** | **40** | **18** |

---

## License

MIT License - See LICENSE file for details.

---

## Support

- **Issues**: [GitHub Issues](https://github.com/PraveenAsthana123/banking/issues)
- **Documentation**: See `docs/` folder
- **Quick Start**: See `RAG_QUICK_START.md`
