import React, { useState } from 'react';
import { Globe, Plus, X, Settings2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMacro } from '../hooks/useMacro';

const AVAILABLE_INDICATORS = [
  { id: 'NY.GDP.MKTP.KD.ZG',    name: 'GDP Growth (Annual %)' },
  { id: 'FP.CPI.TOTL.ZG',       name: 'Inflation Rate (%)' },
  { id: 'SL.UEM.TOTL.ZS',       name: 'Unemployment Rate (%)' },
  { id: 'FR.INR.REAL',           name: 'Real Interest Rate (%)' },
  { id: 'BN.CAB.XOKA.GD.ZS',    name: 'Current Account Balance (% of GDP)' },
  { id: 'GC.DOD.TOTL.GD.ZS',    name: 'Central Government Debt (% of GDP)' },
  { id: 'BX.KLT.DINV.WD.GD.ZS', name: 'FDI (% of GDP)' },
];

const getIndName = (id) => AVAILABLE_INDICATORS.find((i) => i.id === id)?.name ?? id;

const Macro = () => {
  const { t } = useTranslation();
  const {
    data, loading,
    countries, indicators,
    addCountry, removeCountry,
    addIndicator, removeIndicator,
  } = useMacro();

  const [newCountry,   setNewCountry]   = useState('');
  const [newIndicator, setNewIndicator] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const handleAddCountry = (e) => {
    e.preventDefault();
    const c = newCountry.trim().toUpperCase();
    if (c.length === 3 && !countries.includes(c)) { addCountry(c); setNewCountry(''); }
  };

  const handleAddIndicator = (e) => {
    e.preventDefault();
    if (newIndicator && !indicators.includes(newIndicator)) { addIndicator(newIndicator); setNewIndicator(''); }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header--row">
        <div className="page-header">
          <h1>{t('macro.title')}</h1>
          <p>{t('macro.subtitle')}</p>
        </div>
        <button className="btn-secondary" onClick={() => setShowSettings(!showSettings)}>
          <Settings2 size={18} /> {t('macro.customizeTable')}
        </button>
      </div>

      {showSettings && (
        <div className="glass-panel" style={{ marginBottom: '32px', background: 'rgba(255,255,255,0.03)' }}>
          <h3 style={{ marginBottom: '16px' }}>{t('macro.dashboardConfig')}</h3>
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            {/* Countries */}
            <div style={{ flex: 1, minWidth: '250px' }}>
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>{t('macro.trackedCountries')}</label>
              <form onSubmit={handleAddCountry} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input type="text" value={newCountry} onChange={(e) => setNewCountry(e.target.value)}
                  placeholder={t('macro.countryPlaceholder')} maxLength={3}
                  className="form-input" style={{ flex: 1, padding: '8px 12px' }} />
                <button type="submit" className="btn-primary" style={{ padding: '8px 12px' }}><Plus size={16} /></button>
              </form>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {countries.map((c) => (
                  <span key={c} className="badge neutral" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {c} <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeCountry(c)} />
                  </span>
                ))}
              </div>
            </div>

            {/* Indicators */}
            <div style={{ flex: 2, minWidth: '300px' }}>
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>{t('macro.trackedIndicators')}</label>
              <form onSubmit={handleAddIndicator} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <select value={newIndicator} onChange={(e) => setNewIndicator(e.target.value)} className="form-select">
                  <option value="">{t('macro.selectIndicator')}</option>
                  {AVAILABLE_INDICATORS.filter((i) => !indicators.includes(i.id)).map((i) => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
                <button type="submit" className="btn-primary" style={{ padding: '8px 12px' }}><Plus size={16} /></button>
              </form>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {indicators.map((ind) => (
                  <span key={ind} className="badge neutral" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {getIndName(ind)} <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeIndicator(ind)} />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={20} /> {t('macro.globalIndicators')}
        </h3>
        <table className="watchlist-table" style={{ minWidth: '600px' }}>
          <thead>
            <tr>
              <th>Country</th>
              {indicators.map((ind) => <th key={ind}>{getIndName(ind)}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={indicators.length + 1} style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)' }}>{t('macro.loadingData')}</td></tr>
            ) : data?.global_metrics?.length > 0 ? (
              data.global_metrics.map((metric, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: '500' }}>{metric.country}</td>
                  {indicators.map((ind) => {
                    const val    = metric[ind];
                    const isNull = val === null || val === undefined;
                    return (
                      <td key={ind} style={{ color: isNull ? 'var(--text-muted)' : 'inherit' }}>
                        {isNull
                          ? <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: '4px' }}>N/A</span>
                          : `${val}%`}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr><td colSpan={indicators.length + 1} style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text-muted)' }}>{t('macro.dataUnavailable')}</td></tr>
            )}
          </tbody>
        </table>
        <p style={{ marginTop: '16px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          📡 Source: World Bank API · Data lags 1–2 years for some indicators · N/A = not yet published
        </p>
      </div>
    </div>
  );
};

export default Macro;
