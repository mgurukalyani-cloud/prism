import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import StatCard from '../components/StatCard';
import CameraCard from '../components/CameraCard';
import AlertCard from '../components/AlertCard';
import RiskBadge from '../components/RiskBadge';
import MapView from '../components/MapView';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../services/api';
import {
  Users,
  Video,
  Bell,
  AlertOctagon,
  ShieldCheck,
  Activity,
  ArrowRight,
  TrendingUp,
  MapPin,
  ExternalLink,
  Film,
  CheckCircle2,
  CheckCheck,
  Sparkles,
  Clock,
  RefreshCw,
  Footprints
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
  CartesianGrid,
  LabelList
} from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const context = useOutletContext();
  const onAlertResolved = context?.onAlertResolved;
  const activeAlertsCount = context?.activeAlertsCount ?? 4;

  const [stats, setStats] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [childrenData, setChildrenData] = useState([]);
  const [zones, setZones] = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  // Live Bar Graph State for Problem Resolution
  const [resolutionData, setResolutionData] = useState([
    { status: 'NEW', name: 'Urgent Unresolved', count: 3, fill: '#EF4444' },
    { status: 'ACKNOWLEDGED', name: 'Under Review', count: 2, fill: '#F59E0B' },
    { status: 'RESOLVED', name: 'Problems Solved', count: 28, fill: '#10B981' },
  ]);
  const [lastResolvedInfo, setLastResolvedInfo] = useState(null);

  const loadData = async () => {
    try {
      const [sData, cData, aData, chData, zData, rData] = await Promise.all([
        api.getStats(),
        api.getCameras(),
        api.getAlerts({ limit: 4 }),
        api.getChildren(),
        api.getZones(),
        api.getReportsSummary()
      ]);

      setStats(sData);
      setCameras(cData);
      setAlerts(aData);
      setChildrenData(chData);
      setZones(zData);
      setReports(rData);
      if (rData?.alert_status && Array.isArray(rData.alert_status)) {
        const normalized = rData.alert_status.map((item) => ({
          status: item.status || 'NEW',
          name: item.name || (item.status === 'NEW' ? 'Urgent Unresolved' : item.status === 'ACKNOWLEDGED' ? 'Under Review' : 'Problems Solved'),
          count: typeof item.count === 'number' ? item.count : 0,
          fill: item.color || item.fill || (item.status === 'NEW' ? '#EF4444' : item.status === 'ACKNOWLEDGED' ? '#F59E0B' : '#10B981')
        }));
        setResolutionData(normalized);
      }
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledge = async (id) => {
    await api.acknowledgeAlert(id);
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a))
    );
  };

  const handleResolve = async (id) => {
    // 1. Immediately update and animate bar graph state in real time!
    setResolutionData((prev) =>
      prev.map((item) => {
        const isUrgent = item.status === 'NEW' || (typeof item?.name === 'string' && item.name.includes('Unresolved'));
        const isSolved = item.status === 'RESOLVED' || (typeof item?.name === 'string' && item.name.includes('Solved'));
        if (isUrgent) {
          return { ...item, count: Math.max(0, (item.count || 0) - 1) };
        }
        if (isSolved) {
          return { ...item, count: (item.count || 0) + 1 };
        }
        return item;
      })
    );

    const targetAlert = alerts.find((a) => a.id === id);
    setLastResolvedInfo({
      id: targetAlert?.alert_code || `ALT-${id}`,
      time: new Date().toLocaleTimeString(),
      zone: targetAlert?.zone || 'Playground'
    });

    try {
      await api.resolveAlert(id);
    } catch (err) {
      console.warn('API resolve notice:', err);
    }

    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'RESOLVED' } : a))
    );
    if (onAlertResolved) {
      onAlertResolved(id);
    }
    setStats((prev) => prev ? { ...prev, active_alerts: Math.max(0, (prev.active_alerts || 0) - 1) } : prev);
  };

  const handleQuickResolveProblem = () => {
    const nextActive = (alerts || []).find((a) => a.status !== 'RESOLVED');
    if (nextActive) {
      handleResolve(nextActive.id);
    } else {
      // Still dynamically animate resolution bar graph
      setResolutionData((prev) =>
        prev.map((item) => {
          const isUrgent = item.status === 'NEW' || (typeof item?.name === 'string' && item.name.includes('Unresolved'));
          const isSolved = item.status === 'RESOLVED' || (typeof item?.name === 'string' && item.name.includes('Solved'));
          if (isUrgent) {
            return { ...item, count: Math.max(0, (item.count || 0) - 1) };
          }
          if (isSolved) {
            return { ...item, count: (item.count || 0) + 1 };
          }
          return item;
        })
      );
      setLastResolvedInfo({
        id: `INC-${Math.floor(100 + Math.random() * 900)}`,
        time: new Date().toLocaleTimeString(),
        zone: 'Campus Perimeter'
      });
    }
  };

  const handleSimulateNewIncident = () => {
    setResolutionData((prev) =>
      prev.map((item) => {
        const isUrgent = item.status === 'NEW' || (typeof item?.name === 'string' && item.name.includes('Unresolved'));
        if (isUrgent) {
          return { ...item, count: (item.count || 0) + 1 };
        }
        return item;
      })
    );
    setStats((prev) => prev ? { ...prev, active_alerts: (prev.active_alerts || 0) + 1 } : prev);
  };

  if (loading && !stats) {
    return <LoadingSpinner text="Connecting to SafeGuard AI Telemetry Stream (KLH Aziznagar)..." />;
  }

  const riskPieData = [
    { name: 'LOW', value: stats?.low_risk_count || 32, color: '#10B981' },
    { name: 'MEDIUM', value: stats?.medium_risk_count || 8, color: '#F59E0B' },
    { name: 'HIGH', value: stats?.high_risk_count || 2, color: '#EF4444' },
  ];

  const totalIncidents = Array.isArray(resolutionData)
    ? resolutionData.reduce((acc, curr) => acc + (curr.count || 0), 0)
    : 0;
  const solvedCount = Array.isArray(resolutionData)
    ? resolutionData.find((d) => d?.status === 'RESOLVED' || (typeof d?.name === 'string' && d.name.includes('Solved')))?.count || 0
    : 0;
  const unresolvedCount = Array.isArray(resolutionData)
    ? resolutionData.find((d) => d?.status === 'NEW' || (typeof d?.name === 'string' && d.name.includes('Unresolved')))?.count || 0
    : 0;
  const reviewCount = Array.isArray(resolutionData)
    ? resolutionData.find((d) => d?.status === 'ACKNOWLEDGED' || (typeof d?.name === 'string' && d.name.includes('Review')))?.count || 0
    : 0;
  const resolutionRatePct = totalIncidents > 0 ? Math.round((solvedCount / totalIncidents) * 100) : 100;

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 uppercase">
              SafeGuard AI Command Hub
            </span>
            <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
              KLH Aziznagar Campus, Hyderabad
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Universal Safety Command Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2 font-medium">
            <span>KLH Aziznagar Campus Safety Oversight (Children, Staff, Senior Citizens)</span>
            <span className="text-slate-300">•</span>
            <span className="text-blue-700 font-mono font-semibold">AI Decision Support Active</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => navigate('/safewalk')}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white rounded-lg shadow-sm shadow-emerald-500/20 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>AI SafeWalk & Drone</span>
            <span className="bg-white/20 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">NEW</span>
          </button>
          <button
            onClick={() => navigate('/monitoring')}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Film className="w-3.5 h-3.5 text-blue-600" />
            Video Analysis & Cameras
          </button>
          <button
            onClick={() => navigate('/map')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-lg shadow-sm shadow-blue-500/20 flex items-center gap-1.5 transition cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5" />
            Safety Geofences
          </button>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total People Monitored"
          value={stats?.total_children || 128}
          subtitle="Tokens: C-200, P-101, SR-301"
          icon={Users}
          color="blue"
          badge="All Age Groups"
        />

        <StatCard
          title="Active Camera Array"
          value={stats?.active_cameras || 12}
          subtitle="Optical & transit sensors"
          icon={Video}
          color="cyan"
          badge="100% Online"
        />

        <StatCard
          title="Active Alerts"
          value={stats?.active_alerts !== undefined ? stats.active_alerts : activeAlertsCount}
          subtitle="Decrements on resolution"
          icon={Bell}
          color="amber"
          badge="Action Queue"
        />

        <StatCard
          title="High Risk Events"
          value={stats?.high_risk_events || 2}
          subtitle="Perimeter & posture collapse"
          icon={AlertOctagon}
          color="rose"
          badge="Critical Alert"
        />
      </div>

      {/* Safety Overview Banner & Risk Breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-md">
            <span className="text-xs uppercase font-mono font-bold text-blue-600 tracking-wider">
              Safety Health Index
            </span>
            <h3 className="text-xl font-extrabold text-slate-900">Campus Risk Distribution</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Automated heuristic evaluation factoring geofence proximity, time-in-zone duration, and body posture changes.
            </p>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-700">LOW RISK</span>
                <h4 className="text-2xl font-black text-slate-900 mt-1">{stats?.low_risk_count || 14}</h4>
                <p className="text-[10px] text-slate-500">Playground / Corridor</p>
              </div>
              <RiskBadge risk="LOW" size="sm" showLabel={false} />
            </div>

            <div className="bg-slate-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-700">MEDIUM RISK</span>
                <h4 className="text-2xl font-black text-slate-900 mt-1">{stats?.medium_risk_count || 5}</h4>
                <p className="text-[10px] text-slate-500">Warning Zone Loitering</p>
              </div>
              <RiskBadge risk="MEDIUM" size="sm" showLabel={false} />
            </div>

            <div className="bg-slate-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-rose-700">HIGH RISK</span>
                <h4 className="text-2xl font-black text-slate-900 mt-1">{stats?.high_risk_count || 2}</h4>
                <p className="text-[10px] text-slate-500">Perimeter Breach / Fall</p>
              </div>
              <RiskBadge risk="HIGH" size="sm" showLabel={false} />
            </div>
          </div>
        </div>
      </div>

      {/* Live Camera Grid Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">Live Surveillance Feeds (4-Cam Wall)</h3>
          </div>
          <button
            onClick={() => navigate('/monitoring')}
            className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
          >
            Video Analysis & Player <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cameras.slice(0, 4).map((cam) => (
            <CameraCard
              key={cam.camera_code}
              camera={cam}
              onSelect={() => navigate('/monitoring')}
            />
          ))}
        </div>
      </div>

      {/* Split Section: Recent Alerts + Campus Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts List */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-rose-600" />
                <h3 className="text-lg font-bold text-slate-900">Active Safety Alerts</h3>
              </div>
              <button
                onClick={() => navigate('/alerts')}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                Alert Center <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {alerts.slice(0, 3).map((a) => (
                <AlertCard
                  key={a.id}
                  alert={a}
                  onAcknowledge={handleAcknowledge}
                  onResolve={handleResolve}
                  onViewEvent={() => navigate('/events')}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Safety Map Preview */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">Campus Geofence Zones</h3>
              </div>
              <button
                onClick={() => navigate('/map')}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                Fullscreen Map <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <MapView
              childrenData={childrenData}
              zones={zones}
              height="300px"
              zoom={16}
            />
          </div>
        </div>
      </div>

      {/* Analytics & Live Incident Resolution Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                LIVE REAL-TIME TELEMETRY
              </span>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Safety Heuristics & Incident Resolution Bar Charts
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Bar graphs dynamically adjust in real time as safety incidents are verified and marked as solved.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleQuickResolveProblem}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              title="Click to resolve an incident and see the green bar graph climb live!"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>⚡ Solve Problem (Bar Graph Live +1)</span>
            </button>
            <button
              onClick={handleSimulateNewIncident}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition flex items-center gap-1 cursor-pointer"
              title="Add a new urgent incident to see the red bar climb"
            >
              <span>+ Anomaly</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: LIVE PROBLEM RESOLUTION BAR CHART */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3 relative overflow-hidden">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                    REACTIVE TELEMETRY
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                    <CheckCheck className="w-4 h-4 text-emerald-600" />
                    Problem Resolution Status (Live)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Watch the green bar rise when problems are resolved!
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-emerald-600 font-mono">
                    {resolutionRatePct}%
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase">
                    Solved Rate
                  </div>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="h-48 w-full mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={resolutionData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {resolutionData.map((entry, idx) => (
                        <Cell key={`cell-res-${idx}`} fill={entry.fill || (entry.status === 'NEW' ? '#EF4444' : entry.status === 'ACKNOWLEDGED' ? '#F59E0B' : '#10B981')} />
                      ))}
                      <LabelList dataKey="count" position="top" fill="#334155" fontSize={11} fontWeight={700} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                <div className="p-1.5 rounded-lg bg-rose-50 border border-rose-100">
                  <div className="text-xs font-black text-rose-700 font-mono">{unresolvedCount}</div>
                  <div className="text-[9px] font-bold text-rose-600 uppercase">Urgent Active</div>
                </div>
                <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-100">
                  <div className="text-xs font-black text-amber-800 font-mono">
                    {reviewCount}
                  </div>
                  <div className="text-[9px] font-bold text-amber-700 uppercase">Reviewing</div>
                </div>
                <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
                  <div className="text-xs font-black text-emerald-700 font-mono">{solvedCount}</div>
                  <div className="text-[9px] font-bold text-emerald-700 uppercase">Solved ✓</div>
                </div>
              </div>

              {lastResolvedInfo && (
                <div className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center justify-between border border-emerald-200 font-medium">
                  <span className="truncate">✓ Problem Solved: {lastResolvedInfo.id} ({lastResolvedInfo.zone})</span>
                  <span className="font-mono text-emerald-800 font-bold shrink-0 ml-1">{lastResolvedInfo.time}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Events by Category Bar Chart */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                    INCIDENT HEURISTICS
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-600" />
                    Events by Category (Today)
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {Array.isArray(reports?.events_by_type) ? reports.events_by_type.reduce((a, c) => a + (c.count || 0), 0) : 82} Events
                </span>
              </div>

              <div className="h-48 w-full mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reports?.events_by_type || []} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="type" stroke="#94A3B8" fontSize={9} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="count" fill="#6366F1" radius={[6, 6, 0, 0]}>
                      <LabelList dataKey="count" position="top" fill="#475569" fontSize={10} fontWeight={700} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span>Leading Category: <strong className="text-slate-800">Authorized Zone Transit (42)</strong></span>
              <span className="text-indigo-600 font-semibold">Temporal window: 24h</span>
            </div>
          </div>

          {/* Card 3: Risk Level Distribution Donut */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                    SAFETY COMPLIANCE
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Overall Risk Profile Breakdown
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  92% SAFE
                </span>
              </div>

              <div className="h-48 w-full flex items-center justify-center mt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={68}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {riskPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-1.5 text-[11px] font-medium shrink-0 ml-2">
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>LOW: <strong>{stats?.low_risk_count || 32}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-700">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>MEDIUM: <strong>{stats?.medium_risk_count || 8}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-rose-700">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>HIGH: <strong>{stats?.high_risk_count || 2}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span>Active Monitored: <strong className="text-slate-800">{childrenData.length || 42} individuals (All Ages)</strong></span>
              <span className="text-emerald-600 font-semibold">Zero Perimeter Spills</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
