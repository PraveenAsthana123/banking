import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Icon } from '../components/Icons';
import '../styles/admin.css';
import * as api from '../services/adminApi';

// ═══════════════════════════════════════════════════════════════════════════════
// CUSTOM HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

function useAsyncData(fetchFn, deps = [], autoRefreshMs = 0) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const mountedRef = useRef(true);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      if (mountedRef.current) {
        setData(result);
        setLastRefreshed(new Date());
      }
    } catch (e) {
      if (mountedRef.current) setError(e.message || 'Failed to load');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => { mountedRef.current = false; };
  }, [load]);

  useEffect(() => {
    if (!autoRefreshMs) return;
    const id = setInterval(() => load(true), autoRefreshMs);
    return () => clearInterval(id);
  }, [load, autoRefreshMs]);

  return { data, loading, error, refresh: () => load(false), silentRefresh: () => load(true), lastRefreshed };
}

const LoadingSpinner = ({ label }) => (
  <div className="admin-loading">
    <div className="admin-spinner" />
    <span>{label || 'Loading...'}</span>
  </div>
);

const ErrorBanner = ({ message, onRetry }) => (
  <div className="admin-error">
    <Icon name="alert-triangle" size={16} />
    <span>{message}</span>
    {onRetry && <button className="btn btn-sm" onClick={onRetry}>Retry</button>}
  </div>
);

