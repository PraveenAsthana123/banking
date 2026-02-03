// Banking Departments and Use Cases Configuration

// ML Type Categories (Time Series, Computer Vision, Hybrid, NLP, Tabular)
export const mlTypeCategories = [
  { id: 'all', name: 'All Types', icon: 'cpu', color: '#6b7280' },
  { id: 'tabular', name: 'Tabular ML', icon: 'database', color: '#3b82f6', description: 'Structured data, classification, regression' },
  { id: 'time-series', name: 'Time Series', icon: 'trending-up', color: '#10b981', description: 'Temporal patterns, forecasting, anomaly detection' },
  { id: 'computer-vision', name: 'Computer Vision', icon: 'eye', color: '#8b5cf6', description: 'Image analysis, OCR, document processing' },
  { id: 'nlp', name: 'NLP', icon: 'message-square', color: '#f59e0b', description: 'Text analysis, sentiment, entity extraction' },
  { id: 'hybrid', name: 'Hybrid', icon: 'layers', color: '#ef4444', description: 'Multi-modal, ensemble, combined techniques' },
];

// Get ML Type details
export const getMlType = (mlType) => {
  return mlTypeCategories.find(cat => cat.id === mlType) || mlTypeCategories[0];
};

// Trust AI Pillars for each use case
export const trustAIPillars = {
  explainability: { name: 'Explainability', icon: 'eye', color: '#3b82f6', description: 'Model interpretability and feature importance' },
  responsibility: { name: 'Responsibility', icon: 'shield', color: '#10b981', description: 'Ethical AI and bias mitigation' },
  governance: { name: 'Governance', icon: 'clipboard-check', color: '#f59e0b', description: 'Model lifecycle and compliance' },
  accuracy: { name: 'Accuracy', icon: 'target', color: '#8b5cf6', description: 'Model performance and validation' },
  data: { name: 'Data Quality', icon: 'database', color: '#0891b2', description: 'Data lineage and quality metrics' },
  trust: { name: 'Trust Score', icon: 'check-circle', color: '#059669', description: 'Overall AI trustworthiness' },
};

// AI Categories for classification
export const aiCategories = [
  { id: 'all', name: 'All Types', icon: 'models', color: '#6b7280' },
  { id: 'transactional', name: 'Transactional AI', icon: 'zap', color: '#3b82f6', description: 'Real-time processing, instant decisions, automation' },
  { id: 'analytical', name: 'Analytical AI', icon: 'analytics', color: '#10b981', description: 'Insights, predictions, reporting, pattern recognition' },
  { id: 'driver', name: 'Business Driver', icon: 'trending-up', color: '#f59e0b', description: 'Strategic initiatives, revenue generation, transformation' },
  { id: 'cost', name: 'Cost Scenario', icon: 'dollar', color: '#ef4444', description: 'Cost reduction, efficiency gains, resource optimization' },
  { id: 'productivity', name: 'Productivity Scenario', icon: 'target', color: '#8b5cf6', description: 'Throughput improvement, time savings, automation gains' },
];

// Data Layer Categories for classification
export const dataCategories = [
  { id: 'all', name: 'All Layers', icon: 'database', color: '#6b7280' },
  { id: 'pipeline', name: 'Data Pipeline', icon: 'pipelines', color: '#3b82f6', description: 'ETL, data ingestion, transformation, orchestration' },
  { id: 'analysis', name: 'Data Analysis', icon: 'analytics', color: '#10b981', description: 'Statistical analysis, pattern discovery, insights generation' },
  { id: 'visualization', name: 'Visualization', icon: 'chart', color: '#8b5cf6', description: 'Dashboards, charts, reports, visual insights' },
  { id: 'eda', name: 'EDA', icon: 'search', color: '#f59e0b', description: 'Exploratory Data Analysis, data profiling, distribution analysis' },
  { id: 'normalization', name: 'Normalization', icon: 'target', color: '#ef4444', description: 'Data scaling, min-max normalization, range transformation' },
  { id: 'standardization', name: 'Standardization', icon: 'check', color: '#0891b2', description: 'Z-score scaling, mean centering, variance normalization' },
];

// Get AI category details
export const getAiCategory = (aiType) => {
  return aiCategories.find(cat => cat.id === aiType) || aiCategories[0];
};

// Get Data category details
export const getDataCategory = (dataLayer) => {
  return dataCategories.find(cat => cat.id === dataLayer) || dataCategories[0];
};

