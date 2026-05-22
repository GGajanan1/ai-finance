import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n';
import {
  fetchCurrentUser,
  logoutUser,
  updateSettings  as apiUpdateSettings,
  updateWatchlist as apiUpdateWatchlist,
  updateMacro     as apiUpdateMacro,
} from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from JWT cookie on mount
  useEffect(() => {
    fetchCurrentUser()
      .then((data) => {
        if (data) {
          setUser(data);
          if (data.settings?.language) i18n.changeLanguage(data.settings.language);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const logout = async () => {
    await logoutUser();
    setUser(null);
    i18n.changeLanguage('en');
  };

  const updateSettings = async (newSettings) => {
    try {
      const updated = await apiUpdateSettings(newSettings);
      setUser((prev) => ({ ...prev, settings: updated }));
      return updated;
    } catch (err) {
      console.error('Failed to update settings:', err);
      return null;
    }
  };

  const updateWatchlist = async (watchlist) => {
    try {
      const data = await apiUpdateWatchlist(watchlist);
      setUser((prev) => ({ ...prev, watchlist: data.watchlist }));
      return data.watchlist;
    } catch (err) {
      console.error('Failed to update watchlist:', err);
      return null;
    }
  };

  const updateMacro = async (macro) => {
    try {
      const data = await apiUpdateMacro(macro);
      setUser((prev) => ({ ...prev, macro: data }));
      return data;
    } catch (err) {
      console.error('Failed to update macro:', err);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, setUser, updateSettings, updateWatchlist, updateMacro }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
