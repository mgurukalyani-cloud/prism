import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Volume2,
  VolumeX,
  Shield,
  Clock,
  Cpu,
  Database,
  Save,
  Check,
  RefreshCcw,
  Sliders
} from 'lucide-react';

export default function Settings() {
  const [audioAlerts, setAudioAlerts] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(5);
  const [retentionDays, setRetentionDays] = useState(14);
  const [temporalWindow, setTemporalWindow] = useState(3);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="w-7 h-7 text-indigo-600" />
          System Preferences & Configuration
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Tune real-time alerting sensitivity, temporal smoothing windows, and data retention policies.
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" /> System preferences updated and applied to active session.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Real-time Notification Settings */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Volume2 className="w-5 h-5 text-indigo-600" />
            Alert Notification Preferences
          </h3>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">Audio Alert Chime</p>
              <p className="text-xs text-slate-500">Play an audible warning chime when a HIGH or CRITICAL risk event arrives.</p>
            </div>
            <button
              type="button"
              onClick={() => setAudioAlerts(!audioAlerts)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                audioAlerts ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  audioAlerts ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Temporal Smoothing & AI Heuristics */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Cpu className="w-5 h-5 text-indigo-600" />
            Temporal Verification & Validation Window
          </h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-800">
                Temporal Window Size (Frames to Confirm Event):
              </label>
              <span className="text-indigo-600 font-mono font-bold text-sm bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                {temporalWindow} Frames
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={temporalWindow}
              onChange={(e) => setTemporalWindow(e.target.value)}
              className="w-full accent-indigo-600"
            />
            <p className="text-xs text-slate-500">
              Requires an anomaly to persist across at least {temporalWindow} consecutive evaluation frames to eliminate false alerts from single-frame occlusions.
            </p>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-800">
                Demo Simulation Firing Interval:
              </label>
              <span className="text-indigo-600 font-mono font-bold text-sm bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                {simulationSpeed} Seconds
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="15"
              value={simulationSpeed}
              onChange={(e) => setSimulationSpeed(e.target.value)}
              className="w-full accent-indigo-600"
            />
            <p className="text-xs text-slate-500">
              Pacing between automated hackathon simulation scenario events.
            </p>
          </div>
        </div>

        {/* Data Privacy & Audit Retention */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Shield className="w-5 h-5 text-emerald-600" />
            Privacy by Design & Telemetry Retention
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event Log Purge Cycle (Days)
              </label>
              <select
                value={retentionDays}
                onChange={(e) => setRetentionDays(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none"
              >
                <option value="7">7 Days (Strict Minimal)</option>
                <option value="14">14 Days (Recommended)</option>
                <option value="30">30 Days (Extended Audit)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Facial Recognition / Biometric Collection
              </label>
              <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" /> Disabled by Design (Anonymous Pose & Zone IDs Only)
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white text-xs shadow-md shadow-indigo-600/10 flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" /> Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
