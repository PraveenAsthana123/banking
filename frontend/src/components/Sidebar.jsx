import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Icon } from './Icons';
import { departments } from '../data/departments';
import { useRole, roles } from '../context/RoleContext';

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const { currentRole, switchRole } = useRole();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const mainNavItems = [
    { path: '/', icon: 'dashboard', label: 'Dashboard' },
    { path: '/ai-assistant', icon: 'message-square', label: 'AI Assistant' },
    { path: '/analytics', icon: 'analytics', label: 'Analytics' },
    { path: '/models', icon: 'models', label: 'Models' },
    { path: '/pipelines', icon: 'pipelines', label: 'Pipelines' },
    { path: '/governance', icon: 'governance', label: 'AI Governance' },
    { path: '/reports', icon: 'clipboard-check', label: 'Reports' },
    { path: '/ai-impact', icon: 'trending-up', label: 'AI Impact' },
    { path: '/data-analysis', icon: 'chart', label: 'Data Analysis' },
    { path: '/model-analysis', icon: 'analytics', label: 'Model Analysis' },
    { path: '/stakeholder-reports', icon: 'file', label: 'Stakeholder Reports' },
    { path: '/demo-scenarios', icon: 'play', label: 'Demo Scenarios' },
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
        <div className="nav-section">
          <div className="nav-section-title">{collapsed ? '—' : 'Main'}</div>
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

        <div className="nav-section">
          <div className="nav-section-title">{collapsed ? '—' : 'Departments'}</div>
          {departments.map((dept) => {
            const isActive = location.pathname.startsWith(`/department/${dept.id}`);
            const activeCount = dept.useCases.filter((uc) => uc.status === 'active').length;

            return (
              <NavLink
                key={dept.id}
                to={`/department/${dept.id}`}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <span className={`dept-indicator ${dept.id}`} />
                <span className="nav-icon">
                  <Icon name={dept.icon} />
                </span>
                <span className="nav-label">{dept.name}</span>
                {activeCount > 0 && (
                  <span className="nav-badge">{activeCount}</span>
                )}
              </NavLink>
            );
          })}
        </div>

        <div className="nav-section">
          <div className="nav-section-title">{collapsed ? '—' : 'System'}</div>
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
