import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Treemap
} from 'recharts';
import { departments } from '../data/departments';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

// Sample data for visualizations
const asIsData = {
  processTime: [
    { stage: 'Data Collection', manual: 120, current: 120 },
    { stage: 'Validation', manual: 45, current: 45 },
    { stage: 'Analysis', manual: 180, current: 180 },
    { stage: 'Decision', manual: 60, current: 60 },
    { stage: 'Documentation', manual: 30, current: 30 }
  ],
  accuracy: { value: 72, target: 90 },
  throughput: { value: 500, unit: 'per day' },
  errorRate: 8.5,
  manualSteps: 12,
  ftesRequired: 45
};

const toBeData = {
  processTime: [
    { stage: 'Data Collection', automated: 5, target: 5 },
    { stage: 'Validation', automated: 2, target: 2 },
    { stage: 'Analysis', automated: 3, target: 3 },
    { stage: 'Decision', automated: 0.05, target: 0.05 },
    { stage: 'Documentation', automated: 1, target: 1 }
  ],
  accuracy: { value: 94.2, target: 95 },
  throughput: { value: 125000, unit: 'per day' },
  errorRate: 0.5,
  manualSteps: 2,
  ftesRequired: 12
};

const edaData = {
  distribution: [
    { range: '0-20', count: 1250, percentage: 5 },
    { range: '21-40', count: 4500, percentage: 18 },
    { range: '41-60', count: 8750, percentage: 35 },
    { range: '61-80', count: 7500, percentage: 30 },
    { range: '81-100', count: 3000, percentage: 12 }
  ],
  correlation: [
    { feature: 'Credit Score', correlation: 0.85 },
    { feature: 'Income', correlation: 0.72 },
    { feature: 'DTI Ratio', correlation: -0.68 },
    { feature: 'Employment Years', correlation: 0.55 },
    { feature: 'Age', correlation: 0.42 },
    { feature: 'Loan Amount', correlation: -0.38 }
  ],
  missingValues: [
    { field: 'Income', missing: 2.3 },
    { field: 'Employment', missing: 5.1 },
    { field: 'Credit Score', missing: 0.8 },
    { field: 'Address', missing: 1.2 },
    { field: 'Phone', missing: 3.5 }
  ],
  outliers: [
    { field: 'Income', outliers: 156, percentage: 0.6 },
    { field: 'Loan Amount', outliers: 89, percentage: 0.4 },
    { field: 'Age', outliers: 23, percentage: 0.1 }
  ],
  dataQuality: {
    completeness: 97.2,
    accuracy: 98.5,
    consistency: 96.8,
    timeliness: 99.1
  }
};

const pipelinePhases = [
  {
    id: 1,
    name: 'Data Ingestion',
    status: 'completed',
    duration: '2.3s',
    records: 125000,
    details: {
      sources: ['Core Banking', 'Credit Bureau', 'Transaction DB'],
      format: 'Parquet',
      size: '2.4 GB'
    }
  },
  {
    id: 2,
    name: 'Data Validation',
    status: 'completed',
    duration: '1.8s',
    records: 124850,
    details: {
      schemaValidation: 'Passed',
      nullCheck: '150 records filtered',
      duplicateCheck: '0 duplicates'
    }
  },
  {
    id: 3,
    name: 'Feature Engineering',
    status: 'completed',
    duration: '4.5s',
    records: 124850,
    details: {
      featuresCreated: 45,
      transformations: ['Scaling', 'Encoding', 'Binning'],
      featureStore: 'Updated'
    }
  },
  {
    id: 4,
    name: 'Model Inference',
    status: 'completed',
    duration: '8.2s',
    records: 124850,
    details: {
      model: 'XGBoost v2.3.1',
      batchSize: 1000,
      avgLatency: '0.065ms'
    }
  },
  {
    id: 5,
    name: 'Post-Processing',
    status: 'completed',
    duration: '1.2s',
    records: 124850,
    details: {
      businessRules: 'Applied',
      thresholds: 'Validated',
      explanations: 'Generated'
    }
  }
];

const accuracyData = {
  metrics: {
    accuracy: 94.2,
    precision: 93.8,
    recall: 94.5,
    f1Score: 94.1,
    rocAuc: 96.7,
    prAuc: 95.2
  },
  confusionMatrix: {
    truePositive: 9156,
    trueNegative: 8245,
    falsePositive: 312,
    falseNegative: 287
  },
  trend: [
    { month: 'Jul', accuracy: 92.1, baseline: 90 },
    { month: 'Aug', accuracy: 92.8, baseline: 90 },
    { month: 'Sep', accuracy: 93.2, baseline: 90 },
    { month: 'Oct', accuracy: 93.8, baseline: 90 },
    { month: 'Nov', accuracy: 94.0, baseline: 90 },
    { month: 'Dec', accuracy: 94.2, baseline: 90 }
  ],
  bySegment: [
    { segment: 'Low Risk', accuracy: 96.5, volume: 68 },
    { segment: 'Medium Risk', accuracy: 92.3, volume: 24 },
    { segment: 'High Risk', accuracy: 89.8, volume: 8 }
  ]
};

