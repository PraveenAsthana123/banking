import React from 'react';
import { Icon } from './Icons';
import { departments } from '../data/departments';
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
  LineChart,
  Line,
} from 'recharts';

// Shared data calculations
const getTotalUseCases = () => departments.reduce((acc, d) => acc + d.useCases.length, 0);
const getActiveUseCases = () => departments.reduce(
  (acc, d) => acc + d.useCases.filter((uc) => uc.status === 'active').length,
  0
);

// Executive Dashboard - Strategic KPIs, ROI, high-level metrics
export const ExecutiveDashboard = () => {
  const roiData = [
    { quarter: 'Q1', roi: 125, investment: 2.4, savings: 3.0 },
    { quarter: 'Q2', roi: 142, investment: 2.8, savings: 4.0 },
    { quarter: 'Q3', roi: 168, investment: 3.2, savings: 5.4 },
    { quarter: 'Q4', roi: 195, investment: 3.6, savings: 7.0 },
  ];

  const strategicMetrics = [
    { name: 'Cost Reduction', value: '$12.4M', change: '+18%', positive: true },
    { name: 'Revenue Impact', value: '$28.7M', change: '+24%', positive: true },
    { name: 'Risk Mitigation', value: '94.2%', change: '+5.3%', positive: true },
    { name: 'Compliance Score', value: '98.1%', change: '+2.1%', positive: true },
  ];

  return (
    <div className="role-dashboard executive">
      <div className="dashboard-header">
        <h2>Executive Dashboard</h2>
        <p>Strategic AI/ML Portfolio Overview</p>
      </div>

      <div className="stats-grid">
        {strategicMetrics.map((metric, i) => (
          <div key={i} className="stat-card">
            <div className="stat-content">
              <div className="stat-label">{metric.name}</div>
              <div className="stat-value">{metric.value}</div>
              <div className={`stat-change ${metric.positive ? 'positive' : 'negative'}`}>
                <Icon name={metric.positive ? 'arrowUp' : 'arrowDown'} size={14} />
                {metric.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2" style={{ marginTop: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">ROI Trend</h3>
            <p className="card-subtitle">Quarterly return on AI investment</p>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={roiData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="quarter" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip />
                  <Area type="monotone" dataKey="roi" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} name="ROI %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Investment vs Savings</h3>
            <p className="card-subtitle">Quarterly financial impact ($M)</p>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roiData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="quarter" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="investment" fill="#ef4444" name="Investment" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="savings" fill="#10b981" name="Savings" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Business Owner Dashboard - Use case ownership, value tracking
export const BusinessOwnerDashboard = () => {
  const myUseCases = [
    { name: 'Credit Scoring v2', status: 'active', value: '$2.1M', health: 'good' },
    { name: 'Churn Prediction', status: 'active', value: '$890K', health: 'warning' },
    { name: 'Cross-sell Model', status: 'training', value: '$1.5M', health: 'good' },
    { name: 'Loan Default Risk', status: 'pending', value: '$3.2M', health: 'pending' },
  ];

  const valueRealized = [
    { month: 'Aug', projected: 400, actual: 380 },
    { month: 'Sep', projected: 450, actual: 470 },
    { month: 'Oct', projected: 500, actual: 520 },
    { month: 'Nov', projected: 550, actual: 540 },
    { month: 'Dec', projected: 600, actual: 620 },
    { month: 'Jan', projected: 650, actual: 680 },
  ];

  return (
    <div className="role-dashboard business-owner">
      <div className="dashboard-header">
        <h2>Business Owner Dashboard</h2>
        <p>Your Use Cases & Value Tracking</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary"><Icon name="target" size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">My Use Cases</div>
            <div className="stat-value">4</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success"><Icon name="check" size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Active</div>
            <div className="stat-value">2</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning"><Icon name="dollar" size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Total Value</div>
            <div className="stat-value">$7.7M</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon danger"><Icon name="trending-up" size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Value Realized</div>
            <div className="stat-value">$3.2M</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ marginTop: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">My Use Cases</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {myUseCases.map((uc, i) => (
              <div key={i} className="pipeline-item" style={{ borderRadius: 0, margin: 0 }}>
                <div className={`pipeline-status ${uc.status === 'active' ? 'completed' : uc.status}`} />
                <div className="pipeline-info">
                  <div className="pipeline-name">{uc.name}</div>
                  <div className="pipeline-meta">Est. Value: {uc.value}</div>
                </div>
                <span className={`status-badge ${uc.health === 'good' ? 'success' : uc.health === 'warning' ? 'warning' : 'neutral'}`}>
                  <span className="status-dot" />
                  {uc.health}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Value Realization Trend</h3>
            <p className="card-subtitle">Projected vs Actual ($K)</p>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={valueRealized}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="projected" stroke="#94a3b8" strokeDasharray="5 5" name="Projected" />
                  <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} name="Actual" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Data Scientist Dashboard - Experiments, model development, metrics
export const DataScientistDashboard = () => {
  const experiments = [
    { name: 'XGBoost v3.2', status: 'running', accuracy: '94.2%', time: '2h 15m' },
    { name: 'Neural Net Credit', status: 'completed', accuracy: '92.8%', time: '45m' },
    { name: 'Ensemble Fraud', status: 'queued', accuracy: '-', time: 'Pending' },
    { name: 'LSTM Churn', status: 'failed', accuracy: '-', time: '1h 02m' },
  ];

  const modelMetrics = [
    { metric: 'AUC-ROC', baseline: 0.89, current: 0.94 },
    { metric: 'Precision', baseline: 0.85, current: 0.91 },
    { metric: 'Recall', baseline: 0.82, current: 0.88 },
    { metric: 'F1 Score', baseline: 0.83, current: 0.89 },
  ];

  return (
    <div className="role-dashboard data-scientist">
      <div className="dashboard-header">
        <h2>Data Scientist Dashboard</h2>
        <p>Experiments & Model Development</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary"><Icon name="cpu" size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Active Experiments</div>
            <div className="stat-value">12</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success"><Icon name="check" size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Models in Prod</div>
            <div className="stat-value">28</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning"><Icon name="zap" size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Avg Accuracy</div>
            <div className="stat-value">93.4%</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon danger"><Icon name="clock" size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">GPU Hours</div>
            <div className="stat-value">847</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ marginTop: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Experiments</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {experiments.map((exp, i) => (
              <div key={i} className="pipeline-item" style={{ borderRadius: 0, margin: 0 }}>
                <div className={`pipeline-status ${exp.status}`} />
                <div className="pipeline-info">
                  <div className="pipeline-name">{exp.name}</div>
                  <div className="pipeline-meta">Accuracy: {exp.accuracy} | Time: {exp.time}</div>
                </div>
                <span className={`status-badge ${exp.status === 'completed' ? 'success' : exp.status === 'running' ? 'info' : exp.status === 'failed' ? 'danger' : 'neutral'}`}>
                  <span className="status-dot" />
                  {exp.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Model Performance Comparison</h3>
            <p className="card-subtitle">Baseline vs Current</p>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelMetrics} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" domain={[0, 1]} stroke="#6b7280" fontSize={12} />
                  <YAxis type="category" dataKey="metric" stroke="#6b7280" fontSize={12} width={80} />
                  <Tooltip />
                  <Bar dataKey="baseline" fill="#94a3b8" name="Baseline" />
                  <Bar dataKey="current" fill="#10b981" name="Current" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Model Risk Manager Dashboard - Validation, compliance, risk
export const MRMDashboard = () => {
  const validationQueue = [
    { model: 'Credit Scoring v2.3', priority: 'High', dueDate: 'Jan 30', status: 'In Review' },
    { model: 'Fraud Detection v4', priority: 'Critical', dueDate: 'Jan 28', status: 'Pending' },
    { model: 'AML Transaction v2', priority: 'Medium', dueDate: 'Feb 5', status: 'In Review' },
    { model: 'Churn Prediction v3', priority: 'Low', dueDate: 'Feb 15', status: 'Scheduled' },
  ];

  const riskDistribution = [
    { name: 'Low', value: 18, color: '#10b981' },
    { name: 'Medium', value: 8, color: '#f59e0b' },
    { name: 'High', value: 3, color: '#ef4444' },
    { name: 'Critical', value: 1, color: '#dc2626' },
  ];

  return (
    <div className="role-dashboard mrm">
      <div className="dashboard-header">
        <h2>Model Risk Manager Dashboard</h2>
        <p>Model Validation & Risk Oversight</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary"><Icon name="shield" size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Models Under Review</div>
            <div className="stat-value">7</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success"><Icon name="check" size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Validated This Month</div>
            <div className="stat-value">12</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning"><Icon name="alert-triangle" size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Findings Open</div>
            <div className="stat-value">4</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon danger"><Icon name="clock" size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Overdue Reviews</div>
            <div className="stat-value">1</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ marginTop: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Validation Queue</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {validationQueue.map((item, i) => (
              <div key={i} className="pipeline-item" style={{ borderRadius: 0, margin: 0 }}>
                <div className={`pipeline-status ${item.priority === 'Critical' ? 'failed' : item.priority === 'High' ? 'running' : 'pending'}`} />
                <div className="pipeline-info">
                  <div className="pipeline-name">{item.model}</div>
                  <div className="pipeline-meta">Due: {item.dueDate} | Priority: {item.priority}</div>
                </div>
                <span className={`status-badge ${item.status === 'In Review' ? 'info' : 'neutral'}`}>
                  <span className="status-dot" />
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Risk Distribution</h3>
            <p className="card-subtitle">Models by risk tier</p>
          </div>
          <div className="card-body">
            <div className="chart-container small">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px' }}>
              {riskDistribution.map((item) => (
                <div key={item.name} style={{ textAlign: 'center' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.color, margin: '0 auto 4px' }} />
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.name}</div>
                  <div style={{ fontWeight: '600' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Operations Dashboard - Pipelines, monitoring, incidents
export const OperationsDashboard = () => {
  const pipelines = [
    { name: 'Credit Risk Daily', status: 'running', lastRun: '2m ago', success: '99.2%' },
    { name: 'Fraud Detection RT', status: 'completed', lastRun: '5m ago', success: '100%' },
    { name: 'AML Batch Process', status: 'running', lastRun: '15m ago', success: '98.5%' },
    { name: 'Model Retrain Weekly', status: 'pending', lastRun: '2d ago', success: '97.8%' },
  ];

  const systemHealth = [
    { time: '00:00', cpu: 45, memory: 62, latency: 120 },
    { time: '04:00', cpu: 38, memory: 58, latency: 95 },
    { time: '08:00', cpu: 72, memory: 75, latency: 180 },
    { time: '12:00', cpu: 85, memory: 82, latency: 210 },
    { time: '16:00', cpu: 78, memory: 79, latency: 175 },
    { time: '20:00', cpu: 55, memory: 65, latency: 130 },
  ];

  return (
    <div className="role-dashboard operations">
      <div className="dashboard-header">
        <h2>Operations Dashboard</h2>
        <p>Pipeline Monitoring & System Health</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary"><Icon name="pipelines" size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Active Pipelines</div>
            <div className="stat-value">24</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success"><Icon name="check" size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Success Rate</div>
            <div className="stat-value">98.7%</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning"><Icon name="alert-triangle" size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Open Incidents</div>
            <div className="stat-value">2</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon danger"><Icon name="clock" size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Avg Latency</div>
            <div className="stat-value">145ms</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ marginTop: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Pipeline Status</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {pipelines.map((p, i) => (
              <div key={i} className="pipeline-item" style={{ borderRadius: 0, margin: 0 }}>
                <div className={`pipeline-status ${p.status}`} />
                <div className="pipeline-info">
                  <div className="pipeline-name">{p.name}</div>
                  <div className="pipeline-meta">Last: {p.lastRun} | Success: {p.success}</div>
                </div>
                <span className={`status-badge ${p.status === 'completed' ? 'success' : p.status === 'running' ? 'info' : 'neutral'}`}>
                  <span className="status-dot" />
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">System Health</h3>
            <p className="card-subtitle">24-hour metrics</p>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={systemHealth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="cpu" stroke="#3b82f6" name="CPU %" />
                  <Line type="monotone" dataKey="memory" stroke="#10b981" name="Memory %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Compliance Dashboard - Regulatory, audit, governance
export const ComplianceDashboard = () => {
  const regulations = [
    { name: 'SR 11-7', status: 'Compliant', coverage: '98%', lastAudit: 'Dec 2024' },
    { name: 'GDPR', status: 'Compliant', coverage: '100%', lastAudit: 'Jan 2025' },
    { name: 'Fair Lending', status: 'Review', coverage: '95%', lastAudit: 'Nov 2024' },
    { name: 'BSA/AML', status: 'Compliant', coverage: '99%', lastAudit: 'Dec 2024' },
  ];

  const complianceTrend = [
    { month: 'Aug', score: 92 },
    { month: 'Sep', score: 94 },
    { month: 'Oct', score: 93 },
    { month: 'Nov', score: 96 },
    { month: 'Dec', score: 97 },
    { month: 'Jan', score: 98 },
  ];

  return (
    <div className="role-dashboard compliance">
      <div className="dashboard-header">
        <h2>Compliance Dashboard</h2>
        <p>Regulatory Compliance & Audit Status</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary"><Icon name="clipboard-check" size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Compliance Score</div>
            <div className="stat-value">98.1%</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success"><Icon name="check" size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Audits Passed</div>
            <div className="stat-value">12/12</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning"><Icon name="file" size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Open Findings</div>
            <div className="stat-value">3</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon danger"><Icon name="calendar" size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Next Audit</div>
            <div className="stat-value">Feb 15</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ marginTop: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Regulatory Status</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {regulations.map((reg, i) => (
              <div key={i} className="pipeline-item" style={{ borderRadius: 0, margin: 0 }}>
                <div className={`pipeline-status ${reg.status === 'Compliant' ? 'completed' : 'running'}`} />
                <div className="pipeline-info">
                  <div className="pipeline-name">{reg.name}</div>
                  <div className="pipeline-meta">Coverage: {reg.coverage} | Last Audit: {reg.lastAudit}</div>
                </div>
                <span className={`status-badge ${reg.status === 'Compliant' ? 'success' : 'warning'}`}>
                  <span className="status-dot" />
                  {reg.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Compliance Trend</h3>
            <p className="card-subtitle">Monthly compliance score</p>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={complianceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} domain={[85, 100]} />
                  <Tooltip />
                  <Area type="monotone" dataKey="score" stroke="#0891b2" fill="#0891b2" fillOpacity={0.3} name="Score %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Fraud Analyst Dashboard - Alerts, investigations, patterns
export const FraudAnalystDashboard = () => {
  const alerts = [
    { id: 'ALT-4521', type: 'High Value', amount: '$45,200', risk: 'High', time: '5m ago' },
    { id: 'ALT-4520', type: 'Velocity', amount: '$12,800', risk: 'Medium', time: '12m ago' },
    { id: 'ALT-4519', type: 'Geographic', amount: '$8,500', risk: 'High', time: '25m ago' },
    { id: 'ALT-4518', type: 'Pattern', amount: '$23,100', risk: 'Critical', time: '38m ago' },
  ];

  const fraudTrend = [
    { day: 'Mon', alerts: 45, confirmed: 12, falsePos: 33 },
    { day: 'Tue', alerts: 52, confirmed: 15, falsePos: 37 },
    { day: 'Wed', alerts: 38, confirmed: 8, falsePos: 30 },
    { day: 'Thu', alerts: 61, confirmed: 18, falsePos: 43 },
    { day: 'Fri', alerts: 55, confirmed: 14, falsePos: 41 },
    { day: 'Sat', alerts: 28, confirmed: 5, falsePos: 23 },
    { day: 'Sun', alerts: 22, confirmed: 4, falsePos: 18 },
  ];

  return (
    <div className="role-dashboard fraud-analyst">
      <div className="dashboard-header">
        <h2>Fraud Analyst Dashboard</h2>
        <p>Real-time Alerts & Investigations</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary"><Icon name="alert-triangle" size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Active Alerts</div>
            <div className="stat-value">47</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success"><Icon name="search" size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">In Investigation</div>
            <div className="stat-value">12</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning"><Icon name="dollar" size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">At Risk Value</div>
            <div className="stat-value">$1.2M</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon danger"><Icon name="zap" size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Detection Rate</div>
            <div className="stat-value">94.8%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ marginTop: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Alerts</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {alerts.map((alert, i) => (
              <div key={i} className="pipeline-item" style={{ borderRadius: 0, margin: 0 }}>
                <div className={`pipeline-status ${alert.risk === 'Critical' ? 'failed' : alert.risk === 'High' ? 'running' : 'pending'}`} />
                <div className="pipeline-info">
                  <div className="pipeline-name">{alert.id} - {alert.type}</div>
                  <div className="pipeline-meta">Amount: {alert.amount} | {alert.time}</div>
                </div>
                <span className={`status-badge ${alert.risk === 'Critical' ? 'danger' : alert.risk === 'High' ? 'warning' : 'info'}`}>
                  <span className="status-dot" />
                  {alert.risk}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Weekly Fraud Activity</h3>
            <p className="card-subtitle">Alerts breakdown</p>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fraudTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="confirmed" stackId="a" fill="#ef4444" name="Confirmed Fraud" />
                  <Bar dataKey="falsePos" stackId="a" fill="#94a3b8" name="False Positive" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Business Analyst Dashboard - Requirements, UAT, reporting
export const BusinessAnalystDashboard = () => {
  const requirements = [
    { name: 'Credit Scoring Enhancement', status: 'In UAT', progress: 85, owner: 'Risk Team' },
    { name: 'Fraud Alert Tuning', status: 'Analysis', progress: 45, owner: 'Fraud Team' },
    { name: 'Churn Model V3', status: 'Requirements', progress: 20, owner: 'Marketing' },
    { name: 'Loan Approval Optimization', status: 'Testing', progress: 70, owner: 'Credit Team' },
  ];

  const projectTimeline = [
    { phase: 'Requirements', planned: 20, actual: 22 },
    { phase: 'Development', planned: 40, actual: 45 },
    { phase: 'Testing', planned: 25, actual: 20 },
    { phase: 'UAT', planned: 15, actual: 13 },
  ];

  return (
    <div className="role-dashboard business-analyst">
      <div className="dashboard-header">
        <h2>Business Analyst Dashboard</h2>
        <p>Requirements & Project Tracking</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary"><Icon name="file" size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Active Projects</div>
            <div className="stat-value">8</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success"><Icon name="check" size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">In UAT</div>
            <div className="stat-value">3</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning"><Icon name="edit" size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Requirements Open</div>
            <div className="stat-value">24</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon danger"><Icon name="trending-up" size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">On Track</div>
            <div className="stat-value">87%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ marginTop: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Active Requirements</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {requirements.map((req, i) => (
              <div key={i} className="pipeline-item" style={{ borderRadius: 0, margin: 0 }}>
                <div className={`pipeline-status ${req.progress > 70 ? 'completed' : req.progress > 40 ? 'running' : 'pending'}`} />
                <div className="pipeline-info">
                  <div className="pipeline-name">{req.name}</div>
                  <div className="pipeline-meta">{req.owner} | {req.progress}% complete</div>
                </div>
                <span className={`status-badge ${req.status === 'In UAT' ? 'success' : req.status === 'Testing' ? 'info' : 'neutral'}`}>
                  <span className="status-dot" />
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Project Phase Analysis</h3>
            <p className="card-subtitle">Planned vs Actual (days)</p>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectTimeline} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" fontSize={12} />
                  <YAxis type="category" dataKey="phase" stroke="#6b7280" fontSize={12} width={100} />
                  <Tooltip />
                  <Bar dataKey="planned" fill="#94a3b8" name="Planned" />
                  <Bar dataKey="actual" fill="#7c3aed" name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export mapping for easy lookup
export const roleDashboards = {
  'executive': ExecutiveDashboard,
  'business-owner': BusinessOwnerDashboard,
  'data-scientist': DataScientistDashboard,
  'mrm': MRMDashboard,
  'operations': OperationsDashboard,
  'compliance': ComplianceDashboard,
  'fraud-analyst': FraudAnalystDashboard,
  'business-analyst': BusinessAnalystDashboard,
};
