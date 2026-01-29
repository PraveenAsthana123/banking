import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { departments } from '../data/departments';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('reports');
  const [selectedDept, setSelectedDept] = useState('all');

  // Reports List
  const reports = [
    // Risk Management Reports
    { id: 'RPT-001', name: 'Credit Risk Summary Report', department: 'Risk Management', category: 'Risk', frequency: 'Daily', lastRun: '2025-01-28 06:00', format: 'PDF', status: 'ready' },
    { id: 'RPT-002', name: 'Market Risk VaR Report', department: 'Risk Management', category: 'Risk', frequency: 'Daily', lastRun: '2025-01-28 06:00', format: 'PDF', status: 'ready' },
    { id: 'RPT-003', name: 'Operational Risk Assessment', department: 'Risk Management', category: 'Risk', frequency: 'Weekly', lastRun: '2025-01-26 00:00', format: 'Excel', status: 'ready' },
    { id: 'RPT-004', name: 'Liquidity Risk Dashboard Export', department: 'Risk Management', category: 'Risk', frequency: 'Daily', lastRun: '2025-01-28 06:00', format: 'PDF', status: 'ready' },
    { id: 'RPT-005', name: 'Interest Rate Sensitivity Report', department: 'Risk Management', category: 'Risk', frequency: 'Monthly', lastRun: '2025-01-01 00:00', format: 'PDF', status: 'ready' },

    // Credit Analysis Reports
    { id: 'RPT-006', name: 'Loan Approval Summary', department: 'Credit Analysis', category: 'Credit', frequency: 'Daily', lastRun: '2025-01-28 07:00', format: 'PDF', status: 'ready' },
    { id: 'RPT-007', name: 'Default Prediction Analysis', department: 'Credit Analysis', category: 'Credit', frequency: 'Weekly', lastRun: '2025-01-26 00:00', format: 'Excel', status: 'ready' },
    { id: 'RPT-008', name: 'Credit Portfolio Health Report', department: 'Credit Analysis', category: 'Credit', frequency: 'Monthly', lastRun: '2025-01-01 00:00', format: 'PDF', status: 'ready' },
    { id: 'RPT-009', name: 'Early Warning Signals Report', department: 'Credit Analysis', category: 'Credit', frequency: 'Daily', lastRun: '2025-01-28 06:00', format: 'PDF', status: 'ready' },
    { id: 'RPT-010', name: 'Debt Collection Performance', department: 'Credit Analysis', category: 'Credit', frequency: 'Weekly', lastRun: '2025-01-26 00:00', format: 'Excel', status: 'ready' },

    // Fraud Detection Reports
    { id: 'RPT-011', name: 'Fraud Detection Daily Summary', department: 'Fraud Detection', category: 'Fraud', frequency: 'Daily', lastRun: '2025-01-28 08:00', format: 'PDF', status: 'ready' },
    { id: 'RPT-012', name: 'Transaction Fraud Analysis', department: 'Fraud Detection', category: 'Fraud', frequency: 'Real-time', lastRun: '2025-01-28 10:30', format: 'PDF', status: 'generating' },
    { id: 'RPT-013', name: 'AML Suspicious Activity Report', department: 'Fraud Detection', category: 'Fraud', frequency: 'Daily', lastRun: '2025-01-28 06:00', format: 'PDF', status: 'ready' },
    { id: 'RPT-014', name: 'Card Fraud Trends Report', department: 'Fraud Detection', category: 'Fraud', frequency: 'Weekly', lastRun: '2025-01-26 00:00', format: 'Excel', status: 'ready' },
    { id: 'RPT-015', name: 'Identity Verification Report', department: 'Fraud Detection', category: 'Fraud', frequency: 'Daily', lastRun: '2025-01-28 06:00', format: 'PDF', status: 'ready' },

    // Customer Analytics Reports
    { id: 'RPT-016', name: 'Customer Churn Analysis', department: 'Customer Analytics', category: 'Customer', frequency: 'Weekly', lastRun: '2025-01-26 00:00', format: 'PDF', status: 'ready' },
    { id: 'RPT-017', name: 'Customer Lifetime Value Report', department: 'Customer Analytics', category: 'Customer', frequency: 'Monthly', lastRun: '2025-01-01 00:00', format: 'Excel', status: 'ready' },
    { id: 'RPT-018', name: 'Segmentation Analysis Report', department: 'Customer Analytics', category: 'Customer', frequency: 'Monthly', lastRun: '2025-01-01 00:00', format: 'PDF', status: 'ready' },
    { id: 'RPT-019', name: 'Product Recommendation Performance', department: 'Customer Analytics', category: 'Customer', frequency: 'Weekly', lastRun: '2025-01-26 00:00', format: 'Excel', status: 'ready' },
    { id: 'RPT-020', name: 'Customer Sentiment Report', department: 'Customer Analytics', category: 'Customer', frequency: 'Daily', lastRun: '2025-01-28 06:00', format: 'PDF', status: 'ready' },

    // Compliance Reports
    { id: 'RPT-021', name: 'KYC Compliance Report', department: 'Compliance', category: 'Compliance', frequency: 'Daily', lastRun: '2025-01-28 06:00', format: 'PDF', status: 'ready' },
    { id: 'RPT-022', name: 'Sanctions Screening Summary', department: 'Compliance', category: 'Compliance', frequency: 'Daily', lastRun: '2025-01-28 06:00', format: 'PDF', status: 'ready' },
    { id: 'RPT-023', name: 'Regulatory Filing Report', department: 'Compliance', category: 'Compliance', frequency: 'Monthly', lastRun: '2025-01-01 00:00', format: 'PDF', status: 'ready' },
    { id: 'RPT-024', name: 'PEP Screening Report', department: 'Compliance', category: 'Compliance', frequency: 'Daily', lastRun: '2025-01-28 06:00', format: 'PDF', status: 'ready' },
    { id: 'RPT-025', name: 'Fair Lending Analysis', department: 'Compliance', category: 'Compliance', frequency: 'Quarterly', lastRun: '2025-01-01 00:00', format: 'PDF', status: 'ready' },

    // Treasury Reports
    { id: 'RPT-026', name: 'Cash Flow Forecast Report', department: 'Treasury', category: 'Treasury', frequency: 'Daily', lastRun: '2025-01-28 06:00', format: 'Excel', status: 'ready' },
    { id: 'RPT-027', name: 'Liquidity Position Report', department: 'Treasury', category: 'Treasury', frequency: 'Daily', lastRun: '2025-01-28 06:00', format: 'PDF', status: 'ready' },
    { id: 'RPT-028', name: 'FX Exposure Report', department: 'Treasury', category: 'Treasury', frequency: 'Daily', lastRun: '2025-01-28 06:00', format: 'Excel', status: 'ready' },
    { id: 'RPT-029', name: 'Investment Portfolio Report', department: 'Treasury', category: 'Treasury', frequency: 'Weekly', lastRun: '2025-01-26 00:00', format: 'PDF', status: 'ready' },

    // Retail Banking Reports
    { id: 'RPT-030', name: 'Branch Performance Report', department: 'Retail Banking', category: 'Retail', frequency: 'Weekly', lastRun: '2025-01-26 00:00', format: 'PDF', status: 'ready' },
    { id: 'RPT-031', name: 'ATM Cash Optimization Report', department: 'Retail Banking', category: 'Retail', frequency: 'Daily', lastRun: '2025-01-28 06:00', format: 'Excel', status: 'ready' },
    { id: 'RPT-032', name: 'Deposit Trend Analysis', department: 'Retail Banking', category: 'Retail', frequency: 'Weekly', lastRun: '2025-01-26 00:00', format: 'PDF', status: 'ready' },
    { id: 'RPT-033', name: 'Channel Usage Report', department: 'Retail Banking', category: 'Retail', frequency: 'Monthly', lastRun: '2025-01-01 00:00', format: 'PDF', status: 'ready' },

    // Investment Banking Reports
    { id: 'RPT-034', name: 'Portfolio Performance Report', department: 'Investment Banking', category: 'Investment', frequency: 'Daily', lastRun: '2025-01-28 06:00', format: 'PDF', status: 'ready' },
    { id: 'RPT-035', name: 'Market Analysis Report', department: 'Investment Banking', category: 'Investment', frequency: 'Daily', lastRun: '2025-01-28 08:00', format: 'PDF', status: 'ready' },
    { id: 'RPT-036', name: 'Risk Parity Analysis', department: 'Investment Banking', category: 'Investment', frequency: 'Weekly', lastRun: '2025-01-26 00:00', format: 'Excel', status: 'ready' },
    { id: 'RPT-037', name: 'Trading Strategy Performance', department: 'Investment Banking', category: 'Investment', frequency: 'Daily', lastRun: '2025-01-28 06:00', format: 'PDF', status: 'ready' },

    // AI Governance Reports
    { id: 'RPT-038', name: 'Model Performance Report', department: 'AI Governance', category: 'Governance', frequency: 'Weekly', lastRun: '2025-01-26 00:00', format: 'PDF', status: 'ready' },
    { id: 'RPT-039', name: 'Bias & Fairness Report', department: 'AI Governance', category: 'Governance', frequency: 'Monthly', lastRun: '2025-01-01 00:00', format: 'PDF', status: 'ready' },
    { id: 'RPT-040', name: 'Model Drift Analysis', department: 'AI Governance', category: 'Governance', frequency: 'Weekly', lastRun: '2025-01-26 00:00', format: 'PDF', status: 'ready' },
    { id: 'RPT-041', name: 'Explainability Report', department: 'AI Governance', category: 'Governance', frequency: 'Monthly', lastRun: '2025-01-01 00:00', format: 'PDF', status: 'ready' },
    { id: 'RPT-042', name: 'Compliance Audit Report', department: 'AI Governance', category: 'Governance', frequency: 'Quarterly', lastRun: '2025-01-01 00:00', format: 'PDF', status: 'ready' },
  ];

  // Dashboards List
  const dashboards = [
    // Executive Dashboards
    { id: 'DSH-001', name: 'Executive Summary Dashboard', department: 'Executive', category: 'Executive', type: 'Real-time', viewers: 45, lastAccess: '2025-01-28 10:15', status: 'live' },
    { id: 'DSH-002', name: 'Enterprise Risk Overview', department: 'Executive', category: 'Executive', type: 'Real-time', viewers: 32, lastAccess: '2025-01-28 10:20', status: 'live' },
    { id: 'DSH-003', name: 'KPI Performance Dashboard', department: 'Executive', category: 'Executive', type: 'Real-time', viewers: 28, lastAccess: '2025-01-28 10:18', status: 'live' },

    // Risk Management Dashboards
    { id: 'DSH-004', name: 'Credit Risk Dashboard', department: 'Risk Management', category: 'Risk', type: 'Real-time', viewers: 18, lastAccess: '2025-01-28 10:25', status: 'live' },
    { id: 'DSH-005', name: 'Market Risk Monitor', department: 'Risk Management', category: 'Risk', type: 'Real-time', viewers: 12, lastAccess: '2025-01-28 10:22', status: 'live' },
    { id: 'DSH-006', name: 'Operational Risk Dashboard', department: 'Risk Management', category: 'Risk', type: 'Daily', viewers: 8, lastAccess: '2025-01-28 09:00', status: 'live' },
    { id: 'DSH-007', name: 'Liquidity Risk Monitor', department: 'Risk Management', category: 'Risk', type: 'Real-time', viewers: 15, lastAccess: '2025-01-28 10:28', status: 'live' },
    { id: 'DSH-008', name: 'Counterparty Risk Dashboard', department: 'Risk Management', category: 'Risk', type: 'Daily', viewers: 6, lastAccess: '2025-01-28 08:30', status: 'live' },

    // Credit Analysis Dashboards
    { id: 'DSH-009', name: 'Loan Portfolio Dashboard', department: 'Credit Analysis', category: 'Credit', type: 'Real-time', viewers: 22, lastAccess: '2025-01-28 10:30', status: 'live' },
    { id: 'DSH-010', name: 'Credit Scoring Monitor', department: 'Credit Analysis', category: 'Credit', type: 'Real-time', viewers: 14, lastAccess: '2025-01-28 10:25', status: 'live' },
    { id: 'DSH-011', name: 'Default Prediction Dashboard', department: 'Credit Analysis', category: 'Credit', type: 'Daily', viewers: 10, lastAccess: '2025-01-28 09:15', status: 'live' },
    { id: 'DSH-012', name: 'Collection Performance Dashboard', department: 'Credit Analysis', category: 'Credit', type: 'Daily', viewers: 7, lastAccess: '2025-01-28 09:00', status: 'live' },

    // Fraud Detection Dashboards
    { id: 'DSH-013', name: 'Fraud Detection Command Center', department: 'Fraud Detection', category: 'Fraud', type: 'Real-time', viewers: 35, lastAccess: '2025-01-28 10:32', status: 'live' },
    { id: 'DSH-014', name: 'Transaction Monitoring Dashboard', department: 'Fraud Detection', category: 'Fraud', type: 'Real-time', viewers: 28, lastAccess: '2025-01-28 10:31', status: 'live' },
    { id: 'DSH-015', name: 'AML Alert Dashboard', department: 'Fraud Detection', category: 'Fraud', type: 'Real-time', viewers: 20, lastAccess: '2025-01-28 10:30', status: 'live' },
    { id: 'DSH-016', name: 'Card Fraud Monitor', department: 'Fraud Detection', category: 'Fraud', type: 'Real-time', viewers: 18, lastAccess: '2025-01-28 10:29', status: 'live' },
    { id: 'DSH-017', name: 'Identity Fraud Dashboard', department: 'Fraud Detection', category: 'Fraud', type: 'Real-time', viewers: 12, lastAccess: '2025-01-28 10:28', status: 'live' },

    // Customer Analytics Dashboards
    { id: 'DSH-018', name: 'Customer 360 Dashboard', department: 'Customer Analytics', category: 'Customer', type: 'Real-time', viewers: 25, lastAccess: '2025-01-28 10:20', status: 'live' },
    { id: 'DSH-019', name: 'Churn Prediction Dashboard', department: 'Customer Analytics', category: 'Customer', type: 'Daily', viewers: 15, lastAccess: '2025-01-28 09:30', status: 'live' },
    { id: 'DSH-020', name: 'Customer Segmentation View', department: 'Customer Analytics', category: 'Customer', type: 'Weekly', viewers: 12, lastAccess: '2025-01-27 14:00', status: 'live' },
    { id: 'DSH-021', name: 'Campaign Performance Dashboard', department: 'Customer Analytics', category: 'Customer', type: 'Real-time', viewers: 18, lastAccess: '2025-01-28 10:15', status: 'live' },
    { id: 'DSH-022', name: 'Customer Journey Analytics', department: 'Customer Analytics', category: 'Customer', type: 'Daily', viewers: 10, lastAccess: '2025-01-28 09:00', status: 'live' },

    // Compliance Dashboards
    { id: 'DSH-023', name: 'Compliance Overview Dashboard', department: 'Compliance', category: 'Compliance', type: 'Real-time', viewers: 20, lastAccess: '2025-01-28 10:10', status: 'live' },
    { id: 'DSH-024', name: 'KYC Status Dashboard', department: 'Compliance', category: 'Compliance', type: 'Real-time', viewers: 16, lastAccess: '2025-01-28 10:08', status: 'live' },
    { id: 'DSH-025', name: 'Sanctions Screening Monitor', department: 'Compliance', category: 'Compliance', type: 'Real-time', viewers: 14, lastAccess: '2025-01-28 10:05', status: 'live' },
    { id: 'DSH-026', name: 'Regulatory Reporting Dashboard', department: 'Compliance', category: 'Compliance', type: 'Daily', viewers: 8, lastAccess: '2025-01-28 09:00', status: 'live' },

    // Treasury Dashboards
    { id: 'DSH-027', name: 'Treasury Operations Dashboard', department: 'Treasury', category: 'Treasury', type: 'Real-time', viewers: 15, lastAccess: '2025-01-28 10:00', status: 'live' },
    { id: 'DSH-028', name: 'Cash Position Monitor', department: 'Treasury', category: 'Treasury', type: 'Real-time', viewers: 12, lastAccess: '2025-01-28 09:55', status: 'live' },
    { id: 'DSH-029', name: 'FX Trading Dashboard', department: 'Treasury', category: 'Treasury', type: 'Real-time', viewers: 10, lastAccess: '2025-01-28 10:02', status: 'live' },
    { id: 'DSH-030', name: 'Investment Portfolio Monitor', department: 'Treasury', category: 'Treasury', type: 'Real-time', viewers: 8, lastAccess: '2025-01-28 09:50', status: 'live' },

    // Retail Banking Dashboards
    { id: 'DSH-031', name: 'Branch Operations Dashboard', department: 'Retail Banking', category: 'Retail', type: 'Real-time', viewers: 30, lastAccess: '2025-01-28 10:15', status: 'live' },
    { id: 'DSH-032', name: 'ATM Network Monitor', department: 'Retail Banking', category: 'Retail', type: 'Real-time', viewers: 12, lastAccess: '2025-01-28 10:12', status: 'live' },
    { id: 'DSH-033', name: 'Digital Banking Dashboard', department: 'Retail Banking', category: 'Retail', type: 'Real-time', viewers: 22, lastAccess: '2025-01-28 10:18', status: 'live' },
    { id: 'DSH-034', name: 'Customer Service Dashboard', department: 'Retail Banking', category: 'Retail', type: 'Real-time', viewers: 18, lastAccess: '2025-01-28 10:20', status: 'live' },

    // Investment Banking Dashboards
    { id: 'DSH-035', name: 'Trading Floor Dashboard', department: 'Investment Banking', category: 'Investment', type: 'Real-time', viewers: 25, lastAccess: '2025-01-28 10:30', status: 'live' },
    { id: 'DSH-036', name: 'Portfolio Analytics Dashboard', department: 'Investment Banking', category: 'Investment', type: 'Real-time', viewers: 18, lastAccess: '2025-01-28 10:28', status: 'live' },
    { id: 'DSH-037', name: 'Market Intelligence Dashboard', department: 'Investment Banking', category: 'Investment', type: 'Real-time', viewers: 20, lastAccess: '2025-01-28 10:25', status: 'live' },
    { id: 'DSH-038', name: 'Risk Analytics Dashboard', department: 'Investment Banking', category: 'Investment', type: 'Real-time', viewers: 15, lastAccess: '2025-01-28 10:22', status: 'live' },

    // AI/ML Dashboards
    { id: 'DSH-039', name: 'ML Model Performance Dashboard', department: 'AI Governance', category: 'AI/ML', type: 'Real-time', viewers: 12, lastAccess: '2025-01-28 10:00', status: 'live' },
    { id: 'DSH-040', name: 'Model Monitoring Dashboard', department: 'AI Governance', category: 'AI/ML', type: 'Real-time', viewers: 10, lastAccess: '2025-01-28 09:55', status: 'live' },
    { id: 'DSH-041', name: 'AI Governance Scorecard', department: 'AI Governance', category: 'AI/ML', type: 'Daily', viewers: 8, lastAccess: '2025-01-28 09:00', status: 'live' },
    { id: 'DSH-042', name: 'Pipeline Execution Monitor', department: 'AI Governance', category: 'AI/ML', type: 'Real-time', viewers: 15, lastAccess: '2025-01-28 10:05', status: 'live' },
  ];

  const filteredReports = selectedDept === 'all'
    ? reports
    : reports.filter(r => r.department === selectedDept || r.category === selectedDept);

  const filteredDashboards = selectedDept === 'all'
    ? dashboards
    : dashboards.filter(d => d.department === selectedDept || d.category === selectedDept);

  const categories = ['all', ...new Set([...reports.map(r => r.category), ...dashboards.map(d => d.category)])];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/" className="btn btn-icon btn-secondary">
              <Icon name="arrow-left" size={18} />
            </Link>
            <div>
              <h1 className="page-title">Reports & Dashboards</h1>
              <p className="page-description">
                Access all reports and real-time dashboards across departments
              </p>
            </div>
          </div>
          <div className="page-actions">
            <button className="btn btn-secondary">
              <Icon name="calendar" size={16} />
              Schedule Report
            </button>
            <button className="btn btn-primary">
              <Icon name="plus" size={16} />
              Create Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <Icon name="clipboard-check" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Reports</div>
            <div className="stat-value">{reports.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">
            <Icon name="dashboard" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Active Dashboards</div>
            <div className="stat-value">{dashboards.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning">
            <Icon name="users" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Active Viewers</div>
            <div className="stat-value">{dashboards.reduce((acc, d) => acc + d.viewers, 0)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon danger">
            <Icon name="clock" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Scheduled Today</div>
            <div className="stat-value">24</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports ({reports.length})
        </button>
        <button
          className={`tab ${activeTab === 'dashboards' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboards')}
        >
          Dashboards ({dashboards.length})
        </button>
        <button
          className={`tab ${activeTab === 'scheduled' ? 'active' : ''}`}
          onClick={() => setActiveTab('scheduled')}
        >
          Scheduled
        </button>
        <button
          className={`tab ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          Favorites
        </button>
      </div>

      {/* Filter */}
      <div className="analytics-filters" style={{ marginBottom: '24px' }}>
        <div className="filter-group">
          <label className="filter-label">Category:</label>
          <select
            className="form-select"
            style={{ width: 'auto', height: '40px' }}
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="Executive">Executive</option>
            <option value="Risk">Risk Management</option>
            <option value="Credit">Credit Analysis</option>
            <option value="Fraud">Fraud Detection</option>
            <option value="Customer">Customer Analytics</option>
            <option value="Compliance">Compliance</option>
            <option value="Treasury">Treasury</option>
            <option value="Retail">Retail Banking</option>
            <option value="Investment">Investment Banking</option>
            <option value="Governance">AI Governance</option>
            <option value="AI/ML">AI/ML</option>
          </select>
        </div>
        <div className="search-box" style={{ flex: 1 }}>
          <span className="search-icon">
            <Icon name="search" size={18} />
          </span>
          <input
            type="text"
            className="search-input"
            placeholder="Search reports and dashboards..."
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Reports Library</h3>
              <p className="card-subtitle">{filteredReports.length} reports available</p>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Report Name</th>
                  <th>Department</th>
                  <th>Frequency</th>
                  <th>Last Generated</th>
                  <th>Format</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{report.id}</td>
                    <td style={{ fontWeight: 500 }}>{report.name}</td>
                    <td>
                      <span className="status-badge neutral" style={{ fontSize: '11px' }}>
                        {report.category}
                      </span>
                    </td>
                    <td>{report.frequency}</td>
                    <td style={{ fontSize: '13px', color: 'var(--gray-500)' }}>{report.lastRun}</td>
                    <td>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '500',
                        background: report.format === 'PDF' ? 'var(--danger-50)' : 'var(--success-50)',
                        color: report.format === 'PDF' ? 'var(--danger-600)' : 'var(--success-600)'
                      }}>
                        {report.format}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${report.status === 'ready' ? 'success' : 'warning'}`}>
                        <span className="status-dot" />
                        {report.status === 'ready' ? 'Ready' : 'Generating'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-icon btn-sm btn-secondary" title="View">
                          <Icon name="eye" size={14} />
                        </button>
                        <button className="btn btn-icon btn-sm btn-secondary" title="Download">
                          <Icon name="download" size={14} />
                        </button>
                        <button className="btn btn-icon btn-sm btn-secondary" title="Schedule">
                          <Icon name="calendar" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dashboards Tab */}
      {activeTab === 'dashboards' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Dashboard Gallery</h3>
              <p className="card-subtitle">{filteredDashboards.length} dashboards available</p>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Dashboard ID</th>
                  <th>Dashboard Name</th>
                  <th>Department</th>
                  <th>Type</th>
                  <th>Active Viewers</th>
                  <th>Last Access</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDashboards.map((dashboard) => (
                  <tr key={dashboard.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{dashboard.id}</td>
                    <td style={{ fontWeight: 500 }}>{dashboard.name}</td>
                    <td>
                      <span className="status-badge neutral" style={{ fontSize: '11px' }}>
                        {dashboard.category}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '500',
                        background: dashboard.type === 'Real-time' ? 'var(--primary-50)' : 'var(--gray-100)',
                        color: dashboard.type === 'Real-time' ? 'var(--primary-600)' : 'var(--gray-600)'
                      }}>
                        {dashboard.type}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Icon name="users" size={14} />
                        {dashboard.viewers}
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--gray-500)' }}>{dashboard.lastAccess}</td>
                    <td>
                      <span className={`status-badge ${dashboard.status === 'live' ? 'success' : 'neutral'}`}>
                        <span className="status-dot" />
                        {dashboard.status === 'live' ? 'Live' : 'Offline'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-icon btn-sm btn-primary" title="Open Dashboard">
                          <Icon name="eye" size={14} />
                        </button>
                        <button className="btn btn-icon btn-sm btn-secondary" title="Share">
                          <Icon name="upload" size={14} />
                        </button>
                        <button className="btn btn-icon btn-sm btn-secondary" title="Edit">
                          <Icon name="edit" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Scheduled Tab */}
      {activeTab === 'scheduled' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Scheduled Reports</h3>
              <p className="card-subtitle">Upcoming report generations</p>
            </div>
            <button className="btn btn-primary btn-sm">
              <Icon name="plus" size={14} />
              New Schedule
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Report Name</th>
                  <th>Schedule</th>
                  <th>Next Run</th>
                  <th>Recipients</th>
                  <th>Format</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Credit Risk Summary Report', schedule: 'Daily at 06:00', nextRun: '2025-01-29 06:00', recipients: 5, format: 'PDF', status: 'active' },
                  { name: 'Fraud Detection Daily Summary', schedule: 'Daily at 08:00', nextRun: '2025-01-29 08:00', recipients: 8, format: 'PDF', status: 'active' },
                  { name: 'Executive Summary Dashboard', schedule: 'Daily at 07:00', nextRun: '2025-01-29 07:00', recipients: 12, format: 'PDF', status: 'active' },
                  { name: 'KYC Compliance Report', schedule: 'Daily at 06:00', nextRun: '2025-01-29 06:00', recipients: 4, format: 'PDF', status: 'active' },
                  { name: 'Customer Churn Analysis', schedule: 'Weekly on Monday', nextRun: '2025-02-03 00:00', recipients: 6, format: 'Excel', status: 'active' },
                  { name: 'Model Performance Report', schedule: 'Weekly on Sunday', nextRun: '2025-02-02 00:00', recipients: 3, format: 'PDF', status: 'active' },
                  { name: 'Regulatory Filing Report', schedule: 'Monthly on 1st', nextRun: '2025-02-01 00:00', recipients: 10, format: 'PDF', status: 'active' },
                  { name: 'Fair Lending Analysis', schedule: 'Quarterly', nextRun: '2025-04-01 00:00', recipients: 5, format: 'PDF', status: 'paused' },
                ].map((schedule, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{schedule.name}</td>
                    <td>{schedule.schedule}</td>
                    <td style={{ fontSize: '13px' }}>{schedule.nextRun}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Icon name="users" size={14} />
                        {schedule.recipients}
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '500',
                        background: schedule.format === 'PDF' ? 'var(--danger-50)' : 'var(--success-50)',
                        color: schedule.format === 'PDF' ? 'var(--danger-600)' : 'var(--success-600)'
                      }}>
                        {schedule.format}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${schedule.status === 'active' ? 'success' : 'neutral'}`}>
                        {schedule.status === 'active' ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-icon btn-sm btn-secondary">
                          <Icon name="edit" size={14} />
                        </button>
                        <button className="btn btn-icon btn-sm btn-secondary">
                          <Icon name={schedule.status === 'active' ? 'pause' : 'play'} size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Favorites Tab */}
      {activeTab === 'favorites' && (
        <div className="grid grid-cols-3" style={{ gap: '20px' }}>
          {[
            { type: 'dashboard', name: 'Executive Summary Dashboard', category: 'Executive', viewers: 45 },
            { type: 'dashboard', name: 'Fraud Detection Command Center', category: 'Fraud', viewers: 35 },
            { type: 'report', name: 'Credit Risk Summary Report', category: 'Risk', format: 'PDF' },
            { type: 'dashboard', name: 'Customer 360 Dashboard', category: 'Customer', viewers: 25 },
            { type: 'report', name: 'KYC Compliance Report', category: 'Compliance', format: 'PDF' },
            { type: 'dashboard', name: 'Trading Floor Dashboard', category: 'Investment', viewers: 25 },
          ].map((item, i) => (
            <div key={i} className="card" style={{ cursor: 'pointer' }}>
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: item.type === 'dashboard' ? 'var(--primary-100)' : 'var(--warning-50)',
                    color: item.type === 'dashboard' ? 'var(--primary-600)' : 'var(--warning-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon name={item.type === 'dashboard' ? 'dashboard' : 'clipboard-check'} size={20} />
                  </div>
                  <button className="btn btn-icon btn-sm btn-secondary">
                    <Icon name="x" size={14} />
                  </button>
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', marginTop: '16px' }}>{item.name}</h4>
                <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '4px' }}>{item.category}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
                  <span className="status-badge neutral" style={{ fontSize: '11px' }}>
                    {item.type === 'dashboard' ? 'Dashboard' : 'Report'}
                  </span>
                  {item.type === 'dashboard' ? (
                    <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                      <Icon name="users" size={12} /> {item.viewers} viewers
                    </span>
                  ) : (
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '500',
                      background: 'var(--danger-50)',
                      color: 'var(--danger-600)'
                    }}>
                      {item.format}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reports;
