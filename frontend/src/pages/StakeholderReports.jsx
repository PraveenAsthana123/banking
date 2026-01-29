import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, RadialBarChart, RadialBar
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Report data by stakeholder
const reportData = {
  executive: {
    title: 'Executive Summary',
    icon: '👔',
    metrics: [
      { label: 'Total ROI', value: '542%', change: '+23%', trend: 'up' },
      { label: 'Cost Savings', value: '$4.2M', change: '+18%', trend: 'up' },
      { label: 'Revenue Impact', value: '$2.8M', change: '+31%', trend: 'up' },
      { label: 'Risk Reduction', value: '35%', change: '+8%', trend: 'up' }
    ],
    kpis: [
      { name: 'Model Accuracy', current: 94.2, target: 95, status: 'on-track' },
      { name: 'Processing Time', current: 3, target: 5, status: 'exceeded', unit: 'sec' },
      { name: 'Customer NPS', current: 60, target: 55, status: 'exceeded' },
      { name: 'Compliance Score', current: 98, target: 95, status: 'exceeded', unit: '%' }
    ]
  },
  riskManager: {
    title: 'Risk Management Report',
    icon: '⚠️',
    metrics: [
      { label: 'Default Rate', value: '2.1%', change: '-35%', trend: 'down' },
      { label: 'Portfolio at Risk', value: '$12.5M', change: '-22%', trend: 'down' },
      { label: 'Model Accuracy', value: '94.2%', change: '+2.4%', trend: 'up' },
      { label: 'False Positives', value: '2.1%', change: '-60%', trend: 'down' }
    ],
    riskDistribution: [
      { category: 'Low Risk', count: 85000, percentage: 68, color: '#10b981' },
      { category: 'Medium Risk', count: 30000, percentage: 24, color: '#f59e0b' },
      { category: 'High Risk', count: 9850, percentage: 8, color: '#ef4444' }
    ]
  },
  operations: {
    title: 'Operations Report',
    icon: '⚙️',
    metrics: [
      { label: 'Daily Volume', value: '125,000', change: '+250x', trend: 'up' },
      { label: 'Avg Processing', value: '3 sec', change: '-99.9%', trend: 'down' },
      { label: 'Auto-Decision Rate', value: '92%', change: '+92%', trend: 'up' },
      { label: 'Error Rate', value: '0.5%', change: '-94%', trend: 'down' }
    ],
    throughput: [
      { hour: '00:00', volume: 3200 },
      { hour: '04:00', volume: 1800 },
      { hour: '08:00', volume: 8500 },
      { hour: '12:00', volume: 12000 },
      { hour: '16:00', volume: 9800 },
      { hour: '20:00', volume: 6500 }
    ]
  },
  compliance: {
    title: 'Compliance Report',
    icon: '📋',
    metrics: [
      { label: 'Compliance Score', value: '98%', change: '+5%', trend: 'up' },
      { label: 'Audit Findings', value: '0', change: '-100%', trend: 'down' },
      { label: 'Explainability', value: '100%', change: 'New', trend: 'up' },
      { label: 'Fair Lending Score', value: '96%', change: '+8%', trend: 'up' }
    ],
    checks: [
      { check: 'Model Documentation', status: 'passed', date: '2025-01-28' },
      { check: 'Bias Testing', status: 'passed', date: '2025-01-27' },
      { check: 'Data Privacy', status: 'passed', date: '2025-01-26' },
      { check: 'Audit Trail', status: 'passed', date: '2025-01-28' },
      { check: 'Regulatory Filing', status: 'passed', date: '2025-01-25' }
    ]
  },
  dataScience: {
    title: 'Data Science Report',
    icon: '🔬',
    metrics: [
      { label: 'Model Version', value: 'v2.3.1', change: 'Latest', trend: 'up' },
      { label: 'Feature Count', value: '45', change: '+5', trend: 'up' },
      { label: 'Training Samples', value: '500K', change: '+100K', trend: 'up' },
      { label: 'Drift Score', value: '0.02', change: 'Stable', trend: 'stable' }
    ],
    modelMetrics: {
      accuracy: 94.2,
      precision: 93.8,
      recall: 94.5,
      f1: 94.1,
      auc: 96.7
    }
  },
  business: {
    title: 'Business Intelligence Report',
    icon: '📊',
    metrics: [
      { label: 'Conversion Rate', value: '78%', change: '+15%', trend: 'up' },
      { label: 'Avg Loan Size', value: '$45,200', change: '+12%', trend: 'up' },
      { label: 'Customer LTV', value: '$8,500', change: '+18%', trend: 'up' },
      { label: 'Cross-sell Rate', value: '23%', change: '+8%', trend: 'up' }
    ],
    segments: [
      { segment: 'Prime', volume: 45, revenue: 52 },
      { segment: 'Near-Prime', volume: 35, revenue: 32 },
      { segment: 'Sub-Prime', volume: 20, revenue: 16 }
    ]
  }
};

