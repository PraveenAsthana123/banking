import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { departments } from '../data/departments';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// Executive Dashboard
export const ExecutiveDashboard = () => {
  const totalUseCases = departments.reduce((acc, d) => acc + d.useCases.length, 0);
  const activeUseCases = departments.reduce((acc, d) => acc + d.useCases.filter(uc => uc.status === 'active').length, 0);
  const totalSavings = departments.reduce((acc, d) => acc + d.useCases.reduce((a, uc) => a + (uc.costSavings || 0), 0), 0);
  const totalRevenue = departments.reduce((acc, d) => acc + d.useCases.reduce((a, uc) => a + (uc.revenue || 0), 0), 0);

  const portfolioData = departments.slice(0, 8).map(d => ({
    name: d.name.split(' ')[0],
    value: d.useCases.reduce((a, uc) => a + (uc.costSavings || 0) + (uc.revenue || 0), 0),
    savings: d.useCases.reduce((a, uc) => a + (uc.costSavings || 0), 0),
    revenue: d.useCases.reduce((a, uc) => a + (uc.revenue || 0), 0),
  }));

  const quarterlyData = [
    { quarter: 'Q1 2024', roi: 320, investment: 45 },
    { quarter: 'Q2 2024', roi: 385, investment: 52 },
    { quarter: 'Q3 2024', roi: 420, investment: 48 },
    { quarter: 'Q4 2024', roi: 487, investment: 55 },
  ];

  return (
    <div className="role-dashboard executive">
      <div className="dashboard-header" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', color: 'white', padding: '32px', borderRadius: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Executive AI Portfolio</h1>
            <p style={{ opacity: 0.9 }}>Strategic overview of AI investments and value realization</p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}>
              <Icon name="download" size={16} /> Board Report
            </button>
            <button className="btn" style={{ background: 'white', color: '#8b5cf6' }}>
              <Icon name="calendar" size={16} /> Schedule Review
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4" style={{ gap: '20px', marginBottom: '24px' }}>
        {[
          { label: 'Total ROI', value: '$487M', change: '+18%', icon: 'trending-up', color: '#10b981' },
          { label: 'Cost Savings', value: `$${totalSavings.toFixed(1)}M`, change: '+12%', icon: 'dollar', color: '#3b82f6' },
          { label: 'Revenue Impact', value: `$${totalRevenue.toFixed(1)}M`, change: '+25%', icon: 'bar-chart', color: '#8b5cf6' },
          { label: 'Active AI Models', value: activeUseCases, change: `/${totalUseCases} total`, icon: 'cpu', color: '#f59e0b' },
        ].map((metric, i) => (
          <div key={i} className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '14px', color: 'var(--gray-500)', marginBottom: '8px' }}>{metric.label}</div>
                <div style={{ fontSize: '32px', fontWeight: 700 }}>{metric.value}</div>
                <div style={{ fontSize: '13px', color: metric.color, marginTop: '4px' }}>{metric.change}</div>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${metric.color}15`, color: metric.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={metric.icon} size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2" style={{ gap: '24px', marginBottom: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quarterly ROI Trend</h3>
          </div>
          <div className="card-body">
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={quarterlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="quarter" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip />
                  <Area type="monotone" dataKey="roi" stroke="#8b5cf6" fill="#8b5cf620" name="ROI ($M)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Value by Department</h3>
          </div>
          <div className="card-body">
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={portfolioData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="#6b7280" fontSize={11} width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="savings" stackId="a" fill="#3b82f6" name="Savings" />
                  <Bar dataKey="revenue" stackId="a" fill="#10b981" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Initiatives */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Strategic AI Initiatives</h3>
          <span className="status-badge info">4 Active</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {[
              { name: 'Fraud Prevention 2.0', status: 'On Track', progress: 75, value: '$18.5M', sponsor: 'CRO' },
              { name: 'Customer 360', status: 'On Track', progress: 60, value: '$12.3M', sponsor: 'CMO' },
              { name: 'Credit Automation', status: 'At Risk', progress: 45, value: '$8.5M', sponsor: 'CCO' },
              { name: 'AML Transformation', status: 'On Track', progress: 85, value: '$6.2M', sponsor: 'CCO' },
            ].map((initiative, i) => (
              <div key={i} style={{ padding: '20px', background: 'var(--gray-50)', borderRadius: '12px' }}>
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>{initiative.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span className={`status-badge ${initiative.status === 'On Track' ? 'success' : 'warning'}`}>{initiative.status}</span>
                  <span style={{ fontWeight: 600, color: 'var(--success-600)' }}>{initiative.value}</span>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ height: '8px', background: 'var(--gray-200)', borderRadius: '4px' }}>
                    <div style={{ height: '100%', width: `${initiative.progress}%`, background: initiative.status === 'On Track' ? 'var(--success-500)' : 'var(--warning-500)', borderRadius: '4px' }} />
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Sponsor: {initiative.sponsor}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Business Owner Dashboard
export const BusinessOwnerDashboard = () => {
  const myUseCases = departments[0].useCases.slice(0, 5);

  return (
    <div className="role-dashboard business-owner">
      <div className="dashboard-header" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: 'white', padding: '32px', borderRadius: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>My Use Cases</h1>
            <p style={{ opacity: 0.9 }}>Track value realization and manage business requirements</p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}>
              <Icon name="plus" size={16} /> New Use Case
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4" style={{ gap: '20px', marginBottom: '24px' }}>
        {[
          { label: 'My Use Cases', value: '8', icon: 'target', color: '#3b82f6' },
          { label: 'Pending Approval', value: '2', icon: 'clock', color: '#f59e0b' },
          { label: 'Value Delivered', value: '$4.2M', icon: 'trending-up', color: '#10b981' },
          { label: 'At Risk', value: '1', icon: 'alert-triangle', color: '#ef4444' },
        ].map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
              <Icon name={stat.icon} size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Use Cases Table */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Use Cases I Own</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Use Case</th>
                <th>Status</th>
                <th>Projected Value</th>
                <th>Actual Value</th>
                <th>Variance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {myUseCases.map((uc, i) => {
                const projected = (uc.costSavings || 0) + (uc.revenue || 0);
                const actual = projected * (0.85 + Math.random() * 0.2);
                const variance = ((actual - projected) / projected * 100).toFixed(1);
                return (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{uc.name}</td>
                    <td><span className={`status-badge ${uc.status === 'active' ? 'success' : 'warning'}`}>{uc.status}</span></td>
                    <td>${projected.toFixed(1)}M</td>
                    <td>${actual.toFixed(1)}M</td>
                    <td style={{ color: variance >= 0 ? 'var(--success-600)' : 'var(--danger-600)' }}>{variance >= 0 ? '+' : ''}{variance}%</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-sm btn-secondary">View</button>
                        <button className="btn btn-sm btn-secondary">Edit</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Actions */}
      <div className="grid grid-cols-2" style={{ gap: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Pending Approvals</h3>
            <span className="status-badge warning">2 Pending</span>
          </div>
          <div className="card-body">
            {[
              { item: 'Credit Limit Model v2.1', type: 'Model Update', from: 'Data Science', date: '2 days ago' },
              { item: 'New Feature: Alt Data', type: 'Requirement', from: 'Product', date: '1 week ago' },
            ].map((approval, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--gray-50)', borderRadius: '8px', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{approval.item}</div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{approval.type} from {approval.from} • {approval.date}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-sm btn-success">Approve</button>
                  <button className="btn btn-sm btn-secondary">Review</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Value Realization</h3>
          </div>
          <div className="card-body">
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { month: 'Jul', projected: 2.1, actual: 1.8 },
                  { month: 'Aug', projected: 2.5, actual: 2.3 },
                  { month: 'Sep', projected: 3.0, actual: 2.9 },
                  { month: 'Oct', projected: 3.5, actual: 3.6 },
                  { month: 'Nov', projected: 4.0, actual: 4.1 },
                  { month: 'Dec', projected: 4.2, actual: 4.2 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip />
                  <Area type="monotone" dataKey="projected" stroke="#94a3b8" fill="#94a3b820" name="Projected" />
                  <Area type="monotone" dataKey="actual" stroke="#3b82f6" fill="#3b82f620" name="Actual" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Data Scientist Dashboard
export const DataScientistDashboard = () => {
  return (
    <div className="role-dashboard data-scientist">
      <div className="dashboard-header" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', padding: '32px', borderRadius: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>ML Workbench</h1>
            <p style={{ opacity: 0.9 }}>Experiments, models, and deployments</p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}>
              <Icon name="plus" size={16} /> New Experiment
            </button>
            <button className="btn" style={{ background: 'white', color: '#10b981' }}>
              <Icon name="upload" size={16} /> Deploy Model
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4" style={{ gap: '20px', marginBottom: '24px' }}>
        {[
          { label: 'Active Experiments', value: '12', icon: 'cpu', color: '#10b981' },
          { label: 'Models in Registry', value: '45', icon: 'database', color: '#3b82f6' },
          { label: 'Deployed Models', value: '28', icon: 'check', color: '#8b5cf6' },
          { label: 'Training Jobs', value: '3', icon: 'zap', color: '#f59e0b' },
        ].map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
              <Icon name={stat.icon} size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2" style={{ gap: '24px', marginBottom: '24px' }}>
        {/* Recent Experiments */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Experiments</h3>
            <Link to="/models" className="btn btn-sm btn-secondary">View All</Link>
          </div>
          <div className="card-body">
            {[
              { name: 'credit-risk-xgb-v5', status: 'completed', accuracy: 99.2, time: '2h ago' },
              { name: 'fraud-ensemble-v3', status: 'running', accuracy: null, time: '45m' },
              { name: 'churn-lstm-v2', status: 'completed', accuracy: 98.7, time: '5h ago' },
              { name: 'aml-transformer-v1', status: 'failed', accuracy: null, time: '1d ago' },
              { name: 'clv-gradient-v4', status: 'completed', accuracy: 97.8, time: '2d ago' },
            ].map((exp, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontWeight: 500, fontFamily: 'monospace' }}>{exp.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{exp.time}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {exp.accuracy && <span style={{ fontWeight: 600 }}>{exp.accuracy}%</span>}
                  <span className={`status-badge ${exp.status === 'completed' ? 'success' : exp.status === 'running' ? 'info' : 'danger'}`}>
                    {exp.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Model Performance */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Model Performance Comparison</h3>
          </div>
          <div className="card-body">
            <div style={{ height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { model: 'v2.1', accuracy: 94.2, f1: 92.1 },
                  { model: 'v2.2', accuracy: 96.5, f1: 94.8 },
                  { model: 'v2.3', accuracy: 98.1, f1: 96.2 },
                  { model: 'v2.4', accuracy: 99.2, f1: 97.8 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="model" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} domain={[90, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="accuracy" fill="#10b981" name="Accuracy" />
                  <Bar dataKey="f1" fill="#3b82f6" name="F1 Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Store */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Feature Store</h3>
          <span className="status-badge success">256 Features</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {[
              { category: 'Customer', count: 45, icon: 'users' },
              { category: 'Transaction', count: 68, icon: 'credit-card' },
              { category: 'Risk', count: 52, icon: 'shield' },
              { category: 'Behavioral', count: 91, icon: 'trending-up' },
            ].map((cat, i) => (
              <div key={i} style={{ padding: '20px', background: 'var(--gray-50)', borderRadius: '12px', textAlign: 'center' }}>
                <Icon name={cat.icon} size={32} />
                <div style={{ fontSize: '24px', fontWeight: 700, margin: '8px 0' }}>{cat.count}</div>
                <div style={{ color: 'var(--gray-500)' }}>{cat.category}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Model Risk Manager Dashboard
export const MRMDashboard = () => {
  return (
    <div className="role-dashboard mrm">
      <div className="dashboard-header" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', padding: '32px', borderRadius: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Model Risk Management</h1>
            <p style={{ opacity: 0.9 }}>Validation queue, compliance status, and risk assessments</p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}>
              <Icon name="download" size={16} /> SR 11-7 Report
            </button>
          </div>
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="grid grid-cols-4" style={{ gap: '20px', marginBottom: '24px' }}>
        {[
          { label: 'Pending Validation', value: '7', icon: 'clock', color: '#f59e0b' },
          { label: 'Approved Models', value: '89', icon: 'check', color: '#10b981' },
          { label: 'Open Findings', value: '3', icon: 'alert-triangle', color: '#ef4444' },
          { label: 'Risk Score', value: 'Low', icon: 'shield', color: '#3b82f6' },
        ].map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
              <Icon name={stat.icon} size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Validation Queue */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Validation Queue</h3>
          <span className="status-badge warning">7 Pending</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Model</th>
                <th>Department</th>
                <th>Risk Tier</th>
                <th>Submitted</th>
                <th>SLA</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { model: 'Credit Risk Scoring v2.4', dept: 'Risk Management', tier: 'Tier 1', submitted: '2025-01-25', sla: '3 days', status: 'urgent' },
                { model: 'Fraud Detection v3.1', dept: 'Fraud Detection', tier: 'Tier 1', submitted: '2025-01-26', sla: '5 days', status: 'normal' },
                { model: 'Churn Prediction v2.0', dept: 'Customer Analytics', tier: 'Tier 2', submitted: '2025-01-20', sla: '2 days', status: 'overdue' },
                { model: 'AML Monitoring v1.5', dept: 'Compliance', tier: 'Tier 1', submitted: '2025-01-27', sla: '7 days', status: 'normal' },
              ].map((item, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{item.model}</td>
                  <td>{item.dept}</td>
                  <td><span className={`status-badge ${item.tier === 'Tier 1' ? 'danger' : 'warning'}`}>{item.tier}</span></td>
                  <td>{item.submitted}</td>
                  <td><span className={`status-badge ${item.status === 'overdue' ? 'danger' : item.status === 'urgent' ? 'warning' : 'success'}`}>{item.sla}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-sm btn-primary">Review</button>
                      <button className="btn btn-sm btn-secondary">Assign</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Assessment Summary */}
      <div className="grid grid-cols-2" style={{ gap: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Open Findings</h3>
          </div>
          <div className="card-body">
            {[
              { finding: 'Data quality issues in feature pipeline', severity: 'High', model: 'Credit Risk v2.3', days: 5 },
              { finding: 'Missing documentation for threshold changes', severity: 'Medium', model: 'Fraud Detection v3.0', days: 12 },
              { finding: 'Bias detected in age group segmentation', severity: 'High', model: 'Loan Approval v1.8', days: 3 },
            ].map((finding, i) => (
              <div key={i} style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '8px', marginBottom: '12px', borderLeft: `4px solid ${finding.severity === 'High' ? 'var(--danger-500)' : 'var(--warning-500)'}` }}>
                <div style={{ fontWeight: 500, marginBottom: '4px' }}>{finding.finding}</div>
                <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{finding.model} • Open for {finding.days} days</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Upcoming Reviews</h3>
          </div>
          <div className="card-body">
            {[
              { model: 'Transaction Fraud Detection', type: 'Annual Review', date: '2025-02-15' },
              { model: 'Credit Risk Scoring', type: 'Quarterly Review', date: '2025-02-01' },
              { model: 'AML Monitoring', type: 'Regulatory Exam', date: '2025-03-01' },
              { model: 'Customer Churn', type: 'Annual Review', date: '2025-03-15' },
            ].map((review, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{review.model}</div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{review.type}</div>
                </div>
                <span className="status-badge info">{review.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Operations Dashboard
export const OperationsDashboard = () => {
  return (
    <div className="role-dashboard operations">
      <div className="dashboard-header" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', padding: '32px', borderRadius: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>ML Operations Center</h1>
            <p style={{ opacity: 0.9 }}>Pipeline monitoring, incidents, and system health</p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}>
              <Icon name="bell" size={16} /> Alerts (3)
            </button>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-5" style={{ gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Running Pipelines', value: '12', status: 'success' },
          { label: 'Failed Jobs', value: '2', status: 'danger' },
          { label: 'SLA Compliance', value: '99.2%', status: 'success' },
          { label: 'Avg Latency', value: '45ms', status: 'success' },
          { label: 'Active Alerts', value: '3', status: 'warning' },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 700 }}>{stat.value}</div>
            <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>{stat.label}</div>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: `var(--${stat.status}-500)`, margin: '8px auto 0' }} />
          </div>
        ))}
      </div>

      {/* Active Pipelines */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Active Pipelines</h3>
          <Link to="/pipelines" className="btn btn-sm btn-secondary">View All</Link>
        </div>
        <div className="card-body">
          {[
            { name: 'Credit Risk Scoring - Daily Batch', progress: 67, stage: 'Model Training', eta: '15m' },
            { name: 'Fraud Detection - Real-time', progress: 100, stage: 'Running', eta: 'Continuous' },
            { name: 'AML Monitoring - Hourly', progress: 85, stage: 'Post-processing', eta: '5m' },
            { name: 'Customer Churn - Weekly', progress: 42, stage: 'Feature Engineering', eta: '45m' },
          ].map((pipeline, i) => (
            <div key={i} style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '8px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 500 }}>{pipeline.name}</span>
                <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>{pipeline.stage} • ETA: {pipeline.eta}</span>
              </div>
              <div style={{ height: '8px', background: 'var(--gray-200)', borderRadius: '4px' }}>
                <div style={{ height: '100%', width: `${pipeline.progress}%`, background: pipeline.progress === 100 ? 'var(--success-500)' : 'var(--primary-500)', borderRadius: '4px', transition: 'width 0.3s' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Incidents */}
      <div className="grid grid-cols-2" style={{ gap: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Active Incidents</h3>
            <span className="status-badge danger">2 Open</span>
          </div>
          <div className="card-body">
            {[
              { id: 'INC-2025-0128-001', title: 'High latency in fraud detection API', severity: 'P2', time: '45m', assignee: 'On-call' },
              { id: 'INC-2025-0128-002', title: 'Data pipeline failure - Treasury', severity: 'P3', time: '2h', assignee: 'Data Eng' },
            ].map((incident, i) => (
              <div key={i} style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '8px', marginBottom: '12px', borderLeft: `4px solid ${incident.severity === 'P1' ? 'var(--danger-500)' : incident.severity === 'P2' ? 'var(--warning-500)' : 'var(--primary-500)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--gray-500)' }}>{incident.id}</span>
                  <span className={`status-badge ${incident.severity === 'P1' ? 'danger' : incident.severity === 'P2' ? 'warning' : 'info'}`}>{incident.severity}</span>
                </div>
                <div style={{ fontWeight: 500, marginBottom: '4px' }}>{incident.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Open for {incident.time} • {incident.assignee}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">On-Call Schedule</h3>
          </div>
          <div className="card-body">
            {[
              { name: 'John Doe', role: 'Primary', period: 'This Week', contact: 'john@bank.com' },
              { name: 'Jane Smith', role: 'Secondary', period: 'This Week', contact: 'jane@bank.com' },
              { name: 'Bob Wilson', role: 'Primary', period: 'Next Week', contact: 'bob@bank.com' },
            ].map((person, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                    {person.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500 }}>{person.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{person.contact}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`status-badge ${person.role === 'Primary' ? 'success' : 'neutral'}`}>{person.role}</span>
                  <div style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '4px' }}>{person.period}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Compliance Officer Dashboard
export const ComplianceDashboard = () => {
  return (
    <div className="role-dashboard compliance">
      <div className="dashboard-header" style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)', color: 'white', padding: '32px', borderRadius: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Compliance Dashboard</h1>
            <p style={{ opacity: 0.9 }}>Regulatory compliance, audits, and governance tracking</p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}>
              <Icon name="download" size={16} /> Compliance Report
            </button>
          </div>
        </div>
      </div>

      {/* Compliance Metrics */}
      <div className="grid grid-cols-4" style={{ gap: '20px', marginBottom: '24px' }}>
        {[
          { label: 'Overall Compliance', value: '97%', icon: 'check', color: '#10b981' },
          { label: 'Pending Audits', value: '3', icon: 'clipboard-check', color: '#f59e0b' },
          { label: 'Open Issues', value: '5', icon: 'alert-triangle', color: '#ef4444' },
          { label: 'Policies Reviewed', value: '42', icon: 'file', color: '#3b82f6' },
        ].map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
              <Icon name={stat.icon} size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Regulatory Status */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Regulatory Compliance Status</h3>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {[
              { reg: 'SR 11-7', status: 'Compliant', score: 98, lastAudit: '2024-12-15' },
              { reg: 'GDPR', status: 'Compliant', score: 96, lastAudit: '2024-11-20' },
              { reg: 'CCPA', status: 'Compliant', score: 95, lastAudit: '2024-10-10' },
              { reg: 'ECOA', status: 'Review', score: 92, lastAudit: '2024-09-05' },
              { reg: 'FCRA', status: 'Compliant', score: 97, lastAudit: '2024-11-15' },
              { reg: 'SOX', status: 'Compliant', score: 99, lastAudit: '2024-12-01' },
              { reg: 'Basel III', status: 'Compliant', score: 94, lastAudit: '2024-10-20' },
              { reg: 'EU AI Act', status: 'In Progress', score: 88, lastAudit: 'Pending' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{item.reg}</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: item.score >= 95 ? 'var(--success-600)' : item.score >= 90 ? 'var(--warning-600)' : 'var(--danger-600)' }}>
                  {item.score}%
                </div>
                <span className={`status-badge ${item.status === 'Compliant' ? 'success' : item.status === 'Review' ? 'warning' : 'info'}`} style={{ marginTop: '8px' }}>
                  {item.status}
                </span>
                <div style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '8px' }}>Last: {item.lastAudit}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Fraud Analyst Dashboard
export const FraudAnalystDashboard = () => {
  return (
    <div className="role-dashboard fraud-analyst">
      <div className="dashboard-header" style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', color: 'white', padding: '32px', borderRadius: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Fraud Investigation Queue</h1>
            <p style={{ opacity: 0.9 }}>Review alerts, investigate cases, and provide feedback</p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}>
              <Icon name="download" size={16} /> Export Cases
            </button>
          </div>
        </div>
      </div>

      {/* Queue Stats */}
      <div className="grid grid-cols-4" style={{ gap: '20px', marginBottom: '24px' }}>
        {[
          { label: 'New Alerts', value: '45', icon: 'alert-triangle', color: '#dc2626' },
          { label: 'In Review', value: '12', icon: 'eye', color: '#f59e0b' },
          { label: 'Escalated', value: '3', icon: 'trending-up', color: '#8b5cf6' },
          { label: 'Resolved Today', value: '28', icon: 'check', color: '#10b981' },
        ].map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
              <Icon name={stat.icon} size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Alert Queue */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Alert Queue</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select className="form-select" style={{ width: 'auto' }}>
              <option>All Alerts</option>
              <option>High Risk</option>
              <option>Medium Risk</option>
            </select>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Alert ID</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Risk Score</th>
                <th>Amount</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'FRD-2025-0128-0045', customer: 'CUST-****-4521', type: 'Card Fraud', score: 0.95, amount: '$2,450', time: '2m ago' },
                { id: 'FRD-2025-0128-0044', customer: 'CUST-****-7832', type: 'Account Takeover', score: 0.88, amount: '$15,000', time: '5m ago' },
                { id: 'FRD-2025-0128-0043', customer: 'CUST-****-2341', type: 'Suspicious Transfer', score: 0.82, amount: '$8,200', time: '12m ago' },
                { id: 'FRD-2025-0128-0042', customer: 'CUST-****-9012', type: 'Card Fraud', score: 0.76, amount: '$520', time: '18m ago' },
                { id: 'FRD-2025-0128-0041', customer: 'CUST-****-5678', type: 'Identity Fraud', score: 0.71, amount: '$0', time: '25m ago' },
              ].map((alert, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{alert.id}</td>
                  <td>{alert.customer}</td>
                  <td><span className="status-badge danger">{alert.type}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '60px', height: '6px', background: 'var(--gray-200)', borderRadius: '3px' }}>
                        <div style={{ width: `${alert.score * 100}%`, height: '100%', background: alert.score > 0.8 ? 'var(--danger-500)' : 'var(--warning-500)', borderRadius: '3px' }} />
                      </div>
                      <span style={{ fontWeight: 600, color: alert.score > 0.8 ? 'var(--danger-600)' : 'var(--warning-600)' }}>{(alert.score * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{alert.amount}</td>
                  <td style={{ color: 'var(--gray-500)' }}>{alert.time}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-sm btn-primary">Review</button>
                      <button className="btn btn-sm btn-secondary">Dismiss</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Business Analyst Dashboard
export const BusinessAnalystDashboard = () => {
  return (
    <div className="role-dashboard business-analyst">
      <div className="dashboard-header" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: 'white', padding: '32px', borderRadius: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Business Analysis</h1>
            <p style={{ opacity: 0.9 }}>Requirements, UAT tracking, and reporting</p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}>
              <Icon name="plus" size={16} /> New Requirement
            </button>
          </div>
        </div>
      </div>

      {/* BA Metrics */}
      <div className="grid grid-cols-4" style={{ gap: '20px', marginBottom: '24px' }}>
        {[
          { label: 'Open Requirements', value: '15', icon: 'file', color: '#7c3aed' },
          { label: 'UAT In Progress', value: '4', icon: 'check', color: '#f59e0b' },
          { label: 'Pending Sign-off', value: '2', icon: 'clipboard-check', color: '#3b82f6' },
          { label: 'Completed This Month', value: '8', icon: 'target', color: '#10b981' },
        ].map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
              <Icon name={stat.icon} size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2" style={{ gap: '24px' }}>
        {/* Requirements Backlog */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Requirements Backlog</h3>
          </div>
          <div className="card-body">
            {[
              { req: 'REQ-2025-042', title: 'Add alternative data sources for credit scoring', priority: 'High', status: 'In Review' },
              { req: 'REQ-2025-041', title: 'Real-time fraud score API enhancement', priority: 'High', status: 'Approved' },
              { req: 'REQ-2025-040', title: 'Customer segmentation model update', priority: 'Medium', status: 'Draft' },
              { req: 'REQ-2025-039', title: 'AML threshold configuration UI', priority: 'Low', status: 'In Review' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '8px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--gray-500)' }}>{item.req}</span>
                  <span className={`status-badge ${item.priority === 'High' ? 'danger' : item.priority === 'Medium' ? 'warning' : 'neutral'}`}>{item.priority}</span>
                </div>
                <div style={{ fontWeight: 500, marginBottom: '8px' }}>{item.title}</div>
                <span className={`status-badge ${item.status === 'Approved' ? 'success' : item.status === 'In Review' ? 'info' : 'neutral'}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* UAT Status */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">UAT Status</h3>
          </div>
          <div className="card-body">
            {[
              { name: 'Credit Risk Scoring v2.4', tests: 45, passed: 42, failed: 3, status: 'In Progress' },
              { name: 'Fraud Detection v3.1', tests: 38, passed: 38, failed: 0, status: 'Passed' },
              { name: 'Customer Churn v2.0', tests: 28, passed: 25, failed: 3, status: 'In Progress' },
              { name: 'AML Monitoring v1.5', tests: 52, passed: 0, failed: 0, status: 'Not Started' },
            ].map((uat, i) => (
              <div key={i} style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '8px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 500 }}>{uat.name}</span>
                  <span className={`status-badge ${uat.status === 'Passed' ? 'success' : uat.status === 'In Progress' ? 'info' : 'neutral'}`}>{uat.status}</span>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
                  <span>Total: {uat.tests}</span>
                  <span style={{ color: 'var(--success-600)' }}>Passed: {uat.passed}</span>
                  <span style={{ color: uat.failed > 0 ? 'var(--danger-600)' : 'var(--gray-400)' }}>Failed: {uat.failed}</span>
                </div>
                {uat.tests > 0 && (
                  <div style={{ height: '6px', background: 'var(--gray-200)', borderRadius: '3px', marginTop: '8px' }}>
                    <div style={{ height: '100%', width: `${(uat.passed / uat.tests) * 100}%`, background: 'var(--success-500)', borderRadius: '3px' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
