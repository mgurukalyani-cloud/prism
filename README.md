# ChildGuard AI — AI-Powered Child Monitoring & Safety Ecosystem (PRISMATICA)

> **Tagline:** Detect. Assess. Alert. Protect.  
> **Event:** PRISMTECH 2026 — Social Stream  
> **Domain:** Child Monitoring & Campus Safety  
> **Repository:** [https://github.com/mgurukalyani-cloud/prism](https://github.com/mgurukalyani-cloud/prism)  
> **Standalone Interactive Preview:** [`childguard_preview.html`](./childguard_preview.html)  

---

## 1. Project Overview

**ChildGuard AI (PRISMATICA)** is an intelligent, privacy-preserving AI decision-support platform designed for authorized campus environments such as schools, child daycare facilities, educational institutions, and school transportation.

The system ingests real-time visual feeds (CCTV camera arrays, school bus cameras, geofence polygons, and spatial telemetry) and processes them through an end-to-end multi-stage pipeline:

$$\text{Video Ingestion} \rightarrow \text{Optical Flow \& Motion Tracking} \rightarrow \text{Posture Heuristics} \rightarrow \text{Geofence Intersection} \rightarrow \text{Context Fusion} \rightarrow \text{Multi-Tier Risk Assessment} \rightarrow \text{Instant Alert Dispatch} \rightarrow \text{Reactive Live Bar Graphs}$$

---

## 2. Key Features

### 🎬 AI Video Analysis & Motion Detection
- **Upload & Monitor Any Demo Video:** Upload your custom MP4/WebM video or run the built-in CCTV loop.
- **Computer Vision Motion Analysis:** Continuous frame-difference optical tracking with real-time bounding boxes and corner brackets.
- **Dynamic Risk Categorization:** Clearly identifies:
  - 🟢 **No Risk Detected** (Within safe play boundaries)
  - 🟡 **Low Risk** (Approaching buffer zone)
  - 🟠 **Medium Risk** (Buffer zone loitering / high velocity)
  - 🔴 **High Risk** (Restricted perimeter breach)
  - 🚨 **Critical Risk** (Fall detected / sudden posture collapse)
- **Live Video Metrics HUD:** Displays real-time confidence %, motion energy score, velocity (px/frame), and synchronous risk timeline.
- **Anti-Shaking Stabilization:** Exponential Moving Average (EMA) smoothing ($\alpha = 0.24$) and letterbox coordinate mapping eliminate viewport jitter.

### 📊 Reactive Live Bar Graphs ("Problem Solved $\rightarrow$ Bar Graph Updates")
- Dynamic Recharts bar visualizations update live:
  - Solving an incident immediately causes the **Green "Problems Solved"** bar to climb (+1).
  - The **Red "Urgent Unresolved"** bar drops (-1).
  - Remediation Rate % recalculates in real-time.
- Interactive **"⚡ Solve Problem (Bar Graph Live +1)"** quick-action buttons on Dashboard, Alerts, and Reports.

### 🔐 Mandatory Login-First Flow & Authorized Personas
- Website entry is strictly gated: Navigating to the site root immediately opens the **Login Console** first.
- Strictly authorized staff personas:
  - 👑 **System Administrator** (`admin@childguard.ai` / `admin123`) $\rightarrow$ Executive Command Center & Geofence Policy
  - 👮 **Campus Security** (`security@childguard.ai` / `security123`) $\rightarrow$ Real-time CCTV Video Analysis & Alert Dispatch
  - *(Parent & Teacher options completely removed for strict campus security integrity)*

### 🛡️ Privacy by Design
- **Zero Facial Recognition:** No biometric profiles stored. Entities are represented via anonymous tokens (`C-001`, `C-017`, `C-021`, etc.).
- **Zero-Crash Resilience:** Includes an automated simulation engine ensuring 100% presentation uptime during demonstrations.

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React.js 18, Vite, React Router v6, Tailwind CSS, Recharts, Leaflet, react-leaflet, Lucide Icons |
| **Backend** | Python 3.11+, FastAPI, Uvicorn (with hot reload), SQLAlchemy, Pydantic v2, SQLite (PostgreSQL-ready), WebSockets |
| **AI / Computer Vision** | Ultralytics YOLOv8, Optical Flow Frame Differencing, Aspect Ratio Posture Analysis, Ray-Casting Point-in-Polygon Geofencing |
| **Interactive Standalone** | `childguard_preview.html` (Single-file zero-dependency self-contained web preview) |
| **Testing** | Pytest, TestClient, Httpx (12/12 test suites passing) |

---

## 4. Project Directory Structure

```
PRISMATICA/
├── childguard_preview.html       # Standalone zero-dependency interactive web preview
├── frontend/                     # React + Vite application
│   ├── src/
│   │   ├── components/           # Layout, Sidebar, Header, StatCard, AlertCard, CameraCard, MapView, etc.
│   │   ├── pages/                # Login, Dashboard, Monitoring, Children, Events, Alerts, Map, Reports, Admin, Settings
│   │   ├── services/             # Axios API client & WebSocket streaming service
│   │   ├── hooks/                # useWebSocket custom hook
│   │   ├── data/                 # Offline demo fallback dataset
│   │   ├── App.jsx               # Authentication routing & Protected Route Shell
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # FastAPI Python backend
│   ├── app/
│   │   ├── main.py               # Application entrypoint & WebSocket endpoint
│   │   ├── config.py             # Configuration & environment variables
│   │   ├── database.py           # SQLAlchemy database connection
│   │   ├── schemas.py            # Pydantic validation schemas
│   │   ├── models/               # Child, Camera, Zone, Event, Alert, User models
│   │   ├── routes/               # REST API endpoints (alerts, dashboard, cameras, children, reports, zones)
│   │   ├── ai/                   # AIEngine, CentroidTracker, FallDetector, ZoneDetector, RiskEngine
│   │   ├── services/             # WebSocket connection manager, incident simulation services
│   │   └── utils/                # Database initial seeder
│   ├── tests/                    # Pytest test suite (12 tests)
│   └── requirements.txt
│
├── docs/                         # Architecture, API & demo documentation
│   ├── architecture.md
│   ├── api.md
│   └── demo.md
├── start-dev.bat                 # Windows one-click dual development launcher
├── .gitignore
└── README.md
```

---

## 5. Quick Start Instructions

### Option 1: Standalone Single-File Preview (Instant, No Installation)
Simply double-click or open **[`childguard_preview.html`](./childguard_preview.html)** in any modern web browser (Chrome, Edge, Firefox, Safari). It runs 100% offline with zero external dependencies!

### Option 2: Full React + FastAPI Development Environment

#### 1. Backend Server Setup
```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- Interactive Swagger API Docs: `http://127.0.0.1:8000/docs`
- Health Check: `http://127.0.0.1:8000/api/health`

#### 2. Frontend Setup
```powershell
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5174
```
- Open in browser: `http://127.0.0.1:5174` (automatically opens the Login Console)

---

## 6. Authorized Demo Personas

| Persona | Official Email | Password | Landing Route | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@childguard.ai` | `admin123` | `/dashboard` | Full campus telemetry, policy tuning & command center |
| **Campus Security** | `security@childguard.ai` | `security123` | `/monitoring` | Real-time CCTV optical analysis, incident dispatch & response |

---

## 7. Running Automated Verification Tests

```powershell
cd backend
python -m pytest tests -v
```
All 12 backend unit and integration tests verify:
- API health and telemetry endpoints
- Child tracking, Camera matrix, Geofence zones
- Event generation, Alert dispatching, and resolution cycles
- Heuristic risk scoring across perimeter breaches, sudden falls, and transit zones

---

## 8. Compliance & Ethical AI Disclaimer

> **AI-Assisted Human-in-the-Loop Safety System**  
> ChildGuard AI (PRISMATICA) is designed strictly as an automated heuristic decision-support system to accelerate reaction times for trained campus security personnel. It preserves individual student privacy by computing anonymized pose coordinates and zone intersections without storing or processing facial recognition biometrics.
