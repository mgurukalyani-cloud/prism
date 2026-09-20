/**
 * SafeGuard AI - Built-in Universal Safety Platform Demo Data
 * Multi-demographic monitoring: Children, Adults, and Senior Citizens
 * Location: KLH Aziznagar Campus, Moinabad Road, Near TS Police Academy, Hyderabad, Telangana – 500075
 */

export const DEMO_STATS = {
  total_children: 42, // Monitored individuals across all age groups
  active_cameras: 12,
  active_alerts: 3,
  high_risk_events: 2,
  low_risk_count: 32,
  medium_risk_count: 8,
  high_risk_count: 2,
  system_status: "Online",
  ai_status: "YOLOv8 Dynamic Active"
};

export const DEMO_CHILDREN = [
  // Children & Students
  { id: 1, anonymous_id: "C-200", category: "CHILD", name: "Student Token C-200", current_zone: "Moinabad Road Main Gate", status: "Attention", risk_level: "HIGH", risk_score: 88, lat: 17.3474, lng: 78.3351, last_seen: "Just now" },
  { id: 2, anonymous_id: "C-017", category: "CHILD", name: "Student Token C-017", current_zone: "Central Campus Plaza", status: "Active", risk_level: "LOW", risk_score: 12, lat: 17.3458, lng: 78.3370, last_seen: "Just now" },
  { id: 3, anonymous_id: "C-021", category: "CHILD", name: "Student Token C-021", current_zone: "Sports Ground", status: "Attention", risk_level: "HIGH", risk_score: 92, lat: 17.3454, lng: 78.3374, last_seen: "1 min ago" },
  { id: 4, anonymous_id: "C-034", category: "CHILD", name: "Student Token C-034", current_zone: "Campus Transit & Bus Terminal", status: "Active", risk_level: "LOW", risk_score: 15, lat: 17.3444, lng: 78.3378, last_seen: "2 mins ago" },
  
  // Adults & Campus Staff
  { id: 5, anonymous_id: "P-101", category: "ADULT", name: "Staff Member P-101", current_zone: "KLH Academic Block", status: "Active", risk_level: "LOW", risk_score: 10, lat: 17.3468, lng: 78.3366, last_seen: "Just now" },
  { id: 6, anonymous_id: "P-104", category: "ADULT", name: "Operations Tech P-104", current_zone: "Staff Parking", status: "Active", risk_level: "MEDIUM", risk_score: 48, lat: 17.3446, lng: 78.3358, last_seen: "3 mins ago" },
  { id: 7, anonymous_id: "P-200", category: "ADULT", name: "Visitor Token P-200", current_zone: "Moinabad Road Main Gate", status: "Attention", risk_level: "HIGH", risk_score: 84, lat: 17.3476, lng: 78.3349, last_seen: "Just now" },
  
  // Senior Citizens & Elders
  { id: 8, anonymous_id: "SR-301", category: "SENIOR", name: "Senior Visitor SR-301", current_zone: "KLH Academic Block", status: "Active", risk_level: "LOW", risk_score: 14, lat: 17.3466, lng: 78.3369, last_seen: "2 mins ago" },
  { id: 9, anonymous_id: "SR-305", category: "SENIOR", name: "Elder Citizen SR-305", current_zone: "Central Campus Plaza", status: "Active", risk_level: "MEDIUM", risk_score: 42, lat: 17.3456, lng: 78.3376, last_seen: "4 mins ago" },
  { id: 10, anonymous_id: "SR-310", category: "SENIOR", name: "Senior Resident SR-310", current_zone: "Sports Ground", status: "Attention", risk_level: "HIGH", risk_score: 89, lat: 17.3452, lng: 78.3371, last_seen: "Just now" },

  // Additional Monitored Tokens
  { id: 11, anonymous_id: "C-052", category: "CHILD", name: "Student Token C-052", current_zone: "KLH Academic Block", status: "Active", risk_level: "LOW", risk_score: 10, lat: 17.3470, lng: 78.3362, last_seen: "5 mins ago" },
  { id: 12, anonymous_id: "C-089", category: "CHILD", name: "Student Token C-089", current_zone: "Central Campus Plaza", status: "Active", risk_level: "LOW", risk_score: 11, lat: 17.3459, lng: 78.3373, last_seen: "7 mins ago" },
];

