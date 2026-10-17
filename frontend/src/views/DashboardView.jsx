import React from 'react';
import { StatusBadge } from '../components/StatusBadge';
import {
  IconShield,
  IconDroplet,
  IconMap,
  IconTrendingUp,
  IconUsers,
  IconCheckCircle,
  IconAlertTriangle,
  IconRefresh,
  IconTerminal,
  IconInfo
} from '../components/Icons';

export function DashboardView({ health, onRefreshHealth, isRefreshing, onNavigate }) {
  const isHealthy = health?.ok;

  return (
    <div className="view-container">
      {/* Hero Welcome Section */}
      <section className="dashboard-hero">
        <div className="hero-content">
          <div className="civic-badge-pill">
            <span className="pulsing-radar"></span>
            Urban Flood Resilience System • Prototype
          </div>
          <h1 className="hero-title">
            Local Urban Flood-Risk Prediction & Community Alert
          </h1>
          <p className="hero-description">
            JalaRakshak AI combines localized hydrology modeling, civic rainfall intelligence,
            and crowdsourced hazard validation to protect urban communities before severe inundations occur.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => onNavigate('predict')}>
              <IconTrendingUp size={18} />
              Simulate Risk (Preview)
            </button>
            <button className="btn btn-secondary" onClick={() => onNavigate('map')}>
              <IconMap size={18} />
              Open Inundation Map
            </button>
            <button className="btn btn-outline" onClick={onRefreshHealth} disabled={isRefreshing}>
              <IconRefresh size={16} className={isRefreshing ? 'spin' : ''} />
              {isRefreshing ? 'Pinging API...' : 'Ping Flask Health'}
            </button>
          </div>
        </div>
      </section>

      {/* Primary KPI & Health Status Row */}
      <section className="kpi-grid">
        {/* Backend Health Card */}
        <div className={`kpi-card ${isHealthy ? 'kpi-healthy' : 'kpi-warning'}`}>
          <div className="kpi-header">
            <span className="kpi-label">API Health Check</span>
            <StatusBadge type="active" text="GET /api/health" />
          </div>
          <div className="kpi-body">
            <div className="kpi-value-row">
              <span className={`health-indicator-circle ${isHealthy ? 'bg-green' : 'bg-red'}`}></span>
              <span className="kpi-main-stat">
                {isHealthy ? 'Backend Connected' : 'Backend Disconnected'}
              </span>
            </div>
            <p className="kpi-subtext">
              {isHealthy
                ? `Response in ${health.latencyMs}ms • Endpoint: ${health.endpoint}`
                : (health?.error || 'Unable to establish contact with Flask server')}
            </p>
          </div>
          <div className="kpi-footer">
            <div className="kpi-meta-item">
              <span className="meta-name">Status:</span>
              <span className="meta-val">{isHealthy ? `${health.statusCode} OK` : 'Offline'}</span>
            </div>
            <div className="kpi-meta-item">
              <span className="meta-name">Service:</span>
              <span className="meta-val">{health?.data?.service || 'Flask Server'}</span>
            </div>
          </div>
        </div>

        {/* Threat Level Placeholder */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Municipal Threat Level</span>
            <StatusBadge type="planned" phase="Phase 2" text="Sensor Stream" />
          </div>
          <div className="kpi-body">
            <div className="kpi-value-row">
              <IconShield className="icon-teal" size={28} />
              <span className="kpi-main-stat">Normal / Level 1</span>
            </div>
            <p className="kpi-subtext">
              Drainage capacity baseline optimal. No active flash flood alert issued in monitored zones.
            </p>
          </div>
          <div className="kpi-footer">
            <div className="kpi-meta-item">
              <span className="meta-name">Rainfall (24h):</span>
              <span className="meta-val">12.4 mm (Simulated)</span>
            </div>
            <div className="kpi-meta-item">
              <span className="meta-name">Soil Saturation:</span>
              <span className="meta-val">34% (Low)</span>
            </div>
          </div>
        </div>

        {/* Monitored Catchments Placeholder */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Monitored Basins</span>
            <StatusBadge type="planned" phase="Phase 2" text="GIS Layers" />
          </div>
          <div className="kpi-body">
            <div className="kpi-value-row">
              <IconDroplet className="icon-blue" size={28} />
              <span className="kpi-main-stat">14 Urban Catchments</span>
            </div>
            <p className="kpi-subtext">
              Sub-surface storm sewer networks & 8 primary sluice gates targeted for telemetry ingest.
            </p>
          </div>
          <div className="kpi-footer">
            <div className="kpi-meta-item">
              <span className="meta-name">Sluice Gates:</span>
              <span className="meta-val">8 Operational</span>
            </div>
            <div className="kpi-meta-item">
              <span className="meta-name">High Risk Pockets:</span>
              <span className="meta-val">3 Underpasses</span>
            </div>
          </div>
        </div>

        {/* Community Reports Placeholder */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Citizen Hazard Reports</span>
            <StatusBadge type="planned" phase="Phase 2" text="Crowdsourcing" />
          </div>
          <div className="kpi-body">
            <div className="kpi-value-row">
              <IconUsers className="icon-teal" size={28} />
              <span className="kpi-main-stat">0 Active Emergencies</span>
            </div>
            <p className="kpi-subtext">
              Citizen crowdsourcing module designed for ward-level waterlogging confirmation.
            </p>
          </div>
          <div className="kpi-footer">
            <div className="kpi-meta-item">
              <span className="meta-name">Verified Today:</span>
              <span className="meta-val">4 Reports</span>
            </div>
            <div className="kpi-meta-item">
              <span className="meta-name">Avg Dispatch:</span>
              <span className="meta-val">18 mins</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Phase 1 Readiness & Diagnostics */}
      <section className="dashboard-grid">
        {/* Backend Connectivity Diagnostics */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <div className="panel-title-group">
              <IconTerminal className="icon-blue" size={22} />
              <div>
                <h3 className="panel-title">Backend API Diagnostics</h3>
                <span className="panel-subtitle">Configurable local endpoint & health probe</span>
              </div>
            </div>
            <button
              className="btn btn-sm btn-outline"
              onClick={onRefreshHealth}
              disabled={isRefreshing}
            >
              <IconRefresh size={14} className={isRefreshing ? 'spin' : ''} />
              Probe Again
            </button>
          </div>

          <div className="panel-body">
            <div className="code-block-header">
              <span>GET {health?.endpoint || 'http://127.0.0.1:5000/api/health'}</span>
              <span className={`status-pill ${isHealthy ? 'status-pill-success' : 'status-pill-fail'}`}>
                {isHealthy ? `HTTP ${health.statusCode} HEALTHY` : 'CONNECTION FAILED'}
              </span>
            </div>
            <pre className="json-display">
              {health?.data
                ? JSON.stringify(health.data, null, 2)
                : JSON.stringify({
                    error: health?.error || 'No response received',
                    troubleshooting: [
                      'Ensure Flask backend is running on 127.0.0.1:5000',
                      'Check terminal for python backend/app.py output',
                      'Verify CORS_ORIGIN allows http://localhost:5173'
                    ]
                  }, null, 2)}
            </pre>

            <div className="api-config-info">
              <div className="config-item">
                <span className="config-label">Configured Base URL:</span>
                <code className="config-code">{health?.endpoint?.replace('/api/health', '') || 'http://127.0.0.1:5000'}</code>
              </div>
              <div className="config-item">
                <span className="config-label">Environment File:</span>
                <code className="config-code">frontend/.env (VITE_API_BASE_URL)</code>
              </div>
            </div>
          </div>
        </div>

        {/* Phase Roadmap Matrix */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <div className="panel-title-group">
              <IconShield className="icon-teal" size={22} />
              <div>
                <h3 className="panel-title">Implementation Matrix</h3>
                <span className="panel-subtitle">Milestones & Phase progression</span>
              </div>
            </div>
            <span className="milestone-badge">Phase 1 of 3</span>
          </div>

          <div className="panel-body">
            <div className="roadmap-checklist">
              {/* Phase 1 Item */}
              <div className="roadmap-item completed">
                <div className="roadmap-check">
                  <IconCheckCircle size={18} />
                </div>
                <div className="roadmap-content">
                  <div className="roadmap-title-row">
                    <strong>Phase 1: Project Foundation & Architecture</strong>
                    <StatusBadge type="active" text="Completed" />
                  </div>
                  <p>React + Vite frontend, Python + Flask backend, responsive civic dashboard, health check API, configurable proxy.</p>
                </div>
              </div>

              {/* Phase 2 Items */}
              <div className="roadmap-item pending">
                <div className="roadmap-check">
                  <IconAlertTriangle size={18} />
                </div>
                <div className="roadmap-content">
                  <div className="roadmap-title-row">
                    <strong>Phase 2: Hydrological ML & GIS Map Layers</strong>
                    <StatusBadge type="planned" phase="Phase 2" text="Planned Next" />
                  </div>
                  <p>Train lightweight runoff prediction classifier, integrate interactive GIS vector map tiles, rainfall telemetry ingest.</p>
                </div>
              </div>

              {/* Phase 3 Items */}
              <div className="roadmap-item pending">
                <div className="roadmap-check">
                  <IconAlertTriangle size={18} />
                </div>
                <div className="roadmap-content">
                  <div className="roadmap-title-row">
                    <strong>Phase 3: Crowdsourced Validation & Broadcast Alerts</strong>
                    <StatusBadge type="planned" phase="Phase 3" text="Upcoming" />
                  </div>
                  <p>Geolocated citizen reporting with photo proofs, automated SMS/WhatsApp alerts for vulnerable municipal wards.</p>
                </div>
              </div>
            </div>

            <div className="roadmap-callout">
              <IconInfo size={16} />
              <span>
                To view upcoming modules, navigate to <strong>Flood Map</strong>, <strong>Predict Risk</strong>, or <strong>Community Reports</strong>.
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
