import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import LiveAlert from './LiveAlert';
import MobileDispatchSimulator from './MobileDispatchSimulator';
import { useWebSocket } from '../hooks/useWebSocket';
import { api } from '../services/api';
import { Info, ShieldAlert, Smartphone } from 'lucide-react';

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

  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [dispatchAlert, setDispatchAlert] = useState(null);

  const handleOpenDispatch = (targetAlert = null) => {
    setDispatchAlert(targetAlert || latestAlert);
    setIsDispatchOpen(true);
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
          onOpenDispatch={handleOpenDispatch}
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
          <Outlet context={{ isSimulating, triggerScenario, userRole, activeAlertsCount, onAlertResolved: handleAlertResolved, refreshStats: syncAlertsCount, onOpenDispatch: handleOpenDispatch }} />
        </main>

        {/* Floating Security Mobile Dispatch Trigger */}
        <button
          onClick={() => handleOpenDispatch()}
          className="fixed bottom-6 right-6 z-40 px-4 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl shadow-xl shadow-emerald-600/30 font-bold text-xs flex items-center gap-2.5 transition-all transform hover:scale-105 cursor-pointer border border-emerald-400/40"
          title="Open Security Mobile Dispatch (WhatsApp / SMS)"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
          <Smartphone className="w-4 h-4" />
          <span>📱 Dispatch Mobile</span>
          <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px] font-mono">
            {activeAlertsCount}
          </span>
        </button>

        {/* Smartphone Simulator Modal */}
        <MobileDispatchSimulator
          isOpen={isDispatchOpen}
          onClose={() => setIsDispatchOpen(false)}
          activeAlert={dispatchAlert || latestAlert}
        />

        {/* Enterprise Privacy & Human Supervision Footer */}
        <footer className="border-t border-slate-200 bg-white px-6 py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>
              <strong>Privacy by Design:</strong> Universal anonymous tracking tokens (<code className="text-indigo-700 font-mono font-bold">C-200</code>, <code className="text-indigo-700 font-mono font-bold">P-101</code>, <code className="text-indigo-700 font-mono font-bold">SR-301</code>). Covering Children, Adults & Senior Citizens.
            </span>
          </div>

          <p className="font-semibold text-slate-700 text-center sm:text-right">
            SafeGuard AI • KLH Aziznagar Campus, Hyderabad • Human supervision active
          </p>
        </footer>

      </div>
    </div>
  );
}
