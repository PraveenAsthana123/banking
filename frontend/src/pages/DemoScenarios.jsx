import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icons';

// User Personas
const personas = [
  {
    id: 'data-scientist',
    name: 'Data Scientist',
    role: 'ML Engineer',
    icon: 'cpu',
    color: '#3b82f6',
    description: 'Builds and trains ML models, monitors performance',
    tasks: ['Model Training', 'Feature Engineering', 'Model Evaluation', 'Hyperparameter Tuning']
  },
  {
    id: 'risk-manager',
    name: 'Risk Manager',
    role: 'Risk Analytics',
    icon: 'shield',
    color: '#dc2626',
    description: 'Monitors risk metrics, approves model decisions',
    tasks: ['Risk Assessment', 'Model Validation', 'Threshold Setting', 'Report Review']
  },
  {
    id: 'compliance-officer',
    name: 'Compliance Officer',
    role: 'Regulatory',
    icon: 'clipboard-check',
    color: '#f59e0b',
    description: 'Ensures regulatory compliance, audits model decisions',
    tasks: ['Audit Review', 'Regulatory Reporting', 'Model Governance', 'Bias Detection']
  },
  {
    id: 'business-analyst',
    name: 'Business Analyst',
    role: 'Strategy',
    icon: 'trending-up',
    color: '#10b981',
    description: 'Analyzes business impact, defines requirements',
    tasks: ['Impact Analysis', 'ROI Calculation', 'Stakeholder Reports', 'Use Case Definition']
  },
  {
    id: 'ops-engineer',
    name: 'Operations Engineer',
    role: 'MLOps',
    icon: 'cog',
    color: '#8b5cf6',
    description: 'Deploys models, manages infrastructure, monitors systems',
    tasks: ['Model Deployment', 'Pipeline Monitoring', 'Infrastructure Management', 'Incident Response']
  }
];