export const departments = [
  {
    id: 'risk',
    name: 'Risk Management',
    icon: 'shield',
    color: '#dc2626',
    description: 'Enterprise risk assessment and mitigation strategies',
    useCases: [
      { id: 'credit-risk-scoring', name: 'Credit Risk Scoring', status: 'active', models: 3, accuracy: 99.8, aiType: 'transactional', dataLayer: 'pipeline', mlType: 'tabular', costSavings: 4.2, revenue: 2.8, productivity: 250, explainability: 95, responsibility: 92, governance: 98, trustScore: 96 },
      { id: 'market-risk-var', name: 'Market Risk VaR', status: 'active', models: 2, accuracy: 99.5, aiType: 'analytical', dataLayer: 'analysis', mlType: 'time-series', costSavings: 1.8, revenue: 0.5, productivity: 85, explainability: 88, responsibility: 90, governance: 94, trustScore: 91 },
      { id: 'operational-risk', name: 'Operational Risk Assessment', status: 'active', models: 1, accuracy: 99.3, aiType: 'analytical', dataLayer: 'eda', mlType: 'hybrid', costSavings: 1.2, revenue: 0.3, productivity: 60, explainability: 85, responsibility: 88, governance: 92, trustScore: 88 },
      { id: 'liquidity-risk', name: 'Liquidity Risk Monitoring', status: 'training', models: 2, accuracy: 0, aiType: 'analytical', dataLayer: 'visualization', mlType: 'time-series', costSavings: 0, revenue: 0, productivity: 0, explainability: 0, responsibility: 0, governance: 0, trustScore: 0 },
      { id: 'counterparty-risk', name: 'Counterparty Risk Analysis', status: 'active', models: 1, accuracy: 99.6, aiType: 'analytical', dataLayer: 'analysis', mlType: 'tabular', costSavings: 0.9, revenue: 0.4, productivity: 45, explainability: 90, responsibility: 91, governance: 95, trustScore: 92 },
      { id: 'concentration-risk', name: 'Concentration Risk', status: 'pending', models: 0, accuracy: 0, aiType: 'analytical', dataLayer: 'eda', mlType: 'tabular', costSavings: 0, revenue: 0, productivity: 0, explainability: 0, responsibility: 0, governance: 0, trustScore: 0 },
      { id: 'interest-rate-risk', name: 'Interest Rate Risk', status: 'active', models: 2, accuracy: 99.4, aiType: 'driver', dataLayer: 'standardization', mlType: 'time-series', costSavings: 2.1, revenue: 3.5, productivity: 120, explainability: 92, responsibility: 89, governance: 96, trustScore: 93 },
      { id: 'currency-risk', name: 'Currency Risk Hedging', status: 'active', models: 1, accuracy: 99.2, aiType: 'cost', dataLayer: 'normalization', mlType: 'time-series', costSavings: 3.5, revenue: 0.8, productivity: 75, explainability: 87, responsibility: 88, governance: 93, trustScore: 89 },
    ]
  },
  {
    id: 'credit',
    name: 'Credit Analysis',
    icon: 'credit-card',
    color: '#2563eb',
    description: 'Credit underwriting and portfolio management',
    useCases: [
      { id: 'loan-approval', name: 'Loan Approval Prediction', status: 'active', models: 4, accuracy: 99.7, aiType: 'transactional', dataLayer: 'pipeline', mlType: 'tabular', costSavings: 5.2, revenue: 4.1, productivity: 320, explainability: 96, responsibility: 94, governance: 98, trustScore: 97 },
      { id: 'credit-limit', name: 'Credit Limit Optimization', status: 'active', models: 2, accuracy: 99.3, aiType: 'driver', dataLayer: 'analysis', mlType: 'hybrid', costSavings: 1.5, revenue: 6.2, productivity: 150, explainability: 89, responsibility: 91, governance: 95, trustScore: 92 },
      { id: 'default-prediction', name: 'Default Prediction', status: 'active', models: 3, accuracy: 99.9, aiType: 'analytical', dataLayer: 'standardization', mlType: 'time-series', costSavings: 8.5, revenue: 1.2, productivity: 180, explainability: 92, responsibility: 93, governance: 97, trustScore: 95 },
      { id: 'early-warning', name: 'Early Warning System', status: 'active', models: 2, accuracy: 99.5, aiType: 'analytical', dataLayer: 'visualization', mlType: 'time-series', costSavings: 3.2, revenue: 0.8, productivity: 95, explainability: 88, responsibility: 90, governance: 94, trustScore: 91 },
      { id: 'debt-collection', name: 'Debt Collection Priority', status: 'training', models: 1, accuracy: 0, aiType: 'cost', dataLayer: 'analysis', mlType: 'tabular', costSavings: 0, revenue: 0, productivity: 0, explainability: 0, responsibility: 0, governance: 0, trustScore: 0 },
      { id: 'credit-scoring', name: 'Alternative Credit Scoring', status: 'active', models: 2, accuracy: 99.4, aiType: 'driver', dataLayer: 'normalization', mlType: 'hybrid', costSavings: 0.8, revenue: 3.5, productivity: 200, explainability: 91, responsibility: 89, governance: 93, trustScore: 90 },
      { id: 'mortgage-risk', name: 'Mortgage Risk Assessment', status: 'active', models: 2, accuracy: 99.6, aiType: 'analytical', dataLayer: 'eda', mlType: 'tabular', costSavings: 2.1, revenue: 1.5, productivity: 110, explainability: 93, responsibility: 92, governance: 96, trustScore: 94 },
      { id: 'auto-loan', name: 'Auto Loan Underwriting', status: 'active', models: 1, accuracy: 99.2, aiType: 'transactional', dataLayer: 'pipeline', mlType: 'tabular', costSavings: 1.8, revenue: 2.2, productivity: 175, explainability: 87, responsibility: 88, governance: 92, trustScore: 89 },
      { id: 'sme-lending', name: 'SME Lending Analysis', status: 'pending', models: 0, accuracy: 0, aiType: 'driver', dataLayer: 'analysis', mlType: 'hybrid', costSavings: 0, revenue: 0, productivity: 0, explainability: 0, responsibility: 0, governance: 0, trustScore: 0 },
    ]
  },
  {
    id: 'fraud',
    name: 'Fraud Detection',
    icon: 'alert-triangle',
    color: '#7c3aed',
    description: 'Real-time fraud prevention and detection systems',
    useCases: [
      { id: 'transaction-fraud', name: 'Transaction Fraud Detection', status: 'active', models: 5, accuracy: 99.8, aiType: 'transactional', dataLayer: 'pipeline', mlType: 'hybrid', costSavings: 18.5, revenue: 5.2, productivity: 500, explainability: 94, responsibility: 96, governance: 99, trustScore: 97 },
      { id: 'card-fraud', name: 'Card Fraud Prevention', status: 'active', models: 3, accuracy: 99.9, aiType: 'transactional', dataLayer: 'pipeline', mlType: 'time-series', costSavings: 12.3, revenue: 3.8, productivity: 450, explainability: 92, responsibility: 95, governance: 98, trustScore: 96 },
      { id: 'identity-fraud', name: 'Identity Fraud Detection', status: 'active', models: 2, accuracy: 99.7, aiType: 'transactional', dataLayer: 'standardization', mlType: 'computer-vision', costSavings: 5.6, revenue: 1.2, productivity: 280, explainability: 88, responsibility: 94, governance: 97, trustScore: 93 },
      { id: 'application-fraud', name: 'Application Fraud Screening', status: 'active', models: 2, accuracy: 99.5, aiType: 'transactional', dataLayer: 'normalization', mlType: 'hybrid', costSavings: 4.2, revenue: 0.9, productivity: 220, explainability: 90, responsibility: 93, governance: 96, trustScore: 94 },
      { id: 'aml-detection', name: 'AML Transaction Monitoring', status: 'active', models: 4, accuracy: 99.4, aiType: 'transactional', dataLayer: 'analysis', mlType: 'hybrid', costSavings: 8.5, revenue: 0.5, productivity: 350, explainability: 91, responsibility: 97, governance: 99, trustScore: 96 },
      { id: 'account-takeover', name: 'Account Takeover Prevention', status: 'active', models: 2, accuracy: 99.6, aiType: 'transactional', dataLayer: 'pipeline', mlType: 'time-series', costSavings: 6.8, revenue: 2.1, productivity: 380, explainability: 89, responsibility: 92, governance: 95, trustScore: 92 },
      { id: 'synthetic-identity', name: 'Synthetic Identity Detection', status: 'training', models: 1, accuracy: 0, aiType: 'analytical', dataLayer: 'eda', mlType: 'computer-vision', costSavings: 0, revenue: 0, productivity: 0, explainability: 0, responsibility: 0, governance: 0, trustScore: 0 },
      { id: 'insider-fraud', name: 'Insider Fraud Detection', status: 'active', models: 1, accuracy: 99.3, aiType: 'analytical', dataLayer: 'visualization', mlType: 'nlp', costSavings: 2.4, revenue: 0.3, productivity: 65, explainability: 86, responsibility: 91, governance: 94, trustScore: 90 },
    ]
  },
  {
    id: 'customer',
    name: 'Customer Analytics',
    icon: 'users',
    color: '#059669',
    description: 'Customer insights and personalization',
    useCases: [
      { id: 'churn-prediction', name: 'Churn Prediction', status: 'active', models: 3, accuracy: 99.6, aiType: 'analytical', dataLayer: 'analysis', mlType: 'time-series', costSavings: 3.8, revenue: 8.5, productivity: 120, explainability: 93, responsibility: 91, governance: 95, trustScore: 93 },
      { id: 'clv-prediction', name: 'Customer Lifetime Value', status: 'active', models: 2, accuracy: 99.4, aiType: 'analytical', dataLayer: 'standardization', mlType: 'tabular', costSavings: 1.2, revenue: 5.2, productivity: 85, explainability: 90, responsibility: 89, governance: 93, trustScore: 91 },
      { id: 'segmentation', name: 'Customer Segmentation', status: 'active', models: 2, accuracy: 99.5, aiType: 'analytical', dataLayer: 'eda', mlType: 'tabular', costSavings: 0.8, revenue: 4.5, productivity: 95, explainability: 95, responsibility: 88, governance: 92, trustScore: 92 },
      { id: 'next-best-action', name: 'Next Best Action', status: 'active', models: 3, accuracy: 99.2, aiType: 'driver', dataLayer: 'pipeline', mlType: 'hybrid', costSavings: 0.5, revenue: 12.3, productivity: 200, explainability: 87, responsibility: 90, governance: 94, trustScore: 90 },
      { id: 'product-recommendation', name: 'Product Recommendation', status: 'active', models: 4, accuracy: 99.3, aiType: 'driver', dataLayer: 'normalization', mlType: 'hybrid', costSavings: 0.3, revenue: 15.8, productivity: 250, explainability: 85, responsibility: 91, governance: 95, trustScore: 91 },
      { id: 'cross-sell', name: 'Cross-Sell Propensity', status: 'active', models: 2, accuracy: 99.5, aiType: 'driver', dataLayer: 'analysis', mlType: 'tabular', costSavings: 0.2, revenue: 9.5, productivity: 180, explainability: 88, responsibility: 89, governance: 93, trustScore: 90 },
      { id: 'sentiment-analysis', name: 'Sentiment Analysis', status: 'active', models: 1, accuracy: 99.7, aiType: 'analytical', dataLayer: 'visualization', mlType: 'nlp', costSavings: 0.5, revenue: 1.8, productivity: 75, explainability: 92, responsibility: 94, governance: 96, trustScore: 94 },
      { id: 'customer-journey', name: 'Customer Journey Analytics', status: 'training', models: 1, accuracy: 0, aiType: 'analytical', dataLayer: 'visualization', mlType: 'hybrid', costSavings: 0, revenue: 0, productivity: 0, explainability: 0, responsibility: 0, governance: 0, trustScore: 0 },
      { id: 'attrition-risk', name: 'Attrition Risk Scoring', status: 'active', models: 2, accuracy: 99.6, aiType: 'cost', dataLayer: 'standardization', mlType: 'time-series', costSavings: 4.5, revenue: 2.1, productivity: 110, explainability: 91, responsibility: 90, governance: 94, trustScore: 92 },
    ]
  },
  {
    id: 'compliance',
    name: 'Compliance',
    icon: 'clipboard-check',
    color: '#d97706',
    description: 'Regulatory compliance and reporting',
    useCases: [
      { id: 'kyc-verification', name: 'KYC Verification', status: 'active', models: 3, accuracy: 99.5, aiType: 'transactional', dataLayer: 'pipeline', mlType: 'hybrid', costSavings: 5.8, revenue: 0.5, productivity: 400, explainability: 92, responsibility: 95, governance: 98, trustScore: 95 },
      { id: 'sanctions-screening', name: 'Sanctions Screening', status: 'active', models: 2, accuracy: 99.8, aiType: 'transactional', dataLayer: 'pipeline', mlType: 'tabular', costSavings: 3.2, revenue: 0.2, productivity: 350, explainability: 94, responsibility: 97, governance: 99, trustScore: 97 },
      { id: 'pep-screening', name: 'PEP Screening', status: 'active', models: 1, accuracy: 99.4, aiType: 'transactional', dataLayer: 'standardization', mlType: 'nlp', costSavings: 2.1, revenue: 0.1, productivity: 280, explainability: 91, responsibility: 96, governance: 98, trustScore: 95 },
      { id: 'regulatory-reporting', name: 'Regulatory Reporting', status: 'active', models: 1, accuracy: 99.2, aiType: 'productivity', dataLayer: 'visualization', mlType: 'tabular', costSavings: 4.5, revenue: 0, productivity: 500, explainability: 95, responsibility: 93, governance: 99, trustScore: 96 },
      { id: 'document-verification', name: 'Document Verification', status: 'active', models: 2, accuracy: 99.3, aiType: 'productivity', dataLayer: 'normalization', mlType: 'computer-vision', costSavings: 3.8, revenue: 0.3, productivity: 380, explainability: 88, responsibility: 92, governance: 96, trustScore: 92 },
      { id: 'adverse-media', name: 'Adverse Media Screening', status: 'training', models: 1, accuracy: 0, aiType: 'analytical', dataLayer: 'eda', mlType: 'nlp', costSavings: 0, revenue: 0, productivity: 0, explainability: 0, responsibility: 0, governance: 0, trustScore: 0 },
      { id: 'cdd-automation', name: 'CDD Automation', status: 'active', models: 2, accuracy: 99.1, aiType: 'productivity', dataLayer: 'pipeline', mlType: 'hybrid', costSavings: 6.2, revenue: 0.2, productivity: 420, explainability: 90, responsibility: 94, governance: 97, trustScore: 94 },
      { id: 'fair-lending', name: 'Fair Lending Analysis', status: 'active', models: 1, accuracy: 99.6, aiType: 'analytical', dataLayer: 'analysis', mlType: 'tabular', costSavings: 1.5, revenue: 0, productivity: 65, explainability: 96, responsibility: 98, governance: 99, trustScore: 98 },
    ]
  },
  {
    id: 'treasury',
    name: 'Treasury',
    icon: 'landmark',
    color: '#0891b2',
    description: 'Treasury operations and cash management',
    useCases: [
      { id: 'cash-forecasting', name: 'Cash Flow Forecasting', status: 'active', models: 3, accuracy: 99.4, aiType: 'analytical', dataLayer: 'analysis', mlType: 'time-series', costSavings: 2.8, revenue: 1.5, productivity: 150, explainability: 91, responsibility: 89, governance: 94, trustScore: 91 },
      { id: 'liquidity-management', name: 'Liquidity Management', status: 'active', models: 2, accuracy: 99.2, aiType: 'analytical', dataLayer: 'visualization', mlType: 'time-series', costSavings: 3.5, revenue: 2.1, productivity: 120, explainability: 90, responsibility: 88, governance: 93, trustScore: 90 },
      { id: 'fx-prediction', name: 'FX Rate Prediction', status: 'active', models: 2, accuracy: 99.1, aiType: 'analytical', dataLayer: 'standardization', mlType: 'time-series', costSavings: 1.2, revenue: 4.5, productivity: 85, explainability: 87, responsibility: 86, governance: 91, trustScore: 88 },
      { id: 'interest-optimization', name: 'Interest Rate Optimization', status: 'active', models: 1, accuracy: 99.3, aiType: 'cost', dataLayer: 'normalization', mlType: 'tabular', costSavings: 5.8, revenue: 0.8, productivity: 95, explainability: 89, responsibility: 87, governance: 92, trustScore: 89 },
      { id: 'investment-allocation', name: 'Investment Allocation', status: 'training', models: 2, accuracy: 0, aiType: 'driver', dataLayer: 'analysis', mlType: 'hybrid', costSavings: 0, revenue: 0, productivity: 0, explainability: 0, responsibility: 0, governance: 0, trustScore: 0 },
      { id: 'hedge-optimization', name: 'Hedge Optimization', status: 'active', models: 1, accuracy: 99.5, aiType: 'cost', dataLayer: 'eda', mlType: 'tabular', costSavings: 4.2, revenue: 0.5, productivity: 75, explainability: 88, responsibility: 86, governance: 91, trustScore: 88 },
      { id: 'collateral-management', name: 'Collateral Management', status: 'pending', models: 0, accuracy: 0, aiType: 'productivity', dataLayer: 'pipeline', mlType: 'tabular', costSavings: 0, revenue: 0, productivity: 0, explainability: 0, responsibility: 0, governance: 0, trustScore: 0 },
    ]
  },
  {
    id: 'retail',
    name: 'Retail Banking',
    icon: 'building',
    color: '#db2777',
    description: 'Retail banking products and services',
    useCases: [
      { id: 'deposit-prediction', name: 'Deposit Prediction', status: 'active', models: 2, accuracy: 99.3, aiType: 'analytical', dataLayer: 'analysis', mlType: 'time-series', costSavings: 1.2, revenue: 3.5, productivity: 95, explainability: 90, responsibility: 88, governance: 93, trustScore: 90 },
      { id: 'branch-optimization', name: 'Branch Optimization', status: 'active', models: 1, accuracy: 99.1, aiType: 'cost', dataLayer: 'visualization', mlType: 'tabular', costSavings: 8.5, revenue: 0.5, productivity: 120, explainability: 92, responsibility: 89, governance: 94, trustScore: 92 },
      { id: 'atm-cash-optimization', name: 'ATM Cash Optimization', status: 'active', models: 2, accuracy: 99.5, aiType: 'cost', dataLayer: 'pipeline', mlType: 'time-series', costSavings: 4.8, revenue: 0.2, productivity: 180, explainability: 91, responsibility: 90, governance: 95, trustScore: 92 },
      { id: 'queue-management', name: 'Queue Management', status: 'active', models: 1, accuracy: 99.2, aiType: 'productivity', dataLayer: 'normalization', mlType: 'time-series', costSavings: 2.1, revenue: 0.8, productivity: 250, explainability: 88, responsibility: 87, governance: 92, trustScore: 89 },
      { id: 'pricing-optimization', name: 'Pricing Optimization', status: 'active', models: 2, accuracy: 99.4, aiType: 'driver', dataLayer: 'standardization', mlType: 'tabular', costSavings: 0.5, revenue: 8.5, productivity: 85, explainability: 93, responsibility: 91, governance: 96, trustScore: 93 },
      { id: 'channel-preference', name: 'Channel Preference', status: 'training', models: 1, accuracy: 0, aiType: 'analytical', dataLayer: 'eda', mlType: 'tabular', costSavings: 0, revenue: 0, productivity: 0, explainability: 0, responsibility: 0, governance: 0, trustScore: 0 },
      { id: 'account-opening', name: 'Account Opening Prediction', status: 'active', models: 1, accuracy: 99.3, aiType: 'driver', dataLayer: 'analysis', mlType: 'tabular', costSavings: 0.8, revenue: 5.2, productivity: 150, explainability: 89, responsibility: 88, governance: 93, trustScore: 90 },
    ]
  },
  {
    id: 'investment',
    name: 'Investment Banking',
    icon: 'trending-up',
    color: '#4f46e5',
    description: 'Investment analysis and portfolio management',
    useCases: [
      { id: 'portfolio-optimization', name: 'Portfolio Optimization', status: 'active', models: 3, accuracy: 99.4, aiType: 'driver', dataLayer: 'standardization', mlType: 'hybrid', costSavings: 1.5, revenue: 12.5, productivity: 85, explainability: 91, responsibility: 89, governance: 94, trustScore: 91 },
      { id: 'stock-prediction', name: 'Stock Price Prediction', status: 'active', models: 4, accuracy: 99.2, aiType: 'analytical', dataLayer: 'normalization', mlType: 'time-series', costSavings: 0.8, revenue: 8.2, productivity: 75, explainability: 88, responsibility: 87, governance: 92, trustScore: 89 },
      { id: 'sentiment-trading', name: 'Sentiment-Based Trading', status: 'active', models: 2, accuracy: 99.1, aiType: 'transactional', dataLayer: 'pipeline', mlType: 'nlp', costSavings: 0.5, revenue: 5.5, productivity: 120, explainability: 86, responsibility: 85, governance: 90, trustScore: 87 },
      { id: 'risk-parity', name: 'Risk Parity Analysis', status: 'active', models: 1, accuracy: 99.5, aiType: 'analytical', dataLayer: 'analysis', mlType: 'tabular', costSavings: 1.2, revenue: 3.8, productivity: 65, explainability: 93, responsibility: 91, governance: 96, trustScore: 93 },
      { id: 'factor-investing', name: 'Factor Investing Models', status: 'training', models: 2, accuracy: 0, aiType: 'analytical', dataLayer: 'eda', mlType: 'tabular', costSavings: 0, revenue: 0, productivity: 0, explainability: 0, responsibility: 0, governance: 0, trustScore: 0 },
      { id: 'market-making', name: 'Market Making Strategy', status: 'active', models: 2, accuracy: 99.3, aiType: 'transactional', dataLayer: 'pipeline', mlType: 'hybrid', costSavings: 0.3, revenue: 15.2, productivity: 200, explainability: 87, responsibility: 86, governance: 91, trustScore: 88 },
      { id: 'ipo-pricing', name: 'IPO Pricing Analysis', status: 'pending', models: 0, accuracy: 0, aiType: 'analytical', dataLayer: 'analysis', mlType: 'tabular', costSavings: 0, revenue: 0, productivity: 0, explainability: 0, responsibility: 0, governance: 0, trustScore: 0 },
      { id: 'ma-valuation', name: 'M&A Valuation', status: 'active', models: 1, accuracy: 99.2, aiType: 'analytical', dataLayer: 'visualization', mlType: 'hybrid', costSavings: 0.5, revenue: 8.5, productivity: 55, explainability: 90, responsibility: 88, governance: 93, trustScore: 90 },
    ]
  },
  {
    id: 'wealth',
    name: 'Wealth Management',
    icon: 'briefcase',
    color: '#8b5cf6',
    description: 'Private banking and wealth advisory services',
    useCases: [
      { id: 'portfolio-rebalancing', name: 'Portfolio Rebalancing', status: 'active', models: 3, accuracy: 99.5, aiType: 'transactional', dataLayer: 'pipeline', mlType: 'hybrid', costSavings: 2.1, revenue: 5.8, productivity: 180, explainability: 92, responsibility: 90, governance: 95, trustScore: 92 },
      { id: 'wealth-planning', name: 'Wealth Planning Optimization', status: 'active', models: 2, accuracy: 99.3, aiType: 'analytical', dataLayer: 'analysis', mlType: 'tabular', costSavings: 1.5, revenue: 8.2, productivity: 95, explainability: 91, responsibility: 89, governance: 94, trustScore: 91 },
      { id: 'tax-optimization', name: 'Tax Optimization Strategy', status: 'active', models: 2, accuracy: 99.4, aiType: 'cost', dataLayer: 'standardization', mlType: 'tabular', costSavings: 6.5, revenue: 2.1, productivity: 85, explainability: 93, responsibility: 91, governance: 96, trustScore: 93 },
      { id: 'estate-planning', name: 'Estate Planning Analysis', status: 'active', models: 1, accuracy: 99.1, aiType: 'analytical', dataLayer: 'visualization', mlType: 'tabular', costSavings: 0.8, revenue: 3.5, productivity: 65, explainability: 90, responsibility: 88, governance: 93, trustScore: 90 },
      { id: 'client-advisory', name: 'Client Advisory Matching', status: 'active', models: 2, accuracy: 99.4, aiType: 'driver', dataLayer: 'normalization', mlType: 'hybrid', costSavings: 0.5, revenue: 6.8, productivity: 120, explainability: 89, responsibility: 87, governance: 92, trustScore: 89 },
      { id: 'inheritance-planning', name: 'Inheritance Planning', status: 'training', models: 1, accuracy: 0, aiType: 'analytical', dataLayer: 'eda', mlType: 'tabular', costSavings: 0, revenue: 0, productivity: 0, explainability: 0, responsibility: 0, governance: 0, trustScore: 0 },
      { id: 'retirement-planning', name: 'Retirement Planning', status: 'active', models: 2, accuracy: 99.2, aiType: 'analytical', dataLayer: 'analysis', mlType: 'time-series', costSavings: 1.2, revenue: 4.5, productivity: 95, explainability: 91, responsibility: 89, governance: 94, trustScore: 91 },
    ]
  },
  {
    id: 'corporate',
    name: 'Corporate Banking',
    icon: 'building',
    color: '#0d9488',
    description: 'Corporate finance and business banking',
    useCases: [
      { id: 'corporate-credit', name: 'Corporate Credit Assessment', status: 'active', models: 4, accuracy: 99.6, aiType: 'transactional', dataLayer: 'pipeline', mlType: 'tabular', costSavings: 3.5, revenue: 5.2, productivity: 220, explainability: 94, responsibility: 92, governance: 97, trustScore: 94 },
      { id: 'working-capital', name: 'Working Capital Optimization', status: 'active', models: 2, accuracy: 99.3, aiType: 'cost', dataLayer: 'analysis', mlType: 'time-series', costSavings: 8.2, revenue: 1.5, productivity: 150, explainability: 91, responsibility: 89, governance: 94, trustScore: 91 },
      { id: 'cash-management', name: 'Cash Management Solutions', status: 'active', models: 3, accuracy: 99.5, aiType: 'productivity', dataLayer: 'visualization', mlType: 'time-series', costSavings: 4.5, revenue: 2.8, productivity: 280, explainability: 92, responsibility: 90, governance: 95, trustScore: 92 },
      { id: 'syndicated-loans', name: 'Syndicated Loan Analysis', status: 'active', models: 2, accuracy: 99.2, aiType: 'analytical', dataLayer: 'standardization', mlType: 'tabular', costSavings: 1.8, revenue: 4.5, productivity: 85, explainability: 90, responsibility: 88, governance: 93, trustScore: 90 },
      { id: 'corporate-fraud', name: 'Corporate Fraud Detection', status: 'active', models: 2, accuracy: 99.7, aiType: 'transactional', dataLayer: 'pipeline', mlType: 'hybrid', costSavings: 5.8, revenue: 0.8, productivity: 320, explainability: 93, responsibility: 95, governance: 98, trustScore: 95 },
      { id: 'supply-chain-finance', name: 'Supply Chain Finance', status: 'training', models: 1, accuracy: 0, aiType: 'driver', dataLayer: 'normalization', mlType: 'hybrid', costSavings: 0, revenue: 0, productivity: 0, explainability: 0, responsibility: 0, governance: 0, trustScore: 0 },
      { id: 'corporate-deposits', name: 'Corporate Deposit Prediction', status: 'active', models: 1, accuracy: 99.1, aiType: 'analytical', dataLayer: 'eda', mlType: 'time-series', costSavings: 0.5, revenue: 3.2, productivity: 75, explainability: 89, responsibility: 87, governance: 92, trustScore: 89 },
    ]
  },
  {
    id: 'trade',
    name: 'Trade Finance',
    icon: 'globe',
    color: '#ea580c',
    description: 'International trade and export financing',
    useCases: [
      { id: 'lc-processing', name: 'Letter of Credit Processing', status: 'active', models: 3, accuracy: 99.6, aiType: 'productivity', dataLayer: 'pipeline', mlType: 'nlp', costSavings: 5.2, revenue: 1.8, productivity: 450, explainability: 91, responsibility: 93, governance: 97, trustScore: 94 },
      { id: 'trade-risk', name: 'Trade Risk Assessment', status: 'active', models: 2, accuracy: 99.4, aiType: 'analytical', dataLayer: 'analysis', mlType: 'tabular', costSavings: 2.8, revenue: 0.5, productivity: 120, explainability: 92, responsibility: 90, governance: 95, trustScore: 92 },
      { id: 'document-verification-trade', name: 'Trade Document Verification', status: 'active', models: 2, accuracy: 99.7, aiType: 'productivity', dataLayer: 'normalization', mlType: 'computer-vision', costSavings: 4.5, revenue: 0.3, productivity: 380, explainability: 89, responsibility: 91, governance: 96, trustScore: 92 },
      { id: 'fx-exposure', name: 'FX Exposure Management', status: 'active', models: 2, accuracy: 99.3, aiType: 'cost', dataLayer: 'standardization', mlType: 'time-series', costSavings: 6.8, revenue: 0.8, productivity: 95, explainability: 90, responsibility: 88, governance: 93, trustScore: 90 },
      { id: 'supplier-risk', name: 'Supplier Risk Analysis', status: 'active', models: 2, accuracy: 99.5, aiType: 'analytical', dataLayer: 'eda', mlType: 'tabular', costSavings: 1.5, revenue: 0.5, productivity: 85, explainability: 91, responsibility: 89, governance: 94, trustScore: 91 },
      { id: 'sanctions-trade', name: 'Trade Sanctions Screening', status: 'active', models: 3, accuracy: 99.9, aiType: 'transactional', dataLayer: 'pipeline', mlType: 'hybrid', costSavings: 3.2, revenue: 0.2, productivity: 320, explainability: 94, responsibility: 97, governance: 99, trustScore: 97 },
      { id: 'invoice-financing', name: 'Invoice Financing Risk', status: 'training', models: 1, accuracy: 0, aiType: 'analytical', dataLayer: 'analysis', mlType: 'tabular', costSavings: 0, revenue: 0, productivity: 0, explainability: 0, responsibility: 0, governance: 0, trustScore: 0 },
    ]
  },
  {
    id: 'insurance',
    name: 'Insurance',
    icon: 'umbrella',
    color: '#be185d',
    description: 'Insurance underwriting and claims',
    useCases: [
      { id: 'claims-prediction', name: 'Claims Prediction', status: 'active', models: 4, accuracy: 99.4, aiType: 'analytical', dataLayer: 'analysis', mlType: 'time-series', costSavings: 8.5, revenue: 2.1, productivity: 180, explainability: 92, responsibility: 90, governance: 95, trustScore: 92 },
      { id: 'fraud-claims', name: 'Claims Fraud Detection', status: 'active', models: 3, accuracy: 99.7, aiType: 'transactional', dataLayer: 'pipeline', mlType: 'hybrid', costSavings: 12.5, revenue: 1.5, productivity: 350, explainability: 93, responsibility: 95, governance: 98, trustScore: 95 },
      { id: 'underwriting-automation', name: 'Underwriting Automation', status: 'active', models: 3, accuracy: 99.3, aiType: 'productivity', dataLayer: 'standardization', mlType: 'tabular', costSavings: 6.8, revenue: 3.2, productivity: 420, explainability: 91, responsibility: 89, governance: 94, trustScore: 91 },
      { id: 'risk-pricing', name: 'Risk-Based Pricing', status: 'active', models: 2, accuracy: 99.2, aiType: 'driver', dataLayer: 'normalization', mlType: 'tabular', costSavings: 2.1, revenue: 8.5, productivity: 95, explainability: 90, responsibility: 88, governance: 93, trustScore: 90 },
      { id: 'policy-churn', name: 'Policy Churn Prediction', status: 'active', models: 2, accuracy: 99.1, aiType: 'analytical', dataLayer: 'visualization', mlType: 'time-series', costSavings: 3.5, revenue: 5.8, productivity: 85, explainability: 89, responsibility: 87, governance: 92, trustScore: 89 },
      { id: 'claims-triage', name: 'Claims Triage Automation', status: 'active', models: 2, accuracy: 99.5, aiType: 'productivity', dataLayer: 'pipeline', mlType: 'nlp', costSavings: 4.2, revenue: 0.5, productivity: 380, explainability: 91, responsibility: 93, governance: 97, trustScore: 94 },
      { id: 'catastrophe-modeling', name: 'Catastrophe Modeling', status: 'training', models: 1, accuracy: 0, aiType: 'analytical', dataLayer: 'eda', mlType: 'time-series', costSavings: 0, revenue: 0, productivity: 0, explainability: 0, responsibility: 0, governance: 0, trustScore: 0 },
    ]
  },
  {
    id: 'payments',
    name: 'Payments & Cards',
    icon: 'credit-card-2',
    color: '#7c3aed',
    description: 'Payment processing and card services',
    useCases: [
      { id: 'payment-fraud', name: 'Payment Fraud Detection', status: 'active', models: 5, accuracy: 99.9, aiType: 'transactional', dataLayer: 'pipeline', mlType: 'hybrid', costSavings: 15.8, revenue: 3.5, productivity: 520, explainability: 94, responsibility: 96, governance: 99, trustScore: 96 },
      { id: 'transaction-routing', name: 'Transaction Routing Optimization', status: 'active', models: 2, accuracy: 99.5, aiType: 'productivity', dataLayer: 'normalization', mlType: 'tabular', costSavings: 3.5, revenue: 1.2, productivity: 380, explainability: 92, responsibility: 90, governance: 95, trustScore: 92 },
      { id: 'card-activation', name: 'Card Activation Prediction', status: 'active', models: 2, accuracy: 99.2, aiType: 'driver', dataLayer: 'analysis', mlType: 'tabular', costSavings: 0.8, revenue: 4.5, productivity: 150, explainability: 89, responsibility: 87, governance: 92, trustScore: 89 },
      { id: 'payment-decline', name: 'Payment Decline Analysis', status: 'active', models: 2, accuracy: 99.3, aiType: 'analytical', dataLayer: 'visualization', mlType: 'tabular', costSavings: 2.1, revenue: 3.8, productivity: 120, explainability: 90, responsibility: 88, governance: 93, trustScore: 90 },
      { id: 'interchange-optimization', name: 'Interchange Optimization', status: 'active', models: 1, accuracy: 99.1, aiType: 'cost', dataLayer: 'standardization', mlType: 'tabular', costSavings: 8.5, revenue: 0.5, productivity: 85, explainability: 91, responsibility: 89, governance: 94, trustScore: 91 },
      { id: 'merchant-risk', name: 'Merchant Risk Scoring', status: 'active', models: 3, accuracy: 99.4, aiType: 'analytical', dataLayer: 'eda', mlType: 'tabular', costSavings: 4.2, revenue: 0.8, productivity: 180, explainability: 92, responsibility: 90, governance: 95, trustScore: 92 },
      { id: 'real-time-payments', name: 'Real-Time Payment Risk', status: 'training', models: 2, accuracy: 0, aiType: 'transactional', dataLayer: 'pipeline', mlType: 'time-series', costSavings: 0, revenue: 0, productivity: 0, explainability: 0, responsibility: 0, governance: 0, trustScore: 0 },
    ]
  },
  {
    id: 'digital',
    name: 'Digital Banking',
    icon: 'smartphone',
    color: '#0891b2',
    description: 'Digital channels and online banking',
    useCases: [
      { id: 'digital-onboarding', name: 'Digital Onboarding Optimization', status: 'active', models: 3, accuracy: 99.3, aiType: 'productivity', dataLayer: 'pipeline', mlType: 'hybrid', costSavings: 4.5, revenue: 6.2, productivity: 350, explainability: 90, responsibility: 88, governance: 93, trustScore: 90 },
      { id: 'app-engagement', name: 'App Engagement Prediction', status: 'active', models: 2, accuracy: 99.1, aiType: 'driver', dataLayer: 'analysis', mlType: 'tabular', costSavings: 0.5, revenue: 8.5, productivity: 120, explainability: 88, responsibility: 86, governance: 91, trustScore: 88 },
      { id: 'chatbot-intent', name: 'Chatbot Intent Classification', status: 'active', models: 2, accuracy: 99.6, aiType: 'transactional', dataLayer: 'normalization', mlType: 'nlp', costSavings: 5.8, revenue: 1.2, productivity: 450, explainability: 91, responsibility: 93, governance: 97, trustScore: 94 },
      { id: 'digital-fraud', name: 'Digital Channel Fraud', status: 'active', models: 3, accuracy: 99.8, aiType: 'transactional', dataLayer: 'pipeline', mlType: 'hybrid', costSavings: 8.5, revenue: 2.1, productivity: 380, explainability: 93, responsibility: 95, governance: 98, trustScore: 95 },
      { id: 'ux-optimization', name: 'UX Flow Optimization', status: 'active', models: 1, accuracy: 99.2, aiType: 'productivity', dataLayer: 'visualization', mlType: 'tabular', costSavings: 1.2, revenue: 5.5, productivity: 180, explainability: 89, responsibility: 87, governance: 92, trustScore: 89 },
      { id: 'feature-adoption', name: 'Feature Adoption Prediction', status: 'active', models: 2, accuracy: 99.0, aiType: 'analytical', dataLayer: 'eda', mlType: 'tabular', costSavings: 0.5, revenue: 3.8, productivity: 95, explainability: 87, responsibility: 85, governance: 90, trustScore: 87 },
      { id: 'voice-banking', name: 'Voice Banking NLP', status: 'training', models: 1, accuracy: 0, aiType: 'transactional', dataLayer: 'standardization', mlType: 'nlp', costSavings: 0, revenue: 0, productivity: 0, explainability: 0, responsibility: 0, governance: 0, trustScore: 0 },
    ]
  },
  {
    id: 'mortgage',
    name: 'Mortgage & Housing',
    icon: 'home',
    color: '#16a34a',
    description: 'Mortgage lending and housing finance',
    useCases: [
      { id: 'mortgage-approval', name: 'Mortgage Approval Prediction', status: 'active', models: 4, accuracy: 99.6, aiType: 'transactional', dataLayer: 'pipeline', mlType: 'tabular', costSavings: 5.8, revenue: 4.5, productivity: 280, explainability: 94, responsibility: 92, governance: 97, trustScore: 94 },
      { id: 'property-valuation', name: 'Property Valuation AI', status: 'active', models: 3, accuracy: 99.4, aiType: 'analytical', dataLayer: 'standardization', mlType: 'hybrid', costSavings: 3.2, revenue: 1.8, productivity: 220, explainability: 91, responsibility: 89, governance: 94, trustScore: 91 },
      { id: 'prepayment-prediction', name: 'Prepayment Prediction', status: 'active', models: 2, accuracy: 99.2, aiType: 'analytical', dataLayer: 'analysis', mlType: 'time-series', costSavings: 2.1, revenue: 0.8, productivity: 95, explainability: 90, responsibility: 88, governance: 93, trustScore: 90 },
      { id: 'mortgage-default', name: 'Mortgage Default Risk', status: 'active', models: 3, accuracy: 99.5, aiType: 'analytical', dataLayer: 'normalization', mlType: 'tabular', costSavings: 8.5, revenue: 1.2, productivity: 150, explainability: 93, responsibility: 91, governance: 96, trustScore: 93 },
      { id: 'refinance-propensity', name: 'Refinance Propensity', status: 'active', models: 2, accuracy: 99.1, aiType: 'driver', dataLayer: 'eda', mlType: 'tabular', costSavings: 0.5, revenue: 6.5, productivity: 120, explainability: 88, responsibility: 86, governance: 91, trustScore: 88 },
      { id: 'housing-market', name: 'Housing Market Analysis', status: 'active', models: 2, accuracy: 99.0, aiType: 'analytical', dataLayer: 'visualization', mlType: 'time-series', costSavings: 0.8, revenue: 2.5, productivity: 65, explainability: 87, responsibility: 85, governance: 90, trustScore: 87 },
      { id: 'escrow-management', name: 'Escrow Management', status: 'training', models: 1, accuracy: 0, aiType: 'productivity', dataLayer: 'pipeline', mlType: 'tabular', costSavings: 0, revenue: 0, productivity: 0, explainability: 0, responsibility: 0, governance: 0, trustScore: 0 },
    ]
  },
  {
    id: 'asset',
    name: 'Asset Management',
    icon: 'pie-chart',
    color: '#dc2626',
    description: 'Asset management and fund operations',
    useCases: [
      { id: 'fund-performance', name: 'Fund Performance Prediction', status: 'active', models: 3, accuracy: 99.1, aiType: 'analytical', dataLayer: 'analysis', mlType: 'time-series', costSavings: 1.5, revenue: 8.5, productivity: 85, explainability: 88, responsibility: 86, governance: 91, trustScore: 88 },
      { id: 'asset-allocation', name: 'Asset Allocation Optimization', status: 'active', models: 3, accuracy: 99.4, aiType: 'driver', dataLayer: 'standardization', mlType: 'hybrid', costSavings: 2.1, revenue: 12.5, productivity: 120, explainability: 91, responsibility: 89, governance: 94, trustScore: 91 },
      { id: 'nav-forecasting', name: 'NAV Forecasting', status: 'active', models: 2, accuracy: 99.2, aiType: 'analytical', dataLayer: 'normalization', mlType: 'time-series', costSavings: 0.8, revenue: 3.5, productivity: 75, explainability: 90, responsibility: 88, governance: 93, trustScore: 90 },
      { id: 'fund-flow', name: 'Fund Flow Prediction', status: 'active', models: 2, accuracy: 99.0, aiType: 'analytical', dataLayer: 'visualization', mlType: 'time-series', costSavings: 0.5, revenue: 5.2, productivity: 65, explainability: 89, responsibility: 87, governance: 92, trustScore: 89 },
      { id: 'manager-selection', name: 'Manager Selection Analysis', status: 'active', models: 2, accuracy: 99.1, aiType: 'analytical', dataLayer: 'eda', mlType: 'tabular', costSavings: 1.2, revenue: 4.5, productivity: 55, explainability: 90, responsibility: 88, governance: 93, trustScore: 90 },
      { id: 'esg-scoring', name: 'ESG Scoring Model', status: 'active', models: 2, accuracy: 99.5, aiType: 'driver', dataLayer: 'pipeline', mlType: 'nlp', costSavings: 0.5, revenue: 6.8, productivity: 95, explainability: 92, responsibility: 94, governance: 97, trustScore: 94 },
      { id: 'alternative-investments', name: 'Alternative Investment Analysis', status: 'training', models: 1, accuracy: 0, aiType: 'analytical', dataLayer: 'analysis', mlType: 'hybrid', costSavings: 0, revenue: 0, productivity: 0, explainability: 0, responsibility: 0, governance: 0, trustScore: 0 },
    ]
  },
  {
    id: 'operations',
    name: 'Operations',
    icon: 'cog',
    color: '#475569',
    description: 'Banking operations and process automation',
    useCases: [
      { id: 'process-automation', name: 'Process Automation', status: 'active', models: 4, accuracy: 99.7, aiType: 'productivity', dataLayer: 'pipeline', mlType: 'hybrid', costSavings: 12.5, revenue: 0.5, productivity: 580, explainability: 93, responsibility: 91, governance: 96, trustScore: 93 },
      { id: 'exception-handling', name: 'Exception Handling Prediction', status: 'active', models: 2, accuracy: 99.4, aiType: 'productivity', dataLayer: 'analysis', mlType: 'tabular', costSavings: 4.8, revenue: 0.3, productivity: 320, explainability: 90, responsibility: 88, governance: 93, trustScore: 90 },
      { id: 'reconciliation', name: 'Reconciliation Automation', status: 'active', models: 3, accuracy: 99.8, aiType: 'productivity', dataLayer: 'standardization', mlType: 'tabular', costSavings: 8.5, revenue: 0.2, productivity: 480, explainability: 94, responsibility: 92, governance: 97, trustScore: 94 },
      { id: 'document-processing', name: 'Document Processing OCR', status: 'active', models: 3, accuracy: 99.6, aiType: 'productivity', dataLayer: 'normalization', mlType: 'computer-vision', costSavings: 6.2, revenue: 0.5, productivity: 420, explainability: 91, responsibility: 93, governance: 97, trustScore: 94 },
      { id: 'workflow-optimization', name: 'Workflow Optimization', status: 'active', models: 2, accuracy: 99.3, aiType: 'cost', dataLayer: 'visualization', mlType: 'tabular', costSavings: 5.5, revenue: 0.3, productivity: 250, explainability: 89, responsibility: 87, governance: 92, trustScore: 89 },
      { id: 'capacity-planning', name: 'Capacity Planning', status: 'active', models: 1, accuracy: 99.1, aiType: 'cost', dataLayer: 'eda', mlType: 'time-series', costSavings: 3.8, revenue: 0.2, productivity: 150, explainability: 88, responsibility: 86, governance: 91, trustScore: 88 },
      { id: 'vendor-management', name: 'Vendor Performance Analysis', status: 'training', models: 1, accuracy: 0, aiType: 'analytical', dataLayer: 'analysis', mlType: 'tabular', costSavings: 0, revenue: 0, productivity: 0, explainability: 0, responsibility: 0, governance: 0, trustScore: 0 },
    ]
  },
  {
    id: 'hr',
    name: 'HR Analytics',
    icon: 'user-check',
    color: '#f59e0b',
    description: 'Human resources and workforce analytics',
    useCases: [
      { id: 'attrition-prediction', name: 'Employee Attrition Prediction', status: 'active', models: 3, accuracy: 99.3, aiType: 'analytical', dataLayer: 'analysis', mlType: 'tabular', costSavings: 3.5, revenue: 0.8, productivity: 120, explainability: 91, responsibility: 93, governance: 96, trustScore: 93 },
      { id: 'talent-acquisition', name: 'Talent Acquisition Scoring', status: 'active', models: 2, accuracy: 99.1, aiType: 'productivity', dataLayer: 'pipeline', mlType: 'hybrid', costSavings: 2.8, revenue: 0.5, productivity: 250, explainability: 89, responsibility: 91, governance: 95, trustScore: 92 },
      { id: 'performance-prediction', name: 'Performance Prediction', status: 'active', models: 2, accuracy: 99.0, aiType: 'analytical', dataLayer: 'standardization', mlType: 'tabular', costSavings: 1.5, revenue: 0.3, productivity: 85, explainability: 90, responsibility: 92, governance: 95, trustScore: 92 },
      { id: 'compensation-analysis', name: 'Compensation Analysis', status: 'active', models: 1, accuracy: 99.2, aiType: 'cost', dataLayer: 'visualization', mlType: 'tabular', costSavings: 5.2, revenue: 0, productivity: 95, explainability: 93, responsibility: 95, governance: 98, trustScore: 95 },
      { id: 'workforce-planning', name: 'Workforce Planning', status: 'active', models: 2, accuracy: 99.1, aiType: 'analytical', dataLayer: 'normalization', mlType: 'time-series', costSavings: 2.1, revenue: 0.2, productivity: 120, explainability: 88, responsibility: 86, governance: 91, trustScore: 88 },
      { id: 'skill-gap', name: 'Skill Gap Analysis', status: 'active', models: 1, accuracy: 99.0, aiType: 'analytical', dataLayer: 'eda', mlType: 'nlp', costSavings: 0.8, revenue: 0.5, productivity: 75, explainability: 87, responsibility: 89, governance: 93, trustScore: 90 },
      { id: 'succession-planning', name: 'Succession Planning', status: 'training', models: 1, accuracy: 0, aiType: 'driver', dataLayer: 'analysis', mlType: 'tabular', costSavings: 0, revenue: 0, productivity: 0, explainability: 0, responsibility: 0, governance: 0, trustScore: 0 },
    ]
  }
];

