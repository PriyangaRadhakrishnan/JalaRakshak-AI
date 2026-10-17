import React from 'react';
import { IconShield } from './Icons';
import { API_BASE_URL } from '../config';

export function Footer({ onSelectTab }) {
  const currentYear = 2026;

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-left">
          <div className="footer-brand">
            <IconShield size={18} className="footer-icon" />
            <span><strong>JalaRakshak AI</strong> • Civic Tech Hydrology Initiative</span>
          </div>
          <p className="footer-text">
            Designed to empower municipal catchments and residents with local flood risk intelligence.
            Zero cloud tracking. Pure local edge execution.
          </p>
        </div>

        <div className="footer-center">
          <span className="footer-heading">Navigation</span>
          <div className="footer-links">
            <button onClick={() => onSelectTab('dashboard')}>Dashboard</button>
            <button onClick={() => onSelectTab('map')}>Flood Map</button>
            <button onClick={() => onSelectTab('predict')}>Predict Risk</button>
            <button onClick={() => onSelectTab('reports')}>Community Reports</button>
            <button onClick={() => onSelectTab('about')}>About</button>
          </div>
        </div>

        <div className="footer-right">
          <span className="footer-heading">Environment</span>
          <div className="footer-env-meta">
            <span>Phase: <strong>Phase 1 Foundation</strong></span>
            <span>API Host: <code>{API_BASE_URL}</code></span>
            <span>Local Shell: Windows PowerShell</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {currentYear} JalaRakshak AI Prototype • Built for urban disaster risk reduction</span>
        <span className="footer-pill">Phase 1 Complete</span>
      </div>
    </footer>
  );
}
