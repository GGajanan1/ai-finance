import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, LineChart, MessageSquare,
  Globe, Settings as SettingsIcon, LogOut, AlertTriangle,
  Briefcase, MessageCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

// ── Logout Confirmation Modal ─────────────────────────────────────────────────
const LogoutModal = ({ onConfirm, onCancel }) => {
  const { t } = useTranslation();
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          animation: 'fadeIn 0.15s ease',
        }}
      />
      {/* Dialog */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1001,
        background: 'var(--surface-glass, #1e293b)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '32px 28px',
        width: 'min(360px, 90vw)',
        boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
        animation: 'slideUp 0.2s ease',
        textAlign: 'center',
      }}>
        {/* Icon */}
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'rgba(239,68,68,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <AlertTriangle size={26} color="#ef4444" />
        </div>

        <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary, #f1f5f9)' }}>
          {t('common.signOut')}
        </h3>
        <p style={{ margin: '0 0 28px', fontSize: '0.9rem', color: 'var(--text-muted, #94a3b8)', lineHeight: 1.5 }}>
          {t('common.signOutConfirm')}
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '10px 0', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary, #cbd5e1)',
              cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500,
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            {t('common.signOutCancel')}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '10px 0', borderRadius: '8px', border: 'none',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#fff', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
              transition: 'opacity 0.2s', boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            {t('common.signOutYes')}
          </button>
        </div>
      </div>
    </>
  );
};

// ── Sidebar ───────────────────────────────────────────────────────────────────
const Sidebar = () => {
  const { t }            = useTranslation();
  const { user, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const navClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');

  const handleLogoutClick = () => setShowModal(true);
  const handleConfirm     = () => { setShowModal(false); logout(); };
  const handleCancel      = () => setShowModal(false);

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2 className="gradient-text">{t('common.aiFinance')}</h2>
          <p>{t('common.hedgeFundStack')}</p>
        </div>

        <nav>
          <NavLink to="/"          className={navClass} end><LayoutDashboard size={20}/> {t('nav.dashboard')}</NavLink>
          <NavLink to="/equities"  className={navClass}><LineChart     size={20}/> {t('nav.equities')}</NavLink>
          <NavLink to="/sentiment" className={navClass}><MessageSquare size={20}/> {t('nav.sentiment')}</NavLink>
          <NavLink to="/macro"     className={navClass}><Globe         size={20}/> {t('nav.macro')}</NavLink>
          <NavLink to="/settings"  className={navClass}><SettingsIcon  size={20}/> {t('nav.settings')}</NavLink>
        </nav>

        <div className="sidebar-bottom">
          {user ? (
            <div className="sidebar-user">
              {user.picture && (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="sidebar-avatar"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{user.name}</span>
                <span className="sidebar-user-email">{user.email}</span>
              </div>
              <button
                className="sidebar-logout-btn"
                onClick={handleLogoutClick}
                title={t('common.signOut')}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="sidebar-status">
              <p>{t('nav.systemStatus')}</p>
              <div className="sidebar-status-row">
                <div className="sidebar-status-dot" />
                <span>{t('nav.allSystemsOnline')}</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Portal-style modal — rendered outside <aside> so z-index works correctly */}
      {showModal && <LogoutModal onConfirm={handleConfirm} onCancel={handleCancel} />}
    </>
  );
};

export default Sidebar;