export const DEMO_CAMERAS = [
  {
    id: 1,
    camera_code: "CAM-01",
    name: "Sports Ground North Feed",
    location: "Central Campus Plaza",
    zone_name: "Central Campus Plaza",
    status: "ONLINE",
    detection_count: 24,
    current_risk: "LOW",
    lat: 17.3458,
    lng: 78.3375,
    detections: [
      { id: "C-017", confidence: 0.94, bbox: [120, 80, 240, 320], activity: "Normal Walking" },
      { id: "C-021", confidence: 0.91, bbox: [340, 110, 440, 310], activity: "Sports Activity" }
    ]
  },
  {
    id: 2,
    camera_code: "CAM-02",
    name: "KLH Academic Block West",
    location: "KLH Academic Block",
    zone_name: "KLH Academic Block",
    status: "ONLINE",
    detection_count: 32,
    current_risk: "LOW",
    lat: 17.3468,
    lng: 78.3368,
    detections: [
      { id: "P-101", confidence: 0.96, bbox: [180, 90, 280, 300], activity: "Standing Dwell" },
      { id: "SR-301", confidence: 0.92, bbox: [420, 130, 510, 310], activity: "Assisted Walk" }
    ]
  },
  {
    id: 3,
    camera_code: "CAM-03",
    name: "Moinabad Road Main Gate",
    location: "Moinabad Road Main Gate",
    zone_name: "Moinabad Road Main Gate",
    status: "ONLINE",
    detection_count: 8,
    current_risk: "HIGH",
    lat: 17.3474,
    lng: 78.3350,
    detections: [
      { id: "C-200", confidence: 0.95, bbox: [200, 100, 310, 330], activity: "Rapid Boundary Movement" }
    ]
  },
  {
    id: 4,
    camera_code: "CAM-04",
    name: "Bus Terminal Bay #2",
    location: "Campus Transit & Bus Terminal",
    zone_name: "Campus Transit & Bus Terminal",
    status: "ONLINE",
    detection_count: 16,
    current_risk: "MEDIUM",
    lat: 17.3445,
    lng: 78.3378,
    detections: [
      { id: "P-104", confidence: 0.89, bbox: [150, 120, 260, 290], activity: "Vehicle Staging" }
    ]
  },
  {
    id: 5,
    camera_code: "CAM-05",
    name: "TSPA Junction Boundary Sensor",
    location: "Perimeter Boundary",
    zone_name: "Perimeter Boundary",
    status: "ONLINE",
    detection_count: 5,
    current_risk: "HIGH",
    lat: 17.3485,
    lng: 78.3385,
    detections: [
      { id: "P-200", confidence: 0.93, bbox: [160, 110, 270, 310], activity: "Fence Proximity" }
    ]
  },
  {
    id: 6,
    camera_code: "CAM-06",
    name: "Faculty Parking Surveillance",
    location: "Staff Parking",
    zone_name: "Staff Parking",
    status: "ONLINE",
    detection_count: 14,
    current_risk: "LOW",
    lat: 17.3448,
    lng: 78.3356,
    detections: [
      { id: "SR-305", confidence: 0.90, bbox: [140, 100, 250, 280], activity: "Normal Walking" }
    ]
  }
];

export const DEMO_ZONES = [
  {
    id: 1,
    name: "Central Campus Plaza",
    zone_type: "Safe Zone",
    description: "KLH Central courtyard and student recreation plaza",
    color: "#10B981",
    base_risk_score: 10,
    coordinates: [
      [17.3462, 78.3365],
      [17.3462, 78.3380],
      [17.3450, 78.3380],
      [17.3450, 78.3365]
    ]
  },
  {
    id: 2,
    name: "KLH Academic Block",
    zone_type: "Safe Zone",
    description: "Lecture halls, faculty rooms, and primary corridors",
    color: "#10B981",
    base_risk_score: 15,
    coordinates: [
      [17.3475, 78.3360],
      [17.3475, 78.3375],
      [17.3462, 78.3375],
      [17.3462, 78.3360]
    ]
  },
  {
    id: 3,
    name: "Staff Parking",
    zone_type: "Warning Zone",
    description: "Faculty and visitor vehicle parking and circulation lanes",
    color: "#F59E0B",
    base_risk_score: 40,
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
    description: "University bus station and passenger boarding gates",
    color: "#3B82F6",
    base_risk_score: 35,
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
    description: "Highway perimeter gate connecting to Moinabad Road",
    color: "#EF4444",
    base_risk_score: 80,
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
    description: "North-East perimeter fence near TS Police Academy line",
    color: "#DC2626",
    base_risk_score: 90,
    coordinates: [
      [17.3490, 78.3375],
      [17.3490, 78.3392],
      [17.3478, 78.3392],
      [17.3478, 78.3375]
    ]
  }
];


