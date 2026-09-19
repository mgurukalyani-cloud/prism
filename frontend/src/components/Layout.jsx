import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import LiveAlert from './LiveAlert';
import { useWebSocket } from '../hooks/useWebSocket';
import { api } from '../services/api';
import { Info, ShieldAlert } from 'lucide-react';

export default function Layout({ userRole = 'Admin', onRoleChange, onLogout }) {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeAlertsCount, setActiveAlertsCount] = useState(4);
  const {
    isConnected,
    latestAlert,
    isSimulating,
    dismissLatestAlert,
    toggleSimulation,
    triggerScenario
  } = useWebSocket();

  const syncAlertsCount = async () => {
    try {
      const stats = await api.getStats();
      if (stats && stats.active_alerts !== undefined) {
        setActiveAlertsCount(stats.active_alerts);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    syncAlertsCount();
  }, [latestAlert]);

  // Method passed to child routes via Outlet context so resolving alerts decrements counts
  const handleAlertResolved = (resolvedId) => {
    setActiveAlertsCount((prev) => Math.max(0, prev - 1));
  };

  const handleLogoutClick = () => {
    if (onLogout) onLogout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        userRole={userRole}
        onLogout={handleLogoutClick}
        activeAlertsCount={activeAlertsCount}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        {/* Header */}
        <Header
          isSimulating={isSimulating}
          onToggleSimulation={toggleSimulation}
          isConnected={isConnected}
          userRole={userRole}
          onRoleChange={onRoleChange}
          alertsCount={activeAlertsCount}
        />

        {/* Real-time Alert Toast Notification */}
        <LiveAlert
          alert={latestAlert}
          onDismiss={dismissLatestAlert}
          onAcknowledge={() => dismissLatestAlert()}
        />

        {/* Demo Mode Notice Banner when simulating */}
        {isSimulating && (
          <aside
            aria-label="Simulation active banner"
            className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between text-xs text-amber-900 shadow-xs"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
              <span>
                <strong>HACKATHON DEMO LOOP ACTIVE:</strong> Generating autonomous events every 5 seconds (Perimeter Breach, Fall Detection, Bus Depot).
              </span>
            </div>
            <button
              onClick={toggleSimulation}
              className="text-[11px] underline font-bold hover:text-amber-950 cursor-pointer"
            >
              Stop Simulation
            </button>
          </aside>
        )}

        {/* Page Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet context={{ isSimulating, triggerScenario, userRole, activeAlertsCount, onAlertResolved: handleAlertResolved, refreshStats: syncAlertsCount }} />
        </main>

        {/* Enterprise Privacy & Human Supervision Footer */}
        <footer className="border-t border-slate-200 bg-white px-6 py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>
              <strong>Privacy by Design:</strong> Anonymous tracking tokens only (<code className="text-blue-700 font-mono font-bold">C-001</code>..<code className="text-blue-700 font-mono font-bold">C-041</code>). No facial recognition or biometrics stored.
            </span>
          </div>

          <p className="font-semibold text-slate-700 text-center sm:text-right">
            AI-assisted safety monitoring. Human supervision remains essential.
          </p>
        </footer>
      </div>
    </div>
  );
}
