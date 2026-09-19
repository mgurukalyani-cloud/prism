import React from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import RiskBadge from './RiskBadge';
import { Shield, AlertTriangle, AlertOctagon, User } from 'lucide-react';

// Custom DivIcon creator for clean, modern light theme markers
const createPersonIcon = (id, riskLevel = 'LOW', category = 'CHILD') => {
  const isHigh = riskLevel === 'HIGH' || riskLevel === 'CRITICAL';
  const isMed = riskLevel === 'MEDIUM';

  const borderColor = isHigh ? '#EF4444' : isMed ? '#F59E0B' : '#10B981';
  const bg = isHigh ? '#EF4444' : isMed ? '#F59E0B' : '#10B981';

  const categoryPrefix = category === 'SENIOR' ? '👴' : category === 'ADULT' ? '👤' : '🎒';

  const html = `
    <div style="
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
    ">
      ${isHigh ? `<div style="
        position: absolute;
        inset: -4px;
        border-radius: 9999px;
        background: rgba(239, 68, 68, 0.35);
        animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></div>` : ''}
      <div style="
        background: ${bg};
        color: #FFFFFF;
        font-family: monospace;
        font-size: 10px;
        font-weight: 800;
        padding: 3px 6px;
        border-radius: 6px;
        border: 2px solid #FFFFFF;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.25);
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
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

export default function MapView({
  childrenData = [],
  zones = [],
  center = [17.3457, 78.3370], // KLH Aziznagar Campus, Hyderabad, Telangana – 500075
  zoom = 16,
  height = '500px'
}) {
  return (
    <div className="w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm relative" style={{ height }}>
      {/* Legend Overlay (KLH Aziznagar Campus Info) */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-3.5 text-xs shadow-lg space-y-2 pointer-events-auto max-w-[240px]">
        <div className="font-black text-slate-900 border-b border-slate-100 pb-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-indigo-700">
            <Shield className="w-4 h-4 text-indigo-600" />
            <span>KLH Aziznagar Campus</span>
          </div>
          <span className="text-[9px] font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold">HYD</span>
        </div>
        
        <p className="text-[11px] text-slate-500 leading-tight">
          Moinabad Road, Near TS Police Academy, Hyderabad, Telangana – 500075
        </p>

        <div className="pt-1 space-y-1.5 border-t border-slate-100">
          <div className="flex items-center gap-2 text-emerald-800 font-semibold">
            <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-500"></span>
            Safe Zones (Academic & Plaza)
          </div>
          <div className="flex items-center gap-2 text-amber-800 font-semibold">
            <span className="w-3 h-3 rounded bg-amber-100 border border-amber-500"></span>
            Warning Zones (Parking & Transit)
          </div>
          <div className="flex items-center gap-2 text-rose-800 font-semibold">
            <span className="w-3 h-3 rounded bg-rose-100 border border-rose-500"></span>
            Restricted Zones (Main Gate)
          </div>
        </div>
      </div>


      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        {/* Voyager Light Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Zones Polygons */}
        {zones.map((zone) => {
          let coords = zone.coordinates;
          if (!coords && zone.coordinates_json) {
            try {
              const parsed = JSON.parse(zone.coordinates_json);
              coords = parsed.map((p) => [p.lat, p.lng]);
            } catch (e) {
              coords = null;
            }
          }

          if (!coords || coords.length === 0) return null;

          const isRestricted = zone.zone_type === 'Restricted Zone';
          const isWarning = zone.zone_type === 'Warning Zone';
          const color = isRestricted ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981';

          return (
            <Polygon
              key={zone.id || zone.name}
              positions={coords}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.15,
                weight: 2,
                dashArray: isRestricted ? '4, 4' : undefined
              }}
            >
              <Popup>
                <div className="p-1 space-y-1">
                  <h4 className="font-bold text-sm text-slate-900">{zone.name}</h4>
                  <p className="text-xs text-slate-600">{zone.description || zone.zone_type}</p>
                  <div className="pt-1">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded" style={{ backgroundColor: `${color}20`, color }}>
                      {zone.zone_type}
                    </span>
                  </div>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* Monitored People Markers (Children, Adults, Senior Citizens) */}
        {childrenData.map((child) => {
          const lat = child.lat || 17.3457;
          const lng = child.lng || 78.3370;

          return (
            <Marker
              key={child.id || child.anonymous_id}
              position={[lat, lng]}
              icon={createPersonIcon(child.anonymous_id, child.risk_level, child.category)}
            >
              <Popup>
                <div className="p-2 space-y-2 min-w-[190px]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="font-mono font-bold text-sm text-indigo-700">
                      {child.anonymous_id}
                    </span>
                    <RiskBadge risk={child.risk_level} size="sm" showLabel={false} />
                  </div>

                  <div className="text-xs space-y-1 text-slate-600">
                    <div>
                      <strong className="text-slate-800">Category:</strong> {child.category === 'SENIOR' ? 'Senior Citizen' : child.category === 'ADULT' ? 'Adult / Staff' : 'Child / Student'}
                    </div>
                    <div>
                      <strong className="text-slate-800">Zone:</strong> {child.current_zone}
                    </div>
                    <div>
                      <strong className="text-slate-800">Status:</strong> {child.status}
                    </div>
                    <div>
                      <strong className="text-slate-800">Campus:</strong> KLH Aziznagar
                    </div>
                    <div>
                      <strong className="text-slate-800">Last Telemetry:</strong> {child.last_seen || 'Active'}
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

