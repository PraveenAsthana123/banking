import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { fetchFeatureEngineering } from '../services/adminApi';

const FeatureEngineering = ({ datasetId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!datasetId) return;
    setLoading(true);
    setError(null);
    fetchFeatureEngineering(datasetId)
      .then(result => setData(result))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [datasetId]);

  if (!datasetId) {
    return (
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header"><h3 className="card-title">Advanced Feature Engineering</h3></div>
        <div className="card-body"><p style={{ color: 'var(--gray-500)' }}>No dataset selected.</p></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header"><h3 className="card-title">Advanced Feature Engineering</h3></div>
        <div className="card-body" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '14px', color: 'var(--gray-500)' }}>Generating engineered features...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header"><h3 className="card-title">Advanced Feature Engineering</h3></div>
        <div className="card-body"><p style={{ color: 'var(--danger-500)' }}>Error: {error}</p></div>
      </div>
    );
  }

  if (!data || !data.feature_details || data.feature_details.length === 0) {
    return (
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header"><h3 className="card-title">Advanced Feature Engineering</h3></div>
        <div className="card-body"><p style={{ color: 'var(--gray-500)' }}>{data?.message || 'No features could be generated from this dataset.'}</p></div>
      </div>
    );
  }

  const correlationData = (data.correlations || []).map(c => ({
    feature: c.feature,
    correlation: c.correlation,
    fill: c.correlation >= 0 ? '#3b82f6' : '#ef4444',
  }));

  const CATEGORY_COLORS = {
    Ratio: '#8b5cf6',
    Transform: '#3b82f6',
    Binary: '#10b981',
    Interaction: '#f59e0b',
    Binning: '#ec4899',
    Derived: '#06b6d4',
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <div className="card" style={{ marginBottom: '24px', border: '2px solid var(--success-200)' }}>
        <div className="card-header" style={{ background: 'var(--success-50)' }}>
          <h3 className="card-title" style={{ color: 'var(--success-700)' }}>Advanced Feature Engineering</h3>
          <span className="status-badge success">{data.generated_features?.length || 0} features generated</span>
        </div>
        <div className="card-body">
          {/* Feature List Table */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--gray-700)' }}>Generated Features</h4>
            <table className="feature-table">
              <thead>
                <tr>
                  <th>Feature Name</th>
                  <th>Category</th>
                  <th>Formula</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {data.feature_details.map((f, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: '600' }}>{f.name}</td>
                    <td>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: `${CATEGORY_COLORS[f.category] || '#6b7280'}20`,
                        color: CATEGORY_COLORS[f.category] || '#6b7280',
                      }}>
                        {f.category}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--gray-600)' }}>{f.formula}</td>
                    <td style={{ fontSize: '12px', color: 'var(--gray-600)' }}>{f.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Feature Statistics */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--gray-700)' }}>Feature Statistics</h4>
            <table className="feature-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Type</th>
                  <th>Mean</th>
                  <th>Std</th>
                  <th>Min</th>
                  <th>Max</th>
                  <th>Median</th>
                </tr>
              </thead>
              <tbody>
                {data.statistics.filter(s => s.type === 'numeric').map((s, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{s.name}</td>
                    <td><span className="status-badge secondary" style={{ fontSize: '10px' }}>{s.type}</span></td>
                    <td>{s.mean?.toFixed(4)}</td>
                    <td>{s.std?.toFixed(4)}</td>
                    <td>{s.min?.toFixed(4)}</td>
                    <td>{s.max?.toFixed(4)}</td>
                    <td>{s.median?.toFixed(4)}</td>
                  </tr>
                ))}
                {data.statistics.filter(s => s.type === 'categorical').map((s, i) => (
                  <tr key={`cat-${i}`}>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{s.name}</td>
                    <td><span className="status-badge warning" style={{ fontSize: '10px' }}>categorical</span></td>
                    <td colSpan={5} style={{ fontSize: '12px' }}>
                      {Object.entries(s.value_counts || {}).map(([k, v]) => `${k}: ${v}`).join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Correlation with Target */}
          {correlationData.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--gray-700)' }}>
                Correlation with Target ({data.target_column})
              </h4>
              <div style={{ background: 'var(--gray-50)', borderRadius: '12px', padding: '20px' }}>
                <ResponsiveContainer width="100%" height={Math.max(250, correlationData.length * 40)}>
                  <BarChart data={correlationData} layout="vertical" margin={{ left: 140, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[-0.5, 0.5]} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="feature" tick={{ fontSize: 11 }} width={130} />
                    <Tooltip formatter={(v) => v.toFixed(4)} />
                    <Bar dataKey="correlation" radius={[0, 4, 4, 0]}>
                      {correlationData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Feature Importance Ranking */}
          {correlationData.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--gray-700)' }}>Feature Importance Ranking (by |correlation|)</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {data.correlations.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ width: '24px', textAlign: 'right', fontSize: '12px', color: 'var(--gray-500)', fontWeight: '600' }}>#{i + 1}</span>
                    <span style={{ width: '180px', fontFamily: 'monospace', fontSize: '12px', fontWeight: '500' }}>{c.feature}</span>
                    <div style={{ flex: 1, height: '8px', background: 'var(--gray-200)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div className="correlation-bar" style={{
                        width: `${Math.min(c.abs_correlation * 200, 100)}%`,
                        height: '100%',
                        background: c.correlation >= 0 ? '#3b82f6' : '#ef4444',
                        borderRadius: '4px',
                        transition: 'width 0.5s ease',
                      }}></div>
                    </div>
                    <span style={{ width: '70px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: c.correlation >= 0 ? '#3b82f6' : '#ef4444' }}>
                      {c.correlation?.toFixed(4)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sample Data Preview */}
          {data.sample_data && data.sample_data.length > 0 && (
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--gray-700)' }}>
                Sample Data Preview (first {data.sample_data.length} rows)
              </h4>
              <div style={{ overflowX: 'auto' }}>
                <table className="feature-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      {data.generated_features.map(f => <th key={f} style={{ fontFamily: 'monospace', fontSize: '11px' }}>{f}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {data.sample_data.map((row, i) => (
                      <tr key={i}>
                        <td style={{ color: 'var(--gray-400)', fontSize: '11px' }}>{i + 1}</td>
                        {data.generated_features.map(f => (
                          <td key={f} style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                            {typeof row[f] === 'number' ? row[f].toFixed(4) : row[f]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeatureEngineering;
