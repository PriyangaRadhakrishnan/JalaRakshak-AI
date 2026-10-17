import React from 'react';
import { StatusBadge } from '../components/StatusBadge';
import {
  IconShield,
  IconDroplet,
  IconCheckCircle,
  IconAlertTriangle
} from '../components/Icons';

export function AboutView({ apiBaseUrl }) {
  return (
    <div className="view-container">
      {/* Hero Header */}
      <div className="about-hero">
        <div className="about-title-row">
          <div className="about-logo-badge">
            <IconShield size={32} className="icon-teal" />
          </div>
          <div>
            <h2 className="about-title">About JalaRakshak AI</h2>
            <p className="about-tagline">
              Civic-Tech Hydrology Intelligence & Local Community Early Warning System
            </p>
          </div>
        </div>
      </div>

      <div className="about-grid">
        {/* Mission & Problem Statement */}
        <div className="about-card">
          <div className="about-card-header">
            <IconDroplet className="icon-blue" size={20} />
            <h3 className="card-heading">Urban Resilience Mission</h3>
          </div>
          <div className="about-card-body">
            <p>
              Rapid urbanization, impervious surface growth, and extreme local precipitation events
              frequently overwhelm municipal stormwater drainage networks.
            </p>
            <p>
              <strong>JalaRakshak AI</strong> is designed as a localized, open civic-tech platform that
              empowers urban residents, disaster management volunteers, and municipal engineers with
              hyper-local flood risk predictions and community-validated waterlogging alerts.
            </p>
            <div className="values-list">
              <div className="val-item">
                <span className="val-bullet">✓</span>
                <span><strong>Zero Paid APIs:</strong> Built using pure open-source toolchains (React, Flask, Scikit-learn).</span>
              </div>
              <div className="val-item">
                <span className="val-bullet">✓</span>
                <span><strong>Community First:</strong> Marries algorithmic modeling with citizen ground verification.</span>
              </div>
              <div className="val-item">
                <span className="val-bullet">✓</span>
                <span><strong>Local Edge First:</strong> Runs locally on standard machines with minimal computational overhead.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Phase 1 Foundation Status */}
        <div className="about-card">
          <div className="about-card-header">
            <IconCheckCircle className="icon-green" size={20} />
            <h3 className="card-heading">Phase 1 Foundation Architecture</h3>
            <StatusBadge type="active" text="Phase 1 Active" />
          </div>
          <div className="about-card-body">
            <div className="stack-table">
              <div className="stack-row">
                <span className="stack-label">Frontend Framework</span>
                <span className="stack-val">React 19 + Vite (Fast HMR)</span>
              </div>
              <div className="stack-row">
                <span className="stack-label">Styling & Design</span>
                <span className="stack-val">Civic Blue/Teal Responsive CSS</span>
              </div>
              <div className="stack-row">
                <span className="stack-label">Backend Service</span>
                <span className="stack-val">Python 3.13 + Flask Microservice</span>
              </div>
              <div className="stack-row">
                <span className="stack-label">Cross-Origin Protocol</span>
                <span className="stack-val">Flask-CORS (Local API proxying)</span>
              </div>
              <div className="stack-row">
                <span className="stack-label">Health Telemetry</span>
                <span className="stack-val"><code>GET /api/health</code></span>
              </div>
              <div className="stack-row">
                <span className="stack-label">Configured API Base</span>
                <span className="stack-val"><code>{apiBaseUrl}</code></span>
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap & Progression */}
        <div className="about-card span-two">
          <div className="about-card-header">
            <IconAlertTriangle className="icon-teal" size={20} />
            <h3 className="card-heading">Project Roadmap & Engineering Phases</h3>
          </div>
          <div className="about-card-body">
            <div className="roadmap-columns">
              {/* Phase 1 Box */}
              <div className="roadmap-phase-box current">
                <div className="phase-header">
                  <span className="phase-badge phase-active-badge">CURRENT</span>
                  <h4>Phase 1: Foundation</h4>
                </div>
                <ul className="phase-bullets">
                  <li>Clean monorepo structure (<code>frontend/</code> and <code>backend/</code>)</li>
                  <li>Python virtual environment + <code>requirements.txt</code></li>
                  <li>Responsive civic-tech dashboard layout with 5 core sections</li>
                  <li>Flask health telemetry endpoint (<code>/api/health</code>)</li>
                  <li>Configurable local API connection with latency monitoring</li>
                  <li>PowerShell orchestration scripts and full test verification</li>
                </ul>
              </div>

              {/* Phase 2 Box */}
              <div className="roadmap-phase-box upcoming">
                <div className="phase-header">
                  <span className="phase-badge phase-planned-badge">NEXT</span>
                  <h4>Phase 2: Hydrology ML & GIS</h4>
                </div>
                <ul className="phase-bullets">
                  <li>Local Python runoff classification model (Scikit-learn)</li>
                  <li>Interactive Leaflet / OpenStreetMap watershed overlay</li>
                  <li>Simulated rainfall telemetry ingest and catchment gauge metrics</li>
                  <li>SQLite persistence for local hazard reports</li>
                  <li>Endpoints: <code>POST /api/predict</code> & <code>POST /api/reports</code></li>
                </ul>
              </div>

              {/* Phase 3 Box */}
              <div className="roadmap-phase-box upcoming">
                <div className="phase-header">
                  <span className="phase-badge phase-future-badge">FUTURE</span>
                  <h4>Phase 3: Alert Broadcasts</h4>
                </div>
                <ul className="phase-bullets">
                  <li>Automated civic broadcast alerts (SMS / Web Push notifications)</li>
                  <li>Municipal ward dashboard for drainage clearing crews</li>
                  <li>Offline-capable PWA support for low-connectivity storm scenarios</li>
                  <li>Citizen photo verification and community moderation pipeline</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
