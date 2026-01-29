import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Icon } from './Icons';
import { useRole, roles } from '../context/RoleContext';
import { folderStructure, aiCategories, valueDrivers } from '../data/folderStructure';

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const { currentRole, switchRole } = useRole();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [expandedDepts, setExpandedDepts] = useState({});
  const [expandedAI, setExpandedAI] = useState({});
  const [expandedValue, setExpandedValue] = useState({});

  const mainNavItems = [
    { path: '/', icon: 'dashboard', label: 'Dashboard' },
    { path: '/ai-assistant', icon: 'message-square', label: 'AI Assistant' },
    { path: '/analytics', icon: 'analytics', label: 'Analytics' },
    { path: '/models', icon: 'models', label: 'Models' },
    { path: '/pipelines', icon: 'pipelines', label: 'Pipelines' },
    { path: '/governance', icon: 'governance', label: 'AI Governance' },
  ];

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const toggleDept = (deptKey) => {
    setExpandedDepts(prev => ({ ...prev, [deptKey]: !prev[deptKey] }));
  };

  const toggleAI = (aiKey) => {
    setExpandedAI(prev => ({ ...prev, [aiKey]: !prev[aiKey] }));
  };

  const toggleValue = (valueKey) => {
    setExpandedValue(prev => ({ ...prev, [valueKey]: !prev[valueKey] }));
  };

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

        {/* Department Groups - Folder Structure */}
        <div className="nav-section">
          <div className="nav-section-title">{collapsed ? '' : '5-Star Use Cases'}</div>

          {folderStructure.map((group) => (
            <div key={group.id} className="nav-group">
              {/* Group Header (A, B, C, etc.) */}
              <button
                className={`nav-group-header ${expandedGroups[group.id] ? 'expanded' : ''}`}
                onClick={() => toggleGroup(group.id)}
                style={{ '--group-color': group.color }}
              >
                <span className="group-indicator" style={{ backgroundColor: group.color }} />
                <span className="nav-icon">
                  <Icon name={group.icon} />
                </span>
                <span className="nav-label">{group.code}. {group.name}</span>
                <Icon name={expandedGroups[group.id] ? 'chevronDown' : 'chevronRight'} size={12} />
              </button>

              {/* Subdepartments */}
              {expandedGroups[group.id] && (
                <div className="nav-group-content">
                  {group.subdepartments.map((dept) => {
                    const deptKey = `${group.id}-${dept.id}`;
                    return (
                      <div key={deptKey} className="nav-dept">
                        {/* Department Header */}
                        <button
                          className={`nav-dept-header ${expandedDepts[deptKey] ? 'expanded' : ''}`}
                          onClick={() => toggleDept(deptKey)}
                        >
                          <span className="nav-icon">
                            <Icon name={dept.icon} size={14} />
                          </span>
                          <span className="nav-label">{dept.id}. {dept.name}</span>
                          <span className="nav-badge">{dept.useCases}</span>
                          <Icon name={expandedDepts[deptKey] ? 'chevronDown' : 'chevronRight'} size={10} />
                        </button>

                        {/* AI Categories under Department */}
                        {expandedDepts[deptKey] && (
                          <div className="nav-dept-content">
                            <div className="nav-folder">
                              <span className="folder-icon">
                                <Icon name="folder" size={12} />
                              </span>
                              <span className="folder-label">AI_Use_Cases</span>
                            </div>

                            {aiCategories.map((ai) => {
                              const aiKey = `${deptKey}-${ai.id}`;
                              return (
                                <div key={aiKey} className="nav-ai-category">
                                  <button
                                    className={`nav-ai-header ${expandedAI[aiKey] ? 'expanded' : ''}`}
                                    onClick={() => toggleAI(aiKey)}
                                  >
                                    <span className="ai-indicator" style={{ backgroundColor: ai.color }} />
                                    <span className="nav-label">{ai.id}. {ai.name}</span>
                                    <Icon name={expandedAI[aiKey] ? 'chevronDown' : 'chevronRight'} size={10} />
                                  </button>

                                  {/* Value Drivers under AI Category */}
                                  {expandedAI[aiKey] && (
                                    <div className="nav-ai-content">
                                      {valueDrivers.map((value) => {
                                        const valueKey = `${aiKey}-${value.id}`;
                                        return (
                                          <NavLink
                                            key={valueKey}
                                            to={`/use-case/${group.id}/${dept.id}/${ai.id}/${value.id}`}
                                            className="nav-value-driver"
                                          >
                                            <span className="value-indicator" style={{ backgroundColor: value.color }} />
                                            <span className="nav-label">{value.name}</span>
                                          </NavLink>
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
              )}
            </div>
          ))}
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
