/**
 * ChildGuard AI - Built-in Offline Fallback Demo Data
 * Guarantees 100% demo reliability even if the backend is temporarily offline.
 */

export const DEMO_STATS = {
  total_children: 128,
  active_cameras: 12,
  active_alerts: 4,
  high_risk_events: 2,
  low_risk_count: 14,
  medium_risk_count: 5,
  high_risk_count: 2,
  system_status: "Online",
  ai_status: "AI Demo Mode"
};

export const DEMO_CHILDREN = [
  { id: 1, anonymous_id: "C-001", current_zone: "Main Playground", status: "Active", risk_level: "LOW", risk_score: 12, lat: 37.7748, lng: -122.4195, last_seen: "2 mins ago" },
  { id: 2, anonymous_id: "C-002", current_zone: "Academic Block", status: "Active", risk_level: "LOW", risk_score: 15, lat: 37.7760, lng: -122.4205, last_seen: "Just now" },
  { id: 3, anonymous_id: "C-005", current_zone: "Academic Block", status: "Active", risk_level: "LOW", risk_score: 10, lat: 37.7759, lng: -122.4208, last_seen: "1 min ago" },
  { id: 4, anonymous_id: "C-011", current_zone: "Main Playground", status: "Active", risk_level: "LOW", risk_score: 20, lat: 37.7750, lng: -122.4190, last_seen: "3 mins ago" },
  { id: 5, anonymous_id: "C-017", current_zone: "Main Gate", status: "Attention", risk_level: "HIGH", risk_score: 85, lat: 37.7763, lng: -122.4175, last_seen: "Just now" },
  { id: 6, anonymous_id: "C-021", current_zone: "Main Playground", status: "Attention", risk_level: "HIGH", risk_score: 92, lat: 37.7746, lng: -122.4192, last_seen: "Just now" },
  { id: 7, anonymous_id: "C-034", current_zone: "School Bus Zone", status: "Attention", risk_level: "HIGH", risk_score: 95, lat: 37.7728, lng: -122.4182, last_seen: "1 min ago" },
  { id: 8, anonymous_id: "C-041", current_zone: "Parking Area", status: "Active", risk_level: "MEDIUM", risk_score: 48, lat: 37.7735, lng: -122.4210, last_seen: "4 mins ago" },
  { id: 9, anonymous_id: "C-052", current_zone: "Main Playground", status: "Active", risk_level: "LOW", risk_score: 10, lat: 37.7752, lng: -122.4198, last_seen: "5 mins ago" },
  { id: 10, anonymous_id: "C-063", current_zone: "Academic Block", status: "Active", risk_level: "LOW", risk_score: 14, lat: 37.7762, lng: -122.4202, last_seen: "6 mins ago" },
  { id: 11, anonymous_id: "C-077", current_zone: "School Bus Zone", status: "Active", risk_level: "LOW", risk_score: 18, lat: 37.7725, lng: -122.4185, last_seen: "8 mins ago" },
  { id: 12, anonymous_id: "C-089", current_zone: "Main Playground", status: "Active", risk_level: "LOW", risk_score: 10, lat: 37.7749, lng: -122.4189, last_seen: "10 mins ago" },
];

export const DEMO_CAMERAS = [
  {
    id: 1,
    camera_code: "CAM-01",
    name: "Playground North Feed",
    location: "Main Playground",
    zone_name: "Main Playground",
    status: "ONLINE",
    detection_count: 18,
    current_risk: "LOW",
    detections: [
      { id: "C-017", confidence: 0.94, bbox: [120, 80, 240, 320], activity: "Walking" },
      { id: "C-021", confidence: 0.89, bbox: [340, 110, 440, 310], activity: "Playing" }
    ]
  },
  {
    id: 2,
    camera_code: "CAM-02",
    name: "Academic Block Corridor",
    location: "Academic Block",
    zone_name: "Academic Block",
    status: "ONLINE",
    detection_count: 24,
    current_risk: "LOW",
    detections: [
      { id: "C-001", confidence: 0.96, bbox: [180, 90, 280, 300], activity: "Standing" },
      { id: "C-002", confidence: 0.91, bbox: [420, 130, 510, 310], activity: "Walking" }
    ]
  },
  {
    id: 3,
    camera_code: "CAM-03",
    name: "Main Gate Perimeter",
    location: "Main Gate",
    zone_name: "Main Gate",
    status: "ONLINE",
    detection_count: 6,
    current_risk: "HIGH",
    detections: [
      { id: "C-034", confidence: 0.93, bbox: [200, 100, 310, 330], activity: "Restricted Zone Entry" }
    ]
  },
  {
    id: 4,
    camera_code: "CAM-04",
    name: "Bus Bay 2 Camera",
    location: "School Bus Zone",
    zone_name: "School Bus Zone",
    status: "ONLINE",
    detection_count: 12,
    current_risk: "HIGH",
    detections: [
      { id: "C-041", confidence: 0.88, bbox: [150, 120, 260, 290], activity: "Stationary" }
    ]
  }
];

