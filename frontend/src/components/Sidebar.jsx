import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Icon } from './Icons';
import { useRole, roles } from '../context/RoleContext';
import { totalPipelineUseCases, aiTypeSummary, ucsByAiType, pipelineUseCases, groupMeta } from '../data/pipelineUseCases';

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const { currentRole, switchRole } = useRole();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [expandedPipeline, setExpandedPipeline] = useState(false);
  const [expandedPipelineGroup, setExpandedPipelineGroup] = useState({});
  const [expandedPipelineDept, setExpandedPipelineDept] = useState({});
  const [expandedPipelineDriver, setExpandedPipelineDriver] = useState({});

  // Build pipeline nav tree: Group > Department > Value Driver > Use Cases
  const pipelineTree = React.useMemo(() => {
    const tree = {};
    pipelineUseCases.forEach(uc => {
      const g = uc.group || 'LEGACY';
      if (!tree[g]) tree[g] = { meta: groupMeta[g] || { name: g, color: '#6b7280', count: 0 }, departments: {} };
      const d = uc.department || 'General';
      if (!tree[g].departments[d]) tree[g].departments[d] = { drivers: {} };
      const v = uc.valueDriver || 'General';
      if (!tree[g].departments[d].drivers[v]) tree[g].departments[d].drivers[v] = [];
      tree[g].departments[d].drivers[v].push(uc);
    });
    return tree;
  }, []);

  const mainNavItems = [
    { path: '/', icon: 'dashboard', label: 'Dashboard' },
    { path: '/ai-assistant', icon: 'message-square', label: 'AI Assistant' },
    { path: '/analytics', icon: 'analytics', label: 'Analytics' },
    { path: '/models', icon: 'models', label: 'Models' },
    { path: '/pipelines', icon: 'pipelines', label: 'Pipelines' },
    { path: '/governance', icon: 'governance', label: 'AI Governance' },
    { path: '/admin', icon: 'settings', label: 'Admin' },
  ];


  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">B</div>
        <span className="sidebar-title">Banking ML</span>
      </div>

      <button className="sidebar-toggle" onClick={onToggle}>
        <Icon name={collapsed ? 'chevronRight' : 'chevronLeft'} size={14} />
      </button>

      <nav className="sidebar-nav">
        {/* Main Navigation */}
        <div className="nav-section">
          <div className="nav-section-title">{collapsed ? '' : 'Main'}</div>
          {mainNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive && location.pathname === item.path ? 'active' : ''}`
              }
            >
              <span className="nav-icon">
                <Icon name={item.icon} />
              </span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </div>


        {/* Pipeline Use Cases Section - Group > Department > Value Driver > UC */}
        <div className="nav-section">
          <div className="nav-section-title">{collapsed ? '' : `Use Cases (${totalPipelineUseCases})`}</div>

          {Object.entries(pipelineTree).map(([groupCode, groupData]) => {
            const gKey = `pg-${groupCode}`;
            const gMeta = groupData.meta;
            const deptEntries = Object.entries(groupData.departments).sort(([a], [b]) => a.localeCompare(b));
            const groupUcCount = deptEntries.reduce((sum, [, dept]) =>
              sum + Object.values(dept.drivers).reduce((s, ucs) => s + ucs.length, 0), 0);

            return (
              <div key={gKey} className="nav-group">
                {/* Group Header */}
                <button
                  className={`nav-group-header ${expandedPipelineGroup[gKey] ? 'expanded' : ''}`}
                  onClick={() => setExpandedPipelineGroup(prev => ({ ...prev, [gKey]: !prev[gKey] }))}
                  style={{ '--group-color': gMeta.color }}
                >
                  <span className="group-indicator" style={{ backgroundColor: gMeta.color }} />
                  <span className="nav-icon"><Icon name="folder" /></span>
                  <span className="nav-label">{groupCode === 'LEGACY' ? 'Legacy' : groupCode}. {gMeta.name}</span>
                  <span className="nav-badge" style={{ fontSize: '11px' }}>{groupUcCount}</span>
                  <Icon name={expandedPipelineGroup[gKey] ? 'chevronDown' : 'chevronRight'} size={12} />
                </button>

                {/* Departments */}
                {expandedPipelineGroup[gKey] && (
                  <div className="nav-group-content">
                    {deptEntries.map(([deptName, deptData]) => {
                      const dKey = `${gKey}-${deptName}`;
                      const driverEntries = Object.entries(deptData.drivers);
                      const deptUcCount = driverEntries.reduce((s, [, ucs]) => s + ucs.length, 0);

                      return (
                        <div key={dKey} className="nav-dept">
                          {/* Department Header */}
                          <button
                            className={`nav-dept-header ${expandedPipelineDept[dKey] ? 'expanded' : ''}`}
                            onClick={() => setExpandedPipelineDept(prev => ({ ...prev, [dKey]: !prev[dKey] }))}
                          >
                            <span className="nav-icon"><Icon name="building" size={14} /></span>
                            <span className="nav-label">{deptName}</span>
                            <span className="nav-badge">{deptUcCount}</span>
                            <Icon name={expandedPipelineDept[dKey] ? 'chevronDown' : 'chevronRight'} size={10} />
                          </button>

                          {/* Value Drivers */}
                          {expandedPipelineDept[dKey] && (
                            <div className="nav-dept-content">
                              {driverEntries.map(([driverName, ucs]) => {
                                const vKey = `${dKey}-${driverName}`;
                                return (
                                  <div key={vKey} className="nav-ai-category">
                                    <button
                                      className={`nav-ai-header ${expandedPipelineDriver[vKey] ? 'expanded' : ''}`}
                                      onClick={() => setExpandedPipelineDriver(prev => ({ ...prev, [vKey]: !prev[vKey] }))}
                                    >
                                      <span className="ai-indicator" style={{ backgroundColor: gMeta.color }} />
                                      <span className="nav-label">{driverName || 'General'}</span>
                                      <span className="nav-badge" style={{ fontSize: '11px' }}>{ucs.length}</span>
                                      <Icon name={expandedPipelineDriver[vKey] ? 'chevronDown' : 'chevronRight'} size={10} />
                                    </button>

                                    {/* Use Cases */}
                                    {expandedPipelineDriver[vKey] && (
                                      <div className="nav-ai-content" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                        {ucs.map(uc => (
                                          <NavLink
                                            key={uc.ucId}
                                            to={`/pipeline/${uc.ucId}`}
                                            className="nav-value-driver"
                                          >
                                            <span style={{
                                              width: '6px', height: '6px', borderRadius: '50%',
                                              backgroundColor: uc.aiTypeColor, flexShrink: 0
                                            }} />
                                            <span className="nav-label">
                                              {uc.ucId}: {uc.name}
                                            </span>
                                          </NavLink>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* System Section */}
        <div className="nav-section">
          <div className="nav-section-title">{collapsed ? '' : 'System'}</div>
          <NavLink
            to="/reports"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">
              <Icon name="file" />
            </span>
            <span className="nav-label">Reports</span>
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">
              <Icon name="settings" />
            </span>
            <span className="nav-label">Settings</span>
          </NavLink>
        </div>
      </nav>

      {/* Role Switcher Footer */}
      <div className="sidebar-footer">
        <div className="role-switcher">
          <button
            className="role-switcher-btn"
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
          >
            <div
              className="role-indicator"
              style={{ backgroundColor: currentRole.color }}
            />
            <div className="role-info">
              <div className="role-label">Current Role</div>
              <div className="role-name">{currentRole.name}</div>
            </div>
            <Icon name={roleDropdownOpen ? 'chevronUp' : 'chevronDown'} size={14} />
          </button>
          {roleDropdownOpen && (
            <div className="role-dropdown">
              {roles.map((role) => (
                <button
                  key={role.id}
                  className={`role-option ${currentRole.id === role.id ? 'active' : ''}`}
                  onClick={() => {
                    switchRole(role.id);
                    setRoleDropdownOpen(false);
                  }}
                >
                  <div
                    className="role-indicator"
                    style={{ backgroundColor: role.color }}
                  />
                  <div className="role-option-info">
                    <div className="role-option-name">{role.name}</div>
                    <div className="role-option-desc">{role.description}</div>
                  </div>
                  {currentRole.id === role.id && (
                    <Icon name="check" size={14} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
