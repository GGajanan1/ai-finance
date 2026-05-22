import React from 'react';
import { useTranslation } from 'react-i18next';
import { AUTH_BASE } from '../api/auth';
import { TrendingUp, Shield, Globe, BarChart2 } from 'lucide-react';

const Login = () => {
  const { t } = useTranslation();

  const handleGoogleLogin = () => {
    // Redirect to Express backend → Google OAuth consent screen
    window.location.href = `${AUTH_BASE}/auth/google`;
  };

  return (
    <div className="login-page">
      {/* Animated background blobs */}
      <div className="login-blob login-blob--1" />
      <div className="login-blob login-blob--2" />
      <div className="login-blob login-blob--3" />

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <TrendingUp size={28} />
          </div>
          <div>
            <h2 className="gradient-text" style={{ fontSize: '1.4rem', margin: 0 }}>
              {t('common.aiFinance')}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
              {t('common.hedgeFundStack')}
            </p>
          </div>
        </div>

        {/* Headline */}
        <div className="login-headline">
          <h1>{t('common.loginTitle')}</h1>
          <p>{t('common.loginSubtitle')}</p>
        </div>

        {/* Feature pills */}
        <div className="login-features">
          {[
            { icon: <Shield size={14} />, text: 'Secure OAuth 2.0' },
            { icon: <Globe    size={14} />, text: 'Sync across devices' },
            { icon: <BarChart2 size={14}/>, text: 'Persistent watchlist' },
          ].map(f => (
            <div key={f.text} className="login-feature-pill">
              {f.icon} {f.text}
            </div>
          ))}
        </div>

        <p className="login-description">{t('common.loginDescription')}</p>

        {/* Google Sign-In button */}
        <button className="btn-google" onClick={handleGoogleLogin}>
          {/* Official Google G SVG */}
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#4285F4" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.5 30.3 0 24 0 14.8 0 6.9 5.4 3 13.3l7.9 6.1C12.7 13.1 17.9 9.5 24 9.5z"/>
            <path fill="#34A853" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8C43.9 37.1 46.5 31.3 46.5 24.5z"/>
            <path fill="#FBBC05" d="M10.9 28.6A14.8 14.8 0 0 1 9.5 24c0-1.6.3-3.1.8-4.6L2.4 13.3A23.9 23.9 0 0 0 0 24c0 3.8.9 7.4 2.5 10.6l8.4-6z"/>
            <path fill="#EA4335" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.5-4.8 2.4-8.4 2.4-6.1 0-11.3-3.6-13.1-8.8l-7.9 6.1C6.9 42.6 14.8 48 24 48z"/>
          </svg>
          {t('common.signIn')}
        </button>

        <p className="login-footnote">
          By signing in you agree to our Terms of Service. Your data is stored securely in MongoDB and never shared.
        </p>
      </div>
    </div>
  );
};

export default Login;