export const getStatusColor = (status) => {
  switch (status) {
    case 'active': return 'success';
    case 'training': return 'warning';
    case 'pending': return 'neutral';
    case 'failed': return 'danger';
    default: return 'neutral';
  }
};

export const getStatusLabel = (status) => {
  switch (status) {
    case 'active': return 'Active';
    case 'training': return 'Training';
    case 'pending': return 'Pending';
    case 'failed': return 'Failed';
    default: return 'Unknown';
  }
};

// Pipeline UC ID mapping: maps department use case IDs to pipeline UC IDs
export const pipelineUcMapping = {
  // Risk Management
  'credit-risk-scoring': 'UC-CR-01',
  'market-risk-var': 'UC-MR-02',
  'operational-risk': 'UC-OR-01',
  'interest-rate-risk': 'UC-ER-02',
  // Credit Analysis
  'loan-approval': 'UC-CR-01',
  'default-prediction': 'UC-CR-02',
  'credit-scoring': 'UC-CR-01',
  // Fraud Detection
  'transaction-fraud': 'UC-FR-01',
  'card-fraud': 'UC-FR-02',
  'identity-fraud': 'UC-FR-03',
  'aml-detection': 'UC-AML-01',
  // Customer Analytics
  'churn-prediction': 'UC-CX-01',
  'next-best-action': 'UC-CX-02',
  'clv-prediction': 'UC-CRM-03',
  'segmentation': 'UC-MKT-01',
  'sentiment-analysis': 'UC-MR-03',
  // Compliance
  'kyc-verification': 'UC-AML-01',
  'fair-lending': 'UC-CX-05',
  'regulatory-reporting': 'UC-RC-02',
  // Treasury
  'cash-forecasting': 'UC-COR-03',
  'fx-prediction': 'UC-MR-02',
  // Retail Banking
  'deposit-prediction': 'UC-RBK-02',
  'pricing-optimization': 'UC-RBK-03',
  'account-opening': 'UC-RBK-01',
  // Digital Banking
  'digital-onboarding': 'UC-DIG-01',
  'chatbot-intent': 'UC-DB-01',
  'voice-banking': 'UC-DB-03',
  // Operations
  'process-automation': 'UC-PA-01',
  'workflow-optimization': 'UC-PO-01',
  'document-processing': 'UC-DOC-03',
  // HR
  'attrition-prediction': 'UC-TM-02',
  'talent-acquisition': 'UC-TM-01',
  'performance-prediction': 'UC-TM-03',
  // Investment Banking
  'portfolio-optimization': 'UC-31-01',
  'stock-prediction': 'UC-MR-03',
  // Insurance
  'claims-prediction': 'UC-COL-01',
  'underwriting-automation': 'UC-CR-04',
  // Payments
  'payment-fraud': 'UC-PP-01',
  'transaction-routing': 'UC-PP-02',
  // ESG / Asset Management
  'esg-scoring': 'UC-ESG-01',
};
