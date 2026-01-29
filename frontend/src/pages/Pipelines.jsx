import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { departments } from '../data/departments';

const Pipelines = () => {
  const [activeTab, setActiveTab] = useState('running');

  // Generate sample pipeline data
  const pipelines = [
    {
      id: 1,
      name: 'Credit Risk Scoring - Daily Retrain',
      department: 'Risk Management',
      status: 'running',
      progress: 67,
      startTime: '2025-01-28 08:30:00',
      duration: '1h 45m',
      stage: 'Model Training',
    },
    {
      id: 2,
      name: 'Fraud Detection - Real-time Update',
      department: 'Fraud Detection',
      status: 'running',
      progress: 42,
      startTime: '2025-01-28 09:15:00',
      duration: '55m',
      stage: 'Data Preprocessing',
    },
    {
      id: 3,
      name: 'Customer Churn Prediction',
      department: 'Customer Analytics',
      status: 'pending',
      progress: 0,
      startTime: 'Scheduled 10:00',
      duration: '-',
      stage: 'Queued',
    },
    {
      id: 4,
      name: 'AML Transaction Monitoring',
      department: 'Fraud Detection',
      status: 'completed',
      progress: 100,
      startTime: '2025-01-28 06:00:00',
      duration: '2h 30m',
      stage: 'Complete',
    },
    {
      id: 5,
      name: 'Loan Approval Model v2.4',
      department: 'Credit Analysis',
      status: 'failed',
      progress: 78,
      startTime: '2025-01-28 05:30:00',
      duration: '1h 15m',
      stage: 'Model Validation (Failed)',
    },
    {
      id: 6,
      name: 'KYC Verification Update',
      department: 'Compliance',
      status: 'completed',
      progress: 100,
      startTime: '2025-01-27 22:00:00',
      duration: '3h 10m',
      stage: 'Complete',
    },
    {
      id: 7,
      name: 'Portfolio Optimization',
      department: 'Investment Banking',
      status: 'completed',
      progress: 100,
      startTime: '2025-01-27 20:30:00',
      duration: '45m',
      stage: 'Complete',
    },
  ];

  const filteredPipelines = pipelines.filter((p) => {
    if (activeTab === 'running') return p.status === 'running';
    if (activeTab === 'pending') return p.status === 'pending';
    if (activeTab === 'completed') return p.status === 'completed';
    if (activeTab === 'failed') return p.status === 'failed';
    return true;
  });

  const runningCount = pipelines.filter((p) => p.status === 'running').length;
  const pendingCount = pipelines.filter((p) => p.status === 'pending').length;
  const completedCount = pipelines.filter((p) => p.status === 'completed').length;
  const failedCount = pipelines.filter((p) => p.status === 'failed').length;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return 'play';
      case 'pending':
        return 'clock';
      case 'completed':
        return 'check';
      case 'failed':
        return 'x';
      default:
        return 'info';
    }
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
              <h1 className="page-title">Pipelines</h1>
              <p className="page-description">
                Monitor and manage ML training and deployment pipelines
              </p>
            </div>
          </div>
          <div className="page-actions">
            <button className="btn btn-secondary">
              <Icon name="calendar" size={16} />
              Schedule
            </button>
            <button className="btn btn-primary">
              <Icon name="play" size={16} />
              Run Pipeline
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <Icon name="play" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Running</div>
            <div className="stat-value">{runningCount}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning">
            <Icon name="clock" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Pending</div>
            <div className="stat-value">{pendingCount}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">
            <Icon name="check" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Completed Today</div>
            <div className="stat-value">{completedCount}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon danger">
            <Icon name="x" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Failed</div>
            <div className="stat-value">{failedCount}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'running' ? 'active' : ''}`}
          onClick={() => setActiveTab('running')}
        >
          Running ({runningCount})
        </button>
        <button
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending ({pendingCount})
        </button>
        <button
          className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed ({completedCount})
        </button>
        <button
          className={`tab ${activeTab === 'failed' ? 'active' : ''}`}
          onClick={() => setActiveTab('failed')}
        >
          Failed ({failedCount})
        </button>
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All ({pipelines.length})
        </button>
      </div>

      {/* Pipeline List */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '1px solid var(--primary-200)' }}>
        <div className="card-header" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', padding: '16px 24px' }}>
          <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Pipeline Execution Status</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="pipeline-list" style={{ padding: 0 }}>
            {filteredPipelines.map((pipeline, index) => (
              <div
                key={pipeline.id}
                className="pipeline-item"
                style={{ borderRadius: 0, margin: 0, flexDirection: 'column', alignItems: 'stretch', gap: '12px', background: index % 2 === 0 ? 'white' : '#f8fafc', padding: '16px 24px', borderBottom: '1px solid var(--gray-100)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div className={`pipeline-status ${pipeline.status}`} style={{ width: '12px', height: '12px' }} />
                  <div className="pipeline-info" style={{ flex: 1 }}>
                    <div className="pipeline-name" style={{ fontWeight: '600', fontSize: '14px', color: 'var(--gray-800)' }}>{pipeline.name}</div>
                    <div className="pipeline-meta" style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '4px' }}>
                      <span style={{ background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', padding: '2px 8px', borderRadius: '4px', marginRight: '8px', fontWeight: '500', color: 'var(--primary-700)' }}>{pipeline.department}</span>
                      Started: {pipeline.startTime} • Duration: {pipeline.duration}
                    </div>
                  </div>
                  <span
                    className={`status-badge ${
                      pipeline.status === 'completed'
                        ? 'success'
                        : pipeline.status === 'running'
                        ? 'info'
                        : pipeline.status === 'failed'
                        ? 'danger'
                        : 'neutral'
                    }`}
                  >
                    <span className="status-dot" />
                    {pipeline.stage}
                  </span>
                  <div className="pipeline-actions">
                    <button className="btn btn-icon btn-sm btn-secondary">
                      <Icon name="eye" size={14} />
                    </button>
                    {pipeline.status === 'running' && (
                      <button className="btn btn-icon btn-sm btn-secondary">
                        <Icon name="pause" size={14} />
                      </button>
                    )}
                    {pipeline.status === 'failed' && (
                      <button className="btn btn-icon btn-sm btn-secondary">
                        <Icon name="refresh" size={14} />
                      </button>
                    )}
                    {pipeline.status === 'pending' && (
                      <button className="btn btn-icon btn-sm btn-secondary">
                        <Icon name="play" size={14} />
                      </button>
                    )}
                  </div>
                </div>
                {(pipeline.status === 'running' || pipeline.status === 'failed') && (
                  <div style={{ marginLeft: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Progress</span>
                      <span style={{ fontSize: '12px', fontWeight: 500 }}>{pipeline.progress}%</span>
                    </div>
                    <div className="progress-bar" style={{ height: '6px' }}>
                      <div
                        className={`progress-fill ${pipeline.status === 'failed' ? 'danger' : 'primary'}`}
                        style={{ width: `${pipeline.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredPipelines.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Icon name="pipelines" size={32} />
              </div>
              <h3 className="empty-state-title">No pipelines found</h3>
              <p className="empty-state-description">
                No pipelines match the selected filter
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pipeline Schedule */}
      <div className="card" style={{ marginTop: '24px', background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid var(--success-200)' }}>
        <div className="card-header" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '16px 24px' }}>
          <div>
            <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Scheduled Pipelines</h3>
            <p className="card-subtitle" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Upcoming pipeline runs</p>
          </div>
          <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
            <Icon name="plus" size={14} />
            Add Schedule
          </button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Pipeline</th>
                <th>Department</th>
                <th>Schedule</th>
                <th>Next Run</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 500 }}>Credit Risk Scoring - Daily Retrain</td>
                <td>Risk Management</td>
                <td>Daily at 08:30</td>
                <td>2025-01-29 08:30</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-icon btn-sm btn-secondary">
                      <Icon name="edit" size={14} />
                    </button>
                    <button className="btn btn-icon btn-sm btn-secondary">
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 500 }}>Fraud Detection - Weekly Full Retrain</td>
                <td>Fraud Detection</td>
                <td>Sundays at 02:00</td>
                <td>2025-02-02 02:00</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-icon btn-sm btn-secondary">
                      <Icon name="edit" size={14} />
                    </button>
                    <button className="btn btn-icon btn-sm btn-secondary">
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 500 }}>Customer Segmentation</td>
                <td>Customer Analytics</td>
                <td>Monthly on 1st at 00:00</td>
                <td>2025-02-01 00:00</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-icon btn-sm btn-secondary">
                      <Icon name="edit" size={14} />
                    </button>
                    <button className="btn btn-icon btn-sm btn-secondary">
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Pipelines;
