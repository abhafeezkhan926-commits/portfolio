/**
 * Thin fetch wrapper around the Express API.
 *
 * `VITE_API_BASE_URL` is optional: during local development the Vite dev server
 * proxies `/api` to the backend (see vite.config.js), and in production the
 * frontend is expected to be served from the same origin as the API.
 */

const RAW_BASE = import.meta.env?.VITE_API_BASE_URL || '';
const BASE = RAW_BASE.replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'error', details = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);

  let response;
  try {
    response = await fetch(`${BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { Accept: 'application/json', ...(options.headers || {}) },
    });
  } catch (error) {
    window.clearTimeout(timeout);
    if (error?.name === 'AbortError') {
      throw new ApiError('The request took too long. Please check your connection and try again.', {
        code: 'timeout',
      });
    }
    throw new ApiError('Could not reach the API server. Please try again in a moment.', {
      code: 'network',
    });
  } finally {
    window.clearTimeout(timeout);
  }

  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    throw new ApiError(
      body?.message || `The server responded with an error (${response.status}).`,
      {
        status: response.status,
        code: body?.error || 'http-error',
        details: body?.details ?? null,
      },
    );
  }

  if (!body) {
    throw new ApiError('The server returned an unexpected response.', { code: 'bad-response' });
  }

  return body;
}

export const api = {
  health: () => request('/api/health'),
  availability: (date) => request(`/api/bookings/availability?date=${encodeURIComponent(date)}`),
  availabilityRange: (from, to) => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const query = params.toString();
    return request(`/api/bookings/availability${query ? `?${query}` : ''}`);
  },
  createBooking: (payload) =>
    request('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  sendMessage: (payload) =>
    request('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
};

export default api;
