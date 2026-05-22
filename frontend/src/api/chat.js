const BASE = import.meta.env.VITE_API_BASE_URL;
const AUTH = import.meta.env.VITE_AUTH_BASE_URL || 'http://localhost:3001';
const authOpts = (method, body) => ({
  method, credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  ...(body ? { body: JSON.stringify(body) } : {}),
});

/** Send a message to the Groq-powered chat endpoint. */
export const sendMessage = (message, history) =>
  fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  }).then((r) => r.json());

/** Load chat history from MongoDB. */
export const getChatHistory = () =>
  fetch(`${AUTH}/api/user/chat-history`, { credentials: 'include' }).then((r) => r.json());

/** Append new messages to MongoDB chat history. */
export const appendChatHistory = (messages) =>
  fetch(`${AUTH}/api/user/chat-history`, authOpts('POST', { messages })).then((r) => r.json());

/** Clear all chat history in MongoDB. */
export const clearChatHistory = () =>
  fetch(`${AUTH}/api/user/chat-history`, authOpts('DELETE')).then((r) => r.json());

/** Fetch OHLCV + indicators for a ticker and period. */
export const fetchChartData = (ticker, period = '1W') =>
  fetch(`${BASE}/api/equity/${ticker}/chart?period=${period}`).then((r) => r.json());