const RefreshBadge = ({ lastRefreshed, onRefresh, loading }) => (
  <div className="refresh-badge">
    {lastRefreshed && <span className="refresh-time">Updated {lastRefreshed.toLocaleTimeString()}</span>}
    <button className="btn btn-sm" onClick={onRefresh} disabled={loading}>
      <Icon name="refresh" size={12} className={loading ? 'spin' : ''} /> {loading ? 'Refreshing...' : 'Refresh'}
    </button>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const Admin = () => {
  const [activeTab, setActiveTab] = useState('integrations');
  const [expandedConfig, setExpandedConfig] = useState(null);
  const [ucFilter, setUcFilter] = useState('All');
  const [expandedSchema, setExpandedSchema] = useState({ customers: true });
  const [sqlInput, setSqlInput] = useState('');
  const [generatedSql, setGeneratedSql] = useState(null);
  const [sqlResult, setSqlResult] = useState(null);
  const [logFilter, setLogFilter] = useState('all');
  const [logSearch, setLogSearch] = useState('');
  const [selectedModel, setSelectedModel] = useState('FraudNet-v3');
  const [threshold, setThreshold] = useState(0.5);
  const [scoringResult, setScoringResult] = useState(null);
  const [scoringLoading, setScoringLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedDatasetId, setSelectedDatasetId] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);
  const [sqlGenerating, setSqlGenerating] = useState(false);
  const [sqlExecuting, setSqlExecuting] = useState(false);
  const [testingConnection, setTestingConnection] = useState(null);
  const [testResult, setTestResult] = useState({});
  const [savingConfig, setSavingConfig] = useState(null);
  const [configValues, setConfigValues] = useState({});
  const [notification, setNotification] = useState(null);
  const [actionInProgress, setActionInProgress] = useState({});
  const scoringFormRef = useRef({});

  // Helper: wrap any async action with disable-while-processing
  const withAction = (actionKey, fn) => async (...args) => {
    if (actionInProgress[actionKey]) return;
    setActionInProgress(prev => ({ ...prev, [actionKey]: true }));
    try {
      await fn(...args);
    } finally {
      setActionInProgress(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  // ─── Data fetching with auto-refresh ───────────────────────────────────────
  const datasetsData = useAsyncData(() => api.fetchDatasets(), []);
  const integrationsData = useAsyncData(() => api.fetchIntegrations(), [], 30000);
  const modelHealthData = useAsyncData(() => api.fetchModelHealth(), [], 15000);
  const useCaseData = useAsyncData(() => api.fetchUseCaseStatus(), [], 20000);
  const ragDataHook = useAsyncData(() => api.fetchRagData(), [], 20000);
  const slaData = useAsyncData(() => api.fetchSlaMetrics(), [], 15000);
  const resourceData = useAsyncData(() => api.fetchResourceUtilization(), [], 10000);
  const alertData = useAsyncData(() => api.fetchAlertRules(), []);
  const jobsData = useAsyncData(() => api.fetchActiveJobs(), [], 10000);
  const vectorDbData = useAsyncData(() => api.fetchVectorDbStats(), [], 30000);
  const modelRegistryData = useAsyncData(() => api.fetchDbModelRegistry(), []);
  const chunkingDataHook = useAsyncData(() => api.fetchChunkingData(), [], 30000);
  const logsData = useAsyncData(() => api.fetchLogs(), [], 5000);
  const traceData = useAsyncData(() => api.fetchTraceSpans(), []);
  const metricsDataHook = useAsyncData(() => api.fetchModelMetrics(selectedModel), [selectedModel]);
  const statsDataHook = useAsyncData(() => api.fetchStatsData(selectedDatasetId), [selectedDatasetId]);
  const auditData = useAsyncData(() => api.fetchAuditLog(), [], 30000);
  const rbacData = useAsyncData(() => api.fetchRbacUsers(), []);
  const apiKeysData = useAsyncData(() => api.fetchApiKeys(), []);
  const backupsData = useAsyncData(() => api.fetchBackups(), []);
  const queryHistoryData = useAsyncData(() => api.fetchQueryHistory(), [sqlResult, generatedSql]);
  const scoreDistribution = React.useMemo(() => api.getScoreDistribution(), []);

  // ─── Load models and schema on mount ────────────────────────────────────────
  useEffect(() => {
    api.fetchDbModelRegistry().then(models => {
      if (Array.isArray(models)) setAvailableModels(models);
    }).catch(() => {});
    api.loadSchemaData?.().catch(() => {});
  }, []);

  // ─── Notifications ─────────────────────────────────────────────────────────
  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleTestConnection = async (id) => {
    setTestingConnection(id);
    setTestResult(prev => ({ ...prev, [id]: null }));
    try {
      const result = await api.testIntegrationConnection(id);
      setTestResult(prev => ({ ...prev, [id]: result }));
      if (result.success) {
        showNotification(`${id} connected successfully (${result.latency}ms)`);
        integrationsData.silentRefresh();
      } else {
        showNotification(result.message, 'error');
      }
    } catch {
      setTestResult(prev => ({ ...prev, [id]: { success: false, message: 'Network error' } }));
    }
    setTestingConnection(null);
  };

  const handleSaveConfig = async (id) => {
    setSavingConfig(id);
    try {
      await api.saveIntegrationConfig(id, configValues[id] || {});
      showNotification(`Configuration saved for ${id}`);
      setExpandedConfig(null);
    } catch {
      showNotification('Failed to save configuration', 'error');
    }
    setSavingConfig(null);
  };

  const handleToggleAlert = async (index) => {
    const current = alertData.data?.[index];
    if (!current) return;
    await api.toggleAlertRule(index, !current.enabled);
    alertData.silentRefresh();
    showNotification(`Alert "${current.name}" ${!current.enabled ? 'enabled' : 'disabled'}`);
  };

  const handleCancelJob = async (jobId) => {
    setActionInProgress(prev => ({ ...prev, [`cancel-${jobId}`]: true }));
    try {
      await api.cancelJob(jobId);
      showNotification(`Job ${jobId} cancelled`);
      jobsData.silentRefresh();
    } finally {
      setActionInProgress(prev => ({ ...prev, [`cancel-${jobId}`]: false }));
    }
  };

  const handleRetryJob = async (jobId) => {
    setActionInProgress(prev => ({ ...prev, [`retry-${jobId}`]: true }));
    try {
      await api.retryJob(jobId);
      showNotification(`Job ${jobId} restarted`);
      jobsData.silentRefresh();
    } finally {
      setActionInProgress(prev => ({ ...prev, [`retry-${jobId}`]: false }));
    }
  };

  const handleScore = async () => {
    setScoringLoading(true);
    try {
      const features = {
        transactionAmount: parseFloat(scoringFormRef.current.transactionAmount?.value || 2500),
        accountAge: parseInt(scoringFormRef.current.accountAge?.value || 365),
        txFrequency: parseInt(scoringFormRef.current.txFrequency?.value || 12),
        creditScore: parseInt(scoringFormRef.current.creditScore?.value || 720),
        merchantRisk: scoringFormRef.current.merchantRisk?.value || 'Medium',
        geoDistance: parseFloat(scoringFormRef.current.geoDistance?.value || 45),
      };
      const modelPath = scoringFormRef.current.model?.value || selectedModel;
      const result = await api.scoreRecord(modelPath, features);
      setScoringResult(result);
    } catch {
      showNotification('Scoring failed', 'error');
    }
    setScoringLoading(false);
  };

  const handleGenerateSql = async () => {
    if (!sqlInput.trim()) return;
    setSqlGenerating(true);
    setSqlResult(null);
    try {
      const result = await api.generateSql(sqlInput);
      setGeneratedSql(result);
    } catch {
      showNotification('SQL generation failed', 'error');
    }
    setSqlGenerating(false);
  };

  const handleExecuteSql = async () => {
    if (!generatedSql) return;
    setSqlExecuting(true);
    try {
      const result = await api.executeSql(generatedSql);
      setSqlResult(result);
    } catch {
      showNotification('SQL execution failed', 'error');
    }
    setSqlExecuting(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      const result = await api.uploadFile(file);
      showNotification(`Uploaded "${result.filename}" — ${result.rows} rows, ${result.cols} columns`);
      setSelectedDatasetId(result.id);
      datasetsData.silentRefresh();
    } catch (err) {
      showNotification(err.message || 'Upload failed', 'error');
    }
    setUploadingFile(false);
    e.target.value = '';
  };

  const handleFileDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      const result = await api.uploadFile(file);
      showNotification(`Uploaded "${result.filename}" — ${result.rows} rows, ${result.cols} columns`);
      setSelectedDatasetId(result.id);
      datasetsData.silentRefresh();
    } catch (err) {
      showNotification(err.message || 'Upload failed', 'error');
    }
    setUploadingFile(false);
  };

  const handleExampleClick = async (p) => {
    setSqlInput(p);
    setSqlGenerating(true);
    setSqlResult(null);
    try {
      const result = await api.generateSql(p);
      setGeneratedSql(result);
    } catch {
      showNotification('SQL generation failed', 'error');
    }
    setSqlGenerating(false);
  };

  const handleRevokeKey = async (name) => {
    await api.revokeApiKey(name);
    showNotification(`API key "${name}" revoked`);
    apiKeysData.silentRefresh();
    auditData.silentRefresh();
  };

  const filteredLogs = React.useMemo(() => {
    if (!logsData.data) return [];
    return logsData.data.filter(l => {
      if (logFilter !== 'all' && l.level !== logFilter) return false;
      if (logSearch && !l.msg.toLowerCase().includes(logSearch.toLowerCase()) && !l.source.toLowerCase().includes(logSearch.toLowerCase())) return false;
      return true;
    });
  }, [logsData.data, logFilter, logSearch]);

  const getHeatmapColor = (v) => {
    if (v >= 0.8) return { bg: '#166534', color: 'white' };
    if (v >= 0.5) return { bg: '#22c55e', color: 'white' };
    if (v >= 0.2) return { bg: '#bbf7d0', color: '#166534' };
    if (v >= 0) return { bg: '#fef9c3', color: '#854d0e' };
    if (v >= -0.2) return { bg: '#fde68a', color: '#854d0e' };
    if (v >= -0.5) return { bg: '#fb923c', color: 'white' };
    return { bg: '#dc2626', color: 'white' };
  };

  const tabs = [
    { id: 'integrations', label: 'Integrations', icon: 'globe', badge: integrationsData.data?.length },
    { id: 'monitoring', label: 'Monitoring', icon: 'pipelines', badge: modelHealthData.data?.filter(m => m.status !== 'healthy').length },
    { id: 'jobs', label: 'Jobs', icon: 'cpu', badge: jobsData.data?.filter(j => j.status === 'running').length },
    { id: 'logs', label: 'Logs & Traces', icon: 'file' },
    { id: 'metrics', label: 'Model Metrics', icon: 'target' },
    { id: 'statistics', label: 'Statistics', icon: 'chart' },
    { id: 'scoring', label: 'Scoring', icon: 'zap' },
    { id: 'audit', label: 'Audit', icon: 'shield' },
    { id: 'text2sql', label: 'Text2SQL', icon: 'database' },
  ];

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB 1: INTEGRATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  const renderIntegrations = () => {
    if (integrationsData.loading && !integrationsData.data) return <LoadingSpinner label="Loading integrations..." />;
    if (integrationsData.error) return <ErrorBanner message={integrationsData.error} onRetry={integrationsData.refresh} />;
    const integrations = integrationsData.data || [];
    return (
      <div>
        <div className="admin-section-header">
          <h2>External Integrations</h2>
          <RefreshBadge lastRefreshed={integrationsData.lastRefreshed} onRefresh={integrationsData.refresh} loading={integrationsData.loading} />
        </div>
        <div className="integration-grid">
          {integrations.map(intg => (
            <div key={intg.id} className="integration-card">
              <div className="integration-card-header">
                <div className="integration-icon" style={{ background: intg.color }}><Icon name={intg.icon} size={20} /></div>
                <div className="integration-card-info"><h4>{intg.name}</h4><p>{intg.desc}</p></div>
                <div className="integration-status">
                  <span className={`integration-status-dot ${intg.status}`} />
                  <span className={`status-badge ${intg.status}`}>{intg.status}</span>
                </div>
              </div>
              <div className="integration-meta">
                <span><Icon name="clock" size={12} /> {intg.lastSync}</span>
                <span><Icon name="database" size={12} /> {intg.records.toLocaleString()} records</span>
                {intg.errors > 0 && <span style={{ color: 'var(--danger-500)' }}><Icon name="alert-triangle" size={12} /> {intg.errors} errors</span>}
              </div>
              <div className="integration-actions">
                <button className="btn btn-sm" onClick={() => setExpandedConfig(expandedConfig === intg.id ? null : intg.id)}>
                  <Icon name="settings" size={12} /> Configure
                </button>
                <button className="btn btn-sm btn-success" onClick={() => handleTestConnection(intg.id)} disabled={testingConnection === intg.id}>
                  <Icon name="zap" size={12} /> {testingConnection === intg.id ? 'Testing...' : 'Test'}
                </button>
              </div>
              {testResult[intg.id] && (
                <div className={`integration-test-result ${testResult[intg.id].success ? 'success' : 'error'}`}>
                  <Icon name={testResult[intg.id].success ? 'check' : 'alert-triangle'} size={14} />
                  <span>{testResult[intg.id].message}</span>
                  {testResult[intg.id].latency && <span className="mono">({testResult[intg.id].latency}ms)</span>}
                </div>
              )}
              {expandedConfig === intg.id && (
                <div className="integration-config">
                  {intg.fields.map(f => (
                    <div key={f.key} className="config-field">
                      <label>{f.label}</label>
                      {f.type === 'select'
                        ? <select defaultValue={f.options[0]} onChange={e => setConfigValues(prev => ({ ...prev, [intg.id]: { ...(prev[intg.id] || {}), [f.key]: e.target.value } }))}>{f.options.map(o => <option key={o}>{o}</option>)}</select>
                        : <input type={f.type} placeholder={f.placeholder} onChange={e => setConfigValues(prev => ({ ...prev, [intg.id]: { ...(prev[intg.id] || {}), [f.key]: e.target.value } }))} />
                      }
                    </div>
                  ))}
                  <div className="config-actions">
                    <button className="btn btn-primary btn-sm" onClick={() => handleSaveConfig(intg.id)} disabled={savingConfig === intg.id}>
                      {savingConfig === intg.id ? 'Saving...' : 'Save'}
                    </button>
                    <button className="btn btn-sm" onClick={() => setExpandedConfig(null)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB 2: MONITORING
  // ═══════════════════════════════════════════════════════════════════════════
  const renderMonitoring = () => (
    <div>
      {/* SLA Metrics */}
      <div className="admin-section">
        <div className="admin-section-header"><h2>SLA Tracking</h2>
          <RefreshBadge lastRefreshed={slaData.lastRefreshed} onRefresh={slaData.refresh} loading={slaData.loading} />
        </div>
        {slaData.loading && !slaData.data ? <LoadingSpinner label="Loading SLA..." /> : (
          <div className="sla-cards">
            {(slaData.data || []).map(s => (
              <div key={s.name} className="sla-card">
                <h5>{s.name}</h5>
                <div className="sla-value" style={{ color: s.ok ? 'var(--success-600)' : 'var(--danger-600)' }}>{s.value}</div>
                <div className="sla-target">{s.target}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resource Utilization */}
      <div className="admin-section">
        <div className="admin-section-header"><h2>Resource Utilization</h2>
          <RefreshBadge lastRefreshed={resourceData.lastRefreshed} onRefresh={resourceData.refresh} loading={resourceData.loading} />
        </div>
        {resourceData.loading && !resourceData.data ? <LoadingSpinner /> : (
          <div className="resource-grid">
            {(resourceData.data || []).map(r => (
              <div key={r.name} className="resource-card">
                <h5><Icon name="cpu" size={14} /> {r.name}</h5>
                <div className="resource-usage-bar">
                  <div className="resource-usage-fill" style={{ width: `${r.usage}%`, background: r.usage > 85 ? 'var(--danger-500)' : r.usage > 70 ? 'var(--warning-500)' : 'var(--success-500)' }} />
                </div>
                <div className="resource-usage-labels"><span>{r.used} used</span><span>{r.total} total ({r.usage}%)</span></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Model Health */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h2>Model Controller Protocol</h2>
          <RefreshBadge lastRefreshed={modelHealthData.lastRefreshed} onRefresh={modelHealthData.refresh} loading={modelHealthData.loading} />
        </div>
        {modelHealthData.loading && !modelHealthData.data ? <LoadingSpinner label="Checking model health..." /> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Model</th><th>Version</th><th>Status</th><th>Endpoint</th><th>Latency</th><th>Last Check</th><th>Uptime</th></tr></thead>
              <tbody>
                {(modelHealthData.data || []).map(m => (
                  <tr key={m.name} className={`row-${m.status}`}>
                    <td style={{ fontWeight: 600 }}>{m.name}</td>
                    <td className="mono">{m.version}</td>
                    <td><span className={`status-badge ${m.status}`}>{m.status}</span></td>
                    <td className="mono">{m.endpoint}</td>
                    <td>{typeof m.latency === 'number' ? `${m.latency}ms` : m.latency}</td>
                    <td>{m.lastCheck}</td>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="progress-bar" style={{ width: 60 }}><div className={`progress-bar-fill ${m.uptime > 99 ? 'green' : m.uptime > 97 ? 'yellow' : 'red'}`} style={{ width: `${m.uptime}%` }} /></div><span style={{ fontSize: 12, fontWeight: 600 }}>{m.uptime}%</span></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Alert Rules */}
      <div className="admin-section">
        <div className="admin-section-header"><h2>Alert Rules</h2><button className="btn btn-sm btn-primary" onClick={() => showNotification('Alert rule creation coming soon', 'info')}><Icon name="plus" size={12} /> Add Rule</button></div>
        {alertData.loading && !alertData.data ? <LoadingSpinner /> : (alertData.data || []).map((r, i) => (
          <div key={i} className="alert-rule">
            <div className={`alert-rule-indicator ${r.enabled ? 'enabled' : 'disabled'}`} />
            <div className="alert-rule-info"><div className="alert-rule-name">{r.name}</div><div className="alert-rule-desc">{r.desc}</div></div>
            <button className={`toggle-switch ${r.enabled ? 'on' : ''}`} onClick={() => handleToggleAlert(i)} />
          </div>
        ))}
      </div>

      {/* Use Case Monitoring */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h2>Use Case Monitoring</h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select value={ucFilter} onChange={e => setUcFilter(e.target.value)} style={{ padding: '6px 12px', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-sm)', fontSize: 12 }}>
              <option value="All">All Groups</option>
              {[...new Set((useCaseData.data || []).map(u => u.group))].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <RefreshBadge lastRefreshed={useCaseData.lastRefreshed} onRefresh={useCaseData.refresh} loading={useCaseData.loading} />
          </div>
        </div>
        {useCaseData.loading && !useCaseData.data ? <LoadingSpinner /> : (
          <div className="monitoring-grid">
            {(useCaseData.data || []).filter(u => ucFilter === 'All' || u.group === ucFilter).map(uc => (
              <div key={uc.ucId} className="monitoring-card">
                <h4><span>{uc.ucId}</span><span className={`status-badge ${uc.pipeline}`}>{uc.pipeline}</span></h4>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)', marginBottom: 8 }}>{uc.name}</div>
                <div className="meta-row"><span>Last Run</span><span className="meta-value">{uc.lastRun}</span></div>
                <div className="meta-row"><span>Duration</span><span className="meta-value">{uc.duration}</span></div>
                <div className="meta-row"><span>Success Rate</span><span className="meta-value" style={{ color: uc.successRate > 98 ? 'var(--success-600)' : uc.successRate > 95 ? 'var(--warning-600)' : 'var(--danger-600)' }}>{uc.successRate}%</span></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RAG Pipeline */}
      <div className="admin-section">
        {ragDataHook.loading && !ragDataHook.data ? <LoadingSpinner /> : ragDataHook.data && (
          <div className="rag-panel">
            <h3>RAG Pipeline Health</h3>
            <div className="rag-stats">
              <div className="rag-stat"><div className="rag-stat-label">Indexing Status</div><div className="rag-stat-value" style={{ color: 'var(--success-600)' }}>{ragDataHook.data.indexingStatus}</div></div>
              <div className="rag-stat"><div className="rag-stat-label">Documents</div><div className="rag-stat-value">{ragDataHook.data.documentCount.toLocaleString()}</div></div>
              <div className="rag-stat"><div className="rag-stat-label">Indexed Chunks</div><div className="rag-stat-value">{ragDataHook.data.indexedChunks.toLocaleString()}</div></div>
              <div className="rag-stat"><div className="rag-stat-label">Embedding Model</div><div className="rag-stat-value" style={{ fontSize: 13 }}>{ragDataHook.data.embeddingModel}</div></div>
              <div className="rag-stat"><div className="rag-stat-label">Retrieval Latency</div><div className="rag-stat-value">{ragDataHook.data.retrievalLatency}</div></div>
              <div className="rag-stat"><div className="rag-stat-label">Retrieval Accuracy</div><div className="rag-stat-value">{ragDataHook.data.retrievalAccuracy}%</div></div>
            </div>
            <div className="rag-chart">
              <div className="rag-chart-title">Ingestion Queue Depth (last 15 intervals)</div>
              <div className="rag-bars">{ragDataHook.data.queueDepth.map((d, i) => <div key={i} className="rag-bar" style={{ height: `${(d / 30) * 100}%` }} title={`Queue: ${d}`} />)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB 3: JOB MONITORING
  // ═══════════════════════════════════════════════════════════════════════════
  const renderJobs = () => (
    <div>
      <div className="admin-section">
        <div className="admin-section-header"><h2>Active Jobs</h2>
          <RefreshBadge lastRefreshed={jobsData.lastRefreshed} onRefresh={jobsData.refresh} loading={jobsData.loading} />
        </div>
        {jobsData.loading && !jobsData.data ? <LoadingSpinner label="Loading jobs..." /> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Job ID</th><th>Type</th><th>Use Case</th><th>Status</th><th>Started</th><th>Duration</th><th>Progress</th><th>Actions</th></tr></thead>
              <tbody>
                {(jobsData.data || []).map(job => (
                  <tr key={job.id}>
                    <td className="mono" style={{ fontWeight: 600 }}>{job.id}</td>
                    <td><span className="status-badge info">{job.type}</span></td>
                    <td className="mono">{job.useCase}</td>
                    <td><span className={`status-badge ${job.status}`}>{job.status}</span></td>
                    <td>{job.started}</td><td>{job.duration}</td>
                    <td style={{ minWidth: 120 }}><div className="progress-bar"><div className={`progress-bar-fill ${job.status === 'completed' ? 'green' : job.status === 'failed' ? 'red' : 'blue'}`} style={{ width: `${job.progress}%` }} /></div><div className="progress-label">{job.progress}%</div></td>
                    <td><div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-sm btn-icon" title="View Logs" onClick={() => { setActiveTab('logs'); showNotification(`Viewing logs for ${job.id}`); }}><Icon name="eye" size={12} /></button>
                      {job.status === 'running' && <button className="btn btn-sm btn-icon btn-danger" title="Cancel" onClick={() => handleCancelJob(job.id)} disabled={actionInProgress[`cancel-${job.id}`]}><Icon name="x" size={12} /></button>}
                      {job.status === 'failed' && <button className="btn btn-sm btn-icon" title="Retry" onClick={() => handleRetryJob(job.id)} disabled={actionInProgress[`retry-${job.id}`]}><Icon name="refresh" size={12} /></button>}
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="admin-section">
        <div className="admin-section-header"><h2>Vector DB Status</h2>
          <RefreshBadge lastRefreshed={vectorDbData.lastRefreshed} onRefresh={vectorDbData.refresh} loading={vectorDbData.loading} />
        </div>
        {vectorDbData.loading && !vectorDbData.data ? <LoadingSpinner /> : vectorDbData.data && (<>
          <div className="stat-grid">
            <div className="stat-card"><div className="stat-card-label">Total Vectors</div><div className="stat-card-value">{vectorDbData.data.totalVectors.toLocaleString()}</div></div>
            <div className="stat-card"><div className="stat-card-label">Dimensions</div><div className="stat-card-value">{vectorDbData.data.dimensions}</div></div>
            <div className="stat-card"><div className="stat-card-label">Index Type</div><div className="stat-card-value">{vectorDbData.data.indexType}</div></div>
            <div className="stat-card"><div className="stat-card-label">Collections</div><div className="stat-card-value">{vectorDbData.data.collections}</div></div>
            <div className="stat-card"><div className="stat-card-label">Memory</div><div className="stat-card-value">{vectorDbData.data.memoryUsage}</div></div>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Collection</th><th>Vectors</th><th>Dim</th><th>Index</th><th>Updated</th></tr></thead>
              <tbody>{vectorDbData.data.collectionTable.map(c => <tr key={c.name}><td className="mono" style={{ fontWeight: 600 }}>{c.name}</td><td>{c.vectors.toLocaleString()}</td><td>{c.dim}</td><td><span className="status-badge info">{c.index}</span></td><td>{c.updated}</td></tr>)}</tbody>
            </table>
          </div>
        </>)}
      </div>

      <div className="admin-section">
        <div className="admin-section-header"><h2>Model Registry</h2></div>
        {modelRegistryData.loading && !modelRegistryData.data ? <LoadingSpinner /> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Model</th><th>Framework</th><th>Version</th><th>Size</th><th>Deployed</th><th>Endpoint</th></tr></thead>
              <tbody>{(modelRegistryData.data || []).map(m => <tr key={m.name}><td style={{ fontWeight: 600 }}>{m.name}</td><td><span className="status-badge" style={{ background: 'var(--primary-50)', color: 'var(--primary-700)' }}>{m.framework}</span></td><td className="mono">{m.version}</td><td>{m.size}</td><td>{m.deployed}</td><td className="mono">{m.endpoint}</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </div>

      <div className="admin-section">
        <div className="admin-section-header"><h2>Chunking & Tokenization</h2></div>
        {chunkingDataHook.loading && !chunkingDataHook.data ? <LoadingSpinner /> : chunkingDataHook.data && (<>
          <div className="stat-grid">
            <div className="stat-card"><div className="stat-card-label">Documents Chunked</div><div className="stat-card-value">{chunkingDataHook.data.totalDocs.toLocaleString()}</div></div>
            <div className="stat-card"><div className="stat-card-label">Avg Chunk Size</div><div className="stat-card-value">{chunkingDataHook.data.avgChunkSize} tok</div></div>
            <div className="stat-card"><div className="stat-card-label">Total Tokens</div><div className="stat-card-value">{(chunkingDataHook.data.totalTokens / 1e6).toFixed(1)}M</div></div>
            <div className="stat-card"><div className="stat-card-label">Embedding Dim</div><div className="stat-card-value">{chunkingDataHook.data.embeddingDim}</div></div>
          </div>
          <div className="chunk-config">
            <h4>Chunk Strategy</h4>
            <div className="chunk-config-grid">
              <div className="chunk-config-item"><div className="label">Strategy</div><div className="value">{chunkingDataHook.data.strategy}</div></div>
              <div className="chunk-config-item"><div className="label">Chunk Size</div><div className="value">{chunkingDataHook.data.chunkSize}</div></div>
              <div className="chunk-config-item"><div className="label">Overlap</div><div className="value">{chunkingDataHook.data.overlap}</div></div>
              <div className="chunk-config-item"><div className="label">Separator</div><div className="value mono">{chunkingDataHook.data.separator}</div></div>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}><h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 8 }}>Token Usage</h4>
            <div className="token-usage">
              <div className="token-stat"><div className="token-stat-label">Prompt Tokens</div><div className="token-stat-value">{(chunkingDataHook.data.promptTokens / 1e6).toFixed(1)}M</div></div>
              <div className="token-stat"><div className="token-stat-label">Completion</div><div className="token-stat-value">{(chunkingDataHook.data.completionTokens / 1e6).toFixed(1)}M</div></div>
              <div className="token-stat"><div className="token-stat-label">Total Cost</div><div className="token-stat-value">{chunkingDataHook.data.totalCost}</div></div>
            </div>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Job ID</th><th>Docs</th><th>Chunks</th><th>Tokens</th><th>Status</th><th>Time</th></tr></thead>
              <tbody>{chunkingDataHook.data.recentJobs.map(j => <tr key={j.id}><td className="mono" style={{ fontWeight: 600 }}>{j.id}</td><td>{j.docs}</td><td>{j.chunks.toLocaleString()}</td><td>{j.tokens.toLocaleString()}</td><td><span className={`status-badge ${j.status}`}>{j.status}</span></td><td>{j.time}</td></tr>)}</tbody>
            </table>
          </div>
        </>)}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB 4: LOGS & TRACES
  // ═══════════════════════════════════════════════════════════════════════════
  const renderLogs = () => (
    <div>
      <div className="admin-section">
        <div className="admin-section-header"><h2>Live Log Viewer</h2>
          <RefreshBadge lastRefreshed={logsData.lastRefreshed} onRefresh={logsData.refresh} loading={logsData.loading} />
        </div>
        <div className="log-viewer">
          <div className="log-viewer-header">
            <span>Application Logs {logsData.data ? `(${filteredLogs.length} entries)` : ''}</span>
            <div className="log-filters">
              {['all', 'error', 'warn', 'info', 'debug'].map(level => (
                <button key={level} className={`log-filter-btn ${logFilter === level ? `active log-${level}` : ''}`} onClick={() => setLogFilter(level)}>{level}</button>
              ))}
            </div>
          </div>
          <div className="log-entries">
            {logsData.loading && !logsData.data ? <LoadingSpinner label="Streaming logs..." /> :
              filteredLogs.map((l, i) => (
                <div key={i} className="log-entry">
                  <span className="log-ts">{l.ts}</span>
                  <span className={`log-level ${l.level}`}>{l.level}</span>
                  <span className="log-source">[{l.source}]</span>
                  <span className="log-msg">{l.msg}</span>
                </div>
              ))
            }
          </div>
          <div className="log-search">
            <input value={logSearch} onChange={e => setLogSearch(e.target.value)} placeholder="Search logs..." />
          </div>
        </div>
      </div>

      <div className="admin-section">
        <div className="admin-section-header"><h2>Request Trace</h2>
          <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>Trace ID: trace-{Math.random().toString(36).substr(2, 8)}</span>
        </div>
        {traceData.loading && !traceData.data ? <LoadingSpinner /> : (
          <div className="trace-timeline">
            {(traceData.data || []).map((s, i) => (
              <div key={i} className={`trace-span ${s.status}`}>
                <div className="trace-span-name">{s.name}</div>
                <div className="trace-span-bar"><div className="trace-span-fill" style={{ left: `${s.start}%`, width: `${s.width}%` }} /></div>
                <div className="trace-span-duration">{s.duration}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB 5: MODEL METRICS
  // ═══════════════════════════════════════════════════════════════════════════
  const renderMetrics = () => {
    const md = metricsDataHook.data;
    return (
      <div>
        <div className="admin-section">
          <div className="admin-section-header"><h2>Model Performance: {selectedModel}</h2>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)} style={{ padding: '6px 12px', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-sm)', fontSize: 12 }}>
                {api.scoringModels.map(m => <option key={m}>{m}</option>)}
              </select>
              <RefreshBadge lastRefreshed={metricsDataHook.lastRefreshed} onRefresh={metricsDataHook.refresh} loading={metricsDataHook.loading} />
            </div>
          </div>
          {metricsDataHook.loading && !md ? <LoadingSpinner label="Loading model metrics..." /> : md && (
            <div className="metrics-highlights">
              {[
                { label: 'Accuracy', value: md.accuracy, color: 'var(--primary-700)' },
                { label: 'Precision', value: md.precision, color: 'var(--success-600)' },
                { label: 'Recall', value: md.recall, color: '#7c3aed' },
                { label: 'F1 Score', value: md.f1, color: 'var(--warning-600)' },
                { label: 'AUC-ROC', value: md.aucRoc, color: 'var(--danger-600)' },
                { label: 'MCC', value: md.mcc, color: 'var(--info-600)' },
                { label: 'Log Loss', value: md.logLoss, color: 'var(--gray-700)' },
                { label: 'Specificity', value: md.specificity, color: '#059669' },
              ].map(m => (
                <div key={m.label} className="metric-highlight">
                  <div className="metric-highlight-value" style={{ color: m.color }}>{m.label === 'Log Loss' ? m.value.toFixed(3) : (m.value * (m.value < 1 ? 100 : 1)).toFixed(1) + (m.value < 1 && m.label !== 'Log Loss' ? '%' : '')}</div>
                  <div className="metric-highlight-label">{m.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {md && (<>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
            <div className="roc-chart-wrap">
              <h4>Confusion Matrix</h4>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
                <div className="confusion-matrix-grid">
                  <div className="cm-header" /><div className="cm-header">Predicted +</div><div className="cm-header">Predicted -</div>
                  <div className="cm-label">Actual +</div><div className="cm-cell cm-tp">{md.cm.tp.toLocaleString()}<span>True Pos</span></div><div className="cm-cell cm-fn">{md.cm.fn}<span>False Neg</span></div>
                  <div className="cm-label">Actual -</div><div className="cm-cell cm-fp">{md.cm.fp}<span>False Pos</span></div><div className="cm-cell cm-tn">{md.cm.tn.toLocaleString()}<span>True Neg</span></div>
                </div>
              </div>
            </div>
            <div className="roc-chart-wrap">
              <h4>ROC Curve (AUC = {md.aucRoc.toFixed(3)})</h4>
              <svg viewBox="0 0 220 220" className="roc-chart-svg">
                <rect x="30" y="10" width="180" height="180" fill="var(--gray-50)" stroke="var(--gray-200)" />
                <line x1="30" y1="190" x2="210" y2="10" stroke="var(--gray-300)" strokeDasharray="4" />
                <polyline fill="none" stroke="var(--primary-600)" strokeWidth="2.5"
                  points={md.rocPoints.map(([x, y]) => `${30 + x * 180},${190 - y * 180}`).join(' ')} />
                <text x="120" y="210" textAnchor="middle" fontSize="10" fill="var(--gray-500)">FPR</text>
                <text x="10" y="100" textAnchor="middle" fontSize="10" fill="var(--gray-500)" transform="rotate(-90,10,100)">TPR</text>
              </svg>
            </div>
          </div>

          <div className="admin-section">
            <div className="feature-importance">
              <h4>Feature Importance</h4>
              {md.featureImportance.map(f => (
                <div key={f.name} className="fi-bar-row">
                  <div className="fi-bar-label">{f.name}</div>
                  <div className="fi-bar-track"><div className="fi-bar-fill" style={{ width: `${f.value * 100 / 0.35}%`, background: f.color }} /></div>
                  <div className="fi-bar-value">{(f.value * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-section">
            <div className="admin-section-header"><h2>Model Comparison</h2></div>
            <div className="model-compare-grid">
              {md.modelComparison.map(m => (
                <div key={m.name} className="model-compare-card">
                  <div className="model-compare-header">{m.name}</div>
                  <div className="model-compare-body">
                    <div className="model-compare-row"><span>Accuracy</span><span style={{ fontWeight: 700 }}>{(m.accuracy * 100).toFixed(1)}%</span></div>
                    <div className="model-compare-row"><span>F1 Score</span><span style={{ fontWeight: 700 }}>{(m.f1 * 100).toFixed(1)}%</span></div>
                    <div className="model-compare-row"><span>AUC-ROC</span><span style={{ fontWeight: 700 }}>{m.auc.toFixed(3)}</span></div>
                    <div className="model-compare-row"><span>Latency</span><span style={{ fontWeight: 700 }}>{m.latency}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-section">
            <div className="admin-section-header"><h2>Bias & Fairness Metrics</h2></div>
            <div className="fairness-grid">
              {md.fairness.map(f => (
                <div key={f.group} className="fairness-card">
                  <h5>{f.group}</h5>
                  <div className="fairness-gauge">
                    <svg width="80" height="80" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="32" fill="none" stroke="var(--gray-100)" strokeWidth="8" />
                      <circle cx="40" cy="40" r="32" fill="none" stroke={f.value > 0.9 ? 'var(--success-500)' : f.value > 0.8 ? 'var(--warning-500)' : 'var(--danger-500)'} strokeWidth="8" strokeDasharray={`${f.value * 201} 201`} strokeLinecap="round" />
                    </svg>
                    <div className="fairness-gauge-value">{(f.value * 100).toFixed(0)}%</div>
                  </div>
                  <div className={`fairness-label status-badge ${f.status}`}>{f.status}</div>
                </div>
              ))}
            </div>
          </div>
        </>)}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB 6: STATISTICAL ANALYSIS
  // ═══════════════════════════════════════════════════════════════════════════
  const renderStatistics = () => {
    const sd = statsDataHook.data;
    const datasets = datasetsData.data || [];
    return (
      <div>
        <div className="admin-section-header" style={{ marginBottom: 16 }}>
          <h2>Statistical Analysis</h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {datasets.length > 0 && (
              <select value={selectedDatasetId || ''} onChange={e => setSelectedDatasetId(e.target.value ? parseInt(e.target.value) : null)} style={{ padding: '6px 12px', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-sm)', fontSize: 12 }}>
                <option value="">Select Dataset...</option>
                {datasets.map(d => <option key={d.id} value={d.id}>{d.name} ({d.rows} rows)</option>)}
              </select>
            )}
            <RefreshBadge lastRefreshed={statsDataHook.lastRefreshed} onRefresh={statsDataHook.refresh} loading={statsDataHook.loading} />
          </div>
        </div>

        {/* Upload Area */}
        <div className="admin-section" style={{ marginBottom: 16 }}>
          <div className="batch-upload" onDrop={handleFileDrop} onDragOver={e => e.preventDefault()} onClick={() => document.getElementById('stats-file-input')?.click()} style={{ cursor: 'pointer' }}>
            <input id="stats-file-input" type="file" accept=".csv,.json,.xlsx,.xls" onChange={handleFileUpload} style={{ display: 'none' }} />
            <Icon name="upload" size={32} />
            {uploadingFile ? <p>Uploading...</p> : <p>Drop a CSV, JSON, or Excel file here — or click to upload</p>}
            <p style={{ fontSize: 11, color: 'var(--gray-400)' }}>Upload data to see real statistics. Max 500MB.</p>
          </div>
          {datasets.length > 0 && (
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--gray-500)' }}>
              {datasets.length} dataset(s) uploaded. Select one above to analyze.
            </div>
          )}
        </div>

        {statsDataHook.loading && !sd && selectedDatasetId && <LoadingSpinner label="Computing statistics..." />}
        {!selectedDatasetId && !sd && <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}><Icon name="chart" size={40} /><p style={{ marginTop: 8 }}>Upload a dataset and select it to see real statistics</p></div>}
        {sd && <>

        <div className="admin-section">
          <div className="histogram-wrap">
            <h4>Score Distribution (Transaction Amount)</h4>
            <div className="histogram-bars">
              {sd.distributions.map((d, i) => (
                <div key={i} className="histogram-bar" style={{ height: `${d.height}%`, background: `hsl(${220 - i * 15}, 70%, 55%)` }}>
                  <div className="histogram-bar-tooltip">{d.label}: {d.height}</div>
                </div>
              ))}
            </div>
            <div className="histogram-x-labels"><span>$0</span><span>$500</span><span>$1,000</span></div>
          </div>
        </div>

        <div className="admin-section">
          <div className="admin-section-header"><h2>Feature Drift Detection</h2></div>
          <div className="drift-cards">
            {sd.driftFeatures.map(d => (
              <div key={d.name} className="drift-card">
                <div className="drift-card-name">{d.name}</div>
                <div className="drift-card-metric"><span>PSI</span><span className={`value ${d.status}`}>{d.psi.toFixed(2)}</span></div>
                <div className="drift-card-metric"><span>KS Statistic</span><span className={`value ${d.status}`}>{d.ks.toFixed(2)}</span></div>
                <div className="drift-card-metric"><span>Status</span><span className={`status-badge ${d.status === 'drifted' ? 'failed' : 'completed'}`}>{d.status}</span></div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-section">
          <div className="shap-chart">
            <h4>SHAP Feature Attributions (Single Prediction)</h4>
            {sd.shapValues.map(s => (
              <div key={s.feature} className="shap-bar-row">
                <div className="shap-bar-label">{s.feature}</div>
                <div className="shap-bar-container">
                  <div className="shap-bar-center" />
                  <div className={`shap-bar-fill ${s.value >= 0 ? 'positive' : 'negative'}`} style={{ width: `${Math.abs(s.value) * 120}%` }} />
                </div>
                <div className="shap-bar-value" style={{ color: s.value >= 0 ? '#ef4444' : '#3b82f6' }}>{s.value >= 0 ? '+' : ''}{s.value.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-section">
          <div className="admin-section-header"><h2>Sensitivity Analysis</h2></div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Feature</th><th>Change</th><th>Base Score</th><th>New Score</th><th>Delta</th></tr></thead>
              <tbody>
                {sd.sensitivityResults.map((s, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{s.feature}</td>
                    <td className="mono">{s.change}</td>
                    <td>{s.oldScore.toFixed(2)}</td>
                    <td style={{ fontWeight: 600 }}>{s.newScore.toFixed(2)}</td>
                    <td style={{ fontWeight: 700, color: s.delta.startsWith('+') ? 'var(--danger-600)' : 'var(--success-600)' }}>{s.delta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-section">
          <div className="heatmap-wrap">
            <h4>Feature Correlation Matrix</h4>
            <div className="heatmap-grid" style={{ gridTemplateColumns: `80px repeat(${sd.correlationMatrix.features.length}, 50px)` }}>
              <div className="heatmap-label" />
              {sd.correlationMatrix.features.map(f => <div key={f} className="heatmap-label">{f}</div>)}
              {sd.correlationMatrix.features.map((row, ri) => (
                <React.Fragment key={row}>
                  <div className="heatmap-label">{row}</div>
                  {sd.correlationMatrix.values[ri].map((v, ci) => {
                    const c = getHeatmapColor(v);
                    return <div key={ci} className="heatmap-cell" style={{ background: c.bg, color: c.color }}>{v.toFixed(2)}</div>;
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="admin-section">
          <div className="line-chart-wrap">
            <h4>Calibration Curve</h4>
            <svg viewBox="0 0 220 220" className="line-chart-svg" style={{ maxWidth: 400 }}>
              <rect x="30" y="10" width="180" height="180" fill="var(--gray-50)" stroke="var(--gray-200)" />
              <line x1="30" y1="190" x2="210" y2="10" stroke="var(--gray-300)" strokeDasharray="4" />
              <polyline fill="none" stroke="var(--primary-600)" strokeWidth="2.5" strokeLinejoin="round"
                points={sd.calibrationPoints.map(([x, y]) => `${30 + x * 180},${190 - y * 180}`).join(' ')} />
              {sd.calibrationPoints.map(([x, y], i) => <circle key={i} cx={30 + x * 180} cy={190 - y * 180} r="3" fill="var(--primary-600)" />)}
              <text x="120" y="210" textAnchor="middle" fontSize="10" fill="var(--gray-500)">Predicted Probability</text>
              <text x="10" y="100" textAnchor="middle" fontSize="10" fill="var(--gray-500)" transform="rotate(-90,10,100)">Actual</text>
            </svg>
          </div>
        </div>

        {/* Column Details Table */}
        {sd.columns && sd.columns.length > 0 && (
          <div className="admin-section">
            <div className="admin-section-header"><h2>Column Details ({sd.cols} columns, {sd.rows} rows)</h2></div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Column</th><th>Type</th><th>Non-Null</th><th>Null %</th><th>Unique</th><th>Mean</th><th>Std</th><th>Min</th><th>Max</th><th>Skewness</th></tr></thead>
                <tbody>
                  {sd.columns.map(c => (
                    <tr key={c.name}>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td className="mono">{c.dtype}</td>
                      <td>{c.count}</td>
                      <td style={{ color: c.null_pct > 5 ? 'var(--danger-600)' : 'var(--gray-600)' }}>{c.null_pct}%</td>
                      <td>{c.unique}</td>
                      <td>{c.mean !== undefined ? c.mean.toFixed(2) : '-'}</td>
                      <td>{c.std !== undefined ? c.std.toFixed(2) : '-'}</td>
                      <td>{c.min !== undefined ? c.min : '-'}</td>
                      <td>{c.max !== undefined ? c.max : '-'}</td>
                      <td>{c.skewness !== undefined ? c.skewness.toFixed(3) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </>}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB 7: SCORING
  // ═══════════════════════════════════════════════════════════════════════════
  const renderScoring = () => (
    <div>
      {/* Upload for scoring */}
      <div className="admin-section" style={{ marginBottom: 16 }}>
        <div className="batch-upload" onDrop={handleFileDrop} onDragOver={e => e.preventDefault()} onClick={() => document.getElementById('scoring-file-input')?.click()} style={{ cursor: 'pointer' }}>
          <input id="scoring-file-input" type="file" accept=".csv,.json,.xlsx,.xls" onChange={handleFileUpload} style={{ display: 'none' }} />
          <Icon name="upload" size={24} />
          {uploadingFile ? <p>Uploading...</p> : <p>Upload dataset for batch scoring</p>}
        </div>
      </div>
      <div className="admin-section">
        <div className="admin-section-header"><h2>Single Record Scoring</h2></div>
        <div className="scoring-layout">
          <div className="scoring-panel">
            <h3>Input Features</h3>
            <div className="scoring-field"><label>Model</label><select ref={el => scoringFormRef.current.model = el}>{(availableModels.length > 0 ? availableModels : [{name:'No models found', path:''}]).map(m => <option key={m.path} value={m.path}>{m.name}</option>)}</select></div>
            <div className="scoring-field"><label>Transaction Amount ($)</label><input type="number" defaultValue="2500" ref={el => scoringFormRef.current.transactionAmount = el} /></div>
            <div className="scoring-field"><label>Account Age (days)</label><input type="number" defaultValue="365" ref={el => scoringFormRef.current.accountAge = el} /></div>
            <div className="scoring-field"><label>Transaction Frequency (7d)</label><input type="number" defaultValue="12" ref={el => scoringFormRef.current.txFrequency = el} /></div>
            <div className="scoring-field"><label>Credit Score</label><input type="number" defaultValue="720" ref={el => scoringFormRef.current.creditScore = el} /></div>
            <div className="scoring-field"><label>Merchant Risk</label><select defaultValue="Medium" ref={el => scoringFormRef.current.merchantRisk = el}><option>Low</option><option>Medium</option><option>High</option></select></div>
            <div className="scoring-field"><label>Geo Distance (km)</label><input type="number" defaultValue="45" ref={el => scoringFormRef.current.geoDistance = el} /></div>
            <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={handleScore} disabled={scoringLoading}>
              <Icon name="zap" size={14} /> {scoringLoading ? 'Scoring...' : 'Score Record'}
            </button>
          </div>
          <div className="scoring-panel">
            <h3>Result</h3>
            {scoringLoading ? <LoadingSpinner label="Running model inference..." /> :
              scoringResult ? (
                <div className="score-result">
                  <div className="score-result-value" style={{ color: scoringResult.score > 0.7 ? 'var(--danger-600)' : scoringResult.score > 0.4 ? 'var(--warning-600)' : 'var(--success-600)' }}>
                    {(scoringResult.score * 100).toFixed(1)}%
                  </div>
                  <div className="score-result-label">Fraud Probability</div>
                  <div className="score-result-badge" style={{ background: scoringResult.risk === 'High' ? 'var(--danger-50)' : scoringResult.risk === 'Medium' ? 'var(--warning-50)' : 'var(--success-50)', color: scoringResult.risk === 'High' ? 'var(--danger-600)' : scoringResult.risk === 'Medium' ? 'var(--warning-600)' : 'var(--success-600)' }}>{scoringResult.risk} Risk</div>
                  <div style={{ marginTop: 12, fontSize: 11, color: 'var(--gray-500)' }}>
                    Model: {scoringResult.model} | {new Date(scoringResult.timestamp).toLocaleTimeString()}
                  </div>
                  {scoringResult.explanations && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-600)', marginBottom: 4 }}>Top Contributions:</div>
                      {scoringResult.explanations.map(e => (
                        <div key={e.feature} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '2px 0', color: 'var(--gray-600)' }}>
                          <span>{e.feature}</span>
                          <span style={{ fontWeight: 600, color: e.direction === 'risk+' ? 'var(--danger-600)' : 'var(--success-600)' }}>
                            {e.contribution > 0 ? '+' : ''}{e.contribution}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>
                  <Icon name="zap" size={32} />
                  <p style={{ marginTop: 8, fontSize: 13 }}>Submit input features to see scoring result</p>
                </div>
              )
            }

            <div className="threshold-slider-wrap">
              <label><span>Decision Threshold</span><span>{threshold.toFixed(2)}</span></label>
              <input type="range" className="threshold-slider" min="0" max="1" step="0.01" value={threshold} onChange={e => setThreshold(parseFloat(e.target.value))} />
            </div>

            <div style={{ marginTop: 16 }}>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', marginBottom: 8 }}>Score Distribution</h4>
              <div className="score-dist-bars">
                {scoreDistribution.map((h, i) => (
                  <div key={i} className="score-dist-bar" style={{
                    height: `${(h / 92) * 100}%`,
                    background: (i / scoreDistribution.length) > threshold ? 'var(--danger-400)' : 'var(--success-400)',
                  }} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--gray-400)', marginTop: 4 }}>
                <span>0.0</span><span>0.5</span><span>1.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-section">
        <div className="admin-section-header"><h2>Batch Scoring</h2></div>
        <div className="batch-upload" onDrop={handleFileDrop} onDragOver={e => e.preventDefault()} onClick={() => document.getElementById('batch-score-input')?.click()} style={{ cursor: 'pointer' }}>
          <input id="batch-score-input" type="file" accept=".csv,.json,.xlsx,.xls" onChange={handleFileUpload} style={{ display: 'none' }} />
          <Icon name="upload" size={32} />
          {uploadingFile ? <p>Uploading...</p> : <p>Drop a CSV file here or click to upload for batch scoring</p>}
          <p style={{ fontSize: 11, color: 'var(--gray-400)' }}>Supports CSV, max 100K rows</p>
        </div>
      </div>

      <div className="admin-section">
        <div className="admin-section-header"><h2>Scoring API Test</h2></div>
        <div style={{ background: 'var(--gray-900)', borderRadius: 'var(--radius-md)', padding: 16, fontFamily: "'SF Mono', monospace", fontSize: 12, color: '#a5f3fc', overflow: 'auto' }}>
          <div style={{ color: 'var(--gray-500)', marginBottom: 8 }}>// POST /api/v1/fraud/predict</div>
          <pre style={{ margin: 0 }}>{`curl -X POST /api/v1/fraud/predict \\
  -H "Authorization: Bearer sk-prod-****" \\
  -H "Content-Type: application/json" \\
  -d '{
    "transaction_amount": ${scoringFormRef.current.transactionAmount?.value || 2500},
    "account_age_days": ${scoringFormRef.current.accountAge?.value || 365},
    "tx_frequency_7d": ${scoringFormRef.current.txFrequency?.value || 12},
    "credit_score": ${scoringFormRef.current.creditScore?.value || 720},
    "merchant_risk": "${scoringFormRef.current.merchantRisk?.value || 'Medium'}"
  }'`}</pre>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB 8: AUDIT & SECURITY
  // ═══════════════════════════════════════════════════════════════════════════
  const renderAudit = () => (
    <div>
      <div className="admin-section">
        <div className="admin-section-header"><h2>Environment</h2></div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          {['production', 'staging', 'development'].map(env => (
            <div key={env} className="stat-card" style={{ textAlign: 'center', cursor: 'pointer', border: env === 'production' ? '2px solid var(--danger-500)' : undefined }}>
              <span className={`env-badge ${env}`}>{env}</span>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 6 }}>{env === 'production' ? 'Active' : env === 'staging' ? 'Synced 1h ago' : 'Local'}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-section">
        <div className="admin-section-header"><h2>Activity Log</h2>
          <RefreshBadge lastRefreshed={auditData.lastRefreshed} onRefresh={auditData.refresh} loading={auditData.loading} />
        </div>
        {auditData.loading && !auditData.data ? <LoadingSpinner /> : (
          <div className="audit-timeline">
            {(auditData.data || []).map((a, i) => (
              <div key={i} className={`audit-entry action-${a.type}`}>
                <div className="audit-entry-header">
                  <div className="audit-entry-action">{a.action}</div>
                  <div className="audit-entry-time">{a.time}</div>
                </div>
                <div className="audit-entry-detail">{a.detail}</div>
                <div className="audit-entry-user">{a.user}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-section">
        <div className="admin-section-header"><h2>Users & Roles (RBAC)</h2><button className="btn btn-sm btn-primary" onClick={() => showNotification('User management coming soon', 'info')}><Icon name="plus" size={12} /> Add User</button></div>
        {rbacData.loading && !rbacData.data ? <LoadingSpinner /> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Last Login</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {(rbacData.data || []).map(u => (
                  <tr key={u.email}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td className="mono">{u.email}</td>
                    <td><span className={`rbac-role-badge ${u.role}`}>{u.role}</span></td>
                    <td>{u.lastLogin}</td>
                    <td><span className={`status-badge ${u.status}`}>{u.status}</span></td>
                    <td><button className="btn btn-sm" onClick={() => showNotification(`Edit user ${u.name} coming soon`, 'info')}><Icon name="edit" size={12} /> Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="admin-section">
        <div className="admin-section-header"><h2>API Keys</h2><button className="btn btn-sm btn-primary" onClick={() => showNotification('API key generation coming soon', 'info')}><Icon name="plus" size={12} /> Generate Key</button></div>
        {apiKeysData.loading && !apiKeysData.data ? <LoadingSpinner /> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Key</th><th>Created</th><th>Last Used</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {(apiKeysData.data || []).map(k => (
                  <tr key={k.name}>
                    <td style={{ fontWeight: 600 }}>{k.name}</td>
                    <td><div className="api-key-display"><span className="masked">{k.prefix}{'*'.repeat(24)}</span></div></td>
                    <td>{k.created}</td>
                    <td>{k.lastUsed}</td>
                    <td><span className={`status-badge ${k.status}`}>{k.status}</span></td>
                    <td><div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-sm"><Icon name="eye" size={12} /></button>
                      {k.status === 'active' && <button className="btn btn-sm btn-danger" onClick={() => handleRevokeKey(k.name)} disabled={actionInProgress[`revoke-${k.name}`]}><Icon name="x" size={12} /> Revoke</button>}
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="admin-section">
        <div className="admin-section-header"><h2>Backup & Restore</h2></div>
        {backupsData.loading && !backupsData.data ? <LoadingSpinner /> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Backup ID</th><th>Type</th><th>Size</th><th>Created</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {(backupsData.data || []).map(b => (
                  <tr key={b.id}>
                    <td className="mono" style={{ fontWeight: 600 }}>{b.id}</td>
                    <td>{b.type}</td>
                    <td>{b.size}</td>
                    <td>{b.created}</td>
                    <td><span className={`status-badge ${b.status}`}>{b.status}</span></td>
                    <td><div style={{ display: 'flex', gap: 4 }}><button className="btn btn-sm" onClick={() => showNotification(`Downloading backup ${b.id}...`)}><Icon name="download" size={12} /> Download</button><button className="btn btn-sm" onClick={() => showNotification(`Restore from ${b.id} coming soon`, 'info')}><Icon name="refresh" size={12} /> Restore</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB 9: TEXT2SQL
  // ═══════════════════════════════════════════════════════════════════════════
  const renderText2Sql = () => (
    <div className="text2sql-layout">
      <div className="text2sql-main">
        <div className="text2sql-input-panel">
          <h3>Natural Language to SQL</h3>
          <textarea className="text2sql-textarea" value={sqlInput} onChange={e => setSqlInput(e.target.value)} placeholder="Describe what data you want to query in plain English..." />
          <div className="text2sql-actions">
            <button className="btn btn-primary" onClick={handleGenerateSql} disabled={!sqlInput.trim() || sqlGenerating}>
              <Icon name="zap" size={14} /> {sqlGenerating ? 'Generating...' : 'Generate SQL'}
            </button>
            {generatedSql && <button className="btn btn-success" onClick={handleExecuteSql} disabled={sqlExecuting}>
              <Icon name="play" size={14} /> {sqlExecuting ? 'Executing...' : 'Execute'}
            </button>}
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 6 }}>Example Prompts:</div>
            <div className="example-prompts">{api.examplePrompts.map(p => <button key={p} className="example-prompt-chip" onClick={() => handleExampleClick(p)} disabled={sqlGenerating}>{p}</button>)}</div>
          </div>
        </div>
        {sqlGenerating && <LoadingSpinner label="Generating SQL from natural language..." />}
        {generatedSql && !sqlGenerating && (
          <div className="sql-output-panel">
            <div className="sql-output-header"><span>Generated SQL</span><button className="btn btn-sm" onClick={() => { navigator.clipboard.writeText(generatedSql.sql); showNotification('SQL copied to clipboard'); }}><Icon name="download" size={12} /> Copy</button></div>
            <pre className="sql-output-code">{generatedSql.sql}</pre>
          </div>
        )}
        {sqlExecuting && <LoadingSpinner label="Executing query..." />}
        {sqlResult && !sqlExecuting && (
          <div className="sql-result-panel">
            <div className="sql-result-header"><span>Query Results ({sqlResult.rows.length} rows)</span></div>
            <div className="admin-table-wrap" style={{ border: 'none', borderRadius: 0 }}>
              <table className="admin-table">
                <thead><tr>{sqlResult.columns.map(c => <th key={c}>{c}</th>)}</tr></thead>
                <tbody>{sqlResult.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </div>
        )}
        <div className="query-history">
          <h3>Query History</h3>
          {queryHistoryData.data && queryHistoryData.data.length > 0 ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Natural Language</th><th>SQL</th><th>Executed</th><th>Rows</th><th>Time</th></tr></thead>
                <tbody>{queryHistoryData.data.map((q, i) => (
                  <tr key={i}>
                    <td style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.nl}</td>
                    <td className="mono" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.sql}</td>
                    <td>{q.executed ? <span className="status-badge completed">Yes</span> : <span className="status-badge idle">No</span>}</td>
                    <td>{q.rows}</td><td>{q.ts}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 24, color: 'var(--gray-400)', fontSize: 13 }}>No queries yet. Try one of the example prompts above.</div>
          )}
        </div>
      </div>
      <div className="schema-browser">
        <h3><Icon name="database" size={14} /> Schema Browser</h3>
        {api.schemaData.map(s => (
          <div key={s.table} className="schema-table">
            <button className="schema-table-name" onClick={() => setExpandedSchema(prev => ({ ...prev, [s.table]: !prev[s.table] }))}>
              <Icon name={expandedSchema[s.table] ? 'chevronDown' : 'chevronRight'} size={10} />{s.table}
            </button>
            {expandedSchema[s.table] && <div className="schema-columns">{s.columns.map(c => <div key={c.name} className="schema-column"><span>{c.name}</span><span className="schema-column-type">{c.type}</span></div>)}</div>}
          </div>
        ))}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="admin-page">
      {/* Notification Toast */}
      {notification && (
        <div className={`admin-toast ${notification.type}`}>
          <Icon name={notification.type === 'success' ? 'check' : notification.type === 'info' ? 'zap' : 'alert-triangle'} size={14} />
          <span>{notification.msg}</span>
        </div>
      )}

      <div className="admin-page-header">
        <h1>Admin Console</h1>
        <p>Integrations, monitoring, metrics, logs, scoring, statistics, audit & Text2SQL</p>
      </div>
      <div className="admin-tabs-nav">
        <button className="btn btn-sm" onClick={() => { const idx = tabs.findIndex(t => t.id === activeTab); if (idx > 0) setActiveTab(tabs[idx - 1].id); }} disabled={tabs.findIndex(t => t.id === activeTab) === 0}>
          <Icon name="chevronLeft" size={12} /> Prev
        </button>
        <div className="admin-tabs">
          {tabs.map(tab => (
            <button key={tab.id} className={`admin-tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              <Icon name={tab.icon} size={14} />{tab.label}
              {tab.badge !== undefined && tab.badge !== null && <span className="admin-tab-badge">{tab.badge}</span>}
            </button>
          ))}
        </div>
        <button className="btn btn-sm" onClick={() => { const idx = tabs.findIndex(t => t.id === activeTab); if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1].id); }} disabled={tabs.findIndex(t => t.id === activeTab) === tabs.length - 1}>
          Next <Icon name="chevronRight" size={12} />
        </button>
      </div>
      {activeTab === 'integrations' && renderIntegrations()}
      {activeTab === 'monitoring' && renderMonitoring()}
      {activeTab === 'jobs' && renderJobs()}
      {activeTab === 'logs' && renderLogs()}
      {activeTab === 'metrics' && renderMetrics()}
      {activeTab === 'statistics' && renderStatistics()}
      {activeTab === 'scoring' && renderScoring()}
      {activeTab === 'audit' && renderAudit()}
      {activeTab === 'text2sql' && renderText2Sql()}
    </div>
  );
};

export default Admin;
