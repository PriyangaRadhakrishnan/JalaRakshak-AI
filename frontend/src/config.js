/**
 * JalaRakshak AI - Frontend Configuration
 * Manages runtime and build-time configuration variables.
 */

// Configurable local API URL.
// Defaults to http://127.0.0.1:5000 if VITE_API_BASE_URL is not set.
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000'
).replace(/\/$/, '');

export const APP_CONFIG = {
  appName: 'JalaRakshak AI',
  tagline: 'Local Urban Flood-Risk Prediction & Community Alert System',
  phase: 'Phase 4 - Complete Integrated System',
  apiHealthEndpoint: `${API_BASE_URL}/api/health`,
  refreshIntervalMs: 30000,
  defaultMapCenter: [13.0827, 80.2707], // Central urban basin (Chennai coordinates demo)
  defaultMapZoom: 12,
};
