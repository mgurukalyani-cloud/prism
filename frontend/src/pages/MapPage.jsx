import React, { useState, useEffect } from 'react';
import MapView from '../components/MapView';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../services/api';
import { MapPin, Shield, Filter, Eye, Layers } from 'lucide-react';

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

  const filteredChildren = childrenData.filter((c) => {
    if (riskFilter === 'ALL') return true;
    return c.risk_level === riskFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <MapPin className="w-7 h-7 text-blue-600" />
            Campus Safety Geofence Map
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Real-time geospatial tracking of anonymous child tokens across defined safety boundaries.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 focus:border-blue-500 font-semibold shadow-xs"
          >
            <option value="ALL">All Child Markers</option>
            <option value="HIGH">HIGH Risk Only</option>
            <option value="MEDIUM">MEDIUM Risk Only</option>
            <option value="LOW">LOW Risk Only</option>
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
          <h4 className="text-sm font-bold text-slate-900 mt-1">Playgrounds & Classrooms</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervised areas with perimeter barriers. Base heuristic risk: 10.
          </p>
        </div>

        <div className="bg-white border border-amber-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-mono font-bold text-amber-700 uppercase">WARNING ZONES (AMBER)</span>
          <h4 className="text-sm font-bold text-slate-900 mt-1">Parking & Transit Circulation</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Vehicle interaction lanes. Extended lingering triggers alert. Base risk: 40.
          </p>
        </div>

        <div className="bg-white border border-rose-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-mono font-bold text-rose-700 uppercase">RESTRICTED ZONES (RED)</span>
          <h4 className="text-sm font-bold text-slate-900 mt-1">Main Gate & Construction</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Immediate boundary breach. Triggers instant HIGH risk alert. Base risk: 80-90.
          </p>
        </div>
      </div>
    </div>
  );
}
