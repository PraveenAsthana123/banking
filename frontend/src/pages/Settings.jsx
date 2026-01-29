import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icons';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/" className="btn btn-icon btn-secondary">
              <Icon name="arrow-left" size={18} />
            </Link>
            <div>
              <h1 className="page-title">Settings</h1>
              <p className="page-description">
                Configure pipeline settings and preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Settings Navigation */}
        <div className="card" style={{ width: '240px', flexShrink: 0 }}>
          <div className="card-body" style={{ padding: '8px' }}>
            {[
              { id: 'general', label: 'General', icon: 'settings' },
              { id: 'pipelines', label: 'Pipelines', icon: 'pipelines' },
              { id: 'models', label: 'Models', icon: 'cpu' },
              { id: 'governance', label: 'Governance', icon: 'governance' },
              { id: 'notifications', label: 'Notifications', icon: 'bell' },
              { id: 'integrations', label: 'Integrations', icon: 'database' },
              { id: 'security', label: 'Security', icon: 'shield' },
            ].map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  borderRadius: '8px',
                  background: activeTab === item.id ? 'var(--primary-50)' : 'transparent',
                  color: activeTab === item.id ? 'var(--primary-700)' : 'var(--gray-700)',
                }}
              >
                <span className="nav-icon">
                  <Icon name={item.icon} size={18} />
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Settings Content */}
        <div style={{ flex: 1 }}>
          {activeTab === 'general' && (
            <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid var(--primary-200)' }}>
              <div className="card-header" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', padding: '16px 24px' }}>
                <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>⚙️ General Settings</h3>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Organization Name</label>
                  <input type="text" className="form-input" defaultValue="Banking ML Corp" />
                </div>
                <div className="form-group">
                  <label className="form-label">Default Timezone</label>
                  <select className="form-select">
                    <option>UTC</option>
                    <option>America/New_York</option>
                    <option>Europe/London</option>
                    <option>Asia/Tokyo</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date Format</label>
                  <select className="form-select">
                    <option>YYYY-MM-DD</option>
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Language</label>
                  <select className="form-select">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>
                <button className="btn btn-primary">Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === 'pipelines' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Pipeline Settings</h3>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Default Compute Resources</label>
                  <select className="form-select">
                    <option>Small (2 CPU, 4GB RAM)</option>
                    <option>Medium (4 CPU, 8GB RAM)</option>
                    <option>Large (8 CPU, 16GB RAM)</option>
                    <option>XLarge (16 CPU, 32GB RAM)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Max Concurrent Pipelines</label>
                  <input type="number" className="form-input" defaultValue="5" />
                </div>
                <div className="form-group">
                  <label className="form-label">Pipeline Timeout (minutes)</label>
                  <input type="number" className="form-input" defaultValue="120" />
                </div>
                <div className="form-group">
                  <label className="form-label">Auto-retry on Failure</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input type="checkbox" id="auto-retry" defaultChecked />
                    <label htmlFor="auto-retry" style={{ margin: 0 }}>Enable automatic retry</label>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Max Retry Attempts</label>
                  <input type="number" className="form-input" defaultValue="3" />
                </div>
                <button className="btn btn-primary">Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === 'models' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Model Settings</h3>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Model Registry Path</label>
                  <input type="text" className="form-input" defaultValue="/data/models" />
                </div>
                <div className="form-group">
                  <label className="form-label">Default Model Framework</label>
                  <select className="form-select">
                    <option>scikit-learn</option>
                    <option>XGBoost</option>
                    <option>LightGBM</option>
                    <option>TensorFlow</option>
                    <option>PyTorch</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Model Versioning</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input type="checkbox" id="versioning" defaultChecked />
                    <label htmlFor="versioning" style={{ margin: 0 }}>Enable automatic versioning</label>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Keep Model Versions</label>
                  <input type="number" className="form-input" defaultValue="10" />
                </div>
                <button className="btn btn-primary">Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === 'governance' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Governance Settings</h3>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Minimum Accuracy Threshold</label>
                  <input type="number" className="form-input" defaultValue="85" />
                </div>
                <div className="form-group">
                  <label className="form-label">Fairness Threshold (Disparate Impact)</label>
                  <input type="number" className="form-input" defaultValue="0.8" step="0.01" />
                </div>
                <div className="form-group">
                  <label className="form-label">Require Bias Testing</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input type="checkbox" id="bias-testing" defaultChecked />
                    <label htmlFor="bias-testing" style={{ margin: 0 }}>Require bias testing before deployment</label>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Require Explainability Report</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input type="checkbox" id="explainability" defaultChecked />
                    <label htmlFor="explainability" style={{ margin: 0 }}>Generate SHAP/LIME explanations</label>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Audit Frequency</label>
                  <select className="form-select">
                    <option>Weekly</option>
                    <option>Monthly</option>
                    <option>Quarterly</option>
                  </select>
                </div>
                <button className="btn btn-primary">Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Notification Settings</h3>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Email Notifications</label>
                  <input type="email" className="form-input" defaultValue="admin@banking-ml.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Slack Webhook URL</label>
                  <input type="text" className="form-input" placeholder="https://hooks.slack.com/services/..." />
                </div>
                <h4 style={{ marginTop: '24px', marginBottom: '16px' }}>Notify me when:</h4>
                {[
                  'Pipeline completes successfully',
                  'Pipeline fails',
                  'Model accuracy drops below threshold',
                  'Model drift detected',
                  'Governance audit required',
                  'New model version deployed',
                ].map((item) => (
                  <div key={item} className="form-group" style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input type="checkbox" id={item} defaultChecked />
                      <label htmlFor={item} style={{ margin: 0 }}>{item}</label>
                    </div>
                  </div>
                ))}
                <button className="btn btn-primary" style={{ marginTop: '12px' }}>Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Integrations</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { name: 'Database', description: 'SQLite / PostgreSQL connection', connected: true },
                    { name: 'Ollama', description: 'Local LLM for RAG pipeline', connected: true },
                    { name: 'MLflow', description: 'Model tracking and registry', connected: false },
                    { name: 'Prometheus', description: 'Metrics and monitoring', connected: false },
                    { name: 'Grafana', description: 'Dashboards and visualization', connected: false },
                  ].map((integration) => (
                    <div
                      key={integration.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        background: 'var(--gray-50)',
                        borderRadius: '8px',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 500 }}>{integration.name}</div>
                        <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
                          {integration.description}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span
                          className={`status-badge ${integration.connected ? 'success' : 'neutral'}`}
                        >
                          {integration.connected ? 'Connected' : 'Not Connected'}
                        </span>
                        <button className="btn btn-sm btn-secondary">
                          {integration.connected ? 'Configure' : 'Connect'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Security Settings</h3>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">API Key</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                      type="password"
                      className="form-input"
                      defaultValue="sk-xxxxxxxxxxxxxxxxxxxx"
                      style={{ flex: 1 }}
                    />
                    <button className="btn btn-secondary">Regenerate</button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Session Timeout (minutes)</label>
                  <input type="number" className="form-input" defaultValue="30" />
                </div>
                <div className="form-group">
                  <label className="form-label">Two-Factor Authentication</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input type="checkbox" id="2fa" />
                    <label htmlFor="2fa" style={{ margin: 0 }}>Enable 2FA for all users</label>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">IP Whitelist</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Enter IP addresses, one per line"
                    rows={4}
                  />
                </div>
                <button className="btn btn-primary">Save Changes</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
