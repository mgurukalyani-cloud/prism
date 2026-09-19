# ChildGuard AI — REST & WebSocket API Reference

The backend provides automatic Swagger UI documentation at:  
`http://localhost:8000/docs`

Base API URL: `http://localhost:8000/api`  
WebSocket URL: `ws://localhost:8000/ws/alerts`

---

## 1. System Health & Telemetry

### `GET /api/health`
Returns backend status and active AI vision engine.
```json
{
  "status": "healthy",
  "service": "ChildGuard AI",
  "version": "1.0.0",
  "ai_engine": "AI Demo Mode",
  "database": "connected"
}
```

---

## 2. Dashboard

### `GET /api/dashboard/stats`
Returns top-level campus safety counters.
```json
{
  "total_children": 128,
  "active_cameras": 12,
  "active_alerts": 4,
  "high_risk_events": 2,
  "low_risk_count": 14,
  "medium_risk_count": 5,
  "high_risk_count": 2,
  "system_status": "Online",
  "ai_status": "AI Demo Mode"
}
```

---

## 3. Children (Anonymous Tokens)

### `GET /api/children`
Query parameters: `risk` (`LOW` | `MEDIUM` | `HIGH`), `zone` (string).
Returns array of tracked anonymous tokens:
```json
[
  {
    "id": 1,
    "anonymous_id": "C-017",
    "current_zone": "Main Gate",
    "status": "Attention",
    "risk_level": "HIGH",
    "risk_score": 85,
    "lat": 37.7763,
    "lng": -122.4175,
    "last_seen": "2026-09-19T10:32:00"
  }
]
```

### `GET /api/children/{id}`
Returns details for a child token including their recent event history.

---

## 4. Events

### `GET /api/events`
Query parameters: `child_id`, `event_type`, `risk`, `zone`, `limit`.

### `POST /api/events`
Manually inject or record an event.
```json
{
  "child_id": "C-017",
  "camera_id": "CAM-03",
  "event_type": "Restricted Zone Entry",
  "zone": "Main Gate",
  "confidence": 0.95,
  "description": "Perimeter crossed toward road."
}
```

---

## 5. Alerts

### `GET /api/alerts`
Query parameters: `status` (`NEW` | `ACKNOWLEDGED` | `RESOLVED`), `risk`, `limit`.

### `POST /api/alerts/{id}/acknowledge`
Marks alert as `ACKNOWLEDGED`.

### `POST /api/alerts/{id}/resolve`
Marks alert as `RESOLVED`.

---

## 6. Cameras & Zones

### `GET /api/cameras`
Returns list of optical and vehicular sensors.

### `GET /api/cameras/{camera_code}/detections`
Returns active detections and bounding box coordinates.

### `POST /api/cameras`
Registers a new camera.

### `GET /api/zones`
Returns campus geofence polygons with coordinates and classifications.

### `POST /api/zones`
Defines a new campus zone.

---

## 7. Reports

### `GET /api/reports/summary`
Returns aggregate statistics formatted for Recharts.

### `GET /api/reports/export-csv`
Returns a downloadable CSV of all safety events.

---

## 8. Demo Simulation Engine

### `POST /api/simulation/start`
Starts automated 5-second event generation cycle.

### `POST /api/simulation/stop`
Stops automated simulation loop.

### `GET /api/simulation/status`
Returns `{ "is_running": true, "current_step": 3 }`.

### `POST /api/simulation/trigger`
Instantly injects a specific scenario:
```json
{
  "scenario": "restricted_zone",
  "child_id": "C-017",
  "zone": "Main Gate"
}
```
Available scenarios: `restricted_zone`, `fall_detected`, `child_left_behind`.

---

## 9. Real-Time WebSocket (`/ws/alerts`)

Clients connect via `ws://localhost:8000/ws/alerts`. The server broadcasts JSON payloads:

```json
{
  "type": "alert",
  "alert_id": 14,
  "alert_code": "ALT-20260919-4F91A2",
  "risk": "HIGH",
  "child_id": "C-017",
  "event_type": "Restricted Zone Entry",
  "zone": "Main Gate",
  "message": "Child C-017 entered a restricted zone (Main Gate)",
  "timestamp": "2026-09-19T10:32:00",
  "status": "NEW"
}
```
