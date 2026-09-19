import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import AlertCard from '../components/AlertCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../services/api';
import { Bell, Filter, CheckCircle2, Clock, AlertTriangle, CheckCheck, Sparkles, Activity, RotateCcw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, LabelList } from 'recharts';
import { DEMO_ALERTS } from '../data/demoData';

export default function Alerts() {
  const context = useOutletContext();
  const onAlertResolved = context?.onAlertResolved;

  const [alerts, setAlerts] = useState([]);
  const [statusTab, setStatusTab] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    try {
      const data = await api.getAlerts();
      setAlerts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledge = async (id) => {
    await api.acknowledgeAlert(id);
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a))
    );
  };

  const handleResolve = async (id) => {
    // Immediate optimistic update so bar graph animates instantly
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'RESOLVED' } : a))
    );
    if (onAlertResolved) {
      onAlertResolved(id);
    }

    try {
      await api.resolveAlert(id);
    } catch (err) {
      console.warn('API resolve notice:', err);
    }
  };

  const handleBatchResolveAll = async () => {
    const unverified = alerts.filter(a => a.status !== 'RESOLVED');
    setAlerts(prev => prev.map(a => ({ ...a, status: 'RESOLVED' })));
    for (const a of unverified) {
      if (onAlertResolved) onAlertResolved(a.id);
      try {
        await api.resolveAlert(a.id);
      } catch (err) {
        console.warn('API resolve notice:', err);
      }
    }
  };

  const handleResetDistribution = async () => {
    setLoading(true);
    try {
      await api.resetAlertDistribution();
      const data = await api.getAlerts();
      if (Array.isArray(data) && data.length > 0) {
        setAlerts(data);
      } else {
        setAlerts([...DEMO_ALERTS]);
      }
    } catch (err) {
      console.warn('Reset distribution fallback:', err);
      setAlerts([...DEMO_ALERTS]);
    } finally {
      setLoading(false);
      setRiskFilter('ALL');
      setStatusTab('ALL');
      if (context?.refreshStats) {
        context.refreshStats();
      }
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    const matchStatus = statusTab === 'ALL' || a.status === statusTab;
    const matchRisk = riskFilter === 'ALL' || a.risk_level === riskFilter;
    return matchStatus && matchRisk;
  });

  const counts = {
    all: alerts.length,
    new: alerts.filter((a) => a.status === 'NEW').length,
    ack: alerts.filter((a) => a.status === 'ACKNOWLEDGED').length,
    resolved: alerts.filter((a) => a.status === 'RESOLVED').length,
  };

  const riskCounts = {
    all: alerts.length,
    high: alerts.filter((a) => a.risk_level === 'HIGH').length,
    medium: alerts.filter((a) => a.risk_level === 'MEDIUM').length,
    low: alerts.filter((a) => a.risk_level === 'LOW').length,
  };

  const activeCount = counts.new + counts.ack;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-rose-600" />
            Safety Alert Dispatch Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Active alerts requiring staff response. Resolving an alert decrements the operational active queue count.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleResetDistribution}
            className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            title="Reset alerts to a realistic balance of High, Medium, and Low risks"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
            <span>🔄 Reset Risk Distribution</span>
          </button>

          <div className="text-xs font-semibold bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 shadow-xs">
            Active Queue: <strong className="text-rose-600 font-bold">{activeCount}</strong> alerts
          </div>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-1.5 focus:border-blue-500 font-semibold shadow-xs cursor-pointer"
          >
            <option value="ALL">All Risk Severities ({riskCounts.all})</option>
            <option value="HIGH">🔴 HIGH Risk Only ({riskCounts.high})</option>
            <option value="MEDIUM">🟡 MEDIUM Risk Only ({riskCounts.medium})</option>
            <option value="LOW">🟢 LOW Risk Only ({riskCounts.low})</option>
          </select>
        </div>
      </div>

      {/* Live Incident Remediation & Resolution Bar Chart */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              LIVE TELEMETRY
            </span>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              Incident Resolution Velocity (Bar Graph Updates Live on Resolve)
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Resolution Rate: <strong className="text-emerald-600 font-mono font-bold">{counts.all > 0 ? Math.round((counts.resolved / counts.all) * 100) : 100}%</strong>
            </span>
            <button
              onClick={handleResetDistribution}
              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-lg shadow-xs transition flex items-center gap-1 cursor-pointer"
              title="Reset alerts back to High, Medium, and Low distribution"
            >
              <RotateCcw className="w-3 h-3 text-indigo-600" />
              <span>🔄 Reset Risks</span>
            </button>
            {activeCount > 0 && (
              <button
                onClick={handleBatchResolveAll}
                className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-lg shadow-xs transition flex items-center gap-1 cursor-pointer"
              >
                <span>⚡ Resolve All ({activeCount})</span>
              </button>
            )}
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center pt-3">
          {/* Recharts Bar Graph */}
          <div className="md:col-span-3 h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Urgent Unresolved', count: counts.new, fill: '#EF4444' },
                  { name: 'Under Investigation', count: counts.ack, fill: '#F59E0B' },
                  { name: 'Problems Solved', count: counts.resolved, fill: '#10B981' },
                ]}
                margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  <Cell fill="#EF4444" />
                  <Cell fill="#F59E0B" />
                  <Cell fill="#10B981" />
                  <LabelList dataKey="count" position="top" fill="#334155" fontSize={11} fontWeight={700} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Metrics */}
          <div className="space-y-2.5 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Unresolved:
              </span>
              <strong className="font-mono text-rose-700">{counts.new}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> In Progress:
              </span>
              <strong className="font-mono text-amber-700">{counts.ack}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Problems Solved:
              </span>
              <strong className="font-mono text-emerald-700">{counts.resolved}</strong>
            </div>
            <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500">
              💡 Click "✓ Resolve Alert" on any item below to see the green bar immediately rise!
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setStatusTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            statusTab === 'ALL'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>All Alerts</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700 font-bold">
            {counts.all}
          </span>
        </button>

        <button
          onClick={() => setStatusTab('NEW')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            statusTab === 'NEW'
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          <span>New & Unverified</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-800 font-bold">
            {counts.new}
          </span>
        </button>

        <button
          onClick={() => setStatusTab('ACKNOWLEDGED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            statusTab === 'ACKNOWLEDGED'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Acknowledged</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
            {counts.ack}
          </span>
        </button>

        <button
          onClick={() => setStatusTab('RESOLVED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
            statusTab === 'RESOLVED'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Resolved</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
            {counts.resolved}
          </span>
        </button>
      </div>

      {/* Quick Risk Severity Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
        <span className="text-slate-400 font-semibold text-[11px] shrink-0">Severity:</span>
        <button
          onClick={() => setRiskFilter('ALL')}
          className={`px-3 py-1 rounded-lg font-bold transition shrink-0 cursor-pointer ${
            riskFilter === 'ALL'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Severities ({riskCounts.all})
        </button>
        <button
          onClick={() => setRiskFilter('HIGH')}
          className={`px-3 py-1 rounded-lg font-bold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
            riskFilter === 'HIGH'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          <span>🔴 HIGH Risk ({riskCounts.high})</span>
        </button>
        <button
          onClick={() => setRiskFilter('MEDIUM')}
          className={`px-3 py-1 rounded-lg font-bold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
            riskFilter === 'MEDIUM'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          <span>🟡 MEDIUM Risk ({riskCounts.medium})</span>
        </button>
        <button
          onClick={() => setRiskFilter('LOW')}
          className={`px-3 py-1 rounded-lg font-bold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
            riskFilter === 'LOW'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          <span>🟢 LOW Risk ({riskCounts.low})</span>
        </button>
      </div>

      {/* Alerts Grid */}
      {loading && alerts.length === 0 ? (
        <LoadingSpinner text="Connecting to alert queue..." />
      ) : filteredAlerts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-3 shadow-sm">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h4 className="text-base font-bold text-slate-800">No safety alerts matching current filter.</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            All items in this view have either been resolved or no events match your current criteria.
          </p>
          <div>
            <button
              onClick={handleResetDistribution}
              className="mt-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>🔄 Reset Risk Distribution (High, Medium, Low)</span>
            </button>
          </div>
        </div>
      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAcknowledge={handleAcknowledge}
              onResolve={handleResolve}
            />
          ))}
        </div>
      )}
    </div>
  );
}
