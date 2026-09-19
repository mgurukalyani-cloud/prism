import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Monitoring from './pages/Monitoring';
import Children from './pages/Children';
import Events from './pages/Events';
import Alerts from './pages/Alerts';
import MapPage from './pages/MapPage';
import Reports from './pages/Reports';
import Admin from './pages/Admin';
import Settings from './pages/Settings';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('childguard_authenticated') === 'true';
  });
  const [userRole, setUserRole] = useState(() => {
    return sessionStorage.getItem('childguard_role') || 'Admin';
  });

  const handleLoginSuccess = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
    sessionStorage.setItem('childguard_authenticated', 'true');
    sessionStorage.setItem('childguard_role', role);
  };

  const handleRoleChange = (newRole) => {
    setUserRole(newRole);
    sessionStorage.setItem('childguard_role', newRole);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('childguard_authenticated');
    sessionStorage.removeItem('childguard_role');
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Opening the site always goes to Login first if not authenticated */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Login Page */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={userRole === 'Security' ? '/monitoring' : '/dashboard'} replace />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* Optional Public Landing */}
        <Route path="/welcome" element={<Landing />} />

        {/* Protected Dashboard Shell - Only accessible after Login */}
        <Route
          element={
            isAuthenticated ? (
              <Layout
                userRole={userRole}
                onRoleChange={handleRoleChange}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/children" element={<Children />} />
          <Route path="/events" element={<Events />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
