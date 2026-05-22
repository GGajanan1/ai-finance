import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar        from './components/Sidebar';

import Dashboard from './pages/Dashboard';
import Equities  from './pages/Equities';
import Sentiment from './pages/Sentiment';
import Macro     from './pages/Macro';
import Portfolio from './pages/Portfolio';
import Chat      from './pages/Chat';
import Settings  from './pages/Settings';
import Login     from './pages/Login';

// ── Layout ────────────────────────────────────────────────────────────────────
function AppLayout() {
  const { user } = useAuth();
  return (
    <Router>
      <div className="app-container">
        {user && <Sidebar />}
        <main className={user ? 'main-content' : 'main-content main-content--full'}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/"          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/equities"  element={<ProtectedRoute><Equities  /></ProtectedRoute>} />
            <Route path="/sentiment" element={<ProtectedRoute><Sentiment /></ProtectedRoute>} />
            <Route path="/macro"     element={<ProtectedRoute><Macro     /></ProtectedRoute>} />
            <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
            <Route path="/chat"      element={<ProtectedRoute><Chat      /></ProtectedRoute>} />
            <Route path="/settings"  element={<ProtectedRoute><Settings  /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}

export default App;
