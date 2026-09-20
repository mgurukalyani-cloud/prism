import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MapContainer, TileLayer, Polygon, Polyline, Marker, Popup, Tooltip, Circle } from 'react-leaflet';
import L from 'leaflet';
import {
  Shield,
  Navigation,
  Footprints,
  Camera,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  Radio,
  Crosshair,
  Volume2,
  CheckCircle2,
  User,
  Zap,
  Smartphone,
  Eye,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  Battery
} from 'lucide-react';

// Custom Map Marker Icons
const createSubjectIcon = (category, isThreat = false) => {
  const symbol = category === 'SENIOR' ? '👴' : category === 'ADULT' ? '👤' : '🎒';
  const color = isThreat ? '#EF4444' : '#10B981';

  const html = `
    <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
      <div style="
        position: absolute;
        inset: -6px;
        border-radius: 9999px;
        background: ${isThreat ? 'rgba(239, 68, 68, 0.45)' : 'rgba(16, 185, 129, 0.35)'};
        animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></div>
      <div style="
        background: ${color};
        color: white;
        border: 2.5px solid #FFFFFF;
        border-radius: 50%;
        width: 38px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        transform: translate(-50%, -50%);
      ">
        ${symbol}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'subject-marker',
    iconSize: [44, 44],
    iconAnchor: [22, 22]
  });
};

const createCameraPinIcon = (code, isActive = false) => {
  const bg = isActive ? '#4F46E5' : '#1E293B';
  const border = isActive ? '#A5B4FC' : '#FFFFFF';
  const glow = isActive ? 'box-shadow: 0 0 15px rgba(79, 70, 229, 0.7);' : 'box-shadow: 0 2px 6px rgba(0,0,0,0.25);';

  const html = `
    <div style="
      background: ${bg};
      color: #FFFFFF;
      border: 2px solid ${border};
      border-radius: 8px;
      padding: 2px 6px;
      font-family: monospace;
      font-size: 10px;
      font-weight: 700;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 4px;
      transform: translate(-50%, -50%);
      ${glow}
    ">
      <span>📹</span>
      <span>${code}</span>
      ${isActive ? `<span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #34D399; animation: pulse 1s infinite;"></span>` : ''}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'cam-pin',
    iconSize: [42, 24],
    iconAnchor: [21, 12]
  });
};

