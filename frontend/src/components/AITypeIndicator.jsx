import React from 'react';
import { aiTypeSummary, totalPipelineUseCases } from '../data/pipelineUseCases';
import '../styles/ai-types.css';

const AI_TYPE_DESCRIPTIONS = {
  analytic: 'ML classification, regression, scoring, and prediction models for data-driven insights.',
  generative: 'Text generation, summarization, RAG-powered copilots, and content creation.',
  agentic: 'Multi-step workflow orchestration, automation bots, and intelligent process agents.',
};

export const AITypeBadge = ({ aiType, size = 'default' }) => {
  const meta = aiTypeSummary[aiType];
  if (!meta) return null;

  return (
    <span className={`ai-type-badge ${aiType}`} style={size === 'small' ? { fontSize: '10px', padding: '2px 7px' } : {}}>
      <span className={`ai-type-badge-dot ${aiType}`} />
      {meta.label}
    </span>
  );
};

export const AITypeCard = ({ aiType }) => {
  const meta = aiTypeSummary[aiType];
  if (!meta) return null;

  return (
    <div className={`ai-type-card ${aiType}`}>
      <div className="ai-type-card-header">
        <span className="ai-type-card-name">{meta.label}</span>
        <span className="ai-type-card-count">{meta.count}</span>
      </div>
      <div className="ai-type-card-desc">
        {AI_TYPE_DESCRIPTIONS[aiType]}
      </div>
    </div>
  );
};

export const AITypeBreakdown = () => {
  const total = totalPipelineUseCases;
  const types = ['analytic', 'generative', 'agentic'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div className="ai-type-bar-container">
        {types.map(t => {
          const pct = (aiTypeSummary[t].count / total) * 100;
          return (
            <div
              key={t}
              className={`ai-type-bar-segment ${t}`}
              style={{ width: `${pct}%` }}
              title={`${aiTypeSummary[t].label}: ${aiTypeSummary[t].count} (${pct.toFixed(0)}%)`}
            />
          );
        })}
      </div>
      <div className="ai-type-legend">
        {types.map(t => (
          <div key={t} className="ai-type-legend-item">
            <span className={`ai-type-legend-dot ${t}`} />
            {aiTypeSummary[t].label}: {aiTypeSummary[t].count}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AITypeBadge;
