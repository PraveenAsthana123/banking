import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { departments } from '../data/departments';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const Governance = () => {
  const [selectedDept, setSelectedDept] = useState('all');

  // Governance scores
  const governanceScores = {
    explainability: 88,
    fairness: 85,
    robustness: 92,
    privacy: 89,
    accountability: 91,
    transparency: 87,
  };

  const radarData = Object.entries(governanceScores).map(([key, value]) => ({
    subject: key.charAt(0).toUpperCase() + key.slice(1),
    score: value,
    fullMark: 100,
  }));

  // Model compliance status
  const complianceData = departments.map((d) => ({
    name: d.name.split(' ')[0],
    compliant: d.useCases.filter((uc) => uc.status === 'active').length,
    review: Math.floor(Math.random() * 2),
    nonCompliant: 0,
  }));

  // Recent audits
  const recentAudits = [
    {
      id: 1,
      model: 'Credit Risk Scoring v2.3',
      department: 'Risk Management',
      date: '2025-01-27',
      score: 94,
      status: 'passed',
    },
    {
      id: 2,
      model: 'Fraud Detection Real-time',
      department: 'Fraud Detection',
      date: '2025-01-26',
      score: 91,
      status: 'passed',
    },
    {
      id: 3,
      model: 'Loan Approval Model',
      department: 'Credit Analysis',
      date: '2025-01-25',
      score: 82,
      status: 'review',
    },
    {
      id: 4,
      model: 'Customer Churn Prediction',
      department: 'Customer Analytics',
      date: '2025-01-24',
      score: 89,
      status: 'passed',
    },
    {
      id: 5,
      model: 'KYC Verification',
      department: 'Compliance',
      date: '2025-01-23',
      score: 96,
      status: 'passed',
    },
  ];

  // Compliance checklist items
  const checklistItems = [
    { category: 'Documentation', items: ['Model card complete', 'Data documentation', 'API documentation', 'User guide'] },
    { category: 'Bias & Fairness', items: ['Demographic parity test', 'Equal opportunity test', 'Disparate impact analysis', 'Protected attribute audit'] },
    { category: 'Explainability', items: ['Feature importance', 'SHAP values generated', 'Local explanations', 'Global explanations'] },
    { category: 'Privacy', items: ['Data minimization', 'PII handling', 'Retention policy', 'Access controls'] },
    { category: 'Robustness', items: ['Adversarial testing', 'Out-of-distribution detection', 'Drift monitoring', 'Fallback mechanism'] },
  ];

  const getScoreClass = (score) => {
    if (score >= 90) return 'score-excellent';
    if (score >= 80) return 'score-good';
    if (score >= 70) return 'score-moderate';
    return 'score-poor';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/" className="btn btn-icon btn-secondary">
              <Icon name="arrow-left" size={18} />
            </Link>
            <div>
              <h1 className="page-title">AI Governance</h1>
              <p className="page-description">
                Monitor model compliance, fairness, and explainability metrics
              </p>
            </div>
          </div>
          <div className="page-actions">
            <button className="btn btn-secondary">
              <Icon name="download" size={16} />
              Export Report
            </button>
            <button className="btn btn-primary">
              <Icon name="clipboard-check" size={16} />
              Run Audit
            </button>
          </div>
        </div>
      </div>

      {/* Overall Governance Score */}
      <div className="alert info" style={{ marginBottom: '24px' }}>
        <span className="alert-icon">
          <Icon name="governance" size={20} />
        </span>
        <div className="alert-content">
          <div className="alert-title">Overall Governance Score: 89/100</div>
          <div className="alert-message">
            Your organization's AI governance is rated as "Good". 92% of models meet compliance requirements.
          </div>
        </div>
      </div>

      {/* Governance Scores */}
      <div className="governance-scores" style={{ marginBottom: '24px' }}>
        {Object.entries(governanceScores).map(([key, value]) => (
          <div key={key} className="governance-score-card">
            <div className={`governance-score-value ${getScoreClass(value)}`}>{value}</div>
            <div className="governance-score-label">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '24px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid var(--primary-200)' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', padding: '16px 24px' }}>
            <div>
              <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>🎯 Governance Radar</h3>
              <p className="card-subtitle" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Multi-dimensional assessment</p>
            </div>
          </div>
          <div className="card-body" style={{ padding: '0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr' }}>
              <div style={{ padding: '16px', background: 'white' }}>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="subject" fontSize={11} />
                      <PolarRadiusAxis domain={[0, 100]} tick={false} />
                      <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={{ padding: '16px', background: 'var(--gray-50)', borderLeft: '1px solid var(--gray-200)' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: 'var(--gray-700)' }}>Explanation</div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '4px' }}>📁 DATA SOURCE</div>
                  <p style={{ fontSize: '11px', color: 'var(--gray-600)', margin: 0 }}>Governance audit scores from MRM team assessments.</p>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '4px' }}>📊 DIMENSIONS</div>
                  <p style={{ fontSize: '11px', color: 'var(--gray-600)', margin: 0 }}>6 pillars: Explainability, Fairness, Robustness, Privacy, Accountability, Transparency.</p>
                </div>
                <div style={{ background: 'white', padding: '10px', borderRadius: '6px', border: '1px solid var(--gray-200)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '6px' }}>💡 KEY INSIGHTS</div>
                  <ul style={{ fontSize: '10px', color: 'var(--gray-600)', margin: 0, paddingLeft: '14px' }}>
                    <li>Robustness highest at 92%</li>
                    <li>Fairness needs improvement (85%)</li>
                    <li>Overall governance score: 89/100</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid var(--success-200)' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '16px 24px' }}>
            <div>
              <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>✅ Compliance by Department</h3>
              <p className="card-subtitle" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Model compliance status</p>
            </div>
          </div>
          <div className="card-body" style={{ padding: '0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr' }}>
              <div style={{ padding: '16px', background: 'white' }}>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={complianceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" fontSize={10} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="compliant" stackId="a" fill="#10b981" name="Compliant" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="review" stackId="a" fill="#f59e0b" name="Under Review" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="nonCompliant" stackId="a" fill="#ef4444" name="Non-Compliant" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={{ padding: '16px', background: 'var(--gray-50)', borderLeft: '1px solid var(--gray-200)' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: 'var(--gray-700)' }}>Explanation</div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '4px' }}>📁 DATA SOURCE</div>
                  <p style={{ fontSize: '11px', color: 'var(--gray-600)', margin: 0 }}>Real-time compliance status from model registry.</p>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '4px' }}>📊 STATUS COLORS</div>
                  <p style={{ fontSize: '11px', color: 'var(--gray-600)', margin: 0 }}>Green = Compliant, Yellow = Under Review, Red = Non-Compliant.</p>
                </div>
                <div style={{ background: 'white', padding: '10px', borderRadius: '6px', border: '1px solid var(--gray-200)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '6px' }}>💡 KEY INSIGHTS</div>
                  <ul style={{ fontSize: '10px', color: 'var(--gray-600)', margin: 0, paddingLeft: '14px' }}>
                    <li>92% of models are fully compliant</li>
                    <li>0 non-compliant models in production</li>
                    <li>Risk & Fraud have most compliant models</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Audits and Checklist */}
      <div className="grid grid-cols-2">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Recent Audits</h3>
              <p className="card-subtitle">Latest governance assessments</p>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Date</th>
                  <th>Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAudits.map((audit) => (
                  <tr key={audit.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{audit.model}</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                        {audit.department}
                      </div>
                    </td>
                    <td style={{ color: 'var(--gray-500)' }}>{audit.date}</td>
                    <td>
                      <span className={getScoreClass(audit.score)} style={{ fontWeight: 600 }}>
                        {audit.score}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          audit.status === 'passed' ? 'success' : 'warning'
                        }`}
                      >
                        <span className="status-dot" />
                        {audit.status === 'passed' ? 'Passed' : 'Review'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Compliance Checklist</h3>
              <p className="card-subtitle">Required governance items</p>
            </div>
          </div>
          <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {checklistItems.map((category) => (
              <div key={category.category} style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--gray-700)' }}>
                  {category.category}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {category.items.map((item, i) => (
                    <div
                      key={item}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 12px',
                        background: 'var(--gray-50)',
                        borderRadius: '6px',
                      }}
                    >
                      <span style={{ color: i < 3 ? 'var(--success-600)' : 'var(--gray-400)' }}>
                        <Icon name={i < 3 ? 'check' : 'clock'} size={16} />
                      </span>
                      <span style={{ flex: 1, fontSize: '13px' }}>{item}</span>
                      <span
                        style={{
                          fontSize: '11px',
                          color: i < 3 ? 'var(--success-600)' : 'var(--gray-500)',
                        }}
                      >
                        {i < 3 ? 'Complete' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Alerts */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Risk Alerts</h3>
            <p className="card-subtitle">Active governance concerns</p>
          </div>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="alert warning" style={{ margin: 0 }}>
              <span className="alert-icon">
                <Icon name="alert-triangle" size={20} />
              </span>
              <div className="alert-content">
                <div className="alert-title">Model Drift Detected</div>
                <div className="alert-message">
                  Loan Approval Model showing 2.3% accuracy degradation over the past week. Consider retraining.
                </div>
              </div>
            </div>

            <div className="alert info" style={{ margin: 0 }}>
              <span className="alert-icon">
                <Icon name="info" size={20} />
              </span>
              <div className="alert-content">
                <div className="alert-title">Bias Review Required</div>
                <div className="alert-message">
                  Customer Churn Prediction model scheduled for quarterly fairness review. Due in 5 days.
                </div>
              </div>
            </div>

            <div className="alert success" style={{ margin: 0 }}>
              <span className="alert-icon">
                <Icon name="check" size={20} />
              </span>
              <div className="alert-content">
                <div className="alert-title">Audit Completed</div>
                <div className="alert-message">
                  Credit Risk Scoring v2.3 passed all governance checks with a score of 94/100.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Governance;