const createDroneIcon = () => {
  const html = `
    <div style="position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">
      <div style="
        position: absolute;
        inset: -8px;
        border-radius: 50%;
        border: 2px dashed #EF4444;
        animation: spin 3s linear infinite;
      "></div>
      <div style="
        background: #0F172A;
        color: #F8FAFC;
        border: 2px solid #EF4444;
        border-radius: 12px;
        padding: 4px 6px;
        font-family: monospace;
        font-size: 10px;
        font-weight: 800;
        display: flex;
        align-items: center;
        gap: 3px;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        transform: translate(-50%, -50%);
      ">
        <span>🚁</span>
        <span>DRONE-01</span>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'drone-pin',
    iconSize: [48, 48],
    iconAnchor: [24, 24]
  });
};

const createWayPointIcon = (label, color = '#10B981') => {
  const html = `
    <div style="
      background: ${color};
      color: white;
      border: 2px solid white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      font-size: 11px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      transform: translate(-50%, -50%);
    ">
      ${label}
    </div>
  `;
  return L.divIcon({
    html,
    className: 'waypoint-pin',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Preset Campus Subjects
const ESCORT_SUBJECTS = [
  {
    id: 'P-101',
    name: 'Priya Sharma',
    role: 'Student / Researcher',
    category: 'ADULT',
    avatar: '👤',
    age: '21 Yrs',
    vitals: 'Normal (74 BPM)',
    battery: '92%'
  },
  {
    id: 'SR-301',
    name: 'Dr. K.V. Rao',
    role: 'Visiting Senior Faculty',
    category: 'SENIOR',
    avatar: '👴',
    age: '68 Yrs',
    vitals: 'Stable (70 BPM)',
    battery: '88%'
  },
  {
    id: 'C-200',
    name: 'Aryan V.',
    role: 'Junior Scholar',
    category: 'CHILD',
    avatar: '🎒',
    age: '12 Yrs',
    vitals: 'Normal (82 BPM)',
    battery: '95%'
  }
];

// Preset Verified Safe Corridors at KLH Aziznagar Campus
const ESCORT_ROUTES = [
  {
    id: 'route-1',
    name: 'Academic Block ➔ Campus Bus Terminal',
    description: 'Central lit walkway via Plaza & South Corridor',
    distanceMeters: 420,
    estMinutes: 5.2,
    safetyScore: 99.4,
    lighting: 'High-Intensity LED (100% Illuminated)',
    avoidedHazard: 'Bypasses dark western perimeter fence & drainage works',
    originName: 'KLH Academic Block West',
    destinationName: 'Campus Bus Terminal Bay #2',
    waypoints: [
      [17.3468, 78.3366],
      [17.3465, 78.3368],
      [17.3458, 78.3372],
      [17.3452, 78.3375],
      [17.3444, 78.3378]
    ],
    hazardPath: [
      [17.3468, 78.3366],
      [17.3468, 78.3355],
      [17.3455, 78.3355],
      [17.3444, 78.3378]
    ],
    cameraRelays: [
      { code: 'CAM-02', name: 'Academic West Gate', startPct: 0, endPct: 30, coords: [17.3468, 78.3368] },
      { code: 'CAM-01', name: 'Sports Ground & Plaza', startPct: 30, endPct: 70, coords: [17.3458, 78.3375] },
      { code: 'CAM-04', name: 'Bus Terminal Bay #2', startPct: 70, endPct: 100, coords: [17.3445, 78.3378] }
    ]
  },
  {
    id: 'route-2',
    name: 'Central Plaza ➔ Moinabad Road Main Gate',
    description: 'Direct illuminated boulevard with security guard booth',
    distanceMeters: 510,
    estMinutes: 6.4,
    safetyScore: 98.8,
    lighting: 'Continuous Security Lamp Corridor',
    avoidedHazard: 'Bypasses vehicle service slipway',
    originName: 'Central Campus Plaza East',
    destinationName: 'Moinabad Road Main Gate',
    waypoints: [
      [17.3458, 78.3372],
      [17.3464, 78.3365],
      [17.3470, 78.3358],
      [17.3475, 78.3350]
    ],
    hazardPath: [
      [17.3458, 78.3372],
      [17.3450, 78.3360],
      [17.3465, 78.3345],
      [17.3475, 78.3350]
    ],
    cameraRelays: [
      { code: 'CAM-01', name: 'Sports Ground & Plaza', startPct: 0, endPct: 35, coords: [17.3458, 78.3375] },
      { code: 'CAM-02', name: 'Academic West Gate', startPct: 35, endPct: 65, coords: [17.3468, 78.3368] },
      { code: 'CAM-03', name: 'Moinabad Road Main Gate', startPct: 65, endPct: 100, coords: [17.3474, 78.3350] }
    ]
  },
  {
    id: 'route-3',
    name: 'Library Walkway ➔ Faculty Staff Parking',
    description: 'Short pedestrian safety corridor with barrier gate',
    distanceMeters: 290,
    estMinutes: 3.5,
    safetyScore: 99.8,
    lighting: 'Overhead Canopy Illumination',
    avoidedHazard: 'Avoids heavy delivery loading zone',
    originName: 'Academic Block North Walkway',
    destinationName: 'Staff Parking Bay',
    waypoints: [
      [17.3466, 78.3368],
      [17.3460, 78.3362],
      [17.3454, 78.3358],
      [17.3448, 78.3356]
    ],
    hazardPath: [
      [17.3466, 78.3368],
      [17.3460, 78.3350],
      [17.3448, 78.3356]
    ],
    cameraRelays: [
      { code: 'CAM-02', name: 'Academic West Gate', startPct: 0, endPct: 40, coords: [17.3468, 78.3368] },
      { code: 'CAM-06', name: 'Faculty Parking Surveillance', startPct: 40, endPct: 100, coords: [17.3448, 78.3356] }
    ]
  }
];

// Helper: Linear interpolation between coordinates
function interpolateCoordinates(waypoints, progressPct) {
  if (!waypoints || waypoints.length === 0) return [17.3462, 78.3368];
  if (progressPct <= 0) return waypoints[0];
  if (progressPct >= 100) return waypoints[waypoints.length - 1];

  const totalSegments = waypoints.length - 1;
  const rawIdx = (progressPct / 100) * totalSegments;
  const segIdx = Math.min(Math.floor(rawIdx), totalSegments - 1);
  const segFraction = rawIdx - segIdx;

  const p1 = waypoints[segIdx];
  const p2 = waypoints[segIdx + 1];

  const lat = p1[0] + (p2[0] - p1[0]) * segFraction;
  const lng = p1[1] + (p2[1] - p1[1]) * segFraction;

  return [lat, lng];
}

export default function SafeWalkPage() {
  const outletContext = useOutletContext() || {};
  const { onOpenDispatch } = outletContext;

  const [selectedSubject, setSelectedSubject] = useState(ESCORT_SUBJECTS[0]);
  const [selectedRoute, setSelectedRoute] = useState(ESCORT_ROUTES[0]);

  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x, 2x, 4x

  // Emergency Drone State
  const [isThreatActive, setIsThreatActive] = useState(false);
  const [dronePosition, setDronePosition] = useState([17.3460, 78.3365]); // Security Station HQ
  const [droneDeployed, setDroneDeployed] = useState(false);
  const [loudspeakerActive, setLoudspeakerActive] = useState(false);

  // Audio synthesizer ref for siren/alert chime
  const audioCtxRef = useRef(null);

  const playAlertSiren = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';

      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.3);
      osc.frequency.linearRampToValueAtTime(440, now + 0.6);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.7);
    } catch (e) {
      console.warn('Audio alert unavailable:', e);
    }
  };

  // Compute current subject coordinate
  const currentCoords = useMemo(() => {
    return interpolateCoordinates(selectedRoute.waypoints, progress);
  }, [selectedRoute, progress]);

  // Determine active camera based on progress percentage
  const activeCamera = useMemo(() => {
    const found = selectedRoute.cameraRelays.find(
      (cam) => progress >= cam.startPct && progress <= cam.endPct
    );
    return found || selectedRoute.cameraRelays[selectedRoute.cameraRelays.length - 1];
  }, [selectedRoute, progress]);

  // Main simulation timer
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return Math.min(100, prev + 0.6 * playbackSpeed);
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  // Drone tracking animation when threat is triggered
  useEffect(() => {
    let droneInterval = null;
    if (isThreatActive) {
      droneInterval = setInterval(() => {
        setDronePosition((prev) => {
          // Move drone gradually toward current subject coordinates
          const dLat = (currentCoords[0] - prev[0]) * 0.25;
          const dLng = (currentCoords[1] - prev[1]) * 0.25;
          return [prev[0] + dLat, prev[1] + dLng];
        });
      }, 100);
    } else {
      // Drone returns to base
      setDronePosition([17.3460, 78.3365]);
    }
    return () => clearInterval(droneInterval);
  }, [isThreatActive, currentCoords]);

  // Trigger Threat / SOS Interceptor
  const handleTriggerThreat = () => {
    setIsThreatActive(true);
    setDroneDeployed(true);
    setIsPlaying(false); // Pause motion to simulate hesitation or incident
    playAlertSiren();
  };

  // Clear Threat / Dismiss Drone
  const handleClearThreat = () => {
    setIsThreatActive(false);
    setDroneDeployed(false);
    setLoudspeakerActive(false);
  };

  // Reset Escort
  const handleReset = () => {
    setProgress(0);
    setIsPlaying(false);
    handleClearThreat();
  };

  // Launch Emergency WhatsApp Dispatch
  const handleLaunchDispatch = () => {
    if (onOpenDispatch) {
      onOpenDispatch({
        id: Math.floor(Math.random() * 9000) + 1000,
        child_name: `${selectedSubject.name} (${selectedSubject.id})`,
        risk_level: 'HIGH',
        event_type: 'SafeWalk SOS / Drone Intercept',
        zone: `${activeCamera.name} Corridor`,
        description: `Autonomous Security Drone DRONE-01 dispatched to GPS (${currentCoords[0].toFixed(5)}, ${currentCoords[1].toFixed(5)}). Subject flagged for urgent escort check.`,
        timestamp: new Date().toLocaleTimeString(),
        snapshot_url: null
      });
    }
  };

  const metersCovered = Math.round((progress / 100) * selectedRoute.distanceMeters);
  const metersRemaining = Math.max(0, selectedRoute.distanceMeters - metersCovered);
  const etaMinutes = ((metersRemaining / selectedRoute.distanceMeters) * selectedRoute.estMinutes).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white border border-indigo-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Night Escort Active
              </span>
              <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-400/40 text-indigo-200 rounded-full text-[11px] font-mono font-semibold">
                📍 KLH Aziznagar Campus • Hyderabad
              </span>
              <span className="px-3 py-1 bg-white/10 text-slate-300 rounded-full text-[11px] font-mono flex items-center gap-1">
                <Clock className="w-3 h-3 text-indigo-400" />
                22:48 IST • CCTV Night-Mode On
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Footprints className="w-8 h-8 text-emerald-400" />
              <span>AI SafeWalk™ & Autonomous Drone Interceptor</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1.5 font-medium leading-relaxed">
              Real-time proactive escort companion for students, staff, and senior citizens. Calculates 100% illuminated routes, dynamically orchestrates CCTV handovers, and dispatches rapid-response security drones upon threat detection.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 self-start lg:self-auto">
            <div className="text-center px-3 border-r border-white/10">
              <div className="text-xl font-mono font-black text-emerald-400">{selectedRoute.safetyScore}%</div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Safety Index</div>
            </div>
            <div className="text-center px-3 border-r border-white/10">
              <div className="text-xl font-mono font-black text-indigo-300">100%</div>
              <div className="text-[10px] uppercase font-bold text-slate-400">CCTV Overlap</div>
            </div>
            <div className="text-center px-3">
              <div className="text-xl font-mono font-black text-cyan-300">0</div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Blindspots</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Escort Controls & Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Escort Configuration & Live Telemetry (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Escort Subject Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-600" />
                Select Monitored Subject
              </h3>
              <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">
                {selectedSubject.id}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {ESCORT_SUBJECTS.map((subj) => (
                <button
                  key={subj.id}
                  onClick={() => setSelectedSubject(subj)}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                    selectedSubject.id === subj.id
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                  }`}
                >
                  <span className="text-2xl">{subj.avatar}</span>
                  <span className="text-[11px] font-bold truncate max-w-[80px]">{subj.name.split(' ')[0]}</span>
                  <span className="text-[9px] font-mono text-slate-500">{subj.id}</span>
                </button>
              ))}
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Demographic Profile:</span>
                <span className="font-bold text-slate-800">{selectedSubject.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kinematic Vitals:</span>
                <span className="font-mono font-bold text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  {selectedSubject.vitals}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Beacon Battery:</span>
                <span className="font-mono font-bold text-slate-700 flex items-center gap-1">
                  <Battery className="w-3.5 h-3.5 text-emerald-600" />
                  {selectedSubject.battery}
                </span>
              </div>
            </div>
          </div>

          {/* Route Selection & AI Route Intelligence */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Navigation className="w-4 h-4 text-emerald-600" />
              Verified Campus Safe Corridor
            </h3>

            <div className="space-y-2">
              {ESCORT_ROUTES.map((rt) => (
                <div
                  key={rt.id}
                  onClick={() => {
                    setSelectedRoute(rt);
                    handleReset();
                  }}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                    selectedRoute.id === rt.id
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${selectedRoute.id === rt.id ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                      {rt.name}
                    </span>
                    <span className="font-mono text-emerald-700 font-black">{rt.safetyScore}%</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{rt.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-slate-600">
                    <span>📏 {rt.distanceMeters}m</span>
                    <span>⏱️ ~{rt.estMinutes} mins</span>
                    <span className="text-indigo-600 font-bold">📹 {rt.cameraRelays.length} CCTV Relays</span>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Hazard Avoidance Rationale */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-[11px] text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                AI Safe-Routing Rationale:
              </div>
              <p className="text-amber-900/90 leading-relaxed">
                {selectedRoute.avoidedHazard}. Route adheres to <strong>{selectedRoute.lighting}</strong> with zero camera blindspots.
              </p>
            </div>
          </div>

          {/* Simulation & Progress Controls */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-500">
                Escort Simulation Engine
              </h3>
              <span className="text-xs font-mono font-bold text-slate-700">
                {progress.toFixed(0)}% Complete
              </span>
            </div>

            {/* Scrubber Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-100 ${
                    isThreatActive
                      ? 'bg-gradient-to-r from-rose-500 to-red-600 animate-pulse'
                      : progress >= 100
                      ? 'bg-emerald-500'
                      : 'bg-gradient-to-r from-indigo-500 via-teal-500 to-emerald-500'
                  }`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>{metersCovered}m covered</span>
                <span>{metersRemaining}m remaining (ETA: {etaMinutes}m)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer ${
                  isPlaying
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause Escort' : progress === 0 ? 'Start AI Escort' : 'Resume Escort'}</span>
              </button>

              <button
                onClick={handleReset}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                title="Reset Escort"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Speed Multiplier */}
              <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
                {[1, 2, 4].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                      playbackSpeed === spd
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Threat / Emergency Trigger */}
            <div className="pt-2 border-t border-slate-100">
              {!isThreatActive ? (
                <button
                  onClick={handleTriggerThreat}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>🚨 Simulate Threat / SOS Anomaly</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="bg-rose-50 border border-rose-300 p-3 rounded-xl text-xs text-rose-900 flex items-start gap-2 animate-pulse">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-black">THREAT DETECTED: UNUSUAL LINGERING / SOS!</strong>
                      <span>Autonomous Drone DRONE-01 dispatched to subject coordinates.</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleClearThreat}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Clear Threat / Stand Down
                    </button>
                    <button
                      onClick={handleLaunchDispatch}
                      className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                      title="Dispatch WhatsApp to Security Guards"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>WhatsApp Alert</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Map & Live CCTV / Drone HUD (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Leaflet Map Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
            {/* Map Top Bar */}
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>KLH Aziznagar Geospatial Escort View</span>
                <span className="font-mono text-[11px] font-normal text-slate-500">
                  [{currentCoords[0].toFixed(5)}, {currentCoords[1].toFixed(5)}]
                </span>
              </div>

              {/* Active Camera Badge */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[11px]">Active Camera:</span>
                <span className="px-2.5 py-1 bg-indigo-100 text-indigo-900 rounded-lg font-mono font-bold text-[11px] flex items-center gap-1.5 border border-indigo-200">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                  {activeCamera.code} ({activeCamera.name})
                </span>
              </div>
            </div>

            {/* Map Container */}
            <div className="w-full h-[460px] relative">
              <MapContainer
                center={[17.3462, 78.3368]}
                zoom={16}
                scrollWheelZoom={false}
                className="w-full h-full"
              >
                {/* Free OpenStreetMap Standard Tiles */}
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  maxZoom={19}
                />

                {/* Avoided Hazard Path (Dashed Red) */}
                <Polyline
                  positions={selectedRoute.hazardPath}
                  pathOptions={{
                    color: '#EF4444',
                    weight: 3,
                    dashArray: '6, 8',
                    opacity: 0.6
                  }}
                >
                  <Tooltip permanent direction="center" className="zone-tooltip">
                    🚫 Avoided Dark Hazard Path
                  </Tooltip>
                </Polyline>

                {/* Verified AI Safe Route (Glowing Emerald Green) */}
                <Polyline
                  positions={selectedRoute.waypoints}
                  pathOptions={{
                    color: '#10B981',
                    weight: 7,
                    opacity: 0.9,
                    lineCap: 'round',
                    lineJoin: 'round'
                  }}
                />
                <Polyline
                  positions={selectedRoute.waypoints}
                  pathOptions={{
                    color: '#6EE7B7',
                    weight: 2,
                    dashArray: '4, 6',
                    opacity: 0.9
                  }}
                />

                {/* Origin Pin */}
                <Marker position={selectedRoute.waypoints[0]} icon={createWayPointIcon('A', '#10B981')}>
                  <Popup>
                    <div className="text-xs">
                      <strong>Origin:</strong> {selectedRoute.originName}
                    </div>
                  </Popup>
                </Marker>

                {/* Destination Pin */}
                <Marker
                  position={selectedRoute.waypoints[selectedRoute.waypoints.length - 1]}
                  icon={createWayPointIcon('B', '#4F46E5')}
                >
                  <Popup>
                    <div className="text-xs">
                      <strong>Destination:</strong> {selectedRoute.destinationName}
                    </div>
                  </Popup>
                </Marker>

                {/* Optical Camera Pins */}
                {selectedRoute.cameraRelays.map((cam) => {
                  const isActive = cam.code === activeCamera.code;
                  return (
                    <React.Fragment key={cam.code}>
                      <Marker position={cam.coords} icon={createCameraPinIcon(cam.code, isActive)}>
                        <Popup>
                          <div className="text-xs space-y-1">
                            <strong>{cam.code}:</strong> {cam.name}
                            <div className="text-[10px] text-slate-500">Handover Zone: {cam.startPct}% - {cam.endPct}%</div>
                          </div>
                        </Popup>
                      </Marker>
                      {/* Active Camera Optical Radar Cone / Coverage Circle */}
                      {isActive && (
                        <Circle
                          center={cam.coords}
                          radius={55}
                          pathOptions={{
                            color: '#4F46E5',
                            fillColor: '#6366F1',
                            fillOpacity: 0.15,
                            weight: 1.5,
                            dashArray: '3, 5'
                          }}
                        />
                      )}
                    </React.Fragment>
                  );
                })}

                {/* Subject Live Walking Marker */}
                <Marker position={currentCoords} icon={createSubjectIcon(selectedSubject.category, isThreatActive)}>
                  <Popup>
                    <div className="text-xs space-y-1">
                      <strong>{selectedSubject.name} ({selectedSubject.id})</strong>
                      <div>Status: {isThreatActive ? '🚨 THREAT ALERT' : 'Normal Walking'}</div>
                      <div>Speed: 1.2 m/s • Vitals: {selectedSubject.vitals}</div>
                    </div>
                  </Popup>
                </Marker>

                {/* Autonomous Drone Interceptor & Searchlight */}
                {droneDeployed && (
                  <>
                    <Marker position={dronePosition} icon={createDroneIcon()}>
                      <Popup>
                        <div className="text-xs">
                          <strong>DRONE-01 EAGLE-EYE</strong>
                          <div>Autonomous Security Interceptor</div>
                          <div>Altitude: 35m AGL • Thermal Cam Active</div>
                        </div>
                      </Popup>
                    </Marker>
                    <Circle
                      center={dronePosition}
                      radius={40}
                      pathOptions={{
                        color: '#EF4444',
                        fillColor: '#F87171',
                        fillOpacity: 0.25,
                        weight: 2
                      }}
                    />
                  </>
                )}
              </MapContainer>

              {/* Floating Camera Handover Notification Toast */}
              <div className="absolute top-4 left-4 z-[500] bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 border border-slate-700/80 shadow-lg pointer-events-none">
                <Camera className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span>
                  <strong>CCTV Handover:</strong> Tracking via <code className="text-indigo-300 font-bold">{activeCamera.code}</code> ({activeCamera.name})
                </span>
              </div>
            </div>
          </div>

          {/* Picture-in-Picture Live CCTV / Aerial Drone HUD Feed */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden text-white p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isThreatActive ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`}></div>
                <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-slate-300 flex items-center gap-2">
                  {isThreatActive ? (
                    <>
                      <Crosshair className="w-4 h-4 text-rose-500 animate-spin" />
                      <span className="text-rose-400">DRONE-01 AERIAL THERMAL SCAN (INFRARED FLIR)</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 text-indigo-400" />
                      <span>LIVE OPTICAL CCTV RELAY FEED [{activeCamera.code}]</span>
                    </>
                  )}
                </h3>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                <span>FPS: 30.0</span>
                <span>LATENCY: 14ms</span>
                <span className="text-emerald-400 font-bold">AI INFERENCE: ACTIVE</span>
              </div>
            </div>

            {/* Simulated Vision Viewport */}
            <div className={`relative w-full h-56 rounded-xl overflow-hidden border flex items-center justify-center transition-colors ${
              isThreatActive
                ? 'bg-gradient-to-br from-indigo-950 via-purple-950 to-rose-950 border-rose-500/50'
                : 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800'
            }`}>
              {/* Scanlines Effect */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40"></div>

              {/* Optical / Thermal Visualizer Elements */}
              <div className="relative z-10 flex flex-col items-center justify-center space-y-3">
                {isThreatActive ? (
                  // Thermal Infrared Target Reticle
                  <div className="relative p-6 border-2 border-dashed border-rose-500/80 rounded-2xl bg-rose-500/10 backdrop-blur-xs flex flex-col items-center gap-2 text-center animate-pulse">
                    <Crosshair className="w-10 h-10 text-rose-400" />
                    <div className="font-mono text-xs font-bold text-rose-200">
                      TARGET LOCKED: {selectedSubject.name} [{selectedSubject.id}]
                    </div>
                    <div className="text-[10px] font-mono text-rose-300">
                      THERMAL SIGNATURE: 36.8°C • POSITION: [{currentCoords[0].toFixed(5)}, {currentCoords[1].toFixed(5)}]
                    </div>
                  </div>
                ) : (
                  // Normal CCTV AI Bounding Box
                  <div className="relative p-5 border-2 border-emerald-500/80 rounded-xl bg-emerald-500/5 backdrop-blur-xs flex flex-col items-center gap-1.5 text-center">
                    <div className="text-2xl">{selectedSubject.avatar}</div>
                    <div className="font-mono text-xs font-bold text-emerald-300">
                      AI DETECT: {selectedSubject.name} [{selectedSubject.id}]
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                      <span>CONFIDENCE: 98.6%</span>
                      <span>•</span>
                      <span>GAIT: STABLE (1.2 m/s)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Viewport Corner HUD Overlay */}
              <div className="absolute top-3 left-3 text-[10px] font-mono text-slate-400 space-y-0.5 pointer-events-none">
                <div>SENSOR: {isThreatActive ? 'FLIR-IR-T60' : 'SONY-STARVIS-4K'}</div>
                <div>OPTICAL ZOOM: 2.4X</div>
              </div>

              <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-400 text-right pointer-events-none">
                <div>SECTOR: {activeCamera.name}</div>
                <div>GEOFENCE: VERIFIED SAFE CORRIDOR</div>
              </div>
            </div>

            {/* Quick Drone Control Strip */}
            {isThreatActive && (
              <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-rose-300">
                  <Volume2 className="w-4 h-4 text-rose-400 animate-bounce" />
                  <span>
                    <strong>Drone Loudspeaker Broadcast:</strong> "SafeGuard AI Security Drone on site. Stay calm, ground patrol is arriving."
                  </span>
                </div>
                <button
                  onClick={() => setLoudspeakerActive(!loudspeakerActive)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  {loudspeakerActive ? 'Mute Broadcast' : 'Test Acoustic Beacon'}
                </button>
              </div>
            )}
          </div>

          {/* Safe Escort Completed Card */}
          {progress >= 100 && !isThreatActive && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-emerald-900">
                    Safe Escort Successfully Completed!
                  </h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    {selectedSubject.name} safely arrived at <strong>{selectedRoute.destinationName}</strong>. All {selectedRoute.cameraRelays.length} CCTV handovers logged with 0 security exceptions.
                  </p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shrink-0"
              >
                Start New Escort
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
