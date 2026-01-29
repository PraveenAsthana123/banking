import React from 'react';
import { useLocation } from 'react-router-dom';
import { Icon } from './Icons';
import { departments } from '../data/departments';

const Header = () => {
  const location = useLocation();

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Home', path: '/' }];

    if (paths[0] === 'department' && paths[1]) {
      const dept = departments.find((d) => d.id === paths[1]);
      if (dept) {
        breadcrumbs.push({ label: dept.name, path: `/department/${dept.id}` });

        if (paths[2]) {
          const useCase = dept.useCases.find((uc) => uc.id === paths[2]);
          if (useCase) {
            breadcrumbs.push({
              label: useCase.name,
              path: `/department/${dept.id}/${useCase.id}`,
            });
          }
        }
      }
    } else if (paths[0]) {
      const pageNames = {
        analytics: 'Analytics',
        models: 'Models',
        pipelines: 'Pipelines',
        governance: 'AI Governance',
        settings: 'Settings',
      };
      if (pageNames[paths[0]]) {
        breadcrumbs.push({ label: pageNames[paths[0]], path: `/${paths[0]}` });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="header">
      <div className="header-left">
        <nav className="breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.path} className="breadcrumb-item">
              {index > 0 && <span className="breadcrumb-separator">/</span>}
              <span className={index === breadcrumbs.length - 1 ? 'active' : ''}>
                {crumb.label}
              </span>
            </span>
          ))}
        </nav>
      </div>

      <div className="header-right">
        <div className="search-box">
          <span className="search-icon">
            <Icon name="search" size={18} />
          </span>
          <input
            type="text"
            className="search-input"
            placeholder="Search use cases, models..."
          />
        </div>

        <button className="header-btn">
          <Icon name="bell" size={20} />
          <span className="notification-dot" />
        </button>

        <button className="header-btn">
          <Icon name="settings" size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
