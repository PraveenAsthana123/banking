import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Department from './pages/Department';
import UseCase from './pages/UseCase';
import Analytics from './pages/Analytics';
import Models from './pages/Models';
import Pipelines from './pages/Pipelines';
import Governance from './pages/Governance';
import Reports from './pages/Reports';
import AIImpact from './pages/AIImpact';
import DataAnalysis from './pages/DataAnalysis';
import StakeholderReports from './pages/StakeholderReports';
import Settings from './pages/Settings';
import DemoScenarios from './pages/DemoScenarios';
import AIAssistant from './pages/AIAssistant';
import ModelAnalysis from './pages/ModelAnalysis';
import Admin from './pages/Admin';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/department/:deptId" element={<Department />} />
          <Route path="/department/:deptId/:useCaseId" element={<UseCase />} />
          <Route path="/use-case/:groupId/:deptId/:aiId/:valueId" element={<UseCase />} />
          <Route path="/pipeline/:ucId" element={<UseCase />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/models" element={<Models />} />
          <Route path="/pipelines" element={<Pipelines />} />
          <Route path="/governance" element={<Governance />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/ai-impact" element={<AIImpact />} />
          <Route path="/ai-impact/:useCaseId" element={<AIImpact />} />
          <Route path="/data-analysis" element={<DataAnalysis />} />
          <Route path="/data-analysis/:useCaseId" element={<DataAnalysis />} />
          <Route path="/stakeholder-reports" element={<StakeholderReports />} />
          <Route path="/stakeholder-reports/:useCaseId" element={<StakeholderReports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/demo-scenarios" element={<DemoScenarios />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/model-analysis" element={<ModelAnalysis />} />
          <Route path="/model-analysis/:useCaseId" element={<ModelAnalysis />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
