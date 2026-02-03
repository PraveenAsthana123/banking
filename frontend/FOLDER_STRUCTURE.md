# Banking ML Pipeline UI - Folder Structure

```
frontend/
├── dist/                          # Production build output
│   └── assets/
│       ├── index-*.js            # Bundled JavaScript
│       └── index-*.css           # Bundled CSS
│
├── node_modules/                  # Dependencies (not in git)
│
├── public/                        # Static assets
│   └── favicon.svg               # App favicon
│
├── src/                           # Source code
│   ├── components/               # Reusable UI components
│   │   ├── Header.jsx            # Top navigation header
│   │   ├── Icons.jsx             # Icon component library
│   │   ├── RoleDashboards.jsx    # Role-specific dashboard components
│   │   └── Sidebar.jsx           # Navigation sidebar
│   │
│   ├── context/                  # React Context providers
│   │   └── RoleContext.jsx       # Role management context (8 roles)
│   │
│   ├── data/                     # Static data and configurations
│   │   ├── analysisTypes.js      # Analysis type definitions
│   │   └── departments.js        # Department and use case data
│   │
│   ├── hooks/                    # Custom React hooks
│   │   └── (custom hooks)
│   │
│   ├── pages/                    # Page components (routes)
│   │   ├── AIAssistant.jsx       # AI Assistant chat interface
│   │   ├── AIImpact.jsx          # AI Impact analysis page
│   │   ├── Analytics.jsx         # Analytics dashboard
│   │   ├── Dashboard.jsx         # Main dashboard
│   │   ├── DataAnalysis.jsx      # Data analysis tools
│   │   ├── DemoScenarios.jsx     # Demo scenario builder
│   │   ├── Department.jsx        # Department detail page
│   │   ├── Governance.jsx        # Model governance page
│   │   ├── ModelAnalysis.jsx     # Model analysis tools
│   │   ├── Models.jsx            # Model registry page
│   │   ├── Pipelines.jsx         # ML pipeline management
│   │   ├── Reports.jsx           # Report generation
│   │   ├── RoleDashboards.jsx    # Role-specific dashboards
│   │   ├── Settings.jsx          # App settings
│   │   ├── StakeholderReports.jsx # Stakeholder report views
│   │   └── UseCase.jsx           # Use case detail page (40+ tabs)
│   │
│   ├── services/                 # API and external services
│   │   └── (API clients)
│   │
│   ├── styles/                   # Global styles
│   │   └── index.css             # Main stylesheet
│   │
│   ├── utils/                    # Utility functions
│   │   └── (helper functions)
│   │
│   ├── App.jsx                   # Root app component with routing
│   └── main.jsx                  # Application entry point
│
├── index.html                    # HTML template
├── package.json                  # Dependencies and scripts
├── package-lock.json             # Locked dependency versions
└── vite.config.js                # Vite build configuration
```

## Key Pages Overview

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Main overview with KPIs, charts |
| Department | `/department/:deptId` | Department details with use cases |
| UseCase | `/department/:deptId/:useCaseId` | Detailed use case view (40+ tabs) |
| Models | `/models` | Model registry and management |
| Pipelines | `/pipelines` | ML pipeline orchestration |
| Analytics | `/analytics` | Advanced analytics dashboard |
| Governance | `/governance` | Model governance and compliance |
| Settings | `/settings` | Application configuration |
| Data Analysis | `/data-analysis/:useCaseId` | EDA, accuracy, benchmarking |
| Stakeholder Reports | `/stakeholder-reports/:useCaseId` | Role-based reports |
| AI Impact | `/ai-impact/:useCaseId` | ROI and impact analysis |
| Model Analysis | `/model-analysis/:useCaseId` | Deep model diagnostics |

## Departments (8)

1. **Fraud Detection** - Transaction fraud, AML, identity verification
2. **Credit Analysis** - Risk scoring, loan approval, credit limits
3. **Customer Analytics** - Churn prediction, segmentation, LTV
4. **Investment Banking** - Portfolio optimization, market prediction
5. **Retail Banking** - Product recommendation, pricing
6. **Risk Management** - Market risk, operational risk
7. **Compliance** - Regulatory reporting, audit
8. **Treasury** - Cash flow, FX optimization

## User Roles (8)

1. Executive
2. Business Owner
3. Data Scientist
4. MRM (Model Risk Management)
5. Operations
6. Compliance
7. Fraud Analyst
8. Business Analyst

## Tech Stack

- **React 18** - UI framework
- **React Router** - Client-side routing
- **Recharts** - Charts and visualizations
- **Vite** - Build tool
- **CSS Variables** - Theming and styling
