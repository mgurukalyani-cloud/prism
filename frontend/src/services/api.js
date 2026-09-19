import axios from 'axios';
import {
  DEMO_STATS,
  DEMO_CHILDREN,
  DEMO_CAMERAS,
  DEMO_ZONES,
  DEMO_EVENTS,
  DEMO_ALERTS
} from '../data/demoData';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_URL = `${BASE_URL}/api`;

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Dashboard
  getStats: async () => {
    try {
      const res = await apiClient.get('/dashboard/stats');
      return res.data;
    } catch (e) {
      console.warn('[API Fallback] Using offline demo stats', e.message);
      return DEMO_STATS;
    }
  },

  // Children
  getChildren: async (params = {}) => {
    try {
      const res = await apiClient.get('/children', { params });
      return res.data;
    } catch (e) {
      console.warn('[API Fallback] Using offline demo children', e.message);
      return DEMO_CHILDREN;
    }
  },

  getChild: async (id) => {
    try {
      const res = await apiClient.get(`/children/${id}`);
      return res.data;
    } catch (e) {
      const c = DEMO_CHILDREN.find((ch) => ch.id === Number(id)) || DEMO_CHILDREN[0];
      return {
        child: c,
        recent_events: DEMO_EVENTS.filter((ev) => ev.child_id === c.anonymous_id)
      };
    }
  },

  // Events
  getEvents: async (params = {}) => {
    try {
      const res = await apiClient.get('/events', { params });
      return res.data;
    } catch (e) {
      console.warn('[API Fallback] Using offline demo events', e.message);
      return DEMO_EVENTS;
    }
  },

  // Alerts
  getAlerts: async (params = {}) => {
    try {
      const res = await apiClient.get('/alerts', { params });
      return res.data;
    } catch (e) {
      console.warn('[API Fallback] Using offline demo alerts', e.message);
      return DEMO_ALERTS;
    }
  },

  acknowledgeAlert: async (id) => {
    try {
      const res = await apiClient.post(`/alerts/${id}/acknowledge`);
      return res.data;
    } catch (e) {
      return { id, status: 'ACKNOWLEDGED' };
    }
  },

  resolveAlert: async (id) => {
    try {
      const res = await apiClient.post(`/alerts/${id}/resolve`);
      return res.data;
    } catch (e) {
      return { id, status: 'RESOLVED' };
    }
  },

  // Cameras
  getCameras: async () => {
    try {
      const res = await apiClient.get('/cameras');
      return res.data;
    } catch (e) {
      return DEMO_CAMERAS;
    }
  },

  getCameraDetections: async (code) => {
    try {
      const res = await apiClient.get(`/cameras/${code}/detections`);
      return res.data;
    } catch (e) {
      const cam = DEMO_CAMERAS.find(c => c.camera_code === code) || DEMO_CAMERAS[0];
      return {
        camera_code: code,
        name: cam.name,
        status: cam.status,
        ai_status: "AI Demo Mode",
        detection_count: cam.detections.length,
        detections: cam.detections
      };
    }
  },

  addCamera: async (data) => {
    const res = await apiClient.post('/cameras', data);
    return res.data;
  },

  // Zones
  getZones: async () => {
    try {
      const res = await apiClient.get('/zones');
      return res.data;
    } catch (e) {
      return DEMO_ZONES;
    }
  },

  addZone: async (data) => {
    const res = await apiClient.post('/zones', data);
    return res.data;
  },

  // Reports
  getReportsSummary: async () => {
    try {
      const res = await apiClient.get('/reports/summary');
      return res.data;
    } catch (e) {
      return {
        events_by_type: [
          { type: 'Restricted Zone Entry', count: 18 },
          { type: 'Fall Detected', count: 7 },
          { type: 'Child Left Behind', count: 3 },
          { type: 'Unusual Activity', count: 12 },
          { type: 'Zone Entry', count: 45 },
        ],
        risk_distribution: [
          { risk: 'LOW', count: 48 },
          { risk: 'MEDIUM', count: 15 },
          { risk: 'HIGH', count: 6 },
        ],
        events_by_zone: [
          { zone: 'Main Playground', count: 28 },
          { zone: 'Academic Block', count: 18 },
          { zone: 'Main Gate', count: 12 },
          { zone: 'Parking Area', count: 8 },
          { zone: 'School Bus Zone', count: 5 },
        ],
        events_over_time: [
          { time: '08:00', count: 14, high_risk: 0 },
          { time: '10:00', count: 28, high_risk: 2 },
          { time: '12:00', count: 42, high_risk: 1 },
          { time: '14:00', count: 31, high_risk: 3 },
          { time: '16:00', count: 22, high_risk: 1 },
          { time: '18:00', count: 9, high_risk: 0 },
        ],
        alert_status: [
          { status: 'NEW', count: 3 },
          { status: 'ACKNOWLEDGED', count: 2 },
          { status: 'RESOLVED', count: 9 },
        ],
        total_events: 85,
        total_alerts: 14
      };
    }
  },

  exportCsvUrl: () => `${API_URL}/reports/export-csv`,

  // Simulation
  startSimulation: async () => {
    try {
      const res = await apiClient.post('/simulation/start');
      return res.data;
    } catch (e) {
      return { status: 'started_mock' };
    }
  },

  stopSimulation: async () => {
    try {
      const res = await apiClient.post('/simulation/stop');
      return res.data;
    } catch (e) {
      return { status: 'stopped_mock' };
    }
  },

  getSimulationStatus: async () => {
    try {
      const res = await apiClient.get('/simulation/status');
      return res.data;
    } catch (e) {
      return { is_running: false };
    }
  },

  triggerScenario: async (scenario, childId = 'C-017', zone = 'Main Gate') => {
    try {
      const res = await apiClient.post('/simulation/trigger', {
        scenario,
        child_id: childId,
        zone
      });
      return res.data;
    } catch (e) {
      return { status: 'mock_triggered', scenario };
    }
  }
};
