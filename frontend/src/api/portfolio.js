const BASE     = import.meta.env.VITE_API_BASE_URL;
const AUTH     = import.meta.env.VITE_AUTH_BASE_URL || 'http://localhost:3001';
const authOpts = (method, body) => ({
  method, credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  ...(body ? { body: JSON.stringify(body) } : {}),
});

/** Fetch live P&L for an array of holdings from the ML service. */
export const analyzePortfolio = (holdings) =>
  fetch(`${BASE}/api/portfolio/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(holdings),
  }).then((r) => r.json());

/** Load saved holdings from MongoDB. */
export const getPortfolio = () =>
  fetch(`${AUTH}/api/user/portfolio`, { credentials: 'include' }).then((r) => r.json());

/** Persist full holdings array to MongoDB. */
export const savePortfolio = (portfolio) =>
  fetch(`${AUTH}/api/user/portfolio`, authOpts('PATCH', { portfolio })).then((r) => r.json());
