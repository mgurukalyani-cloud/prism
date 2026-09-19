import React from 'react';
import RiskBadge from './RiskBadge';
import { Camera, Maximize2, Shield, Eye, Activity } from 'lucide-react';

export default function CameraCard({ camera, onSelect }) {
  const detections = camera.detections || [];
  const risk = camera.current_risk || 'LOW';

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-200 flex flex-col group">
      {/* Fixed Clean Camera Header Bar (Zero overlapping or wrapping) */}
      <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Camera className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-mono font-bold text-xs text-slate-900 shrink-0">
            {camera.camera_code}
          </span>
          <span className="text-slate-300 shrink-0">|</span>
          <span className="text-xs font-semibold text-slate-700 truncate" title={camera.name || camera.location}>
            {camera.location || camera.name}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            LIVE
          </span>
          <button
            onClick={() => onSelect && onSelect(camera)}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
            title="Inspect Camera"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Simulated Live Stream Viewport */}
      <div 
        onClick={() => onSelect && onSelect(camera)}
        className="relative aspect-video bg-slate-900 flex items-center justify-center cursor-pointer overflow-hidden select-none"
      >
        {/* Synthetic Camera Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:20px_20px] opacity-25"></div>

        {/* CCTV Vignette */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(15,23,42,0.6)_100%)]"></div>

        {/* Live HUD Timestamp & Resolution */}
        <div className="absolute top-2 left-2 text-[10px] font-mono text-cyan-300 bg-black/70 px-2 py-0.5 rounded backdrop-blur border border-cyan-800/40">
          REC ● 1080p @ 30fps
        </div>

        <div className="absolute top-2 right-2 text-[10px] font-mono text-slate-300 bg-black/70 px-2 py-0.5 rounded backdrop-blur">
          {camera.zone_name}
        </div>

        {/* Dynamic Bounding Boxes HUD Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {camera.camera_code === 'CAM-01' && (
            <>
              {/* Box 1 */}
              <div className="absolute left-[20%] top-[25%] w-[24%] h-[55%] border-2 border-emerald-400 rounded bg-emerald-500/15">
                <div className="absolute -top-6 left-0 bg-emerald-950 text-emerald-300 font-mono text-[10px] px-1.5 py-0.5 rounded border border-emerald-500 font-bold flex items-center gap-1 shadow">
                  <span>C-017</span>
                  <span className="text-emerald-400">94%</span>
                </div>
              </div>
              {/* Box 2 */}
              <div className="absolute right-[25%] top-[30%] w-[22%] h-[50%] border-2 border-emerald-400 rounded bg-emerald-500/15">
                <div className="absolute -top-6 left-0 bg-emerald-950 text-emerald-300 font-mono text-[10px] px-1.5 py-0.5 rounded border border-emerald-500 font-bold flex items-center gap-1 shadow">
                  <span>C-021</span>
                  <span className="text-emerald-400">89%</span>
                </div>
              </div>
            </>
          )}

          {camera.camera_code === 'CAM-03' && (
            <div className="absolute left-[35%] top-[20%] w-[30%] h-[60%] border-2 border-rose-500 rounded bg-rose-500/20 animate-pulse">
              <div className="absolute -top-6 left-0 bg-rose-950 text-rose-300 font-mono text-[10px] px-1.5 py-0.5 rounded border border-rose-500 font-bold flex items-center gap-1 shadow">
                <span>C-017</span>
                <span className="text-rose-400 font-black">RESTRICTED</span>
              </div>
            </div>
          )}

          {camera.camera_code === 'CAM-04' && (
            <div className="absolute left-[30%] top-[25%] w-[32%] h-[55%] border-2 border-amber-400 rounded bg-amber-500/20">
              <div className="absolute -top-6 left-0 bg-amber-950 text-amber-300 font-mono text-[10px] px-1.5 py-0.5 rounded border border-amber-500 font-bold flex items-center gap-1 shadow">
                <span>C-034</span>
                <span className="text-amber-300">95% (Bus In-Cabin)</span>
              </div>
            </div>
          )}

          {camera.camera_code === 'CAM-02' && (
            <div className="absolute left-[28%] top-[22%] w-[26%] h-[56%] border-2 border-emerald-400 rounded bg-emerald-500/15">
              <div className="absolute -top-6 left-0 bg-emerald-950 text-emerald-300 font-mono text-[10px] px-1.5 py-0.5 rounded border border-emerald-500 font-bold flex items-center gap-1 shadow">
                <span>C-001</span>
                <span>96%</span>
              </div>
            </div>
          )}
        </div>

        {/* Center Reticle */}
        <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center opacity-40">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
        </div>

        {/* Hover hint */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-medium text-white bg-slate-900/90 px-2.5 py-1 rounded-md border border-slate-700 flex items-center gap-1.5 shadow">
          <Eye className="w-3.5 h-3.5 text-cyan-400" /> Click to Inspect
        </div>
      </div>

      {/* Footer Info (Clean Light Theme) */}
      <div className="p-3 bg-white flex items-center justify-between text-xs border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-slate-600">
            Detections: <strong className="text-slate-900 font-bold">{camera.detection_count || detections.length || 2}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Risk:</span>
          <RiskBadge risk={risk} size="sm" showLabel={false} />
        </div>
      </div>
    </div>
  );
}
