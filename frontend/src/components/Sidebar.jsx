import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Video,
  Users,
  Activity,
  Bell,
  MapPin,
  BarChart3,
  ShieldCheck,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  LogIn
} from 'lucide-react';

export default function Sidebar({ isCollapsed, setIsCollapsed, userRole, onLogout, activeAlertsCount = 4 }) {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/monitoring', label: 'AI Video Monitoring', icon: Video, highlight: true },
    { to: '/children', label: 'Children Registry', icon: Users },
    { to: '/events', label: 'Safety Events', icon: Activity },
    { to: '/alerts', label: 'Active Alerts', icon: Bell, badge: activeAlertsCount > 0 ? `${activeAlertsCount}` : undefined },
    { to: '/map', label: 'Campus Map', icon: MapPin },
    { to: '/reports', label: 'Analytics & Reports', icon: BarChart3 },
    { to: '/admin', label: 'Admin Console', icon: ShieldCheck },
    { to: '/settings', label: 'System Settings', icon: Settings },
    { to: '/login', label: 'Sign In / Personas', icon: LogIn },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-white/95 backdrop-blur-md border-r border-slate-200/80 transition-all duration-300 flex flex-col shadow-sm ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200/80 bg-gradient-to-r from-slate-50 to-indigo-50/30">
        <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20 text-white font-bold transition-transform group-hover:scale-105">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <h1 className="font-black text-base tracking-tight text-slate-900 flex items-center gap-1">
                ChildGuard <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent font-mono text-sm font-black">AI</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase truncate">
                Detect • Assess • Protect
              </p>
            </div>
          )}
        </NavLink>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition hidden lg:flex"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`
              }
              title={isCollapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-600'}`} />
                  {!isCollapsed && (
                    <span className="flex-1 truncate">{item.label}</span>
                  )}
                  {!isCollapsed && item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shadow-xs ${
                      isActive 
                        ? 'bg-white text-indigo-700' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User / Session Footer (Only Admin / Security) */}
      <div className="p-3 border-t border-slate-200/80 bg-gradient-to-b from-slate-50/50 to-indigo-50/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 border border-indigo-200/80 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0 shadow-xs">
            {userRole === 'Security' ? 'S' : 'A'}
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">
                {userRole === 'Security' ? 'Campus Security' : 'System Admin'}
              </p>
              <span className="text-[10px] text-indigo-600 font-semibold tracking-wide flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Authorized Staff
              </span>
            </div>
          )}

          <button
            onClick={onLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
