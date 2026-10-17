import React from 'react';
import {
  IconShield,
  IconActivity,
  IconMap,
  IconTrendingUp,
  IconUsers,
  IconInfo,
  IconRefresh
} from './Icons';

export function Navbar({ activeTab, onSelectTab, health, onRefreshHealth, isRefreshing }) {
  const isHealthy = health?.ok;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: IconActivity },
    { id: 'map', label: 'Flood Map', icon: IconMap },
    { id: 'predict', label: 'Predict Risk', icon: IconTrendingUp },
    { id: 'reports', label: 'Community Reports', icon: IconUsers },
    { id: 'about', label: 'About', icon: IconInfo },
  ];

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Brand / Logo */}
        <div className="brand-group" onClick={() => onSelectTab('dashboard')} role="button" tabIndex={0}>
          <div className="logo-badge">
            <IconShield size={24} className="logo-icon" />
          </div>
          <div className="brand-text">
            <span className="brand-name">JalaRakshak <span className="brand-accent">AI</span></span>
            <span className="brand-sub">Urban Flood Risk & Civic Alert</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="site-nav" aria-label="Main Navigation">
          <ul className="nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id} className="nav-item">
                  <button
                    className={`nav-link ${isActive ? 'nav-active' : ''}`}
                    onClick={() => onSelectTab(item.id)}
                  >
                    <Icon size={17} className="nav-icon" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Live Backend Connection Indicator */}
        <div className="header-status-group">
          <div
            className={`api-status-pill ${isHealthy ? 'pill-online' : 'pill-offline'}`}
            title={`Backend URL: ${health?.endpoint || 'http://127.0.0.1:5000/api/health'}`}
          >
            <span className={`status-dot ${isHealthy ? 'dot-pulse-green' : 'dot-pulse-red'}`}></span>
            <span className="status-label">
              {isRefreshing
                ? 'Pinging API...'
                : isHealthy
                ? `Flask Online (${health.latencyMs}ms)`
                : 'Flask Offline'}
            </span>
          </div>

          <button
            className="btn-icon-refresh"
            onClick={onRefreshHealth}
            disabled={isRefreshing}
            aria-label="Refresh API Health"
            title="Refresh Flask Health Endpoint"
          >
            <IconRefresh size={15} className={isRefreshing ? 'spin' : ''} />
          </button>
        </div>
      </div>
    </header>
  );
}
