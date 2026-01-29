// Analysis Types Configuration for Banking ML Use Cases

export const analysisCategories = [
  {
    id: 'outlier',
    name: 'Outlier Analysis',
    icon: 'alert-triangle',
    color: '#ef4444',
    description: 'Detection and treatment of anomalous data points',
    methods: [
      { id: 'zscore', name: 'Z-Score Method', threshold: 3.0, description: 'Standard deviation based outlier detection' },
      { id: 'iqr', name: 'IQR Method', multiplier: 1.5, description: 'Interquartile range based detection' },
      { id: 'isolation-forest', name: 'Isolation Forest', contamination: 0.01, description: 'ML-based anomaly detection' },
      { id: 'lof', name: 'Local Outlier Factor', neighbors: 20, description: 'Density-based outlier detection' },
      { id: 'dbscan', name: 'DBSCAN Clustering', eps: 0.5, description: 'Density-based spatial clustering' },
    ]
  },
  {
    id: 'statistical',
    name: 'Statistical Analysis',
    icon: 'analytics',
    color: '#3b82f6',
    description: 'Comprehensive statistical measures and tests',
    methods: [
      { id: 'descriptive', name: 'Descriptive Statistics', description: 'Mean, median, mode, std, variance, skewness, kurtosis' },
      { id: 'hypothesis', name: 'Hypothesis Testing', description: 'T-tests, Chi-square, ANOVA, Mann-Whitney' },
      { id: 'correlation', name: 'Correlation Analysis', description: 'Pearson, Spearman, Kendall correlations' },
      { id: 'regression', name: 'Regression Analysis', description: 'Linear, polynomial, logistic regression' },
      { id: 'distribution', name: 'Distribution Fitting', description: 'Normal, exponential, Poisson, binomial fitting' },
    ]
  },
  {
    id: 'sensitivity',
    name: 'Sensitivity Analysis',
    icon: 'target',
    color: '#8b5cf6',
    description: 'Impact analysis of input variations on model output',
    methods: [
      { id: 'one-at-time', name: 'One-At-A-Time (OAT)', description: 'Vary one parameter while holding others constant' },
      { id: 'morris', name: 'Morris Method', description: 'Elementary effects screening method' },
      { id: 'sobol', name: 'Sobol Indices', description: 'Variance-based global sensitivity analysis' },
      { id: 'shap', name: 'SHAP Values', description: 'SHapley Additive exPlanations for feature importance' },
      { id: 'permutation', name: 'Permutation Importance', description: 'Feature importance by random shuffling' },
    ]
  },
  {
    id: 'real-data',
    name: 'Real Data Analysis',
    icon: 'database',
    color: '#10b981',
    description: 'Analysis using actual production data',
    methods: [
      { id: 'data-profiling', name: 'Data Profiling', description: 'Comprehensive data quality assessment' },
      { id: 'data-drift', name: 'Data Drift Detection', description: 'Monitor distribution changes over time' },
      { id: 'feature-drift', name: 'Feature Drift Analysis', description: 'Track feature value changes' },
      { id: 'concept-drift', name: 'Concept Drift Detection', description: 'Detect relationship changes between features and target' },
      { id: 'data-lineage', name: 'Data Lineage Tracking', description: 'Track data origin and transformations' },
    ]
  },
  {
    id: 'subject',
    name: 'Subject Matter Analysis',
    icon: 'users',
    color: '#f59e0b',
    description: 'Domain-specific business analysis',
    methods: [
      { id: 'business-rules', name: 'Business Rules Validation', description: 'Verify compliance with business logic' },
      { id: 'domain-expert', name: 'Domain Expert Review', description: 'Expert validation of model outputs' },
      { id: 'regulatory', name: 'Regulatory Compliance', description: 'Check against regulatory requirements' },
      { id: 'benchmark', name: 'Industry Benchmarking', description: 'Compare against industry standards' },
      { id: 'stakeholder', name: 'Stakeholder Analysis', description: 'Impact assessment for stakeholders' },
    ]
  },
  {
    id: 'model-validation',
    name: 'Model Validation',
    icon: 'check-circle',
    color: '#0891b2',
    description: 'Comprehensive model validation and testing',
    methods: [
      { id: 'cross-validation', name: 'Cross-Validation', description: 'K-fold, stratified, time-series CV' },
      { id: 'backtesting', name: 'Backtesting', description: 'Historical performance validation' },
      { id: 'stress-testing', name: 'Stress Testing', description: 'Performance under extreme conditions' },
      { id: 'champion-challenger', name: 'Champion-Challenger', description: 'A/B testing of model versions' },
      { id: 'shadow-mode', name: 'Shadow Mode Testing', description: 'Parallel production testing' },
    ]
  },
  {
    id: 'bias-fairness',
    name: 'Bias & Fairness Analysis',
    icon: 'shield',
    color: '#dc2626',
    description: 'Ensure model fairness and detect bias',
    methods: [
      { id: 'demographic-parity', name: 'Demographic Parity', description: 'Equal positive rates across groups' },
      { id: 'equalized-odds', name: 'Equalized Odds', description: 'Equal TPR and FPR across groups' },
      { id: 'disparate-impact', name: 'Disparate Impact', description: '80% rule compliance check' },
      { id: 'calibration', name: 'Calibration Analysis', description: 'Prediction probability accuracy' },
      { id: 'protected-attributes', name: 'Protected Attributes', description: 'Analysis of sensitive features' },
    ]
  },
  {
    id: 'performance',
    name: 'Performance Analysis',
    icon: 'zap',
    color: '#7c3aed',
    description: 'Model performance metrics and monitoring',
    methods: [
      { id: 'accuracy-metrics', name: 'Accuracy Metrics', description: 'Precision, recall, F1, AUC-ROC' },
      { id: 'confusion-matrix', name: 'Confusion Matrix', description: 'TP, TN, FP, FN analysis' },
      { id: 'lift-gain', name: 'Lift & Gain Charts', description: 'Model lift over random baseline' },
      { id: 'ks-statistic', name: 'KS Statistic', description: 'Kolmogorov-Smirnov discrimination' },
      { id: 'gini-coefficient', name: 'Gini Coefficient', description: 'Model discrimination power' },
    ]
  },
];

