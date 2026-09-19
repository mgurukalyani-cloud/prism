import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';

export default function RiskBadge({ risk = 'LOW', size = 'md', showLabel = true }) {
  const normalized = (risk || 'LOW').toUpperCase().replace(/DETECTED|_/g, '').trim();

  const configs = {
    'NO RISK': {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      dot: 'bg-emerald-500',
      icon: CheckCircle2,
      text: 'NO RISK',
      sub: 'All Clear'
    },
    LOW: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      dot: 'bg-emerald-500',
      icon: ShieldCheck,
      text: 'LOW',
      sub: 'Safe'
    },
    MEDIUM: {
      bg: 'bg-amber-50 border-amber-200 text-amber-700',
      dot: 'bg-amber-500',
      icon: AlertTriangle,
      text: 'MEDIUM',
      sub: 'Attention'
    },
    HIGH: {
      bg: 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse',
      dot: 'bg-rose-500',
      icon: AlertOctagon,
      text: 'HIGH',
      sub: 'Immediate Attention'
    },
    CRITICAL: {
      bg: 'bg-red-100 border-red-300 text-red-800 animate-pulse font-black',
      dot: 'bg-red-600',
      icon: AlertOctagon,
      text: 'CRITICAL',
      sub: 'Action Required'
    }
  };

  let c = configs[normalized];
  if (!c) {
    if (normalized.includes('CRITICAL')) c = configs.CRITICAL;
    else if (normalized.includes('HIGH')) c = configs.HIGH;
    else if (normalized.includes('MED')) c = configs.MEDIUM;
    else if (normalized.includes('NO')) c = configs['NO RISK'];
    else c = configs.LOW;
  }

  const Icon = c.icon;

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs gap-1.5',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm gap-2'
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-sm ${c.bg} ${sizeStyles[size] || sizeStyles.md}`}
      role="status"
      aria-label={`Risk level ${c.text}: ${c.sub}`}
    >
      <span className="relative flex h-2 w-2">
        {(c.text === 'HIGH' || c.text === 'CRITICAL') && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${c.dot}`}></span>
      </span>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span className="font-bold tracking-wide">{c.text}</span>
      {showLabel && <span className="opacity-80 font-normal">| {c.sub}</span>}
    </span>
  );
}
