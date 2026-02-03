import React, { useState } from 'react';
import { pipelineUseCases, totalPipelineUseCases, aiTypeSummary, ucsByGroup, groupMeta } from '../data/pipelineUseCases';
import { AITypeBreakdown, AITypeCard } from './AITypeIndicator';
import UseCaseCard from './UseCaseCard';
import '../styles/scenarios.css';
import '../styles/ai-types.css';

const ScenarioDashboard = ({ compact = false }) => {
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedAiType, setSelectedAiType] = useState('all');

  const totalScenarios = totalPipelineUseCases * 3;

  // Filter use cases
  const filtered = pipelineUseCases.filter(uc => {
    if (selectedGroup !== 'all' && uc.group !== selectedGroup) return false;
    if (selectedAiType !== 'all' && uc.aiType !== selectedAiType) return false;
    return true;
  });

  if (compact) {
    return (
      <div className="scenario-dashboard-widget">
        <div className="scenario-dashboard-header">
          <h3 className="scenario-dashboard-title">Pipeline Use Cases & B2B/B2C/B2E Coverage</h3>
          <p className="scenario-dashboard-subtitle">{totalPipelineUseCases} use cases x 3 scenarios = {totalScenarios} total</p>
        </div>
        <div className="scenario-dashboard-body">
          <div className="scenario-stats-row">
            <div className="scenario-stat">
              <div className="scenario-stat-value">{totalPipelineUseCases}</div>
              <div className="scenario-stat-label">Pipeline UCs</div>
            </div>
            <div className="scenario-stat">
              <div className="scenario-stat-value" style={{ color: '#3b82f6' }}>{totalPipelineUseCases}</div>
              <div className="scenario-stat-label">B2B Scenarios</div>
            </div>
            <div className="scenario-stat">
              <div className="scenario-stat-value" style={{ color: '#10b981' }}>{totalPipelineUseCases}</div>
              <div className="scenario-stat-label">B2C Scenarios</div>
            </div>
            <div className="scenario-stat">
              <div className="scenario-stat-value" style={{ color: '#f59e0b' }}>{totalPipelineUseCases}</div>
              <div className="scenario-stat-label">B2E Scenarios</div>
            </div>
          </div>
          <AITypeBreakdown />
          <div className="scenario-coverage-bar" style={{ marginTop: '12px' }}>
            <div className="scenario-coverage-fill" style={{ width: '100%' }} />
          </div>
          <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--gray-500)', marginTop: '6px' }}>
            {totalPipelineUseCases}/{totalPipelineUseCases} use cases covered (100%)
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Stats Row */}
      <div className="scenario-stats-row">
        <div className="scenario-stat">
          <div className="scenario-stat-value">{totalPipelineUseCases}</div>
          <div className="scenario-stat-label">Pipeline Use Cases</div>
        </div>
        <div className="scenario-stat">
          <div className="scenario-stat-value">{totalScenarios}</div>
          <div className="scenario-stat-label">Total Scenarios</div>
        </div>
        <div className="scenario-stat">
          <div className="scenario-stat-value">{Object.keys(groupMeta).filter(k => groupMeta[k].count > 0).length}</div>
          <div className="scenario-stat-label">Groups</div>
        </div>
        <div className="scenario-stat">
          <div className="scenario-stat-value">100%</div>
          <div className="scenario-stat-label">Coverage</div>
        </div>
      </div>

      {/* AI Type Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {['analytic', 'generative', 'agentic'].map(t => (
          <AITypeCard key={t} aiType={t} />
        ))}
      </div>

      {/* AI Type Breakdown Bar */}
      <AITypeBreakdown />

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-500)' }}>Filter:</span>
        <select
          value={selectedGroup}
          onChange={e => setSelectedGroup(e.target.value)}
          style={{ padding: '6px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', fontSize: '12px' }}
        >
          <option value="all">All Groups</option>
          {Object.entries(groupMeta).filter(([_, m]) => m.count > 0).map(([code, m]) => (
            <option key={code} value={code}>{code === 'LEGACY' ? 'Legacy' : code}. {m.name} ({m.count})</option>
          ))}
        </select>
        <select
          value={selectedAiType}
          onChange={e => setSelectedAiType(e.target.value)}
          style={{ padding: '6px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', fontSize: '12px' }}
        >
          <option value="all">All AI Types</option>
          {['analytic', 'generative', 'agentic'].map(t => (
            <option key={t} value={t}>{aiTypeSummary[t].label} ({aiTypeSummary[t].count})</option>
          ))}
        </select>
        <span style={{ fontSize: '12px', color: 'var(--gray-400)', marginLeft: 'auto' }}>
          Showing {filtered.length} of {totalPipelineUseCases}
        </span>
      </div>

      {/* Use Case List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '500px', overflowY: 'auto' }}>
        {filtered.map(uc => (
          <UseCaseCard key={uc.ucId} uc={uc} />
        ))}
      </div>
    </div>
  );
};

export default ScenarioDashboard;
