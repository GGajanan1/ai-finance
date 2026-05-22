import { useState, useEffect, useCallback } from 'react';
import { fetchMacroData } from '../api/macro';

const DEFAULT_COUNTRIES  = ['IND', 'USA', 'CHN'];
const DEFAULT_INDICATORS = ['NY.GDP.MKTP.KD.ZG', 'FP.CPI.TOTL.ZG'];

export function useMacro() {
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [countries,  setCountries]  = useState(DEFAULT_COUNTRIES);
  const [indicators, setIndicators] = useState(DEFAULT_INDICATORS);

  // Persist user preferences to localStorage
  useEffect(() => {
    const c = localStorage.getItem('macro_countries');
    const i = localStorage.getItem('macro_indicators');
    if (c) setCountries(JSON.parse(c));
    if (i) setIndicators(JSON.parse(i));
  }, []);

  const load = useCallback((currentCountries, currentIndicators, bust = false) => {
    if (!currentCountries.length || !currentIndicators.length) return;
    setLoading(true);
    fetchMacroData(currentCountries, currentIndicators, bust)
      .then((res) => { setData(res);  setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    load(countries, indicators);
  }, [countries, indicators, load]);

  const addCountry = (code) => {
    const updated = [...countries, code];
    setCountries(updated);
    localStorage.setItem('macro_countries', JSON.stringify(updated));
    load(updated, indicators, true);
  };

  const removeCountry = (code) => {
    const updated = countries.filter((c) => c !== code);
    setCountries(updated);
    localStorage.setItem('macro_countries', JSON.stringify(updated));
    load(updated, indicators, true);
  };

  const addIndicator = (id) => {
    const updated = [...indicators, id];
    setIndicators(updated);
    localStorage.setItem('macro_indicators', JSON.stringify(updated));
    load(countries, updated, true);
  };

  const removeIndicator = (id) => {
    const updated = indicators.filter((i) => i !== id);
    setIndicators(updated);
    localStorage.setItem('macro_indicators', JSON.stringify(updated));
    load(countries, updated, true);
  };

  return {
    data, loading, countries, indicators,
    addCountry, removeCountry,
    addIndicator, removeIndicator,
  };
}
