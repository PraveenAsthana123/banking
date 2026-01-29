import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '../components/Icons';
import { departments, mlTypeCategories, aiCategories } from '../data/departments';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your Banking ML Assistant. I can help you with:\n\n- **Accuracy Reports** - View model performance for any use case\n- **Model Information** - Details about ML, DL, NLP, Time Series models\n- **Use Case Analysis** - Deep dive into specific use cases\n- **RAG Queries** - Ask questions about our ML documentation\n\nHow can I assist you today?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get all use cases flattened
  const getAllUseCases = () => {
    return departments.flatMap(dept =>
      dept.useCases.map(uc => ({ ...uc, department: dept.name, deptId: dept.id }))
    );
  };

  // Filter use cases by ML type
  const getUseCasesByMlType = (mlType) => {
    const allUseCases = getAllUseCases();
    if (mlType === 'all') return allUseCases;
    return allUseCases.filter(uc => uc.mlType === mlType);
  };

  // Get accuracy report
  const generateAccuracyReport = () => {
    const allUseCases = getAllUseCases();
    const activeUseCases = allUseCases.filter(uc => uc.status === 'active' && uc.accuracy > 0);

    const byMlType = {};
    mlTypeCategories.slice(1).forEach(cat => {
      const cases = activeUseCases.filter(uc => uc.mlType === cat.id);
      if (cases.length > 0) {
        byMlType[cat.name] = {
          count: cases.length,
          avgAccuracy: (cases.reduce((sum, uc) => sum + uc.accuracy, 0) / cases.length).toFixed(1),
          topModels: cases.sort((a, b) => b.accuracy - a.accuracy).slice(0, 3)
        };
      }
    });

    return byMlType;
  };

  // Process user input
  const processQuery = (query) => {
    const lowerQuery = query.toLowerCase();

    // Accuracy report queries
    if (lowerQuery.includes('accuracy') || lowerQuery.includes('report') || lowerQuery.includes('performance')) {
      const report = generateAccuracyReport();
      let response = '## Accuracy Report by ML Type\n\n';

      Object.entries(report).forEach(([type, data]) => {
        response += `### ${type}\n`;
        response += `- **Total Models:** ${data.count}\n`;
        response += `- **Avg Accuracy:** ${data.avgAccuracy}%\n`;
        response += `- **Top Performers:**\n`;
        data.topModels.forEach(m => {
          response += `  - ${m.name}: ${m.accuracy}%\n`;
        });
        response += '\n';
      });

      return response;
    }

    // Time series queries
    if (lowerQuery.includes('time series') || lowerQuery.includes('timeseries') || lowerQuery.includes('forecasting')) {
      const tsUseCases = getUseCasesByMlType('time-series').filter(uc => uc.status === 'active');
      let response = '## Time Series Models\n\n';
      response += `Found **${tsUseCases.length}** active time series models:\n\n`;
      response += '| Use Case | Department | Accuracy | Status |\n';
      response += '|----------|------------|----------|--------|\n';
      tsUseCases.forEach(uc => {
        response += `| ${uc.name} | ${uc.department} | ${uc.accuracy}% | ${uc.status} |\n`;
      });
      response += '\n**Common algorithms:** LSTM, ARIMA, Prophet, Transformer-based models\n';
      response += '**Applications:** VaR prediction, Cash forecasting, Churn prediction, Default prediction';
      return response;
    }

    // Deep Learning queries
    if (lowerQuery.includes('deep learning') || lowerQuery.includes('dl') || lowerQuery.includes('neural')) {
      const dlUseCases = getAllUseCases().filter(uc =>
        uc.mlType === 'computer-vision' || uc.mlType === 'nlp' || uc.mlType === 'hybrid'
      ).filter(uc => uc.status === 'active');

      let response = '## Deep Learning Models\n\n';
      response += `Found **${dlUseCases.length}** active deep learning models:\n\n`;

      response += '### Computer Vision\n';
      dlUseCases.filter(uc => uc.mlType === 'computer-vision').forEach(uc => {
        response += `- **${uc.name}** (${uc.department}): ${uc.accuracy}%\n`;
      });

      response += '\n### NLP Models\n';
      dlUseCases.filter(uc => uc.mlType === 'nlp').forEach(uc => {
        response += `- **${uc.name}** (${uc.department}): ${uc.accuracy}%\n`;
      });

      response += '\n### Hybrid/Ensemble\n';
      dlUseCases.filter(uc => uc.mlType === 'hybrid').forEach(uc => {
        response += `- **${uc.name}** (${uc.department}): ${uc.accuracy}%\n`;
      });

      response += '\n**Frameworks:** TensorFlow, PyTorch, Transformers, Keras';
      return response;
    }

    // ML queries
    if (lowerQuery.includes('machine learning') || (lowerQuery.includes('ml') && !lowerQuery.includes('nlp'))) {
      const mlUseCases = getUseCasesByMlType('tabular').filter(uc => uc.status === 'active');
      let response = '## Traditional ML Models (Tabular)\n\n';
      response += `Found **${mlUseCases.length}** active tabular ML models:\n\n`;
      response += '| Use Case | Department | Accuracy | Models |\n';
      response += '|----------|------------|----------|--------|\n';
      mlUseCases.slice(0, 15).forEach(uc => {
        response += `| ${uc.name} | ${uc.department} | ${uc.accuracy}% | ${uc.models} |\n`;
      });
      response += '\n**Common algorithms:** XGBoost, Random Forest, LightGBM, Logistic Regression, SVM';
      return response;
    }

    // NLP queries
    if (lowerQuery.includes('nlp') || lowerQuery.includes('natural language') || lowerQuery.includes('text')) {
      const nlpUseCases = getUseCasesByMlType('nlp').filter(uc => uc.status === 'active');
      let response = '## NLP Models\n\n';
      response += `Found **${nlpUseCases.length}** active NLP models:\n\n`;
      nlpUseCases.forEach(uc => {
        response += `### ${uc.name}\n`;
        response += `- **Department:** ${uc.department}\n`;
        response += `- **Accuracy:** ${uc.accuracy}%\n`;
        response += `- **Trust Score:** ${uc.trustScore || 'N/A'}\n\n`;
      });
      response += '**Techniques:** BERT, GPT, Named Entity Recognition, Sentiment Analysis, Intent Classification\n';
      response += '**Use Cases:** Chatbot intent, Sentiment analysis, Document processing, Adverse media screening';
      return response;
    }

    // RAG queries
    if (lowerQuery.includes('rag') || lowerQuery.includes('retrieval') || lowerQuery.includes('documentation')) {
      return '## RAG (Retrieval Augmented Generation)\n\n' +
        'Our RAG system provides intelligent document retrieval and question answering:\n\n' +
        '### Available Knowledge Bases:\n' +
        '- **ML Pipeline Documentation** - Training, evaluation, deployment guides\n' +
        '- **Use Case Specifications** - 64 detailed use case documents\n' +
        '- **Model Cards** - Performance metrics, bias reports, governance\n' +
        '- **API Documentation** - Endpoints, schemas, examples\n\n' +
        '### How to Use:\n' +
        '1. Ask any question about our ML systems\n' +
        '2. Request specific documentation\n' +
        '3. Query model performance history\n' +
        '4. Get compliance and governance information\n\n' +
        '**Example queries:**\n' +
        '- "What is the credit risk scoring model architecture?"\n' +
        '- "Show me fraud detection API endpoints"\n' +
        '- "What are the governance requirements for loan models?"';
    }

    // Model list queries
    if (lowerQuery.includes('list') || lowerQuery.includes('all models') || lowerQuery.includes('models used')) {
      const allUseCases = getAllUseCases().filter(uc => uc.status === 'active');
      let response = '## All Active Models Summary\n\n';
      response += `**Total Active Models:** ${allUseCases.length}\n\n`;

      const byType = {};
      allUseCases.forEach(uc => {
        const type = uc.mlType || 'unknown';
        if (!byType[type]) byType[type] = [];
        byType[type].push(uc);
      });

      Object.entries(byType).forEach(([type, cases]) => {
        const typeInfo = mlTypeCategories.find(c => c.id === type) || { name: type };
        response += `### ${typeInfo.name} (${cases.length})\n`;
        cases.slice(0, 5).forEach(uc => {
          response += `- ${uc.name}: ${uc.accuracy}%\n`;
        });
        if (cases.length > 5) response += `- ... and ${cases.length - 5} more\n`;
        response += '\n';
      });

      return response;
    }

    // Department queries
    const matchedDept = departments.find(d =>
      lowerQuery.includes(d.name.toLowerCase()) || lowerQuery.includes(d.id)
    );
    if (matchedDept) {
      let response = `## ${matchedDept.name} Department\n\n`;
      response += `${matchedDept.description}\n\n`;
      response += `### Use Cases (${matchedDept.useCases.length})\n\n`;
      response += '| Use Case | Status | Accuracy | ML Type |\n';
      response += '|----------|--------|----------|--------|\n';
      matchedDept.useCases.forEach(uc => {
        response += `| ${uc.name} | ${uc.status} | ${uc.accuracy || 'N/A'}% | ${uc.mlType || 'N/A'} |\n`;
      });
      return response;
    }

    // Default response
    return 'I can help you with:\n\n' +
      '- **"accuracy report"** - View performance metrics for all models\n' +
      '- **"time series models"** - List forecasting and temporal models\n' +
      '- **"deep learning"** or **"dl"** - Show neural network models\n' +
      '- **"ml models"** - Traditional machine learning models\n' +
      '- **"nlp models"** - Natural language processing models\n' +
      '- **"rag"** - Information about our RAG system\n' +
      '- **"list all models"** - Complete model inventory\n' +
      '- **Department names** (e.g., "fraud detection", "risk management")\n\n' +
      'Try asking: "Show me the accuracy report" or "What NLP models do you have?"';
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate processing delay
    setTimeout(() => {
      const response = processQuery(input);
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { label: 'Accuracy Report', query: 'Show me the accuracy report for all use cases' },
    { label: 'Time Series Models', query: 'List all time series models' },
    { label: 'NLP Models', query: 'What NLP models are available?' },
    { label: 'Deep Learning', query: 'Show deep learning models' },
    { label: 'Fraud Detection', query: 'Tell me about fraud detection department' },
    { label: 'RAG System', query: 'How does the RAG system work?' },
  ];

  // Render message content with markdown-like formatting
  const renderContent = (content) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('## ')) {
        return <h2 key={i} className="message-h2">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={i} className="message-h3">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('| ')) {
        return <div key={i} className="message-table-row">{line}</div>;
      }
      if (line.startsWith('- **')) {
        const match = line.match(/- \*\*(.+?)\*\*(.*)$/);
        if (match) {
          return <div key={i} className="message-list-item"><strong>{match[1]}</strong>{match[2]}</div>;
        }
      }
      if (line.startsWith('- ')) {
        return <div key={i} className="message-list-item">{line.replace('- ', '')}</div>;
      }
      // Handle inline bold
      const boldProcessed = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      return <p key={i} dangerouslySetInnerHTML={{ __html: boldProcessed }} />;
    });
  };

  return (
    <div className="page-container ai-assistant-page">
      <div className="page-header">
        <div className="page-header-content">
          <div>
            <h1 className="page-title">AI Assistant</h1>
            <p className="page-description">
              Interactive ML chatbot with RAG capabilities - Test models and get insights
            </p>
          </div>
          <div className="page-actions">
            <button className="btn btn-secondary" onClick={() => setMessages([messages[0]])}>
              <Icon name="refresh" size={16} />
              Clear Chat
            </button>
          </div>
        </div>
      </div>

      <div className="assistant-layout">
        {/* Sidebar with model explorer */}
        <div className="assistant-sidebar">
          <div className="sidebar-section">
            <h3>Model Categories</h3>
            <div className="category-list">
              {mlTypeCategories.map(cat => {
                const count = cat.id === 'all'
                  ? getAllUseCases().filter(uc => uc.status === 'active').length
                  : getUseCasesByMlType(cat.id).filter(uc => uc.status === 'active').length;
                return (
                  <button
                    key={cat.id}
                    className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{ '--cat-color': cat.color }}
                  >
                    <Icon name={cat.icon} size={18} />
                    <span className="cat-name">{cat.name}</span>
                    <span className="cat-count">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Quick Stats</h3>
            <div className="quick-stats">
              <div className="stat-item">
                <span className="stat-label">Total Models</span>
                <span className="stat-value">{getAllUseCases().filter(uc => uc.status === 'active').length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Avg Accuracy</span>
                <span className="stat-value">
                  {(getAllUseCases().filter(uc => uc.accuracy > 0).reduce((sum, uc) => sum + uc.accuracy, 0) /
                    getAllUseCases().filter(uc => uc.accuracy > 0).length).toFixed(1)}%
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Departments</span>
                <span className="stat-value">{departments.length}</span>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Top Performers</h3>
            <div className="top-models">
              {getAllUseCases()
                .filter(uc => uc.status === 'active' && uc.accuracy > 0)
                .sort((a, b) => b.accuracy - a.accuracy)
                .slice(0, 5)
                .map((uc, i) => (
                  <div key={i} className="top-model-item">
                    <div className="model-rank">#{i + 1}</div>
                    <div className="model-info">
                      <div className="model-name">{uc.name}</div>
                      <div className="model-dept">{uc.department}</div>
                    </div>
                    <div className="model-accuracy">{uc.accuracy}%</div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Main chat area */}
        <div className="assistant-main">
          <div className="chat-container">
            <div className="messages-area">
              {messages.map(msg => (
                <div key={msg.id} className={`message ${msg.type}`}>
                  <div className="message-avatar">
                    {msg.type === 'bot' ? (
                      <Icon name="cpu" size={20} />
                    ) : (
                      <span>U</span>
                    )}
                  </div>
                  <div className="message-content">
                    {renderContent(msg.content)}
                    <div className="message-time">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="message bot">
                  <div className="message-avatar">
                    <Icon name="cpu" size={20} />
                  </div>
                  <div className="message-content typing">
                    <div className="typing-indicator">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick actions */}
            <div className="quick-actions">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  className="quick-action-btn"
                  onClick={() => {
                    setInput(action.query);
                    setTimeout(() => handleSend(), 100);
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>

            {/* Input area */}
            <div className="input-area">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about models, accuracy, RAG queries..."
                rows={2}
              />
              <button className="send-btn" onClick={handleSend} disabled={!input.trim()}>
                <Icon name="arrow-right" size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Model explorer panel */}
        <div className="assistant-explorer">
          <h3>
            {selectedCategory === 'all' ? 'All Models' : mlTypeCategories.find(c => c.id === selectedCategory)?.name}
            <span className="model-count">
              ({getUseCasesByMlType(selectedCategory).filter(uc => uc.status === 'active').length})
            </span>
          </h3>
          <div className="model-list">
            {getUseCasesByMlType(selectedCategory)
              .filter(uc => uc.status === 'active')
              .sort((a, b) => b.accuracy - a.accuracy)
              .map((uc, i) => (
                <div key={i} className="model-card-mini">
                  <div className="model-card-header">
                    <span className="model-name">{uc.name}</span>
                    <span className={`accuracy-badge ${uc.accuracy >= 95 ? 'excellent' : uc.accuracy >= 90 ? 'good' : 'fair'}`}>
                      {uc.accuracy}%
                    </span>
                  </div>
                  <div className="model-card-meta">
                    <span>{uc.department}</span>
                    <span className="ml-type-tag">{uc.mlType}</span>
                  </div>
                  <div className="model-card-stats">
                    <div className="mini-stat">
                      <Icon name="cpu" size={12} />
                      <span>{uc.models} models</span>
                    </div>
                    {uc.trustScore && (
                      <div className="mini-stat">
                        <Icon name="shield" size={12} />
                        <span>Trust: {uc.trustScore}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
