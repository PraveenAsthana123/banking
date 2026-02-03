// Folder Structure based on 5_Star_UseCases directory
// Matches the actual folder hierarchy

export const folderStructure = [
  {
    id: 'A',
    code: 'A',
    name: 'Core Business & Revenue',
    icon: 'trending-up',
    color: '#10b981',
    path: 'A_Core_Business_and_Revenue',
    subdepartments: [
      { id: '02', name: 'Corporate Banking', path: '02_Corporate_Banking', icon: 'building', useCases: 10 },
      { id: '05', name: 'Lending (Retail & SME)', path: '05_Lending_Retail_and_SME', icon: 'dollar', useCases: 5 },
      { id: '06', name: 'Marketing Intelligence', path: 'Marketing_Intelligence', icon: 'eye', useCases: 12 },
      { id: '04', name: 'Payments & Cards', path: '04_Payments_and_Cards', icon: 'credit-card', useCases: 5 },
      { id: '01', name: 'Retail Banking & Digital Channels', path: '01_Retail_Banking_Digital_Channels', icon: 'smartphone', useCases: 10 },
      { id: '07', name: 'Sales & CRM', path: 'Sales_CRM', icon: 'trending-up', useCases: 9 },
      { id: '03', name: 'Wealth Management', path: '03_Wealth_Management', icon: 'briefcase', useCases: 5 },
    ]
  },
  {
    id: 'B',
    code: 'B',
    name: 'Risk, Fraud & Financial Crime',
    icon: 'shield',
    color: '#ef4444',
    path: 'B_Risk_Fraud_and_Financial_Crime',
    subdepartments: [
      { id: '03', name: 'AML & Financial Crime', path: '03_AML_Financial_Crime', icon: 'search', useCases: 6 },
      { id: '04', name: 'Collections & Recovery', path: '04_Collections_Recovery', icon: 'phone', useCases: 6 },
      { id: '11', name: 'Collateral Management', path: 'Collateral_Management', icon: 'layers', useCases: 3 },
      { id: '02', name: 'Credit Risk & Lending', path: '02_Credit_Risk_Lending', icon: 'credit-card', useCases: 7 },
      { id: '01', name: 'Fraud Management', path: '01_Fraud_Management', icon: 'alert-triangle', useCases: 7 },
      { id: '10', name: 'Model Risk Management', path: '10_Model_Risk_Management', icon: 'clipboard-check', useCases: 3 },
    ]
  },
  {
    id: 'C',
    code: 'C',
    name: 'Operations & Cost Optimization',
    icon: 'cog',
    color: '#f59e0b',
    path: 'C_Operations_and_Cost_Optimization',
    subdepartments: [
      { id: '07', name: 'ATM & Cash Operations', path: '07_ATM_Cash_Operations', icon: 'credit-card-2', useCases: 6 },
      { id: '06', name: 'Branch Operations', path: '06_Branch_Operations', icon: 'building', useCases: 6 },
      { id: '05', name: 'Contact Center', path: '05_Contact_Center', icon: 'headphones', useCases: 7 },
      { id: '15', name: 'Dispute & Chargeback', path: '15_Dispute_and_Chargeback_Operations', icon: 'alert-circle', useCases: 3 },
      { id: '16', name: 'Knowledge Management', path: 'Knowledge_Management', icon: 'search', useCases: 7 },
      { id: '12', name: 'Workforce & HR Management', path: '12_Workforce_HR_Management', icon: 'users', useCases: 7 },
    ]
  },
  {
    id: 'D',
    code: 'D',
    name: 'Data Governance & Platform',
    icon: 'database',
    color: '#3b82f6',
    path: 'D_Data_Governance_and_Platform',
    subdepartments: [
      { id: '20', name: 'AI FinOps & Cost Governance', path: '20_AI_FinOps_Cost_Governance', icon: 'dollar', useCases: 3 },
      { id: '13', name: 'Data & AI Governance', path: '13_Data_AI_Governance', icon: 'governance', useCases: 7 },
      { id: '16', name: 'Data Governance & Quality', path: '16_Data_Governance_and_Quality', icon: 'check-circle', useCases: 3 },
      { id: '17', name: 'Enterprise Analytics & BI', path: '17_Enterprise_Analytics_BI', icon: 'analytics', useCases: 3 },
      { id: '18', name: 'Responsible AI Governance', path: '18_Responsible_AI_Governance', icon: 'shield', useCases: 3 },
    ]
  },
  {
    id: 'E',
    code: 'E',
    name: 'Technology, IT & Resilience',
    icon: 'cpu',
    color: '#8b5cf6',
    path: 'E_Technology_IT_and_Resilience',
    subdepartments: [
      { id: '25', name: 'Cloud & Infrastructure Ops', path: '25_Cloud_and_Infrastructure_Ops', icon: 'cloud', useCases: 3 },
      { id: '23', name: 'Cybersecurity', path: '23_Cybersecurity', icon: 'lock', useCases: 3 },
      { id: '22', name: 'Enterprise Architecture', path: '22_Enterprise_Architecture', icon: 'layers', useCases: 3 },
      { id: '24', name: 'Identity & Access Management', path: '24_Identity_and_Access_Management', icon: 'user-check', useCases: 3 },
      { id: '21', name: 'IT Operations & AIOps', path: '21_IT_Operations_AIOps', icon: 'server', useCases: 7 },
    ]
  },
  {
    id: 'F',
    code: 'F',
    name: 'ESG, Regulatory & Strategic',
    icon: 'globe',
    color: '#059669',
    path: 'F_ESG_Regulatory_and_Strategic',
    subdepartments: [
      { id: '30', name: 'Carbon Accounting', path: '30_Carbon_Accounting', icon: 'pie-chart', useCases: 3 },
      { id: '26', name: 'ESG & Climate Risk', path: '26_ESG_Reporting_and_Disclosure', icon: 'file', useCases: 10 },
      { id: '29', name: 'ESG Data Governance', path: '29_ESG_Data_Governance_and_Assurance', icon: 'database', useCases: 3 },
      { id: '28', name: 'Green & Sustainable Finance', path: '28_Green_Sustainable_Finance', icon: 'leaf', useCases: 3 },
    ]
  },
  {
    id: 'G',
    code: 'G',
    name: 'Executive & Enterprise Decisioning',
    icon: 'briefcase',
    color: '#7c3aed',
    path: 'G_Executive_and_Enterprise_Decisioning',
    subdepartments: [
      { id: '34', name: 'Enterprise Risk Management', path: '34_Enterprise_Risk_Management', icon: 'shield', useCases: 7 },
      { id: '14', name: 'Strategy & Transformation', path: '14_Strategy_Transformation_Office', icon: 'target', useCases: 13 },
      { id: '08', name: 'Treasury & Finance', path: '08_Treasury_Finance', icon: 'landmark', useCases: 13 },
    ]
  }
];

