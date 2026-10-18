/**
 * JalaRakshak AI - API Service Layer
 * Encapsulates backend communication, error handling, and health verification.
 */

import { API_BASE_URL } from '../config';

/**
 * Checks backend health status via GET /api/health
 * Returns structured health object with latency measurement.
 */
export async function checkBackendHealth() {
  const startTime = performance.now();
  const endpoint = `${API_BASE_URL}/api/health`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(5000)
    });

    const latencyMs = Math.round(performance.now() - startTime);

    if (!response.ok) {
      return {
        ok: false,
        status: 'error',
        statusCode: response.status,
        error: `HTTP Error ${response.status}: ${response.statusText}`,
        latencyMs,
        endpoint,
        data: null,
      };
    }

    const data = await response.json();
    return {
      ok: true,
      status: 'healthy',
      statusCode: response.status,
      latencyMs,
      endpoint,
      data,
    };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - startTime);
    return {
      ok: false,
      status: 'offline',
      statusCode: 0,
      error: err.name === 'TimeoutError'
        ? 'Request timed out after 5000ms'
        : (err.message || 'Unable to connect to backend service'),
      latencyMs,
      endpoint,
      data: null,
    };
  }
}

/**
 * Fetches model evaluation metrics and feature specifications from GET /api/metrics
 */
export async function fetchModelMetrics() {
  const endpoint = `${API_BASE_URL}/api/metrics`;
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(6000),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `HTTP ${response.status}: Failed to load metrics`);
  }

  return response.json();
}

/**
 * Retrieves community waterlogging reports from GET /api/reports
 * Supports optional severity filter and limit.
 */
export async function fetchReports({ severity, limit = 50 } = {}) {
  const url = new URL(`${API_BASE_URL}/api/reports`);
  if (severity && severity !== 'all') {
    url.searchParams.set('severity', severity);
  }
  if (limit) {
    url.searchParams.set('limit', String(limit));
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(6000),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `HTTP ${response.status}: Failed to retrieve reports`);
  }

  return response.json();
}

/**
 * Submits a new citizen flood / waterlogging report to POST /api/reports
 */
export async function submitReport(reportData) {
  const endpoint = `${API_BASE_URL}/api/reports`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(reportData),
    signal: AbortSignal.timeout(8000),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.errors
      ? data.errors.join(' ')
      : (data.message || `HTTP ${response.status}: Submission rejected`);
    const error = new Error(errorMsg);
    error.details = data;
    throw error;
  }

  return data;
}

/**
 * Runs Random Forest inference via POST /api/predict
 */
export async function predictFloodRisk(inputFeatures) {
  const endpoint = `${API_BASE_URL}/api/predict`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(inputFeatures),
    signal: AbortSignal.timeout(8000),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.errors
      ? data.errors.join(' ')
      : (data.message || `HTTP ${response.status}: Model inference failed`);
    const error = new Error(errorMsg);
    error.details = data;
    throw error;
  }

  return data;
}
