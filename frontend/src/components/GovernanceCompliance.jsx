import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { fetchDataQualityAnalysis, fetchExplainabilityAnalysis, fetchFairnessAnalysis, fetchFailureModeAnalysis } from '../services/adminApi';

const TABS = [
  { key: 'quality', label: 'Data Quality' },
  { key: 'explain', label: 'Explainability' },
  { key: 'fairness', label: 'Fairness & Harm' },
  { key: 'failure', label: 'Failure Modes' },
];

const GovernanceCompliance = ({ datasetId }) => {
  const [activeTab, setActiveTab] = useState('quality');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

  const loadTab = async (tab) => {
    if (data[tab] || loading[tab] || !datasetId) return;
    setLoading(prev => ({ ...prev, [tab]: true }));
    try {
      let result;
      switch (tab) {
        case 'quality': result = await fetchDataQualityAnalysis(datasetId); break;
        case 'explain': result = await fetchExplainabilityAnalysis(datasetId); break;
        case 'fairness': result = await fetchFairnessAnalysis(datasetId); break;
        case 'failure': result = await fetchFailureModeAnalysis(datasetId); break;
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

  const renderQuality = () => {
    const d = data.quality;
    if (!d) return null;
    return (
      <div>
        <div className="grid grid-cols-4" style={{ marginBottom: '20px' }}>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Quality Score</div><div className="stat-value" style={{ color: d.quality_score > 80 ? '#10b981' : d.quality_score > 60 ? '#f59e0b' : '#ef4444' }}>{d.quality_score?.toFixed(0)}%</div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Good Features</div><div className="stat-value">{d.good_features}/{d.total_features}</div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Critical Issues</div><div className="stat-value" style={{ color: d.critical_features?.length > 0 ? '#ef4444' : '#10b981' }}>{d.critical_features?.length || 0}</div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Verdict</div><div className="stat-value"><span style={{ color: d.verdict === 'good' ? '#10b981' : d.verdict === 'acceptable' ? '#f59e0b' : '#ef4444' }}>{d.verdict}</span></div></div></div>
        </div>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Feature Quality Assessment</h4>
        <div style={{ overflowX: 'auto' }}>
          <table className="feature-table">
            <thead><tr><th>Feature</th><th>Type</th><th>Null %</th><th>Zero %</th><th>Unique</th><th>Quality</th></tr></thead>
            <tbody>{(d.feature_quality || []).map((f, i) => (
              <tr key={i}>
                <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{f.feature}</td>
                <td style={{ fontSize: '11px' }}>{f.dtype}</td>
                <td style={{ color: f.null_pct > 10 ? '#ef4444' : f.null_pct > 1 ? '#f59e0b' : '#10b981', fontWeight: '500' }}>{f.null_pct?.toFixed(1)}%</td>
                <td>{f.zero_pct?.toFixed(1)}%</td>
                <td>{f.unique_values?.toLocaleString()}</td>
                <td><span className="severity-badge" style={{
                  background: f.quality === 'good' ? '#ecfdf5' : f.quality === 'moderate' ? '#fffbeb' : f.quality === 'poor' ? '#fff7ed' : '#fef2f2',
                  color: f.quality === 'good' ? '#059669' : f.quality === 'moderate' ? '#d97706' : f.quality === 'poor' ? '#c2410c' : '#dc2626',
                  padding: '2px 8px', borderRadius: '4px', fontSize: '11px',
                }}>{f.quality}{f.is_constant ? ' (CONSTANT)' : ''}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        {d.dropout_impact?.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Feature Dropout Impact</h4>
            <table className="feature-table">
              <thead><tr><th>Feature</th><th>Corr w/ Target</th><th>Impact if Missing</th><th>Fallback Strategy</th></tr></thead>
              <tbody>{d.dropout_impact.map((f, i) => (
                <tr key={i}><td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{f.feature}</td>
                  <td>{f.correlation_with_target?.toFixed(3)}</td>
                  <td><span className="severity-badge" style={{
                    background: f.impact_if_missing === 'high' ? '#fef2f2' : f.impact_if_missing === 'medium' ? '#fffbeb' : '#ecfdf5',
                    color: f.impact_if_missing === 'high' ? '#dc2626' : f.impact_if_missing === 'medium' ? '#d97706' : '#059669',
                    padding: '2px 8px', borderRadius: '4px', fontSize: '11px',
                  }}>{f.impact_if_missing}</span></td>
                  <td style={{ fontSize: '12px' }}>{f.fallback_strategy}</td></tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderExplainability = () => {
    const d = data.explain;
    if (!d) return null;
    const contribData = (d.feature_contributions || []).slice(0, 10).map(f => ({
      name: f.feature, value: Math.abs(f.correlation_with_target),
      fill: f.direction === 'positive' ? '#3b82f6' : '#ef4444',
    }));
    return (
      <div>
        <div className="grid grid-cols-4" style={{ marginBottom: '20px' }}>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Verdict</div><div className="stat-value"><span style={{ color: d.verdict === 'explainable' ? '#10b981' : '#ef4444' }}>{d.verdict?.replace(/_/g, ' ')}</span></div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Reason Code Consistency</div><div className="stat-value">{d.reason_code_consistency?.toFixed(0)}%</div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Readable Features</div><div className="stat-value">{d.readable_features_pct?.toFixed(0)}%</div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Ops Ready?</div><div className="stat-value" style={{ color: d.ops_ready ? '#10b981' : '#ef4444' }}>{d.ops_ready ? 'Yes' : 'No'}</div></div></div>
        </div>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Feature Contributions (|Correlation with Target|)</h4>
        <div style={{ background: 'var(--gray-50)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <ResponsiveContainer width="100%" height={Math.max(250, contribData.length * 32)}>
            <BarChart data={contribData} layout="vertical" margin={{ left: 130 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 'auto']} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
              <Tooltip formatter={(v) => v.toFixed(4)} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>{contribData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--gray-500)', marginTop: '8px' }}>
            <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', background: '#3b82f6', marginRight: '4px' }}></span>Positive correlation</span>
            <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', background: '#ef4444', marginRight: '4px' }}></span>Negative correlation</span>
          </div>
        </div>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Reason Code Stability Across Windows</h4>
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', marginBottom: '20px' }}>
          {(d.reason_code_stability || []).map((w, i) => (
            <div key={i} style={{ minWidth: '180px', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
              <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px' }}>Window {w.window}</div>
              {(w.top_drivers || []).map((drv, j) => (
                <div key={j} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '2px 0' }}>
                  <span style={{ fontFamily: 'monospace' }}>{drv.feature}</span>
                  <span style={{ fontWeight: '600' }}>{drv.importance?.toFixed(3)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        {d.readability?.length > 0 && (
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Ops Readability (Can investigator explain in 30s?)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {d.readability.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: r.readable ? '#ecfdf5' : '#fef2f2', borderRadius: '6px' }}>
                  <span style={{ fontSize: '14px' }}>{r.readable ? '\u2705' : '\u274C'}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: '600', minWidth: '150px' }}>{r.feature}</span>
                  <span style={{ fontSize: '12px', color: 'var(--gray-600)' }}>{r.explanation_template}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFairness = () => {
    const d = data.fairness;
    if (!d) return null;
    return (
      <div>
        <div className="grid grid-cols-3" style={{ marginBottom: '20px' }}>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Verdict</div><div className="stat-value"><span style={{ color: d.verdict === 'fair' ? '#10b981' : d.verdict === 'minor_concerns' ? '#f59e0b' : '#ef4444' }}>{d.verdict?.replace(/_/g, ' ')}</span></div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Disparate Impact Violations</div><div className="stat-value" style={{ color: d.disparate_impact_violations > 0 ? '#ef4444' : '#10b981' }}>{d.disparate_impact_violations}</div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Harm Concerns</div><div className="stat-value" style={{ color: d.harm_concerns > 0 ? '#ef4444' : '#10b981' }}>{d.harm_concerns}</div></div></div>
        </div>
        {(d.fairness_by_dimension || []).map((dim, i) => (
          <div key={i} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600' }}>{dim.dimension}</h4>
              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: dim.has_disparate_impact ? '#fef2f2' : '#ecfdf5', color: dim.has_disparate_impact ? '#ef4444' : '#059669' }}>
                DI Ratio: {dim.disparate_impact_ratio?.toFixed(2)} {dim.has_disparate_impact ? '(VIOLATION <0.8)' : '(OK)'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--gray-500)' }}>Flag rate range: {dim.flag_rate_range}</span>
            </div>
            <table className="feature-table">
              <thead><tr><th>Group</th><th>Count</th><th>Flag Rate</th><th>Fraud Rate</th><th>Precision</th></tr></thead>
              <tbody>{Object.entries(dim.groups || {}).map(([group, stats], j) => (
                <tr key={j}><td style={{ fontWeight: '500' }}>{group}</td><td>{stats.count?.toLocaleString()}</td><td>{stats.flag_rate?.toFixed(2)}%</td><td>{stats.fraud_rate?.toFixed(2)}%</td><td>{stats.precision?.toFixed(1)}%</td></tr>
              ))}</tbody>
            </table>
          </div>
        ))}
        {d.harm_checks?.length > 0 && (
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Specific Harm Checks</h4>
            {d.harm_checks.map((h, i) => (
              <div key={i} style={{ padding: '14px 16px', borderRadius: '8px', marginBottom: '8px', border: `1px solid ${h.concern ? '#fecaca' : '#d1fae5'}`, background: h.concern ? '#fef2f208' : '#ecfdf508' }}>
                <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{h.check}</div>
                <div style={{ fontSize: '12px', color: 'var(--gray-600)', marginBottom: '6px' }}>{h.description}</div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                  {Object.entries(h).filter(([k]) => !['check', 'description', 'concern'].includes(k)).map(([k, v], j) => (
                    <span key={j}>{k.replace(/_/g, ' ')}: <strong>{typeof v === 'number' ? v.toFixed(2) : String(v)}</strong></span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop: '16px', padding: '12px 16px', background: '#f0f9ff', borderRadius: '8px', fontSize: '13px', color: '#0c4a6e', border: '1px solid #bae6fd' }}>
          <strong>Key principle:</strong> {d.key_principle}
        </div>
      </div>
    );
  };

  const renderFailure = () => {
    const d = data.failure;
    if (!d) return null;
    return (
      <div>
        <div className="grid grid-cols-3" style={{ marginBottom: '20px' }}>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Resilience</div><div className="stat-value"><span style={{ color: d.resilience_verdict === 'robust' ? '#10b981' : d.resilience_verdict === 'moderate' ? '#f59e0b' : '#ef4444' }}>{d.resilience_verdict}</span></div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Single Points of Failure</div><div className="stat-value" style={{ color: d.single_points_of_failure > 0 ? '#ef4444' : '#10b981' }}>{d.single_points_of_failure}</div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Scenarios Tested</div><div className="stat-value">{(d.feature_dropout_scenarios?.length || 0) + (d.fraud_spike_scenarios?.length || 0) + (d.latency_scenarios?.length || 0) + 1}</div></div></div>
        </div>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Feature Dropout Scenarios</h4>
        <table className="feature-table">
          <thead><tr><th>Feature</th><th>Corr w/ Score</th><th>Corr w/ Target</th><th>Criticality</th><th>Fallback</th></tr></thead>
          <tbody>{(d.feature_dropout_scenarios || []).map((f, i) => (
            <tr key={i}><td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{f.feature}</td>
              <td>{f.correlation_with_score?.toFixed(3)}</td><td>{f.correlation_with_target?.toFixed(3)}</td>
              <td><span className="severity-badge" style={{
                background: f.criticality === 'critical' ? '#fef2f2' : f.criticality === 'important' ? '#fffbeb' : '#ecfdf5',
                color: f.criticality === 'critical' ? '#dc2626' : f.criticality === 'important' ? '#d97706' : '#059669',
                padding: '2px 8px', borderRadius: '4px', fontSize: '11px',
              }}>{f.criticality}</span></td>
              <td style={{ fontSize: '12px' }}>{f.fallback}</td></tr>
          ))}</tbody>
        </table>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', marginTop: '20px' }}>Fraud Spike Scenarios</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(d.fraud_spike_scenarios || []).map((s, i) => (
            <div key={i} style={{ padding: '14px 16px', borderRadius: '8px', border: `1px solid ${s.threshold_still_valid ? '#d1fae5' : '#fecaca'}`, background: s.threshold_still_valid ? '#ecfdf508' : '#fef2f208' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: '700', fontSize: '14px' }}>{s.scenario}</span>
                <span className="severity-badge" style={{ background: s.threshold_still_valid ? '#ecfdf5' : '#fef2f2', color: s.threshold_still_valid ? '#059669' : '#dc2626', padding: '3px 10px', borderRadius: '4px', fontSize: '11px' }}>
                  {s.threshold_still_valid ? 'Threshold Valid' : 'Threshold Breaks'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '20px', fontSize: '12px' }}>
                <span>Current: {s.current_fraud_rate?.toFixed(2)}%</span>
                <span>Simulated: {s.simulated_fraud_rate?.toFixed(2)}%</span>
                <span>Catch Rate: {s.current_catch_rate?.toFixed(1)}%</span>
                <span style={{ color: '#ef4444' }}>Est. Missed: {s.estimated_missed_fraud?.toLocaleString()}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px', fontWeight: '500' }}>{s.action_needed}</div>
            </div>
          ))}
        </div>
        {d.latency_scenarios?.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Latency Failure Scenarios</h4>
            {d.latency_scenarios.map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'var(--gray-50)', borderRadius: '6px', marginBottom: '6px' }}>
                <span className="severity-badge" style={{ background: l.risk_level === 'high' ? '#fef2f2' : '#fffbeb', color: l.risk_level === 'high' ? '#dc2626' : '#d97706', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>{l.risk_level}</span>
                <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: '500' }}>{l.feature}</span>
                <span style={{ fontSize: '12px', color: 'var(--gray-600)' }}>{l.scenario}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop: '20px', padding: '14px 16px', background: '#1f2937', borderRadius: '8px', color: '#f9fafb' }}>
          <div style={{ fontWeight: '700', marginBottom: '4px' }}>Model Staleness Risk</div>
          <div style={{ fontSize: '13px', marginBottom: '6px' }}>{d.staleness_scenario?.scenario}: {d.staleness_scenario?.risk}</div>
          <div style={{ fontSize: '12px', color: '#10b981' }}>Mitigation: {d.staleness_scenario?.mitigation}</div>
        </div>
        <div style={{ marginTop: '16px', padding: '12px 16px', background: '#fef2f2', borderRadius: '8px', fontSize: '13px', color: '#991b1b', fontWeight: '600', border: '1px solid #fecaca' }}>
          {d.critical_question}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading[activeTab]) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-500)' }}>Loading analysis...</div>;
    if (errors[activeTab]) return <div style={{ padding: '20px', color: '#ef4444' }}>Error: {errors[activeTab]}</div>;
    switch (activeTab) {
      case 'quality': return renderQuality();
      case 'explain': return renderExplainability();
      case 'fairness': return renderFairness();
      case 'failure': return renderFailure();
      default: return null;
    }
  };

  return (
    <div className="card" style={{ marginBottom: '24px', border: '2px solid #0891b230' }}>
      <div className="card-header" style={{ background: 'linear-gradient(135deg, #ecfeff, #cffafe)' }}>
        <h3 className="card-title" style={{ color: '#155e75' }}>Governance & Compliance</h3>
        <span className="status-badge" style={{ background: '#0891b2', color: 'white', fontSize: '11px' }}>Non-Negotiable</span>
      </div>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-200)', overflowX: 'auto' }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '10px 20px', fontSize: '13px', fontWeight: activeTab === tab.key ? '600' : '400',
            color: activeTab === tab.key ? '#155e75' : 'var(--gray-500)',
            borderBottom: activeTab === tab.key ? '2px solid #0891b2' : '2px solid transparent',
            background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
          }}>{tab.label}</button>
        ))}
      </div>
      <div className="card-body">{renderContent()}</div>
    </div>
  );
};

export default GovernanceCompliance;
