import React from 'react';
import RiskBadge from './RiskBadge';
import { AlertCircle, X, Bell, Check, MapPin, User } from 'lucide-react';

export default function LiveAlert({ alert, onDismiss, onAcknowledge }) {
  if (!alert) return null;

  const isHigh = (alert.risk || alert.risk_level) === 'HIGH' || (alert.risk || alert.risk_level) === 'CRITICAL';

  return (
    <aside
      aria-label="Real-time safety alert"
      className="fixed top-20 right-5 z-50 max-w-md w-full transition-all animate-bounce-short"
    >
      <div className={`rounded-xl border p-4 shadow-xl backdrop-blur-md relative overflow-hidden bg-white ${
        isHigh 
          ? 'border-rose-300 shadow-rose-500/10' 
          : 'border-amber-300 shadow-amber-500/10'
      }`}>
        {/* Color accent strip */}
        <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${isHigh ? 'bg-rose-500' : 'bg-amber-500'}`} />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${isHigh ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                  REAL-TIME ALERT
                </span>
                <RiskBadge risk={alert.risk || alert.risk_level || 'HIGH'} size="sm" />
              </div>
              <h4 className="font-bold text-sm mt-0.5 text-slate-900 leading-snug">
                {alert.event_type || 'Safety Alert'}
              </h4>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 mt-2.5 leading-relaxed pl-1">
          {alert.message}
        </p>

        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-3 font-medium">
            <span className="flex items-center gap-1 font-mono text-blue-700 font-bold">
              <User className="w-3.5 h-3.5" /> {alert.child_id}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {alert.zone || 'Campus'}
            </span>
          </div>

          {onAcknowledge && (
            <button
              onClick={() => {
                onAcknowledge(alert.alert_id || alert.id);
                onDismiss();
              }}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" /> Acknowledge
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
