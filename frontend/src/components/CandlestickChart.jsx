import React, { useEffect, useRef } from 'react';
import { createChart, CrosshairMode, CandlestickSeries, HistogramSeries, LineSeries } from 'lightweight-charts';

const CHART_THEME = {
  layout:     { background: { color: 'transparent' }, textColor: '#94a3b8' },
  grid:       { vertLines: { color: 'rgba(255,255,255,0.04)' }, horzLines: { color: 'rgba(255,255,255,0.04)' } },
  crosshair:  { mode: CrosshairMode.Normal },
  rightPriceScale: { borderColor: 'rgba(255,255,255,0.08)' },
  timeScale:  { borderColor: 'rgba(255,255,255,0.08)', timeVisible: true, secondsVisible: false },
};

/**
 * CandlestickChart — TradingView lightweight-charts wrapper.
 *
 * Props:
 *   ohlcv        [{time(unix), open, high, low, close, volume}]
 *   indicators   {sma20, sma50, bb, rsi, macd}   — from /api/equity/{ticker}/chart
 *   active       {sma20, sma50, bb, rsi, macd}   — boolean toggles
 */
const CandlestickChart = ({ ohlcv = [], indicators = {}, active = {} }) => {
  const mainRef = useRef(null);
  const rsiRef  = useRef(null);
  const macdRef = useRef(null);

  const cleanData = (data) => {
    if (!data || !data.length) return [];
    return [...data]
      .sort((a, b) => a.time - b.time)
      .filter((v, i, a) => i === 0 || v.time !== a[i - 1].time);
  };

  // ── Main chart (candlestick + overlays + volume) ───────────────────────────
  useEffect(() => {
    if (!ohlcv.length || !mainRef.current) return;

    const container = mainRef.current;
    const chart = createChart(container, {
      ...CHART_THEME,
      width:  container.clientWidth,
      height: 400,
    });

    // Deduplicate and sort ohlcv
    const cleanOhlcv = cleanData(ohlcv);

    // Candlestick series
    const candles = chart.addSeries(CandlestickSeries, {
      upColor:       '#26a69a', downColor: '#ef5350',
      borderVisible: false,
      wickUpColor:   '#26a69a', wickDownColor: '#ef5350',
    });
    candles.setData(cleanOhlcv);

    // Volume histogram
    const vol = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'vol',
      color: '#26a69a55',
    });
    chart.priceScale('vol').applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } });
    vol.setData(
      cleanOhlcv.map((d) => ({
        time:  d.time,
        value: d.volume,
        color: d.close >= d.open ? 'rgba(38,166,154,0.3)' : 'rgba(239,83,80,0.3)',
      }))
    );

    // SMA 20
    if (active.sma20 && indicators.sma20?.length) {
      const s = chart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 1, priceLineVisible: false });
      s.setData(cleanData(indicators.sma20));
    }

    // SMA 50
    if (active.sma50 && indicators.sma50?.length) {
      const s = chart.addSeries(LineSeries, { color: '#8b5cf6', lineWidth: 1, priceLineVisible: false });
      s.setData(cleanData(indicators.sma50));
    }

    // Bollinger Bands
    if (active.bb && indicators.bb?.length) {
      const opts = { lineWidth: 1, priceLineVisible: false };
      const upper = chart.addSeries(LineSeries, { ...opts, color: 'rgba(59,130,246,0.7)' });
      const mid   = chart.addSeries(LineSeries, { ...opts, color: 'rgba(59,130,246,0.35)', lineStyle: 2 });
      const lower = chart.addSeries(LineSeries, { ...opts, color: 'rgba(59,130,246,0.7)' });
      
      const cleanBb = cleanData(indicators.bb);
      upper.setData(cleanBb.map((d) => ({ time: d.time, value: d.upper })));
      mid.setData(  cleanBb.map((d) => ({ time: d.time, value: d.mid   })));
      lower.setData(cleanBb.map((d) => ({ time: d.time, value: d.lower })));
    }

    chart.timeScale().fitContent();

    // Responsive resize
    const ro = new ResizeObserver(() => chart.applyOptions({ width: container.clientWidth }));
    ro.observe(container);

    return () => { ro.disconnect(); chart.remove(); };
  }, [ohlcv, indicators, active.sma20, active.sma50, active.bb]);

  // ── RSI sub-chart ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!active.rsi || !indicators.rsi?.length || !rsiRef.current) return;

    const container = rsiRef.current;
    const chart = createChart(container, {
      ...CHART_THEME,
      width:  container.clientWidth,
      height: 110,
    });

    const rsiLine = chart.addSeries(LineSeries, { color: '#f97316', lineWidth: 1, priceLineVisible: false });
    const cleanRsi = cleanData(indicators.rsi);
    rsiLine.setData(cleanRsi);

    const times = cleanRsi.map((d) => d.time);
    const ob = chart.addSeries(LineSeries, { color: 'rgba(239,68,68,0.45)', lineWidth: 1, lineStyle: 2, priceLineVisible: false });
    const os = chart.addSeries(LineSeries, { color: 'rgba(34,197,94,0.45)', lineWidth: 1, lineStyle: 2, priceLineVisible: false });
    ob.setData(times.map((t) => ({ time: t, value: 70 })));
    os.setData(times.map((t) => ({ time: t, value: 30 })));

    chart.priceScale('right').applyOptions({ scaleMargins: { top: 0.1, bottom: 0.1 } });
    chart.timeScale().fitContent();

    const ro = new ResizeObserver(() => chart.applyOptions({ width: container.clientWidth }));
    ro.observe(container);

    return () => { ro.disconnect(); chart.remove(); };
  }, [active.rsi, indicators.rsi]);

  // ── MACD sub-chart ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!active.macd || !indicators.macd?.length || !macdRef.current) return;

    const container = macdRef.current;
    const chart = createChart(container, {
      ...CHART_THEME,
      width:  container.clientWidth,
      height: 110,
    });

    const macdLine   = chart.addSeries(LineSeries, { color: '#38bdf8', lineWidth: 1, priceLineVisible: false });
    const sigLine    = chart.addSeries(LineSeries, { color: '#fb7185', lineWidth: 1, priceLineVisible: false });
    const histSeries = chart.addSeries(HistogramSeries, { priceLineVisible: false });

    const cleanMacd = cleanData(indicators.macd);
    macdLine.setData(cleanMacd.map(  (d) => ({ time: d.time, value: d.macd   })));
    sigLine.setData(cleanMacd.map(   (d) => ({ time: d.time, value: d.signal })));
    histSeries.setData(cleanMacd.map((d) => ({ time: d.time, value: d.hist, color: d.color })));

    chart.timeScale().fitContent();

    const ro = new ResizeObserver(() => chart.applyOptions({ width: container.clientWidth }));
    ro.observe(container);

    return () => { ro.disconnect(); chart.remove(); };
  }, [active.macd, indicators.macd]);

  return (
    <div>
      <div ref={mainRef} style={{ width: '100%' }} />
      {active.rsi && (
        <div style={{ marginTop: 8 }}>
          <span style={{ fontSize: '0.72rem', color: '#f97316', marginLeft: 8 }}>RSI (14)</span>
          <div ref={rsiRef} style={{ width: '100%' }} />
        </div>
      )}
      {active.macd && (
        <div style={{ marginTop: 8 }}>
          <span style={{ fontSize: '0.72rem', color: '#38bdf8', marginLeft: 8 }}>
            MACD (12,26,9) — <span style={{ color: '#38bdf8' }}>MACD</span>{' '}
            <span style={{ color: '#fb7185' }}>Signal</span>
          </span>
          <div ref={macdRef} style={{ width: '100%' }} />
        </div>
      )}
    </div>
  );
};

export default CandlestickChart;
