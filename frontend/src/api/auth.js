/** All fetch() calls to the Express auth backend (port 3001). */
const BASE = import.meta.env.VITE_AUTH_BASE_URL || 'http://localhost:3001';

const opts = (method, body) => ({
  method,
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  ...(body ? { body: JSON.stringify(body) } : {}),
});

export const fetchCurrentUser = () =>
  fetch(`${BASE}/api/user/me`, { credentials: 'include' }).then((r) =>
    r.ok ? r.json() : null
  );

export const logoutUser = () =>
  fetch(`${BASE}/auth/logout`, opts('POST')).then((r) => r.json());

export const updateSettings = (data) =>
  fetch(`${BASE}/api/user/settings`, opts('PATCH', data)).then((r) => r.json());

export const updateWatchlist = (watchlist) =>
  fetch(`${BASE}/api/user/watchlist`, opts('PATCH', { watchlist })).then((r) => r.json());

export const updateMacro = (macro) =>
  fetch(`${BASE}/api/user/macro`, opts('PATCH', macro)).then((r) => r.json());

export { BASE as AUTH_BASE };
