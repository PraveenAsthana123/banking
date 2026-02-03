import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, LineChart, Line, Legend } from 'recharts';
import { fetchStabilityAnalysis, fetchLeakageAnalysis, fetchDriftAdversarial, fetchCalibrationAnalysis } from '../services/adminApi';

const TABS = [
  { key: 'stability', label: 'Stability & PSI' },
  { key: 'leakage', label: 'Feature Leakage' },
  { key: 'drift', label: 'Drift & Adversarial' },
  { key: 'calibration', label: 'Calibration' },
];

const SEVERITY_COLORS = {
  stable: '#10b981', moderate_shift: '#f59e0b', significant_shift: '#ef4444',
  clean: '#10b981', potential_leakage: '#f59e0b', leakage_detected: '#ef4444',
  well_calibrated: '#10b981', acceptable: '#f59e0b', needs_recalibration: '#ef4444',
  mostly_stable: '#f59e0b', unstable: '#ef4444', degrading: '#ef4444', moderate_drift: '#f59e0b',
};

const ModelRobustnessPanel = ({ datasetId }) => {
  const [activeTab, setActiveTab] = useState('stability');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

  const loadTab = async (tab) => {
    if (data[tab] || loading[tab] || !datasetId) return;
    setLoading(prev => ({ ...prev, [tab]: true }));
    try {
      let result;
      switch (tab) {
        case 'stability': result = await fetchStabilityAnalysis(datasetId); break;
        case 'leakage': result = await fetchLeakageAnalysis(datasetId); break;
        case 'drift': result = await fetchDriftAdversarial(datasetId); break;
        case 'calibration': result = await fetchCalibrationAnalysis(datasetId); break;
        default: return;
      }
      setData(prev => ({ ...prev, [tab]: result }));
    } catch (err) {
      setErrors(prev => ({ ...prev, [tab]: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, [tab]: false }));
    }
  };

  useEffect(() => { loadTab(activeTab); }, [activeTab, datasetId]);

  if (!datasetId) return null;

  const renderStability = () => {
    const d = data.stability;
    if (!d) return null;
    const psiData = (d.feature_psi || []).map(f => ({
      name: f.feature, psi: f.psi,
      fill: f.status === 'stable' ? '#10b981' : f.status === 'moderate_shift' ? '#f59e0b' : '#ef4444',
    }));
    return (
      <div>
        <div className="grid grid-cols-4" style={{ marginBottom: '20px' }}>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Verdict</div><div className="stat-value"><span style={{ color: SEVERITY_COLORS[d.verdict] || '#6b7280' }}>{d.verdict?.replace(/_/g, ' ')}</span></div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Score PSI</div><div className="stat-value" style={{ color: d.score_psi < 0.1 ? '#10b981' : d.score_psi < 0.25 ? '#f59e0b' : '#ef4444' }}>{d.score_psi?.toFixed(4)}</div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Unstable Features</div><div className="stat-value" style={{ color: d.unstable_features > 0 ? '#ef4444' : '#10b981' }}>{d.unstable_features}/{d.total_features}</div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Base/Recent Split</div><div className="stat-value" style={{ fontSize: '14px' }}>{d.base_rows?.toLocaleString()} / {d.recent_rows?.toLocaleString()}</div></div></div>
        </div>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>PSI Per Feature</h4>
        <div style={{ background: 'var(--gray-50)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <ResponsiveContainer width="100%" height={Math.max(250, psiData.length * 35)}>
            <BarChart data={psiData} layout="vertical" margin={{ left: 120 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 'auto']} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
              <Tooltip formatter={(v) => v.toFixed(4)} />
              <Bar dataKey="psi" radius={[0, 4, 4, 0]}>{psiData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--gray-500)', marginBottom: '20px' }}>
          <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', background: '#10b981', marginRight: '4px' }}></span>Stable (&lt;0.1)</span>
          <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', background: '#f59e0b', marginRight: '4px' }}></span>Moderate (0.1-0.25)</span>
          <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', background: '#ef4444', marginRight: '4px' }}></span>Significant (&gt;0.25)</span>
        </div>
        {d.score_stability_by_segment?.length > 0 && (
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Score Stability by Segment</h4>
            <table className="feature-table"><thead><tr><th>Segment</th><th>Value</th><th>Count</th><th>Mean Score</th><th>Std</th><th>P10</th><th>P90</th></tr></thead>
              <tbody>{d.score_stability_by_segment.map((s, i) => (
                <tr key={i}><td>{s.segment}</td><td style={{ fontWeight: '500' }}>{s.value}</td><td>{s.count.toLocaleString()}</td><td>{s.mean_score.toFixed(4)}</td><td>{s.std_score.toFixed(4)}</td><td>{s.p10.toFixed(4)}</td><td>{s.p90.toFixed(4)}</td></tr>
              ))}</tbody></table>
          </div>
        )}
      </div>
    );
  };

  const renderLeakage = () => {
    const d = data.leakage;
    if (!d) return null;
    const severityIcon = { critical: '\u2716', warning: '\u26A0', info: '\u2139' };
    const severityColor = { critical: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
    return (
      <div>
        <div className="grid grid-cols-3" style={{ marginBottom: '20px' }}>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Verdict</div><div className="stat-value"><span style={{ color: SEVERITY_COLORS[d.verdict] }}>{d.verdict?.replace(/_/g, ' ')}</span></div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Critical Issues</div><div className="stat-value" style={{ color: d.critical_count > 0 ? '#ef4444' : '#10b981' }}>{d.critical_count}</div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Warnings</div><div className="stat-value" style={{ color: d.warning_count > 0 ? '#f59e0b' : '#10b981' }}>{d.warning_count}</div></div></div>
        </div>
        {d.checks?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {d.checks.map((c, i) => (
              <div key={i} style={{ padding: '14px 16px', borderRadius: '8px', border: `1px solid ${severityColor[c.severity]}30`, background: `${severityColor[c.severity]}08` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ color: severityColor[c.severity], fontSize: '16px' }}>{severityIcon[c.severity]}</span>
                  <span className="severity-badge" style={{ background: `${severityColor[c.severity]}20`, color: severityColor[c.severity], padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>{c.severity.toUpperCase()}</span>
                  <span style={{ fontSize: '11px', color: 'var(--gray-500)', background: 'var(--gray-100)', padding: '2px 6px', borderRadius: '4px' }}>{c.type.replace(/_/g, ' ')}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: '600' }}>{c.feature}</span>
                  {c.correlation != null && <span style={{ fontSize: '11px', color: 'var(--gray-500)' }}>corr: {c.correlation.toFixed(3)}</span>}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--gray-700)', marginBottom: '4px' }}>{c.description}</div>
                <div style={{ fontSize: '12px', color: 'var(--primary-600)', fontWeight: '500' }}>Action: {c.action}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '32px', textAlign: 'center', background: '#ecfdf5', borderRadius: '8px', color: '#059669' }}>No leakage detected. All features appear clean.</div>
        )}
      </div>
    );
  };

  const renderDrift = () => {
    const d = data.drift;
    if (!d) return null;
    const perfData = (d.rolling_performance || []).map(w => ({ name: `W${w.window}`, precision: w.precision, recall: w.recall, fraud_rate: w.fraud_rate }));
    return (
      <div>
        <div className="grid grid-cols-3" style={{ marginBottom: '20px' }}>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Drift Verdict</div><div className="stat-value"><span style={{ color: SEVERITY_COLORS[d.drift_verdict] }}>{d.drift_verdict?.replace(/_/g, ' ')}</span></div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Precision Trend</div><div className="stat-value" style={{ color: d.precision_trend < -5 ? '#ef4444' : '#10b981' }}>{d.precision_trend > 0 ? '+' : ''}{d.precision_trend?.toFixed(1)}%</div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Recall Trend</div><div className="stat-value" style={{ color: d.recall_trend < -5 ? '#ef4444' : '#10b981' }}>{d.recall_trend > 0 ? '+' : ''}{d.recall_trend?.toFixed(1)}%</div></div></div>
        </div>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Rolling Window Performance</h4>
        <div style={{ background: 'var(--gray-50)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={perfData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="precision" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Precision %" />
              <Line type="monotone" dataKey="recall" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Recall %" />
              <Line type="monotone" dataKey="fraud_rate" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} name="Fraud Rate %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Adversarial Attack Scenarios</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(d.attack_scenarios || []).map((a, i) => (
            <div key={i} style={{ padding: '16px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
              <div style={{ fontWeight: '700', fontSize: '14px', color: '#991b1b', marginBottom: '4px' }}>{a.attack}</div>
              <div style={{ fontSize: '13px', color: 'var(--gray-700)', marginBottom: '6px' }}>{a.description}</div>
              <div style={{ fontSize: '12px', color: '#059669', fontWeight: '500' }}>Mitigation: {a.mitigation}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCalibration = () => {
    const d = data.calibration;
    if (!d) return null;
    const calData = (d.calibration_bins || []).map(b => ({ name: `Bin ${b.bin}`, actual: b.actual_fraud_rate, expected: b.expected_fraud_rate, error: b.calibration_error }));
    return (
      <div>
        <div className="grid grid-cols-4" style={{ marginBottom: '20px' }}>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Verdict</div><div className="stat-value"><span style={{ color: SEVERITY_COLORS[d.verdict] }}>{d.verdict?.replace(/_/g, ' ')}</span></div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Mean Cal. Error</div><div className="stat-value">{d.mean_calibration_error?.toFixed(2)}%</div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Monotonic?</div><div className="stat-value" style={{ color: d.is_monotonic ? '#10b981' : '#ef4444' }}>{d.is_monotonic ? 'Yes' : `No (${d.monotonic_violations} violations)`}</div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Monotonicity Score</div><div className="stat-value">{d.monotonicity_score?.toFixed(0)}%</div></div></div>
        </div>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Calibration Curve (Predicted vs Actual Fraud Rate)</h4>
        <div style={{ background: 'var(--gray-50)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={calData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: 'Fraud Rate %', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="actual" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Actual Fraud Rate %" />
              <Bar dataKey="expected" fill="#d1d5db" radius={[4, 4, 0, 0]} name="Expected Fraud Rate %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {d.segment_calibration?.length > 0 && (
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Score Meaning by Segment (same score = same risk?)</h4>
            <table className="feature-table"><thead><tr><th>Segment</th><th>Value</th><th>Median Score</th><th>Segment Fraud Rate</th><th>Global Fraud Rate</th><th>Gap</th><th>Same Meaning?</th></tr></thead>
              <tbody>{d.segment_calibration.map((s, i) => (
                <tr key={i}><td>{s.segment}</td><td style={{ fontWeight: '500' }}>{s.value}</td><td>{s.median_score?.toFixed(4)}</td><td>{s.segment_fraud_rate_at_median?.toFixed(2)}%</td><td>{s.global_fraud_rate_at_median?.toFixed(2)}%</td><td style={{ color: s.calibration_gap > 2 ? '#ef4444' : '#10b981' }}>{s.calibration_gap?.toFixed(2)}%</td><td>{s.same_score_same_risk ? <span style={{ color: '#10b981' }}>Yes</span> : <span style={{ color: '#ef4444' }}>No</span>}</td></tr>
              ))}</tbody></table>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (loading[activeTab]) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-500)' }}>Loading {activeTab} analysis...</div>;
    if (errors[activeTab]) return <div style={{ padding: '20px', color: '#ef4444' }}>Error: {errors[activeTab]}</div>;
    switch (activeTab) {
      case 'stability': return renderStability();
      case 'leakage': return renderLeakage();
      case 'drift': return renderDrift();
      case 'calibration': return renderCalibration();
      default: return null;
    }
  };

  return (
    <div className="card" style={{ marginBottom: '24px', border: '2px solid #7c3aed30' }}>
      <div className="card-header" style={{ background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)' }}>
        <h3 className="card-title" style={{ color: '#5b21b6' }}>Model Robustness & Stability</h3>
        <span className="status-badge" style={{ background: '#7c3aed', color: 'white', fontSize: '11px' }}>Bank-Grade</span>
      </div>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-200)' }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '10px 20px', fontSize: '13px', fontWeight: activeTab === tab.key ? '600' : '400',
            color: activeTab === tab.key ? '#5b21b6' : 'var(--gray-500)',
            borderBottom: activeTab === tab.key ? '2px solid #7c3aed' : '2px solid transparent',
            background: 'none', border: 'none', cursor: 'pointer',
          }}>{tab.label}</button>
        ))}
      </div>
      <div className="card-body">{renderContent()}</div>
    </div>
  );
};

export default ModelRobustnessPanel;
