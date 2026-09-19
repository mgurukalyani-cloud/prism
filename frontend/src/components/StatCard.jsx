import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo', badge }) {
  const colorMap = {
    indigo: 'border-indigo-200 text-indigo-700 bg-indigo-50/80 shadow-indigo-500/10',
    blue: 'border-blue-200 text-blue-700 bg-blue-50/80 shadow-blue-500/10',
    cyan: 'border-sky-200 text-sky-700 bg-sky-50/80 shadow-sky-500/10',
    emerald: 'border-emerald-200 text-emerald-700 bg-emerald-50/80 shadow-emerald-500/10',
    amber: 'border-amber-200 text-amber-800 bg-amber-50/80 shadow-amber-500/10',
    rose: 'border-rose-200 text-rose-700 bg-rose-50/80 shadow-rose-500/10',
  };

  const accentClass = colorMap[color] || colorMap.indigo;

  return (
    <div className="bg-white/95 backdrop-blur-xs border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-300 relative overflow-hidden group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{title}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
            {badge && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200/80">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl border ${accentClass} shrink-0 shadow-xs transition-transform group-hover:scale-110`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Elegant top color highlight ribbon */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        color === 'rose' ? 'bg-gradient-to-r from-rose-500 to-pink-500' :
        color === 'amber' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
        color === 'emerald' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 
        'bg-gradient-to-r from-indigo-600 to-violet-600'
      }`} />
    </div>
  );
}
