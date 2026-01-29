# Banking AI/ML Platform

Enterprise-grade AI/ML governance and operations platform for banking use cases. This platform provides comprehensive tooling for managing AI models across fraud detection, credit risk, AML compliance, and 14+ banking departments.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Core Pipelines](#core-pipelines)
- [Frontend Application](#frontend-application)
- [Use Case Framework](#use-case-framework)
- [API Reference](#api-reference)
- [Configuration](#configuration)
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

---

## Architecture

```
                                    +------------------+
                                    |   Frontend UI    |
                                    |  (React + Vite)  |
                                    +--------+---------+
                                             |
                                             v
+------------------+              +----------+---------+
|   Ollama LLM     |<------------>|    API Server     |
|   (llama3.2)     |              |     (Flask)       |
+------------------+              +----------+---------+
                                             |
              +------------------------------+------------------------------+
              |                              |                              |
              v                              v                              v
    +---------+--------+          +----------+---------+          +---------+--------+
    | Preprocessing    |          | ML Training        |          | RAG Pipeline     |
    | Pipeline         |          | Pipeline           |          |                  |
    +---------+--------+          +----------+---------+          +---------+--------+
              |                              |                              |
              v                              v                              v
    +---------+--------+          +----------+---------+          +---------+--------+
    | preprocessing_   |          | ml_pipeline_       |          | vector_store/    |
    | results.db       |          | results.db         |          | (FAISS)          |
    +------------------+          +--------------------+          +------------------+
              |                              |
              +------------------------------+
                             |
                             v
                  +----------+---------+
                  | banking_unified.db |
                  | (2.1 GB SQLite)    |
                  +--------------------+
```

---

## Folder Structure

```
Banking/
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
│   │   ├── README.md              # Use case framework overview
│   │   ├── Fraud_Management/
│   │   │   └── AI_Use_Cases/
│   │   │       └── 3_Analytic_AI/
│   │   │           └── Revenue_Growth/
│   │   │               └── UC-FR-01_Real_Time_Fraud_Risk_Scoring/
│   │   │                   ├── AI_Models/
│   │   │                   │   ├── ML/
│   │   │                   │   ├── DL/
│   │   │                   │   └── Hybrid_Ensemble/
│   │   │                   └── Business_Metrics/
│   │   │                       ├── ROI.yaml
│   │   │                       ├── KPI.yaml
│   │   │                       ├── Value.yaml
│   │   │                       ├── Maturity.yaml
│   │   │                       └── Satisfaction.yaml
│   │   └── [13 more departments]/
│   ├── architecture/              # System architecture docs
│   ├── ml_pipeline/               # ML pipeline documentation
│   ├── ui_specifications/         # UI/UX specifications
│   └── user_stories/              # User stories and requirements
│
├── scripts/                       # Utility scripts
│   └── generate_use_case_docs.py  # Documentation generator
│
├── logs/                          # Application logs
├── preprocessing_output/          # Preprocessing pipeline outputs
├── vector_store/                  # FAISS vector embeddings
│
├── *.py                           # Core Python modules (see below)
├── config.py                      # Python configuration
├── config.yaml                    # Master YAML configuration
├── requirements.txt               # Python dependencies
├── .env.example                   # Environment variables template
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
python api_server.py
# Server runs at http://localhost:5000
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
http://localhost:5000/api/v1
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/use-cases` | List all use cases |
| GET | `/use-cases/{id}` | Get use case details |
| GET | `/models` | List all models |
| GET | `/models/{id}` | Get model details |
| POST | `/rag/query` | RAG query |
| GET | `/metrics/department/{name}` | Department metrics |
| GET | `/metrics/summary` | Overall summary |

### Example: RAG Query
```bash
curl -X POST http://localhost:5000/api/v1/rag/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the ROI of fraud detection?"}'
```

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BANKING_BASE_DIR` | Script location | Base directory path |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `llama3.2` | Default LLM model |
| `SAMPLE_LIMIT` | `500000` | Max rows to process |
| `MAX_WORKERS` | `8` | Parallel workers |
| `LOG_LEVEL` | `INFO` | Logging level |
| `API_PORT` | `5000` | API server port |

### Configuration Files

- **`config.py`** - Python configuration with path management
- **`config.yaml`** - Master YAML configuration (comprehensive)
- **`.env`** - Environment-specific overrides

---

## Development

### Running Tests

```bash
# Run all tests
pytest tests.py -v

# Run with coverage
pytest tests.py --cov=. --cov-report=html
```

### Code Style

- Python: PEP 8
- JavaScript: ESLint with React plugin
- YAML: 2-space indentation

### Database Schema

The platform uses SQLite for simplicity and portability:

- **`banking_unified.db`** - Main data warehouse (2.1 GB)
- **`ml_pipeline_results.db`** - ML training results
- **`preprocessing_results.db`** - Data processing results
- **`rag_cache.db`** - RAG query cache

### Adding a New Use Case

1. Create data folder: `5_Star_UseCases/{dept}/data/UC-XX-XX/`
2. Add to mapping: `enterprise_ai_mapping.csv`
3. Create documentation in `docs/5_Star_UseCases/`
4. Run preprocessing: `python preprocessing_pipeline.py --use-case UC-XX-XX`
5. Train models: `python model_training_pipeline.py --use-case UC-XX-XX`

---

## License

MIT License - See LICENSE file for details.

---

## Support

- **Issues**: [GitHub Issues](https://github.com/PraveenAsthana123/banking/issues)
- **Documentation**: See `docs/` folder
- **Quick Start**: See `RAG_QUICK_START.md`