// Demo Scenarios
const demoScenarios = [
  {
    id: 'credit-risk-assessment',
    name: 'Credit Risk Assessment',
    department: 'Risk Management',
    persona: 'risk-manager',
    duration: '15 min',
    complexity: 'Medium',
    icon: 'shield',
    color: '#dc2626',
    description: 'End-to-end credit risk scoring for loan applications',
    businessValue: '$4.2M annual savings',
    steps: [
      {
        id: 1,
        title: 'Data Ingestion',
        description: 'Customer application data received from Core Banking',
        duration: '2 min',
        status: 'completed',
        details: [
          'Receive loan application from branch/online',
          'Extract customer demographics',
          'Pull credit bureau data',
          'Fetch transaction history'
        ],
        dataFlow: { input: 'Core Banking API', output: 'Raw Data Lake', records: '1,234' }
      },
      {
        id: 2,
        title: 'Data Validation',
        description: 'Validate and clean incoming data',
        duration: '1 min',
        status: 'completed',
        details: [
          'Schema validation (42 fields)',
          'Missing value detection',
          'Outlier identification',
          'Data type verification'
        ],
        dataFlow: { input: 'Raw Data Lake', output: 'Validated Dataset', records: '1,198' }
      },
      {
        id: 3,
        title: 'Feature Engineering',
        description: 'Transform raw data into model features',
        duration: '3 min',
        status: 'completed',
        details: [
          'Calculate debt-to-income ratio',
          'Generate payment history score',
          'Create employment stability index',
          'Build credit utilization features'
        ],
        dataFlow: { input: 'Validated Dataset', output: 'Feature Store', features: '128' }
      },
      {
        id: 4,
        title: 'Model Inference',
        description: 'Run credit risk scoring model',
        duration: '500ms',
        status: 'active',
        details: [
          'Load XGBoost model v2.3.1',
          'Apply feature normalization',
          'Generate risk probability',
          'Calculate confidence interval'
        ],
        dataFlow: { input: 'Feature Vector', output: 'Risk Score', latency: '45ms' }
      },
      {
        id: 5,
        title: 'Decision Engine',
        description: 'Apply business rules to model output',
        duration: '1 min',
        status: 'pending',
        details: [
          'Apply risk threshold (0.35)',
          'Check regulatory limits',
          'Validate against policy rules',
          'Generate decision recommendation'
        ],
        dataFlow: { input: 'Risk Score', output: 'Decision', approval_rate: '72%' }
      },
      {
        id: 6,
        title: 'Human Review',
        description: 'Manual review for edge cases',
        duration: '5 min',
        status: 'pending',
        details: [
          'Review flagged applications',
          'Examine model explanations',
          'Override if necessary',
          'Document decision rationale'
        ],
        dataFlow: { input: 'Flagged Cases', output: 'Final Decision', review_rate: '15%' }
      },
      {
        id: 7,
        title: 'Output & Notification',
        description: 'Deliver decision and update systems',
        duration: '30s',
        status: 'pending',
        details: [
          'Update loan origination system',
          'Send customer notification',
          'Log to audit trail',
          'Update analytics dashboard'
        ],
        dataFlow: { input: 'Final Decision', output: 'Multiple Systems', channels: '4' }
      }
    ],
    metrics: {
      accuracy: 94.2,
      precision: 92.8,
      recall: 89.5,
      f1Score: 91.1,
      auc: 0.96,
      latency: '45ms',
      throughput: '2,500/hr'
    }
  },
  {
    id: 'fraud-detection',
    name: 'Real-Time Fraud Detection',
    department: 'Fraud Detection',
    persona: 'ops-engineer',
    duration: '10 min',
    complexity: 'High',
    icon: 'alert-triangle',
    color: '#7c3aed',
    description: 'Real-time transaction fraud detection and prevention',
    businessValue: '$18.5M fraud prevented',
    steps: [
      {
        id: 1,
        title: 'Transaction Capture',
        description: 'Real-time transaction stream ingestion',
        duration: '10ms',
        status: 'completed',
        details: [
          'Capture transaction from payment gateway',
          'Extract transaction metadata',
          'Enrich with merchant data',
          'Add device fingerprint'
        ],
        dataFlow: { input: 'Payment Gateway', output: 'Kafka Stream', tps: '50,000' }
      },
      {
        id: 2,
        title: 'Real-Time Feature Computation',
        description: 'Calculate streaming features',
        duration: '5ms',
        status: 'completed',
        details: [
          'Velocity checks (txn count last hour)',
          'Geographic analysis',
          'Merchant risk score lookup',
          'Behavioral pattern matching'
        ],
        dataFlow: { input: 'Kafka Stream', output: 'Feature Vector', features: '256' }
      },
      {
        id: 3,
        title: 'Ensemble Model Scoring',
        description: 'Multi-model fraud probability',
        duration: '15ms',
        status: 'active',
        details: [
          'Neural network model',
          'Gradient boosting model',
          'Rule-based engine',
          'Ensemble aggregation'
        ],
        dataFlow: { input: 'Feature Vector', output: 'Fraud Score', models: '3' }
      },
      {
        id: 4,
        title: 'Risk Decision',
        description: 'Approve, decline, or challenge',
        duration: '2ms',
        status: 'pending',
        details: [
          'Apply risk thresholds',
          'Check velocity limits',
          'Trigger 3D Secure if needed',
          'Generate decision code'
        ],
        dataFlow: { input: 'Fraud Score', output: 'Decision', decline_rate: '2.1%' }
      },
      {
        id: 5,
        title: 'Alert & Response',
        description: 'Generate alerts for suspicious activity',
        duration: '1s',
        status: 'pending',
        details: [
          'Create case in fraud queue',
          'Send SMS alert to customer',
          'Block card if high risk',
          'Log for investigation'
        ],
        dataFlow: { input: 'Decision', output: 'Alert System', alert_rate: '0.5%' }
      }
    ],
    metrics: {
      accuracy: 97.3,
      precision: 95.8,
      recall: 92.1,
      f1Score: 93.9,
      auc: 0.99,
      latency: '32ms',
      throughput: '50,000/sec'
    }
  },
  {
    id: 'customer-churn',
    name: 'Customer Churn Prediction',
    department: 'Customer Analytics',
    persona: 'business-analyst',
    duration: '20 min',
    complexity: 'Medium',
    icon: 'users',
    color: '#059669',
    description: 'Identify at-risk customers and trigger retention campaigns',
    businessValue: '$8.5M revenue retained',
    steps: [
      {
        id: 1,
        title: 'Customer Data Aggregation',
        description: 'Collect multi-source customer data',
        duration: '5 min',
        status: 'completed',
        details: [
          'Transaction history (12 months)',
          'Product holdings',
          'Service interactions',
          'Digital engagement data'
        ],
        dataFlow: { input: 'Data Warehouse', output: 'Customer 360', customers: '2.5M' }
      },
      {
        id: 2,
        title: 'Behavioral Analysis',
        description: 'Analyze customer behavior patterns',
        duration: '3 min',
        status: 'completed',
        details: [
          'Transaction frequency trend',
          'Balance trajectory',
          'Product usage decline',
          'Complaint sentiment analysis'
        ],
        dataFlow: { input: 'Customer 360', output: 'Behavior Features', signals: '85' }
      },
      {
        id: 3,
        title: 'Churn Scoring',
        description: 'Predict churn probability',
        duration: '2 min',
        status: 'active',
        details: [
          'Random Forest model inference',
          'Generate churn probability',
          'Segment risk tier',
          'Identify top churn drivers'
        ],
        dataFlow: { input: 'Behavior Features', output: 'Churn Score', at_risk: '12%' }
      },
      {
        id: 4,
        title: 'Campaign Selection',
        description: 'Match retention offers to customers',
        duration: '1 min',
        status: 'pending',
        details: [
          'Select optimal offer',
          'Calculate offer economics',
          'Prioritize by CLV',
          'Channel preference matching'
        ],
        dataFlow: { input: 'Churn Score', output: 'Campaign Assignment', campaigns: '8' }
      },
      {
        id: 5,
        title: 'Outreach Execution',
        description: 'Trigger multi-channel retention',
        duration: '5 min',
        status: 'pending',
        details: [
          'Email campaign trigger',
          'RM notification for high-value',
          'Mobile app personalization',
          'Call center queue priority'
        ],
        dataFlow: { input: 'Campaign Assignment', output: 'Marketing Platform', reach: '150K' }
      },
      {
        id: 6,
        title: 'Outcome Tracking',
        description: 'Measure retention effectiveness',
        duration: 'Ongoing',
        status: 'pending',
        details: [
          'Track customer response',
          'Measure retention rate',
          'Calculate campaign ROI',
          'Update model feedback loop'
        ],
        dataFlow: { input: 'Customer Actions', output: 'Analytics Dashboard', retention: '68%' }
      }
    ],
    metrics: {
      accuracy: 91.4,
      precision: 88.2,
      recall: 85.7,
      f1Score: 86.9,
      auc: 0.92,
      latency: '2.5s',
      throughput: '100K/day'
    }
  },
  {
    id: 'aml-monitoring',
    name: 'AML Transaction Monitoring',
    department: 'Compliance',
    persona: 'compliance-officer',
    duration: '30 min',
    complexity: 'High',
    icon: 'clipboard-check',
    color: '#d97706',
    description: 'Anti-money laundering detection and regulatory reporting',
    businessValue: 'Regulatory compliance',
    steps: [
      {
        id: 1,
        title: 'Transaction Surveillance',
        description: 'Monitor all transactions against AML rules',
        duration: 'Real-time',
        status: 'completed',
        details: [
          'Screen against sanctions lists',
          'Apply velocity rules',
          'Geographic risk assessment',
          'Structuring detection'
        ],
        dataFlow: { input: 'Transaction Stream', output: 'Alert Queue', daily_txns: '5M' }
      },
      {
        id: 2,
        title: 'Risk Scoring',
        description: 'ML-based suspicious activity scoring',
        duration: '100ms',
        status: 'completed',
        details: [
          'Network analysis model',
          'Behavioral anomaly detection',
          'Entity resolution',
          'Risk aggregation'
        ],
        dataFlow: { input: 'Transaction + Context', output: 'SAR Score', alerts: '2,500/day' }
      },
      {
        id: 3,
        title: 'Alert Triage',
        description: 'Prioritize and route alerts',
        duration: '5 min',
        status: 'active',
        details: [
          'AI-assisted prioritization',
          'False positive filtering',
          'Case grouping',
          'Analyst assignment'
        ],
        dataFlow: { input: 'SAR Score', output: 'Case Queue', reduction: '40%' }
      },
      {
        id: 4,
        title: 'Investigation',
        description: 'Analyst investigation workflow',
        duration: '20 min',
        status: 'pending',
        details: [
          'Review transaction details',
          'Examine customer profile',
          'Check related entities',
          'Document findings'
        ],
        dataFlow: { input: 'Case Queue', output: 'Investigation Report', cases: '150/day' }
      },
      {
        id: 5,
        title: 'SAR Filing',
        description: 'Regulatory reporting',
        duration: '5 min',
        status: 'pending',
        details: [
          'Generate SAR narrative',
          'Validate required fields',
          'Submit to FinCEN',
          'Archive documentation'
        ],
        dataFlow: { input: 'Investigation Report', output: 'FinCEN', sars: '45/month' }
      }
    ],
    metrics: {
      accuracy: 91.7,
      precision: 78.5,
      recall: 95.2,
      f1Score: 86.0,
      auc: 0.94,
      latency: '100ms',
      throughput: '5M/day'
    }
  },
  {
    id: 'loan-origination',
    name: 'Automated Loan Origination',
    department: 'Credit Analysis',
    persona: 'data-scientist',
    duration: '25 min',
    complexity: 'High',
    icon: 'credit-card',
    color: '#2563eb',
    description: 'End-to-end automated loan processing with instant decisions',
    businessValue: '$5.2M cost savings, 70% faster processing',
    steps: [
      {
        id: 1,
        title: 'Application Intake',
        description: 'Digital application submission',
        duration: '5 min',
        status: 'completed',
        details: [
          'Online form submission',
          'Document upload (ID, income proof)',
          'OCR extraction',
          'Initial data capture'
        ],
        dataFlow: { input: 'Web/Mobile App', output: 'Application Record', fields: '45' }
      },
      {
        id: 2,
        title: 'Identity Verification',
        description: 'KYC and identity validation',
        duration: '30s',
        status: 'completed',
        details: [
          'ID document verification',
          'Facial recognition match',
          'Address verification',
          'Sanctions screening'
        ],
        dataFlow: { input: 'ID Documents', output: 'KYC Status', pass_rate: '94%' }
      },
      {
        id: 3,
        title: 'Income Verification',
        description: 'Automated income and employment check',
        duration: '1 min',
        status: 'completed',
        details: [
          'Bank statement analysis',
          'Payslip OCR extraction',
          'Employment verification API',
          'Income calculation'
        ],
        dataFlow: { input: 'Financial Docs', output: 'Verified Income', accuracy: '98%' }
      },
      {
        id: 4,
        title: 'Credit Assessment',
        description: 'Multi-model credit evaluation',
        duration: '2 min',
        status: 'active',
        details: [
          'Bureau score pull',
          'Internal scoring model',
          'Affordability calculation',
          'Debt service ratio'
        ],
        dataFlow: { input: 'Customer Data', output: 'Credit Decision', models: '4' }
      },
      {
        id: 5,
        title: 'Pricing Engine',
        description: 'Risk-based pricing determination',
        duration: '10s',
        status: 'pending',
        details: [
          'Risk tier assignment',
          'Interest rate calculation',
          'Fee determination',
          'Offer generation'
        ],
        dataFlow: { input: 'Credit Score', output: 'Loan Offer', tiers: '5' }
      },
      {
        id: 6,
        title: 'Decision & Offer',
        description: 'Final decision and customer communication',
        duration: '1 min',
        status: 'pending',
        details: [
          'Generate loan offer',
          'Create contract documents',
          'Send to customer',
          'Enable e-signature'
        ],
        dataFlow: { input: 'Loan Offer', output: 'Customer Portal', sla: '< 10 min' }
      },
      {
        id: 7,
        title: 'Disbursement',
        description: 'Loan funding and account setup',
        duration: '5 min',
        status: 'pending',
        details: [
          'Contract acceptance',
          'Account creation',
          'Funds transfer',
          'Welcome communication'
        ],
        dataFlow: { input: 'Signed Contract', output: 'Funded Account', time: 'Same day' }
      }
    ],
    metrics: {
      accuracy: 95.1,
      precision: 93.2,
      recall: 91.8,
      f1Score: 92.5,
      auc: 0.97,
      latency: '8 min',
      throughput: '500/day'
    }
  }
];

