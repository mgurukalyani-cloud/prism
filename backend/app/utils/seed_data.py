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

def seed_database(db: Session):
    # Check if already seeded
    if db.query(Child).first():
        return

    print("[Seed] Seeding initial ChildGuard AI database records...")

    # 1. Seed Users (Demo Accounts: Admin & Security only)
    users = [
        User(email="admin@childguard.ai", role="Admin", full_name="System Administrator", password_hash=hash_pw("admin123")),
        User(email="security@childguard.ai", role="Security", full_name="Marcus Vance (Campus Security)", password_hash=hash_pw("security123")),
    ]
    db.add_all(users)

    # 2. Seed Zones
    # Demo coordinates centered around a modern campus
    # Approx base: 37.7749, -122.4194
    zones = [
        Zone(
            name="Main Playground",
            zone_type="Safe Zone",
            description="Open outdoor play field with rubberized surfaces and perimeter barriers",
            color="#10B981",
            base_risk_score=10,
            coordinates_json='[{"lat": 37.7755, "lng": -122.4205}, {"lat": 37.7755, "lng": -122.4185}, {"lat": 37.7742, "lng": -122.4185}, {"lat": 37.7742, "lng": -122.4205}]'
        ),
        Zone(
            name="Academic Block",
            zone_type="Safe Zone",
            description="Classrooms, laboratories, and internal school corridors",
            color="#10B981",
            base_risk_score=15,
            coordinates_json='[{"lat": 37.7765, "lng": -122.4215}, {"lat": 37.7765, "lng": -122.4195}, {"lat": 37.7756, "lng": -122.4195}, {"lat": 37.7756, "lng": -122.4215}]'
        ),
        Zone(
            name="Parking Area",
            zone_type="Warning Zone",
            description="Vehicle circulation and staff parking zone; elevated attention needed",
            color="#F59E0B",
            base_risk_score=40,
            coordinates_json='[{"lat": 37.7740, "lng": -122.4220}, {"lat": 37.7740, "lng": -122.4200}, {"lat": 37.7730, "lng": -122.4200}, {"lat": 37.7730, "lng": -122.4220}]'
        ),
        Zone(
            name="School Bus Zone",
            zone_type="Safe Zone",
            description="Dedicated student boarding and transit staging zone",
            color="#3B82F6",
            base_risk_score=20,
            coordinates_json='[{"lat": 37.7732, "lng": -122.4190}, {"lat": 37.7732, "lng": -122.4175}, {"lat": 37.7722, "lng": -122.4175}, {"lat": 37.7722, "lng": -122.4190}]'
        ),
        Zone(
            name="Main Gate",
            zone_type="Restricted Zone",
            description="Campus perimeter and primary vehicular gateway directly adjacent to highway",
            color="#EF4444",
            base_risk_score=80,
            coordinates_json='[{"lat": 37.7768, "lng": -122.4180}, {"lat": 37.7768, "lng": -122.4168}, {"lat": 37.7758, "lng": -122.4168}, {"lat": 37.7758, "lng": -122.4180}]'
        ),
        Zone(
            name="Restricted Construction Zone",
            zone_type="Restricted Zone",
            description="Undergoing facility renovation; hazardous equipment and scaffolding",
            color="#DC2626",
            base_risk_score=90,
            coordinates_json='[{"lat": 37.7738, "lng": -122.4170}, {"lat": 37.7738, "lng": -122.4155}, {"lat": 37.7728, "lng": -122.4155}, {"lat": 37.7728, "lng": -122.4170}]'
        )
    ]
    db.add_all(zones)

    # 3. Seed Cameras
    cameras = [
        Camera(
            camera_code="CAM-01",
            name="Playground North Feed",
            location="North Field Poles",
            zone_name="Main Playground",
            status="ONLINE",
            detection_count=18,
            current_risk="LOW"
        ),
        Camera(
            camera_code="CAM-02",
            name="Academic Block Corridor",
            location="East Hallway Fl. 1",
            zone_name="Academic Block",
            status="ONLINE",
            detection_count=24,
            current_risk="LOW"
        ),
        Camera(
            camera_code="CAM-03",
            name="Main Gate Perimeter",
            location="West Entrance Arch",
            zone_name="Main Gate",
            status="ONLINE",
            detection_count=6,
            current_risk="HIGH"
        ),
        Camera(
            camera_code="CAM-04",
            name="Bus Bay 2 Camera",
            location="South Terminal Depot",
            zone_name="School Bus Zone",
            status="ONLINE",
            detection_count=12,
            current_risk="HIGH"
        )
    ]
    db.add_all(cameras)

    # 4. Seed Anonymous Children (Fictional tracking IDs only)
    children_data = [
        ("C-001", "Main Playground", "Active", "LOW", 12, 37.7748, -122.4195),
        ("C-002", "Academic Block", "Active", "LOW", 15, 37.7760, -122.4205),
        ("C-005", "Academic Block", "Active", "LOW", 10, 37.7759, -122.4208),
        ("C-011", "Main Playground", "Active", "LOW", 20, 37.7750, -122.4190),
        ("C-017", "Main Gate", "Attention", "HIGH", 85, 37.7763, -122.4175),
        ("C-021", "Main Playground", "Attention", "HIGH", 92, 37.7746, -122.4192),
        ("C-034", "School Bus Zone", "Attention", "HIGH", 95, 37.7728, -122.4182),
        ("C-041", "Parking Area", "Active", "MEDIUM", 45, 37.7735, -122.4210),
        ("C-052", "Main Playground", "Active", "LOW", 10, 37.7752, -122.4198),
        ("C-063", "Academic Block", "Active", "LOW", 14, 37.7762, -122.4202),
        ("C-077", "School Bus Zone", "Active", "LOW", 18, 37.7725, -122.4185),
        ("C-089", "Main Playground", "Active", "LOW", 10, 37.7749, -122.4189),
    ]

    for cid, zone, st, risk, sc, lat, lng in children_data:
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

    # 5. Seed Events
    now = datetime.utcnow()
    sample_events = [
        Event(
            child_id="C-017",
            camera_id="CAM-03",
            event_type="Restricted Zone Entry",
            zone="Main Gate",
            confidence=0.95,
            risk_score=85,
            risk_level="HIGH",
            status="ACTIVE",
            description="Child C-017 traversed perimeter boundary toward Main Gate road.",
            timestamp=now - timedelta(minutes=4)
        ),
        Event(
            child_id="C-021",
            camera_id="CAM-01",
            event_type="Fall Detected",
            zone="Main Playground",
            confidence=0.93,
            risk_score=92,
            risk_level="HIGH",
            status="ACTIVE",
            description="Rapid posture shift to ground horizontal position detected for C-021.",
            timestamp=now - timedelta(minutes=8)
        ),
        Event(
            child_id="C-034",
            camera_id="CAM-04",
            event_type="Child Left Behind",
            zone="School Bus Zone",
            confidence=0.98,
            risk_score=95,
            risk_level="HIGH",
            status="ACTIVE",
            description="Trip completed at South Terminal; child C-034 remains stationary in aisle.",
            timestamp=now - timedelta(minutes=15)
        ),
        Event(
            child_id="C-041",
            camera_id="CAM-02",
            event_type="Unusual Activity",
            zone="Parking Area",
            confidence=0.86,
            risk_score=48,
            risk_level="MEDIUM",
            status="CONFIRMED",
            description="Extended loitering trajectory observed in staff vehicle perimeter.",
            timestamp=now - timedelta(minutes=25)
        ),
        Event(
            child_id="C-001",
            camera_id="CAM-01",
            event_type="Zone Entry",
            zone="Main Playground",
            confidence=0.96,
            risk_score=15,
            risk_level="LOW",
            status="RESOLVED",
            description="Child C-001 entered supervised recreational zone.",
            timestamp=now - timedelta(hours=1)
        ),
    ]
    db.add_all(sample_events)
    db.commit()

    # 6. Seed Sample Alerts from the HIGH/MEDIUM events
    events_in_db = db.query(Event).filter(Event.risk_level.in_(["HIGH", "MEDIUM"])).all()
    for ev in events_in_db:
        alert = Alert(
            alert_code=f"ALT-{now.strftime('%Y%m%d')}-{ev.id:04d}",
            event_id=ev.id,
            child_id=ev.child_id,
            risk_level=ev.risk_level,
            event_type=ev.event_type,
            zone=ev.zone,
            message=ev.description,
            status="NEW",
            created_at=ev.timestamp
        )
        db.add(alert)

    db.commit()
    print("[Seed] Seeding completed successfully.")
