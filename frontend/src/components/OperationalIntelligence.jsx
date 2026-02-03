import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, LineChart, Line, Legend, PieChart, Pie } from 'recharts';
import { fetchFalsePositiveAnalysis, fetchActionEffectiveness, fetchCostThresholdAnalysis, fetchHitlAnalysis } from '../services/adminApi';

const TABS = [
  { key: 'fp', label: 'False Positive Root Cause' },
  { key: 'action', label: 'Action Effectiveness' },
  { key: 'cost', label: 'Cost & Threshold' },
  { key: 'hitl', label: 'Human-in-the-Loop' },
];

const OperationalIntelligence = ({ datasetId }) => {
  const [activeTab, setActiveTab] = useState('fp');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

  const loadTab = async (tab) => {
    if (data[tab] || loading[tab] || !datasetId) return;
    setLoading(prev => ({ ...prev, [tab]: true }));
    try {
      let result;
      switch (tab) {
        case 'fp': result = await fetchFalsePositiveAnalysis(datasetId); break;
        case 'action': result = await fetchActionEffectiveness(datasetId); break;
        case 'cost': result = await fetchCostThresholdAnalysis(datasetId); break;
        case 'hitl': result = await fetchHitlAnalysis(datasetId); break;
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

  const renderFP = () => {
    const d = data.fp;
    if (!d) return null;
    const driverData = (d.feature_drivers || []).map(f => ({
      name: f.feature, zscore: Math.abs(f.fp_deviation_zscore),
      fill: f.over_weighted ? '#ef4444' : '#3b82f6',
    }));
    return (
      <div>
        <div className="grid grid-cols-4" style={{ marginBottom: '20px' }}>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Verdict</div><div className="stat-value"><span style={{ color: d.verdict === 'acceptable' ? '#10b981' : d.verdict === 'high_fp' ? '#f59e0b' : '#ef4444' }}>{d.verdict?.replace(/_/g, ' ')}</span></div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Precision</div><div className="stat-value">{d.precision?.toFixed(1)}%</div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">FP Count</div><div className="stat-value" style={{ color: '#ef4444' }}>{d.fp_count?.toLocaleString()}</div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">FP Rate</div><div className="stat-value">{d.false_positive_rate?.toFixed(2)}%</div></div></div>
        </div>
        <div className="grid grid-cols-2" style={{ marginBottom: '20px', gap: '20px' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Confusion Matrix</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxWidth: '300px' }}>
              <div style={{ padding: '16px', background: '#dcfce7', borderRadius: '8px', textAlign: 'center' }}><div style={{ fontSize: '20px', fontWeight: '700', color: '#166534' }}>{d.confusion_matrix?.tp?.toLocaleString()}</div><div style={{ fontSize: '11px', color: '#166534' }}>True Positive</div></div>
              <div style={{ padding: '16px', background: '#fee2e2', borderRadius: '8px', textAlign: 'center' }}><div style={{ fontSize: '20px', fontWeight: '700', color: '#991b1b' }}>{d.confusion_matrix?.fp?.toLocaleString()}</div><div style={{ fontSize: '11px', color: '#991b1b' }}>False Positive</div></div>
              <div style={{ padding: '16px', background: '#fef3c7', borderRadius: '8px', textAlign: 'center' }}><div style={{ fontSize: '20px', fontWeight: '700', color: '#92400e' }}>{d.confusion_matrix?.fn?.toLocaleString()}</div><div style={{ fontSize: '11px', color: '#92400e' }}>False Negative</div></div>
              <div style={{ padding: '16px', background: '#dbeafe', borderRadius: '8px', textAlign: 'center' }}><div style={{ fontSize: '20px', fontWeight: '700', color: '#1e40af' }}>{d.confusion_matrix?.tn?.toLocaleString()}</div><div style={{ fontSize: '11px', color: '#1e40af' }}>True Negative</div></div>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>FP Feature Drivers (z-score deviation)</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={driverData} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                <Tooltip formatter={(v) => v.toFixed(3)} />
                <Bar dataKey="zscore" radius={[0, 4, 4, 0]} name="|Z-Score|">{driverData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {d.amount_analysis && Object.keys(d.amount_analysis).length > 0 && (
          <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: '8px', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Amount Analysis: FP vs TP</h4>
            <div style={{ display: 'flex', gap: '24px', fontSize: '13px' }}>
              <span>FP Avg: <strong>${d.amount_analysis.fp_avg_amount?.toFixed(0)}</strong></span>
              <span>TP Avg: <strong>${d.amount_analysis.tp_avg_amount?.toFixed(0)}</strong></span>
              <span>FP Median: <strong>${d.amount_analysis.fp_median_amount?.toFixed(0)}</strong></span>
              <span>TP Median: <strong>${d.amount_analysis.tp_median_amount?.toFixed(0)}</strong></span>
            </div>
          </div>
        )}
        {d.segment_fp_rates?.length > 0 && (
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>FP Rate by Segment</h4>
            <table className="feature-table"><thead><tr><th>Segment</th><th>Value</th><th>FP Count</th><th>Total Flagged</th><th>FP Rate</th></tr></thead>
              <tbody>{d.segment_fp_rates.slice(0, 10).map((s, i) => (
                <tr key={i}><td>{s.segment}</td><td style={{ fontWeight: '500' }}>{s.value}</td><td>{s.fp_count}</td><td>{s.total_flagged}</td><td style={{ color: s.fp_rate > 80 ? '#ef4444' : '#f59e0b', fontWeight: '600' }}>{s.fp_rate.toFixed(1)}%</td></tr>
              ))}</tbody></table>
          </div>
        )}
      </div>
    );
  };

  const renderAction = () => {
    const d = data.action;
    if (!d) return null;
    return (
      <div>
        <div className="grid grid-cols-4" style={{ marginBottom: '20px' }}>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Total Transactions</div><div className="stat-value">{d.total_transactions?.toLocaleString()}</div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Total Fraud</div><div className="stat-value" style={{ color: '#ef4444' }}>{d.total_fraud?.toLocaleString()}</div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Fraud Prevented</div><div className="stat-value" style={{ color: '#10b981' }}>${d.total_fraud_prevented?.toLocaleString()}</div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">ROI Ratio</div><div className="stat-value">{d.roi_ratio?.toFixed(1)}x</div></div></div>
        </div>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Action Effectiveness by Score Band</h4>
        <table className="feature-table">
          <thead><tr><th>Score Band</th><th>Action</th><th>Count</th><th>Fraud</th><th>Legit</th><th>Fraud Rate</th><th>Fraud Prevented $</th><th>Good Spend Blocked $</th><th>Net Value $</th></tr></thead>
          <tbody>{(d.bands || []).map((b, i) => (
            <tr key={i}>
              <td style={{ fontWeight: '600' }}>{b.band}</td>
              <td><span className="severity-badge" style={{ background: b.action === 'Decline' ? '#fef2f2' : b.action.includes('Step') ? '#fffbeb' : '#ecfdf5', color: b.action === 'Decline' ? '#ef4444' : b.action.includes('Step') ? '#d97706' : '#059669', padding: '3px 8px', borderRadius: '4px', fontSize: '11px' }}>{b.action}</span></td>
              <td>{b.count?.toLocaleString()}</td>
              <td style={{ color: '#ef4444' }}>{b.fraud_count?.toLocaleString()}</td>
              <td>{b.legit_count?.toLocaleString()}</td>
              <td>{b.fraud_rate?.toFixed(1)}%</td>
              <td style={{ color: '#10b981', fontWeight: '500' }}>${b.fraud_prevented_dollar?.toLocaleString()}</td>
              <td style={{ color: '#ef4444' }}>${b.good_spend_blocked_dollar?.toLocaleString()}</td>
              <td style={{ fontWeight: '700', color: b.net_value >= 0 ? '#10b981' : '#ef4444' }}>${b.net_value?.toLocaleString()}</td>
            </tr>
          ))}</tbody>
        </table>
        <div style={{ marginTop: '16px', padding: '12px 16px', background: '#fffbeb', borderRadius: '8px', fontSize: '13px', color: '#92400e', border: '1px solid #fde68a' }}>
          <strong>Missing in most systems:</strong> {d.feedback_loop_note}
        </div>
      </div>
    );
  };

  const renderCost = () => {
    const d = data.cost;
    if (!d) return null;
    const sweepData = (d.threshold_sweep || []).map(t => ({
      name: `P${t.percentile}`, precision: t.precision, recall: t.recall, f1: t.f1,
      net_value: t.net_value_dollar, decline_rate: t.decline_rate,
    }));
    return (
      <div>
        <div className="grid grid-cols-4" style={{ marginBottom: '20px' }}>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Optimal (Net Value)</div><div className="stat-value" style={{ fontSize: '14px' }}>P{d.optimal_threshold?.by_net_value?.percentile} (${d.optimal_threshold?.by_net_value?.net_value?.toLocaleString()})</div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Optimal (F1)</div><div className="stat-value" style={{ fontSize: '14px' }}>P{d.optimal_threshold?.by_f1?.percentile} (F1={d.optimal_threshold?.by_f1?.f1?.toFixed(1)})</div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Avg Fraud Loss</div><div className="stat-value">${d.avg_fraud_loss?.toFixed(0)}</div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Elasticity</div><div className="stat-value">{d.threshold_elasticity}</div></div></div>
        </div>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Threshold Sweep: Metrics vs Percentile</h4>
        <div style={{ background: 'var(--gray-50)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sweepData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="precision" stroke="#3b82f6" strokeWidth={2} name="Precision %" />
              <Line type="monotone" dataKey="recall" stroke="#10b981" strokeWidth={2} name="Recall %" />
              <Line type="monotone" dataKey="f1" stroke="#8b5cf6" strokeWidth={2} name="F1 Score" />
              <Line type="monotone" dataKey="decline_rate" stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" name="Decline Rate %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Threshold Sweep Details</h4>
        <div style={{ overflowX: 'auto' }}>
          <table className="feature-table">
            <thead><tr><th>Pctl</th><th>Threshold</th><th>Precision</th><th>Recall</th><th>F1</th><th>Fraud Saved $</th><th>Spend Blocked $</th><th>Net Value $</th><th>ROI</th><th>Decline %</th></tr></thead>
            <tbody>{(d.threshold_sweep || []).map((t, i) => (
              <tr key={i} style={{ background: t.percentile === d.optimal_threshold?.by_net_value?.percentile ? '#ecfdf5' : 'transparent' }}>
                <td style={{ fontWeight: '600' }}>P{t.percentile}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{t.threshold?.toFixed(4)}</td>
                <td>{t.precision?.toFixed(1)}%</td><td>{t.recall?.toFixed(1)}%</td><td>{t.f1?.toFixed(1)}</td>
                <td style={{ color: '#10b981' }}>${t.fraud_saved_dollar?.toLocaleString()}</td>
                <td style={{ color: '#ef4444' }}>${t.spend_blocked_dollar?.toLocaleString()}</td>
                <td style={{ fontWeight: '700', color: t.net_value_dollar >= 0 ? '#10b981' : '#ef4444' }}>${t.net_value_dollar?.toLocaleString()}</td>
                <td>{t.roi?.toFixed(1)}x</td>
                <td>{t.decline_rate?.toFixed(1)}%</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div style={{ marginTop: '16px', padding: '12px 16px', background: '#fef2f2', borderRadius: '8px', fontSize: '13px', color: '#991b1b', border: '1px solid #fecaca' }}>
          <strong>Brutal truth:</strong> {d.brutal_truth}
        </div>
      </div>
    );
  };

  const renderHitl = () => {
    const d = data.hitl;
    if (!d) return null;
    return (
      <div>
        <div className="grid grid-cols-4" style={{ marginBottom: '20px' }}>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Verdict</div><div className="stat-value"><span style={{ color: d.verdict === 'efficient' ? '#10b981' : d.verdict === 'acceptable' ? '#f59e0b' : '#ef4444' }}>{d.verdict}</span></div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Total Alerts</div><div className="stat-value">{d.total_alerts?.toLocaleString()}</div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Alert:Fraud Ratio</div><div className="stat-value" style={{ color: d.alert_to_fraud_ratio > 15 ? '#ef4444' : '#10b981' }}>{d.alert_to_fraud_ratio?.toFixed(1)}:1</div></div></div>
          <div className="stat-card"><div className="stat-content"><div className="stat-label">Disagreement Rate</div><div className="stat-value">{d.disagreement_rate?.toFixed(1)}%</div></div></div>
        </div>
        <div className="grid grid-cols-2" style={{ marginBottom: '20px', gap: '20px' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Alert Priority Distribution</h4>
            <table className="feature-table"><thead><tr><th>Score Range</th><th>Alerts</th><th>Fraud</th><th>Precision</th><th>Priority</th></tr></thead>
              <tbody>{(d.alert_bands || []).map((b, i) => (
                <tr key={i}><td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{b.score_range}</td><td>{b.alert_count}</td><td>{b.fraud_count}</td><td>{b.precision?.toFixed(1)}%</td>
                  <td><span className="severity-badge" style={{ background: b.priority === 'critical' ? '#fef2f2' : b.priority === 'high' ? '#fffbeb' : '#f0f9ff', color: b.priority === 'critical' ? '#ef4444' : b.priority === 'high' ? '#d97706' : '#0284c7', padding: '3px 8px', borderRadius: '4px', fontSize: '11px' }}>{b.priority}</span></td></tr>
              ))}</tbody></table>
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Workload Estimate</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Daily Alerts', value: d.workload_estimate?.daily_alerts?.toFixed(0), icon: '\u{1F4E9}' },
                { label: 'Avg Review Time', value: `${d.workload_estimate?.avg_review_time_min} min`, icon: '\u{23F1}' },
                { label: 'Investigators Needed', value: d.workload_estimate?.investigators_needed?.toFixed(1), icon: '\u{1F464}' },
                { label: 'Monthly Review Hours', value: d.workload_estimate?.monthly_review_hours?.toFixed(0), icon: '\u{1F4CA}' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '13px' }}>{item.label}</span>
                  <span style={{ fontWeight: '700', fontSize: '14px' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ padding: '12px 16px', background: '#fffbeb', borderRadius: '8px', fontSize: '13px', color: '#92400e', border: '1px solid #fde68a' }}>
          <strong>Trust Warning:</strong> {d.model_trust_note}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading[activeTab]) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-500)' }}>Loading analysis...</div>;
    if (errors[activeTab]) return <div style={{ padding: '20px', color: '#ef4444' }}>Error: {errors[activeTab]}</div>;
    switch (activeTab) {
      case 'fp': return renderFP();
      case 'action': return renderAction();
      case 'cost': return renderCost();
      case 'hitl': return renderHitl();
      default: return null;
    }
  };

  return (
    <div className="card" style={{ marginBottom: '24px', border: '2px solid #f9731630' }}>
      <div className="card-header" style={{ background: 'linear-gradient(135deg, #fff7ed, #ffedd5)' }}>
        <h3 className="card-title" style={{ color: '#c2410c' }}>Operational Intelligence</h3>
        <span className="status-badge" style={{ background: '#f97316', color: 'white', fontSize: '11px' }}>Score != Outcome</span>
      </div>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-200)', overflowX: 'auto' }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '10px 20px', fontSize: '13px', fontWeight: activeTab === tab.key ? '600' : '400',
            color: activeTab === tab.key ? '#c2410c' : 'var(--gray-500)',
            borderBottom: activeTab === tab.key ? '2px solid #f97316' : '2px solid transparent',
            background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
          }}>{tab.label}</button>
        ))}
      </div>
      <div className="card-body">{renderContent()}</div>
    </div>
  );
};

export default OperationalIntelligence;
