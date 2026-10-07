const BASE = '/api/users';

// One place that turns non-2xx responses into thrown errors carrying the server's message.
async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return null;

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(body?.error || `Request failed (${res.status})`);
    err.details = body?.details;
    throw err;
  }
  return body;
}

export const getUsers = () => request(BASE);
export const getUser = (id) => request(`${BASE}/${id}`);
export const createUser = (data) => request(BASE, { method: 'POST', body: JSON.stringify(data) });
export const updateUser = (id, data) => request(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteUser = (id) => request(`${BASE}/${id}`, { method: 'DELETE' });
