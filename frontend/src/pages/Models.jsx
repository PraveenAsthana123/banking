import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { departments, getStatusColor, getStatusLabel } from '../data/departments';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';

const Models = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('registry');
  const [selectedModel, setSelectedModel] = useState(null);

  // Get all models from all departments
  const allModels = departments.flatMap((dept) =>
    dept.useCases
      .filter((uc) => uc.models > 0)
      .map((uc) => ({
        ...uc,
        department: dept.name,
        deptId: dept.id,
        deptColor: dept.color,
      }))
  );

  const filteredModels = allModels.filter((model) => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || model.status === statusFilter;
    const matchesDept = deptFilter === 'all' || model.deptId === deptFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

  // Stats
  const totalModels = allModels.reduce((acc, m) => acc + m.models, 0);
  const activeModels = allModels.filter((m) => m.status === 'active').reduce((acc, m) => acc + m.models, 0);
  const avgAccuracy =
    allModels.filter((m) => m.accuracy > 0).reduce((acc, m) => acc + m.accuracy, 0) /
    allModels.filter((m) => m.accuracy > 0).length;

  // Models by department chart
  const modelsByDept = departments.map((d) => ({
    name: d.name.split(' ')[0],
    models: d.useCases.reduce((acc, uc) => acc + uc.models, 0),
    color: d.color,
  }));

  // Model performance over time
  const performanceData = [
    { month: 'Aug', accuracy: 91.2, precision: 88.5, recall: 89.1, f1: 88.8 },
    { month: 'Sep', accuracy: 92.1, precision: 89.2, recall: 90.3, f1: 89.7 },
    { month: 'Oct', accuracy: 93.5, precision: 90.8, recall: 91.2, f1: 91.0 },
    { month: 'Nov', accuracy: 94.2, precision: 91.5, recall: 92.1, f1: 91.8 },
    { month: 'Dec', accuracy: 95.1, precision: 92.3, recall: 93.0, f1: 92.6 },
    { month: 'Jan', accuracy: 95.8, precision: 93.1, recall: 93.8, f1: 93.4 },
  ];

  // Model type distribution
  const modelTypes = [
    { name: 'XGBoost', value: 35, color: '#3b82f6' },
    { name: 'LightGBM', value: 25, color: '#10b981' },
    { name: 'Neural Net', value: 20, color: '#8b5cf6' },
    { name: 'Ensemble', value: 15, color: '#f59e0b' },
    { name: 'Other', value: 5, color: '#6b7280' },
  ];

  // Model health scores
  const healthData = [
    { metric: 'Accuracy', score: 95 },
    { metric: 'Latency', score: 88 },
    { metric: 'Stability', score: 92 },
    { metric: 'Fairness', score: 87 },
    { metric: 'Drift', score: 94 },
    { metric: 'Coverage', score: 91 },
  ];

  // Drift monitoring data
  const driftData = [
    { day: 'Mon', psi: 0.02, ks: 0.03, feature_drift: 1 },
    { day: 'Tue', psi: 0.03, ks: 0.04, feature_drift: 2 },
    { day: 'Wed', psi: 0.02, ks: 0.03, feature_drift: 1 },
    { day: 'Thu', psi: 0.05, ks: 0.06, feature_drift: 3 },
    { day: 'Fri', psi: 0.04, ks: 0.05, feature_drift: 2 },
    { day: 'Sat', psi: 0.03, ks: 0.04, feature_drift: 1 },
    { day: 'Sun', psi: 0.02, ks: 0.03, feature_drift: 0 },
  ];

  // Detailed model registry data
  const modelRegistry = [
    { id: 'MDL-001', name: 'Fraud Detection v3.2', type: 'XGBoost Ensemble', dept: 'Fraud', status: 'production', accuracy: 95.8, latency: 12, version: '3.2.1', lastTrained: '2025-01-15', predictions: '1.2M/day', owner: 'ML Team', fairness: 0.94 },
    { id: 'MDL-002', name: 'Credit Risk Scorer', type: 'LightGBM', dept: 'Credit', status: 'production', accuracy: 93.2, latency: 8, version: '2.1.0', lastTrained: '2025-01-10', predictions: '450K/day', owner: 'Risk Team', fairness: 0.91 },
    { id: 'MDL-003', name: 'Churn Predictor', type: 'Neural Network', dept: 'Customer', status: 'production', accuracy: 89.5, latency: 25, version: '1.5.3', lastTrained: '2025-01-08', predictions: '200K/day', owner: 'CX Team', fairness: 0.88 },
    { id: 'MDL-004', name: 'AML Detector', type: 'Ensemble', dept: 'Compliance', status: 'staging', accuracy: 94.1, latency: 45, version: '4.0.0-beta', lastTrained: '2025-01-20', predictions: '0 (staging)', owner: 'Compliance', fairness: 0.92 },
    { id: 'MDL-005', name: 'Loan Default Predictor', type: 'XGBoost', dept: 'Credit', status: 'production', accuracy: 91.7, latency: 15, version: '2.3.0', lastTrained: '2025-01-12', predictions: '180K/day', owner: 'Risk Team', fairness: 0.89 },
    { id: 'MDL-006', name: 'Transaction Anomaly', type: 'Isolation Forest', dept: 'Fraud', status: 'production', accuracy: 88.3, latency: 5, version: '1.2.0', lastTrained: '2025-01-05', predictions: '2.5M/day', owner: 'ML Team', fairness: 0.96 },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/" className="btn btn-icon btn-secondary">
              <Icon name="arrow-left" size={18} />
            </Link>
            <div>
              <h1 className="page-title">Model Registry & Monitoring</h1>
              <p className="page-description">
                Comprehensive ML model lifecycle management with explainability
              </p>
            </div>
          </div>
          <div className="page-actions">
            <button className="btn btn-secondary">
              <Icon name="upload" size={16} />
              Import Model
            </button>
            <button className="btn btn-primary">
              <Icon name="plus" size={16} />
              Register Model
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <Icon name="cpu" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Models</div>
            <div className="stat-value">{totalModels}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">
            <Icon name="check" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">In Production</div>
            <div className="stat-value">{activeModels}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning">
            <Icon name="zap" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Avg. Accuracy</div>
            <div className="stat-value">{avgAccuracy.toFixed(1)}%</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon danger">
            <Icon name="target" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Predictions/Day</div>
            <div className="stat-value">4.5M</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: '24px' }}>
        <button className={`tab ${activeTab === 'registry' ? 'active' : ''}`} onClick={() => setActiveTab('registry')}>
          Model Registry
        </button>
        <button className={`tab ${activeTab === 'performance' ? 'active' : ''}`} onClick={() => setActiveTab('performance')}>
          Performance Monitoring
        </button>
        <button className={`tab ${activeTab === 'drift' ? 'active' : ''}`} onClick={() => setActiveTab('drift')}>
          Drift Detection
        </button>
        <button className={`tab ${activeTab === 'comparison' ? 'active' : ''}`} onClick={() => setActiveTab('comparison')}>
          Model Comparison
        </button>
        <button className={`tab ${activeTab === 'explainability' ? 'active' : ''}`} onClick={() => setActiveTab('explainability')} style={{ background: activeTab === 'explainability' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : undefined, color: activeTab === 'explainability' ? 'white' : undefined }}>
          🔍 Explainability
        </button>
        <button className={`tab ${activeTab === 'governance' ? 'active' : ''}`} onClick={() => setActiveTab('governance')}>
          Governance
        </button>
      </div>

      {/* Model Registry Tab */}
      {activeTab === 'registry' && (
        <>
          {/* Filters */}
          <div className="analytics-filters" style={{ marginBottom: '24px' }}>
            <div className="search-box" style={{ flex: 1 }}>
              <span className="search-icon">
                <Icon name="search" size={18} />
              </span>
              <input
                type="text"
                className="search-input"
                placeholder="Search models..."
                style={{ width: '100%' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Department:</label>
              <select
                className="form-select"
                style={{ width: 'auto', height: '40px' }}
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Status:</label>
              <select
                className="form-select"
                style={{ width: 'auto', height: '40px' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Production</option>
                <option value="training">Staging</option>
                <option value="pending">Development</option>
              </select>
            </div>
          </div>

          {/* Model Registry Table with Explanation */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '1px solid var(--primary-200)' }}>
            <div className="card-header" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', borderBottom: 'none', padding: '20px 24px' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white', fontSize: '18px', fontWeight: '700' }}>
                <span style={{ fontSize: '24px' }}>📋</span> Model Registry
              </h3>
              <span className="status-badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}><span className="status-dot" style={{ background: '#4ade80' }} />Live</span>
            </div>
            <div className="card-body" style={{ padding: '0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', minHeight: '400px' }}>
                {/* Left: Table */}
                <div style={{ borderRight: '1px solid var(--gray-200)', overflow: 'auto', background: 'white' }}>
                  <table className="data-table" style={{ fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)' }}>
                        <th style={{ padding: '14px 12px', fontWeight: '700', color: 'var(--gray-700)', borderBottom: '2px solid var(--primary-300)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Model ID</th>
                        <th style={{ padding: '14px 12px', fontWeight: '700', color: 'var(--gray-700)', borderBottom: '2px solid var(--primary-300)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</th>
                        <th style={{ padding: '14px 12px', fontWeight: '700', color: 'var(--gray-700)', borderBottom: '2px solid var(--primary-300)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</th>
                        <th style={{ padding: '14px 12px', fontWeight: '700', color: 'var(--gray-700)', borderBottom: '2px solid var(--primary-300)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dept</th>
                        <th style={{ padding: '14px 12px', fontWeight: '700', color: 'var(--gray-700)', borderBottom: '2px solid var(--primary-300)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Accuracy</th>
                        <th style={{ padding: '14px 12px', fontWeight: '700', color: 'var(--gray-700)', borderBottom: '2px solid var(--primary-300)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Latency</th>
                        <th style={{ padding: '14px 12px', fontWeight: '700', color: 'var(--gray-700)', borderBottom: '2px solid var(--primary-300)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                        <th style={{ padding: '14px 12px', fontWeight: '700', color: 'var(--gray-700)', borderBottom: '2px solid var(--primary-300)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fairness</th>
                        <th style={{ padding: '14px 12px', fontWeight: '700', color: 'var(--gray-700)', borderBottom: '2px solid var(--primary-300)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modelRegistry.map((model, index) => (
                        <tr key={model.id} onClick={() => setSelectedModel(model)} style={{ cursor: 'pointer', background: selectedModel?.id === model.id ? 'var(--primary-50)' : index % 2 === 0 ? 'white' : '#fafbfc', transition: 'background 0.2s' }}>
                          <td style={{ padding: '12px' }}><code style={{ fontSize: '11px', background: 'var(--primary-50)', padding: '2px 6px', borderRadius: '4px', color: 'var(--primary-700)' }}>{model.id}</code></td>
                          <td style={{ fontWeight: '600', padding: '12px', color: 'var(--gray-800)' }}>{model.name}</td>
                          <td style={{ fontSize: '12px', padding: '12px', color: 'var(--gray-600)' }}>{model.type}</td>
                          <td style={{ padding: '12px' }}><span style={{ padding: '4px 10px', background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', borderRadius: '6px', fontSize: '11px', fontWeight: '600', color: 'var(--primary-700)' }}>{model.dept}</span></td>
                          <td style={{ padding: '12px' }}><span style={{ color: model.accuracy >= 93 ? 'var(--success-600)' : 'var(--warning-600)', fontWeight: '700', fontSize: '14px' }}>{model.accuracy}%</span></td>
                          <td style={{ padding: '12px', fontWeight: '500' }}>{model.latency}ms</td>
                          <td style={{ padding: '12px' }}>
                            <span className={`status-badge ${model.status === 'production' ? 'success' : 'warning'}`} style={{ fontWeight: '600' }}>
                              <span className="status-dot" />
                              {model.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ color: model.fairness >= 0.9 ? 'var(--success-600)' : 'var(--warning-600)', fontWeight: '700' }}>
                              {model.fairness.toFixed(2)}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button className="btn btn-sm" style={{ background: 'var(--primary-50)', color: 'var(--primary-600)', border: '1px solid var(--primary-200)' }} title="View Details"><Icon name="eye" size={14} /></button>
                              <button className="btn btn-sm" style={{ background: 'var(--success-50)', color: 'var(--success-600)', border: '1px solid var(--success-200)' }} title="Retrain"><Icon name="refresh" size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Right: Explanation */}
                <div style={{ padding: '24px', background: 'var(--gray-50)' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--gray-700)' }}>Registry Explanation</div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '4px' }}>📁 DATA SOURCE</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>MLflow Model Registry synced with production Kubernetes deployments. Updated every 5 minutes.</p>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '4px' }}>📊 COLUMNS EXPLAINED</div>
                    <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                      <li><strong>Accuracy:</strong> Test set performance (holdout)</li>
                      <li><strong>Latency:</strong> P95 inference time in milliseconds</li>
                      <li><strong>Fairness:</strong> Demographic parity score (0-1)</li>
                    </ul>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--warning-600)', marginBottom: '4px' }}>⚠️ STATUS DEFINITIONS</div>
                    <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                      <li><strong>Production:</strong> Live serving traffic</li>
                      <li><strong>Staging:</strong> A/B testing or shadow mode</li>
                      <li><strong>Development:</strong> Training/validation phase</li>
                    </ul>
                  </div>

                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>💡 KEY TAKEAWAYS</div>
                    <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                      <li>6 models currently registered</li>
                      <li>5 in production, 1 in staging</li>
                      <li>Avg accuracy: 92.1% across all models</li>
                      <li>Fraud Detection has highest volume (1.2M/day)</li>
                    </ul>
                  </div>

                  {selectedModel && (
                    <div style={{ marginTop: '16px', padding: '12px', background: 'var(--primary-50)', borderRadius: '8px', border: '1px solid var(--primary-200)' }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-700)', marginBottom: '8px' }}>📌 SELECTED: {selectedModel.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--primary-600)' }}>
                        <div>Version: {selectedModel.version}</div>
                        <div>Last Trained: {selectedModel.lastTrained}</div>
                        <div>Owner: {selectedModel.owner}</div>
                        <div>Predictions: {selectedModel.predictions}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
            {/* Row 1: Models by Department */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
              <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid var(--primary-200)' }}>
                <div className="card-header" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', padding: '16px 24px' }}>
                  <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Models by Department</h3>
                </div>
                <div className="card-body" style={{ padding: '20px', background: 'white' }}>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={modelsByDept}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" fontSize={11} />
                      <YAxis stroke="#6b7280" fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="models" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="card" style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
                <div className="card-header" style={{ background: 'var(--gray-100)', padding: '16px 24px', borderBottom: '1px solid var(--gray-200)' }}>
                  <h3 className="card-title" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-700)' }}>Explanation</h3>
                </div>
                <div className="card-body" style={{ padding: '20px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '6px' }}>DATA SOURCE</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>MLflow Model Registry aggregated by department ownership.</p>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '6px' }}>METHODOLOGY</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Count of production models grouped by owning business department.</p>
                  </div>
                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>KEY INSIGHTS</div>
                    <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                      <li>Fraud & Risk have most models (regulatory)</li>
                      <li>Credit Analysis growing rapidly</li>
                      <li>Average 5 models per department</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Model Type Distribution */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
              <div className="card" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid var(--success-200)' }}>
                <div className="card-header" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '16px 24px' }}>
                  <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Model Type Distribution</h3>
                </div>
                <div className="card-body" style={{ padding: '20px', background: 'white' }}>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={modelTypes} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}%`} labelLine={false} fontSize={11}>
                        {modelTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="card" style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
                <div className="card-header" style={{ background: 'var(--gray-100)', padding: '16px 24px', borderBottom: '1px solid var(--gray-200)' }}>
                  <h3 className="card-title" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-700)' }}>Explanation</h3>
                </div>
                <div className="card-body" style={{ padding: '20px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '6px' }}>DATA SOURCE</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Model metadata from production registry with algorithm classification.</p>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '6px' }}>METHODOLOGY</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Percentage breakdown by model framework/algorithm type.</p>
                  </div>
                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>KEY INSIGHTS</div>
                    <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                      <li>XGBoost: accuracy + interpretability</li>
                      <li>Neural Nets: complex patterns (NLP)</li>
                      <li>Ensemble: critical use cases</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Performance Monitoring Tab */}
      {activeTab === 'performance' && (
        <div className="grid grid-cols-1" style={{ gap: '24px' }}>
          {/* Performance Over Time - Graph + Explanation */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid var(--success-200)' }}>
            <div className="card-header" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', borderBottom: 'none', padding: '20px 24px' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white', fontSize: '18px', fontWeight: '700' }}>
                <span style={{ fontSize: '24px' }}>📈</span> Model Performance Trends
              </h3>
              <span className="status-badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}><span className="status-dot" style={{ background: '#4ade80' }} />Healthy</span>
            </div>
            <div className="card-body" style={{ padding: '0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', minHeight: '350px' }}>
                {/* Left: Chart */}
                <div style={{ padding: '24px', borderRight: '1px solid var(--gray-200)', background: 'white' }}>
                  <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: 'var(--gray-800)' }}>6-Month Performance Trend</div>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} domain={[85, 100]} tickFormatter={(v) => v + '%'} />
                      <Tooltip formatter={(v) => v.toFixed(1) + '%'} />
                      <Legend />
                      <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Accuracy" />
                      <Line type="monotone" dataKey="precision" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Precision" />
                      <Line type="monotone" dataKey="recall" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} name="Recall" />
                      <Line type="monotone" dataKey="f1" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} name="F1 Score" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {/* Right: Explanation */}
                <div style={{ padding: '24px', background: 'var(--gray-50)' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--gray-700)' }}>Explanation</div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '4px' }}>📁 DATA SOURCE</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Weekly model evaluation on holdout test set (10K samples). Ground truth from fraud investigation team.</p>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '4px' }}>📊 METRICS EXPLAINED</div>
                    <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                      <li><strong>Accuracy:</strong> Overall correct predictions</li>
                      <li><strong>Precision:</strong> % of fraud predictions that were correct</li>
                      <li><strong>Recall:</strong> % of actual fraud cases caught</li>
                      <li><strong>F1:</strong> Harmonic mean of precision & recall</li>
                    </ul>
                  </div>

                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>💡 KEY TAKEAWAYS</div>
                    <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                      <li>Steady improvement: +4.6% accuracy in 6 months</li>
                      <li>Recall improving faster than precision (focus on catching fraud)</li>
                      <li>No performance degradation detected</li>
                      <li>Model retraining every 2 weeks maintains accuracy</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Model Health Radar */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🎯</span> Model Health Score
              </h3>
            </div>
            <div className="card-body" style={{ padding: '0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '350px' }}>
                {/* Left: Radar Chart */}
                <div style={{ padding: '24px', borderRight: '1px solid var(--gray-200)' }}>
                  <ResponsiveContainer width="100%" height={280}>
                    <RadarChart data={healthData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" fontSize={11} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={10} />
                      <Radar name="Health Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                {/* Right: Explanation */}
                <div style={{ padding: '24px', background: 'var(--gray-50)' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--gray-700)' }}>Health Dimensions</div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {healthData.map((item) => (
                      <div key={item.metric} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', background: 'white', borderRadius: '6px' }}>
                        <div style={{ width: '80px', fontSize: '12px', fontWeight: '600' }}>{item.metric}</div>
                        <div style={{ flex: 1, height: '8px', background: 'var(--gray-200)', borderRadius: '4px' }}>
                          <div style={{ width: `${item.score}%`, height: '100%', background: item.score >= 90 ? 'var(--success-500)' : item.score >= 80 ? 'var(--warning-500)' : 'var(--danger-500)', borderRadius: '4px' }}></div>
                        </div>
                        <div style={{ width: '40px', fontSize: '12px', fontWeight: '600', color: item.score >= 90 ? 'var(--success-600)' : 'var(--warning-600)' }}>{item.score}%</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '16px', padding: '12px', background: 'var(--warning-50)', borderRadius: '8px', border: '1px solid var(--warning-200)' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--warning-700)' }}>⚠️ ATTENTION NEEDED</div>
                    <p style={{ fontSize: '11px', color: 'var(--warning-600)', margin: '4px 0 0 0' }}>Fairness score (87%) below target (90%). Schedule bias review for next sprint.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drift Detection Tab */}
      {activeTab === 'drift' && (
        <div className="grid grid-cols-1" style={{ gap: '24px' }}>
          {/* Drift Metrics */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: '1px solid var(--warning-200)' }}>
            <div className="card-header" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderBottom: 'none', padding: '20px 24px' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white', fontSize: '18px', fontWeight: '700' }}>
                <span style={{ fontSize: '24px' }}>📉</span> Data & Model Drift Monitoring
              </h3>
              <span className="status-badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}><span className="status-dot" style={{ background: '#fcd34d' }} />Monitor</span>
            </div>
            <div className="card-body" style={{ padding: '0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', minHeight: '400px' }}>
                {/* Left: Chart */}
                <div style={{ padding: '24px', borderRight: '1px solid var(--gray-200)', background: 'white' }}>
                  <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: 'var(--gray-800)' }}>Weekly Drift Indicators</div>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={driftData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="psi" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="PSI Score" />
                      <Area type="monotone" dataKey="ks" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="KS Statistic" />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div style={{ marginTop: '16px', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>
                      <strong>Threshold:</strong> PSI &gt; 0.1 = significant drift | KS &gt; 0.1 = distribution shift
                    </div>
                  </div>
                </div>
                {/* Right: Explanation */}
                <div style={{ padding: '24px', background: 'var(--gray-50)' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--gray-700)' }}>Explanation</div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '4px' }}>📁 DATA SOURCE</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Comparison of production input distribution vs training data baseline. Calculated hourly, aggregated daily.</p>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '4px' }}>📊 METRICS EXPLAINED</div>
                    <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                      <li><strong>PSI (Population Stability Index):</strong> Measures shift in feature distributions</li>
                      <li><strong>KS (Kolmogorov-Smirnov):</strong> Max difference between cumulative distributions</li>
                      <li><strong>Feature Drift:</strong> Count of features with significant change</li>
                    </ul>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--warning-600)', marginBottom: '4px' }}>⚠️ THRESHOLDS</div>
                    <table style={{ width: '100%', fontSize: '11px' }}>
                      <tbody>
                        <tr><td>PSI &lt; 0.1</td><td style={{ color: 'var(--success-600)' }}>No drift</td></tr>
                        <tr><td>PSI 0.1-0.2</td><td style={{ color: 'var(--warning-600)' }}>Moderate drift</td></tr>
                        <tr><td>PSI &gt; 0.2</td><td style={{ color: 'var(--danger-600)' }}>Significant drift - retrain</td></tr>
                      </tbody>
                    </table>
                  </div>

                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>💡 KEY TAKEAWAYS</div>
                    <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                      <li>All drift metrics within acceptable range</li>
                      <li>Thursday spike (PSI=0.05) due to holiday pattern</li>
                      <li>No retraining trigger needed this week</li>
                      <li>Next scheduled retrain: Feb 1, 2025</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature-Level Drift */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Feature-Level Drift Analysis</h3>
            </div>
            <div className="card-body">
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Feature</th>
                      <th>Importance</th>
                      <th>PSI</th>
                      <th>Status</th>
                      <th>Trend</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: 'transaction_amount', importance: '28%', psi: 0.02, status: 'stable', trend: '→' },
                      { feature: 'time_of_day', importance: '22%', psi: 0.03, status: 'stable', trend: '→' },
                      { feature: 'location_distance', importance: '18%', psi: 0.08, status: 'watch', trend: '↑' },
                      { feature: 'merchant_category', importance: '12%', psi: 0.01, status: 'stable', trend: '→' },
                      { feature: 'card_present', importance: '8%', psi: 0.02, status: 'stable', trend: '↓' },
                    ].map((f, i) => (
                      <tr key={i}>
                        <td><code style={{ fontSize: '11px' }}>{f.feature}</code></td>
                        <td>{f.importance}</td>
                        <td style={{ fontWeight: '600', color: f.psi >= 0.05 ? 'var(--warning-600)' : 'var(--success-600)' }}>{f.psi.toFixed(3)}</td>
                        <td>
                          <span className={`status-badge ${f.status === 'stable' ? 'success' : 'warning'}`}>
                            <span className="status-dot" />
                            {f.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '16px' }}>{f.trend}</td>
                        <td>
                          {f.status === 'watch' ? (
                            <button className="btn btn-sm btn-warning">Investigate</button>
                          ) : (
                            <span style={{ color: 'var(--gray-400)', fontSize: '12px' }}>None</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Model Comparison Tab */}
      {activeTab === 'comparison' && (
        <div className="grid grid-cols-1" style={{ gap: '24px' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid var(--primary-200)' }}>
            <div className="card-header" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', borderBottom: 'none', padding: '20px 24px' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white', fontSize: '18px', fontWeight: '700' }}>
                <span style={{ fontSize: '24px' }}>⚖️</span> Model Comparison: A/B Testing Results
              </h3>
            </div>
            <div className="card-body" style={{ padding: '0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '400px' }}>
                {/* Left: Comparison Table */}
                <div style={{ padding: '24px', borderRight: '1px solid var(--gray-200)', background: 'white' }}>
                  <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: 'var(--gray-800)' }}>Champion vs Challenger</div>
                  <table className="data-table" style={{ fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)' }}>
                        <th style={{ padding: '12px', fontWeight: '700', color: 'var(--gray-700)', borderBottom: '2px solid var(--primary-300)', fontSize: '12px', textTransform: 'uppercase' }}>Metric</th>
                        <th style={{ padding: '12px', fontWeight: '700', color: 'var(--gray-700)', borderBottom: '2px solid var(--primary-300)', fontSize: '12px', textTransform: 'uppercase', background: 'var(--gray-100)' }}>Champion (v3.1)</th>
                        <th style={{ padding: '12px', fontWeight: '700', color: 'var(--success-700)', borderBottom: '2px solid var(--success-300)', fontSize: '12px', textTransform: 'uppercase', background: 'var(--success-50)' }}>Challenger (v3.2)</th>
                        <th style={{ padding: '12px', fontWeight: '700', color: 'var(--gray-700)', borderBottom: '2px solid var(--primary-300)', fontSize: '12px', textTransform: 'uppercase' }}>Δ Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { metric: 'Accuracy', champion: '94.2%', challenger: '95.8%', delta: '+1.6%', better: true },
                        { metric: 'Precision', champion: '91.5%', challenger: '93.1%', delta: '+1.6%', better: true },
                        { metric: 'Recall', champion: '92.1%', challenger: '93.8%', delta: '+1.7%', better: true },
                        { metric: 'F1 Score', champion: '91.8%', challenger: '93.4%', delta: '+1.6%', better: true },
                        { metric: 'Latency (P95)', champion: '15ms', challenger: '12ms', delta: '-20%', better: true },
                        { metric: 'False Positives', champion: '3.2%', challenger: '2.1%', delta: '-34%', better: true },
                        { metric: 'Fairness Score', champion: '0.91', challenger: '0.94', delta: '+3%', better: true },
                      ].map((row, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: '600' }}>{row.metric}</td>
                          <td style={{ background: 'var(--gray-50)' }}>{row.champion}</td>
                          <td style={{ background: 'var(--success-50)', fontWeight: '600' }}>{row.challenger}</td>
                          <td style={{ color: row.better ? 'var(--success-600)' : 'var(--danger-600)', fontWeight: '600' }}>
                            {row.better ? '✓' : '✗'} {row.delta}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ marginTop: '16px', padding: '12px', background: 'var(--success-50)', borderRadius: '8px', border: '1px solid var(--success-200)' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--success-700)' }}>✅ Recommendation: Promote Challenger v3.2 to Production</div>
                  </div>
                </div>
                {/* Right: Explanation */}
                <div style={{ padding: '24px', background: 'var(--gray-50)' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--gray-700)' }}>Explanation</div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '4px' }}>📁 DATA SOURCE</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>A/B test over 7 days with 50/50 traffic split. 1.2M predictions per model. Statistical significance: p &lt; 0.001.</p>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '4px' }}>🤖 WHAT CHANGED</div>
                    <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                      <li>Added 12 new features from transaction velocity</li>
                      <li>Upgraded XGBoost 1.7 → 2.0</li>
                      <li>Implemented SMOTE for class balancing</li>
                      <li>Hyperparameter tuning with Optuna</li>
                    </ul>
                  </div>

                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>💡 KEY TAKEAWAYS</div>
                    <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                      <li>Challenger wins on ALL metrics</li>
                      <li>34% reduction in false positives = better UX</li>
                      <li>20% faster inference = lower latency</li>
                      <li>Higher fairness score = better compliance</li>
                    </ul>
                  </div>

                  <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                    <button className="btn btn-success" style={{ flex: 1 }}>Promote to Production</button>
                    <button className="btn btn-secondary">Extend Test</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Explainability Tab */}
      {activeTab === 'explainability' && (
        <div className="grid grid-cols-1" style={{ gap: '24px' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}>
            <div className="card-body" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '12px', color: 'white' }}>🔍 Model Explainability Center</h2>
              <p style={{ opacity: 0.9, marginBottom: '16px' }}>Global and local model interpretability with SHAP, LIME, and feature importance analysis.</p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', fontSize: '13px' }}>🧠 SHAP Values</span>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', fontSize: '13px' }}>🍋 LIME Explanations</span>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', fontSize: '13px' }}>📊 Feature Importance</span>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', fontSize: '13px' }}>⚖️ Fairness Metrics</span>
              </div>
            </div>
          </div>

          {/* Global Feature Importance */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>📊</span> Global Feature Importance (All Models)
              </h3>
            </div>
            <div className="card-body" style={{ padding: '0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '350px' }}>
                <div style={{ padding: '24px', borderRight: '1px solid var(--gray-200)' }}>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={[
                      { feature: 'Transaction Amount', importance: 0.28 },
                      { feature: 'Time of Day', importance: 0.22 },
                      { feature: 'Location Distance', importance: 0.18 },
                      { feature: 'Merchant Category', importance: 0.12 },
                      { feature: 'Card Present', importance: 0.08 },
                      { feature: 'Account Age', importance: 0.07 },
                      { feature: 'Tx Frequency', importance: 0.05 },
                    ]} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" domain={[0, 0.3]} tickFormatter={(v) => (v * 100).toFixed(0) + '%'} />
                      <YAxis dataKey="feature" type="category" width={130} fontSize={11} />
                      <Tooltip formatter={(v) => (v * 100).toFixed(1) + '%'} />
                      <Bar dataKey="importance" fill="#6366f1" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ padding: '24px', background: 'var(--gray-50)' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--gray-700)' }}>Explanation</div>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '4px' }}>📁 DATA SOURCE</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Aggregated SHAP values across all production models weighted by prediction volume.</p>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '4px' }}>🤖 METHOD</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>TreeSHAP for tree models, KernelSHAP for neural networks. Importance = mean(|SHAP|).</p>
                  </div>
                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>💡 INSIGHTS</div>
                    <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                      <li>Top 3 features drive 68% of predictions</li>
                      <li>Transaction amount is universally important</li>
                      <li>Time-based features critical for fraud detection</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Model Cards */}
          <div className="grid grid-cols-3" style={{ gap: '16px' }}>
            {modelRegistry.slice(0, 3).map((model) => (
              <div key={model.id} className="card">
                <div className="card-header">
                  <h4 className="card-title" style={{ fontSize: '14px' }}>{model.name}</h4>
                  <span className="status-badge success" style={{ fontSize: '10px' }}>{model.status}</span>
                </div>
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ padding: '8px', background: 'var(--gray-50)', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--success-600)' }}>{model.accuracy}%</div>
                      <div style={{ fontSize: '10px', color: 'var(--gray-500)' }}>Accuracy</div>
                    </div>
                    <div style={{ padding: '8px', background: 'var(--gray-50)', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary-600)' }}>{model.fairness}</div>
                      <div style={{ fontSize: '10px', color: 'var(--gray-500)' }}>Fairness</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--gray-600)', marginBottom: '12px' }}>
                    <strong>Type:</strong> {model.type}<br/>
                    <strong>Predictions:</strong> {model.predictions}
                  </div>
                  <button className="btn btn-sm btn-primary" style={{ width: '100%' }}>View Explanations</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Governance Tab */}
      {activeTab === 'governance' && (
        <div className="grid grid-cols-1" style={{ gap: '24px' }}>
          <div className="card">
            <div className="card-header" style={{ background: 'var(--gray-100)' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>📜</span> Model Governance & Compliance
              </h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2" style={{ gap: '24px' }}>
                <div>
                  <h4 style={{ marginBottom: '16px' }}>Approval Status</h4>
                  <table className="data-table" style={{ fontSize: '12px' }}>
                    <thead>
                      <tr>
                        <th>Model</th>
                        <th>MRM Review</th>
                        <th>Compliance</th>
                        <th>Ethics</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modelRegistry.map((m) => (
                        <tr key={m.id}>
                          <td style={{ fontWeight: '600' }}>{m.name.split(' ').slice(0, 2).join(' ')}</td>
                          <td><span className="status-badge success"><span className="status-dot" />Approved</span></td>
                          <td><span className="status-badge success"><span className="status-dot" />Passed</span></td>
                          <td><span className={`status-badge ${m.fairness >= 0.9 ? 'success' : 'warning'}`}><span className="status-dot" />{m.fairness >= 0.9 ? 'Passed' : 'Review'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: '24px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                  <h4 style={{ marginBottom: '16px' }}>Governance Explanation</h4>
                  <div style={{ fontSize: '13px', color: 'var(--gray-600)' }}>
                    <p style={{ marginBottom: '12px' }}><strong>MRM Review:</strong> Model Risk Management validates accuracy, stability, and business logic before production deployment.</p>
                    <p style={{ marginBottom: '12px' }}><strong>Compliance:</strong> Regulatory check for SR 11-7, GDPR, and fair lending requirements.</p>
                    <p><strong>Ethics:</strong> Bias and fairness review using demographic parity and equalized odds metrics.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Models;
