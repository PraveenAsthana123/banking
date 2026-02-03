import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { fetchFraudTaxonomy, fetchSegmentPerformance, fetchRejectInference } from '../services/adminApi';

const TABS = [
  { key: 'taxonomy', label: 'Fraud Taxonomy & Coverage' },
  { key: 'segment', label: 'Segment Performance' },
  { key: 'reject', label: 'Reject Inference' },
];

const CoverageSegmentation = ({ datasetId }) => {
  const [activeTab, setActiveTab] = useState('taxonomy');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

  const loadTab = async (tab) => {
    if (data[tab] || loading[tab] || !datasetId) return;
    setLoading(prev => ({ ...prev, [tab]: true }));
    try {
      let result;
      switch (tab) {
        case 'taxonomy': result = await fetchFraudTaxonomy(datasetId); break;
        case 'segment': result = await fetchSegmentPerformance(datasetId); break;
        case 'reject': result = await fetchRejectInference(datasetId); break;
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

  const renderTaxonomy = () => {
    const d = data.taxonomy;
    if (!d) return null;
    return (
      <div>
        <div className="grid grid-cols-3" style={{ marginBottom: '20px' }}>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Coverage Score</div><div className="stat-value" style={{ color: d.coverage_pct > 70 ? '#10b981' : '#ef4444' }}>{d.coverage_score}</div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Coverage %</div><div className="stat-value">{d.coverage_pct?.toFixed(0)}%</div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Verdict</div><div className="stat-value"><span style={{ color: d.verdict === 'good' ? '#10b981' : d.verdict === 'gaps_exist' ? '#f59e0b' : '#ef4444' }}>{d.verdict?.replace(/_/g, ' ')}</span></div></div></div>
        </div>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Fraud Type Coverage Matrix</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(d.taxonomy || []).map((t, i) => (
            <div key={i} style={{ padding: '16px', borderRadius: '8px', border: `1px solid ${t.covered ? '#10b98130' : '#ef444430'}`, background: t.covered ? '#ecfdf508' : '#fef2f208' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>{t.covered ? '\u2705' : '\u274C'}</span>
                  <span style={{ fontWeight: '700', fontSize: '14px' }}>{t.fraud_type}</span>
                </div>
                {t.total_in_segment > 0 && (
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                    <span>Segment: <strong>{t.total_in_segment?.toLocaleString()}</strong></span>
                    <span>Fraud: <strong style={{ color: '#ef4444' }}>{t.fraud_count}</strong></span>
                    <span>Rate: <strong>{t.fraud_rate?.toFixed(2)}%</strong></span>
                  </div>
                )}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--gray-600)', marginBottom: '4px' }}>{t.description}</div>
              <div style={{ fontSize: '11px', color: t.covered ? '#059669' : '#ef4444' }}>{t.coverage_reason}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '16px', padding: '12px 16px', background: '#fef2f2', borderRadius: '8px', fontSize: '13px', color: '#991b1b', border: '1px solid #fecaca' }}>
          <strong>Key insight:</strong> One model does not equal all fraud. Each fraud type requires specific feature coverage.
        </div>
      </div>
    );
  };

  const renderSegment = () => {
    const d = data.segment;
    if (!d) return null;
    const gm = d.global_metrics || {};
    const disasterData = (d.segments || []).filter(s => s.is_disaster).map(s => ({
      name: `${s.segment_type}:${s.segment_value}`, precision: s.precision, recall: s.recall,
    }));
    return (
      <div>
        <div className="grid grid-cols-4" style={{ marginBottom: '20px' }}>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Global Precision</div><div className="stat-value">{gm.precision?.toFixed(1)}%</div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Global Recall</div><div className="stat-value">{gm.recall?.toFixed(1)}%</div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Local Disasters</div><div className="stat-value" style={{ color: d.disaster_count > 0 ? '#ef4444' : '#10b981' }}>{d.disaster_count}</div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Segments Analyzed</div><div className="stat-value">{d.segments?.length}</div></div></div>
        </div>
        {d.disaster_count > 0 && (
          <div style={{ padding: '16px', background: '#fef2f2', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fecaca' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#991b1b', marginBottom: '8px' }}>Local Disasters Detected</h4>
            <p style={{ fontSize: '13px', color: '#7f1d1d', marginBottom: '8px' }}>These segments have precision or recall below 50% of global metrics.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {(d.disasters || []).map((dis, i) => (
                <span key={i} style={{ padding: '4px 10px', background: '#fee2e2', borderRadius: '4px', fontSize: '12px', color: '#991b1b', fontWeight: '500' }}>
                  {dis.segment_type}: {dis.segment_value} (P={dis.precision?.toFixed(0)}%, R={dis.recall?.toFixed(0)}%)
                </span>
              ))}
            </div>
          </div>
        )}
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Segment Performance Decomposition</h4>
        <div style={{ overflowX: 'auto' }}>
          <table className="feature-table">
            <thead><tr><th>Type</th><th>Segment</th><th>Count</th><th>Fraud</th><th>Fraud Rate</th><th>Precision</th><th>Recall</th><th>vs Global P</th><th>vs Global R</th><th>Status</th></tr></thead>
            <tbody>{(d.segments || []).map((s, i) => (
              <tr key={i} style={{ background: s.is_disaster ? '#fef2f2' : 'transparent' }}>
                <td>{s.segment_type}</td>
                <td style={{ fontWeight: '500' }}>{s.segment_value}</td>
                <td>{s.count?.toLocaleString()}</td>
                <td>{s.fraud_count}</td>
                <td>{s.fraud_rate?.toFixed(2)}%</td>
                <td>{s.precision?.toFixed(1)}%</td>
                <td>{s.recall?.toFixed(1)}%</td>
                <td style={{ color: s.vs_global_precision < -10 ? '#ef4444' : '#10b981' }}>{s.vs_global_precision > 0 ? '+' : ''}{s.vs_global_precision?.toFixed(1)}%</td>
                <td style={{ color: s.vs_global_recall < -10 ? '#ef4444' : '#10b981' }}>{s.vs_global_recall > 0 ? '+' : ''}{s.vs_global_recall?.toFixed(1)}%</td>
                <td>{s.is_disaster ? <span style={{ color: '#ef4444', fontWeight: '700' }}>DISASTER</span> : <span style={{ color: '#10b981' }}>OK</span>}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div style={{ marginTop: '16px', padding: '12px 16px', background: '#fffbeb', borderRadius: '8px', fontSize: '13px', color: '#92400e', border: '1px solid #fde68a' }}>
          <strong>Brutal truth:</strong> Global metrics hide local disasters. One global threshold = guaranteed complaints + fraud leakage.
        </div>
      </div>
    );
  };

  const renderReject = () => {
    const d = data.reject;
    if (!d) return null;
    const biasData = (d.feature_bias || []).map(f => ({
      name: f.feature, gap: f.gap_pct,
      fill: f.gap_pct > 50 ? '#ef4444' : f.gap_pct > 20 ? '#f59e0b' : '#3b82f6',
    }));
    return (
      <div>
        <div className="grid grid-cols-4" style={{ marginBottom: '20px' }}>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Declined</div><div className="stat-value">{d.declined_count?.toLocaleString()}</div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Approved</div><div className="stat-value">{d.approved_count?.toLocaleString()}</div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Decline Precision</div><div className="stat-value">{d.actual_decline_precision?.toFixed(1)}%</div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Legit Declined</div><div className="stat-value" style={{ color: '#ef4444' }}>{d.declined_actual_legit?.toLocaleString()}</div></div></div>
        </div>
        <div style={{ padding: '16px', background: '#fef2f2', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fecaca' }}>
          <div style={{ fontWeight: '700', color: '#991b1b', marginBottom: '4px' }}>The Blind Spot Problem</div>
          <div style={{ fontSize: '13px', color: '#7f1d1d' }}>{d.blind_spot_note}</div>
        </div>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Sensitivity Scenarios</h4>
        <table className="feature-table">
          <thead><tr><th>Assumption</th><th>Est. Fraud in Declines</th><th>Est. Legit Blocked</th><th>Est. Precision</th></tr></thead>
          <tbody>{(d.sensitivity_scenarios || []).map((s, i) => (
            <tr key={i}><td>{s.assumption}</td><td>{s.estimated_fraud_in_declines?.toLocaleString()}</td><td style={{ color: '#ef4444' }}>{s.estimated_legit_blocked?.toLocaleString()}</td><td>{s.estimated_precision?.toFixed(1)}%</td></tr>
          ))}</tbody>
        </table>
        {biasData.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Feature Distribution Bias (Declined vs Approved)</h4>
            <ResponsiveContainer width="100%" height={Math.max(200, biasData.length * 35)}>
              <BarChart data={biasData} layout="vertical" margin={{ left: 120 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} label={{ value: 'Gap %', position: 'bottom', style: { fontSize: 11 } }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                <Tooltip formatter={(v) => `${v.toFixed(1)}%`} />
                <Bar dataKey="gap" radius={[0, 4, 4, 0]} name="Gap %">{biasData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', marginTop: '20px' }}>Recommendations</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {(d.recommendations || []).map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 14px', background: 'var(--primary-50)', borderRadius: '6px' }}>
              <span style={{ color: '#3b82f6', fontWeight: '700' }}>{i + 1}.</span>
              <span style={{ fontSize: '13px' }}>{r}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading[activeTab]) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-500)' }}>Loading analysis...</div>;
    if (errors[activeTab]) return <div style={{ padding: '20px', color: '#ef4444' }}>Error: {errors[activeTab]}</div>;
    switch (activeTab) {
      case 'taxonomy': return renderTaxonomy();
      case 'segment': return renderSegment();
      case 'reject': return renderReject();
      default: return null;
    }
  };

  return (
    <div className="card" style={{ marginBottom: '24px', border: '2px solid #dc262630' }}>
      <div className="card-header" style={{ background: 'linear-gradient(135deg, #fef2f2, #fee2e2)' }}>
        <h3 className="card-title" style={{ color: '#991b1b' }}>Coverage & Segmentation</h3>
        <span className="status-badge" style={{ background: '#dc2626', color: 'white', fontSize: '11px' }}>1 model != all fraud</span>
      </div>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-200)', overflowX: 'auto' }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '10px 20px', fontSize: '13px', fontWeight: activeTab === tab.key ? '600' : '400',
            color: activeTab === tab.key ? '#991b1b' : 'var(--gray-500)',
            borderBottom: activeTab === tab.key ? '2px solid #dc2626' : '2px solid transparent',
            background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
          }}>{tab.label}</button>
        ))}
      </div>
      <div className="card-body">{renderContent()}</div>
    </div>
  );
};

export default CoverageSegmentation;