export const DEMO_EVENTS = [
  {
    id: 1,
    child_id: "C-200",
    camera_id: "CAM-03",
    event_type: "Restricted Zone Entry",
    zone: "Moinabad Road Main Gate",
    confidence: 0.95,
    risk_score: 88,
    risk_level: "HIGH",
    status: "ACTIVE",
    description: "Student C-200 approached perimeter boundary toward arterial Moinabad Road.",
    timestamp: "10:32 AM"
  },
  {
    id: 2,
    child_id: "C-021",
    camera_id: "CAM-01",
    event_type: "Fall Detected",
    zone: "Sports Ground",
    confidence: 0.93,
    risk_score: 92,
    risk_level: "HIGH",
    status: "ACTIVE",
    description: "Rapid posture collapse to ground detected for Student C-021 at sports field.",
    timestamp: "10:28 AM"
  },
  {
    id: 3,
    child_id: "SR-310",
    camera_id: "CAM-01",
    event_type: "Distress / Posture Collapse",
    zone: "Central Campus Plaza",
    confidence: 0.96,
    risk_score: 89,
    risk_level: "HIGH",
    status: "ACTIVE",
    description: "Senior citizen SR-310 recumbent near courtyard seating; immediate medical assist flagged.",
    timestamp: "10:22 AM"
  },
  {
    id: 4,
    child_id: "P-104",
    camera_id: "CAM-04",
    event_type: "Vehicle Proximity Hazard",
    zone: "Campus Transit & Bus Terminal",
    confidence: 0.88,
    risk_score: 54,
    risk_level: "MEDIUM",
    status: "ACTIVE",
    description: "Staff member P-104 tracking near reversing bus lane boundary.",
    timestamp: "10:14 AM"
  },
  {
    id: 5,
    child_id: "P-200",
    camera_id: "CAM-05",
    event_type: "Unusual Loitering",
    zone: "Perimeter Boundary",
    confidence: 0.91,
    risk_score: 62,
    risk_level: "MEDIUM",
    status: "ACTIVE",
    description: "Visitor token P-200 loitering near TSPA boundary fence for over 5 minutes.",
    timestamp: "10:05 AM"
  },
  {
    id: 6,
    child_id: "C-017",
    camera_id: "CAM-01",
    event_type: "Normal Supervised Movement",
    zone: "Central Campus Plaza",
    confidence: 0.96,
    risk_score: 12,
    risk_level: "LOW",
    status: "RESOLVED",
    description: "Student C-017 verified in supervised central plaza gathering.",
    timestamp: "09:45 AM"
  }
];

export const DEMO_ALERTS = [
  // High Risk Alerts (New & Urgent)
  {
    id: 1,
    alert_code: "ALT-2026-0200",
    child_id: "C-200",
    person_id: "C-200",
    person_category: "CHILD",
    risk_level: "HIGH",
    event_type: "Restricted Zone Entry",
    zone: "Moinabad Road Main Gate",
    message: "Student C-200 crossed safety buffer line toward Moinabad Highway gate.",
    status: "NEW",
    created_at: "10:32 AM"
  },
  {
    id: 2,
    alert_code: "ALT-2026-0021",
    child_id: "C-021",
    person_id: "C-021",
    person_category: "CHILD",
    risk_level: "HIGH",
    event_type: "Fall Detected",
    zone: "Sports Ground",
    message: "Sudden posture collapse detected; child C-021 remains recumbent.",
    status: "NEW",
    created_at: "10:28 AM"
  },
  {
    id: 3,
    alert_code: "ALT-2026-0310",
    child_id: "SR-310",
    person_id: "SR-310",
    person_category: "SENIOR",
    risk_level: "HIGH",
    event_type: "Medical Collapse / Fall",
    zone: "Central Campus Plaza",
    message: "Senior citizen SR-310 unassisted fall detected at courtyard walkway.",
    status: "NEW",
    created_at: "10:22 AM"
  },
  {
    id: 4,
    alert_code: "ALT-2026-0104",
    child_id: "P-104",
    person_id: "P-104",
    person_category: "ADULT",
    risk_level: "MEDIUM",
    event_type: "Transit Hazard Loitering",
    zone: "Campus Transit & Bus Terminal",
    message: "Adult P-104 lingering inside active vehicle turning radius for >3 mins.",
    status: "ACKNOWLEDGED",
    created_at: "10:14 AM"
  },
  {
    id: 5,
    alert_code: "ALT-2026-0201",
    child_id: "P-200",
    person_id: "P-200",
    person_category: "ADULT",
    risk_level: "MEDIUM",
    event_type: "Perimeter Boundary Loitering",
    zone: "Perimeter Boundary",
    message: "Visitor P-200 pacing along TSPA fence line without authorized pass.",
    status: "ACKNOWLEDGED",
    created_at: "10:05 AM"
  },
  {
    id: 6,
    alert_code: "ALT-2026-0301",
    child_id: "SR-301",
    person_id: "SR-301",
    person_category: "SENIOR",
    risk_level: "LOW",
    event_type: "Assisted Transit Notice",
    zone: "KLH Academic Block",
    message: "Senior visitor SR-301 assisted safely into main seminar hall.",
    status: "NEW",
    created_at: "09:55 AM"
  },
  {
    id: 7,
    alert_code: "ALT-2026-0017",
    child_id: "C-017",
    person_id: "C-017",
    person_category: "CHILD",
    risk_level: "LOW",
    event_type: "Normal Stable Motion",
    zone: "Central Campus Plaza",
    message: "Student C-017 returned to classroom wing; all clear.",
    status: "RESOLVED",
    created_at: "09:45 AM"
  },
  {
    id: 8,
    alert_code: "ALT-2026-0101",
    child_id: "P-101",
    person_id: "P-101",
    person_category: "ADULT",
    risk_level: "LOW",
    event_type: "Staff Check-In",
    zone: "KLH Academic Block",
    message: "Staff member P-101 verified at security reception desk.",
    status: "RESOLVED",
    created_at: "09:30 AM"
  }
];


