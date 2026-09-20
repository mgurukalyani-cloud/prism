import React, { useState, useEffect } from 'react';
import MapView from '../components/MapView';
import LoadingSpinner from '../components/LoadingSpinner';
import SafeWalkPage from './SafeWalkPage';
import { api } from '../services/api';
import { MapPin, Shield, Filter, Eye, Layers, Footprints } from 'lucide-react';

export default function MapPage() {
  const [childrenData, setChildrenData] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState('ALL');

  const loadData = async () => {
    try {
      const [chData, zData] = await Promise.all([
        api.getChildren(),
        api.getZones()
      ]);
      setChildrenData(chData);
      setZones(zData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('GEOFENCE'); // 'GEOFENCE' | 'SAFEWALK'

  const filteredChildren = childrenData.filter((c) => {
    const matchRisk = riskFilter === 'ALL' || c.risk_level === riskFilter;
    const matchCategory = categoryFilter === 'ALL' || c.category === categoryFilter;
    return matchRisk && matchCategory;
  });

  return (
    <div className="space-y-6">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 shadow-xs w-fit">
        <button
          onClick={() => setActiveTab('GEOFENCE')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'GEOFENCE'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Campus Geofence Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('SAFEWALK')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'SAFEWALK'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Footprints className="w-4 h-4" />
          <span>AI SafeWalk & Drone Suite</span>
          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-white/20 text-white">NEW</span>
        </button>
      </div>

      {activeTab === 'SAFEWALK' ? (
        <SafeWalkPage />
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 uppercase">
                  📍 Hyderabad, Telangana – 500075
                </span>
                <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                  Moinabad Road • Near TS Police Academy
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5 mt-1">
                <MapPin className="w-7 h-7 text-indigo-600" />
                KLH Aziznagar Campus Safety Geofence Map
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                Real-time geospatial monitoring of Children, Adults, and Senior Citizens across optical campus safety geofences.
              </p>
            </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 focus:border-indigo-500 font-semibold shadow-xs cursor-pointer"
          >
            <option value="ALL">All Demographics (Everyone)</option>
            <option value="CHILD">Children / Students (C-)</option>
            <option value="ADULT">Adults / Campus Staff (P-)</option>
            <option value="SENIOR">Senior Citizens / Elders (SR-)</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 focus:border-indigo-500 font-semibold shadow-xs cursor-pointer"
          >
            <option value="ALL">All Risk Severities</option>
            <option value="HIGH">🔴 HIGH Risk Only</option>
            <option value="MEDIUM">🟡 MEDIUM Risk Only</option>
            <option value="LOW">🟢 LOW Risk Only</option>
          </select>
        </div>
      </div>


      {/* Map Container Card */}
      {loading ? (
        <LoadingSpinner text="Rendering vector campus map..." />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <MapView
            childrenData={filteredChildren}
            zones={zones}
            height="620px"
            zoom={16}
          />
        </div>
      )}

      {/* Zones Overview Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-emerald-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-mono font-bold text-emerald-700 uppercase">SAFE ZONES (GREEN)</span>
          <h4 className="text-sm font-bold text-slate-900 mt-1">KLH Academic Block & Central Plaza</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Classrooms, seminar halls, sports ground. Base heuristic risk: 10.
          </p>
        </div>

        <div className="bg-white border border-amber-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-mono font-bold text-amber-700 uppercase">WARNING ZONES (AMBER)</span>
          <h4 className="text-sm font-bold text-slate-900 mt-1">Staff Parking & Bus Terminal</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Vehicle interaction & bus boarding bays. Lingering alerts active. Base risk: 35-40.
          </p>
        </div>

        <div className="bg-white border border-rose-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-mono font-bold text-rose-700 uppercase">RESTRICTED ZONES (RED)</span>
          <h4 className="text-sm font-bold text-slate-900 mt-1">Moinabad Road Gate & TSPA Boundary</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Arterial highway road access and perimeter fence line. Immediate HIGH risk alert. Base risk: 80-90.
          </p>
        </div>
      </div>
        </>
      )}
    </div>
  );
}

