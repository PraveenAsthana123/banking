import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Icon } from '../components/Icons';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { departments } from '../data/departments';

// AI Impact data for all use cases
const impactData = {
  summary: {
    totalROI: 487,
    costSavings: 121.2,
    revenueImpact: 145.1,
    productivityGain: 55,
    customerNPS: 42,
    employeeNPS: 38
  },
  departments: [
    { name: 'Fraud Detection', costSavings: 45.2, revenue: 15.8, productivity: 78, total: 61.0 },
    { name: 'Credit Analysis', costSavings: 18.3, revenue: 24.5, productivity: 62, total: 42.8 },
    { name: 'Customer Analytics', costSavings: 8.7, revenue: 32.1, productivity: 55, total: 40.8 },
    { name: 'Investment Banking', costSavings: 5.1, revenue: 28.3, productivity: 38, total: 33.4 },
    { name: 'Retail Banking', costSavings: 9.2, revenue: 18.6, productivity: 51, total: 27.8 },
    { name: 'Risk Management', costSavings: 12.5, revenue: 8.2, productivity: 45, total: 20.7 },
    { name: 'Compliance', costSavings: 15.4, revenue: 5.2, productivity: 68, total: 20.6 },
    { name: 'Treasury', costSavings: 6.8, revenue: 12.4, productivity: 42, total: 19.2 }
  ],
  useCases: {
    'credit_risk_scoring': {
      name: 'Credit Risk Scoring',
      roi: 542,
      costSavings: { total: 4.2, breakdown: [
        { name: 'Manual Review Reduction', value: 2.1 },
        { name: 'FTE Reallocation', value: 1.5 },
        { name: 'Error Reduction', value: 0.6 }
      ]},
      revenueImpact: { total: 2.8, breakdown: [
        { name: 'Faster Approvals', value: 1.5 },
        { name: 'Better Risk Selection', value: 0.8 },
        { name: 'Cross-sell Opportunities', value: 0.5 }
      ]},
      productivity: {
        decisionTimeBefore: '2-3 days',
        decisionTimeAfter: '3 seconds',
        improvement: 99.99,
        throughputBefore: 500,
        throughputAfter: 125000
      },
      satisfaction: {
        customerNPSBefore: 18,
        customerNPSAfter: 60,
        customerCSATBefore: 72,
        customerCSATAfter: 89,
        employeeNPSBefore: 12,
        employeeNPSAfter: 50,
        employeeSatBefore: 65,
        employeeSatAfter: 82
      },
      valueProposition: {
        before: [
          'Manual credit assessment',
          '2-3 day decision time',
          'Inconsistent criteria',
          'Limited capacity',
          'High error rate',
          'No explainability'
        ],
        after: [
          'Instant risk scoring',
          'Real-time decisions',
          'Standardized, fair evaluation',
          'Unlimited scalability',
          '94.2% accuracy',
          'Full SHAP explanations'
        ],
        differentiators: [
          'Real-time decisioning enables instant customer gratification',
          'Explainable AI ensures regulatory compliance',
          'Continuous learning improves accuracy over time',
          '24/7 availability with consistent quality'
        ]
      }
    },
    'transaction_fraud': {
      name: 'Transaction Fraud Detection',
      roi: 725,
      costSavings: { total: 18.5, breakdown: [
        { name: 'Fraud Losses Prevented', value: 15.2 },
        { name: 'Investigation Costs', value: 3.3 }
      ]},
      revenueImpact: { total: 5.2, breakdown: [
        { name: 'Reduced False Positives', value: 3.8 },
        { name: 'Customer Retention', value: 1.4 }
      ]},
      productivity: {
        decisionTimeBefore: '15 min/case',
        decisionTimeAfter: '2 min/case',
        improvement: 87,
        throughputBefore: 1000,
        throughputAfter: 2500000
      },
      satisfaction: {
        customerNPSBefore: 25,
        customerNPSAfter: 72,
        customerCSATBefore: 68,
        customerCSATAfter: 92,
        employeeNPSBefore: 15,
        employeeNPSAfter: 55,
        employeeSatBefore: 60,
        employeeSatAfter: 85
      },
      valueProposition: {
        before: [
          'Rule-based detection',
          'High false positive rate (8%)',
          'Delayed fraud identification',
          'Limited pattern recognition',
          'Manual review bottleneck'
        ],
        after: [
          'ML-based real-time detection',
          'Low false positive rate (2.1%)',
          'Sub-50ms fraud detection',
          'Advanced pattern recognition',
          '92% auto-decisioning'
        ],
        differentiators: [
          'Real-time fraud detection in <50ms',
          '97.3% accuracy reduces both fraud and false positives',
          'Scalable to millions of transactions per day',
          'Continuous learning adapts to new fraud patterns'
        ]
      }
    },
    'loan_approval': {
      name: 'Loan Approval',
      roi: 625,
      costSavings: { total: 5.8, breakdown: [
        { name: 'Underwriter FTEs', value: 4.2 },
        { name: 'Processing Costs', value: 0.8 },
        { name: 'Error/Re-work', value: 0.8 }
      ]},
      revenueImpact: { total: 8.5, breakdown: [
        { name: 'Faster Approvals', value: 4.5 },
        { name: 'Better Pricing', value: 2.5 },
        { name: 'Cross-sell', value: 1.5 }
      ]},
      productivity: {
        decisionTimeBefore: '3-5 days',
        decisionTimeAfter: '5 seconds',
        improvement: 99.99,
        throughputBefore: 800,
        throughputAfter: 45000
      },
      satisfaction: {
        customerNPSBefore: 15,
        customerNPSAfter: 62,
        customerCSATBefore: 65,
        customerCSATAfter: 90,
        employeeNPSBefore: 10,
        employeeNPSAfter: 52,
        employeeSatBefore: 58,
        employeeSatAfter: 84
      },
      valueProposition: {
        before: [
          'Manual underwriting process',
          '3-5 day decision time',
          '35% application abandonment',
          'Inconsistent decisions',
          'Limited capacity'
        ],
        after: [
          'Automated AI underwriting',
          '5-second decisions',
          '12% abandonment rate',
          'Consistent, explainable decisions',
          '56x throughput increase'
        ],
        differentiators: [
          'Instant loan decisions increase conversion by 15%',
          'Consistent underwriting standards across all channels',
          'Reduced abandonment from faster processing',
          'Staff focus on complex cases and customer relationships'
        ]
      }
    }
  }
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function AIImpact() {
  const { useCaseId } = useParams();
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [timeRange, setTimeRange] = useState('year');

  // Get use case data if viewing specific use case
  // Normalize useCaseId: convert hyphens to underscores to match data keys
  const normalizedId = useCaseId ? useCaseId.replace(/-/g, '_') : null;
  const useCaseData = normalizedId ? impactData.useCases[normalizedId] : null;

  if (useCaseData) {
    return <UseCaseImpactView data={useCaseData} useCaseId={useCaseId} />;
  }

  return (
    <div className="ai-impact-dashboard">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/" className="btn btn-icon btn-secondary">
            <Icon name="arrow-left" size={18} />
          </Link>
          <div>
            <h1>AI Impact Dashboard</h1>
            <p>Comprehensive view of AI value across all use cases</p>
          </div>
        </div>
        <div className="header-actions">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="form-select"
          >
            <option value="all">All Departments</option>
            {Object.keys(departments).map(key => (
              <option key={key} value={key}>{departments[key].name}</option>
            ))}
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="form-select"
          >
            <option value="year">This Year</option>
            <option value="quarter">This Quarter</option>
            <option value="month">This Month</option>
          </select>
          <button className="btn btn-primary">Export Report</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="impact-summary-cards">
        <div className="impact-card highlight">
          <div className="impact-card-icon">📊</div>
          <div className="impact-card-content">
            <span className="impact-value">{impactData.summary.totalROI}%</span>
            <span className="impact-label">Total ROI</span>
            <span className="impact-change positive">↑ 23% vs last year</span>
          </div>
        </div>
        <div className="impact-card">
          <div className="impact-card-icon">💰</div>
          <div className="impact-card-content">
            <span className="impact-value">${impactData.summary.costSavings}M</span>
            <span className="impact-label">Cost Savings</span>
            <span className="impact-change positive">↑ 18% vs last year</span>
          </div>
        </div>
        <div className="impact-card">
          <div className="impact-card-icon">📈</div>
          <div className="impact-card-content">
            <span className="impact-value">${impactData.summary.revenueImpact}M</span>
            <span className="impact-label">Revenue Impact</span>
            <span className="impact-change positive">↑ 31% vs last year</span>
          </div>
        </div>
        <div className="impact-card">
          <div className="impact-card-icon">⚡</div>
          <div className="impact-card-content">
            <span className="impact-value">{impactData.summary.productivityGain}%</span>
            <span className="impact-label">Productivity Gain</span>
            <span className="impact-change positive">↑ 12% vs last year</span>
          </div>
        </div>
      </div>

      {/* Department Impact Chart */}
      <div className="impact-charts-row">
        <div className="card" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '1px solid var(--primary-200)' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', padding: '16px 24px' }}>
            <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Impact by Department</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr' }}>
              <div style={{ padding: '20px', background: 'white' }}>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={impactData.departments} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v) => `$${v}M`} />
                    <YAxis type="category" dataKey="name" width={140} />
                    <Tooltip formatter={(v) => `$${v}M`} />
                    <Legend />
                    <Bar dataKey="costSavings" name="Cost Savings" fill="#3b82f6" stackId="a" />
                    <Bar dataKey="revenue" name="Revenue Impact" fill="#10b981" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ padding: '20px', background: 'var(--gray-50)', borderLeft: '1px solid var(--gray-200)' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--gray-700)' }}>Chart Explanation</div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '4px' }}>DATA SOURCE</div>
                  <p style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0 }}>Financial impact data aggregated from all AI/ML use cases across 8 banking departments.</p>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '4px' }}>METHODOLOGY</div>
                  <p style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0 }}>Cost savings calculated from operational efficiency gains. Revenue impact from improved decision accuracy and faster processing.</p>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', padding: '12px', borderRadius: '8px', border: '1px solid var(--primary-200)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--primary-700)', marginBottom: '6px' }}>KEY INSIGHTS</div>
                  <ul style={{ fontSize: '11px', color: 'var(--gray-700)', margin: 0, paddingLeft: '14px' }}>
                    <li>Fraud Detection leads with $61M total impact</li>
                    <li>Credit Analysis shows highest revenue growth</li>
                    <li>Compliance achieved 73% cost reduction</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Satisfaction Scores */}
      <div className="impact-charts-row">
        <div className="chart-card">
          <h3>Customer Satisfaction</h3>
          <div className="satisfaction-display">
            <div className="satisfaction-score">
              <span className="score-value">+{impactData.summary.customerNPS}</span>
              <span className="score-label">NPS Points</span>
            </div>
            <div className="satisfaction-comparison">
              <div className="comparison-item">
                <span className="label">Before AI</span>
                <span className="value">+18</span>
              </div>
              <div className="comparison-arrow">→</div>
              <div className="comparison-item">
                <span className="label">After AI</span>
                <span className="value highlight">+60</span>
              </div>
            </div>
            <div className="improvement-badge">233% Improvement</div>
          </div>
        </div>
        <div className="chart-card">
          <h3>Employee Satisfaction</h3>
          <div className="satisfaction-display">
            <div className="satisfaction-score">
              <span className="score-value">+{impactData.summary.employeeNPS}</span>
              <span className="score-label">eNPS Points</span>
            </div>
            <div className="satisfaction-comparison">
              <div className="comparison-item">
                <span className="label">Before AI</span>
                <span className="value">+12</span>
              </div>
              <div className="comparison-arrow">→</div>
              <div className="comparison-item">
                <span className="label">After AI</span>
                <span className="value highlight">+50</span>
              </div>
            </div>
            <div className="improvement-badge">317% Improvement</div>
          </div>
        </div>
      </div>

      {/* Use Case Impact List */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid var(--success-200)', marginTop: '24px' }}>
        <div className="card-header" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '16px 24px' }}>
          <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Top Performing Use Cases by ROI</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                <th style={{ padding: '14px 12px', fontWeight: '700', color: 'var(--gray-700)', borderBottom: '2px solid var(--success-300)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Use Case</th>
                <th style={{ padding: '14px 12px', fontWeight: '700', color: 'var(--gray-700)', borderBottom: '2px solid var(--success-300)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Department</th>
                <th style={{ padding: '14px 12px', fontWeight: '700', color: 'var(--gray-700)', borderBottom: '2px solid var(--success-300)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cost Savings</th>
                <th style={{ padding: '14px 12px', fontWeight: '700', color: 'var(--gray-700)', borderBottom: '2px solid var(--success-300)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Revenue</th>
                <th style={{ padding: '14px 12px', fontWeight: '700', color: 'var(--gray-700)', borderBottom: '2px solid var(--success-300)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Productivity</th>
                <th style={{ padding: '14px 12px', fontWeight: '700', color: 'var(--gray-700)', borderBottom: '2px solid var(--success-300)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ROI</th>
                <th style={{ padding: '14px 12px', fontWeight: '700', color: 'var(--gray-700)', borderBottom: '2px solid var(--success-300)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Transaction Fraud Detection</td>
                <td>Fraud Detection</td>
                <td>$18.5M</td>
                <td>$5.2M</td>
                <td>+85%</td>
                <td><span className="roi-badge high">725%</span></td>
                <td><Link to="/ai-impact/transaction_fraud" className="btn btn-sm">View Details</Link></td>
              </tr>
              <tr>
                <td>Card Fraud Detection</td>
                <td>Fraud Detection</td>
                <td>$12.8M</td>
                <td>$4.2M</td>
                <td>+82%</td>
                <td><span className="roi-badge high">685%</span></td>
                <td><Link to="/ai-impact/card_fraud" className="btn btn-sm">View Details</Link></td>
              </tr>
              <tr>
                <td>Loan Approval</td>
                <td>Credit Analysis</td>
                <td>$5.8M</td>
                <td>$8.5M</td>
                <td>+72%</td>
                <td><span className="roi-badge high">625%</span></td>
                <td><Link to="/ai-impact/loan_approval" className="btn btn-sm">View Details</Link></td>
              </tr>
              <tr>
                <td>Sanctions Screening</td>
                <td>Compliance</td>
                <td>$5.2M</td>
                <td>$1.5M</td>
                <td>+82%</td>
                <td><span className="roi-badge high">625%</span></td>
                <td><Link to="/ai-impact/sanctions_screening" className="btn btn-sm">View Details</Link></td>
              </tr>
              <tr>
                <td>Churn Prediction</td>
                <td>Customer Analytics</td>
                <td>$2.5M</td>
                <td>$8.5M</td>
                <td>+58%</td>
                <td><span className="roi-badge high">625%</span></td>
                <td><Link to="/ai-impact/churn_prediction" className="btn btn-sm">View Details</Link></td>
              </tr>
              <tr style={{ background: 'white' }}>
                <td style={{ padding: '12px' }}>Credit Risk Scoring</td>
                <td style={{ padding: '12px' }}>Risk Management</td>
                <td style={{ padding: '12px' }}>$4.2M</td>
                <td style={{ padding: '12px' }}>$2.8M</td>
                <td style={{ padding: '12px' }}>+65%</td>
                <td style={{ padding: '12px' }}><span className="roi-badge medium">542%</span></td>
                <td style={{ padding: '12px' }}><Link to="/ai-impact/credit_risk_scoring" className="btn btn-sm">View Details</Link></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UseCaseImpactView({ data, useCaseId }) {
  const trendData = [
    { month: 'Jan', costSavings: 0.3, revenue: 0.2 },
    { month: 'Feb', costSavings: 0.5, revenue: 0.3 },
    { month: 'Mar', costSavings: 0.8, revenue: 0.5 },
    { month: 'Apr', costSavings: 1.2, revenue: 0.8 },
    { month: 'May', costSavings: 1.8, revenue: 1.2 },
    { month: 'Jun', costSavings: 2.3, revenue: 1.5 },
    { month: 'Jul', costSavings: 2.8, revenue: 1.8 },
    { month: 'Aug', costSavings: 3.2, revenue: 2.1 },
    { month: 'Sep', costSavings: 3.5, revenue: 2.4 },
    { month: 'Oct', costSavings: 3.8, revenue: 2.6 },
    { month: 'Nov', costSavings: 4.0, revenue: 2.7 },
    { month: 'Dec', costSavings: 4.2, revenue: 2.8 }
  ];

  return (
    <div className="use-case-impact-detail">
      <div className="page-header">
        <div>
          <Link to="/ai-impact" className="back-link">← Back to Dashboard</Link>
          <h1>{data.name}</h1>
          <p>AI Impact Analysis</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary">Export PDF</button>
          <button className="btn btn-primary">Share Report</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="impact-summary-cards">
        <div className="impact-card highlight">
          <div className="impact-card-content">
            <span className="impact-value">{data.roi}%</span>
            <span className="impact-label">ROI</span>
          </div>
        </div>
        <div className="impact-card">
          <div className="impact-card-content">
            <span className="impact-value">${data.costSavings.total}M</span>
            <span className="impact-label">Cost Savings</span>
          </div>
        </div>
        <div className="impact-card">
          <div className="impact-card-content">
            <span className="impact-value">${data.revenueImpact.total}M</span>
            <span className="impact-label">Revenue Impact</span>
          </div>
        </div>
        <div className="impact-card">
          <div className="impact-card-content">
            <span className="impact-value">+{data.productivity.improvement}%</span>
            <span className="impact-label">Productivity</span>
          </div>
        </div>
      </div>

      {/* Cost Savings & Revenue Breakdown */}
      <div className="impact-charts-row">
        <div className="chart-card">
          <h3>💰 Cost Savings Breakdown</h3>
          <div className="breakdown-list">
            {data.costSavings.breakdown.map((item, idx) => (
              <div key={idx} className="breakdown-item">
                <span className="breakdown-name">{item.name}</span>
                <div className="breakdown-bar-container">
                  <div
                    className="breakdown-bar"
                    style={{ width: `${(item.value / data.costSavings.total) * 100}%` }}
                  ></div>
                </div>
                <span className="breakdown-value">${item.value}M</span>
              </div>
            ))}
            <div className="breakdown-total">
              <span>TOTAL</span>
              <span>${data.costSavings.total}M</span>
            </div>
          </div>
        </div>
        <div className="chart-card">
          <h3>📈 Revenue Impact Breakdown</h3>
          <div className="breakdown-list">
            {data.revenueImpact.breakdown.map((item, idx) => (
              <div key={idx} className="breakdown-item">
                <span className="breakdown-name">{item.name}</span>
                <div className="breakdown-bar-container">
                  <div
                    className="breakdown-bar revenue"
                    style={{ width: `${(item.value / data.revenueImpact.total) * 100}%` }}
                  ></div>
                </div>
                <span className="breakdown-value">${item.value}M</span>
              </div>
            ))}
            <div className="breakdown-total">
              <span>TOTAL</span>
              <span>${data.revenueImpact.total}M</span>
            </div>
          </div>
        </div>
      </div>

      {/* Productivity Metrics */}
      <div className="impact-charts-row">
        <div className="chart-card">
          <h3>⏱️ Productivity Analysis</h3>
          <div className="productivity-metrics">
            <div className="metric-comparison">
              <h4>Decision Time</h4>
              <div className="comparison-bars">
                <div className="bar-row">
                  <span className="bar-label">Before AI</span>
                  <div className="bar-full"></div>
                  <span className="bar-value">{data.productivity.decisionTimeBefore}</span>
                </div>
                <div className="bar-row">
                  <span className="bar-label">After AI</span>
                  <div className="bar-small"></div>
                  <span className="bar-value highlight">{data.productivity.decisionTimeAfter}</span>
                </div>
              </div>
              <div className="improvement-text">{data.productivity.improvement}% faster</div>
            </div>
            <div className="metric-comparison">
              <h4>Daily Throughput</h4>
              <div className="throughput-display">
                <div className="throughput-before">
                  <span className="value">{data.productivity.throughputBefore.toLocaleString()}</span>
                  <span className="label">Before AI</span>
                </div>
                <div className="throughput-arrow">→</div>
                <div className="throughput-after">
                  <span className="value highlight">{data.productivity.throughputAfter.toLocaleString()}</span>
                  <span className="label">After AI</span>
                </div>
              </div>
              <div className="improvement-text">{Math.round(data.productivity.throughputAfter / data.productivity.throughputBefore)}x increase</div>
            </div>
          </div>
        </div>
        <div className="chart-card">
          <h3>😊 Satisfaction Scores</h3>
          <div className="satisfaction-metrics">
            <div className="satisfaction-section">
              <h4>Customer Satisfaction</h4>
              <div className="satisfaction-grid">
                <div className="sat-metric">
                  <span className="label">NPS</span>
                  <span className="before">+{data.satisfaction.customerNPSBefore}</span>
                  <span className="arrow">→</span>
                  <span className="after">+{data.satisfaction.customerNPSAfter}</span>
                  <span className="change positive">+{data.satisfaction.customerNPSAfter - data.satisfaction.customerNPSBefore}</span>
                </div>
                <div className="sat-metric">
                  <span className="label">CSAT</span>
                  <span className="before">{data.satisfaction.customerCSATBefore}%</span>
                  <span className="arrow">→</span>
                  <span className="after">{data.satisfaction.customerCSATAfter}%</span>
                  <span className="change positive">+{data.satisfaction.customerCSATAfter - data.satisfaction.customerCSATBefore}%</span>
                </div>
              </div>
            </div>
            <div className="satisfaction-section">
              <h4>Employee Satisfaction</h4>
              <div className="satisfaction-grid">
                <div className="sat-metric">
                  <span className="label">eNPS</span>
                  <span className="before">+{data.satisfaction.employeeNPSBefore}</span>
                  <span className="arrow">→</span>
                  <span className="after">+{data.satisfaction.employeeNPSAfter}</span>
                  <span className="change positive">+{data.satisfaction.employeeNPSAfter - data.satisfaction.employeeNPSBefore}</span>
                </div>
                <div className="sat-metric">
                  <span className="label">Satisfaction</span>
                  <span className="before">{data.satisfaction.employeeSatBefore}%</span>
                  <span className="arrow">→</span>
                  <span className="after">{data.satisfaction.employeeSatAfter}%</span>
                  <span className="change positive">+{data.satisfaction.employeeSatAfter - data.satisfaction.employeeSatBefore}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="value-proposition-section">
        <h3>🎯 Value Proposition</h3>
        <div className="value-comparison">
          <div className="value-column before">
            <h4>Before AI</h4>
            <ul>
              {data.valueProposition.before.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="value-column after">
            <h4>After AI</h4>
            <ul>
              {data.valueProposition.after.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="differentiators">
          <h4>Key Differentiators</h4>
          <ul>
            {data.valueProposition.differentiators.map((item, idx) => (
              <li key={idx}>✓ {item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)', border: '1px solid var(--purple-200)', marginTop: '24px' }}>
        <div className="card-header" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', padding: '16px 24px' }}>
          <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Impact Trend (Last 12 Months)</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr' }}>
            <div style={{ padding: '20px', background: 'white' }}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => `$${v}M`} />
                  <Tooltip formatter={(v) => `$${v}M`} />
                  <Legend />
                  <Line type="monotone" dataKey="costSavings" name="Cost Savings" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="revenue" name="Revenue Impact" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ padding: '20px', background: 'var(--gray-50)', borderLeft: '1px solid var(--gray-200)' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--gray-700)' }}>Chart Explanation</div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--purple-600)', marginBottom: '4px' }}>DATA SOURCE</div>
                <p style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0 }}>Monthly aggregated financial impact metrics from production AI models.</p>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--purple-600)', marginBottom: '4px' }}>METHODOLOGY</div>
                <p style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0 }}>Cumulative tracking of cost savings and revenue impact attributed to AI decisions.</p>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)', padding: '12px', borderRadius: '8px', border: '1px solid #c4b5fd' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#7c3aed', marginBottom: '6px' }}>KEY INSIGHTS</div>
                <ul style={{ fontSize: '11px', color: 'var(--gray-700)', margin: 0, paddingLeft: '14px' }}>
                  <li>Consistent upward trend in both metrics</li>
                  <li>Cost savings growth rate: 33% YoY</li>
                  <li>Revenue impact accelerating Q4</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIImpact;
