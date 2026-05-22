import { useState, useCallback } from 'react';
import { fetchChartData } from '../api/chat';
import { fetchAgentAnalysis } from '../api/equity';

export function useChart(initialTicker = 'AAPL', initialPeriod = '1W') {
  const [ticker,        setTicker]        = useState(initialTicker);
  const [period,        setPeriod]        = useState(initialPeriod);
  const [chartData,     setChartData]     = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [agentAnalysis, setAgentAnalysis] = useState('');
  const [agentLoading,  setAgentLoading]  = useState(false);

  const loadChart = useCallback(async (sym, per) => {
    setLoading(true);
    try {
      const data = await fetchChartData(sym, per);
      setChartData(data);
    } catch (e) {
      console.error('Chart load error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAgent = useCallback(async (sym, per) => {
    setAgentLoading(true);
    setAgentAnalysis('');
    try {
      const data = await fetchAgentAnalysis(sym, per);
      setAgentAnalysis(data.analysis || '');
    } catch {
      setAgentAnalysis('Error fetching AI analysis.');
    } finally {
      setAgentLoading(false);
    }
  }, []);

  const analyze = useCallback((sym, per = period) => {
    const s = sym || ticker;
    const p = per || period;
    setTicker(s);
    setPeriod(p);
    loadChart(s, p);
    loadAgent(s, p);
  }, [ticker, period, loadChart, loadAgent]);

  const changePeriod = useCallback((per) => {
    setPeriod(per);
    loadChart(ticker, per);
    loadAgent(ticker, per);
  }, [ticker, loadChart, loadAgent]);

  return {
    ticker, setTicker, period, setPeriod,
    chartData, loading,
    agentAnalysis, agentLoading,
    analyze, changePeriod,
  };
}
