import React from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import RiskBadge from './RiskBadge';
import { Shield, AlertTriangle, AlertOctagon, User } from 'lucide-react';

// Custom DivIcon creator for clean, modern light theme markers
const createChildIcon = (childId, riskLevel = 'LOW') => {
  const isHigh = riskLevel === 'HIGH' || riskLevel === 'CRITICAL';
  const isMed = riskLevel === 'MEDIUM';

  const borderColor = isHigh ? '#EF4444' : isMed ? '#F59E0B' : '#10B981';
  const bg = isHigh ? '#EF4444' : isMed ? '#F59E0B' : '#10B981';

  const html = `
    <div style="
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
    ">
      ${isHigh ? `<div style="
        position: absolute;
        inset: -4px;
        border-radius: 9999px;
        background: rgba(239, 68, 68, 0.3);
        animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
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
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.15);
        white-space: nowrap;
        transform: translate(-50%, -50%);
      ">
        ${childId}
      </div>
    </div>
  `;

  return L.divIcon({
    html: html,
    className: 'child-marker-custom',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

export default function MapView({
  childrenData = [],
  zones = [],
  center = [37.7749, -122.4194],
  zoom = 16,
  height = '500px'
}) {
  return (
    <div className="w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm relative" style={{ height }}>
      {/* Legend Overlay (Light Elegant Theme) */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur border border-slate-200 rounded-lg p-3 text-xs shadow-md space-y-1.5 pointer-events-auto">
        <div className="font-bold text-slate-800 border-b border-slate-100 pb-1 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-blue-600" />
          Campus Geofence Zones
        </div>
        <div className="flex items-center gap-2 text-emerald-700 font-medium">
          <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-500"></span>
          Safe Zone (Playground / Class)
        </div>
        <div className="flex items-center gap-2 text-amber-700 font-medium">
          <span className="w-3 h-3 rounded bg-amber-100 border border-amber-500"></span>
          Warning Zone (Parking / Transit)
        </div>
        <div className="flex items-center gap-2 text-rose-700 font-medium">
          <span className="w-3 h-3 rounded bg-rose-100 border border-rose-500"></span>
          Restricted Zone (Main Gate)
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

        {/* Anonymous Children Markers */}
        {childrenData.map((child) => {
          const lat = child.lat || 37.7749;
          const lng = child.lng || -122.4194;

          return (
            <Marker
              key={child.id || child.anonymous_id}
              position={[lat, lng]}
              icon={createChildIcon(child.anonymous_id, child.risk_level)}
            >
              <Popup>
                <div className="p-2 space-y-2 min-w-[170px]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="font-mono font-bold text-sm text-blue-700">
                      {child.anonymous_id}
                    </span>
                    <RiskBadge risk={child.risk_level} size="sm" showLabel={false} />
                  </div>

                  <div className="text-xs space-y-1 text-slate-600">
                    <div>
                      <strong className="text-slate-800">Zone:</strong> {child.current_zone}
                    </div>
                    <div>
                      <strong className="text-slate-800">Status:</strong> {child.status}
                    </div>
                    <div>
                      <strong className="text-slate-800">Last Seen:</strong> {child.last_seen || 'Active'}
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
