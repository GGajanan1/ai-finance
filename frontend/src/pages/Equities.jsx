import React, { useRef, useState } from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useChart } from '../hooks/useChart';
import { searchTicker } from '../api/equity';
import CandlestickChart from '../components/CandlestickChart';
import '../styles/pages/Equities.css';

const PERIODS  = ['1W', '1M', '3M', '6M', '1Y'];
const INDICATORS = [
  { key: 'sma20', label: 'SMA 20',  color: '#f59e0b' },
  { key: 'sma50', label: 'SMA 50',  color: '#8b5cf6' },
  { key: 'bb',    label: 'BB',      color: '#3b82f6' },
  { key: 'rsi',   label: 'RSI',     color: '#f97316' },
  { key: 'macd',  label: 'MACD',    color: '#38bdf8' },
];

const Equities = () => {
  const { ticker, setTicker, period, chartData, loading, agentAnalysis, agentLoading, analyze, changePeriod } = useChart('AAPL', '1W');

  const [activeInd,    setActiveInd]    = useState({ sma20: false, sma50: false, bb: false, rsi: false, macd: false });
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching,   setIsSearching]   = useState(false);
  const [showDropdown,  setShowDropdown]  = useState(false);
  const dropdownRef = useRef(null);

  const toggleInd = (key) => setActiveInd((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleInputChange = (e) => {
    const val = e.target.value.toUpperCase();
    setTicker(val);
    if (val.length > 1) {
      setIsSearching(true);
      searchTicker(val)
        .then((d) => { setSearchResults(d.results || []); setShowDropdown(true); setIsSearching(false); })
        .catch(() => setIsSearching(false));
    } else {
      setShowDropdown(false); setSearchResults([]);
    }
  };

  const handleSearch = (e) => { e.preventDefault(); setShowDropdown(false); analyze(ticker, period); };
  const selectTicker = (symbol) => { setShowDropdown(false); analyze(symbol, period); };

  return (
    <div className="animate-fade-in equities-page">
      <header className="page-header">
        <h1>Equities &amp; Assets</h1>
        <p>Candlestick charts, technical indicators &amp; AI-driven analysis</p>
      </header>

      {/* Search Panel */}
      <div className="glass-panel equities-search-panel" ref={dropdownRef}>
        <form onSubmit={handleSearch} className="equities-search-form">
          <div className="search-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text" value={ticker} onChange={handleInputChange}
              onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
              placeholder="Search ticker or company (e.g. Apple, RELIANCE.NS)"
              className="form-input form-input--search"
            />
            {isSearching && <Loader2 className="spinner search-spinner" size={18} />}
            {showDropdown && searchResults.length > 0 && (
              <div className="dropdown-menu">
                {searchResults.map((r, i) => (
                  <div key={i} className="dropdown-item" onClick={() => selectTicker(r.symbol)}>
                    <div>
                      <div className="dropdown-item__symbol">{r.symbol}</div>
                      <div className="dropdown-item__name">{r.shortname}</div>
                    </div>
                    <span className="badge neutral" style={{ fontSize: '0.75rem' }}>{r.exchange}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button type="submit" className="btn-primary">Analyze</button>
        </form>
      </div>

      {/* Split Panel */}
      <div className="equities-split">
        <div className="glass-panel equities-chart-panel">
          {/* Period selector + Indicator toggles */}
          <div className="equities-chart-controls">
            <div className="equities-period-tabs">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  className={`period-tab ${period === p ? 'period-tab--active' : ''}`}
                  onClick={() => changePeriod(p)}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="equities-ind-toggles">
              {INDICATORS.map(({ key, label, color }) => (
                <button
                  key={key}
                  className={`ind-toggle ${activeInd[key] ? 'ind-toggle--active' : ''}`}
                  style={activeInd[key] ? { borderColor: color, color } : {}}
                  onClick={() => toggleInd(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="equities-chart-empty equities-chart-empty--loading">
              <Loader2 className="spinner" size={28} /> Loading chart…
            </div>
          ) : chartData?.ohlcv?.length ? (
            <CandlestickChart
              ohlcv={chartData.ohlcv}
              indicators={chartData.indicators || {}}
              active={activeInd}
            />
          ) : (
            <div className="equities-chart-empty equities-chart-empty--error">No data available.</div>
          )}
        </div>

        <div className="glass-panel equities-analysis-panel">
          <h3><Sparkles size={20} /> Groq Agent Analyst <span style={{ fontSize:'0.75rem', color:'var(--text-muted)', fontWeight:400 }}>({period} view)</span></h3>
          <div className="equities-analysis-scroll">
            {agentLoading ? (
              <div className="agent-loading">
                <Loader2 className="spinner" size={32} style={{ color: 'var(--accent-primary)' }} />
                <p>Agent is analysing {ticker} over {period}…</p>
              </div>
            ) : agentAnalysis ? (
              <div className="markdown-body equities-analysis-body">
                <ReactMarkdown>{agentAnalysis}</ReactMarkdown>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Search a ticker to load analysis.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Equities;
