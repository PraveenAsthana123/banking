import React, { createContext, useContext, useState } from 'react';

// Define all roles
export const roles = [
  { id: 'executive', name: 'Executive', icon: 'briefcase', color: '#8b5cf6', description: 'C-Suite, Strategic oversight' },
  { id: 'business-owner', name: 'Business Owner', icon: 'target', color: '#3b82f6', description: 'Use case ownership, value tracking' },
  { id: 'data-scientist', name: 'Data Scientist', icon: 'cpu', color: '#10b981', description: 'Model development, experiments' },
  { id: 'mrm', name: 'Model Risk Manager', icon: 'shield', color: '#ef4444', description: 'Validation, compliance, risk' },
  { id: 'operations', name: 'Operations', icon: 'cog', color: '#f59e0b', description: 'Pipelines, monitoring, incidents' },
  { id: 'compliance', name: 'Compliance Officer', icon: 'clipboard-check', color: '#0891b2', description: 'Regulatory, audit, governance' },
  { id: 'fraud-analyst', name: 'Fraud Analyst', icon: 'alert-triangle', color: '#dc2626', description: 'Alert review, investigations' },
  { id: 'business-analyst', name: 'Business Analyst', icon: 'trending-up', color: '#7c3aed', description: 'Requirements, UAT, reporting' },
];

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const [currentRole, setCurrentRole] = useState(roles[0]);

  const switchRole = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    if (role) {
      setCurrentRole(role);
    }
  };

  return (
    <RoleContext.Provider value={{ currentRole, switchRole, roles }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
