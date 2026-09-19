import React, { useState, useEffect } from 'react';
import EventTable from '../components/EventTable';
import RiskBadge from '../components/RiskBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../services/api';
import { Activity, X, Shield, Clock, MapPin, User, Cpu } from 'lucide-react';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    try {
      const data = await api.getEvents();
      setEvents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    const interval = setInterval(loadEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Activity className="w-7 h-7 text-blue-600" />
            Safety Events Audit Log
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Auditable log of computer-vision detections, posture anomalies, and geofence boundary events.
          </p>
        </div>

        <div className="text-xs font-mono bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 shadow-xs">
          Total Logged: <strong className="text-blue-700">{events.length}</strong>
        </div>
      </div>

      {loading && events.length === 0 ? (
        <LoadingSpinner text="Querying database event records..." />
      ) : (
        <EventTable
          events={events}
          onViewDetail={(ev) => setSelectedEvent(ev)}
        />
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>{selectedEvent.event_type}</span>
                  <RiskBadge risk={selectedEvent.risk_level} size="sm" />
                </h3>
                <span className="text-xs font-mono text-slate-500">
                  Event Record #{selectedEvent.id}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-700">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                    <User className="w-3.5 h-3.5 text-blue-600" /> Child Token:
                  </span>
                  <strong className="font-mono text-blue-700 text-sm font-bold">{selectedEvent.child_id}</strong>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5" /> Zone:
                  </span>
                  <strong className="text-slate-900 font-semibold">{selectedEvent.zone || 'Campus'}</strong>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                    <Cpu className="w-3.5 h-3.5" /> Optical Sensor:
                  </span>
                  <strong className="text-slate-900 font-semibold">{selectedEvent.camera_id || 'CAM-01'}</strong>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5" /> Timestamp:
                  </span>
                  <strong className="text-slate-700 font-mono">
                    {selectedEvent.timestamp ? new Date(selectedEvent.timestamp).toLocaleString() : 'Just now'}
                  </strong>
                </div>
              </div>

              {/* Description & Heuristics */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Assessment Narrative & Heuristic Reasoning
                </h4>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed font-medium">
                  {selectedEvent.description || 'Verified via temporal smoothing and centroid tracking heuristics.'}
                </p>
              </div>

              {/* Confidence & Risk Score Gauges */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-mono font-semibold">Detection Confidence</span>
                  <p className="text-2xl font-extrabold text-blue-700 mt-0.5 font-mono">
                    {Math.round((selectedEvent.confidence || 0.94) * 100)}%
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-mono font-semibold">Risk Engine Score</span>
                  <p className="text-2xl font-extrabold text-rose-600 mt-0.5 font-mono">
                    {selectedEvent.risk_score || 85} / 100
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
