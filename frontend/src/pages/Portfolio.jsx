import React, { useState, useRef } from 'react';
import { Plus, X, RefreshCw, TrendingUp, TrendingDown, DollarSign, PieChart, Loader2, Search } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { usePortfolio } from '../hooks/usePortfolio';
import { searchTicker } from '../api/equity';
import '../styles/pages/Portfolio.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const PALETTE = ['#4f46e5','#06b6d4','#f59e0b','#10b981','#f43f5e','#8b5cf6','#ec4899','#14b8a6'];

const fmt = (n, dec = 2) => (n == null ? 'N/A' : Number(n).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }));
const pctColor = (v) => (v > 0 ? 'var(--success)' : v < 0 ? 'var(--danger)' : 'var(--text-muted)');

const Portfolio = () => {
  const { holdings, analysis, loading, saving, addHolding, removeHolding, refreshPrices } = usePortfolio();

  const [form,   setForm]   = useState({ ticker: '', shares: '', avgBuyPrice: '' });
  const [search, setSearch] = useState([]);
  const [showDD, setShowDD] = useState(false);
  const [searching, setSearching] = useState(false);
  const dropRef = useRef(null);

  const positions = analysis?.positions?.filter((p) => !p.error) ?? [];
  const totalVal  = analysis?.total_value      ?? 0;
  const totalCost = analysis?.total_cost       ?? 0;
  const totalGL   = analysis?.total_gain_loss  ?? 0;
  const totalGLPct= analysis?.total_gain_pct   ?? 0;

  // Ticker autocomplete
  const handleTickerChange = (e) => {
    const v = e.target.value.toUpperCase();
    setForm((f) => ({ ...f, ticker: v }));
    if (v.length > 1) {
      setSearching(true);
      searchTicker(v).then((d) => { setSearch(d.results || []); setShowDD(true); setSearching(false); });
    } else { setShowDD(false); }
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.ticker || !form.shares || !form.avgBuyPrice) return;
    addHolding({ ticker: form.ticker, shares: parseFloat(form.shares), avgBuyPrice: parseFloat(form.avgBuyPrice), name: '' });
    setForm({ ticker: '', shares: '', avgBuyPrice: '' });
    setShowDD(false);
  };

  const donutData = positions.length ? {
    labels:   positions.map((p) => p.ticker),
    datasets: [{ data: positions.map((p) => p.current_value), backgroundColor: PALETTE, borderWidth: 0 }],
  } : null;

  const donutOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: '#94a3b8', boxWidth: 12, padding: 12 } },
    },
    cutout: '68%',
  };

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1>Portfolio Tracker</h1>
        <p>Live P&amp;L, allocation, and performance across all your holdings</p>
      </header>

      {/* KPI Cards */}
      <div className="portfolio-kpi-grid">
        {[
          { label: 'Portfolio Value', value: `$${fmt(totalVal)}`, icon: <DollarSign size={22} />, cls: 'kpi-icon-box--accent' },
          { label: 'Total Cost',      value: `$${fmt(totalCost)}`, icon: <PieChart size={22} />,    cls: 'kpi-icon-box--neutral' },
          { label: 'Total P&L',       value: `${totalGL >= 0 ? '+' : ''}$${fmt(totalGL)}`, icon: totalGL >= 0 ? <TrendingUp size={22}/> : <TrendingDown size={22}/>, cls: totalGL >= 0 ? 'kpi-icon-box--success' : 'kpi-icon-box--danger' },
          { label: 'Return',          value: `${totalGLPct >= 0 ? '+' : ''}${fmt(totalGLPct)}%`, icon: <TrendingUp size={22} />, cls: totalGLPct >= 0 ? 'kpi-icon-box--success' : 'kpi-icon-box--danger' },
        ].map((k) => (
          <div key={k.label} className="glass-panel">
            <div className="kpi-card-row">
              <div><p className="kpi-card-label">{k.label}</p><h3 className="kpi-card-value">{k.value}</h3></div>
              <div className={`kpi-icon-box ${k.cls}`}>{k.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="portfolio-main-grid">
        {/* Holdings Table */}
        <div className="glass-panel portfolio-table-panel">
          <div className="portfolio-table-header">
            <h3>Holdings</h3>
            <button className="btn-secondary" onClick={refreshPrices} disabled={loading}>
              <RefreshCw size={15} className={loading ? 'spinner' : ''} /> Refresh
            </button>
          </div>

          {/* Add Holding Form */}
          <form onSubmit={handleAdd} className="portfolio-add-form" ref={dropRef}>
            <div style={{ position: 'relative', flex: 2 }}>
              <Search size={14} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
              <input value={form.ticker} onChange={handleTickerChange} placeholder="Ticker (e.g. AAPL)" className="form-input" style={{ paddingLeft: 32 }} />
              {searching && <Loader2 size={14} className="spinner" style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)' }}/>}
              {showDD && search.length > 0 && (
                <div className="dropdown-menu" style={{ top: '110%' }}>
                  {search.map((r, i) => (
                    <div key={i} className="dropdown-item" onClick={() => { setForm((f) => ({ ...f, ticker: r.symbol })); setShowDD(false); }}>
                      <span className="dropdown-item__symbol">{r.symbol}</span> — <span className="dropdown-item__name">{r.shortname}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <input value={form.shares}      onChange={(e) => setForm((f) => ({ ...f, shares:      e.target.value }))} placeholder="Shares"    type="number" min="0" step="any" className="form-input" style={{ flex: 1 }} />
            <input value={form.avgBuyPrice} onChange={(e) => setForm((f) => ({ ...f, avgBuyPrice: e.target.value }))} placeholder="Avg Price" type="number" min="0" step="any" className="form-input" style={{ flex: 1 }} />
            <button type="submit" className="btn-primary" style={{ padding: '10px 14px' }}><Plus size={16}/></button>
          </form>

          <div style={{ overflowX: 'auto' }}>
            <table className="watchlist-table portfolio-holdings-table">
              <thead>
                <tr>
                  {['Ticker','Name','Shares','Avg Price','Current Price','Value','P&L','P&L %','Day Chg',''].map((h) => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {loading && !positions.length ? (
                  <tr><td colSpan={10} style={{ textAlign:'center', padding:'32px 0', color:'var(--text-muted)' }}><Loader2 className="spinner" size={24}/></td></tr>
                ) : positions.length ? (
                  positions.map((p) => (
                    <tr key={p.ticker}>
                      <td style={{ fontWeight: 600 }}>{p.ticker}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{p.name || '—'}</td>
                      <td>{fmt(p.shares, 4)}</td>
                      <td>${fmt(p.avg_buy_price)}</td>
                      <td>${fmt(p.current_price)}</td>
                      <td style={{ fontWeight: 500 }}>${fmt(p.current_value)}</td>
                      <td style={{ color: pctColor(p.gain_loss) }}>{p.gain_loss >= 0 ? '+' : ''}${fmt(p.gain_loss)}</td>
                      <td style={{ color: pctColor(p.gain_loss_pct) }}>{p.gain_loss_pct >= 0 ? '+' : ''}{fmt(p.gain_loss_pct)}%</td>
                      <td style={{ color: pctColor(p.day_change_pct) }}>{p.day_change_pct != null ? `${p.day_change_pct >= 0 ? '+' : ''}${fmt(p.day_change_pct)}%` : '—'}</td>
                      <td><button className="watchlist-remove-btn" onClick={() => removeHolding(p.ticker)}><X size={16}/></button></td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={10} style={{ textAlign:'center', padding:'24px 0', color:'var(--text-muted)' }}>No holdings yet. Add one above.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {saving && <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginTop:8 }}>Saving…</p>}
        </div>

        {/* Allocation Chart */}
        {donutData && (
          <div className="glass-panel portfolio-donut-panel">
            <h3 style={{ marginBottom: 16 }}>Allocation</h3>
            <div style={{ height: 260, position: 'relative' }}>
              <Doughnut data={donutData} options={donutOpts} />
            </div>
            <div style={{ textAlign:'center', marginTop:16 }}>
              <p style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>by current market value</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