// Analysis results for each use case
export const useCaseAnalysis = {
  // Risk Management
  'credit-risk-scoring': {
    outlier: { detected: 1247, treated: 1198, method: 'isolation-forest', score: 99.2 },
    statistical: { normality: 'passed', correlation: 0.94, significance: 0.001, score: 99.5 },
    sensitivity: { topFeatures: ['credit_score', 'income', 'debt_ratio'], shapScore: 0.96, score: 99.3 },
    'real-data': { records: 2450000, quality: 99.8, drift: 0.02, score: 99.7 },
    subject: { businessApproval: true, regulatoryCompliance: 'SR 11-7', score: 99.4 },
    'model-validation': { cvScore: 99.2, backtestScore: 99.1, stressTest: 'passed', score: 99.2 },
    'bias-fairness': { disparateImpact: 0.92, demographicParity: 0.95, score: 99.1 },
    performance: { auc: 0.992, gini: 0.984, ks: 0.87, score: 99.8 },
  },
  'market-risk-var': {
    outlier: { detected: 892, treated: 865, method: 'zscore', score: 99.3 },
    statistical: { normality: 'passed', correlation: 0.91, significance: 0.005, score: 99.4 },
    sensitivity: { topFeatures: ['volatility', 'correlation', 'position_size'], shapScore: 0.94, score: 99.2 },
    'real-data': { records: 1850000, quality: 99.6, drift: 0.03, score: 99.5 },
    subject: { businessApproval: true, regulatoryCompliance: 'Basel III', score: 99.3 },
    'model-validation': { cvScore: 99.5, backtestScore: 99.3, stressTest: 'passed', score: 99.5 },
    'bias-fairness': { disparateImpact: 0.95, demographicParity: 0.97, score: 99.4 },
    performance: { auc: 0.995, gini: 0.990, ks: 0.89, score: 99.5 },
  },
  // Credit Analysis
  'loan-approval': {
    outlier: { detected: 2156, treated: 2089, method: 'iqr', score: 99.5 },
    statistical: { normality: 'passed', correlation: 0.96, significance: 0.001, score: 99.6 },
    sensitivity: { topFeatures: ['income', 'employment_years', 'credit_history'], shapScore: 0.97, score: 99.4 },
    'real-data': { records: 3200000, quality: 99.9, drift: 0.01, score: 99.8 },
    subject: { businessApproval: true, regulatoryCompliance: 'ECOA', score: 99.5 },
    'model-validation': { cvScore: 99.7, backtestScore: 99.5, stressTest: 'passed', score: 99.7 },
    'bias-fairness': { disparateImpact: 0.94, demographicParity: 0.96, score: 99.3 },
    performance: { auc: 0.997, gini: 0.994, ks: 0.91, score: 99.7 },
  },
  'default-prediction': {
    outlier: { detected: 1834, treated: 1789, method: 'isolation-forest', score: 99.6 },
    statistical: { normality: 'passed', correlation: 0.97, significance: 0.001, score: 99.8 },
    sensitivity: { topFeatures: ['payment_history', 'utilization', 'delinquency'], shapScore: 0.98, score: 99.7 },
    'real-data': { records: 4500000, quality: 99.9, drift: 0.01, score: 99.9 },
    subject: { businessApproval: true, regulatoryCompliance: 'IFRS 9', score: 99.6 },
    'model-validation': { cvScore: 99.9, backtestScore: 99.7, stressTest: 'passed', score: 99.9 },
    'bias-fairness': { disparateImpact: 0.96, demographicParity: 0.98, score: 99.5 },
    performance: { auc: 0.999, gini: 0.998, ks: 0.94, score: 99.9 },
  },
  // Fraud Detection
  'transaction-fraud': {
    outlier: { detected: 45678, treated: 44532, method: 'isolation-forest', score: 99.7 },
    statistical: { normality: 'adjusted', correlation: 0.89, significance: 0.001, score: 99.5 },
    sensitivity: { topFeatures: ['amount', 'velocity', 'location_risk'], shapScore: 0.96, score: 99.6 },
    'real-data': { records: 125000000, quality: 99.8, drift: 0.02, score: 99.8 },
    subject: { businessApproval: true, regulatoryCompliance: 'PCI-DSS', score: 99.7 },
    'model-validation': { cvScore: 99.8, backtestScore: 99.6, stressTest: 'passed', score: 99.8 },
    'bias-fairness': { disparateImpact: 0.97, demographicParity: 0.98, score: 99.6 },
    performance: { auc: 0.998, gini: 0.996, ks: 0.92, score: 99.8 },
  },
  'card-fraud': {
    outlier: { detected: 38945, treated: 38012, method: 'lof', score: 99.8 },
    statistical: { normality: 'adjusted', correlation: 0.91, significance: 0.001, score: 99.6 },
    sensitivity: { topFeatures: ['merchant_category', 'transaction_type', 'device_id'], shapScore: 0.97, score: 99.7 },
    'real-data': { records: 98000000, quality: 99.9, drift: 0.01, score: 99.9 },
    subject: { businessApproval: true, regulatoryCompliance: 'EMV', score: 99.8 },
    'model-validation': { cvScore: 99.9, backtestScore: 99.8, stressTest: 'passed', score: 99.9 },
    'bias-fairness': { disparateImpact: 0.98, demographicParity: 0.99, score: 99.7 },
    performance: { auc: 0.999, gini: 0.998, ks: 0.95, score: 99.9 },
  },
  'aml-detection': {
    outlier: { detected: 12567, treated: 12234, method: 'dbscan', score: 99.3 },
    statistical: { normality: 'adjusted', correlation: 0.88, significance: 0.001, score: 99.2 },
    sensitivity: { topFeatures: ['transaction_pattern', 'country_risk', 'amount_threshold'], shapScore: 0.95, score: 99.4 },
    'real-data': { records: 67000000, quality: 99.7, drift: 0.02, score: 99.4 },
    subject: { businessApproval: true, regulatoryCompliance: 'BSA/AML', score: 99.8 },
    'model-validation': { cvScore: 99.4, backtestScore: 99.2, stressTest: 'passed', score: 99.4 },
    'bias-fairness': { disparateImpact: 0.96, demographicParity: 0.97, score: 99.5 },
    performance: { auc: 0.994, gini: 0.988, ks: 0.88, score: 99.4 },
  },
  // Customer Analytics
  'churn-prediction': {
    outlier: { detected: 2345, treated: 2289, method: 'iqr', score: 99.4 },
    statistical: { normality: 'passed', correlation: 0.93, significance: 0.001, score: 99.5 },
    sensitivity: { topFeatures: ['tenure', 'activity_decline', 'support_tickets'], shapScore: 0.95, score: 99.3 },
    'real-data': { records: 8500000, quality: 99.7, drift: 0.02, score: 99.6 },
    subject: { businessApproval: true, regulatoryCompliance: 'GDPR', score: 99.4 },
    'model-validation': { cvScore: 99.6, backtestScore: 99.4, stressTest: 'passed', score: 99.6 },
    'bias-fairness': { disparateImpact: 0.94, demographicParity: 0.96, score: 99.3 },
    performance: { auc: 0.996, gini: 0.992, ks: 0.89, score: 99.6 },
  },
  'sentiment-analysis': {
    outlier: { detected: 567, treated: 545, method: 'zscore', score: 99.5 },
    statistical: { normality: 'adjusted', correlation: 0.87, significance: 0.005, score: 99.4 },
    sensitivity: { topFeatures: ['text_sentiment', 'keyword_freq', 'context'], shapScore: 0.94, score: 99.5 },
    'real-data': { records: 12000000, quality: 99.6, drift: 0.03, score: 99.7 },
    subject: { businessApproval: true, regulatoryCompliance: 'N/A', score: 99.6 },
    'model-validation': { cvScore: 99.7, backtestScore: 99.5, stressTest: 'passed', score: 99.7 },
    'bias-fairness': { disparateImpact: 0.95, demographicParity: 0.97, score: 99.4 },
    performance: { auc: 0.997, gini: 0.994, ks: 0.90, score: 99.7 },
  },
};

