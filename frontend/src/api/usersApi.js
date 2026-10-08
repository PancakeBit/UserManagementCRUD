const BASE = '/api/users';
// Choices for "per page". The backend caps limit at 100.
export const PAGE_SIZES = [10, 25, 50, 100];
export const PAGE_SIZE = PAGE_SIZES[0];

// Carries the HTTP status and the server's per-field `details`, so callers can
// tell "username is already taken" (409) apart from "user not found" (404).
export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const UNREACHABLE = 'Cannot reach the server. Is the backend running?';

// One place that turns network failures and non-2xx responses into ApiErrors.
async function request(url, { body, ...options } = {}) {
  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    // An aborted request is not a failure: the caller cancelled it on purpose.
    if (err.name === 'AbortError') throw err;
    throw new ApiError(0, UNREACHABLE);
  }

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    // No JSON body on a 5xx means the dev proxy answered, not Express: the backend is down.
    const fallback = response.status >= 500 ? UNREACHABLE : `Request failed (${response.status})`;
    throw new ApiError(response.status, data?.error ?? fallback, data?.details);
  }
  return data;
}

// Resolves to { data, page, limit, total, totalPages }.
// `filters` holds any of q (any field), id (exact), name, username, email (contains).
export function listUsers({ filters = {}, page = 1, limit = PAGE_SIZE, signal } = {}) {
  const params = new URLSearchParams({ page, limit });
  // The backend rejects empty params (?name=), so only send the ones that have a value.
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  return request(`${BASE}?${params}`, { signal });
}

export const getUser = (id) => request(`${BASE}/${id}`);
export const createUser = (user) => request(BASE, { method: 'POST', body: user });
export const updateUser = (id, user) => request(`${BASE}/${id}`, { method: 'PUT', body: user });
export const deleteUser = (id) => request(`${BASE}/${id}`, { method: 'DELETE' });
