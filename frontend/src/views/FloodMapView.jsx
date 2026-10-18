import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import {
  IconMap,
  IconAlertTriangle,
  IconInfo,
  IconCheckCircle,
  IconRefresh,
  IconUsers
} from '../components/Icons';
import { fetchReports } from '../services/api';
import { APP_CONFIG } from '../config';

// Component to dynamically pan/zoom map programmatically
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 13, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

// Custom DivIcon generator for Illustrative Risk Zones (DEMO DATA)
// Distinct Shape: Pulsing Octagon / Warning Shield with DEMO label
function createIllustrativeZoneIcon(color = 'amber') {
  const colorMap = {
    green: { bg: '#10b981', border: '#059669', shadow: 'rgba(16, 185, 129, 0.4)' },
    amber: { bg: '#f59e0b', border: '#d97706', shadow: 'rgba(245, 158, 11, 0.4)' },
    orange: { bg: '#f97316', border: '#ea580c', shadow: 'rgba(249, 115, 22, 0.4)' },
    red: { bg: '#ef4444', border: '#dc2626', shadow: 'rgba(239, 68, 68, 0.5)' },
  };
  const theme = colorMap[color] || colorMap.amber;

  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="illustrative-marker-wrapper" title="DEMO DATA - Illustrative Zone">
        <div class="illustrative-pulse-ring" style="border-color: ${theme.border};"></div>
        <div class="illustrative-marker-core" style="background-color: ${theme.bg}; border-color: ${theme.border}; box-shadow: 0 0 10px ${theme.shadow};">
          <span class="illustrative-icon">⚠️</span>
        </div>
        <span class="illustrative-badge">DEMO</span>
      </div>
    `,
    iconSize: [36, 42],
    iconAnchor: [18, 21],
    popupAnchor: [0, -22],
  });
}

// Custom DivIcon generator for Citizen Community Reports (SQLite Storage)
// Distinct Shape: Classic location pin with teardrop point and user silhouette
function createCommunityReportIcon(severity = 'Moderate') {
  const sevKey = (severity || 'moderate').toLowerCase();
  const colorMap = {
    low: { bg: '#0d9488', tip: '#0f766e' },
    moderate: { bg: '#d97706', tip: '#b45309' },
    high: { bg: '#ea580c', tip: '#c2410c' },
    critical: { bg: '#dc2626', tip: '#b91c1c' },
  };
  const theme = colorMap[sevKey] || colorMap.moderate;

  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="community-marker-wrapper" title="Citizen Incident Report">
        <div class="community-pin-body" style="background-color: ${theme.bg};">
          <span class="community-pin-icon">👥</span>
        </div>
        <div class="community-pin-tip" style="border-top-color: ${theme.tip};"></div>
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -38],
  });
}

export function FloodMapView({ reports: propReports, onRefreshReports, onSelectReport }) {
  const [reports, setReports] = useState(propReports || []);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [reportsError, setReportsError] = useState(null);

  // Layer Toggles
  const [showCommunityReports, setShowCommunityReports] = useState(true);
  const [showSampleRiskZones, setShowSampleRiskZones] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('all');

  // Map Center State
  const defaultCenter = APP_CONFIG.defaultMapCenter || [13.0827, 80.2707];
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(12);
  const [selectedItem, setSelectedItem] = useState(null);

  // Sample Illustrative Risk Zones (Strictly labelled as DEMO DATA)
  const sampleRiskZones = [
    {
      id: 'ZONE-DEMO-01',
      name: 'North Riverbank Catchment',
      category: 'Illustrative Hydrological Basin',
      source: 'Hydrological Simulation Model (DEMO DATA)',
      lat: 13.0950,
      lon: 80.2650,
      elevation: '14.2 m',
      status: 'Low Risk',
      depth: '0 - 5 cm',
      color: 'green',
      description: 'Well-drained upland alluvial basin adjacent to upstream tributary outfall.',
    },
    {
      id: 'ZONE-DEMO-02',
      name: 'Downtown Metro Underpass Culvert',
      category: 'Illustrative Underpass Catchment',
      source: 'Hydrological Simulation Model (DEMO DATA)',
      lat: 13.0836,
      lon: 80.2825,
      elevation: '4.8 m',
      status: 'Critical Alert',
      depth: '45 - 60 cm',
      color: 'red',
      description: 'Depressed transit corridor vulnerable to high impervious surface backflow.',
    },
    {
      id: 'ZONE-DEMO-03',
      name: 'East Industrial Sluice Basin',
      category: 'Illustrative Sluice Catchment',
      source: 'Hydrological Simulation Model (DEMO DATA)',
      lat: 13.0720,
      lon: 80.2580,
      elevation: '9.8 m',
      status: 'Moderate Advisory',
      depth: '15 - 25 cm',
      color: 'amber',
      description: 'Controlled floodgate drainage zone prone to silt accumulation during heavy downpours.',
    },
    {
      id: 'ZONE-DEMO-04',
      name: 'Southern Creek Estuary Outfall',
      category: 'Illustrative Coastal Catchment',
      source: 'Hydrological Simulation Model (DEMO DATA)',
      lat: 13.0600,
      lon: 80.2780,
      elevation: '3.1 m',
      status: 'High Warning',
      depth: '30 - 45 cm',
      color: 'orange',
      description: 'Low-elevation coastal creek confluence susceptible to downstream tidal resistance.',
    },
  ];

  // Sync with propReports if provided
  useEffect(() => {
    if (propReports && propReports.length > 0) {
      setReports(propReports);
    }
  }, [propReports]);

  // Sync when an individual report is selected from outside (e.g. from community feed)
  useEffect(() => {
    if (onSelectReport && onSelectReport.latitude !== null && onSelectReport.longitude !== null) {
      const lat = Number(onSelectReport.latitude);
      const lon = Number(onSelectReport.longitude);
      if (!isNaN(lat) && !isNaN(lon)) {
        setMapCenter([lat, lon]);
        setMapZoom(14);
        setSelectedItem(onSelectReport.id);
      }
    }
  }, [onSelectReport]);

  // Load community reports from backend SQLite
  const loadReports = async () => {
    setIsLoadingReports(true);
    setReportsError(null);
    try {
      const data = await fetchReports({ limit: 100 });
      if (data && Array.isArray(data.reports)) {
        setReports(data.reports);
      }
      if (onRefreshReports) {
        onRefreshReports();
      }
    } catch (err) {
      setReportsError(err.message || 'Failed to fetch community reports from SQLite');
    } finally {
      setIsLoadingReports(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // Filter reports that have coordinates
  const validReportsWithCoords = reports.filter(
    (r) =>
      r.latitude !== null &&
      r.longitude !== null &&
      !isNaN(Number(r.latitude)) &&
      !isNaN(Number(r.longitude))
  );

  const filteredCommunityReports = validReportsWithCoords.filter((r) => {
    if (severityFilter === 'all') return true;
    return (r.severity || '').toLowerCase() === severityFilter.toLowerCase();
  });

  const filteredRiskZones = sampleRiskZones.filter((z) => {
    if (severityFilter === 'all') return true;
    if (severityFilter === 'critical') return z.status.toLowerCase().includes('critical');
    if (severityFilter === 'high') return z.status.toLowerCase().includes('high');
    if (severityFilter === 'moderate') return z.status.toLowerCase().includes('moderate');
    if (severityFilter === 'low') return z.status.toLowerCase().includes('low');
    return true;
  });

  // Handler to focus map on an item
  const handleFocusItem = (item, isReport = false) => {
    const lat = isReport ? Number(item.latitude) : item.lat;
    const lon = isReport ? Number(item.longitude) : item.lon;
    setMapCenter([lat, lon]);
    setMapZoom(14);
    setSelectedItem(item.id);
  };

  return (
    <div className="view-container">
      {/* DEMO DATA & Illustrative Notice Banner */}
      <div className="demo-data-alert-banner" role="alert">
        <div className="alert-badge-col">
          <span className="demo-data-pill">DEMO DATA NOTICE</span>
        </div>
        <div className="alert-content-col">
          <strong>Interactive GIS Urban Inundation Map:</strong> Risk zone markers (circles with ⚠️) are strictly 
          <em> illustrative sample models</em> for testing catchment overlays. Markers with citizen icons (👥) 
          are crowdsourced community hazard reports. <u>Never imply a sample marker is a real flood location.</u>
        </div>
      </div>

      {reportsError && (
        <div className="error-banner" style={{ marginBottom: '1rem' }}>
          ⚠️ Could not load community reports: {reportsError}
        </div>
      )}

      <div className="map-view-layout">
        {/* Map Visualization Container */}
        <div className="map-canvas-card">
          <div className="map-canvas-header">
            <div className="map-title-row">
              <IconMap className="icon-blue" size={20} />
              <span className="map-title">Urban Inundation & Incident GIS Map</span>
            </div>

            {/* Filter and Layer Controls */}
            <div className="map-controls-row">
              <div className="map-layer-toggles">
                <button
                  type="button"
                  className={`layer-btn ${showCommunityReports ? 'active' : ''}`}
                  onClick={() => setShowCommunityReports(!showCommunityReports)}
                  title="Toggle crowdsourced citizen reports"
                >
                  <IconUsers size={14} />
                  <span>Citizen Reports ({filteredCommunityReports.length})</span>
                </button>
                <button
                  type="button"
                  className={`layer-btn ${showSampleRiskZones ? 'active' : ''}`}
                  onClick={() => setShowSampleRiskZones(!showSampleRiskZones)}
                  title="Toggle illustrative simulation risk zones"
                >
                  <IconAlertTriangle size={14} />
                  <span>Illustrative Zones (DEMO) ({filteredRiskZones.length})</span>
                </button>
              </div>

              <div className="map-filter-group">
                <label htmlFor="sev-filter" className="map-filter-label">Filter Severity:</label>
                <select
                  id="sev-filter"
                  className="map-filter-select"
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical Only</option>
                  <option value="high">High Warning</option>
                  <option value="moderate">Moderate</option>
                  <option value="low">Low Risk</option>
                </select>

                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => {
                    setMapCenter(defaultCenter);
                    setMapZoom(12);
                  }}
                  title="Reset Map to Basin Center"
                >
                  Reset View
                </button>

                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={loadReports}
                  disabled={isLoadingReports}
                  title="Refresh Reports"
                >
                  <IconRefresh size={14} className={isLoadingReports ? 'spin' : ''} />
                </button>
              </div>
            </div>
          </div>

          {/* Leaflet Map Canvas */}
          <div className="map-canvas-viewport leaflet-map-wrapper">
            <MapContainer
              center={defaultCenter}
              zoom={12}
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%' }}
            >
              <ChangeMapView center={mapCenter} zoom={mapZoom} />

              {/* Standard OpenStreetMap Tile Layer */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />

              {/* 1. Illustrative Sample Risk Zones (DEMO DATA ONLY) */}
              {showSampleRiskZones &&
                filteredRiskZones.map((zone) => (
                  <Marker
                    key={zone.id}
                    position={[zone.lat, zone.lon]}
                    icon={createIllustrativeZoneIcon(zone.color)}
                  >
                    <Popup className="custom-leaflet-popup">
                      <div className="popup-card popup-illustrative">
                        <div className="popup-header illustrative-header">
                          <span className="popup-tag-demo">DEMO DATA • ILLUSTRATIVE ONLY</span>
                          <h4 className="popup-title">{zone.name}</h4>
                        </div>
                        <div className="popup-body">
                          <div className="popup-row">
                            <span className="popup-label">Data Source:</span>
                            <span className="popup-val">{zone.source}</span>
                          </div>
                          <div className="popup-row">
                            <span className="popup-label">Category:</span>
                            <span className="popup-val">{zone.category}</span>
                          </div>
                          <div className="popup-row">
                            <span className="popup-label">Modeled Risk:</span>
                            <span className={`popup-risk-badge badge-${zone.color}`}>
                              {zone.status}
                            </span>
                          </div>
                          <div className="popup-row">
                            <span className="popup-label">Base Elevation:</span>
                            <span className="popup-val">{zone.elevation}</span>
                          </div>
                          <div className="popup-row">
                            <span className="popup-label">Simulated Depth:</span>
                            <span className="popup-val">{zone.depth}</span>
                          </div>
                          <p className="popup-notes">{zone.description}</p>
                          <div className="popup-disclaimer">
                            ⚠️ <strong>Disclaimer:</strong> This marker is an illustrative simulation test point. It is NOT a real-world flood location.
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}

              {/* 2. Crowdsourced Citizen Community Reports (from SQLite) */}
              {showCommunityReports &&
                filteredCommunityReports.map((report) => (
                  <Marker
                    key={report.id}
                    position={[Number(report.latitude), Number(report.longitude)]}
                    icon={createCommunityReportIcon(report.severity)}
                  >
                    <Popup className="custom-leaflet-popup">
                      <div className="popup-card popup-community">
                        <div className="popup-header community-header">
                          <div className="popup-meta-row">
                            <span className="popup-id">{report.id}</span>
                            <span className={`severity-badge sev-${(report.severity || 'moderate').toLowerCase()}`}>
                              {report.severity}
                            </span>
                          </div>
                          <h4 className="popup-title">{report.location_description}</h4>
                        </div>
                        <div className="popup-body">
                          <div className="popup-row">
                            <span className="popup-label">Source:</span>
                            <span className="popup-val">Community Citizen Report</span>
                          </div>
                          <div className="popup-row">
                            <span className="popup-label">Report Category:</span>
                            <span className="popup-val">Waterlogging / Hazard Incident</span>
                          </div>
                          <div className="popup-row">
                            <span className="popup-label">Reported At:</span>
                            <span className="popup-val">
                              {report.timestamp.includes('T')
                                ? report.timestamp.replace('T', ' ').substring(0, 16) + ' UTC'
                                : report.timestamp}
                            </span>
                          </div>
                          <div className="popup-row">
                            <span className="popup-label">Verification:</span>
                            <span className="popup-val verify-status">
                              {report.verification_status.replace('_', ' ').toUpperCase()}
                              {report.verification_status !== 'unverified' ? ' ✓' : ' (Pending)'}
                            </span>
                          </div>
                          {report.water_depth_cm !== null && (
                            <div className="popup-row">
                              <span className="popup-label">Estimated Depth:</span>
                              <span className="popup-val"><strong>{report.water_depth_cm} cm</strong></span>
                            </div>
                          )}
                          <p className="popup-notes">
                            <strong>Observations:</strong> {report.description}
                          </p>
                          {report.drain_blocked === 1 && (
                            <div className="popup-drain-alert">
                              ⚠️ Citizen reports storm drain / culvert is blocked with silt/trash.
                            </div>
                          )}
                          <div className="popup-footer-row">
                            <span className="popup-coords">
                              GPS: {Number(report.latitude).toFixed(4)}, {Number(report.longitude).toFixed(4)}
                            </span>
                            <span className="popup-upvotes">
                              <IconCheckCircle size={13} className="icon-green" />
                              {report.upvotes || 0} confirmations
                            </span>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>

            {/* Map Floating Legend */}
            <div className="map-legend">
              <span className="legend-title">Map Symbology</span>
              <div className="legend-items">
                <div className="legend-item">
                  <span className="symbol-preview pin-symbol">👥</span>
                  <span>Citizen Report (Pins by Severity)</span>
                </div>
                <div className="legend-item">
                  <span className="symbol-preview zone-symbol">⚠️</span>
                  <span>Illustrative Zone (DEMO DATA)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: '#dc2626' }}></span>
                  <span>Critical (&gt; 45 cm)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: '#ea580c' }}></span>
                  <span>High (30 - 45 cm)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: '#d97706' }}></span>
                  <span>Moderate (15 - 30 cm)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: '#0d9488' }}></span>
                  <span>Low (&lt; 15 cm)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Map Footer Bar */}
          <div className="map-toolbar-footer">
            <span className="toolbar-hint">
              <IconInfo size={14} />
              OpenStreetMap GIS Canvas • Centered on urban catchment (13.0827° N, 80.2707° E). Click any marker to view source, category, time, and verification.
            </span>
            <span className="proto-tag">DEMO DATA LABELED</span>
          </div>
        </div>

        {/* Sidebar: Markers & Incident Directory */}
        <div className="map-sidebar">
          {/* Community Reports Directory */}
          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <div className="sidebar-title-group">
                <IconUsers className="icon-teal" size={18} />
                <h4 className="sidebar-title">Citizen Incident Reports</h4>
              </div>
              <span className="count-pill">{filteredCommunityReports.length} Plotted</span>
            </div>

            <p className="sidebar-desc">
              Real hazard reports with valid coordinates. Click to center map:
            </p>

            <div className="zone-list">
              {filteredCommunityReports.length === 0 && (
                <div className="empty-sublist">
                  {reportsLoading ? 'Loading community reports...' : 'No citizen reports match current filter.'}
                </div>
              )}

              {filteredCommunityReports.map((report) => (
                <div
                  key={report.id}
                  className={`zone-item clickable ${selectedItem === report.id ? 'zone-selected' : ''}`}
                  onClick={() => handleFocusItem(report, true)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="zone-main">
                    <span className="zone-name">{report.location_description}</span>
                    <span className={`zone-status-badge badge-${(report.severity || 'moderate').toLowerCase()}`}>
                      {report.severity}
                    </span>
                  </div>
                  <div className="zone-metrics">
                    <span>GPS: <strong>{Number(report.latitude).toFixed(3)}, {Number(report.longitude).toFixed(3)}</strong></span>
                    <span>Status: <strong>{report.verification_status.replace('_', ' ')}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Illustrative Zones Directory (DEMO ONLY) */}
          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <div className="sidebar-title-group">
                <IconAlertTriangle className="icon-orange" size={18} />
                <h4 className="sidebar-title">Illustrative Risk Zones</h4>
              </div>
              <span className="count-pill demo-pill">DEMO DATA</span>
            </div>

            <p className="sidebar-desc">
              Hydrological simulation reference pockets. Illustrative benchmarks only:
            </p>

            <div className="zone-list">
              {filteredRiskZones.map((zone) => (
                <div
                  key={zone.id}
                  className={`zone-item clickable ${selectedItem === zone.id ? 'zone-selected' : ''}`}
                  onClick={() => handleFocusItem(zone, false)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="zone-main">
                    <span className="zone-name">{zone.name}</span>
                    <span className={`zone-status-badge badge-${zone.color}`}>
                      {zone.status}
                    </span>
                  </div>
                  <div className="zone-metrics">
                    <span>Elevation: <strong>{zone.elevation}</strong></span>
                    <span>Depth: <strong>{zone.depth}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
