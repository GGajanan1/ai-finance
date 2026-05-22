import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, RefreshCw, Send, Loader2, Brain, Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import '../styles/pages/Sentiment.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/* ── ConfidenceBar ──────────────────────────────────────────── */
const ConfidenceBar = ({ confidence, label }) => {
  const color = label === 'positive' ? 'var(--success)' : label === 'negative' ? 'var(--danger)' : '#94a3b8';
  return (
    <div>
      <div className="confidence-bar__header">
        <span>FinBERT Confidence</span>
        <span style={{ fontWeight: '600', color }}>{confidence}%</span>
      </div>
      <div className="confidence-bar__track">
        <div className="confidence-bar__fill" style={{ width: `${confidence}%`, background: color }} />
      </div>
    </div>
  );
};

/* ── SentimentMeter ─────────────────────────────────────────── */
const SentimentMeter = ({ score }) => {
  const angle = Math.max(-90, Math.min(90, score * 90));
  const color = score > 0.2 ? 'var(--success)' : score < -0.2 ? 'var(--danger)' : '#f59e0b';
  const label = score > 0.2 ? 'Bullish' : score < -0.2 ? 'Bearish' : 'Neutral';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative', width: '120px', height: '60px', overflow: 'hidden' }}>
        <svg width="120" height="60" viewBox="0 0 120 60">
          <path d="M 10 60 A 50 50 0 0 1 110 60" stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="none" />
          <path d="M 60 60 A 50 50 0 0 1 110 60" stroke="rgba(16,185,129,0.4)" strokeWidth="10" fill="none" />
          <path d="M 10 60 A 50 50 0 0 1 60 60" stroke="rgba(239,68,68,0.4)" strokeWidth="10" fill="none" />
          <line
            x1="60" y1="60"
            x2={60 + 40 * Math.cos((angle - 90) * Math.PI / 180)}
            y2={60 + 40 * Math.sin((angle - 90) * Math.PI / 180)}
            stroke={color} strokeWidth="3" strokeLinecap="round"
          />
          <circle cx="60" cy="60" r="5" fill={color} />
        </svg>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div className="sentiment-meter-score" style={{ color }}>{score.toFixed(3)}</div>
        <div className={`badge ${score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral'}`} style={{ marginTop: '4px' }}>
          {label}
        </div>
      </div>
    </div>
  );
};

