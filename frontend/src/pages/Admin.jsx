import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../services/api';
import {
  ShieldCheck,
  Camera,
  MapPin,
  Sliders,
  Plus,
  Check,
  AlertCircle,
  Database,
  Cpu,
  Layers
} from 'lucide-react';

export default function Admin() {
  const [cameras, setCameras] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Camera Form State
  const [newCam, setNewCam] = useState({
    camera_code: 'CAM-05',
    name: 'East Sports Complex',
    location: 'Athletics Ground',
    zone_name: 'Main Playground',
    status: 'ONLINE'
  });

  // New Zone Form State
  const [newZone, setNewZone] = useState({
    name: 'Science Wing Courtyard',
    zone_type: 'Safe Zone',
    description: 'Enclosed open-air study patio',
    base_risk_score: 15
  });

  // Risk Rule Configuration State
  const [riskRules, setRiskRules] = useState([
    { event: 'Safe Zone Normal', baseScore: 10, threshold: 30, level: 'LOW' },
    { event: 'Warning Zone Lingering', baseScore: 40, threshold: 70, level: 'MEDIUM' },
    { event: 'Restricted Zone Breach', baseScore: 85, threshold: 71, level: 'HIGH' },
    { event: 'Fall & Posture Collapse', baseScore: 90, threshold: 71, level: 'CRITICAL' },
    { event: 'Vehicle Child Left Behind', baseScore: 100, threshold: 71, level: 'CRITICAL' },
  ]);

  const [message, setMessage] = useState(null);

  const loadAdminData = async () => {
    try {
      const [cData, zData] = await Promise.all([
        api.getCameras(),
        api.getZones()
      ]);
      setCameras(cData);
      setZones(zData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleAddCamera = async (e) => {
    e.preventDefault();
    try {
      const added = await api.addCamera(newCam);
      setCameras((prev) => [...prev, added]);
      setMessage(`Camera ${newCam.camera_code} provisioned successfully!`);
      setNewCam({
        camera_code: `CAM-0${cameras.length + 2}`,
        name: 'New Area Feed',
        location: 'Campus West',
        zone_name: 'Main Playground',
        status: 'ONLINE'
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage('Error creating camera: may already exist');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleAddZone = async (e) => {
    e.preventDefault();
    try {
      const added = await api.addZone(newZone);
      setZones((prev) => [...prev, added]);
      setMessage(`Zone ${newZone.name} created successfully!`);
      setNewZone({
        name: '',
        zone_type: 'Safe Zone',
        description: '',
        base_risk_score: 10
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage('Error creating zone');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleUpdateRuleScore = (index, newScore) => {
    const updated = [...riskRules];
    updated[index].baseScore = parseInt(newScore, 10) || 0;
    setRiskRules(updated);
    setMessage('Risk heuristic weighting updated.');
    setTimeout(() => setMessage(null), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <ShieldCheck className="w-7 h-7 text-blue-600" />
          Campus Security Administration
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
          Configure physical camera streams, geofence boundary zones, and risk decision engine heuristics.
        </p>
      </div>

      {message && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
          <Check className="w-4 h-4 text-blue-600" /> {message}
        </div>
      )}

      {/* Grid: Provision Cameras & Add Zones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera Management */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Camera className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">Optical Stream Provisioning</h3>
          </div>

          <form onSubmit={handleAddCamera} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Camera Code</label>
                <input
                  type="text"
                  value={newCam.camera_code}
                  onChange={(e) => setNewCam({ ...newCam, camera_code: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg focus:border-blue-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Stream Name</label>
                <input
                  type="text"
                  value={newCam.name}
                  onChange={(e) => setNewCam({ ...newCam, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg focus:border-blue-500 shadow-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Location</label>
                <input
                  type="text"
                  value={newCam.location}
                  onChange={(e) => setNewCam({ ...newCam, location: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg focus:border-blue-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Assigned Zone</label>
                <select
                  value={newCam.zone_name}
                  onChange={(e) => setNewCam({ ...newCam, zone_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg focus:border-blue-500 shadow-xs font-medium"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.name}>{z.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Provision New Camera
            </button>
          </form>

          {/* Existing Cameras List */}
          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-mono font-bold text-slate-500 uppercase mb-2">
              Provisioned Sensors ({cameras.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {cameras.map((c) => (
                <div key={c.camera_code} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-slate-900 font-mono">{c.camera_code}</strong>: {c.name}
                    <div className="text-[10px] text-slate-500">{c.location}</div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Zone Management */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-slate-900">Geofenced Safety Boundaries</h3>
          </div>

          <form onSubmit={handleAddZone} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Zone Name</label>
                <input
                  type="text"
                  placeholder="e.g. Courtyard Patio"
                  value={newZone.name}
                  onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg focus:border-blue-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Classification</label>
                <select
                  value={newZone.zone_type}
                  onChange={(e) => setNewZone({ ...newZone, zone_type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg focus:border-blue-500 shadow-xs font-medium"
                >
                  <option value="Safe Zone">Safe Zone (Green)</option>
                  <option value="Warning Zone">Warning Zone (Amber)</option>
                  <option value="Restricted Zone">Restricted Zone (Red)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
              <input
                type="text"
                placeholder="Perimeter rules and notes"
                value={newZone.description}
                onChange={(e) => setNewZone({ ...newZone, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg focus:border-blue-500 shadow-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Define Campus Zone
            </button>
          </form>

          {/* Zones List */}
          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-mono font-bold text-slate-500 uppercase mb-2">
              Active Geofences ({zones.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {zones.map((z) => (
                <div key={z.id} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-slate-900">{z.name}</strong>
                    <div className="text-[10px] text-slate-500">{z.description || z.zone_type}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    z.zone_type === 'Restricted Zone'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : z.zone_type === 'Warning Zone'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {z.zone_type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Risk Engine Heuristic Rules Management */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Sliders className="w-5 h-5 text-amber-600" />
          <div>
            <h3 className="text-lg font-bold text-slate-900">Risk Engine Heuristic Weighting Rules</h3>
            <p className="text-xs text-slate-500">
              Transparent baseline scoring (0-100) applied during automated multi-factor context fusion.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-mono font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Event Scenario / Context</th>
                <th className="px-4 py-3">Base Score (0-100)</th>
                <th className="px-4 py-3">Alert Threshold</th>
                <th className="px-4 py-3">Risk Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {riskRules.map((rule, idx) => (
                <tr key={rule.event} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-900 font-sans font-semibold">{rule.event}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={rule.baseScore}
                      onChange={(e) => handleUpdateRuleScore(idx, e.target.value)}
                      className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 text-blue-700 rounded font-bold"
                    />
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-semibold">&ge; {rule.threshold} points</td>
                  <td className="px-4 py-3 font-bold">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rule.level === 'CRITICAL' ? 'text-red-800 bg-red-100 border border-red-300' :
                      rule.level === 'HIGH' ? 'text-rose-700 bg-rose-50 border border-rose-200' :
                      rule.level === 'MEDIUM' ? 'text-amber-700 bg-amber-50 border border-amber-200' :
                      'text-emerald-700 bg-emerald-50 border border-emerald-200'
                    }`}>
                      {rule.level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
