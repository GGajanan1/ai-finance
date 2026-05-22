/** All fetch() calls for sentiment endpoints. */
const BASE = import.meta.env.VITE_API_BASE_URL;

export const fetchSentiment = (query, limit) =>
  fetch(`${BASE}/api/sentiment?query=${query}&limit=${limit}`).then((r) => r.json());

export const analyzeCustomText = (text) =>
  fetch(`${BASE}/api/sentiment/analyze-custom`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ text }),
  }).then((r) => r.json());