// AI Categories (7 types) - matches folder structure
export const aiCategories = [
  { id: '1', name: 'Business AI', path: '1_Business_AI', icon: 'briefcase', color: '#3b82f6' },
  { id: '2', name: 'Decision Intelligence AI', path: '2_Decision_Intelligence_AI', icon: 'brain', color: '#10b981' },
  { id: '3', name: 'Analytic AI', path: '3_Analytic_AI', icon: 'analytics', color: '#f59e0b' },
  { id: '4', name: 'Transactional Assistive AI', path: '4_Transactional_Assistive_AI', icon: 'zap', color: '#ef4444' },
  { id: '5', name: 'Operational AI', path: '5_Operational_AI', icon: 'cog', color: '#8b5cf6' },
  { id: '6', name: 'Autonomous AI', path: '6_Autonomous_AI', icon: 'cpu', color: '#0891b2' },
  { id: '7', name: 'Governance Control AI', path: '7_Governance_Control_AI', icon: 'shield', color: '#dc2626' },
];

// Value Drivers (5 types) - matches folder structure
export const valueDrivers = [
  { id: 'A', name: 'Revenue Growth', path: 'Revenue_Growth', icon: 'trending-up', color: '#10b981' },
  { id: 'B', name: 'Cost Reduction / OPEX', path: 'Cost_Reduction_OPEX_Optimization', icon: 'dollar', color: '#ef4444' },
  { id: 'C', name: 'Productivity & Speed', path: 'Productivity_Speed', icon: 'zap', color: '#f59e0b' },
  { id: 'D', name: 'Decision Intelligence', path: 'Decision_Intelligence', icon: 'brain', color: '#3b82f6' },
  { id: 'E', name: 'Visibility & Governance', path: 'Visibility_Control_Governance', icon: 'eye', color: '#8b5cf6' },
];

// Helper function to get department by ID
export const getDepartmentById = (groupId, deptId) => {
  const group = folderStructure.find(g => g.id === groupId);
  if (!group) return null;
  return group.subdepartments.find(d => d.id === deptId);
};

// Helper function to get group by ID
export const getGroupById = (groupId) => {
  return folderStructure.find(g => g.id === groupId);
};

// Get total use cases count
export const getTotalUseCases = () => {
  return folderStructure.reduce((total, group) => {
    return total + group.subdepartments.reduce((groupTotal, dept) => groupTotal + dept.useCases, 0);
  }, 0);
};

// Get total departments count
export const getTotalDepartments = () => {
  return folderStructure.reduce((total, group) => total + group.subdepartments.length, 0);
};

