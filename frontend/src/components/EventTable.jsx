import React, { useState, useMemo } from 'react';
import RiskBadge from './RiskBadge';
import { Search, Filter, Eye, ChevronDown } from 'lucide-react';

export default function EventTable({ events = [], onViewDetail }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchSearch =
        !searchTerm ||
        ev.child_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ev.zone && ev.zone.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchRisk = riskFilter === 'ALL' || ev.risk_level === riskFilter;
      const matchType = typeFilter === 'ALL' || ev.event_type === typeFilter;

      return matchSearch && matchRisk && matchType;
    });
  }, [events, searchTerm, riskFilter, typeFilter]);

  const uniqueTypes = useMemo(() => {
    const set = new Set(events.map((e) => e.event_type));
    return Array.from(set);
  }, [events]);

  const formatTime = (ts) => {
    if (!ts) return 'Just now';
    if (typeof ts === 'string' && ts.includes('T')) {
      return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    return ts;
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by child token (e.g. C-017) or event type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-sm text-slate-900 placeholder-slate-400 transition shadow-xs"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {/* Risk Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 focus:border-blue-500 shadow-xs font-medium"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 focus:border-blue-500 max-w-[180px] truncate shadow-xs font-medium"
          >
            <option value="ALL">All Event Types</option>
            {uniqueTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3.5">Time</th>
              <th className="px-4 py-3.5">Token ID</th>
              <th className="px-4 py-3.5">Event Type</th>
              <th className="px-4 py-3.5">Zone</th>
              <th className="px-4 py-3.5">Confidence</th>
              <th className="px-4 py-3.5">Risk Level</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-slate-400 font-medium">
                  No safety events found matching your filter criteria.
                </td>
              </tr>
            ) : (
              filteredEvents.map((ev) => (
                <tr
                  key={ev.id}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  onClick={() => onViewDetail && onViewDetail(ev)}
                >
                  <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                    {formatTime(ev.timestamp)}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-blue-700">
                    {ev.child_id}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {ev.event_type}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {ev.zone || 'Campus'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500 font-semibold">
                    {Math.round((ev.confidence || 0.92) * 100)}%
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <RiskBadge risk={ev.risk_level} size="sm" />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      ev.status === 'ACTIVE'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : ev.status === 'CONFIRMED'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {ev.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetail && onViewDetail(ev);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition"
                      title="View Event Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