// Generate analysis for all use cases
export const generateAnalysisForUseCase = (useCaseId, accuracy) => {
  if (useCaseAnalysis[useCaseId]) {
    return useCaseAnalysis[useCaseId];
  }

  // Generate default analysis based on accuracy
  const baseScore = accuracy || 99.0;
  return {
    outlier: {
      detected: Math.floor(Math.random() * 5000) + 500,
      treated: Math.floor(Math.random() * 4800) + 480,
      method: ['zscore', 'iqr', 'isolation-forest', 'lof'][Math.floor(Math.random() * 4)],
      score: (baseScore - 0.3 + Math.random() * 0.6).toFixed(1)
    },
    statistical: {
      normality: Math.random() > 0.2 ? 'passed' : 'adjusted',
      correlation: (0.85 + Math.random() * 0.12).toFixed(2),
      significance: 0.001,
      score: (baseScore - 0.2 + Math.random() * 0.4).toFixed(1)
    },
    sensitivity: {
      topFeatures: ['feature_1', 'feature_2', 'feature_3'],
      shapScore: (0.92 + Math.random() * 0.06).toFixed(2),
      score: (baseScore - 0.4 + Math.random() * 0.8).toFixed(1)
    },
    'real-data': {
      records: Math.floor(Math.random() * 10000000) + 1000000,
      quality: (99.5 + Math.random() * 0.4).toFixed(1),
      drift: (Math.random() * 0.03).toFixed(2),
      score: (baseScore - 0.1 + Math.random() * 0.2).toFixed(1)
    },
    subject: {
      businessApproval: true,
      regulatoryCompliance: 'Compliant',
      score: (baseScore - 0.3 + Math.random() * 0.6).toFixed(1)
    },
    'model-validation': {
      cvScore: (baseScore - 0.2 + Math.random() * 0.4).toFixed(1),
      backtestScore: (baseScore - 0.4 + Math.random() * 0.8).toFixed(1),
      stressTest: 'passed',
      score: (baseScore - 0.2 + Math.random() * 0.4).toFixed(1)
    },
    'bias-fairness': {
      disparateImpact: (0.92 + Math.random() * 0.06).toFixed(2),
      demographicParity: (0.94 + Math.random() * 0.05).toFixed(2),
      score: (baseScore - 0.5 + Math.random() * 1.0).toFixed(1)
    },
    performance: {
      auc: (0.99 + Math.random() * 0.009).toFixed(3),
      gini: (0.98 + Math.random() * 0.018).toFixed(3),
      ks: (0.85 + Math.random() * 0.10).toFixed(2),
      score: baseScore
    },
  };
};

// Analysis summary statistics
export const getAnalysisSummary = (analysisData) => {
  const categories = Object.keys(analysisData);
  const avgScore = categories.reduce((sum, cat) => sum + parseFloat(analysisData[cat].score), 0) / categories.length;

  return {
    totalCategories: categories.length,
    averageScore: avgScore.toFixed(1),
    passedAll: categories.every(cat => parseFloat(analysisData[cat].score) >= 99.0),
    topCategory: categories.reduce((max, cat) =>
      parseFloat(analysisData[cat].score) > parseFloat(analysisData[max].score) ? cat : max
    ),
    lowestCategory: categories.reduce((min, cat) =>
      parseFloat(analysisData[cat].score) < parseFloat(analysisData[min].score) ? cat : min
    ),
  };
};