const benchmarkData = {
  internal: [
    { metric: 'Accuracy', current: 94.2, previous: 91.5, target: 95, industry: 88 },
    { metric: 'Latency (ms)', current: 45, previous: 120, target: 50, industry: 150 },
    { metric: 'Throughput', current: 125000, previous: 45000, target: 100000, industry: 50000 },
    { metric: 'False Positive %', current: 2.1, previous: 5.5, target: 2, industry: 6 }
  ],
  models: [
    { model: 'XGBoost (Current)', accuracy: 94.2, latency: 45, auc: 96.7 },
    { model: 'Random Forest', accuracy: 92.1, latency: 68, auc: 94.5 },
    { model: 'Logistic Regression', accuracy: 88.5, latency: 12, auc: 91.2 },
    { model: 'Neural Network', accuracy: 93.8, latency: 85, auc: 96.2 }
  ],
  versionsComparison: [
    { version: 'v2.3.1', accuracy: 94.2, date: '2025-01-15' },
    { version: 'v2.3.0', accuracy: 93.8, date: '2024-12-01' },
    { version: 'v2.2.0', accuracy: 92.5, date: '2024-10-15' },
    { version: 'v2.1.0', accuracy: 91.5, date: '2024-08-01' },
    { version: 'v2.0.0', accuracy: 89.2, date: '2024-05-01' }
  ]
};

