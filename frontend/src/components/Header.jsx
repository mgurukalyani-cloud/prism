import React, { useState } from 'react';
import {
  Bell,
  Play,
  Square,
  Shield,
  Cpu,
  Wifi,
  WifiOff,
  UserCheck,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export default function Header({
  isSimulating,
  onToggleSimulation,
  isConnected,
  aiStatus = 'YOLO Active',
  alertsCount = 4,
  userRole = 'Admin',
  onRoleChange
}) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Strictly Administrator and Campus Security (Teacher & Parent removed per user request)
  const roles = [
    { label: 'Admin', title: 'System Administrator', email: 'admin@childguard.ai' },
    { label: 'Security', title: 'Campus Security Guard', email: 'security@childguard.ai' },
  ];

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left Status Indicators */}
      <div className="flex items-center gap-3">
        {/* System Online / Offline */}
        <div className="flex items-center gap-2 text-xs font-semibold bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 px-3 py-1 rounded-full text-emerald-800 shadow-xs">
          {isConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span>System: <strong className="text-emerald-900">Online</strong></span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <Wifi className="w-3.5 h-3.5 text-indigo-600" />
              <span>System: <strong className="text-indigo-900">Active</strong></span>
            </>
          )}
        </div>

        {/* AI Engine Status */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs bg-indigo-50/80 border border-indigo-200/80 px-3 py-1 rounded-full text-indigo-900 shadow-xs font-medium">
          <Cpu className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-slate-500">AI Engine:</span>
          <span className="text-indigo-700 font-mono font-bold">{aiStatus}</span>
        </div>
      </div>

      {/* Right Action Bar */}
      <div className="flex items-center gap-3">
        {/* Hackathon Demo Simulation Toggle */}
        <button
          onClick={onToggleSimulation}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all ${
            isSimulating
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20 animate-pulse'
              : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/20'
          }`}
          title={isSimulating ? 'Stop automated event simulation' : 'Start automated demo event generation'}
        >
          {isSimulating ? (
            <>
              <Square className="w-3 h-3 fill-current" />
              <span>DEMO LOOP (STOP)</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-current" />
              <span>START DEMO LOOP</span>
            </>
          )}
        </button>

        {/* Notifications Icon with Dynamic Badge */}
        <div className="relative">
          <button
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 text-slate-700 transition relative"
            title="Safety Notifications"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            {alertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {alertsCount}
              </span>
            )}
          </button>
        </div>

        {/* Role Switcher (Admin / Security Only) */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-800 transition shadow-xs"
          >
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Role: <strong className="text-slate-900">{userRole}</strong></span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 overflow-hidden">
              <div className="px-3.5 py-1.5 text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 border-b border-slate-100">
                Authorized Personas
              </div>
              {roles.map((r) => (
                <button
                  key={r.label}
                  onClick={() => {
                    onRoleChange && onRoleChange(r.label);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex flex-col hover:bg-slate-50 transition ${
                    userRole === r.label ? 'text-indigo-700 font-bold bg-indigo-50/60' : 'text-slate-700'
                  }`}
                >
                  <span className="font-semibold">{r.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{r.email}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