// Detailed Use Cases by Department
export const departmentUseCases = {
  // Department 13: Data & AI Governance
  'D-13': {
    name: 'Data Governance & AI Governance',
    description: 'This department underpins every AI system by ensuring: Visibility, control & governance (mandatory), Decision intelligence (go/no-go, scale/stop), Risk reduction (model, data, compliance), Trust (regulators, board, customers, employees)',
    rating: 5,
    useCases: [
      {
        id: 'UC-GOV-01',
        name: 'Data Quality & Anomaly Monitoring',
        valueDriver: 'Visibility, Control & Governance',
        aiCategory: 'Governance & Control AI',
        dataType: 'CSV (profiles, stats)',
        aiApproach: 'ML (Anomaly Detection)',
        publicDataSource: 'OpenML benchmark datasets',
        downloadLink: 'https://www.openml.org/'
      },
      {
        id: 'UC-GOV-02',
        name: 'Model Drift & Bias Detection',
        valueDriver: 'Visibility, Control & Governance',
        aiCategory: 'Governance & Control AI',
        dataType: 'CSV (predictions, features)',
        aiApproach: 'ML + DL (Drift/Fairness)',
        publicDataSource: 'UCI ML datasets',
        downloadLink: 'https://archive.ics.uci.edu/ml'
      },
      {
        id: 'UC-GOV-03',
        name: 'AI Risk Classification & Approval (ISO 42001)',
        valueDriver: 'Decision Intelligence',
        aiCategory: 'Governance & Control AI',
        dataType: 'CSV + Rules',
        aiApproach: 'ML + Rules (Ensemble)',
        publicDataSource: 'NIST AI RMF examples',
        downloadLink: 'https://www.nist.gov/itl/ai-risk-management-framework'
      },
      {
        id: 'UC-GOV-04',
        name: 'End-to-End Data Lineage & Provenance Tracking',
        valueDriver: 'Visibility, Control & Governance',
        aiCategory: 'Governance & Control AI',
        dataType: 'Logs + Metadata',
        aiApproach: 'ML (Pattern Detection)',
        publicDataSource: 'Open metadata samples',
        downloadLink: 'https://github.com/open-metadata/OpenMetadata'
      },
      {
        id: 'UC-GOV-05',
        name: 'AI Governance & Policy Copilot',
        valueDriver: 'Productivity & Speed',
        aiCategory: 'Transactional AI',
        dataType: 'Text',
        aiApproach: 'RAG + NLP (Hybrid)',
        publicDataSource: 'ISO / NIST / OECD AI docs',
        downloadLink: 'https://www.oecd.org/ai/principles/'
      },
      {
        id: 'UC-GOV-06',
        name: 'AI Portfolio Prioritization & Value Scoring',
        valueDriver: 'Decision Intelligence',
        aiCategory: 'Business AI',
        dataType: 'CSV (portfolio metrics)',
        aiApproach: 'ML + Optimization (Hybrid)',
        publicDataSource: 'World Bank innovation data',
        downloadLink: 'https://databank.worldbank.org'
      },
      {
        id: 'UC-GOV-07',
        name: 'AI Kill-Switch & Incident Response Automation',
        valueDriver: 'Visibility, Control & Governance',
        aiCategory: 'Governance & Control AI',
        dataType: 'Logs + CSV',
        aiApproach: 'ML + Rules (Ensemble)',
        publicDataSource: 'Incident mgmt samples',
        downloadLink: 'https://github.com/logpai/loghub'
      }
    ],
    dataTypeMapping: [
      { dataType: 'Structured CSV', examples: 'Data quality stats, KPIs', bestTechnique: 'ML' },
      { dataType: 'Prediction CSV', examples: 'Scores, labels', bestTechnique: 'Drift / bias ML' },
      { dataType: 'Logs / Metadata', examples: 'Pipelines, access', bestTechnique: 'ML pattern detection' },
      { dataType: 'Text', examples: 'Policies, standards', bestTechnique: 'NLP' },
      { dataType: 'Text + CSV', examples: 'Controls + metrics', bestTechnique: 'RAG (Hybrid)' },
      { dataType: 'Rules + Scores', examples: 'Risk tiers, approvals', bestTechnique: 'Ensemble' }
    ]
  },

  // Department 14: Strategy & Transformation Office
  'G-14': {
    name: 'Strategy / Transformation Office',
    description: 'Enterprise strategy and transformation initiatives with AI-powered decision support',
    rating: 5,
    useCases: [
      {
        id: 'UC-ST-01',
        name: 'Enterprise Strategy Scenario Simulator',
        valueDriver: 'Revenue Growth',
        aiCategory: 'Business AI',
        dataType: 'CSV (financial & KPI data)',
        aiApproach: 'ML + DL (Simulation / Optimization)',
        publicDataSource: 'Macro & financial indicators',
        downloadLink: 'https://databank.worldbank.org'
      },
      {
        id: 'UC-ST-02',
        name: 'AI Portfolio Prioritization & Value Scoring',
        valueDriver: 'Decision Intelligence',
        aiCategory: 'Business AI',
        dataType: 'CSV (portfolio metrics)',
        aiApproach: 'ML + Optimization (Hybrid)',
        publicDataSource: 'Innovation & R&D indicators',
        downloadLink: 'https://databank.worldbank.org'
      },
      {
        id: 'UC-ST-03',
        name: 'Transformation ROI Tracking & Benefits Realization',
        valueDriver: 'Cost Reduction / OPEX',
        aiCategory: 'Business AI',
        dataType: 'CSV (program metrics)',
        aiApproach: 'ML (Trend / Forecasting)',
        publicDataSource: 'Program performance proxy',
        downloadLink: 'https://www.kaggle.com/datasets'
      },
      {
        id: 'UC-ST-04',
        name: 'Transformation Risk & Dependency Monitoring',
        valueDriver: 'Visibility, Control & Governance',
        aiCategory: 'Analytic AI',
        dataType: 'CSV + Text',
        aiApproach: 'ML + NLP (Hybrid)',
        publicDataSource: 'Project risk data',
        downloadLink: 'https://www.kaggle.com/datasets'
      },
      {
        id: 'UC-ST-05',
        name: 'Transformation Playbook & Execution Copilot',
        valueDriver: 'Productivity & Speed',
        aiCategory: 'Transactional AI',
        dataType: 'Text',
        aiApproach: 'RAG + NLP (Hybrid)',
        publicDataSource: 'Public transformation frameworks',
        downloadLink: 'https://www.mckinsey.com/featured-insights'
      },
      {
        id: 'UC-ST-06',
        name: 'Funding Wave & Roadmap Optimization',
        valueDriver: 'Decision Intelligence',
        aiCategory: 'Decision Intelligence AI',
        dataType: 'CSV + Rules',
        aiApproach: 'ML + Rules (Ensemble)',
        publicDataSource: 'Capital allocation data',
        downloadLink: 'https://databank.worldbank.org'
      },
      {
        id: 'UC-ST-07',
        name: 'Transformation KPI & Board Reporting Automation',
        valueDriver: 'Visibility, Control & Governance',
        aiCategory: 'Governance & Control AI',
        dataType: 'CSV + Text',
        aiApproach: 'NLP + RAG (Hybrid)',
        publicDataSource: 'Annual reports',
        downloadLink: 'https://www.sec.gov/edgar'
      }
    ]
  },

  // Department B-01: Fraud Management
  'B-01': {
    name: 'Fraud Management',
    description: 'Real-time fraud detection, investigation support, and risk exposure monitoring',
    rating: 5,
    useCases: [
      { id: 'UC-FR-01', name: 'Real-Time Transaction Fraud Scoring', valueDriver: 'Revenue Growth', aiCategory: 'Analytic AI', dataType: 'CSV (structured)', aiApproach: 'ML + DL (Ensemble)', publicDataSource: 'Credit card transactions', downloadLink: 'https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud' },
      { id: 'UC-FR-02', name: 'Sequential / Behavioral Fraud Detection', valueDriver: 'Revenue Growth', aiCategory: 'Analytic AI', dataType: 'CSV (time-series)', aiApproach: 'DL (LSTM / Transformer)', publicDataSource: 'Transaction sequences', downloadLink: 'https://www.kaggle.com/competitions/ieee-fraud-detection' },
      { id: 'UC-FR-03', name: 'Merchant / Device Fraud Pattern Detection', valueDriver: 'Cost Reduction', aiCategory: 'Analytic AI', dataType: 'CSV (graph)', aiApproach: 'ML + DL (Graph / Ensemble)', publicDataSource: 'Financial network transactions', downloadLink: 'https://www.kaggle.com/datasets/ellipticco/elliptic-data-set' },
      { id: 'UC-FR-04', name: 'Fraud Investigation Copilot', valueDriver: 'Productivity & Speed', aiCategory: 'Transactional AI', dataType: 'Text + CSV', aiApproach: 'RAG + NLP (Hybrid)', publicDataSource: 'Consumer fraud complaints', downloadLink: 'https://www.kaggle.com/datasets/cfpb/us-consumer-finance-complaints' },
      { id: 'UC-FR-05', name: 'Fraud Risk Exposure Monitoring', valueDriver: 'Visibility & Governance', aiCategory: 'Analytic AI', dataType: 'CSV + Text', aiApproach: 'ML + NLP (Hybrid)', publicDataSource: 'Fraud typologies & reports', downloadLink: 'https://www.fatf-gafi.org/en/publications.html' },
      { id: 'UC-FR-06', name: 'Fraud Decision Optimization (Block / Review)', valueDriver: 'Decision Intelligence', aiCategory: 'Decision Intelligence AI', dataType: 'CSV + Rules', aiApproach: 'ML + Rules (Ensemble)', publicDataSource: 'Synthetic payment simulator', downloadLink: 'https://www.kaggle.com/datasets/ealaxi/paysim1' },
      { id: 'UC-FR-07', name: 'False Positive Reduction Engine', valueDriver: 'Cost Reduction', aiCategory: 'Operational AI', dataType: 'CSV', aiApproach: 'ML Ensemble', publicDataSource: 'Card transaction data', downloadLink: 'https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud' }
    ]
  },

  // Department B-02: Credit Risk & Lending
  'B-02': {
    name: 'Credit Risk & Lending',
    description: 'Credit scoring, loan approval, risk-based pricing, and portfolio management',
    rating: 5,
    useCases: [
      { id: 'UC-CR-01', name: 'Credit Scoring (PD Model)', valueDriver: 'Revenue Growth', aiCategory: 'Analytic AI', dataType: 'CSV (tabular)', aiApproach: 'ML (XGBoost / LR)', publicDataSource: 'LendingClub loans', downloadLink: 'https://www.kaggle.com/datasets/wordsforthewise/lending-club' },
      { id: 'UC-CR-02', name: 'Alternative Data Credit Scoring', valueDriver: 'Revenue Growth', aiCategory: 'Analytic AI', dataType: 'CSV (tabular + time)', aiApproach: 'DL (NN / LSTM)', publicDataSource: 'Credit default dataset', downloadLink: 'https://archive.ics.uci.edu/ml/datasets/default+of+credit+card+clients' },
      { id: 'UC-CR-03', name: 'Credit Approval Optimization (Policy + Score)', valueDriver: 'Decision Intelligence', aiCategory: 'Decision Intelligence AI', dataType: 'CSV + Rules', aiApproach: 'ML + Rules (Ensemble)', publicDataSource: 'Home Credit data', downloadLink: 'https://www.kaggle.com/c/home-credit-default-risk' },
      { id: 'UC-CR-04', name: 'Risk-Based Loan Pricing', valueDriver: 'Revenue Growth', aiCategory: 'Analytic AI', dataType: 'CSV', aiApproach: 'ML + Optimization (Hybrid)', publicDataSource: 'LendingClub loans', downloadLink: 'https://www.kaggle.com/datasets/wordsforthewise/lending-club' },
      { id: 'UC-CR-05', name: 'Underwriter Assist Copilot', valueDriver: 'Productivity & Speed', aiCategory: 'Transactional AI', dataType: 'Text + CSV', aiApproach: 'RAG + NLP (Hybrid)', publicDataSource: 'Credit policy + loan data', downloadLink: 'https://www.federalreserve.gov/supervisionreg.htm' },
      { id: 'UC-CR-06', name: 'Credit Portfolio Risk Monitoring', valueDriver: 'Visibility & Governance', aiCategory: 'Analytic AI', dataType: 'CSV', aiApproach: 'ML + NLP (Hybrid)', publicDataSource: 'Loan performance data', downloadLink: 'https://www.fanniemae.com/research-and-insights/single-family-loan-performance-data' },
      { id: 'UC-CR-07', name: 'Credit Portfolio Strategy Simulator', valueDriver: 'Decision Intelligence', aiCategory: 'Business AI', dataType: 'CSV (aggregated)', aiApproach: 'ML + DL (Simulation)', publicDataSource: 'World Bank credit indicators', downloadLink: 'https://databank.worldbank.org' }
    ],
    dataTypeMapping: [
      { dataType: 'CSV (Structured)', examples: 'Income, DTI, bureau scores', bestTechnique: 'ML' },
      { dataType: 'Time-series CSV', examples: 'Payment history', bestTechnique: 'DL (LSTM)' },
      { dataType: 'Text', examples: 'Credit policy, analyst notes', bestTechnique: 'NLP' },
      { dataType: 'Text + CSV', examples: 'Policy + application', bestTechnique: 'RAG (Hybrid)' },
      { dataType: 'Aggregated CSV', examples: 'Portfolio metrics', bestTechnique: 'Business AI / Simulation' }
    ]
  },

  // Department B-03: AML / Financial Crime
  'B-03': {
    name: 'AML / Financial Crime',
    description: 'AML alert prioritization, network analysis, SAR drafting, and compliance monitoring. AML systems must explain, prove consistency, and survive regulatory scrutiny.',
    rating: 5,
    useCases: [
      { id: 'UC-AML-01', name: 'AML Alert Prioritization', valueDriver: 'Visibility, Control & Governance', aiCategory: 'Analytic AI', dataType: 'CSV (transactions)', aiApproach: 'ML (XGBoost / RF)', publicDataSource: 'Synthetic AML transactions', downloadLink: 'https://www.kaggle.com/datasets/ealaxi/paysim1' },
      { id: 'UC-AML-02', name: 'Network-Based Money Laundering Detection', valueDriver: 'Revenue Protection', aiCategory: 'Analytic AI', dataType: 'Graph CSV', aiApproach: 'DL (Graph Neural Networks)', publicDataSource: 'Crypto transaction network', downloadLink: 'https://www.kaggle.com/datasets/ellipticco/elliptic-data-set' },
      { id: 'UC-AML-03', name: 'SAR Narrative Drafting Assistant', valueDriver: 'Productivity & Speed', aiCategory: 'Transactional AI', dataType: 'Text', aiApproach: 'NLP (Summarization)', publicDataSource: 'Regulatory SAR guidance', downloadLink: 'https://www.fincen.gov/resources/statutes-regulations' },
      { id: 'UC-AML-04', name: 'AML Investigator Copilot', valueDriver: 'Productivity & Speed', aiCategory: 'Transactional AI', dataType: 'Text + CSV', aiApproach: 'RAG + NLP (Hybrid)', publicDataSource: 'FATF typologies + alerts', downloadLink: 'https://www.fatf-gafi.org/en/publications.html' },
      { id: 'UC-AML-05', name: 'Alert Disposition Recommendation (Close / Escalate)', valueDriver: 'Decision Intelligence', aiCategory: 'Decision Intelligence AI', dataType: 'CSV + Rules', aiApproach: 'ML + Rules (Ensemble)', publicDataSource: 'Synthetic AML data', downloadLink: 'https://www.kaggle.com/datasets/ealaxi/paysim1' },
      { id: 'UC-AML-06', name: 'AML Risk Exposure Dashboard', valueDriver: 'Visibility & Governance', aiCategory: 'Analytic AI', dataType: 'CSV + Text', aiApproach: 'ML + NLP (Hybrid)', publicDataSource: 'FATF risk reports', downloadLink: 'https://www.fatf-gafi.org/en/publications.html' }
    ],
    dataTypeMapping: [
      { dataType: 'Structured CSV', examples: 'Transactions, amounts, frequency', bestTechnique: 'ML' },
      { dataType: 'Graph CSV', examples: 'Account-to-account flows', bestTechnique: 'DL (GNN)' },
      { dataType: 'Text', examples: 'SAR narratives, regulations', bestTechnique: 'NLP' },
      { dataType: 'Text + CSV', examples: 'Alerts + typologies', bestTechnique: 'RAG (Hybrid)' },
      { dataType: 'Rules + Scores', examples: 'Thresholds, policies', bestTechnique: 'Ensemble' }
    ]
  },

  // Department B-04: Collections & Recovery
  'B-04': {
    name: 'Collections & Recovery',
    description: 'Cash recovery + cost optimization + customer experience. Drives cost reduction, revenue protection, productivity, and decision intelligence.',
    rating: 5,
    useCases: [
      { id: 'UC-COL-01', name: 'Delinquency / Default Prediction', valueDriver: 'Revenue Growth', aiCategory: 'Analytic AI', dataType: 'CSV (tabular)', aiApproach: 'ML (XGBoost / LR)', publicDataSource: 'Home Credit default risk', downloadLink: 'https://www.kaggle.com/c/home-credit-default-risk' },
      { id: 'UC-COL-02', name: 'Recovery Likelihood Scoring (Who to call)', valueDriver: 'Cost Reduction / OPEX', aiCategory: 'Analytic AI', dataType: 'CSV', aiApproach: 'ML (Ranking / Scoring)', publicDataSource: 'Give Me Some Credit', downloadLink: 'https://www.kaggle.com/c/GiveMeSomeCredit' },
      { id: 'UC-COL-03', name: 'Best Next Action (Channel + Offer + Timing)', valueDriver: 'Decision Intelligence', aiCategory: 'Decision Intelligence AI', dataType: 'CSV + Rules', aiApproach: 'ML + Rules (Ensemble)', publicDataSource: 'Home Credit + synthetic actions', downloadLink: 'https://www.kaggle.com/c/home-credit-default-risk' },
      { id: 'UC-COL-04', name: 'Collections Agent Assist Copilot', valueDriver: 'Productivity & Speed', aiCategory: 'Transactional AI', dataType: 'Text + CSV', aiApproach: 'RAG + NLP (Hybrid)', publicDataSource: 'CFPB complaints (debt-related)', downloadLink: 'https://www.kaggle.com/datasets/cfpb/us-consumer-finance-complaints' },
      { id: 'UC-COL-05', name: 'Roll-rate & Portfolio Monitoring', valueDriver: 'Visibility, Control & Governance', aiCategory: 'Analytic AI', dataType: 'CSV (time-series)', aiApproach: 'DL (Time-series) / ML', publicDataSource: 'Loan performance time-series', downloadLink: 'https://www.fanniemae.com/research-and-insights/single-family-loan-performance-data' },
      { id: 'UC-COL-06', name: 'Script Compliance & Sentiment Monitoring', valueDriver: 'Productivity & Speed', aiCategory: 'Transactional AI', dataType: 'Text', aiApproach: 'NLP (classification)', publicDataSource: 'Support tweets (proxy)', downloadLink: 'https://www.kaggle.com/datasets/thoughtvector/customer-support-on-twitter' }
    ],
    dataTypeMapping: [
      { dataType: 'CSV (Structured)', examples: 'DPD, balances, payment history', bestTechnique: 'ML / DL' },
      { dataType: 'Time-series CSV', examples: 'Roll-rates, monthly performance', bestTechnique: 'DL (forecasting)' },
      { dataType: 'Text', examples: 'Agent notes, complaint narratives', bestTechnique: 'NLP' },
      { dataType: 'Text + CSV', examples: 'Customer context + policy/script', bestTechnique: 'RAG (Hybrid)' },
      { dataType: 'Rules + Scores', examples: 'Treatment constraints', bestTechnique: 'Ensemble' }
    ]
  },

  // Department C-05: Contact Center / Customer Support
  'C-05': {
    name: 'Contact Center / Customer Support',
    description: 'Customer experience + productivity + upsell. Impacts AHT, FCR, revenue growth, cost reduction, and compliance.',
    rating: 5,
    useCases: [
      { id: 'UC-CC-01', name: 'Call / Chat Volume Forecasting', valueDriver: 'Productivity & Speed', aiCategory: 'Analytic AI', dataType: 'CSV (time-series)', aiApproach: 'ML + DL (Forecasting)', publicDataSource: 'Retail & call demand proxy', downloadLink: 'https://www.kaggle.com/competitions/store-sales-time-series-forecasting' },
      { id: 'UC-CC-02', name: 'Agent Assist Copilot (Live Guidance)', valueDriver: 'Productivity & Speed', aiCategory: 'Transactional AI', dataType: 'Text + CSV', aiApproach: 'RAG + NLP (Hybrid)', publicDataSource: 'Consumer finance FAQs & policies', downloadLink: 'https://www.consumerfinance.gov/consumer-tools/' },
      { id: 'UC-CC-03', name: 'Next Best Offer / Action Prediction', valueDriver: 'Revenue Growth', aiCategory: 'Analytic AI', dataType: 'CSV', aiApproach: 'ML (Classification / Ranking)', publicDataSource: 'Online retail behavior', downloadLink: 'https://www.kaggle.com/datasets/carrie1/ecommerce-data' },
      { id: 'UC-CC-04', name: 'Intelligent Call Routing', valueDriver: 'Cost Reduction / OPEX', aiCategory: 'Transactional AI', dataType: 'Text + CSV', aiApproach: 'ML + NLP (Hybrid)', publicDataSource: 'Banking intent dataset', downloadLink: 'https://github.com/PolyAI-LDN/banking77' },
      { id: 'UC-CC-05', name: 'QA & Compliance Monitoring', valueDriver: 'Visibility & Governance', aiCategory: 'Analytic AI', dataType: 'Text', aiApproach: 'NLP (Classification / Sentiment)', publicDataSource: 'Customer support tweets', downloadLink: 'https://www.kaggle.com/datasets/thoughtvector/customer-support-on-twitter' },
      { id: 'UC-CC-06', name: 'Speech-to-Text & Conversation Analytics', valueDriver: 'Productivity & Speed', aiCategory: 'Analytic AI', dataType: 'Audio + Text', aiApproach: 'DL (ASR) + NLP', publicDataSource: 'Mozilla Common Voice', downloadLink: 'https://commonvoice.mozilla.org/en/datasets' },
      { id: 'UC-CC-07', name: 'Retention / Escalation Decision Engine', valueDriver: 'Decision Intelligence', aiCategory: 'Decision Intelligence AI', dataType: 'CSV + Rules', aiApproach: 'ML + Rules (Ensemble)', publicDataSource: 'Churn & behavior data', downloadLink: 'https://www.kaggle.com/datasets/blastchar/telco-customer-churn' }
    ],
    dataTypeMapping: [
      { dataType: 'Time-series CSV', examples: 'Call volume, intervals', bestTechnique: 'ML / DL forecasting' },
      { dataType: 'Text', examples: 'Chat transcripts, emails', bestTechnique: 'NLP' },
      { dataType: 'Audio', examples: 'Voice calls', bestTechnique: 'DL (ASR)' },
      { dataType: 'Text + CSV', examples: 'Context + customer data', bestTechnique: 'RAG (Hybrid)' },
      { dataType: 'Rules + Scores', examples: 'Routing & escalation', bestTechnique: 'Ensemble' }
    ]
  },

  // Department C-06: Branch Operations
  'C-06': {
    name: 'Branch Operations',
    description: 'OPEX + service quality + visibility. Impacts cost reduction, productivity, revenue growth through better service, and operational control.',
    rating: 5,
    useCases: [
      { id: 'UC-BO-01', name: 'Branch Staffing Optimization', valueDriver: 'Cost Reduction / OPEX', aiCategory: 'Operational AI', dataType: 'CSV (time-series)', aiApproach: 'ML + DL (Forecasting / Optimization)', publicDataSource: 'Demand forecasting proxy', downloadLink: 'https://www.kaggle.com/competitions/store-sales-time-series-forecasting' },
      { id: 'UC-BO-02', name: 'Queue Time Prediction & SLA Monitoring', valueDriver: 'Productivity & Speed', aiCategory: 'Operational AI', dataType: 'CSV + Image', aiApproach: 'ML + CV (Hybrid)', publicDataSource: 'People / crowd images', downloadLink: 'https://storage.googleapis.com/openimages/web/index.html' },
      { id: 'UC-BO-03', name: 'Footfall & Capacity Analytics', valueDriver: 'Visibility & Control', aiCategory: 'Operational AI', dataType: 'Image + CSV', aiApproach: 'CV + DL', publicDataSource: 'Open Images (people)', downloadLink: 'https://storage.googleapis.com/openimages/web/index.html' },
      { id: 'UC-BO-04', name: 'Branch Customer Churn Risk', valueDriver: 'Revenue Growth', aiCategory: 'Analytic AI', dataType: 'CSV', aiApproach: 'ML', publicDataSource: 'Customer churn dataset', downloadLink: 'https://www.kaggle.com/datasets/blastchar/telco-customer-churn' },
      { id: 'UC-BO-05', name: 'Branch Ops Copilot (SOP Assistant)', valueDriver: 'Productivity & Speed', aiCategory: 'Transactional AI', dataType: 'Text', aiApproach: 'RAG + NLP (Hybrid)', publicDataSource: 'FFIEC exam & ops guidance', downloadLink: 'https://www.ffiec.gov/exam.htm' },
      { id: 'UC-BO-06', name: 'Dynamic Counter Allocation (Teller vs Advisor)', valueDriver: 'Decision Intelligence', aiCategory: 'Decision Intelligence AI', dataType: 'CSV + Rules', aiApproach: 'ML + Rules (Ensemble)', publicDataSource: 'Demand proxy + scheduling', downloadLink: 'https://www.kaggle.com/competitions/store-sales-time-series-forecasting' }
    ],
    dataTypeMapping: [
      { dataType: 'Time-series CSV', examples: 'Footfall, transactions/hour', bestTechnique: 'ML/DL forecasting' },
      { dataType: 'Images', examples: 'CCTV frames, queue images', bestTechnique: 'CV (people counting)' },
      { dataType: 'Text', examples: 'SOPs, policies', bestTechnique: 'RAG + NLP' },
      { dataType: 'Mixed (CSV + Image)', examples: 'Queue prediction', bestTechnique: 'Hybrid' },
      { dataType: 'Rules + Scores', examples: 'Allocation decisions', bestTechnique: 'Ensemble' }
    ]
  },

  // Department C-07: ATM & Cash Operations
  'C-07': {
    name: 'ATM & Cash Operations',
    description: 'Liquidity efficiency + OPEX reduction + service availability. Impacts cash-in-transit costs, idle cash, stock-outs, ATM health, and replenishment decisions.',
    rating: 5,
    useCases: [
      { id: 'UC-ATM-01', name: 'ATM Cash Demand Forecasting', valueDriver: 'Cost Reduction / OPEX', aiCategory: 'Operational AI', dataType: 'CSV (time-series)', aiApproach: 'ML + DL (Forecasting)', publicDataSource: 'Energy demand proxy (time-series)', downloadLink: 'https://www.kaggle.com/datasets/robikscube/hourly-energy-consumption' },
      { id: 'UC-ATM-02', name: 'Cash Replenishment Route Optimization', valueDriver: 'Cost Reduction / OPEX', aiCategory: 'Operational AI', dataType: 'CSV (geo + time)', aiApproach: 'ML + Optimization (Hybrid)', publicDataSource: 'Vehicle routing / geo data', downloadLink: 'https://www.kaggle.com/datasets/rajatsharma97/vehicle-routing-problem' },
      { id: 'UC-ATM-03', name: 'ATM Health & Downtime Prediction', valueDriver: 'Visibility & Control', aiCategory: 'Operational AI', dataType: 'CSV (logs / metrics)', aiApproach: 'ML (Classification / Anomaly)', publicDataSource: 'Server metrics (proxy)', downloadLink: 'https://www.kaggle.com/datasets/omduggineni/server-metrics' },
      { id: 'UC-ATM-04', name: 'ATM Surveillance & Tampering Detection', valueDriver: 'Visibility & Control', aiCategory: 'Operational AI', dataType: 'Image / Video frames', aiApproach: 'CV + DL', publicDataSource: 'Open Images – surveillance scenes', downloadLink: 'https://storage.googleapis.com/openimages/web/index.html' },
      { id: 'UC-ATM-05', name: 'ATM Operations Copilot (Runbook Assistant)', valueDriver: 'Productivity & Speed', aiCategory: 'Transactional AI', dataType: 'Text', aiApproach: 'RAG + NLP (Hybrid)', publicDataSource: 'Public IT / ops runbooks', downloadLink: 'https://sre.google/resources/' },
      { id: 'UC-ATM-06', name: 'Dynamic Replenishment Decision Engine', valueDriver: 'Decision Intelligence', aiCategory: 'Decision Intelligence AI', dataType: 'CSV + Rules', aiApproach: 'ML + Rules (Ensemble)', publicDataSource: 'Synthetic ATM demand data', downloadLink: 'https://www.kaggle.com/datasets/ealaxi/paysim1' }
    ],
    dataTypeMapping: [
      { dataType: 'Time-series CSV', examples: 'Withdrawals/hour, seasonality', bestTechnique: 'ML / DL forecasting' },
      { dataType: 'Geo CSV', examples: 'ATM location, routes', bestTechnique: 'Optimization / Hybrid' },
      { dataType: 'Logs / Metrics', examples: 'Errors, downtime', bestTechnique: 'ML anomaly detection' },
      { dataType: 'Images / Video', examples: 'ATM camera feeds', bestTechnique: 'CV (object / tamper detection)' },
      { dataType: 'Text', examples: 'SOPs, runbooks', bestTechnique: 'RAG + NLP' },
      { dataType: 'Rules + Scores', examples: 'Replenishment thresholds', bestTechnique: 'Ensemble' }
    ]
  },

  // Department G-08: Treasury & Finance
  'G-08': {
    name: 'Treasury & Finance',
    description: 'Liquidity, capital efficiency, regulatory safety. Governs revenue optimization, cost reduction, decision intelligence (ALM), and visibility & governance.',
    rating: 5,
    useCases: [
      { id: 'UC-TF-01', name: 'Liquidity Forecasting & ALM Optimization', valueDriver: 'Decision Intelligence', aiCategory: 'Business AI', dataType: 'CSV (time-series)', aiApproach: 'ML + DL (Forecasting / Optimization)', publicDataSource: 'Macro & banking rates', downloadLink: 'https://fred.stlouisfed.org/' },
      { id: 'UC-TF-02', name: 'Capital Allocation Optimization', valueDriver: 'Revenue Growth', aiCategory: 'Business AI', dataType: 'CSV (aggregated)', aiApproach: 'ML + Optimization (Hybrid)', publicDataSource: 'Bank & macro indicators', downloadLink: 'https://databank.worldbank.org' },
      { id: 'UC-TF-03', name: 'Regulatory Ratio Monitoring (LCR / NSFR)', valueDriver: 'Visibility & Governance', aiCategory: 'Analytic AI', dataType: 'CSV', aiApproach: 'ML (Anomaly / Trend)', publicDataSource: 'BIS banking statistics', downloadLink: 'https://www.bis.org/statistics/' },
      { id: 'UC-TF-04', name: 'Stress Testing & Scenario Simulation', valueDriver: 'Visibility & Governance', aiCategory: 'Analytic AI', dataType: 'CSV (scenario)', aiApproach: 'DL + Simulation', publicDataSource: 'NGFS climate scenarios', downloadLink: 'https://www.ngfs.net/ngfs-scenarios-portal/' },
      { id: 'UC-TF-05', name: 'Treasury Policy & Reporting Copilot', valueDriver: 'Productivity & Speed', aiCategory: 'Transactional AI', dataType: 'Text + CSV', aiApproach: 'RAG + NLP (Hybrid)', publicDataSource: 'Basel / IFRS docs', downloadLink: 'https://www.bis.org/bcbs/publications.htm' },
      { id: 'UC-TF-06', name: 'Funding Mix Decision Engine', valueDriver: 'Decision Intelligence', aiCategory: 'Decision Intelligence AI', dataType: 'CSV + Rules', aiApproach: 'ML + Rules (Ensemble)', publicDataSource: 'Interest rate datasets', downloadLink: 'https://fred.stlouisfed.org/' },
      { id: 'UC-TF-07', name: 'Cash Pooling & Liquidity Sweeping Optimization', valueDriver: 'Cost Reduction / OPEX', aiCategory: 'Operational AI', dataType: 'CSV (balances)', aiApproach: 'ML + Optimization', publicDataSource: 'Macro liquidity data', downloadLink: 'https://databank.worldbank.org' }
    ],
    dataTypeMapping: [
      { dataType: 'Time-series CSV', examples: 'Rates, balances, flows', bestTechnique: 'ML / DL forecasting' },
      { dataType: 'Aggregated CSV', examples: 'Capital buckets', bestTechnique: 'Business AI' },
      { dataType: 'Scenario CSV', examples: 'Stress parameters', bestTechnique: 'DL / simulation' },
      { dataType: 'Text', examples: 'Basel, ALM policies', bestTechnique: 'NLP' },
      { dataType: 'Text + CSV', examples: 'Policy + numbers', bestTechnique: 'RAG (Hybrid)' },
      { dataType: 'Rules + Scores', examples: 'Limits, thresholds', bestTechnique: 'Ensemble' }
    ]
  },

  // Department G-34: Enterprise Risk Management (ERM)
  'G-34': {
    name: 'Enterprise Risk Management',
    description: 'Risk aggregation, early warning, board visibility. See risk holistically (credit, market, ops, climate), improve decision quality, strengthen governance.',
    rating: 5,
    useCases: [
      { id: 'UC-ERM-01', name: 'Enterprise Risk Aggregation & Exposure View', valueDriver: 'Visibility, Control & Governance', aiCategory: 'Analytic AI', dataType: 'CSV (aggregated risk metrics)', aiApproach: 'ML (Trend / Anomaly Detection)', publicDataSource: 'Macro risk indicators', downloadLink: 'https://databank.worldbank.org' },
      { id: 'UC-ERM-02', name: 'Risk Appetite & Limit Optimization', valueDriver: 'Decision Intelligence', aiCategory: 'Business AI', dataType: 'CSV + Rules', aiApproach: 'ML + Optimization (Hybrid)', publicDataSource: 'Banking & macro indicators', downloadLink: 'https://www.bis.org/statistics/' },
      { id: 'UC-ERM-03', name: 'Early Warning Signal (EWS) Detection', valueDriver: 'Visibility, Control & Governance', aiCategory: 'Analytic AI', dataType: 'CSV (time-series)', aiApproach: 'DL (LSTM / Transformer)', publicDataSource: 'Financial time-series', downloadLink: 'https://fred.stlouisfed.org/' },
      { id: 'UC-ERM-04', name: 'Operational Risk Event Prediction', valueDriver: 'Visibility, Control & Governance', aiCategory: 'Analytic AI', dataType: 'CSV', aiApproach: 'ML (Classification)', publicDataSource: 'OpRisk proxy datasets', downloadLink: 'https://www.kaggle.com/datasets' },
      { id: 'UC-ERM-05', name: 'Risk Policy & Framework Copilot', valueDriver: 'Productivity & Speed', aiCategory: 'Transactional AI', dataType: 'Text', aiApproach: 'RAG + NLP (Hybrid)', publicDataSource: 'Basel / COSO / ISO docs', downloadLink: 'https://www.bis.org/bcbs/publications.htm' },
      { id: 'UC-ERM-06', name: 'Risk-Based Decision Recommendation Engine', valueDriver: 'Decision Intelligence', aiCategory: 'Decision Intelligence AI', dataType: 'CSV + Rules', aiApproach: 'ML + Rules (Ensemble)', publicDataSource: 'Risk score datasets', downloadLink: 'https://databank.worldbank.org' },
      { id: 'UC-ERM-07', name: 'Board & Regulator Risk Reporting Automation', valueDriver: 'Visibility, Control & Governance', aiCategory: 'Analytic AI', dataType: 'Text + CSV', aiApproach: 'NLP + RAG (Hybrid)', publicDataSource: 'Annual risk disclosures', downloadLink: 'https://www.sec.gov/edgar' }
    ],
    dataTypeMapping: [
      { dataType: 'Aggregated CSV', examples: 'RWA, exposure by risk type', bestTechnique: 'ML (trend / anomaly)' },
      { dataType: 'Time-series CSV', examples: 'KRI trends', bestTechnique: 'DL (forecasting / EWS)' },
      { dataType: 'Text', examples: 'Risk policies, frameworks', bestTechnique: 'NLP' },
      { dataType: 'Text + CSV', examples: 'Reports + metrics', bestTechnique: 'RAG (Hybrid)' },
      { dataType: 'Rules + Scores', examples: 'Limits, appetite', bestTechnique: 'Ensemble' }
    ]
  },

  // Department F-26: ESG & Climate Risk
  'F-26': {
    name: 'ESG & Climate Risk',
    description: 'Regulatory pressure + investor trust + capital impact. Enables visibility & governance, decision intelligence, revenue growth (green finance), risk reduction.',
    rating: 5,
    useCases: [
      { id: 'UC-ESG-01', name: 'ESG Score Normalization & Benchmarking', valueDriver: 'Visibility, Control & Governance', aiCategory: 'Analytic AI', dataType: 'CSV (company metrics)', aiApproach: 'ML (Scoring / Normalization)', publicDataSource: 'ESG sample datasets', downloadLink: 'https://www.kaggle.com/datasets/alistairking/esg-data' },
      { id: 'UC-ESG-02', name: 'Climate Risk–Adjusted Portfolio Steering', valueDriver: 'Decision Intelligence', aiCategory: 'Business AI', dataType: 'CSV (portfolio + risk)', aiApproach: 'ML + Optimization (Hybrid)', publicDataSource: 'Climate & macro indicators', downloadLink: 'https://databank.worldbank.org' },
      { id: 'UC-ESG-03', name: 'Climate Stress Testing & Scenario Analysis', valueDriver: 'Visibility, Control & Governance', aiCategory: 'Analytic AI', dataType: 'CSV (scenarios)', aiApproach: 'DL + Simulation', publicDataSource: 'NGFS climate scenarios', downloadLink: 'https://www.ngfs.net/ngfs-scenarios-portal/' },
      { id: 'UC-ESG-04', name: 'ESG Disclosure & Reporting Copilot', valueDriver: 'Productivity & Speed', aiCategory: 'Transactional AI', dataType: 'Text + CSV', aiApproach: 'RAG + NLP (Hybrid)', publicDataSource: 'GRI / SASB standards', downloadLink: 'https://www.globalreporting.org/' },
      { id: 'UC-ESG-05', name: 'Physical Climate Risk Exposure Mapping', valueDriver: 'Visibility, Control & Governance', aiCategory: 'Analytic AI', dataType: 'Geo + CSV', aiApproach: 'DL (Geo-spatial models)', publicDataSource: 'Climate hazard data', downloadLink: 'https://climate.copernicus.eu/climate-data-store' },
      { id: 'UC-ESG-06', name: 'Green Finance Eligibility Decision Engine', valueDriver: 'Decision Intelligence', aiCategory: 'Decision Intelligence AI', dataType: 'CSV + Rules', aiApproach: 'ML + Rules (Ensemble)', publicDataSource: 'Sustainable finance taxonomy', downloadLink: 'https://finance.ec.europa.eu/sustainable-finance/tools-and-standards_en' },
      { id: 'UC-ESG-07', name: 'Green Portfolio Growth Simulator', valueDriver: 'Revenue Growth', aiCategory: 'Business AI', dataType: 'CSV (aggregated)', aiApproach: 'ML + DL (Simulation)', publicDataSource: 'Green finance indicators', downloadLink: 'https://databank.worldbank.org' }
    ],
    dataTypeMapping: [
      { dataType: 'Structured CSV', examples: 'ESG scores, emissions', bestTechnique: 'ML' },
      { dataType: 'Scenario CSV', examples: 'NGFS pathways', bestTechnique: 'DL / simulation' },
      { dataType: 'Geo-spatial', examples: 'Flood, heat, wildfire', bestTechnique: 'DL (geo models)' },
      { dataType: 'Text', examples: 'ESG standards, disclosures', bestTechnique: 'NLP' },
      { dataType: 'Text + CSV', examples: 'Reports + metrics', bestTechnique: 'RAG (Hybrid)' },
      { dataType: 'Rules + Scores', examples: 'Taxonomy eligibility', bestTechnique: 'Ensemble' }
    ]
  },

  // Department E-21: IT Operations / AIOps
  'E-21': {
    name: 'IT Operations / AIOps',
    description: 'Uptime, cost control, speed of recovery. Delivers cost reduction, productivity, visibility & governance, decision intelligence.',
    rating: 5,
    useCases: [
      { id: 'UC-IT-01', name: 'Incident Prediction & Prevention', valueDriver: 'Cost Reduction / OPEX', aiCategory: 'Operational AI', dataType: 'CSV (metrics, time-series)', aiApproach: 'ML + DL (Anomaly / Forecasting)', publicDataSource: 'Server metrics (proxy)', downloadLink: 'https://www.kaggle.com/datasets/omduggineni/server-metrics' },
      { id: 'UC-IT-02', name: 'Root Cause Analysis (RCA)', valueDriver: 'Productivity & Speed', aiCategory: 'Operational AI', dataType: 'Logs (text + sequence)', aiApproach: 'DL (Sequence Models)', publicDataSource: 'LogHub datasets', downloadLink: 'https://github.com/logpai/loghub' },
      { id: 'UC-IT-03', name: 'SLA Breach & Performance Monitoring', valueDriver: 'Visibility & Control', aiCategory: 'Operational AI', dataType: 'CSV (KPIs)', aiApproach: 'ML (Trend / Anomaly)', publicDataSource: 'Service performance proxy', downloadLink: 'https://www.kaggle.com/datasets' },
      { id: 'UC-IT-04', name: 'IT Runbook & Troubleshooting Copilot', valueDriver: 'Productivity & Speed', aiCategory: 'Transactional AI', dataType: 'Text', aiApproach: 'RAG + NLP (Hybrid)', publicDataSource: 'Google SRE runbooks', downloadLink: 'https://sre.google/resources/' },
      { id: 'UC-IT-05', name: 'AI FinOps (Cloud Cost Optimization)', valueDriver: 'Cost Reduction / OPEX', aiCategory: 'Business AI', dataType: 'CSV (billing, usage)', aiApproach: 'ML + Optimization (Hybrid)', publicDataSource: 'Cloud billing samples', downloadLink: 'https://www.kaggle.com/datasets' },
      { id: 'UC-IT-06', name: 'Change Risk Assessment (CAB Support)', valueDriver: 'Decision Intelligence', aiCategory: 'Decision Intelligence AI', dataType: 'CSV + Text', aiApproach: 'ML + Rules (Ensemble)', publicDataSource: 'Change mgmt proxy data', downloadLink: 'https://www.kaggle.com/datasets' },
      { id: 'UC-IT-07', name: 'Model & System Drift Monitoring', valueDriver: 'Visibility & Governance', aiCategory: 'Governance & Control AI', dataType: 'CSV + Logs', aiApproach: 'ML + NLP (Hybrid)', publicDataSource: 'OpenML benchmark sets', downloadLink: 'https://www.openml.org/' }
    ],
    dataTypeMapping: [
      { dataType: 'Time-series CSV', examples: 'CPU, memory, latency', bestTechnique: 'ML / DL' },
      { dataType: 'Logs (Text)', examples: 'App / infra logs', bestTechnique: 'NLP / DL' },
      { dataType: 'Text', examples: 'Runbooks, SOPs', bestTechnique: 'RAG' },
      { dataType: 'Mixed', examples: 'Metrics + logs', bestTechnique: 'Hybrid' },
      { dataType: 'Rules + Scores', examples: 'Change policies', bestTechnique: 'Ensemble' }
    ]
  },

  // Department C-12: Workforce / HR Management
  'C-12': {
    name: 'Workforce / HR Management',
    description: 'Productivity, retention, compliance. Enables cost reduction, productivity, decision intelligence, visibility & governance.',
    rating: 5,
    useCases: [
      { id: 'UC-HR-01', name: 'Employee Attrition Prediction', valueDriver: 'Cost Reduction / OPEX', aiCategory: 'Analytic AI', dataType: 'CSV (employee metrics)', aiApproach: 'ML (XGBoost / RF)', publicDataSource: 'IBM HR Analytics', downloadLink: 'https://www.kaggle.com/datasets/pavansubhasht/ibm-hr-analytics-attrition-dataset' },
      { id: 'UC-HR-02', name: 'Workforce Demand Forecasting', valueDriver: 'Productivity & Speed', aiCategory: 'Analytic AI', dataType: 'CSV (time-series)', aiApproach: 'DL (LSTM / Forecasting)', publicDataSource: 'Workforce scheduling proxy', downloadLink: 'https://www.kaggle.com/datasets' },
      { id: 'UC-HR-03', name: 'Hiring & Internal Mobility Recommendation', valueDriver: 'Decision Intelligence', aiCategory: 'Decision Intelligence AI', dataType: 'CSV + Rules', aiApproach: 'ML + Rules (Ensemble)', publicDataSource: 'HR hiring datasets', downloadLink: 'https://www.kaggle.com/datasets' },
      { id: 'UC-HR-04', name: 'HR Policy & Employee FAQ Copilot', valueDriver: 'Productivity & Speed', aiCategory: 'Transactional AI', dataType: 'Text', aiApproach: 'RAG + NLP (Hybrid)', publicDataSource: 'Public HR policies', downloadLink: 'https://www.shrm.org/resourcesandtools/pages/default.aspx' },
      { id: 'UC-HR-05', name: 'Performance & Bias Monitoring', valueDriver: 'Visibility & Governance', aiCategory: 'Analytic AI', dataType: 'CSV', aiApproach: 'ML (Fairness / Drift)', publicDataSource: 'OpenML benchmark sets', downloadLink: 'https://www.openml.org/' },
      { id: 'UC-HR-06', name: 'Resume Screening & Skills Extraction', valueDriver: 'Productivity & Speed', aiCategory: 'Transactional AI', dataType: 'Text (CVs)', aiApproach: 'NLP (NER / Classification)', publicDataSource: 'Resume datasets', downloadLink: 'https://www.kaggle.com/datasets' },
      { id: 'UC-HR-07', name: 'Workforce Strategy Simulator', valueDriver: 'Decision Intelligence', aiCategory: 'Business AI', dataType: 'CSV (aggregated)', aiApproach: 'ML + Simulation', publicDataSource: 'Labor & productivity stats', downloadLink: 'https://databank.worldbank.org' }
    ],
    dataTypeMapping: [
      { dataType: 'Structured CSV', examples: 'Tenure, performance, pay', bestTechnique: 'ML' },
      { dataType: 'Time-series CSV', examples: 'Headcount trends', bestTechnique: 'DL' },
      { dataType: 'Text', examples: 'Policies, resumes', bestTechnique: 'NLP' },
      { dataType: 'Text + CSV', examples: 'Policy + employee context', bestTechnique: 'RAG' },
      { dataType: 'Rules + Scores', examples: 'Hiring constraints', bestTechnique: 'Ensemble' }
    ]
  }
};

// Helper to get use cases for a department
export const getUseCasesForDepartment = (groupId, deptId) => {
  const key = `${groupId}-${deptId}`;
  return departmentUseCases[key] || null;
};
