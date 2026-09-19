# ChildGuard AI — 5-Minute Hackathon Demonstration Script

This document provides a precise, step-by-step presentation flow for the hackathon judges.

---

## Pitch Overview (30 Seconds)
- **Problem:** Campus and event child safety monitoring is fragmented across unmonitored CCTVs, manual attendance registers, and delayed manual reporting.
- **Solution:** ChildGuard AI is an early-warning, AI-assisted decision-support platform that ingests camera and sensor data, validates anomalies temporally, assesses multi-factor risk, and alerts staff without biometric profiling.

---

## 5-Minute Demonstration Timeline

### [0:00 - 0:30] Landing Page & Privacy Positioning
1. Open `http://localhost:5173`.
2. Point to the tagline: **Detect. Assess. Alert. Protect.**
3. Highlight the **Privacy by Design** section:
   - *"We intentionally do NOT use facial recognition. We use anonymous tracking tokens `C-001` through `C-041`."*
   - Point out the mandatory human supervision disclaimer.
4. Click **"Get Started (Demo Login)"**.

### [0:30 - 1:00] Persona Login & Safety Dashboard
1. Select the **Security** or **Admin** preset and click **"Authenticate"**.
2. Arrive on the **Safety Command Center**:
   - Point to top metric cards: **128 Children Tracked**, **12 Active Cameras**, **4 Active Alerts**, **2 High Risk Events**.
   - Show the **Safety Health Index**: Low (Safe), Medium (Attention), High (Critical).

### [1:00 - 1:45] Live Monitoring & AI Overlays
1. Navigate to **Live Monitoring** (`/monitoring`).
2. Show the 4-camera grid:
   - `CAM-01`: Main Playground (children playing, emerald safe box).
   - `CAM-02`: Academic Block Corridor.
   - `CAM-03`: Main Gate (Restricted perimeter, flashing red bounding box).
   - `CAM-04`: Bus Bay 2 (Vehicle boarding zone).
3. Click a camera card to enlarge the inspection canvas with live HUD, 1080p timecode, and FPS indicator.

### [1:45 - 2:45] Triggering the 3 Core Scenarios
Explain that ChildGuard AI includes an automated demo simulation engine for reliable presentations:
1. In the inspection panel, click **"Scenario 1: Restricted Zone"**:
   - Immediately observe Child `C-017` crossing the Main Gate boundary.
   - Observe the **Live Real-Time Toast Alert** pop up in the upper right.
   - Click **"Acknowledge"** directly from the toast.
2. Click **"Scenario 2: Fall Detection"**:
   - Child `C-021` posture collapse heuristic triggers a HIGH risk alert.
3. Click **"Scenario 3: Bus Child Left Behind"**:
   - Trip completion sensor triggers vehicle in-cabin alert for Child `C-034`.
4. Click the top header button **"START DEMO"** to show continuous autonomous cycling every 5 seconds!

### [2:45 - 3:30] Geofence Safety Map
1. Navigate to **Safety Map** (`/map`).
2. Show the interactive Leaflet campus map:
   - Green polygon: Safe Zone (Playground).
   - Amber polygon: Warning Zone (Parking Area).
   - Red polygon: Restricted Zone (Main Gate).
3. Click child markers (`C-017`, `C-021`) to show live coordinates, zone, and risk level popups.

### [3:30 - 4:15] Audit Logs & Analytics Reports
1. Navigate to **Events** (`/events`):
   - Show the searchable and filterable table.
   - Click an event to open the detailed modal showcasing the **transparent rule-based risk score breakdown** (0–100) and temporal persistence filter.
2. Navigate to **Reports** (`/reports`):
   - Review Recharts analytics (Events by category, temporal activity curve, zone density).
   - Click **"Export Safety CSV"** to demonstrate instant CSV report generation.

### [4:15 - 5:00] Admin, Settings & Conclusion
1. Navigate to **Admin** (`/admin`):
   - Show how campus administrators can provision new camera codes or define new geofence polygons.
   - Show the editable Risk Engine weighting thresholds.
2. **Closing Statement:**
   - *"ChildGuard AI gives campus security and educators an intelligent, proactive safety copilot without invading child privacy. Detect. Assess. Alert. Protect."*
