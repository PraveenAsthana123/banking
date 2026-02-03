import React from 'react';
import { Link } from 'react-router-dom';
import { AITypeBadge } from './AITypeIndicator';
import { ScenarioSummaryCard } from './ScenarioView';
import '../styles/scenarios.css';

const UseCaseCard = ({ uc, linkTo }) => {
  if (!uc) return null;

  const href = linkTo || `/pipeline/${uc.ucId}`;

  return (
    <Link to={href} className="pipeline-uc-card">
      <span className="pipeline-uc-id">{uc.ucId}</span>
      <span className="pipeline-uc-name">{uc.name}</span>
      <AITypeBadge aiType={uc.aiType} size="small" />
      <span className="pipeline-uc-dept">{uc.department}</span>
      <ScenarioSummaryCard scenarios={uc.scenarios} />
    </Link>
  );
};

export const UseCaseGrid = ({ useCases, maxItems }) => {
  const items = maxItems ? useCases.slice(0, maxItems) : useCases;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {items.map(uc => (
        <UseCaseCard key={uc.ucId} uc={uc} />
      ))}
    </div>
  );
};

export default UseCaseCard;
