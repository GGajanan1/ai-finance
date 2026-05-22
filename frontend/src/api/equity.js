/** All fetch() calls to the ML service (port 8000). */
const BASE = import.meta.env.VITE_API_BASE_URL;

export const fetchEquityData = (ticker) =>
  fetch(`${BASE}/api/equity/${ticker}`).then((r) => r.json());

export const searchTicker = (query) =>
  fetch(`${BASE}/api/search?query=${query}`).then((r) => r.json());

export const fetchAgentAnalysis = (ticker, period = '1W') =>
  fetch(`${BASE}/api/agent/analyze/${ticker}?period=${period}`).then((r) => r.json());
