import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { fetchClassDistribution } from '../services/adminApi';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const SEVERITY_CONFIG = {
  balanced: { color: '#10b981', bg: '#ecfdf5', label: 'Balanced', width: '15%' },
  moderate: { color: '#f59e0b', bg: '#fffbeb', label: 'Moderate', width: '40%' },
  significant: { color: '#f97316', bg: '#fff7ed', label: 'Significant', width: '65%' },
  severe: { color: '#ef4444', bg: '#fef2f2', label: 'Severe', width: '90%' },
};

const DataImbalanceAnalysis = ({ datasetId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [targetColumn, setTargetColumn] = useState('');

  const loadData = async (col) => {
    if (!datasetId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchClassDistribution(datasetId, col || undefined);
      setData(result);
      if (result.target_column && !col) {
        setTargetColumn(result.target_column);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(targetColumn);
  }, [datasetId]);

  const handleTargetChange = (e) => {
    const col = e.target.value;
    setTargetColumn(col);
    loadData(col);
  };

  if (!datasetId) {
    return (
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header"><h3 className="card-title">Data Imbalance Analysis</h3></div>
        <div className="card-body"><p style={{ color: 'var(--gray-500)' }}>No dataset selected. Upload a dataset in the Admin panel first.</p></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header"><h3 className="card-title">Data Imbalance Analysis</h3></div>
        <div className="card-body" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '14px', color: 'var(--gray-500)' }}>Loading class distribution...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header"><h3 className="card-title">Data Imbalance Analysis</h3></div>
        <div className="card-body"><p style={{ color: 'var(--danger-500)' }}>Error: {error}</p></div>
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header"><h3 className="card-title">Data Imbalance Analysis</h3></div>
        <div className="card-body"><p style={{ color: 'var(--gray-500)' }}>{data?.error || 'No data available'}</p></div>
      </div>
    );
  }

  const severityConfig = SEVERITY_CONFIG[data.severity] || SEVERITY_CONFIG.balanced;
  const pieData = data.classes.map((c, i) => ({ name: `Class ${c.label}`, value: c.count, percentage: c.percentage }));
  const barData = data.classes.map((c, i) => ({ name: `Class ${c.label}`, count: c.count, fill: COLORS[i % COLORS.length] }));

  return (
    <div style={{ marginBottom: '24px' }}>
      <div className="card" style={{ marginBottom: '24px', border: '2px solid var(--primary-200)' }}>
        <div className="card-header" style={{ background: 'var(--primary-50)' }}>
          <h3 className="card-title" style={{ color: 'var(--primary-700)' }}>Data Imbalance Analysis</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--gray-600)' }}>Target Column:</label>
            <select
              value={targetColumn}
              onChange={handleTargetChange}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '13px', background: 'white' }}
            >
              {(data.candidate_columns || []).map(col => (
                <option key={col.name} value={col.name}>{col.name} ({col.unique_values} classes)</option>
              ))}
            </select>
          </div>
        </div>
        <div className="card-body">
          {/* Stats Cards */}
          <div className="grid grid-cols-4" style={{ marginBottom: '24px' }}>
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-label">Total Samples</div>
                <div className="stat-value">{data.total_samples?.toLocaleString()}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-label">Num Classes</div>
                <div className="stat-value">{data.num_classes}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-label">Imbalance Ratio</div>
                <div className="stat-value" style={{ color: severityConfig.color }}>{data.imbalance_ratio}:1</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-label">Severity</div>
                <div className="stat-value">
                  <span className="severity-badge" style={{ background: severityConfig.bg, color: severityConfig.color, padding: '4px 12px', borderRadius: '12px', fontSize: '14px', fontWeight: '600' }}>
                    {severityConfig.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-2" style={{ marginBottom: '24px' }}>
            {/* Donut Chart */}
            <div style={{ background: 'var(--gray-50)', borderRadius: '12px', padding: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--gray-700)' }}>Class Distribution</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" label={({ name, percentage }) => `${name} (${percentage}%)`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => v.toLocaleString()} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div style={{ background: 'var(--gray-50)', borderRadius: '12px', padding: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--gray-700)' }}>Class Counts</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => v.toLocaleString()} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Imbalance Gauge */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--gray-700)' }}>Imbalance Severity Gauge</h4>
            <div className="imbalance-gauge">
              <div className="imbalance-gauge-track">
                <div className="imbalance-gauge-zone" style={{ width: '20%', background: '#10b981' }}></div>
                <div className="imbalance-gauge-zone" style={{ width: '20%', background: '#f59e0b' }}></div>
                <div className="imbalance-gauge-zone" style={{ width: '25%', background: '#f97316' }}></div>
                <div className="imbalance-gauge-zone" style={{ width: '35%', background: '#ef4444' }}></div>
              </div>
              <div className="imbalance-gauge-marker" style={{ left: severityConfig.width }}>
                <div className="imbalance-gauge-pointer"></div>
                <div className="imbalance-gauge-label">{data.imbalance_ratio}:1</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: 'var(--gray-500)' }}>
                <span>Balanced (&lt;2x)</span>
                <span>Moderate (2-5x)</span>
                <span>Significant (5-10x)</span>
                <span>Severe (&gt;10x)</span>
              </div>
            </div>
          </div>

          {/* Class Details Table */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--gray-700)' }}>Class Details</h4>
            <table className="feature-table">
              <thead>
                <tr>
                  <th>Class Label</th>
                  <th>Count</th>
                  <th>Percentage</th>
                  <th>Distribution</th>
                </tr>
              </thead>
              <tbody>
                {data.classes.map((c, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: '600' }}>Class {c.label}</td>
                    <td>{c.count.toLocaleString()}</td>
                    <td>{c.percentage}%</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '8px', background: 'var(--gray-200)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${c.percentage}%`, height: '100%', background: COLORS[i % COLORS.length], borderRadius: '4px' }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recommendations */}
          {data.recommendations && data.recommendations.length > 0 && (
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--gray-700)' }}>Recommendations</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data.recommendations.map((rec, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 16px', background: 'var(--primary-50)', borderRadius: '8px', border: '1px solid var(--primary-100)' }}>
                    <span style={{ color: 'var(--primary-500)', fontWeight: '700', fontSize: '16px', lineHeight: '1' }}>&#x2713;</span>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--gray-800)' }}>{rec.method}</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-600)', marginTop: '2px' }}>{rec.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataImbalanceAnalysis;
