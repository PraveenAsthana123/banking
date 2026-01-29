import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icons';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const Analytics = () => {
  const [selectedAnalysis, setSelectedAnalysis] = useState('statistical');
  const [dateRange, setDateRange] = useState('30d');

  // Monte Carlo simulation data
  const monteCarloData = Array.from({ length: 100 }, (_, i) => ({
    simulation: i + 1,
    return: (Math.random() - 0.5) * 20 + 5,
  }));

  const varData = [
    { percentile: '1%', value: -8.5, color: '#ef4444' },
    { percentile: '5%', value: -5.2, color: '#f59e0b' },
    { percentile: '10%', value: -3.1, color: '#eab308' },
    { percentile: '50%', value: 2.8, color: '#22c55e' },
    { percentile: '90%', value: 8.4, color: '#3b82f6' },
    { percentile: '95%', value: 11.2, color: '#6366f1' },
    { percentile: '99%', value: 15.7, color: '#8b5cf6' },
  ];

  // Statistical analysis data
  const distributionData = Array.from({ length: 50 }, (_, i) => {
    const x = (i - 25) / 5;
    return {
      x: x.toFixed(1),
      y: Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI) * 100,
    };
  });

  const correlationData = [
    { x: 1, y: 2.3 },
    { x: 2, y: 3.1 },
    { x: 3, y: 4.2 },
    { x: 4, y: 4.8 },
    { x: 5, y: 5.5 },
    { x: 6, y: 6.2 },
    { x: 7, y: 7.1 },
    { x: 8, y: 7.8 },
    { x: 9, y: 8.5 },
    { x: 10, y: 9.2 },
  ].map(d => ({ ...d, y: d.y + (Math.random() - 0.5) * 2 }));

  // Time series data
  const timeSeriesData = Array.from({ length: 90 }, (_, i) => {
    const base = 100 + Math.sin(i / 10) * 10 + i * 0.2;
    return {
      day: i + 1,
      actual: base + (Math.random() - 0.5) * 10,
      predicted: base,
      lower: base - 5,
      upper: base + 5,
    };
  });

  // Risk metrics
  const riskMetrics = {
    var95: 5.2,
    var99: 8.5,
    expectedShortfall: 6.8,
    maxDrawdown: 12.4,
    sharpeRatio: 1.42,
    sortinoRatio: 1.87,
  };

  // Portfolio allocation
  const allocationData = [
    { name: 'Equities', value: 35, color: '#3b82f6' },
    { name: 'Bonds', value: 25, color: '#10b981' },
    { name: 'Real Estate', value: 15, color: '#f59e0b' },
    { name: 'Commodities', value: 10, color: '#ef4444' },
    { name: 'Cash', value: 15, color: '#6b7280' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/" className="btn btn-icon btn-secondary">
              <Icon name="arrow-left" size={18} />
            </Link>
            <div>
              <h1 className="page-title">Analytics</h1>
              <p className="page-description">
                Statistical analysis, Monte Carlo simulations, and risk metrics
              </p>
            </div>
          </div>
          <div className="page-actions">
            <select
              className="form-select"
              style={{ width: 'auto', height: '40px' }}
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button className="btn btn-secondary">
              <Icon name="download" size={16} />
              Export
            </button>
            <button className="btn btn-primary">
              <Icon name="refresh" size={16} />
              Run Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Type Tabs */}
      <div className="tabs">
        <button
          className={`tab ${selectedAnalysis === 'statistical' ? 'active' : ''}`}
          onClick={() => setSelectedAnalysis('statistical')}
        >
          Statistical Analysis
        </button>
        <button
          className={`tab ${selectedAnalysis === 'montecarlo' ? 'active' : ''}`}
          onClick={() => setSelectedAnalysis('montecarlo')}
        >
          Monte Carlo
        </button>
        <button
          className={`tab ${selectedAnalysis === 'risk' ? 'active' : ''}`}
          onClick={() => setSelectedAnalysis('risk')}
        >
          Risk Metrics
        </button>
        <button
          className={`tab ${selectedAnalysis === 'timeseries' ? 'active' : ''}`}
          onClick={() => setSelectedAnalysis('timeseries')}
        >
          Time Series
        </button>
      </div>

      {selectedAnalysis === 'statistical' && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon primary">
                <Icon name="analytics" size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Mean</div>
                <div className="stat-value">4.82</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon success">
                <Icon name="target" size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Median</div>
                <div className="stat-value">4.65</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon warning">
                <Icon name="zap" size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Std Dev</div>
                <div className="stat-value">2.31</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon danger">
                <Icon name="trending-up" size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Skewness</div>
                <div className="stat-value">0.42</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid var(--primary-200)' }}>
              <div className="card-header" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', padding: '16px 24px' }}>
                <div>
                  <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>📊 Distribution Analysis</h3>
                  <p className="card-subtitle" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Normal distribution fit</p>
                </div>
              </div>
              <div className="card-body" style={{ padding: '0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr' }}>
                  <div style={{ padding: '16px', background: 'white' }}>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={distributionData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="x" stroke="#6b7280" fontSize={12} />
                          <YAxis stroke="#6b7280" fontSize={12} />
                          <Tooltip />
                          <Area type="monotone" dataKey="y" stroke="#3b82f6" fill="#93c5fd" fillOpacity={0.5} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--gray-50)', borderLeft: '1px solid var(--gray-200)' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: 'var(--gray-700)' }}>Explanation</div>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '4px' }}>📁 DATA SOURCE</div>
                      <p style={{ fontSize: '11px', color: 'var(--gray-600)', margin: 0 }}>Feature distribution from training dataset (2.4M records).</p>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '4px' }}>🤖 METHOD</div>
                      <p style={{ fontSize: '11px', color: 'var(--gray-600)', margin: 0 }}>Gaussian kernel density estimation with scipy.stats.</p>
                    </div>
                    <div style={{ background: 'white', padding: '10px', borderRadius: '6px', border: '1px solid var(--gray-200)' }}>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '6px' }}>💡 KEY INSIGHTS</div>
                      <ul style={{ fontSize: '10px', color: 'var(--gray-600)', margin: 0, paddingLeft: '14px' }}>
                        <li>Data follows normal distribution (good for linear models)</li>
                        <li>Mean centered near zero after normalization</li>
                        <li>Std dev = 1.0 indicates proper standardization</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ background: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)', border: '1px solid #e879f9' }}>
              <div className="card-header" style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)', padding: '16px 24px' }}>
                <div>
                  <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>🔗 Correlation Analysis</h3>
                  <p className="card-subtitle" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Feature correlation scatter</p>
                </div>
              </div>
              <div className="card-body" style={{ padding: '0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr' }}>
                  <div style={{ padding: '16px', background: 'white' }}>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="x" stroke="#6b7280" fontSize={12} name="Feature X" />
                          <YAxis dataKey="y" stroke="#6b7280" fontSize={12} name="Feature Y" />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                          <Scatter data={correlationData} fill="#8b5cf6" />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--gray-50)', borderLeft: '1px solid var(--gray-200)' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: 'var(--gray-700)' }}>Explanation</div>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: '#7c3aed', marginBottom: '4px' }}>📁 DATA SOURCE</div>
                      <p style={{ fontSize: '11px', color: 'var(--gray-600)', margin: 0 }}>Pairwise correlation from training dataset feature matrix.</p>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: '#7c3aed', marginBottom: '4px' }}>🤖 METHOD</div>
                      <p style={{ fontSize: '11px', color: 'var(--gray-600)', margin: 0 }}>Pearson correlation coefficient with linear regression trend line.</p>
                    </div>
                    <div style={{ background: 'white', padding: '10px', borderRadius: '6px', border: '1px solid var(--gray-200)' }}>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '6px' }}>💡 KEY INSIGHTS</div>
                      <ul style={{ fontSize: '10px', color: 'var(--gray-600)', margin: 0, paddingLeft: '14px' }}>
                        <li>Strong positive correlation (r=0.92)</li>
                        <li>Linear relationship confirmed</li>
                        <li>No outliers affecting relationship</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: '24px', background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid var(--success-200)' }}>
            <div className="card-header" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '16px 24px' }}>
              <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Hypothesis Testing Results</h3>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr' }}>
                <div style={{ background: 'white' }}>
                  <table className="table">
                    <thead>
                      <tr style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                        <th style={{ padding: '14px 12px', fontWeight: '700', color: 'var(--gray-700)', borderBottom: '2px solid var(--success-300)', fontSize: '12px', textTransform: 'uppercase' }}>Test</th>
                        <th style={{ padding: '14px 12px', fontWeight: '700', color: 'var(--gray-700)', borderBottom: '2px solid var(--success-300)', fontSize: '12px', textTransform: 'uppercase' }}>Statistic</th>
                        <th style={{ padding: '14px 12px', fontWeight: '700', color: 'var(--gray-700)', borderBottom: '2px solid var(--success-300)', fontSize: '12px', textTransform: 'uppercase' }}>P-Value</th>
                        <th style={{ padding: '14px 12px', fontWeight: '700', color: 'var(--gray-700)', borderBottom: '2px solid var(--success-300)', fontSize: '12px', textTransform: 'uppercase' }}>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ background: 'white' }}>
                        <td style={{ padding: '12px' }}>Shapiro-Wilk (Normality)</td>
                        <td style={{ padding: '12px', fontWeight: '600' }}>0.9842</td>
                        <td style={{ padding: '12px', fontWeight: '600' }}>0.0312</td>
                        <td style={{ padding: '12px' }}><span className="status-badge warning">Reject H0</span></td>
                      </tr>
                      <tr style={{ background: '#f8fafc' }}>
                        <td style={{ padding: '12px' }}>T-Test (Mean Comparison)</td>
                        <td style={{ padding: '12px', fontWeight: '600' }}>2.145</td>
                        <td style={{ padding: '12px', fontWeight: '600' }}>0.0421</td>
                        <td style={{ padding: '12px' }}><span className="status-badge success">Significant</span></td>
                      </tr>
                      <tr style={{ background: 'white' }}>
                        <td style={{ padding: '12px' }}>Chi-Square (Independence)</td>
                        <td style={{ padding: '12px', fontWeight: '600' }}>15.23</td>
                        <td style={{ padding: '12px', fontWeight: '600' }}>0.0182</td>
                        <td style={{ padding: '12px' }}><span className="status-badge success">Significant</span></td>
                      </tr>
                      <tr style={{ background: '#f8fafc' }}>
                        <td style={{ padding: '12px' }}>ANOVA (Group Means)</td>
                        <td style={{ padding: '12px', fontWeight: '600' }}>4.56</td>
                        <td style={{ padding: '12px', fontWeight: '600' }}>0.0087</td>
                        <td style={{ padding: '12px' }}><span className="status-badge success">Significant</span></td>
                      </tr>
                      <tr style={{ background: 'white' }}>
                        <td style={{ padding: '12px' }}>Levene (Variance Equality)</td>
                        <td style={{ padding: '12px', fontWeight: '600' }}>1.23</td>
                        <td style={{ padding: '12px', fontWeight: '600' }}>0.2845</td>
                        <td style={{ padding: '12px' }}><span className="status-badge neutral">Not Significant</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: '20px', background: 'var(--gray-50)', borderLeft: '1px solid var(--gray-200)' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--gray-700)' }}>Table Explanation</div>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '4px' }}>METHODOLOGY</div>
                    <p style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0 }}>Statistical tests performed at α=0.05 significance level on training data features.</p>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '4px' }}>INTERPRETATION</div>
                    <ul style={{ fontSize: '11px', color: 'var(--gray-600)', margin: 0, paddingLeft: '14px' }}>
                      <li>p &lt; 0.05 = Statistically significant</li>
                      <li>Reject H0 = Evidence against null hypothesis</li>
                    </ul>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--success-700)', marginBottom: '6px' }}>KEY INSIGHTS</div>
                    <ul style={{ fontSize: '11px', color: 'var(--gray-700)', margin: 0, paddingLeft: '14px' }}>
                      <li>4 of 5 tests show significance</li>
                      <li>Data not perfectly normal (expected)</li>
                      <li>Group differences are statistically real</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {selectedAnalysis === 'montecarlo' && (
        <>
          <div className="simulation-controls">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Simulations</label>
              <input type="number" className="form-input" defaultValue="10000" style={{ height: '40px' }} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Time Horizon</label>
              <select className="form-select" style={{ height: '40px' }}>
                <option>1 Year</option>
                <option>3 Years</option>
                <option>5 Years</option>
                <option>10 Years</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Confidence Level</label>
              <select className="form-select" style={{ height: '40px' }}>
                <option>95%</option>
                <option>99%</option>
                <option>99.9%</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button className="btn btn-primary">
                <Icon name="play" size={16} />
                Run Simulation
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '24px' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '1px solid var(--primary-200)' }}>
              <div className="card-header" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', padding: '16px 24px' }}>
                <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Simulation Results</h3>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr' }}>
                  <div style={{ padding: '16px', background: 'white' }}>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monteCarloData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="simulation" stroke="#6b7280" fontSize={12} />
                          <YAxis stroke="#6b7280" fontSize={12} />
                          <Tooltip />
                          <Area type="monotone" dataKey="return" stroke="#3b82f6" fill="#93c5fd" fillOpacity={0.5} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--gray-50)', borderLeft: '1px solid var(--gray-200)' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: 'var(--gray-700)' }}>Explanation</div>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '4px' }}>DATA SOURCE</div>
                      <p style={{ fontSize: '11px', color: 'var(--gray-600)', margin: 0 }}>10,000 random simulations using historical return distributions.</p>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', padding: '10px', borderRadius: '6px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--primary-700)', marginBottom: '4px' }}>KEY INSIGHTS</div>
                      <ul style={{ fontSize: '10px', color: 'var(--gray-700)', margin: 0, paddingLeft: '14px' }}>
                        <li>Mean return: +5.2%</li>
                        <li>Std deviation: 8.4%</li>
                        <li>95% confidence interval shown</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)', border: '1px solid #fca5a5' }}>
              <div className="card-header" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', padding: '16px 24px' }}>
                <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Value at Risk Distribution</h3>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr' }}>
                  <div style={{ padding: '16px', background: 'white' }}>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={varData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="percentile" stroke="#6b7280" fontSize={12} />
                          <YAxis stroke="#6b7280" fontSize={12} />
                          <Tooltip />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {varData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--gray-50)', borderLeft: '1px solid var(--gray-200)' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: 'var(--gray-700)' }}>Explanation</div>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: '#dc2626', marginBottom: '4px' }}>METHODOLOGY</div>
                      <p style={{ fontSize: '11px', color: 'var(--gray-600)', margin: 0 }}>VaR calculated at different confidence levels from simulation results.</p>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #fef2f2, #fecaca)', padding: '10px', borderRadius: '6px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: '#dc2626', marginBottom: '4px' }}>KEY INSIGHTS</div>
                      <ul style={{ fontSize: '10px', color: 'var(--gray-700)', margin: 0, paddingLeft: '14px' }}>
                        <li>99% VaR: -8.5% max loss</li>
                        <li>Tail risk within tolerance</li>
                        <li>Positive skew at 50%+ percentiles</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="simulation-result">
            <div className="simulation-metric">
              <div className="simulation-metric-value" style={{ color: 'var(--danger-600)' }}>
                -5.2%
              </div>
              <div className="simulation-metric-label">VaR (95%)</div>
            </div>
            <div className="simulation-metric">
              <div className="simulation-metric-value" style={{ color: 'var(--danger-600)' }}>
                -8.5%
              </div>
              <div className="simulation-metric-label">VaR (99%)</div>
            </div>
            <div className="simulation-metric">
              <div className="simulation-metric-value" style={{ color: 'var(--warning-600)' }}>
                -6.8%
              </div>
              <div className="simulation-metric-label">Expected Shortfall</div>
            </div>
            <div className="simulation-metric">
              <div className="simulation-metric-value" style={{ color: 'var(--success-600)' }}>
                +8.2%
              </div>
              <div className="simulation-metric-label">Expected Return</div>
            </div>
          </div>
        </>
      )}

      {selectedAnalysis === 'risk' && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon danger">
                <Icon name="alert-triangle" size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">VaR (95%)</div>
                <div className="stat-value">{riskMetrics.var95}%</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon warning">
                <Icon name="trending-up" size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Max Drawdown</div>
                <div className="stat-value">{riskMetrics.maxDrawdown}%</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon success">
                <Icon name="zap" size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Sharpe Ratio</div>
                <div className="stat-value">{riskMetrics.sharpeRatio}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon primary">
                <Icon name="target" size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Sortino Ratio</div>
                <div className="stat-value">{riskMetrics.sortinoRatio}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)', border: '1px solid #c4b5fd' }}>
              <div className="card-header" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', padding: '16px 24px' }}>
                <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Portfolio Allocation</h3>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr' }}>
                  <div style={{ padding: '16px', background: 'white' }}>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={allocationData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}%`}
                          >
                            {allocationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--gray-50)', borderLeft: '1px solid var(--gray-200)' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: 'var(--gray-700)' }}>Explanation</div>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: '#7c3aed', marginBottom: '4px' }}>DATA SOURCE</div>
                      <p style={{ fontSize: '11px', color: 'var(--gray-600)', margin: 0 }}>Current portfolio holdings from asset management system.</p>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)', padding: '10px', borderRadius: '6px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: '#7c3aed', marginBottom: '4px' }}>KEY INSIGHTS</div>
                      <ul style={{ fontSize: '10px', color: 'var(--gray-700)', margin: 0, paddingLeft: '14px' }}>
                        <li>Diversified across 5 asset classes</li>
                        <li>60% growth / 40% defensive split</li>
                        <li>Cash buffer for opportunities</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid var(--success-200)' }}>
              <div className="card-header" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '16px 24px' }}>
                <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Risk Metrics Summary</h3>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <table className="table">
                  <thead>
                    <tr style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                      <th style={{ padding: '14px 12px', fontWeight: '700', color: 'var(--gray-700)', borderBottom: '2px solid var(--success-300)', fontSize: '12px', textTransform: 'uppercase' }}>Metric</th>
                      <th style={{ padding: '14px 12px', fontWeight: '700', color: 'var(--gray-700)', borderBottom: '2px solid var(--success-300)', fontSize: '12px', textTransform: 'uppercase' }}>Value</th>
                      <th style={{ padding: '14px 12px', fontWeight: '700', color: 'var(--gray-700)', borderBottom: '2px solid var(--success-300)', fontSize: '12px', textTransform: 'uppercase' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: 'white' }}>
                      <td style={{ padding: '12px' }}>Value at Risk (95%)</td>
                      <td style={{ padding: '12px', fontWeight: '600' }}>{riskMetrics.var95}%</td>
                      <td style={{ padding: '12px' }}><span className="status-badge success">Within Limit</span></td>
                    </tr>
                    <tr style={{ background: '#f8fafc' }}>
                      <td style={{ padding: '12px' }}>Value at Risk (99%)</td>
                      <td style={{ padding: '12px', fontWeight: '600' }}>{riskMetrics.var99}%</td>
                      <td style={{ padding: '12px' }}><span className="status-badge success">Within Limit</span></td>
                    </tr>
                    <tr style={{ background: 'white' }}>
                      <td style={{ padding: '12px' }}>Expected Shortfall</td>
                      <td style={{ padding: '12px', fontWeight: '600' }}>{riskMetrics.expectedShortfall}%</td>
                      <td style={{ padding: '12px' }}><span className="status-badge success">Within Limit</span></td>
                    </tr>
                    <tr style={{ background: '#f8fafc' }}>
                      <td style={{ padding: '12px' }}>Maximum Drawdown</td>
                      <td style={{ padding: '12px', fontWeight: '600' }}>{riskMetrics.maxDrawdown}%</td>
                      <td style={{ padding: '12px' }}><span className="status-badge warning">Monitor</span></td>
                    </tr>
                    <tr style={{ background: 'white' }}>
                      <td style={{ padding: '12px' }}>Beta</td>
                      <td style={{ padding: '12px', fontWeight: '600' }}>1.12</td>
                      <td style={{ padding: '12px' }}><span className="status-badge neutral">Neutral</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {selectedAnalysis === 'timeseries' && (
        <>
          <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '1px solid var(--primary-200)' }}>
            <div className="card-header" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', padding: '16px 24px' }}>
              <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Time Series Forecast</h3>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr' }}>
                <div style={{ padding: '20px', background: 'white' }}>
                  <div className="chart-container large">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} domain={['auto', 'auto']} />
                        <Tooltip />
                        <Area type="monotone" dataKey="upper" stroke="transparent" fill="#93c5fd" fillOpacity={0.3} />
                        <Area type="monotone" dataKey="lower" stroke="transparent" fill="#ffffff" fillOpacity={1} />
                        <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={2} dot={false} name="Predicted" />
                        <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={1} dot={false} name="Actual" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div style={{ padding: '20px', background: 'var(--gray-50)', borderLeft: '1px solid var(--gray-200)' }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--gray-700)' }}>Chart Explanation</div>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '4px' }}>DATA SOURCE</div>
                    <p style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0 }}>90-day historical data with ARIMA/Prophet model forecasts and confidence intervals.</p>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '4px' }}>METHODOLOGY</div>
                    <p style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0 }}>Blue line = model predictions, Green line = actual values. Shaded area = 95% confidence band.</p>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--primary-700)', marginBottom: '6px' }}>KEY INSIGHTS</div>
                    <ul style={{ fontSize: '11px', color: 'var(--gray-700)', margin: 0, paddingLeft: '14px' }}>
                      <li>Model tracking actual values closely</li>
                      <li>Upward trend detected and captured</li>
                      <li>Seasonal patterns correctly identified</li>
                      <li>Narrow confidence bands = high certainty</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4">
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-label">RMSE</div>
                <div className="stat-value">3.42</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-label">MAE</div>
                <div className="stat-value">2.87</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-label">MAPE</div>
                <div className="stat-value">2.1%</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-label">R-Squared</div>
                <div className="stat-value">0.94</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
