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
      // Timeout after 5 seconds to prevent hanging requests
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
