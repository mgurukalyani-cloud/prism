from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import hashlib
from app.models.child import Child
from app.models.camera import Camera
from app.models.zone import Zone
from app.models.event import Event
from app.models.alert import Alert
from app.models.user import User

def hash_pw(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def seed_database(db: Session, force: bool = False):
    if not force and db.query(Child).first():
        return

    print("[Seed] Seeding SafeGuard AI records for KLH Aziznagar Campus...")

    # Clear existing demo data if force reseeding
    if force:
        db.query(Alert).delete()
        db.query(Event).delete()
        db.query(Child).delete()
        db.query(Camera).delete()
        db.query(Zone).delete()
        db.query(User).delete()
        db.commit()

    # 1. Seed Users (System Administrator and Campus Security)
    users = [
        User(email="admin@safeguard.ai", role="Admin", full_name="System Administrator", password_hash=hash_pw("admin123")),
        User(email="security@safeguard.ai", role="Security", full_name="Patrol Officer Vikram (Campus Security)", password_hash=hash_pw("security123")),
    ]
    db.add_all(users)

    # 2. Seed Campus Geofence Zones (KLH Aziznagar Campus, Hyderabad – 500075)
    zones = [
        Zone(
            name="KLH Academic Block",
            zone_type="Safe Zone",
            description="Lecture halls, computer labs, and primary academic corridors",
            color="#10B981",
            base_risk_score=10,
            coordinates_json='[{"lat": 17.3475, "lng": 78.3360}, {"lat": 17.3475, "lng": 78.3375}, {"lat": 17.3462, "lng": 78.3375}, {"lat": 17.3462, "lng": 78.3360}]'
        ),
        Zone(
            name="Central Campus Plaza",
            zone_type="Safe Zone",
            description="Open recreation plaza, cafeteria garden, and sports grounds",
            color="#10B981",
            base_risk_score=10,
            coordinates_json='[{"lat": 17.3462, "lng": 78.3365}, {"lat": 17.3462, "lng": 78.3380}, {"lat": 17.3450, "lng": 78.3380}, {"lat": 17.3450, "lng": 78.3365}]'
        ),
        Zone(
            name="Staff Parking",
            zone_type="Warning Zone",
            description="Vehicle parking bays, circulation driveways, and faculty parking",
            color="#F59E0B",
            base_risk_score=40,
            coordinates_json='[{"lat": 17.3454, "lng": 78.3352}, {"lat": 17.3454, "lng": 78.3364}, {"lat": 17.3442, "lng": 78.3364}, {"lat": 17.3442, "lng": 78.3352}]'
        ),
        Zone(
            name="Campus Transit & Bus Terminal",
            zone_type="Warning Zone",
            description="University bus terminal and passenger boarding bay",
            color="#3B82F6",
            base_risk_score=35,
            coordinates_json='[{"lat": 17.3450, "lng": 78.3370}, {"lat": 17.3450, "lng": 78.3385}, {"lat": 17.3438, "lng": 78.3385}, {"lat": 17.3438, "lng": 78.3370}]'
        ),
        Zone(
            name="Moinabad Road Main Gate",
            zone_type="Restricted Zone",
            description="Main campus entrance adjacent to arterial Moinabad Highway road",
            color="#EF4444",
            base_risk_score=80,
            coordinates_json='[{"lat": 17.3480, "lng": 78.3345}, {"lat": 17.3480, "lng": 78.3358}, {"lat": 17.3468, "lng": 78.3358}, {"lat": 17.3468, "lng": 78.3345}]'
        ),
        Zone(
            name="Perimeter Boundary",
            zone_type="Restricted Zone",
            description="North-East perimeter fencing near Telangana Police Academy line",
            color="#DC2626",
            base_risk_score=90,
            coordinates_json='[{"lat": 17.3490, "lng": 78.3375}, {"lat": 17.3490, "lng": 78.3392}, {"lat": 17.3478, "lng": 78.3392}, {"lat": 17.3478, "lng": 78.3375}]'
        )
    ]
    db.add_all(zones)

    # 3. Seed Cameras at KLH Aziznagar
    cameras = [
        Camera(
            camera_code="CAM-01",
            name="Sports Ground & Plaza Feed",
            location="Central Campus Plaza",
            zone_name="Central Campus Plaza",
            status="ONLINE",
            detection_count=24,
            current_risk="LOW"
        ),
        Camera(
            camera_code="CAM-02",
            name="KLH Academic Block West",
            location="KLH Academic Block",
            zone_name="KLH Academic Block",
            status="ONLINE",
            detection_count=32,
            current_risk="LOW"
        ),
        Camera(
            camera_code="CAM-03",
            name="Moinabad Road Main Gate",
            location="Moinabad Road Main Gate",
            zone_name="Moinabad Road Main Gate",
            status="ONLINE",
            detection_count=8,
            current_risk="HIGH"
        ),
        Camera(
            camera_code="CAM-04",
            name="Bus Terminal Bay #2",
            location="Campus Transit & Bus Terminal",
            zone_name="Campus Transit & Bus Terminal",
            status="ONLINE",
            detection_count=16,
            current_risk="MEDIUM"
        ),
        Camera(
            camera_code="CAM-05",
            name="TSPA Junction Boundary Sensor",
            location="Perimeter Boundary",
            zone_name="Perimeter Boundary",
            status="ONLINE",
            detection_count=5,
            current_risk="HIGH"
        ),
        Camera(
            camera_code="CAM-06",
            name="Faculty Parking Surveillance",
            location="Staff Parking",
            zone_name="Staff Parking",
            status="ONLINE",
            detection_count=14,
            current_risk="LOW"
        )
    ]
    db.add_all(cameras)

    # 4. Seed Monitored Population (Multi-demographic: Children, Adults, Senior Citizens)
    people_data = [
        # Students / Children
        ("C-200", "Moinabad Road Main Gate", "Attention", "HIGH", 85, 17.3474, 78.3351),
        ("C-017", "Central Campus Plaza", "Active", "LOW", 12, 17.3458, 78.3370),
        ("C-021", "Central Campus Plaza", "Attention", "HIGH", 82, 17.3454, 78.3374),
        ("C-034", "Campus Transit & Bus Terminal", "Active", "LOW", 15, 17.3444, 78.3378),
        ("C-052", "KLH Academic Block", "Active", "LOW", 10, 17.3470, 78.3362),
        ("C-089", "Central Campus Plaza", "Active", "LOW", 11, 17.3459, 78.3373),
        
        # Adults / Staff
        ("P-101", "KLH Academic Block", "Active", "LOW", 10, 17.3468, 78.3366),
        ("P-104", "Staff Parking", "Active", "MEDIUM", 45, 17.3446, 78.3358),
        ("P-200", "Moinabad Road Main Gate", "Attention", "HIGH", 84, 17.3476, 78.3349),

        # Senior Citizens
        ("SR-301", "KLH Academic Block", "Active", "LOW", 14, 17.3466, 78.3369),
        ("SR-305", "Central Campus Plaza", "Active", "MEDIUM", 42, 17.3456, 78.3376),
        ("SR-310", "Central Campus Plaza", "Attention", "HIGH", 89, 17.3452, 78.3371),
    ]

    for cid, zone, st, risk, sc, lat, lng in people_data:
        db.add(Child(
            anonymous_id=cid,
            current_zone=zone,
            status=st,
            risk_level=risk,
            risk_score=sc,
            lat=lat,
            lng=lng,
            last_seen=datetime.utcnow() - timedelta(minutes=1)
        ))

    # 5. Seed Events across age-inclusive categories
    now = datetime.utcnow()
    sample_events = [
        Event(
            child_id="C-200",
            camera_id="CAM-03",
            event_type="Restricted Boundary Entry",
            zone="Moinabad Road Main Gate",
            confidence=0.96,
            risk_score=85,
            risk_level="HIGH",
            status="ACTIVE",
            description="Student Token C-200 approached highway perimeter geofence.",
            timestamp=now - timedelta(minutes=4)
        ),
        Event(
            child_id="SR-301",
            camera_id="CAM-01",
            event_type="Fall / Gait Anomaly",
            zone="Central Campus Plaza",
            confidence=0.92,
            risk_score=82,
            risk_level="HIGH",
            status="ACTIVE",
            description="Senior Visitor SR-301 gait instability detected; assisted recovery initiated.",
            timestamp=now - timedelta(minutes=8)
        ),
        Event(
            child_id="C-034",
            camera_id="CAM-04",
            event_type="Vehicle Buffer Warning",
            zone="Campus Transit & Bus Terminal",
            confidence=0.95,
            risk_score=48,
            risk_level="MEDIUM",
            status="ACTIVE",
            description="Student C-034 within active vehicle buffer bay during bus departure.",
            timestamp=now - timedelta(minutes=14)
        ),
        Event(
            child_id="P-104",
            camera_id="CAM-06",
            event_type="Unusual Lingering",
            zone="Staff Parking",
            confidence=0.88,
            risk_score=42,
            risk_level="MEDIUM",
            status="CONFIRMED",
            description="Operations Tech P-104 lingering near parking vehicle lane.",
            timestamp=now - timedelta(minutes=25)
        ),
        Event(
            child_id="P-101",
            camera_id="CAM-02",
            event_type="Authorized Zone Transit",
            zone="KLH Academic Block",
            confidence=0.96,
            risk_score=10,
            risk_level="LOW",
            status="RESOLVED",
            description="Staff Member P-101 traversed academic corridor.",
            timestamp=now - timedelta(hours=1)
        ),
    ]
    db.add_all(sample_events)
    db.commit()

    # 6. Seed Calibrated Alerts (3 Urgent Unresolved, 2 Under Review, 28 Problems Solved)
    # Total 33 alerts -> ~85% Solved Rate
    alert_templates = [
        ("C-200", "HIGH", "Restricted Boundary Entry", "Moinabad Road Main Gate", "Student Token C-200 approached highway perimeter geofence.", "NEW", now - timedelta(minutes=4)),
        ("SR-301", "HIGH", "Fall / Gait Anomaly", "Central Campus Plaza", "Senior Visitor SR-301 gait instability detected; assisted recovery initiated.", "NEW", now - timedelta(minutes=8)),
        ("P-200", "HIGH", "Restricted Boundary Entry", "Perimeter Boundary", "Visitor Token P-200 approached boundary fence line.", "NEW", now - timedelta(minutes=11)),
        ("C-034", "MEDIUM", "Vehicle Buffer Warning", "Campus Transit & Bus Terminal", "Student C-034 within active vehicle buffer bay.", "ACKNOWLEDGED", now - timedelta(minutes=14)),
        ("P-104", "MEDIUM", "Unusual Lingering", "Staff Parking", "Operations Tech P-104 lingering near parking vehicle lane.", "ACKNOWLEDGED", now - timedelta(minutes=25)),
    ]

    # Add 28 solved alerts
    for i in range(1, 29):
        resolved_t = now - timedelta(minutes=30 + i * 15)
        alert_templates.append((
            f"C-{(i % 4) + 1:03d}",
            "LOW" if i % 2 == 0 else "MEDIUM",
            "Authorized Zone Transit" if i % 2 == 0 else "Vehicle Buffer Warning",
            "Central Campus Plaza" if i % 2 == 0 else "KLH Academic Block",
            f"Routine safety check verified and cleared for token C-{(i % 4) + 1:03d}.",
            "RESOLVED",
            resolved_t
        ))

    for idx, (cid, risk, etype, z, msg, status, t) in enumerate(alert_templates, start=1):
        db.add(Alert(
            alert_code=f"ALT-{t.strftime('%Y%m%d')}-{idx:04d}",
            event_id=1,
            child_id=cid,
            risk_level=risk,
            event_type=etype,
            zone=z,
            message=msg,
            status=status,
            created_at=t,
            resolved_at=now - timedelta(minutes=5) if status == "RESOLVED" else None,
            acknowledged_by="Patrol Officer Vikram" if status == "RESOLVED" else None
        ))

    db.commit()
    print("[Seed] SafeGuard AI database seeded successfully with calibrated metrics!")
