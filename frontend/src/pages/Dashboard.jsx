import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Activity, DollarSign, Plus, X, Search, Loader2 } from 'lucide-react';
import '../styles/pages/Dashboard.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Dashboard = () => {
  const [macroData, setMacroData]       = useState(null);
  const [macroLoading, setMacroLoading] = useState(true);

  const [sentimentTicker, setSentimentTicker]   = useState('TSLA');
  const [sentimentData, setSentimentData]       = useState(null);
  const [sentimentLoading, setSentimentLoading] = useState(true);

  // Search autocomplete for sentiment
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching]     = useState(false);
  const [showDropdown, setShowDropdown]   = useState(false);
  const dropdownRef = useRef(null);

  const [watchlist, setWatchlist]       = useState([]);
  const [watchlistData, setWatchlistData] = useState({});
  const [newTicker, setNewTicker]       = useState('');

  const [settings, setSettings] = useState({ newsLimit: 5 });

  useEffect(() => {
    const savedSettings = localStorage.getItem('finance_settings');
    let currentSettings = { newsLimit: 5 };
    if (savedSettings) {
      currentSettings = { ...currentSettings, ...JSON.parse(savedSettings) };
      setSettings(currentSettings);
    }

    const savedDefault = currentSettings.defaultTicker || 'TSLA';
    setSentimentTicker(savedDefault);

    const savedWatchlist = localStorage.getItem('finance_watchlist');
    setWatchlist(savedWatchlist ? JSON.parse(savedWatchlist) : ['RELIANCE.NS', 'AAPL', 'BTC-USD']);

    fetch(`${API_BASE}/api/macro`)
      .then(r => r.json())
      .then(data => { setMacroData(data); setMacroLoading(false); })
      .catch(err => { console.error(err); setMacroLoading(false); });

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSentiment = (tickerToFetch) => {
    setSentimentLoading(true);
    fetch(`${API_BASE}/api/sentiment?query=${tickerToFetch}&limit=${settings.newsLimit}`)
      .then(r => r.json())
      .then(data => { setSentimentData(data); setSentimentLoading(false); })
      .catch(err => { console.error(err); setSentimentLoading(false); });
  };

  useEffect(() => {
    if (sentimentTicker) fetchSentiment(sentimentTicker);
  }, [sentimentTicker, settings.newsLimit]);

  const fetchWatchlistPrices = () => {
    watchlist.forEach(ticker => {
      fetch(`${API_BASE}/api/equity/${ticker}`)
        .then(r => r.json())
        .then(data => setWatchlistData(prev => ({ ...prev, [ticker]: data })))
        .catch(err => console.error('Failed to fetch', ticker, err));
    });
  };

  useEffect(() => {
    fetchWatchlistPrices();
    const interval = setInterval(fetchWatchlistPrices, 10000);
    return () => clearInterval(interval);
  }, [watchlist]);

  const addTicker = (e) => {
    e.preventDefault();
    if (newTicker && !watchlist.includes(newTicker.toUpperCase())) {
      const updated = [...watchlist, newTicker.toUpperCase()];
      setWatchlist(updated);
      localStorage.setItem('finance_watchlist', JSON.stringify(updated));
      setNewTicker('');
    }
  };

  const removeTicker = (tickerToRemove) => {
    const updated = watchlist.filter(t => t !== tickerToRemove);
    setWatchlist(updated);
    localStorage.setItem('finance_watchlist', JSON.stringify(updated));
  };

  const handleInputChange = (e) => {
    const val = e.target.value.toUpperCase();
    setSentimentTicker(val);

    if (val.length > 1) {
      setIsSearching(true);
      fetch(`${API_BASE}/api/search?query=${val}`)
        .then(res => res.json())
        .then(data => {
          setSearchResults(data.results || []);
          setShowDropdown(true);
          setIsSearching(false);
        })
        .catch(() => setIsSearching(false));
    } else {
      setShowDropdown(false);
      setSearchResults([]);
    }
  };

  const selectSentimentTicker = (symbol) => {
    setSentimentTicker(symbol);
    setShowDropdown(false);
  };

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1>Market Overview</h1>
        <p>Real-time institutional-grade analytics</p>
      </header>

      {/* KPI Cards */}
      <div className="dashboard-kpi-grid">
        <div className="glass-panel">
          <div className="kpi-card-row">
            <div>
              <p className="kpi-card-label">Yield Curve (10Y-2Y)</p>
              <h3 className="kpi-card-value">
                {macroLoading ? '...' : `${macroData?.yield_curve_spread}%`}
              </h3>
            </div>
            <div className="kpi-icon-box kpi-icon-box--success">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="glass-panel">
          <div className="kpi-card-row">
            <div>
              <p className="kpi-card-label">Inflation Rate</p>
              <h3 className="kpi-card-value">
                {macroLoading ? '...' : `${macroData?.inflation_rate}%`}
              </h3>
            </div>
            <div className="kpi-icon-box kpi-icon-box--danger">
              <Activity size={24} />
            </div>
          </div>
        </div>

        <div className="glass-panel">
          <div className="kpi-card-row">
            <div>
              <p className="kpi-card-label">Fed Funds Rate</p>
              <h3 className="kpi-card-value">
                {macroLoading ? '...' : `${macroData?.fed_funds_rate}%`}
              </h3>
            </div>
            <div className="kpi-icon-box kpi-icon-box--accent">
              <DollarSign size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-widget-grid">
        {/* FinBERT Sentiment Panel */}
        <div className="glass-panel" style={{ minHeight: '300px' }}>
          <div className="dashboard-sentiment-header">
            <h3>FinBERT Sentiment</h3>

            <div className="dashboard-search-wrapper" ref={dropdownRef}>
              <div className="search-wrapper">
                <Search className="search-icon search-icon--sm" size={14} />
                <input
                  type="text"
                  value={sentimentTicker}
                  onChange={handleInputChange}
                  onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
                  placeholder="Search Ticker"
                  className="form-input form-input--search-sm"
                />
                {isSearching && (
                  <Loader2 className="spinner search-spinner search-spinner--sm" size={14} />
                )}
              </div>

              {showDropdown && searchResults.length > 0 && (
                <div className="dropdown-menu dropdown-menu--sm">
                  {searchResults.map((res, idx) => (
                    <div
                      key={idx}
                      className="dropdown-item dropdown-item--sm"
                      onClick={() => selectSentimentTicker(res.symbol)}
                    >
                      <span className="dropdown-item__symbol">{res.symbol}</span>
                      {' - '}
                      <span className="dropdown-item__name">{res.shortname}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {sentimentLoading ? (
            <p style={{ color: 'var(--text-muted)' }}>Analyzing latest headlines...</p>
          ) : sentimentData?.articles?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {sentimentData.articles.map((article, idx) => (
                <div
                  key={idx}
                  className={`article-card article-card--lg article-card--${article.label}`}
                >
                  <p className="article-card__headline">{article.headline}</p>
                  <div className="article-card__meta">
                    <span>Source: yfinance</span>
                    <span className={`badge ${article.label}`}>
                      {article.label.toUpperCase()} ({article.score.toFixed(2)})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No sentiment data available for {sentimentTicker}.</p>
          )}
        </div>

        {/* Watchlist Panel */}
        <div className="glass-panel" style={{ minHeight: '300px' }}>
          <div className="dashboard-watchlist-header">
            <h3>
              Active Watchlist
              <span className="live-badge">● Live</span>
            </h3>
            <form onSubmit={addTicker} className="watchlist-add-form">
              <input
                type="text"
                value={newTicker}
                onChange={(e) => setNewTicker(e.target.value)}
                placeholder="Add Ticker"
                className="form-input form-input--sm"
              />
              <button type="submit" className="btn-primary" style={{ padding: '6px 12px', borderRadius: '6px' }}>
                <Plus size={16} />
              </button>
            </form>
          </div>

          <table className="watchlist-table">
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.map(ticker => {
                const data = watchlistData[ticker];
                return (
                  <tr key={ticker}>
                    <td>{ticker}</td>
                    <td className="watchlist-price">
                      {data
                        ? `$${data.current_price.toFixed(2)}`
                        : <Loader2 size={14} className="spinner" color="var(--text-muted)" />}
                    </td>
                    <td>
                      <button className="watchlist-remove-btn" onClick={() => removeTicker(ticker)}>
                        <X size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {watchlist.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    Watchlist is empty
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
