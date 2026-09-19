import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../services/api';
import {
  BarChart3,
  Download,
  Filter,
  Calendar,
  Shield,
  Activity,
  CheckCircle,
  FileSpreadsheet,
  CheckCheck,
  CheckCircle2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  LabelList
} from 'recharts';

export default function Reports() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('TODAY');

  const loadReports = async () => {
    try {
      const data = await api.getReportsSummary();
      if (data?.alert_status && Array.isArray(data.alert_status)) {
        data.alert_status = data.alert_status.map((item) => ({
          status: item.status || 'NEW',
          name: item.name || (item.status === 'NEW' ? 'Urgent Unresolved' : item.status === 'ACKNOWLEDGED' ? 'Under Review' : 'Problems Solved'),
          count: typeof item.count === 'number' ? item.count : 0,
          color: item.color || (item.status === 'NEW' ? '#EF4444' : item.status === 'ACKNOWLEDGED' ? '#F59E0B' : '#10B981')
        }));
      }
      setReports(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleExportCsv = () => {
    const url = api.exportCsvUrl();
    window.open(url, '_blank');
  };

  const handleLiveResolveProblem = () => {
    setReports((prev) => {
      if (!prev || !prev.alert_status) return prev;
      const updatedStatus = prev.alert_status.map((item) => {
        if (item.status === 'NEW' || item.name?.includes('Unresolved')) {
          return { ...item, count: Math.max(0, item.count - 1) };
        }
        if (item.status === 'RESOLVED' || item.name?.includes('Solved')) {
          return { ...item, count: item.count + 1 };
        }
        return item;
      });
      return { ...prev, alert_status: updatedStatus };
    });
  };

  const handleLiveSimulateIncident = () => {
    setReports((prev) => {
      if (!prev || !prev.alert_status) return prev;
      const updatedStatus = prev.alert_status.map((item) => {
        if (item.status === 'NEW' || item.name?.includes('Unresolved')) {
          return { ...item, count: item.count + 1 };
        }
        return item;
      });
      return { ...prev, alert_status: updatedStatus };
    });
  };

  if (loading && !reports) {
    return <LoadingSpinner text="Compiling safety analytics & incident metrics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-blue-600" />
            Safety Analytics & Reporting
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Aggregated safety compliance patterns, response metrics, and temporal risk analytics.
          </p>
        </div>

        {/* Date Selector & Export Button */}
        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 focus:border-blue-500 font-semibold shadow-xs"
          >
            <option value="TODAY">Today (Live 24h)</option>
            <option value="WEEK">Past 7 Days</option>
            <option value="MONTH">Past 30 Days</option>
          </select>

          <button
            onClick={handleExportCsv}
            className="px-4 py-2 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white text-xs shadow-sm shadow-blue-500/20 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Safety CSV
          </button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs uppercase font-mono font-bold text-slate-400">Total Incidents Evaluated</span>
          <h3 className="text-3xl font-black text-slate-900 mt-1">{reports?.total_events || 85}</h3>
          <p className="text-xs text-blue-600 mt-1 font-medium">Computer vision & geofence events</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs uppercase font-mono font-bold text-slate-400">Dispatched Alerts</span>
          <h3 className="text-3xl font-black text-rose-600 mt-1">{reports?.total_alerts || 14}</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Requiring supervisor acknowledgment</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs uppercase font-mono font-bold text-slate-400">Mean Verification Time</span>
          <h3 className="text-3xl font-black text-emerald-600 mt-1">42 sec</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Target response SLA: &lt; 90 seconds</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events by Category */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            Safety Events by Category
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reports?.events_by_type || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="type" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Temporal Activity Area Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-600" />
            Incident Frequency Over Time (Hours)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reports?.events_over_time || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="count" stroke="#2563EB" fill="rgba(37,99,235,0.1)" strokeWidth={2} />
                <Area type="monotone" dataKey="high_risk" stroke="#DC2626" fill="rgba(220,38,38,0.15)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Events by Zone */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            Geographic Density by Campus Zone
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reports?.events_by_zone || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis type="category" dataKey="zone" stroke="#94A3B8" fontSize={11} width={120} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alert Resolution Status Bar Chart (Live) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  LIVE BAR GRAPH
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Alert Response & Problem Resolution Status
              </h3>
            </div>

            {/* Live Interactive Trigger Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleLiveResolveProblem}
                className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-xs transition flex items-center gap-1 cursor-pointer"
                title="Click to resolve problem and watch green bar rise!"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>⚡ Solve Problem (+1 Solved)</span>
              </button>
              <button
                onClick={handleLiveSimulateIncident}
                className="px-2 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition cursor-pointer"
                title="Simulate new urgent incident (+1 Red)"
              >
                <span>+ Issue</span>
              </button>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reports?.alert_status || []} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {(reports?.alert_status || []).map((entry, idx) => (
                    <Cell key={`cell-rep-${idx}`} fill={entry.color || (entry.status === 'NEW' ? '#EF4444' : entry.status === 'ACKNOWLEDGED' ? '#F59E0B' : '#10B981')} />
                  ))}
                  <LabelList dataKey="count" position="top" fill="#334155" fontSize={11} fontWeight={700} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
            <div className="p-1.5 rounded-xl bg-rose-50 border border-rose-100">
              <span className="text-[10px] text-rose-600 font-bold uppercase">Urgent Active</span>
              <div className="text-sm font-black text-rose-700 font-mono mt-0.5">
                {reports?.alert_status?.find(s => s.status === 'NEW' || s.name?.includes('Unresolved'))?.count || 0}
              </div>
            </div>
            <div className="p-1.5 rounded-xl bg-amber-50 border border-amber-100">
              <span className="text-[10px] text-amber-700 font-bold uppercase">Under Review</span>
              <div className="text-sm font-black text-amber-800 font-mono mt-0.5">
                {reports?.alert_status?.find(s => s.status === 'ACKNOWLEDGED' || s.name?.includes('Review'))?.count || 0}
              </div>
            </div>
            <div className="p-1.5 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="text-[10px] text-emerald-700 font-bold uppercase">Problems Solved</span>
              <div className="text-sm font-black text-emerald-700 font-mono mt-0.5">
                {reports?.alert_status?.find(s => s.status === 'RESOLVED' || s.name?.includes('Solved'))?.count || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