/* ── Sentiment Page ─────────────────────────────────────────── */
const Sentiment = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avgScore, setAvgScore] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const [customText, setCustomText] = useState('');
  const [customResult, setCustomResult] = useState(null);
  const [customLoading, setCustomLoading] = useState(false);
  const [customError, setCustomError] = useState('');

  const fetchSentiment = useCallback((forceRefresh = false) => {
    if (forceRefresh) setRefreshing(true);
    else setLoading(true);

    fetch(`${API_BASE}/api/sentiment?query=general&limit=10${forceRefresh ? '&refresh=true' : ''}`)
      .then(res => res.json())
      .then(data => {
        setArticles(data.articles || []);
        setAvgScore(data.average_score || 0);
        setLoading(false);
        setRefreshing(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => { fetchSentiment(); }, [fetchSentiment]);

  const handleCustomAnalyze = async (e) => {
    e.preventDefault();
    if (!customText.trim() || customText.trim().length < 10) {
      setCustomError('Please enter at least 10 characters of news text.');
      return;
    }
    setCustomError('');
    setCustomLoading(true);
    setCustomResult(null);

    try {
      const resp = await fetch(`${API_BASE}/api/sentiment/analyze-custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: customText }),
      });
      if (!resp.ok) throw new Error(await resp.text());
      setCustomResult(await resp.json());
    } catch (err) {
      console.error(err);
      setCustomError('Analysis failed. Please check the backend is running.');
    } finally {
      setCustomLoading(false);
    }
  };

  // Derived analytics
  const positiveCount = articles.filter(a => a.label === 'positive').length;
  const negativeCount = articles.filter(a => a.label === 'negative').length;
  const neutralCount  = articles.filter(a => a.label === 'neutral').length;
  const total       = articles.length || 1;
  const bullRatio   = Math.round((positiveCount / total) * 100);
  const bearRatio   = Math.round((negativeCount / total) * 100);
  const neutralRatio = 100 - bullRatio - bearRatio;

  // Signal derived values
  const signalBg     = avgScore > 0.2 ? 'var(--success-bg)' : avgScore < -0.2 ? 'var(--danger-bg)' : 'rgba(255,255,255,0.04)';
  const signalBorder = avgScore > 0.2 ? 'rgba(16,185,129,0.3)' : avgScore < -0.2 ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)';
  const signalColor  = avgScore > 0.2 ? 'var(--success)' : avgScore < -0.2 ? 'var(--danger)' : '#94a3b8';
  const signalText   = avgScore > 0.4 ? '🟢 Strong Buy Signal'
    : avgScore > 0.2  ? '🟡 Mild Bullish Bias'
    : avgScore < -0.4 ? '🔴 Strong Sell Signal'
    : avgScore < -0.2 ? '🟠 Mild Bearish Bias'
    : '⚪ Neutral / Wait';

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1>Market Sentiment</h1>
        <p>Powered by FinBERT NLP &amp; Groq LLM analysis</p>
      </header>

      {/* Analytics Row */}
      <div className="sentiment-analytics-grid">

        {/* Sentiment Meter */}
        <div className="glass-panel sentiment-meter-panel">
          <p className="section-label">Overall Market Pulse</p>
          {loading
            ? <Loader2 className="spinner" size={24} style={{ color: 'var(--accent-primary)' }} />
            : <SentimentMeter score={avgScore} />}
        </div>

        {/* Bull/Bear Breakdown */}
        <div className="glass-panel">
          <p className="section-label" style={{ marginBottom: '16px' }}>Sentiment Breakdown</p>
          {loading
            ? <Loader2 className="spinner" size={20} style={{ color: 'var(--accent-primary)' }} />
            : (
              <div className="sentiment-bar-row">
                {[
                  { label: 'Bullish',  pct: bullRatio,    color: 'var(--success)', icon: <TrendingUp size={14} /> },
                  { label: 'Bearish',  pct: bearRatio,    color: 'var(--danger)',  icon: <TrendingDown size={14} /> },
                  { label: 'Neutral',  pct: neutralRatio, color: '#94a3b8',        icon: <Minus size={14} /> },
                ].map(({ label, pct, color, icon }) => (
                  <div key={label}>
                    <div className="sentiment-bar__header">
                      <span className="sentiment-bar__label" style={{ color }}>{icon}{label}</span>
                      <span style={{ fontWeight: '600', color }}>{pct}%</span>
                    </div>
                    <div className="sentiment-bar__track">
                      <div className="sentiment-bar__fill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* Signal Strength */}
        <div className="glass-panel">
          <p className="section-label" style={{ marginBottom: '12px' }}>Signal Strength</p>
          {loading
            ? <Loader2 className="spinner" size={20} style={{ color: 'var(--accent-primary)' }} />
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="signal-card" style={{ background: signalBg, border: `1px solid ${signalBorder}` }}>
                  <p className="signal-card__title" style={{ color: signalColor }}>{signalText}</p>
                  <p className="signal-card__subtitle">Based on {total} headline{total !== 1 ? 's' : ''} analyzed</p>
                </div>
                <div className="signal-counts">
                  <span>✅ Positive: <strong style={{ color: 'var(--success)' }}>{positiveCount}</strong></span>
                  <span>❌ Negative: <strong style={{ color: 'var(--danger)' }}>{negativeCount}</strong></span>
                  <span>➖ Neutral: <strong>{neutralCount}</strong></span>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="sentiment-main-grid">

        {/* Latest Headlines */}
        <div className="glass-panel">
          <div className="panel-header">
            <h3><MessageSquare size={18} /> Latest Analyzed Headlines</h3>
            <button className="refresh-btn" onClick={() => fetchSentiment(true)} title="Fetch fresh headlines">
              <RefreshCw size={13} className={refreshing ? 'spinner' : ''} /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="loading-row">
              <Loader2 className="spinner" size={18} /> Running FinBERT NLP models...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {articles.map((article, idx) => (
                <div
                  key={idx}
                  className={`article-card article-card--${article.label}`}
                >
                  <p className="article-card__headline">{article.headline}</p>
                  <div className="article-card__meta">
                    <span className="article-card__score">{article.score.toFixed(3)}</span>
                    <span className={`badge ${article.label}`} style={{ fontSize: '0.72rem' }}>{article.label}</span>
                  </div>
                </div>
              ))}
              {articles.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No headlines found.</p>}
            </div>
          )}
        </div>

        {/* Custom News Analyzer */}
        <div className="glass-panel sentiment-analyzer-panel">
          <h3><Brain size={18} style={{ color: 'var(--accent-primary)' }} /> Custom News Analyzer</h3>
          <p className="section-label">
            Paste any news or paragraph — FinBERT classifies it, Groq explains it.
          </p>

          <form onSubmit={handleCustomAnalyze} className="sentiment-analyzer-form">
            <textarea
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              placeholder="e.g. 'Apple reports record quarterly earnings, beating analyst estimates by 12%...'"
              rows={4}
              className="form-input form-input--textarea"
            />
            {customError && <p className="form-error">{customError}</p>}
            <button
              type="submit"
              className="btn-primary btn-primary--submit"
              disabled={customLoading}
            >
              {customLoading
                ? <><Loader2 size={16} className="spinner" /> Analyzing...</>
                : <><Send size={16} /> Analyze with FinBERT + Groq</>}
            </button>
          </form>

          {customResult && (
            <div className="sentiment-results">
              {/* FinBERT Result */}
              <div className={`finbert-result finbert-result--${customResult.finbert.label}`}>
                <div className="finbert-result__header">
                  <p className="finbert-result__title">FinBERT Result</p>
                  <span className={`badge ${customResult.finbert.label}`}>
                    {customResult.finbert.label.toUpperCase()}
                  </span>
                </div>
                <p className="finbert-result__score">
                  Sentiment Score: <strong style={{ color: 'white' }}>{customResult.finbert.score}</strong>
                </p>
                <ConfidenceBar confidence={customResult.finbert.confidence} label={customResult.finbert.label} />
              </div>

              {/* Groq Agent Summary */}
              <div className="groq-result">
                <p className="groq-result__title">
                  <Sparkles size={14} /> Groq Agent Analysis
                </p>
                <div className="groq-result__body markdown-body">
                  <ReactMarkdown>{customResult.agent_summary}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sentiment;