const DemoScenarios = () => {
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const filteredScenarios = selectedPersona
    ? demoScenarios.filter(s => s.persona === selectedPersona)
    : demoScenarios;

  const handlePlayScenario = () => {
    setIsPlaying(true);
    const interval = setInterval(() => {
      setActiveStep(prev => {
        if (prev >= selectedScenario.steps.length - 1) {
          clearInterval(interval);
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);
  };

  const resetScenario = () => {
    setActiveStep(0);
    setIsPlaying(false);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <div>
            <h1 className="page-title">Demo Scenarios</h1>
            <p className="page-description">
              Interactive user flows and demo walkthroughs for ML pipeline operations
            </p>
          </div>
          <div className="page-actions">
            {selectedScenario && (
              <button className="btn btn-secondary" onClick={() => setSelectedScenario(null)}>
                <Icon name="arrow-left" size={16} />
                Back to Scenarios
              </button>
            )}
          </div>
        </div>
      </div>

      {!selectedScenario ? (
        <>
          {/* Persona Selection */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <div>
                <h3 className="card-title">Select User Persona</h3>
                <p className="card-subtitle">Filter scenarios by user role</p>
              </div>
              {selectedPersona && (
                <button className="btn btn-sm btn-secondary" onClick={() => setSelectedPersona(null)}>
                  Clear Filter
                </button>
              )}
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
                {personas.map(persona => (
                  <div
                    key={persona.id}
                    onClick={() => setSelectedPersona(persona.id === selectedPersona ? null : persona.id)}
                    style={{
                      padding: '20px',
                      borderRadius: '12px',
                      border: selectedPersona === persona.id ? `2px solid ${persona.color}` : '2px solid var(--gray-200)',
                      background: selectedPersona === persona.id ? `${persona.color}10` : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: `${persona.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px',
                      color: persona.color
                    }}>
                      <Icon name={persona.icon} size={24} />
                    </div>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{persona.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '8px' }}>{persona.role}</div>
                    <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>{persona.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scenarios Grid */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Available Scenarios</h3>
                <p className="card-subtitle">{filteredScenarios.length} scenarios available</p>
              </div>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                {filteredScenarios.map(scenario => {
                  const persona = personas.find(p => p.id === scenario.persona);
                  return (
                    <div
                      key={scenario.id}
                      onClick={() => { setSelectedScenario(scenario); setActiveStep(0); }}
                      style={{
                        padding: '24px',
                        borderRadius: '12px',
                        border: '1px solid var(--gray-200)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: 'white'
                      }}
                      onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                      onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                        <div style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '12px',
                          background: `${scenario.color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: scenario.color,
                          flexShrink: 0
                        }}>
                          <Icon name={scenario.icon} size={28} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>{scenario.name}</h4>
                          <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginBottom: '12px' }}>{scenario.description}</p>

                          <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--gray-500)' }}>
                              <Icon name="clock" size={14} />
                              {scenario.duration}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--gray-500)' }}>
                              <Icon name="layers" size={14} />
                              {scenario.steps.length} steps
                            </div>
                            <div style={{
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '11px',
                              fontWeight: 500,
                              background: scenario.complexity === 'High' ? 'var(--danger-100)' : scenario.complexity === 'Medium' ? 'var(--warning-100)' : 'var(--success-100)',
                              color: scenario.complexity === 'High' ? 'var(--danger-600)' : scenario.complexity === 'Medium' ? 'var(--warning-600)' : 'var(--success-600)'
                            }}>
                              {scenario.complexity}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '6px',
                                background: `${persona?.color}20`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: persona?.color
                              }}>
                                <Icon name={persona?.icon} size={12} />
                              </div>
                              <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{persona?.name}</span>
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--success-600)' }}>
                              {scenario.businessValue}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Scenario Detail View */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header" style={{ background: `${selectedScenario.color}10` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  background: `${selectedScenario.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: selectedScenario.color
                }}>
                  <Icon name={selectedScenario.icon} size={28} />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>{selectedScenario.name}</h2>
                  <p style={{ fontSize: '14px', color: 'var(--gray-500)' }}>{selectedScenario.description}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={resetScenario}
                  disabled={activeStep === 0}
                >
                  <Icon name="refresh" size={16} />
                  Reset
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handlePlayScenario}
                  disabled={isPlaying}
                >
                  <Icon name="play" size={16} />
                  {isPlaying ? 'Playing...' : 'Play Demo'}
                </button>
              </div>
            </div>

            {/* Metrics Bar */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-200)', padding: '16px 24px', gap: '32px', background: 'var(--gray-50)' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginBottom: '2px' }}>Accuracy</div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>{selectedScenario.metrics.accuracy}%</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginBottom: '2px' }}>Precision</div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>{selectedScenario.metrics.precision}%</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginBottom: '2px' }}>Recall</div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>{selectedScenario.metrics.recall}%</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginBottom: '2px' }}>AUC</div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>{selectedScenario.metrics.auc}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginBottom: '2px' }}>Latency</div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>{selectedScenario.metrics.latency}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginBottom: '2px' }}>Throughput</div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>{selectedScenario.metrics.throughput}</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--gray-200)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 500 }}>Progress:</span>
                <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Step {activeStep + 1} of {selectedScenario.steps.length}</span>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {selectedScenario.steps.map((step, idx) => (
                  <div
                    key={step.id}
                    onClick={() => setActiveStep(idx)}
                    style={{
                      flex: 1,
                      height: '8px',
                      borderRadius: '4px',
                      background: idx <= activeStep ? selectedScenario.color : 'var(--gray-200)',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Steps Timeline */}
          <div className="grid grid-cols-3" style={{ gap: '24px' }}>
            {/* Steps List */}
            <div style={{ gridColumn: 'span 1' }}>
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Workflow Steps</h3>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  {selectedScenario.steps.map((step, idx) => (
                    <div
                      key={step.id}
                      onClick={() => setActiveStep(idx)}
                      style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid var(--gray-100)',
                        cursor: 'pointer',
                        background: idx === activeStep ? `${selectedScenario.color}10` : 'transparent',
                        borderLeft: idx === activeStep ? `3px solid ${selectedScenario.color}` : '3px solid transparent',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: idx < activeStep ? 'var(--success-500)' : idx === activeStep ? selectedScenario.color : 'var(--gray-200)',
                          color: idx <= activeStep ? 'white' : 'var(--gray-500)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px',
                          fontWeight: 600
                        }}>
                          {idx < activeStep ? <Icon name="check" size={16} /> : idx + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, fontSize: '14px', marginBottom: '2px' }}>{step.title}</div>
                          <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{step.duration}</div>
                        </div>
                        {idx === activeStep && isPlaying && (
                          <div className="loading-spinner" style={{ width: '16px', height: '16px' }} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step Detail */}
            <div style={{ gridColumn: 'span 2' }}>
              <div className="card">
                <div className="card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: selectedScenario.color,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700
                    }}>
                      {activeStep + 1}
                    </div>
                    <div>
                      <h3 className="card-title">{selectedScenario.steps[activeStep].title}</h3>
                      <p className="card-subtitle">{selectedScenario.steps[activeStep].description}</p>
                    </div>
                  </div>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 500,
                    background: 'var(--primary-100)',
                    color: 'var(--primary-600)'
                  }}>
                    Duration: {selectedScenario.steps[activeStep].duration}
                  </span>
                </div>
                <div className="card-body">
                  {/* Activities */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Activities</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                      {selectedScenario.steps[activeStep].details.map((detail, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '12px 16px',
                            borderRadius: '8px',
                            background: 'var(--gray-50)',
                            border: '1px solid var(--gray-200)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}
                        >
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            background: `${selectedScenario.color}20`,
                            color: selectedScenario.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Icon name="check" size={12} />
                          </div>
                          <span style={{ fontSize: '13px' }}>{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Data Flow */}
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Data Flow</h4>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '20px',
                      borderRadius: '12px',
                      background: 'linear-gradient(90deg, var(--primary-50) 0%, var(--success-50) 100%)',
                      border: '1px solid var(--gray-200)'
                    }}>
                      {/* Input */}
                      <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          background: 'var(--primary-500)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 8px'
                        }}>
                          <Icon name="database" size={24} />
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Input</div>
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>{selectedScenario.steps[activeStep].dataFlow.input}</div>
                      </div>

                      {/* Arrow */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '60px', height: '2px', background: 'var(--gray-300)' }} />
                        <Icon name="arrow-right" size={20} />
                        <div style={{ width: '60px', height: '2px', background: 'var(--gray-300)' }} />
                      </div>

                      {/* Processing */}
                      <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          background: 'var(--warning-500)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 8px'
                        }}>
                          <Icon name="cpu" size={24} />
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Processing</div>
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>
                          {Object.entries(selectedScenario.steps[activeStep].dataFlow)
                            .filter(([k]) => !['input', 'output'].includes(k))
                            .map(([k, v]) => `${v} ${k.replace('_', ' ')}`)
                            .join(', ') || 'Transform'}
                        </div>
                      </div>

                      {/* Arrow */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '60px', height: '2px', background: 'var(--gray-300)' }} />
                        <Icon name="arrow-right" size={20} />
                        <div style={{ width: '60px', height: '2px', background: 'var(--gray-300)' }} />
                      </div>

                      {/* Output */}
                      <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          background: 'var(--success-500)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 8px'
                        }}>
                          <Icon name="check" size={24} />
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>Output</div>
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>{selectedScenario.steps[activeStep].dataFlow.output}</div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                    <button
                      className="btn btn-secondary"
                      disabled={activeStep === 0}
                      onClick={() => setActiveStep(prev => prev - 1)}
                    >
                      <Icon name="arrow-left" size={16} />
                      Previous Step
                    </button>
                    <button
                      className="btn btn-primary"
                      disabled={activeStep === selectedScenario.steps.length - 1}
                      onClick={() => setActiveStep(prev => prev + 1)}
                    >
                      Next Step
                      <Icon name="arrow-right" size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DemoScenarios;
