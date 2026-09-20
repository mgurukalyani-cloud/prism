import React from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import RiskBadge from './RiskBadge';
import { Shield, Camera, User, Navigation } from 'lucide-react';

// Custom DivIcon creator for demographic monitored individuals
const createPersonIcon = (id, riskLevel = 'LOW', category = 'CHILD') => {
  const isHigh = riskLevel === 'HIGH' || riskLevel === 'CRITICAL';
  const isMed = riskLevel === 'MEDIUM';

  const bg = isHigh ? '#EF4444' : isMed ? '#F59E0B' : '#10B981';
  const categoryPrefix = category === 'SENIOR' ? '👴' : category === 'ADULT' ? '👤' : '🎒';

  const html = `
    <div style="
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      cursor: pointer;
    ">
      ${isHigh ? `
        <div style="
          position: absolute;
          inset: -4px;
          border-radius: 9999px;
          background: rgba(239, 68, 68, 0.4);
          animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
      ` : ''}
      <div style="
        background: ${bg};
        color: #FFFFFF;
        font-family: monospace;
        font-size: 11px;
        font-weight: 800;
        padding: 3px 6px;
        border-radius: 8px;
        border: 2px solid #FFFFFF;
        box-shadow: 0 4px 8px -1px rgba(0,0,0,0.3);
        white-space: nowrap;
        transform: translate(-50%, -50%);
        display: flex;
        align-items: center;
        gap: 3px;
      ">
        <span>${categoryPrefix}</span>
        <span>${id}</span>
      </div>
    </div>
  `;

  return L.divIcon({
    html: html,
    className: 'person-marker-custom',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// Custom DivIcon for Optical Cameras
const createCameraIcon = (code) => {
  const html = `
    <div style="
      position: relative;
      background: #1E293B;
      color: #38BDF8;
      border: 2px solid #FFFFFF;
      border-radius: 8px;
      padding: 2px 5px;
      font-family: monospace;
      font-size: 9px;
      font-weight: 700;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.25);
      white-space: nowrap;
      transform: translate(-50%, -50%);
      display: flex;
      align-items: center;
      gap: 3px;
      cursor: pointer;
    ">
      <span>📹</span>
      <span>${code}</span>
    </div>
  `;

  return L.divIcon({
    html: html,
    className: 'camera-marker-custom',
    iconSize: [36, 24],
    iconAnchor: [18, 12],
  });
};

// Default high-precision campus geofences at KLH Aziznagar, Hyderabad
const DEFAULT_CAMPUS_ZONES = [
  {
    id: 1,
    name: "KLH Academic Block",
    zone_type: "Safe Zone",
    description: "Classrooms, labs, and academic corridors",
    color: "#10B981",
    coordinates: [
      [17.3475, 78.3360],
      [17.3475, 78.3375],
      [17.3462, 78.3375],
      [17.3462, 78.3360]
    ]
  },
  {
    id: 2,
    name: "Central Campus Plaza",
    zone_type: "Safe Zone",
    description: "Open courtyard, sports ground, and recreation area",
    color: "#10B981",
    coordinates: [
      [17.3462, 78.3365],
      [17.3462, 78.3380],
      [17.3450, 78.3380],
      [17.3450, 78.3365]
    ]
  },
  {
    id: 3,
    name: "Staff Parking",
    zone_type: "Warning Zone",
    description: "Vehicle parking bays and circulation lanes",
    color: "#F59E0B",
    coordinates: [
      [17.3454, 78.3352],
      [17.3454, 78.3364],
      [17.3442, 78.3364],
      [17.3442, 78.3352]
    ]
  },
  {
    id: 4,
    name: "Campus Transit & Bus Terminal",
    zone_type: "Warning Zone",
    description: "Passenger bus depot and transit lanes",
    color: "#F59E0B",
    coordinates: [
      [17.3450, 78.3370],
      [17.3450, 78.3385],
      [17.3438, 78.3385],
      [17.3438, 78.3370]
    ]
  },
  {
    id: 5,
    name: "Moinabad Road Main Gate",
    zone_type: "Restricted Zone",
    description: "High-risk perimeter gate facing arterial highway",
    color: "#EF4444",
    coordinates: [
      [17.3480, 78.3345],
      [17.3480, 78.3358],
      [17.3468, 78.3358],
      [17.3468, 78.3345]
    ]
  },
  {
    id: 6,
    name: "Perimeter Boundary",
    zone_type: "Restricted Zone",
    description: "Boundary fence adjacent to TS Police Academy",
    color: "#DC2626",
    coordinates: [
      [17.3490, 78.3375],
      [17.3490, 78.3392],
      [17.3478, 78.3392],
      [17.3478, 78.3375]
    ]
  }
];

const DEFAULT_PEOPLE = [
  { id: 1, anonymous_id: "C-200", category: "CHILD", current_zone: "Moinabad Road Main Gate", status: "Attention", risk_level: "HIGH", lat: 17.3474, lng: 78.3351, last_seen: "Just now" },
  { id: 2, anonymous_id: "C-017", category: "CHILD", current_zone: "Central Campus Plaza", status: "Active", risk_level: "LOW", lat: 17.3458, lng: 78.3370, last_seen: "Just now" },
  { id: 3, anonymous_id: "C-021", category: "CHILD", current_zone: "Central Campus Plaza", status: "Attention", risk_level: "HIGH", lat: 17.3454, lng: 78.3374, last_seen: "1 min ago" },
  { id: 4, anonymous_id: "C-034", category: "CHILD", current_zone: "Campus Transit & Bus Terminal", status: "Active", risk_level: "LOW", lat: 17.3444, lng: 78.3378, last_seen: "2 mins ago" },
  { id: 5, anonymous_id: "P-101", category: "ADULT", current_zone: "KLH Academic Block", status: "Active", risk_level: "LOW", lat: 17.3468, lng: 78.3366, last_seen: "Just now" },
  { id: 6, anonymous_id: "P-104", category: "ADULT", current_zone: "Staff Parking", status: "Active", risk_level: "MEDIUM", lat: 17.3446, lng: 78.3358, last_seen: "3 mins ago" },
  { id: 7, anonymous_id: "SR-301", category: "SENIOR", current_zone: "KLH Academic Block", status: "Active", risk_level: "LOW", lat: 17.3466, lng: 78.3369, last_seen: "2 mins ago" },
  { id: 8, anonymous_id: "SR-310", category: "SENIOR", current_zone: "Central Campus Plaza", status: "Attention", risk_level: "HIGH", lat: 17.3452, lng: 78.3371, last_seen: "Just now" },
];

const DEFAULT_CAMERAS = [
  { code: "CAM-01", name: "Sports Ground & Plaza", lat: 17.3458, lng: 78.3375, status: "ONLINE", zone: "Central Campus Plaza" },
  { code: "CAM-02", name: "KLH Academic Block West", lat: 17.3468, lng: 78.3368, status: "ONLINE", zone: "KLH Academic Block" },
  { code: "CAM-03", name: "Moinabad Road Main Gate", lat: 17.3474, lng: 78.3350, status: "ONLINE", zone: "Moinabad Road Main Gate" },
  { code: "CAM-04", name: "Bus Terminal Bay #2", lat: 17.3445, lng: 78.3378, status: "ONLINE", zone: "Campus Transit & Bus Terminal" },
  { code: "CAM-05", name: "TSPA Boundary Sensor", lat: 17.3485, lng: 78.3385, status: "ONLINE", zone: "Perimeter Boundary" },
  { code: "CAM-06", name: "Faculty Parking Surveillance", lat: 17.3448, lng: 78.3356, status: "ONLINE", zone: "Staff Parking" },
];

export default function MapView({
  childrenData = [],
  zones = [],
  center = [17.3462, 78.3368], // Centered right on KLH Aziznagar Campus Core
  zoom = 16,
  height = '500px'
}) {
  // Validate and parse zones, fallback to KLH Aziznagar default polygons if empty or out-of-bounds
  const effectiveZones = React.useMemo(() => {
    if (!zones || zones.length === 0) return DEFAULT_CAMPUS_ZONES;

    const parsed = zones.map((z) => {
      let coords = z.coordinates;
      if (!coords && z.coordinates_json) {
        try {
          const arr = JSON.parse(z.coordinates_json);
          coords = arr.map((p) => [p.lat, p.lng]);
        } catch (e) {
          coords = null;
        }
      }
      return { ...z, coordinates: coords };
    }).filter((z) => Array.isArray(z.coordinates) && z.coordinates.length > 2);

    // Check if coordinates are in Hyderabad region (lat ~ 17.34)
    const isLocal = parsed.some((z) => z.coordinates[0] && Math.abs(z.coordinates[0][0] - 17.34) < 0.2);
    return isLocal && parsed.length > 0 ? parsed : DEFAULT_CAMPUS_ZONES;
  }, [zones]);

  // Validate people data, fallback if empty or out-of-bounds
  const effectivePeople = React.useMemo(() => {
    if (!childrenData || childrenData.length === 0) return DEFAULT_PEOPLE;
    const isLocal = childrenData.some((c) => c.lat && Math.abs(c.lat - 17.34) < 0.2);
    return isLocal ? childrenData : DEFAULT_PEOPLE;
  }, [childrenData]);

  return (
    <div className="w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm relative" style={{ height }}>
      {/* (Floating legend card removed per explicit user instructions) */}

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        {/* OpenStreetMap Standard Tiles (100% Free, Reliable, No API Key Required) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Campus Geofence Polygons */}
        {effectiveZones.map((zone) => {
          const isRestricted = zone.zone_type === 'Restricted Zone';
          const isWarning = zone.zone_type === 'Warning Zone';
          const color = zone.color || (isRestricted ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981');

          return (
            <Polygon
              key={zone.id || zone.name}
              positions={zone.coordinates}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: isRestricted ? 0.35 : 0.25,
                weight: 3,
                dashArray: isRestricted ? '5, 5' : undefined
              }}
            >
              <Tooltip permanent direction="center" className="zone-tooltip font-mono">
                {zone.name}
              </Tooltip>
              <Popup>
                <div className="p-1 space-y-1">
                  <h4 className="font-bold text-sm text-slate-900">{zone.name}</h4>
                  <p className="text-xs text-slate-600">{zone.description || zone.zone_type}</p>
                  <div className="pt-1">
                    <span
                      className="text-[10px] uppercase font-bold px-2 py-0.5 rounded"
                      style={{ backgroundColor: `${color}20`, color }}
                    >
                      {zone.zone_type}
                    </span>
                  </div>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* Optical Camera Markers */}
        {DEFAULT_CAMERAS.map((cam) => (
          <Marker
            key={cam.code}
            position={[cam.lat, cam.lng]}
            icon={createCameraIcon(cam.code)}
          >
            <Popup>
              <div className="p-2 space-y-1 text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <span>📹 {cam.code}</span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">ONLINE</span>
                </div>
                <div className="text-slate-600 font-medium">{cam.name}</div>
                <div className="text-[10px] text-slate-400">Zone: {cam.zone}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Monitored Demographic Individuals (Students, Staff, Senior Citizens) */}
        {effectivePeople.map((person) => {
          const lat = person.lat || 17.3457;
          const lng = person.lng || 78.3370;

          return (
            <Marker
              key={person.id || person.anonymous_id}
              position={[lat, lng]}
              icon={createPersonIcon(person.anonymous_id, person.risk_level, person.category)}
            >
              <Popup>
                <div className="p-2 space-y-2 min-w-[190px]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="font-mono font-bold text-sm text-indigo-700">
                      {person.anonymous_id}
                    </span>
                    <RiskBadge risk={person.risk_level} size="sm" showLabel={false} />
                  </div>

                  <div className="text-xs space-y-1 text-slate-600">
                    <div>
                      <strong className="text-slate-800">Category:</strong> {person.category === 'SENIOR' ? 'Senior Citizen' : person.category === 'ADULT' ? 'Adult / Staff' : 'Student'}
                    </div>
                    <div>
                      <strong className="text-slate-800">Current Zone:</strong> {person.current_zone}
                    </div>
                    <div>
                      <strong className="text-slate-800">Campus:</strong> KLH Aziznagar
                    </div>
                    <div>
                      <strong className="text-slate-800">Telemetry Status:</strong> {person.status || 'Active'}
                    </div>
                    <div>
                      <strong className="text-slate-800">Last Seen:</strong> {person.last_seen || 'Active'}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
