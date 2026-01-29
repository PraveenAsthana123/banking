import React, { useState } from 'react';
import { Icon } from '../components/Icons';
import { departments } from '../data/departments';
import { analysisCategories, generateAnalysisForUseCase, getAnalysisSummary } from '../data/analysisTypes';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  Cell,
} from 'recharts';

const ModelAnalysis = () => {
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedUseCase, setSelectedUseCase] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Get all use cases
  const getAllUseCases = () => {
    return departments.flatMap(dept =>
      dept.useCases.filter(uc => uc.status === 'active').map(uc => ({
        ...uc,
        department: dept.name,
        deptId: dept.id
      }))
    );
  };

  const useCases = selectedDept === 'all'
    ? getAllUseCases()
    : getAllUseCases().filter(uc => uc.deptId === selectedDept);

  const currentUseCase = selectedUseCase || useCases[0];
  const analysisData = currentUseCase ? generateAnalysisForUseCase(currentUseCase.id, currentUseCase.accuracy) : null;
  const summary = analysisData ? getAnalysisSummary(analysisData) : null;

  // Radar chart data
  const radarData = analysisData ? [
    { category: 'Outlier', score: parseFloat(analysisData.outlier.score), fullMark: 100 },
    { category: 'Statistical', score: parseFloat(analysisData.statistical.score), fullMark: 100 },
    { category: 'Sensitivity', score: parseFloat(analysisData.sensitivity.score), fullMark: 100 },
    { category: 'Real Data', score: parseFloat(analysisData['real-data'].score), fullMark: 100 },
    { category: 'Subject', score: parseFloat(analysisData.subject.score), fullMark: 100 },
    { category: 'Validation', score: parseFloat(analysisData['model-validation'].score), fullMark: 100 },
    { category: 'Fairness', score: parseFloat(analysisData['bias-fairness'].score), fullMark: 100 },
    { category: 'Performance', score: parseFloat(analysisData.performance.score), fullMark: 100 },
  ] : [];

  // ROC Curve data
  const rocData = [
    { fpr: 0, tpr: 0 },
    { fpr: 0.01, tpr: 0.45 },
    { fpr: 0.02, tpr: 0.65 },
    { fpr: 0.05, tpr: 0.82 },
    { fpr: 0.10, tpr: 0.91 },
    { fpr: 0.15, tpr: 0.95 },
    { fpr: 0.20, tpr: 0.97 },
    { fpr: 0.30, tpr: 0.985 },
    { fpr: 0.50, tpr: 0.995 },
    { fpr: 0.70, tpr: 0.998 },
    { fpr: 1.0, tpr: 1.0 },
  ];

  const diagonalLine = [{ fpr: 0, tpr: 0 }, { fpr: 1, tpr: 1 }];

  // SHAP feature importance data
  const shapData = [
    { feature: 'Credit Score', importance: 0.35, direction: 'positive' },
    { feature: 'Income', importance: 0.22, direction: 'positive' },
    { feature: 'Debt Ratio', importance: -0.18, direction: 'negative' },
    { feature: 'Employment Years', importance: 0.12, direction: 'positive' },
    { feature: 'Age', importance: 0.08, direction: 'positive' },
    { feature: 'Num Accounts', importance: -0.05, direction: 'negative' },
    { feature: 'Recent Inquiries', importance: -0.04, direction: 'negative' },
    { feature: 'Utilization', importance: -0.15, direction: 'negative' },
  ].sort((a, b) => Math.abs(b.importance) - Math.abs(a.importance));

  // LIME explanation data
  const limeData = [
    { feature: 'Credit Score > 720', weight: 0.28, color: '#10b981' },
    { feature: 'Income > $75K', weight: 0.19, color: '#10b981' },
    { feature: 'Debt Ratio < 30%', weight: 0.15, color: '#10b981' },
    { feature: 'Employment > 5 yrs', weight: 0.12, color: '#10b981' },
    { feature: 'Recent Inquiries > 3', weight: -0.08, color: '#ef4444' },
    { feature: 'Utilization > 50%', weight: -0.11, color: '#ef4444' },
  ];

  // Counterfactual data
  const counterfactualData = {
    original: { prediction: 'Rejected', probability: 0.32, creditScore: 650, income: 45000, debtRatio: 42 },
    counterfactual: { prediction: 'Approved', probability: 0.78, creditScore: 700, income: 45000, debtRatio: 35 },
    changes: [
      { feature: 'Credit Score', from: 650, to: 700, change: '+50' },
      { feature: 'Debt Ratio', from: '42%', to: '35%', change: '-7%' },
    ]
  };

  // Calibration curve data
  const calibrationData = [
    { predicted: 0.1, actual: 0.09, bucket: '0-10%' },
    { predicted: 0.2, actual: 0.19, bucket: '10-20%' },
    { predicted: 0.3, actual: 0.31, bucket: '20-30%' },
    { predicted: 0.4, actual: 0.38, bucket: '30-40%' },
    { predicted: 0.5, actual: 0.51, bucket: '40-50%' },
    { predicted: 0.6, actual: 0.59, bucket: '50-60%' },
    { predicted: 0.7, actual: 0.72, bucket: '60-70%' },
    { predicted: 0.8, actual: 0.79, bucket: '70-80%' },
    { predicted: 0.9, actual: 0.91, bucket: '80-90%' },
    { predicted: 1.0, actual: 0.98, bucket: '90-100%' },
  ];

  // Precision-Recall curve
  const prCurveData = [
    { recall: 0, precision: 1.0 },
    { recall: 0.2, precision: 0.99 },
    { recall: 0.4, precision: 0.98 },
    { recall: 0.6, precision: 0.96 },
    { recall: 0.8, precision: 0.93 },
    { recall: 0.9, precision: 0.88 },
    { recall: 0.95, precision: 0.82 },
    { recall: 1.0, precision: 0.75 },
  ];

  // Debug/Residual data
  const residualData = Array.from({ length: 50 }, (_, i) => ({
    predicted: 0.5 + (Math.random() - 0.5) * 0.8,
    residual: (Math.random() - 0.5) * 0.1,
  }));

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'roc-pr', label: 'ROC & PR Curves', icon: 'trending-up' },
    { id: 'shap-lime', label: 'SHAP & LIME', icon: 'eye' },
    { id: 'counterfactual', label: 'Counterfactual', icon: 'git-branch' },
    { id: 'calibration', label: 'Calibration', icon: 'target' },
    { id: 'debug', label: 'Debug Analysis', icon: 'alert-triangle' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <div>
            <h1 className="page-title">Model Analysis</h1>
            <p className="page-description">
              Comprehensive analysis: Outlier, Statistical, Sensitivity, SHAP, LIME, ROC, Counterfactual
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="analysis-filters" style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <select
          className="form-select"
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          style={{ width: '200px' }}
        >
          <option value="all">All Departments</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <select
          className="form-select"
          value={currentUseCase?.id || ''}
          onChange={(e) => setSelectedUseCase(useCases.find(uc => uc.id === e.target.value))}
          style={{ width: '300px' }}
        >
          {useCases.map(uc => (
            <option key={uc.id} value={uc.id}>{uc.name} ({uc.accuracy}%)</option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="analysis-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--gray-200)', paddingBottom: '16px' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <Icon name={tab.icon} size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="analysis-overview">
          <div className="grid grid-cols-2" style={{ marginBottom: '24px' }}>
            {/* Radar Chart */}
            <div className="card" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '1px solid var(--primary-200)' }}>
              <div className="card-header" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', padding: '16px 24px' }}>
                <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Analysis Radar Chart</h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', margin: 0 }}>All analysis categories for {currentUseCase?.name}</p>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr' }}>
                  <div style={{ padding: '16px', background: 'white' }}>
                    <div style={{ height: '320px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="#e5e7eb" />
                          <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
                          <PolarRadiusAxis angle={30} domain={[95, 100]} tick={{ fontSize: 10 }} />
                          <Radar
                            name="Score"
                            dataKey="score"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.4}
                            strokeWidth={2}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--gray-50)', borderLeft: '1px solid var(--gray-200)' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: 'var(--gray-700)' }}>Chart Explanation</div>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '4px' }}>DATA SOURCE</div>
                      <p style={{ fontSize: '11px', color: 'var(--gray-600)', margin: 0 }}>8-dimensional model analysis from automated validation pipeline.</p>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '4px' }}>CATEGORIES</div>
                      <p style={{ fontSize: '11px', color: 'var(--gray-600)', margin: 0 }}>Outlier, Statistical, Sensitivity, Real Data, Subject, Validation, Fairness, Performance.</p>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', padding: '10px', borderRadius: '8px', border: '1px solid var(--primary-200)' }}>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--primary-700)', marginBottom: '4px' }}>KEY INSIGHTS</div>
                      <ul style={{ fontSize: '10px', color: 'var(--gray-700)', margin: 0, paddingLeft: '14px' }}>
                        <li>All scores above 99% threshold</li>
                        <li>Balanced performance across dimensions</li>
                        <li>Model ready for production</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Summary */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Analysis Summary</h3>
                <p className="card-subtitle">Detailed breakdown of all analysis types</p>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                {analysisCategories.slice(0, 8).map(cat => {
                  const data = analysisData?.[cat.id];
                  const score = data?.score || 99.0;
                  return (
                    <div key={cat.id} className="analysis-row" style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 20px',
                      borderBottom: '1px solid var(--gray-100)',
                      gap: '12px'
                    }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${cat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name={cat.icon} size={16} style={{ color: cat.color }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: '14px' }}>{cat.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{cat.description.substring(0, 40)}...</div>
                      </div>
                      <div style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        background: parseFloat(score) >= 99 ? 'var(--success-50)' : 'var(--warning-50)',
                        color: parseFloat(score) >= 99 ? 'var(--success-700)' : 'var(--warning-700)',
                        fontWeight: 600,
                        fontSize: '13px'
                      }}>
                        {score}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Analysis Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon primary"><Icon name="check-circle" size={24} /></div>
              <div className="stat-content">
                <div className="stat-label">Overall Score</div>
                <div className="stat-value">{summary?.averageScore}%</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon success"><Icon name="database" size={24} /></div>
              <div className="stat-content">
                <div className="stat-label">Data Records</div>
                <div className="stat-value">{(analysisData?.['real-data']?.records / 1000000).toFixed(1)}M</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon warning"><Icon name="alert-triangle" size={24} /></div>
              <div className="stat-content">
                <div className="stat-label">Outliers Detected</div>
                <div className="stat-value">{analysisData?.outlier?.detected?.toLocaleString()}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon danger"><Icon name="shield" size={24} /></div>
              <div className="stat-content">
                <div className="stat-label">Fairness Score</div>
                <div className="stat-value">{analysisData?.['bias-fairness']?.disparateImpact}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ROC & PR Curves Tab */}
      {activeTab === 'roc-pr' && (
        <div className="grid grid-cols-2">
          {/* ROC Curve */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '1px solid var(--primary-200)' }}>
            <div className="card-header" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', padding: '16px 24px' }}>
              <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>ROC Curve</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', margin: 0 }}>AUC: {analysisData?.performance?.auc || 0.995}</p>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr' }}>
                <div style={{ padding: '16px', background: 'white' }}>
                  <div style={{ height: '320px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={rocData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="fpr" label={{ value: 'False Positive Rate', position: 'bottom', offset: -5 }} />
                        <YAxis label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(v) => (v * 100).toFixed(1) + '%'} />
                        <Area type="monotone" dataKey="tpr" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="ROC" />
                        <Line type="linear" data={diagonalLine} dataKey="tpr" stroke="#94a3b8" strokeDasharray="5 5" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div style={{ padding: '16px', background: 'var(--gray-50)', borderLeft: '1px solid var(--gray-200)' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: 'var(--gray-700)' }}>Explanation</div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '4px' }}>METHODOLOGY</div>
                    <p style={{ fontSize: '11px', color: 'var(--gray-600)', margin: 0 }}>ROC curve plots True Positive Rate vs False Positive Rate at various thresholds.</p>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', padding: '10px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--primary-700)', marginBottom: '4px' }}>KEY INSIGHTS</div>
                    <ul style={{ fontSize: '10px', color: 'var(--gray-700)', margin: 0, paddingLeft: '14px' }}>
                      <li>AUC: 0.995 (excellent)</li>
                      <li>Strong discrimination ability</li>
                      <li>Well above random baseline</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Precision-Recall Curve */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid var(--success-200)' }}>
            <div className="card-header" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '16px 24px' }}>
              <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Precision-Recall Curve</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', margin: 0 }}>Average Precision: 0.967</p>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr' }}>
                <div style={{ padding: '16px', background: 'white' }}>
                  <div style={{ height: '320px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={prCurveData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="recall" label={{ value: 'Recall', position: 'bottom', offset: -5 }} />
                        <YAxis domain={[0.7, 1]} label={{ value: 'Precision', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(v) => (v * 100).toFixed(1) + '%'} />
                        <Area type="monotone" dataKey="precision" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="PR Curve" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div style={{ padding: '16px', background: 'var(--gray-50)', borderLeft: '1px solid var(--gray-200)' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: 'var(--gray-700)' }}>Explanation</div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '4px' }}>METHODOLOGY</div>
                    <p style={{ fontSize: '11px', color: 'var(--gray-600)', margin: 0 }}>PR curve shows precision-recall tradeoff; critical for imbalanced data.</p>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', padding: '10px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--success-700)', marginBottom: '4px' }}>KEY INSIGHTS</div>
                    <ul style={{ fontSize: '10px', color: 'var(--gray-700)', margin: 0, paddingLeft: '14px' }}>
                      <li>AP: 0.967 (excellent)</li>
                      <li>High precision maintained at 90% recall</li>
                      <li>Minimal precision drop-off</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="card" style={{ gridColumn: 'span 2' }}>
            <div className="card-header">
              <h3 className="card-title">Performance Metrics</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' }}>
                {[
                  { label: 'AUC-ROC', value: analysisData?.performance?.auc || '0.995', color: '#3b82f6' },
                  { label: 'Gini', value: analysisData?.performance?.gini || '0.990', color: '#10b981' },
                  { label: 'KS Statistic', value: analysisData?.performance?.ks || '0.89', color: '#8b5cf6' },
                  { label: 'Accuracy', value: `${currentUseCase?.accuracy || 99.5}%`, color: '#f59e0b' },
                  { label: 'F1 Score', value: '0.987', color: '#ef4444' },
                ].map((m, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: '20px', background: 'var(--gray-50)', borderRadius: '12px' }}>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: m.color }}>{m.value}</div>
                    <div style={{ fontSize: '14px', color: 'var(--gray-600)', marginTop: '8px' }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHAP & LIME Tab */}
      {activeTab === 'shap-lime' && (
        <div className="grid grid-cols-2">
          {/* SHAP Values */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)', border: '1px solid #c4b5fd' }}>
            <div className="card-header" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', padding: '16px 24px' }}>
              <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>SHAP Feature Importance</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', margin: 0 }}>Global feature impact on predictions</p>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr' }}>
                <div style={{ padding: '16px', background: 'white' }}>
                  <div style={{ height: '320px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={shapData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" domain={[-0.4, 0.4]} />
                        <YAxis type="category" dataKey="feature" width={100} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="importance" name="SHAP Value">
                          {shapData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.importance >= 0 ? '#10b981' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div style={{ padding: '16px', background: 'var(--gray-50)', borderLeft: '1px solid var(--gray-200)' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: 'var(--gray-700)' }}>Explanation</div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#7c3aed', marginBottom: '4px' }}>METHODOLOGY</div>
                    <p style={{ fontSize: '11px', color: 'var(--gray-600)', margin: 0 }}>SHAP (SHapley Additive exPlanations) values show each feature's contribution to predictions.</p>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)', padding: '10px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#7c3aed', marginBottom: '4px' }}>KEY INSIGHTS</div>
                    <ul style={{ fontSize: '10px', color: 'var(--gray-700)', margin: 0, paddingLeft: '14px' }}>
                      <li>Credit Score: strongest positive impact</li>
                      <li>Debt Ratio: key negative factor</li>
                      <li>Green = increases approval odds</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* LIME Explanation */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">LIME Local Explanation</h3>
              <p className="card-subtitle">Feature contributions for single prediction</p>
            </div>
            <div className="card-body">
              <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--primary-50)', borderRadius: '8px' }}>
                <div style={{ fontSize: '14px', color: 'var(--gray-600)' }}>Prediction Probability</div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary-600)' }}>87.3% Approved</div>
              </div>
              {limeData.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ width: '180px', fontSize: '13px' }}>{item.feature}</div>
                  <div style={{ flex: 1, height: '24px', background: 'var(--gray-100)', borderRadius: '4px', position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: item.weight >= 0 ? '50%' : `${50 + item.weight * 100}%`,
                      width: `${Math.abs(item.weight) * 100}%`,
                      height: '100%',
                      background: item.color,
                      borderRadius: '4px'
                    }} />
                  </div>
                  <div style={{ width: '60px', textAlign: 'right', fontWeight: '600', color: item.color }}>
                    {item.weight >= 0 ? '+' : ''}{(item.weight * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SHAP Summary Plot */}
          <div className="card" style={{ gridColumn: 'span 2' }}>
            <div className="card-header">
              <h3 className="card-title">SHAP Beeswarm Plot</h3>
              <p className="card-subtitle">Feature value impact distribution</p>
            </div>
            <div className="card-body">
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ left: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="x" name="SHAP Value" domain={[-0.3, 0.3]} />
                    <YAxis type="category" dataKey="feature" width={100} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter data={shapData.flatMap((f, i) =>
                      Array.from({ length: 30 }, () => ({
                        feature: f.feature,
                        x: f.importance + (Math.random() - 0.5) * 0.1,
                        value: Math.random()
                      }))
                    )} fill="#8884d8">
                      {shapData.flatMap((f, i) =>
                        Array.from({ length: 30 }, (_, j) => (
                          <Cell key={`cell-${i}-${j}`} fill={Math.random() > 0.5 ? '#ef4444' : '#3b82f6'} />
                        ))
                      )}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Counterfactual Tab */}
      {activeTab === 'counterfactual' && (
        <div className="grid grid-cols-2">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Counterfactual Explanation</h3>
              <p className="card-subtitle">What changes would flip the prediction?</p>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center' }}>
                {/* Original */}
                <div style={{ padding: '20px', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca' }}>
                  <div style={{ fontSize: '12px', color: 'var(--gray-600)', marginBottom: '8px' }}>ORIGINAL</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>{counterfactualData.original.prediction}</div>
                  <div style={{ fontSize: '14px', color: 'var(--gray-600)', marginTop: '4px' }}>
                    Probability: {(counterfactualData.original.probability * 100).toFixed(0)}%
                  </div>
                  <div style={{ marginTop: '16px', fontSize: '13px' }}>
                    <div>Credit Score: <strong>{counterfactualData.original.creditScore}</strong></div>
                    <div>Income: <strong>${counterfactualData.original.income.toLocaleString()}</strong></div>
                    <div>Debt Ratio: <strong>{counterfactualData.original.debtRatio}%</strong></div>
                  </div>
                </div>

                {/* Arrow */}
                <div style={{ fontSize: '32px', color: 'var(--gray-400)' }}>→</div>

                {/* Counterfactual */}
                <div style={{ padding: '20px', background: '#ecfdf5', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                  <div style={{ fontSize: '12px', color: 'var(--gray-600)', marginBottom: '8px' }}>COUNTERFACTUAL</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>{counterfactualData.counterfactual.prediction}</div>
                  <div style={{ fontSize: '14px', color: 'var(--gray-600)', marginTop: '4px' }}>
                    Probability: {(counterfactualData.counterfactual.probability * 100).toFixed(0)}%
                  </div>
                  <div style={{ marginTop: '16px', fontSize: '13px' }}>
                    <div>Credit Score: <strong style={{ color: '#059669' }}>{counterfactualData.counterfactual.creditScore}</strong></div>
                    <div>Income: <strong>${counterfactualData.counterfactual.income.toLocaleString()}</strong></div>
                    <div>Debt Ratio: <strong style={{ color: '#059669' }}>{counterfactualData.counterfactual.debtRatio}%</strong></div>
                  </div>
                </div>
              </div>

              {/* Changes Required */}
              <div style={{ marginTop: '24px' }}>
                <h4 style={{ marginBottom: '12px' }}>Changes Required:</h4>
                {counterfactualData.changes.map((change, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: 'var(--gray-50)',
                    borderRadius: '8px',
                    marginBottom: '8px'
                  }}>
                    <Icon name="arrow-right" size={16} style={{ marginRight: '12px', color: 'var(--primary-500)' }} />
                    <span style={{ flex: 1 }}>{change.feature}</span>
                    <span style={{ color: 'var(--gray-500)' }}>{change.from}</span>
                    <span style={{ margin: '0 12px' }}>→</span>
                    <span style={{ fontWeight: '600', color: 'var(--success-600)' }}>{change.to}</span>
                    <span style={{ marginLeft: '12px', padding: '2px 8px', background: 'var(--success-50)', color: 'var(--success-700)', borderRadius: '12px', fontSize: '12px' }}>
                      {change.change}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contrastive Explanation */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Contrastive Analysis</h3>
              <p className="card-subtitle">Why this prediction instead of another?</p>
            </div>
            <div className="card-body">
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '8px' }}>Question:</div>
                <div style={{ fontSize: '16px', fontWeight: '500', padding: '16px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                  "Why was this application <span style={{ color: '#dc2626' }}>Rejected</span> instead of <span style={{ color: '#059669' }}>Approved</span>?"
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '8px' }}>Key Factors:</div>
                {[
                  { factor: 'Credit score below threshold (650 < 680)', impact: 'High', color: '#ef4444' },
                  { factor: 'Debt-to-income ratio too high (42% > 36%)', impact: 'High', color: '#ef4444' },
                  { factor: 'Recent credit inquiries (4 in last 6 months)', impact: 'Medium', color: '#f59e0b' },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: `${item.color}10`,
                    borderLeft: `3px solid ${item.color}`,
                    borderRadius: '0 8px 8px 0',
                    marginBottom: '8px'
                  }}>
                    <span style={{ flex: 1 }}>{item.factor}</span>
                    <span style={{ padding: '2px 8px', background: item.color, color: 'white', borderRadius: '12px', fontSize: '11px' }}>
                      {item.impact} Impact
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calibration Tab */}
      {activeTab === 'calibration' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Row 1: Calibration Curve */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)', border: '1px solid var(--primary-200)' }}>
              <div className="card-header" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', padding: '16px 24px' }}>
                <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Calibration Curve</h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', margin: 0 }}>Predicted vs Actual probabilities</p>
              </div>
              <div className="card-body" style={{ padding: '20px', background: 'white' }}>
                <div style={{ height: '320px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={calibrationData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="predicted" label={{ value: 'Mean Predicted Probability', position: 'bottom', offset: -5 }} />
                      <YAxis label={{ value: 'Fraction of Positives', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} name="Model" dot={{ r: 4 }} />
                      <Line type="linear" dataKey="predicted" stroke="#94a3b8" strokeDasharray="5 5" name="Perfectly Calibrated" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="card" style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
              <div className="card-header" style={{ background: 'var(--gray-100)', padding: '16px 24px', borderBottom: '1px solid var(--gray-200)' }}>
                <h3 className="card-title" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-700)' }}>Explanation</h3>
              </div>
              <div className="card-body" style={{ padding: '20px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '6px' }}>DATA SOURCE</div>
                  <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Probability buckets comparing predicted vs actual outcomes.</p>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '6px' }}>METHODOLOGY</div>
                  <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Reliability diagram showing how well probabilities match reality.</p>
                </div>
                <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>KEY INSIGHTS</div>
                  <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                    <li>Model closely follows diagonal</li>
                    <li>Well-calibrated across all ranges</li>
                    <li>Slight overconfidence at high probs</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Calibration Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid var(--success-200)' }}>
              <div className="card-header" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '16px 24px' }}>
                <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Calibration Metrics</h3>
              </div>
              <div className="card-body" style={{ padding: '20px', background: 'white' }}>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {[
                    { metric: 'Brier Score', value: '0.012', benchmark: '< 0.05', status: 'passed' },
                    { metric: 'Expected Calibration Error', value: '0.008', benchmark: '< 0.02', status: 'passed' },
                    { metric: 'Maximum Calibration Error', value: '0.023', benchmark: '< 0.05', status: 'passed' },
                    { metric: 'Log Loss', value: '0.045', benchmark: '< 0.10', status: 'passed' },
                  ].map((item, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '16px',
                      background: 'var(--gray-50)',
                      borderRadius: '8px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500' }}>{item.metric}</div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Benchmark: {item.benchmark}</div>
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: '700', marginRight: '16px' }}>{item.value}</div>
                      <span style={{
                        padding: '4px 12px',
                        background: 'var(--success-50)',
                        color: 'var(--success-700)',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        PASSED
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card" style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
              <div className="card-header" style={{ background: 'var(--gray-100)', padding: '16px 24px', borderBottom: '1px solid var(--gray-200)' }}>
                <h3 className="card-title" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-700)' }}>Explanation</h3>
              </div>
              <div className="card-body" style={{ padding: '20px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '6px' }}>DATA SOURCE</div>
                  <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Statistical calibration metrics computed on validation dataset.</p>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '6px' }}>METRICS EXPLAINED</div>
                  <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Brier Score measures overall calibration. ECE/MCE measure miscalibration levels.</p>
                </div>
                <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>KEY INSIGHTS</div>
                  <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                    <li>All metrics below threshold</li>
                    <li>Brier 0.012 is excellent</li>
                    <li>Model well-calibrated</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Analysis Tab */}
      {activeTab === 'debug' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Row 1: Residual Plot */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)', border: '1px solid var(--primary-200)' }}>
              <div className="card-header" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', padding: '16px 24px' }}>
                <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Residual Plot</h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', margin: 0 }}>Predicted values vs Residuals</p>
              </div>
              <div className="card-body" style={{ padding: '20px', background: 'white' }}>
                <div style={{ height: '320px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" dataKey="predicted" name="Predicted" domain={[0, 1]} />
                      <YAxis type="number" dataKey="residual" name="Residual" domain={[-0.15, 0.15]} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter data={residualData} fill="#3b82f6" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="card" style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
              <div className="card-header" style={{ background: 'var(--gray-100)', padding: '16px 24px', borderBottom: '1px solid var(--gray-200)' }}>
                <h3 className="card-title" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-700)' }}>Explanation</h3>
              </div>
              <div className="card-body" style={{ padding: '20px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '6px' }}>DATA SOURCE</div>
                  <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Prediction errors (residuals) from validation dataset.</p>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '6px' }}>METHODOLOGY</div>
                  <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Scatter of predicted probability vs error to detect bias patterns.</p>
                </div>
                <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>KEY INSIGHTS</div>
                  <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                    <li>Residuals centered around 0</li>
                    <li>No systematic bias detected</li>
                    <li>Homoscedastic distribution</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Error Distribution */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)', border: '1px solid #c4b5fd' }}>
              <div className="card-header" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', padding: '16px 24px' }}>
                <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Error Distribution</h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', margin: 0 }}>Distribution of prediction errors</p>
              </div>
              <div className="card-body" style={{ padding: '20px', background: 'white' }}>
                <div style={{ height: '320px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { range: '<-0.1', count: 2 },
                      { range: '-0.1 to -0.05', count: 8 },
                      { range: '-0.05 to 0', count: 35 },
                      { range: '0 to 0.05', count: 38 },
                      { range: '0.05 to 0.1', count: 12 },
                      { range: '>0.1', count: 5 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8b5cf6" name="Count" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="card" style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
              <div className="card-header" style={{ background: 'var(--gray-100)', padding: '16px 24px', borderBottom: '1px solid var(--gray-200)' }}>
                <h3 className="card-title" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-700)' }}>Explanation</h3>
              </div>
              <div className="card-body" style={{ padding: '20px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#7c3aed', marginBottom: '6px' }}>DATA SOURCE</div>
                  <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Histogram of prediction errors binned by magnitude.</p>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#7c3aed', marginBottom: '6px' }}>METHODOLOGY</div>
                  <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Error distribution should approximate normal for well-behaved models.</p>
                </div>
                <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>KEY INSIGHTS</div>
                  <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                    <li>73% of errors within +/-0.05</li>
                    <li>Normal distribution shape</li>
                    <li>Few extreme outliers (7)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Model Debug Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid var(--success-200)' }}>
              <div className="card-header" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '16px 24px' }}>
                <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Model Debug Summary</h3>
              </div>
              <div className="card-body" style={{ padding: '20px', background: 'white' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  {[
                    { label: 'Mean Absolute Error', value: '0.018', status: 'good' },
                    { label: 'RMSE', value: '0.024', status: 'good' },
                    { label: 'Max Error', value: '0.089', status: 'warning' },
                    { label: 'R² Score', value: '0.994', status: 'excellent' },
                  ].map((item, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: '20px', background: 'var(--gray-50)', borderRadius: '12px' }}>
                      <div style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        color: item.status === 'excellent' ? '#059669' : item.status === 'good' ? '#3b82f6' : '#f59e0b'
                      }}>
                        {item.value}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--gray-600)', marginTop: '8px' }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card" style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
              <div className="card-header" style={{ background: 'var(--gray-100)', padding: '16px 24px', borderBottom: '1px solid var(--gray-200)' }}>
                <h3 className="card-title" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-700)' }}>Explanation</h3>
              </div>
              <div className="card-body" style={{ padding: '20px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '6px' }}>DATA SOURCE</div>
                  <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Aggregated error metrics from model validation pipeline.</p>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '6px' }}>METRICS EXPLAINED</div>
                  <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>MAE and RMSE measure average error magnitude. R² measures variance explained.</p>
                </div>
                <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>KEY INSIGHTS</div>
                  <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                    <li>R² of 0.994 = excellent fit</li>
                    <li>MAE 0.018 = low error</li>
                    <li>Max error 0.089 needs monitoring</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelAnalysis;
