import React from 'react';
import RiskBadge from './RiskBadge';
import { Clock, MapPin, User, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';

export default function AlertCard({ alert, onAcknowledge, onResolve, onViewEvent }) {
  const isNew = alert.status === 'NEW';
  const isAck = alert.status === 'ACKNOWLEDGED';
  const isResolved = alert.status === 'RESOLVED';

  return (
    <div className={`p-4 rounded-xl border transition-all duration-200 ${
      isNew 
        ? 'bg-white border-rose-300 shadow-sm shadow-rose-500/5' 
        : isAck 
        ? 'bg-white border-amber-300 shadow-sm' 
        : 'bg-slate-50 border-slate-200 opacity-85'
    }`}>
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <RiskBadge risk={alert.risk_level || alert.risk} size="sm" />
          <span className="text-xs font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold">
            {alert.alert_code || `ALT-${alert.id}`}
          </span>
        </div>

        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
          isNew 
            ? 'bg-rose-50 text-rose-700 border-rose-200' 
            : isAck 
            ? 'bg-amber-50 text-amber-700 border-amber-200' 
            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          {alert.status}
        </span>
      </div>

      <div className="py-3 space-y-1.5">
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          {alert.event_type}
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed">
          {alert.message}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 font-medium">
          <span className="flex items-center gap-1.5 text-slate-800">
            <User className="w-3.5 h-3.5 text-blue-600" />
            <strong className="text-blue-700 font-mono">{alert.child_id}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {alert.zone || 'Campus'}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {alert.created_at ? (typeof alert.created_at === 'string' && alert.created_at.includes('T') ? new Date(alert.created_at).toLocaleTimeString() : alert.created_at) : 'Just now'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-slate-100">
        {/* Real WhatsApp Click-to-Send */}
        <button
          onClick={() => {
            const storedPhone = localStorage.getItem('childguard_guard_phone') || '+919876543210';
            const clean = storedPhone.replace(/[^0-9]/g, '');
            const msg = encodeURIComponent(
              `🚨 *SAFEGUARD AI — EMERGENCY DISPATCH ALERT* 🚨\n\n` +
              `⚠️ *Incident:* ${alert.event_type || 'Safety Alert'}\n` +
              `👤 *Token:* ${alert.child_id || 'C-017'}\n` +
              `📍 *Zone:* ${alert.zone || 'Campus Zone'}\n` +
              `📊 *Severity:* ${alert.risk_level || alert.risk || 'HIGH'}\n` +
              `⏱️ *Time:* ${new Date().toLocaleTimeString()}\n` +
              `👮 *Action:* Urgent patrol response required.\n\n` +
              `_PRISMTECH 2026 Campus Safety Network_`
            );
            window.open(`https://api.whatsapp.com/send?phone=${clean}&text=${msg}`, '_blank');
          }}
          className="px-2.5 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition flex items-center gap-1 cursor-pointer"
          title="Send real emergency dispatch alert to personal WhatsApp"
        >
          <span>🟢 WhatsApp</span>
        </button>

        {onViewEvent && (
          <button
            onClick={() => onViewEvent(alert)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg flex items-center gap-1 transition"
          >
            Details <ArrowRight className="w-3 h-3" />
          </button>
        )}

        {isNew && onAcknowledge && (
          <button
            onClick={() => onAcknowledge(alert.id)}
            className="px-3 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition flex items-center gap-1 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" /> Acknowledge
          </button>
        )}

        {(isNew || isAck) && onResolve && (
          <button
            onClick={() => onResolve(alert.id)}
            className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolve Alert
          </button>
        )}
      </div>
    </div>
  );
}
