import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { departments, getStatusColor, getStatusLabel, aiCategories, getAiCategory, dataCategories, getDataCategory } from '../data/departments';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const Department = () => {
  const { deptId } = useParams();
  const [activeTab, setActiveTab] = useState('use-cases');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [aiTypeFilter, setAiTypeFilter] = useState('all');
  const [dataLayerFilter, setDataLayerFilter] = useState('all');

  const department = departments.find((d) => d.id === deptId);

  if (!department) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon">
            <Icon name="alert-triangle" size={40} />
          </div>
          <h2 className="empty-state-title">Department Not Found</h2>
          <p className="empty-state-description">
            The department you're looking for doesn't exist.
          </p>
          <Link to="/" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const filteredUseCases = department.useCases.filter((uc) => {
    const matchesSearch = uc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || uc.status === statusFilter;
    const matchesAiType = aiTypeFilter === 'all' || uc.aiType === aiTypeFilter;
    const matchesDataLayer = dataLayerFilter === 'all' || uc.dataLayer === dataLayerFilter;
    return matchesSearch && matchesStatus && matchesAiType && matchesDataLayer;
  });

  // Count use cases by AI Type
  const aiTypeCounts = aiCategories.slice(1).reduce((acc, cat) => {
    acc[cat.id] = department.useCases.filter(uc => uc.aiType === cat.id).length;
    return acc;
  }, {});

  // Count use cases by Data Layer
  const dataLayerCounts = dataCategories.slice(1).reduce((acc, cat) => {
    acc[cat.id] = department.useCases.filter(uc => uc.dataLayer === cat.id).length;
    return acc;
  }, {});

  // Calculate total impact metrics
  const totalCostSavings = department.useCases.reduce((acc, uc) => acc + (uc.costSavings || 0), 0);
  const totalRevenue = department.useCases.reduce((acc, uc) => acc + (uc.revenue || 0), 0);
  const totalProductivity = department.useCases.reduce((acc, uc) => acc + (uc.productivity || 0), 0) / department.useCases.filter(uc => uc.productivity > 0).length || 0;

  const activeCount = department.useCases.filter((uc) => uc.status === 'active').length;
  const trainingCount = department.useCases.filter((uc) => uc.status === 'training').length;
  const totalModels = department.useCases.reduce((acc, uc) => acc + uc.models, 0);
  const avgAccuracy =
    department.useCases
      .filter((uc) => uc.accuracy > 0)
      .reduce((acc, uc) => acc + uc.accuracy, 0) /
      department.useCases.filter((uc) => uc.accuracy > 0).length || 0;

  // Performance trend data
  const performanceData = [
    { month: 'Aug', accuracy: avgAccuracy - 4.2 },
    { month: 'Sep', accuracy: avgAccuracy - 3.1 },
    { month: 'Oct', accuracy: avgAccuracy - 2.5 },
    { month: 'Nov', accuracy: avgAccuracy - 1.2 },
    { month: 'Dec', accuracy: avgAccuracy - 0.5 },
    { month: 'Jan', accuracy: avgAccuracy },
  ];

  // Radar data for department capabilities
  const capabilityData = [
    { subject: 'Accuracy', A: avgAccuracy, fullMark: 100 },
    { subject: 'Coverage', A: (activeCount / department.useCases.length) * 100, fullMark: 100 },
    { subject: 'Maturity', A: (totalModels / department.useCases.length) * 25, fullMark: 100 },
    { subject: 'Reliability', A: 85, fullMark: 100 },
    { subject: 'Scalability', A: 78, fullMark: 100 },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/" className="btn btn-icon btn-secondary" style={{ marginRight: '8px' }}>
              <Icon name="arrow-left" size={18} />
            </Link>
            <div className={`dept-icon ${department.id}`} style={{ width: '56px', height: '56px' }}>
              <Icon name={department.icon} size={28} />
            </div>
            <div>
              <h1 className="page-title">{department.name}</h1>
              <p className="page-description">{department.description}</p>
            </div>
          </div>
          <div className="page-actions">
            <button className="btn btn-secondary">
              <Icon name="download" size={16} />
              Export
            </button>
            <button className="btn btn-primary">
              <Icon name="plus" size={16} />
              New Use Case
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <Icon name="target" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Use Cases</div>
            <div className="stat-value">{department.useCases.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <Icon name="check" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Active</div>
            <div className="stat-value">{activeCount}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <Icon name="cpu" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Models</div>
            <div className="stat-value">{totalModels}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon danger">
            <Icon name="zap" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Avg. Accuracy</div>
            <div className="stat-value">{avgAccuracy.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'use-cases' ? 'active' : ''}`}
          onClick={() => setActiveTab('use-cases')}
        >
          Use Cases
        </button>
        <button
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
        <button
          className={`tab ${activeTab === 'models' ? 'active' : ''}`}
          onClick={() => setActiveTab('models')}
        >
          Models
        </button>
        <button
          className={`tab ${activeTab === 'ai-impact' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai-impact')}
        >
          AI Impact
        </button>
      </div>

      {activeTab === 'use-cases' && (
        <>
          {/* AI Type Filter Pills */}
          <div className="ai-type-filters" style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {aiCategories.map((cat) => (
              <button
                key={cat.id}
                className={`ai-type-pill ${aiTypeFilter === cat.id ? 'active' : ''}`}
                onClick={() => setAiTypeFilter(cat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: aiTypeFilter === cat.id ? `2px solid ${cat.color}` : '2px solid var(--gray-200)',
                  background: aiTypeFilter === cat.id ? `${cat.color}15` : 'white',
                  color: aiTypeFilter === cat.id ? cat.color : 'var(--gray-600)',
                  fontWeight: 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Icon name={cat.icon} size={16} />
                <span>{cat.name}</span>
                {cat.id !== 'all' && (
                  <span style={{
                    background: aiTypeFilter === cat.id ? cat.color : 'var(--gray-200)',
                    color: aiTypeFilter === cat.id ? 'white' : 'var(--gray-600)',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '11px',
                  }}>
                    {aiTypeCounts[cat.id] || 0}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Data Layer Filter Pills */}
          <div className="data-layer-filters" style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', marginRight: '8px', fontWeight: 500, color: 'var(--gray-600)' }}>Data Layer:</span>
            {dataCategories.map((cat) => (
              <button
                key={cat.id}
                className={`data-layer-pill ${dataLayerFilter === cat.id ? 'active' : ''}`}
                onClick={() => setDataLayerFilter(cat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '16px',
                  border: dataLayerFilter === cat.id ? `2px solid ${cat.color}` : '1px solid var(--gray-200)',
                  background: dataLayerFilter === cat.id ? `${cat.color}15` : 'white',
                  color: dataLayerFilter === cat.id ? cat.color : 'var(--gray-600)',
                  fontWeight: 500,
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Icon name={cat.icon} size={14} />
                <span>{cat.name}</span>
                {cat.id !== 'all' && (
                  <span style={{
                    background: dataLayerFilter === cat.id ? cat.color : 'var(--gray-200)',
                    color: dataLayerFilter === cat.id ? 'white' : 'var(--gray-600)',
                    padding: '1px 6px',
                    borderRadius: '8px',
                    fontSize: '10px',
                  }}>
                    {dataLayerCounts[cat.id] || 0}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="analytics-filters">
            <div className="search-box" style={{ flex: 1 }}>
              <span className="search-icon">
                <Icon name="search" size={18} />
              </span>
              <input
                type="text"
                className="search-input"
                placeholder="Search use cases..."
                style={{ width: '100%' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
                <option value="active">Active</option>
                <option value="training">Training</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Use Cases Table */}
          <div className="card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Use Case</th>
                    <th>AI Type</th>
                    <th>Data Layer</th>
                    <th>Status</th>
                    <th>Accuracy</th>
                    <th>Cost Savings</th>
                    <th>Revenue</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUseCases.map((useCase) => {
                    const aiCat = getAiCategory(useCase.aiType);
                    const dataCat = getDataCategory(useCase.dataLayer);
                    return (
                    <tr key={useCase.id}>
                      <td>
                        <Link
                          to={`/department/${department.id}/${useCase.id}`}
                          style={{ color: 'var(--primary-600)', fontWeight: 500 }}
                        >
                          {useCase.name}
                        </Link>
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 500,
                            background: `${aiCat.color}15`,
                            color: aiCat.color,
                          }}
                        >
                          <Icon name={aiCat.icon} size={10} />
                          {aiCat.name.replace(' Scenario', '').replace(' AI', '')}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 8px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: 500,
                            background: `${dataCat.color}15`,
                            color: dataCat.color,
                          }}
                        >
                          <Icon name={dataCat.icon} size={10} />
                          {dataCat.name}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusColor(useCase.status)}`}>
                          <span className="status-dot" />
                          {getStatusLabel(useCase.status)}
                        </span>
                      </td>
                      <td>
                        {useCase.accuracy > 0 ? (
                          <span style={{ fontWeight: 500, color: useCase.accuracy >= 90 ? 'var(--success-600)' : 'inherit' }}>
                            {useCase.accuracy.toFixed(1)}%
                          </span>
                        ) : (
                          <span style={{ color: 'var(--gray-400)' }}>N/A</span>
                        )}
                      </td>
                      <td style={{ fontWeight: 500, color: 'var(--success-600)' }}>
                        {useCase.costSavings > 0 ? `$${useCase.costSavings}M` : '-'}
                      </td>
                      <td style={{ fontWeight: 500, color: 'var(--primary-600)' }}>
                        {useCase.revenue > 0 ? `$${useCase.revenue}M` : '-'}
                      </td>
                      <td style={{ color: 'var(--gray-500)' }}>
                        {new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link
                            to={`/department/${department.id}/${useCase.id}`}
                            className="btn btn-icon btn-sm btn-secondary"
                          >
                            <Icon name="eye" size={14} />
                          </Link>
                          <button className="btn btn-icon btn-sm btn-secondary">
                            <Icon name="edit" size={14} />
                          </button>
                          {useCase.status === 'active' && (
                            <button className="btn btn-icon btn-sm btn-secondary">
                              <Icon name="refresh" size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredUseCases.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Icon name="search" size={32} />
                </div>
                <h3 className="empty-state-title">No use cases found</h3>
                <p className="empty-state-description">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Row 1: Performance Trend - Graph card + Explanation card */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '1px solid var(--primary-200)' }}>
              <div className="card-header" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', padding: '16px 24px' }}>
                <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>📈 Performance Trend</h3>
              </div>
              <div className="card-body" style={{ padding: '20px', background: 'white' }}>
                <div style={{ height: '280px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} domain={[70, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="accuracy" stroke={department.color} strokeWidth={2} dot={{ fill: department.color }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="card" style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
              <div className="card-header" style={{ background: 'var(--gray-100)', padding: '16px 24px', borderBottom: '1px solid var(--gray-200)' }}>
                <h3 className="card-title" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-700)' }}>📋 Explanation</h3>
              </div>
              <div className="card-body" style={{ padding: '20px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '6px' }}>📁 DATA SOURCE</div>
                  <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Daily model accuracy metrics aggregated by month for {department.name}.</p>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '6px' }}>📊 METHODOLOGY</div>
                  <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Weighted average of all active model accuracies in production.</p>
                </div>
                <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--warning-600)', marginBottom: '6px' }}>💡 KEY INSIGHTS</div>
                  <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                    <li>Steady improvement: +4.2% over 6 months</li>
                    <li>Current accuracy: {avgAccuracy.toFixed(1)}%</li>
                    <li>Above baseline threshold</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Department Capabilities - Graph card + Explanation card */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)', border: '1px solid #c4b5fd' }}>
              <div className="card-header" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', padding: '16px 24px' }}>
                <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>🎯 Department Capabilities</h3>
              </div>
              <div className="card-body" style={{ padding: '20px', background: 'white' }}>
                <div style={{ height: '280px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={capabilityData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="subject" fontSize={12} />
                      <PolarRadiusAxis domain={[0, 100]} tick={false} />
                      <Radar name="Capability" dataKey="A" stroke={department.color} fill={department.color} fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="card" style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
              <div className="card-header" style={{ background: 'var(--gray-100)', padding: '16px 24px', borderBottom: '1px solid var(--gray-200)' }}>
                <h3 className="card-title" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-700)' }}>📋 Explanation</h3>
              </div>
              <div className="card-body" style={{ padding: '20px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#7c3aed', marginBottom: '6px' }}>📁 DATA SOURCE</div>
                  <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Multi-dimensional KPI assessment across 5 capability dimensions.</p>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#7c3aed', marginBottom: '6px' }}>📊 METRICS</div>
                  <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Accuracy, Coverage, Maturity, Reliability, and Scalability scores (0-100).</p>
                </div>
                <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--warning-600)', marginBottom: '6px' }}>💡 KEY INSIGHTS</div>
                  <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                    <li>Strong in accuracy & reliability</li>
                    <li>Scalability opportunity area</li>
                    <li>Well-balanced capabilities overall</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'models' && (
        <div className="model-grid">
          {department.useCases
            .filter((uc) => uc.models > 0)
            .map((useCase) => (
              <div key={useCase.id} className="model-card">
                <div className="model-card-header">
                  <div className="model-name">{useCase.name}</div>
                  <div className="model-type">{useCase.models} model(s) deployed</div>
                </div>
                <div className="model-metrics">
                  <div className="model-metric">
                    <div className="model-metric-value">
                      {useCase.accuracy > 0 ? useCase.accuracy.toFixed(1) + '%' : 'N/A'}
                    </div>
                    <div className="model-metric-label">Accuracy</div>
                  </div>
                  <div className="model-metric">
                    <div className="model-metric-value">
                      {(Math.random() * 0.1 + 0.85).toFixed(2)}
                    </div>
                    <div className="model-metric-label">F1 Score</div>
                  </div>
                  <div className="model-metric">
                    <div className="model-metric-value">
                      {Math.floor(Math.random() * 50 + 10)}ms
                    </div>
                    <div className="model-metric-label">Latency</div>
                  </div>
                  <div className="model-metric">
                    <div className="model-metric-value">
                      {(Math.random() * 1000 + 100).toFixed(0)}
                    </div>
                    <div className="model-metric-label">Daily Calls</div>
                  </div>
                </div>
                <div className="model-card-footer">
                  <span className={`status-badge ${getStatusColor(useCase.status)}`}>
                    <span className="status-dot" />
                    {getStatusLabel(useCase.status)}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-sm btn-secondary">
                      <Icon name="eye" size={14} />
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {activeTab === 'ai-impact' && (
        <div className="ai-impact-content">
          {/* Impact Summary Cards */}
          <div className="stats-grid" style={{ marginBottom: '24px' }}>
            <div className="stat-card">
              <div className="stat-icon success">
                <Icon name="dollar" size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Total Cost Savings</div>
                <div className="stat-value" style={{ color: 'var(--success-600)' }}>${totalCostSavings.toFixed(1)}M</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon primary">
                <Icon name="trending-up" size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Revenue Impact</div>
                <div className="stat-value" style={{ color: 'var(--primary-600)' }}>${totalRevenue.toFixed(1)}M</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon warning">
                <Icon name="zap" size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Avg Productivity Gain</div>
                <div className="stat-value" style={{ color: 'var(--warning-600)' }}>{totalProductivity.toFixed(0)}%</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon danger">
                <Icon name="target" size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Total ROI</div>
                <div className="stat-value" style={{ color: 'var(--danger-600)' }}>{((totalCostSavings + totalRevenue) * 10).toFixed(0)}%</div>
              </div>
            </div>
          </div>

          {/* Impact Charts - One graph per row, graph card left + explanation card right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Row 1: Impact by Use Case */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
              <div className="card" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid var(--success-200)' }}>
                <div className="card-header" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '16px 24px' }}>
                  <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>💰 Impact by Use Case</h3>
                </div>
                <div className="card-body" style={{ padding: '20px', background: 'white' }}>
                  <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={department.useCases.filter(uc => uc.costSavings > 0 || uc.revenue > 0)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" tickFormatter={(v) => `$${v}M`} />
                        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(v) => `$${v}M`} />
                        <Legend />
                        <Bar dataKey="costSavings" name="Cost Savings" fill="#10b981" />
                        <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="card" style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
                <div className="card-header" style={{ background: 'var(--gray-100)', padding: '16px 24px', borderBottom: '1px solid var(--gray-200)' }}>
                  <h3 className="card-title" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-700)' }}>📋 Explanation</h3>
                </div>
                <div className="card-body" style={{ padding: '20px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '6px' }}>📁 DATA SOURCE</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Financial impact attributed to each AI use case in {department.name}.</p>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '6px' }}>📊 METHODOLOGY</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Cost savings from efficiency gains; Revenue from improved outcomes.</p>
                  </div>
                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--warning-600)', marginBottom: '6px' }}>💡 KEY INSIGHTS</div>
                    <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                      <li>Total: ${totalCostSavings.toFixed(1)}M savings + ${totalRevenue.toFixed(1)}M revenue</li>
                      <li>Top use case drives 40%+ of impact</li>
                      <li>All active cases generating ROI</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Impact by AI Type */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
              <div className="card" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)', border: '1px solid #c4b5fd' }}>
                <div className="card-header" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', padding: '16px 24px' }}>
                  <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>🤖 Impact by AI Type</h3>
                </div>
                <div className="card-body" style={{ padding: '20px', background: 'white' }}>
                  <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={aiCategories.slice(1).map(cat => ({
                            name: cat.name.replace(' Scenario', '').replace(' AI', ''),
                            value: department.useCases
                              .filter(uc => uc.aiType === cat.id)
                              .reduce((acc, uc) => acc + (uc.costSavings || 0) + (uc.revenue || 0), 0),
                            color: cat.color
                          })).filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {aiCategories.slice(1).map((cat, index) => (
                            <Cell key={`cell-${index}`} fill={cat.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => `$${v.toFixed(1)}M`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="card" style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
                <div className="card-header" style={{ background: 'var(--gray-100)', padding: '16px 24px', borderBottom: '1px solid var(--gray-200)' }}>
                  <h3 className="card-title" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-700)' }}>📋 Explanation</h3>
                </div>
                <div className="card-body" style={{ padding: '20px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#7c3aed', marginBottom: '6px' }}>📁 DATA SOURCE</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Impact aggregated by AI classification category.</p>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#7c3aed', marginBottom: '6px' }}>🤖 AI TYPES</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Predictive, Decision, NLP, Computer Vision, Optimization, Generative AI.</p>
                  </div>
                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--warning-600)', marginBottom: '6px' }}>💡 KEY INSIGHTS</div>
                    <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                      <li>Predictive AI leads impact contribution</li>
                      <li>Decision AI shows highest ROI ratio</li>
                      <li>Gen AI emerging with 15% share</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Impact Table */}
          <div className="card" style={{ marginTop: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Detailed Impact Analysis</h3>
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Use Case</th>
                    <th>AI Type</th>
                    <th>Data Layer</th>
                    <th>Accuracy</th>
                    <th>Cost Savings</th>
                    <th>Revenue</th>
                    <th>Productivity</th>
                    <th>Total Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {department.useCases
                    .filter(uc => uc.status === 'active')
                    .sort((a, b) => ((b.costSavings || 0) + (b.revenue || 0)) - ((a.costSavings || 0) + (a.revenue || 0)))
                    .map((useCase) => {
                      const aiCat = getAiCategory(useCase.aiType);
                      const dataCat = getDataCategory(useCase.dataLayer);
                      const totalImpact = (useCase.costSavings || 0) + (useCase.revenue || 0);
                      return (
                        <tr key={useCase.id}>
                          <td style={{ fontWeight: 500 }}>{useCase.name}</td>
                          <td>
                            <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', background: `${aiCat.color}15`, color: aiCat.color }}>
                              {aiCat.name.replace(' Scenario', '').replace(' AI', '')}
                            </span>
                          </td>
                          <td>
                            <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', background: `${dataCat.color}15`, color: dataCat.color }}>
                              {dataCat.name}
                            </span>
                          </td>
                          <td style={{ color: useCase.accuracy >= 90 ? 'var(--success-600)' : 'inherit' }}>
                            {useCase.accuracy > 0 ? `${useCase.accuracy.toFixed(1)}%` : 'N/A'}
                          </td>
                          <td style={{ color: 'var(--success-600)', fontWeight: 500 }}>
                            {useCase.costSavings > 0 ? `$${useCase.costSavings}M` : '-'}
                          </td>
                          <td style={{ color: 'var(--primary-600)', fontWeight: 500 }}>
                            {useCase.revenue > 0 ? `$${useCase.revenue}M` : '-'}
                          </td>
                          <td style={{ color: 'var(--warning-600)' }}>
                            {useCase.productivity > 0 ? `${useCase.productivity}%` : '-'}
                          </td>
                          <td style={{ fontWeight: 600, color: 'var(--gray-900)' }}>
                            ${totalImpact.toFixed(1)}M
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Department;
