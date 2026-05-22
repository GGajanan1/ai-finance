import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useAuth } from '../context/AuthContext';

const LANGUAGES = [
  // International
  { code: 'en',  label: 'English',                   region: 'international' },
  { code: 'zh',  label: '中文 (Simplified Chinese)',  region: 'international' },
  { code: 'fr',  label: 'Français',                  region: 'international' },
  { code: 'ar',  label: 'العربية',                   region: 'international' },
  // 22 Scheduled Indian Languages
  { code: 'hi',  label: 'हिन्दी',                    region: 'indian' },
  { code: 'bn',  label: 'বাংলা',                     region: 'indian' },
  { code: 'te',  label: 'తెలుగు',                    region: 'indian' },
  { code: 'mr',  label: 'मराठी',                     region: 'indian' },
  { code: 'ta',  label: 'தமிழ்',                     region: 'indian' },
  { code: 'ur',  label: 'اردو',                      region: 'indian' },
  { code: 'gu',  label: 'ગુજરાતી',                   region: 'indian' },
  { code: 'kn',  label: 'ಕನ್ನಡ',                     region: 'indian' },
  { code: 'ml',  label: 'മലയാളം',                    region: 'indian' },
  { code: 'or',  label: 'ଓଡ଼ିଆ',                     region: 'indian' },
  { code: 'pa',  label: 'ਪੰਜਾਬੀ',                    region: 'indian' },
  { code: 'as',  label: 'অসমীয়া',                   region: 'indian' },
  { code: 'mai', label: 'मैथिली',                    region: 'indian' },
  { code: 'sa',  label: 'संस्कृतम्',                 region: 'indian' },
  { code: 'ks',  label: 'كٲشُر (Kashmiri)',           region: 'indian' },
  { code: 'ne',  label: 'नेपाली',                    region: 'indian' },
  { code: 'sd',  label: 'سنڌي (Sindhi)',              region: 'indian' },
  { code: 'kok', label: 'कोंकणी',                    region: 'indian' },
  { code: 'doi', label: 'डोगरी',                     region: 'indian' },
  { code: 'brx', label: 'बड़ो (Bodo)',                region: 'indian' },
  { code: 'mni', label: 'মৈতৈলোন্ (Manipuri)',       region: 'indian' },
  { code: 'sat', label: 'ᱥᱟᱱᱛᱟᱲᱤ (Santali)',        region: 'indian' },
];

const INTL  = LANGUAGES.filter(l => l.region === 'international');
const INDIA = LANGUAGES.filter(l => l.region === 'indian');

const DEFAULT_SETTINGS = { defaultTicker: '', newsLimit: 5, refreshInterval: 60, language: 'en' };

const Settings = () => {
  const { t }                    = useTranslation();
  const { user, updateSettings } = useAuth();

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved]        = useState(false);
  const [saving, setSaving]      = useState(false);

  // Populate from DB (if logged in) or localStorage
  useEffect(() => {
    if (user?.settings) {
      setSettings({ ...DEFAULT_SETTINGS, ...user.settings });
    } else {
      const local = localStorage.getItem('finance_settings');
      if (local) setSettings(prev => ({ ...prev, ...JSON.parse(local) }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  // Language changes apply instantly so the user can preview
  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setSettings(prev => ({ ...prev, language: lang }));
    i18n.changeLanguage(lang);   // live preview
    setSaved(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    i18n.changeLanguage(settings.language); // confirm selection

    if (user) {
      // Persist to MongoDB via Express backend
      await updateSettings(settings);
    } else {
      // Fallback: persist to localStorage when not authenticated
      localStorage.setItem('finance_settings', JSON.stringify(settings));
    }

    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <SettingsIcon size={32} /> {t('settings.title')}
        </h1>
        <p>{t('settings.subtitle')}</p>
      </header>

      <div className="glass-panel" style={{ maxWidth: '640px' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Default Ticker */}
          <div>
            <label className="form-label">{t('settings.defaultTicker')}</label>
            <input
              type="text"
              name="defaultTicker"
              value={settings.defaultTicker || ''}
              onChange={handleChange}
              placeholder={t('settings.defaultTickerPlaceholder')}
              className="form-input"
            />
            <p className="form-hint">{t('settings.defaultTickerHint')}</p>
          </div>

          {/* News Limit */}
          <div>
            <label className="form-label">{t('settings.newsLimit')}</label>
            <input type="number" name="newsLimit" value={settings.newsLimit}
              onChange={handleChange} min="1" max="20" className="form-input" />
            <p className="form-hint">{t('settings.newsLimitHint')}</p>
          </div>

          {/* Refresh Interval */}
          <div>
            <label className="form-label">{t('settings.refreshInterval')}</label>
            <input type="number" name="refreshInterval" value={settings.refreshInterval}
              onChange={handleChange} min="10" className="form-input" />
          </div>

          {/* Language */}
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={16} /> {t('settings.language')}
            </label>
            <select name="language" value={settings.language}
              onChange={handleLanguageChange} className="form-select">
              <optgroup label={t('settings.group.international')}>
                {INTL.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </optgroup>
              <optgroup label={t('settings.group.indian')}>
                {INDIA.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </optgroup>
            </select>
            <p className="form-hint">{t('settings.languageHint')}</p>
          </div>

          {/* Save */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button type="submit" className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              disabled={saving}>
              <Save size={18} />
              {saving ? '…' : t('settings.save')}
            </button>
            {saved && <span style={{ color: 'var(--success)', fontWeight: 500 }}>{t('settings.saved')}</span>}
            {!user && (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Sign in with Google to sync across devices
              </span>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};

export default Settings;
