import React, { useState } from 'react';
import { StatusBadge, PhasePlaceholderBanner } from '../components/StatusBadge';
import {
  IconMap,
  IconAlertTriangle,
  IconInfo,
  IconLock
} from '../components/Icons';

export function FloodMapView() {
  const [selectedLayer, setSelectedLayer] = useState('inundation');

  const mockZones = [
    { id: 'Z1', name: 'Zone 1 - North Riverbank Catchment', elevation: '14.2m', status: 'Low Risk', depth: '0 - 5 cm', color: 'green' },
    { id: 'Z2', name: 'Zone 2 - Downtown Metro Underpass', elevation: '8.4m', status: 'Moderate Warning', depth: '15 - 30 cm', color: 'amber' },
    { id: 'Z3', name: 'Zone 3 - East Industrial Sluice Basin', elevation: '9.8m', status: 'Low Risk', depth: '2 - 8 cm', color: 'green' },
    { id: 'Z4', name: 'Zone 4 - Southern Creek & Estuary', elevation: '6.1m', status: 'Elevated Advisory', depth: '25 - 45 cm', color: 'orange' },
    { id: 'Z5', name: 'Zone 5 - Old City Storm Network', elevation: '11.5m', status: 'Low Risk', depth: '0 - 2 cm', color: 'green' },
  ];

  return (
    <div className="view-container">
      {/* Development Banner */}
      <PhasePlaceholderBanner
        title="GIS Urban Inundation Map (Phase 2 Preview)"
        description="The spatial map interface below illustrates the target visualization layout. Full Leaflet / MapLibre raster tiles, Digital Elevation Model (DEM) overlays, and live drainage telemetry will be connected in Phase 2."
        plannedPhase="Phase 2"
      />

      <div className="map-view-layout">
        {/* Map Visualization Container */}
        <div className="map-canvas-card">
          <div className="map-canvas-header">
            <div className="map-title-row">
              <IconMap className="icon-blue" size={20} />
              <span className="map-title">Local Watershed & Inundation Simulation Canvas</span>
            </div>
            <div className="map-layer-toggles">
              <button
                className={`layer-btn ${selectedLayer === 'inundation' ? 'active' : ''}`}
                onClick={() => setSelectedLayer('inundation')}
              >
                Inundation Extent
              </button>
              <button
                className={`layer-btn ${selectedLayer === 'catchments' ? 'active' : ''}`}
                onClick={() => setSelectedLayer('catchments')}
              >
                Catchment Basins
              </button>
              <button
                className={`layer-btn ${selectedLayer === 'elevation' ? 'active' : ''}`}
                onClick={() => setSelectedLayer('elevation')}
              >
                Elevation DEM
              </button>
            </div>
          </div>

          {/* Styled GIS Canvas Mockup */}
          <div className="map-canvas-viewport">
            <div className="gis-grid-background">
              {/* Simulated River / Waterway */}
              <svg className="gis-vector-overlay" viewBox="0 0 800 500" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity="0.8" />
                  </linearGradient>
                  <linearGradient id="floodRiskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.5" />
                  </linearGradient>
                </defs>

                {/* River line */}
                <path
                  d="M0,220 C200,180 320,290 500,240 C650,200 720,270 800,260"
                  stroke="url(#waterGrad)"
                  strokeWidth="24"
                  fill="none"
                  strokeLinecap="round"
                />

                {/* Tributary */}
                <path
                  d="M260,0 C270,120 300,160 360,230"
                  stroke="#38bdf8"
                  strokeWidth="10"
                  fill="none"
                  strokeOpacity="0.6"
                />

                {/* Simulated Inundation Hazard Polygon */}
                <path
                  d="M440,210 C520,180 610,190 640,250 C630,310 540,320 460,280 Z"
                  fill="url(#floodRiskGrad)"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              </svg>

              {/* Water Level Gauge Pins (Mock) */}
              <div className="gauge-pin" style={{ top: '42%', left: '32%' }}>
                <span className="gauge-dot"></span>
                <span className="gauge-label">Gauge #1 • 2.1m</span>
              </div>
              <div className="gauge-pin pin-warning" style={{ top: '48%', left: '62%' }}>
                <span className="gauge-dot dot-warn"></span>
                <span className="gauge-label">Zone 4 Creek • 4.8m ⚠️</span>
              </div>
              <div className="gauge-pin" style={{ top: '25%', left: '45%' }}>
                <span className="gauge-dot"></span>
                <span className="gauge-label">Sluice Gate 3 • Normal</span>
              </div>

              {/* Watermark / Not implemented overlay */}
              <div className="gis-watermark">
                <div className="watermark-pill">
                  <IconLock size={16} />
                  <span>Phase 2 Engine: Leaflet / OpenStreetMap GIS integration in development</span>
                </div>
              </div>
            </div>

            {/* Map Legend */}
            <div className="map-legend">
              <span className="legend-title">Simulated Inundation Depth</span>
              <div className="legend-items">
                <div className="legend-item"><span className="legend-color c-low"></span> 0 - 15 cm (Minor)</div>
                <div className="legend-item"><span className="legend-color c-med"></span> 15 - 30 cm (Moderate)</div>
                <div className="legend-item"><span className="legend-color c-high"></span> 30 - 60 cm (Severe)</div>
                <div className="legend-item"><span className="legend-color c-extreme"></span> &gt; 60 cm (Critical)</div>
              </div>
            </div>
          </div>

          <div className="map-toolbar-footer">
            <span className="toolbar-hint">
              <IconInfo size={14} />
              Coordinates centered on prototype municipal jurisdiction (13.0827° N, 80.2707° E)
            </span>
            <span className="proto-tag">PROTOTYPE WIREFRAME</span>
          </div>
        </div>

        {/* Sidebar: Catchment Risk Breakdown */}
        <div className="map-sidebar">
          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <h4 className="sidebar-title">Catchment Risk Matrix</h4>
              <StatusBadge type="planned" phase="Phase 2" text="Mock Data" />
            </div>
            <p className="sidebar-desc">
              Hydrological zones targeted for real-time sensor integration and localized runoff modeling.
            </p>

            <div className="zone-list">
              {mockZones.map((zone) => (
                <div key={zone.id} className="zone-item">
                  <div className="zone-main">
                    <span className="zone-name">{zone.name}</span>
                    <span className={`zone-status-badge badge-${zone.color}`}>
                      {zone.status}
                    </span>
                  </div>
                  <div className="zone-metrics">
                    <span>Base Elevation: <strong>{zone.elevation}</strong></span>
                    <span>Est. Depth: <strong>{zone.depth}</strong></span>
                  </div>
                </div>
              ))}
            </div>

            <div className="sidebar-notice">
              <IconAlertTriangle size={16} />
              <span>
                Risk thresholds will be dynamically driven by the Python ML predictor in Phase 2.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