export const DEMO_ZONES = [
  {
    id: 1,
    name: "Main Playground",
    zone_type: "Safe Zone",
    description: "Open play field with perimeter fencing",
    color: "#10B981",
    base_risk_score: 10,
    coordinates: [
      [37.7755, -122.4205],
      [37.7755, -122.4185],
      [37.7742, -122.4185],
      [37.7742, -122.4205]
    ]
  },
  {
    id: 2,
    name: "Academic Block",
    zone_type: "Safe Zone",
    description: "Classrooms and indoor corridors",
    color: "#10B981",
    base_risk_score: 15,
    coordinates: [
      [37.7765, -122.4215],
      [37.7765, -122.4195],
      [37.7756, -122.4195],
      [37.7756, -122.4215]
    ]
  },
  {
    id: 3,
    name: "Parking Area",
    zone_type: "Warning Zone",
    description: "Staff and visitor vehicle parking area",
    color: "#F59E0B",
    base_risk_score: 40,
    coordinates: [
      [37.7740, -122.4220],
      [37.7740, -122.4200],
      [37.7730, -122.4200],
      [37.7730, -122.4220]
    ]
  },
  {
    id: 4,
    name: "School Bus Zone",
    zone_type: "Safe Zone",
    description: "Bus parking and student boarding station",
    color: "#3B82F6",
    base_risk_score: 20,
    coordinates: [
      [37.7732, -122.4190],
      [37.7732, -122.4175],
      [37.7722, -122.4175],
      [37.7722, -122.4190]
    ]
  },
  {
    id: 5,
    name: "Main Gate",
    zone_type: "Restricted Zone",
    description: "Perimeter gate facing arterial road",
    color: "#EF4444",
    base_risk_score: 80,
    coordinates: [
      [37.7768, -122.4180],
      [37.7768, -122.4168],
      [37.7758, -122.4168],
      [37.7758, -122.4180]
    ]
  },
  {
    id: 6,
    name: "Restricted Construction Zone",
    zone_type: "Restricted Zone",
    description: "Active renovation zone with scaffolding",
    color: "#DC2626",
    base_risk_score: 90,
    coordinates: [
      [37.7738, -122.4170],
      [37.7738, -122.4155],
      [37.7728, -122.4155],
      [37.7728, -122.4170]
    ]
  }
];

export const DEMO_EVENTS = [
  {
    id: 1,
    child_id: "C-017",
    camera_id: "CAM-03",
    event_type: "Restricted Zone Entry",
    zone: "Main Gate",
    confidence: 0.95,
    risk_score: 85,
    risk_level: "HIGH",
    status: "ACTIVE",
    description: "Child C-017 traversed perimeter boundary toward Main Gate road.",
    timestamp: "10:32 AM"
  },
  {
    id: 2,
    child_id: "C-021",
    camera_id: "CAM-01",
    event_type: "Fall Detected",
    zone: "Main Playground",
    confidence: 0.93,
    risk_score: 92,
    risk_level: "HIGH",
    status: "ACTIVE",
    description: "Rapid posture shift to ground horizontal position detected for C-021.",
    timestamp: "10:28 AM"
  },
  {
    id: 3,
    child_id: "C-034",
    camera_id: "CAM-04",
    event_type: "Child Left Behind",
    zone: "School Bus Zone",
    confidence: 0.98,
    risk_score: 95,
    risk_level: "HIGH",
    status: "ACTIVE",
    description: "Trip completed at South Terminal; child C-034 remains stationary in aisle.",
    timestamp: "10:20 AM"
  },
  {
    id: 4,
    child_id: "C-041",
    camera_id: "CAM-02",
    event_type: "Unusual Activity",
    zone: "Parking Area",
    confidence: 0.86,
    risk_score: 48,
    risk_level: "MEDIUM",
    status: "CONFIRMED",
    description: "Extended loitering trajectory observed in staff vehicle perimeter.",
    timestamp: "10:14 AM"
  },
  {
    id: 5,
    child_id: "C-001",
    camera_id: "CAM-01",
    event_type: "Zone Entry",
    zone: "Main Playground",
    confidence: 0.96,
    risk_score: 15,
    risk_level: "LOW",
    status: "RESOLVED",
    description: "Child C-001 entered supervised recreational zone.",
    timestamp: "09:45 AM"
  },
  {
    id: 6,
    child_id: "C-002",
    camera_id: "CAM-02",
    event_type: "Zone Entry",
    zone: "Academic Block",
    confidence: 0.92,
    risk_score: 12,
    risk_level: "LOW",
    status: "RESOLVED",
    description: "Child C-002 entered primary classroom hallway.",
    timestamp: "09:30 AM"
  }
];

export const DEMO_ALERTS = [
  {
    id: 1,
    alert_code: "ALT-2026-0001",
    child_id: "C-017",
    risk_level: "HIGH",
    event_type: "Restricted Zone Entry",
    zone: "Main Gate",
    message: "Child C-017 crossed perimeter geofence toward Main Gate road.",
    status: "NEW",
    created_at: "10:32 AM"
  },
  {
    id: 2,
    alert_code: "ALT-2026-0002",
    child_id: "C-021",
    risk_level: "HIGH",
    event_type: "Fall Detected",
    zone: "Main Playground",
    message: "Sudden posture collapse detected; child C-021 remains recumbent.",
    status: "NEW",
    created_at: "10:28 AM"
  },
  {
    id: 3,
    alert_code: "ALT-2026-0003",
    child_id: "C-034",
    risk_level: "HIGH",
    event_type: "Child Left Behind",
    zone: "School Bus Zone",
    message: "Bus trip status completed; stationary child detection remains inside vehicle.",
    status: "ACKNOWLEDGED",
    created_at: "10:20 AM"
  },
  {
    id: 4,
    alert_code: "ALT-2026-0004",
    child_id: "C-041",
    risk_level: "MEDIUM",
    event_type: "Unusual Activity",
    zone: "Parking Area",
    message: "Loitering detected near vehicle lane for greater than 3 minutes.",
    status: "NEW",
    created_at: "10:14 AM"
  }
];