function StakeholderReports() {
  const { useCaseId } = useParams();
  const [selectedReport, setSelectedReport] = useState('executive');
  const [dateRange, setDateRange] = useState('month');

  const stakeholders = [
    { id: 'executive', label: 'Executive', icon: '👔' },
    { id: 'riskManager', label: 'Risk Manager', icon: '⚠️' },
    { id: 'operations', label: 'Operations', icon: '⚙️' },
    { id: 'compliance', label: 'Compliance', icon: '📋' },
    { id: 'dataScience', label: 'Data Science', icon: '🔬' },
    { id: 'business', label: 'Business', icon: '📊' }
  ];

  const currentReport = reportData[selectedReport];

  return (
    <div className="stakeholder-reports-page">
      <div className="page-header">
        <div>
          {useCaseId ? (
            <Link to={`/stakeholder-reports`} className="back-link">
              ← Back to Reports Overview
            </Link>
          ) : (
            <Link to="/" className="back-link">
              ← Back to Dashboard
            </Link>
          )}
          <h1>Stakeholder Reports {useCaseId ? `- ${useCaseId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}` : ''}</h1>
          <p>Customized dashboards for each stakeholder</p>
        </div>
        <div className="header-actions">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="form-select"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="btn btn-secondary">Schedule Report</button>
          <button className="btn btn-primary">Export PDF</button>
        </div>
      </div>

      {/* Stakeholder Selector */}
      <div className="stakeholder-selector">
        {stakeholders.map(s => (
          <button
            key={s.id}
            className={`stakeholder-btn ${selectedReport === s.id ? 'active' : ''}`}
            onClick={() => setSelectedReport(s.id)}
          >
            <span className="stakeholder-icon">{s.icon}</span>
            <span className="stakeholder-label">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Report Content */}
      <div className="report-content">
        <div className="report-header">
          <h2>{currentReport.icon} {currentReport.title}</h2>
          <span className="report-date">Generated: January 28, 2025 14:32:15</span>
        </div>

        {/* Key Metrics */}
        <div className="report-metrics-grid">
          {currentReport.metrics.map((metric, idx) => (
            <div key={idx} className="report-metric-card">
              <span className="metric-label">{metric.label}</span>
              <span className="metric-value">{metric.value}</span>
              <span className={`metric-change ${metric.trend}`}>
                {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'} {metric.change}
              </span>
            </div>
          ))}
        </div>

        {/* Report-specific content */}
        {selectedReport === 'executive' && <ExecutiveReport data={currentReport} />}
        {selectedReport === 'riskManager' && <RiskManagerReport data={currentReport} />}
        {selectedReport === 'operations' && <OperationsReport data={currentReport} />}
        {selectedReport === 'compliance' && <ComplianceReport data={currentReport} />}
        {selectedReport === 'dataScience' && <DataScienceReport data={currentReport} />}
        {selectedReport === 'business' && <BusinessReport data={currentReport} />}
      </div>
    </div>
  );
}

function ExecutiveReport({ data }) {
  const trendData = [
    { month: 'Jul', roi: 380, savings: 2.8, revenue: 1.8 },
    { month: 'Aug', roi: 420, savings: 3.2, revenue: 2.1 },
    { month: 'Sep', roi: 460, savings: 3.6, revenue: 2.4 },
    { month: 'Oct', roi: 490, savings: 3.9, revenue: 2.6 },
    { month: 'Nov', roi: 520, savings: 4.0, revenue: 2.7 },
    { month: 'Dec', roi: 542, savings: 4.2, revenue: 2.8 }
  ];

  return (
    <div className="executive-report">
      <div className="charts-row">
        <div className="card" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid var(--success-200)' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '16px 24px' }}>
            <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>KPI Performance vs Target</h3>
          </div>
          <div className="card-body">
            <div className="kpi-list">
              {data.kpis.map((kpi, idx) => (
                <div key={idx} className="kpi-item">
                  <div className="kpi-info">
                    <span className="kpi-name">{kpi.name}</span>
                    <span className="kpi-values">
                      {kpi.current}{kpi.unit || ''} / {kpi.target}{kpi.unit || ''}
                    </span>
                  </div>
                  <div className="kpi-bar-container">
                    <div
                      className={`kpi-bar ${kpi.status}`}
                      style={{ width: `${Math.min((kpi.current / kpi.target) * 100, 100)}%` }}
                    ></div>
                    <div className="kpi-target-line" style={{ left: '100%' }}></div>
                  </div>
                  <span className={`kpi-status ${kpi.status}`}>
                    {kpi.status === 'exceeded' ? '✓ Exceeded' : kpi.status === 'on-track' ? '○ On Track' : '⚠ Below'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '1px solid var(--primary-200)' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', padding: '16px 24px' }}>
            <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>ROI Trend</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr' }}>
              <div style={{ padding: '16px', background: 'white' }}>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Line type="monotone" dataKey="roi" stroke="#3b82f6" strokeWidth={2} dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ padding: '16px', background: 'var(--gray-50)', borderLeft: '1px solid var(--gray-200)' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: 'var(--gray-700)' }}>Explanation</div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '4px' }}>DATA SOURCE</div>
                  <p style={{ fontSize: '11px', color: 'var(--gray-600)', margin: 0 }}>Monthly ROI calculation from AI portfolio impact.</p>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--primary-700)', marginBottom: '4px' }}>KEY INSIGHTS</div>
                  <ul style={{ fontSize: '10px', color: 'var(--gray-700)', margin: 0, paddingLeft: '14px' }}>
                    <li>ROI increased from 380% to 542%</li>
                    <li>43% improvement in 6 months</li>
                    <li>On track to exceed annual target</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)', border: '1px solid #c4b5fd', marginTop: '20px' }}>
        <div className="card-header" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', padding: '16px 24px' }}>
          <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Financial Impact Summary</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr' }}>
            <div style={{ padding: '16px', background: 'white' }}>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => `$${v}M`} />
                  <Tooltip formatter={(v) => `$${v}M`} />
                  <Legend />
                  <Area type="monotone" dataKey="savings" name="Cost Savings" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                  <Area type="monotone" dataKey="revenue" name="Revenue Impact" stackId="1" stroke="#10b981" fill="#10b981" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ padding: '16px', background: 'var(--gray-50)', borderLeft: '1px solid var(--gray-200)' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: 'var(--gray-700)' }}>Chart Explanation</div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#7c3aed', marginBottom: '4px' }}>DATA SOURCE</div>
                <p style={{ fontSize: '11px', color: 'var(--gray-600)', margin: 0 }}>Cumulative financial impact from all AI use cases in production.</p>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#7c3aed', marginBottom: '4px' }}>METHODOLOGY</div>
                <p style={{ fontSize: '11px', color: 'var(--gray-600)', margin: 0 }}>Cost savings + revenue impact tracked monthly against baseline.</p>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)', padding: '10px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#7c3aed', marginBottom: '4px' }}>KEY INSIGHTS</div>
                <ul style={{ fontSize: '10px', color: 'var(--gray-700)', margin: 0, paddingLeft: '14px' }}>
                  <li>Total impact: $7M ($4.2M + $2.8M)</li>
                  <li>Cost savings outpacing revenue</li>
                  <li>Consistent growth trajectory</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RiskManagerReport({ data }) {
  const riskTrend = [
    { month: 'Jul', defaultRate: 3.2, portfolio: 16.2 },
    { month: 'Aug', defaultRate: 2.9, portfolio: 15.1 },
    { month: 'Sep', defaultRate: 2.6, portfolio: 14.2 },
    { month: 'Oct', defaultRate: 2.4, portfolio: 13.5 },
    { month: 'Nov', defaultRate: 2.2, portfolio: 12.8 },
    { month: 'Dec', defaultRate: 2.1, portfolio: 12.5 }
  ];

  return (
    <div className="risk-manager-report">
      <div className="charts-row">
        <div className="card" style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)', border: '1px solid #fca5a5' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', padding: '16px 24px' }}>
            <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Risk Distribution</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr' }}>
              <div style={{ padding: '16px', background: 'white' }}>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={data.riskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      dataKey="count"
                      label={({ category, percentage }) => `${category}: ${percentage}%`}
                    >
                      {data.riskDistribution.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ padding: '16px', background: 'var(--gray-50)', borderLeft: '1px solid var(--gray-200)' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: 'var(--gray-700)' }}>Explanation</div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#dc2626', marginBottom: '4px' }}>DATA SOURCE</div>
                  <p style={{ fontSize: '11px', color: 'var(--gray-600)', margin: 0 }}>Portfolio risk classification from credit scoring model.</p>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #fef2f2, #fecaca)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#dc2626', marginBottom: '4px' }}>KEY INSIGHTS</div>
                  <ul style={{ fontSize: '10px', color: 'var(--gray-700)', margin: 0, paddingLeft: '14px' }}>
                    <li>68% low risk - healthy portfolio</li>
                    <li>Only 8% high risk exposure</li>
                    <li>Improved from 12% last quarter</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: '1px solid #fcd34d' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', padding: '16px 24px' }}>
            <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Default Rate Trend</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr' }}>
              <div style={{ padding: '16px', background: 'white' }}>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={riskTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Line type="monotone" dataKey="defaultRate" name="Default Rate" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ padding: '16px', background: 'var(--gray-50)', borderLeft: '1px solid var(--gray-200)' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: 'var(--gray-700)' }}>Explanation</div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#d97706', marginBottom: '4px' }}>METHODOLOGY</div>
                  <p style={{ fontSize: '11px', color: 'var(--gray-600)', margin: 0 }}>Monthly default rate across loan portfolio with AI-enhanced underwriting.</p>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#b45309', marginBottom: '4px' }}>KEY INSIGHTS</div>
                  <ul style={{ fontSize: '10px', color: 'var(--gray-700)', margin: 0, paddingLeft: '14px' }}>
                    <li>Default rate down from 3.2% to 2.1%</li>
                    <li>35% improvement with AI</li>
                    <li>Below industry average of 3.5%</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="chart-card full-width">
        <h3>Risk Alerts</h3>
        <div className="alerts-table">
          <table>
            <thead>
              <tr>
                <th>Alert</th>
                <th>Severity</th>
                <th>Count</th>
                <th>Trend</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>High Concentration - Sector</td>
                <td><span className="severity warning">Medium</span></td>
                <td>3</td>
                <td>↓ Decreasing</td>
                <td><button className="btn btn-sm">Review</button></td>
              </tr>
              <tr>
                <td>Model Drift Detected</td>
                <td><span className="severity info">Low</span></td>
                <td>1</td>
                <td>→ Stable</td>
                <td><button className="btn btn-sm">Monitor</button></td>
              </tr>
              <tr>
                <td>Threshold Breach - Region</td>
                <td><span className="severity info">Low</span></td>
                <td>2</td>
                <td>↓ Decreasing</td>
                <td><button className="btn btn-sm">Review</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OperationsReport({ data }) {
  return (
    <div className="operations-report">
      {/* Row 1: Hourly Processing Volume */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)', border: '1px solid var(--primary-200)' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', padding: '16px 24px' }}>
            <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Hourly Processing Volume</h3>
          </div>
          <div className="card-body" style={{ padding: '20px', background: 'white' }}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.throughput}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
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
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Real-time processing metrics from production pipeline monitoring.</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '6px' }}>METHODOLOGY</div>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Aggregated transaction volume by hour over last 24 hours.</p>
            </div>
            <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>KEY INSIGHTS</div>
              <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                <li>Peak load at 12:00 (12K transactions)</li>
                <li>Low traffic overnight (1.8K)</li>
                <li>System handles 125K/day capacity</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Processing Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid var(--success-200)' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '16px 24px' }}>
            <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Processing Status</h3>
          </div>
          <div className="card-body" style={{ padding: '20px', background: 'white' }}>
            <div className="status-breakdown">
              <div className="status-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--success-50)', borderRadius: '8px', marginBottom: '12px' }}>
                <span className="status-dot success" style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--success-500)' }}></span>
                <span className="status-label" style={{ flex: 1 }}>Auto-Approved</span>
                <span className="status-value" style={{ fontWeight: '700', fontSize: '18px', color: 'var(--success-600)' }}>68%</span>
              </div>
              <div className="status-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--warning-50)', borderRadius: '8px', marginBottom: '12px' }}>
                <span className="status-dot warning" style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--warning-500)' }}></span>
                <span className="status-label" style={{ flex: 1 }}>Sent to Review</span>
                <span className="status-value" style={{ fontWeight: '700', fontSize: '18px', color: 'var(--warning-600)' }}>24%</span>
              </div>
              <div className="status-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--danger-50)', borderRadius: '8px' }}>
                <span className="status-dot danger" style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--danger-500)' }}></span>
                <span className="status-label" style={{ flex: 1 }}>Auto-Declined</span>
                <span className="status-value" style={{ fontWeight: '700', fontSize: '18px', color: 'var(--danger-600)' }}>8%</span>
              </div>
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
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Decision outcomes from AI model classification pipeline.</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '6px' }}>METHODOLOGY</div>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Percentage of transactions by final decision status.</p>
            </div>
            <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>KEY INSIGHTS</div>
              <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                <li>92% auto-decisioned (68% + 24%)</li>
                <li>Only 8% auto-declined (high risk)</li>
                <li>24% require human review</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="chart-card full-width">
        <h3>SLA Performance</h3>
        <div className="sla-grid">
          <div className="sla-item met">
            <span className="sla-name">Response Time</span>
            <span className="sla-target">Target: &lt;5 sec</span>
            <span className="sla-actual">Actual: 3 sec</span>
            <span className="sla-status">✓ Met</span>
          </div>
          <div className="sla-item met">
            <span className="sla-name">Availability</span>
            <span className="sla-target">Target: 99.9%</span>
            <span className="sla-actual">Actual: 99.98%</span>
            <span className="sla-status">✓ Met</span>
          </div>
          <div className="sla-item met">
            <span className="sla-name">Error Rate</span>
            <span className="sla-target">Target: &lt;1%</span>
            <span className="sla-actual">Actual: 0.5%</span>
            <span className="sla-status">✓ Met</span>
          </div>
          <div className="sla-item met">
            <span className="sla-name">Throughput</span>
            <span className="sla-target">Target: 100K/day</span>
            <span className="sla-actual">Actual: 125K/day</span>
            <span className="sla-status">✓ Exceeded</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComplianceReport({ data }) {
  return (
    <div className="compliance-report">
      {/* Row 1: Compliance Checks */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid var(--success-200)' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '16px 24px' }}>
            <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Compliance Checks</h3>
          </div>
          <div className="card-body" style={{ padding: '16px', background: 'white' }}>
            <div className="compliance-checks">
              {data.checks.map((check, idx) => (
                <div key={idx} className={`check-item ${check.status}`} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  background: check.status === 'passed' ? 'var(--success-50)' : 'var(--warning-50)',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  gap: '12px'
                }}>
                  <span className="check-icon" style={{ fontSize: '18px', color: check.status === 'passed' ? 'var(--success-600)' : 'var(--warning-600)' }}>{check.status === 'passed' ? '✓' : '⚠'}</span>
                  <span className="check-name" style={{ flex: 1, fontWeight: '500' }}>{check.check}</span>
                  <span className="check-date" style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{check.date}</span>
                  <span className={`check-status ${check.status}`} style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '600',
                    background: check.status === 'passed' ? 'var(--success-100)' : 'var(--warning-100)',
                    color: check.status === 'passed' ? 'var(--success-700)' : 'var(--warning-700)'
                  }}>
                    {check.status.toUpperCase()}
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
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Automated compliance validation checks from governance system.</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '6px' }}>METHODOLOGY</div>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Real-time status of regulatory and governance requirements.</p>
            </div>
            <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>KEY INSIGHTS</div>
              <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                <li>All 5 compliance checks passed</li>
                <li>100% regulatory compliance</li>
                <li>Last audit: zero findings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Governance Score */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)', border: '1px solid var(--primary-200)' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', padding: '16px 24px' }}>
            <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Governance Score</h3>
          </div>
          <div className="card-body" style={{ padding: '20px', background: 'white' }}>
            <div className="governance-gauge" style={{ position: 'relative' }}>
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="100%"
                  data={[{ name: 'Score', value: 98 }]}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar dataKey="value" fill="#10b981" />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="gauge-label" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -30%)', textAlign: 'center' }}>
                <span className="gauge-value" style={{ fontSize: '36px', fontWeight: '700', color: 'var(--success-600)', display: 'block' }}>98%</span>
                <span className="gauge-text" style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Governance Score</span>
              </div>
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
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Composite score from model governance framework assessment.</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '6px' }}>METHODOLOGY</div>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Weighted average of documentation, bias testing, explainability, and audit compliance.</p>
            </div>
            <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>KEY INSIGHTS</div>
              <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                <li>98% score (target: 95%)</li>
                <li>3% above minimum threshold</li>
                <li>Improving trend since Q3</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="chart-card full-width">
        <h3>Audit Trail Summary</h3>
        <div className="audit-summary">
          <div className="audit-stat">
            <span className="stat-value">124,850</span>
            <span className="stat-label">Decisions Logged</span>
          </div>
          <div className="audit-stat">
            <span className="stat-value">100%</span>
            <span className="stat-label">Explainability Coverage</span>
          </div>
          <div className="audit-stat">
            <span className="stat-value">0</span>
            <span className="stat-label">Compliance Violations</span>
          </div>
          <div className="audit-stat">
            <span className="stat-value">45</span>
            <span className="stat-label">Days Since Last Audit</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DataScienceReport({ data }) {
  const featureImportance = [
    { feature: 'Credit Score', importance: 0.25 },
    { feature: 'DTI Ratio', importance: 0.18 },
    { feature: 'Income', importance: 0.15 },
    { feature: 'Employment Years', importance: 0.12 },
    { feature: 'Loan Amount', importance: 0.10 },
    { feature: 'Age', importance: 0.08 }
  ];

  return (
    <div className="data-science-report">
      {/* Row 1: Model Performance Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)', border: '1px solid var(--primary-200)' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', padding: '16px 24px' }}>
            <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Model Performance Metrics</h3>
          </div>
          <div className="card-body" style={{ padding: '20px', background: 'white' }}>
            <div className="metrics-display">
              {Object.entries(data.modelMetrics).map(([key, value]) => (
                <div key={key} className="metric-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span className="metric-name" style={{ width: '80px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>{key}</span>
                  <div className="metric-bar-container" style={{ flex: 1, height: '20px', background: 'var(--gray-100)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div className="metric-bar" style={{ width: `${value}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)', borderRadius: '10px' }}></div>
                  </div>
                  <span className="metric-value" style={{ width: '50px', fontWeight: '700', color: 'var(--primary-600)' }}>{value}%</span>
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
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '6px' }}>DATA SOURCE</div>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Model evaluation on holdout test set with 10K samples.</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '6px' }}>METRICS</div>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Standard ML metrics: accuracy, precision, recall, F1, AUC-ROC.</p>
            </div>
            <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>KEY INSIGHTS</div>
              <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                <li>All metrics above 93% threshold</li>
                <li>AUC (96.7%) indicates excellent discrimination</li>
                <li>Balanced precision/recall ratio</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Feature Importance */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)', border: '1px solid #c4b5fd' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', padding: '16px 24px' }}>
            <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Feature Importance (SHAP)</h3>
          </div>
          <div className="card-body" style={{ padding: '20px', background: 'white' }}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={featureImportance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <YAxis type="category" dataKey="feature" width={120} />
                <Tooltip formatter={(v) => `${(v * 100).toFixed(1)}%`} />
                <Bar dataKey="importance" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
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
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#7c3aed', marginBottom: '6px' }}>DATA SOURCE</div>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>SHAP values calculated on 5K sample predictions.</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#7c3aed', marginBottom: '6px' }}>METHODOLOGY</div>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Mean absolute SHAP value per feature showing global importance.</p>
            </div>
            <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>KEY INSIGHTS</div>
              <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                <li>Credit Score is top predictor (25%)</li>
                <li>Top 3 features explain 58% of predictions</li>
                <li>Age has minimal impact (8%)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="chart-card full-width">
        <h3>Model Health Status</h3>
        <div className="health-grid">
          <div className="health-item healthy">
            <span className="health-icon">✓</span>
            <span className="health-name">Data Drift</span>
            <span className="health-value">PSI: 0.02</span>
            <span className="health-status">Healthy</span>
          </div>
          <div className="health-item healthy">
            <span className="health-icon">✓</span>
            <span className="health-name">Concept Drift</span>
            <span className="health-value">Δ: 0.5%</span>
            <span className="health-status">Healthy</span>
          </div>
          <div className="health-item healthy">
            <span className="health-icon">✓</span>
            <span className="health-name">Feature Quality</span>
            <span className="health-value">Score: 98</span>
            <span className="health-status">Healthy</span>
          </div>
          <div className="health-item healthy">
            <span className="health-icon">✓</span>
            <span className="health-name">Prediction Distribution</span>
            <span className="health-value">KS: 0.03</span>
            <span className="health-status">Healthy</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BusinessReport({ data }) {
  const conversionFunnel = [
    { stage: 'Applications', count: 150000, percentage: 100 },
    { stage: 'Pre-qualified', count: 125000, percentage: 83 },
    { stage: 'Approved', count: 97500, percentage: 78 },
    { stage: 'Funded', count: 87750, percentage: 90 }
  ];

  return (
    <div className="business-report">
      {/* Row 1: Conversion Funnel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)', border: '1px solid var(--primary-200)' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', padding: '16px 24px' }}>
            <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Conversion Funnel</h3>
          </div>
          <div className="card-body" style={{ padding: '20px', background: 'white' }}>
            <div className="funnel-chart">
              {conversionFunnel.map((stage, idx) => (
                <div key={idx} className="funnel-stage" style={{ marginBottom: '12px' }}>
                  <div
                    className="funnel-bar"
                    style={{
                      width: `${stage.percentage}%`,
                      background: `linear-gradient(90deg, ${idx === 0 ? '#3b82f6' : idx === 1 ? '#60a5fa' : idx === 2 ? '#93c5fd' : '#10b981'}, ${idx === 0 ? '#2563eb' : idx === 1 ? '#3b82f6' : idx === 2 ? '#60a5fa' : '#059669'})`,
                      padding: '12px 16px',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      color: 'white'
                    }}
                  >
                    <span className="funnel-label" style={{ fontWeight: '600' }}>{stage.stage}</span>
                    <span className="funnel-count" style={{ fontWeight: '700' }}>{stage.count.toLocaleString()}</span>
                  </div>
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
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '6px' }}>DATA SOURCE</div>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Application tracking system with complete customer journey data.</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '6px' }}>METHODOLOGY</div>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Stage-by-stage conversion rates from application to funding.</p>
            </div>
            <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>KEY INSIGHTS</div>
              <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                <li>83% pre-qualification rate</li>
                <li>78% approval rate (high quality)</li>
                <li>58% overall conversion (150K to 87.7K)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Revenue by Segment */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid var(--success-200)' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '16px 24px' }}>
            <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Revenue by Segment</h3>
          </div>
          <div className="card-body" style={{ padding: '20px', background: 'white' }}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.segments}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="revenue"
                  label={({ segment, revenue }) => `${segment}: ${revenue}%`}
                >
                  {data.segments.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
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
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Revenue attribution by customer risk segment classification.</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '6px' }}>METHODOLOGY</div>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Percentage of total revenue generated by each credit tier.</p>
            </div>
            <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>KEY INSIGHTS</div>
              <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                <li>Prime segment: 52% of revenue</li>
                <li>Near-Prime: profitable at 32%</li>
                <li>Sub-Prime: limited but strategic</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="chart-card full-width">
        <h3>Product Performance</h3>
        <div className="product-table">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Volume</th>
                <th>Approval Rate</th>
                <th>Avg Amount</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Personal Loans</td>
                <td>45,000</td>
                <td>82%</td>
                <td>$25,000</td>
                <td>$2.1M</td>
              </tr>
              <tr>
                <td>Auto Loans</td>
                <td>32,000</td>
                <td>78%</td>
                <td>$35,000</td>
                <td>$1.8M</td>
              </tr>
              <tr>
                <td>Home Equity</td>
                <td>18,000</td>
                <td>72%</td>
                <td>$75,000</td>
                <td>$1.5M</td>
              </tr>
              <tr>
                <td>Credit Cards</td>
                <td>29,850</td>
                <td>85%</td>
                <td>$8,000</td>
                <td>$0.9M</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StakeholderReports;
