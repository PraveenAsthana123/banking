import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { departments, getStatusColor, getStatusLabel, getAiCategory, getDataCategory } from '../data/departments';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ComposedChart,
} from 'recharts';

const UseCase = () => {
  const { deptId, useCaseId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [runningJobs, setRunningJobs] = useState({});
  const [notification, setNotification] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [showModelModal, setShowModelModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  const department = departments.find((d) => d.id === deptId);
  const useCase = department?.useCases.find((uc) => uc.id === useCaseId);

  // Job action handlers
  const handleRunJob = (jobName) => {
    setRunningJobs(prev => ({ ...prev, [jobName]: true }));
    setNotification({ type: 'success', message: `Job "${jobName}" started successfully!` });
    setTimeout(() => {
      setRunningJobs(prev => ({ ...prev, [jobName]: false }));
      setNotification({ type: 'success', message: `Job "${jobName}" completed successfully!` });
    }, 3000);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };

  const handleExport = (type) => {
    setNotification({ type: 'success', message: `Exporting ${type}... Download will start shortly.` });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRunPipeline = () => {
    setNotification({ type: 'success', message: 'Pipeline execution started!' });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRetrain = () => {
    setNotification({ type: 'info', message: 'Model retraining scheduled. Estimated time: 2 hours.' });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleViewModelDetails = (model) => {
    setSelectedModel(model);
    setShowModelModal(true);
  };

  const handleViewTransactionDetails = (txn) => {
    setSelectedTransaction(txn);
    setShowTransactionModal(true);
  };

  const handleDownloadResults = (txn) => {
    setNotification({ type: 'success', message: `Downloading results for ${txn.id}...` });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRerunTransaction = (txn) => {
    setNotification({ type: 'info', message: `Re-running transaction ${txn.id}...` });
    setTimeout(() => {
      setNotification({ type: 'success', message: `Transaction ${txn.id} completed successfully!` });
      setTimeout(() => setNotification(null), 3000);
    }, 2000);
  };

  if (!department || !useCase) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon">
            <Icon name="alert-triangle" size={40} />
          </div>
          <h2 className="empty-state-title">Use Case Not Found</h2>
          <p className="empty-state-description">
            The use case you're looking for doesn't exist.
          </p>
          <Link to="/" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Generate sample data
  const performanceHistory = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    accuracy: useCase.accuracy > 0 ? useCase.accuracy - 5 + Math.random() * 10 : 85 + Math.random() * 10,
    precision: useCase.accuracy > 0 ? useCase.accuracy - 3 + Math.random() * 8 : 83 + Math.random() * 8,
    recall: useCase.accuracy > 0 ? useCase.accuracy - 4 + Math.random() * 9 : 84 + Math.random() * 9,
  }));

  const predictionDistribution = [
    { range: '0-10%', count: Math.floor(Math.random() * 50) },
    { range: '10-20%', count: Math.floor(Math.random() * 100) },
    { range: '20-30%', count: Math.floor(Math.random() * 200) },
    { range: '30-40%', count: Math.floor(Math.random() * 300) },
    { range: '40-50%', count: Math.floor(Math.random() * 400) },
    { range: '50-60%', count: Math.floor(Math.random() * 500) },
    { range: '60-70%', count: Math.floor(Math.random() * 400) },
    { range: '70-80%', count: Math.floor(Math.random() * 300) },
    { range: '80-90%', count: Math.floor(Math.random() * 200) },
    { range: '90-100%', count: Math.floor(Math.random() * 100) },
  ];

  const featureImportance = [
    { feature: 'Feature A', importance: 0.25 },
    { feature: 'Feature B', importance: 0.18 },
    { feature: 'Feature C', importance: 0.15 },
    { feature: 'Feature D', importance: 0.12 },
    { feature: 'Feature E', importance: 0.10 },
    { feature: 'Feature F', importance: 0.08 },
    { feature: 'Feature G', importance: 0.07 },
    { feature: 'Feature H', importance: 0.05 },
  ];

  const confusionMatrix = {
    tp: Math.floor(Math.random() * 5000 + 8000),
    tn: Math.floor(Math.random() * 4000 + 7000),
    fp: Math.floor(Math.random() * 500 + 200),
    fn: Math.floor(Math.random() * 600 + 300),
  };

  const dailyPredictions = Array.from({ length: 14 }, (_, i) => ({
    date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
    predictions: Math.floor(Math.random() * 2000 + 500),
    alerts: Math.floor(Math.random() * 100 + 10),
  }));

  const modelVersions = [
    { version: 'v2.3.1', date: '2025-01-15', accuracy: useCase.accuracy, status: 'production' },
    { version: 'v2.3.0', date: '2025-01-08', accuracy: useCase.accuracy - 0.5, status: 'archived' },
    { version: 'v2.2.4', date: '2024-12-20', accuracy: useCase.accuracy - 1.2, status: 'archived' },
    { version: 'v2.2.3', date: '2024-12-01', accuracy: useCase.accuracy - 2.1, status: 'archived' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <Link to={`/department/${department.id}`} className="btn btn-icon btn-secondary" style={{ marginTop: '4px' }}>
              <Icon name="arrow-left" size={18} />
            </Link>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Link
                  to={`/department/${department.id}`}
                  style={{ color: 'var(--gray-500)', fontSize: '14px' }}
                >
                  {department.name}
                </Link>
                <span style={{ color: 'var(--gray-300)' }}>/</span>
              </div>
              <h1 className="page-title">{useCase.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                <span className={`status-badge ${getStatusColor(useCase.status)}`}>
                  <span className="status-dot" />
                  {getStatusLabel(useCase.status)}
                </span>
                <span style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
                  {useCase.models} models deployed
                </span>
              </div>
            </div>
          </div>
          <div className="page-actions">
            <Link to={`/data-analysis/${useCaseId}`} className="btn btn-secondary">
              <Icon name="chart" size={16} />
              Data Analysis
            </Link>
            <Link to={`/stakeholder-reports/${useCaseId}`} className="btn btn-secondary">
              <Icon name="file" size={16} />
              Stakeholder Reports
            </Link>
            <Link to={`/ai-impact/${useCaseId}`} className="btn btn-secondary">
              <Icon name="trending-up" size={16} />
              AI Impact
            </Link>
            <button className="btn btn-secondary" onClick={() => handleExport('Report')}>
              <Icon name="download" size={16} />
              Export Report
            </button>
            <button className="btn btn-secondary" onClick={handleRetrain}>
              <Icon name="refresh" size={16} />
              Retrain
            </button>
            <button className="btn btn-primary" onClick={handleRunPipeline}>
              <Icon name="play" size={16} />
              Run Pipeline
            </button>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '16px 24px',
          background: notification.type === 'success' ? 'var(--success-500)' : notification.type === 'error' ? 'var(--danger-500)' : 'var(--primary-500)',
          color: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'slideIn 0.3s ease'
        }}>
          <Icon name={notification.type === 'success' ? 'check' : notification.type === 'error' ? 'alert-triangle' : 'info'} size={20} />
          {notification.message}
          <button onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginLeft: '12px' }}>
            <Icon name="x" size={16} />
          </button>
        </div>
      )}

      {/* Job Detail Modal */}
      {showJobModal && selectedJob && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowJobModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Job Details: {selectedJob.name}</h3>
              <button onClick={() => setShowJobModal(false)} className="btn btn-icon btn-secondary">
                <Icon name="x" size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                <span>Status</span>
                <span className={`status-badge ${selectedJob.status === 'success' ? 'success' : 'warning'}`}>{selectedJob.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                <span>Schedule</span>
                <span style={{ fontFamily: 'monospace' }}>{selectedJob.schedule}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                <span>Last Run</span>
                <span>{selectedJob.lastRun}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                <span>Duration</span>
                <span>{selectedJob.duration}</span>
              </div>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowJobModal(false)}>Close</button>
              <button className="btn btn-primary" onClick={() => { handleRunJob(selectedJob.name); setShowJobModal(false); }}>
                <Icon name="play" size={14} /> Run Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Model Detail Modal */}
      {showModelModal && selectedModel && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowModelModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '85vh',
            overflow: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `var(--${selectedModel.color}-100)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="cpu" size={24} color={`var(--${selectedModel.color}-600)`} />
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>{selectedModel.name}</h3>
                  <span className="status-badge secondary">{selectedModel.type}</span>
                </div>
              </div>
              <button onClick={() => setShowModelModal(false)} className="btn btn-icon btn-secondary">
                <Icon name="x" size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
              <div style={{ padding: '16px', background: 'var(--success-50)', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--success-600)', textTransform: 'uppercase' }}>Accuracy</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success-700)' }}>{selectedModel.accuracy}</div>
              </div>
              <div style={{ padding: '16px', background: 'var(--primary-50)', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--primary-600)', textTransform: 'uppercase' }}>Precision</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-700)' }}>{selectedModel.precision || '96.2%'}</div>
              </div>
              <div style={{ padding: '16px', background: 'var(--warning-50)', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--warning-600)', textTransform: 'uppercase' }}>Recall</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--warning-700)' }}>{selectedModel.recall || '94.5%'}</div>
              </div>
              <div style={{ padding: '16px', background: 'var(--purple-50)', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--purple-600)', textTransform: 'uppercase' }}>F1 Score</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--purple-700)' }}>{selectedModel.f1 || '95.3%'}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Model Configuration</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { param: 'Framework', value: selectedModel.framework || 'TensorFlow 2.x' },
                    { param: 'Version', value: selectedModel.version || 'v2.3.1' },
                    { param: 'Training Data', value: '2.8M samples' },
                    { param: 'Features', value: '450 dimensions' },
                    { param: 'Training Time', value: '4h 32m' },
                    { param: 'Last Updated', value: '2025-01-15' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'white', borderRadius: '6px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{item.param}</span>
                      <span style={{ fontSize: '12px', fontWeight: '600' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Hyperparameters</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(selectedModel.hyperparameters || [
                    { param: 'learning_rate', value: '0.05' },
                    { param: 'max_depth', value: '8' },
                    { param: 'n_estimators', value: '500' },
                    { param: 'min_samples_split', value: '2' },
                    { param: 'subsample', value: '0.8' },
                    { param: 'reg_lambda', value: '1.0' },
                  ]).map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'white', borderRadius: '6px' }}>
                      <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--gray-600)' }}>{item.param}</span>
                      <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: '600', color: 'var(--primary-600)' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ padding: '16px', background: 'var(--indigo-50)', borderRadius: '12px', marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--indigo-700)' }}>Model Purpose</h4>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--gray-600)', lineHeight: '1.6' }}>
                {selectedModel.purpose || 'This model is used for primary classification tasks in the ML pipeline. It processes tabular features and produces probability scores for risk assessment.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowModelModal(false)}>Close</button>
              <button className="btn btn-secondary" onClick={() => { handleExport(`${selectedModel.name} Report`); setShowModelModal(false); }}>
                <Icon name="download" size={14} /> Export Report
              </button>
              <button className="btn btn-primary" onClick={() => { handleRetrain(); setShowModelModal(false); }}>
                <Icon name="refresh" size={14} /> Retrain Model
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Detail Modal */}
      {showTransactionModal && selectedTransaction && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowTransactionModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '700px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: 0 }}>Transaction Details</h3>
                <span style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--gray-500)' }}>{selectedTransaction.id}</span>
              </div>
              <button onClick={() => setShowTransactionModal(false)} className="btn btn-icon btn-secondary">
                <Icon name="x" size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
              <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Status</div>
                <span className={`status-badge ${selectedTransaction.status === 'completed' ? 'success' : 'danger'}`}>
                  {selectedTransaction.status === 'completed' ? 'Completed' : 'Failed'}
                </span>
              </div>
              <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Duration</div>
                <div style={{ fontSize: '18px', fontWeight: '600' }}>{selectedTransaction.duration}</div>
              </div>
              <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--gray-500)', textTransform: 'uppercase' }}>User</div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>{selectedTransaction.user}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {[
                { label: 'Timestamp', value: selectedTransaction.time },
                { label: 'Input Records', value: selectedTransaction.input },
                { label: 'Output Records', value: selectedTransaction.output },
                { label: 'Processing Rate', value: `${Math.round(parseInt(selectedTransaction.input.replace(',', '')) / 60)} records/sec` },
                { label: 'Error Count', value: selectedTransaction.status === 'completed' ? '0' : '3' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--gray-600)' }}>{item.label}</span>
                  <span style={{ fontWeight: '600' }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowTransactionModal(false)}>Close</button>
              <button className="btn btn-secondary" onClick={() => { handleDownloadResults(selectedTransaction); setShowTransactionModal(false); }}>
                <Icon name="download" size={14} /> Download Results
              </button>
              <button className="btn btn-primary" onClick={() => { handleRerunTransaction(selectedTransaction); setShowTransactionModal(false); }}>
                <Icon name="refresh" size={14} /> Re-run
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon success">
            <Icon name="target" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Accuracy</div>
            <div className="stat-value">
              {useCase.accuracy > 0 ? useCase.accuracy.toFixed(1) + '%' : 'N/A'}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon primary">
            <Icon name="zap" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Predictions Today</div>
            <div className="stat-value">{(Math.random() * 5000 + 1000).toFixed(0)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <Icon name="clock" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Avg. Latency</div>
            <div className="stat-value">{Math.floor(Math.random() * 50 + 10)}ms</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon danger">
            <Icon name="alert-triangle" size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Alerts</div>
            <div className="stat-value">{Math.floor(Math.random() * 20)}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ flexWrap: 'wrap' }}>
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'data' ? 'active' : ''}`}
          onClick={() => setActiveTab('data')}
        >
          Data
        </button>
        <button
          className={`tab ${activeTab === 'model' ? 'active' : ''}`}
          onClick={() => setActiveTab('model')}
        >
          Model
        </button>
        <button
          className={`tab ${activeTab === 'automation' ? 'active' : ''}`}
          onClick={() => setActiveTab('automation')}
        >
          Automation
        </button>
        <button
          className={`tab ${activeTab === 'accuracy' ? 'active' : ''}`}
          onClick={() => setActiveTab('accuracy')}
        >
          Accuracy
        </button>
        <button
          className={`tab ${activeTab === 'simulation' ? 'active' : ''}`}
          onClick={() => setActiveTab('simulation')}
        >
          Simulation
        </button>
        <button
          className={`tab ${activeTab === 'architecture' ? 'active' : ''}`}
          onClick={() => setActiveTab('architecture')}
        >
          Architecture
        </button>
        <button
          className={`tab ${activeTab === 'testing' ? 'active' : ''}`}
          onClick={() => setActiveTab('testing')}
        >
          Testing
        </button>
        <button
          className={`tab ${activeTab === 'workflow' ? 'active' : ''}`}
          onClick={() => setActiveTab('workflow')}
        >
          Workflow
        </button>
        <button
          className={`tab ${activeTab === 'governance' ? 'active' : ''}`}
          onClick={() => setActiveTab('governance')}
        >
          Governance
        </button>
        <button
          className={`tab ${activeTab === 'demo' ? 'active' : ''}`}
          onClick={() => setActiveTab('demo')}
          style={{ background: activeTab === 'demo' ? 'var(--primary-100)' : undefined }}
        >
          Demo
        </button>
        <button
          className={`tab ${activeTab === 'trust-ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('trust-ai')}
          style={{ background: activeTab === 'trust-ai' ? 'var(--success-100)' : undefined }}
        >
          Trust AI
        </button>
        <button
          className={`tab ${activeTab === 'explainable-ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('explainable-ai')}
        >
          Explainable AI
        </button>
        <button
          className={`tab ${activeTab === 'ethical-ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ethical-ai')}
        >
          Ethical AI
        </button>
        <button
          className={`tab ${activeTab === 'robust-ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('robust-ai')}
        >
          Robust AI
        </button>
        <button
          className={`tab ${activeTab === 'secure-ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('secure-ai')}
        >
          Secure AI
        </button>
        <button
          className={`tab ${activeTab === 'portable-ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('portable-ai')}
        >
          Portable AI
        </button>
        <button
          className={`tab ${activeTab === 'compliance-ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('compliance-ai')}
        >
          Compliance AI
        </button>
        <button
          className={`tab ${activeTab === 'problem' ? 'active' : ''}`}
          onClick={() => setActiveTab('problem')}
          style={{ background: activeTab === 'problem' ? 'var(--warning-100)' : undefined }}
        >
          Problem
        </button>
        <button
          className={`tab ${activeTab === 'stakeholders' ? 'active' : ''}`}
          onClick={() => setActiveTab('stakeholders')}
          style={{ background: activeTab === 'stakeholders' ? 'var(--success-100)' : undefined }}
        >
          Stakeholders
        </button>
        <button
          className={`tab ${activeTab === 'readme' ? 'active' : ''}`}
          onClick={() => setActiveTab('readme')}
          style={{ background: activeTab === 'readme' ? 'var(--primary-100)' : undefined }}
        >
          README
        </button>
        <button
          className={`tab ${activeTab === 'lld' ? 'active' : ''}`}
          onClick={() => setActiveTab('lld')}
          style={{ background: activeTab === 'lld' ? 'var(--danger-100)' : undefined }}
        >
          LLD
        </button>
        <button
          className={`tab ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
          style={{ background: activeTab === 'jobs' ? 'var(--cyan-100)' : undefined }}
        >
          Jobs
        </button>
        <button
          className={`tab ${activeTab === 'as-is-to-be' ? 'active' : ''}`}
          onClick={() => setActiveTab('as-is-to-be')}
          style={{ background: activeTab === 'as-is-to-be' ? 'var(--purple-100)' : undefined }}
        >
          AS-IS/TO-BE
        </button>
        <button
          className={`tab ${activeTab === 'operations' ? 'active' : ''}`}
          onClick={() => setActiveTab('operations')}
          style={{ background: activeTab === 'operations' ? 'var(--teal-100)' : undefined }}
        >
          Operations
        </button>
        <button
          className={`tab ${activeTab === '5w1h' ? 'active' : ''}`}
          onClick={() => setActiveTab('5w1h')}
          style={{ background: activeTab === '5w1h' ? 'var(--orange-100)' : undefined }}
        >
          5W1H
        </button>
        <button
          className={`tab ${activeTab === 'day-simulation' ? 'active' : ''}`}
          onClick={() => setActiveTab('day-simulation')}
          style={{ background: activeTab === 'day-simulation' ? 'var(--pink-100)' : undefined }}
        >
          Day Simulation
        </button>
        <button
          className={`tab ${activeTab === 'scenarios' ? 'active' : ''}`}
          onClick={() => setActiveTab('scenarios')}
          style={{ background: activeTab === 'scenarios' ? 'var(--indigo-100)' : undefined }}
        >
          Scenarios
        </button>
        <button
          className={`tab ${activeTab === 'linkedin-post' ? 'active' : ''}`}
          onClick={() => setActiveTab('linkedin-post')}
          style={{ background: activeTab === 'linkedin-post' ? 'var(--blue-100)' : undefined }}
        >
          LinkedIn Post
        </button>
        <button
          className={`tab ${activeTab === 'ai-strategy' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai-strategy')}
          style={{ background: activeTab === 'ai-strategy' ? 'var(--gradient-primary)' : undefined, color: activeTab === 'ai-strategy' ? 'white' : undefined }}
        >
          AI Strategy
        </button>
        <button
          className={`tab ${activeTab === 'interview' ? 'active' : ''}`}
          onClick={() => setActiveTab('interview')}
          style={{ background: activeTab === 'interview' ? 'linear-gradient(135deg, var(--purple-500), var(--indigo-600))' : undefined, color: activeTab === 'interview' ? 'white' : undefined }}
        >
          Interview Guide
        </button>
        <button
          className={`tab ${activeTab === 'cost-analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('cost-analysis')}
          style={{ background: activeTab === 'cost-analysis' ? 'var(--danger-500)' : undefined, color: activeTab === 'cost-analysis' ? 'white' : undefined }}
        >
          Cost Analysis
        </button>
        <button
          className={`tab ${activeTab === 'drift-monitoring' ? 'active' : ''}`}
          onClick={() => setActiveTab('drift-monitoring')}
          style={{ background: activeTab === 'drift-monitoring' ? 'var(--warning-500)' : undefined, color: activeTab === 'drift-monitoring' ? 'white' : undefined }}
        >
          Drift Monitor
        </button>
        <button
          className={`tab ${activeTab === 'incidents' ? 'active' : ''}`}
          onClick={() => setActiveTab('incidents')}
          style={{ background: activeTab === 'incidents' ? 'var(--danger-600)' : undefined, color: activeTab === 'incidents' ? 'white' : undefined }}
        >
          Incidents
        </button>
        <button
          className={`tab ${activeTab === 'sla-dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('sla-dashboard')}
          style={{ background: activeTab === 'sla-dashboard' ? 'var(--success-500)' : undefined, color: activeTab === 'sla-dashboard' ? 'white' : undefined }}
        >
          SLA Dashboard
        </button>
        <button
          className={`tab ${activeTab === 'ab-testing' ? 'active' : ''}`}
          onClick={() => setActiveTab('ab-testing')}
          style={{ background: activeTab === 'ab-testing' ? 'var(--teal-500)' : undefined, color: activeTab === 'ab-testing' ? 'white' : undefined }}
        >
          A/B Testing
        </button>
        <button
          className={`tab ${activeTab === 'bias-fairness' ? 'active' : ''}`}
          onClick={() => setActiveTab('bias-fairness')}
          style={{ background: activeTab === 'bias-fairness' ? 'var(--pink-500)' : undefined, color: activeTab === 'bias-fairness' ? 'white' : undefined }}
        >
          Bias & Fairness
        </button>
        <button
          className={`tab ${activeTab === 'feedback-loop' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback-loop')}
          style={{ background: activeTab === 'feedback-loop' ? 'var(--cyan-500)' : undefined, color: activeTab === 'feedback-loop' ? 'white' : undefined }}
        >
          Feedback Loop
        </button>
        <button
          className={`tab ${activeTab === 'version-history' ? 'active' : ''}`}
          onClick={() => setActiveTab('version-history')}
          style={{ background: activeTab === 'version-history' ? 'var(--indigo-500)' : undefined, color: activeTab === 'version-history' ? 'white' : undefined }}
        >
          Version History
        </button>
        <button
          className={`tab ${activeTab === 'data-lineage' ? 'active' : ''}`}
          onClick={() => setActiveTab('data-lineage')}
          style={{ background: activeTab === 'data-lineage' ? 'var(--orange-500)' : undefined, color: activeTab === 'data-lineage' ? 'white' : undefined }}
        >
          Data Lineage
        </button>
        <button
          className={`tab ${activeTab === 'capacity-planning' ? 'active' : ''}`}
          onClick={() => setActiveTab('capacity-planning')}
          style={{ background: activeTab === 'capacity-planning' ? 'var(--purple-600)' : undefined, color: activeTab === 'capacity-planning' ? 'white' : undefined }}
        >
          Capacity
        </button>
        <button
          className={`tab ${activeTab === 'executive-summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('executive-summary')}
          style={{ background: activeTab === 'executive-summary' ? 'linear-gradient(135deg, var(--primary-600), var(--primary-800))' : undefined, color: activeTab === 'executive-summary' ? 'white' : undefined }}
        >
          Executive Summary
        </button>
        <button
          className={`tab ${activeTab === 'api-docs' ? 'active' : ''}`}
          onClick={() => setActiveTab('api-docs')}
          style={{ background: activeTab === 'api-docs' ? 'var(--gray-700)' : undefined, color: activeTab === 'api-docs' ? 'white' : undefined }}
        >
          API Docs
        </button>
        <button
          className={`tab ${activeTab === 'runbook' ? 'active' : ''}`}
          onClick={() => setActiveTab('runbook')}
          style={{ background: activeTab === 'runbook' ? 'var(--danger-700)' : undefined, color: activeTab === 'runbook' ? 'white' : undefined }}
        >
          Runbook
        </button>
        <button
          className={`tab ${activeTab === 'roadmap' ? 'active' : ''}`}
          onClick={() => setActiveTab('roadmap')}
          style={{ background: activeTab === 'roadmap' ? 'var(--success-600)' : undefined, color: activeTab === 'roadmap' ? 'white' : undefined }}
        >
          Roadmap
        </button>
        <button
          className={`tab ${activeTab === 'ml-workbench' ? 'active' : ''}`}
          onClick={() => setActiveTab('ml-workbench')}
          style={{ background: activeTab === 'ml-workbench' ? 'linear-gradient(135deg, #667eea, #764ba2)' : undefined, color: activeTab === 'ml-workbench' ? 'white' : undefined }}
        >
          ML Workbench
        </button>
        <button
          className={`tab ${activeTab === 'auto-pipeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('auto-pipeline')}
          style={{ background: activeTab === 'auto-pipeline' ? 'linear-gradient(135deg, #f093fb, #f5576c)' : undefined, color: activeTab === 'auto-pipeline' ? 'white' : undefined }}
        >
          Auto Pipeline
        </button>
        <button
          className={`tab ${activeTab === 'demo-mode' ? 'active' : ''}`}
          onClick={() => setActiveTab('demo-mode')}
          style={{ background: activeTab === 'demo-mode' ? 'linear-gradient(135deg, #ff6b6b, #feca57)' : undefined, color: activeTab === 'demo-mode' ? 'white' : undefined, fontWeight: 'bold', animation: 'pulse 2s infinite' }}
        >
          🎯 Demo Mode
        </button>
        <button
          className={`tab ${activeTab === 'explainability' ? 'active' : ''}`}
          onClick={() => setActiveTab('explainability')}
          style={{ background: activeTab === 'explainability' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : undefined, color: activeTab === 'explainability' ? 'white' : undefined }}
        >
          🔍 Explainability Hub
        </button>
      </div>

      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Row 1: Performance Trend */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid var(--primary-200)' }}>
              <div className="card-header" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', padding: '16px 24px' }}>
                <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Performance Trend</h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', margin: 0 }}>Last 30 days</p>
              </div>
              <div className="card-body" style={{ padding: '20px', background: 'white' }}>
                <div style={{ height: '280px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} domain={[75, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={2} dot={false} name="Accuracy" />
                      <Line type="monotone" dataKey="precision" stroke="#10b981" strokeWidth={2} dot={false} name="Precision" />
                      <Line type="monotone" dataKey="recall" stroke="#f59e0b" strokeWidth={2} dot={false} name="Recall" />
                    </LineChart>
                  </ResponsiveContainer>
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
                  <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Daily model evaluation metrics from production monitoring system.</p>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '6px' }}>METRICS</div>
                  <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Accuracy, Precision, and Recall tracked over 30-day rolling window.</p>
                </div>
                <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>KEY INSIGHTS</div>
                  <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                    <li>Stable performance with no degradation</li>
                    <li>All metrics above threshold</li>
                    <li>Consistent daily predictions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Daily Activity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid var(--success-200)' }}>
              <div className="card-header" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '16px 24px' }}>
                <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Daily Activity</h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', margin: 0 }}>Predictions and alerts</p>
              </div>
              <div className="card-body" style={{ padding: '20px', background: 'white' }}>
                <div style={{ height: '280px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={dailyPredictions}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                      <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
                      <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="predictions" fill="#93c5fd" radius={[4, 4, 0, 0]} name="Predictions" />
                      <Line yAxisId="right" type="monotone" dataKey="alerts" stroke="#ef4444" strokeWidth={2} name="Alerts" />
                    </ComposedChart>
                  </ResponsiveContainer>
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
                  <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Real-time prediction logs and alert triggers from the inference pipeline.</p>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '6px' }}>METHODOLOGY</div>
                  <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Daily aggregation of predictions (bars) and flagged alerts (line).</p>
                </div>
                <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>KEY INSIGHTS</div>
                  <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                    <li>Consistent daily prediction volume</li>
                    <li>Alert rate correlates with volume</li>
                    <li>No anomalous spikes detected</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Prediction Distribution */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)', border: '1px solid #c4b5fd' }}>
              <div className="card-header" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', padding: '16px 24px' }}>
                <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Prediction Distribution</h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', margin: 0 }}>Score distribution</p>
              </div>
              <div className="card-body" style={{ padding: '20px', background: 'white' }}>
                <div style={{ height: '280px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={predictionDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="range" stroke="#6b7280" fontSize={10} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="card" style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
              <div className="card-header" style={{ background: 'var(--gray-100)', padding: '16px 24px', borderBottom: '1px solid var(--gray-200)' }}>
                <h3 className="card-title" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-700)' }}>Explanation</h3>
              </div>
              <div className="card-body" style={{ padding: '20px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#7c3aed', marginBottom: '6px' }}>DATA SOURCE</div>
                  <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Histogram of model output probability scores from recent predictions.</p>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#7c3aed', marginBottom: '6px' }}>METHODOLOGY</div>
                  <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Scores binned into 10% ranges showing prediction confidence distribution.</p>
                </div>
                <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>KEY INSIGHTS</div>
                  <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                    <li>Distribution shows model confidence</li>
                    <li>Higher bins indicate strong predictions</li>
                    <li>Monitor for distribution drift</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Row 4: Confusion Matrix */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: '1px solid #fcd34d' }}>
              <div className="card-header" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', padding: '16px 24px' }}>
                <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Confusion Matrix</h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', margin: 0 }}>Classification results</p>
              </div>
              <div className="card-body" style={{ padding: '20px', background: 'white' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxWidth: '400px', margin: '0 auto' }}>
                  <div style={{ background: 'var(--success-50)', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--success-600)' }}>
                      {confusionMatrix.tp.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--success-600)', marginTop: '4px' }}>
                      True Positive
                    </div>
                  </div>
                  <div style={{ background: 'var(--danger-50)', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--danger-600)' }}>
                      {confusionMatrix.fp.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--danger-600)', marginTop: '4px' }}>
                      False Positive
                    </div>
                  </div>
                  <div style={{ background: 'var(--warning-50)', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--warning-600)' }}>
                      {confusionMatrix.fn.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--warning-600)', marginTop: '4px' }}>
                      False Negative
                    </div>
                  </div>
                  <div style={{ background: 'var(--primary-50)', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary-600)' }}>
                      {confusionMatrix.tn.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--primary-600)', marginTop: '4px' }}>
                      True Negative
                    </div>
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
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#d97706', marginBottom: '6px' }}>DATA SOURCE</div>
                  <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Classification results from model predictions vs actual outcomes.</p>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#d97706', marginBottom: '6px' }}>METHODOLOGY</div>
                  <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>2x2 matrix showing TP, TN, FP, FN for binary classification.</p>
                </div>
                <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>KEY INSIGHTS</div>
                  <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                    <li>High TP + TN = good accuracy</li>
                    <li>Low FP = few false alarms</li>
                    <li>Low FN = few missed cases</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'manual' && (
        <>
          {/* Section 1: INPUT */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header" style={{ background: 'var(--primary-50)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>1</div>
                <div>
                  <h3 className="card-title">Input</h3>
                  <p className="card-subtitle">Configure data source and upload files</p>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2" style={{ gap: '24px' }}>
                {/* Data Source Selection */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Data Source</h4>
                  <div className="form-group">
                    <label className="form-label">Source Type</label>
                    <select className="form-select">
                      <option>Upload File</option>
                      <option>Database Query</option>
                      <option>API Endpoint</option>
                      <option>S3 Bucket</option>
                      <option>Manual Entry</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">File Format</label>
                    <select className="form-select">
                      <option>CSV</option>
                      <option>JSON</option>
                      <option>Excel (.xlsx)</option>
                      <option>Parquet</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Encoding</label>
                    <select className="form-select">
                      <option>UTF-8</option>
                      <option>ASCII</option>
                      <option>ISO-8859-1</option>
                    </select>
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Upload Data</h4>
                  <div
                    style={{
                      border: '2px dashed var(--gray-300)',
                      borderRadius: '8px',
                      padding: '32px',
                      textAlign: 'center',
                      background: 'var(--gray-50)',
                    }}
                  >
                    <Icon name="upload" size={36} />
                    <p style={{ marginTop: '12px', color: 'var(--gray-600)', fontSize: '14px' }}>
                      Drag and drop files here
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '4px' }}>
                      CSV, JSON, Excel, Parquet (max 100MB)
                    </p>
                    <button className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }}>
                      Browse Files
                    </button>
                  </div>
                </div>
              </div>

              {/* Input Preview */}
              <div style={{ marginTop: '24px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Input Data Preview</h4>
                <div style={{ overflowX: 'auto', border: '1px solid var(--gray-200)', borderRadius: '8px' }}>
                  <table className="table" style={{ marginBottom: 0 }}>
                    <thead>
                      <tr>
                        <th>Customer ID</th>
                        <th>Age</th>
                        <th>Income</th>
                        <th>Credit Score</th>
                        <th>Loan Amount</th>
                        <th>Employment</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>C001</td><td>35</td><td>75,000</td><td>720</td><td>250,000</td><td>Employed</td></tr>
                      <tr><td>C002</td><td>42</td><td>92,000</td><td>680</td><td>180,000</td><td>Self-Employed</td></tr>
                      <tr><td>C003</td><td>28</td><td>55,000</td><td>750</td><td>120,000</td><td>Employed</td></tr>
                      <tr><td>C004</td><td>51</td><td>120,000</td><td>800</td><td>450,000</td><td>Employed</td></tr>
                      <tr><td>C005</td><td>33</td><td>68,000</td><td>695</td><td>200,000</td><td>Contract</td></tr>
                    </tbody>
                  </table>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '13px', color: 'var(--gray-500)' }}>
                  <span>Showing 5 of 1,234 records</span>
                  <span>6 columns detected</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: PROCESS */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header" style={{ background: 'var(--warning-50)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--warning-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>2</div>
                <div>
                  <h3 className="card-title">Process</h3>
                  <p className="card-subtitle">Configure model and processing parameters</p>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-3" style={{ gap: '24px' }}>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Model Settings</h4>
                  <div className="form-group">
                    <label className="form-label">Model Version</label>
                    <select className="form-select">
                      <option>v2.3.1 (Production)</option>
                      <option>v2.3.0</option>
                      <option>v2.2.4</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Prediction Threshold</label>
                    <input type="number" className="form-input" defaultValue="0.5" step="0.1" min="0" max="1" />
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Processing Options</h4>
                  <div className="form-group">
                    <label className="form-label">Batch Size</label>
                    <input type="number" className="form-input" defaultValue="1000" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Parallel Workers</label>
                    <select className="form-select">
                      <option>Auto</option>
                      <option>1</option>
                      <option>2</option>
                      <option>4</option>
                      <option>8</option>
                    </select>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Additional Options</h4>
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked />
                      <span>Generate explanations (SHAP)</span>
                    </label>
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked />
                      <span>Validate input data</span>
                    </label>
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" />
                      <span>Save intermediate results</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Process Status */}
              <div style={{ marginTop: '24px', padding: '20px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span style={{ fontWeight: '500' }}>Processing Status</span>
                  <span className="status-badge info"><span className="status-dot" />Ready to Run</span>
                </div>
                <div style={{ display: 'flex', gap: '32px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-600)' }}>1,234</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Records to Process</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success-600)' }}>~2m</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Est. Duration</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--warning-600)' }}>v2.3.1</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Model Version</div>
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                    <button className="btn btn-secondary">
                      <Icon name="settings" size={16} />
                      Advanced
                    </button>
                    <button className="btn btn-primary">
                      <Icon name="play" size={16} />
                      Run Process
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: OUTPUT */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header" style={{ background: 'var(--success-50)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--success-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>3</div>
                <div>
                  <h3 className="card-title">Output</h3>
                  <p className="card-subtitle">View and export prediction results</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary btn-sm">
                  <Icon name="filter" size={14} />
                  Filter
                </button>
                <button className="btn btn-secondary btn-sm">
                  <Icon name="download" size={14} />
                  Export
                </button>
              </div>
            </div>
            <div className="card-body">
              {/* Output Summary */}
              <div className="stats-grid" style={{ marginBottom: '24px' }}>
                <div className="stat-card">
                  <div className="stat-content">
                    <div className="stat-label">Total Processed</div>
                    <div className="stat-value">1,234</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-content">
                    <div className="stat-label">Approved</div>
                    <div className="stat-value" style={{ color: 'var(--success-600)' }}>892</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-content">
                    <div className="stat-label">Rejected</div>
                    <div className="stat-value" style={{ color: 'var(--danger-600)' }}>287</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-content">
                    <div className="stat-label">Review Required</div>
                    <div className="stat-value" style={{ color: 'var(--warning-600)' }}>55</div>
                  </div>
                </div>
              </div>

              {/* Output Table */}
              <div style={{ overflowX: 'auto', border: '1px solid var(--gray-200)', borderRadius: '8px' }}>
                <table className="table" style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th>Customer ID</th>
                      <th>Risk Score</th>
                      <th>Prediction</th>
                      <th>Confidence</th>
                      <th>Top Factors</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 500 }}>C001</td>
                      <td>0.23</td>
                      <td><span className="status-badge success">Approved</span></td>
                      <td>94.2%</td>
                      <td><span style={{ fontSize: '12px' }}>Credit Score, Income, Employment</span></td>
                      <td><button className="btn btn-icon btn-sm btn-secondary"><Icon name="eye" size={14} /></button></td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 500 }}>C002</td>
                      <td>0.67</td>
                      <td><span className="status-badge danger">Rejected</span></td>
                      <td>87.5%</td>
                      <td><span style={{ fontSize: '12px' }}>Debt Ratio, Late Payments</span></td>
                      <td><button className="btn btn-icon btn-sm btn-secondary"><Icon name="eye" size={14} /></button></td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 500 }}>C003</td>
                      <td>0.18</td>
                      <td><span className="status-badge success">Approved</span></td>
                      <td>96.1%</td>
                      <td><span style={{ fontSize: '12px' }}>Credit Score, Savings, Age</span></td>
                      <td><button className="btn btn-icon btn-sm btn-secondary"><Icon name="eye" size={14} /></button></td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 500 }}>C004</td>
                      <td>0.52</td>
                      <td><span className="status-badge warning">Review</span></td>
                      <td>62.3%</td>
                      <td><span style={{ fontSize: '12px' }}>Self-Employed, Loan Amount</span></td>
                      <td><button className="btn btn-icon btn-sm btn-secondary"><Icon name="eye" size={14} /></button></td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 500 }}>C005</td>
                      <td>0.31</td>
                      <td><span className="status-badge success">Approved</span></td>
                      <td>89.7%</td>
                      <td><span style={{ fontSize: '12px' }}>Income, Credit History</span></td>
                      <td><button className="btn btn-icon btn-sm btn-secondary"><Icon name="eye" size={14} /></button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Showing 5 of 1,234 results</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-secondary btn-sm">Previous</button>
                  <button className="btn btn-secondary btn-sm">Next</button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: VISUALIZATION */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header" style={{ background: 'var(--info-50)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--info-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>4</div>
                <div>
                  <h3 className="card-title">Visualization</h3>
                  <p className="card-subtitle">Charts and analytics for prediction results</p>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2" style={{ gap: '24px' }}>
                {/* Prediction Distribution */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Prediction Distribution</h4>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={predictionDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="range" stroke="#6b7280" fontSize={10} />
                        <YAxis stroke="#6b7280" fontSize={12} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Risk Score Trend */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Confidence Score Distribution</h4>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performanceHistory.slice(0, 20)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} domain={[70, 100]} />
                        <Tooltip />
                        <Area type="monotone" dataKey="accuracy" stroke="#10b981" fill="#6ee7b7" fillOpacity={0.5} name="Confidence" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Outcome Breakdown */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Outcome Breakdown</h4>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px' }}>Approved</span>
                        <span style={{ fontSize: '13px', fontWeight: '500' }}>72.3%</span>
                      </div>
                      <div className="progress-bar" style={{ height: '12px' }}>
                        <div className="progress-fill success" style={{ width: '72.3%' }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px' }}>Rejected</span>
                        <span style={{ fontSize: '13px', fontWeight: '500' }}>23.3%</span>
                      </div>
                      <div className="progress-bar" style={{ height: '12px' }}>
                        <div className="progress-fill danger" style={{ width: '23.3%' }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px' }}>Review Required</span>
                        <span style={{ fontSize: '13px', fontWeight: '500' }}>4.4%</span>
                      </div>
                      <div className="progress-bar" style={{ height: '12px' }}>
                        <div className="progress-fill warning" style={{ width: '4.4%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feature Impact */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Top Impact Features</h4>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={featureImportance.slice(0, 5)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" stroke="#6b7280" fontSize={12} domain={[0, 0.3]} />
                        <YAxis type="category" dataKey="feature" stroke="#6b7280" fontSize={12} width={80} />
                        <Tooltip />
                        <Bar dataKey="importance" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: TRANSACTION HISTORY */}
          <div className="card">
            <div className="card-header" style={{ background: 'var(--gray-100)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--gray-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>5</div>
                <div>
                  <h3 className="card-title">Transaction History</h3>
                  <p className="card-subtitle">Complete log of all manual executions</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select className="form-select" style={{ width: 'auto', height: '36px', fontSize: '13px' }}>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>All time</option>
                </select>
              </div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Executed By</th>
                    <th>Date & Time</th>
                    <th>Input Records</th>
                    <th>Output Records</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 'TXN-2025-0128-001', user: 'John Doe', time: '2025-01-28 09:30:15', input: '1,234', output: '1,234', duration: '2m 23s', status: 'completed' },
                    { id: 'TXN-2025-0127-003', user: 'Jane Smith', time: '2025-01-27 14:15:42', input: '5,678', output: '5,678', duration: '8m 12s', status: 'completed' },
                    { id: 'TXN-2025-0127-002', user: 'John Doe', time: '2025-01-27 10:00:00', input: '2,345', output: '0', duration: '1m 45s', status: 'failed' },
                    { id: 'TXN-2025-0126-001', user: 'Admin', time: '2025-01-26 16:45:30', input: '10,234', output: '10,234', duration: '15m 08s', status: 'completed' },
                    { id: 'TXN-2025-0125-002', user: 'Jane Smith', time: '2025-01-25 11:20:00', input: '3,456', output: '3,456', duration: '4m 32s', status: 'completed' },
                    { id: 'TXN-2025-0125-001', user: 'John Doe', time: '2025-01-25 08:00:00', input: '7,890', output: '7,890', duration: '12m 45s', status: 'completed' },
                  ].map((txn) => (
                    <tr key={txn.id}>
                      <td style={{ fontWeight: 500, fontFamily: 'monospace', fontSize: '13px' }}>{txn.id}</td>
                      <td>{txn.user}</td>
                      <td style={{ fontSize: '13px' }}>{txn.time}</td>
                      <td>{txn.input}</td>
                      <td>{txn.output}</td>
                      <td>{txn.duration}</td>
                      <td>
                        <span className={`status-badge ${txn.status === 'completed' ? 'success' : 'danger'}`}>
                          <span className="status-dot" />
                          {txn.status === 'completed' ? 'Completed' : 'Failed'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-icon btn-sm btn-secondary" title="View Details" onClick={() => handleViewTransactionDetails(txn)}>
                            <Icon name="eye" size={14} />
                          </button>
                          <button className="btn btn-icon btn-sm btn-secondary" title="Download Results" onClick={() => handleDownloadResults(txn)}>
                            <Icon name="download" size={14} />
                          </button>
                          <button className="btn btn-icon btn-sm btn-secondary" title="Re-run" onClick={() => handleRerunTransaction(txn)}>
                            <Icon name="refresh" size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Showing 6 of 48 transactions</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setNotification({ type: 'info', message: 'Loading previous page...' })}>Previous</button>
                <button className="btn btn-secondary btn-sm">1</button>
                <button className="btn btn-primary btn-sm">2</button>
                <button className="btn btn-secondary btn-sm">3</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setNotification({ type: 'info', message: 'Loading next page...' })}>Next</button>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'automated' && (
        <>
          <div className="alert success" style={{ marginBottom: '24px' }}>
            <span className="alert-icon">
              <Icon name="check" size={20} />
            </span>
            <div className="alert-content">
              <div className="alert-title">Automation Active</div>
              <div className="alert-message">
                This use case has 2 active schedules running automatically.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2" style={{ marginBottom: '24px' }}>
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Scheduled Jobs</h3>
                  <p className="card-subtitle">Automated pipeline executions</p>
                </div>
                <button className="btn btn-primary btn-sm">
                  <Icon name="plus" size={14} />
                  Add Schedule
                </button>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { name: 'Daily Batch Processing', schedule: 'Every day at 02:00 AM', nextRun: '2025-01-29 02:00', status: 'active' },
                    { name: 'Hourly Real-time Update', schedule: 'Every hour', nextRun: '2025-01-28 11:00', status: 'active' },
                    { name: 'Weekly Full Retrain', schedule: 'Every Sunday at 00:00', nextRun: '2025-02-02 00:00', status: 'paused' },
                  ].map((job, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                      <div className={`pipeline-status ${job.status === 'active' ? 'running' : 'pending'}`} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{job.name}</div>
                        <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>{job.schedule}</div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '4px' }}>
                          Next run: {job.nextRun}
                        </div>
                      </div>
                      <span className={`status-badge ${job.status === 'active' ? 'success' : 'neutral'}`}>
                        {job.status === 'active' ? 'Active' : 'Paused'}
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-icon btn-sm btn-secondary">
                          <Icon name="edit" size={14} />
                        </button>
                        <button className="btn btn-icon btn-sm btn-secondary">
                          <Icon name={job.status === 'active' ? 'pause' : 'play'} size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Trigger Conditions</h3>
                  <p className="card-subtitle">Event-based automation</p>
                </div>
                <button className="btn btn-secondary btn-sm">
                  <Icon name="plus" size={14} />
                  Add Trigger
                </button>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { name: 'New Data Available', condition: 'When new records > 1000', status: 'active' },
                    { name: 'Model Drift Detected', condition: 'When accuracy drops > 2%', status: 'active' },
                    { name: 'API Request', condition: 'On webhook trigger', status: 'active' },
                    { name: 'Upstream Pipeline Complete', condition: 'After preprocessing completes', status: 'inactive' },
                  ].map((trigger, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                      <Icon name="zap" size={18} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: '14px' }}>{trigger.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{trigger.condition}</div>
                      </div>
                      <span className={`status-badge ${trigger.status === 'active' ? 'success' : 'neutral'}`}>
                        {trigger.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <div>
                <h3 className="card-title">Automation Settings</h3>
              </div>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-3" style={{ gap: '24px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Retry on Failure</label>
                  <select className="form-select">
                    <option>3 retries</option>
                    <option>5 retries</option>
                    <option>No retry</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Timeout</label>
                  <select className="form-select">
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>2 hours</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Notification</label>
                  <select className="form-select">
                    <option>On failure only</option>
                    <option>Always</option>
                    <option>Never</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Automated Run History</h3>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Run ID</th>
                    <th>Trigger</th>
                    <th>Start Time</th>
                    <th>Duration</th>
                    <th>Records</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 'AR-2025-0128-005', trigger: 'Daily Batch', time: '2025-01-28 02:00', duration: '15m 23s', records: '125,432', status: 'completed' },
                    { id: 'AR-2025-0128-004', trigger: 'Hourly Update', time: '2025-01-28 10:00', duration: '2m 12s', records: '8,901', status: 'completed' },
                    { id: 'AR-2025-0128-003', trigger: 'Hourly Update', time: '2025-01-28 09:00', duration: '2m 05s', records: '7,654', status: 'completed' },
                    { id: 'AR-2025-0128-002', trigger: 'New Data', time: '2025-01-28 08:45', duration: '3m 45s', records: '12,345', status: 'completed' },
                    { id: 'AR-2025-0128-001', trigger: 'Hourly Update', time: '2025-01-28 08:00', duration: '1m 58s', records: '5,432', status: 'completed' },
                    { id: 'AR-2025-0127-024', trigger: 'Daily Batch', time: '2025-01-27 02:00', duration: '18m 30s', records: '142,567', status: 'completed' },
                  ].map((run) => (
                    <tr key={run.id}>
                      <td style={{ fontWeight: 500 }}>{run.id}</td>
                      <td>
                        <span className="status-badge info">
                          {run.trigger}
                        </span>
                      </td>
                      <td>{run.time}</td>
                      <td>{run.duration}</td>
                      <td>{run.records}</td>
                      <td>
                        <span className={`status-badge ${run.status === 'completed' ? 'success' : 'danger'}`}>
                          <span className="status-dot" />
                          {run.status === 'completed' ? 'Completed' : 'Failed'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-icon btn-sm btn-secondary">
                            <Icon name="eye" size={14} />
                          </button>
                          <button className="btn btn-icon btn-sm btn-secondary">
                            <Icon name="download" size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'performance' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Detailed Performance Metrics</h3>
              <p className="card-subtitle">Complete metrics over time</p>
            </div>
          </div>
          <div className="card-body">
            <div className="chart-container large">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} domain={[70, 100]} />
                  <Tooltip />
                  <Area type="monotone" dataKey="accuracy" stroke="#3b82f6" fill="#93c5fd" fillOpacity={0.5} name="Accuracy" />
                  <Area type="monotone" dataKey="precision" stroke="#10b981" fill="#6ee7b7" fillOpacity={0.5} name="Precision" />
                  <Area type="monotone" dataKey="recall" stroke="#f59e0b" fill="#fcd34d" fillOpacity={0.5} name="Recall" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'features' && (
        <div className="grid grid-cols-2">
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Feature Importance</h3>
                <p className="card-subtitle">Top contributing features</p>
              </div>
            </div>
            <div className="card-body">
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={featureImportance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" stroke="#6b7280" fontSize={12} domain={[0, 0.3]} />
                    <YAxis type="category" dataKey="feature" stroke="#6b7280" fontSize={12} width={80} />
                    <Tooltip />
                    <Bar dataKey="importance" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Importance" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Feature Statistics</h3>
                <p className="card-subtitle">Input feature details</p>
              </div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Type</th>
                    <th>Missing %</th>
                    <th>Importance</th>
                  </tr>
                </thead>
                <tbody>
                  {featureImportance.map((f, i) => (
                    <tr key={f.feature}>
                      <td style={{ fontWeight: 500 }}>{f.feature}</td>
                      <td>{i % 2 === 0 ? 'Numeric' : 'Categorical'}</td>
                      <td>{(Math.random() * 5).toFixed(2)}%</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="progress-bar" style={{ flex: 1, maxWidth: '100px' }}>
                            <div
                              className="progress-fill primary"
                              style={{ width: `${f.importance * 400}%` }}
                            />
                          </div>
                          <span>{(f.importance * 100).toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'workflow' && (
        <div className="workflow-tab-content">
          {/* Workflow Overview */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">End-to-End Workflow</h3>
              <p className="card-subtitle">Complete process flow from data ingestion to decision output</p>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {/* Stage 1: Data Collection */}
                <div style={{ display: 'flex', alignItems: 'stretch', gap: '24px' }}>
                  <div style={{ width: '180px', textAlign: 'right', paddingTop: '20px' }}>
                    <div style={{ fontWeight: '700', color: 'var(--primary-600)' }}>Stage 1</div>
                    <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Data Collection</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-500)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '18px' }}>1</div>
                    <div style={{ width: '2px', flex: 1, background: 'var(--primary-200)', minHeight: '60px' }} />
                  </div>
                  <div style={{ flex: 1, padding: '12px 20px', background: 'var(--primary-50)', borderRadius: '12px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      {['Core Banking', 'CRM System', 'External APIs', 'Document Store'].map((src, i) => (
                        <div key={i} style={{ padding: '8px 16px', background: 'white', borderRadius: '8px', fontSize: '13px', fontWeight: '500', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                          <Icon name="database" size={14} /> {src}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stage 2: Data Processing */}
                <div style={{ display: 'flex', alignItems: 'stretch', gap: '24px' }}>
                  <div style={{ width: '180px', textAlign: 'right', paddingTop: '20px' }}>
                    <div style={{ fontWeight: '700', color: 'var(--success-600)' }}>Stage 2</div>
                    <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Data Processing</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--success-500)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '18px' }}>2</div>
                    <div style={{ width: '2px', flex: 1, background: 'var(--success-200)', minHeight: '60px' }} />
                  </div>
                  <div style={{ flex: 1, padding: '12px 20px', background: 'var(--success-50)', borderRadius: '12px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {['Validation', 'Cleaning', 'Normalization', 'Feature Engineering'].map((step, i) => (
                        <React.Fragment key={i}>
                          <div style={{ padding: '8px 16px', background: 'white', borderRadius: '8px', fontSize: '13px', fontWeight: '500', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>{step}</div>
                          {i < 3 && <Icon name="chevron-right" size={16} style={{ color: 'var(--success-400)' }} />}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stage 3: Model Inference */}
                <div style={{ display: 'flex', alignItems: 'stretch', gap: '24px' }}>
                  <div style={{ width: '180px', textAlign: 'right', paddingTop: '20px' }}>
                    <div style={{ fontWeight: '700', color: 'var(--warning-600)' }}>Stage 3</div>
                    <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Model Inference</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--warning-500)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '18px' }}>3</div>
                    <div style={{ width: '2px', flex: 1, background: 'var(--warning-200)', minHeight: '60px' }} />
                  </div>
                  <div style={{ flex: 1, padding: '12px 20px', background: 'var(--warning-50)', borderRadius: '12px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                      <div style={{ padding: '16px 24px', background: 'white', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <Icon name="models" size={32} />
                        <div style={{ fontWeight: '600', marginTop: '8px' }}>ML Model</div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>XGBoost v2.3.1</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '13px' }}><strong>Input:</strong> 45 features</div>
                        <div style={{ fontSize: '13px' }}><strong>Output:</strong> Risk Score (0-1)</div>
                        <div style={{ fontSize: '13px' }}><strong>Latency:</strong> ~45ms</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stage 4: Decision Engine */}
                <div style={{ display: 'flex', alignItems: 'stretch', gap: '24px' }}>
                  <div style={{ width: '180px', textAlign: 'right', paddingTop: '20px' }}>
                    <div style={{ fontWeight: '700', color: 'var(--purple-600)' }}>Stage 4</div>
                    <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Decision Engine</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#8b5cf6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '18px' }}>4</div>
                    <div style={{ width: '2px', flex: 1, background: '#ddd6fe', minHeight: '60px' }} />
                  </div>
                  <div style={{ flex: 1, padding: '12px 20px', background: '#f5f3ff', borderRadius: '12px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ flex: 1, padding: '12px', background: 'var(--success-100)', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontWeight: '600', color: 'var(--success-700)' }}>Auto Approve</div>
                        <div style={{ fontSize: '12px', color: 'var(--success-600)' }}>Score {'<'} 0.3</div>
                      </div>
                      <div style={{ flex: 1, padding: '12px', background: 'var(--warning-100)', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontWeight: '600', color: 'var(--warning-700)' }}>Manual Review</div>
                        <div style={{ fontSize: '12px', color: 'var(--warning-600)' }}>0.3 - 0.7</div>
                      </div>
                      <div style={{ flex: 1, padding: '12px', background: 'var(--danger-100)', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontWeight: '600', color: 'var(--danger-700)' }}>Auto Reject</div>
                        <div style={{ fontSize: '12px', color: 'var(--danger-600)' }}>Score {'>'} 0.7</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stage 5: Output & Actions */}
                <div style={{ display: 'flex', alignItems: 'stretch', gap: '24px' }}>
                  <div style={{ width: '180px', textAlign: 'right', paddingTop: '20px' }}>
                    <div style={{ fontWeight: '700', color: 'var(--danger-600)' }}>Stage 5</div>
                    <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Output & Actions</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--danger-500)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '18px' }}>5</div>
                  </div>
                  <div style={{ flex: 1, padding: '12px 20px', background: 'var(--danger-50)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      {['API Response', 'Notification', 'Audit Log', 'Dashboard Update', 'Downstream Systems'].map((action, i) => (
                        <div key={i} style={{ padding: '8px 16px', background: 'white', borderRadius: '8px', fontSize: '13px', fontWeight: '500', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                          <Icon name="zap" size={14} /> {action}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Workflow Metrics */}
          <div className="grid grid-cols-4" style={{ marginBottom: '24px' }}>
            <div className="stat-card">
              <div className="stat-icon primary"><Icon name="clock" size={24} /></div>
              <div className="stat-content">
                <div className="stat-label">Avg. Processing Time</div>
                <div className="stat-value">1.2s</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon success"><Icon name="check" size={24} /></div>
              <div className="stat-content">
                <div className="stat-label">Success Rate</div>
                <div className="stat-value">99.8%</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon warning"><Icon name="zap" size={24} /></div>
              <div className="stat-content">
                <div className="stat-label">Daily Volume</div>
                <div className="stat-value">12,500</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon danger"><Icon name="alert-triangle" size={24} /></div>
              <div className="stat-content">
                <div className="stat-label">Error Rate</div>
                <div className="stat-value">0.02%</div>
              </div>
            </div>
          </div>

          {/* Workflow Details */}
          <div className="grid grid-cols-2">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Process Steps Detail</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { step: 'Data Ingestion', duration: '150ms', status: 'success', description: 'Fetch data from multiple sources' },
                    { step: 'Data Validation', duration: '80ms', status: 'success', description: 'Schema and quality checks' },
                    { step: 'Feature Extraction', duration: '200ms', status: 'success', description: 'Extract 45 features from raw data' },
                    { step: 'Normalization', duration: '50ms', status: 'success', description: 'Scale features to [0,1] range' },
                    { step: 'Model Prediction', duration: '45ms', status: 'success', description: 'Run inference on ML model' },
                    { step: 'Post-Processing', duration: '30ms', status: 'success', description: 'Apply business rules' },
                    { step: 'Response Generation', duration: '20ms', status: 'success', description: 'Format and return results' },
                  ].map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--success-500)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600' }}>{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500' }}>{step.step}</div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{step.description}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '600', color: 'var(--primary-600)' }}>{step.duration}</div>
                        <span className="status-badge success" style={{ fontSize: '10px' }}>OK</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Integration Points</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { name: 'Core Banking API', type: 'Input', protocol: 'REST', status: 'active' },
                    { name: 'Customer Data Platform', type: 'Input', protocol: 'gRPC', status: 'active' },
                    { name: 'Credit Bureau', type: 'Input', protocol: 'SOAP', status: 'active' },
                    { name: 'Decision Service', type: 'Output', protocol: 'REST', status: 'active' },
                    { name: 'Notification Hub', type: 'Output', protocol: 'Kafka', status: 'active' },
                    { name: 'Audit System', type: 'Output', protocol: 'REST', status: 'active' },
                  ].map((int, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                      <Icon name={int.type === 'Input' ? 'download' : 'upload'} size={18} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500' }}>{int.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{int.protocol}</div>
                      </div>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', background: int.type === 'Input' ? 'var(--primary-100)' : 'var(--success-100)', color: int.type === 'Input' ? 'var(--primary-700)' : 'var(--success-700)' }}>{int.type}</span>
                      <span className="status-badge success">Active</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'governance' && (
        <>
          <div className="alert info" style={{ marginBottom: '24px' }}>
            <span className="alert-icon">
              <Icon name="info" size={20} />
            </span>
            <div className="alert-content">
              <div className="alert-title">AI Governance Score</div>
              <div className="alert-message">
                This use case has been evaluated for explainability, fairness, robustness, and privacy compliance.
              </div>
            </div>
          </div>

          <div className="governance-scores" style={{ marginBottom: '24px' }}>
            <div className="governance-score-card">
              <div className="governance-score-value score-excellent">92</div>
              <div className="governance-score-label">Explainability</div>
            </div>
            <div className="governance-score-card">
              <div className="governance-score-value score-good">87</div>
              <div className="governance-score-label">Fairness</div>
            </div>
            <div className="governance-score-card">
              <div className="governance-score-value score-excellent">95</div>
              <div className="governance-score-label">Robustness</div>
            </div>
            <div className="governance-score-card">
              <div className="governance-score-value score-good">89</div>
              <div className="governance-score-label">Privacy</div>
            </div>
            <div className="governance-score-card">
              <div className="governance-score-value score-excellent">91</div>
              <div className="governance-score-label">Overall</div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Governance Checklist</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Model documentation complete', status: 'pass' },
                  { label: 'Bias testing performed', status: 'pass' },
                  { label: 'Data lineage tracked', status: 'pass' },
                  { label: 'Performance thresholds defined', status: 'pass' },
                  { label: 'Explainability report generated', status: 'pass' },
                  { label: 'Privacy impact assessment', status: 'warning' },
                  { label: 'Model approved for production', status: 'pass' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                    <span style={{ color: item.status === 'pass' ? 'var(--success-600)' : 'var(--warning-600)' }}>
                      <Icon name={item.status === 'pass' ? 'check' : 'alert-triangle'} size={20} />
                    </span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    <span className={`status-badge ${item.status === 'pass' ? 'success' : 'warning'}`}>
                      {item.status === 'pass' ? 'Passed' : 'Review'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'automation' && (
        <div className="automation-tab-content">
          {/* Automation Overview */}
          <div className="grid grid-cols-4" style={{ marginBottom: '24px' }}>
            {[
              { label: 'Automated Steps', value: '12', icon: 'pipelines', color: 'var(--primary-500)' },
              { label: 'Manual Steps', value: '2', icon: 'user', color: 'var(--warning-500)' },
              { label: 'Automation Rate', value: '85.7%', icon: 'zap', color: 'var(--success-500)' },
              { label: 'Avg. Run Time', value: '45 min', icon: 'clock', color: 'var(--purple-500)' },
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

          {/* End-to-End Pipeline Flow */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">End-to-End Pipeline Flow</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => handleExport('Pipeline Diagram')}>
                  <Icon name="download" size={14} /> Export
                </button>
                <button className="btn btn-primary btn-sm" onClick={handleRunPipeline}>
                  <Icon name="play" size={14} /> Run Pipeline
                </button>
              </div>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Pipeline Stages */}
                {[
                  { stage: 'Data Ingestion', steps: [
                    { name: 'Source Connection', status: 'automated', tool: 'Kafka Connect', duration: '2m' },
                    { name: 'Data Extraction', status: 'automated', tool: 'Spark Streaming', duration: '5m' },
                    { name: 'Schema Validation', status: 'automated', tool: 'Great Expectations', duration: '1m' },
                  ]},
                  { stage: 'Data Processing', steps: [
                    { name: 'Data Cleaning', status: 'automated', tool: 'PySpark', duration: '8m' },
                    { name: 'Data Transformation', status: 'automated', tool: 'dbt', duration: '6m' },
                    { name: 'Feature Engineering', status: 'automated', tool: 'Feature Store', duration: '10m' },
                  ]},
                  { stage: 'Model Training', steps: [
                    { name: 'Data Splitting', status: 'automated', tool: 'Scikit-learn', duration: '1m' },
                    { name: 'Model Training', status: 'automated', tool: 'XGBoost/TensorFlow', duration: '15m' },
                    { name: 'Hyperparameter Tuning', status: 'manual', tool: 'Optuna', duration: '30m' },
                  ]},
                  { stage: 'Model Validation', steps: [
                    { name: 'Performance Metrics', status: 'automated', tool: 'MLflow', duration: '2m' },
                    { name: 'Bias Testing', status: 'automated', tool: 'Fairlearn', duration: '5m' },
                    { name: 'Approval Gate', status: 'manual', tool: 'Human Review', duration: '24h' },
                  ]},
                  { stage: 'Deployment', steps: [
                    { name: 'Model Packaging', status: 'automated', tool: 'Docker', duration: '3m' },
                    { name: 'Deployment', status: 'automated', tool: 'Kubernetes', duration: '5m' },
                    { name: 'Monitoring Setup', status: 'automated', tool: 'Prometheus', duration: '1m' },
                  ]},
                ].map((stage, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
                    {/* Stage Label */}
                    <div style={{ minWidth: '150px', padding: '12px 16px', background: 'var(--primary-500)', color: 'white', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', opacity: 0.8 }}>Stage {i + 1}</div>
                      <div style={{ fontWeight: '600' }}>{stage.stage}</div>
                    </div>

                    {/* Steps */}
                    <div style={{ flex: 1, display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {stage.steps.map((step, j) => (
                        <React.Fragment key={j}>
                          <div style={{
                            flex: 1,
                            padding: '12px',
                            background: step.status === 'automated' ? 'var(--success-50)' : 'var(--warning-50)',
                            borderRadius: '8px',
                            border: `2px solid ${step.status === 'automated' ? 'var(--success-200)' : 'var(--warning-200)'}`
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontWeight: '500', fontSize: '13px' }}>{step.name}</span>
                              <span className={`status-badge ${step.status === 'automated' ? 'success' : 'warning'}`} style={{ fontSize: '10px' }}>
                                {step.status === 'automated' ? 'Auto' : 'Manual'}
                              </span>
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{step.tool}</div>
                            <div style={{ fontSize: '11px', color: 'var(--primary-600)', marginTop: '4px' }}>{step.duration}</div>
                          </div>
                          {j < stage.steps.length - 1 && <div style={{ color: 'var(--gray-400)', fontSize: '18px' }}>→</div>}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Arrow to next stage */}
                    {i < 4 && (
                      <div style={{ position: 'absolute', right: '50%', marginTop: '60px', color: 'var(--gray-400)', fontSize: '24px', transform: 'rotate(90deg)' }}>↓</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pipeline Configuration */}
          <div className="grid grid-cols-2" style={{ gap: '24px', marginBottom: '24px' }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Pipeline Configuration</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { config: 'Orchestrator', value: 'Apache Airflow', status: 'active' },
                    { config: 'Scheduler', value: 'Cron-based (0 */4 * * *)', status: 'active' },
                    { config: 'Retry Policy', value: '3 retries, exponential backoff', status: 'active' },
                    { config: 'Timeout', value: '4 hours max', status: 'active' },
                    { config: 'Parallelism', value: 'Up to 5 concurrent tasks', status: 'active' },
                    { config: 'Notifications', value: 'Slack + Email on failure', status: 'active' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--gray-50)', borderRadius: '6px' }}>
                      <span style={{ fontWeight: '500', fontSize: '13px' }}>{item.config}</span>
                      <span style={{ fontSize: '12px', color: 'var(--gray-600)' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Recent Pipeline Runs</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { id: 'RUN-2025-0128-001', time: 'Today 10:00 AM', duration: '42m', status: 'success' },
                    { id: 'RUN-2025-0128-002', time: 'Today 6:00 AM', duration: '45m', status: 'success' },
                    { id: 'RUN-2025-0127-001', time: 'Yesterday 10:00 PM', duration: '48m', status: 'success' },
                    { id: 'RUN-2025-0127-002', time: 'Yesterday 6:00 PM', duration: '44m', status: 'success' },
                    { id: 'RUN-2025-0127-003', time: 'Yesterday 2:00 PM', duration: '51m', status: 'failed' },
                  ].map((run, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--gray-50)', borderRadius: '6px' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--primary-600)' }}>{run.id}</span>
                      <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{run.time}</span>
                      <span style={{ fontSize: '12px' }}>{run.duration}</span>
                      <span className={`status-badge ${run.status === 'success' ? 'success' : 'danger'}`}>{run.status}</span>
                      <button className="btn btn-icon btn-sm btn-secondary" onClick={() => handleViewJob({ name: run.id, status: run.status, schedule: 'On-demand', lastRun: run.time, duration: run.duration })}>
                        <Icon name="eye" size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* DAG Visualization */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">DAG (Directed Acyclic Graph) Visualization</h3>
            </div>
            <div className="card-body">
              <div style={{ padding: '24px', background: 'var(--gray-50)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  {/* Level 1 */}
                  <div style={{ display: 'flex', gap: '24px' }}>
                    <div style={{ padding: '12px 24px', background: 'var(--primary-500)', color: 'white', borderRadius: '8px', fontWeight: '600' }}>Start</div>
                  </div>
                  <div style={{ color: 'var(--gray-400)' }}>↓</div>

                  {/* Level 2 - Parallel */}
                  <div style={{ display: 'flex', gap: '48px' }}>
                    {['Extract Transactions', 'Extract Customers', 'Extract External'].map((task, i) => (
                      <div key={i} style={{ padding: '12px 16px', background: 'var(--success-100)', border: '2px solid var(--success-300)', borderRadius: '8px', fontSize: '12px', fontWeight: '500' }}>{task}</div>
                    ))}
                  </div>
                  <div style={{ color: 'var(--gray-400)' }}>↓</div>

                  {/* Level 3 */}
                  <div style={{ padding: '12px 24px', background: 'var(--warning-100)', border: '2px solid var(--warning-300)', borderRadius: '8px', fontWeight: '500' }}>Join & Transform</div>
                  <div style={{ color: 'var(--gray-400)' }}>↓</div>

                  {/* Level 4 - Parallel */}
                  <div style={{ display: 'flex', gap: '48px' }}>
                    {['Feature Engineering', 'Data Validation'].map((task, i) => (
                      <div key={i} style={{ padding: '12px 16px', background: 'var(--purple-100)', border: '2px solid var(--purple-300)', borderRadius: '8px', fontSize: '12px', fontWeight: '500' }}>{task}</div>
                    ))}
                  </div>
                  <div style={{ color: 'var(--gray-400)' }}>↓</div>

                  {/* Level 5 */}
                  <div style={{ padding: '12px 24px', background: 'var(--danger-100)', border: '2px solid var(--danger-300)', borderRadius: '8px', fontWeight: '500' }}>Model Training</div>
                  <div style={{ color: 'var(--gray-400)' }}>↓</div>

                  {/* Level 6 - Parallel */}
                  <div style={{ display: 'flex', gap: '48px' }}>
                    {['Evaluate Metrics', 'Bias Check', 'Explain Model'].map((task, i) => (
                      <div key={i} style={{ padding: '12px 16px', background: 'var(--cyan-100)', border: '2px solid var(--cyan-300)', borderRadius: '8px', fontSize: '12px', fontWeight: '500' }}>{task}</div>
                    ))}
                  </div>
                  <div style={{ color: 'var(--gray-400)' }}>↓</div>

                  {/* Level 7 */}
                  <div style={{ display: 'flex', gap: '24px' }}>
                    <div style={{ padding: '12px 24px', background: 'var(--primary-500)', color: 'white', borderRadius: '8px', fontWeight: '600' }}>Deploy & Monitor</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'data' && (
        <div className="data-tab-content">
          {/* Data Pipeline Overview */}
          <div className="grid grid-cols-4" style={{ marginBottom: '24px' }}>
            <div className="stat-card">
              <div className="stat-icon primary"><Icon name="database" size={24} /></div>
              <div className="stat-content">
                <div className="stat-label">Data Sources</div>
                <div className="stat-value">5</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon success"><Icon name="check" size={24} /></div>
              <div className="stat-content">
                <div className="stat-label">Data Quality</div>
                <div className="stat-value">98.2%</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon warning"><Icon name="pipelines" size={24} /></div>
              <div className="stat-content">
                <div className="stat-label">Total Records</div>
                <div className="stat-value">2.5M</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon danger"><Icon name="clock" size={24} /></div>
              <div className="stat-content">
                <div className="stat-label">Storage Size</div>
                <div className="stat-value">1.2 TB</div>
              </div>
            </div>
          </div>

          {/* Data Sources List */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Data Sources</h3>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Source Name</th>
                    <th>Data Type</th>
                    <th>Format</th>
                    <th>Records</th>
                    <th>Size</th>
                    <th>Refresh Rate</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Transaction Database', type: 'Transactional', format: 'PostgreSQL', records: '1.2M', size: '450 GB', refresh: 'Real-time', status: 'active' },
                    { name: 'Customer Profiles', type: 'Master Data', format: 'MongoDB', records: '500K', size: '120 GB', refresh: 'Daily', status: 'active' },
                    { name: 'External Bureau Data', type: 'Third-party', format: 'API/JSON', records: '800K', size: '80 GB', refresh: 'Weekly', status: 'active' },
                    { name: 'Historical Records', type: 'Archive', format: 'Parquet', records: '5M', size: '500 GB', refresh: 'Monthly', status: 'active' },
                    { name: 'Real-time Events', type: 'Streaming', format: 'Kafka/Avro', records: '10M/day', size: '50 GB/day', refresh: 'Real-time', status: 'active' },
                  ].map((source, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: '500' }}>{source.name}</td>
                      <td><span className="status-badge secondary">{source.type}</span></td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{source.format}</td>
                      <td>{source.records}</td>
                      <td>{source.size}</td>
                      <td>{source.refresh}</td>
                      <td><span className="status-badge success">Active</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Data Types & Schema */}
          <div className="grid grid-cols-2" style={{ marginBottom: '24px' }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Data Types Distribution</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { type: 'Numerical (Continuous)', count: 18, color: 'var(--primary-500)', examples: 'amount, balance, income' },
                    { type: 'Numerical (Discrete)', count: 8, color: 'var(--success-500)', examples: 'count, age, tenure' },
                    { type: 'Categorical (Nominal)', count: 12, color: 'var(--warning-500)', examples: 'category, status, type' },
                    { type: 'Categorical (Ordinal)', count: 4, color: 'var(--danger-500)', examples: 'rating, risk_level' },
                    { type: 'DateTime', count: 6, color: 'var(--purple-500)', examples: 'created_at, updated_at' },
                    { type: 'Text/String', count: 5, color: 'var(--gray-500)', examples: 'description, notes' },
                    { type: 'Boolean', count: 3, color: 'var(--cyan-500)', examples: 'is_active, is_verified' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: item.color, flexShrink: 0 }}></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '500' }}>{item.type}</span>
                          <span style={{ fontSize: '13px', fontWeight: '600' }}>{item.count} features</span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>e.g., {item.examples}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Feature Categories</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {[
                    { category: 'Demographics', features: 8, color: 'var(--primary-100)' },
                    { category: 'Financial', features: 12, color: 'var(--success-100)' },
                    { category: 'Behavioral', features: 15, color: 'var(--warning-100)' },
                    { category: 'Temporal', features: 6, color: 'var(--danger-100)' },
                    { category: 'Geographic', features: 4, color: 'var(--purple-100)' },
                    { category: 'Derived', features: 11, color: 'var(--cyan-100)' },
                  ].map((cat, i) => (
                    <div key={i} style={{ padding: '12px 16px', background: cat.color, borderRadius: '8px', textAlign: 'center', minWidth: '120px' }}>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>{cat.category}</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>{cat.features} features</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* US Sample Data */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Sample Data (US Region)</h3>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Customer ID</th>
                    <th>Name</th>
                    <th>City</th>
                    <th>State</th>
                    <th>Age</th>
                    <th>Income</th>
                    <th>Credit Score</th>
                    <th>Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 'C10045821', name: 'James Wilson', city: 'New York', state: 'NY', age: 34, income: '$85,000', score: 742, risk: 'Low' },
                    { id: 'C10045822', name: 'Emily Johnson', city: 'Los Angeles', state: 'CA', age: 28, income: '$72,500', score: 698, risk: 'Medium' },
                    { id: 'C10045823', name: 'Michael Brown', city: 'Chicago', state: 'IL', age: 45, income: '$125,000', score: 785, risk: 'Low' },
                    { id: 'C10045824', name: 'Sarah Davis', city: 'Houston', state: 'TX', age: 31, income: '$68,000', score: 712, risk: 'Low' },
                    { id: 'C10045825', name: 'Robert Miller', city: 'Phoenix', state: 'AZ', age: 52, income: '$95,000', score: 658, risk: 'Medium' },
                    { id: 'C10045826', name: 'Jennifer Garcia', city: 'Philadelphia', state: 'PA', age: 39, income: '$78,500', score: 725, risk: 'Low' },
                    { id: 'C10045827', name: 'David Martinez', city: 'San Antonio', state: 'TX', age: 42, income: '$62,000', score: 645, risk: 'High' },
                    { id: 'C10045828', name: 'Lisa Anderson', city: 'San Diego', state: 'CA', age: 29, income: '$88,000', score: 756, risk: 'Low' },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{row.id}</td>
                      <td style={{ fontWeight: '500' }}>{row.name}</td>
                      <td>{row.city}</td>
                      <td><span style={{ padding: '2px 8px', background: 'var(--primary-100)', borderRadius: '4px', fontSize: '12px' }}>{row.state}</span></td>
                      <td>{row.age}</td>
                      <td style={{ fontWeight: '500' }}>{row.income}</td>
                      <td style={{ fontWeight: '600', color: row.score >= 720 ? 'var(--success-600)' : row.score >= 670 ? 'var(--warning-600)' : 'var(--danger-600)' }}>{row.score}</td>
                      <td><span className={`status-badge ${row.risk === 'Low' ? 'success' : row.risk === 'Medium' ? 'warning' : 'danger'}`}>{row.risk}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* US Geographic Distribution */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Geographic Distribution (US)</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-5" style={{ gap: '12px' }}>
                {[
                  { state: 'California', abbr: 'CA', customers: '245K', pct: '18%' },
                  { state: 'Texas', abbr: 'TX', customers: '198K', pct: '15%' },
                  { state: 'New York', abbr: 'NY', customers: '175K', pct: '13%' },
                  { state: 'Florida', abbr: 'FL', customers: '156K', pct: '12%' },
                  { state: 'Illinois', abbr: 'IL', customers: '98K', pct: '7%' },
                  { state: 'Pennsylvania', abbr: 'PA', customers: '85K', pct: '6%' },
                  { state: 'Ohio', abbr: 'OH', customers: '72K', pct: '5%' },
                  { state: 'Georgia', abbr: 'GA', customers: '68K', pct: '5%' },
                  { state: 'Arizona', abbr: 'AZ', customers: '54K', pct: '4%' },
                  { state: 'Other', abbr: '...', customers: '199K', pct: '15%' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontWeight: '700', fontSize: '18px', color: 'var(--primary-600)' }}>{item.abbr}</div>
                    <div style={{ fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>{item.state}</div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{item.customers}</div>
                    <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{item.pct} of total</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Image Data - Only for Computer Vision Use Cases */}
          {useCase.mlType === 'computer-vision' && (
            <>
              <div className="card" style={{ marginBottom: '24px', border: '2px solid var(--purple-200)' }}>
                <div className="card-header" style={{ background: 'var(--purple-50)' }}>
                  <h3 className="card-title" style={{ color: 'var(--purple-700)' }}>
                    <Icon name="eye" size={18} style={{ marginRight: '8px' }} />
                    Image Data Specifications
                  </h3>
                  <span className="status-badge" style={{ background: 'var(--purple-500)', color: 'white' }}>Computer Vision</span>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-4" style={{ gap: '16px', marginBottom: '24px' }}>
                    {[
                      { label: 'Total Images', value: '125,000', icon: 'image' },
                      { label: 'Storage Size', value: '45 GB', icon: 'database' },
                      { label: 'Avg Resolution', value: '1024x768', icon: 'monitor' },
                      { label: 'Format', value: 'PNG/JPEG', icon: 'file' },
                    ].map((stat, i) => (
                      <div key={i} style={{ padding: '16px', background: 'var(--purple-50)', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '4px' }}>{stat.label}</div>
                        <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--purple-600)' }}>{stat.value}</div>
                      </div>
                    ))}
                  </div>

                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Image Categories</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                    {[
                      { category: 'US Driver Licenses', count: '35,000', states: 'All 50 states + DC', samples: ['California DL', 'Texas DL', 'New York DL', 'Florida DL'] },
                      { category: 'US Passports', count: '25,000', states: 'Standard & Card format', samples: ['Passport Book', 'Passport Card', 'Emergency Passport'] },
                      { category: 'State ID Cards', count: '30,000', states: 'All 50 states', samples: ['California ID', 'Illinois ID', 'Pennsylvania ID'] },
                      { category: 'Selfie/Face Images', count: '20,000', states: 'Diverse demographics', samples: ['Portrait photos', 'Liveness checks', 'ID-Selfie pairs'] },
                      { category: 'Supporting Documents', count: '15,000', states: 'US-issued', samples: ['Utility Bills', 'Bank Statements', 'Social Security Cards'] },
                    ].map((cat, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', marginBottom: '4px' }}>{cat.category}</div>
                          <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{cat.states}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flex: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                          {cat.samples.map((s, j) => (
                            <span key={j} style={{ padding: '4px 8px', background: 'var(--purple-100)', color: 'var(--purple-700)', borderRadius: '4px', fontSize: '11px' }}>{s}</span>
                          ))}
                        </div>
                        <div style={{ textAlign: 'right', minWidth: '80px' }}>
                          <div style={{ fontWeight: '600', color: 'var(--purple-600)' }}>{cat.count}</div>
                          <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>images</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Image Preprocessing Pipeline */}
              <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-header">
                  <h3 className="card-title">Image Preprocessing Pipeline</h3>
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                    {[
                      { step: 'Load', desc: 'Read image files' },
                      { step: 'Resize', desc: '224x224 / 512x512' },
                      { step: 'Normalize', desc: 'Mean/Std scaling' },
                      { step: 'Augment', desc: 'Rotate, flip, crop' },
                      { step: 'Encode', desc: 'CNN feature extraction' },
                      { step: 'Classify', desc: 'Model inference' },
                    ].map((step, i) => (
                      <React.Fragment key={i}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--purple-500)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '14px' }}>
                            {i + 1}
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: '600' }}>{step.step}</span>
                          <span style={{ fontSize: '10px', color: 'var(--gray-500)' }}>{step.desc}</span>
                        </div>
                        {i < 5 && <div style={{ flex: 1, height: '2px', background: 'var(--purple-300)', margin: '0 8px', marginBottom: '40px' }} />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              {/* CV Task Types */}
              <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-header">
                  <h3 className="card-title">CV Task Types: Segmentation, Detection & Classification</h3>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-3" style={{ gap: '24px', marginBottom: '24px' }}>
                    {/* Detection */}
                    <div style={{ padding: '20px', background: 'var(--primary-50)', borderRadius: '12px', border: '2px solid var(--primary-200)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name="target" size={24} style={{ color: 'white' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--primary-700)' }}>Detection</div>
                          <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Object localization</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {['Face Detection (MTCNN)', 'Document Detection (YOLO)', 'Text Region Detection (EAST)', 'Signature Detection', 'Barcode/QR Detection'].map((item, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'white', borderRadius: '6px', fontSize: '12px' }}>
                            <Icon name="check" size={14} style={{ color: 'var(--primary-500)' }} />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Classification */}
                    <div style={{ padding: '20px', background: 'var(--success-50)', borderRadius: '12px', border: '2px solid var(--success-200)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--success-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name="layers" size={24} style={{ color: 'white' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--success-700)' }}>Classification</div>
                          <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Category prediction</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {['Document Type (ResNet-50)', 'Fraud/Genuine (EfficientNet)', 'Face Recognition (ArcFace)', 'Character Recognition (CRNN)', 'Liveness Check (MobileNet)'].map((item, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'white', borderRadius: '6px', fontSize: '12px' }}>
                            <Icon name="check" size={14} style={{ color: 'var(--success-500)' }} />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Segmentation */}
                    <div style={{ padding: '20px', background: 'var(--purple-50)', borderRadius: '12px', border: '2px solid var(--purple-200)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--purple-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name="grid" size={24} style={{ color: 'white' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--purple-700)' }}>Segmentation</div>
                          <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Pixel-level masks</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {['Document Segmentation (U-Net)', 'Text Line Segmentation', 'Face Parsing (BiSeNet)', 'Background Removal', 'Field Extraction Masks'].map((item, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'white', borderRadius: '6px', fontSize: '12px' }}>
                            <Icon name="check" size={14} style={{ color: 'var(--purple-500)' }} />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Use Case to CV Task Mapping */}
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>CV Use Case Task Mapping</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { useCase: 'Identity Fraud Detection', detection: ['Face', 'Document', 'Signature'], classification: ['ID Type', 'Fraud Score', 'Face Match'], segmentation: ['Face Region', 'Document Fields'] },
                      { useCase: 'Synthetic Identity Detection', detection: ['Face', 'Manipulation Artifacts'], classification: ['Real vs Fake', 'GAN Detection'], segmentation: ['Tampered Regions'] },
                      { useCase: 'Document Verification', detection: ['Document Edges', 'Text Regions', 'Photo'], classification: ['Document Type', 'Validity'], segmentation: ['Field Extraction', 'MRZ Zone'] },
                      { useCase: 'Trade Document Verification', detection: ['Stamps', 'Signatures', 'Tables'], classification: ['Document Class', 'Authenticity'], segmentation: ['Text Blocks', 'Table Cells'] },
                      { useCase: 'Document Processing OCR', detection: ['Text Lines', 'Words', 'Characters'], classification: ['Character Recognition'], segmentation: ['Line Segmentation', 'Word Boundaries'] },
                    ].map((uc, i) => (
                      <div key={i} style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                        <div style={{ fontWeight: '600', marginBottom: '12px', fontSize: '14px' }}>{uc.useCase}</div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '11px', color: 'var(--primary-600)', fontWeight: '600', marginBottom: '6px' }}>DETECTION</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {uc.detection.map((d, j) => (
                                <span key={j} style={{ padding: '2px 8px', background: 'var(--primary-100)', color: 'var(--primary-700)', borderRadius: '4px', fontSize: '11px' }}>{d}</span>
                              ))}
                            </div>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '11px', color: 'var(--success-600)', fontWeight: '600', marginBottom: '6px' }}>CLASSIFICATION</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {uc.classification.map((c, j) => (
                                <span key={j} style={{ padding: '2px 8px', background: 'var(--success-100)', color: 'var(--success-700)', borderRadius: '4px', fontSize: '11px' }}>{c}</span>
                              ))}
                            </div>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '11px', color: 'var(--purple-600)', fontWeight: '600', marginBottom: '6px' }}>SEGMENTATION</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {uc.segmentation.map((s, j) => (
                                <span key={j} style={{ padding: '2px 8px', background: 'var(--purple-100)', color: 'var(--purple-700)', borderRadius: '4px', fontSize: '11px' }}>{s}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CV Model Architecture */}
              <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-header">
                  <h3 className="card-title">Computer Vision Models Used</h3>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Model</th>
                        <th>Architecture</th>
                        <th>Task Type</th>
                        <th>Purpose</th>
                        <th>Input Size</th>
                        <th>Accuracy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { model: 'Document Classifier', arch: 'ResNet-50', task: 'Classification', purpose: 'ID type classification', input: '224x224', acc: '99.2%' },
                        { model: 'Face Detection', arch: 'MTCNN', task: 'Detection', purpose: 'Face localization', input: 'Variable', acc: '99.5%' },
                        { model: 'Face Recognition', arch: 'ArcFace/ResNet', task: 'Classification', purpose: 'Identity verification', input: '112x112', acc: '99.8%' },
                        { model: 'OCR Engine', arch: 'CRNN + CTC', task: 'Classification', purpose: 'Text extraction', input: '32x320', acc: '98.5%' },
                        { model: 'Liveness Detection', arch: 'MobileNetV3', task: 'Classification', purpose: 'Anti-spoofing', input: '224x224', acc: '99.1%' },
                        { model: 'Document Quality', arch: 'EfficientNet-B0', task: 'Classification', purpose: 'Image quality check', input: '224x224', acc: '98.8%' },
                        { model: 'Text Detection', arch: 'EAST/DBNet', task: 'Detection', purpose: 'Text region detection', input: '512x512', acc: '98.2%' },
                        { model: 'Document Segmentation', arch: 'U-Net', task: 'Segmentation', purpose: 'Field extraction', input: '512x512', acc: '97.8%' },
                        { model: 'Face Parsing', arch: 'BiSeNet', task: 'Segmentation', purpose: 'Face region masks', input: '512x512', acc: '98.1%' },
                        { model: 'Object Detection', arch: 'YOLOv8', task: 'Detection', purpose: 'Document/stamp detection', input: '640x640', acc: '99.0%' },
                      ].map((m, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: '500' }}>{m.model}</td>
                          <td><span style={{ fontFamily: 'monospace', fontSize: '12px', padding: '2px 6px', background: 'var(--purple-100)', borderRadius: '4px' }}>{m.arch}</span></td>
                          <td><span className={`status-badge ${m.task === 'Detection' ? 'primary' : m.task === 'Classification' ? 'success' : 'warning'}`}>{m.task}</span></td>
                          <td style={{ color: 'var(--gray-600)' }}>{m.purpose}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{m.input}</td>
                          <td style={{ fontWeight: '600', color: 'var(--success-600)' }}>{m.acc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sample Images Preview */}
              <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-header">
                  <h3 className="card-title">Sample Image Data Preview</h3>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-4" style={{ gap: '16px' }}>
                    {[
                      { type: 'Driver License', state: 'California', id: 'DL-CA-001' },
                      { type: 'Driver License', state: 'Texas', id: 'DL-TX-001' },
                      { type: 'Passport', state: 'US Standard', id: 'PP-US-001' },
                      { type: 'State ID', state: 'New York', id: 'ID-NY-001' },
                    ].map((img, i) => (
                      <div key={i} style={{ padding: '16px', background: 'var(--gray-100)', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ width: '100%', height: '120px', background: 'linear-gradient(135deg, var(--purple-200) 0%, var(--purple-300) 100%)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                          <Icon name="eye" size={32} style={{ color: 'var(--purple-600)' }} />
                        </div>
                        <div style={{ fontWeight: '600', fontSize: '13px' }}>{img.type}</div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{img.state}</div>
                        <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--purple-600)', marginTop: '4px' }}>{img.id}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Data Pipeline Flow */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Data Pipeline Flow</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                {['Ingestion', 'Validation', 'Cleaning', 'Transform', 'Feature Eng.', 'EDA', 'Training'].map((step, i) => (
                  <React.Fragment key={step}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: i < 6 ? 'var(--success-500)' : 'var(--primary-500)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600' }}>
                        {i < 6 ? <Icon name="check" size={20} /> : <Icon name="play" size={20} />}
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '500' }}>{step}</span>
                    </div>
                    {i < 6 && <div style={{ flex: 1, height: '2px', background: i < 5 ? 'var(--success-500)' : 'var(--gray-300)', margin: '0 8px', marginBottom: '24px' }} />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Data Preprocessing */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Data Preprocessing Steps</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-3" style={{ gap: '16px' }}>
                {[
                  { step: 'Missing Value Handling', techniques: ['Mean/Median Imputation', 'KNN Imputation', 'MICE', 'Forward Fill'], applied: 12 },
                  { step: 'Outlier Treatment', techniques: ['IQR Method', 'Z-Score Clipping', 'Winsorization', 'Isolation Forest'], applied: 8 },
                  { step: 'Encoding', techniques: ['One-Hot Encoding', 'Label Encoding', 'Target Encoding', 'Frequency Encoding'], applied: 15 },
                  { step: 'Scaling', techniques: ['StandardScaler', 'MinMaxScaler', 'RobustScaler', 'PowerTransformer'], applied: 18 },
                  { step: 'Feature Selection', techniques: ['Correlation Filter', 'Variance Threshold', 'RFE', 'SHAP Importance'], applied: 45 },
                  { step: 'Balancing', techniques: ['SMOTE', 'ADASYN', 'Random Undersampling', 'Class Weights'], applied: 1 },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', marginBottom: '12px' }}>{item.step}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                      {item.techniques.map((t, j) => (
                        <span key={j} style={{ padding: '4px 8px', background: 'white', borderRadius: '4px', fontSize: '11px', border: '1px solid var(--gray-200)' }}>{t}</span>
                      ))}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--primary-600)' }}>Applied to {item.applied} features</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2" style={{ marginBottom: '24px' }}>
            {/* EDA Summary */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">EDA Summary</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', marginBottom: '8px' }}>Data Distribution</div>
                    <div style={{ display: 'flex', gap: '24px', fontSize: '13px' }}>
                      <div><span style={{ color: 'var(--gray-500)' }}>Records:</span> <strong>2,534,890</strong></div>
                      <div><span style={{ color: 'var(--gray-500)' }}>Features:</span> <strong>56</strong></div>
                      <div><span style={{ color: 'var(--gray-500)' }}>Target:</span> <strong>Binary</strong></div>
                    </div>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', marginBottom: '8px' }}>Data Quality Metrics</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Missing Values</span><span style={{ color: 'var(--success-600)' }}>1.2%</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Duplicates</span><span style={{ color: 'var(--success-600)' }}>0.05%</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Outliers Detected</span><span style={{ color: 'var(--warning-600)' }}>2.8%</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Data Completeness</span><span style={{ color: 'var(--success-600)' }}>98.8%</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Normalization & Standardization */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Data Transformation</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { name: 'Normalization', type: 'Min-Max Scaling', features: 12, range: '[0, 1]' },
                    { name: 'Standardization', type: 'Z-Score', features: 18, range: '[-3, 3]' },
                    { name: 'One-Hot Encoding', type: 'Categorical', features: 8, range: 'Binary' },
                    { name: 'Log Transform', type: 'Skewed Features', features: 5, range: 'Log scale' },
                  ].map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontWeight: '500' }}>{t.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{t.type}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '500' }}>{t.features} features</div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Range: {t.range}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Data Visualization */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Data Visualization - Feature Distribution</h3>
            </div>
            <div className="card-body">
              <div className="chart-container" style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={predictionDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="range" stroke="#6b7280" fontSize={11} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Distribution" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'model' && (
        <div className="model-tab-content">
          {/* Model Stats */}
          <div className="grid grid-cols-4" style={{ marginBottom: '24px' }}>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, var(--primary-50), var(--indigo-50))', border: '2px solid var(--primary-200)' }}>
              <div className="stat-icon primary"><Icon name="models" size={24} /></div>
              <div className="stat-content">
                <div className="stat-label">Total Models</div>
                <div className="stat-value">10</div>
              </div>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, var(--success-50), var(--emerald-50))', border: '2px solid var(--success-200)' }}>
              <div className="stat-icon success"><Icon name="target" size={24} /></div>
              <div className="stat-content">
                <div className="stat-label">Ensemble Accuracy</div>
                <div className="stat-value">{useCase.accuracy > 0 ? useCase.accuracy.toFixed(1) : 99.3}%</div>
              </div>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, var(--warning-50), var(--amber-50))', border: '2px solid var(--warning-200)' }}>
              <div className="stat-icon warning"><Icon name="cpu" size={24} /></div>
              <div className="stat-content">
                <div className="stat-label">Avg Training Time</div>
                <div className="stat-value">2.5h</div>
              </div>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, var(--purple-50), var(--violet-50))', border: '2px solid var(--purple-200)' }}>
              <div className="stat-icon" style={{ background: 'var(--purple-100)' }}><Icon name="trending-up" size={24} color="var(--purple-600)" /></div>
              <div className="stat-content">
                <div className="stat-label">Current Version</div>
                <div className="stat-value">v2.3.1</div>
              </div>
            </div>
          </div>

          {/* Model Cards with Different Colors */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Ensemble Model Inventory</h3>
              <p className="card-subtitle">Click on any model card to view detailed information</p>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
                {[
                  { name: 'XGBoost', type: 'Gradient Boosting', accuracy: '98.2%', color: 'primary', status: 'production', icon: 'zap', purpose: 'Primary tabular classification with high accuracy', framework: 'XGBoost 2.0', precision: '97.1%', recall: '96.8%', f1: '96.9%' },
                  { name: 'LightGBM', type: 'Gradient Boosting', accuracy: '97.8%', color: 'success', status: 'production', icon: 'zap', purpose: 'Fast training and efficient categorical handling', framework: 'LightGBM 4.0', precision: '96.5%', recall: '95.9%', f1: '96.2%' },
                  { name: 'CatBoost', type: 'Gradient Boosting', accuracy: '97.5%', color: 'teal', status: 'production', icon: 'layers', purpose: 'High-cardinality categorical feature processing', framework: 'CatBoost 1.2', precision: '96.2%', recall: '95.4%', f1: '95.8%' },
                  { name: 'Random Forest', type: 'Ensemble', accuracy: '96.1%', color: 'warning', status: 'production', icon: 'git-branch', purpose: 'Feature importance and model stability', framework: 'Scikit-learn 1.3', precision: '94.8%', recall: '94.2%', f1: '94.5%' },
                  { name: 'LSTM Network', type: 'Deep Learning', accuracy: '95.8%', color: 'purple', status: 'production', icon: 'activity', purpose: 'Sequential pattern detection in time series', framework: 'TensorFlow 2.14', precision: '94.5%', recall: '93.8%', f1: '94.1%' },
                  { name: 'Transformer', type: 'Deep Learning', accuracy: '94.2%', color: 'indigo', status: 'beta', icon: 'cpu', purpose: 'NLP text classification and embeddings', framework: 'HuggingFace 4.35', precision: '93.1%', recall: '92.5%', f1: '92.8%' },
                  { name: 'ResNet-50', type: 'CNN', accuracy: '96.5%', color: 'pink', status: 'production', icon: 'image', purpose: 'Document and image analysis', framework: 'PyTorch 2.1', precision: '95.2%', recall: '94.8%', f1: '95.0%' },
                  { name: 'Isolation Forest', type: 'Anomaly Detection', accuracy: '92.3%', color: 'orange', status: 'production', icon: 'alert-triangle', purpose: 'Unsupervised anomaly scoring', framework: 'Scikit-learn 1.3', precision: '91.2%', recall: '90.5%', f1: '90.8%' },
                  { name: 'AutoEncoder', type: 'Deep Learning', accuracy: '91.8%', color: 'cyan', status: 'beta', icon: 'refresh', purpose: 'Reconstruction-based anomaly detection', framework: 'TensorFlow 2.14', precision: '90.5%', recall: '89.8%', f1: '90.1%' },
                  { name: 'Meta-Learner', type: 'Neural Network', accuracy: '99.3%', color: 'danger', status: 'production', icon: 'star', purpose: 'Ensemble combination and final prediction', framework: 'PyTorch 2.1', precision: '98.2%', recall: '97.5%', f1: '97.8%' },
                ].map((model, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '16px',
                      background: `linear-gradient(135deg, var(--${model.color}-50), var(--${model.color}-100))`,
                      borderRadius: '12px',
                      border: `2px solid var(--${model.color}-200)`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => handleViewModelDetails(model)}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `var(--${model.color}-200)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name={model.icon} size={18} color={`var(--${model.color}-700)`} />
                      </div>
                      <span className={`status-badge ${model.status === 'production' ? 'success' : 'warning'}`} style={{ fontSize: '9px' }}>{model.status}</span>
                    </div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: `var(--${model.color}-800)`, marginBottom: '4px' }}>{model.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginBottom: '12px' }}>{model.type}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'rgba(255,255,255,0.7)', borderRadius: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--gray-500)' }}>Accuracy</span>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: `var(--${model.color}-700)` }}>{model.accuracy}</span>
                    </div>
                    <button
                      className="btn btn-sm"
                      style={{ width: '100%', marginTop: '12px', background: `var(--${model.color}-600)`, color: 'white', border: 'none' }}
                      onClick={(e) => { e.stopPropagation(); handleViewModelDetails(model); }}
                    >
                      <Icon name="eye" size={12} /> View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Model Configuration and Feature Importance */}
          <div className="grid grid-cols-2" style={{ marginBottom: '24px' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, var(--gray-50), white)' }}>
              <div className="card-header" style={{ background: 'var(--primary-50)' }}>
                <h3 className="card-title">Primary Model Configuration (XGBoost)</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { param: 'Learning Rate', value: '0.05', color: 'primary' },
                    { param: 'Max Depth', value: '8', color: 'success' },
                    { param: 'N Estimators', value: '500', color: 'warning' },
                    { param: 'Min Child Weight', value: '3', color: 'purple' },
                    { param: 'Subsample', value: '0.8', color: 'teal' },
                    { param: 'Colsample Bytree', value: '0.8', color: 'indigo' },
                  ].map((p, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: `var(--${p.color}-50)`, borderRadius: '8px', border: `1px solid var(--${p.color}-200)` }}>
                      <span style={{ color: 'var(--gray-600)', fontWeight: '500' }}>{p.param}</span>
                      <span style={{ fontWeight: '700', color: `var(--${p.color}-700)`, fontFamily: 'monospace' }}>{p.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card" style={{ background: 'linear-gradient(135deg, var(--gray-50), white)' }}>
              <div className="card-header" style={{ background: 'var(--success-50)' }}>
                <h3 className="card-title">Feature Importance</h3>
              </div>
              <div className="card-body">
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={featureImportance} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" stroke="#6b7280" fontSize={12} />
                      <YAxis type="category" dataKey="feature" stroke="#6b7280" fontSize={11} width={70} />
                      <Tooltip />
                      <Bar dataKey="importance" fill="#10b981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Model Version History */}
          <div className="card">
            <div className="card-header" style={{ background: 'var(--purple-50)' }}>
              <h3 className="card-title">Model Version History</h3>
            </div>
            <div className="card-body">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Version</th>
                    <th>Release Date</th>
                    <th>Accuracy</th>
                    <th>Changes</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {modelVersions.map((v, i) => (
                    <tr key={i} style={{ background: i === 0 ? 'var(--success-50)' : 'transparent' }}>
                      <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>{v.version}</td>
                      <td>{v.date}</td>
                      <td style={{ fontWeight: '600', color: 'var(--success-600)' }}>{v.accuracy}%</td>
                      <td style={{ fontSize: '12px', color: 'var(--gray-600)' }}>
                        {i === 0 ? 'Feature engineering improvements, hyperparameter tuning' : i === 1 ? 'Added LSTM model to ensemble' : 'Bug fixes and stability improvements'}
                      </td>
                      <td><span className={`status-badge ${v.status === 'production' ? 'success' : 'secondary'}`}>{v.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-icon btn-sm btn-secondary" title="View Details" onClick={() => handleViewModelDetails({ name: `Model ${v.version}`, type: 'Ensemble', accuracy: `${v.accuracy}%`, color: 'primary', status: v.status, framework: 'Multi-framework' })}>
                            <Icon name="eye" size={14} />
                          </button>
                          <button className="btn btn-icon btn-sm btn-secondary" title="Download" onClick={() => handleExport(`Model ${v.version}`)}>
                            <Icon name="download" size={14} />
                          </button>
                          {v.status !== 'production' && (
                            <button className="btn btn-icon btn-sm btn-primary" title="Rollback" onClick={() => setNotification({ type: 'info', message: `Rolling back to ${v.version}...` })}>
                              <Icon name="refresh" size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'accuracy' && (
        <div className="accuracy-tab-content">
          <div className="grid grid-cols-4" style={{ marginBottom: '24px' }}>
            <div className="stat-card">
              <div className="stat-icon success"><Icon name="target" size={24} /></div>
              <div className="stat-content">
                <div className="stat-label">Accuracy</div>
                <div className="stat-value">{useCase.accuracy > 0 ? useCase.accuracy.toFixed(1) + '%' : 'N/A'}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon primary"><Icon name="check" size={24} /></div>
              <div className="stat-content">
                <div className="stat-label">Precision</div>
                <div className="stat-value">{useCase.accuracy > 0 ? (useCase.accuracy - 0.5).toFixed(1) + '%' : 'N/A'}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon warning"><Icon name="zap" size={24} /></div>
              <div className="stat-content">
                <div className="stat-label">Recall</div>
                <div className="stat-value">{useCase.accuracy > 0 ? (useCase.accuracy - 1.2).toFixed(1) + '%' : 'N/A'}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon danger"><Icon name="trending-up" size={24} /></div>
              <div className="stat-content">
                <div className="stat-label">F1 Score</div>
                <div className="stat-value">{useCase.accuracy > 0 ? (useCase.accuracy - 0.8).toFixed(1) + '%' : 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Row 1: Confusion Matrix */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid var(--primary-200)' }}>
              <div className="card-header" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', padding: '16px 24px' }}>
                <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Confusion Matrix</h3>
              </div>
              <div className="card-body" style={{ padding: '20px', background: 'white' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', maxWidth: '320px', margin: '0 auto' }}>
                  <div style={{ padding: '24px', background: 'var(--success-100)', borderRadius: '8px 0 0 0', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success-700)' }}>{confusionMatrix.tp}</div>
                    <div style={{ fontSize: '12px', color: 'var(--success-600)' }}>True Positive</div>
                  </div>
                  <div style={{ padding: '24px', background: 'var(--danger-100)', borderRadius: '0 8px 0 0', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--danger-700)' }}>{confusionMatrix.fp}</div>
                    <div style={{ fontSize: '12px', color: 'var(--danger-600)' }}>False Positive</div>
                  </div>
                  <div style={{ padding: '24px', background: 'var(--danger-100)', borderRadius: '0 0 0 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--danger-700)' }}>{confusionMatrix.fn}</div>
                    <div style={{ fontSize: '12px', color: 'var(--danger-600)' }}>False Negative</div>
                  </div>
                  <div style={{ padding: '24px', background: 'var(--success-100)', borderRadius: '0 0 8px 0', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success-700)' }}>{confusionMatrix.tn}</div>
                    <div style={{ fontSize: '12px', color: 'var(--success-600)' }}>True Negative</div>
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
                  <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Model predictions vs actual outcomes on validation dataset.</p>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '6px' }}>METHODOLOGY</div>
                  <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>2x2 classification matrix showing TP, TN, FP, FN counts.</p>
                </div>
                <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>KEY INSIGHTS</div>
                  <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                    <li>High TP + TN indicates accuracy</li>
                    <li>Low FP minimizes false alarms</li>
                    <li>Low FN reduces missed cases</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Accuracy Trend */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid var(--success-200)' }}>
              <div className="card-header" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '16px 24px' }}>
                <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Accuracy Trend</h3>
              </div>
              <div className="card-body" style={{ padding: '20px', background: 'white' }}>
                <div style={{ height: '280px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} domain={[70, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
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
                  <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Daily model accuracy from production monitoring pipeline.</p>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '6px' }}>METHODOLOGY</div>
                  <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>30-day rolling accuracy computed from production predictions.</p>
                </div>
                <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>KEY INSIGHTS</div>
                  <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                    <li>Stable performance over time</li>
                    <li>No degradation detected</li>
                    <li>Above threshold consistently</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'simulation' && (
        <div className="simulation-tab-content">
          <div className="alert info" style={{ marginBottom: '24px' }}>
            <span className="alert-icon"><Icon name="info" size={20} /></span>
            <div className="alert-content">
              <div className="alert-title">Simulation Mode</div>
              <div className="alert-message">Run what-if scenarios to test model behavior with different inputs.</div>
            </div>
          </div>

          <div className="grid grid-cols-2" style={{ marginBottom: '24px' }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Simulation Input</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { label: 'Credit Score', type: 'range', min: 300, max: 850, default: 720 },
                    { label: 'Annual Income', type: 'number', placeholder: '$75,000' },
                    { label: 'Debt to Income', type: 'range', min: 0, max: 100, default: 35 },
                    { label: 'Employment Years', type: 'number', placeholder: '5' },
                  ].map((field, i) => (
                    <div key={i} className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">{field.label}</label>
                      {field.type === 'range' ? (
                        <input type="range" min={field.min} max={field.max} defaultValue={field.default} style={{ width: '100%' }} />
                      ) : (
                        <input type="text" className="form-input" placeholder={field.placeholder} />
                      )}
                    </div>
                  ))}
                  <button className="btn btn-primary" style={{ marginTop: '16px' }}>
                    <Icon name="play" size={16} /> Run Simulation
                  </button>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Simulation Results</h3>
              </div>
              <div className="card-body">
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: '64px', fontWeight: '700', color: 'var(--success-600)' }}>0.23</div>
                  <div style={{ fontSize: '18px', color: 'var(--gray-600)', marginBottom: '24px' }}>Risk Score</div>
                  <span className="status-badge success" style={{ fontSize: '16px', padding: '8px 24px' }}>APPROVED</span>
                  <div style={{ marginTop: '24px', padding: '16px', background: 'var(--gray-50)', borderRadius: '8px', textAlign: 'left' }}>
                    <div style={{ fontWeight: '600', marginBottom: '8px' }}>Top Factors:</div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--gray-600)' }}>
                      <li>Strong credit score (+0.15)</li>
                      <li>Stable employment (+0.12)</li>
                      <li>Low debt ratio (+0.08)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'architecture' && (
        <div className="architecture-tab-content">
          {/* C4 Model - Context */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">C4 Model - System Context</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px', padding: '32px', background: 'var(--gray-50)', borderRadius: '12px' }}>
                {/* External Users */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                  {[
                    { name: 'Business User', icon: 'user', color: 'var(--primary-500)' },
                    { name: 'Data Scientist', icon: 'cpu', color: 'var(--success-500)' },
                    { name: 'Operations', icon: 'settings', color: 'var(--warning-500)' },
                  ].map((user, i) => (
                    <div key={i} style={{ padding: '16px', background: user.color + '15', borderRadius: '8px', border: `2px solid ${user.color}`, textAlign: 'center', width: '120px' }}>
                      <Icon name={user.icon} size={24} style={{ color: user.color, marginBottom: '8px' }} />
                      <div style={{ fontSize: '12px', fontWeight: '600' }}>{user.name}</div>
                    </div>
                  ))}
                </div>

                {/* Arrow */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--gray-400)' }}>
                  <div>→</div>
                  <div style={{ fontSize: '10px' }}>Uses</div>
                </div>

                {/* Main System */}
                <div style={{ padding: '32px', background: 'var(--primary-500)', borderRadius: '12px', color: 'white', textAlign: 'center', minWidth: '200px' }}>
                  <Icon name="cpu" size={32} style={{ marginBottom: '12px' }} />
                  <div style={{ fontWeight: '700', fontSize: '16px' }}>{useCase.name}</div>
                  <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>ML Platform</div>
                </div>

                {/* Arrow */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--gray-400)' }}>
                  <div>→</div>
                  <div style={{ fontSize: '10px' }}>Integrates</div>
                </div>

                {/* External Systems */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                  {[
                    { name: 'Core Banking', icon: 'database', color: 'var(--danger-500)' },
                    { name: 'Data Warehouse', icon: 'layers', color: 'var(--purple-500)' },
                    { name: 'External APIs', icon: 'cloud', color: 'var(--gray-500)' },
                  ].map((sys, i) => (
                    <div key={i} style={{ padding: '16px', background: 'var(--gray-100)', borderRadius: '8px', border: `2px dashed ${sys.color}`, textAlign: 'center', width: '120px' }}>
                      <Icon name={sys.icon} size={24} style={{ color: sys.color, marginBottom: '8px' }} />
                      <div style={{ fontSize: '12px', fontWeight: '600' }}>{sys.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* C4 Model - Container */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">C4 Model - Container Diagram</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', padding: '24px', background: 'var(--gray-50)', borderRadius: '12px' }}>
                {[
                  { name: 'API Gateway', tech: 'Kong/Nginx', desc: 'Request routing & auth', color: 'var(--primary-500)' },
                  { name: 'Feature Service', tech: 'FastAPI', desc: 'Feature computation', color: 'var(--success-500)' },
                  { name: 'ML Service', tech: 'TensorFlow Serving', desc: 'Model inference', color: 'var(--warning-500)' },
                  { name: 'Data Pipeline', tech: 'Airflow + Spark', desc: 'ETL & processing', color: 'var(--danger-500)' },
                  { name: 'Monitoring', tech: 'Prometheus', desc: 'Metrics & alerts', color: 'var(--purple-500)' },
                ].map((container, i) => (
                  <div key={i} style={{ padding: '20px', background: 'white', borderRadius: '8px', border: `2px solid ${container.color}`, borderTop: `4px solid ${container.color}` }}>
                    <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '8px' }}>{container.name}</div>
                    <div style={{ fontSize: '11px', color: container.color, marginBottom: '8px', fontFamily: 'monospace' }}>[{container.tech}]</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>{container.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sequence Diagram */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Sequence Diagram - Prediction Flow</h3>
            </div>
            <div className="card-body">
              <div style={{ overflowX: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '24px', minWidth: '800px' }}>
                  {['Client', 'API Gateway', 'Auth Service', 'Feature Store', 'ML Model', 'Response'].map((actor, i) => (
                    <div key={i} style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ padding: '12px', background: i === 0 || i === 5 ? 'var(--primary-500)' : 'var(--gray-100)', color: i === 0 || i === 5 ? 'white' : 'var(--gray-700)', borderRadius: '8px', fontWeight: '600', fontSize: '13px' }}>{actor}</div>
                      <div style={{ width: '2px', height: '300px', background: 'var(--gray-300)', margin: '0 auto', position: 'relative' }}>
                        {i < 5 && [
                          { from: 0, label: '1. POST /predict', y: 30 },
                          { from: 1, label: '2. Validate token', y: 70 },
                          { from: 2, label: '3. Get features', y: 110 },
                          { from: 3, label: '4. Run inference', y: 150 },
                          { from: 4, label: '5. Return score', y: 190 },
                        ].filter(s => s.from === i).map((step, j) => (
                          <div key={j} style={{ position: 'absolute', top: step.y, left: '10px', width: 'calc(100% + 80px)', display: 'flex', alignItems: 'center' }}>
                            <div style={{ fontSize: '11px', color: 'var(--primary-600)', whiteSpace: 'nowrap', background: 'white', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--primary-200)' }}>{step.label}</div>
                            <div style={{ flex: 1, height: '1px', background: 'var(--primary-300)', marginLeft: '8px' }}></div>
                            <div style={{ color: 'var(--primary-500)' }}>→</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Data Flow Diagram */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Data Flow Diagram</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', background: 'var(--gray-50)', borderRadius: '12px', gap: '12px' }}>
                {[
                  { stage: 'Data Sources', items: ['Transactions', 'Customer Data', 'External Data'], color: 'var(--primary-500)', icon: 'database' },
                  { stage: 'Ingestion', items: ['Kafka', 'Batch ETL', 'CDC'], color: 'var(--warning-500)', icon: 'upload' },
                  { stage: 'Processing', items: ['Spark', 'Validation', 'Transform'], color: 'var(--success-500)', icon: 'cpu' },
                  { stage: 'Feature Store', items: ['Online Store', 'Offline Store', 'Registry'], color: 'var(--purple-500)', icon: 'layers' },
                  { stage: 'ML Pipeline', items: ['Training', 'Validation', 'Inference'], color: 'var(--danger-500)', icon: 'trending-up' },
                  { stage: 'Output', items: ['Predictions', 'Reports', 'Alerts'], color: 'var(--primary-600)', icon: 'check' },
                ].map((stage, i) => (
                  <React.Fragment key={i}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: stage.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                        <Icon name={stage.icon} size={24} style={{ color: 'white' }} />
                      </div>
                      <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px' }}>{stage.stage}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {stage.items.map((item, j) => (
                          <div key={j} style={{ padding: '4px 8px', background: 'white', borderRadius: '4px', fontSize: '11px', color: 'var(--gray-600)' }}>{item}</div>
                        ))}
                      </div>
                    </div>
                    {i < 5 && <div style={{ color: 'var(--gray-400)', fontSize: '24px' }}>→</div>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Model Process Flow */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Model Process Flow</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', gap: '16px', padding: '24px', background: 'var(--gray-50)', borderRadius: '12px' }}>
                {[
                  { phase: 'Data Prep', steps: ['Collect', 'Clean', 'Transform', 'Split'], progress: 100 },
                  { phase: 'Feature Eng', steps: ['Extract', 'Select', 'Scale', 'Encode'], progress: 100 },
                  { phase: 'Training', steps: ['Configure', 'Train', 'Tune', 'Validate'], progress: 100 },
                  { phase: 'Evaluation', steps: ['Test', 'Metrics', 'Bias Check', 'Explain'], progress: 100 },
                  { phase: 'Deployment', steps: ['Package', 'Deploy', 'Monitor', 'Retrain'], progress: 85 },
                ].map((phase, i) => (
                  <div key={i} style={{ flex: 1, background: 'white', borderRadius: '8px', padding: '16px', border: '1px solid var(--gray-200)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>{phase.phase}</span>
                      <span style={{ fontSize: '12px', color: phase.progress === 100 ? 'var(--success-600)' : 'var(--warning-600)' }}>{phase.progress}%</span>
                    </div>
                    <div style={{ height: '4px', background: 'var(--gray-200)', borderRadius: '2px', marginBottom: '12px' }}>
                      <div style={{ width: `${phase.progress}%`, height: '100%', background: phase.progress === 100 ? 'var(--success-500)' : 'var(--warning-500)', borderRadius: '2px' }}></div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {phase.steps.map((step, j) => (
                        <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                          <Icon name="check" size={12} style={{ color: 'var(--success-500)' }} />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Accuracy Flow */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Accuracy Optimization Flow</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', background: 'linear-gradient(90deg, var(--danger-50) 0%, var(--warning-50) 25%, var(--success-50) 75%, var(--primary-50) 100%)', borderRadius: '12px' }}>
                {[
                  { stage: 'Baseline', accuracy: '72%', color: 'var(--danger-500)', desc: 'Initial Model' },
                  { stage: 'Feature Eng', accuracy: '82%', color: 'var(--warning-500)', desc: '+10% improvement' },
                  { stage: 'Hypertuning', accuracy: '91%', color: 'var(--warning-600)', desc: '+9% improvement' },
                  { stage: 'Ensemble', accuracy: '96%', color: 'var(--success-500)', desc: '+5% improvement' },
                  { stage: 'Production', accuracy: `${useCase.accuracy}%`, color: 'var(--primary-500)', desc: 'Final Model' },
                ].map((stage, i) => (
                  <React.Fragment key={i}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'white', border: `4px solid ${stage.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <span style={{ fontWeight: '700', fontSize: '18px', color: stage.color }}>{stage.accuracy}</span>
                      </div>
                      <div style={{ fontWeight: '600', fontSize: '13px' }}>{stage.stage}</div>
                      <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{stage.desc}</div>
                    </div>
                    {i < 4 && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--gray-400)' }}>
                      <div style={{ fontSize: '24px' }}>→</div>
                    </div>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Infrastructure & API */}
          <div className="grid grid-cols-2">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Infrastructure</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { name: 'Compute', value: 'AWS EC2 (c5.4xlarge)', status: 'healthy' },
                    { name: 'Memory', value: '64 GB RAM', status: 'healthy' },
                    { name: 'Storage', value: '2 TB SSD', status: 'healthy' },
                    { name: 'Network', value: '10 Gbps', status: 'healthy' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                      <span style={{ fontWeight: '500' }}>{item.name}</span>
                      <span style={{ color: 'var(--gray-600)' }}>{item.value}</span>
                      <span className="status-badge success">Healthy</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">API Endpoints</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { method: 'POST', endpoint: '/api/v1/predict', latency: '45ms' },
                    { method: 'GET', endpoint: '/api/v1/model/info', latency: '12ms' },
                    { method: 'POST', endpoint: '/api/v1/batch', latency: '2.3s' },
                    { method: 'GET', endpoint: '/api/v1/health', latency: '5ms' },
                  ].map((ep, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: 'var(--gray-50)', borderRadius: '6px', fontFamily: 'monospace', fontSize: '13px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', background: ep.method === 'POST' ? 'var(--warning-100)' : 'var(--success-100)', color: ep.method === 'POST' ? 'var(--warning-700)' : 'var(--success-700)', fontWeight: '600' }}>{ep.method}</span>
                      <span style={{ flex: 1 }}>{ep.endpoint}</span>
                      <span style={{ color: 'var(--gray-500)' }}>{ep.latency}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'testing' && (
        <div className="testing-tab-content">
          {/* Test Overview Stats */}
          <div className="grid grid-cols-6" style={{ marginBottom: '24px' }}>
            {[
              { label: 'Total Tests', value: '248', icon: 'clipboard-check', color: 'var(--primary-500)' },
              { label: 'Passed', value: '241', icon: 'check', color: 'var(--success-500)' },
              { label: 'Failed', value: '5', icon: 'x', color: 'var(--danger-500)' },
              { label: 'Skipped', value: '2', icon: 'minus', color: 'var(--warning-500)' },
              { label: 'Coverage', value: '94.2%', icon: 'target', color: 'var(--purple-500)' },
              { label: 'Duration', value: '12m 45s', icon: 'clock', color: 'var(--cyan-500)' },
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

          {/* Test Categories */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Test Categories Overview</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => handleExport('Test Report')}>
                  <Icon name="download" size={14} /> Export Report
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => handleRunJob('All Tests')}>
                  <Icon name="play" size={14} /> Run All Tests
                </button>
              </div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Test Category</th>
                    <th>Type</th>
                    <th>Total</th>
                    <th>Passed</th>
                    <th>Failed</th>
                    <th>Coverage</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Unit Tests', type: 'Automated', total: 85, passed: 85, failed: 0, coverage: '96%', duration: '1m 12s', status: 'passed' },
                    { name: 'Functional Tests', type: 'Automated', total: 42, passed: 41, failed: 1, coverage: '92%', duration: '3m 25s', status: 'failed' },
                    { name: 'Integration Tests', type: 'Automated', total: 28, passed: 27, failed: 1, coverage: '88%', duration: '2m 45s', status: 'failed' },
                    { name: 'Smoke Tests', type: 'Automated', total: 15, passed: 15, failed: 0, coverage: '100%', duration: '45s', status: 'passed' },
                    { name: 'Performance Tests', type: 'Automated', total: 18, passed: 18, failed: 0, coverage: '95%', duration: '2m 30s', status: 'passed' },
                    { name: 'Regression Tests', type: 'Automated', total: 35, passed: 33, failed: 2, coverage: '90%', duration: '1m 55s', status: 'failed' },
                    { name: 'Manual Tests', type: 'Manual', total: 25, passed: 22, failed: 1, coverage: '85%', duration: '45m', status: 'passed' },
                  ].map((suite, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: '500' }}>{suite.name}</td>
                      <td><span className={`status-badge ${suite.type === 'Automated' ? 'primary' : 'warning'}`}>{suite.type}</span></td>
                      <td>{suite.total}</td>
                      <td style={{ color: 'var(--success-600)', fontWeight: '600' }}>{suite.passed}</td>
                      <td style={{ color: suite.failed > 0 ? 'var(--danger-600)' : 'var(--gray-400)', fontWeight: '600' }}>{suite.failed}</td>
                      <td>{suite.coverage}</td>
                      <td>{suite.duration}</td>
                      <td><span className={`status-badge ${suite.status === 'passed' ? 'success' : 'danger'}`}>{suite.status === 'passed' ? 'Passed' : 'Failed'}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button className="btn btn-icon btn-sm btn-secondary" onClick={() => handleRunJob(suite.name)}>
                            <Icon name="play" size={12} />
                          </button>
                          <button className="btn btn-icon btn-sm btn-secondary" onClick={() => handleViewJob({ name: suite.name, status: suite.status, schedule: 'On-demand', lastRun: 'Today', duration: suite.duration })}>
                            <Icon name="eye" size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Functional Tests - Positive & Negative */}
          <div className="grid grid-cols-2" style={{ gap: '24px', marginBottom: '24px' }}>
            {/* Positive Tests */}
            <div className="card">
              <div className="card-header" style={{ background: 'var(--success-50)' }}>
                <h3 className="card-title" style={{ color: 'var(--success-700)' }}>
                  <Icon name="check" size={18} style={{ marginRight: '8px' }} />
                  Positive Test Cases
                </h3>
                <span className="status-badge success">32/32 Passed</span>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Test ID</th>
                      <th>Test Case</th>
                      <th>Input</th>
                      <th>Expected</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: 'POS-001', name: 'Valid prediction request', input: 'Valid customer data', expected: 'Score 0-1', status: 'passed' },
                      { id: 'POS-002', name: 'Batch prediction', input: '1000 records', expected: 'All scored', status: 'passed' },
                      { id: 'POS-003', name: 'Feature extraction', input: 'Raw transaction', expected: '45 features', status: 'passed' },
                      { id: 'POS-004', name: 'Model explanation', input: 'Single prediction', expected: 'SHAP values', status: 'passed' },
                      { id: 'POS-005', name: 'API response time', input: 'Standard request', expected: '< 100ms', status: 'passed' },
                      { id: 'POS-006', name: 'Concurrent requests', input: '100 parallel', expected: 'All succeed', status: 'passed' },
                    ].map((test, i) => (
                      <tr key={i}>
                        <td style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--primary-600)' }}>{test.id}</td>
                        <td style={{ fontWeight: '500', fontSize: '12px' }}>{test.name}</td>
                        <td style={{ fontSize: '11px', color: 'var(--gray-600)' }}>{test.input}</td>
                        <td style={{ fontSize: '11px', color: 'var(--gray-600)' }}>{test.expected}</td>
                        <td><Icon name="check" size={16} style={{ color: 'var(--success-500)' }} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Negative Tests */}
            <div className="card">
              <div className="card-header" style={{ background: 'var(--danger-50)' }}>
                <h3 className="card-title" style={{ color: 'var(--danger-700)' }}>
                  <Icon name="x" size={18} style={{ marginRight: '8px' }} />
                  Negative Test Cases
                </h3>
                <span className="status-badge success">28/28 Passed</span>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Test ID</th>
                      <th>Test Case</th>
                      <th>Input</th>
                      <th>Expected</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: 'NEG-001', name: 'Invalid input format', input: 'Malformed JSON', expected: '400 Error', status: 'passed' },
                      { id: 'NEG-002', name: 'Missing required fields', input: 'Incomplete data', expected: 'Validation error', status: 'passed' },
                      { id: 'NEG-003', name: 'Invalid auth token', input: 'Expired JWT', expected: '401 Unauthorized', status: 'passed' },
                      { id: 'NEG-004', name: 'Rate limit exceeded', input: '1000 req/sec', expected: '429 Too Many', status: 'passed' },
                      { id: 'NEG-005', name: 'SQL injection attempt', input: 'Malicious SQL', expected: 'Sanitized/Blocked', status: 'passed' },
                      { id: 'NEG-006', name: 'Oversized payload', input: '> 10MB request', expected: '413 Too Large', status: 'passed' },
                    ].map((test, i) => (
                      <tr key={i}>
                        <td style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--danger-600)' }}>{test.id}</td>
                        <td style={{ fontWeight: '500', fontSize: '12px' }}>{test.name}</td>
                        <td style={{ fontSize: '11px', color: 'var(--gray-600)' }}>{test.input}</td>
                        <td style={{ fontSize: '11px', color: 'var(--gray-600)' }}>{test.expected}</td>
                        <td><Icon name="check" size={16} style={{ color: 'var(--success-500)' }} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Smoke Tests */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header" style={{ background: 'var(--purple-50)' }}>
              <h3 className="card-title" style={{ color: 'var(--purple-700)' }}>
                <Icon name="zap" size={18} style={{ marginRight: '8px' }} />
                Smoke Tests (Critical Path)
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="status-badge success">15/15 Passed</span>
                <button className="btn btn-sm btn-secondary" onClick={() => handleRunJob('Smoke Tests')}>
                  <Icon name="play" size={14} /> Run Smoke Tests
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-5" style={{ gap: '12px' }}>
                {[
                  { name: 'API Health Check', status: 'passed', time: '2s' },
                  { name: 'DB Connection', status: 'passed', time: '1s' },
                  { name: 'Model Loading', status: 'passed', time: '5s' },
                  { name: 'Feature Store', status: 'passed', time: '3s' },
                  { name: 'Cache Layer', status: 'passed', time: '1s' },
                  { name: 'Auth Service', status: 'passed', time: '2s' },
                  { name: 'Single Prediction', status: 'passed', time: '8s' },
                  { name: 'Batch Endpoint', status: 'passed', time: '10s' },
                  { name: 'Explain Endpoint', status: 'passed', time: '5s' },
                  { name: 'Metrics Export', status: 'passed', time: '2s' },
                  { name: 'Logging', status: 'passed', time: '1s' },
                  { name: 'Error Handling', status: 'passed', time: '3s' },
                  { name: 'Rate Limiting', status: 'passed', time: '2s' },
                  { name: 'SSL/TLS', status: 'passed', time: '1s' },
                  { name: 'CORS Config', status: 'passed', time: '1s' },
                ].map((test, i) => (
                  <div key={i} style={{
                    padding: '12px',
                    background: test.status === 'passed' ? 'var(--success-50)' : 'var(--danger-50)',
                    borderRadius: '8px',
                    border: `1px solid ${test.status === 'passed' ? 'var(--success-200)' : 'var(--danger-200)'}`,
                    textAlign: 'center'
                  }}>
                    <Icon name={test.status === 'passed' ? 'check' : 'x'} size={20} style={{ color: test.status === 'passed' ? 'var(--success-500)' : 'var(--danger-500)', marginBottom: '8px' }} />
                    <div style={{ fontSize: '12px', fontWeight: '500' }}>{test.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--gray-500)', marginTop: '4px' }}>{test.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Tests */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header" style={{ background: 'var(--warning-50)' }}>
              <h3 className="card-title" style={{ color: 'var(--warning-700)' }}>
                <Icon name="trending-up" size={18} style={{ marginRight: '8px' }} />
                Performance & Load Tests
              </h3>
              <span className="status-badge success">All Benchmarks Met</span>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Test Name</th>
                    <th>Metric</th>
                    <th>Target</th>
                    <th>Actual</th>
                    <th>Variance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'API Latency (P50)', metric: 'Response Time', target: '< 50ms', actual: '32ms', variance: '-36%', status: 'passed' },
                    { name: 'API Latency (P95)', metric: 'Response Time', target: '< 100ms', actual: '78ms', variance: '-22%', status: 'passed' },
                    { name: 'API Latency (P99)', metric: 'Response Time', target: '< 200ms', actual: '145ms', variance: '-28%', status: 'passed' },
                    { name: 'Throughput Test', metric: 'Requests/sec', target: '> 1000 RPS', actual: '1,250 RPS', variance: '+25%', status: 'passed' },
                    { name: 'Concurrent Users', metric: 'Max Connections', target: '500 users', actual: '650 users', variance: '+30%', status: 'passed' },
                    { name: 'Memory Usage', metric: 'RAM Consumption', target: '< 4GB', actual: '2.8GB', variance: '-30%', status: 'passed' },
                    { name: 'CPU Utilization', metric: 'Peak CPU', target: '< 80%', actual: '65%', variance: '-19%', status: 'passed' },
                    { name: 'Batch Processing', metric: 'Records/min', target: '> 10K/min', actual: '12.5K/min', variance: '+25%', status: 'passed' },
                  ].map((test, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: '500' }}>{test.name}</td>
                      <td style={{ fontSize: '12px', color: 'var(--gray-600)' }}>{test.metric}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{test.target}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: '600', color: 'var(--success-600)' }}>{test.actual}</td>
                      <td style={{ fontSize: '12px', color: test.variance.startsWith('+') ? 'var(--success-600)' : 'var(--primary-600)' }}>{test.variance}</td>
                      <td><span className="status-badge success">Passed</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Manual vs Automated Tests */}
          <div className="grid grid-cols-2" style={{ gap: '24px', marginBottom: '24px' }}>
            {/* Automated Tests */}
            <div className="card">
              <div className="card-header" style={{ background: 'var(--primary-50)' }}>
                <h3 className="card-title" style={{ color: 'var(--primary-700)' }}>
                  <Icon name="cpu" size={18} style={{ marginRight: '8px' }} />
                  Automated Tests
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--gray-600)' }}>CI/CD Pipeline</span>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { category: 'Unit Tests', framework: 'pytest', tests: 85, coverage: '96%', lastRun: '2 hours ago' },
                    { category: 'API Tests', framework: 'pytest + requests', tests: 42, coverage: '92%', lastRun: '2 hours ago' },
                    { category: 'Integration Tests', framework: 'pytest + docker', tests: 28, coverage: '88%', lastRun: '4 hours ago' },
                    { category: 'E2E Tests', framework: 'Selenium', tests: 15, coverage: '85%', lastRun: '6 hours ago' },
                    { category: 'Load Tests', framework: 'Locust', tests: 18, coverage: '95%', lastRun: 'Daily' },
                    { category: 'Security Tests', framework: 'OWASP ZAP', tests: 25, coverage: '90%', lastRun: 'Weekly' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontWeight: '500', fontSize: '13px' }}>{item.category}</div>
                        <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{item.framework}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: '12px' }}>{item.tests} tests</span>
                        <span style={{ fontSize: '12px', color: 'var(--success-600)' }}>{item.coverage}</span>
                        <span style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{item.lastRun}</span>
                        <button className="btn btn-icon btn-sm btn-secondary" onClick={() => handleRunJob(item.category)}>
                          <Icon name="play" size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Manual Tests */}
            <div className="card">
              <div className="card-header" style={{ background: 'var(--warning-50)' }}>
                <h3 className="card-title" style={{ color: 'var(--warning-700)' }}>
                  <Icon name="user" size={18} style={{ marginRight: '8px' }} />
                  Manual Tests
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--gray-600)' }}>QA Team</span>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { category: 'UAT - Business Logic', tester: 'QA Team', tests: 12, status: 'completed', date: '2025-01-25' },
                    { category: 'UAT - Edge Cases', tester: 'QA Team', tests: 8, status: 'completed', date: '2025-01-24' },
                    { category: 'Exploratory Testing', tester: 'Senior QA', tests: 15, status: 'in-progress', date: '2025-01-28' },
                    { category: 'Usability Testing', tester: 'UX Team', tests: 10, status: 'completed', date: '2025-01-20' },
                    { category: 'Accessibility Testing', tester: 'A11y Team', tests: 8, status: 'completed', date: '2025-01-22' },
                    { category: 'Compliance Review', tester: 'Compliance', tests: 20, status: 'completed', date: '2025-01-23' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontWeight: '500', fontSize: '13px' }}>{item.category}</div>
                        <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{item.tester}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: '12px' }}>{item.tests} tests</span>
                        <span className={`status-badge ${item.status === 'completed' ? 'success' : 'warning'}`}>{item.status}</span>
                        <span style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{item.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Test Execution History */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Test Runs</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { date: '2025-01-28 10:30 AM', commit: 'abc123f', branch: 'main', passed: 243, failed: 5, skipped: 0, duration: '12m 45s', status: 'failed' },
                  { date: '2025-01-28 06:00 AM', commit: 'def456a', branch: 'main', passed: 248, failed: 0, skipped: 0, duration: '12m 32s', status: 'passed' },
                  { date: '2025-01-27 10:30 PM', commit: 'ghi789b', branch: 'feature/update', passed: 245, failed: 3, skipped: 0, duration: '12m 50s', status: 'failed' },
                  { date: '2025-01-27 06:00 PM', commit: 'jkl012c', branch: 'main', passed: 248, failed: 0, skipped: 0, duration: '12m 28s', status: 'passed' },
                  { date: '2025-01-27 02:00 PM', commit: 'mno345d', branch: 'main', passed: 248, failed: 0, skipped: 0, duration: '12m 35s', status: 'passed' },
                ].map((run, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--gray-50)', borderRadius: '8px', borderLeft: `4px solid ${run.status === 'passed' ? 'var(--success-500)' : 'var(--danger-500)'}` }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>{run.date}</div>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--gray-500)', fontFamily: 'monospace' }}>Commit: {run.commit}</span>
                        <span style={{ fontSize: '11px', color: 'var(--primary-600)' }}>{run.branch}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                      <span style={{ color: 'var(--success-600)', fontWeight: '500' }}>{run.passed} passed</span>
                      <span style={{ color: run.failed > 0 ? 'var(--danger-600)' : 'var(--gray-400)', fontWeight: '500' }}>{run.failed} failed</span>
                      <span style={{ color: 'var(--gray-500)' }}>{run.duration}</span>
                      <span className={`status-badge ${run.status === 'passed' ? 'success' : 'danger'}`}>{run.status === 'passed' ? 'Passed' : 'Failed'}</span>
                      <button className="btn btn-icon btn-sm btn-secondary" onClick={() => handleViewJob({ name: `Test Run ${run.commit}`, status: run.status, schedule: 'CI/CD', lastRun: run.date, duration: run.duration })}>
                        <Icon name="eye" size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'versions' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Model Versions</h3>
              <p className="card-subtitle">Version history and deployment status</p>
            </div>
            <button className="btn btn-primary btn-sm">
              <Icon name="upload" size={14} />
              Deploy New Version
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Version</th>
                  <th>Date</th>
                  <th>Accuracy</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {modelVersions.map((v) => (
                  <tr key={v.version}>
                    <td style={{ fontWeight: 500 }}>{v.version}</td>
                    <td>{v.date}</td>
                    <td>{v.accuracy > 0 ? v.accuracy.toFixed(1) + '%' : 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${v.status === 'production' ? 'success' : 'neutral'}`}>
                        {v.status === 'production' ? 'Production' : 'Archived'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-icon btn-sm btn-secondary">
                          <Icon name="eye" size={14} />
                        </button>
                        {v.status !== 'production' && (
                          <button className="btn btn-sm btn-secondary">
                            Rollback
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Demo Tab - Interactive Demo Flow */}
      {activeTab === 'demo' && (
        <div className="demo-tab-content">
          <div className="alert info" style={{ marginBottom: '24px' }}>
            <span className="alert-icon"><Icon name="play" size={20} /></span>
            <div className="alert-content">
              <div className="alert-title">Interactive Demo Mode</div>
              <div className="alert-message">Step through the ML pipeline flow with sample data to understand the end-to-end process.</div>
            </div>
          </div>

          {/* Demo Steps */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header" style={{ background: 'var(--primary-50)' }}>
              <h3 className="card-title">Demo Flow Steps</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary btn-sm"><Icon name="refresh" size={14} /> Reset</button>
                <button className="btn btn-primary btn-sm"><Icon name="play" size={14} /> Play All</button>
              </div>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { step: 1, name: 'Data Input', desc: 'Load sample customer data', status: 'completed', time: '0.5s', icon: 'database' },
                  { step: 2, name: 'Data Validation', desc: 'Validate schema and data quality', status: 'completed', time: '0.3s', icon: 'check' },
                  { step: 3, name: 'Feature Engineering', desc: 'Generate 128 features', status: 'active', time: '1.2s', icon: 'cpu' },
                  { step: 4, name: 'Model Inference', desc: 'Run XGBoost model', status: 'pending', time: '0.8s', icon: 'models' },
                  { step: 5, name: 'Post-Processing', desc: 'Apply business rules', status: 'pending', time: '0.2s', icon: 'settings' },
                  { step: 6, name: 'Output Generation', desc: 'Generate predictions', status: 'pending', time: '0.1s', icon: 'trending-up' },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 20px',
                    background: item.status === 'active' ? 'var(--primary-50)' : 'var(--gray-50)',
                    borderRadius: '12px',
                    border: item.status === 'active' ? '2px solid var(--primary-500)' : '1px solid var(--gray-200)',
                    transition: 'all 0.3s'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: item.status === 'completed' ? 'var(--success-500)' : item.status === 'active' ? 'var(--primary-500)' : 'var(--gray-300)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '18px'
                    }}>
                      {item.status === 'completed' ? <Icon name="check" size={24} /> : item.step}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>{item.name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>{item.desc}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>Duration</div>
                      <div style={{ fontWeight: 600 }}>{item.time}</div>
                    </div>
                    <span className={`status-badge ${item.status === 'completed' ? 'success' : item.status === 'active' ? 'info' : 'neutral'}`}>
                      {item.status === 'completed' ? 'Done' : item.status === 'active' ? 'Running' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Demo Data Preview */}
          <div className="grid grid-cols-2" style={{ gap: '24px' }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Sample Input Data</h3>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Value</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { field: 'Customer ID', value: 'CUST-2025-001234', type: 'String' },
                      { field: 'Age', value: '35', type: 'Integer' },
                      { field: 'Income', value: '$85,000', type: 'Currency' },
                      { field: 'Credit Score', value: '742', type: 'Integer' },
                      { field: 'Employment', value: 'Full-time', type: 'Category' },
                      { field: 'Loan Amount', value: '$250,000', type: 'Currency' },
                    ].map((row, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 500 }}>{row.field}</td>
                        <td style={{ fontFamily: 'monospace' }}>{row.value}</td>
                        <td><span className="status-badge neutral">{row.type}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Demo Output</h3>
              </div>
              <div className="card-body">
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '14px', color: 'var(--gray-500)', marginBottom: '8px' }}>Risk Score</div>
                  <div style={{ fontSize: '56px', fontWeight: '700', color: 'var(--success-600)', marginBottom: '8px' }}>0.18</div>
                  <span className="status-badge success" style={{ fontSize: '16px', padding: '8px 24px' }}>LOW RISK - APPROVE</span>
                </div>
                <div style={{ borderTop: '1px solid var(--gray-200)', marginTop: '20px', paddingTop: '20px' }}>
                  <div style={{ fontWeight: 600, marginBottom: '12px' }}>Prediction Details:</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Confidence</div>
                      <div style={{ fontWeight: 600 }}>94.2%</div>
                    </div>
                    <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Latency</div>
                      <div style={{ fontWeight: 600 }}>45ms</div>
                    </div>
                    <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Model Version</div>
                      <div style={{ fontWeight: 600 }}>v2.3.1</div>
                    </div>
                    <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Timestamp</div>
                      <div style={{ fontWeight: 600 }}>2025-01-28</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trust AI Tab - Comprehensive AI Governance */}
      {activeTab === 'trust-ai' && (
        <div className="trust-ai-tab-content">
          {/* Trust AI Overview */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header" style={{ background: 'linear-gradient(90deg, var(--success-50), var(--primary-50))' }}>
              <div>
                <h3 className="card-title">Trust AI Score</h3>
                <p className="card-subtitle">Comprehensive AI trustworthiness assessment</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--success-600)' }}>
                    {useCase.trustScore || 92}%
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Overall Trust Score</div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust AI Pillars */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { name: 'Data Quality', icon: 'database', score: 96, color: '#0891b2', desc: 'Data lineage, quality metrics, completeness' },
              { name: 'Model', icon: 'cpu', score: useCase.accuracy || 99, color: '#3b82f6', desc: 'Model performance, validation, versioning' },
              { name: 'Accuracy', icon: 'target', score: useCase.accuracy || 99, color: '#10b981', desc: 'Precision, recall, F1, AUC metrics' },
              { name: 'Explainability', icon: 'eye', score: useCase.explainability || 91, color: '#8b5cf6', desc: 'SHAP values, feature importance, interpretability' },
              { name: 'Responsibility', icon: 'shield', score: useCase.responsibility || 93, color: '#f59e0b', desc: 'Bias detection, fairness, ethical AI' },
              { name: 'Governance', icon: 'clipboard-check', score: useCase.governance || 97, color: '#ef4444', desc: 'Audit trails, compliance, documentation' },
            ].map((pillar, i) => (
              <div key={i} style={{
                padding: '20px',
                borderRadius: '12px',
                background: 'white',
                border: '1px solid var(--gray-200)',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  background: `${pillar.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  color: pillar.color
                }}>
                  <Icon name={pillar.icon} size={28} />
                </div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: pillar.color, marginBottom: '4px' }}>{pillar.score}%</div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{pillar.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{pillar.desc}</div>
              </div>
            ))}
          </div>

          {/* Detailed Sections */}
          <div className="grid grid-cols-2" style={{ gap: '24px', marginBottom: '24px' }}>
            {/* Explainability */}
            <div className="card">
              <div className="card-header" style={{ background: '#8b5cf615' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#8b5cf6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="eye" size={20} />
                  </div>
                  <div>
                    <h3 className="card-title">Explainability</h3>
                    <p className="card-subtitle">Model interpretability metrics</p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { name: 'SHAP Values Available', status: true },
                    { name: 'Feature Importance', status: true },
                    { name: 'Local Explanations', status: true },
                    { name: 'Global Explanations', status: true },
                    { name: 'Counterfactual Analysis', status: true },
                    { name: 'Decision Path Visualization', status: true },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--gray-50)', borderRadius: '6px' }}>
                      <span>{item.name}</span>
                      <span className={`status-badge ${item.status ? 'success' : 'danger'}`}>{item.status ? 'Available' : 'Missing'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Responsibility */}
            <div className="card">
              <div className="card-header" style={{ background: '#f59e0b15' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f59e0b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="shield" size={20} />
                  </div>
                  <div>
                    <h3 className="card-title">Responsibility</h3>
                    <p className="card-subtitle">Ethical AI and bias metrics</p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { name: 'Gender Bias', value: '0.02', status: 'pass', threshold: '< 0.05' },
                    { name: 'Age Bias', value: '0.03', status: 'pass', threshold: '< 0.05' },
                    { name: 'Racial Equity', value: '0.98', status: 'pass', threshold: '> 0.95' },
                    { name: 'Income Fairness', value: '0.96', status: 'pass', threshold: '> 0.95' },
                    { name: 'Geographic Parity', value: '0.97', status: 'pass', threshold: '> 0.95' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--gray-50)', borderRadius: '6px' }}>
                      <span>{item.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{item.value}</span>
                        <span style={{ fontSize: '11px', color: 'var(--gray-400)' }}>{item.threshold}</span>
                        <span className={`status-badge ${item.status === 'pass' ? 'success' : 'danger'}`}>{item.status === 'pass' ? 'Pass' : 'Fail'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Governance & Compliance */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header" style={{ background: '#ef444415' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="clipboard-check" size={20} />
                </div>
                <div>
                  <h3 className="card-title">Governance & Compliance</h3>
                  <p className="card-subtitle">Regulatory compliance and audit readiness</p>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                  { name: 'SR 11-7 Compliance', status: 'compliant', icon: 'check' },
                  { name: 'GDPR Ready', status: 'compliant', icon: 'check' },
                  { name: 'Fair Lending Act', status: 'compliant', icon: 'check' },
                  { name: 'SOX Compliance', status: 'compliant', icon: 'check' },
                  { name: 'Model Documentation', status: 'complete', icon: 'file' },
                  { name: 'Audit Trail', status: 'enabled', icon: 'list' },
                  { name: 'Version Control', status: 'active', icon: 'git-branch' },
                  { name: 'Access Control', status: 'enforced', icon: 'lock' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--success-100)', color: 'var(--success-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                      <Icon name="check" size={16} />
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>{item.name}</div>
                    <span className="status-badge success" style={{ fontSize: '10px' }}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Role-Based Reports */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Role-Based Reports</h3>
              <p className="card-subtitle">Generate reports for different stakeholders</p>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                  { role: 'Data Scientist', report: 'Technical Model Report', icon: 'cpu', color: '#3b82f6' },
                  { role: 'Risk Manager', report: 'Risk Assessment Report', icon: 'shield', color: '#dc2626' },
                  { role: 'Compliance Officer', report: 'Regulatory Report', icon: 'clipboard-check', color: '#f59e0b' },
                  { role: 'Business Analyst', report: 'Business Impact Report', icon: 'trending-up', color: '#10b981' },
                  { role: 'Executive', report: 'Executive Summary', icon: 'briefcase', color: '#8b5cf6' },
                  { role: 'Auditor', report: 'Audit Documentation', icon: 'search', color: '#0891b2' },
                  { role: 'ML Engineer', report: 'MLOps Report', icon: 'cog', color: '#475569' },
                  { role: 'Product Owner', report: 'Feature Analysis', icon: 'target', color: '#db2777' },
                ].map((item, i) => (
                  <div key={i} style={{
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid var(--gray-200)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: `${item.color}15`,
                      color: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '12px'
                    }}>
                      <Icon name={item.icon} size={20} />
                    </div>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{item.role}</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '12px' }}>{item.report}</div>
                    <button className="btn btn-sm btn-secondary" style={{ width: '100%' }}>
                      <Icon name="download" size={12} /> Generate
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Explainable AI Tab */}
      {activeTab === 'explainable-ai' && (
        <div className="explainable-ai-content">
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header" style={{ background: 'linear-gradient(90deg, #8b5cf615, #3b82f615)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#8b5cf6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="eye" size={28} />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>Explainable AI</h2>
                  <p style={{ color: 'var(--gray-500)' }}>Model interpretability, feature attribution, and decision transparency</p>
                </div>
              </div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#8b5cf6' }}>{useCase.explainability || 94}%</div>
            </div>
          </div>

          <div className="grid grid-cols-2" style={{ gap: '24px', marginBottom: '24px' }}>
            {/* SHAP Analysis */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">SHAP Value Analysis</h3>
                <p className="card-subtitle">Feature contribution to predictions</p>
              </div>
              <div className="card-body">
                {[
                  { feature: 'Credit Score', impact: 0.35, direction: 'positive' },
                  { feature: 'Debt-to-Income', impact: -0.22, direction: 'negative' },
                  { feature: 'Employment Years', impact: 0.18, direction: 'positive' },
                  { feature: 'Annual Income', impact: 0.15, direction: 'positive' },
                  { feature: 'Loan Amount', impact: -0.12, direction: 'negative' },
                  { feature: 'Payment History', impact: 0.10, direction: 'positive' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '120px', fontSize: '13px', fontWeight: 500 }}>{item.feature}</div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '50%', height: '24px', background: 'var(--gray-100)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{
                          position: 'absolute',
                          [item.direction === 'positive' ? 'left' : 'right']: '50%',
                          width: `${Math.abs(item.impact) * 100}%`,
                          height: '100%',
                          background: item.direction === 'positive' ? '#10b981' : '#ef4444',
                          borderRadius: '4px'
                        }} />
                      </div>
                      <span style={{ width: '50px', fontSize: '12px', fontWeight: 600, color: item.direction === 'positive' ? '#10b981' : '#ef4444' }}>
                        {item.direction === 'positive' ? '+' : ''}{(item.impact * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interpretability Methods */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Interpretability Methods</h3>
                <p className="card-subtitle">Available explanation techniques</p>
              </div>
              <div className="card-body">
                {[
                  { method: 'SHAP (SHapley Additive exPlanations)', status: 'active', coverage: '100%' },
                  { method: 'LIME (Local Interpretable Model-agnostic)', status: 'active', coverage: '100%' },
                  { method: 'Partial Dependence Plots', status: 'active', coverage: '100%' },
                  { method: 'Feature Importance (Permutation)', status: 'active', coverage: '100%' },
                  { method: 'Counterfactual Explanations', status: 'active', coverage: '95%' },
                  { method: 'Attention Weights', status: 'inactive', coverage: 'N/A' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 500 }}>{item.method}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{item.coverage}</span>
                      <span className={`status-badge ${item.status === 'active' ? 'success' : 'neutral'}`}>{item.status === 'active' ? 'Active' : 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Decision Path */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Decision Path Visualization</h3>
              <p className="card-subtitle">How the model arrived at its prediction</p>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', background: 'var(--gray-50)', borderRadius: '12px' }}>
                {[
                  { step: 'Input', label: 'Raw Features', value: '24 features', color: '#3b82f6' },
                  { step: 'Process', label: 'Feature Transform', value: '128 derived', color: '#8b5cf6' },
                  { step: 'Model', label: 'XGBoost v2.3', value: '500 trees', color: '#f59e0b' },
                  { step: 'Score', label: 'Risk Probability', value: '0.18', color: '#10b981' },
                  { step: 'Output', label: 'Decision', value: 'APPROVE', color: '#059669' },
                ].map((item, i, arr) => (
                  <React.Fragment key={i}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: item.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontWeight: 700 }}>
                        {i + 1}
                      </div>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>{item.label}</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{item.value}</div>
                    </div>
                    {i < arr.length - 1 && (
                      <div style={{ width: '60px', height: '2px', background: 'var(--gray-300)' }} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ethical AI Tab */}
      {activeTab === 'ethical-ai' && (
        <div className="ethical-ai-content">
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header" style={{ background: 'linear-gradient(90deg, #f59e0b15, #10b98115)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#f59e0b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="shield" size={28} />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>Ethical AI</h2>
                  <p style={{ color: 'var(--gray-500)' }}>Fairness, bias detection, and responsible AI practices</p>
                </div>
              </div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#f59e0b' }}>{useCase.responsibility || 93}%</div>
            </div>
          </div>

          {/* Fairness Metrics */}
          <div className="grid grid-cols-4" style={{ gap: '16px', marginBottom: '24px' }}>
            {[
              { name: 'Demographic Parity', score: 0.98, threshold: 0.95, status: 'pass' },
              { name: 'Equalized Odds', score: 0.96, threshold: 0.95, status: 'pass' },
              { name: 'Equal Opportunity', score: 0.97, threshold: 0.95, status: 'pass' },
              { name: 'Calibration', score: 0.94, threshold: 0.90, status: 'pass' },
            ].map((metric, i) => (
              <div key={i} className="card">
                <div className="card-body" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: metric.status === 'pass' ? 'var(--success-600)' : 'var(--danger-600)' }}>
                    {(metric.score * 100).toFixed(0)}%
                  </div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>{metric.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>Threshold: {(metric.threshold * 100).toFixed(0)}%</div>
                  <span className={`status-badge ${metric.status === 'pass' ? 'success' : 'danger'}`} style={{ marginTop: '8px' }}>
                    {metric.status === 'pass' ? 'Pass' : 'Fail'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2" style={{ gap: '24px', marginBottom: '24px' }}>
            {/* Bias Detection */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Bias Detection Results</h3>
                <p className="card-subtitle">Protected attribute analysis</p>
              </div>
              <div className="card-body">
                {[
                  { attribute: 'Gender', bias: 0.02, status: 'pass', icon: 'users' },
                  { attribute: 'Age Group', bias: 0.03, status: 'pass', icon: 'clock' },
                  { attribute: 'Ethnicity', bias: 0.01, status: 'pass', icon: 'globe' },
                  { attribute: 'Geographic Region', bias: 0.02, status: 'pass', icon: 'map-pin' },
                  { attribute: 'Income Level', bias: 0.04, status: 'pass', icon: 'dollar' },
                  { attribute: 'Education', bias: 0.03, status: 'pass', icon: 'book' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--primary-100)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name={item.icon} size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500 }}>{item.attribute}</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Bias score: {item.bias.toFixed(2)} (threshold: 0.05)</div>
                    </div>
                    <span className={`status-badge ${item.status === 'pass' ? 'success' : 'danger'}`}>{item.status === 'pass' ? 'No Bias' : 'Bias Detected'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ethical Guidelines */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Ethical Guidelines Compliance</h3>
                <p className="card-subtitle">Adherence to AI ethics frameworks</p>
              </div>
              <div className="card-body">
                {[
                  { guideline: 'Human Oversight', compliant: true, desc: 'Human-in-the-loop for high-risk decisions' },
                  { guideline: 'Transparency', compliant: true, desc: 'Clear documentation and explanations' },
                  { guideline: 'Non-discrimination', compliant: true, desc: 'Fair treatment across groups' },
                  { guideline: 'Privacy Protection', compliant: true, desc: 'Data minimization and consent' },
                  { guideline: 'Accountability', compliant: true, desc: 'Clear ownership and responsibility' },
                  { guideline: 'Beneficence', compliant: true, desc: 'Promotes positive outcomes' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: item.compliant ? 'var(--success-500)' : 'var(--danger-500)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon name={item.compliant ? 'check' : 'x'} size={14} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{item.guideline}</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Robust AI Tab */}
      {activeTab === 'robust-ai' && (
        <div className="robust-ai-content">
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header" style={{ background: 'linear-gradient(90deg, #dc262615, #7c3aed15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#dc2626', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="shield" size={28} />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>Robust AI</h2>
                  <p style={{ color: 'var(--gray-500)' }}>Model reliability, stability, and adversarial resistance</p>
                </div>
              </div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#dc2626' }}>96%</div>
            </div>
          </div>

          <div className="grid grid-cols-4" style={{ gap: '16px', marginBottom: '24px' }}>
            {[
              { name: 'Stability Score', value: '98.2%', icon: 'check', color: '#10b981' },
              { name: 'Drift Detection', value: 'None', icon: 'trending-up', color: '#3b82f6' },
              { name: 'Adversarial Resistance', value: '94.5%', icon: 'shield', color: '#8b5cf6' },
              { name: 'Error Tolerance', value: '99.1%', icon: 'target', color: '#f59e0b' },
            ].map((item, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon" style={{ background: `${item.color}20`, color: item.color }}>
                  <Icon name={item.icon} size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-label">{item.name}</div>
                  <div className="stat-value">{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2" style={{ gap: '24px' }}>
            {/* Model Stability */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Model Stability Tests</h3>
              </div>
              <div className="card-body">
                {[
                  { test: 'Input Perturbation Test', result: 'Stable', variance: '±0.8%' },
                  { test: 'Feature Noise Injection', result: 'Stable', variance: '±1.2%' },
                  { test: 'Distribution Shift Test', result: 'Stable', variance: '±0.5%' },
                  { test: 'Boundary Condition Test', result: 'Stable', variance: '±0.9%' },
                  { test: 'Cross-validation Stability', result: 'Stable', variance: '±0.3%' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 500 }}>{item.test}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{item.variance}</span>
                      <span className="status-badge success">{item.result}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Adversarial Testing */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Adversarial Testing</h3>
              </div>
              <div className="card-body">
                {[
                  { attack: 'FGSM Attack', defense: 'Defended', rate: '99.2%' },
                  { attack: 'PGD Attack', defense: 'Defended', rate: '98.8%' },
                  { attack: 'Carlini-Wagner', defense: 'Defended', rate: '97.5%' },
                  { attack: 'DeepFool', defense: 'Defended', rate: '98.1%' },
                  { attack: 'Data Poisoning', defense: 'Defended', rate: '99.5%' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 500 }}>{item.attack}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--success-600)' }}>{item.rate}</span>
                      <span className="status-badge success">{item.defense}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Secure AI Tab */}
      {activeTab === 'secure-ai' && (
        <div className="secure-ai-content">
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header" style={{ background: 'linear-gradient(90deg, #047857 15, #0891b215)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#047857', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="lock" size={28} />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>Secure AI</h2>
                  <p style={{ color: 'var(--gray-500)' }}>Data protection, access control, and security measures</p>
                </div>
              </div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#047857' }}>98%</div>
            </div>
          </div>

          <div className="grid grid-cols-3" style={{ gap: '16px', marginBottom: '24px' }}>
            {[
              { name: 'Data Encryption', status: 'AES-256', icon: 'lock', color: '#047857' },
              { name: 'Access Control', status: 'RBAC Enabled', icon: 'users', color: '#0891b2' },
              { name: 'Audit Logging', status: 'Active', icon: 'list', color: '#7c3aed' },
              { name: 'API Security', status: 'OAuth 2.0', icon: 'shield', color: '#dc2626' },
              { name: 'Data Masking', status: 'PII Protected', icon: 'eye', color: '#f59e0b' },
              { name: 'Network Security', status: 'TLS 1.3', icon: 'globe', color: '#3b82f6' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--gray-200)', background: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${item.color}15`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={item.icon} size={20} />
                  </div>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                </div>
                <span className="status-badge success">{item.status}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2" style={{ gap: '24px' }}>
            {/* Security Controls */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Security Controls</h3>
              </div>
              <div className="card-body">
                {[
                  { control: 'Data at Rest Encryption', enabled: true },
                  { control: 'Data in Transit Encryption', enabled: true },
                  { control: 'Model Weight Encryption', enabled: true },
                  { control: 'Input Validation', enabled: true },
                  { control: 'Output Sanitization', enabled: true },
                  { control: 'Rate Limiting', enabled: true },
                  { control: 'DDoS Protection', enabled: true },
                  { control: 'Vulnerability Scanning', enabled: true },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--gray-50)', borderRadius: '6px', marginBottom: '8px' }}>
                    <span>{item.control}</span>
                    <span className={`status-badge ${item.enabled ? 'success' : 'danger'}`}>{item.enabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Access Audit */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Recent Access Log</h3>
              </div>
              <div className="card-body">
                {[
                  { user: 'john.doe@bank.com', action: 'Model Inference', time: '2 min ago', ip: '10.0.1.45' },
                  { user: 'jane.smith@bank.com', action: 'View Report', time: '15 min ago', ip: '10.0.1.82' },
                  { user: 'api-service', action: 'Batch Prediction', time: '1 hour ago', ip: '10.0.2.10' },
                  { user: 'admin@bank.com', action: 'Config Update', time: '3 hours ago', ip: '10.0.1.1' },
                  { user: 'ml-pipeline', action: 'Model Retrain', time: '1 day ago', ip: '10.0.3.5' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--gray-50)', borderRadius: '6px', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '13px' }}>{item.user}</div>
                      <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{item.action}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{item.time}</div>
                      <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--gray-400)' }}>{item.ip}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Portable AI Tab */}
      {activeTab === 'portable-ai' && (
        <div className="portable-ai-content">
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header" style={{ background: 'linear-gradient(90deg, #0891b215, #6366f115)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#0891b2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="package" size={28} />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>Portable AI</h2>
                  <p style={{ color: 'var(--gray-500)' }}>Model deployment, containerization, and cross-platform compatibility</p>
                </div>
              </div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#0891b2' }}>95%</div>
            </div>
          </div>

          <div className="grid grid-cols-4" style={{ gap: '16px', marginBottom: '24px' }}>
            {[
              { name: 'Model Format', value: 'ONNX', icon: 'package', color: '#0891b2' },
              { name: 'Container', value: 'Docker', icon: 'layers', color: '#2563eb' },
              { name: 'Orchestration', value: 'K8s', icon: 'cog', color: '#7c3aed' },
              { name: 'Registry', value: 'MLflow', icon: 'database', color: '#059669' },
            ].map((item, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon" style={{ background: `${item.color}20`, color: item.color }}>
                  <Icon name={item.icon} size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-label">{item.name}</div>
                  <div className="stat-value">{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2" style={{ gap: '24px' }}>
            {/* Export Formats */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Model Export Formats</h3>
              </div>
              <div className="card-body">
                {[
                  { format: 'ONNX', status: 'available', size: '45 MB' },
                  { format: 'TensorFlow SavedModel', status: 'available', size: '52 MB' },
                  { format: 'PyTorch (.pt)', status: 'available', size: '48 MB' },
                  { format: 'PMML', status: 'available', size: '38 MB' },
                  { format: 'Core ML', status: 'available', size: '41 MB' },
                  { format: 'TensorRT', status: 'available', size: '35 MB' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 500 }}>{item.format}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{item.size}</span>
                      <button className="btn btn-sm btn-secondary"><Icon name="download" size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deployment Targets */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Deployment Targets</h3>
              </div>
              <div className="card-body">
                {[
                  { target: 'AWS SageMaker', status: 'deployed', env: 'Production' },
                  { target: 'Azure ML', status: 'ready', env: 'Staging' },
                  { target: 'GCP Vertex AI', status: 'ready', env: 'Available' },
                  { target: 'On-Premise K8s', status: 'deployed', env: 'Production' },
                  { target: 'Edge Devices', status: 'ready', env: 'Available' },
                  { target: 'Databricks', status: 'ready', env: 'Available' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 500 }}>{item.target}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{item.env}</span>
                      <span className={`status-badge ${item.status === 'deployed' ? 'success' : 'info'}`}>
                        {item.status === 'deployed' ? 'Deployed' : 'Ready'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compliance AI Tab */}
      {activeTab === 'compliance-ai' && (
        <div className="compliance-ai-content">
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header" style={{ background: 'linear-gradient(90deg, #ea580c15, #dc262615)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#ea580c', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="clipboard-check" size={28} />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>Compliance AI</h2>
                  <p style={{ color: 'var(--gray-500)' }}>Regulatory compliance, audit readiness, and documentation</p>
                </div>
              </div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#ea580c' }}>{useCase.governance || 97}%</div>
            </div>
          </div>

          {/* Compliance Status */}
          <div className="grid grid-cols-4" style={{ gap: '16px', marginBottom: '24px' }}>
            {[
              { reg: 'SR 11-7', status: 'Compliant', desc: 'Fed Model Risk Management' },
              { reg: 'GDPR', status: 'Compliant', desc: 'EU Data Protection' },
              { reg: 'CCPA', status: 'Compliant', desc: 'CA Consumer Privacy' },
              { reg: 'ECOA', status: 'Compliant', desc: 'Equal Credit Opportunity' },
              { reg: 'FCRA', status: 'Compliant', desc: 'Fair Credit Reporting' },
              { reg: 'SOX', status: 'Compliant', desc: 'Sarbanes-Oxley' },
              { reg: 'Basel III', status: 'Compliant', desc: 'Banking Regulation' },
              { reg: 'AI Act', status: 'Compliant', desc: 'EU AI Regulation' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--gray-200)', background: 'white', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--success-600)', marginBottom: '4px' }}>{item.reg}</div>
                <span className="status-badge success" style={{ marginBottom: '8px' }}>{item.status}</span>
                <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{item.desc}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2" style={{ gap: '24px' }}>
            {/* Documentation */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Required Documentation</h3>
              </div>
              <div className="card-body">
                {[
                  { doc: 'Model Development Document', status: 'complete', date: '2025-01-15' },
                  { doc: 'Model Validation Report', status: 'complete', date: '2025-01-20' },
                  { doc: 'Data Quality Assessment', status: 'complete', date: '2025-01-18' },
                  { doc: 'Bias & Fairness Analysis', status: 'complete', date: '2025-01-22' },
                  { doc: 'Performance Monitoring Plan', status: 'complete', date: '2025-01-25' },
                  { doc: 'Incident Response Plan', status: 'complete', date: '2025-01-10' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon name="file" size={16} />
                      <span style={{ fontWeight: 500 }}>{item.doc}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{item.date}</span>
                      <span className="status-badge success">Complete</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Trail */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Audit Trail</h3>
              </div>
              <div className="card-body">
                {[
                  { event: 'Model Deployed to Production', user: 'ml-ops-team', date: '2025-01-28 10:30' },
                  { event: 'Validation Approved', user: 'risk-committee', date: '2025-01-25 14:15' },
                  { event: 'Bias Testing Completed', user: 'compliance-team', date: '2025-01-22 09:00' },
                  { event: 'Model Training Completed', user: 'data-science', date: '2025-01-20 16:45' },
                  { event: 'Data Pipeline Certified', user: 'data-governance', date: '2025-01-18 11:30' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success-500)', marginTop: '6px', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: '13px' }}>{item.event}</div>
                      <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{item.user} • {item.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'problem' && (
        <div className="problem-tab-content">
          {/* Business Problem */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Business Problem Statement</h3>
            </div>
            <div className="card-body">
              <div style={{ padding: '20px', background: 'var(--warning-50)', borderRadius: '8px', border: '1px solid var(--warning-200)', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: 'var(--warning-700)' }}>Problem</h4>
                <p style={{ margin: 0, lineHeight: 1.7, color: 'var(--gray-700)' }}>
                  {useCase.name.toLowerCase().includes('fraud') ?
                    'Financial institutions face increasing sophisticated fraud attempts resulting in billions of dollars in losses annually. Traditional rule-based systems fail to detect novel fraud patterns, leading to both high false positive rates (customer friction) and missed fraud cases (financial losses).' :
                   useCase.name.toLowerCase().includes('credit') ?
                    'Manual credit assessment processes are slow, inconsistent, and fail to leverage the full spectrum of available data. This results in suboptimal lending decisions, increased default rates, and missed revenue opportunities from creditworthy customers.' :
                   useCase.name.toLowerCase().includes('risk') ?
                    'Traditional risk assessment methods are reactive rather than predictive, using limited data sources and static models that fail to adapt to changing market conditions. This leads to inadequate capital allocation and unexpected losses.' :
                    'Current manual processes are inefficient, error-prone, and unable to scale with business growth. This results in operational bottlenecks, inconsistent outcomes, and inability to meet regulatory requirements.'}
                </p>
              </div>

              <div className="grid grid-cols-3" style={{ gap: '16px' }}>
                {[
                  { metric: 'Current Accuracy', value: '72%', trend: 'down', desc: 'Before AI implementation' },
                  { metric: 'False Positive Rate', value: '15%', trend: 'down', desc: 'Customer friction' },
                  { metric: 'Processing Time', value: '48 hrs', trend: 'down', desc: 'Manual review time' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '4px' }}>{item.metric}</div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--danger-600)' }}>{item.value}</div>
                    <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Business Use Case */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Business Use Case</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2" style={{ gap: '24px' }}>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--primary-600)' }}>Objectives</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      'Improve detection accuracy by 25%+',
                      'Reduce false positive rate by 50%',
                      'Enable real-time decision making',
                      'Ensure regulatory compliance',
                      'Reduce operational costs by 40%'
                    ].map((obj, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--gray-50)', borderRadius: '6px' }}>
                        <Icon name="check" size={14} style={{ color: 'var(--success-500)' }} />
                        <span style={{ fontSize: '13px' }}>{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--success-600)' }}>Success Criteria</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { criteria: 'Model Accuracy', target: `≥ ${useCase.accuracy}%`, status: 'achieved' },
                      { criteria: 'Latency', target: '< 100ms', status: 'achieved' },
                      { criteria: 'Availability', target: '99.9% SLA', status: 'achieved' },
                      { criteria: 'Explainability', target: 'SHAP/LIME enabled', status: 'achieved' },
                      { criteria: 'Audit Compliance', target: 'Full audit trail', status: 'achieved' }
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--gray-50)', borderRadius: '6px' }}>
                        <span style={{ fontSize: '13px' }}>{item.criteria}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '600', color: 'var(--primary-600)' }}>{item.target}</span>
                          <Icon name="check" size={14} style={{ color: 'var(--success-500)' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* High Level Design */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">High Level Design (HLD)</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', gap: '16px', padding: '24px', background: 'var(--gray-50)', borderRadius: '12px' }}>
                {[
                  { layer: 'Data Sources', items: ['Transaction DB', 'Customer Profiles', 'External APIs', 'Historical Data'], color: 'var(--primary-500)' },
                  { layer: 'Ingestion Layer', items: ['Kafka Streams', 'Batch ETL', 'Real-time CDC', 'API Gateway'], color: 'var(--warning-500)' },
                  { layer: 'Processing Layer', items: ['Feature Store', 'Data Validation', 'Transformation', 'Enrichment'], color: 'var(--success-500)' },
                  { layer: 'ML Layer', items: ['Model Training', 'Model Registry', 'A/B Testing', 'Inference Engine'], color: 'var(--danger-500)' },
                  { layer: 'Serving Layer', items: ['REST API', 'gRPC', 'Batch Scoring', 'Real-time Scoring'], color: 'var(--purple-500)' },
                ].map((layer, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ textAlign: 'center', padding: '12px', background: layer.color, color: 'white', borderRadius: '8px 8px 0 0', fontWeight: '600', fontSize: '13px' }}>{layer.layer}</div>
                    <div style={{ flex: 1, background: 'white', padding: '12px', borderRadius: '0 0 8px 8px', border: '1px solid var(--gray-200)', borderTop: 'none' }}>
                      {layer.items.map((item, j) => (
                        <div key={j} style={{ padding: '8px', marginBottom: j < layer.items.length - 1 ? '8px' : 0, background: 'var(--gray-50)', borderRadius: '4px', fontSize: '12px', textAlign: 'center' }}>{item}</div>
                      ))}
                    </div>
                    {i < 4 && <div style={{ position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }}>→</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Solution Architecture */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Solution Overview</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2" style={{ gap: '24px' }}>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Solution Components</h4>
                  {[
                    { component: 'Data Pipeline', desc: 'Automated ETL with data quality checks', tech: 'Airflow, Spark, Great Expectations' },
                    { component: 'Feature Engineering', desc: 'Real-time and batch feature computation', tech: 'Feature Store, Feast, Redis' },
                    { component: 'Model Training', desc: 'Automated retraining with MLOps', tech: 'MLflow, Kubeflow, DVC' },
                    { component: 'Model Serving', desc: 'Low-latency inference at scale', tech: 'TensorFlow Serving, FastAPI, K8s' },
                    { component: 'Monitoring', desc: 'Model performance and drift detection', tech: 'Evidently AI, Prometheus, Grafana' },
                  ].map((item, i) => (
                    <div key={i} style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px', marginBottom: '12px' }}>
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>{item.component}</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-600)', marginBottom: '4px' }}>{item.desc}</div>
                      <div style={{ fontSize: '11px', color: 'var(--primary-600)' }}>{item.tech}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>After AI Implementation</h4>
                  <div className="grid grid-cols-1" style={{ gap: '12px' }}>
                    {[
                      { metric: 'Accuracy', before: '72%', after: `${useCase.accuracy}%`, improvement: `+${(useCase.accuracy - 72).toFixed(1)}%` },
                      { metric: 'False Positive Rate', before: '15%', after: '3%', improvement: '-80%' },
                      { metric: 'Processing Time', before: '48 hrs', after: '< 100ms', improvement: '-99.9%' },
                      { metric: 'Operational Cost', before: '$2.5M/yr', after: '$1.5M/yr', improvement: '-40%' },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--success-50)', borderRadius: '8px', border: '1px solid var(--success-200)' }}>
                        <span style={{ fontWeight: '500' }}>{item.metric}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ color: 'var(--danger-600)', textDecoration: 'line-through', fontSize: '13px' }}>{item.before}</span>
                          <span style={{ color: 'var(--success-600)', fontWeight: '700' }}>{item.after}</span>
                          <span style={{ padding: '2px 8px', background: 'var(--success-500)', color: 'white', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>{item.improvement}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Flowchart */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Process Flowchart</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '24px', background: 'var(--gray-50)', borderRadius: '12px', overflowX: 'auto' }}>
                {[
                  { step: 'Input', label: 'Receive Request', shape: 'rounded' },
                  { step: 'Process', label: 'Data Validation', shape: 'rect' },
                  { step: 'Process', label: 'Feature Extraction', shape: 'rect' },
                  { step: 'Decision', label: 'Risk Score', shape: 'diamond' },
                  { step: 'Process', label: 'ML Inference', shape: 'rect' },
                  { step: 'Decision', label: 'Threshold Check', shape: 'diamond' },
                  { step: 'Output', label: 'Decision', shape: 'rounded' },
                ].map((item, i) => (
                  <React.Fragment key={i}>
                    <div style={{
                      padding: '16px 24px',
                      background: item.step === 'Input' ? 'var(--success-500)' : item.step === 'Output' ? 'var(--primary-500)' : item.shape === 'diamond' ? 'var(--warning-500)' : 'white',
                      color: item.step === 'Input' || item.step === 'Output' || item.shape === 'diamond' ? 'white' : 'var(--gray-700)',
                      borderRadius: item.shape === 'rounded' ? '24px' : item.shape === 'diamond' ? '8px' : '8px',
                      transform: item.shape === 'diamond' ? 'rotate(0deg)' : 'none',
                      border: item.shape === 'rect' ? '2px solid var(--gray-300)' : 'none',
                      fontWeight: '500',
                      fontSize: '13px',
                      textAlign: 'center',
                      minWidth: '100px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      {item.label}
                    </div>
                    {i < 6 && <div style={{ color: 'var(--gray-400)', fontSize: '20px' }}>→</div>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stakeholders' && (
        <div className="stakeholders-tab-content">
          {/* Stakeholder Overview */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Stakeholder Map</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-4" style={{ gap: '16px' }}>
                {[
                  { role: 'Executive Sponsor', name: 'Michael Richardson', title: 'Chief Risk Officer', location: 'New York, NY', influence: 'High', interest: 'High', color: 'var(--danger-500)' },
                  { role: 'Business Owner', name: 'Jennifer Martinez', title: 'VP Risk Management', location: 'Chicago, IL', influence: 'High', interest: 'High', color: 'var(--primary-500)' },
                  { role: 'Technical Lead', name: 'David Chen', title: 'Head of Data Science', location: 'San Francisco, CA', influence: 'High', interest: 'High', color: 'var(--success-500)' },
                  { role: 'Operations Lead', name: 'Sarah Thompson', title: 'Director of Operations', location: 'Dallas, TX', influence: 'Medium', interest: 'High', color: 'var(--warning-500)' },
                ].map((stakeholder, i) => (
                  <div key={i} style={{ padding: '20px', background: 'var(--gray-50)', borderRadius: '12px', borderTop: `4px solid ${stakeholder.color}` }}>
                    <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '4px' }}>{stakeholder.role}</div>
                    <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '2px' }}>{stakeholder.name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--gray-600)', marginBottom: '4px' }}>{stakeholder.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginBottom: '12px' }}>{stakeholder.location}</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ padding: '2px 8px', background: stakeholder.influence === 'High' ? 'var(--success-100)' : 'var(--warning-100)', color: stakeholder.influence === 'High' ? 'var(--success-700)' : 'var(--warning-700)', borderRadius: '4px', fontSize: '11px' }}>Influence: {stakeholder.influence}</span>
                      <span style={{ padding: '2px 8px', background: 'var(--primary-100)', color: 'var(--primary-700)', borderRadius: '4px', fontSize: '11px' }}>Interest: {stakeholder.interest}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RACI Matrix */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">RACI Matrix</h3>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Activity</th>
                    <th>Executive</th>
                    <th>Business Owner</th>
                    <th>Data Science</th>
                    <th>Operations</th>
                    <th>Compliance</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { activity: 'Business Requirements', roles: ['A', 'R', 'C', 'C', 'I'] },
                    { activity: 'Data Strategy', roles: ['I', 'A', 'R', 'C', 'C'] },
                    { activity: 'Model Development', roles: ['I', 'C', 'R', 'I', 'C'] },
                    { activity: 'Model Validation', roles: ['I', 'A', 'R', 'I', 'R'] },
                    { activity: 'Deployment', roles: ['I', 'A', 'C', 'R', 'C'] },
                    { activity: 'Monitoring', roles: ['I', 'I', 'C', 'R', 'C'] },
                    { activity: 'Governance Review', roles: ['A', 'C', 'C', 'I', 'R'] },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: '500' }}>{row.activity}</td>
                      {row.roles.map((role, j) => (
                        <td key={j}>
                          <span style={{
                            display: 'inline-block',
                            width: '28px',
                            height: '28px',
                            lineHeight: '28px',
                            textAlign: 'center',
                            borderRadius: '50%',
                            fontWeight: '600',
                            fontSize: '12px',
                            background: role === 'R' ? 'var(--primary-500)' : role === 'A' ? 'var(--danger-500)' : role === 'C' ? 'var(--warning-500)' : 'var(--gray-200)',
                            color: role === 'I' ? 'var(--gray-600)' : 'white'
                          }}>{role}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: '16px', display: 'flex', gap: '24px', borderTop: '1px solid var(--gray-200)' }}>
                <span><span style={{ display: 'inline-block', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--danger-500)', marginRight: '8px', verticalAlign: 'middle' }}></span><strong>A</strong> - Accountable</span>
                <span><span style={{ display: 'inline-block', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--primary-500)', marginRight: '8px', verticalAlign: 'middle' }}></span><strong>R</strong> - Responsible</span>
                <span><span style={{ display: 'inline-block', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--warning-500)', marginRight: '8px', verticalAlign: 'middle' }}></span><strong>C</strong> - Consulted</span>
                <span><span style={{ display: 'inline-block', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--gray-200)', marginRight: '8px', verticalAlign: 'middle' }}></span><strong>I</strong> - Informed</span>
              </div>
            </div>
          </div>

          {/* Stakeholder Communication */}
          <div className="grid grid-cols-2" style={{ gap: '24px' }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Communication Plan</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { stakeholder: 'Executive Team', frequency: 'Monthly', format: 'Dashboard & Report', channel: 'Email + Meeting' },
                    { stakeholder: 'Business Owners', frequency: 'Weekly', format: 'Status Report', channel: 'Slack + Email' },
                    { stakeholder: 'Technical Team', frequency: 'Daily', format: 'Stand-up & Alerts', channel: 'Slack + JIRA' },
                    { stakeholder: 'Compliance', frequency: 'Bi-weekly', format: 'Audit Report', channel: 'Email + Portal' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                      <span style={{ fontWeight: '500' }}>{item.stakeholder}</span>
                      <span style={{ color: 'var(--primary-600)', fontSize: '13px' }}>{item.frequency}</span>
                      <span style={{ color: 'var(--gray-600)', fontSize: '13px' }}>{item.format}</span>
                      <span className="status-badge secondary">{item.channel}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Approval Workflow</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { stage: 'Business Requirements', approver: 'Business Owner', status: 'approved', date: '2024-11-15' },
                    { stage: 'Technical Design', approver: 'Tech Lead', status: 'approved', date: '2024-11-28' },
                    { stage: 'Model Validation', approver: 'MRM Team', status: 'approved', date: '2025-01-05' },
                    { stage: 'Production Release', approver: 'Executive Sponsor', status: 'approved', date: '2025-01-15' },
                    { stage: 'Ongoing Review', approver: 'Compliance', status: 'in-progress', date: 'Quarterly' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: item.status === 'approved' ? 'var(--success-500)' : 'var(--warning-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name={item.status === 'approved' ? 'check' : 'clock'} size={14} style={{ color: 'white' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500', fontSize: '14px' }}>{item.stage}</div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{item.approver} • {item.date}</div>
                      </div>
                      <span className={`status-badge ${item.status === 'approved' ? 'success' : 'warning'}`}>{item.status === 'approved' ? 'Approved' : 'In Progress'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'readme' && (
        <div className="readme-tab-content">
          {/* Overview Section */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">README - {useCase.name}</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary btn-sm"><Icon name="download" size={14} /> Export</button>
                <button className="btn btn-secondary btn-sm"><Icon name="edit" size={14} /> Edit</button>
              </div>
            </div>
            <div className="card-body">
              <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '8px', marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Project Overview</h4>
                <p style={{ margin: 0, color: 'var(--gray-600)', lineHeight: 1.6 }}>
                  {useCase.name} is an AI/ML-powered solution designed to {useCase.name.toLowerCase().includes('fraud') ? 'detect and prevent fraudulent activities' : useCase.name.toLowerCase().includes('risk') ? 'assess and mitigate financial risks' : useCase.name.toLowerCase().includes('credit') ? 'evaluate creditworthiness and manage credit decisions' : 'automate and optimize banking operations'}.
                  This use case leverages advanced machine learning techniques including ensemble methods, deep learning, and hybrid approaches to achieve industry-leading accuracy of {useCase.accuracy}%.
                </p>
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Technology Stack</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-4" style={{ gap: '16px' }}>
                {[
                  { category: 'Languages', items: ['Python 3.10', 'SQL', 'Scala', 'R'], icon: 'code', color: 'var(--primary-500)' },
                  { category: 'ML Frameworks', items: ['TensorFlow 2.x', 'PyTorch', 'Scikit-learn', 'XGBoost'], icon: 'cpu', color: 'var(--success-500)' },
                  { category: 'Data Processing', items: ['Apache Spark', 'Pandas', 'Dask', 'Apache Arrow'], icon: 'database', color: 'var(--warning-500)' },
                  { category: 'Infrastructure', items: ['AWS SageMaker', 'Kubernetes', 'Docker', 'MLflow'], icon: 'cloud', color: 'var(--danger-500)' },
                ].map((stack, i) => (
                  <div key={i} style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: stack.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name={stack.icon} size={18} style={{ color: stack.color }} />
                      </div>
                      <span style={{ fontWeight: '600', color: 'var(--gray-900)' }}>{stack.category}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {stack.items.map((item, j) => (
                        <span key={j} style={{ fontSize: '13px', color: 'var(--gray-600)', padding: '4px 8px', background: 'white', borderRadius: '4px' }}>{item}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ML Techniques & Frameworks */}
          <div className="grid grid-cols-2" style={{ gap: '24px', marginBottom: '24px' }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">ML Techniques Used</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { technique: 'Feature Engineering', desc: 'Automated feature extraction, selection, and transformation', status: 'active' },
                    { technique: 'Dimensionality Reduction', desc: 'PCA, t-SNE, UMAP for high-dimensional data', status: 'active' },
                    { technique: 'Cross-Validation', desc: 'Stratified K-Fold, Time Series CV, Nested CV', status: 'active' },
                    { technique: 'Class Imbalance Handling', desc: 'SMOTE, ADASYN, Class Weights, Focal Loss', status: 'active' },
                    { technique: 'Model Interpretability', desc: 'SHAP, LIME, Anchors, Counterfactual Explanations', status: 'active' },
                    { technique: 'Anomaly Detection', desc: 'Isolation Forest, One-Class SVM, Autoencoders', status: 'active' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontWeight: '500', marginBottom: '4px' }}>{item.technique}</div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{item.desc}</div>
                      </div>
                      <span className="status-badge success">Active</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Frameworks & Libraries</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {[
                    'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'XGBoost', 'LightGBM', 'CatBoost',
                    'Optuna', 'Hyperopt', 'Ray Tune', 'SHAP', 'LIME', 'ELI5', 'Feature-engine',
                    'Imbalanced-learn', 'MLflow', 'DVC', 'Great Expectations', 'Evidently AI',
                    'Weights & Biases', 'Neptune.ai', 'Kubeflow', 'Airflow', 'FastAPI'
                  ].map((lib, i) => (
                    <span key={i} style={{
                      padding: '6px 12px',
                      background: ['TensorFlow', 'PyTorch', 'XGBoost', 'LightGBM'].includes(lib) ? 'var(--primary-100)' : 'var(--gray-100)',
                      color: ['TensorFlow', 'PyTorch', 'XGBoost', 'LightGBM'].includes(lib) ? 'var(--primary-700)' : 'var(--gray-700)',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: ['TensorFlow', 'PyTorch', 'XGBoost', 'LightGBM'].includes(lib) ? '600' : '400'
                    }}>{lib}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Models Used */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Models Used</h3>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Model Type</th>
                    <th>Algorithm</th>
                    <th>Purpose</th>
                    <th>Accuracy</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { type: 'Gradient Boosting', algo: 'XGBoost', purpose: 'Primary classifier', accuracy: (useCase.accuracy - 0.5).toFixed(1), status: 'Production' },
                    { type: 'Gradient Boosting', algo: 'LightGBM', purpose: 'Fast inference model', accuracy: (useCase.accuracy - 0.8).toFixed(1), status: 'Production' },
                    { type: 'Gradient Boosting', algo: 'CatBoost', purpose: 'Categorical features', accuracy: (useCase.accuracy - 1.0).toFixed(1), status: 'Staging' },
                    { type: 'Deep Learning', algo: 'Neural Network (MLP)', purpose: 'Complex patterns', accuracy: (useCase.accuracy - 1.2).toFixed(1), status: 'Production' },
                    { type: 'Deep Learning', algo: 'LSTM', purpose: 'Sequential patterns', accuracy: (useCase.accuracy - 1.5).toFixed(1), status: 'Production' },
                    { type: 'Deep Learning', algo: 'Transformer', purpose: 'Attention mechanism', accuracy: (useCase.accuracy - 0.3).toFixed(1), status: 'Staging' },
                    { type: 'Tree-based', algo: 'Random Forest', purpose: 'Feature importance', accuracy: (useCase.accuracy - 2.0).toFixed(1), status: 'Backup' },
                    { type: 'Linear', algo: 'Logistic Regression', purpose: 'Baseline & interpretability', accuracy: (useCase.accuracy - 5.0).toFixed(1), status: 'Reference' },
                  ].map((model, i) => (
                    <tr key={i}>
                      <td>{model.type}</td>
                      <td style={{ fontWeight: '500' }}>{model.algo}</td>
                      <td style={{ color: 'var(--gray-600)' }}>{model.purpose}</td>
                      <td><span style={{ fontWeight: '600', color: 'var(--success-600)' }}>{model.accuracy}%</span></td>
                      <td><span className={`status-badge ${model.status === 'Production' ? 'success' : model.status === 'Staging' ? 'warning' : 'secondary'}`}>{model.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ensemble & Hybrid Methods */}
          <div className="grid grid-cols-2" style={{ gap: '24px', marginBottom: '24px' }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Ensemble Methods</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { method: 'Stacking Ensemble', desc: 'XGBoost + LightGBM + Neural Network with meta-learner', boost: '+2.3%', models: ['XGBoost', 'LightGBM', 'MLP'] },
                    { method: 'Weighted Voting', desc: 'Soft voting with optimized weights', boost: '+1.8%', models: ['RF', 'XGBoost', 'CatBoost'] },
                    { method: 'Bagging', desc: 'Bootstrap aggregating for variance reduction', boost: '+1.2%', models: ['Decision Trees'] },
                    { method: 'Boosting Chain', desc: 'Sequential boosting with error correction', boost: '+2.1%', models: ['GBM', 'AdaBoost'] },
                  ].map((item, i) => (
                    <div key={i} style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '600' }}>{item.method}</span>
                        <span style={{ color: 'var(--success-600)', fontWeight: '600', fontSize: '14px' }}>{item.boost} accuracy</span>
                      </div>
                      <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--gray-600)' }}>{item.desc}</p>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {item.models.map((m, j) => (
                          <span key={j} style={{ padding: '2px 8px', background: 'var(--primary-100)', color: 'var(--primary-700)', borderRadius: '4px', fontSize: '11px' }}>{m}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Hybrid Approaches</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { approach: 'Rule + ML Hybrid', desc: 'Business rules for known patterns, ML for complex cases', components: ['Expert Rules', 'XGBoost', 'Decision Engine'] },
                    { approach: 'Two-Stage Model', desc: 'Coarse filter followed by fine-grained classifier', components: ['Random Forest', 'Deep Neural Network'] },
                    { approach: 'Online + Batch', desc: 'Real-time scoring with periodic batch retraining', components: ['Online Learner', 'Batch Trainer', 'Model Syncer'] },
                    { approach: 'Supervised + Unsupervised', desc: 'Anomaly detection combined with classification', components: ['Isolation Forest', 'Autoencoder', 'XGBoost'] },
                  ].map((item, i) => (
                    <div key={i} style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                      <div style={{ fontWeight: '600', marginBottom: '8px' }}>{item.approach}</div>
                      <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--gray-600)' }}>{item.desc}</p>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {item.components.map((c, j) => (
                          <span key={j} style={{ padding: '2px 8px', background: 'var(--warning-100)', color: 'var(--warning-700)', borderRadius: '4px', fontSize: '11px' }}>{c}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Hyperparameter Tuning */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Hyperparameter Tuning</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-3" style={{ gap: '16px', marginBottom: '24px' }}>
                {[
                  { method: 'Bayesian Optimization', tool: 'Optuna', trials: 500, status: 'Primary' },
                  { method: 'Random Search', tool: 'Scikit-learn', trials: 200, status: 'Baseline' },
                  { method: 'Hyperband', tool: 'Ray Tune', trials: 300, status: 'Efficient' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '8px' }}>{item.method}</div>
                    <div style={{ color: 'var(--primary-600)', fontSize: '13px', marginBottom: '4px' }}>{item.tool}</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{item.trials} trials</div>
                    <span className="status-badge primary" style={{ marginTop: '8px' }}>{item.status}</span>
                  </div>
                ))}
              </div>

              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Tuned Parameters (XGBoost)</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {[
                  { param: 'n_estimators', value: '1000', range: '100-2000' },
                  { param: 'max_depth', value: '8', range: '3-12' },
                  { param: 'learning_rate', value: '0.05', range: '0.01-0.3' },
                  { param: 'min_child_weight', value: '3', range: '1-10' },
                  { param: 'subsample', value: '0.8', range: '0.5-1.0' },
                  { param: 'colsample_bytree', value: '0.8', range: '0.5-1.0' },
                  { param: 'gamma', value: '0.1', range: '0-0.5' },
                  { param: 'reg_alpha', value: '0.01', range: '0-1' },
                  { param: 'reg_lambda', value: '1', range: '0-10' },
                ].map((p, i) => (
                  <div key={i} style={{ padding: '10px 14px', background: 'var(--gray-50)', borderRadius: '8px', minWidth: '150px' }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--primary-600)', marginBottom: '4px' }}>{p.param}</div>
                    <div style={{ fontWeight: '700', fontSize: '16px' }}>{p.value}</div>
                    <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>Range: {p.range}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Accuracy Techniques */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Accuracy Optimization Techniques</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2" style={{ gap: '24px' }}>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--primary-600)' }}>Data Quality</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { tech: 'Data Cleaning', impact: 'High', desc: 'Outlier removal, missing value imputation' },
                      { tech: 'Feature Scaling', impact: 'Medium', desc: 'StandardScaler, MinMaxScaler, RobustScaler' },
                      { tech: 'Data Augmentation', impact: 'High', desc: 'SMOTE, ADASYN for imbalanced classes' },
                      { tech: 'Feature Selection', impact: 'Medium', desc: 'Recursive Feature Elimination, Boruta' },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--gray-50)', borderRadius: '6px' }}>
                        <div>
                          <span style={{ fontWeight: '500' }}>{item.tech}</span>
                          <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{item.desc}</div>
                        </div>
                        <span className={`status-badge ${item.impact === 'High' ? 'success' : 'warning'}`}>{item.impact}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--success-600)' }}>Model Optimization</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { tech: 'Ensemble Learning', impact: 'High', desc: 'Stacking, voting, bagging combinations' },
                      { tech: 'Hyperparameter Tuning', impact: 'High', desc: 'Bayesian optimization with Optuna' },
                      { tech: 'Regularization', impact: 'Medium', desc: 'L1/L2, Dropout, Early Stopping' },
                      { tech: 'Threshold Optimization', impact: 'Medium', desc: 'Cost-sensitive threshold tuning' },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--gray-50)', borderRadius: '6px' }}>
                        <div>
                          <span style={{ fontWeight: '500' }}>{item.tech}</span>
                          <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{item.desc}</div>
                        </div>
                        <span className={`status-badge ${item.impact === 'High' ? 'success' : 'warning'}`}>{item.impact}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px', padding: '16px', background: 'var(--success-50)', borderRadius: '8px', border: '1px solid var(--success-200)' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--success-700)' }}>Accuracy Metrics Achieved</h4>
                <div style={{ display: 'flex', gap: '32px' }}>
                  <div><span style={{ fontSize: '12px', color: 'var(--gray-600)' }}>Accuracy</span><div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success-600)' }}>{useCase.accuracy}%</div></div>
                  <div><span style={{ fontSize: '12px', color: 'var(--gray-600)' }}>Precision</span><div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success-600)' }}>{(useCase.accuracy - 0.3).toFixed(1)}%</div></div>
                  <div><span style={{ fontSize: '12px', color: 'var(--gray-600)' }}>Recall</span><div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success-600)' }}>{(useCase.accuracy - 0.5).toFixed(1)}%</div></div>
                  <div><span style={{ fontSize: '12px', color: 'var(--gray-600)' }}>F1-Score</span><div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success-600)' }}>{(useCase.accuracy - 0.4).toFixed(1)}%</div></div>
                  <div><span style={{ fontSize: '12px', color: 'var(--gray-600)' }}>AUC-ROC</span><div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success-600)' }}>{(useCase.accuracy / 100).toFixed(3)}</div></div>
                </div>
              </div>
            </div>
          </div>

          {/* Documentation Links */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Documentation & Resources</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-4" style={{ gap: '16px' }}>
                {[
                  { title: 'Technical Spec', desc: 'Architecture & design documents', icon: 'file' },
                  { title: 'API Reference', desc: 'Endpoint documentation', icon: 'code' },
                  { title: 'Model Card', desc: 'Model documentation & metrics', icon: 'clipboard-check' },
                  { title: 'Runbook', desc: 'Operations & troubleshooting', icon: 'settings' },
                ].map((doc, i) => (
                  <div key={i} style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid var(--gray-200)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Icon name={doc.icon} size={18} />
                      <span style={{ fontWeight: '600' }}>{doc.title}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--gray-500)' }}>{doc.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'lld' && (
        <div className="lld-tab-content">
          {/* LLD Header */}
          <div className="card" style={{ marginBottom: '24px', border: '2px solid var(--danger-200)' }}>
            <div className="card-header" style={{ background: 'linear-gradient(90deg, var(--danger-50), var(--warning-50))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'var(--danger-500)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="code" size={28} />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>Low Level Design (LLD)</h2>
                  <p style={{ color: 'var(--gray-500)' }}>Technical implementation details, class diagrams, and system specifications</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary btn-sm"><Icon name="download" size={14} /> Export PDF</button>
                <button className="btn btn-primary btn-sm"><Icon name="edit" size={14} /> Edit</button>
              </div>
            </div>
          </div>

          {/* Software Architecture Document */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Software Architecture Document</h3>
              <span className="status-badge success">Approved</span>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2" style={{ gap: '24px', marginBottom: '24px' }}>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--primary-600)' }}>Document Information</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { label: 'Document ID', value: `LLD-${useCase.id.toUpperCase()}-001` },
                      { label: 'Version', value: 'v2.3.1' },
                      { label: 'Author', value: 'David Chen, Principal Architect' },
                      { label: 'Reviewer', value: 'Sarah Thompson, Tech Lead' },
                      { label: 'Last Updated', value: '2025-01-15' },
                      { label: 'Status', value: 'Production Ready' },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--gray-50)', borderRadius: '6px' }}>
                        <span style={{ color: 'var(--gray-500)', fontSize: '13px' }}>{item.label}</span>
                        <span style={{ fontWeight: '500', fontSize: '13px' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--success-600)' }}>Architecture Principles</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { principle: 'Microservices Architecture', desc: 'Loosely coupled, independently deployable services' },
                      { principle: 'Event-Driven Design', desc: 'Async communication via message queues' },
                      { principle: 'Domain-Driven Design', desc: 'Business logic organized by bounded contexts' },
                      { principle: 'SOLID Principles', desc: 'Clean code with single responsibility' },
                      { principle: 'Twelve-Factor App', desc: 'Cloud-native deployment methodology' },
                    ].map((item, i) => (
                      <div key={i} style={{ padding: '8px 12px', background: 'var(--gray-50)', borderRadius: '6px' }}>
                        <div style={{ fontWeight: '500', fontSize: '13px' }}>{item.principle}</div>
                        <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Class Diagram */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Class Diagram</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start', padding: '24px', background: 'var(--gray-50)', borderRadius: '12px', gap: '24px', flexWrap: 'wrap' }}>
                {[
                  { name: 'ModelService', type: 'Service', methods: ['predict()', 'train()', 'evaluate()', 'getMetrics()'], attributes: ['modelId', 'version', 'config'] },
                  { name: 'FeatureEngine', type: 'Component', methods: ['extract()', 'transform()', 'validate()', 'cache()'], attributes: ['featureStore', 'schema', 'pipeline'] },
                  { name: 'DataLoader', type: 'Repository', methods: ['load()', 'preprocess()', 'split()', 'batch()'], attributes: ['source', 'format', 'batchSize'] },
                  { name: 'PredictionResult', type: 'Entity', methods: ['serialize()', 'validate()', 'explain()'], attributes: ['score', 'confidence', 'features'] },
                ].map((cls, i) => (
                  <div key={i} style={{ minWidth: '200px', background: 'white', borderRadius: '8px', border: '2px solid var(--primary-300)', overflow: 'hidden' }}>
                    <div style={{ padding: '12px', background: 'var(--primary-500)', color: 'white', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', opacity: 0.8 }}>«{cls.type}»</div>
                      <div style={{ fontWeight: '700', fontSize: '14px' }}>{cls.name}</div>
                    </div>
                    <div style={{ padding: '12px', borderBottom: '1px solid var(--gray-200)' }}>
                      {cls.attributes.map((attr, j) => (
                        <div key={j} style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--gray-600)', padding: '2px 0' }}>- {attr}: string</div>
                      ))}
                    </div>
                    <div style={{ padding: '12px' }}>
                      {cls.methods.map((method, j) => (
                        <div key={j} style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--primary-600)', padding: '2px 0' }}>+ {method}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Architecture Document */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">System Architecture Document</h3>
            </div>
            <div className="card-body">
              {/* Component Diagram */}
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Component Architecture</h4>
              <div style={{ display: 'flex', alignItems: 'stretch', gap: '16px', padding: '24px', background: 'var(--gray-50)', borderRadius: '12px', marginBottom: '24px' }}>
                {[
                  { layer: 'Presentation Layer', components: ['REST API', 'GraphQL', 'WebSocket', 'Batch API'], color: 'var(--primary-500)' },
                  { layer: 'Application Layer', components: ['Model Service', 'Feature Service', 'Scoring Engine', 'Explainer'], color: 'var(--success-500)' },
                  { layer: 'Domain Layer', components: ['Prediction Logic', 'Feature Engineering', 'Model Registry', 'Rules Engine'], color: 'var(--warning-500)' },
                  { layer: 'Infrastructure Layer', components: ['Database', 'Cache', 'Message Queue', 'Object Storage'], color: 'var(--danger-500)' },
                ].map((layer, i) => (
                  <div key={i} style={{ flex: 1 }}>
                    <div style={{ textAlign: 'center', padding: '12px', background: layer.color, color: 'white', borderRadius: '8px 8px 0 0', fontWeight: '600', fontSize: '12px' }}>{layer.layer}</div>
                    <div style={{ background: 'white', padding: '12px', borderRadius: '0 0 8px 8px', border: `2px solid ${layer.color}`, borderTop: 'none' }}>
                      {layer.components.map((comp, j) => (
                        <div key={j} style={{ padding: '8px', marginBottom: j < layer.components.length - 1 ? '8px' : 0, background: 'var(--gray-50)', borderRadius: '4px', fontSize: '11px', textAlign: 'center' }}>{comp}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Technical Specifications */}
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Technical Specifications</h4>
              <div className="grid grid-cols-3" style={{ gap: '16px' }}>
                {[
                  { category: 'Compute', specs: [{ name: 'CPU', value: '8 vCPUs (Intel Xeon)' }, { name: 'Memory', value: '32 GB RAM' }, { name: 'GPU', value: 'NVIDIA T4 (inference)' }] },
                  { category: 'Storage', specs: [{ name: 'Database', value: 'PostgreSQL 14' }, { name: 'Cache', value: 'Redis 7.0' }, { name: 'Object Store', value: 'S3 / MinIO' }] },
                  { category: 'Networking', specs: [{ name: 'Protocol', value: 'HTTPS/gRPC' }, { name: 'Load Balancer', value: 'AWS ALB' }, { name: 'Service Mesh', value: 'Istio' }] },
                ].map((cat, i) => (
                  <div key={i} style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', marginBottom: '12px', color: 'var(--primary-600)' }}>{cat.category}</div>
                    {cat.specs.map((spec, j) => (
                      <div key={j} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: j < cat.specs.length - 1 ? '1px solid var(--gray-200)' : 'none' }}>
                        <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{spec.name}</span>
                        <span style={{ fontSize: '12px', fontWeight: '500' }}>{spec.value}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sequence Diagram - Technical Flow */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Technical Flow - Sequence Diagram</h3>
            </div>
            <div className="card-body">
              <div style={{ overflowX: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '24px', minWidth: '900px' }}>
                  {['Client', 'API Gateway', 'Auth Service', 'Feature Store', 'Model Service', 'Cache', 'Response'].map((actor, i) => (
                    <div key={i} style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ padding: '10px', background: i === 0 || i === 6 ? 'var(--primary-500)' : 'var(--gray-100)', color: i === 0 || i === 6 ? 'white' : 'var(--gray-700)', borderRadius: '6px', fontWeight: '600', fontSize: '11px' }}>{actor}</div>
                      <div style={{ width: '2px', height: '280px', background: 'var(--gray-300)', margin: '0 auto', position: 'relative' }}>
                        {i === 0 && (
                          <>
                            <div style={{ position: 'absolute', top: '20px', left: '8px', fontSize: '10px', color: 'var(--gray-600)', whiteSpace: 'nowrap' }}>1. POST /predict</div>
                            <div style={{ position: 'absolute', top: '60px', left: '8px', fontSize: '10px', color: 'var(--gray-600)', whiteSpace: 'nowrap' }}>2. JWT Validation</div>
                            <div style={{ position: 'absolute', top: '100px', left: '8px', fontSize: '10px', color: 'var(--gray-600)', whiteSpace: 'nowrap' }}>3. Get Features</div>
                            <div style={{ position: 'absolute', top: '140px', left: '8px', fontSize: '10px', color: 'var(--gray-600)', whiteSpace: 'nowrap' }}>4. Check Cache</div>
                            <div style={{ position: 'absolute', top: '180px', left: '8px', fontSize: '10px', color: 'var(--gray-600)', whiteSpace: 'nowrap' }}>5. Run Inference</div>
                            <div style={{ position: 'absolute', top: '220px', left: '8px', fontSize: '10px', color: 'var(--gray-600)', whiteSpace: 'nowrap' }}>6. Return Score</div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* API Specifications */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">API Specifications</h3>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Endpoint</th>
                    <th>Method</th>
                    <th>Description</th>
                    <th>Request</th>
                    <th>Response</th>
                    <th>Latency</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { endpoint: '/api/v1/predict', method: 'POST', desc: 'Single prediction', req: 'PredictRequest', res: 'PredictResponse', latency: '< 50ms' },
                    { endpoint: '/api/v1/batch', method: 'POST', desc: 'Batch prediction', req: 'BatchRequest', res: 'BatchResponse', latency: '< 5s' },
                    { endpoint: '/api/v1/explain', method: 'POST', desc: 'SHAP explanation', req: 'ExplainRequest', res: 'ExplainResponse', latency: '< 200ms' },
                    { endpoint: '/api/v1/model/info', method: 'GET', desc: 'Model metadata', req: '-', res: 'ModelInfo', latency: '< 10ms' },
                    { endpoint: '/api/v1/health', method: 'GET', desc: 'Health check', req: '-', res: 'HealthStatus', latency: '< 5ms' },
                    { endpoint: '/api/v1/metrics', method: 'GET', desc: 'Performance metrics', req: '-', res: 'MetricsResponse', latency: '< 20ms' },
                  ].map((api, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{api.endpoint}</td>
                      <td><span className={`status-badge ${api.method === 'POST' ? 'warning' : 'success'}`}>{api.method}</span></td>
                      <td style={{ color: 'var(--gray-600)' }}>{api.desc}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{api.req}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{api.res}</td>
                      <td style={{ fontWeight: '500', color: 'var(--success-600)' }}>{api.latency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Database Schema */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Database Schema</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-3" style={{ gap: '16px' }}>
                {[
                  { table: 'predictions', columns: ['id (UUID, PK)', 'model_id (FK)', 'input_hash (VARCHAR)', 'score (DECIMAL)', 'confidence (DECIMAL)', 'features (JSONB)', 'created_at (TIMESTAMP)'] },
                  { table: 'models', columns: ['id (UUID, PK)', 'name (VARCHAR)', 'version (VARCHAR)', 'status (ENUM)', 'accuracy (DECIMAL)', 'config (JSONB)', 'deployed_at (TIMESTAMP)'] },
                  { table: 'audit_log', columns: ['id (UUID, PK)', 'prediction_id (FK)', 'user_id (VARCHAR)', 'action (VARCHAR)', 'details (JSONB)', 'timestamp (TIMESTAMP)'] },
                ].map((schema, i) => (
                  <div key={i} style={{ background: 'var(--gray-50)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--gray-200)' }}>
                    <div style={{ padding: '12px', background: 'var(--primary-500)', color: 'white', fontWeight: '600', fontFamily: 'monospace', fontSize: '13px' }}>{schema.table}</div>
                    <div style={{ padding: '12px' }}>
                      {schema.columns.map((col, j) => (
                        <div key={j} style={{ padding: '4px 0', fontSize: '11px', fontFamily: 'monospace', color: 'var(--gray-600)', borderBottom: j < schema.columns.length - 1 ? '1px solid var(--gray-200)' : 'none' }}>{col}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Error Handling & Logging */}
          <div className="grid grid-cols-2" style={{ gap: '24px' }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Error Handling</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { code: '400', type: 'Bad Request', handling: 'Input validation failed' },
                    { code: '401', type: 'Unauthorized', handling: 'JWT token invalid/expired' },
                    { code: '429', type: 'Rate Limited', handling: 'Throttle with exponential backoff' },
                    { code: '500', type: 'Server Error', handling: 'Retry with circuit breaker' },
                    { code: '503', type: 'Service Unavailable', handling: 'Failover to backup model' },
                  ].map((err, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'var(--gray-50)', borderRadius: '6px' }}>
                      <span style={{ padding: '4px 8px', background: err.code.startsWith('4') ? 'var(--warning-100)' : 'var(--danger-100)', color: err.code.startsWith('4') ? 'var(--warning-700)' : 'var(--danger-700)', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px', fontWeight: '600' }}>{err.code}</span>
                      <span style={{ fontWeight: '500', fontSize: '13px', minWidth: '120px' }}>{err.type}</span>
                      <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{err.handling}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Logging & Monitoring</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { level: 'INFO', format: 'Structured JSON', destination: 'CloudWatch / ELK' },
                    { level: 'WARN', format: 'Alert trigger', destination: 'PagerDuty / Slack' },
                    { level: 'ERROR', format: 'Stack trace + context', destination: 'Sentry / Datadog' },
                    { level: 'METRICS', format: 'Prometheus format', destination: 'Grafana dashboards' },
                    { level: 'AUDIT', format: 'Compliance log', destination: 'S3 + Athena' },
                  ].map((log, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'var(--gray-50)', borderRadius: '6px' }}>
                      <span style={{ padding: '4px 8px', background: log.level === 'ERROR' ? 'var(--danger-100)' : log.level === 'WARN' ? 'var(--warning-100)' : 'var(--primary-100)', color: log.level === 'ERROR' ? 'var(--danger-700)' : log.level === 'WARN' ? 'var(--warning-700)' : 'var(--primary-700)', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>{log.level}</span>
                      <span style={{ fontSize: '12px', minWidth: '140px' }}>{log.format}</span>
                      <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{log.destination}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="jobs-tab-content">
          {/* Jobs Overview Stats */}
          <div className="grid grid-cols-5" style={{ marginBottom: '24px' }}>
            {[
              { label: 'Total Jobs', value: '24', icon: 'pipelines', color: 'var(--primary-500)' },
              { label: 'Running', value: '3', icon: 'play', color: 'var(--success-500)' },
              { label: 'Scheduled', value: '18', icon: 'clock', color: 'var(--warning-500)' },
              { label: 'Failed (24h)', value: '1', icon: 'alert-triangle', color: 'var(--danger-500)' },
              { label: 'Success Rate', value: '99.2%', icon: 'check', color: 'var(--success-600)' },
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

          {/* Data Pipeline Jobs */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Data Pipeline Jobs</h3>
              <button className="btn btn-primary btn-sm"><Icon name="play" size={14} /> Run All</button>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Job Name</th>
                    <th>Type</th>
                    <th>Schedule</th>
                    <th>Last Run</th>
                    <th>Next Run</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Data Ingestion - Transactions', type: 'ETL', schedule: '*/15 * * * *', lastRun: '10 min ago', nextRun: 'In 5 min', duration: '2m 34s', status: 'success' },
                    { name: 'Data Ingestion - Customer Profiles', type: 'ETL', schedule: '0 */2 * * *', lastRun: '1 hour ago', nextRun: 'In 1 hour', duration: '5m 12s', status: 'success' },
                    { name: 'Data Validation Pipeline', type: 'Validation', schedule: '0 * * * *', lastRun: '45 min ago', nextRun: 'In 15 min', duration: '3m 45s', status: 'success' },
                    { name: 'Feature Engineering Job', type: 'Transform', schedule: '0 */4 * * *', lastRun: '2 hours ago', nextRun: 'In 2 hours', duration: '12m 30s', status: 'success' },
                    { name: 'Data Quality Check', type: 'QA', schedule: '30 */6 * * *', lastRun: '4 hours ago', nextRun: 'In 2 hours', duration: '8m 15s', status: 'success' },
                    { name: 'External Data Sync', type: 'Sync', schedule: '0 6 * * *', lastRun: 'Yesterday 6:00 AM', nextRun: 'Tomorrow 6:00 AM', duration: '25m 40s', status: 'success' },
                    { name: 'Data Archival Job', type: 'Archive', schedule: '0 2 * * 0', lastRun: 'Last Sunday', nextRun: 'Next Sunday', duration: '45m 20s', status: 'success' },
                  ].map((job, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: '500' }}>{job.name}</td>
                      <td><span className="status-badge secondary">{job.type}</span></td>
                      <td style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--gray-600)' }}>{job.schedule}</td>
                      <td style={{ fontSize: '12px' }}>{job.lastRun}</td>
                      <td style={{ fontSize: '12px', color: 'var(--primary-600)' }}>{job.nextRun}</td>
                      <td style={{ fontSize: '12px' }}>{job.duration}</td>
                      <td><span className={`status-badge ${job.status === 'success' ? 'success' : job.status === 'running' ? 'primary' : 'danger'}`}>{job.status === 'success' ? 'Success' : job.status === 'running' ? 'Running' : 'Failed'}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button className="btn btn-icon btn-sm btn-secondary" onClick={() => handleRunJob(job.name)} disabled={runningJobs[job.name]}>
                            <Icon name={runningJobs[job.name] ? 'clock' : 'play'} size={12} />
                          </button>
                          <button className="btn btn-icon btn-sm btn-secondary" onClick={() => handleViewJob(job)}>
                            <Icon name="eye" size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Model Training Jobs */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Model Training & Retraining Jobs</h3>
              <button className="btn btn-secondary btn-sm" onClick={handleRetrain}><Icon name="refresh" size={14} /> Retrain Now</button>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Job Name</th>
                    <th>Model</th>
                    <th>Schedule</th>
                    <th>Last Run</th>
                    <th>Next Run</th>
                    <th>Duration</th>
                    <th>Accuracy</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'XGBoost Retraining', model: 'XGBoost v2.3', schedule: '0 0 * * 0', lastRun: 'Last Sunday', nextRun: 'Next Sunday', duration: '2h 15m', accuracy: '99.2%', status: 'success' },
                    { name: 'LightGBM Retraining', model: 'LightGBM v1.8', schedule: '0 0 * * 0', lastRun: 'Last Sunday', nextRun: 'Next Sunday', duration: '1h 45m', accuracy: '98.9%', status: 'success' },
                    { name: 'Neural Network Training', model: 'DNN v3.1', schedule: '0 0 1 * *', lastRun: 'Jan 1, 2025', nextRun: 'Feb 1, 2025', duration: '8h 30m', accuracy: '99.5%', status: 'success' },
                    { name: 'Ensemble Model Update', model: 'Ensemble v2.0', schedule: '0 0 * * 1', lastRun: 'Last Monday', nextRun: 'Next Monday', duration: '45m', accuracy: '99.8%', status: 'success' },
                    { name: 'Hyperparameter Tuning', model: 'All Models', schedule: '0 0 1 * *', lastRun: 'Jan 1, 2025', nextRun: 'Feb 1, 2025', duration: '12h', accuracy: '+0.3%', status: 'success' },
                    { name: 'Model Validation', model: 'Production', schedule: '0 6 * * *', lastRun: 'Today 6:00 AM', nextRun: 'Tomorrow 6:00 AM', duration: '30m', accuracy: '99.4%', status: 'running' },
                  ].map((job, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: '500' }}>{job.name}</td>
                      <td><span style={{ fontFamily: 'monospace', fontSize: '11px', padding: '2px 6px', background: 'var(--purple-100)', borderRadius: '4px' }}>{job.model}</span></td>
                      <td style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--gray-600)' }}>{job.schedule}</td>
                      <td style={{ fontSize: '12px' }}>{job.lastRun}</td>
                      <td style={{ fontSize: '12px', color: 'var(--primary-600)' }}>{job.nextRun}</td>
                      <td style={{ fontSize: '12px' }}>{job.duration}</td>
                      <td style={{ fontWeight: '600', color: 'var(--success-600)' }}>{job.accuracy}</td>
                      <td><span className={`status-badge ${job.status === 'success' ? 'success' : job.status === 'running' ? 'primary' : 'danger'}`}>{job.status === 'success' ? 'Success' : job.status === 'running' ? 'Running' : 'Failed'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Batch Prediction Jobs */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Batch Prediction Jobs</h3>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Job Name</th>
                    <th>Records</th>
                    <th>Schedule</th>
                    <th>Last Run</th>
                    <th>Next Run</th>
                    <th>Duration</th>
                    <th>Throughput</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Daily Batch Scoring', records: '500K', schedule: '0 1 * * *', lastRun: 'Today 1:00 AM', nextRun: 'Tomorrow 1:00 AM', duration: '45m', throughput: '11K/min', status: 'success' },
                    { name: 'Hourly Risk Assessment', records: '50K', schedule: '0 * * * *', lastRun: '1 hour ago', nextRun: 'In 1 hour', duration: '8m', throughput: '6.2K/min', status: 'success' },
                    { name: 'Weekly Portfolio Scoring', records: '2M', schedule: '0 2 * * 0', lastRun: 'Last Sunday', nextRun: 'Next Sunday', duration: '3h 20m', throughput: '10K/min', status: 'success' },
                    { name: 'Monthly Full Rescore', records: '10M', schedule: '0 0 1 * *', lastRun: 'Jan 1, 2025', nextRun: 'Feb 1, 2025', duration: '18h', throughput: '9.2K/min', status: 'success' },
                    { name: 'Real-time Backup Batch', records: '100K', schedule: '*/30 * * * *', lastRun: '15 min ago', nextRun: 'In 15 min', duration: '12m', throughput: '8.3K/min', status: 'running' },
                  ].map((job, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: '500' }}>{job.name}</td>
                      <td><span style={{ fontWeight: '600', color: 'var(--primary-600)' }}>{job.records}</span></td>
                      <td style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--gray-600)' }}>{job.schedule}</td>
                      <td style={{ fontSize: '12px' }}>{job.lastRun}</td>
                      <td style={{ fontSize: '12px', color: 'var(--primary-600)' }}>{job.nextRun}</td>
                      <td style={{ fontSize: '12px' }}>{job.duration}</td>
                      <td style={{ fontSize: '12px', fontWeight: '500' }}>{job.throughput}</td>
                      <td><span className={`status-badge ${job.status === 'success' ? 'success' : job.status === 'running' ? 'primary' : 'danger'}`}>{job.status === 'success' ? 'Success' : job.status === 'running' ? 'Running' : 'Failed'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monitoring & Alert Jobs */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Monitoring & Alert Jobs</h3>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Job Name</th>
                    <th>Type</th>
                    <th>Schedule</th>
                    <th>Last Run</th>
                    <th>Alerts (24h)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Model Drift Detection', type: 'Monitoring', schedule: '*/5 * * * *', lastRun: '2 min ago', alerts: 0, status: 'success' },
                    { name: 'Data Quality Monitor', type: 'Monitoring', schedule: '*/10 * * * *', lastRun: '5 min ago', alerts: 1, status: 'warning' },
                    { name: 'Performance Metrics Collection', type: 'Metrics', schedule: '* * * * *', lastRun: '30 sec ago', alerts: 0, status: 'running' },
                    { name: 'SLA Compliance Check', type: 'Compliance', schedule: '*/15 * * * *', lastRun: '8 min ago', alerts: 0, status: 'success' },
                    { name: 'Anomaly Detection Alert', type: 'Alert', schedule: '*/5 * * * *', lastRun: '3 min ago', alerts: 2, status: 'warning' },
                    { name: 'Daily Health Report', type: 'Report', schedule: '0 8 * * *', lastRun: 'Today 8:00 AM', alerts: 0, status: 'success' },
                  ].map((job, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: '500' }}>{job.name}</td>
                      <td><span className="status-badge secondary">{job.type}</span></td>
                      <td style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--gray-600)' }}>{job.schedule}</td>
                      <td style={{ fontSize: '12px' }}>{job.lastRun}</td>
                      <td><span style={{ fontWeight: '600', color: job.alerts > 0 ? 'var(--warning-600)' : 'var(--gray-400)' }}>{job.alerts}</span></td>
                      <td><span className={`status-badge ${job.status === 'success' ? 'success' : job.status === 'running' ? 'primary' : 'warning'}`}>{job.status === 'success' ? 'Healthy' : job.status === 'running' ? 'Running' : 'Warning'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Job Execution Timeline */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Job Execution Timeline (Last 24 Hours)</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { time: '10:30 AM', job: 'Data Ingestion - Transactions', status: 'success', duration: '2m 34s' },
                  { time: '10:15 AM', job: 'Data Ingestion - Transactions', status: 'success', duration: '2m 28s' },
                  { time: '10:00 AM', job: 'Data Validation Pipeline', status: 'success', duration: '3m 45s' },
                  { time: '09:45 AM', job: 'Model Drift Detection', status: 'success', duration: '15s' },
                  { time: '09:30 AM', job: 'Real-time Backup Batch', status: 'success', duration: '11m 52s' },
                  { time: '09:00 AM', job: 'Data Validation Pipeline', status: 'success', duration: '3m 38s' },
                  { time: '08:00 AM', job: 'Feature Engineering Job', status: 'success', duration: '12m 30s' },
                  { time: '06:00 AM', job: 'Model Validation', status: 'success', duration: '28m 15s' },
                  { time: '01:00 AM', job: 'Daily Batch Scoring', status: 'success', duration: '44m 22s' },
                  { time: 'Yesterday 11:45 PM', job: 'Data Quality Check', status: 'failed', duration: '8m 15s' },
                ].map((exec, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                    <div style={{ minWidth: '140px', fontSize: '12px', color: 'var(--gray-500)' }}>{exec.time}</div>
                    <div style={{ flex: 1, fontWeight: '500' }}>{exec.job}</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{exec.duration}</div>
                    <span className={`status-badge ${exec.status === 'success' ? 'success' : 'danger'}`}>{exec.status === 'success' ? 'Success' : 'Failed'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Job Configuration */}
          <div className="grid grid-cols-2" style={{ gap: '24px' }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Job Configuration</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { config: 'Retry Policy', value: '3 retries with exponential backoff' },
                    { config: 'Timeout', value: '4 hours max execution time' },
                    { config: 'Concurrency', value: 'Max 5 parallel jobs' },
                    { config: 'Resource Allocation', value: '8 vCPU, 32GB RAM per job' },
                    { config: 'Failure Notification', value: 'PagerDuty + Slack #ml-alerts' },
                    { config: 'Log Retention', value: '90 days in CloudWatch' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--gray-50)', borderRadius: '6px' }}>
                      <span style={{ fontWeight: '500', fontSize: '13px' }}>{item.config}</span>
                      <span style={{ fontSize: '12px', color: 'var(--gray-600)' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Scheduler Infrastructure</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { component: 'Orchestrator', value: 'Apache Airflow 2.7', status: 'healthy' },
                    { component: 'Message Queue', value: 'Apache Kafka', status: 'healthy' },
                    { component: 'Task Queue', value: 'Celery + Redis', status: 'healthy' },
                    { component: 'Scheduler', value: 'Kubernetes CronJob', status: 'healthy' },
                    { component: 'Monitoring', value: 'Prometheus + Grafana', status: 'healthy' },
                    { component: 'Alerting', value: 'AlertManager + PagerDuty', status: 'healthy' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--gray-50)', borderRadius: '6px' }}>
                      <span style={{ fontWeight: '500', fontSize: '13px' }}>{item.component}</span>
                      <span style={{ fontSize: '12px', color: 'var(--gray-600)' }}>{item.value}</span>
                      <span className="status-badge success">Healthy</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AS-IS/TO-BE Tab - Data Transformation & Explainability */}
      {activeTab === 'as-is-to-be' && (
        <div>
          {/* Overview Section */}
          <div className="card" style={{ marginBottom: '24px', border: '2px solid var(--purple-200)' }}>
            <div className="card-header" style={{ background: 'var(--purple-50)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon name="git-branch" size={24} />
                <div>
                  <h3 className="card-title">Data Transformation Journey</h3>
                  <p className="card-subtitle">Understanding how data flows from source to AI-powered insights</p>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '20px' }}>
                <div style={{ textAlign: 'center', padding: '20px', background: 'var(--gray-100)', borderRadius: '12px', minWidth: '150px' }}>
                  <Icon name="database" size={32} color="var(--gray-600)" />
                  <div style={{ fontWeight: '600', marginTop: '8px' }}>Raw Data</div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Source Systems</div>
                </div>
                <Icon name="arrow-right" size={24} color="var(--gray-400)" />
                <div style={{ textAlign: 'center', padding: '20px', background: 'var(--primary-100)', borderRadius: '12px', minWidth: '150px' }}>
                  <Icon name="settings" size={32} color="var(--primary-600)" />
                  <div style={{ fontWeight: '600', marginTop: '8px' }}>Processing</div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>ETL Pipeline</div>
                </div>
                <Icon name="arrow-right" size={24} color="var(--gray-400)" />
                <div style={{ textAlign: 'center', padding: '20px', background: 'var(--success-100)', borderRadius: '12px', minWidth: '150px' }}>
                  <Icon name="cpu" size={32} color="var(--success-600)" />
                  <div style={{ fontWeight: '600', marginTop: '8px' }}>AI/ML Model</div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Prediction Engine</div>
                </div>
                <Icon name="arrow-right" size={24} color="var(--gray-400)" />
                <div style={{ textAlign: 'center', padding: '20px', background: 'var(--purple-100)', borderRadius: '12px', minWidth: '150px' }}>
                  <Icon name="trending-up" size={32} color="var(--purple-600)" />
                  <div style={{ fontWeight: '600', marginTop: '8px' }}>Insights</div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Business Value</div>
                </div>
              </div>
            </div>
          </div>

          {/* AS-IS vs TO-BE Comparison */}
          <div className="grid grid-cols-2" style={{ gap: '24px', marginBottom: '24px' }}>
            {/* AS-IS State */}
            <div className="card" style={{ border: '2px solid var(--gray-300)' }}>
              <div className="card-header" style={{ background: 'var(--gray-100)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gray-500)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>AS</div>
                  <div>
                    <h3 className="card-title">AS-IS State (Before AI)</h3>
                    <p className="card-subtitle">Manual process and traditional metrics</p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--gray-700)' }}>Process Flow</div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--gray-600)' }}>
                      <li>Manual review of each transaction/case</li>
                      <li>Rule-based decision making</li>
                      <li>Spreadsheet-based analysis</li>
                      <li>Batch processing (daily/weekly)</li>
                      <li>Human judgment for edge cases</li>
                    </ul>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', marginBottom: '12px', color: 'var(--gray-700)' }}>Key Metrics (Historical)</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div style={{ padding: '12px', background: 'white', borderRadius: '6px', border: '1px solid var(--gray-200)' }}>
                        <div style={{ fontSize: '11px', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Accuracy</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--gray-600)' }}>72%</div>
                        <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>Based on manual review</div>
                      </div>
                      <div style={{ padding: '12px', background: 'white', borderRadius: '6px', border: '1px solid var(--gray-200)' }}>
                        <div style={{ fontSize: '11px', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Processing Time</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--gray-600)' }}>48h</div>
                        <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>Average turnaround</div>
                      </div>
                      <div style={{ padding: '12px', background: 'white', borderRadius: '6px', border: '1px solid var(--gray-200)' }}>
                        <div style={{ fontSize: '11px', color: 'var(--gray-500)', textTransform: 'uppercase' }}>False Positive Rate</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--gray-600)' }}>28%</div>
                        <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>Manual false alerts</div>
                      </div>
                      <div style={{ padding: '12px', background: 'white', borderRadius: '6px', border: '1px solid var(--gray-200)' }}>
                        <div style={{ fontSize: '11px', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Cost per Case</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--gray-600)' }}>$45</div>
                        <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>Labor + overhead</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--danger-50)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--danger-700)' }}>Pain Points</div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--danger-600)' }}>
                      <li>High manual effort and FTE requirements</li>
                      <li>Inconsistent decisions across reviewers</li>
                      <li>Limited scalability</li>
                      <li>Delayed detection of anomalies</li>
                      <li>No real-time monitoring capability</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* TO-BE State */}
            <div className="card" style={{ border: '2px solid var(--success-400)' }}>
              <div className="card-header" style={{ background: 'var(--success-50)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--success-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>TB</div>
                  <div>
                    <h3 className="card-title">TO-BE State (With AI)</h3>
                    <p className="card-subtitle">AI-powered automation and enhanced metrics</p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '16px', background: 'var(--success-50)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--success-700)' }}>Process Flow</div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--success-600)' }}>
                      <li>Automated ML-based scoring</li>
                      <li>Real-time prediction pipeline</li>
                      <li>Intelligent case prioritization</li>
                      <li>Continuous learning and adaptation</li>
                      <li>Human-in-the-loop for high-risk cases</li>
                    </ul>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--success-50)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', marginBottom: '12px', color: 'var(--success-700)' }}>Key Metrics (Current)</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div style={{ padding: '12px', background: 'white', borderRadius: '6px', border: '1px solid var(--success-200)' }}>
                        <div style={{ fontSize: '11px', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Accuracy</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success-600)' }}>{useCase.accuracy > 0 ? useCase.accuracy.toFixed(1) : 95}%</div>
                        <div style={{ fontSize: '11px', color: 'var(--success-500)' }}>+{useCase.accuracy > 0 ? (useCase.accuracy - 72).toFixed(1) : 23}% improvement</div>
                      </div>
                      <div style={{ padding: '12px', background: 'white', borderRadius: '6px', border: '1px solid var(--success-200)' }}>
                        <div style={{ fontSize: '11px', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Processing Time</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success-600)' }}>150ms</div>
                        <div style={{ fontSize: '11px', color: 'var(--success-500)' }}>99.9% faster</div>
                      </div>
                      <div style={{ padding: '12px', background: 'white', borderRadius: '6px', border: '1px solid var(--success-200)' }}>
                        <div style={{ fontSize: '11px', color: 'var(--gray-500)', textTransform: 'uppercase' }}>False Positive Rate</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success-600)' }}>3.2%</div>
                        <div style={{ fontSize: '11px', color: 'var(--success-500)' }}>88% reduction</div>
                      </div>
                      <div style={{ padding: '12px', background: 'white', borderRadius: '6px', border: '1px solid var(--success-200)' }}>
                        <div style={{ fontSize: '11px', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Cost per Case</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success-600)' }}>$0.12</div>
                        <div style={{ fontSize: '11px', color: 'var(--success-500)' }}>99.7% savings</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--success-100)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--success-700)' }}>Benefits Achieved</div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--success-600)' }}>
                      <li>85% reduction in manual review workload</li>
                      <li>Consistent, explainable decisions</li>
                      <li>Unlimited scalability</li>
                      <li>Real-time anomaly detection</li>
                      <li>24/7 automated monitoring</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Source Attribution */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Data Source Attribution & Explainability</h3>
              <p className="card-subtitle">Understanding where each metric comes from</p>
            </div>
            <div className="card-body">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Value</th>
                    <th>Data Source</th>
                    <th>Calculation Method</th>
                    <th>Confidence</th>
                    <th>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { metric: 'Accuracy', value: `${useCase.accuracy > 0 ? useCase.accuracy.toFixed(1) : 95}%`, source: 'Model Validation Pipeline', calculation: '(TP + TN) / Total Predictions', confidence: 'High', updated: '5 min ago' },
                    { metric: 'Precision', value: '96.8%', source: 'Real-time Scoring Engine', calculation: 'TP / (TP + FP)', confidence: 'High', updated: '5 min ago' },
                    { metric: 'Recall', value: '94.2%', source: 'Real-time Scoring Engine', calculation: 'TP / (TP + FN)', confidence: 'High', updated: '5 min ago' },
                    { metric: 'F1 Score', value: '95.5%', source: 'Computed Metric', calculation: '2 * (Precision * Recall) / (Precision + Recall)', confidence: 'High', updated: '5 min ago' },
                    { metric: 'AUC-ROC', value: '0.987', source: 'Model Validation Pipeline', calculation: 'Area under ROC curve integration', confidence: 'High', updated: 'Daily batch' },
                    { metric: 'Processing Latency', value: '150ms', source: 'APM (Datadog)', calculation: 'P95 inference time', confidence: 'High', updated: 'Real-time' },
                    { metric: 'Daily Predictions', value: '2.4M', source: 'Kafka Consumer Metrics', calculation: 'Count of prediction events', confidence: 'High', updated: 'Real-time' },
                    { metric: 'Cost Savings', value: '$2.8M/year', source: 'Finance Analytics', calculation: '(AS-IS cost - TO-BE cost) * volume', confidence: 'Medium', updated: 'Monthly' },
                  ].map((item, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: '500' }}>{item.metric}</td>
                      <td style={{ fontFamily: 'monospace', fontWeight: '600', color: 'var(--primary-600)' }}>{item.value}</td>
                      <td><span className="status-badge secondary">{item.source}</span></td>
                      <td style={{ fontSize: '12px', color: 'var(--gray-600)' }}>{item.calculation}</td>
                      <td><span className={`status-badge ${item.confidence === 'High' ? 'success' : 'warning'}`}>{item.confidence}</span></td>
                      <td style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{item.updated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Data Transformation Steps */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Data Transformation Pipeline</h3>
              <p className="card-subtitle">Step-by-step data processing with input/output tracking</p>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { step: 1, name: 'Data Ingestion', input: 'Raw transaction records (JSON/CSV)', output: 'Standardized event schema', records: '10M/day', transform: 'Schema mapping, type casting, deduplication' },
                  { step: 2, name: 'Data Cleaning', input: 'Standardized events', output: 'Clean, validated records', records: '9.8M/day', transform: 'Null handling, outlier removal, format validation' },
                  { step: 3, name: 'Feature Engineering', input: 'Clean records + historical data', output: '450 engineered features', records: '9.8M/day', transform: 'Aggregations, ratios, time-based features, encodings' },
                  { step: 4, name: 'Feature Selection', input: '450 features', output: '85 selected features', records: '9.8M/day', transform: 'Importance ranking, correlation filter, RFE' },
                  { step: 5, name: 'Normalization', input: 'Selected features', output: 'Scaled feature vectors', records: '9.8M/day', transform: 'StandardScaler, MinMaxScaler, log transforms' },
                  { step: 6, name: 'Model Inference', input: 'Feature vectors', output: 'Prediction scores + explanations', records: '9.8M/day', transform: 'Ensemble model prediction, SHAP values' },
                  { step: 7, name: 'Post-Processing', input: 'Raw predictions', output: 'Final decisions + alerts', records: '9.8M/day', transform: 'Threshold application, business rules, alert routing' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'stretch', gap: '16px', padding: '16px', background: 'var(--gray-50)', borderRadius: '12px', border: '1px solid var(--gray-200)' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0 }}>{item.step}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', marginBottom: '8px' }}>{item.name}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                        <div style={{ padding: '8px', background: 'var(--warning-50)', borderRadius: '6px' }}>
                          <div style={{ fontSize: '10px', color: 'var(--warning-600)', textTransform: 'uppercase', marginBottom: '4px' }}>Input</div>
                          <div style={{ fontSize: '12px' }}>{item.input}</div>
                        </div>
                        <div style={{ padding: '8px', background: 'var(--primary-50)', borderRadius: '6px' }}>
                          <div style={{ fontSize: '10px', color: 'var(--primary-600)', textTransform: 'uppercase', marginBottom: '4px' }}>Transform</div>
                          <div style={{ fontSize: '12px' }}>{item.transform}</div>
                        </div>
                        <div style={{ padding: '8px', background: 'var(--success-50)', borderRadius: '6px' }}>
                          <div style={{ fontSize: '10px', color: 'var(--success-600)', textTransform: 'uppercase', marginBottom: '4px' }}>Output</div>
                          <div style={{ fontSize: '12px' }}>{item.output}</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '80px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>Volume</div>
                      <div style={{ fontWeight: '600', color: 'var(--primary-600)' }}>{item.records}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Model Explainability Section */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Interpretable AI - Graph Justification</h3>
              <p className="card-subtitle">How each visualization metric is derived</p>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2" style={{ gap: '16px' }}>
                {[
                  { chart: 'Accuracy Trend', source: 'Model Validation Service', method: 'Rolling 30-day accuracy calculated from (TP+TN)/Total on holdout set. Updated every model run.', interpretation: 'Higher values indicate better model discrimination. Target: >95%' },
                  { chart: 'Confusion Matrix', source: 'Real-time Scoring Engine', method: 'Aggregated from all predictions vs ground truth labels. Updated when labels confirmed.', interpretation: 'Shows prediction quality across classes. Minimize FP/FN.' },
                  { chart: 'Feature Importance', source: 'SHAP Analysis Module', method: 'Mean absolute SHAP values across 10K samples. Measures average impact on predictions.', interpretation: 'Higher values = greater influence. Top 10 features drive 80% of decisions.' },
                  { chart: 'ROC Curve', source: 'Model Validation Service', method: 'TPR vs FPR at various thresholds. AUC calculated via trapezoidal integration.', interpretation: 'AUC>0.95 indicates excellent discrimination. Curve should bow toward top-left.' },
                  { chart: 'Prediction Distribution', source: 'Scoring Engine Logs', method: 'Histogram of prediction confidence scores binned in 10% intervals.', interpretation: 'Bimodal distribution indicates clear separation. Peaks at extremes are good.' },
                  { chart: 'Latency Metrics', source: 'Datadog APM', method: 'P50, P95, P99 latencies calculated from trace data. Updated in real-time.', interpretation: 'P95 < 200ms meets SLA. Spikes indicate system issues.' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '12px', border: '1px solid var(--gray-200)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <Icon name="chart" size={18} color="var(--primary-600)" />
                      <div style={{ fontWeight: '600' }}>{item.chart}</div>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: '4px' }}>Data Source</div>
                      <div style={{ fontSize: '13px', padding: '6px 10px', background: 'var(--primary-50)', borderRadius: '4px', display: 'inline-block' }}>{item.source}</div>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: '4px' }}>Calculation Method</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-600)', lineHeight: '1.5' }}>{item.method}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: '4px' }}>Interpretation Guide</div>
                      <div style={{ fontSize: '12px', color: 'var(--success-600)', lineHeight: '1.5' }}>{item.interpretation}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Operations Tab - 5W1H Operations */}
      {activeTab === 'operations' && (
        <div>
          {/* Operations Overview */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header" style={{ background: 'var(--teal-50)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon name="settings" size={24} />
                <div>
                  <h3 className="card-title">Operational Overview</h3>
                  <p className="card-subtitle">Complete list of operations performed for {useCase.name}</p>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div style={{ padding: '20px', background: 'var(--primary-50)', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary-600)' }}>24</div>
                  <div style={{ fontSize: '13px', color: 'var(--gray-600)' }}>Total Operations</div>
                </div>
                <div style={{ padding: '20px', background: 'var(--success-50)', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--success-600)' }}>18</div>
                  <div style={{ fontSize: '13px', color: 'var(--gray-600)' }}>Automated</div>
                </div>
                <div style={{ padding: '20px', background: 'var(--warning-50)', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--warning-600)' }}>4</div>
                  <div style={{ fontSize: '13px', color: 'var(--gray-600)' }}>Semi-Automated</div>
                </div>
                <div style={{ padding: '20px', background: 'var(--gray-100)', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--gray-600)' }}>2</div>
                  <div style={{ fontSize: '13px', color: 'var(--gray-600)' }}>Manual</div>
                </div>
              </div>
            </div>
          </div>

          {/* Operations List by Category */}
          <div className="grid grid-cols-2" style={{ gap: '24px', marginBottom: '24px' }}>
            {/* Data Operations */}
            <div className="card">
              <div className="card-header" style={{ background: 'var(--primary-50)' }}>
                <h3 className="card-title"><Icon name="database" size={16} /> Data Operations</h3>
              </div>
              <div className="card-body">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Operation</th>
                      <th>Type</th>
                      <th>Frequency</th>
                      <th>Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { op: 'Data Ingestion', type: 'Auto', freq: 'Real-time', owner: 'Data Eng' },
                      { op: 'Data Validation', type: 'Auto', freq: 'On ingest', owner: 'Data Eng' },
                      { op: 'Data Cleaning', type: 'Auto', freq: 'Daily', owner: 'Data Eng' },
                      { op: 'Feature Engineering', type: 'Auto', freq: 'Daily', owner: 'ML Eng' },
                      { op: 'Data Quality Check', type: 'Semi', freq: 'Weekly', owner: 'Data Analyst' },
                      { op: 'Schema Migration', type: 'Manual', freq: 'On demand', owner: 'DBA' },
                    ].map((item, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: '500' }}>{item.op}</td>
                        <td><span className={`status-badge ${item.type === 'Auto' ? 'success' : item.type === 'Semi' ? 'warning' : 'secondary'}`}>{item.type}</span></td>
                        <td style={{ fontSize: '12px' }}>{item.freq}</td>
                        <td style={{ fontSize: '12px', color: 'var(--gray-600)' }}>{item.owner}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Model Operations */}
            <div className="card">
              <div className="card-header" style={{ background: 'var(--success-50)' }}>
                <h3 className="card-title"><Icon name="cpu" size={16} /> Model Operations</h3>
              </div>
              <div className="card-body">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Operation</th>
                      <th>Type</th>
                      <th>Frequency</th>
                      <th>Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { op: 'Model Training', type: 'Auto', freq: 'Weekly', owner: 'ML Eng' },
                      { op: 'Model Validation', type: 'Auto', freq: 'Post-train', owner: 'ML Eng' },
                      { op: 'Model Deployment', type: 'Semi', freq: 'On approval', owner: 'MLOps' },
                      { op: 'A/B Testing', type: 'Auto', freq: 'Continuous', owner: 'Data Sci' },
                      { op: 'Model Monitoring', type: 'Auto', freq: 'Real-time', owner: 'MLOps' },
                      { op: 'Model Rollback', type: 'Manual', freq: 'On incident', owner: 'MLOps' },
                    ].map((item, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: '500' }}>{item.op}</td>
                        <td><span className={`status-badge ${item.type === 'Auto' ? 'success' : item.type === 'Semi' ? 'warning' : 'secondary'}`}>{item.type}</span></td>
                        <td style={{ fontSize: '12px' }}>{item.freq}</td>
                        <td style={{ fontSize: '12px', color: 'var(--gray-600)' }}>{item.owner}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Business Operations */}
            <div className="card">
              <div className="card-header" style={{ background: 'var(--warning-50)' }}>
                <h3 className="card-title"><Icon name="briefcase" size={16} /> Business Operations</h3>
              </div>
              <div className="card-body">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Operation</th>
                      <th>Type</th>
                      <th>Frequency</th>
                      <th>Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { op: 'Alert Triage', type: 'Semi', freq: 'Real-time', owner: 'Ops Team' },
                      { op: 'Case Investigation', type: 'Manual', freq: 'On alert', owner: 'Analyst' },
                      { op: 'Report Generation', type: 'Auto', freq: 'Daily/Weekly', owner: 'BI Team' },
                      { op: 'Threshold Tuning', type: 'Semi', freq: 'Monthly', owner: 'Data Sci' },
                      { op: 'SLA Monitoring', type: 'Auto', freq: 'Real-time', owner: 'Ops Team' },
                      { op: 'Stakeholder Review', type: 'Manual', freq: 'Monthly', owner: 'Business' },
                    ].map((item, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: '500' }}>{item.op}</td>
                        <td><span className={`status-badge ${item.type === 'Auto' ? 'success' : item.type === 'Semi' ? 'warning' : 'secondary'}`}>{item.type}</span></td>
                        <td style={{ fontSize: '12px' }}>{item.freq}</td>
                        <td style={{ fontSize: '12px', color: 'var(--gray-600)' }}>{item.owner}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Compliance Operations */}
            <div className="card">
              <div className="card-header" style={{ background: 'var(--danger-50)' }}>
                <h3 className="card-title"><Icon name="shield" size={16} /> Compliance Operations</h3>
              </div>
              <div className="card-body">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Operation</th>
                      <th>Type</th>
                      <th>Frequency</th>
                      <th>Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { op: 'Audit Log Review', type: 'Auto', freq: 'Real-time', owner: 'Security' },
                      { op: 'Model Fairness Check', type: 'Auto', freq: 'Weekly', owner: 'MRM' },
                      { op: 'Regulatory Reporting', type: 'Semi', freq: 'Quarterly', owner: 'Compliance' },
                      { op: 'Privacy Assessment', type: 'Manual', freq: 'Annual', owner: 'Legal' },
                      { op: 'Access Control Review', type: 'Semi', freq: 'Quarterly', owner: 'Security' },
                      { op: 'Documentation Update', type: 'Manual', freq: 'On change', owner: 'MRM' },
                    ].map((item, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: '500' }}>{item.op}</td>
                        <td><span className={`status-badge ${item.type === 'Auto' ? 'success' : item.type === 'Semi' ? 'warning' : 'secondary'}`}>{item.type}</span></td>
                        <td style={{ fontSize: '12px' }}>{item.freq}</td>
                        <td style={{ fontSize: '12px', color: 'var(--gray-600)' }}>{item.owner}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Operation Flow Diagram */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Daily Operations Flow</h3>
              <p className="card-subtitle">Typical operational sequence in a 24-hour cycle</p>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { time: '00:00', op: 'Daily Batch Processing', desc: 'Process accumulated batch data', duration: '2h', status: 'auto' },
                  { time: '02:00', op: 'Model Retraining (Weekly)', desc: 'Retrain model with new data', duration: '4h', status: 'auto' },
                  { time: '06:00', op: 'Data Quality Reports', desc: 'Generate and distribute reports', duration: '30m', status: 'auto' },
                  { time: '08:00', op: 'Morning Triage', desc: 'Review overnight alerts and anomalies', duration: '1h', status: 'manual' },
                  { time: '09:00', op: 'Real-time Monitoring', desc: 'Continuous model and system monitoring', duration: 'Ongoing', status: 'auto' },
                  { time: '12:00', op: 'Midday Health Check', desc: 'Verify system health and performance', duration: '15m', status: 'semi' },
                  { time: '17:00', op: 'Daily Summary Generation', desc: 'Compile daily metrics and insights', duration: '30m', status: 'auto' },
                  { time: '18:00', op: 'Evening Handoff', desc: 'Document issues for next shift', duration: '30m', status: 'manual' },
                  { time: '22:00', op: 'Backup and Archive', desc: 'System backup and log archival', duration: '1h', status: 'auto' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                    <div style={{ minWidth: '60px', fontWeight: '600', fontFamily: 'monospace', color: 'var(--primary-600)' }}>{item.time}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500' }}>{item.op}</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{item.desc}</div>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-600)', minWidth: '60px' }}>{item.duration}</div>
                    <span className={`status-badge ${item.status === 'auto' ? 'success' : item.status === 'semi' ? 'warning' : 'secondary'}`}>
                      {item.status === 'auto' ? 'Automated' : item.status === 'semi' ? 'Semi-Auto' : 'Manual'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5W1H Tab */}
      {activeTab === '5w1h' && (
        <div>
          {/* 5W1H Overview */}
          <div className="card" style={{ marginBottom: '24px', border: '2px solid var(--orange-200)' }}>
            <div className="card-header" style={{ background: 'var(--orange-50)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon name="help-circle" size={24} />
                <div>
                  <h3 className="card-title">5W1H Analysis Framework</h3>
                  <p className="card-subtitle">Comprehensive understanding of {useCase.name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 5W1H Cards */}
          <div className="grid grid-cols-2" style={{ gap: '24px' }}>
            {/* WHO */}
            <div className="card" style={{ border: '2px solid var(--primary-200)' }}>
              <div className="card-header" style={{ background: 'var(--primary-50)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '18px' }}>W</div>
                  <div>
                    <h3 className="card-title">WHO</h3>
                    <p className="card-subtitle">Stakeholders and Users</p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px' }}>Primary Users</div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                      <li>{department.name} Team Analysts</li>
                      <li>Operations Managers</li>
                      <li>Risk Officers</li>
                    </ul>
                  </div>
                  <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px' }}>Decision Makers</div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                      <li>Chief Risk Officer (CRO)</li>
                      <li>VP of {department.name}</li>
                      <li>Model Risk Management</li>
                    </ul>
                  </div>
                  <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px' }}>Technical Teams</div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                      <li>Data Science Team</li>
                      <li>ML Engineering</li>
                      <li>Platform Engineering</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* WHAT */}
            <div className="card" style={{ border: '2px solid var(--success-200)' }}>
              <div className="card-header" style={{ background: 'var(--success-50)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--success-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '18px' }}>W</div>
                  <div>
                    <h3 className="card-title">WHAT</h3>
                    <p className="card-subtitle">Features and Capabilities</p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px' }}>Core Functionality</div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                      <li>Real-time prediction scoring</li>
                      <li>Pattern recognition and anomaly detection</li>
                      <li>Automated alert generation</li>
                      <li>Risk score calculation</li>
                    </ul>
                  </div>
                  <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px' }}>Key Features</div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                      <li>Explainable AI with SHAP values</li>
                      <li>Configurable thresholds</li>
                      <li>Dashboard visualization</li>
                      <li>API integration support</li>
                    </ul>
                  </div>
                  <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px' }}>Outputs</div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                      <li>Prediction scores (0-100)</li>
                      <li>Classification labels</li>
                      <li>Feature attribution reports</li>
                      <li>Audit trail logs</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* WHEN */}
            <div className="card" style={{ border: '2px solid var(--warning-200)' }}>
              <div className="card-header" style={{ background: 'var(--warning-50)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--warning-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '18px' }}>W</div>
                  <div>
                    <h3 className="card-title">WHEN</h3>
                    <p className="card-subtitle">Timeline and Schedule</p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px' }}>Processing Schedule</div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                      <li><strong>Real-time:</strong> Transaction scoring</li>
                      <li><strong>Hourly:</strong> Aggregate analysis</li>
                      <li><strong>Daily:</strong> Batch processing, reports</li>
                      <li><strong>Weekly:</strong> Model retraining</li>
                    </ul>
                  </div>
                  <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px' }}>Project Timeline</div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                      <li><strong>Launch:</strong> Q2 2024</li>
                      <li><strong>v2.0 Release:</strong> Q4 2024</li>
                      <li><strong>Current Version:</strong> v2.3.1</li>
                      <li><strong>Next Major:</strong> Q2 2025</li>
                    </ul>
                  </div>
                  <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px' }}>SLA Commitments</div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                      <li>Uptime: 99.9%</li>
                      <li>Response time: {"<"}200ms (P95)</li>
                      <li>Alert delivery: {"<"}1 minute</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* WHERE */}
            <div className="card" style={{ border: '2px solid var(--danger-200)' }}>
              <div className="card-header" style={{ background: 'var(--danger-50)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--danger-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '18px' }}>W</div>
                  <div>
                    <h3 className="card-title">WHERE</h3>
                    <p className="card-subtitle">Deployment and Access</p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px' }}>Infrastructure</div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                      <li><strong>Cloud:</strong> AWS US-East-1, US-West-2</li>
                      <li><strong>Compute:</strong> EKS Kubernetes</li>
                      <li><strong>Storage:</strong> S3, RDS PostgreSQL</li>
                      <li><strong>CDN:</strong> CloudFront</li>
                    </ul>
                  </div>
                  <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px' }}>Access Points</div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                      <li><strong>Web UI:</strong> https://ml.bank.com</li>
                      <li><strong>API:</strong> https://api.ml.bank.com</li>
                      <li><strong>VPN:</strong> Required for prod access</li>
                    </ul>
                  </div>
                  <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px' }}>Geographic Scope</div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                      <li>North America (Primary)</li>
                      <li>EMEA (Secondary)</li>
                      <li>APAC (Planned Q3 2025)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* WHY */}
            <div className="card" style={{ border: '2px solid var(--purple-200)' }}>
              <div className="card-header" style={{ background: 'var(--purple-50)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--purple-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '18px' }}>W</div>
                  <div>
                    <h3 className="card-title">WHY</h3>
                    <p className="card-subtitle">Business Value and Goals</p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px' }}>Business Objectives</div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                      <li>Reduce operational costs by 60%</li>
                      <li>Improve detection accuracy to 95%+</li>
                      <li>Enable real-time decision making</li>
                      <li>Scale operations without headcount</li>
                    </ul>
                  </div>
                  <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px' }}>Strategic Alignment</div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                      <li>Digital Transformation Initiative</li>
                      <li>AI-First Strategy 2025</li>
                      <li>Risk Modernization Program</li>
                    </ul>
                  </div>
                  <div style={{ padding: '12px', background: 'var(--success-50)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px' }}>ROI Achieved</div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                      <li><strong>Annual Savings:</strong> $2.8M</li>
                      <li><strong>Payback Period:</strong> 8 months</li>
                      <li><strong>NPV (5yr):</strong> $12.4M</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* HOW */}
            <div className="card" style={{ border: '2px solid var(--teal-200)' }}>
              <div className="card-header" style={{ background: 'var(--teal-50)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--teal-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '18px' }}>H</div>
                  <div>
                    <h3 className="card-title">HOW</h3>
                    <p className="card-subtitle">Technical Implementation</p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px' }}>Technology Stack</div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                      <li><strong>ML:</strong> Python, TensorFlow, XGBoost</li>
                      <li><strong>Data:</strong> Spark, Kafka, Airflow</li>
                      <li><strong>API:</strong> FastAPI, GraphQL</li>
                      <li><strong>Monitoring:</strong> Prometheus, Grafana</li>
                    </ul>
                  </div>
                  <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px' }}>ML Techniques</div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                      <li>Gradient Boosting Ensemble</li>
                      <li>Deep Neural Network</li>
                      <li>Feature engineering pipeline</li>
                      <li>Online learning updates</li>
                    </ul>
                  </div>
                  <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px' }}>Methodology</div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                      <li>Agile/Scrum development</li>
                      <li>CI/CD with GitOps</li>
                      <li>MLOps best practices</li>
                      <li>A/B testing framework</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Day Simulation Tab */}
      {activeTab === 'day-simulation' && (
        <div>
          {/* Simulation Overview */}
          <div className="card" style={{ marginBottom: '24px', border: '2px solid var(--pink-200)' }}>
            <div className="card-header" style={{ background: 'var(--pink-50)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon name="play" size={24} />
                <div>
                  <h3 className="card-title">Day-in-the-Life Simulation</h3>
                  <p className="card-subtitle">How different stakeholders interact with {useCase.name} throughout a typical day</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stakeholder Scenarios */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Operations Analyst */}
            <div className="card">
              <div className="card-header" style={{ background: 'var(--primary-50)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="user" size={24} />
                  </div>
                  <div>
                    <h3 className="card-title">Operations Analyst - Sarah Johnson</h3>
                    <p className="card-subtitle">Daily workflow with the ML system</p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { time: '8:00 AM', action: 'Morning Dashboard Review', desc: 'Sarah opens the ML dashboard to review overnight alerts. She sees 23 high-priority cases flagged by the model.', input: 'Dashboard login', output: '23 alerts requiring review' },
                    { time: '8:30 AM', action: 'Alert Triage', desc: 'She uses the AI-powered prioritization to sort cases by risk score. The top 5 cases have scores above 95.', input: '23 alerts', output: '5 critical, 12 high, 6 medium cases' },
                    { time: '9:00 AM', action: 'Case Investigation', desc: 'Sarah clicks on Case #12847. The model provides SHAP explanations showing transaction velocity as the top factor.', input: 'Case selection', output: 'Feature explanations, historical patterns' },
                    { time: '10:30 AM', action: 'Decision & Action', desc: 'After reviewing evidence, she confirms 4 cases as genuine and marks 1 as false positive for model feedback.', input: '5 critical cases', output: '4 confirmed, 1 false positive labeled' },
                    { time: '12:00 PM', action: 'Real-time Monitoring', desc: 'During lunch, the system auto-processes 1,500 transactions with no intervention needed.', input: '1,500 transactions', output: '1,498 normal, 2 flagged' },
                    { time: '2:00 PM', action: 'Report Generation', desc: 'Sarah generates a mid-day summary report for her manager using the automated reporting feature.', input: 'Report request', output: 'PDF with KPIs, trends, and actions' },
                    { time: '4:00 PM', action: 'Threshold Adjustment', desc: 'Based on feedback, she adjusts the alert threshold from 0.75 to 0.80 for a specific customer segment.', input: 'Configuration change', output: 'New threshold active' },
                    { time: '5:30 PM', action: 'End of Day Handoff', desc: 'Sarah documents open items and the system generates an automated shift handoff report.', input: 'Handoff initiation', output: 'Documented status for night team' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '16px', padding: '16px', background: i % 2 === 0 ? 'var(--gray-50)' : 'white', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                      <div style={{ minWidth: '80px', fontWeight: '600', color: 'var(--primary-600)', fontFamily: 'monospace' }}>{item.time}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{item.action}</div>
                        <div style={{ fontSize: '13px', color: 'var(--gray-600)', marginBottom: '8px' }}>{item.desc}</div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <div style={{ fontSize: '11px', padding: '4px 8px', background: 'var(--warning-50)', borderRadius: '4px', color: 'var(--warning-700)' }}>
                            <strong>Input:</strong> {item.input}
                          </div>
                          <div style={{ fontSize: '11px', padding: '4px 8px', background: 'var(--success-50)', borderRadius: '4px', color: 'var(--success-700)' }}>
                            <strong>Output:</strong> {item.output}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Data Scientist */}
            <div className="card">
              <div className="card-header" style={{ background: 'var(--success-50)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--success-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="cpu" size={24} />
                  </div>
                  <div>
                    <h3 className="card-title">Data Scientist - Dr. Michael Chen</h3>
                    <p className="card-subtitle">Model development and monitoring workflow</p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { time: '9:00 AM', action: 'Model Performance Review', desc: 'Michael checks the model monitoring dashboard. Accuracy has drifted 0.3% over the past week.', input: 'Monitoring dashboard', output: 'Drift alert: 0.3% accuracy drop' },
                    { time: '9:30 AM', action: 'Drift Analysis', desc: 'He runs the data drift detection pipeline to identify which features have shifted.', input: 'Feature distributions', output: 'Transaction amount distribution shifted' },
                    { time: '10:00 AM', action: 'Feature Investigation', desc: 'Using the feature store, he analyzes the transaction_amount feature over time.', input: 'Feature history query', output: 'Holiday season causing higher amounts' },
                    { time: '11:00 AM', action: 'Retrain Decision', desc: 'Based on analysis, he schedules a model retrain with the latest 90 days of data.', input: 'Retrain configuration', output: 'Training job queued' },
                    { time: '2:00 PM', action: 'Model Validation', desc: 'The retrained model completes. Michael reviews validation metrics on holdout set.', input: 'New model artifact', output: 'Accuracy: 99.3% (+0.5%)' },
                    { time: '3:00 PM', action: 'A/B Test Setup', desc: 'He configures an A/B test to gradually roll out the new model to 10% of traffic.', input: 'A/B config', output: 'Shadow mode enabled' },
                    { time: '4:30 PM', action: 'Documentation', desc: 'Michael updates the model card with new performance metrics and training details.', input: 'Model card template', output: 'Updated documentation' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '16px', padding: '16px', background: i % 2 === 0 ? 'var(--gray-50)' : 'white', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                      <div style={{ minWidth: '80px', fontWeight: '600', color: 'var(--success-600)', fontFamily: 'monospace' }}>{item.time}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{item.action}</div>
                        <div style={{ fontSize: '13px', color: 'var(--gray-600)', marginBottom: '8px' }}>{item.desc}</div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <div style={{ fontSize: '11px', padding: '4px 8px', background: 'var(--warning-50)', borderRadius: '4px', color: 'var(--warning-700)' }}>
                            <strong>Input:</strong> {item.input}
                          </div>
                          <div style={{ fontSize: '11px', padding: '4px 8px', background: 'var(--success-50)', borderRadius: '4px', color: 'var(--success-700)' }}>
                            <strong>Output:</strong> {item.output}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Executive */}
            <div className="card">
              <div className="card-header" style={{ background: 'var(--purple-50)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--purple-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="briefcase" size={24} />
                  </div>
                  <div>
                    <h3 className="card-title">VP of {department.name} - Jennifer Williams</h3>
                    <p className="card-subtitle">Executive oversight and strategic decisions</p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { time: '8:00 AM', action: 'Executive Dashboard', desc: 'Jennifer reviews the executive summary showing key KPIs: accuracy, savings, and volume processed.', input: 'Mobile app notification', output: 'Daily summary: $142K saved, 99.3% accuracy' },
                    { time: '10:00 AM', action: 'Weekly Steering Committee', desc: 'She presents the ML initiative progress to the C-suite using auto-generated slides.', input: 'Report package', output: 'Approval for Phase 2 expansion' },
                    { time: '2:00 PM', action: 'ROI Review', desc: 'Jennifer reviews the monthly ROI tracking dashboard with Finance.', input: 'Financial metrics', output: 'YTD savings: $1.8M (120% of target)' },
                    { time: '4:00 PM', action: 'Model Approval', desc: 'She reviews and approves the new model version for production deployment.', input: 'Model approval request', output: 'Signed approval, deployment scheduled' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '16px', padding: '16px', background: i % 2 === 0 ? 'var(--gray-50)' : 'white', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                      <div style={{ minWidth: '80px', fontWeight: '600', color: 'var(--purple-600)', fontFamily: 'monospace' }}>{item.time}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{item.action}</div>
                        <div style={{ fontSize: '13px', color: 'var(--gray-600)', marginBottom: '8px' }}>{item.desc}</div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <div style={{ fontSize: '11px', padding: '4px 8px', background: 'var(--warning-50)', borderRadius: '4px', color: 'var(--warning-700)' }}>
                            <strong>Input:</strong> {item.input}
                          </div>
                          <div style={{ fontSize: '11px', padding: '4px 8px', background: 'var(--success-50)', borderRadius: '4px', color: 'var(--success-700)' }}>
                            <strong>Output:</strong> {item.output}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Compliance Officer */}
            <div className="card">
              <div className="card-header" style={{ background: 'var(--danger-50)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--danger-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="shield" size={24} />
                  </div>
                  <div>
                    <h3 className="card-title">Compliance Officer - Robert Martinez</h3>
                    <p className="card-subtitle">Regulatory and audit oversight</p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { time: '9:00 AM', action: 'Audit Trail Review', desc: 'Robert reviews the automated audit logs for any anomalies or policy violations.', input: 'Audit log query', output: 'No violations detected' },
                    { time: '11:00 AM', action: 'Fairness Assessment', desc: 'He runs the weekly fairness report to check for bias across protected classes.', input: 'Fairness metrics query', output: 'All metrics within acceptable range' },
                    { time: '1:00 PM', action: 'Model Documentation Review', desc: 'Robert reviews the updated model card to ensure it meets SR 11-7 requirements.', input: 'Model card v2.3.1', output: 'Documentation approved' },
                    { time: '3:00 PM', action: 'Regulatory Report Prep', desc: 'He generates the quarterly regulatory report using the compliance reporting module.', input: 'Report template', output: 'Draft report for legal review' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '16px', padding: '16px', background: i % 2 === 0 ? 'var(--gray-50)' : 'white', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                      <div style={{ minWidth: '80px', fontWeight: '600', color: 'var(--danger-600)', fontFamily: 'monospace' }}>{item.time}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{item.action}</div>
                        <div style={{ fontSize: '13px', color: 'var(--gray-600)', marginBottom: '8px' }}>{item.desc}</div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <div style={{ fontSize: '11px', padding: '4px 8px', background: 'var(--warning-50)', borderRadius: '4px', color: 'var(--warning-700)' }}>
                            <strong>Input:</strong> {item.input}
                          </div>
                          <div style={{ fontSize: '11px', padding: '4px 8px', background: 'var(--success-50)', borderRadius: '4px', color: 'var(--success-700)' }}>
                            <strong>Output:</strong> {item.output}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Transaction History Visualization */}
          <div className="card" style={{ marginTop: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">System Transaction History</h3>
              <p className="card-subtitle">Real-time log of all stakeholder interactions</p>
            </div>
            <div className="card-body">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Role</th>
                    <th>Action</th>
                    <th>Input</th>
                    <th>Output</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { time: '10:32:15 AM', user: 'S. Johnson', role: 'Analyst', action: 'Case Review', input: 'Case #12847', output: 'Confirmed fraud', duration: '3m 42s' },
                    { time: '10:28:03 AM', user: 'System', role: 'Batch', action: 'Scoring', input: '1,523 txns', output: '1,520 normal, 3 flagged', duration: '2.3s' },
                    { time: '10:15:47 AM', user: 'M. Chen', role: 'Data Sci', action: 'Model Query', input: 'Drift analysis', output: 'Report generated', duration: '12.5s' },
                    { time: '10:02:33 AM', user: 'J. Williams', role: 'Executive', action: 'Dashboard View', input: 'KPI request', output: 'Summary displayed', duration: '1.2s' },
                    { time: '09:58:12 AM', user: 'R. Martinez', role: 'Compliance', action: 'Audit Query', input: 'Last 24h logs', output: '45,231 records', duration: '3.8s' },
                    { time: '09:45:00 AM', user: 'System', role: 'Scheduled', action: 'Health Check', input: 'All services', output: 'All healthy', duration: '0.8s' },
                  ].map((item, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{item.time}</td>
                      <td style={{ fontWeight: '500' }}>{item.user}</td>
                      <td><span className="status-badge secondary">{item.role}</span></td>
                      <td>{item.action}</td>
                      <td style={{ fontSize: '12px', color: 'var(--gray-600)' }}>{item.input}</td>
                      <td style={{ fontSize: '12px', color: 'var(--gray-600)' }}>{item.output}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{item.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Scenarios Tab - List of Scenarios Addressed */}
      {activeTab === 'scenarios' && (
        <div>
          {/* Scenarios Overview */}
          <div className="card" style={{ marginBottom: '24px', border: '2px solid var(--indigo-200)' }}>
            <div className="card-header" style={{ background: 'var(--indigo-50)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon name="list" size={24} />
                <div>
                  <h3 className="card-title">Business Scenarios Addressed</h3>
                  <p className="card-subtitle">Complete list of scenarios handled by {useCase.name}</p>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div style={{ padding: '20px', background: 'var(--success-50)', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--success-600)' }}>12</div>
                  <div style={{ fontSize: '13px', color: 'var(--gray-600)' }}>Primary Scenarios</div>
                </div>
                <div style={{ padding: '20px', background: 'var(--primary-50)', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary-600)' }}>8</div>
                  <div style={{ fontSize: '13px', color: 'var(--gray-600)' }}>Edge Cases</div>
                </div>
                <div style={{ padding: '20px', background: 'var(--warning-50)', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--warning-600)' }}>5</div>
                  <div style={{ fontSize: '13px', color: 'var(--gray-600)' }}>Exception Flows</div>
                </div>
                <div style={{ padding: '20px', background: 'var(--purple-50)', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--purple-600)' }}>99.3%</div>
                  <div style={{ fontSize: '13px', color: 'var(--gray-600)' }}>Coverage Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Scenarios */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header" style={{ background: 'var(--success-50)' }}>
              <h3 className="card-title">Primary Business Scenarios</h3>
              <p className="card-subtitle">Core scenarios the model is trained to handle</p>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { id: 'SC-001', name: 'Standard Transaction Processing', desc: 'Normal customer transactions within expected patterns', frequency: 'Very High (85%)', accuracy: '99.8%', priority: 'P1' },
                  { id: 'SC-002', name: 'High-Value Transaction Alert', desc: 'Transactions exceeding customer historical averages by 3x', frequency: 'Medium (8%)', accuracy: '99.2%', priority: 'P1' },
                  { id: 'SC-003', name: 'Geographic Anomaly Detection', desc: 'Transactions from unusual locations or rapid geo-shifts', frequency: 'Low (3%)', accuracy: '98.7%', priority: 'P1' },
                  { id: 'SC-004', name: 'Velocity Pattern Recognition', desc: 'Unusual frequency of transactions in short time windows', frequency: 'Low (2%)', accuracy: '99.1%', priority: 'P1' },
                  { id: 'SC-005', name: 'New Account Behavior Analysis', desc: 'First 90 days account activity pattern assessment', frequency: 'Medium (5%)', accuracy: '97.5%', priority: 'P2' },
                  { id: 'SC-006', name: 'Merchant Category Risk Scoring', desc: 'Risk assessment based on merchant type and history', frequency: 'High (15%)', accuracy: '98.9%', priority: 'P1' },
                  { id: 'SC-007', name: 'Cross-Channel Transaction Linking', desc: 'Connecting activities across online, mobile, and branch', frequency: 'Medium (10%)', accuracy: '98.3%', priority: 'P2' },
                  { id: 'SC-008', name: 'Time-Based Pattern Analysis', desc: 'Detecting unusual timing patterns in transactions', frequency: 'Low (4%)', accuracy: '97.8%', priority: 'P2' },
                  { id: 'SC-009', name: 'Device Fingerprint Matching', desc: 'Identifying transactions from new or suspicious devices', frequency: 'Medium (7%)', accuracy: '99.4%', priority: 'P1' },
                  { id: 'SC-010', name: 'Beneficiary Risk Assessment', desc: 'Evaluating risk of payment recipients', frequency: 'Medium (6%)', accuracy: '98.1%', priority: 'P2' },
                  { id: 'SC-011', name: 'Dormant Account Activation', desc: 'Sudden activity on previously inactive accounts', frequency: 'Very Low (1%)', accuracy: '96.8%', priority: 'P2' },
                  { id: 'SC-012', name: 'Multi-Account Relationship Detection', desc: 'Identifying linked accounts with suspicious patterns', frequency: 'Low (2%)', accuracy: '97.2%', priority: 'P2' },
                ].map((scenario, i) => (
                  <div key={i} style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '12px', border: '1px solid var(--gray-200)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '12px', padding: '4px 8px', background: 'var(--indigo-100)', borderRadius: '4px', color: 'var(--indigo-700)' }}>{scenario.id}</span>
                        <span style={{ fontWeight: '600', fontSize: '15px' }}>{scenario.name}</span>
                      </div>
                      <span className={`status-badge ${scenario.priority === 'P1' ? 'danger' : 'warning'}`}>{scenario.priority}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: '0 0 12px 0' }}>{scenario.desc}</p>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ fontSize: '12px' }}>
                        <span style={{ color: 'var(--gray-500)' }}>Frequency: </span>
                        <span style={{ fontWeight: '500' }}>{scenario.frequency}</span>
                      </div>
                      <div style={{ fontSize: '12px' }}>
                        <span style={{ color: 'var(--gray-500)' }}>Accuracy: </span>
                        <span style={{ fontWeight: '600', color: 'var(--success-600)' }}>{scenario.accuracy}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Edge Cases */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header" style={{ background: 'var(--warning-50)' }}>
              <h3 className="card-title">Edge Cases & Exception Scenarios</h3>
              <p className="card-subtitle">Complex scenarios requiring special handling</p>
            </div>
            <div className="card-body">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Scenario ID</th>
                    <th>Edge Case</th>
                    <th>Challenge</th>
                    <th>Solution Approach</th>
                    <th>Accuracy</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 'EC-001', name: 'Zero-Day Attack Pattern', challenge: 'No historical examples', solution: 'Anomaly detection + rule engine fallback', accuracy: '92.5%', status: 'Active' },
                    { id: 'EC-002', name: 'Legitimate High-Value Spike', challenge: 'Distinguishing from fraud', solution: 'Customer context + verification workflow', accuracy: '94.8%', status: 'Active' },
                    { id: 'EC-003', name: 'International Travel', challenge: 'Rapid location changes', solution: 'Travel notification integration', accuracy: '96.2%', status: 'Active' },
                    { id: 'EC-004', name: 'Corporate Card Bulk Purchases', challenge: 'High volume legitimate txns', solution: 'Business account profiling', accuracy: '97.1%', status: 'Active' },
                    { id: 'EC-005', name: 'Seasonal Spending Patterns', challenge: 'Holiday season anomalies', solution: 'Time-aware model features', accuracy: '95.8%', status: 'Active' },
                    { id: 'EC-006', name: 'Authorized User Transactions', challenge: 'Multiple users per account', solution: 'User behavior clustering', accuracy: '93.4%', status: 'Beta' },
                    { id: 'EC-007', name: 'Cryptocurrency Exchanges', challenge: 'New merchant patterns', solution: 'Specialized merchant model', accuracy: '91.2%', status: 'Beta' },
                    { id: 'EC-008', name: 'Refund Fraud Attempts', challenge: 'Return abuse patterns', solution: 'Transaction pair analysis', accuracy: '94.5%', status: 'Active' },
                  ].map((item, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{item.id}</td>
                      <td style={{ fontWeight: '500' }}>{item.name}</td>
                      <td style={{ fontSize: '12px', color: 'var(--gray-600)' }}>{item.challenge}</td>
                      <td style={{ fontSize: '12px' }}>{item.solution}</td>
                      <td style={{ fontWeight: '600', color: 'var(--success-600)' }}>{item.accuracy}</td>
                      <td><span className={`status-badge ${item.status === 'Active' ? 'success' : 'warning'}`}>{item.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Scenario Coverage Matrix */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Scenario Coverage Matrix</h3>
              <p className="card-subtitle">How scenarios map to business outcomes</p>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-3" style={{ gap: '16px' }}>
                <div style={{ padding: '16px', background: 'var(--success-50)', borderRadius: '12px' }}>
                  <div style={{ fontWeight: '600', marginBottom: '12px', color: 'var(--success-700)' }}>Revenue Protection</div>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                    <li>SC-001, SC-002, SC-004</li>
                    <li>EC-002, EC-008</li>
                    <li><strong>Impact:</strong> $4.2M/year saved</li>
                  </ul>
                </div>
                <div style={{ padding: '16px', background: 'var(--primary-50)', borderRadius: '12px' }}>
                  <div style={{ fontWeight: '600', marginBottom: '12px', color: 'var(--primary-700)' }}>Customer Experience</div>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                    <li>SC-003, SC-009, EC-003</li>
                    <li>EC-004, EC-006</li>
                    <li><strong>Impact:</strong> 35% fewer false declines</li>
                  </ul>
                </div>
                <div style={{ padding: '16px', background: 'var(--purple-50)', borderRadius: '12px' }}>
                  <div style={{ fontWeight: '600', marginBottom: '12px', color: 'var(--purple-700)' }}>Regulatory Compliance</div>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                    <li>SC-005, SC-010, SC-012</li>
                    <li>EC-001, EC-007</li>
                    <li><strong>Impact:</strong> 100% audit compliance</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LinkedIn Post Tab - Complete Process Explanation */}
      {activeTab === 'linkedin-post' && (
        <div>
          {/* Post Preview Header */}
          <div className="card" style={{ marginBottom: '24px', border: '2px solid var(--blue-300)' }}>
            <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--blue-50), var(--indigo-50))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '8px', background: 'var(--blue-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700' }}>in</div>
                <div style={{ flex: 1 }}>
                  <h3 className="card-title">LinkedIn Post Template</h3>
                  <p className="card-subtitle">Complete documentation for {useCase.name} - Ready to share</p>
                </div>
                <button className="btn btn-primary" onClick={() => handleExport('LinkedIn Post')}>
                  <Icon name="download" size={16} /> Export as PDF
                </button>
              </div>
            </div>
          </div>

          {/* Complete Process Documentation */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header" style={{ background: 'var(--gray-50)', borderBottom: '2px solid var(--blue-200)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon name="file-text" size={24} />
                <h3 className="card-title" style={{ margin: 0 }}>Complete ML Pipeline Documentation</h3>
              </div>
            </div>
            <div className="card-body" style={{ padding: '32px' }}>
              {/* Title Section */}
              <div style={{ textAlign: 'center', marginBottom: '40px', paddingBottom: '24px', borderBottom: '2px solid var(--gray-200)' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--gray-900)', marginBottom: '8px' }}>
                  {useCase.name}
                </h1>
                <p style={{ fontSize: '16px', color: 'var(--gray-600)', marginBottom: '16px' }}>
                  {department.name} Department | Banking ML Pipeline
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                  <span className={`status-badge ${getStatusColor(useCase.status)}`} style={{ fontSize: '14px', padding: '8px 16px' }}>
                    {getStatusLabel(useCase.status)}
                  </span>
                  <span style={{ fontSize: '14px', padding: '8px 16px', background: 'var(--success-100)', borderRadius: '20px', color: 'var(--success-700)' }}>
                    {useCase.accuracy > 0 ? useCase.accuracy.toFixed(1) : 99}% Accuracy
                  </span>
                </div>
              </div>

              {/* Section 1: Problem Statement */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--danger-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>1</div>
                  <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--gray-800)' }}>Problem Statement & Business Challenge</h2>
                </div>
                <div style={{ marginLeft: '48px', padding: '20px', background: 'var(--danger-50)', borderRadius: '12px', borderLeft: '4px solid var(--danger-500)' }}>
                  <p style={{ fontSize: '14px', lineHeight: '1.8', margin: '0 0 16px 0', color: 'var(--gray-700)' }}>
                    <strong>The Challenge:</strong> Financial institutions face significant challenges in identifying and preventing fraudulent activities while maintaining excellent customer experience. Traditional rule-based systems result in high false positive rates (25-30%), causing unnecessary friction for legitimate customers and requiring extensive manual review resources.
                  </p>
                  <p style={{ fontSize: '14px', lineHeight: '1.8', margin: '0 0 16px 0', color: 'var(--gray-700)' }}>
                    <strong>Business Impact (Before AI):</strong>
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '24px', fontSize: '14px', lineHeight: '2', color: 'var(--gray-700)' }}>
                    <li>$12M+ annual losses due to undetected fraud</li>
                    <li>50+ FTEs dedicated to manual case review</li>
                    <li>48-hour average response time for alert investigation</li>
                    <li>15% customer complaint rate due to false declines</li>
                  </ul>
                </div>
              </div>

              {/* Section 2: Solution Overview */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--success-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>2</div>
                  <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--gray-800)' }}>Solution: AI/ML-Powered Detection System</h2>
                </div>
                <div style={{ marginLeft: '48px', padding: '20px', background: 'var(--success-50)', borderRadius: '12px', borderLeft: '4px solid var(--success-500)' }}>
                  <p style={{ fontSize: '14px', lineHeight: '1.8', margin: '0 0 16px 0', color: 'var(--gray-700)' }}>
                    Implemented an end-to-end machine learning pipeline leveraging ensemble methods and deep learning to provide real-time, explainable predictions with industry-leading accuracy.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '16px' }}>
                    <div style={{ padding: '16px', background: 'white', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success-600)' }}>{useCase.accuracy > 0 ? useCase.accuracy.toFixed(1) : 99}%</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>Model Accuracy</div>
                    </div>
                    <div style={{ padding: '16px', background: 'white', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success-600)' }}>150ms</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>Avg Latency</div>
                    </div>
                    <div style={{ padding: '16px', background: 'white', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success-600)' }}>2.4M</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>Daily Predictions</div>
                    </div>
                  </div>

                  {/* End-to-End ML Pipeline Flowchart */}
                  <div style={{ marginTop: '24px', padding: '20px', background: 'var(--gray-50)', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 20px 0', textAlign: 'center', color: 'var(--gray-700)' }}>End-to-End ML Pipeline Flowchart</h4>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {[
                        { step: 'Data Sources', icon: 'database', color: 'gray', desc: 'CSV, API, Stream' },
                        { step: 'Ingestion', icon: 'download', color: 'primary', desc: 'Kafka, Spark' },
                        { step: 'Preprocessing', icon: 'settings', color: 'teal', desc: 'Clean, Transform' },
                        { step: 'Feature Store', icon: 'layers', color: 'indigo', desc: '450+ Features' },
                        { step: 'Training', icon: 'cpu', color: 'purple', desc: 'XGBoost, LSTM' },
                        { step: 'Validation', icon: 'check-circle', color: 'warning', desc: 'Cross-Val' },
                        { step: 'Registry', icon: 'archive', color: 'orange', desc: 'MLflow' },
                        { step: 'Serving', icon: 'zap', color: 'success', desc: '150ms P95' },
                        { step: 'Monitoring', icon: 'activity', color: 'danger', desc: 'Drift Alert' },
                      ].map((item, i) => (
                        <React.Fragment key={i}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: `var(--${item.color}-100)`, border: `2px solid var(--${item.color}-400)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                              <Icon name={item.icon} size={24} color={`var(--${item.color}-600)`} />
                            </div>
                            <div style={{ fontSize: '11px', fontWeight: '600', color: `var(--${item.color}-700)`, textAlign: 'center' }}>{item.step}</div>
                            <div style={{ fontSize: '9px', color: 'var(--gray-500)', textAlign: 'center' }}>{item.desc}</div>
                          </div>
                          {i < 8 && <div style={{ fontSize: '20px', color: 'var(--gray-400)' }}>→</div>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Data Processing Flow */}
                  <div style={{ marginTop: '20px', padding: '20px', background: 'var(--primary-50)', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 20px 0', textAlign: 'center', color: 'var(--primary-700)' }}>Data Processing Flow</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Row 1: Data Sources */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ minWidth: '100px', fontSize: '11px', fontWeight: '600', color: 'var(--gray-600)' }}>DATA SOURCES</div>
                        <div style={{ flex: 1, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {['Transaction DB', 'Customer CRM', 'Device Logs', 'API Feeds', 'Image Store'].map((s, i) => (
                            <div key={i} style={{ padding: '6px 12px', background: 'var(--gray-200)', borderRadius: '6px', fontSize: '10px', fontWeight: '500' }}>{s}</div>
                          ))}
                        </div>
                      </div>
                      <div style={{ textAlign: 'center', color: 'var(--gray-400)' }}>↓</div>
                      {/* Row 2: Ingestion */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ minWidth: '100px', fontSize: '11px', fontWeight: '600', color: 'var(--gray-600)' }}>INGESTION</div>
                        <div style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <div style={{ padding: '8px 16px', background: 'var(--primary-200)', borderRadius: '8px', fontSize: '11px', fontWeight: '600' }}>Apache Kafka</div>
                          <span style={{ color: 'var(--gray-400)' }}>→</span>
                          <div style={{ padding: '8px 16px', background: 'var(--primary-200)', borderRadius: '8px', fontSize: '11px', fontWeight: '600' }}>Apache Spark</div>
                          <span style={{ color: 'var(--gray-400)' }}>→</span>
                          <div style={{ padding: '8px 16px', background: 'var(--primary-200)', borderRadius: '8px', fontSize: '11px', fontWeight: '600' }}>Data Lake (S3)</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'center', color: 'var(--gray-400)' }}>↓</div>
                      {/* Row 3: Processing */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ minWidth: '100px', fontSize: '11px', fontWeight: '600', color: 'var(--gray-600)' }}>PROCESSING</div>
                        <div style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <div style={{ padding: '8px 16px', background: 'var(--teal-200)', borderRadius: '8px', fontSize: '11px', fontWeight: '600' }}>Data Cleaning</div>
                          <span style={{ color: 'var(--gray-400)' }}>→</span>
                          <div style={{ padding: '8px 16px', background: 'var(--teal-200)', borderRadius: '8px', fontSize: '11px', fontWeight: '600' }}>Normalization</div>
                          <span style={{ color: 'var(--gray-400)' }}>→</span>
                          <div style={{ padding: '8px 16px', background: 'var(--teal-200)', borderRadius: '8px', fontSize: '11px', fontWeight: '600' }}>Feature Engineering</div>
                          <span style={{ color: 'var(--gray-400)' }}>→</span>
                          <div style={{ padding: '8px 16px', background: 'var(--teal-200)', borderRadius: '8px', fontSize: '11px', fontWeight: '600' }}>Feature Store</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'center', color: 'var(--gray-400)' }}>↓</div>
                      {/* Row 4: ML Pipeline */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ minWidth: '100px', fontSize: '11px', fontWeight: '600', color: 'var(--gray-600)' }}>ML PIPELINE</div>
                        <div style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <div style={{ padding: '8px 16px', background: 'var(--purple-200)', borderRadius: '8px', fontSize: '11px', fontWeight: '600' }}>Model Training</div>
                          <span style={{ color: 'var(--gray-400)' }}>→</span>
                          <div style={{ padding: '8px 16px', background: 'var(--purple-200)', borderRadius: '8px', fontSize: '11px', fontWeight: '600' }}>Validation</div>
                          <span style={{ color: 'var(--gray-400)' }}>→</span>
                          <div style={{ padding: '8px 16px', background: 'var(--purple-200)', borderRadius: '8px', fontSize: '11px', fontWeight: '600' }}>Registry</div>
                          <span style={{ color: 'var(--gray-400)' }}>→</span>
                          <div style={{ padding: '8px 16px', background: 'var(--success-200)', borderRadius: '8px', fontSize: '11px', fontWeight: '600' }}>Deployment</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'center', color: 'var(--gray-400)' }}>↓</div>
                      {/* Row 5: Output */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ minWidth: '100px', fontSize: '11px', fontWeight: '600', color: 'var(--gray-600)' }}>OUTPUT</div>
                        <div style={{ flex: 1, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {['Real-time Scores', 'Alerts', 'Dashboard', 'Reports', 'API Response'].map((s, i) => (
                            <div key={i} style={{ padding: '6px 12px', background: 'var(--success-200)', borderRadius: '6px', fontSize: '10px', fontWeight: '500' }}>{s}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Model Architecture Flowchart */}
                  <div style={{ marginTop: '20px', padding: '20px', background: 'var(--purple-50)', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 20px 0', textAlign: 'center', color: 'var(--purple-700)' }}>Ensemble Model Architecture</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                      {/* Input Layer */}
                      <div style={{ padding: '12px 32px', background: 'var(--gray-200)', borderRadius: '8px', fontWeight: '600', fontSize: '13px' }}>
                        Input Features (450 dimensions)
                      </div>
                      <div style={{ fontSize: '24px', color: 'var(--gray-400)' }}>↓</div>
                      {/* Base Models */}
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {[
                          { name: 'XGBoost', acc: '98.2%', color: 'primary' },
                          { name: 'LightGBM', acc: '97.8%', color: 'success' },
                          { name: 'CatBoost', acc: '97.5%', color: 'teal' },
                          { name: 'Random Forest', acc: '96.1%', color: 'warning' },
                          { name: 'LSTM', acc: '95.8%', color: 'purple' },
                        ].map((m, i) => (
                          <div key={i} style={{ padding: '12px 16px', background: `var(--${m.color}-100)`, border: `2px solid var(--${m.color}-300)`, borderRadius: '8px', textAlign: 'center', minWidth: '100px' }}>
                            <div style={{ fontWeight: '600', fontSize: '12px', color: `var(--${m.color}-700)` }}>{m.name}</div>
                            <div style={{ fontSize: '11px', color: `var(--${m.color}-600)` }}>{m.acc}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ fontSize: '24px', color: 'var(--gray-400)' }}>↓</div>
                      {/* Stacking Layer */}
                      <div style={{ padding: '12px 32px', background: 'var(--indigo-200)', borderRadius: '8px', fontWeight: '600', fontSize: '13px' }}>
                        Stacking Layer (5 predictions + meta features)
                      </div>
                      <div style={{ fontSize: '24px', color: 'var(--gray-400)' }}>↓</div>
                      {/* Meta Learner */}
                      <div style={{ padding: '12px 32px', background: 'var(--orange-200)', borderRadius: '8px', fontWeight: '600', fontSize: '13px' }}>
                        Neural Network Meta-Learner (3 hidden layers)
                      </div>
                      <div style={{ fontSize: '24px', color: 'var(--gray-400)' }}>↓</div>
                      {/* Output */}
                      <div style={{ padding: '16px 40px', background: 'var(--success-500)', borderRadius: '12px', color: 'white' }}>
                        <div style={{ fontWeight: '700', fontSize: '16px' }}>Final Prediction</div>
                        <div style={{ fontSize: '20px', fontWeight: '700' }}>{useCase.accuracy > 0 ? useCase.accuracy.toFixed(1) : 99.3}% Accuracy</div>
                      </div>
                    </div>
                  </div>

                  {/* Decision Flow */}
                  <div style={{ marginTop: '20px', padding: '20px', background: 'var(--warning-50)', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 20px 0', textAlign: 'center', color: 'var(--warning-700)' }}>Real-time Decision Flow</h4>
                    <div style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'center', gap: '8px' }}>
                      {[
                        { step: '1', title: 'Transaction Received', desc: 'API receives transaction data', time: '0ms', color: 'gray' },
                        { step: '2', title: 'Feature Extraction', desc: 'Extract 450+ features', time: '20ms', color: 'primary' },
                        { step: '3', title: 'Model Inference', desc: 'Ensemble prediction', time: '80ms', color: 'purple' },
                        { step: '4', title: 'Rule Engine', desc: 'Business rules check', time: '30ms', color: 'warning' },
                        { step: '5', title: 'Decision', desc: 'Approve/Flag/Block', time: '20ms', color: 'success' },
                      ].map((item, i) => (
                        <React.Fragment key={i}>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px', background: `var(--${item.color}-100)`, borderRadius: '12px', border: `2px solid var(--${item.color}-300)`, maxWidth: '140px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `var(--${item.color}-500)`, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', marginBottom: '8px' }}>{item.step}</div>
                            <div style={{ fontWeight: '600', fontSize: '11px', color: `var(--${item.color}-700)`, textAlign: 'center', marginBottom: '4px' }}>{item.title}</div>
                            <div style={{ fontSize: '10px', color: 'var(--gray-500)', textAlign: 'center', marginBottom: '8px' }}>{item.desc}</div>
                            <div style={{ padding: '4px 8px', background: `var(--${item.color}-200)`, borderRadius: '4px', fontSize: '10px', fontWeight: '600' }}>{item.time}</div>
                          </div>
                          {i < 4 && <div style={{ display: 'flex', alignItems: 'center', fontSize: '20px', color: 'var(--gray-400)' }}>→</div>}
                        </React.Fragment>
                      ))}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '16px', padding: '12px', background: 'var(--success-100)', borderRadius: '8px' }}>
                      <span style={{ fontWeight: '600', color: 'var(--success-700)' }}>Total End-to-End Latency: 150ms (P95: {"<"}200ms)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Complete Data Inventory */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>3</div>
                  <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--gray-800)' }}>Complete Data Inventory</h2>
                </div>
                <div style={{ marginLeft: '48px' }}>
                  {/* Data Type Summary */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ padding: '16px', background: 'var(--primary-50)', borderRadius: '12px', textAlign: 'center', border: '2px solid var(--primary-200)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--primary-600)', fontWeight: '600', marginBottom: '4px' }}>STRUCTURED DATA</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-700)' }}>CSV/SQL</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>85% of data</div>
                    </div>
                    <div style={{ padding: '16px', background: 'var(--success-50)', borderRadius: '12px', textAlign: 'center', border: '2px solid var(--success-200)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--success-600)', fontWeight: '600', marginBottom: '4px' }}>TEXT DATA</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success-700)' }}>NLP</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>8% of data</div>
                    </div>
                    <div style={{ padding: '16px', background: 'var(--purple-50)', borderRadius: '12px', textAlign: 'center', border: '2px solid var(--purple-200)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--purple-600)', fontWeight: '600', marginBottom: '4px' }}>IMAGE DATA</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--purple-700)' }}>CV</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>5% of data</div>
                    </div>
                    <div style={{ padding: '16px', background: 'var(--warning-50)', borderRadius: '12px', textAlign: 'center', border: '2px solid var(--warning-200)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--warning-600)', fontWeight: '600', marginBottom: '4px' }}>STREAMING</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--warning-700)' }}>Real-time</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>2% of data</div>
                    </div>
                  </div>

                  {/* Detailed Data Sources Table */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '20px' }}>
                    <thead>
                      <tr style={{ background: 'var(--primary-100)' }}>
                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid var(--primary-300)' }}>Data Source</th>
                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid var(--primary-300)' }}>Format</th>
                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid var(--primary-300)' }}>Type</th>
                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid var(--primary-300)' }}>Size</th>
                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid var(--primary-300)' }}>Frequency</th>
                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid var(--primary-300)' }}>Features</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { source: 'Transaction Records', format: 'CSV/Parquet', type: 'Structured', size: '50GB/day', freq: 'Real-time', features: '45 columns' },
                        { source: 'Customer Master Data', format: 'SQL Tables', type: 'Structured', size: '2TB total', freq: 'Daily batch', features: '120 columns' },
                        { source: 'Device Fingerprints', format: 'JSON', type: 'Semi-structured', size: '8GB/day', freq: 'Real-time', features: '35 attributes' },
                        { source: 'Customer Communications', format: 'Text/Email', type: 'Unstructured', size: '5GB/day', freq: 'Streaming', features: 'NLP processed' },
                        { source: 'ID Document Images', format: 'JPEG/PNG', type: 'Image', size: '15GB/day', freq: 'On-demand', features: 'OCR + CNN' },
                        { source: 'Check Images', format: 'TIFF/PNG', type: 'Image', size: '25GB/day', freq: 'Batch', features: 'ICR + Signature' },
                        { source: 'Session Clickstream', format: 'JSON/Avro', type: 'Event Stream', size: '100GB/day', freq: 'Real-time', features: '28 events' },
                        { source: 'External Credit Data', format: 'XML/API', type: 'Structured', size: '1GB/day', freq: 'On-demand', features: '85 attributes' },
                        { source: 'Geo-location Signals', format: 'JSON', type: 'Structured', size: '3GB/day', freq: 'Real-time', features: 'Lat/Long/Velocity' },
                        { source: 'Social Media Signals', format: 'JSON/Text', type: 'Unstructured', size: '500MB/day', freq: 'Hourly', features: 'Sentiment scores' },
                      ].map((item, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? 'white' : 'var(--gray-50)' }}>
                          <td style={{ padding: '10px', borderBottom: '1px solid var(--gray-200)', fontWeight: '500' }}>{item.source}</td>
                          <td style={{ padding: '10px', borderBottom: '1px solid var(--gray-200)' }}><span style={{ fontFamily: 'monospace', fontSize: '11px', padding: '2px 6px', background: 'var(--gray-100)', borderRadius: '4px' }}>{item.format}</span></td>
                          <td style={{ padding: '10px', borderBottom: '1px solid var(--gray-200)' }}><span className={`status-badge ${item.type === 'Structured' ? 'primary' : item.type === 'Image' ? 'purple' : item.type === 'Unstructured' ? 'success' : 'warning'}`} style={{ fontSize: '10px' }}>{item.type}</span></td>
                          <td style={{ padding: '10px', borderBottom: '1px solid var(--gray-200)', fontWeight: '600' }}>{item.size}</td>
                          <td style={{ padding: '10px', borderBottom: '1px solid var(--gray-200)', fontSize: '11px' }}>{item.freq}</td>
                          <td style={{ padding: '10px', borderBottom: '1px solid var(--gray-200)', fontSize: '11px', color: 'var(--gray-600)' }}>{item.features}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Total Data Volume */}
                  <div style={{ padding: '16px', background: 'var(--gray-100)', borderRadius: '12px', display: 'flex', justifyContent: 'space-around' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Total Daily Volume</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-700)' }}>207 GB</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Total Records/Day</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-700)' }}>10.5M</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Historical Data</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-700)' }}>15 TB</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Training Dataset</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-700)' }}>2.8B rows</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Data Preprocessing & Normalization */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--teal-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>4</div>
                  <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--gray-800)' }}>Data Preprocessing & Normalization</h2>
                </div>
                <div style={{ marginLeft: '48px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div style={{ padding: '16px', background: 'var(--teal-50)', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--teal-700)', fontSize: '14px' }}>Data Cleaning</h4>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', lineHeight: '1.8' }}>
                      <li>Missing value imputation (KNN, Mean, Mode)</li>
                      <li>Duplicate detection & removal</li>
                      <li>Data type validation & casting</li>
                      <li>PII masking & anonymization</li>
                      <li>Encoding fixes (UTF-8 normalization)</li>
                    </ul>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--indigo-50)', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--indigo-700)', fontSize: '14px' }}>Normalization Techniques</h4>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', lineHeight: '1.8' }}>
                      <li>StandardScaler (z-score normalization)</li>
                      <li>MinMaxScaler (0-1 range)</li>
                      <li>RobustScaler (outlier resistant)</li>
                      <li>Log transformation (skewed data)</li>
                      <li>Box-Cox transformation</li>
                    </ul>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--orange-50)', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--orange-700)', fontSize: '14px' }}>Outlier Analysis</h4>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', lineHeight: '1.8' }}>
                      <li>IQR method (1.5x interquartile range)</li>
                      <li>Z-score threshold (|z| {">"} 3)</li>
                      <li>Isolation Forest detection</li>
                      <li>DBSCAN clustering</li>
                      <li>Local Outlier Factor (LOF)</li>
                    </ul>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--purple-50)', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--purple-700)', fontSize: '14px' }}>Feature Encoding</h4>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', lineHeight: '1.8' }}>
                      <li>One-Hot Encoding (categorical)</li>
                      <li>Label Encoding (ordinal)</li>
                      <li>Target Encoding (high cardinality)</li>
                      <li>Frequency Encoding</li>
                      <li>Embedding layers (neural networks)</li>
                    </ul>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--success-50)', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--success-700)', fontSize: '14px' }}>Text Preprocessing</h4>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', lineHeight: '1.8' }}>
                      <li>Tokenization & stemming</li>
                      <li>Lemmatization (WordNet)</li>
                      <li>Stop word removal</li>
                      <li>TF-IDF vectorization</li>
                      <li>BERT embeddings (768-dim)</li>
                    </ul>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--pink-50)', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--pink-700)', fontSize: '14px' }}>Image Preprocessing</h4>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', lineHeight: '1.8' }}>
                      <li>Resize to 224x224 (CNN input)</li>
                      <li>Normalization (ImageNet stats)</li>
                      <li>Data augmentation (flip, rotate)</li>
                      <li>OCR text extraction</li>
                      <li>Feature extraction (ResNet-50)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 5: Complete Model Inventory */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--purple-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>5</div>
                  <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--gray-800)' }}>Complete Model Inventory</h2>
                </div>
                <div style={{ marginLeft: '48px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '20px' }}>
                    <thead>
                      <tr style={{ background: 'var(--purple-100)' }}>
                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid var(--purple-300)' }}>Model</th>
                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid var(--purple-300)' }}>Type</th>
                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid var(--purple-300)' }}>Purpose</th>
                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid var(--purple-300)' }}>Accuracy</th>
                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid var(--purple-300)' }}>Framework</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { model: 'XGBoost Classifier', type: 'Gradient Boosting', purpose: 'Primary tabular classification', accuracy: '98.2%', framework: 'XGBoost 2.0' },
                        { model: 'LightGBM Classifier', type: 'Gradient Boosting', purpose: 'Fast training, categorical handling', accuracy: '97.8%', framework: 'LightGBM 4.0' },
                        { model: 'CatBoost Classifier', type: 'Gradient Boosting', purpose: 'High-cardinality features', accuracy: '97.5%', framework: 'CatBoost 1.2' },
                        { model: 'Random Forest', type: 'Ensemble', purpose: 'Feature importance, stability', accuracy: '96.1%', framework: 'Scikit-learn' },
                        { model: 'LSTM Network', type: 'Deep Learning', purpose: 'Sequence pattern detection', accuracy: '95.8%', framework: 'TensorFlow 2.x' },
                        { model: 'Transformer (BERT)', type: 'Deep Learning', purpose: 'NLP text classification', accuracy: '94.2%', framework: 'HuggingFace' },
                        { model: 'ResNet-50', type: 'CNN', purpose: 'Document image analysis', accuracy: '96.5%', framework: 'PyTorch' },
                        { model: 'Isolation Forest', type: 'Anomaly Detection', purpose: 'Unsupervised anomaly scoring', accuracy: '92.3%', framework: 'Scikit-learn' },
                        { model: 'AutoEncoder', type: 'Deep Learning', purpose: 'Reconstruction-based anomaly', accuracy: '91.8%', framework: 'TensorFlow 2.x' },
                        { model: 'Neural Network Meta-Learner', type: 'Stacking', purpose: 'Ensemble combination', accuracy: '99.3%', framework: 'PyTorch' },
                      ].map((item, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? 'white' : 'var(--gray-50)' }}>
                          <td style={{ padding: '10px', borderBottom: '1px solid var(--gray-200)', fontWeight: '600' }}>{item.model}</td>
                          <td style={{ padding: '10px', borderBottom: '1px solid var(--gray-200)' }}><span className="status-badge secondary" style={{ fontSize: '10px' }}>{item.type}</span></td>
                          <td style={{ padding: '10px', borderBottom: '1px solid var(--gray-200)', fontSize: '11px', color: 'var(--gray-600)' }}>{item.purpose}</td>
                          <td style={{ padding: '10px', borderBottom: '1px solid var(--gray-200)', fontWeight: '600', color: 'var(--success-600)' }}>{item.accuracy}</td>
                          <td style={{ padding: '10px', borderBottom: '1px solid var(--gray-200)' }}><span style={{ fontFamily: 'monospace', fontSize: '10px', padding: '2px 6px', background: 'var(--purple-100)', borderRadius: '4px' }}>{item.framework}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 6: Hybrid & Ensemble Architecture */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--indigo-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>6</div>
                  <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--gray-800)' }}>Hybrid Model & Ensemble Architecture</h2>
                </div>
                <div style={{ marginLeft: '48px' }}>
                  {/* Architecture Diagram */}
                  <div style={{ padding: '24px', background: 'var(--indigo-50)', borderRadius: '12px', marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 16px 0', textAlign: 'center', color: 'var(--indigo-700)' }}>Stacking Ensemble Architecture</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                      {/* Input Layer */}
                      <div style={{ padding: '12px 24px', background: 'var(--gray-200)', borderRadius: '8px', fontWeight: '600' }}>Input Features (450 dimensions)</div>
                      <div style={{ fontSize: '20px' }}>↓</div>
                      {/* Base Models Layer */}
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {['XGBoost', 'LightGBM', 'CatBoost', 'Random Forest', 'LSTM'].map((m, i) => (
                          <div key={i} style={{ padding: '10px 16px', background: 'var(--primary-100)', borderRadius: '8px', fontSize: '12px', fontWeight: '500' }}>{m}</div>
                        ))}
                      </div>
                      <div style={{ fontSize: '20px' }}>↓</div>
                      {/* Meta Features */}
                      <div style={{ padding: '12px 24px', background: 'var(--warning-100)', borderRadius: '8px', fontWeight: '600' }}>Meta Features (5 predictions + 450 original)</div>
                      <div style={{ fontSize: '20px' }}>↓</div>
                      {/* Meta Learner */}
                      <div style={{ padding: '12px 24px', background: 'var(--success-200)', borderRadius: '8px', fontWeight: '600' }}>Neural Network Meta-Learner (3 layers)</div>
                      <div style={{ fontSize: '20px' }}>↓</div>
                      {/* Output */}
                      <div style={{ padding: '12px 24px', background: 'var(--success-500)', color: 'white', borderRadius: '8px', fontWeight: '600' }}>Final Prediction (99.3% Accuracy)</div>
                    </div>
                  </div>

                  {/* Ensemble Techniques */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    <div style={{ padding: '16px', background: 'var(--primary-50)', borderRadius: '12px' }}>
                      <h4 style={{ margin: '0 0 12px 0', color: 'var(--primary-700)', fontSize: '14px' }}>Bagging Approach</h4>
                      <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', lineHeight: '1.8' }}>
                        <li>Bootstrap sampling (80% data)</li>
                        <li>100 estimators</li>
                        <li>Out-of-bag validation</li>
                        <li>Variance reduction</li>
                      </ul>
                    </div>
                    <div style={{ padding: '16px', background: 'var(--success-50)', borderRadius: '12px' }}>
                      <h4 style={{ margin: '0 0 12px 0', color: 'var(--success-700)', fontSize: '14px' }}>Boosting Approach</h4>
                      <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', lineHeight: '1.8' }}>
                        <li>Sequential learning</li>
                        <li>Focus on misclassified</li>
                        <li>Early stopping (100 rounds)</li>
                        <li>Learning rate: 0.05</li>
                      </ul>
                    </div>
                    <div style={{ padding: '16px', background: 'var(--purple-50)', borderRadius: '12px' }}>
                      <h4 style={{ margin: '0 0 12px 0', color: 'var(--purple-700)', fontSize: '14px' }}>Stacking Approach</h4>
                      <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', lineHeight: '1.8' }}>
                        <li>5 diverse base models</li>
                        <li>5-fold CV for meta features</li>
                        <li>Neural network combiner</li>
                        <li>+3.2% accuracy boost</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 7: RAG Integration */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--cyan-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>7</div>
                  <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--gray-800)' }}>RAG (Retrieval-Augmented Generation) Integration</h2>
                </div>
                <div style={{ marginLeft: '48px', padding: '20px', background: 'var(--cyan-50)', borderRadius: '12px', borderLeft: '4px solid var(--cyan-500)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 12px 0', color: 'var(--cyan-700)' }}>RAG Architecture</h4>
                      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '2' }}>
                        <li><strong>Vector Database:</strong> Pinecone for embedding storage</li>
                        <li><strong>Embedding Model:</strong> OpenAI text-embedding-3-large</li>
                        <li><strong>LLM:</strong> GPT-4 for context-aware explanations</li>
                        <li><strong>Chunk Size:</strong> 512 tokens with 50 overlap</li>
                        <li><strong>Top-K Retrieval:</strong> 5 most relevant documents</li>
                      </ul>
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 12px 0', color: 'var(--cyan-700)' }}>RAG Use Cases</h4>
                      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '2' }}>
                        <li><strong>Explainability:</strong> Natural language prediction explanations</li>
                        <li><strong>Documentation:</strong> Auto-generated model documentation</li>
                        <li><strong>Q&A:</strong> Analyst queries about model decisions</li>
                        <li><strong>Reports:</strong> Automated stakeholder reports</li>
                        <li><strong>Compliance:</strong> Regulatory explanation generation</li>
                      </ul>
                    </div>
                  </div>

                  {/* RAG Process Flowchart */}
                  <div style={{ marginTop: '20px', padding: '20px', background: 'white', borderRadius: '12px', border: '2px solid var(--cyan-200)' }}>
                    <h4 style={{ margin: '0 0 16px 0', textAlign: 'center', color: 'var(--cyan-700)' }}>RAG Pipeline Flowchart</h4>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {[
                        { step: 'User Query', color: 'gray', desc: 'Analyst question' },
                        { step: 'Embedding', color: 'primary', desc: 'text-embedding-3' },
                        { step: 'Vector Search', color: 'cyan', desc: 'Pinecone DB' },
                        { step: 'Retrieve Top-K', color: 'teal', desc: '5 documents' },
                        { step: 'Context Build', color: 'indigo', desc: 'Prompt assembly' },
                        { step: 'LLM Generate', color: 'purple', desc: 'GPT-4' },
                        { step: 'Response', color: 'success', desc: 'Natural language' },
                      ].map((item, i) => (
                        <React.Fragment key={i}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px', background: `var(--${item.color}-100)`, borderRadius: '12px', border: `2px solid var(--${item.color}-300)`, minWidth: '90px' }}>
                            <div style={{ fontWeight: '600', fontSize: '11px', color: `var(--${item.color}-700)`, textAlign: 'center' }}>{item.step}</div>
                            <div style={{ fontSize: '9px', color: 'var(--gray-500)', textAlign: 'center' }}>{item.desc}</div>
                          </div>
                          {i < 6 && <div style={{ fontSize: '18px', color: 'var(--gray-400)' }}>→</div>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 7.5: Explainable AI Flow */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--emerald-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>★</div>
                  <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--gray-800)' }}>Explainable AI (XAI) Flow</h2>
                </div>
                <div style={{ marginLeft: '48px', padding: '20px', background: 'var(--emerald-50)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                    {[
                      { step: 'Prediction', icon: 'zap', color: 'primary', items: ['Raw model output', 'Probability scores'] },
                      { step: 'SHAP Analysis', icon: 'git-branch', color: 'purple', items: ['Feature contributions', 'Local explanations'] },
                      { step: 'LIME', icon: 'layers', color: 'indigo', items: ['Local interpretable', 'Model-agnostic'] },
                      { step: 'Feature Importance', icon: 'bar-chart-2', color: 'teal', items: ['Global importance', 'Permutation scores'] },
                      { step: 'Counterfactual', icon: 'refresh', color: 'warning', items: ['What-if scenarios', 'Decision boundary'] },
                      { step: 'Natural Language', icon: 'message-square', color: 'success', items: ['Human-readable', 'RAG-generated'] },
                    ].map((item, i) => (
                      <React.Fragment key={i}>
                        <div style={{ flex: 1, padding: '16px', background: `var(--${item.color}-100)`, borderRadius: '12px', border: `2px solid var(--${item.color}-300)`, maxWidth: '140px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Icon name={item.icon} size={16} color={`var(--${item.color}-600)`} />
                            <div style={{ fontWeight: '600', fontSize: '11px', color: `var(--${item.color}-700)` }}>{item.step}</div>
                          </div>
                          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '10px', color: 'var(--gray-600)' }}>
                            {item.items.map((it, j) => <li key={j}>{it}</li>)}
                          </ul>
                        </div>
                        {i < 5 && <div style={{ display: 'flex', alignItems: 'center', fontSize: '18px', color: 'var(--gray-400)' }}>→</div>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 7.6: Responsible AI Framework */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--blue-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>★</div>
                  <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--gray-800)' }}>Responsible AI Framework</h2>
                </div>
                <div style={{ marginLeft: '48px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {/* Ethical AI */}
                  <div style={{ padding: '16px', background: 'var(--rose-50)', borderRadius: '12px', border: '2px solid var(--rose-200)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <Icon name="heart" size={20} color="var(--rose-600)" />
                      <h4 style={{ margin: 0, color: 'var(--rose-700)', fontSize: '14px' }}>Ethical AI</h4>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {['Bias Detection', 'Fairness Metrics', 'Protected Groups', 'Impact Assessment', 'Ethics Review'].map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: 'white', borderRadius: '6px', fontSize: '11px' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--rose-500)' }} />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Secure AI */}
                  <div style={{ padding: '16px', background: 'var(--red-50)', borderRadius: '12px', border: '2px solid var(--red-200)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <Icon name="shield" size={20} color="var(--red-600)" />
                      <h4 style={{ margin: 0, color: 'var(--red-700)', fontSize: '14px' }}>Secure AI</h4>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {['Adversarial Defense', 'Data Encryption', 'Access Control', 'Audit Logging', 'Model Watermark'].map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: 'white', borderRadius: '6px', fontSize: '11px' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--red-500)' }} />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Robust AI */}
                  <div style={{ padding: '16px', background: 'var(--amber-50)', borderRadius: '12px', border: '2px solid var(--amber-200)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <Icon name="check-circle" size={20} color="var(--amber-600)" />
                      <h4 style={{ margin: 0, color: 'var(--amber-700)', fontSize: '14px' }}>Robust AI</h4>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {['Drift Detection', 'Stress Testing', 'Edge Case Handling', 'Fallback Systems', 'Recovery Plans'].map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: 'white', borderRadius: '6px', fontSize: '11px' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--amber-500)' }} />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Responsible AI Lifecycle Flow */}
                <div style={{ marginLeft: '48px', marginTop: '20px', padding: '20px', background: 'var(--blue-50)', borderRadius: '12px' }}>
                  <h4 style={{ margin: '0 0 16px 0', textAlign: 'center', color: 'var(--blue-700)' }}>Responsible AI Lifecycle</h4>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {[
                      { step: 'Design', desc: 'Ethics review' },
                      { step: 'Data', desc: 'Bias audit' },
                      { step: 'Train', desc: 'Fairness constraints' },
                      { step: 'Validate', desc: 'Adversarial test' },
                      { step: 'Deploy', desc: 'Access control' },
                      { step: 'Monitor', desc: 'Drift + bias alerts' },
                      { step: 'Audit', desc: 'Compliance check' },
                    ].map((item, i) => (
                      <React.Fragment key={i}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px', background: 'white', borderRadius: '12px', border: '2px solid var(--blue-200)', minWidth: '85px' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--blue-500)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px', marginBottom: '6px' }}>{i + 1}</div>
                          <div style={{ fontWeight: '600', fontSize: '11px', color: 'var(--blue-700)' }}>{item.step}</div>
                          <div style={{ fontSize: '9px', color: 'var(--gray-500)' }}>{item.desc}</div>
                        </div>
                        {i < 6 && <div style={{ fontSize: '16px', color: 'var(--gray-400)' }}>→</div>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 7.7: Accuracy & Output Evaluation Flow */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--green-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>★</div>
                  <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--gray-800)' }}>Accuracy & Output Evaluation Flow</h2>
                </div>
                <div style={{ marginLeft: '48px', padding: '20px', background: 'var(--green-50)', borderRadius: '12px' }}>
                  {/* Accuracy Measurement Flow */}
                  <h4 style={{ margin: '0 0 16px 0', color: 'var(--green-700)' }}>Accuracy Measurement Pipeline</h4>
                  <div style={{ display: 'flex', alignItems: 'stretch', gap: '8px', marginBottom: '20px' }}>
                    {[
                      { step: 'Holdout Set', metrics: ['20% data', 'Stratified'], color: 'gray' },
                      { step: 'Prediction', metrics: ['Model inference', 'Score output'], color: 'primary' },
                      { step: 'Ground Truth', metrics: ['Label lookup', 'Confirmed outcomes'], color: 'teal' },
                      { step: 'Confusion Matrix', metrics: ['TP, TN, FP, FN', 'Classification'], color: 'purple' },
                      { step: 'Metrics Calc', metrics: ['Accuracy, Precision', 'Recall, F1, AUC'], color: 'indigo' },
                      { step: 'Threshold Opt', metrics: ['ROC analysis', 'PR curve'], color: 'warning' },
                      { step: 'Final Accuracy', metrics: [`${useCase.accuracy > 0 ? useCase.accuracy.toFixed(1) : 99.3}%`, 'Production'], color: 'success' },
                    ].map((item, i) => (
                      <React.Fragment key={i}>
                        <div style={{ flex: 1, padding: '12px', background: `var(--${item.color}-100)`, borderRadius: '10px', border: `2px solid var(--${item.color}-300)` }}>
                          <div style={{ fontWeight: '600', fontSize: '11px', color: `var(--${item.color}-700)`, marginBottom: '6px' }}>{item.step}</div>
                          {item.metrics.map((m, j) => (
                            <div key={j} style={{ fontSize: '9px', color: 'var(--gray-600)' }}>{m}</div>
                          ))}
                        </div>
                        {i < 6 && <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px', color: 'var(--gray-400)' }}>→</div>}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Output Evaluation Criteria */}
                  <h4 style={{ margin: '20px 0 16px 0', color: 'var(--green-700)' }}>Output Evaluation Criteria</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    {[
                      { criteria: 'Accuracy', target: '>95%', actual: `${useCase.accuracy > 0 ? useCase.accuracy.toFixed(1) : 99.3}%`, status: 'pass' },
                      { criteria: 'Precision', target: '>95%', actual: '96.8%', status: 'pass' },
                      { criteria: 'Recall', target: '>90%', actual: '94.2%', status: 'pass' },
                      { criteria: 'F1 Score', target: '>92%', actual: '95.5%', status: 'pass' },
                      { criteria: 'AUC-ROC', target: '>0.95', actual: '0.987', status: 'pass' },
                      { criteria: 'False Positive', target: '<5%', actual: '3.2%', status: 'pass' },
                      { criteria: 'Latency P95', target: '<200ms', actual: '142ms', status: 'pass' },
                      { criteria: 'Throughput', target: '>2M/day', actual: '2.4M/day', status: 'pass' },
                    ].map((item, i) => (
                      <div key={i} style={{ padding: '12px', background: 'white', borderRadius: '8px', border: `2px solid ${item.status === 'pass' ? 'var(--success-300)' : 'var(--danger-300)'}` }}>
                        <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginBottom: '4px' }}>{item.criteria}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span style={{ fontSize: '16px', fontWeight: '700', color: item.status === 'pass' ? 'var(--success-600)' : 'var(--danger-600)' }}>{item.actual}</span>
                          <span style={{ fontSize: '10px', color: 'var(--gray-400)' }}>target: {item.target}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 8: Hyperparameter Tuning & Loss Functions */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--orange-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>8</div>
                  <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--gray-800)' }}>Hyperparameter Tuning & Loss Functions</h2>
                </div>
                <div style={{ marginLeft: '48px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                  {/* Hyperparameters */}
                  <div style={{ padding: '16px', background: 'var(--orange-50)', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--orange-700)' }}>Hyperparameter Configuration</h4>
                    <table style={{ width: '100%', fontSize: '11px' }}>
                      <tbody>
                        {[
                          { param: 'learning_rate', value: '0.05', search: '[0.01, 0.1]' },
                          { param: 'max_depth', value: '8', search: '[4, 12]' },
                          { param: 'n_estimators', value: '500', search: '[100, 1000]' },
                          { param: 'min_child_weight', value: '3', search: '[1, 10]' },
                          { param: 'subsample', value: '0.8', search: '[0.6, 1.0]' },
                          { param: 'colsample_bytree', value: '0.8', search: '[0.6, 1.0]' },
                          { param: 'reg_alpha', value: '0.1', search: '[0, 1.0]' },
                          { param: 'reg_lambda', value: '1.0', search: '[0, 10]' },
                        ].map((item, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--orange-200)' }}>
                            <td style={{ padding: '6px', fontFamily: 'monospace' }}>{item.param}</td>
                            <td style={{ padding: '6px', fontWeight: '600', color: 'var(--orange-700)' }}>{item.value}</td>
                            <td style={{ padding: '6px', color: 'var(--gray-500)' }}>{item.search}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Loss Functions */}
                  <div style={{ padding: '16px', background: 'var(--danger-50)', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--danger-700)' }}>Loss Functions Used</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        { loss: 'Binary Cross-Entropy', use: 'Classification head', formula: '-y·log(p) - (1-y)·log(1-p)' },
                        { loss: 'Focal Loss', use: 'Class imbalance', formula: '-αt(1-pt)γlog(pt)' },
                        { loss: 'Weighted BCE', use: 'Fraud weight=10', formula: 'w1·BCE(fraud) + w0·BCE(normal)' },
                        { loss: 'AUC Loss', use: 'Ranking optimization', formula: 'Pairwise ranking loss' },
                        { loss: 'Reconstruction Loss', use: 'AutoEncoder', formula: 'MSE(input, output)' },
                      ].map((item, i) => (
                        <div key={i} style={{ padding: '8px', background: 'white', borderRadius: '6px', fontSize: '11px' }}>
                          <div style={{ fontWeight: '600', color: 'var(--danger-700)' }}>{item.loss}</div>
                          <div style={{ color: 'var(--gray-500)' }}>{item.use}</div>
                          <div style={{ fontFamily: 'monospace', color: 'var(--gray-600)', marginTop: '4px' }}>{item.formula}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 9: Statistical & Sensitivity Analysis */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--pink-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>9</div>
                  <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--gray-800)' }}>Statistical & Sensitivity Analysis</h2>
                </div>
                <div style={{ marginLeft: '48px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div style={{ padding: '16px', background: 'var(--pink-50)', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--pink-700)', fontSize: '14px' }}>Statistical Tests</h4>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', lineHeight: '1.8' }}>
                      <li>Kolmogorov-Smirnov test</li>
                      <li>Chi-squared test</li>
                      <li>Mann-Whitney U test</li>
                      <li>ANOVA for feature groups</li>
                      <li>Correlation analysis (Pearson, Spearman)</li>
                    </ul>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--indigo-50)', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--indigo-700)', fontSize: '14px' }}>Sensitivity Analysis</h4>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', lineHeight: '1.8' }}>
                      <li>Feature perturbation analysis</li>
                      <li>Threshold sensitivity (±5%)</li>
                      <li>Data drift detection</li>
                      <li>Concept drift monitoring</li>
                      <li>Stress testing scenarios</li>
                    </ul>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--teal-50)', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--teal-700)', fontSize: '14px' }}>Model Validation</h4>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', lineHeight: '1.8' }}>
                      <li>5-fold cross-validation</li>
                      <li>Time-based validation split</li>
                      <li>Out-of-time validation</li>
                      <li>Bootstrap confidence intervals</li>
                      <li>Permutation importance</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 10: Benchmarking & Accuracy */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--success-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>10</div>
                  <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--gray-800)' }}>Benchmarking & Final Accuracy</h2>
                </div>
                <div style={{ marginLeft: '48px' }}>
                  {/* Accuracy Metrics */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '20px' }}>
                    {[
                      { metric: 'Accuracy', value: `${useCase.accuracy > 0 ? useCase.accuracy.toFixed(1) : 99.3}%`, color: 'success' },
                      { metric: 'Precision', value: '96.8%', color: 'primary' },
                      { metric: 'Recall', value: '94.2%', color: 'warning' },
                      { metric: 'F1-Score', value: '95.5%', color: 'purple' },
                      { metric: 'AUC-ROC', value: '0.987', color: 'indigo' },
                    ].map((item, i) => (
                      <div key={i} style={{ padding: '16px', background: `var(--${item.color}-100)`, borderRadius: '12px', textAlign: 'center', border: `2px solid var(--${item.color}-300)` }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: `var(--${item.color}-700)` }}>{item.value}</div>
                        <div style={{ fontSize: '12px', color: `var(--${item.color}-600)` }}>{item.metric}</div>
                      </div>
                    ))}
                  </div>

                  {/* Benchmark Comparison */}
                  <div style={{ padding: '20px', background: 'var(--gray-50)', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 16px 0' }}>Benchmark Comparison</h4>
                    <table style={{ width: '100%', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ background: 'var(--gray-100)' }}>
                          <th style={{ padding: '10px', textAlign: 'left' }}>Approach</th>
                          <th style={{ padding: '10px', textAlign: 'center' }}>Accuracy</th>
                          <th style={{ padding: '10px', textAlign: 'center' }}>Precision</th>
                          <th style={{ padding: '10px', textAlign: 'center' }}>Recall</th>
                          <th style={{ padding: '10px', textAlign: 'center' }}>F1</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { approach: 'Rule-Based (Baseline)', acc: '72.0%', prec: '65.2%', rec: '78.4%', f1: '71.2%' },
                          { approach: 'Logistic Regression', acc: '85.3%', prec: '82.1%', rec: '84.7%', f1: '83.4%' },
                          { approach: 'Single XGBoost', acc: '96.5%', prec: '94.2%', rec: '92.8%', f1: '93.5%' },
                          { approach: 'Ensemble (Avg)', acc: '97.8%', prec: '95.6%', rec: '93.5%', f1: '94.5%' },
                          { approach: 'Our Hybrid Ensemble', acc: `${useCase.accuracy > 0 ? useCase.accuracy.toFixed(1) : 99.3}%`, prec: '96.8%', rec: '94.2%', f1: '95.5%' },
                        ].map((item, i) => (
                          <tr key={i} style={{ background: i === 4 ? 'var(--success-50)' : i % 2 === 0 ? 'white' : 'var(--gray-50)' }}>
                            <td style={{ padding: '10px', fontWeight: i === 4 ? '700' : '500' }}>{item.approach}</td>
                            <td style={{ padding: '10px', textAlign: 'center', fontWeight: i === 4 ? '700' : '400', color: i === 4 ? 'var(--success-600)' : 'inherit' }}>{item.acc}</td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>{item.prec}</td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>{item.rec}</td>
                            <td style={{ padding: '10px', textAlign: 'center' }}>{item.f1}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Section 11: AS-IS vs TO-BE Transformation */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--gray-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>11</div>
                  <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--gray-800)' }}>AS-IS vs TO-BE Transformation</h2>
                </div>
                <div style={{ marginLeft: '48px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '12px', background: 'var(--gray-200)', textAlign: 'left', width: '25%' }}>Dimension</th>
                        <th style={{ padding: '12px', background: 'var(--gray-100)', textAlign: 'left', width: '37.5%' }}>AS-IS (Before AI)</th>
                        <th style={{ padding: '12px', background: 'var(--success-100)', textAlign: 'left', width: '37.5%' }}>TO-BE (With AI)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { dim: 'Processing Method', asis: 'Manual review by analysts', tobe: 'Automated ML scoring in real-time' },
                        { dim: 'Decision Making', asis: 'Rule-based with human judgment', tobe: 'AI-driven with explainable predictions' },
                        { dim: 'Processing Time', asis: '24-48 hours per case', tobe: '150ms per prediction' },
                        { dim: 'Accuracy', asis: '72% (high false positives)', tobe: `${useCase.accuracy > 0 ? useCase.accuracy.toFixed(1) : 99.3}% (ML ensemble)` },
                        { dim: 'Scalability', asis: 'Limited by headcount (50 FTEs)', tobe: 'Unlimited (2.4M predictions/day)' },
                        { dim: 'Cost per Case', asis: '$45 (labor + overhead)', tobe: '$0.12 (compute cost)' },
                        { dim: 'False Positive Rate', asis: '28% (customer friction)', tobe: '3.2% (88% reduction)' },
                        { dim: 'Coverage', asis: '65% of transactions reviewed', tobe: '100% real-time scoring' },
                        { dim: 'Explainability', asis: 'Analyst notes (inconsistent)', tobe: 'SHAP values + natural language' },
                        { dim: 'Monitoring', asis: 'Weekly batch reports', tobe: 'Real-time dashboards + alerts' },
                        { dim: 'Adaptation', asis: 'Quarterly rule updates', tobe: 'Weekly model retraining' },
                        { dim: 'Compliance', asis: 'Manual audit trail', tobe: 'Automated logging + audit reports' },
                      ].map((item, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                          <td style={{ padding: '10px', fontWeight: '600', background: 'var(--gray-50)' }}>{item.dim}</td>
                          <td style={{ padding: '10px', color: 'var(--gray-600)' }}>{item.asis}</td>
                          <td style={{ padding: '10px', color: 'var(--success-700)', fontWeight: '500' }}>{item.tobe}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 12: AI Impact & Business Value */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--teal-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>12</div>
                  <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--gray-800)' }}>AI Impact & Business Value</h2>
                </div>
                <div style={{ marginLeft: '48px' }}>
                  {/* Impact Metrics Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ padding: '20px', background: 'linear-gradient(135deg, var(--success-100), var(--success-50))', borderRadius: '16px', textAlign: 'center', border: '2px solid var(--success-300)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--success-600)', textTransform: 'uppercase', fontWeight: '600' }}>Cost Savings</div>
                      <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--success-700)' }}>$2.8M</div>
                      <div style={{ fontSize: '12px', color: 'var(--success-600)' }}>Annual operational</div>
                    </div>
                    <div style={{ padding: '20px', background: 'linear-gradient(135deg, var(--primary-100), var(--primary-50))', borderRadius: '16px', textAlign: 'center', border: '2px solid var(--primary-300)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--primary-600)', textTransform: 'uppercase', fontWeight: '600' }}>Revenue Protected</div>
                      <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary-700)' }}>$8.5M</div>
                      <div style={{ fontSize: '12px', color: 'var(--primary-600)' }}>Fraud prevention</div>
                    </div>
                    <div style={{ padding: '20px', background: 'linear-gradient(135deg, var(--purple-100), var(--purple-50))', borderRadius: '16px', textAlign: 'center', border: '2px solid var(--purple-300)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--purple-600)', textTransform: 'uppercase', fontWeight: '600' }}>ROI</div>
                      <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--purple-700)' }}>420%</div>
                      <div style={{ fontSize: '12px', color: 'var(--purple-600)' }}>Return on investment</div>
                    </div>
                    <div style={{ padding: '20px', background: 'linear-gradient(135deg, var(--warning-100), var(--warning-50))', borderRadius: '16px', textAlign: 'center', border: '2px solid var(--warning-300)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--warning-600)', textTransform: 'uppercase', fontWeight: '600' }}>Payback</div>
                      <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--warning-700)' }}>8 mo</div>
                      <div style={{ fontSize: '12px', color: 'var(--warning-600)' }}>Time to value</div>
                    </div>
                  </div>

                  {/* Productivity & Efficiency */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
                    <div style={{ padding: '20px', background: 'var(--indigo-50)', borderRadius: '12px' }}>
                      <h4 style={{ margin: '0 0 16px 0', color: 'var(--indigo-700)' }}>Productivity Impact</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                          { metric: 'Manual Review Reduction', value: '85%', impact: '42 FTEs redeployed to high-value tasks' },
                          { metric: 'Processing Speed', value: '99.9%', impact: 'From 48 hours to 150ms' },
                          { metric: 'Case Throughput', value: '48x', impact: 'From 50K to 2.4M cases/day' },
                          { metric: 'Analyst Efficiency', value: '3.5x', impact: 'More cases reviewed per analyst' },
                        ].map((item, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'white', borderRadius: '8px' }}>
                            <div>
                              <div style={{ fontWeight: '500', fontSize: '13px' }}>{item.metric}</div>
                              <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{item.impact}</div>
                            </div>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--indigo-600)' }}>{item.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ padding: '20px', background: 'var(--teal-50)', borderRadius: '12px' }}>
                      <h4 style={{ margin: '0 0 16px 0', color: 'var(--teal-700)' }}>Revenue Impact</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                          { metric: 'Fraud Loss Prevention', value: '$8.5M', impact: 'Annual fraud detected & blocked' },
                          { metric: 'False Decline Recovery', value: '$1.2M', impact: 'Revenue from reduced false positives' },
                          { metric: 'Customer Retention', value: '$2.1M', impact: 'Reduced churn from better experience' },
                          { metric: 'New Business Enabled', value: '$3.4M', impact: 'New products with ML risk mgmt' },
                        ].map((item, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'white', borderRadius: '8px' }}>
                            <div>
                              <div style={{ fontWeight: '500', fontSize: '13px' }}>{item.metric}</div>
                              <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{item.impact}</div>
                            </div>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--teal-600)' }}>{item.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 13: KPIs & Metrics Dashboard */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--blue-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>13</div>
                  <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--gray-800)' }}>Key Performance Indicators (KPIs)</h2>
                </div>
                <div style={{ marginLeft: '48px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ background: 'var(--blue-100)' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>KPI</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Target</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Actual</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Status</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { kpi: 'Model Accuracy', target: '>95%', actual: `${useCase.accuracy > 0 ? useCase.accuracy.toFixed(1) : 99.3}%`, status: 'exceeded', trend: '↑ +2.1% MoM' },
                        { kpi: 'False Positive Rate', target: '<5%', actual: '3.2%', status: 'exceeded', trend: '↓ -1.8% MoM' },
                        { kpi: 'System Uptime', target: '99.9%', actual: '99.97%', status: 'exceeded', trend: '→ Stable' },
                        { kpi: 'P95 Latency', target: '<200ms', actual: '142ms', status: 'exceeded', trend: '↓ -15ms MoM' },
                        { kpi: 'Daily Predictions', target: '2M', actual: '2.4M', status: 'exceeded', trend: '↑ +12% MoM' },
                        { kpi: 'Cost per Prediction', target: '<$0.15', actual: '$0.12', status: 'exceeded', trend: '↓ -8% MoM' },
                        { kpi: 'Analyst Productivity', target: '3x baseline', actual: '3.5x', status: 'exceeded', trend: '↑ +0.3x MoM' },
                        { kpi: 'Customer Satisfaction', target: '>85%', actual: '92%', status: 'exceeded', trend: '↑ +4% MoM' },
                        { kpi: 'Model Drift Alert', target: '<1% drift', actual: '0.3%', status: 'met', trend: '→ Within range' },
                        { kpi: 'Compliance Score', target: '100%', actual: '100%', status: 'met', trend: '→ Maintained' },
                      ].map((item, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? 'white' : 'var(--gray-50)' }}>
                          <td style={{ padding: '10px', fontWeight: '500' }}>{item.kpi}</td>
                          <td style={{ padding: '10px', textAlign: 'center', color: 'var(--gray-600)' }}>{item.target}</td>
                          <td style={{ padding: '10px', textAlign: 'center', fontWeight: '600', color: 'var(--success-600)' }}>{item.actual}</td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            <span className={`status-badge ${item.status === 'exceeded' ? 'success' : 'primary'}`} style={{ fontSize: '10px' }}>{item.status}</span>
                          </td>
                          <td style={{ padding: '10px', fontSize: '11px', color: item.trend.includes('↑') ? 'var(--success-600)' : item.trend.includes('↓') ? 'var(--primary-600)' : 'var(--gray-500)' }}>{item.trend}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 14: AI Maturity Assessment */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--purple-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>14</div>
                  <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--gray-800)' }}>AI Maturity Assessment</h2>
                </div>
                <div style={{ marginLeft: '48px' }}>
                  {/* Maturity Level Indicator */}
                  <div style={{ padding: '20px', background: 'var(--purple-50)', borderRadius: '12px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--purple-700)' }}>Level 4: Optimized</div>
                        <div style={{ fontSize: '13px', color: 'var(--purple-600)' }}>Continuous improvement with feedback loops</div>
                      </div>
                      <div style={{ fontSize: '48px', fontWeight: '700', color: 'var(--purple-600)' }}>4/5</div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {['Initial', 'Developing', 'Defined', 'Optimized', 'Innovating'].map((level, i) => (
                        <div key={i} style={{ flex: 1, height: '8px', borderRadius: '4px', background: i < 4 ? 'var(--purple-500)' : 'var(--gray-200)' }} />
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '10px', color: 'var(--gray-500)' }}>
                      <span>Initial</span><span>Developing</span><span>Defined</span><span>Optimized</span><span>Innovating</span>
                    </div>
                  </div>

                  {/* Maturity Dimensions */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {[
                      { dim: 'Data Management', score: 4.5, desc: 'Centralized data lake, automated quality checks, feature store' },
                      { dim: 'Model Development', score: 4.2, desc: 'MLOps pipeline, automated training, A/B testing framework' },
                      { dim: 'Deployment & Ops', score: 4.0, desc: 'CI/CD, blue-green deployments, auto-scaling' },
                      { dim: 'Monitoring', score: 4.3, desc: 'Real-time dashboards, drift detection, alerting' },
                      { dim: 'Governance', score: 3.8, desc: 'Model registry, audit trails, SR 11-7 compliance' },
                      { dim: 'Business Adoption', score: 4.5, desc: 'High user adoption, integrated workflows, trust' },
                    ].map((item, i) => (
                      <div key={i} style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{ fontWeight: '600', fontSize: '13px' }}>{item.dim}</div>
                          <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--purple-600)' }}>{item.score}</div>
                        </div>
                        <div style={{ height: '6px', background: 'var(--gray-200)', borderRadius: '3px', marginBottom: '8px' }}>
                          <div style={{ height: '100%', width: `${item.score * 20}%`, background: 'var(--purple-500)', borderRadius: '3px' }} />
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--gray-600)' }}>{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 15: Customer Satisfaction & NPS */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--pink-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>15</div>
                  <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--gray-800)' }}>Customer Satisfaction & Experience</h2>
                </div>
                <div style={{ marginLeft: '48px' }}>
                  {/* Satisfaction Metrics */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ padding: '20px', background: 'var(--success-50)', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'var(--success-600)', textTransform: 'uppercase', fontWeight: '600' }}>CSAT Score</div>
                      <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--success-700)' }}>92%</div>
                      <div style={{ fontSize: '12px', color: 'var(--success-600)' }}>+35% vs baseline</div>
                    </div>
                    <div style={{ padding: '20px', background: 'var(--primary-50)', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'var(--primary-600)', textTransform: 'uppercase', fontWeight: '600' }}>NPS</div>
                      <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--primary-700)' }}>+68</div>
                      <div style={{ fontSize: '12px', color: 'var(--primary-600)' }}>+42 pts improvement</div>
                    </div>
                    <div style={{ padding: '20px', background: 'var(--warning-50)', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'var(--warning-600)', textTransform: 'uppercase', fontWeight: '600' }}>Complaints</div>
                      <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--warning-700)' }}>-78%</div>
                      <div style={{ fontSize: '12px', color: 'var(--warning-600)' }}>False decline related</div>
                    </div>
                    <div style={{ padding: '20px', background: 'var(--purple-50)', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'var(--purple-600)', textTransform: 'uppercase', fontWeight: '600' }}>Retention</div>
                      <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--purple-700)' }}>+12%</div>
                      <div style={{ fontSize: '12px', color: 'var(--purple-600)' }}>Customer retention rate</div>
                    </div>
                  </div>

                  {/* Customer Feedback */}
                  <div style={{ padding: '20px', background: 'var(--pink-50)', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 16px 0', color: 'var(--pink-700)' }}>Customer Experience Improvements</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                      {[
                        { metric: 'False Decline Rate', before: '28%', after: '3.2%', impact: 'Fewer legitimate transactions blocked' },
                        { metric: 'Avg Resolution Time', before: '48 hours', after: '< 5 min', impact: 'Faster fraud alerts and resolution' },
                        { metric: 'Customer Call Volume', before: '15K/month', after: '3K/month', impact: '80% reduction in support calls' },
                        { metric: 'Transaction Success Rate', before: '85%', after: '97.8%', impact: 'More transactions approved correctly' },
                      ].map((item, i) => (
                        <div key={i} style={{ padding: '12px', background: 'white', borderRadius: '8px' }}>
                          <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px' }}>{item.metric}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                            <span style={{ color: 'var(--gray-500)', fontSize: '12px' }}>Before: <strong style={{ color: 'var(--danger-600)' }}>{item.before}</strong></span>
                            <span style={{ color: 'var(--gray-400)' }}>→</span>
                            <span style={{ color: 'var(--gray-500)', fontSize: '12px' }}>After: <strong style={{ color: 'var(--success-600)' }}>{item.after}</strong></span>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--gray-600)' }}>{item.impact}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 16: People, Process, Profit, Technology Framework */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--cyan-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>16</div>
                  <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--gray-800)' }}>People, Process, Profit & Technology Framework</h2>
                </div>
                <div style={{ marginLeft: '48px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                    {/* People */}
                    <div style={{ padding: '20px', background: 'linear-gradient(135deg, var(--primary-50), var(--indigo-50))', borderRadius: '16px', border: '2px solid var(--primary-200)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name="users" size={24} />
                        </div>
                        <div>
                          <h4 style={{ margin: 0, color: 'var(--primary-700)' }}>PEOPLE</h4>
                          <div style={{ fontSize: '12px', color: 'var(--primary-600)' }}>Human Capital Impact</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                          { label: 'FTEs Redeployed', value: '42', detail: 'To strategic roles' },
                          { label: 'New Skills Developed', value: '8', detail: 'ML/AI competencies' },
                          { label: 'Training Hours', value: '2,400', detail: 'Total team upskilling' },
                          { label: 'Team Satisfaction', value: '+45%', detail: 'Higher engagement' },
                        ].map((item, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'white', borderRadius: '8px' }}>
                            <div>
                              <div style={{ fontWeight: '500', fontSize: '13px' }}>{item.label}</div>
                              <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{item.detail}</div>
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary-600)' }}>{item.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Process */}
                    <div style={{ padding: '20px', background: 'linear-gradient(135deg, var(--teal-50), var(--cyan-50))', borderRadius: '16px', border: '2px solid var(--teal-200)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--teal-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name="settings" size={24} />
                        </div>
                        <div>
                          <h4 style={{ margin: 0, color: 'var(--teal-700)' }}>PROCESS</h4>
                          <div style={{ fontSize: '12px', color: 'var(--teal-600)' }}>Operational Excellence</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                          { label: 'Processes Automated', value: '18', detail: 'End-to-end automation' },
                          { label: 'Cycle Time Reduction', value: '99.7%', detail: '48h → 150ms' },
                          { label: 'Error Rate Reduction', value: '88%', detail: 'Manual errors eliminated' },
                          { label: 'SLA Compliance', value: '99.97%', detail: 'Exceeds targets' },
                        ].map((item, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'white', borderRadius: '8px' }}>
                            <div>
                              <div style={{ fontWeight: '500', fontSize: '13px' }}>{item.label}</div>
                              <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{item.detail}</div>
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--teal-600)' }}>{item.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Profit */}
                    <div style={{ padding: '20px', background: 'linear-gradient(135deg, var(--success-50), var(--emerald-50))', borderRadius: '16px', border: '2px solid var(--success-200)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--success-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name="trending-up" size={24} />
                        </div>
                        <div>
                          <h4 style={{ margin: 0, color: 'var(--success-700)' }}>PROFIT</h4>
                          <div style={{ fontSize: '12px', color: 'var(--success-600)' }}>Financial Impact</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                          { label: 'Annual Cost Savings', value: '$2.8M', detail: 'Operational efficiency' },
                          { label: 'Revenue Protected', value: '$8.5M', detail: 'Fraud prevention' },
                          { label: 'ROI', value: '420%', detail: '5-year NPV: $12.4M' },
                          { label: 'Payback Period', value: '8 mo', detail: 'Fast time-to-value' },
                        ].map((item, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'white', borderRadius: '8px' }}>
                            <div>
                              <div style={{ fontWeight: '500', fontSize: '13px' }}>{item.label}</div>
                              <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{item.detail}</div>
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--success-600)' }}>{item.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Technology */}
                    <div style={{ padding: '20px', background: 'linear-gradient(135deg, var(--purple-50), var(--violet-50))', borderRadius: '16px', border: '2px solid var(--purple-200)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--purple-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name="cpu" size={24} />
                        </div>
                        <div>
                          <h4 style={{ margin: 0, color: 'var(--purple-700)' }}>TECHNOLOGY</h4>
                          <div style={{ fontSize: '12px', color: 'var(--purple-600)' }}>Technical Capabilities</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                          { label: 'ML Models Deployed', value: '10', detail: 'Ensemble architecture' },
                          { label: 'Tech Stack Components', value: '25+', detail: 'Integrated platform' },
                          { label: 'API Endpoints', value: '48', detail: 'RESTful + GraphQL' },
                          { label: 'Infrastructure Uptime', value: '99.99%', detail: 'High availability' },
                        ].map((item, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'white', borderRadius: '8px' }}>
                            <div>
                              <div style={{ fontWeight: '500', fontSize: '13px' }}>{item.label}</div>
                              <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{item.detail}</div>
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--purple-600)' }}>{item.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 17: Value Realization Summary */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--amber-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>17</div>
                  <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--gray-800)' }}>Total Value Realization</h2>
                </div>
                <div style={{ marginLeft: '48px', padding: '24px', background: 'linear-gradient(135deg, var(--amber-50), var(--orange-50))', borderRadius: '16px', border: '2px solid var(--amber-300)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '20px' }}>
                    {[
                      { label: 'Total Annual Value', value: '$15.2M', color: 'success' },
                      { label: '5-Year NPV', value: '$12.4M', color: 'primary' },
                      { label: 'Implementation Cost', value: '$2.1M', color: 'warning' },
                      { label: 'Ongoing Cost/Year', value: '$0.8M', color: 'orange' },
                      { label: 'Net Benefit/Year', value: '$14.4M', color: 'success' },
                    ].map((item, i) => (
                      <div key={i} style={{ padding: '16px', background: 'white', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: '4px' }}>{item.label}</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: `var(--${item.color}-600)` }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '16px', background: 'white', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--amber-700)' }}>Value Breakdown by Category</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                      {[
                        { category: 'Cost Reduction', value: '$2.8M', pct: '18%' },
                        { category: 'Revenue Protection', value: '$8.5M', pct: '56%' },
                        { category: 'Revenue Growth', value: '$3.4M', pct: '22%' },
                        { category: 'Risk Mitigation', value: '$0.5M', pct: '4%' },
                      ].map((item, i) => (
                        <div key={i} style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '4px' }}>{item.category}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--success-600)' }}>{item.value}</span>
                            <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{item.pct}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Model Architecture */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--purple-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>4</div>
                  <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--gray-800)' }}>Model Architecture & Techniques</h2>
                </div>
                <div style={{ marginLeft: '48px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div style={{ padding: '20px', background: 'var(--purple-50)', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--purple-700)' }}>ML Techniques Used</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '2' }}>
                      <li><strong>Gradient Boosting:</strong> XGBoost, LightGBM for tabular features</li>
                      <li><strong>Deep Learning:</strong> LSTM for sequence patterns</li>
                      <li><strong>Ensemble:</strong> Stacking with meta-learner</li>
                      <li><strong>Anomaly Detection:</strong> Isolation Forest, AutoEncoder</li>
                    </ul>
                  </div>
                  <div style={{ padding: '20px', background: 'var(--indigo-50)', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--indigo-700)' }}>Technology Stack</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '2' }}>
                      <li><strong>Framework:</strong> TensorFlow, Scikit-learn, PyTorch</li>
                      <li><strong>Data:</strong> Apache Spark, Kafka, Airflow</li>
                      <li><strong>MLOps:</strong> MLflow, Kubeflow, SageMaker</li>
                      <li><strong>Monitoring:</strong> Prometheus, Grafana, Datadog</li>
                    </ul>
                  </div>
                  <div style={{ padding: '20px', background: 'var(--teal-50)', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--teal-700)' }}>Feature Engineering</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '2' }}>
                      <li>450+ engineered features from raw data</li>
                      <li>Time-based aggregations (1h, 24h, 7d, 30d)</li>
                      <li>Behavioral pattern embeddings</li>
                      <li>Graph-based relationship features</li>
                    </ul>
                  </div>
                  <div style={{ padding: '20px', background: 'var(--orange-50)', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--orange-700)' }}>Hyperparameter Tuning</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '2' }}>
                      <li><strong>Method:</strong> Bayesian Optimization with Optuna</li>
                      <li><strong>Search Space:</strong> 15 hyperparameters</li>
                      <li><strong>Trials:</strong> 500 optimization runs</li>
                      <li><strong>Validation:</strong> 5-fold cross-validation</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 5: Accuracy & Performance */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--success-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>5</div>
                  <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--gray-800)' }}>Accuracy Metrics & Validation</h2>
                </div>
                <div style={{ marginLeft: '48px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ padding: '20px', background: 'var(--success-100)', borderRadius: '12px', textAlign: 'center', border: '2px solid var(--success-300)' }}>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--success-700)' }}>{useCase.accuracy > 0 ? useCase.accuracy.toFixed(1) : 99.3}%</div>
                      <div style={{ fontSize: '13px', color: 'var(--success-600)' }}>Accuracy</div>
                    </div>
                    <div style={{ padding: '20px', background: 'var(--primary-100)', borderRadius: '12px', textAlign: 'center', border: '2px solid var(--primary-300)' }}>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary-700)' }}>96.8%</div>
                      <div style={{ fontSize: '13px', color: 'var(--primary-600)' }}>Precision</div>
                    </div>
                    <div style={{ padding: '20px', background: 'var(--warning-100)', borderRadius: '12px', textAlign: 'center', border: '2px solid var(--warning-300)' }}>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--warning-700)' }}>94.2%</div>
                      <div style={{ fontSize: '13px', color: 'var(--warning-600)' }}>Recall</div>
                    </div>
                    <div style={{ padding: '20px', background: 'var(--purple-100)', borderRadius: '12px', textAlign: 'center', border: '2px solid var(--purple-300)' }}>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--purple-700)' }}>0.987</div>
                      <div style={{ fontSize: '13px', color: 'var(--purple-600)' }}>AUC-ROC</div>
                    </div>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '12px' }}>
                    <h4 style={{ margin: '0 0 12px 0' }}>Accuracy Improvement Techniques</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      <div style={{ fontSize: '13px' }}>
                        <strong style={{ color: 'var(--primary-600)' }}>Data Augmentation:</strong>
                        <p style={{ margin: '4px 0', color: 'var(--gray-600)' }}>SMOTE for class imbalance, synthetic minority oversampling</p>
                      </div>
                      <div style={{ fontSize: '13px' }}>
                        <strong style={{ color: 'var(--primary-600)' }}>Ensemble Stacking:</strong>
                        <p style={{ margin: '4px 0', color: 'var(--gray-600)' }}>5 base models + neural network meta-learner</p>
                      </div>
                      <div style={{ fontSize: '13px' }}>
                        <strong style={{ color: 'var(--primary-600)' }}>Continuous Learning:</strong>
                        <p style={{ margin: '4px 0', color: 'var(--gray-600)' }}>Weekly retraining with latest labeled data</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 6: Business Impact */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--teal-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>6</div>
                  <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--gray-800)' }}>Business Impact & ROI</h2>
                </div>
                <div style={{ marginLeft: '48px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                  <div style={{ padding: '24px', background: 'linear-gradient(135deg, var(--success-50), var(--teal-50))', borderRadius: '16px', border: '2px solid var(--success-200)' }}>
                    <h4 style={{ margin: '0 0 16px 0', color: 'var(--success-700)' }}>Financial Impact</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px' }}>Annual Cost Savings</span>
                        <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--success-700)' }}>$2.8M</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px' }}>Fraud Prevention Value</span>
                        <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--success-700)' }}>$8.5M</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px' }}>ROI</span>
                        <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--success-700)' }}>420%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px' }}>Payback Period</span>
                        <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--success-700)' }}>8 months</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '24px', background: 'linear-gradient(135deg, var(--primary-50), var(--indigo-50))', borderRadius: '16px', border: '2px solid var(--primary-200)' }}>
                    <h4 style={{ margin: '0 0 16px 0', color: 'var(--primary-700)' }}>Operational Improvements</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px' }}>Manual Review Reduction</span>
                        <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary-700)' }}>85%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px' }}>False Positive Reduction</span>
                        <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary-700)' }}>88%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px' }}>Detection Speed</span>
                        <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary-700)' }}>Real-time</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px' }}>Customer Satisfaction</span>
                        <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary-700)' }}>+35%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 7: Key Takeaways */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--orange-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>7</div>
                  <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--gray-800)' }}>Key Learnings & Best Practices</h2>
                </div>
                <div style={{ marginLeft: '48px', padding: '20px', background: 'var(--orange-50)', borderRadius: '12px', borderLeft: '4px solid var(--orange-500)' }}>
                  <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '2.2' }}>
                    <li><strong>Feature Engineering is Critical:</strong> 60% of accuracy gains came from domain-specific feature engineering</li>
                    <li><strong>Ensemble Methods Outperform:</strong> Stacking 5 diverse models improved accuracy by 3.2%</li>
                    <li><strong>Real-time Requirements:</strong> Optimized inference pipeline to achieve {`<`}200ms P95 latency</li>
                    <li><strong>Explainability Matters:</strong> SHAP integration enabled regulatory compliance and user trust</li>
                    <li><strong>Continuous Monitoring:</strong> Weekly model retraining prevents concept drift degradation</li>
                    <li><strong>Human-in-the-Loop:</strong> Analyst feedback loop improves model accuracy over time</li>
                  </ol>
                </div>
              </div>

              {/* Hashtags */}
              <div style={{ marginTop: '32px', padding: '20px', background: 'var(--blue-50)', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: 'var(--blue-700)', margin: 0 }}>
                  #MachineLearning #AI #Banking #FinTech #DataScience #MLOps #FraudDetection #ArtificialIntelligence #DeepLearning #Python #TensorFlow #XGBoost #BigData #Analytics
                </p>
              </div>
            </div>
          </div>

          {/* Shareable Summary Table */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Quick Reference Summary Table</h3>
              <p className="card-subtitle">Copy-paste ready for documentation</p>
            </div>
            <div className="card-body">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <tbody>
                  {[
                    { category: 'Use Case', value: useCase.name },
                    { category: 'Department', value: department.name },
                    { category: 'Status', value: getStatusLabel(useCase.status) },
                    { category: 'Problem', value: 'Manual fraud detection with high false positives (28%) and 48h response time' },
                    { category: 'Solution', value: 'ML ensemble model with real-time scoring and explainable AI' },
                    { category: 'Data Sources', value: 'Transaction records, customer profiles, device fingerprints, geolocation (10M records/day)' },
                    { category: 'Preprocessing', value: 'Deduplication, PII masking, feature engineering (450+ features), normalization' },
                    { category: 'Model Type', value: 'Ensemble: XGBoost + LightGBM + LSTM with neural network meta-learner' },
                    { category: 'Accuracy', value: `${useCase.accuracy > 0 ? useCase.accuracy.toFixed(1) : 99.3}% (Precision: 96.8%, Recall: 94.2%, AUC: 0.987)` },
                    { category: 'Latency', value: '150ms average, <200ms P95' },
                    { category: 'Volume', value: '2.4M predictions/day' },
                    { category: 'Cost Savings', value: '$2.8M/year operational + $8.5M fraud prevented' },
                    { category: 'ROI', value: '420% with 8-month payback' },
                    { category: 'Key Techniques', value: 'SMOTE, Bayesian optimization, SHAP explainability, continuous learning' },
                    { category: 'Tech Stack', value: 'Python, TensorFlow, XGBoost, Spark, Kafka, MLflow, Kubernetes' },
                  ].map((item, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? 'var(--gray-50)' : 'white' }}>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-200)', fontWeight: '600', width: '180px', color: 'var(--gray-700)' }}>{item.category}</td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-200)', color: 'var(--gray-600)' }}>{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Export Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Export Options</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => handleExport('PDF Document')}>
                  <Icon name="file" size={16} /> Export as PDF
                </button>
                <button className="btn btn-secondary" onClick={() => handleExport('Word Document')}>
                  <Icon name="file-text" size={16} /> Export as Word
                </button>
                <button className="btn btn-secondary" onClick={() => handleExport('PowerPoint')}>
                  <Icon name="monitor" size={16} /> Export as PPT
                </button>
                <button className="btn btn-secondary" onClick={() => handleExport('Markdown')}>
                  <Icon name="code" size={16} /> Export as Markdown
                </button>
                <button className="btn btn-secondary" onClick={() => {
                  navigator.clipboard.writeText(`🚀 ${useCase.name}\n\n${department.name} | Banking ML Pipeline\n\n✅ ${useCase.accuracy > 0 ? useCase.accuracy.toFixed(1) : 99}% Accuracy\n⚡ 150ms Latency\n📊 2.4M Daily Predictions\n💰 $2.8M Annual Savings\n\n#MachineLearning #AI #Banking #FinTech`);
                  setNotification({ type: 'success', message: 'LinkedIn summary copied to clipboard!' });
                  setTimeout(() => setNotification(null), 3000);
                }}>
                  <Icon name="copy" size={16} /> Copy LinkedIn Summary
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Strategy Tab */}
      {activeTab === 'ai-strategy' && (
        <div className="grid grid-cols-1" style={{ gap: '24px' }}>
          {/* Strategy Header */}
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 100%)', color: 'white' }}>
            <div className="card-body" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px', color: 'white' }}>AI Strategy for {useCase.name}</h2>
              <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '24px' }}>
                Comprehensive digital transformation strategy leveraging artificial intelligence to drive business value,
                operational efficiency, and competitive advantage in the banking sector.
              </p>
              <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', fontWeight: '700' }}>5</div>
                  <div style={{ fontSize: '14px', opacity: 0.8 }}>Strategic Pillars</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', fontWeight: '700' }}>12</div>
                  <div style={{ fontSize: '14px', opacity: 0.8 }}>Key Initiatives</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', fontWeight: '700' }}>24</div>
                  <div style={{ fontSize: '14px', opacity: 0.8 }}>Month Timeline</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', fontWeight: '700' }}>$2.8M</div>
                  <div style={{ fontSize: '14px', opacity: 0.8 }}>Expected ROI</div>
                </div>
              </div>
            </div>
          </div>

          {/* Digital Transformation Framework */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Digital Transformation Framework</h3>
            </div>
            <div className="card-body">
              <p style={{ color: 'var(--gray-600)', marginBottom: '24px' }}>
                Our AI strategy is built on a comprehensive digital transformation framework that aligns technology capabilities
                with business objectives while ensuring responsible AI practices.
              </p>

              {/* Framework Diagram */}
              <div style={{ background: 'var(--gray-50)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                  <div style={{ background: 'var(--primary-500)', color: 'white', padding: '16px 24px', borderRadius: '8px', textAlign: 'center', minWidth: '150px' }}>
                    <div style={{ fontWeight: '600' }}>Vision</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>AI-First Banking</div>
                  </div>
                  <div style={{ fontSize: '24px', color: 'var(--gray-400)' }}>→</div>
                  <div style={{ background: 'var(--success-500)', color: 'white', padding: '16px 24px', borderRadius: '8px', textAlign: 'center', minWidth: '150px' }}>
                    <div style={{ fontWeight: '600' }}>Strategy</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>Data-Driven Decisions</div>
                  </div>
                  <div style={{ fontSize: '24px', color: 'var(--gray-400)' }}>→</div>
                  <div style={{ background: 'var(--warning-500)', color: 'white', padding: '16px 24px', borderRadius: '8px', textAlign: 'center', minWidth: '150px' }}>
                    <div style={{ fontWeight: '600' }}>Execution</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>Agile Implementation</div>
                  </div>
                  <div style={{ fontSize: '24px', color: 'var(--gray-400)' }}>→</div>
                  <div style={{ background: 'var(--danger-500)', color: 'white', padding: '16px 24px', borderRadius: '8px', textAlign: 'center', minWidth: '150px' }}>
                    <div style={{ fontWeight: '600' }}>Value</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>Measurable ROI</div>
                  </div>
                </div>
              </div>

              {/* Key Takeaways */}
              <div style={{ background: 'var(--primary-50)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--primary-500)' }}>
                <h4 style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--primary-700)' }}>Key Takeaways</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--gray-700)' }}>
                  <li>Align AI initiatives with core business strategy</li>
                  <li>Build scalable data infrastructure</li>
                  <li>Ensure regulatory compliance at every step</li>
                  <li>Measure success through clear KPIs</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Strategic Pillars */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Five Strategic Pillars</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div style={{ background: 'linear-gradient(135deg, var(--primary-50), var(--primary-100))', padding: '20px', borderRadius: '12px', border: '1px solid var(--primary-200)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ background: 'var(--primary-500)', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>1</div>
                    <h4 style={{ margin: 0, color: 'var(--primary-700)' }}>Data Foundation</h4>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--gray-600)', margin: 0 }}>
                    Establish robust data infrastructure with quality governance, real-time pipelines, and unified data lakes for AI-ready data assets.
                  </p>
                </div>
                <div style={{ background: 'linear-gradient(135deg, var(--success-50), var(--success-100))', padding: '20px', borderRadius: '12px', border: '1px solid var(--success-200)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ background: 'var(--success-500)', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>2</div>
                    <h4 style={{ margin: 0, color: 'var(--success-700)' }}>AI/ML Excellence</h4>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--gray-600)', margin: 0 }}>
                    Deploy state-of-the-art ML models with MLOps practices, automated retraining, and continuous model monitoring.
                  </p>
                </div>
                <div style={{ background: 'linear-gradient(135deg, var(--warning-50), var(--warning-100))', padding: '20px', borderRadius: '12px', border: '1px solid var(--warning-200)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ background: 'var(--warning-500)', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>3</div>
                    <h4 style={{ margin: 0, color: 'var(--warning-700)' }}>Process Automation</h4>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--gray-600)', margin: 0 }}>
                    Automate end-to-end workflows with intelligent process automation, reducing manual intervention and errors.
                  </p>
                </div>
                <div style={{ background: 'linear-gradient(135deg, var(--danger-50), var(--danger-100))', padding: '20px', borderRadius: '12px', border: '1px solid var(--danger-200)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ background: 'var(--danger-500)', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>4</div>
                    <h4 style={{ margin: 0, color: 'var(--danger-700)' }}>Customer Experience</h4>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--gray-600)', margin: 0 }}>
                    Enhance customer journeys with personalized AI-driven interactions, predictive insights, and proactive support.
                  </p>
                </div>
                <div style={{ background: 'linear-gradient(135deg, var(--purple-50), var(--purple-100))', padding: '20px', borderRadius: '12px', border: '1px solid var(--purple-200)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ background: 'var(--purple-500)', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>5</div>
                    <h4 style={{ margin: 0, color: 'var(--purple-700)' }}>Risk & Compliance</h4>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--gray-600)', margin: 0 }}>
                    Implement AI-powered risk management and regulatory compliance with explainable, auditable AI systems.
                  </p>
                </div>
              </div>

              {/* Strategic Pillars Chart */}
              <div style={{ height: '300px', marginBottom: '24px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { pillar: 'Data Foundation', maturity: 85, target: 95, investment: 25 },
                    { pillar: 'AI/ML Excellence', maturity: 78, target: 90, investment: 30 },
                    { pillar: 'Process Automation', maturity: 72, target: 88, investment: 20 },
                    { pillar: 'Customer Experience', maturity: 68, target: 85, investment: 15 },
                    { pillar: 'Risk & Compliance', maturity: 82, target: 92, investment: 10 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="pillar" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="maturity" fill="var(--primary-500)" name="Current Maturity %" />
                    <Bar dataKey="target" fill="var(--success-500)" name="Target Maturity %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: 'var(--success-50)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--success-500)' }}>
                <h4 style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--success-700)' }}>Graph Explanation</h4>
                <p style={{ margin: 0, color: 'var(--gray-700)', fontSize: '14px' }}>
                  The chart shows current maturity levels vs. target maturity for each strategic pillar. Data Foundation leads at 85%,
                  while Customer Experience has the most room for growth. Investment is prioritized in AI/ML Excellence (30%) to accelerate digital transformation.
                </p>
              </div>
            </div>
          </div>

          {/* AI Strategy Features */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">AI Strategy Features</h3>
            </div>
            <div className="card-body">
              <div className="table-container" style={{ marginBottom: '24px' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Feature Category</th>
                      <th>Feature Name</th>
                      <th>Description</th>
                      <th>Business Impact</th>
                      <th>Priority</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', padding: '4px 8px', borderRadius: '4px' }}>Intelligent Analytics</span></td>
                      <td>Predictive Insights Engine</td>
                      <td>Real-time predictive analytics for business forecasting</td>
                      <td>+35% forecast accuracy</td>
                      <td><span style={{ color: 'var(--danger-600)', fontWeight: '600' }}>High</span></td>
                      <td><span className="status-badge success"><span className="status-dot" />Active</span></td>
                    </tr>
                    <tr>
                      <td><span style={{ background: 'var(--success-100)', color: 'var(--success-700)', padding: '4px 8px', borderRadius: '4px' }}>Process Automation</span></td>
                      <td>Intelligent Document Processing</td>
                      <td>AI-powered document extraction and validation</td>
                      <td>80% processing time reduction</td>
                      <td><span style={{ color: 'var(--danger-600)', fontWeight: '600' }}>High</span></td>
                      <td><span className="status-badge success"><span className="status-dot" />Active</span></td>
                    </tr>
                    <tr>
                      <td><span style={{ background: 'var(--warning-100)', color: 'var(--warning-700)', padding: '4px 8px', borderRadius: '4px' }}>Risk Management</span></td>
                      <td>Fraud Detection System</td>
                      <td>Real-time fraud detection with ensemble ML models</td>
                      <td>99.2% detection rate</td>
                      <td><span style={{ color: 'var(--danger-600)', fontWeight: '600' }}>High</span></td>
                      <td><span className="status-badge success"><span className="status-dot" />Active</span></td>
                    </tr>
                    <tr>
                      <td><span style={{ background: 'var(--danger-100)', color: 'var(--danger-700)', padding: '4px 8px', borderRadius: '4px' }}>Customer Experience</span></td>
                      <td>Personalization Engine</td>
                      <td>AI-driven personalized product recommendations</td>
                      <td>+45% conversion rate</td>
                      <td><span style={{ color: 'var(--warning-600)', fontWeight: '600' }}>Medium</span></td>
                      <td><span className="status-badge warning"><span className="status-dot" />In Progress</span></td>
                    </tr>
                    <tr>
                      <td><span style={{ background: 'var(--purple-100)', color: 'var(--purple-700)', padding: '4px 8px', borderRadius: '4px' }}>Conversational AI</span></td>
                      <td>Virtual Banking Assistant</td>
                      <td>NLP-powered chatbot with RAG capabilities</td>
                      <td>60% call deflection</td>
                      <td><span style={{ color: 'var(--warning-600)', fontWeight: '600' }}>Medium</span></td>
                      <td><span className="status-badge warning"><span className="status-dot" />In Progress</span></td>
                    </tr>
                    <tr>
                      <td><span style={{ background: 'var(--teal-100)', color: 'var(--teal-700)', padding: '4px 8px', borderRadius: '4px' }}>Compliance AI</span></td>
                      <td>Regulatory Monitoring</td>
                      <td>Automated compliance checking and reporting</td>
                      <td>90% compliance automation</td>
                      <td><span style={{ color: 'var(--warning-600)', fontWeight: '600' }}>Medium</span></td>
                      <td><span className="status-badge success"><span className="status-dot" />Active</span></td>
                    </tr>
                    <tr>
                      <td><span style={{ background: 'var(--indigo-100)', color: 'var(--indigo-700)', padding: '4px 8px', borderRadius: '4px' }}>Decision Intelligence</span></td>
                      <td>Credit Decisioning</td>
                      <td>ML-based credit scoring and approval</td>
                      <td>40% faster decisions</td>
                      <td><span style={{ color: 'var(--danger-600)', fontWeight: '600' }}>High</span></td>
                      <td><span className="status-badge success"><span className="status-dot" />Active</span></td>
                    </tr>
                    <tr>
                      <td><span style={{ background: 'var(--pink-100)', color: 'var(--pink-700)', padding: '4px 8px', borderRadius: '4px' }}>Operational AI</span></td>
                      <td>Predictive Maintenance</td>
                      <td>AI-driven infrastructure monitoring and alerts</td>
                      <td>50% downtime reduction</td>
                      <td><span style={{ color: 'var(--success-600)', fontWeight: '600' }}>Low</span></td>
                      <td><span className="status-badge info"><span className="status-dot" />Planned</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ background: 'var(--warning-50)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--warning-500)', marginBottom: '24px' }}>
                <h4 style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--warning-700)' }}>Table Explanation</h4>
                <p style={{ margin: 0, color: 'var(--gray-700)', fontSize: '14px' }}>
                  This table outlines the key AI features across different capability areas. High priority features directly impact revenue and risk management,
                  while medium priority features enhance customer experience and operational efficiency. Each feature is tracked with measurable business impact metrics.
                </p>
              </div>

              {/* Feature Distribution Chart */}
              <div style={{ height: '300px', marginBottom: '24px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={[
                    { category: 'Intelligent Analytics', features: 4, impact: 85, adoption: 78 },
                    { category: 'Process Automation', features: 6, impact: 92, adoption: 82 },
                    { category: 'Risk Management', features: 5, impact: 95, adoption: 88 },
                    { category: 'Customer Experience', features: 4, impact: 78, adoption: 65 },
                    { category: 'Conversational AI', features: 3, impact: 72, adoption: 58 },
                    { category: 'Compliance AI', features: 4, impact: 88, adoption: 75 },
                    { category: 'Decision Intelligence', features: 3, impact: 90, adoption: 85 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={80} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="impact" fill="var(--primary-500)" name="Business Impact %" />
                    <Line yAxisId="right" type="monotone" dataKey="adoption" stroke="var(--success-500)" strokeWidth={3} name="Adoption Rate %" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: 'var(--primary-50)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--primary-500)' }}>
                <h4 style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--primary-700)' }}>Key Takeaways</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--gray-700)' }}>
                  <li>Risk Management features show highest impact (95%) and adoption (88%)</li>
                  <li>Process Automation delivers significant ROI with 92% business impact</li>
                  <li>Conversational AI has growth potential with current 58% adoption</li>
                  <li>Focus investment on high-impact, lower-adoption areas for maximum value</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Implementation Guidelines */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Implementation Guidelines</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div style={{ background: 'var(--gray-50)', padding: '20px', borderRadius: '12px' }}>
                  <h4 style={{ color: 'var(--primary-700)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: 'var(--primary-500)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>1</span>
                    Assessment Phase
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--gray-600)', fontSize: '14px' }}>
                    <li>Conduct AI readiness assessment</li>
                    <li>Evaluate existing data infrastructure</li>
                    <li>Identify quick wins and strategic initiatives</li>
                    <li>Define success metrics and KPIs</li>
                    <li>Assess talent and capability gaps</li>
                  </ul>
                </div>
                <div style={{ background: 'var(--gray-50)', padding: '20px', borderRadius: '12px' }}>
                  <h4 style={{ color: 'var(--success-700)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: 'var(--success-500)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>2</span>
                    Foundation Phase
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--gray-600)', fontSize: '14px' }}>
                    <li>Build cloud-native data platform</li>
                    <li>Implement data governance framework</li>
                    <li>Establish MLOps infrastructure</li>
                    <li>Create AI Center of Excellence</li>
                    <li>Develop AI ethics guidelines</li>
                  </ul>
                </div>
                <div style={{ background: 'var(--gray-50)', padding: '20px', borderRadius: '12px' }}>
                  <h4 style={{ color: 'var(--warning-700)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: 'var(--warning-500)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>3</span>
                    Pilot Phase
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--gray-600)', fontSize: '14px' }}>
                    <li>Launch 2-3 high-impact pilots</li>
                    <li>Validate business value hypotheses</li>
                    <li>Iterate based on feedback</li>
                    <li>Document lessons learned</li>
                    <li>Build internal AI champions</li>
                  </ul>
                </div>
                <div style={{ background: 'var(--gray-50)', padding: '20px', borderRadius: '12px' }}>
                  <h4 style={{ color: 'var(--danger-700)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: 'var(--danger-500)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>4</span>
                    Scale Phase
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--gray-600)', fontSize: '14px' }}>
                    <li>Expand successful pilots enterprise-wide</li>
                    <li>Industrialize AI development</li>
                    <li>Automate model deployment</li>
                    <li>Enable self-service analytics</li>
                    <li>Continuous improvement cycle</li>
                  </ul>
                </div>
              </div>

              {/* Timeline Chart */}
              <div style={{ height: '250px', marginBottom: '24px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { month: 'M1', assessment: 100, foundation: 20, pilot: 0, scale: 0 },
                    { month: 'M3', assessment: 80, foundation: 60, pilot: 10, scale: 0 },
                    { month: 'M6', assessment: 40, foundation: 100, pilot: 40, scale: 5 },
                    { month: 'M9', assessment: 20, foundation: 80, pilot: 80, scale: 20 },
                    { month: 'M12', assessment: 10, foundation: 60, pilot: 100, scale: 40 },
                    { month: 'M18', assessment: 5, foundation: 40, pilot: 80, scale: 70 },
                    { month: 'M24', assessment: 5, foundation: 30, pilot: 60, scale: 100 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="assessment" stackId="1" stroke="var(--primary-500)" fill="var(--primary-200)" name="Assessment" />
                    <Area type="monotone" dataKey="foundation" stackId="1" stroke="var(--success-500)" fill="var(--success-200)" name="Foundation" />
                    <Area type="monotone" dataKey="pilot" stackId="1" stroke="var(--warning-500)" fill="var(--warning-200)" name="Pilot" />
                    <Area type="monotone" dataKey="scale" stackId="1" stroke="var(--danger-500)" fill="var(--danger-200)" name="Scale" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: 'var(--teal-50)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--teal-500)' }}>
                <h4 style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--teal-700)' }}>Key Takeaways</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--gray-700)' }}>
                  <li>Assessment peaks early (M1-M3) to establish baseline</li>
                  <li>Foundation work continues throughout but peaks at M6</li>
                  <li>Pilot programs ramp up after foundation is solid (M6-M12)</li>
                  <li>Scale phase accelerates after M12 with proven pilots</li>
                </ul>
              </div>
            </div>
          </div>

          {/* AI Strategy Approach */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Strategic Approach</h3>
            </div>
            <div className="card-body">
              <p style={{ color: 'var(--gray-600)', marginBottom: '24px' }}>
                Our AI strategy follows a systematic approach combining technology excellence with business alignment
                to ensure sustainable competitive advantage.
              </p>

              {/* Approach Flowchart */}
              <div style={{ background: 'var(--gray-50)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                <h4 style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--gray-700)' }}>AI Strategy Execution Flow</h4>

                {/* Row 1: Business Drivers */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <div style={{ background: 'var(--primary-100)', border: '2px solid var(--primary-300)', padding: '12px 16px', borderRadius: '8px', minWidth: '120px', textAlign: 'center' }}>
                    <div style={{ fontWeight: '600', color: 'var(--primary-700)', fontSize: '14px' }}>Revenue Growth</div>
                  </div>
                  <div style={{ background: 'var(--primary-100)', border: '2px solid var(--primary-300)', padding: '12px 16px', borderRadius: '8px', minWidth: '120px', textAlign: 'center' }}>
                    <div style={{ fontWeight: '600', color: 'var(--primary-700)', fontSize: '14px' }}>Cost Reduction</div>
                  </div>
                  <div style={{ background: 'var(--primary-100)', border: '2px solid var(--primary-300)', padding: '12px 16px', borderRadius: '8px', minWidth: '120px', textAlign: 'center' }}>
                    <div style={{ fontWeight: '600', color: 'var(--primary-700)', fontSize: '14px' }}>Risk Mitigation</div>
                  </div>
                  <div style={{ background: 'var(--primary-100)', border: '2px solid var(--primary-300)', padding: '12px 16px', borderRadius: '8px', minWidth: '120px', textAlign: 'center' }}>
                    <div style={{ fontWeight: '600', color: 'var(--primary-700)', fontSize: '14px' }}>Customer Value</div>
                  </div>
                </div>

                <div style={{ textAlign: 'center', fontSize: '24px', color: 'var(--gray-400)', marginBottom: '16px' }}>↓</div>

                {/* Row 2: AI Capabilities */}
                <div style={{ background: 'var(--success-100)', border: '2px solid var(--success-300)', padding: '16px', borderRadius: '12px', marginBottom: '16px', textAlign: 'center' }}>
                  <div style={{ fontWeight: '600', color: 'var(--success-700)', marginBottom: '8px' }}>AI Capability Layer</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ background: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '13px' }}>ML Models</span>
                    <span style={{ background: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '13px' }}>NLP/RAG</span>
                    <span style={{ background: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '13px' }}>Computer Vision</span>
                    <span style={{ background: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '13px' }}>Gen AI</span>
                    <span style={{ background: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '13px' }}>Predictive</span>
                  </div>
                </div>

                <div style={{ textAlign: 'center', fontSize: '24px', color: 'var(--gray-400)', marginBottom: '16px' }}>↓</div>

                {/* Row 3: Platform */}
                <div style={{ background: 'var(--warning-100)', border: '2px solid var(--warning-300)', padding: '16px', borderRadius: '12px', marginBottom: '16px', textAlign: 'center' }}>
                  <div style={{ fontWeight: '600', color: 'var(--warning-700)', marginBottom: '8px' }}>AI Platform Infrastructure</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ background: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '13px' }}>Data Lake</span>
                    <span style={{ background: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '13px' }}>Feature Store</span>
                    <span style={{ background: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '13px' }}>MLOps</span>
                    <span style={{ background: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '13px' }}>Model Registry</span>
                    <span style={{ background: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '13px' }}>Monitoring</span>
                  </div>
                </div>

                <div style={{ textAlign: 'center', fontSize: '24px', color: 'var(--gray-400)', marginBottom: '16px' }}>↓</div>

                {/* Row 4: Governance */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <div style={{ background: 'var(--danger-100)', border: '2px solid var(--danger-300)', padding: '12px 16px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontWeight: '600', color: 'var(--danger-700)', fontSize: '14px' }}>Responsible AI</div>
                  </div>
                  <div style={{ background: 'var(--purple-100)', border: '2px solid var(--purple-300)', padding: '12px 16px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontWeight: '600', color: 'var(--purple-700)', fontSize: '14px' }}>Data Governance</div>
                  </div>
                  <div style={{ background: 'var(--teal-100)', border: '2px solid var(--teal-300)', padding: '12px 16px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontWeight: '600', color: 'var(--teal-700)', fontSize: '14px' }}>Model Governance</div>
                  </div>
                  <div style={{ background: 'var(--indigo-100)', border: '2px solid var(--indigo-300)', padding: '12px 16px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontWeight: '600', color: 'var(--indigo-700)', fontSize: '14px' }}>Compliance</div>
                  </div>
                </div>
              </div>

              {/* Approach Table */}
              <div className="table-container" style={{ marginBottom: '24px' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Approach Element</th>
                      <th>Description</th>
                      <th>Key Activities</th>
                      <th>Success Metrics</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Design Thinking</strong></td>
                      <td>Human-centered approach to AI solution design</td>
                      <td>User research, journey mapping, prototyping</td>
                      <td>User satisfaction &gt; 4.5/5</td>
                    </tr>
                    <tr>
                      <td><strong>Agile Delivery</strong></td>
                      <td>Iterative development with rapid feedback loops</td>
                      <td>Sprint cycles, daily standups, retrospectives</td>
                      <td>2-week delivery cycles</td>
                    </tr>
                    <tr>
                      <td><strong>DevOps/MLOps</strong></td>
                      <td>Automated CI/CD for models and applications</td>
                      <td>Pipeline automation, testing, monitoring</td>
                      <td>4 deployments/week</td>
                    </tr>
                    <tr>
                      <td><strong>Data-First</strong></td>
                      <td>Prioritize data quality and accessibility</td>
                      <td>Data profiling, cleansing, cataloging</td>
                      <td>&gt; 95% data quality score</td>
                    </tr>
                    <tr>
                      <td><strong>Value-Driven</strong></td>
                      <td>Focus on measurable business outcomes</td>
                      <td>ROI tracking, benefit realization</td>
                      <td>3x ROI within 18 months</td>
                    </tr>
                    <tr>
                      <td><strong>Risk-Aware</strong></td>
                      <td>Proactive risk management in AI deployment</td>
                      <td>Risk assessment, bias testing, auditing</td>
                      <td>Zero critical incidents</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ background: 'var(--purple-50)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--purple-500)' }}>
                <h4 style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--purple-700)' }}>Key Takeaways</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--gray-700)' }}>
                  <li>Combine human-centered design with technical excellence</li>
                  <li>Maintain agility while ensuring governance and compliance</li>
                  <li>Every initiative must demonstrate measurable business value</li>
                  <li>Risk management is embedded, not an afterthought</li>
                </ul>
              </div>
            </div>
          </div>

          {/* AI Maturity Model */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">AI Maturity Assessment</h3>
            </div>
            <div className="card-body">
              <div className="table-container" style={{ marginBottom: '24px' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Dimension</th>
                      <th>Level 1: Initial</th>
                      <th>Level 2: Developing</th>
                      <th>Level 3: Defined</th>
                      <th>Level 4: Managed</th>
                      <th>Level 5: Optimizing</th>
                      <th>Current</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Data</strong></td>
                      <td>Siloed</td>
                      <td>Integrated</td>
                      <td>Governed</td>
                      <td>Real-time</td>
                      <td>Self-service</td>
                      <td><span style={{ background: 'var(--success-100)', color: 'var(--success-700)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>Level 4</span></td>
                    </tr>
                    <tr>
                      <td><strong>Analytics</strong></td>
                      <td>Descriptive</td>
                      <td>Diagnostic</td>
                      <td>Predictive</td>
                      <td>Prescriptive</td>
                      <td>Autonomous</td>
                      <td><span style={{ background: 'var(--success-100)', color: 'var(--success-700)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>Level 4</span></td>
                    </tr>
                    <tr>
                      <td><strong>Technology</strong></td>
                      <td>Legacy</td>
                      <td>Hybrid</td>
                      <td>Cloud</td>
                      <td>Cloud-native</td>
                      <td>AI-native</td>
                      <td><span style={{ background: 'var(--warning-100)', color: 'var(--warning-700)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>Level 3</span></td>
                    </tr>
                    <tr>
                      <td><strong>Process</strong></td>
                      <td>Manual</td>
                      <td>Semi-auto</td>
                      <td>Automated</td>
                      <td>Intelligent</td>
                      <td>Autonomous</td>
                      <td><span style={{ background: 'var(--success-100)', color: 'var(--success-700)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>Level 4</span></td>
                    </tr>
                    <tr>
                      <td><strong>People</strong></td>
                      <td>Awareness</td>
                      <td>Training</td>
                      <td>Proficiency</td>
                      <td>Expert</td>
                      <td>Innovation</td>
                      <td><span style={{ background: 'var(--warning-100)', color: 'var(--warning-700)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>Level 3</span></td>
                    </tr>
                    <tr>
                      <td><strong>Governance</strong></td>
                      <td>Ad-hoc</td>
                      <td>Reactive</td>
                      <td>Proactive</td>
                      <td>Embedded</td>
                      <td>Adaptive</td>
                      <td><span style={{ background: 'var(--success-100)', color: 'var(--success-700)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>Level 4</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Maturity Chart */}
              <div style={{ height: '300px', marginBottom: '24px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={[
                    { dimension: 'Data', current: 4, target: 5, gap: 1 },
                    { dimension: 'Analytics', current: 4, target: 5, gap: 1 },
                    { dimension: 'Technology', current: 3, target: 5, gap: 2 },
                    { dimension: 'Process', current: 4, target: 5, gap: 1 },
                    { dimension: 'People', current: 3, target: 4, gap: 1 },
                    { dimension: 'Governance', current: 4, target: 5, gap: 1 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dimension" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Bar dataKey="current" fill="var(--primary-500)" name="Current Level" />
                    <Bar dataKey="target" fill="var(--success-300)" name="Target Level" />
                    <Line type="monotone" dataKey="gap" stroke="var(--danger-500)" strokeWidth={2} name="Gap" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'var(--success-50)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--success-600)' }}>3.7</div>
                  <div style={{ color: 'var(--gray-600)', fontSize: '14px' }}>Average Maturity Level</div>
                </div>
                <div style={{ background: 'var(--primary-50)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primary-600)' }}>4.8</div>
                  <div style={{ color: 'var(--gray-600)', fontSize: '14px' }}>Target Maturity Level</div>
                </div>
                <div style={{ background: 'var(--warning-50)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--warning-600)' }}>1.1</div>
                  <div style={{ color: 'var(--gray-600)', fontSize: '14px' }}>Average Gap to Close</div>
                </div>
              </div>

              <div style={{ background: 'var(--indigo-50)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--indigo-500)' }}>
                <h4 style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--indigo-700)' }}>Key Takeaways</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--gray-700)' }}>
                  <li>Data, Analytics, Process, and Governance at Level 4 (Managed)</li>
                  <li>Technology and People need focused investment to reach Level 4+</li>
                  <li>Technology gap (2 levels) is highest priority for investment</li>
                  <li>Target: Achieve Level 5 in core dimensions within 24 months</li>
                </ul>
              </div>
            </div>
          </div>

          {/* ROI and Value Projection */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">ROI & Value Projection</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'linear-gradient(135deg, var(--success-500), var(--success-600))', color: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700' }}>$2.8M</div>
                  <div style={{ opacity: 0.9 }}>Annual Savings</div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))', color: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700' }}>$4.2M</div>
                  <div style={{ opacity: 0.9 }}>Revenue Impact</div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, var(--warning-500), var(--warning-600))', color: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700' }}>340%</div>
                  <div style={{ opacity: 0.9 }}>3-Year ROI</div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, var(--danger-500), var(--danger-600))', color: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700' }}>14mo</div>
                  <div style={{ opacity: 0.9 }}>Payback Period</div>
                </div>
              </div>

              {/* Value Projection Table */}
              <div className="table-container" style={{ marginBottom: '24px' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Value Category</th>
                      <th>Year 1</th>
                      <th>Year 2</th>
                      <th>Year 3</th>
                      <th>3-Year Total</th>
                      <th>Value Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Labor Savings</strong></td>
                      <td>$450K</td>
                      <td>$720K</td>
                      <td>$890K</td>
                      <td>$2.06M</td>
                      <td><span style={{ background: 'var(--success-100)', color: 'var(--success-700)', padding: '2px 8px', borderRadius: '4px' }}>Hard</span></td>
                    </tr>
                    <tr>
                      <td><strong>Error Reduction</strong></td>
                      <td>$280K</td>
                      <td>$350K</td>
                      <td>$420K</td>
                      <td>$1.05M</td>
                      <td><span style={{ background: 'var(--success-100)', color: 'var(--success-700)', padding: '2px 8px', borderRadius: '4px' }}>Hard</span></td>
                    </tr>
                    <tr>
                      <td><strong>Fraud Prevention</strong></td>
                      <td>$1.2M</td>
                      <td>$1.5M</td>
                      <td>$1.8M</td>
                      <td>$4.5M</td>
                      <td><span style={{ background: 'var(--success-100)', color: 'var(--success-700)', padding: '2px 8px', borderRadius: '4px' }}>Hard</span></td>
                    </tr>
                    <tr>
                      <td><strong>Revenue Uplift</strong></td>
                      <td>$800K</td>
                      <td>$1.4M</td>
                      <td>$2.0M</td>
                      <td>$4.2M</td>
                      <td><span style={{ background: 'var(--warning-100)', color: 'var(--warning-700)', padding: '2px 8px', borderRadius: '4px' }}>Soft</span></td>
                    </tr>
                    <tr>
                      <td><strong>Customer Retention</strong></td>
                      <td>$350K</td>
                      <td>$520K</td>
                      <td>$680K</td>
                      <td>$1.55M</td>
                      <td><span style={{ background: 'var(--warning-100)', color: 'var(--warning-700)', padding: '2px 8px', borderRadius: '4px' }}>Soft</span></td>
                    </tr>
                    <tr>
                      <td><strong>Compliance Savings</strong></td>
                      <td>$180K</td>
                      <td>$240K</td>
                      <td>$310K</td>
                      <td>$730K</td>
                      <td><span style={{ background: 'var(--success-100)', color: 'var(--success-700)', padding: '2px 8px', borderRadius: '4px' }}>Hard</span></td>
                    </tr>
                    <tr style={{ background: 'var(--gray-50)', fontWeight: '600' }}>
                      <td><strong>TOTAL VALUE</strong></td>
                      <td>$3.26M</td>
                      <td>$4.73M</td>
                      <td>$6.10M</td>
                      <td>$14.09M</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ROI Trend Chart */}
              <div style={{ height: '300px', marginBottom: '24px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { quarter: 'Q1', investment: 800, value: 200, cumROI: -75 },
                    { quarter: 'Q2', investment: 600, value: 450, cumROI: -48 },
                    { quarter: 'Q3', investment: 400, value: 680, cumROI: -26 },
                    { quarter: 'Q4', investment: 300, value: 930, cumROI: -5 },
                    { quarter: 'Q5', investment: 250, value: 1100, cumROI: 18 },
                    { quarter: 'Q6', investment: 200, value: 1280, cumROI: 45 },
                    { quarter: 'Q7', investment: 180, value: 1450, cumROI: 78 },
                    { quarter: 'Q8', investment: 160, value: 1620, cumROI: 115 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quarter" />
                    <YAxis yAxisId="left" label={{ value: 'Amount ($K)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'ROI %', angle: 90, position: 'insideRight' }} />
                    <Tooltip />
                    <Area yAxisId="left" type="monotone" dataKey="investment" stroke="var(--danger-500)" fill="var(--danger-100)" name="Investment ($K)" />
                    <Area yAxisId="left" type="monotone" dataKey="value" stroke="var(--success-500)" fill="var(--success-100)" name="Value Generated ($K)" />
                    <Line yAxisId="right" type="monotone" dataKey="cumROI" stroke="var(--primary-500)" strokeWidth={3} name="Cumulative ROI %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: 'var(--cyan-50)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--cyan-500)' }}>
                <h4 style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--cyan-700)' }}>Key Takeaways</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--gray-700)' }}>
                  <li>Break-even expected in Q4-Q5 (month 12-15)</li>
                  <li>Fraud prevention delivers highest hard value ($4.5M over 3 years)</li>
                  <li>Investment front-loaded, value accelerates over time</li>
                  <li>340% ROI projected by end of Year 3</li>
                </ul>
              </div>
            </div>
          </div>

          {/* KPIs and Success Metrics */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">KPIs & Success Metrics</h3>
            </div>
            <div className="card-body">
              <div className="table-container" style={{ marginBottom: '24px' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>KPI Category</th>
                      <th>Metric</th>
                      <th>Baseline</th>
                      <th>Target</th>
                      <th>Current</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td rowSpan="3"><strong>Operational</strong></td>
                      <td>Processing Time</td>
                      <td>4.2 hours</td>
                      <td>0.5 hours</td>
                      <td>0.8 hours</td>
                      <td><span className="status-badge warning"><span className="status-dot" />On Track</span></td>
                    </tr>
                    <tr>
                      <td>Automation Rate</td>
                      <td>35%</td>
                      <td>85%</td>
                      <td>78%</td>
                      <td><span className="status-badge warning"><span className="status-dot" />On Track</span></td>
                    </tr>
                    <tr>
                      <td>Error Rate</td>
                      <td>4.5%</td>
                      <td>0.5%</td>
                      <td>0.8%</td>
                      <td><span className="status-badge warning"><span className="status-dot" />On Track</span></td>
                    </tr>
                    <tr>
                      <td rowSpan="3"><strong>Model Performance</strong></td>
                      <td>Model Accuracy</td>
                      <td>82%</td>
                      <td>95%</td>
                      <td>{useCase.accuracy > 0 ? useCase.accuracy.toFixed(1) : '94.2'}%</td>
                      <td><span className="status-badge success"><span className="status-dot" />Achieved</span></td>
                    </tr>
                    <tr>
                      <td>False Positive Rate</td>
                      <td>8%</td>
                      <td>2%</td>
                      <td>2.3%</td>
                      <td><span className="status-badge warning"><span className="status-dot" />On Track</span></td>
                    </tr>
                    <tr>
                      <td>Prediction Latency</td>
                      <td>850ms</td>
                      <td>100ms</td>
                      <td>150ms</td>
                      <td><span className="status-badge warning"><span className="status-dot" />On Track</span></td>
                    </tr>
                    <tr>
                      <td rowSpan="2"><strong>Business Impact</strong></td>
                      <td>Cost Reduction</td>
                      <td>$0</td>
                      <td>$2.8M/yr</td>
                      <td>$2.1M/yr</td>
                      <td><span className="status-badge warning"><span className="status-dot" />On Track</span></td>
                    </tr>
                    <tr>
                      <td>Revenue Uplift</td>
                      <td>$0</td>
                      <td>$4.2M/yr</td>
                      <td>$3.5M/yr</td>
                      <td><span className="status-badge warning"><span className="status-dot" />On Track</span></td>
                    </tr>
                    <tr>
                      <td rowSpan="2"><strong>Customer</strong></td>
                      <td>Customer Satisfaction</td>
                      <td>72%</td>
                      <td>90%</td>
                      <td>86%</td>
                      <td><span className="status-badge warning"><span className="status-dot" />On Track</span></td>
                    </tr>
                    <tr>
                      <td>NPS Score</td>
                      <td>32</td>
                      <td>55</td>
                      <td>48</td>
                      <td><span className="status-badge warning"><span className="status-dot" />On Track</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* KPI Progress Chart */}
              <div style={{ height: '300px', marginBottom: '24px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { metric: 'Processing Time', baseline: 100, current: 19, target: 12 },
                    { metric: 'Automation', baseline: 35, current: 78, target: 85 },
                    { metric: 'Accuracy', baseline: 82, current: useCase.accuracy > 0 ? useCase.accuracy : 94.2, target: 95 },
                    { metric: 'Cost Savings', baseline: 0, current: 75, target: 100 },
                    { metric: 'CSAT', baseline: 72, current: 86, target: 90 }
                  ]} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis type="category" dataKey="metric" width={100} />
                    <Tooltip />
                    <Bar dataKey="baseline" fill="var(--gray-300)" name="Baseline %" />
                    <Bar dataKey="current" fill="var(--primary-500)" name="Current %" />
                    <Bar dataKey="target" fill="var(--success-300)" name="Target %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: 'var(--pink-50)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--pink-500)' }}>
                <h4 style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--pink-700)' }}>Key Takeaways</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--gray-700)' }}>
                  <li>Model Accuracy achieved target - excellent performance</li>
                  <li>Processing time reduced by 81% (4.2h → 0.8h)</li>
                  <li>Automation rate more than doubled (35% → 78%)</li>
                  <li>All metrics on track or achieved - healthy initiative progress</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Risk Management */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Risk Management</h3>
            </div>
            <div className="card-body">
              <div className="table-container" style={{ marginBottom: '24px' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Risk Category</th>
                      <th>Risk Description</th>
                      <th>Impact</th>
                      <th>Likelihood</th>
                      <th>Mitigation Strategy</th>
                      <th>Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span style={{ background: 'var(--danger-100)', color: 'var(--danger-700)', padding: '4px 8px', borderRadius: '4px' }}>Technical</span></td>
                      <td>Model drift leading to accuracy degradation</td>
                      <td><span style={{ color: 'var(--danger-600)', fontWeight: '600' }}>High</span></td>
                      <td><span style={{ color: 'var(--warning-600)', fontWeight: '600' }}>Medium</span></td>
                      <td>Automated monitoring, weekly retraining pipeline</td>
                      <td>ML Team</td>
                    </tr>
                    <tr>
                      <td><span style={{ background: 'var(--warning-100)', color: 'var(--warning-700)', padding: '4px 8px', borderRadius: '4px' }}>Data</span></td>
                      <td>Data quality issues affecting model performance</td>
                      <td><span style={{ color: 'var(--danger-600)', fontWeight: '600' }}>High</span></td>
                      <td><span style={{ color: 'var(--warning-600)', fontWeight: '600' }}>Medium</span></td>
                      <td>Data validation rules, quality dashboards</td>
                      <td>Data Team</td>
                    </tr>
                    <tr>
                      <td><span style={{ background: 'var(--purple-100)', color: 'var(--purple-700)', padding: '4px 8px', borderRadius: '4px' }}>Regulatory</span></td>
                      <td>Non-compliance with AI regulations</td>
                      <td><span style={{ color: 'var(--danger-600)', fontWeight: '600' }}>High</span></td>
                      <td><span style={{ color: 'var(--success-600)', fontWeight: '600' }}>Low</span></td>
                      <td>Compliance reviews, explainability reports</td>
                      <td>Legal/Compliance</td>
                    </tr>
                    <tr>
                      <td><span style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', padding: '4px 8px', borderRadius: '4px' }}>Adoption</span></td>
                      <td>User resistance to AI-driven decisions</td>
                      <td><span style={{ color: 'var(--warning-600)', fontWeight: '600' }}>Medium</span></td>
                      <td><span style={{ color: 'var(--warning-600)', fontWeight: '600' }}>Medium</span></td>
                      <td>Change management, training programs</td>
                      <td>Business Owners</td>
                    </tr>
                    <tr>
                      <td><span style={{ background: 'var(--teal-100)', color: 'var(--teal-700)', padding: '4px 8px', borderRadius: '4px' }}>Security</span></td>
                      <td>Adversarial attacks on ML models</td>
                      <td><span style={{ color: 'var(--danger-600)', fontWeight: '600' }}>High</span></td>
                      <td><span style={{ color: 'var(--success-600)', fontWeight: '600' }}>Low</span></td>
                      <td>Model robustness testing, security audits</td>
                      <td>Security Team</td>
                    </tr>
                    <tr>
                      <td><span style={{ background: 'var(--indigo-100)', color: 'var(--indigo-700)', padding: '4px 8px', borderRadius: '4px' }}>Resource</span></td>
                      <td>Talent shortage in AI/ML skills</td>
                      <td><span style={{ color: 'var(--warning-600)', fontWeight: '600' }}>Medium</span></td>
                      <td><span style={{ color: 'var(--warning-600)', fontWeight: '600' }}>Medium</span></td>
                      <td>Upskilling programs, strategic partnerships</td>
                      <td>HR</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Risk Matrix */}
              <div style={{ background: 'var(--gray-50)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                <h4 style={{ textAlign: 'center', marginBottom: '16px', color: 'var(--gray-700)' }}>Risk Heat Map</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto repeat(3, 1fr)', gap: '2px', maxWidth: '400px', margin: '0 auto' }}>
                  <div style={{ padding: '8px' }}></div>
                  <div style={{ padding: '8px', textAlign: 'center', fontWeight: '600', fontSize: '12px' }}>Low</div>
                  <div style={{ padding: '8px', textAlign: 'center', fontWeight: '600', fontSize: '12px' }}>Medium</div>
                  <div style={{ padding: '8px', textAlign: 'center', fontWeight: '600', fontSize: '12px' }}>High</div>

                  <div style={{ padding: '8px', fontWeight: '600', fontSize: '12px' }}>High</div>
                  <div style={{ background: 'var(--warning-200)', padding: '12px', borderRadius: '4px', fontSize: '11px', textAlign: 'center' }}>Regulatory</div>
                  <div style={{ background: 'var(--danger-300)', padding: '12px', borderRadius: '4px', fontSize: '11px', textAlign: 'center' }}>Technical, Data</div>
                  <div style={{ background: 'var(--danger-500)', padding: '12px', borderRadius: '4px', fontSize: '11px', textAlign: 'center', color: 'white' }}>-</div>

                  <div style={{ padding: '8px', fontWeight: '600', fontSize: '12px' }}>Medium</div>
                  <div style={{ background: 'var(--success-200)', padding: '12px', borderRadius: '4px', fontSize: '11px', textAlign: 'center' }}>-</div>
                  <div style={{ background: 'var(--warning-200)', padding: '12px', borderRadius: '4px', fontSize: '11px', textAlign: 'center' }}>Adoption, Resource</div>
                  <div style={{ background: 'var(--danger-300)', padding: '12px', borderRadius: '4px', fontSize: '11px', textAlign: 'center' }}>-</div>

                  <div style={{ padding: '8px', fontWeight: '600', fontSize: '12px' }}>Low</div>
                  <div style={{ background: 'var(--success-200)', padding: '12px', borderRadius: '4px', fontSize: '11px', textAlign: 'center' }}>Security</div>
                  <div style={{ background: 'var(--success-300)', padding: '12px', borderRadius: '4px', fontSize: '11px', textAlign: 'center' }}>-</div>
                  <div style={{ background: 'var(--warning-200)', padding: '12px', borderRadius: '4px', fontSize: '11px', textAlign: 'center' }}>-</div>
                </div>
              </div>

              <div style={{ background: 'var(--orange-50)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--orange-500)' }}>
                <h4 style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--orange-700)' }}>Key Takeaways</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--gray-700)' }}>
                  <li>Technical and Data risks are highest priority requiring continuous monitoring</li>
                  <li>Regulatory risks mitigated through proactive compliance framework</li>
                  <li>Security risks well-managed with low likelihood due to robust controls</li>
                  <li>Change management crucial for addressing adoption risks</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Export Section */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Export AI Strategy</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => handleExport('AI Strategy PDF')}>
                  <Icon name="file" size={16} /> Export as PDF
                </button>
                <button className="btn btn-secondary" onClick={() => handleExport('AI Strategy PPT')}>
                  <Icon name="monitor" size={16} /> Export as PowerPoint
                </button>
                <button className="btn btn-secondary" onClick={() => handleExport('AI Strategy Excel')}>
                  <Icon name="table" size={16} /> Export Metrics to Excel
                </button>
                <button className="btn btn-secondary" onClick={() => handleExport('AI Strategy Word')}>
                  <Icon name="file-text" size={16} /> Export as Word
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interview Guide Tab */}
      {activeTab === 'interview' && (
        <div className="grid grid-cols-1" style={{ gap: '24px' }}>
          {/* Interview Header */}
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--purple-600) 0%, var(--indigo-700) 100%)', color: 'white' }}>
            <div className="card-body" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px', color: 'white' }}>Interview Guide: {useCase.name}</h2>
              <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '24px' }}>
                Comprehensive guide to explain this ML use case from different role perspectives.
                Each section covers phase-wise implementation, challenges, solutions, and technical details.
              </p>
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px 20px', borderRadius: '8px' }}>
                  <div style={{ fontWeight: '600' }}>5 Role Perspectives</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px 20px', borderRadius: '8px' }}>
                  <div style={{ fontWeight: '600' }}>6 Implementation Phases</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px 20px', borderRadius: '8px' }}>
                  <div style={{ fontWeight: '600' }}>15+ Technical Components</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px 20px', borderRadius: '8px' }}>
                  <div style={{ fontWeight: '600' }}>Production Ready</div>
                </div>
              </div>
            </div>
          </div>

          {/* As an Architect */}
          <div className="card">
            <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--primary-50), var(--primary-100))', borderBottom: '3px solid var(--primary-500)' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ background: 'var(--primary-500)', color: 'white', padding: '8px 12px', borderRadius: '8px' }}>As an Architect</span>
                System Design & Architecture Perspective
              </h3>
            </div>
            <div className="card-body">
              {/* Architecture Overview */}
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ color: 'var(--primary-700)', marginBottom: '16px', borderBottom: '2px solid var(--primary-200)', paddingBottom: '8px' }}>How I Would Explain This Project</h4>
                <div style={{ background: 'var(--gray-50)', padding: '20px', borderRadius: '12px', marginBottom: '16px' }}>
                  <p style={{ fontStyle: 'italic', color: 'var(--gray-700)', marginBottom: '16px' }}>
                    "As the Solution Architect for {useCase.name}, I designed an end-to-end ML pipeline that processes 2.4M+ daily transactions
                    with 99.9% uptime and sub-200ms latency. The architecture follows microservices patterns with event-driven communication,
                    ensuring scalability, fault tolerance, and maintainability."
                  </p>
                </div>

                {/* Phase-wise Architecture Table */}
                <div className="table-container" style={{ marginBottom: '24px' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Phase</th>
                        <th>Architecture Focus</th>
                        <th>Key Decisions</th>
                        <th>Challenges</th>
                        <th>Solutions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><span style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>Phase 1: Discovery</span></td>
                        <td>Requirements Analysis & System Context</td>
                        <td>Define NFRs, identify integration points, capacity planning</td>
                        <td>Unclear requirements, legacy system constraints</td>
                        <td>Stakeholder workshops, system audits, ADR documentation</td>
                      </tr>
                      <tr>
                        <td><span style={{ background: 'var(--success-100)', color: 'var(--success-700)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>Phase 2: Design</span></td>
                        <td>High-Level Design & Component Architecture</td>
                        <td>Microservices vs monolith, sync vs async, cloud provider</td>
                        <td>Balancing complexity with maintainability</td>
                        <td>Domain-driven design, event storming, proof of concepts</td>
                      </tr>
                      <tr>
                        <td><span style={{ background: 'var(--warning-100)', color: 'var(--warning-700)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>Phase 3: Data Architecture</span></td>
                        <td>Data Pipeline & Storage Design</td>
                        <td>Data lake vs warehouse, real-time vs batch, schema design</td>
                        <td>Data consistency, latency requirements, GDPR compliance</td>
                        <td>Lambda architecture, CDC patterns, data mesh principles</td>
                      </tr>
                      <tr>
                        <td><span style={{ background: 'var(--danger-100)', color: 'var(--danger-700)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>Phase 4: ML System Design</span></td>
                        <td>Model Serving & MLOps Architecture</td>
                        <td>Online vs batch inference, model versioning, A/B testing</td>
                        <td>Model drift, feature store design, reproducibility</td>
                        <td>Feature store (Feast), MLflow registry, shadow deployments</td>
                      </tr>
                      <tr>
                        <td><span style={{ background: 'var(--purple-100)', color: 'var(--purple-700)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>Phase 5: Integration</span></td>
                        <td>API Design & System Integration</td>
                        <td>REST vs gRPC, API gateway, circuit breakers</td>
                        <td>Cross-system dependencies, backward compatibility</td>
                        <td>Contract-first design, versioned APIs, saga patterns</td>
                      </tr>
                      <tr>
                        <td><span style={{ background: 'var(--teal-100)', color: 'var(--teal-700)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>Phase 6: Production</span></td>
                        <td>Observability & Resilience Patterns</td>
                        <td>Monitoring strategy, disaster recovery, scaling policies</td>
                        <td>Debugging distributed systems, cost optimization</td>
                        <td>Distributed tracing, chaos engineering, auto-scaling</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Architecture Diagram */}
                <div style={{ background: 'var(--gray-50)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                  <h5 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--gray-700)' }}>System Architecture Overview</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Layer 1: Data Sources */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ background: 'var(--primary-100)', border: '2px solid var(--primary-300)', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', textAlign: 'center' }}>Core Banking</div>
                      <div style={{ background: 'var(--primary-100)', border: '2px solid var(--primary-300)', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', textAlign: 'center' }}>Transaction DB</div>
                      <div style={{ background: 'var(--primary-100)', border: '2px solid var(--primary-300)', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', textAlign: 'center' }}>Customer Data</div>
                      <div style={{ background: 'var(--primary-100)', border: '2px solid var(--primary-300)', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', textAlign: 'center' }}>External APIs</div>
                    </div>
                    <div style={{ textAlign: 'center', color: 'var(--gray-400)' }}>↓ Kafka / CDC / REST ↓</div>
                    {/* Layer 2: Ingestion */}
                    <div style={{ background: 'var(--success-100)', border: '2px solid var(--success-300)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--success-700)' }}>Data Ingestion Layer</div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '12px' }}>
                        <span style={{ background: 'white', padding: '4px 8px', borderRadius: '4px' }}>Kafka Streams</span>
                        <span style={{ background: 'white', padding: '4px 8px', borderRadius: '4px' }}>Spark Streaming</span>
                        <span style={{ background: 'white', padding: '4px 8px', borderRadius: '4px' }}>Debezium CDC</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', color: 'var(--gray-400)' }}>↓</div>
                    {/* Layer 3: Processing */}
                    <div style={{ background: 'var(--warning-100)', border: '2px solid var(--warning-300)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--warning-700)' }}>Feature Engineering & Processing</div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '12px' }}>
                        <span style={{ background: 'white', padding: '4px 8px', borderRadius: '4px' }}>Feature Store (Feast)</span>
                        <span style={{ background: 'white', padding: '4px 8px', borderRadius: '4px' }}>dbt Transformations</span>
                        <span style={{ background: 'white', padding: '4px 8px', borderRadius: '4px' }}>Data Quality (Great Expectations)</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', color: 'var(--gray-400)' }}>↓</div>
                    {/* Layer 4: ML */}
                    <div style={{ background: 'var(--danger-100)', border: '2px solid var(--danger-300)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--danger-700)' }}>ML Serving Layer</div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '12px' }}>
                        <span style={{ background: 'white', padding: '4px 8px', borderRadius: '4px' }}>Model Registry (MLflow)</span>
                        <span style={{ background: 'white', padding: '4px 8px', borderRadius: '4px' }}>Inference Service (TensorFlow Serving)</span>
                        <span style={{ background: 'white', padding: '4px 8px', borderRadius: '4px' }}>RAG Engine (LangChain)</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', color: 'var(--gray-400)' }}>↓</div>
                    {/* Layer 5: API */}
                    <div style={{ background: 'var(--purple-100)', border: '2px solid var(--purple-300)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--purple-700)' }}>API Gateway & Orchestration</div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '12px' }}>
                        <span style={{ background: 'white', padding: '4px 8px', borderRadius: '4px' }}>Kong API Gateway</span>
                        <span style={{ background: 'white', padding: '4px 8px', borderRadius: '4px' }}>FastAPI Services</span>
                        <span style={{ background: 'white', padding: '4px 8px', borderRadius: '4px' }}>Redis Cache</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edge Cases */}
                <div style={{ marginBottom: '24px' }}>
                  <h5 style={{ color: 'var(--gray-700)', marginBottom: '12px' }}>Edge Cases & Architectural Solutions</h5>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Edge Case</th>
                          <th>Impact</th>
                          <th>Architectural Solution</th>
                          <th>Pattern Used</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Traffic spike (10x normal)</td>
                          <td>Service degradation, timeouts</td>
                          <td>Auto-scaling groups, request queuing, rate limiting</td>
                          <td>Bulkhead, Throttling</td>
                        </tr>
                        <tr>
                          <td>Model serving failure</td>
                          <td>Predictions unavailable</td>
                          <td>Fallback to previous model version, circuit breaker</td>
                          <td>Circuit Breaker, Fallback</td>
                        </tr>
                        <tr>
                          <td>Data source unavailable</td>
                          <td>Stale features, incomplete data</td>
                          <td>Feature caching, graceful degradation, retry with backoff</td>
                          <td>Cache-Aside, Retry</td>
                        </tr>
                        <tr>
                          <td>Schema evolution</td>
                          <td>Breaking changes, data corruption</td>
                          <td>Schema registry, backward-compatible changes</td>
                          <td>Schema Registry, Versioning</td>
                        </tr>
                        <tr>
                          <td>Cross-region latency</td>
                          <td>SLA breaches, poor UX</td>
                          <td>Edge deployment, geo-routing, CDN for static assets</td>
                          <td>Edge Computing</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Key Takeaways */}
                <div style={{ background: 'var(--primary-50)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--primary-500)' }}>
                  <h5 style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--primary-700)' }}>Architect Key Takeaways</h5>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--gray-700)' }}>
                    <li>Design for failure - every component should have a fallback strategy</li>
                    <li>Event-driven architecture enables loose coupling and scalability</li>
                    <li>Feature store is critical for ML systems - ensures consistency between training and serving</li>
                    <li>Observability is not optional - design it from day one</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* As a Manager */}
          <div className="card">
            <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--success-50), var(--success-100))', borderBottom: '3px solid var(--success-500)' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ background: 'var(--success-500)', color: 'white', padding: '8px 12px', borderRadius: '8px' }}>As a Manager</span>
                Project Management & Delivery Perspective
              </h3>
            </div>
            <div className="card-body">
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ color: 'var(--success-700)', marginBottom: '16px', borderBottom: '2px solid var(--success-200)', paddingBottom: '8px' }}>How I Would Explain This Project</h4>
                <div style={{ background: 'var(--gray-50)', padding: '20px', borderRadius: '12px', marginBottom: '16px' }}>
                  <p style={{ fontStyle: 'italic', color: 'var(--gray-700)', marginBottom: '16px' }}>
                    "I led a cross-functional team of 12 members across 6 sprints to deliver {useCase.name}.
                    We achieved a 98% on-time delivery rate, reduced operational costs by $2.8M annually, and improved customer satisfaction by 25%.
                    The project was delivered under budget with zero critical production incidents in the first 90 days."
                  </p>
                </div>

                {/* Project Management Phases */}
                <div className="table-container" style={{ marginBottom: '24px' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Phase</th>
                        <th>Duration</th>
                        <th>Team Focus</th>
                        <th>Challenges</th>
                        <th>Management Solutions</th>
                        <th>Deliverables</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><span style={{ background: 'var(--success-100)', color: 'var(--success-700)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>Initiation</span></td>
                        <td>2 weeks</td>
                        <td>Stakeholder alignment, team formation</td>
                        <td>Competing priorities, unclear ROI expectations</td>
                        <td>Executive sponsorship, business case development, RACI matrix</td>
                        <td>Project charter, stakeholder register</td>
                      </tr>
                      <tr>
                        <td><span style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>Planning</span></td>
                        <td>3 weeks</td>
                        <td>Roadmap creation, resource planning</td>
                        <td>Skill gaps, dependency management, estimation accuracy</td>
                        <td>Story point estimation, buffer allocation, training plan</td>
                        <td>Sprint backlog, risk register, communication plan</td>
                      </tr>
                      <tr>
                        <td><span style={{ background: 'var(--warning-100)', color: 'var(--warning-700)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>Development</span></td>
                        <td>12 weeks</td>
                        <td>Agile delivery, continuous integration</td>
                        <td>Scope creep, technical debt, team burnout</td>
                        <td>Sprint reviews, velocity tracking, sustainable pace</td>
                        <td>Working software increments, demo recordings</td>
                      </tr>
                      <tr>
                        <td><span style={{ background: 'var(--danger-100)', color: 'var(--danger-700)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>Testing</span></td>
                        <td>4 weeks</td>
                        <td>Quality assurance, UAT coordination</td>
                        <td>Test environment issues, data quality problems</td>
                        <td>Test data management, parallel testing tracks</td>
                        <td>Test reports, defect metrics, sign-off documents</td>
                      </tr>
                      <tr>
                        <td><span style={{ background: 'var(--purple-100)', color: 'var(--purple-700)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>Deployment</span></td>
                        <td>2 weeks</td>
                        <td>Go-live preparation, change management</td>
                        <td>Resistance to change, production readiness</td>
                        <td>Pilot rollout, training sessions, war room support</td>
                        <td>Deployment runbook, rollback plan, training materials</td>
                      </tr>
                      <tr>
                        <td><span style={{ background: 'var(--teal-100)', color: 'var(--teal-700)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>Hypercare</span></td>
                        <td>4 weeks</td>
                        <td>Stabilization, knowledge transfer</td>
                        <td>Production issues, support handover</td>
                        <td>24/7 support rotation, daily health checks, L1/L2 training</td>
                        <td>Operations manual, lessons learned, closure report</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Team Structure */}
                <div style={{ background: 'var(--gray-50)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                  <h5 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--gray-700)' }}>Team Structure & Responsibilities</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                    <div style={{ background: 'white', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--gray-200)' }}>
                      <div style={{ fontWeight: '600', color: 'var(--primary-600)', marginBottom: '8px' }}>Project Manager</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-700)' }}>1</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Delivery & Stakeholders</div>
                    </div>
                    <div style={{ background: 'white', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--gray-200)' }}>
                      <div style={{ fontWeight: '600', color: 'var(--success-600)', marginBottom: '8px' }}>Data Engineers</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success-700)' }}>3</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Pipeline & Infrastructure</div>
                    </div>
                    <div style={{ background: 'white', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--gray-200)' }}>
                      <div style={{ fontWeight: '600', color: 'var(--warning-600)', marginBottom: '8px' }}>ML Engineers</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--warning-700)' }}>3</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Models & Features</div>
                    </div>
                    <div style={{ background: 'white', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--gray-200)' }}>
                      <div style={{ fontWeight: '600', color: 'var(--danger-600)', marginBottom: '8px' }}>Backend Devs</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--danger-700)' }}>2</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>APIs & Services</div>
                    </div>
                    <div style={{ background: 'white', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--gray-200)' }}>
                      <div style={{ fontWeight: '600', color: 'var(--purple-600)', marginBottom: '8px' }}>DevOps</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--purple-700)' }}>2</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>CI/CD & Monitoring</div>
                    </div>
                    <div style={{ background: 'white', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--gray-200)' }}>
                      <div style={{ fontWeight: '600', color: 'var(--teal-600)', marginBottom: '8px' }}>QA Engineers</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--teal-700)' }}>1</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Testing & Quality</div>
                    </div>
                  </div>
                </div>

                {/* KPIs Chart */}
                <div style={{ height: '300px', marginBottom: '24px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={[
                      { sprint: 'Sprint 1', velocity: 24, planned: 30, quality: 92, satisfaction: 85 },
                      { sprint: 'Sprint 2', velocity: 32, planned: 32, quality: 94, satisfaction: 88 },
                      { sprint: 'Sprint 3', velocity: 35, planned: 34, quality: 96, satisfaction: 90 },
                      { sprint: 'Sprint 4', velocity: 38, planned: 36, quality: 95, satisfaction: 92 },
                      { sprint: 'Sprint 5', velocity: 40, planned: 38, quality: 97, satisfaction: 94 },
                      { sprint: 'Sprint 6', velocity: 42, planned: 40, quality: 98, satisfaction: 96 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="sprint" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" domain={[80, 100]} />
                      <Tooltip />
                      <Bar yAxisId="left" dataKey="velocity" fill="var(--success-500)" name="Actual Velocity" />
                      <Bar yAxisId="left" dataKey="planned" fill="var(--success-200)" name="Planned Points" />
                      <Line yAxisId="right" type="monotone" dataKey="quality" stroke="var(--primary-500)" strokeWidth={2} name="Quality %" />
                      <Line yAxisId="right" type="monotone" dataKey="satisfaction" stroke="var(--warning-500)" strokeWidth={2} name="Team Satisfaction %" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ background: 'var(--success-50)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--success-500)' }}>
                  <h5 style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--success-700)' }}>Manager Key Takeaways</h5>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--gray-700)' }}>
                    <li>Clear communication and stakeholder management were critical for success</li>
                    <li>Agile methodology with 2-week sprints provided flexibility and visibility</li>
                    <li>Investing in team training reduced skill gaps and improved velocity by 75%</li>
                    <li>Early risk identification prevented 3 potential blockers from impacting timeline</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* As a Developer */}
          <div className="card">
            <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--warning-50), var(--warning-100))', borderBottom: '3px solid var(--warning-500)' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ background: 'var(--warning-500)', color: 'white', padding: '8px 12px', borderRadius: '8px' }}>As a Developer</span>
                Technical Implementation Perspective
              </h3>
            </div>
            <div className="card-body">
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ color: 'var(--warning-700)', marginBottom: '16px', borderBottom: '2px solid var(--warning-200)', paddingBottom: '8px' }}>How I Would Explain This Project</h4>
                <div style={{ background: 'var(--gray-50)', padding: '20px', borderRadius: '12px', marginBottom: '16px' }}>
                  <p style={{ fontStyle: 'italic', color: 'var(--gray-700)', marginBottom: '16px' }}>
                    "I developed the core ML pipeline for {useCase.name} using Python, implementing an ensemble of XGBoost, LightGBM, and
                    neural networks. I built real-time feature engineering pipelines with Spark, created REST APIs using FastAPI,
                    and integrated RAG capabilities with LangChain for explainable predictions."
                  </p>
                </div>

                {/* Libraries & Technologies Table */}
                <h5 style={{ color: 'var(--gray-700)', marginBottom: '12px' }}>Libraries & Technologies Used</h5>
                <div className="table-container" style={{ marginBottom: '24px' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Technology</th>
                        <th>Version</th>
                        <th>Purpose</th>
                        <th>Why Chosen</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td rowSpan="4"><span style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', padding: '4px 8px', borderRadius: '4px' }}>ML/AI</span></td>
                        <td>XGBoost</td>
                        <td>2.0.3</td>
                        <td>Gradient boosting for tabular data</td>
                        <td>Best accuracy for structured data, GPU support</td>
                      </tr>
                      <tr>
                        <td>LightGBM</td>
                        <td>4.2.0</td>
                        <td>Ensemble model component</td>
                        <td>Faster training, lower memory usage</td>
                      </tr>
                      <tr>
                        <td>TensorFlow</td>
                        <td>2.15.0</td>
                        <td>Deep learning models</td>
                        <td>Production-ready serving, TPU support</td>
                      </tr>
                      <tr>
                        <td>scikit-learn</td>
                        <td>1.4.0</td>
                        <td>Preprocessing, metrics, utilities</td>
                        <td>Industry standard, comprehensive tools</td>
                      </tr>
                      <tr>
                        <td rowSpan="3"><span style={{ background: 'var(--success-100)', color: 'var(--success-700)', padding: '4px 8px', borderRadius: '4px' }}>Data Processing</span></td>
                        <td>Apache Spark</td>
                        <td>3.5.0</td>
                        <td>Large-scale data processing</td>
                        <td>Distributed processing, SQL support</td>
                      </tr>
                      <tr>
                        <td>Pandas</td>
                        <td>2.1.4</td>
                        <td>Data manipulation</td>
                        <td>Flexibility, extensive ecosystem</td>
                      </tr>
                      <tr>
                        <td>Polars</td>
                        <td>0.20.0</td>
                        <td>High-performance data ops</td>
                        <td>10x faster than Pandas for large datasets</td>
                      </tr>
                      <tr>
                        <td rowSpan="3"><span style={{ background: 'var(--warning-100)', color: 'var(--warning-700)', padding: '4px 8px', borderRadius: '4px' }}>RAG/NLP</span></td>
                        <td>LangChain</td>
                        <td>0.1.0</td>
                        <td>RAG pipeline orchestration</td>
                        <td>Best RAG framework, active community</td>
                      </tr>
                      <tr>
                        <td>OpenAI API</td>
                        <td>1.6.0</td>
                        <td>LLM for explanations</td>
                        <td>GPT-4 quality, reliable API</td>
                      </tr>
                      <tr>
                        <td>ChromaDB</td>
                        <td>0.4.22</td>
                        <td>Vector database</td>
                        <td>Easy to use, good performance</td>
                      </tr>
                      <tr>
                        <td rowSpan="3"><span style={{ background: 'var(--danger-100)', color: 'var(--danger-700)', padding: '4px 8px', borderRadius: '4px' }}>API/Backend</span></td>
                        <td>FastAPI</td>
                        <td>0.109.0</td>
                        <td>REST API framework</td>
                        <td>Async support, auto documentation</td>
                      </tr>
                      <tr>
                        <td>Pydantic</td>
                        <td>2.5.0</td>
                        <td>Data validation</td>
                        <td>Type safety, fast validation</td>
                      </tr>
                      <tr>
                        <td>Redis</td>
                        <td>7.2</td>
                        <td>Caching, rate limiting</td>
                        <td>Low latency, feature caching</td>
                      </tr>
                      <tr>
                        <td rowSpan="2"><span style={{ background: 'var(--purple-100)', color: 'var(--purple-700)', padding: '4px 8px', borderRadius: '4px' }}>MLOps</span></td>
                        <td>MLflow</td>
                        <td>2.10.0</td>
                        <td>Experiment tracking, model registry</td>
                        <td>Open source, comprehensive features</td>
                      </tr>
                      <tr>
                        <td>Feast</td>
                        <td>0.37.0</td>
                        <td>Feature store</td>
                        <td>Online/offline serving, versioning</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Code Examples */}
                <h5 style={{ color: 'var(--gray-700)', marginBottom: '12px' }}>Key Code Patterns</h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ background: '#1e1e1e', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ background: '#333', padding: '8px 16px', color: '#ddd', fontSize: '12px', fontWeight: '600' }}>feature_engineering.py</div>
                    <pre style={{ margin: 0, padding: '16px', color: '#d4d4d4', fontSize: '12px', overflow: 'auto' }}>{`# Feature Engineering Pipeline
from feast import FeatureStore
import polars as pl

class FeatureEngineer:
    def __init__(self):
        self.fs = FeatureStore("feature_repo/")

    def compute_features(self, df: pl.DataFrame):
        # Transaction velocity features
        df = df.with_columns([
            pl.col("amount").rolling_mean(7)
              .alias("txn_amount_7d_avg"),
            pl.col("amount").rolling_std(7)
              .alias("txn_amount_7d_std"),
            (pl.col("amount") - pl.col("amount")
              .rolling_mean(30))
              .alias("amount_deviation")
        ])
        return df

    def get_online_features(self, entity_ids):
        return self.fs.get_online_features(
            features=["txn_features:velocity"],
            entity_rows=entity_ids
        ).to_dict()`}</pre>
                  </div>
                  <div style={{ background: '#1e1e1e', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ background: '#333', padding: '8px 16px', color: '#ddd', fontSize: '12px', fontWeight: '600' }}>model_serving.py</div>
                    <pre style={{ margin: 0, padding: '16px', color: '#d4d4d4', fontSize: '12px', overflow: 'auto' }}>{`# Ensemble Model Serving
from fastapi import FastAPI
import mlflow
import numpy as np

app = FastAPI()

class EnsemblePredictor:
    def __init__(self):
        self.models = {
            'xgb': mlflow.xgboost.load_model(
                "models:/fraud_xgb/Production"),
            'lgb': mlflow.lightgbm.load_model(
                "models:/fraud_lgb/Production"),
            'nn': mlflow.tensorflow.load_model(
                "models:/fraud_nn/Production")
        }
        self.weights = [0.4, 0.35, 0.25]

    async def predict(self, features: np.ndarray):
        predictions = [
            m.predict_proba(features)[:, 1]
            for m in self.models.values()
        ]
        return np.average(
            predictions, weights=self.weights, axis=0
        )`}</pre>
                  </div>
                </div>

                {/* Data Preprocessing Approaches */}
                <h5 style={{ color: 'var(--gray-700)', marginBottom: '12px' }}>Data Preprocessing Approaches</h5>
                <div className="table-container" style={{ marginBottom: '24px' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Data Type</th>
                        <th>Preprocessing Step</th>
                        <th>Library Used</th>
                        <th>Code Pattern</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Numerical</td>
                        <td>Standardization, outlier handling</td>
                        <td>sklearn.preprocessing</td>
                        <td><code>StandardScaler().fit_transform(X)</code></td>
                      </tr>
                      <tr>
                        <td>Categorical</td>
                        <td>Target encoding, one-hot</td>
                        <td>category_encoders</td>
                        <td><code>TargetEncoder().fit_transform(X, y)</code></td>
                      </tr>
                      <tr>
                        <td>Text</td>
                        <td>Tokenization, embedding</td>
                        <td>transformers, tiktoken</td>
                        <td><code>model.encode(text_batch)</code></td>
                      </tr>
                      <tr>
                        <td>Time Series</td>
                        <td>Lag features, rolling stats</td>
                        <td>Polars, tsfresh</td>
                        <td><code>df.with_columns(pl.col("x").shift(7))</code></td>
                      </tr>
                      <tr>
                        <td>Missing Values</td>
                        <td>Imputation strategies</td>
                        <td>sklearn.impute</td>
                        <td><code>KNNImputer(n_neighbors=5).fit_transform(X)</code></td>
                      </tr>
                      <tr>
                        <td>Imbalanced</td>
                        <td>SMOTE, class weights</td>
                        <td>imbalanced-learn</td>
                        <td><code>SMOTE().fit_resample(X, y)</code></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* API Endpoints */}
                <h5 style={{ color: 'var(--gray-700)', marginBottom: '12px' }}>API Endpoints</h5>
                <div className="table-container" style={{ marginBottom: '24px' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Endpoint</th>
                        <th>Method</th>
                        <th>Purpose</th>
                        <th>Request</th>
                        <th>Response</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><code>/api/v1/predict</code></td>
                        <td><span style={{ background: 'var(--success-100)', color: 'var(--success-700)', padding: '2px 8px', borderRadius: '4px' }}>POST</span></td>
                        <td>Real-time prediction</td>
                        <td>Transaction features JSON</td>
                        <td>Score, confidence, explanation</td>
                      </tr>
                      <tr>
                        <td><code>/api/v1/batch-predict</code></td>
                        <td><span style={{ background: 'var(--success-100)', color: 'var(--success-700)', padding: '2px 8px', borderRadius: '4px' }}>POST</span></td>
                        <td>Batch processing</td>
                        <td>CSV file upload</td>
                        <td>Async job ID, results URL</td>
                      </tr>
                      <tr>
                        <td><code>/api/v1/explain/{'{id}'}</code></td>
                        <td><span style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', padding: '2px 8px', borderRadius: '4px' }}>GET</span></td>
                        <td>SHAP explanation</td>
                        <td>Prediction ID</td>
                        <td>Feature contributions, plots</td>
                      </tr>
                      <tr>
                        <td><code>/api/v1/features</code></td>
                        <td><span style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', padding: '2px 8px', borderRadius: '4px' }}>GET</span></td>
                        <td>Feature values lookup</td>
                        <td>Entity IDs</td>
                        <td>Real-time feature values</td>
                      </tr>
                      <tr>
                        <td><code>/api/v1/model/health</code></td>
                        <td><span style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', padding: '2px 8px', borderRadius: '4px' }}>GET</span></td>
                        <td>Model health check</td>
                        <td>-</td>
                        <td>Status, version, metrics</td>
                      </tr>
                      <tr>
                        <td><code>/api/v1/rag/query</code></td>
                        <td><span style={{ background: 'var(--success-100)', color: 'var(--success-700)', padding: '2px 8px', borderRadius: '4px' }}>POST</span></td>
                        <td>RAG-powered Q&A</td>
                        <td>Question, context</td>
                        <td>Answer, sources, confidence</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ background: 'var(--warning-50)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--warning-500)' }}>
                  <h5 style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--warning-700)' }}>Developer Key Takeaways</h5>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--gray-700)' }}>
                    <li>Type hints and Pydantic models ensure API contract stability</li>
                    <li>Async/await patterns critical for high-throughput inference</li>
                    <li>Feature store eliminates training-serving skew</li>
                    <li>Comprehensive logging with correlation IDs for debugging distributed systems</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* As a DevOps Engineer */}
          <div className="card">
            <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--danger-50), var(--danger-100))', borderBottom: '3px solid var(--danger-500)' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ background: 'var(--danger-500)', color: 'white', padding: '8px 12px', borderRadius: '8px' }}>As a DevOps Engineer</span>
                Infrastructure & Operations Perspective
              </h3>
            </div>
            <div className="card-body">
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ color: 'var(--danger-700)', marginBottom: '16px', borderBottom: '2px solid var(--danger-200)', paddingBottom: '8px' }}>How I Would Explain This Project</h4>
                <div style={{ background: 'var(--gray-50)', padding: '20px', borderRadius: '12px', marginBottom: '16px' }}>
                  <p style={{ fontStyle: 'italic', color: 'var(--gray-700)', marginBottom: '16px' }}>
                    "I designed and implemented the MLOps infrastructure for {useCase.name} on AWS/Kubernetes.
                    The pipeline achieves 15-minute deployment cycles with zero-downtime deployments, 99.9% uptime,
                    and automated model retraining. I set up comprehensive monitoring with Prometheus/Grafana
                    and implemented GitOps workflows with ArgoCD."
                  </p>
                </div>

                {/* CI/CD Pipeline */}
                <div style={{ background: 'var(--gray-50)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                  <h5 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--gray-700)' }}>CI/CD Pipeline Architecture</h5>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ background: 'var(--primary-500)', color: 'white', padding: '12px 16px', borderRadius: '8px', textAlign: 'center', minWidth: '100px' }}>
                      <div style={{ fontSize: '12px', opacity: 0.8 }}>Code</div>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>Git Push</div>
                    </div>
                    <div style={{ color: 'var(--gray-400)' }}>→</div>
                    <div style={{ background: 'var(--warning-500)', color: 'white', padding: '12px 16px', borderRadius: '8px', textAlign: 'center', minWidth: '100px' }}>
                      <div style={{ fontSize: '12px', opacity: 0.8 }}>Build</div>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>GitHub Actions</div>
                    </div>
                    <div style={{ color: 'var(--gray-400)' }}>→</div>
                    <div style={{ background: 'var(--success-500)', color: 'white', padding: '12px 16px', borderRadius: '8px', textAlign: 'center', minWidth: '100px' }}>
                      <div style={{ fontSize: '12px', opacity: 0.8 }}>Test</div>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>pytest + coverage</div>
                    </div>
                    <div style={{ color: 'var(--gray-400)' }}>→</div>
                    <div style={{ background: 'var(--purple-500)', color: 'white', padding: '12px 16px', borderRadius: '8px', textAlign: 'center', minWidth: '100px' }}>
                      <div style={{ fontSize: '12px', opacity: 0.8 }}>Scan</div>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>SonarQube</div>
                    </div>
                    <div style={{ color: 'var(--gray-400)' }}>→</div>
                    <div style={{ background: 'var(--teal-500)', color: 'white', padding: '12px 16px', borderRadius: '8px', textAlign: 'center', minWidth: '100px' }}>
                      <div style={{ fontSize: '12px', opacity: 0.8 }}>Image</div>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>Docker Build</div>
                    </div>
                    <div style={{ color: 'var(--gray-400)' }}>→</div>
                    <div style={{ background: 'var(--indigo-500)', color: 'white', padding: '12px 16px', borderRadius: '8px', textAlign: 'center', minWidth: '100px' }}>
                      <div style={{ fontSize: '12px', opacity: 0.8 }}>Registry</div>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>ECR Push</div>
                    </div>
                    <div style={{ color: 'var(--gray-400)' }}>→</div>
                    <div style={{ background: 'var(--danger-500)', color: 'white', padding: '12px 16px', borderRadius: '8px', textAlign: 'center', minWidth: '100px' }}>
                      <div style={{ fontSize: '12px', opacity: 0.8 }}>Deploy</div>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>ArgoCD</div>
                    </div>
                  </div>
                </div>

                {/* Infrastructure Table */}
                <h5 style={{ color: 'var(--gray-700)', marginBottom: '12px' }}>Infrastructure Components</h5>
                <div className="table-container" style={{ marginBottom: '24px' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Component</th>
                        <th>Technology</th>
                        <th>Configuration</th>
                        <th>Purpose</th>
                        <th>Scaling Strategy</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><span style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', padding: '4px 8px', borderRadius: '4px' }}>Container Orchestration</span></td>
                        <td>Amazon EKS</td>
                        <td>3 node groups, m5.xlarge</td>
                        <td>Service deployment, auto-scaling</td>
                        <td>HPA based on CPU/memory, custom metrics</td>
                      </tr>
                      <tr>
                        <td><span style={{ background: 'var(--success-100)', color: 'var(--success-700)', padding: '4px 8px', borderRadius: '4px' }}>Model Serving</span></td>
                        <td>KServe + Istio</td>
                        <td>GPU nodes (g4dn.xlarge)</td>
                        <td>Model inference, canary deployments</td>
                        <td>Scale to zero, burst to 50 replicas</td>
                      </tr>
                      <tr>
                        <td><span style={{ background: 'var(--warning-100)', color: 'var(--warning-700)', padding: '4px 8px', borderRadius: '4px' }}>Message Queue</span></td>
                        <td>Amazon MSK (Kafka)</td>
                        <td>6 brokers, 100GB each</td>
                        <td>Event streaming, decoupling</td>
                        <td>Partition-based scaling</td>
                      </tr>
                      <tr>
                        <td><span style={{ background: 'var(--danger-100)', color: 'var(--danger-700)', padding: '4px 8px', borderRadius: '4px' }}>Database</span></td>
                        <td>Amazon RDS (PostgreSQL)</td>
                        <td>db.r5.2xlarge, Multi-AZ</td>
                        <td>Metadata, predictions storage</td>
                        <td>Read replicas, connection pooling</td>
                      </tr>
                      <tr>
                        <td><span style={{ background: 'var(--purple-100)', color: 'var(--purple-700)', padding: '4px 8px', borderRadius: '4px' }}>Cache</span></td>
                        <td>Amazon ElastiCache (Redis)</td>
                        <td>r6g.large, cluster mode</td>
                        <td>Feature caching, rate limiting</td>
                        <td>Cluster scaling, read replicas</td>
                      </tr>
                      <tr>
                        <td><span style={{ background: 'var(--teal-100)', color: 'var(--teal-700)', padding: '4px 8px', borderRadius: '4px' }}>Storage</span></td>
                        <td>S3 + EFS</td>
                        <td>S3 Standard, EFS General Purpose</td>
                        <td>Model artifacts, training data</td>
                        <td>Lifecycle policies, intelligent tiering</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Monitoring & Observability */}
                <h5 style={{ color: 'var(--gray-700)', marginBottom: '12px' }}>Monitoring & Observability Stack</h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ background: 'var(--gray-50)', padding: '16px', borderRadius: '8px' }}>
                    <h6 style={{ color: 'var(--danger-600)', marginBottom: '8px' }}>Metrics (Prometheus)</h6>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: 'var(--gray-600)' }}>
                      <li>Request latency (p50, p95, p99)</li>
                      <li>Model inference time</li>
                      <li>Feature store latency</li>
                      <li>Queue depth and lag</li>
                      <li>Resource utilization</li>
                    </ul>
                  </div>
                  <div style={{ background: 'var(--gray-50)', padding: '16px', borderRadius: '8px' }}>
                    <h6 style={{ color: 'var(--warning-600)', marginBottom: '8px' }}>Logging (ELK Stack)</h6>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: 'var(--gray-600)' }}>
                      <li>Structured JSON logs</li>
                      <li>Correlation ID tracking</li>
                      <li>Error aggregation</li>
                      <li>Audit trail logging</li>
                      <li>30-day retention</li>
                    </ul>
                  </div>
                  <div style={{ background: 'var(--gray-50)', padding: '16px', borderRadius: '8px' }}>
                    <h6 style={{ color: 'var(--primary-600)', marginBottom: '8px' }}>Tracing (Jaeger)</h6>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: 'var(--gray-600)' }}>
                      <li>Distributed request tracing</li>
                      <li>Service dependency maps</li>
                      <li>Bottleneck identification</li>
                      <li>Error trace analysis</li>
                      <li>1% sampling rate</li>
                    </ul>
                  </div>
                  <div style={{ background: 'var(--gray-50)', padding: '16px', borderRadius: '8px' }}>
                    <h6 style={{ color: 'var(--success-600)', marginBottom: '8px' }}>Alerting (PagerDuty)</h6>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: 'var(--gray-600)' }}>
                      <li>SLA breach alerts</li>
                      <li>Error rate thresholds</li>
                      <li>Model drift alerts</li>
                      <li>Resource exhaustion</li>
                      <li>On-call rotation</li>
                    </ul>
                  </div>
                </div>

                {/* DevOps Challenges & Solutions */}
                <h5 style={{ color: 'var(--gray-700)', marginBottom: '12px' }}>Challenges & Solutions</h5>
                <div className="table-container" style={{ marginBottom: '24px' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Challenge</th>
                        <th>Impact</th>
                        <th>Solution</th>
                        <th>Tools Used</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Large model artifacts (2GB+)</td>
                        <td>Slow deployments, registry costs</td>
                        <td>Model compression, lazy loading, artifact caching</td>
                        <td>ONNX, S3 caching layer</td>
                      </tr>
                      <tr>
                        <td>GPU resource contention</td>
                        <td>Inference latency spikes</td>
                        <td>Time-slicing, dedicated inference pools</td>
                        <td>NVIDIA MPS, node affinity</td>
                      </tr>
                      <tr>
                        <td>Secret management at scale</td>
                        <td>Security risks, rotation complexity</td>
                        <td>External secrets operator, auto-rotation</td>
                        <td>AWS Secrets Manager, ESO</td>
                      </tr>
                      <tr>
                        <td>Configuration drift</td>
                        <td>Environment inconsistencies</td>
                        <td>GitOps with ArgoCD, policy enforcement</td>
                        <td>ArgoCD, OPA Gatekeeper</td>
                      </tr>
                      <tr>
                        <td>Disaster recovery</td>
                        <td>Business continuity risk</td>
                        <td>Multi-region active-passive, automated failover</td>
                        <td>Route53, Velero backups</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ background: 'var(--danger-50)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--danger-500)' }}>
                  <h5 style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--danger-700)' }}>DevOps Key Takeaways</h5>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--gray-700)' }}>
                    <li>Infrastructure as Code (Terraform) enables reproducible environments</li>
                    <li>GitOps workflow reduced deployment incidents by 80%</li>
                    <li>Comprehensive monitoring caught 95% of issues before customer impact</li>
                    <li>Chaos engineering validated our resilience assumptions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* As an AI Strategy/Digital Transformation Manager */}
          <div className="card">
            <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--purple-50), var(--purple-100))', borderBottom: '3px solid var(--purple-500)' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ background: 'var(--purple-500)', color: 'white', padding: '8px 12px', borderRadius: '8px' }}>As AI Strategy Manager</span>
                Digital Transformation Perspective
              </h3>
            </div>
            <div className="card-body">
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ color: 'var(--purple-700)', marginBottom: '16px', borderBottom: '2px solid var(--purple-200)', paddingBottom: '8px' }}>How I Would Explain This Project</h4>
                <div style={{ background: 'var(--gray-50)', padding: '20px', borderRadius: '12px', marginBottom: '16px' }}>
                  <p style={{ fontStyle: 'italic', color: 'var(--gray-700)', marginBottom: '16px' }}>
                    "As the AI Strategy lead for {useCase.name}, I drove the digital transformation initiative that delivered $7M in annual value.
                    I aligned AI capabilities with business strategy, established the AI Center of Excellence, and created a scalable
                    framework for enterprise-wide AI adoption. The initiative achieved 340% ROI within 18 months."
                  </p>
                </div>

                {/* Strategic Phases */}
                <h5 style={{ color: 'var(--gray-700)', marginBottom: '12px' }}>Digital Transformation Phases</h5>
                <div className="table-container" style={{ marginBottom: '24px' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Phase</th>
                        <th>Strategic Focus</th>
                        <th>Key Activities</th>
                        <th>Challenges</th>
                        <th>Solutions</th>
                        <th>Outcomes</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><span style={{ background: 'var(--purple-100)', color: 'var(--purple-700)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>Phase 1: Vision</span></td>
                        <td>Strategic Alignment</td>
                        <td>AI maturity assessment, opportunity identification, business case</td>
                        <td>Executive buy-in, unclear ROI</td>
                        <td>Benchmark studies, quick wins identification, pilot proposals</td>
                        <td>Board approval, $2M funding secured</td>
                      </tr>
                      <tr>
                        <td><span style={{ background: 'var(--indigo-100)', color: 'var(--indigo-700)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>Phase 2: Foundation</span></td>
                        <td>Capability Building</td>
                        <td>AI CoE setup, talent acquisition, platform selection</td>
                        <td>Skill gaps, technology choices</td>
                        <td>Training programs, strategic hiring, vendor evaluation</td>
                        <td>15-person AI team, cloud platform ready</td>
                      </tr>
                      <tr>
                        <td><span style={{ background: 'var(--teal-100)', color: 'var(--teal-700)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>Phase 3: Pilot</span></td>
                        <td>Value Demonstration</td>
                        <td>Use case prioritization, pilot execution, value tracking</td>
                        <td>Scope creep, integration issues</td>
                        <td>Agile methodology, MVP approach, stakeholder management</td>
                        <td>3 successful pilots, proven ROI</td>
                      </tr>
                      <tr>
                        <td><span style={{ background: 'var(--success-100)', color: 'var(--success-700)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>Phase 4: Scale</span></td>
                        <td>Enterprise Rollout</td>
                        <td>Industrialization, governance framework, change management</td>
                        <td>Organizational resistance, scaling complexity</td>
                        <td>Champion network, standardization, automation</td>
                        <td>12 use cases in production, enterprise adoption</td>
                      </tr>
                      <tr>
                        <td><span style={{ background: 'var(--warning-100)', color: 'var(--warning-700)', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>Phase 5: Optimize</span></td>
                        <td>Continuous Improvement</td>
                        <td>Performance optimization, new opportunities, innovation labs</td>
                        <td>Maintaining momentum, emerging tech adoption</td>
                        <td>Innovation sprints, R&D partnerships, continuous learning</td>
                        <td>AI-first culture, ongoing innovation</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Value Framework */}
                <div style={{ background: 'var(--gray-50)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                  <h5 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--gray-700)' }}>AI Value Framework</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div style={{ background: 'linear-gradient(135deg, var(--success-500), var(--success-600))', color: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', fontWeight: '700' }}>$2.8M</div>
                      <div style={{ fontSize: '14px', opacity: 0.9 }}>Cost Savings</div>
                      <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>Process automation, error reduction</div>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))', color: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', fontWeight: '700' }}>$4.2M</div>
                      <div style={{ fontSize: '14px', opacity: 0.9 }}>Revenue Growth</div>
                      <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>Personalization, upselling</div>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, var(--warning-500), var(--warning-600))', color: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', fontWeight: '700' }}>45%</div>
                      <div style={{ fontSize: '14px', opacity: 0.9 }}>Productivity Gain</div>
                      <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>Automation, decision support</div>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, var(--danger-500), var(--danger-600))', color: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', fontWeight: '700' }}>60%</div>
                      <div style={{ fontSize: '14px', opacity: 0.9 }}>Risk Reduction</div>
                      <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>Fraud, compliance, credit</div>
                    </div>
                  </div>
                </div>

                {/* Strategic Challenges */}
                <h5 style={{ color: 'var(--gray-700)', marginBottom: '12px' }}>Strategic Challenges & Solutions</h5>
                <div className="table-container" style={{ marginBottom: '24px' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Challenge Category</th>
                        <th>Specific Challenge</th>
                        <th>Business Impact</th>
                        <th>Strategic Solution</th>
                        <th>Success Metric</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><span style={{ background: 'var(--danger-100)', color: 'var(--danger-700)', padding: '4px 8px', borderRadius: '4px' }}>People</span></td>
                        <td>AI skill shortage across organization</td>
                        <td>Slow adoption, dependency on few experts</td>
                        <td>AI Academy program, citizen developer enablement</td>
                        <td>200+ employees trained, 50 citizen developers</td>
                      </tr>
                      <tr>
                        <td><span style={{ background: 'var(--warning-100)', color: 'var(--warning-700)', padding: '4px 8px', borderRadius: '4px' }}>Process</span></td>
                        <td>Legacy processes incompatible with AI</td>
                        <td>Integration failures, limited automation</td>
                        <td>Process reengineering, API-first transformation</td>
                        <td>85% of processes API-enabled</td>
                      </tr>
                      <tr>
                        <td><span style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', padding: '4px 8px', borderRadius: '4px' }}>Technology</span></td>
                        <td>Fragmented data across silos</td>
                        <td>Poor model accuracy, slow development</td>
                        <td>Enterprise data platform, data mesh architecture</td>
                        <td>90% data accessibility, 3x faster development</td>
                      </tr>
                      <tr>
                        <td><span style={{ background: 'var(--success-100)', color: 'var(--success-700)', padding: '4px 8px', borderRadius: '4px' }}>Governance</span></td>
                        <td>No AI governance framework</td>
                        <td>Regulatory risk, inconsistent practices</td>
                        <td>AI governance board, policies, audit framework</td>
                        <td>100% compliance, zero regulatory findings</td>
                      </tr>
                      <tr>
                        <td><span style={{ background: 'var(--purple-100)', color: 'var(--purple-700)', padding: '4px 8px', borderRadius: '4px' }}>Culture</span></td>
                        <td>Fear of AI replacing jobs</td>
                        <td>Resistance to adoption, sabotage risk</td>
                        <td>Augmentation narrative, reskilling commitment</td>
                        <td>85% employee AI sentiment positive</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* ROI Chart */}
                <div style={{ height: '300px', marginBottom: '24px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={[
                      { quarter: 'Q1', investment: 500, value: 100, maturity: 1.5 },
                      { quarter: 'Q2', investment: 450, value: 350, maturity: 2.0 },
                      { quarter: 'Q3', investment: 350, value: 680, maturity: 2.5 },
                      { quarter: 'Q4', investment: 280, value: 1100, maturity: 3.0 },
                      { quarter: 'Q5', investment: 220, value: 1450, maturity: 3.3 },
                      { quarter: 'Q6', investment: 180, value: 1850, maturity: 3.6 },
                      { quarter: 'Q7', investment: 150, value: 2200, maturity: 3.9 },
                      { quarter: 'Q8', investment: 120, value: 2600, maturity: 4.2 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="quarter" />
                      <YAxis yAxisId="left" label={{ value: 'Value ($K)', angle: -90, position: 'insideLeft' }} />
                      <YAxis yAxisId="right" orientation="right" domain={[0, 5]} label={{ value: 'Maturity Level', angle: 90, position: 'insideRight' }} />
                      <Tooltip />
                      <Area yAxisId="left" type="monotone" dataKey="investment" fill="var(--danger-100)" stroke="var(--danger-500)" name="Investment ($K)" />
                      <Area yAxisId="left" type="monotone" dataKey="value" fill="var(--success-100)" stroke="var(--success-500)" name="Value Generated ($K)" />
                      <Line yAxisId="right" type="monotone" dataKey="maturity" stroke="var(--purple-500)" strokeWidth={3} name="AI Maturity Level" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ background: 'var(--purple-50)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--purple-500)' }}>
                  <h5 style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--purple-700)' }}>AI Strategy Manager Key Takeaways</h5>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--gray-700)' }}>
                    <li>Start with business value, not technology - align AI to strategic priorities</li>
                    <li>Change management is 70% of the effort - invest heavily in people</li>
                    <li>Governance is an enabler, not a blocker - design it for speed with guardrails</li>
                    <li>Build for scale from day one - avoid pilot purgatory</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Deep Dive */}
          <div className="card">
            <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--teal-50), var(--teal-100))', borderBottom: '3px solid var(--teal-500)' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ background: 'var(--teal-500)', color: 'white', padding: '8px 12px', borderRadius: '8px' }}>Technical Deep Dive</span>
                Comprehensive Technical Reference
              </h3>
            </div>
            <div className="card-body">
              {/* Models Used */}
              <h5 style={{ color: 'var(--gray-700)', marginBottom: '12px' }}>Models & Algorithms</h5>
              <div className="table-container" style={{ marginBottom: '24px' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Model</th>
                      <th>Type</th>
                      <th>Use Case</th>
                      <th>Hyperparameters</th>
                      <th>Performance</th>
                      <th>Trade-offs</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>XGBoost</strong></td>
                      <td>Gradient Boosting</td>
                      <td>Primary classifier for tabular data</td>
                      <td>max_depth=8, learning_rate=0.05, n_estimators=500</td>
                      <td>AUC: 0.95, F1: 0.92</td>
                      <td>Best accuracy, slower inference</td>
                    </tr>
                    <tr>
                      <td><strong>LightGBM</strong></td>
                      <td>Gradient Boosting</td>
                      <td>Ensemble component, fast inference</td>
                      <td>num_leaves=64, max_depth=-1, learning_rate=0.03</td>
                      <td>AUC: 0.94, F1: 0.90</td>
                      <td>Fast training, lower memory</td>
                    </tr>
                    <tr>
                      <td><strong>CatBoost</strong></td>
                      <td>Gradient Boosting</td>
                      <td>Categorical feature handling</td>
                      <td>depth=8, iterations=800, learning_rate=0.04</td>
                      <td>AUC: 0.94, F1: 0.91</td>
                      <td>Best for categorical, slower training</td>
                    </tr>
                    <tr>
                      <td><strong>LSTM</strong></td>
                      <td>Deep Learning (RNN)</td>
                      <td>Sequential transaction patterns</td>
                      <td>units=128, layers=2, dropout=0.3</td>
                      <td>AUC: 0.92, F1: 0.88</td>
                      <td>Captures sequences, needs more data</td>
                    </tr>
                    <tr>
                      <td><strong>Transformer</strong></td>
                      <td>Deep Learning (Attention)</td>
                      <td>Complex pattern recognition</td>
                      <td>heads=8, layers=4, d_model=256</td>
                      <td>AUC: 0.93, F1: 0.89</td>
                      <td>Best for long sequences, GPU intensive</td>
                    </tr>
                    <tr>
                      <td><strong>Isolation Forest</strong></td>
                      <td>Anomaly Detection</td>
                      <td>Outlier detection, unsupervised</td>
                      <td>n_estimators=200, contamination=0.01</td>
                      <td>Precision: 0.85</td>
                      <td>No labels needed, less precise</td>
                    </tr>
                    <tr>
                      <td><strong>AutoEncoder</strong></td>
                      <td>Deep Learning</td>
                      <td>Anomaly detection via reconstruction</td>
                      <td>encoding_dim=32, layers=[128,64,32]</td>
                      <td>AUC: 0.90</td>
                      <td>Captures complex patterns, threshold tuning</td>
                    </tr>
                    <tr>
                      <td><strong>Meta-Learner (Stacking)</strong></td>
                      <td>Ensemble</td>
                      <td>Final prediction aggregation</td>
                      <td>Logistic regression with L2</td>
                      <td>AUC: 0.96, F1: 0.93</td>
                      <td>Best overall, complexity</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Loss Functions & Optimization */}
              <h5 style={{ color: 'var(--gray-700)', marginBottom: '12px' }}>Loss Functions & Optimization</h5>
              <div className="table-container" style={{ marginBottom: '24px' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Loss Function</th>
                      <th>Formula</th>
                      <th>Use Case</th>
                      <th>Advantages</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Focal Loss</strong></td>
                      <td>-α(1-p)^γ log(p)</td>
                      <td>Imbalanced classification</td>
                      <td>Down-weights easy examples, focuses on hard cases</td>
                    </tr>
                    <tr>
                      <td><strong>Binary Cross-Entropy</strong></td>
                      <td>-[y log(p) + (1-y) log(1-p)]</td>
                      <td>Standard binary classification</td>
                      <td>Standard, well-understood, stable gradients</td>
                    </tr>
                    <tr>
                      <td><strong>Weighted BCE</strong></td>
                      <td>-[w₁y log(p) + w₀(1-y) log(1-p)]</td>
                      <td>Class imbalance handling</td>
                      <td>Simple adjustment for class weights</td>
                    </tr>
                    <tr>
                      <td><strong>AUC Loss</strong></td>
                      <td>Pairwise ranking loss</td>
                      <td>Optimizing for ranking metrics</td>
                      <td>Directly optimizes AUC-ROC</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Statistical Analysis */}
              <h5 style={{ color: 'var(--gray-700)', marginBottom: '12px' }}>Statistical Analysis Performed</h5>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'var(--gray-50)', padding: '16px', borderRadius: '8px' }}>
                  <h6 style={{ color: 'var(--primary-600)', marginBottom: '12px' }}>Exploratory Data Analysis</h6>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: 'var(--gray-600)' }}>
                    <li>Distribution analysis (skewness, kurtosis)</li>
                    <li>Correlation matrix heatmaps</li>
                    <li>Missing value patterns (MCAR/MAR/MNAR)</li>
                    <li>Outlier detection (IQR, Z-score)</li>
                    <li>Feature cardinality analysis</li>
                  </ul>
                </div>
                <div style={{ background: 'var(--gray-50)', padding: '16px', borderRadius: '8px' }}>
                  <h6 style={{ color: 'var(--success-600)', marginBottom: '12px' }}>Feature Analysis</h6>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: 'var(--gray-600)' }}>
                    <li>Information gain / mutual information</li>
                    <li>Chi-squared test for categorical</li>
                    <li>ANOVA F-test for numerical</li>
                    <li>VIF for multicollinearity</li>
                    <li>Recursive feature elimination</li>
                  </ul>
                </div>
                <div style={{ background: 'var(--gray-50)', padding: '16px', borderRadius: '8px' }}>
                  <h6 style={{ color: 'var(--warning-600)', marginBottom: '12px' }}>Model Validation</h6>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: 'var(--gray-600)' }}>
                    <li>K-fold cross-validation (k=5)</li>
                    <li>Stratified sampling for imbalanced data</li>
                    <li>Time-series cross-validation</li>
                    <li>Bootstrap confidence intervals</li>
                    <li>Statistical significance testing (p &lt; 0.05)</li>
                  </ul>
                </div>
                <div style={{ background: 'var(--gray-50)', padding: '16px', borderRadius: '8px' }}>
                  <h6 style={{ color: 'var(--danger-600)', marginBottom: '12px' }}>Sensitivity Analysis</h6>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: 'var(--gray-600)' }}>
                    <li>Threshold sensitivity curves</li>
                    <li>Feature perturbation analysis</li>
                    <li>Hyperparameter sensitivity</li>
                    <li>Input noise robustness testing</li>
                    <li>Adversarial example testing</li>
                  </ul>
                </div>
              </div>

              {/* Accuracy Metrics */}
              <h5 style={{ color: 'var(--gray-700)', marginBottom: '12px' }}>Accuracy & Performance Metrics</h5>
              <div style={{ height: '300px', marginBottom: '24px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { model: 'XGBoost', accuracy: 94.5, precision: 93.2, recall: 91.8, f1: 92.5, auc: 95.2 },
                    { model: 'LightGBM', accuracy: 93.8, precision: 92.5, recall: 90.2, f1: 91.3, auc: 94.1 },
                    { model: 'CatBoost', accuracy: 94.2, precision: 92.8, recall: 91.5, f1: 92.1, auc: 94.8 },
                    { model: 'LSTM', accuracy: 91.5, precision: 90.2, recall: 88.5, f1: 89.3, auc: 92.4 },
                    { model: 'Transformer', accuracy: 92.8, precision: 91.5, recall: 89.8, f1: 90.6, auc: 93.2 },
                    { model: 'Ensemble', accuracy: 95.8, precision: 94.5, recall: 93.2, f1: 93.8, auc: 96.5 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="model" />
                    <YAxis domain={[85, 100]} />
                    <Tooltip />
                    <Bar dataKey="accuracy" fill="var(--primary-500)" name="Accuracy %" />
                    <Bar dataKey="precision" fill="var(--success-500)" name="Precision %" />
                    <Bar dataKey="recall" fill="var(--warning-500)" name="Recall %" />
                    <Bar dataKey="auc" fill="var(--purple-500)" name="AUC %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: 'var(--teal-50)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--teal-500)' }}>
                <h5 style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--teal-700)' }}>Technical Summary</h5>
                <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--gray-700)' }}>
                  <li>Ensemble approach outperforms individual models by 2-4%</li>
                  <li>Focal loss critical for handling 100:1 class imbalance</li>
                  <li>Feature engineering contributes 30% of model performance</li>
                  <li>Regular A/B testing validates model improvements before production</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Export Section */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Export Interview Guide</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => handleExport('Interview Guide PDF')}>
                  <Icon name="file" size={16} /> Export Complete Guide
                </button>
                <button className="btn btn-secondary" onClick={() => handleExport('Architect Guide')}>
                  <Icon name="layout" size={16} /> Architect Section
                </button>
                <button className="btn btn-secondary" onClick={() => handleExport('Developer Guide')}>
                  <Icon name="code" size={16} /> Developer Section
                </button>
                <button className="btn btn-secondary" onClick={() => handleExport('DevOps Guide')}>
                  <Icon name="terminal" size={16} /> DevOps Section
                </button>
                <button className="btn btn-secondary" onClick={() => handleExport('Strategy Guide')}>
                  <Icon name="trending-up" size={16} /> Strategy Section
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cost Analysis Tab */}
      {activeTab === 'cost-analysis' && (
        <div className="grid grid-cols-1" style={{ gap: '24px' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--danger-600) 0%, var(--danger-800) 100%)', color: 'white' }}>
            <div className="card-body" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px', color: 'white' }}>Cost Analysis Dashboard</h2>
              <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '24px' }}>
                Total Cost of Ownership (TCO) analysis for {useCase.name} including infrastructure, compute, and operational costs.
              </p>
              <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', fontWeight: '700' }}>$47.2K</div>
                  <div style={{ fontSize: '14px', opacity: 0.8 }}>Monthly TCO</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', fontWeight: '700' }}>$0.0023</div>
                  <div style={{ fontSize: '14px', opacity: 0.8 }}>Cost per Prediction</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', fontWeight: '700' }}>340%</div>
                  <div style={{ fontSize: '14px', opacity: 0.8 }}>ROI</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', fontWeight: '700' }}>-12%</div>
                  <div style={{ fontSize: '14px', opacity: 0.8 }}>vs Last Month</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2" style={{ gap: '24px' }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Cost Breakdown by Category</h3>
              </div>
              <div className="card-body">
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { category: 'Compute (GPU)', cost: 18500, budget: 20000 },
                      { category: 'Storage (S3)', cost: 4200, budget: 5000 },
                      { category: 'Database', cost: 6800, budget: 7000 },
                      { category: 'Networking', cost: 3200, budget: 4000 },
                      { category: 'Kafka/Streaming', cost: 5500, budget: 6000 },
                      { category: 'Monitoring', cost: 2100, budget: 2500 },
                      { category: 'ML Platform', cost: 6900, budget: 8000 }
                    ]} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} />
                      <YAxis type="category" dataKey="category" width={120} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
                      <Bar dataKey="cost" fill="var(--danger-500)" name="Actual Cost" />
                      <Bar dataKey="budget" fill="var(--gray-300)" name="Budget" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Cost Trend (Last 6 Months)</h3>
              </div>
              <div className="card-body">
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { month: 'Aug', compute: 22000, storage: 4800, database: 7200, other: 15000 },
                      { month: 'Sep', compute: 21000, storage: 4600, database: 7000, other: 14500 },
                      { month: 'Oct', compute: 20500, storage: 4400, database: 6900, other: 14000 },
                      { month: 'Nov', compute: 19500, storage: 4300, database: 6850, other: 13500 },
                      { month: 'Dec', compute: 19000, storage: 4250, database: 6800, other: 13000 },
                      { month: 'Jan', compute: 18500, storage: 4200, database: 6800, other: 12700 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} />
                      <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
                      <Area type="monotone" dataKey="compute" stackId="1" stroke="var(--danger-500)" fill="var(--danger-200)" name="Compute" />
                      <Area type="monotone" dataKey="storage" stackId="1" stroke="var(--warning-500)" fill="var(--warning-200)" name="Storage" />
                      <Area type="monotone" dataKey="database" stackId="1" stroke="var(--primary-500)" fill="var(--primary-200)" name="Database" />
                      <Area type="monotone" dataKey="other" stackId="1" stroke="var(--success-500)" fill="var(--success-200)" name="Other" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Detailed Cost Breakdown</h3>
            </div>
            <div className="card-body">
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Resource</th>
                      <th>Service</th>
                      <th>Instance/Tier</th>
                      <th>Quantity</th>
                      <th>Unit Cost</th>
                      <th>Monthly Cost</th>
                      <th>Budget</th>
                      <th>Variance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span style={{ background: 'var(--danger-100)', color: 'var(--danger-700)', padding: '4px 8px', borderRadius: '4px' }}>GPU Compute</span></td>
                      <td>AWS EC2</td>
                      <td>g4dn.xlarge</td>
                      <td>5 instances</td>
                      <td>$0.526/hr</td>
                      <td>$18,936</td>
                      <td>$20,000</td>
                      <td><span style={{ color: 'var(--success-600)' }}>-5.3%</span></td>
                    </tr>
                    <tr>
                      <td><span style={{ background: 'var(--warning-100)', color: 'var(--warning-700)', padding: '4px 8px', borderRadius: '4px' }}>Storage</span></td>
                      <td>AWS S3</td>
                      <td>Standard + IA</td>
                      <td>15 TB</td>
                      <td>$0.023/GB</td>
                      <td>$4,200</td>
                      <td>$5,000</td>
                      <td><span style={{ color: 'var(--success-600)' }}>-16%</span></td>
                    </tr>
                    <tr>
                      <td><span style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', padding: '4px 8px', borderRadius: '4px' }}>Database</span></td>
                      <td>AWS RDS</td>
                      <td>db.r5.2xlarge</td>
                      <td>2 instances</td>
                      <td>$0.48/hr</td>
                      <td>$6,912</td>
                      <td>$7,000</td>
                      <td><span style={{ color: 'var(--success-600)' }}>-1.3%</span></td>
                    </tr>
                    <tr>
                      <td><span style={{ background: 'var(--success-100)', color: 'var(--success-700)', padding: '4px 8px', borderRadius: '4px' }}>Cache</span></td>
                      <td>ElastiCache</td>
                      <td>r6g.large</td>
                      <td>3 nodes</td>
                      <td>$0.126/hr</td>
                      <td>$2,721</td>
                      <td>$3,000</td>
                      <td><span style={{ color: 'var(--success-600)' }}>-9.3%</span></td>
                    </tr>
                    <tr>
                      <td><span style={{ background: 'var(--purple-100)', color: 'var(--purple-700)', padding: '4px 8px', borderRadius: '4px' }}>Streaming</span></td>
                      <td>AWS MSK</td>
                      <td>kafka.m5.large</td>
                      <td>6 brokers</td>
                      <td>$0.21/hr</td>
                      <td>$5,443</td>
                      <td>$6,000</td>
                      <td><span style={{ color: 'var(--success-600)' }}>-9.3%</span></td>
                    </tr>
                    <tr>
                      <td><span style={{ background: 'var(--teal-100)', color: 'var(--teal-700)', padding: '4px 8px', borderRadius: '4px' }}>ML Platform</span></td>
                      <td>SageMaker</td>
                      <td>Various</td>
                      <td>On-demand</td>
                      <td>Variable</td>
                      <td>$6,850</td>
                      <td>$8,000</td>
                      <td><span style={{ color: 'var(--success-600)' }}>-14.4%</span></td>
                    </tr>
                    <tr style={{ background: 'var(--gray-50)', fontWeight: '600' }}>
                      <td colSpan="5"><strong>TOTAL</strong></td>
                      <td><strong>$47,162</strong></td>
                      <td><strong>$52,000</strong></td>
                      <td><span style={{ color: 'var(--success-600)' }}><strong>-9.3%</strong></span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Cost Optimization Recommendations</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                <div style={{ background: 'var(--success-50)', padding: '16px', borderRadius: '8px', border: '1px solid var(--success-200)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '600', color: 'var(--success-700)' }}>Reserved Instances</span>
                    <span style={{ color: 'var(--success-600)' }}>Save $4,200/mo</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Convert 3 GPU instances to 1-year reserved. 35% savings on compute costs.</p>
                </div>
                <div style={{ background: 'var(--warning-50)', padding: '16px', borderRadius: '8px', border: '1px solid var(--warning-200)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '600', color: 'var(--warning-700)' }}>S3 Lifecycle Policies</span>
                    <span style={{ color: 'var(--warning-600)' }}>Save $800/mo</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Move training artifacts older than 30 days to Glacier. 40% storage savings.</p>
                </div>
                <div style={{ background: 'var(--primary-50)', padding: '16px', borderRadius: '8px', border: '1px solid var(--primary-200)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '600', color: 'var(--primary-700)' }}>Spot Instances for Training</span>
                    <span style={{ color: 'var(--primary-600)' }}>Save $2,100/mo</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Use spot instances for batch training jobs. 70% compute savings during training.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drift Monitoring Tab */}
      {activeTab === 'drift-monitoring' && (
        <div className="grid grid-cols-1" style={{ gap: '24px' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--warning-500) 0%, var(--warning-700) 100%)', color: 'white' }}>
            <div className="card-body" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px', color: 'white' }}>Model Drift Monitoring</h2>
              <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '24px' }}>
                Real-time monitoring of data drift, concept drift, and feature distribution changes for {useCase.name}.
              </p>
              <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.2)', padding: '16px 24px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '28px', fontWeight: '700' }}>LOW</div>
                  <div style={{ fontSize: '14px', opacity: 0.8 }}>Data Drift</div>
                </div>
                <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.2)', padding: '16px 24px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '28px', fontWeight: '700' }}>NONE</div>
                  <div style={{ fontSize: '14px', opacity: 0.8 }}>Concept Drift</div>
                </div>
                <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.2)', padding: '16px 24px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '28px', fontWeight: '700' }}>2</div>
                  <div style={{ fontSize: '14px', opacity: 0.8 }}>Feature Alerts</div>
                </div>
                <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.2)', padding: '16px 24px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '28px', fontWeight: '700' }}>14d</div>
                  <div style={{ fontSize: '14px', opacity: 0.8 }}>Since Last Retrain</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2" style={{ gap: '24px' }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">PSI Score Trend (Population Stability Index)</h3>
              </div>
              <div className="card-body">
                <div style={{ height: '280px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { day: 'Day 1', psi: 0.02, threshold: 0.25 },
                      { day: 'Day 3', psi: 0.03, threshold: 0.25 },
                      { day: 'Day 5', psi: 0.04, threshold: 0.25 },
                      { day: 'Day 7', psi: 0.05, threshold: 0.25 },
                      { day: 'Day 9', psi: 0.08, threshold: 0.25 },
                      { day: 'Day 11', psi: 0.12, threshold: 0.25 },
                      { day: 'Day 13', psi: 0.09, threshold: 0.25 },
                      { day: 'Day 14', psi: 0.11, threshold: 0.25 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis domain={[0, 0.3]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="psi" stroke="var(--warning-500)" strokeWidth={2} name="PSI Score" />
                      <Line type="monotone" dataKey="threshold" stroke="var(--danger-500)" strokeDasharray="5 5" name="Alert Threshold" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--gray-600)' }}>
                  PSI &lt; 0.1: No drift | 0.1-0.25: Moderate drift | &gt; 0.25: Significant drift
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Prediction Distribution Shift</h3>
              </div>
              <div className="card-body">
                <div style={{ height: '280px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { score: '0-0.1', training: 850, production: 820 },
                      { score: '0.1-0.2', training: 420, production: 450 },
                      { score: '0.2-0.3', training: 280, production: 310 },
                      { score: '0.3-0.4', training: 180, production: 165 },
                      { score: '0.4-0.5', training: 120, production: 140 },
                      { score: '0.5-0.6', training: 85, production: 95 },
                      { score: '0.6-0.7', training: 45, production: 52 },
                      { score: '0.7-0.8', training: 28, production: 35 },
                      { score: '0.8-0.9', training: 15, production: 18 },
                      { score: '0.9-1.0', training: 8, production: 12 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="score" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="training" stroke="var(--primary-500)" fill="var(--primary-200)" name="Training Distribution" />
                      <Area type="monotone" dataKey="production" stroke="var(--success-500)" fill="var(--success-200)" name="Production Distribution" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Feature Drift Analysis</h3>
            </div>
            <div className="card-body">
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Feature</th>
                      <th>Type</th>
                      <th>PSI Score</th>
                      <th>KS Statistic</th>
                      <th>Training Mean</th>
                      <th>Production Mean</th>
                      <th>% Change</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>transaction_amount</strong></td>
                      <td>Numerical</td>
                      <td>0.18</td>
                      <td>0.12</td>
                      <td>$2,450</td>
                      <td>$2,890</td>
                      <td style={{ color: 'var(--warning-600)' }}>+18%</td>
                      <td><span className="status-badge warning"><span className="status-dot" />Moderate</span></td>
                    </tr>
                    <tr>
                      <td><strong>transaction_velocity_7d</strong></td>
                      <td>Numerical</td>
                      <td>0.22</td>
                      <td>0.15</td>
                      <td>12.4</td>
                      <td>15.8</td>
                      <td style={{ color: 'var(--warning-600)' }}>+27%</td>
                      <td><span className="status-badge warning"><span className="status-dot" />Moderate</span></td>
                    </tr>
                    <tr>
                      <td><strong>merchant_category</strong></td>
                      <td>Categorical</td>
                      <td>0.05</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td><span className="status-badge success"><span className="status-dot" />Stable</span></td>
                    </tr>
                    <tr>
                      <td><strong>device_fingerprint</strong></td>
                      <td>Categorical</td>
                      <td>0.08</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td><span className="status-badge success"><span className="status-dot" />Stable</span></td>
                    </tr>
                    <tr>
                      <td><strong>time_since_last_txn</strong></td>
                      <td>Numerical</td>
                      <td>0.03</td>
                      <td>0.02</td>
                      <td>4.2 hrs</td>
                      <td>4.5 hrs</td>
                      <td style={{ color: 'var(--gray-600)' }}>+7%</td>
                      <td><span className="status-badge success"><span className="status-dot" />Stable</span></td>
                    </tr>
                    <tr>
                      <td><strong>geo_distance</strong></td>
                      <td>Numerical</td>
                      <td>0.04</td>
                      <td>0.03</td>
                      <td>25.6 km</td>
                      <td>28.1 km</td>
                      <td style={{ color: 'var(--gray-600)' }}>+10%</td>
                      <td><span className="status-badge success"><span className="status-dot" />Stable</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Drift Actions</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button className="btn btn-warning" onClick={() => setNotification({ type: 'info', message: 'Triggering model retraining pipeline...' })}>
                  <Icon name="refresh-cw" size={16} /> Trigger Retraining
                </button>
                <button className="btn btn-secondary" onClick={() => handleExport('Drift Report')}>
                  <Icon name="file" size={16} /> Export Drift Report
                </button>
                <button className="btn btn-secondary" onClick={() => setNotification({ type: 'success', message: 'Alert thresholds updated!' })}>
                  <Icon name="settings" size={16} /> Configure Thresholds
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Incidents Tab */}
      {activeTab === 'incidents' && (
        <div className="grid grid-cols-1" style={{ gap: '24px' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--danger-600) 0%, var(--danger-800) 100%)', color: 'white' }}>
            <div className="card-body" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px', color: 'white' }}>Incident Management</h2>
              <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', fontWeight: '700' }}>0</div>
                  <div style={{ fontSize: '14px', opacity: 0.8 }}>Active P1/P2</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', fontWeight: '700' }}>2</div>
                  <div style={{ fontSize: '14px', opacity: 0.8 }}>This Month</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', fontWeight: '700' }}>45min</div>
                  <div style={{ fontSize: '14px', opacity: 0.8 }}>Avg MTTR</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', fontWeight: '700' }}>99.95%</div>
                  <div style={{ fontSize: '14px', opacity: 0.8 }}>Uptime (30d)</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Incident History</h3>
            </div>
            <div className="card-body">
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Severity</th>
                      <th>Title</th>
                      <th>Started</th>
                      <th>Duration</th>
                      <th>Root Cause</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>INC-2025-042</code></td>
                      <td><span style={{ background: 'var(--warning-100)', color: 'var(--warning-700)', padding: '4px 8px', borderRadius: '4px' }}>P3</span></td>
                      <td>Elevated latency in prediction API</td>
                      <td>Jan 25, 14:32</td>
                      <td>28 min</td>
                      <td>Redis cache eviction during peak load</td>
                      <td><span className="status-badge success"><span className="status-dot" />Resolved</span></td>
                      <td><button className="btn btn-sm btn-secondary" onClick={() => setNotification({ type: 'info', message: 'Loading RCA report...' })}>View RCA</button></td>
                    </tr>
                    <tr>
                      <td><code>INC-2025-038</code></td>
                      <td><span style={{ background: 'var(--danger-100)', color: 'var(--danger-700)', padding: '4px 8px', borderRadius: '4px' }}>P2</span></td>
                      <td>Model serving pods OOMKilled</td>
                      <td>Jan 18, 09:15</td>
                      <td>52 min</td>
                      <td>Memory leak in feature preprocessing</td>
                      <td><span className="status-badge success"><span className="status-dot" />Resolved</span></td>
                      <td><button className="btn btn-sm btn-secondary" onClick={() => setNotification({ type: 'info', message: 'Loading RCA report...' })}>View RCA</button></td>
                    </tr>
                    <tr>
                      <td><code>INC-2025-029</code></td>
                      <td><span style={{ background: 'var(--warning-100)', color: 'var(--warning-700)', padding: '4px 8px', borderRadius: '4px' }}>P3</span></td>
                      <td>Kafka consumer lag spike</td>
                      <td>Jan 10, 22:45</td>
                      <td>35 min</td>
                      <td>Partition rebalancing during deployment</td>
                      <td><span className="status-badge success"><span className="status-dot" />Resolved</span></td>
                      <td><button className="btn btn-sm btn-secondary" onClick={() => setNotification({ type: 'info', message: 'Loading RCA report...' })}>View RCA</button></td>
                    </tr>
                    <tr>
                      <td><code>INC-2024-412</code></td>
                      <td><span style={{ background: 'var(--danger-100)', color: 'var(--danger-700)', padding: '4px 8px', borderRadius: '4px' }}>P1</span></td>
                      <td>Complete prediction service outage</td>
                      <td>Dec 15, 03:22</td>
                      <td>1h 15min</td>
                      <td>Database connection pool exhaustion</td>
                      <td><span className="status-badge success"><span className="status-dot" />Resolved</span></td>
                      <td><button className="btn btn-sm btn-secondary" onClick={() => setNotification({ type: 'info', message: 'Loading RCA report...' })}>View RCA</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2" style={{ gap: '24px' }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">MTTR Trend</h3>
              </div>
              <div className="card-body">
                <div style={{ height: '250px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { month: 'Aug', mttr: 95, target: 60 },
                      { month: 'Sep', mttr: 78, target: 60 },
                      { month: 'Oct', mttr: 65, target: 60 },
                      { month: 'Nov', mttr: 55, target: 60 },
                      { month: 'Dec', mttr: 52, target: 60 },
                      { month: 'Jan', mttr: 45, target: 60 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="mttr" stroke="var(--primary-500)" strokeWidth={2} name="MTTR (min)" />
                      <Line type="monotone" dataKey="target" stroke="var(--success-500)" strokeDasharray="5 5" name="Target" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Incidents by Category</h3>
              </div>
              <div className="card-body">
                <div style={{ height: '250px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { category: 'Infrastructure', count: 8 },
                      { category: 'Model/ML', count: 5 },
                      { category: 'Data Pipeline', count: 4 },
                      { category: 'Integration', count: 3 },
                      { category: 'Security', count: 1 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="var(--danger-500)" name="Incident Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SLA Dashboard Tab */}
      {activeTab === 'sla-dashboard' && (
        <div className="grid grid-cols-1" style={{ gap: '24px' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--success-500) 0%, var(--success-700) 100%)', color: 'white' }}>
            <div className="card-body" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px', color: 'white' }}>SLA Dashboard</h2>
              <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '36px', fontWeight: '700' }}>99.95%</div><div style={{ fontSize: '14px', opacity: 0.8 }}>Uptime</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '36px', fontWeight: '700' }}>142ms</div><div style={{ fontSize: '14px', opacity: 0.8 }}>P95 Latency</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '36px', fontWeight: '700' }}>0.02%</div><div style={{ fontSize: '14px', opacity: 0.8 }}>Error Rate</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '36px', fontWeight: '700' }}>78%</div><div style={{ fontSize: '14px', opacity: 0.8 }}>Error Budget</div></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3" style={{ gap: '16px' }}>
            <div className="card" style={{ background: 'var(--success-50)', border: '2px solid var(--success-300)' }}><div className="card-body" style={{ textAlign: 'center', padding: '24px' }}><div style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '8px' }}>Availability</div><div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--success-600)' }}>99.95%</div><div style={{ fontSize: '13px', color: 'var(--success-600)', marginTop: '8px' }}>Target: 99.9% | Met</div></div></div>
            <div className="card" style={{ background: 'var(--success-50)', border: '2px solid var(--success-300)' }}><div className="card-body" style={{ textAlign: 'center', padding: '24px' }}><div style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '8px' }}>Latency (P95)</div><div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--success-600)' }}>142ms</div><div style={{ fontSize: '13px', color: 'var(--success-600)', marginTop: '8px' }}>Target: 200ms | Met</div></div></div>
            <div className="card" style={{ background: 'var(--success-50)', border: '2px solid var(--success-300)' }}><div className="card-body" style={{ textAlign: 'center', padding: '24px' }}><div style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '8px' }}>Error Rate</div><div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--success-600)' }}>0.02%</div><div style={{ fontSize: '13px', color: 'var(--success-600)', marginTop: '8px' }}>Target: 0.1% | Met</div></div></div>
          </div>
        </div>
      )}

      {/* A/B Testing Tab */}
      {activeTab === 'ab-testing' && (
        <div className="grid grid-cols-1" style={{ gap: '24px' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--teal-500) 0%, var(--teal-700) 100%)', color: 'white' }}>
            <div className="card-body" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px', color: 'white' }}>A/B Testing</h2>
              <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '36px', fontWeight: '700' }}>2</div><div style={{ fontSize: '14px', opacity: 0.8 }}>Active Experiments</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '36px', fontWeight: '700' }}>+2.3%</div><div style={{ fontSize: '14px', opacity: 0.8 }}>Avg Lift</div></div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h3 className="card-title">Active Experiments</h3></div>
            <div className="card-body">
              <div className="table-container">
                <table className="data-table">
                  <thead><tr><th>Experiment</th><th>Hypothesis</th><th>Split</th><th>Lift</th><th>P-Value</th><th>Status</th></tr></thead>
                  <tbody>
                    <tr><td><strong>EXP-018</strong></td><td>New ensemble weights</td><td>90/10</td><td style={{ color: 'var(--success-600)' }}>+1.8%</td><td>0.023</td><td><span className="status-badge success"><span className="status-dot" />Significant</span></td></tr>
                    <tr><td><strong>EXP-019</strong></td><td>Transformer features</td><td>95/5</td><td style={{ color: 'var(--warning-600)' }}>+0.6%</td><td>0.142</td><td><span className="status-badge warning"><span className="status-dot" />Running</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bias & Fairness Tab */}
      {activeTab === 'bias-fairness' && (
        <div className="grid grid-cols-1" style={{ gap: '24px' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--pink-500) 0%, var(--pink-700) 100%)', color: 'white' }}>
            <div className="card-body" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px', color: 'white' }}>Bias & Fairness</h2>
              <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '36px', fontWeight: '700' }}>0.98</div><div style={{ fontSize: '14px', opacity: 0.8 }}>Demographic Parity</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '36px', fontWeight: '700' }}>0.96</div><div style={{ fontSize: '14px', opacity: 0.8 }}>Equalized Odds</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '36px', fontWeight: '700' }}>1.02</div><div style={{ fontSize: '14px', opacity: 0.8 }}>Disparate Impact</div></div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h3 className="card-title">Fairness by Segment</h3></div>
            <div className="card-body">
              <div className="table-container">
                <table className="data-table">
                  <thead><tr><th>Segment</th><th>Population</th><th>Approval</th><th>Precision</th><th>Status</th></tr></thead>
                  <tbody>
                    <tr><td>Age 18-30</td><td>28%</td><td>72.3%</td><td>93.5%</td><td><span className="status-badge success"><span className="status-dot" />Fair</span></td></tr>
                    <tr><td>Age 31-50</td><td>42%</td><td>74.1%</td><td>94.2%</td><td><span className="status-badge success"><span className="status-dot" />Fair</span></td></tr>
                    <tr><td>Age 51+</td><td>30%</td><td>73.8%</td><td>93.8%</td><td><span className="status-badge success"><span className="status-dot" />Fair</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Loop Tab */}
      {activeTab === 'feedback-loop' && (
        <div className="grid grid-cols-1" style={{ gap: '24px' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--cyan-500) 0%, var(--cyan-700) 100%)', color: 'white' }}>
            <div className="card-body" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px', color: 'white' }}>Human Feedback Loop</h2>
              <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '36px', fontWeight: '700' }}>1,247</div><div style={{ fontSize: '14px', opacity: 0.8 }}>Pending</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '36px', fontWeight: '700' }}>8,432</div><div style={{ fontSize: '14px', opacity: 0.8 }}>Reviewed</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '36px', fontWeight: '700' }}>4.2%</div><div style={{ fontSize: '14px', opacity: 0.8 }}>Override Rate</div></div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h3 className="card-title">Review Queue</h3></div>
            <div className="card-body">
              <div className="table-container">
                <table className="data-table">
                  <thead><tr><th>Case</th><th>Prediction</th><th>Confidence</th><th>Actions</th></tr></thead>
                  <tbody>
                    <tr><td><code>TXN-89421</code></td><td style={{ color: 'var(--danger-600)' }}>Fraud</td><td>72%</td><td><button className="btn btn-sm btn-success" style={{ marginRight: '8px' }} onClick={() => setNotification({ type: 'success', message: 'Confirmed!' })}>Confirm</button><button className="btn btn-sm btn-danger" onClick={() => setNotification({ type: 'info', message: 'Override recorded' })}>Override</button></td></tr>
                    <tr><td><code>TXN-89398</code></td><td style={{ color: 'var(--success-600)' }}>Legit</td><td>85%</td><td><button className="btn btn-sm btn-success" style={{ marginRight: '8px' }} onClick={() => setNotification({ type: 'success', message: 'Confirmed!' })}>Confirm</button><button className="btn btn-sm btn-danger" onClick={() => setNotification({ type: 'info', message: 'Override recorded' })}>Override</button></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Version History Tab */}
      {activeTab === 'version-history' && (
        <div className="grid grid-cols-1" style={{ gap: '24px' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--indigo-500) 0%, var(--indigo-700) 100%)', color: 'white' }}>
            <div className="card-body" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px', color: 'white' }}>Version History</h2>
              <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '36px', fontWeight: '700' }}>v2.3.1</div><div style={{ fontSize: '14px', opacity: 0.8 }}>Current</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '36px', fontWeight: '700' }}>24</div><div style={{ fontSize: '14px', opacity: 0.8 }}>Versions</div></div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h3 className="card-title">Model Versions</h3></div>
            <div className="card-body">
              <div className="table-container">
                <table className="data-table">
                  <thead><tr><th>Version</th><th>Date</th><th>Accuracy</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    <tr><td><strong>v2.3.1</strong></td><td>Jan 15</td><td>{useCase.accuracy > 0 ? useCase.accuracy.toFixed(1) : 95.2}%</td><td><span className="status-badge success"><span className="status-dot" />Production</span></td><td><button className="btn btn-sm btn-secondary" disabled>Current</button></td></tr>
                    <tr><td>v2.3.0</td><td>Jan 8</td><td>94.8%</td><td><span className="status-badge info"><span className="status-dot" />Archived</span></td><td><button className="btn btn-sm btn-warning" onClick={() => setNotification({ type: 'warning', message: 'Rolling back...' })}>Rollback</button></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Lineage Tab */}
      {activeTab === 'data-lineage' && (
        <div className="grid grid-cols-1" style={{ gap: '24px' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--orange-500) 0%, var(--orange-700) 100%)', color: 'white' }}>
            <div className="card-body" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px', color: 'white' }}>Data Lineage</h2>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h3 className="card-title">Data Flow</h3></div>
            <div className="card-body">
              <div style={{ background: 'var(--gray-50)', borderRadius: '12px', padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ background: 'var(--primary-500)', color: 'white', padding: '12px 20px', borderRadius: '8px', textAlign: 'center' }}>Source DB</div>
                <div style={{ color: 'var(--gray-400)' }}>→</div>
                <div style={{ background: 'var(--success-500)', color: 'white', padding: '12px 20px', borderRadius: '8px', textAlign: 'center' }}>Kafka</div>
                <div style={{ color: 'var(--gray-400)' }}>→</div>
                <div style={{ background: 'var(--warning-500)', color: 'white', padding: '12px 20px', borderRadius: '8px', textAlign: 'center' }}>Spark</div>
                <div style={{ color: 'var(--gray-400)' }}>→</div>
                <div style={{ background: 'var(--danger-500)', color: 'white', padding: '12px 20px', borderRadius: '8px', textAlign: 'center' }}>Feature Store</div>
                <div style={{ color: 'var(--gray-400)' }}>→</div>
                <div style={{ background: 'var(--purple-500)', color: 'white', padding: '12px 20px', borderRadius: '8px', textAlign: 'center' }}>ML Model</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Capacity Planning Tab */}
      {activeTab === 'capacity-planning' && (
        <div className="grid grid-cols-1" style={{ gap: '24px' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--purple-600) 0%, var(--purple-800) 100%)', color: 'white' }}>
            <div className="card-body" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px', color: 'white' }}>Capacity Planning</h2>
              <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '36px', fontWeight: '700' }}>68%</div><div style={{ fontSize: '14px', opacity: 0.8 }}>CPU</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '36px', fontWeight: '700' }}>72%</div><div style={{ fontSize: '14px', opacity: 0.8 }}>Memory</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '36px', fontWeight: '700' }}>6mo</div><div style={{ fontSize: '14px', opacity: 0.8 }}>Runway</div></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Executive Summary Tab */}
      {activeTab === 'executive-summary' && (
        <div className="grid grid-cols-1" style={{ gap: '24px' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-900) 100%)', color: 'white' }}>
            <div className="card-body" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px', color: 'white' }}>{useCase.name}</h2>
              <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '24px' }}>Executive Summary</p>
              <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '42px', fontWeight: '700' }}>{useCase.accuracy > 0 ? useCase.accuracy.toFixed(1) : 95}%</div><div style={{ fontSize: '14px', opacity: 0.8 }}>Accuracy</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '42px', fontWeight: '700' }}>$2.8M</div><div style={{ fontSize: '14px', opacity: 0.8 }}>Savings</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '42px', fontWeight: '700' }}>340%</div><div style={{ fontSize: '14px', opacity: 0.8 }}>ROI</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '42px', fontWeight: '700', color: '#4ade80' }}>HEALTHY</div><div style={{ fontSize: '14px', opacity: 0.8 }}>Status</div></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Docs Tab */}
      {activeTab === 'api-docs' && (
        <div className="grid grid-cols-1" style={{ gap: '24px' }}>
          <div className="card" style={{ background: 'var(--gray-800)', color: 'white' }}>
            <div className="card-body" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>API Documentation</h2>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h3 className="card-title">Endpoints</h3></div>
            <div className="card-body">
              <div className="table-container">
                <table className="data-table">
                  <thead><tr><th>Method</th><th>Endpoint</th><th>Description</th></tr></thead>
                  <tbody>
                    <tr><td><span style={{ background: 'var(--success-100)', color: 'var(--success-700)', padding: '4px 12px', borderRadius: '4px', fontWeight: '600' }}>POST</span></td><td><code>/api/v1/predict</code></td><td>Real-time prediction</td></tr>
                    <tr><td><span style={{ background: 'var(--success-100)', color: 'var(--success-700)', padding: '4px 12px', borderRadius: '4px', fontWeight: '600' }}>POST</span></td><td><code>/api/v1/batch</code></td><td>Batch prediction</td></tr>
                    <tr><td><span style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', padding: '4px 12px', borderRadius: '4px', fontWeight: '600' }}>GET</span></td><td><code>/api/v1/explain/{'{id}'}</code></td><td>SHAP explanation</td></tr>
                    <tr><td><span style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', padding: '4px 12px', borderRadius: '4px', fontWeight: '600' }}>GET</span></td><td><code>/api/v1/health</code></td><td>Health check</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Runbook Tab */}
      {activeTab === 'runbook' && (
        <div className="grid grid-cols-1" style={{ gap: '24px' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--danger-600) 0%, var(--danger-800) 100%)', color: 'white' }}>
            <div className="card-body" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Operational Runbook</h2>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h3 className="card-title">Common Issues</h3></div>
            <div className="card-body">
              <div style={{ background: 'var(--danger-50)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--danger-500)', marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 8px 0' }}>High Latency</h4>
                <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}><li>Check Redis cache</li><li>Verify feature store</li><li>Scale pods if CPU &gt; 80%</li></ol>
              </div>
              <div style={{ background: 'var(--warning-50)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--warning-500)' }}>
                <h4 style={{ margin: '0 0 8px 0' }}>Model Drift</h4>
                <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}><li>Review drift dashboard</li><li>Analyze features</li><li>Trigger retraining</li></ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Roadmap Tab */}
      {activeTab === 'roadmap' && (
        <div className="grid grid-cols-1" style={{ gap: '24px' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--success-500) 0%, var(--success-700) 100%)', color: 'white' }}>
            <div className="card-body" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Product Roadmap</h2>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h3 className="card-title">Upcoming Features</h3></div>
            <div className="card-body">
              <div className="table-container">
                <table className="data-table">
                  <thead><tr><th>Feature</th><th>Quarter</th><th>Priority</th><th>Status</th></tr></thead>
                  <tbody>
                    <tr><td>Real-time Explainability</td><td>Q1 2025</td><td><span style={{ color: 'var(--danger-600)' }}>High</span></td><td><span className="status-badge warning"><span className="status-dot" />In Progress</span></td></tr>
                    <tr><td>Transformer Ensemble</td><td>Q2 2025</td><td><span style={{ color: 'var(--danger-600)' }}>High</span></td><td><span className="status-badge info"><span className="status-dot" />Planned</span></td></tr>
                    <tr><td>Auto-retraining</td><td>Q2 2025</td><td><span style={{ color: 'var(--warning-600)' }}>Medium</span></td><td><span className="status-badge info"><span className="status-dot" />Planned</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ML Workbench - Manual Process */}
      {activeTab === 'ml-workbench' && (
        <div className="grid grid-cols-1" style={{ gap: '24px' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <div className="card-body" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px', color: 'white' }}>ML Workbench - Manual Data Science</h2>
              <p style={{ opacity: 0.9 }}>Interactive workbench for manual ML pipeline execution with full control over each phase.</p>
            </div>
          </div>
          <div className="card">
            <div className="card-header" style={{ background: 'var(--primary-50)', borderBottom: '3px solid var(--primary-500)' }}><h3 className="card-title"><span style={{ background: 'var(--primary-500)', color: 'white', padding: '4px 12px', borderRadius: '4px', marginRight: '12px' }}>1</span>Data Selection</h3></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div><label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Data Source</label><select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--gray-300)' }}><option>Transaction DB</option><option>Customer Profiles</option><option>Upload CSV</option></select></div>
                <div><label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Date Range</label><select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--gray-300)' }}><option>Last 30 Days</option><option>Last 90 Days</option><option>Last 1 Year</option></select></div>
                <div><label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Sample Size</label><select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--gray-300)' }}><option>50,000 rows</option><option>100,000 rows</option><option>Full Dataset</option></select></div>
              </div>
              <button className="btn btn-primary" onClick={() => setNotification({ type: 'success', message: 'Loaded: 50,000 rows, 45 features' })}>Load Data</button>
            </div>
          </div>
          <div className="card">
            <div className="card-header" style={{ background: 'var(--success-50)', borderBottom: '3px solid var(--success-500)' }}><h3 className="card-title"><span style={{ background: 'var(--success-500)', color: 'white', padding: '4px 12px', borderRadius: '4px', marginRight: '12px' }}>2</span>Preprocessing</h3></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}><input type="checkbox" defaultChecked /> Missing (KNN)</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}><input type="checkbox" defaultChecked /> Normalize (MinMax)</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}><input type="checkbox" defaultChecked /> Standardize</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}><input type="checkbox" defaultChecked /> Outliers (IQR)</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}><input type="checkbox" defaultChecked /> Encode (Target)</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}><input type="checkbox" defaultChecked /> SMOTE Balance</label>
              </div>
              <button className="btn btn-success" onClick={() => setNotification({ type: 'success', message: 'Preprocessing complete!' })}>Apply</button>
            </div>
          </div>
          <div className="card">
            <div className="card-header" style={{ background: 'var(--warning-50)', borderBottom: '3px solid var(--warning-500)' }}><h3 className="card-title"><span style={{ background: 'var(--warning-500)', color: 'white', padding: '4px 12px', borderRadius: '4px', marginRight: '12px' }}>3</span>Feature Selection</h3></div>
            <div className="card-body">
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <label style={{ padding: '10px 16px', background: 'var(--primary-50)', borderRadius: '8px', border: '2px solid var(--primary-300)' }}><input type="radio" name="fs" defaultChecked /> Mutual Info</label>
                <label style={{ padding: '10px 16px', background: 'var(--gray-50)', borderRadius: '8px' }}><input type="radio" name="fs" /> Chi-Squared</label>
                <label style={{ padding: '10px 16px', background: 'var(--gray-50)', borderRadius: '8px' }}><input type="radio" name="fs" /> RFE</label>
                <label style={{ padding: '10px 16px', background: 'var(--gray-50)', borderRadius: '8px' }}><input type="radio" name="fs" /> LASSO</label>
              </div>
              <div style={{ height: '200px', marginBottom: '16px' }}><ResponsiveContainer width="100%" height="100%"><BarChart data={[{ f: 'txn_amt', v: 0.25 }, { f: 'velocity', v: 0.18 }, { f: 'geo_dist', v: 0.15 }, { f: 'time', v: 0.12 }]} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis type="category" dataKey="f" width={70} /><Tooltip /><Bar dataKey="v" fill="var(--warning-500)" /></BarChart></ResponsiveContainer></div>
              <button className="btn btn-warning" onClick={() => setNotification({ type: 'success', message: '25 features selected' })}>Select</button>
            </div>
          </div>
          <div className="card">
            <div className="card-header" style={{ background: 'var(--danger-50)', borderBottom: '3px solid var(--danger-500)' }}><h3 className="card-title"><span style={{ background: 'var(--danger-500)', color: 'white', padding: '4px 12px', borderRadius: '4px', marginRight: '12px' }}>4</span>Model Training</h3></div>
            <div className="card-body">
              <div style={{ marginBottom: '12px' }}><strong>Data Split:</strong> Train 70% | Val 15% | Test 15%</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                <label style={{ padding: '10px', background: 'var(--primary-50)', borderRadius: '8px', border: '2px solid var(--primary-300)', fontSize: '13px' }}><input type="checkbox" defaultChecked /> XGBoost</label>
                <label style={{ padding: '10px', background: 'var(--success-50)', borderRadius: '8px', border: '2px solid var(--success-300)', fontSize: '13px' }}><input type="checkbox" defaultChecked /> LightGBM</label>
                <label style={{ padding: '10px', background: 'var(--warning-50)', borderRadius: '8px', border: '2px solid var(--warning-300)', fontSize: '13px' }}><input type="checkbox" defaultChecked /> CatBoost</label>
                <label style={{ padding: '10px', background: 'var(--purple-50)', borderRadius: '8px', fontSize: '13px' }}><input type="checkbox" /> LSTM (DL)</label>
                <label style={{ padding: '10px', background: 'var(--teal-50)', borderRadius: '8px', fontSize: '13px' }}><input type="checkbox" /> Transformer</label>
                <label style={{ padding: '10px', background: 'var(--pink-50)', borderRadius: '8px', border: '2px solid var(--pink-300)', fontSize: '13px' }}><input type="checkbox" defaultChecked /> Ensemble</label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                <div><label style={{ fontSize: '12px' }}>HP Search</label><select style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-300)' }}><option>Optuna</option><option>Grid</option></select></div>
                <div><label style={{ fontSize: '12px' }}>CV</label><select style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-300)' }}><option>5-Fold</option><option>10-Fold</option></select></div>
                <div><label style={{ fontSize: '12px' }}>Metric</label><select style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--gray-300)' }}><option>AUC-ROC</option><option>F1</option></select></div>
              </div>
              <button className="btn btn-danger" onClick={() => setNotification({ type: 'info', message: 'Training started...' })}>Train Models</button>
            </div>
          </div>
          <div className="card">
            <div className="card-header" style={{ background: 'var(--purple-50)', borderBottom: '3px solid var(--purple-500)' }}><h3 className="card-title"><span style={{ background: 'var(--purple-500)', color: 'white', padding: '4px 12px', borderRadius: '4px', marginRight: '12px' }}>5</span>Results</h3></div>
            <div className="card-body">
              <div className="table-container" style={{ marginBottom: '16px' }}><table className="data-table"><thead><tr><th>Model</th><th>Acc</th><th>Prec</th><th>Recall</th><th>F1</th><th>AUC</th></tr></thead><tbody><tr><td>XGBoost</td><td>94.5%</td><td>93.2%</td><td>91.8%</td><td>92.5%</td><td>95.2%</td></tr><tr><td>LightGBM</td><td>93.8%</td><td>92.5%</td><td>90.2%</td><td>91.3%</td><td>94.1%</td></tr><tr style={{ background: 'var(--success-50)' }}><td><strong>Ensemble</strong></td><td><strong>95.8%</strong></td><td><strong>94.5%</strong></td><td><strong>93.2%</strong></td><td><strong>93.8%</strong></td><td><strong>96.5%</strong></td></tr></tbody></table></div>
              <div style={{ height: '220px', marginBottom: '16px' }}><ResponsiveContainer width="100%" height="100%"><BarChart data={[{ m: 'XGB', acc: 94.5, auc: 95.2 }, { m: 'LGB', acc: 93.8, auc: 94.1 }, { m: 'Cat', acc: 94.2, auc: 94.8 }, { m: 'Ens', acc: 95.8, auc: 96.5 }]}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="m" /><YAxis domain={[90, 100]} /><Tooltip /><Bar dataKey="acc" fill="var(--primary-500)" name="Accuracy" /><Bar dataKey="auc" fill="var(--purple-500)" name="AUC" /></BarChart></ResponsiveContainer></div>
              <div style={{ display: 'flex', gap: '12px' }}><button className="btn btn-primary" onClick={() => setNotification({ type: 'success', message: 'Deployed!' })}>Deploy Best</button><button className="btn btn-secondary" onClick={() => handleExport('Results')}>Export</button></div>
            </div>
          </div>
        </div>
      )}

      {/* Auto Pipeline */}
      {activeTab === 'auto-pipeline' && (
        <div className="grid grid-cols-1" style={{ gap: '24px' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <div className="card-body" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px', color: 'white' }}>Automated ML Pipeline</h2>
              <p style={{ opacity: 0.9, marginBottom: '16px' }}>One-click automated pipeline with real-time metrics at each phase.</p>
              <button className="btn" style={{ background: 'white', color: '#f5576c', fontWeight: '600' }} onClick={() => setNotification({ type: 'success', message: 'Pipeline started! ETA: 15 min' })}>Run Full Pipeline</button>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h3 className="card-title">Pipeline Progress</h3></div>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                {['Ingest', 'Preprocess', 'Features', 'Train', 'Evaluate', 'Deploy'].map((p, i) => (<div key={p} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '26px', height: '26px', borderRadius: '50%', background: i < 5 ? 'var(--success-500)' : 'var(--gray-200)', color: i < 5 ? 'white' : 'var(--gray-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600' }}>{i < 5 ? '✓' : i + 1}</div><span style={{ fontSize: '11px', color: i < 5 ? 'var(--success-600)' : 'var(--gray-500)' }}>{p}</span></div>))}
              </div>
              <div style={{ background: 'var(--gray-100)', borderRadius: '8px', height: '8px' }}><div style={{ background: 'linear-gradient(90deg, #f093fb, #f5576c)', borderRadius: '8px', height: '100%', width: '83%' }}></div></div>
              <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--gray-600)' }}>83% Complete | ETA: 2 min</div>
            </div>
          </div>
          <div className="grid grid-cols-3" style={{ gap: '16px' }}>
            <div className="card" style={{ border: '2px solid var(--success-300)' }}><div className="card-header" style={{ background: 'var(--success-50)', padding: '10px' }}><h4 style={{ margin: 0, fontSize: '13px' }}>1. Ingest ✓</h4></div><div className="card-body" style={{ padding: '12px' }}><div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>Rows</div><div style={{ fontSize: '16px', fontWeight: '700' }}>2.4M</div><div style={{ fontSize: '11px', color: 'var(--gray-500)', marginTop: '6px' }}>Quality</div><div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--success-600)' }}>99.2%</div></div></div>
            <div className="card" style={{ border: '2px solid var(--success-300)' }}><div className="card-header" style={{ background: 'var(--success-50)', padding: '10px' }}><h4 style={{ margin: 0, fontSize: '13px' }}>2. Preprocess ✓</h4></div><div className="card-body" style={{ padding: '12px' }}><div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>Missing Fixed</div><div style={{ fontSize: '16px', fontWeight: '700' }}>12.4K</div><div style={{ fontSize: '11px', color: 'var(--gray-500)', marginTop: '6px' }}>Normalized</div><div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--success-600)' }}>100%</div></div></div>
            <div className="card" style={{ border: '2px solid var(--success-300)' }}><div className="card-header" style={{ background: 'var(--success-50)', padding: '10px' }}><h4 style={{ margin: 0, fontSize: '13px' }}>3. Features ✓</h4></div><div className="card-body" style={{ padding: '12px' }}><div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>Created</div><div style={{ fontSize: '16px', fontWeight: '700' }}>68</div><div style={{ fontSize: '11px', color: 'var(--gray-500)', marginTop: '6px' }}>Selected</div><div style={{ fontSize: '16px', fontWeight: '700' }}>32</div></div></div>
            <div className="card" style={{ border: '2px solid var(--success-300)' }}><div className="card-header" style={{ background: 'var(--success-50)', padding: '10px' }}><h4 style={{ margin: 0, fontSize: '13px' }}>4. Train ✓</h4></div><div className="card-body" style={{ padding: '12px' }}><div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>Models</div><div style={{ fontSize: '16px', fontWeight: '700' }}>5</div><div style={{ fontSize: '11px', color: 'var(--gray-500)', marginTop: '6px' }}>Best</div><div style={{ fontSize: '14px', fontWeight: '600' }}>Ensemble</div></div></div>
            <div className="card" style={{ border: '2px solid var(--success-300)' }}><div className="card-header" style={{ background: 'var(--success-50)', padding: '10px' }}><h4 style={{ margin: 0, fontSize: '13px' }}>5. Evaluate ✓</h4></div><div className="card-body" style={{ padding: '12px' }}><div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>Accuracy</div><div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--success-600)' }}>95.8%</div><div style={{ fontSize: '11px', color: 'var(--gray-500)', marginTop: '6px' }}>AUC</div><div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary-600)' }}>96.5%</div></div></div>
            <div className="card" style={{ border: '2px solid var(--warning-300)' }}><div className="card-header" style={{ background: 'var(--warning-50)', padding: '10px' }}><h4 style={{ margin: 0, fontSize: '13px' }}>6. Deploy ⏳</h4></div><div className="card-body" style={{ padding: '12px' }}><div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>Target</div><div style={{ fontSize: '14px', fontWeight: '600' }}>Production</div><div style={{ fontSize: '11px', color: 'var(--gray-500)', marginTop: '6px' }}>Status</div><div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--warning-600)' }}>Deploying...</div></div></div>
          </div>
          <div className="card">
            <div className="card-header"><h3 className="card-title">Run History</h3></div>
            <div className="card-body"><div className="table-container"><table className="data-table"><thead><tr><th>Run</th><th>Date</th><th>Duration</th><th>Accuracy</th><th>AUC</th><th>Status</th></tr></thead><tbody><tr><td><code>RUN-001</code></td><td>Jan 28</td><td>15m</td><td>95.8%</td><td>96.5%</td><td><span className="status-badge warning"><span className="status-dot" />Running</span></td></tr><tr><td><code>RUN-002</code></td><td>Jan 27</td><td>14m</td><td>95.2%</td><td>96.1%</td><td><span className="status-badge success"><span className="status-dot" />Success</span></td></tr></tbody></table></div></div>
          </div>
        </div>
      )}

      {/* Demo Mode - Interactive Presentation */}
      {activeTab === 'demo-mode' && (
        <div className="grid grid-cols-1" style={{ gap: '24px' }}>
          {/* Hero Demo Banner */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)', color: 'white', overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', right: '-50px', top: '-50px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
            <div style={{ position: 'absolute', right: '50px', bottom: '-30px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
            <div className="card-body" style={{ padding: '40px', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <span style={{ fontSize: '48px' }}>🎯</span>
                <div>
                  <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: 'white' }}>{useCase?.name || 'Use Case'} Demo</h2>
                  <p style={{ opacity: 0.9, fontSize: '18px' }}>Interactive demonstration with real-time predictions & explainability</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '24px', flexWrap: 'wrap' }}>
                <button className="btn" style={{ background: 'white', color: '#ff6b6b', fontWeight: '700', fontSize: '16px', padding: '14px 28px' }}>
                  ▶️ Start Guided Tour
                </button>
                <button className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: '600', fontSize: '16px', padding: '14px 28px', border: '2px solid rgba(255,255,255,0.5)' }}>
                  📊 Presentation Mode
                </button>
              </div>
            </div>
          </div>

          {/* Real-Time Impact Counters - Animated */}
          <div className="grid grid-cols-4" style={{ gap: '16px' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', textAlign: 'center', padding: '24px' }}>
              <div style={{ fontSize: '42px', fontWeight: '800', fontFamily: 'monospace' }}>1,247,893</div>
              <div style={{ opacity: 0.9, marginTop: '8px' }}>Predictions Today</div>
              <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.7 }}>+2,341 in last hour</div>
            </div>
            <div className="card" style={{ background: 'linear-gradient(135deg, #11998e, #38ef7d)', color: 'white', textAlign: 'center', padding: '24px' }}>
              <div style={{ fontSize: '42px', fontWeight: '800', fontFamily: 'monospace' }}>$4.2M</div>
              <div style={{ opacity: 0.9, marginTop: '8px' }}>Fraud Prevented</div>
              <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.7 }}>This month</div>
            </div>
            <div className="card" style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)', color: 'white', textAlign: 'center', padding: '24px' }}>
              <div style={{ fontSize: '42px', fontWeight: '800', fontFamily: 'monospace' }}>99.2%</div>
              <div style={{ opacity: 0.9, marginTop: '8px' }}>Model Accuracy</div>
              <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.7 }}>↑ 2.3% from baseline</div>
            </div>
            <div className="card" style={{ background: 'linear-gradient(135deg, #4facfe, #00f2fe)', color: 'white', textAlign: 'center', padding: '24px' }}>
              <div style={{ fontSize: '42px', fontWeight: '800', fontFamily: 'monospace' }}>12ms</div>
              <div style={{ opacity: 0.9, marginTop: '8px' }}>Avg Response Time</div>
              <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.7 }}>P99: 45ms</div>
            </div>
          </div>

          {/* Live Prediction Demo */}
          <div className="grid grid-cols-2" style={{ gap: '24px' }}>
            <div className="card">
              <div className="card-header" style={{ background: 'var(--primary-50)' }}>
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>🔮</span> Live Prediction Demo
                </h3>
              </div>
              <div className="card-body" style={{ padding: '24px' }}>
                <p style={{ color: 'var(--gray-600)', marginBottom: '20px' }}>Enter transaction details to see real-time prediction with explanation</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: 'var(--gray-600)' }}>Transaction Amount ($)</label>
                    <input type="number" placeholder="5000" style={{ width: '100%', padding: '12px', border: '1px solid var(--gray-200)', borderRadius: '8px', fontSize: '14px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: 'var(--gray-600)' }}>Merchant Category</label>
                    <select style={{ width: '100%', padding: '12px', border: '1px solid var(--gray-200)', borderRadius: '8px', fontSize: '14px' }}>
                      <option>Electronics</option>
                      <option>Travel</option>
                      <option>Restaurant</option>
                      <option>Grocery</option>
                      <option>Online Gaming</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: 'var(--gray-600)' }}>Transaction Time</label>
                    <select style={{ width: '100%', padding: '12px', border: '1px solid var(--gray-200)', borderRadius: '8px', fontSize: '14px' }}>
                      <option>2:00 AM (Unusual)</option>
                      <option>9:00 AM (Normal)</option>
                      <option>2:00 PM (Normal)</option>
                      <option>11:00 PM (Late)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: 'var(--gray-600)' }}>Location</label>
                    <select style={{ width: '100%', padding: '12px', border: '1px solid var(--gray-200)', borderRadius: '8px', fontSize: '14px' }}>
                      <option>New York (Home)</option>
                      <option>Los Angeles (Travel)</option>
                      <option>Nigeria (High Risk)</option>
                      <option>London (Travel)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: 'var(--gray-600)' }}>Card Present</label>
                    <select style={{ width: '100%', padding: '12px', border: '1px solid var(--gray-200)', borderRadius: '8px', fontSize: '14px' }}>
                      <option>Yes - Chip</option>
                      <option>Yes - Swipe</option>
                      <option>No - Online</option>
                      <option>No - Phone Order</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: 'var(--gray-600)' }}>Previous Fraud</label>
                    <select style={{ width: '100%', padding: '12px', border: '1px solid var(--gray-200)', borderRadius: '8px', fontSize: '14px' }}>
                      <option>No History</option>
                      <option>1 Incident</option>
                      <option>2+ Incidents</option>
                    </select>
                  </div>
                </div>
                <button className="btn btn-primary" style={{ width: '100%', marginTop: '20px', padding: '14px', fontSize: '16px', fontWeight: '600' }} onClick={() => setNotification({ type: 'success', message: 'Prediction: FRAUD (87% confidence) - See explanation →' })}>
                  🎯 Make Prediction
                </button>
              </div>
            </div>

            {/* SHAP Explanation */}
            <div className="card">
              <div className="card-header" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white' }}>
                <h3 className="card-title" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>🧠</span> SHAP Explainability
                </h3>
              </div>
              <div className="card-body" style={{ padding: '24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ display: 'inline-block', background: 'var(--danger-100)', color: 'var(--danger-700)', padding: '16px 32px', borderRadius: '12px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>Prediction</div>
                    <div style={{ fontSize: '32px', fontWeight: '800' }}>FRAUD</div>
                    <div style={{ fontSize: '14px' }}>87% Confidence</div>
                  </div>
                </div>

                <div style={{ marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: 'var(--gray-600)' }}>Feature Impact (SHAP Values)</div>

                {/* SHAP Waterfall Bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '120px', fontSize: '12px', textAlign: 'right' }}>Unusual Time</div>
                    <div style={{ flex: 1, height: '24px', background: 'var(--gray-100)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '50%', width: '35%', height: '100%', background: 'linear-gradient(90deg, #ef4444, #dc2626)', borderRadius: '0 4px 4px 0' }}></div>
                    </div>
                    <div style={{ width: '60px', fontSize: '12px', fontWeight: '600', color: 'var(--danger-600)' }}>+0.35</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '120px', fontSize: '12px', textAlign: 'right' }}>High Amount</div>
                    <div style={{ flex: 1, height: '24px', background: 'var(--gray-100)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '50%', width: '28%', height: '100%', background: 'linear-gradient(90deg, #ef4444, #dc2626)', borderRadius: '0 4px 4px 0' }}></div>
                    </div>
                    <div style={{ width: '60px', fontSize: '12px', fontWeight: '600', color: 'var(--danger-600)' }}>+0.28</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '120px', fontSize: '12px', textAlign: 'right' }}>New Location</div>
                    <div style={{ flex: 1, height: '24px', background: 'var(--gray-100)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '50%', width: '22%', height: '100%', background: 'linear-gradient(90deg, #ef4444, #dc2626)', borderRadius: '0 4px 4px 0' }}></div>
                    </div>
                    <div style={{ width: '60px', fontSize: '12px', fontWeight: '600', color: 'var(--danger-600)' }}>+0.22</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '120px', fontSize: '12px', textAlign: 'right' }}>Card Not Present</div>
                    <div style={{ flex: 1, height: '24px', background: 'var(--gray-100)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '50%', width: '15%', height: '100%', background: 'linear-gradient(90deg, #ef4444, #dc2626)', borderRadius: '0 4px 4px 0' }}></div>
                    </div>
                    <div style={{ width: '60px', fontSize: '12px', fontWeight: '600', color: 'var(--danger-600)' }}>+0.15</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '120px', fontSize: '12px', textAlign: 'right' }}>Good History</div>
                    <div style={{ flex: 1, height: '24px', background: 'var(--gray-100)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ position: 'absolute', right: '50%', width: '12%', height: '100%', background: 'linear-gradient(90deg, #10b981, #059669)', borderRadius: '4px 0 0 4px' }}></div>
                    </div>
                    <div style={{ width: '60px', fontSize: '12px', fontWeight: '600', color: 'var(--success-600)' }}>-0.12</div>
                  </div>
                </div>

                <div style={{ marginTop: '16px', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px', fontSize: '12px', color: 'var(--gray-600)' }}>
                  <strong>Legend:</strong> Red bars push toward FRAUD, green bars push toward LEGIT
                </div>
              </div>
            </div>
          </div>

          {/* Natural Language Explanation */}
          <div className="card" style={{ border: '2px solid var(--primary-200)' }}>
            <div className="card-header" style={{ background: 'var(--primary-50)' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>💬</span> Natural Language Explanation
              </h3>
            </div>
            <div className="card-body" style={{ padding: '24px' }}>
              <div style={{ background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)', padding: '24px', borderRadius: '12px', fontSize: '16px', lineHeight: '1.8' }}>
                <p style={{ marginBottom: '16px' }}>
                  <strong style={{ color: 'var(--danger-600)' }}>🚨 This transaction is flagged as FRAUD with 87% confidence.</strong>
                </p>
                <p style={{ marginBottom: '16px' }}>
                  The model detected several concerning patterns:
                </p>
                <ul style={{ marginLeft: '24px', marginBottom: '16px' }}>
                  <li>The transaction occurred at <strong>2:00 AM</strong>, which is outside this customer's typical activity hours (9 AM - 10 PM)</li>
                  <li>The amount of <strong>$5,000</strong> is <strong>8x higher</strong> than the customer's average transaction of $625</li>
                  <li>The location (<strong>Nigeria</strong>) has never been associated with this account before</li>
                  <li>The transaction was made <strong>online without the physical card</strong></li>
                </ul>
                <p>
                  <strong>Recommendation:</strong> Block transaction and send SMS verification to the cardholder.
                </p>
              </div>
            </div>
          </div>

          {/* Before/After Comparison */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>⚖️</span> Before vs After ML Implementation
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-sm" style={{ background: 'var(--gray-700)', color: 'white' }}>Before</button>
                <button className="btn btn-sm btn-primary">After</button>
                <button className="btn btn-sm" style={{ background: 'var(--success-500)', color: 'white' }}>Compare</button>
              </div>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2" style={{ gap: '24px' }}>
                <div style={{ padding: '20px', background: 'var(--gray-50)', borderRadius: '12px', border: '2px solid var(--gray-200)' }}>
                  <h4 style={{ marginBottom: '16px', color: 'var(--gray-600)' }}>❌ Before ML (Rule-Based)</h4>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'white', borderRadius: '6px' }}>
                      <span>Detection Rate</span>
                      <span style={{ fontWeight: '700', color: 'var(--danger-600)' }}>62%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'white', borderRadius: '6px' }}>
                      <span>False Positives</span>
                      <span style={{ fontWeight: '700', color: 'var(--danger-600)' }}>15%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'white', borderRadius: '6px' }}>
                      <span>Fraud Loss/Month</span>
                      <span style={{ fontWeight: '700', color: 'var(--danger-600)' }}>$2.8M</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'white', borderRadius: '6px' }}>
                      <span>Manual Review Cases</span>
                      <span style={{ fontWeight: '700', color: 'var(--danger-600)' }}>45,000</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'white', borderRadius: '6px' }}>
                      <span>Response Time</span>
                      <span style={{ fontWeight: '700', color: 'var(--danger-600)' }}>2.5 sec</span>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '20px', background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', borderRadius: '12px', border: '2px solid var(--success-300)' }}>
                  <h4 style={{ marginBottom: '16px', color: 'var(--success-700)' }}>✅ After ML (Ensemble Model)</h4>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'white', borderRadius: '6px' }}>
                      <span>Detection Rate</span>
                      <span style={{ fontWeight: '700', color: 'var(--success-600)' }}>95.8% <span style={{ fontSize: '11px', color: 'var(--success-500)' }}>↑ 34%</span></span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'white', borderRadius: '6px' }}>
                      <span>False Positives</span>
                      <span style={{ fontWeight: '700', color: 'var(--success-600)' }}>2.1% <span style={{ fontSize: '11px', color: 'var(--success-500)' }}>↓ 87%</span></span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'white', borderRadius: '6px' }}>
                      <span>Fraud Loss/Month</span>
                      <span style={{ fontWeight: '700', color: 'var(--success-600)' }}>$420K <span style={{ fontSize: '11px', color: 'var(--success-500)' }}>↓ 85%</span></span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'white', borderRadius: '6px' }}>
                      <span>Manual Review Cases</span>
                      <span style={{ fontWeight: '700', color: 'var(--success-600)' }}>8,200 <span style={{ fontSize: '11px', color: 'var(--success-500)' }}>↓ 82%</span></span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'white', borderRadius: '6px' }}>
                      <span>Response Time</span>
                      <span style={{ fontWeight: '700', color: 'var(--success-600)' }}>12ms <span style={{ fontSize: '11px', color: 'var(--success-500)' }}>↓ 99.5%</span></span>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '20px', padding: '16px', background: 'var(--primary-50)', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary-600)' }}>$28.5M Annual Savings</span>
                <span style={{ display: 'block', color: 'var(--gray-600)', marginTop: '4px' }}>From reduced fraud losses + operational efficiency</span>
              </div>
            </div>
          </div>

          {/* ROC/PR Curves & Confusion Matrix */}
          <div className="grid grid-cols-2" style={{ gap: '24px' }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">ROC Curve (AUC = 0.965)</h3>
              </div>
              <div className="card-body">
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={[
                      { fpr: 0, tpr: 0 }, { fpr: 0.02, tpr: 0.65 }, { fpr: 0.05, tpr: 0.82 },
                      { fpr: 0.1, tpr: 0.91 }, { fpr: 0.2, tpr: 0.96 }, { fpr: 0.4, tpr: 0.98 },
                      { fpr: 0.6, tpr: 0.99 }, { fpr: 0.8, tpr: 0.995 }, { fpr: 1, tpr: 1 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="fpr" label={{ value: 'False Positive Rate', position: 'bottom' }} />
                      <YAxis label={{ value: 'True Positive Rate', angle: -90, position: 'left' }} />
                      <Tooltip formatter={(v) => (v * 100).toFixed(1) + '%'} />
                      <Area type="monotone" dataKey="tpr" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      <Line type="linear" data={[{ fpr: 0, tpr: 0 }, { fpr: 1, tpr: 1 }]} dataKey="tpr" stroke="#ef4444" strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Confusion Matrix</h3>
              </div>
              <div className="card-body" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: '4px' }}>
                  <div></div>
                  <div style={{ textAlign: 'center', fontWeight: '600', fontSize: '12px', padding: '8px' }}>Pred: Legit</div>
                  <div style={{ textAlign: 'center', fontWeight: '600', fontSize: '12px', padding: '8px' }}>Pred: Fraud</div>

                  <div style={{ fontWeight: '600', fontSize: '12px', padding: '8px', display: 'flex', alignItems: 'center' }}>Actual: Legit</div>
                  <div style={{ width: '120px', height: '80px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <div style={{ fontSize: '24px', fontWeight: '800' }}>97,845</div>
                    <div style={{ fontSize: '11px', opacity: 0.9 }}>True Negative</div>
                  </div>
                  <div style={{ width: '120px', height: '80px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <div style={{ fontSize: '24px', fontWeight: '800' }}>2,155</div>
                    <div style={{ fontSize: '11px', opacity: 0.9 }}>False Positive</div>
                  </div>

                  <div style={{ fontWeight: '600', fontSize: '12px', padding: '8px', display: 'flex', alignItems: 'center' }}>Actual: Fraud</div>
                  <div style={{ width: '120px', height: '80px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <div style={{ fontSize: '24px', fontWeight: '800' }}>421</div>
                    <div style={{ fontSize: '11px', opacity: 0.9 }}>False Negative</div>
                  </div>
                  <div style={{ width: '120px', height: '80px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <div style={{ fontSize: '24px', fontWeight: '800' }}>9,579</div>
                    <div style={{ fontSize: '11px', opacity: 0.9 }}>True Positive</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Guided Tour Steps */}
          <div className="card">
            <div className="card-header" style={{ background: 'linear-gradient(135deg, #feca57, #ff6b6b)', color: 'white' }}>
              <h3 className="card-title" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🎓</span> Guided Demo Tour
              </h3>
            </div>
            <div className="card-body" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
                {[
                  { step: 1, title: 'Business Problem', desc: 'Understand fraud impact', icon: '🎯', time: '2 min' },
                  { step: 2, title: 'Data Pipeline', desc: 'See data flow', icon: '🔄', time: '3 min' },
                  { step: 3, title: 'Feature Engineering', desc: 'Key predictive features', icon: '⚙️', time: '3 min' },
                  { step: 4, title: 'Model Training', desc: 'Algorithm comparison', icon: '🤖', time: '4 min' },
                  { step: 5, title: 'Live Prediction', desc: 'Interactive demo', icon: '🔮', time: '3 min' },
                  { step: 6, title: 'Explainability', desc: 'SHAP & LIME', icon: '🧠', time: '3 min' },
                  { step: 7, title: 'Business Impact', desc: 'ROI & savings', icon: '💰', time: '2 min' }
                ].map((s) => (
                  <div key={s.step} style={{ minWidth: '160px', padding: '16px', background: s.step === 1 ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'var(--gray-50)', borderRadius: '12px', cursor: 'pointer', border: s.step === 1 ? 'none' : '1px solid var(--gray-200)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '24px' }}>{s.icon}</span>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: s.step === 1 ? 'white' : 'var(--primary-500)', color: s.step === 1 ? 'var(--primary-600)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>{s.step}</div>
                    </div>
                    <div style={{ fontWeight: '600', color: s.step === 1 ? 'white' : 'var(--gray-800)', marginBottom: '4px' }}>{s.title}</div>
                    <div style={{ fontSize: '12px', color: s.step === 1 ? 'rgba(255,255,255,0.8)' : 'var(--gray-500)' }}>{s.desc}</div>
                    <div style={{ fontSize: '11px', marginTop: '8px', color: s.step === 1 ? 'rgba(255,255,255,0.7)' : 'var(--gray-400)' }}>⏱️ {s.time}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <button className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '16px', fontWeight: '600' }}>
                  ▶️ Start Tour (20 min)
                </button>
                <button className="btn" style={{ padding: '14px 32px', fontSize: '16px', fontWeight: '600', border: '2px solid var(--primary-500)', color: 'var(--primary-600)' }}>
                  ⏭️ Skip to Section
                </button>
              </div>
            </div>
          </div>

          {/* Wow Moment - Fraud Caught Live */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', color: 'white', overflow: 'hidden' }}>
            <div className="card-body" style={{ padding: '32px' }}>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', color: 'white' }}>🚨 Live Fraud Detection Feed</h3>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', fontWeight: '800', color: '#10b981', fontFamily: 'monospace' }}>$127,450</div>
                    <div style={{ opacity: 0.7 }}>Blocked in Last Hour</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', fontWeight: '800', color: '#f59e0b', fontFamily: 'monospace' }}>23</div>
                    <div style={{ opacity: 0.7 }}>Fraud Attempts</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', fontWeight: '800', color: '#3b82f6', fontFamily: 'monospace' }}>12ms</div>
                    <div style={{ opacity: 0.7 }}>Detection Speed</div>
                  </div>
                </div>
                <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.5)' }}>
                  <div style={{ fontSize: '14px', color: '#10b981' }}>✓ Last blocked: $4,500 suspicious transaction from unusual location (3 seconds ago)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Demo Controls */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Demo Controls</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => setNotification({ type: 'info', message: 'Presentation mode activated - Fonts enlarged, animations enabled' })}>
                  📺 Presentation Mode
                </button>
                <button className="btn" style={{ border: '1px solid var(--gray-300)' }} onClick={() => setNotification({ type: 'success', message: 'Demo data loaded - Ready to present' })}>
                  📊 Load Demo Data
                </button>
                <button className="btn" style={{ border: '1px solid var(--gray-300)' }} onClick={() => setNotification({ type: 'info', message: 'Simulating live predictions...' })}>
                  🎭 Simulate Live
                </button>
                <button className="btn" style={{ border: '1px solid var(--gray-300)' }}>
                  📤 Export Slides
                </button>
                <button className="btn" style={{ border: '1px solid var(--gray-300)' }}>
                  🔗 Share Demo Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Explainability Hub - Comprehensive Model Interpretability */}
      {activeTab === 'explainability' && (
        <div className="grid grid-cols-1" style={{ gap: '24px' }}>
          {/* Header */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}>
            <div className="card-body" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '12px', color: 'white' }}>🔍 Model Explainability & Interpretability Hub</h2>
              <p style={{ opacity: 0.9, marginBottom: '16px' }}>Comprehensive visualization with detailed explanations for each metric, graph, and table. Every visualization includes data source, methodology, and key insights.</p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', fontSize: '13px' }}>📊 8 Explained Visualizations</span>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', fontSize: '13px' }}>🧠 SHAP + LIME</span>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', fontSize: '13px' }}>⚖️ Responsible AI</span>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', fontSize: '13px' }}>🐛 Debug Tools</span>
              </div>
            </div>
          </div>

          {/* 1. Feature Importance - Graph + Explanation */}
          <div className="card">
            <div className="card-header" style={{ background: 'var(--primary-50)', borderBottom: '2px solid var(--primary-200)' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>📊</span> 1. Feature Importance Analysis
              </h3>
              <span className="status-badge success"><span className="status-dot" />Interpretable</span>
            </div>
            <div className="card-body" style={{ padding: '0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '400px' }}>
                {/* Left: Graph */}
                <div style={{ padding: '24px', borderRight: '1px solid var(--gray-200)' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--gray-700)' }}>Visualization</div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { feature: 'Transaction Amount', importance: 0.28, direction: 'fraud' },
                      { feature: 'Time of Day', importance: 0.22, direction: 'fraud' },
                      { feature: 'Location Distance', importance: 0.18, direction: 'fraud' },
                      { feature: 'Merchant Category', importance: 0.12, direction: 'mixed' },
                      { feature: 'Card Present', importance: 0.08, direction: 'legit' },
                      { feature: 'Account Age', importance: 0.07, direction: 'legit' },
                      { feature: 'Tx Frequency', importance: 0.05, direction: 'mixed' }
                    ]} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" domain={[0, 0.3]} tickFormatter={(v) => (v * 100).toFixed(0) + '%'} />
                      <YAxis dataKey="feature" type="category" width={120} fontSize={11} />
                      <Tooltip formatter={(v) => (v * 100).toFixed(1) + '%'} />
                      <Bar dataKey="importance" fill="#6366f1" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Right: Explanation */}
                <div style={{ padding: '24px', background: 'var(--gray-50)' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--gray-700)' }}>Explanation</div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '4px' }}>📁 DATA SOURCE</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Training dataset of 2.4M transactions from core banking system (Jan 2023 - Dec 2024). Features extracted via feature engineering pipeline.</p>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '4px' }}>🤖 MODEL APPLIED</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>XGBoost Classifier with SHAP (SHapley Additive exPlanations) for feature importance calculation. Uses tree-based importance + permutation importance.</p>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--warning-600)', marginBottom: '4px' }}>📤 OUTPUT INTERPRETATION</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Bars show relative contribution to prediction. Transaction Amount (28%) and Time of Day (22%) are top fraud indicators.</p>
                  </div>

                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>💡 KEY TAKEAWAYS</div>
                    <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                      <li>Top 3 features account for 68% of model decision</li>
                      <li>Transaction amount thresholds: &gt;$2,000 = high risk</li>
                      <li>Night transactions (12AM-5AM) have 4x fraud rate</li>
                      <li>Location-based features need GPS data quality check</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. SHAP Waterfall - Graph + Explanation */}
          <div className="card">
            <div className="card-header" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderBottom: '2px solid var(--warning-300)' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🧠</span> 2. SHAP Waterfall Explanation
              </h3>
              <span className="status-badge warning"><span className="status-dot" />Individual Prediction</span>
            </div>
            <div className="card-body" style={{ padding: '0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '400px' }}>
                {/* Left: SHAP Waterfall */}
                <div style={{ padding: '24px', borderRight: '1px solid var(--gray-200)' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--gray-700)' }}>SHAP Waterfall Chart</div>
                  <div style={{ background: 'var(--gray-50)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--gray-600)' }}>Base Value (Average)</span>
                      <span style={{ fontWeight: '600' }}>0.15 (15% fraud prob)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: 'var(--gray-600)' }}>Final Prediction</span>
                      <span style={{ fontWeight: '700', color: 'var(--danger-600)' }}>0.87 (87% fraud prob)</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { feature: 'Transaction = $5,000', value: '+0.28', color: '#ef4444' },
                      { feature: 'Time = 2:00 AM', value: '+0.22', color: '#ef4444' },
                      { feature: 'Location = Nigeria', value: '+0.18', color: '#ef4444' },
                      { feature: 'Card Not Present', value: '+0.12', color: '#f59e0b' },
                      { feature: 'New Merchant', value: '+0.08', color: '#f59e0b' },
                      { feature: 'Good History (5yr)', value: '-0.06', color: '#10b981' }
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '140px', fontSize: '12px', textAlign: 'right', color: 'var(--gray-600)' }}>{item.feature}</div>
                        <div style={{ flex: 1, height: '24px', background: 'var(--gray-100)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                          <div style={{ position: 'absolute', left: item.value.startsWith('+') ? '50%' : undefined, right: item.value.startsWith('-') ? '50%' : undefined, width: `${Math.abs(parseFloat(item.value)) * 200}%`, height: '100%', background: item.color, borderRadius: '4px' }}></div>
                        </div>
                        <div style={{ width: '50px', fontSize: '12px', fontWeight: '600', color: item.color }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Right: Explanation */}
                <div style={{ padding: '24px', background: 'var(--gray-50)' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--gray-700)' }}>Explanation</div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '4px' }}>📁 DATA SOURCE</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Single transaction record ID: TXN-2024-00847293. Real-time prediction from production API endpoint.</p>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '4px' }}>🤖 MODEL APPLIED</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>SHAP TreeExplainer on XGBoost model. Calculates Shapley values using game theory to attribute prediction to each feature.</p>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--warning-600)', marginBottom: '4px' }}>📤 OUTPUT INTERPRETATION</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Shows how each feature pushed prediction from base (15%) to final (87%). Red = increases fraud probability, Green = decreases.</p>
                  </div>

                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>💡 KEY TAKEAWAYS</div>
                    <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                      <li>Transaction amount alone adds +28% fraud probability</li>
                      <li>Multiple red flags compound: amount + time + location</li>
                      <li>Good account history provides only -6% offset</li>
                      <li>This prediction is explainable to regulators and customers</li>
                    </ul>
                  </div>

                  <div style={{ marginTop: '16px', padding: '12px', background: 'var(--danger-50)', borderRadius: '8px', border: '1px solid var(--danger-200)' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--danger-700)' }}>⚠️ RESPONSIBLE AI NOTE</div>
                    <p style={{ fontSize: '11px', color: 'var(--danger-600)', margin: '4px 0 0 0' }}>Location-based features (Nigeria) may introduce bias. Model is monitored for geographic fairness using demographic parity metrics.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Confusion Matrix - Graph + Explanation */}
          <div className="card">
            <div className="card-header" style={{ background: 'var(--success-50)', borderBottom: '2px solid var(--success-200)' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>📈</span> 3. Confusion Matrix Analysis
              </h3>
              <span className="status-badge success"><span className="status-dot" />Model Performance</span>
            </div>
            <div className="card-body" style={{ padding: '0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '400px' }}>
                {/* Left: Matrix */}
                <div style={{ padding: '24px', borderRight: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--gray-700)' }}>Confusion Matrix Heatmap</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: '4px' }}>
                    <div></div>
                    <div style={{ textAlign: 'center', fontWeight: '600', fontSize: '11px', padding: '8px', background: 'var(--gray-100)', borderRadius: '4px' }}>Predicted: Legit</div>
                    <div style={{ textAlign: 'center', fontWeight: '600', fontSize: '11px', padding: '8px', background: 'var(--gray-100)', borderRadius: '4px' }}>Predicted: Fraud</div>
                    <div style={{ fontWeight: '600', fontSize: '11px', padding: '8px', display: 'flex', alignItems: 'center', background: 'var(--gray-100)', borderRadius: '4px' }}>Actual: Legit</div>
                    <div style={{ width: '130px', height: '90px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                      <div style={{ fontSize: '22px', fontWeight: '800' }}>97,845</div>
                      <div style={{ fontSize: '10px', opacity: 0.9 }}>True Negative (TN)</div>
                      <div style={{ fontSize: '10px', opacity: 0.7 }}>97.8%</div>
                    </div>
                    <div style={{ width: '130px', height: '90px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                      <div style={{ fontSize: '22px', fontWeight: '800' }}>2,155</div>
                      <div style={{ fontSize: '10px', opacity: 0.9 }}>False Positive (FP)</div>
                      <div style={{ fontSize: '10px', opacity: 0.7 }}>2.2%</div>
                    </div>
                    <div style={{ fontWeight: '600', fontSize: '11px', padding: '8px', display: 'flex', alignItems: 'center', background: 'var(--gray-100)', borderRadius: '4px' }}>Actual: Fraud</div>
                    <div style={{ width: '130px', height: '90px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                      <div style={{ fontSize: '22px', fontWeight: '800' }}>421</div>
                      <div style={{ fontSize: '10px', opacity: 0.9 }}>False Negative (FN)</div>
                      <div style={{ fontSize: '10px', opacity: 0.7 }}>4.2%</div>
                    </div>
                    <div style={{ width: '130px', height: '90px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                      <div style={{ fontSize: '22px', fontWeight: '800' }}>9,579</div>
                      <div style={{ fontSize: '10px', opacity: 0.9 }}>True Positive (TP)</div>
                      <div style={{ fontSize: '10px', opacity: 0.7 }}>95.8%</div>
                    </div>
                  </div>
                </div>
                {/* Right: Explanation */}
                <div style={{ padding: '24px', background: 'var(--gray-50)' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--gray-700)' }}>Explanation</div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '4px' }}>📁 DATA SOURCE</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Test dataset: 110,000 transactions (holdout set, never seen during training). Data from Nov-Dec 2024.</p>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '4px' }}>🤖 MODEL APPLIED</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Ensemble model (XGBoost + LightGBM + Neural Net) with optimized threshold at 0.45 for fraud classification.</p>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--warning-600)', marginBottom: '4px' }}>📤 METRICS DERIVED</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                      <div style={{ background: 'white', padding: '8px', borderRadius: '6px', fontSize: '12px' }}>
                        <span style={{ color: 'var(--gray-500)' }}>Accuracy:</span> <strong>97.7%</strong>
                      </div>
                      <div style={{ background: 'white', padding: '8px', borderRadius: '6px', fontSize: '12px' }}>
                        <span style={{ color: 'var(--gray-500)' }}>Precision:</span> <strong>81.6%</strong>
                      </div>
                      <div style={{ background: 'white', padding: '8px', borderRadius: '6px', fontSize: '12px' }}>
                        <span style={{ color: 'var(--gray-500)' }}>Recall:</span> <strong>95.8%</strong>
                      </div>
                      <div style={{ background: 'white', padding: '8px', borderRadius: '6px', fontSize: '12px' }}>
                        <span style={{ color: 'var(--gray-500)' }}>F1 Score:</span> <strong>88.1%</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>💡 KEY TAKEAWAYS</div>
                    <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                      <li><strong>421 FN (Missed Fraud):</strong> $840K potential loss - needs improvement</li>
                      <li><strong>2,155 FP:</strong> Customer friction from false blocks - acceptable trade-off</li>
                      <li>High recall (95.8%) prioritizes catching fraud over perfect precision</li>
                      <li>Threshold tuned for business: miss less fraud, accept more false alarms</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. ROC & Precision-Recall Curves - Graph + Explanation */}
          <div className="card">
            <div className="card-header" style={{ background: 'var(--info-50)', borderBottom: '2px solid var(--info-200)' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>📉</span> 4. ROC & Precision-Recall Curves
              </h3>
              <span className="status-badge info"><span className="status-dot" />Threshold Analysis</span>
            </div>
            <div className="card-body" style={{ padding: '0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '400px' }}>
                {/* Left: ROC Curve */}
                <div style={{ padding: '24px', borderRight: '1px solid var(--gray-200)' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--gray-700)' }}>ROC Curve (AUC = 0.965)</div>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={[
                      { fpr: 0, tpr: 0 }, { fpr: 0.01, tpr: 0.55 }, { fpr: 0.02, tpr: 0.72 },
                      { fpr: 0.05, tpr: 0.85 }, { fpr: 0.1, tpr: 0.92 }, { fpr: 0.15, tpr: 0.95 },
                      { fpr: 0.2, tpr: 0.97 }, { fpr: 0.3, tpr: 0.98 }, { fpr: 0.5, tpr: 0.99 },
                      { fpr: 1, tpr: 1 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="fpr" tickFormatter={(v) => (v * 100).toFixed(0) + '%'} fontSize={11} label={{ value: 'False Positive Rate', position: 'bottom', offset: -5 }} />
                      <YAxis tickFormatter={(v) => (v * 100).toFixed(0) + '%'} fontSize={11} label={{ value: 'True Positive Rate', angle: -90, position: 'left' }} />
                      <Tooltip formatter={(v) => (v * 100).toFixed(1) + '%'} />
                      <Area type="monotone" dataKey="tpr" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div style={{ marginTop: '8px', textAlign: 'center', fontSize: '12px', color: 'var(--gray-500)' }}>
                    Dashed line = random classifier (AUC = 0.5)
                  </div>
                </div>
                {/* Right: Explanation */}
                <div style={{ padding: '24px', background: 'var(--gray-50)' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--gray-700)' }}>Explanation</div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '4px' }}>📁 DATA SOURCE</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Test predictions with probability scores across all thresholds (0.0 to 1.0). Computed on 110K test transactions.</p>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '4px' }}>🤖 MODEL APPLIED</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>ROC analysis using sklearn.metrics.roc_curve. AUC (Area Under Curve) computed via trapezoidal integration.</p>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--warning-600)', marginBottom: '4px' }}>📤 OUTPUT INTERPRETATION</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Curve shows trade-off between catching fraud (TPR) and blocking legitimate transactions (FPR). Higher curve = better model.</p>
                  </div>

                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>💡 KEY TAKEAWAYS</div>
                    <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                      <li><strong>AUC = 0.965:</strong> Excellent discriminative ability (0.5 = random, 1.0 = perfect)</li>
                      <li>At 5% FPR, we achieve 85% TPR - good operating point</li>
                      <li>Curve hugs top-left corner = strong separation of classes</li>
                      <li>Outperforms previous rule-based system (AUC ~0.72)</li>
                    </ul>
                  </div>

                  <div style={{ marginTop: '16px', padding: '12px', background: 'var(--primary-50)', borderRadius: '8px', border: '1px solid var(--primary-200)' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-700)' }}>🎯 THRESHOLD SELECTION</div>
                    <p style={{ fontSize: '11px', color: 'var(--primary-600)', margin: '4px 0 0 0' }}>Current threshold: 0.45 (optimized for F1 score). Lowering catches more fraud but increases false positives.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. LIME Local Explanation - Graph + Explanation */}
          <div className="card">
            <div className="card-header" style={{ background: 'linear-gradient(135deg, #fce7f3, #fbcfe8)', borderBottom: '2px solid #f9a8d4' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🍋</span> 5. LIME Local Interpretable Explanation
              </h3>
              <span className="status-badge" style={{ background: '#f9a8d4', color: '#831843' }}><span className="status-dot" style={{ background: '#831843' }} />Instance-Level</span>
            </div>
            <div className="card-body" style={{ padding: '0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '400px' }}>
                {/* Left: LIME */}
                <div style={{ padding: '24px', borderRight: '1px solid var(--gray-200)' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--gray-700)' }}>LIME Feature Contributions</div>
                  <div style={{ background: 'var(--gray-50)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>Transaction: <strong>TXN-2024-00847293</strong></div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>Prediction: <strong style={{ color: 'var(--danger-600)' }}>FRAUD (87%)</strong></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { feature: 'amount > 3000', weight: 0.31, color: '#ef4444', desc: 'High value transaction' },
                      { feature: 'hour ∈ [0,5]', weight: 0.24, color: '#ef4444', desc: 'Late night timing' },
                      { feature: 'country = NG', weight: 0.19, color: '#ef4444', desc: 'High-risk country' },
                      { feature: 'card_present = 0', weight: 0.11, color: '#f59e0b', desc: 'Card not present' },
                      { feature: 'merchant_new = 1', weight: 0.08, color: '#f59e0b', desc: 'First-time merchant' },
                      { feature: 'account_age > 3yr', weight: -0.09, color: '#10b981', desc: 'Established account' }
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'white', borderRadius: '6px', border: '1px solid var(--gray-200)' }}>
                        <div style={{ width: '120px', fontSize: '11px', fontFamily: 'monospace', color: 'var(--gray-700)' }}>{item.feature}</div>
                        <div style={{ flex: 1, height: '20px', background: 'var(--gray-100)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                          <div style={{ position: 'absolute', left: item.weight > 0 ? '50%' : undefined, right: item.weight < 0 ? '50%' : undefined, width: `${Math.abs(item.weight) * 150}%`, height: '100%', background: item.color, borderRadius: '4px' }}></div>
                        </div>
                        <div style={{ width: '45px', fontSize: '11px', fontWeight: '600', color: item.color }}>{item.weight > 0 ? '+' : ''}{item.weight.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Right: Explanation */}
                <div style={{ padding: '24px', background: 'var(--gray-50)' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--gray-700)' }}>Explanation</div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '4px' }}>📁 DATA SOURCE</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Single transaction with perturbed samples. LIME generates 5,000 synthetic neighbors to build local linear model.</p>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '4px' }}>🤖 MODEL APPLIED</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>LIME (Local Interpretable Model-agnostic Explanations). Fits interpretable linear model locally around the instance.</p>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--warning-600)', marginBottom: '4px' }}>📤 OUTPUT INTERPRETATION</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Weights show each feature's contribution to pushing prediction toward fraud (+) or legitimate (-). Human-readable rules.</p>
                  </div>

                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>💡 KEY TAKEAWAYS</div>
                    <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                      <li>LIME creates human-readable IF-THEN rules</li>
                      <li>Complementary to SHAP - local vs global view</li>
                      <li>Useful for explaining decisions to non-technical stakeholders</li>
                      <li>Model-agnostic: works with any black-box model</li>
                    </ul>
                  </div>

                  <div style={{ marginTop: '16px', padding: '12px', background: '#fce7f3', borderRadius: '8px', border: '1px solid #f9a8d4' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#831843' }}>🔍 DEBUG INFO</div>
                    <p style={{ fontSize: '11px', color: '#9d174d', margin: '4px 0 0 0' }}>LIME fidelity score: 0.94 (local model accuracy). High fidelity = reliable explanation.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Model Fairness & Bias - Graph + Explanation */}
          <div className="card">
            <div className="card-header" style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', borderBottom: '2px solid #93c5fd' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>⚖️</span> 6. Responsible AI: Fairness & Bias Analysis
              </h3>
              <span className="status-badge" style={{ background: '#93c5fd', color: '#1e40af' }}><span className="status-dot" style={{ background: '#1e40af' }} />Ethics</span>
            </div>
            <div className="card-body" style={{ padding: '0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '450px' }}>
                {/* Left: Fairness Metrics */}
                <div style={{ padding: '24px', borderRight: '1px solid var(--gray-200)' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--gray-700)' }}>Fairness Metrics by Demographic Group</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={[
                      { group: 'Age 18-30', fpr: 2.8, fnr: 4.5 },
                      { group: 'Age 31-50', fpr: 2.1, fnr: 4.2 },
                      { group: 'Age 51+', fpr: 1.9, fnr: 5.1 },
                      { group: 'Urban', fpr: 2.2, fnr: 4.0 },
                      { group: 'Rural', fpr: 2.4, fnr: 4.8 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="group" fontSize={10} />
                      <YAxis fontSize={11} tickFormatter={(v) => v + '%'} />
                      <Tooltip formatter={(v) => v + '%'} />
                      <Bar dataKey="fpr" fill="#f59e0b" name="False Positive Rate" />
                      <Bar dataKey="fnr" fill="#ef4444" name="False Negative Rate" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div style={{ marginTop: '20px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>Fairness Scores</div>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {[
                        { metric: 'Demographic Parity', score: 0.94, status: 'pass', threshold: '> 0.80' },
                        { metric: 'Equalized Odds', score: 0.91, status: 'pass', threshold: '> 0.85' },
                        { metric: 'Predictive Parity', score: 0.89, status: 'pass', threshold: '> 0.80' },
                        { metric: 'Treatment Equality', score: 0.87, status: 'warning', threshold: '> 0.90' }
                      ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', background: item.status === 'pass' ? 'var(--success-50)' : 'var(--warning-50)', borderRadius: '6px' }}>
                          <span style={{ fontSize: '12px', flex: 1 }}>{item.metric}</span>
                          <span style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{item.threshold}</span>
                          <span style={{ fontWeight: '700', color: item.status === 'pass' ? 'var(--success-600)' : 'var(--warning-600)' }}>{item.score.toFixed(2)}</span>
                          <span style={{ fontSize: '14px' }}>{item.status === 'pass' ? '✅' : '⚠️'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Right: Explanation */}
                <div style={{ padding: '24px', background: 'var(--gray-50)' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--gray-700)' }}>Explanation</div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '4px' }}>📁 DATA SOURCE</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Test set stratified by protected attributes (age, location). 110K transactions with demographic labels from CRM system.</p>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '4px' }}>🤖 METHODOLOGY</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Fairlearn library for bias detection. Metrics computed per-group and compared against population average.</p>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--warning-600)', marginBottom: '4px' }}>📤 OUTPUT INTERPRETATION</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Scores near 1.0 = fair across groups. Low scores indicate model performs differently for certain demographics.</p>
                  </div>

                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>💡 KEY TAKEAWAYS</div>
                    <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                      <li>Model passes 3 of 4 fairness criteria</li>
                      <li>Age 51+ has slightly higher FNR - monitor for bias</li>
                      <li>Treatment Equality at 0.87 needs improvement</li>
                      <li>No geographic features used directly (proxy bias check passed)</li>
                    </ul>
                  </div>

                  <div style={{ marginTop: '16px', padding: '12px', background: 'var(--danger-50)', borderRadius: '8px', border: '1px solid var(--danger-200)' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--danger-700)' }}>⚠️ RESPONSIBLE AI ACTION</div>
                    <p style={{ fontSize: '11px', color: 'var(--danger-600)', margin: '4px 0 0 0' }}>Treatment Equality below threshold. Scheduled bias mitigation retraining with reweighting for Q2 2025.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 7. Model Debugging - Error Analysis */}
          <div className="card">
            <div className="card-header" style={{ background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', borderBottom: '2px solid #fca5a5' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🐛</span> 7. Model Debugging: Error Analysis
              </h3>
              <span className="status-badge danger"><span className="status-dot" />Debug</span>
            </div>
            <div className="card-body" style={{ padding: '0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '450px' }}>
                {/* Left: Error Distribution */}
                <div style={{ padding: '24px', borderRight: '1px solid var(--gray-200)' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--gray-700)' }}>Error Distribution by Category</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[
                      { category: 'Low Amount Fraud', fp: 45, fn: 180 },
                      { category: 'New Account', fp: 890, fn: 65 },
                      { category: 'International', fp: 650, fn: 42 },
                      { category: 'Weekend Tx', fp: 320, fn: 78 },
                      { category: 'Mobile App', fp: 250, fn: 56 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="category" fontSize={9} angle={-15} />
                      <YAxis fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="fp" fill="#f59e0b" name="False Positives" />
                      <Bar dataKey="fn" fill="#ef4444" name="False Negatives" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div style={{ marginTop: '20px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>Top Error Patterns</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        { pattern: 'New accounts (<30 days) with first large purchase', type: 'FP', count: 890, fix: 'Add velocity check' },
                        { pattern: 'Low-value fraud ($50-200 range)', type: 'FN', count: 180, fix: 'Lower threshold for small amounts' },
                        { pattern: 'International travel without notification', type: 'FP', count: 650, fix: 'Integrate travel API' }
                      ].map((item, i) => (
                        <div key={i} style={{ padding: '10px', background: 'white', borderRadius: '6px', border: '1px solid var(--gray-200)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '600', color: item.type === 'FP' ? 'var(--warning-600)' : 'var(--danger-600)' }}>{item.type}: {item.count} cases</span>
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--gray-600)', marginBottom: '4px' }}>{item.pattern}</div>
                          <div style={{ fontSize: '11px', color: 'var(--success-600)' }}>💡 Fix: {item.fix}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Right: Explanation */}
                <div style={{ padding: '24px', background: 'var(--gray-50)' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--gray-700)' }}>Explanation</div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '4px' }}>📁 DATA SOURCE</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Error log from production predictions (last 30 days). Misclassifications tagged and categorized by fraud analysts.</p>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '4px' }}>🤖 ANALYSIS METHOD</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Error Slice Discovery using DecisionTreeClassifier to find high-error subgroups. Manual review by MRM team.</p>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--warning-600)', marginBottom: '4px' }}>📤 OUTPUT INTERPRETATION</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Identifies systematic error patterns where model consistently fails. Prioritized by business impact (FN = missed fraud = $$$).</p>
                  </div>

                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>💡 KEY TAKEAWAYS</div>
                    <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                      <li><strong>890 FP on new accounts:</strong> Model over-flags first purchases - needs tuning</li>
                      <li><strong>180 FN on low amounts:</strong> $50-200 fraud slips through - threshold issue</li>
                      <li>International travel FPs can be reduced with travel API integration</li>
                      <li>Total error cost: $840K (FN) + $45K (FP customer friction) = $885K/month</li>
                    </ul>
                  </div>

                  <div style={{ marginTop: '16px', padding: '12px', background: 'var(--success-50)', borderRadius: '8px', border: '1px solid var(--success-200)' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-700)' }}>🔧 DEBUGGING ACTIONS</div>
                    <ul style={{ fontSize: '11px', color: 'var(--success-600)', margin: '4px 0 0 0', paddingLeft: '16px' }}>
                      <li>v2.1 release: Add velocity features for new accounts</li>
                      <li>v2.2 release: Separate model for micro-transactions</li>
                      <li>API integration: Travel notification system (Q2)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 8. Prediction Confidence Distribution */}
          <div className="card">
            <div className="card-header" style={{ background: 'var(--gray-100)', borderBottom: '2px solid var(--gray-300)' }}>
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>📊</span> 8. Prediction Confidence Distribution
              </h3>
              <span className="status-badge" style={{ background: 'var(--gray-300)' }}><span className="status-dot" />Calibration</span>
            </div>
            <div className="card-body" style={{ padding: '0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '400px' }}>
                {/* Left: Confidence Distribution */}
                <div style={{ padding: '24px', borderRight: '1px solid var(--gray-200)' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--gray-700)' }}>Score Distribution by Outcome</div>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={[
                      { score: '0.0-0.1', legit: 45000, fraud: 50 },
                      { score: '0.1-0.2', legit: 28000, fraud: 80 },
                      { score: '0.2-0.3', legit: 12000, fraud: 120 },
                      { score: '0.3-0.4', legit: 6000, fraud: 280 },
                      { score: '0.4-0.5', legit: 3500, fraud: 450 },
                      { score: '0.5-0.6', legit: 2000, fraud: 890 },
                      { score: '0.6-0.7', legit: 1200, fraud: 1800 },
                      { score: '0.7-0.8', legit: 800, fraud: 2500 },
                      { score: '0.8-0.9', legit: 350, fraud: 2200 },
                      { score: '0.9-1.0', legit: 150, fraud: 1630 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="score" fontSize={10} />
                      <YAxis fontSize={11} />
                      <Tooltip />
                      <Area type="monotone" dataKey="legit" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Legitimate" />
                      <Area type="monotone" dataKey="fraud" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Fraud" />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '24px', fontSize: '12px' }}>
                    <span><span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#10b981', borderRadius: '2px', marginRight: '6px' }}></span>Legitimate</span>
                    <span><span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#ef4444', borderRadius: '2px', marginRight: '6px' }}></span>Fraud</span>
                  </div>
                </div>
                {/* Right: Explanation */}
                <div style={{ padding: '24px', background: 'var(--gray-50)' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--gray-700)' }}>Explanation</div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '4px' }}>📁 DATA SOURCE</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>All test set predictions (110K) with raw probability scores before threshold application.</p>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '4px' }}>🤖 MODEL OUTPUT</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Raw probability scores from sigmoid output layer. Calibrated using Platt scaling for reliable confidence.</p>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--warning-600)', marginBottom: '4px' }}>📤 OUTPUT INTERPRETATION</div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Good separation: legitimate transactions cluster at low scores, fraud at high scores. Overlap zone (0.3-0.6) requires careful threshold tuning.</p>
                  </div>

                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>💡 KEY TAKEAWAYS</div>
                    <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                      <li>Clear bimodal distribution = good class separation</li>
                      <li>Overlap zone (0.3-0.6) contains ~12K uncertain predictions</li>
                      <li>Model is well-calibrated: 80% score ≈ 80% actual fraud rate</li>
                      <li>Consider human review for scores between 0.4-0.6</li>
                    </ul>
                  </div>

                  <div style={{ marginTop: '16px', padding: '12px', background: 'var(--primary-50)', borderRadius: '8px', border: '1px solid var(--primary-200)' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-700)' }}>📌 SUMMARY</div>
                    <p style={{ fontSize: '11px', color: 'var(--primary-600)', margin: '4px 0 0 0' }}>Model shows excellent confidence calibration with clear separation. 87% of predictions have high confidence (&gt;0.7 or &lt;0.3).</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Reference Summary */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', color: 'white' }}>
            <div className="card-body" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: 'white' }}>📋 Explainability Quick Reference</h3>
              <div className="grid grid-cols-4" style={{ gap: '16px' }}>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>🧠</div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>SHAP</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>Global + local feature attribution using game theory</div>
                </div>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>🍋</div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>LIME</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>Local interpretable model for individual predictions</div>
                </div>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚖️</div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>Fairness</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>Demographic parity, equalized odds, treatment equality</div>
                </div>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>🐛</div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>Debugging</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>Error slice discovery, systematic failure analysis</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UseCase;
