import React, { useState, useEffect } from 'react';
import RiskBadge from '../components/RiskBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../services/api';
import {
  Users,
  Search,
  Filter,
  MapPin,
  Clock,
  Activity,
  ShieldCheck,
  Eye,
  X,
  UserCheck,
  Layers
} from 'lucide-react';

export default function Children() {
  const [childrenList, setChildrenList] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childDetails, setChildDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [zoneFilter, setZoneFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const loadChildren = async () => {
    try {
      const data = await api.getChildren();
      setChildrenList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChildren();
  }, []);

  const handleSelectChild = async (child) => {
    setSelectedChild(child);
    try {
      const details = await api.getChild(child.id);
      setChildDetails(details);
    } catch (e) {
      setChildDetails({ child, recent_events: [] });
    }
  };

  const filteredChildren = childrenList.filter((c) => {
    const matchSearch = !searchTerm || c.anonymous_id.toLowerCase().includes(searchTerm.toLowerCase()) || (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchRisk = riskFilter === 'ALL' || c.risk_level === riskFilter;
    const matchZone = zoneFilter === 'ALL' || c.current_zone === zoneFilter;
    const matchCategory = categoryFilter === 'ALL' || c.category === categoryFilter;
    return matchSearch && matchRisk && matchZone && matchCategory;
  });

  const uniqueZones = Array.from(new Set(childrenList.map((c) => c.current_zone)));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 uppercase">
              Universal Platform
            </span>
            <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
              Children • Adults • Senior Citizens
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-indigo-600" />
            Universal Monitored People Registry
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Privacy-first anonymous tokens covering all age groups (<code className="text-indigo-700 font-mono font-bold">C-200</code>, <code className="text-indigo-700 font-mono font-bold">P-101</code>, <code className="text-indigo-700 font-mono font-bold">SR-301</code>). Zero biometric storage.
          </p>
        </div>

        <div className="text-xs font-mono bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 shadow-xs">
          Active Monitored: <strong className="text-indigo-700">{filteredChildren.length}</strong> / {childrenList.length}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search token or name (e.g. C-200, P-101, SR-301)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-sm text-slate-900 placeholder-slate-400 transition shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 focus:border-indigo-500 shadow-xs font-medium cursor-pointer"
          >
            <option value="ALL">All Demographics</option>
            <option value="CHILD">Children / Students (C-)</option>
            <option value="ADULT">Adults / Campus Staff (P-)</option>
            <option value="SENIOR">Senior Citizens / Elders (SR-)</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 focus:border-indigo-500 shadow-xs font-medium cursor-pointer"
          >
            <option value="ALL">All Risk Bands</option>
            <option value="LOW">LOW Risk</option>
            <option value="MEDIUM">MEDIUM Risk</option>
            <option value="HIGH">HIGH Risk</option>
          </select>

          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 focus:border-indigo-500 max-w-[180px] truncate shadow-xs font-medium cursor-pointer"
          >
            <option value="ALL">All Zones</option>
            {uniqueZones.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </div>
      </div>


      {/* Grid of Children Cards */}
      {loading ? (
        <LoadingSpinner text="Loading anonymous tracking records..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredChildren.map((child) => (
            <div
              key={child.id}
              onClick={() => handleSelectChild(child)}
              className="bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center font-mono font-bold text-xs text-blue-700">
                      ID
                    </div>
                    <div>
                      <h4 className="font-mono font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {child.anonymous_id}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          child.category === 'SENIOR'
                            ? 'bg-amber-100 text-amber-800'
                            : child.category === 'ADULT'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {child.category === 'SENIOR' ? '👴 Senior' : child.category === 'ADULT' ? '👤 Adult' : '🎒 Child'}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Active</span>
                      </div>
                    </div>
                  </div>

                  <RiskBadge risk={child.risk_level} size="sm" showLabel={false} />
                </div>

                <div className="py-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400 flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5" /> Zone:
                    </span>
                    <strong className="text-slate-800 font-semibold">{child.current_zone}</strong>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400 flex items-center gap-1 font-medium">
                      <Activity className="w-3.5 h-3.5" /> Status:
                    </span>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      child.status === 'Attention'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {child.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" /> Last Seen:
                    </span>
                    <span className="font-mono text-slate-500">{child.last_seen || 'Active'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform">
                <span>View Risk Audit Trail</span>
                <Eye className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Child Detail Drawer / Modal */}
      {selectedChild && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative">
            <button
              onClick={() => {
                setSelectedChild(null);
                setChildDetails(null);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-mono font-bold text-lg">
                {selectedChild.anonymous_id}
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Tracking Token: {selectedChild.anonymous_id}</span>
                  <RiskBadge risk={selectedChild.risk_level} size="sm" />
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    selectedChild.category === 'SENIOR'
                      ? 'bg-amber-100 text-amber-800'
                      : selectedChild.category === 'ADULT'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedChild.category === 'SENIOR' ? '👴 Senior Citizen / Elder' : selectedChild.category === 'ADULT' ? '👤 Adult / Campus Staff' : '🎒 Child / Student'}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Anonymous session record • Zero facial recognition data stored
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-mono font-semibold">Current Zone</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedChild.current_zone}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-mono font-semibold">Status</span>
                <p className="text-sm font-bold text-blue-700 mt-0.5">{selectedChild.status}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-mono font-semibold">Risk Score</span>
                <p className="text-sm font-bold text-rose-600 mt-0.5">{selectedChild.risk_score || 50} / 100</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-mono font-semibold">Telemetry</span>
                <p className="text-sm font-bold text-emerald-700 mt-0.5">Active Sync</p>
              </div>
            </div>

            {/* Recent Events List */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Recent Audit Trail Events
              </h4>

              {childDetails?.recent_events?.length > 0 ? (
                <div className="space-y-2">
                  {childDetails.recent_events.map((ev) => (
                    <div
                      key={ev.id}
                      className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{ev.event_type}</span>
                          <span className="text-slate-500 font-normal">at {ev.zone}</span>
                        </div>
                        <p className="text-slate-600 mt-0.5">{ev.description}</p>
                      </div>
                      <div className="text-right">
                        <RiskBadge risk={ev.risk_level} size="sm" showLabel={false} />
                        <div className="text-[10px] font-mono text-slate-500 mt-1">
                          Score: {ev.risk_score}/100
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic p-4 text-center bg-slate-50 rounded-xl border border-slate-200">
                  No critical safety violations recorded for this anonymous ID.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
