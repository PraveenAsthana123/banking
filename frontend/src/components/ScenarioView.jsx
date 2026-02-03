import React, { useState } from 'react';
import { AITypeBadge } from './AITypeIndicator';
import '../styles/scenarios.css';

const SCENARIO_COLORS = {
  b2b: { label: 'B2B', color: '#3b82f6', bg: '#eff6ff', desc: 'Business-to-Business' },
  b2c: { label: 'B2C', color: '#10b981', bg: '#ecfdf5', desc: 'Business-to-Consumer' },
  b2e: { label: 'B2E', color: '#f59e0b', bg: '#fffbeb', desc: 'Business-to-Employee' },
};

const ScenarioCard = ({ scenario, scenarioType }) => {
  const meta = SCENARIO_COLORS[scenarioType];

  return (
    <div className="scenario-card">
      <div className={`scenario-card-header ${scenarioType}`}>
        <h3 className="scenario-card-title">{scenario.title}</h3>
        <p className="scenario-card-description">{scenario.description}</p>
      </div>
      <div className="scenario-card-body">
        {/* Stakeholders */}
        <div className="stakeholder-section">
          <span className="stakeholder-label">Key Stakeholders</span>
          <div className="stakeholder-badges">
            {scenario.stakeholders.map((s, i) => (
              <span key={i} className="stakeholder-badge">{s}</span>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="kpi-section">
          <span className="kpi-label">Key Performance Indicators</span>
          <div className="kpi-grid">
            {scenario.kpis.map((kpi, i) => (
              <div key={i} className="kpi-item">
                <span className={`kpi-dot ${scenarioType}`} />
                {kpi}
              </div>
            ))}
          </div>
        </div>

        {/* Example Flow */}
        <div className="flow-section">
          <span className="flow-label">Example Flow</span>
          <div className="flow-steps">
            {scenario.exampleFlow.map((step, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="flow-arrow">&rarr;</span>}
                <div className="flow-step">
                  <span className={`flow-step-number ${scenarioType}`}>{i + 1}</span>
                  {step}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Metrics */}
        <div className="metrics-section">
          <span className="metrics-label">Target Metrics</span>
          <div className="metrics-grid">
            {Object.entries(scenario.metrics).map(([key, val]) => (
              <div key={key} className="metric-card">
                <div className="metric-value">{typeof val === 'number' && val > 100 ? val.toLocaleString() : val}{typeof val === 'number' && key.includes('rate') || key.includes('compliance') || key.includes('target') ? '%' : ''}</div>
                <div className="metric-name">{key.replace(/_/g, ' ')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ScenarioCompare = ({ scenarios }) => {
  if (!scenarios) return null;
  const types = ['b2b', 'b2c', 'b2e'];

  return (
    <div className="scenario-compare">
      {types.map(type => {
        const s = scenarios[type];
        const meta = SCENARIO_COLORS[type];
        return (
          <div key={type} className="scenario-compare-col">
            <div className={`scenario-compare-header ${type}`}>
              {meta.label} - {meta.desc}
            </div>
            <div className="scenario-compare-body">
              <div className="scenario-compare-row">
                <span className="scenario-compare-row-label">Focus</span>
                <span className="scenario-compare-row-value">{s.title}</span>
              </div>
              <div className="scenario-compare-row">
                <span className="scenario-compare-row-label">Stakeholders</span>
                <span className="scenario-compare-row-value">{s.stakeholders.join(', ')}</span>
              </div>
              <div className="scenario-compare-row">
                <span className="scenario-compare-row-label">KPIs</span>
                <span className="scenario-compare-row-value">{s.kpis.join('; ')}</span>
              </div>
              <div className="scenario-compare-row">
                <span className="scenario-compare-row-label">Flow Steps</span>
                <span className="scenario-compare-row-value">{s.exampleFlow.length} steps</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const ScenarioSummaryCard = ({ scenarios }) => {
  if (!scenarios) return null;
  return (
    <div className="scenario-summary-card">
      <div className="scenario-dots">
        <span className="scenario-dot b2b" title="B2B" />
        <span className="scenario-dot b2c" title="B2C" />
        <span className="scenario-dot b2e" title="B2E" />
      </div>
      <span style={{ fontSize: '11px', color: 'var(--gray-500)' }}>3 scenarios</span>
    </div>
  );
};

const ScenarioView = ({ useCase }) => {
  const [activeScenario, setActiveScenario] = useState('b2b');
  const [viewMode, setViewMode] = useState('detail'); // detail | compare

  if (!useCase || !useCase.scenarios) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-400)' }}>
        No scenario data available for this use case.
      </div>
    );
  }

  const scenarios = useCase.scenarios;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>
            Business Scenarios
          </h3>
          <AITypeBadge aiType={useCase.aiType} size="small" />
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => setViewMode('detail')}
            style={{
              padding: '4px 12px',
              border: '1px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              background: viewMode === 'detail' ? 'var(--gray-100)' : 'white',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: viewMode === 'detail' ? '600' : '400',
            }}
          >
            Detail View
          </button>
          <button
            onClick={() => setViewMode('compare')}
            style={{
              padding: '4px 12px',
              border: '1px solid var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              background: viewMode === 'compare' ? 'var(--gray-100)' : 'white',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: viewMode === 'compare' ? '600' : '400',
            }}
          >
            Compare All
          </button>
        </div>
      </div>

      {viewMode === 'compare' ? (
        <ScenarioCompare scenarios={scenarios} />
      ) : (
        <>
          {/* Scenario Tabs */}
          <div className="scenario-tabs">
            {Object.entries(SCENARIO_COLORS).map(([key, meta]) => (
              <button
                key={key}
                className={`scenario-tab-btn ${activeScenario === key ? `active-${key}` : ''}`}
                onClick={() => setActiveScenario(key)}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: meta.color,
                  }}
                />
                <span className="scenario-tab-label">{meta.label}</span>
                <span style={{ fontSize: '11px', color: 'var(--gray-400)' }}>
                  {meta.desc}
                </span>
              </button>
            ))}
          </div>

          {/* Active Scenario Card */}
          <ScenarioCard
            scenario={scenarios[activeScenario]}
            scenarioType={activeScenario}
          />
        </>
      )}
    </div>
  );
};

export default ScenarioView;
