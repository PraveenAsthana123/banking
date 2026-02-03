import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { departments } from '../data/departments';
import { useRole } from '../context/RoleContext';
import { roleDashboards } from '../components/RoleDashboards';
import ScenarioDashboard from '../components/ScenarioDashboard';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const Dashboard = () => {
  const { currentRole } = useRole();

  // Get the role-specific dashboard component
  const RoleDashboard = roleDashboards[currentRole.id];

  // If a role-specific dashboard exists, render it
  if (RoleDashboard) {
    return <RoleDashboard />;
  }

  // Default dashboard (fallback)
  // Summary statistics
  const totalUseCases = departments.reduce((acc, d) => acc + d.useCases.length, 0);
  const activeUseCases = departments.reduce(
    (acc, d) => acc + d.useCases.filter((uc) => uc.status === 'active').length,
    0
  );
  const trainingUseCases = departments.reduce(
    (acc, d) => acc + d.useCases.filter((uc) => uc.status === 'training').length,
    0
  );
  const totalModels = departments.reduce(
    (acc, d) => acc + d.useCases.reduce((a, uc) => a + uc.models, 0),
    0
  );

  // Chart data
  const modelPerformanceData = [
    { month: 'Jul', accuracy: 88.2, precision: 86.5 },
    { month: 'Aug', accuracy: 89.1, precision: 87.3 },
    { month: 'Sep', accuracy: 90.4, precision: 88.9 },
    { month: 'Oct', accuracy: 91.2, precision: 89.7 },
    { month: 'Nov', accuracy: 92.8, precision: 91.2 },
    { month: 'Dec', accuracy: 93.5, precision: 92.1 },
    { month: 'Jan', accuracy: 94.1, precision: 92.8 },
  ];

  const departmentData = departments.map((d) => ({
    name: d.name.split(' ')[0],
    useCases: d.useCases.length,
    active: d.useCases.filter((uc) => uc.status === 'active').length,
  }));

  const statusData = [
    { name: 'Active', value: activeUseCases, color: '#10b981' },
    { name: 'Training', value: trainingUseCases, color: '#f59e0b' },
    {
      name: 'Pending',
      value: totalUseCases - activeUseCases - trainingUseCases,
      color: '#6b7280',
    },
  ];

  const recentPipelines = [
    { id: 1, name: 'Credit Risk Scoring v2.3', status: 'running', dept: 'Risk', time: '2m ago' },
    { id: 2, name: 'Fraud Detection Model Retrain', status: 'completed', dept: 'Fraud', time: '15m ago' },
    { id: 3, name: 'Customer Churn Prediction', status: 'pending', dept: 'Customer', time: '1h ago' },
    { id: 4, name: 'AML Transaction Monitoring', status: 'running', dept: 'Fraud', time: '1h ago' },
    { id: 5, name: 'Loan Approval Model Update', status: 'failed', dept: 'Credit', time: '2h ago' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-description">
              Banking ML Pipeline Overview - Real-time monitoring and analytics
            </p>
          </div>
          <div className="page-actions">
            <button className="btn btn-secondary">
              <Icon name="download" size={16} />
              Export Report
            </button>
            <button className="btn btn-primary">
              <Icon name="plus" size={16} />
              New Use Case
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <Icon name="target" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Use Cases</div>
            <div className="stat-value">{totalUseCases}</div>
            <div className="stat-change positive">
              <Icon name="arrowUp" size={14} />
              +12% from last month
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <Icon name="check" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Active Use Cases</div>
            <div className="stat-value">{activeUseCases}</div>
            <div className="stat-change positive">
              <Icon name="arrowUp" size={14} />
              +8% from last month
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <Icon name="cpu" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Models Deployed</div>
            <div className="stat-value">{totalModels}</div>
            <div className="stat-change positive">
              <Icon name="arrowUp" size={14} />
              +15 new models
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon danger">
            <Icon name="zap" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Avg. Accuracy</div>
            <div className="stat-value">91.2%</div>
            <div className="stat-change positive">
              <Icon name="arrowUp" size={14} />
              +2.3% improvement
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row - Graph card on left, Explanation card on right */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '24px' }}>
        {/* Row 1: Model Performance Trend */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid var(--primary-200)' }}>
            <div className="card-header" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', padding: '16px 24px' }}>
              <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>📈 Model Performance Trend</h3>
            </div>
            <div className="card-body" style={{ padding: '20px', background: 'white' }}>
              <div style={{ height: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={modelPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} domain={[80, 100]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="accuracy" stroke="#3b82f6" fill="#93c5fd" fillOpacity={0.3} name="Accuracy" />
                    <Area type="monotone" dataKey="precision" stroke="#10b981" fill="#6ee7b7" fillOpacity={0.3} name="Precision" />
                  </AreaChart>
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
                <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Weekly model evaluations from production ML pipeline metrics store.</p>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '6px' }}>📊 METRICS</div>
                <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Accuracy (blue) and Precision (green) tracked over 7 months.</p>
              </div>
              <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--warning-600)', marginBottom: '6px' }}>💡 KEY INSIGHTS</div>
                <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                  <li>+5.9% accuracy improvement in 7 months</li>
                  <li>Precision tracking closely with accuracy</li>
                  <li>Steady upward trend indicates healthy model lifecycle</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Use Cases by Department */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid var(--success-200)' }}>
            <div className="card-header" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '16px 24px' }}>
              <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>📊 Use Cases by Department</h3>
            </div>
            <div className="card-body" style={{ padding: '20px', background: 'white' }}>
              <div style={{ height: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={11} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="useCases" fill="#3b82f6" name="Total" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="active" fill="#10b981" name="Active" radius={[4, 4, 0, 0]} />
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
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '6px' }}>📁 DATA SOURCE</div>
                <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Real-time count from use case registry across all departments.</p>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '6px' }}>📊 CHART TYPE</div>
                <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Grouped bar chart: Blue = Total, Green = Active use cases.</p>
              </div>
              <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--warning-600)', marginBottom: '6px' }}>💡 KEY INSIGHTS</div>
                <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                  <li>Risk & Fraud departments have most use cases</li>
                  <li>High active ratio indicates mature ML adoption</li>
                  <li>Compliance growing fastest quarter-over-quarter</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Department Cards and Recent Pipelines */}
      <div className="grid grid-cols-3">
        <div style={{ gridColumn: 'span 2' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)', border: '1px solid #e879f9' }}>
            <div className="card-header" style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)', padding: '16px 24px' }}>
              <div>
                <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Departments Overview</h3>
                <p className="card-subtitle" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Quick access to department dashboards</p>
              </div>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {departments.map((dept) => {
                  const activeCount = dept.useCases.filter((uc) => uc.status === 'active').length;
                  const avgAccuracy =
                    dept.useCases
                      .filter((uc) => uc.accuracy > 0)
                      .reduce((acc, uc) => acc + uc.accuracy, 0) /
                      dept.useCases.filter((uc) => uc.accuracy > 0).length || 0;

                  return (
                    <Link
                      key={dept.id}
                      to={`/department/${dept.id}`}
                      className="dept-card"
                    >
                      <div className="dept-card-header">
                        <div className={`dept-icon ${dept.id}`}>
                          <Icon name={dept.icon} size={24} />
                        </div>
                        <h4 className="dept-card-title">{dept.name}</h4>
                      </div>
                      <div className="dept-card-stats">
                        <div className="dept-stat">
                          <div className="dept-stat-value">{activeCount}</div>
                          <div className="dept-stat-label">Active</div>
                        </div>
                        <div className="dept-stat">
                          <div className="dept-stat-value">
                            {avgAccuracy > 0 ? avgAccuracy.toFixed(1) + '%' : 'N/A'}
                          </div>
                          <div className="dept-stat-label">Accuracy</div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card" style={{ height: '100%' }}>
            <div className="card-header">
              <div>
                <h3 className="card-title">Use Case Status</h3>
                <p className="card-subtitle">Current distribution</p>
              </div>
            </div>
            <div className="card-body">
              <div className="chart-container small" style={{ marginBottom: '16px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
                {statusData.map((item) => (
                  <div key={item.name} style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: item.color,
                        margin: '0 auto 4px',
                      }}
                    />
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.name}</div>
                    <div style={{ fontWeight: '600' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* B2B/B2C/B2E Coverage Widget */}
      <div style={{ marginTop: '24px' }}>
        <ScenarioDashboard compact={true} />
      </div>

      {/* Recent Pipelines */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Recent Pipeline Runs</h3>
            <p className="card-subtitle">Latest model training and deployment activities</p>
          </div>
          <button className="btn btn-secondary btn-sm">View All</button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="pipeline-list" style={{ padding: '0' }}>
            {recentPipelines.map((pipeline) => (
              <div key={pipeline.id} className="pipeline-item" style={{ borderRadius: 0, margin: 0 }}>
                <div className={`pipeline-status ${pipeline.status}`} />
                <div className="pipeline-info">
                  <div className="pipeline-name">{pipeline.name}</div>
                  <div className="pipeline-meta">
                    {pipeline.dept} • {pipeline.time}
                  </div>
                </div>
                <span className={`status-badge ${pipeline.status === 'completed' ? 'success' : pipeline.status === 'running' ? 'info' : pipeline.status === 'failed' ? 'danger' : 'neutral'}`}>
                  <span className="status-dot" />
                  {pipeline.status.charAt(0).toUpperCase() + pipeline.status.slice(1)}
                </span>
                <div className="pipeline-actions">
                  <button className="btn btn-icon btn-sm btn-secondary">
                    <Icon name="eye" size={14} />
                  </button>
                  <button className="btn btn-icon btn-sm btn-secondary">
                    <Icon name="refresh" size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
