/** All fetch() calls to the macro endpoint. */
const BASE = import.meta.env.VITE_API_BASE_URL;

export const fetchMacroData = (countries, indicators, bust = false) => {
  const bustParam = bust ? `&bust=${Date.now()}` : '';
  return fetch(
    `${BASE}/api/macro?countries=${countries.join(',')}&indicators=${indicators.join(',')}${bustParam}`
  ).then((r) => r.json());
};