function DataAnalysis() {
  const { useCaseId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPhase, setSelectedPhase] = useState(null);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'as-is-to-be', label: 'As-Is / To-Be' },
    { id: 'eda', label: 'EDA Analysis' },
    { id: 'pipeline', label: 'Pipeline' },
    { id: 'accuracy', label: 'Accuracy' },
    { id: 'benchmark', label: 'Benchmarking' },
    { id: 'impact', label: 'Impact' }
  ];

  return (
    <div className="data-analysis-page">
      <div className="page-header">
        <div>
          {useCaseId ? (
            <Link to={`/data-analysis`} className="back-link">
              ← Back to Data Analysis Overview
            </Link>
          ) : (
            <Link to="/" className="back-link">
              ← Back to Dashboard
            </Link>
          )}
          <h1>Data Analysis {useCaseId ? `- ${useCaseId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}` : ''}</h1>
          <p>Comprehensive data visualization and analysis</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary">Export Report</button>
          <button className="btn btn-primary">Refresh Data</button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="analysis-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="analysis-content">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'as-is-to-be' && <AsIsToBeTab />}
        {activeTab === 'eda' && <EDATab />}
        {activeTab === 'pipeline' && <PipelineTab phases={pipelinePhases} />}
        {activeTab === 'accuracy' && <AccuracyTab />}
        {activeTab === 'benchmark' && <BenchmarkTab />}
        {activeTab === 'impact' && <ImpactTab />}
      </div>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="overview-tab">
      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon blue">📊</div>
          <div className="metric-content">
            <span className="metric-value">124,850</span>
            <span className="metric-label">Total Records</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon green">✓</div>
          <div className="metric-content">
            <span className="metric-value">94.2%</span>
            <span className="metric-label">Model Accuracy</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon purple">⚡</div>
          <div className="metric-content">
            <span className="metric-value">45ms</span>
            <span className="metric-label">Avg Latency</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon orange">📈</div>
          <div className="metric-content">
            <span className="metric-value">542%</span>
            <span className="metric-label">ROI</span>
          </div>
        </div>
      </div>

      {/* Data Quality Summary */}
      <div className="charts-row">
        <div className="card" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '1px solid var(--primary-200)' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', padding: '16px 24px' }}>
            <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Data Quality Scores</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr' }}>
              <div style={{ padding: '16px', background: 'white' }}>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={[
                    { subject: 'Completeness', A: 97.2, fullMark: 100 },
                    { subject: 'Accuracy', A: 98.5, fullMark: 100 },
                    { subject: 'Consistency', A: 96.8, fullMark: 100 },
                    { subject: 'Timeliness', A: 99.1, fullMark: 100 },
                    { subject: 'Validity', A: 95.5, fullMark: 100 }
                  ]}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Quality" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ padding: '16px', background: 'var(--gray-50)', borderLeft: '1px solid var(--gray-200)' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: 'var(--gray-700)' }}>Chart Explanation</div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '4px' }}>DATA SOURCE</div>
                  <p style={{ fontSize: '11px', color: 'var(--gray-600)', margin: 0 }}>Automated data quality metrics from 124,850 records in the pipeline.</p>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '4px' }}>METRICS</div>
                  <p style={{ fontSize: '11px', color: 'var(--gray-600)', margin: 0 }}>5-dimensional quality assessment covering completeness, accuracy, consistency, timeliness, and validity.</p>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', padding: '10px', borderRadius: '8px', border: '1px solid var(--primary-200)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--primary-700)', marginBottom: '4px' }}>KEY INSIGHTS</div>
                  <ul style={{ fontSize: '10px', color: 'var(--gray-700)', margin: 0, paddingLeft: '14px' }}>
                    <li>All metrics above 95% threshold</li>
                    <li>Timeliness highest at 99.1%</li>
                    <li>Data ready for model training</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid var(--success-200)' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '16px 24px' }}>
            <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Processing Pipeline Status</h3>
          </div>
          <div className="card-body">
            <div className="pipeline-mini">
              {pipelinePhases.map((phase, idx) => (
                <div key={phase.id} className="pipeline-mini-step">
                  <div className={`step-indicator ${phase.status}`}>
                    {phase.status === 'completed' ? '✓' : idx + 1}
                  </div>
                  <span className="step-name">{phase.name}</span>
                  <span className="step-duration">{phase.duration}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AsIsToBeTab() {
  const comparisonData = [
    { metric: 'Processing Time', asIs: 435, toBe: 11.05, unit: 'minutes', improvement: '97.5%' },
    { metric: 'Accuracy', asIs: 72, toBe: 94.2, unit: '%', improvement: '+30.8%' },
    { metric: 'Daily Throughput', asIs: 500, toBe: 125000, unit: 'records', improvement: '250x' },
    { metric: 'Error Rate', asIs: 8.5, toBe: 0.5, unit: '%', improvement: '-94.1%' },
    { metric: 'Manual Steps', asIs: 12, toBe: 2, unit: 'steps', improvement: '-83.3%' },
    { metric: 'FTEs Required', asIs: 45, toBe: 12, unit: 'people', improvement: '-73.3%' }
  ];

  return (
    <div className="as-is-to-be-tab">
      {/* Comparison Header */}
      <div className="comparison-header">
        <div className="comparison-column as-is">
          <h2>🔴 AS-IS (Before AI)</h2>
          <p>Manual Process</p>
        </div>
        <div className="comparison-column transformation">
          <h2>⚡ Transformation</h2>
          <p>AI-Powered</p>
        </div>
        <div className="comparison-column to-be">
          <h2>🟢 TO-BE (After AI)</h2>
          <p>Automated Process</p>
        </div>
      </div>

      {/* Process Time Comparison */}
      <div className="charts-row">
        <div className="card" style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)', border: '1px solid #fca5a5' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', padding: '16px 24px' }}>
            <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Process Time Comparison (Minutes)</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr' }}>
              <div style={{ padding: '16px', background: 'white' }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { stage: 'Data Collection', asIs: 120, toBe: 5 },
                    { stage: 'Validation', asIs: 45, toBe: 2 },
                    { stage: 'Analysis', asIs: 180, toBe: 3 },
                    { stage: 'Decision', asIs: 60, toBe: 0.05 },
                    { stage: 'Documentation', asIs: 30, toBe: 1 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="asIs" name="As-Is (Manual)" fill="#ef4444" />
                    <Bar dataKey="toBe" name="To-Be (AI)" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ padding: '16px', background: 'var(--gray-50)', borderLeft: '1px solid var(--gray-200)' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: 'var(--gray-700)' }}>Chart Explanation</div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#dc2626', marginBottom: '4px' }}>DATA SOURCE</div>
                  <p style={{ fontSize: '11px', color: 'var(--gray-600)', margin: 0 }}>Process mining data from manual workflows vs. AI-automated pipelines.</p>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#dc2626', marginBottom: '4px' }}>METHODOLOGY</div>
                  <p style={{ fontSize: '11px', color: 'var(--gray-600)', margin: 0 }}>Side-by-side comparison of time spent at each processing stage.</p>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #fef2f2, #fecaca)', padding: '10px', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#dc2626', marginBottom: '4px' }}>KEY INSIGHTS</div>
                  <ul style={{ fontSize: '10px', color: 'var(--gray-700)', margin: 0, paddingLeft: '14px' }}>
                    <li>97.5% total time reduction</li>
                    <li>Decision time: 60 min → 3 sec</li>
                    <li>Analysis phase shows biggest gain</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid var(--success-200)' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '16px 24px' }}>
            <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Key Metrics Comparison</h3>
          </div>
          <div className="metrics-comparison-table">
            <table>
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>As-Is</th>
                  <th>To-Be</th>
                  <th>Improvement</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.metric}</td>
                    <td className="as-is-value">{row.asIs} {row.unit}</td>
                    <td className="to-be-value">{row.toBe} {row.unit}</td>
                    <td className="improvement-value">{row.improvement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Visual Process Flow */}
      <div className="process-flow-comparison">
        <div className="flow-section as-is">
          <h3>As-Is Process Flow</h3>
          <div className="flow-diagram">
            <div className="flow-step manual">
              <span className="step-num">1</span>
              <span className="step-text">Receive Application</span>
              <span className="step-time">Manual Entry</span>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step manual">
              <span className="step-num">2</span>
              <span className="step-text">Gather Documents</span>
              <span className="step-time">2-4 hours</span>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step manual">
              <span className="step-num">3</span>
              <span className="step-text">Credit Check</span>
              <span className="step-time">30 min</span>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step manual">
              <span className="step-num">4</span>
              <span className="step-text">Manual Analysis</span>
              <span className="step-time">2-3 hours</span>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step manual">
              <span className="step-num">5</span>
              <span className="step-text">Committee Review</span>
              <span className="step-time">1-2 days</span>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step manual">
              <span className="step-num">6</span>
              <span className="step-text">Decision</span>
              <span className="step-time">Total: 2-3 days</span>
            </div>
          </div>
        </div>
        <div className="flow-section to-be">
          <h3>To-Be Process Flow</h3>
          <div className="flow-diagram">
            <div className="flow-step automated">
              <span className="step-num">1</span>
              <span className="step-text">Digital Application</span>
              <span className="step-time">Auto-capture</span>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step automated">
              <span className="step-num">2</span>
              <span className="step-text">Auto Validation</span>
              <span className="step-time">2 sec</span>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step automated">
              <span className="step-num">3</span>
              <span className="step-text">AI Analysis</span>
              <span className="step-time">3 sec</span>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step automated">
              <span className="step-num">4</span>
              <span className="step-text">Instant Decision</span>
              <span className="step-time">Total: &lt;10 sec</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EDATab() {
  return (
    <div className="eda-tab">
      {/* Data Overview */}
      <div className="eda-summary">
        <div className="summary-card">
          <h4>Dataset Size</h4>
          <span className="summary-value">124,850</span>
          <span className="summary-label">records</span>
        </div>
        <div className="summary-card">
          <h4>Features</h4>
          <span className="summary-value">45</span>
          <span className="summary-label">columns</span>
        </div>
        <div className="summary-card">
          <h4>Target Variable</h4>
          <span className="summary-value">Binary</span>
          <span className="summary-label">Risk (0/1)</span>
        </div>
        <div className="summary-card">
          <h4>Class Balance</h4>
          <span className="summary-value">68/32</span>
          <span className="summary-label">Low/High Risk</span>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="charts-row">
        <div className="card" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid var(--success-200)' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '16px 20px' }}>
            <h3 className="card-title" style={{ color: 'white', fontSize: '15px', fontWeight: '700' }}>Target Variable Distribution</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr' }}>
              <div style={{ padding: '12px', background: 'white' }}>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Low Risk', value: 68, color: '#10b981' },
                        { name: 'High Risk', value: 32, color: '#ef4444' }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ padding: '12px', background: 'var(--gray-50)', borderLeft: '1px solid var(--gray-200)' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '10px', color: 'var(--gray-700)' }}>Explanation</div>
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '3px' }}>DATA SOURCE</div>
                  <p style={{ fontSize: '10px', color: 'var(--gray-600)', margin: 0 }}>124,850 labeled records from historical data.</p>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', padding: '8px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--success-700)', marginBottom: '3px' }}>KEY INSIGHTS</div>
                  <ul style={{ fontSize: '9px', color: 'var(--gray-700)', margin: 0, paddingLeft: '12px' }}>
                    <li>68/32 class imbalance ratio</li>
                    <li>Stratified sampling applied</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '1px solid var(--primary-200)' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', padding: '16px 20px' }}>
            <h3 className="card-title" style={{ color: 'white', fontSize: '15px', fontWeight: '700' }}>Risk Score Distribution</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr' }}>
              <div style={{ padding: '12px', background: 'white' }}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={edaData.distribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ padding: '12px', background: 'var(--gray-50)', borderLeft: '1px solid var(--gray-200)' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '10px', color: 'var(--gray-700)' }}>Explanation</div>
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '3px' }}>METHODOLOGY</div>
                  <p style={{ fontSize: '10px', color: 'var(--gray-600)', margin: 0 }}>Histogram of model risk scores (0-100).</p>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', padding: '8px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--primary-700)', marginBottom: '3px' }}>KEY INSIGHTS</div>
                  <ul style={{ fontSize: '9px', color: 'var(--gray-700)', margin: 0, paddingLeft: '12px' }}>
                    <li>Normal distribution centered at 50</li>
                    <li>35% in medium risk band</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Analysis */}
      <div className="charts-row">
        <div className="card" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)', border: '1px solid #c4b5fd' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', padding: '16px 20px' }}>
            <h3 className="card-title" style={{ color: 'white', fontSize: '15px', fontWeight: '700' }}>Feature Correlation with Target</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr' }}>
              <div style={{ padding: '12px', background: 'white' }}>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={edaData.correlation} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[-1, 1]} />
                    <YAxis type="category" dataKey="feature" width={100} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="correlation" fill={(entry) => entry.correlation >= 0 ? '#10b981' : '#ef4444'}>
                      {edaData.correlation.map((entry, index) => (
                        <Cell key={index} fill={entry.correlation >= 0 ? '#10b981' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ padding: '12px', background: 'var(--gray-50)', borderLeft: '1px solid var(--gray-200)' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '10px', color: 'var(--gray-700)' }}>Explanation</div>
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '10px', fontWeight: '600', color: '#7c3aed', marginBottom: '3px' }}>METHODOLOGY</div>
                  <p style={{ fontSize: '10px', color: 'var(--gray-600)', margin: 0 }}>Pearson correlation coefficients between features and target variable.</p>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)', padding: '8px', borderRadius: '6px', border: '1px solid #c4b5fd' }}>
                  <div style={{ fontSize: '10px', fontWeight: '600', color: '#7c3aed', marginBottom: '3px' }}>KEY INSIGHTS</div>
                  <ul style={{ fontSize: '9px', color: 'var(--gray-700)', margin: 0, paddingLeft: '12px' }}>
                    <li>Credit Score: strongest positive (0.85)</li>
                    <li>DTI Ratio: strongest negative (-0.68)</li>
                    <li>No multicollinearity issues detected</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: '1px solid #fcd34d' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', padding: '16px 20px' }}>
            <h3 className="card-title" style={{ color: 'white', fontSize: '15px', fontWeight: '700' }}>Missing Values Analysis</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr' }}>
              <div style={{ padding: '12px', background: 'white' }}>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={edaData.missingValues}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="field" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Bar dataKey="missing" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ padding: '12px', background: 'var(--gray-50)', borderLeft: '1px solid var(--gray-200)' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '10px', color: 'var(--gray-700)' }}>Explanation</div>
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '10px', fontWeight: '600', color: '#d97706', marginBottom: '3px' }}>METHODOLOGY</div>
                  <p style={{ fontSize: '10px', color: 'var(--gray-600)', margin: 0 }}>Percentage of null/missing values per feature column.</p>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', padding: '8px', borderRadius: '6px', border: '1px solid #fcd34d' }}>
                  <div style={{ fontSize: '10px', fontWeight: '600', color: '#b45309', marginBottom: '3px' }}>KEY INSIGHTS</div>
                  <ul style={{ fontSize: '9px', color: 'var(--gray-700)', margin: 0, paddingLeft: '12px' }}>
                    <li>Employment: highest at 5.1%</li>
                    <li>All fields below 10% threshold</li>
                    <li>Imputation strategy: median fill</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Quality */}
      <div className="charts-row">
        <div className="chart-card">
          <h3>Data Quality Metrics</h3>
          <div className="quality-metrics">
            {Object.entries(edaData.dataQuality).map(([key, value]) => (
              <div key={key} className="quality-metric">
                <span className="quality-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                <div className="quality-bar-container">
                  <div className="quality-bar" style={{ width: `${value}%` }}></div>
                </div>
                <span className="quality-value">{value}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="chart-card">
          <h3>Outlier Detection</h3>
          <div className="outlier-table">
            <table>
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Outliers</th>
                  <th>Percentage</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {edaData.outliers.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.field}</td>
                    <td>{row.outliers}</td>
                    <td>{row.percentage}%</td>
                    <td><span className="action-badge">Capped</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Feature Statistics */}
      <div className="feature-stats-section">
        <h3>Feature Statistics</h3>
        <div className="stats-table">
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Type</th>
                <th>Min</th>
                <th>Max</th>
                <th>Mean</th>
                <th>Std</th>
                <th>Missing</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Credit Score</td>
                <td>Numeric</td>
                <td>300</td>
                <td>850</td>
                <td>695.4</td>
                <td>85.2</td>
                <td>0.8%</td>
              </tr>
              <tr>
                <td>Annual Income</td>
                <td>Numeric</td>
                <td>$15,000</td>
                <td>$500,000</td>
                <td>$78,500</td>
                <td>$45,200</td>
                <td>2.3%</td>
              </tr>
              <tr>
                <td>DTI Ratio</td>
                <td>Numeric</td>
                <td>0.05</td>
                <td>0.85</td>
                <td>0.35</td>
                <td>0.15</td>
                <td>0.5%</td>
              </tr>
              <tr>
                <td>Employment Years</td>
                <td>Numeric</td>
                <td>0</td>
                <td>45</td>
                <td>8.5</td>
                <td>6.2</td>
                <td>5.1%</td>
              </tr>
              <tr>
                <td>Loan Purpose</td>
                <td>Categorical</td>
                <td colSpan={4}>Home(45%), Auto(25%), Personal(20%), Business(10%)</td>
                <td>0.2%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PipelineTab({ phases }) {
  const [selectedPhase, setSelectedPhase] = useState(phases[0]);

  return (
    <div className="pipeline-tab">
      {/* Pipeline Visualization */}
      <div className="pipeline-visual">
        <h3>Data Pipeline Execution</h3>
        <div className="pipeline-flow">
          {phases.map((phase, idx) => (
            <div key={phase.id} className="pipeline-phase-wrapper">
              <div
                className={`pipeline-phase ${phase.status} ${selectedPhase?.id === phase.id ? 'selected' : ''}`}
                onClick={() => setSelectedPhase(phase)}
              >
                <div className="phase-header">
                  <span className="phase-number">{phase.id}</span>
                  <span className="phase-status-icon">
                    {phase.status === 'completed' ? '✓' : phase.status === 'running' ? '⟳' : '○'}
                  </span>
                </div>
                <div className="phase-name">{phase.name}</div>
                <div className="phase-metrics">
                  <span>{phase.duration}</span>
                  <span>{phase.records.toLocaleString()} records</span>
                </div>
              </div>
              {idx < phases.length - 1 && <div className="pipeline-connector">→</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Phase Details */}
      {selectedPhase && (
        <div className="phase-details-section">
          <div className="charts-row">
            <div className="chart-card">
              <h3>Phase Details: {selectedPhase.name}</h3>
              <div className="phase-detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className={`detail-value status-${selectedPhase.status}`}>
                    {selectedPhase.status.toUpperCase()}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Duration</span>
                  <span className="detail-value">{selectedPhase.duration}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Records Processed</span>
                  <span className="detail-value">{selectedPhase.records.toLocaleString()}</span>
                </div>
                {Object.entries(selectedPhase.details).map(([key, value]) => (
                  <div key={key} className="detail-item">
                    <span className="detail-label">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="detail-value">
                      {Array.isArray(value) ? value.join(', ') : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="chart-card">
              <h3>Pipeline Performance</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={phases}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="records" fill="#3b82f6" name="Records" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Logs */}
      <div className="pipeline-logs">
        <h3>Execution Logs</h3>
        <div className="logs-container">
          <div className="log-entry success">
            <span className="log-time">14:32:15.123</span>
            <span className="log-level">INFO</span>
            <span className="log-message">Pipeline started - Job ID: PL-20250128-001</span>
          </div>
          <div className="log-entry success">
            <span className="log-time">14:32:17.456</span>
            <span className="log-level">INFO</span>
            <span className="log-message">Data Ingestion completed - 125,000 records loaded</span>
          </div>
          <div className="log-entry warning">
            <span className="log-time">14:32:19.234</span>
            <span className="log-level">WARN</span>
            <span className="log-message">150 records with null values filtered</span>
          </div>
          <div className="log-entry success">
            <span className="log-time">14:32:19.289</span>
            <span className="log-level">INFO</span>
            <span className="log-message">Data Validation completed - 124,850 records valid</span>
          </div>
          <div className="log-entry success">
            <span className="log-time">14:32:23.789</span>
            <span className="log-level">INFO</span>
            <span className="log-message">Feature Engineering completed - 45 features generated</span>
          </div>
          <div className="log-entry success">
            <span className="log-time">14:32:31.956</span>
            <span className="log-level">INFO</span>
            <span className="log-message">Model Inference completed - Avg latency: 0.065ms</span>
          </div>
          <div className="log-entry success">
            <span className="log-time">14:32:33.156</span>
            <span className="log-level">INFO</span>
            <span className="log-message">Pipeline completed successfully - Total time: 18.0s</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccuracyTab() {
  return (
    <div className="accuracy-tab">
      {/* Metrics Overview */}
      <div className="accuracy-metrics-grid">
        <div className="accuracy-metric-card">
          <div className="metric-ring" style={{ '--percentage': accuracyData.metrics.accuracy }}>
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="8"
                strokeDasharray={`${accuracyData.metrics.accuracy * 2.83} 283`}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <span className="metric-ring-value">{accuracyData.metrics.accuracy}%</span>
          </div>
          <span className="metric-ring-label">Accuracy</span>
        </div>
        <div className="accuracy-metric-card">
          <div className="metric-ring" style={{ '--percentage': accuracyData.metrics.precision }}>
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="45" fill="none" stroke="#3b82f6" strokeWidth="8"
                strokeDasharray={`${accuracyData.metrics.precision * 2.83} 283`}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <span className="metric-ring-value">{accuracyData.metrics.precision}%</span>
          </div>
          <span className="metric-ring-label">Precision</span>
        </div>
        <div className="accuracy-metric-card">
          <div className="metric-ring" style={{ '--percentage': accuracyData.metrics.recall }}>
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="45" fill="none" stroke="#8b5cf6" strokeWidth="8"
                strokeDasharray={`${accuracyData.metrics.recall * 2.83} 283`}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <span className="metric-ring-value">{accuracyData.metrics.recall}%</span>
          </div>
          <span className="metric-ring-label">Recall</span>
        </div>
        <div className="accuracy-metric-card">
          <div className="metric-ring" style={{ '--percentage': accuracyData.metrics.rocAuc }}>
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="45" fill="none" stroke="#f59e0b" strokeWidth="8"
                strokeDasharray={`${accuracyData.metrics.rocAuc * 2.83} 283`}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <span className="metric-ring-value">{accuracyData.metrics.rocAuc}%</span>
          </div>
          <span className="metric-ring-label">ROC-AUC</span>
        </div>
      </div>

      {/* Row 1: Confusion Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)', border: '1px solid var(--primary-200)' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', padding: '16px 24px' }}>
            <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Confusion Matrix</h3>
          </div>
          <div className="card-body" style={{ padding: '20px', background: 'white' }}>
            <div className="confusion-matrix">
              <div className="matrix-header">
                <div className="matrix-corner"></div>
                <div className="matrix-label">Predicted Negative</div>
                <div className="matrix-label">Predicted Positive</div>
              </div>
              <div className="matrix-row">
                <div className="matrix-label">Actual Negative</div>
                <div className="matrix-cell tn">
                  <span className="cell-value">{accuracyData.confusionMatrix.trueNegative.toLocaleString()}</span>
                  <span className="cell-label">TN</span>
                </div>
                <div className="matrix-cell fp">
                  <span className="cell-value">{accuracyData.confusionMatrix.falsePositive.toLocaleString()}</span>
                  <span className="cell-label">FP</span>
                </div>
              </div>
              <div className="matrix-row">
                <div className="matrix-label">Actual Positive</div>
                <div className="matrix-cell fn">
                  <span className="cell-value">{accuracyData.confusionMatrix.falseNegative.toLocaleString()}</span>
                  <span className="cell-label">FN</span>
                </div>
                <div className="matrix-cell tp">
                  <span className="cell-value">{accuracyData.confusionMatrix.truePositive.toLocaleString()}</span>
                  <span className="cell-label">TP</span>
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
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '6px' }}>DATA SOURCE</div>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Model predictions vs actual outcomes on holdout test set (18K samples).</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '6px' }}>METHODOLOGY</div>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Classification results: True/False Positives and Negatives.</p>
            </div>
            <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>KEY INSIGHTS</div>
              <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                <li>High TP (9,156) + TN (8,245) = accuracy</li>
                <li>Low FP (312) = few false alarms</li>
                <li>Low FN (287) = few missed cases</li>
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
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={accuracyData.trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[85, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Legend />
                <Line type="monotone" dataKey="accuracy" name="Accuracy" stroke="#10b981" strokeWidth={2} dot />
                <Line type="monotone" dataKey="baseline" name="Baseline" stroke="#ef4444" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card" style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
          <div className="card-header" style={{ background: 'var(--gray-100)', padding: '16px 24px', borderBottom: '1px solid var(--gray-200)' }}>
            <h3 className="card-title" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-700)' }}>Explanation</h3>
          </div>
          <div className="card-body" style={{ padding: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '6px' }}>DATA SOURCE</div>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Monthly model accuracy from production monitoring dashboard.</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '6px' }}>METHODOLOGY</div>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Accuracy vs 90% baseline threshold over 6 months.</p>
            </div>
            <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>KEY INSIGHTS</div>
              <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                <li>Consistent improvement: 92.1% to 94.2%</li>
                <li>Always above 90% baseline</li>
                <li>No degradation detected</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Accuracy by Segment */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)', border: '1px solid #c4b5fd' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', padding: '16px 24px' }}>
            <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Accuracy by Risk Segment</h3>
          </div>
          <div className="card-body" style={{ padding: '20px', background: 'white' }}>
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={accuracyData.bySegment}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="segment" />
                <YAxis yAxisId="left" tickFormatter={(v) => `${v}%`} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="right" dataKey="volume" name="Volume %" fill="#e5e7eb" />
                <Line yAxisId="left" type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#8b5cf6" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card" style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
          <div className="card-header" style={{ background: 'var(--gray-100)', padding: '16px 24px', borderBottom: '1px solid var(--gray-200)' }}>
            <h3 className="card-title" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-700)' }}>Explanation</h3>
          </div>
          <div className="card-body" style={{ padding: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#7c3aed', marginBottom: '6px' }}>DATA SOURCE</div>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Model accuracy stratified by customer risk classification.</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#7c3aed', marginBottom: '6px' }}>METHODOLOGY</div>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Accuracy and volume distribution across Low/Medium/High risk segments.</p>
            </div>
            <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>KEY INSIGHTS</div>
              <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                <li>Low Risk: highest accuracy (96.5%)</li>
                <li>High Risk: lower accuracy (89.8%)</li>
                <li>68% volume in low risk segment</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BenchmarkTab() {
  return (
    <div className="benchmark-tab">
      {/* Row 1: Internal Benchmark Table */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)', border: '1px solid var(--primary-200)' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', padding: '16px 24px' }}>
            <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Internal Benchmarking</h3>
          </div>
          <div className="card-body" style={{ padding: '0', background: 'white' }}>
            <div className="benchmark-table">
              <table>
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Current</th>
                    <th>Previous</th>
                    <th>Target</th>
                    <th>Industry Avg</th>
                    <th>vs Target</th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarkData.internal.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.metric}</td>
                      <td className="current-value">{row.current}</td>
                      <td>{row.previous}</td>
                      <td>{row.target}</td>
                      <td>{row.industry}</td>
                      <td>
                        <span className={`benchmark-badge ${row.current >= row.target ? 'met' : 'not-met'}`}>
                          {row.current >= row.target ? '✓ Met' : '○ Below'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Internal performance metrics compared against targets and industry benchmarks.</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '6px' }}>METHODOLOGY</div>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Comparison across current, previous, target, and industry average values.</p>
            </div>
            <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>KEY INSIGHTS</div>
              <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                <li>Meeting all target benchmarks</li>
                <li>Exceeding industry averages</li>
                <li>Consistent improvement trend</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Model Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid var(--success-200)' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '16px 24px' }}>
            <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Model Comparison</h3>
          </div>
          <div className="card-body" style={{ padding: '20px', background: 'white' }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={benchmarkData.models}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="model" angle={-45} textAnchor="end" height={100} />
                <YAxis tickFormatter={(v) => `${v}%`} />
                <Tooltip />
                <Legend />
                <Bar dataKey="accuracy" name="Accuracy" fill="#3b82f6" />
                <Bar dataKey="auc" name="AUC" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card" style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
          <div className="card-header" style={{ background: 'var(--gray-100)', padding: '16px 24px', borderBottom: '1px solid var(--gray-200)' }}>
            <h3 className="card-title" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-700)' }}>Explanation</h3>
          </div>
          <div className="card-body" style={{ padding: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '6px' }}>DATA SOURCE</div>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Performance comparison across different model algorithms.</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '6px' }}>METRICS</div>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Accuracy and AUC scores for each model type.</p>
            </div>
            <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>KEY INSIGHTS</div>
              <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                <li>XGBoost shows best overall performance</li>
                <li>All models above 90% accuracy threshold</li>
                <li>AUC consistently high across models</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Version History */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)', border: '1px solid #c4b5fd' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', padding: '16px 24px' }}>
            <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Version History</h3>
          </div>
          <div className="card-body" style={{ padding: '20px', background: 'white' }}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={benchmarkData.versionsComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="version" />
                <YAxis domain={[85, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip />
                <Line type="monotone" dataKey="accuracy" stroke="#8b5cf6" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card" style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
          <div className="card-header" style={{ background: 'var(--gray-100)', padding: '16px 24px', borderBottom: '1px solid var(--gray-200)' }}>
            <h3 className="card-title" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-700)' }}>Explanation</h3>
          </div>
          <div className="card-body" style={{ padding: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#7c3aed', marginBottom: '6px' }}>DATA SOURCE</div>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Historical model versions from MLflow tracking registry.</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#7c3aed', marginBottom: '6px' }}>METHODOLOGY</div>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Accuracy progression across model versions over time.</p>
            </div>
            <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>KEY INSIGHTS</div>
              <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                <li>Consistent improvement per version</li>
                <li>v2.3 shows 4% gain over v1.0</li>
                <li>No regression in recent releases</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Radar Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: '1px solid #fcd34d' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', padding: '16px 24px' }}>
            <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Multi-Dimensional Comparison</h3>
          </div>
          <div className="card-body" style={{ padding: '20px', background: 'white' }}>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={[
                { metric: 'Accuracy', current: 94.2, target: 95, industry: 88 },
                { metric: 'Precision', current: 93.8, target: 90, industry: 85 },
                { metric: 'Recall', current: 94.5, target: 90, industry: 82 },
                { metric: 'F1 Score', current: 94.1, target: 90, industry: 83 },
                { metric: 'AUC', current: 96.7, target: 95, industry: 88 },
                { metric: 'Speed', current: 95, target: 90, industry: 75 }
              ]}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar name="Current" dataKey="current" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                <Radar name="Target" dataKey="target" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Radar name="Industry" dataKey="industry" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card" style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
          <div className="card-header" style={{ background: 'var(--gray-100)', padding: '16px 24px', borderBottom: '1px solid var(--gray-200)' }}>
            <h3 className="card-title" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-700)' }}>Explanation</h3>
          </div>
          <div className="card-body" style={{ padding: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#d97706', marginBottom: '6px' }}>DATA SOURCE</div>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Multi-dimensional performance comparison across metrics.</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#d97706', marginBottom: '6px' }}>METHODOLOGY</div>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Radar chart comparing current performance vs targets and industry averages.</p>
            </div>
            <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>KEY INSIGHTS</div>
              <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                <li>Exceeding targets on 5/6 metrics</li>
                <li>All metrics outperform industry</li>
                <li>Speed shows greatest advantage</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImpactTab() {
  const impactData = {
    financial: [
      { month: 'Jul', costSavings: 0.3, revenue: 0.2 },
      { month: 'Aug', costSavings: 0.5, revenue: 0.35 },
      { month: 'Sep', costSavings: 0.8, revenue: 0.5 },
      { month: 'Oct', costSavings: 1.2, revenue: 0.8 },
      { month: 'Nov', costSavings: 1.6, revenue: 1.1 },
      { month: 'Dec', costSavings: 2.1, revenue: 1.4 }
    ],
    operational: [
      { metric: 'Decision Time', before: 100, after: 0.5, unit: '%' },
      { metric: 'Error Rate', before: 100, after: 6, unit: '%' },
      { metric: 'Manual Steps', before: 100, after: 17, unit: '%' },
      { metric: 'FTE Required', before: 100, after: 27, unit: '%' }
    ]
  };

  return (
    <div className="impact-tab">
      {/* Impact Summary */}
      <div className="impact-summary-grid">
        <div className="impact-summary-card roi">
          <span className="impact-icon">📊</span>
          <span className="impact-value">542%</span>
          <span className="impact-label">Return on Investment</span>
        </div>
        <div className="impact-summary-card savings">
          <span className="impact-icon">💰</span>
          <span className="impact-value">$4.2M</span>
          <span className="impact-label">Annual Cost Savings</span>
        </div>
        <div className="impact-summary-card revenue">
          <span className="impact-icon">📈</span>
          <span className="impact-value">$2.8M</span>
          <span className="impact-label">Revenue Impact</span>
        </div>
        <div className="impact-summary-card productivity">
          <span className="impact-icon">⚡</span>
          <span className="impact-value">+65%</span>
          <span className="impact-label">Productivity Gain</span>
        </div>
      </div>

      {/* Row 1: Cumulative Financial Impact */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)', border: '1px solid var(--primary-200)' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', padding: '16px 24px' }}>
            <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Cumulative Financial Impact</h3>
          </div>
          <div className="card-body" style={{ padding: '20px', background: 'white' }}>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={impactData.financial}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `$${v}M`} />
                <Tooltip formatter={(v) => `$${v}M`} />
                <Legend />
                <Area type="monotone" dataKey="costSavings" name="Cost Savings" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                <Area type="monotone" dataKey="revenue" name="Revenue" stackId="1" stroke="#10b981" fill="#10b981" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card" style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
          <div className="card-header" style={{ background: 'var(--gray-100)', padding: '16px 24px', borderBottom: '1px solid var(--gray-200)' }}>
            <h3 className="card-title" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-700)' }}>Explanation</h3>
          </div>
          <div className="card-body" style={{ padding: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '6px' }}>DATA SOURCE</div>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Monthly financial tracking from AI use case portfolio.</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '6px' }}>METHODOLOGY</div>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Cumulative cost savings + revenue impact attributed to AI.</p>
            </div>
            <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>KEY INSIGHTS</div>
              <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                <li>Total $3.5M impact by Dec</li>
                <li>Cost savings ($2.1M) &gt; Revenue ($1.4M)</li>
                <li>Accelerating growth trend</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Operational Improvement */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid var(--success-200)' }}>
          <div className="card-header" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '16px 24px' }}>
            <h3 className="card-title" style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>Operational Improvement</h3>
          </div>
          <div className="card-body" style={{ padding: '20px', background: 'white' }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={impactData.operational} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="metric" width={100} />
                <Tooltip formatter={(v) => `${v}% of original`} />
                <Legend />
                <Bar dataKey="before" name="Before (Baseline)" fill="#ef4444" />
                <Bar dataKey="after" name="After AI" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card" style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
          <div className="card-header" style={{ background: 'var(--gray-100)', padding: '16px 24px', borderBottom: '1px solid var(--gray-200)' }}>
            <h3 className="card-title" style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-700)' }}>Explanation</h3>
          </div>
          <div className="card-body" style={{ padding: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-600)', marginBottom: '6px' }}>DATA SOURCE</div>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Process metrics comparing pre-AI and post-AI operations.</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--success-600)', marginBottom: '6px' }}>METHODOLOGY</div>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: 0 }}>Percentage reduction in key operational metrics after AI.</p>
            </div>
            <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-800)', marginBottom: '8px' }}>KEY INSIGHTS</div>
              <ul style={{ fontSize: '12px', color: 'var(--gray-600)', margin: 0, paddingLeft: '16px' }}>
                <li>Decision time: 99.5% reduction</li>
                <li>Error rate: 94% reduction</li>
                <li>FTE required: 73% reduction</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Stakeholder Impact */}
      <div className="chart-card full-width">
        <h3>Stakeholder Satisfaction Impact</h3>
        <div className="stakeholder-impact-grid">
          <div className="stakeholder-card">
            <h4>👥 Customers</h4>
            <div className="satisfaction-change">
              <span className="before">NPS: +18</span>
              <span className="arrow">→</span>
              <span className="after">NPS: +60</span>
            </div>
            <div className="improvement">+233% improvement</div>
            <ul className="impact-points">
              <li>Instant decisions</li>
              <li>24/7 availability</li>
              <li>Transparent process</li>
            </ul>
          </div>
          <div className="stakeholder-card">
            <h4>👨‍💼 Employees</h4>
            <div className="satisfaction-change">
              <span className="before">eNPS: +12</span>
              <span className="arrow">→</span>
              <span className="after">eNPS: +50</span>
            </div>
            <div className="improvement">+317% improvement</div>
            <ul className="impact-points">
              <li>Reduced repetitive work</li>
              <li>Focus on value-add tasks</li>
              <li>Better work-life balance</li>
            </ul>
          </div>
          <div className="stakeholder-card">
            <h4>🏢 Business</h4>
            <div className="satisfaction-change">
              <span className="before">Manual Process</span>
              <span className="arrow">→</span>
              <span className="after">AI-Powered</span>
            </div>
            <div className="improvement">250x throughput</div>
            <ul className="impact-points">
              <li>Competitive advantage</li>
              <li>Scalable operations</li>
              <li>Risk reduction</li>
            </ul>
          </div>
          <div className="stakeholder-card">
            <h4>⚖️ Regulators</h4>
            <div className="satisfaction-change">
              <span className="before">Limited Audit</span>
              <span className="arrow">→</span>
              <span className="after">Full Transparency</span>
            </div>
            <div className="improvement">100% explainability</div>
            <ul className="impact-points">
              <li>Audit trail</li>
              <li>Fair lending compliance</li>
              <li>Model governance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataAnalysis;
