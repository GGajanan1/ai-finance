import { useState, useCallback, useEffect } from 'react';
import { analyzePortfolio, getPortfolio, savePortfolio } from '../api/portfolio';
import { useAuth } from '../context/AuthContext';

export function usePortfolio() {
  const { user } = useAuth();
  const [holdings,  setHoldings]  = useState([]);   // raw [{ticker,shares,avgBuyPrice,name}]
  const [analysis,  setAnalysis]  = useState(null);  // enriched from ML service
  const [loading,   setLoading]   = useState(false);
  const [saving,    setSaving]    = useState(false);

  // Load from MongoDB on mount (if logged in)
  useEffect(() => {
    if (!user) return;
    getPortfolio()
      .then(({ portfolio }) => {
        if (portfolio?.length) {
          setHoldings(portfolio);
        }
      })
      .catch(() => {});
  }, [user]);

  // Re-analyse whenever holdings change
  const refresh = useCallback(async (current = holdings) => {
    if (!current.length) { setAnalysis(null); return; }
    setLoading(true);
    try {
      const data = await analyzePortfolio(
        current.map(({ ticker, shares, avgBuyPrice }) => ({
          ticker, shares, avg_buy_price: avgBuyPrice,
        }))
      );
      setAnalysis(data);
    } catch (e) {
      console.error('Portfolio analysis error', e);
    } finally {
      setLoading(false);
    }
  }, [holdings]);

  useEffect(() => { refresh(); }, [holdings.length]); // re-run when holdings count changes

  const persist = useCallback(async (updated) => {
    if (!user) return;
    setSaving(true);
    try { await savePortfolio(updated); } catch {} finally { setSaving(false); }
  }, [user]);

  const addHolding = (holding) => {
    const updated = [...holdings, { ...holding, addedAt: new Date().toISOString() }];
    setHoldings(updated);
    persist(updated);
  };

  const removeHolding = (ticker) => {
    const updated = holdings.filter((h) => h.ticker !== ticker);
    setHoldings(updated);
    persist(updated);
  };

  const refreshPrices = () => refresh(holdings);

  return { holdings, analysis, loading, saving, addHolding, removeHolding, refreshPrices };
}
