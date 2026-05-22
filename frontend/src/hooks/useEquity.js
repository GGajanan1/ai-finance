import { useState, useEffect, useCallback } from 'react';
import { fetchEquityData, fetchAgentAnalysis } from '../api/equity';

export function useEquity(initialTicker = 'AAPL') {
  const [ticker,        setTicker]        = useState(initialTicker);
  const [chartData,     setChartData]     = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [agentAnalysis, setAgentAnalysis] = useState('');
  const [agentLoading,  setAgentLoading]  = useState(false);

  const loadChart = useCallback((symbol) => {
    setLoading(true);
    fetchEquityData(symbol)
      .then((data) => {
        setChartData({
          labels: data.history.map((d) => d.date),
          datasets: [{
            label:           `${symbol} Price`,
            data:            data.history.map((d) => d.close),
            borderColor:     '#4f46e5',
            backgroundColor: 'rgba(79, 70, 229, 0.5)',
            tension:         0.4,
            pointRadius:     0,
            pointHitRadius:  10,
          }],
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const loadAgent = useCallback((symbol) => {
    setAgentLoading(true);
    setAgentAnalysis('');
    fetchAgentAnalysis(symbol)
      .then((data) => { setAgentAnalysis(data.analysis); setAgentLoading(false); })
      .catch(() => { setAgentAnalysis('Error fetching AI analysis.'); setAgentLoading(false); });
  }, []);

  const analyze = useCallback((symbol) => {
    setTicker(symbol);
    loadChart(symbol);
    loadAgent(symbol);
  }, [loadChart, loadAgent]);

  useEffect(() => {
    loadChart(ticker);
    loadAgent(ticker);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ticker, setTicker, chartData, loading, agentAnalysis, agentLoading, analyze };
}
