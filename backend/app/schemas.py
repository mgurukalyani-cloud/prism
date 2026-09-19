from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

# Child Schemas
class ChildBase(BaseModel):
    anonymous_id: str
    current_zone: str = "Main Playground"
    status: str = "Active"
    risk_level: str = "LOW"
    risk_score: int = 10
    lat: Optional[float] = None
    lng: Optional[float] = None

class ChildCreate(ChildBase):
    pass

class ChildResponse(ChildBase):
    id: int
    last_seen: datetime
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Camera Schemas
class CameraBase(BaseModel):
    camera_code: str
    name: str
    location: str
    zone_name: str = "Main Playground"
    status: str = "ONLINE"
    stream_url: Optional[str] = None
    detection_count: int = 0
    current_risk: str = "LOW"

class CameraCreate(CameraBase):
    pass

class CameraResponse(CameraBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Zone Schemas
class ZoneBase(BaseModel):
    name: str
    zone_type: str # Safe Zone, Warning Zone, Restricted Zone
    description: Optional[str] = None
    color: str = "#10B981"
    coordinates_json: Optional[str] = None
    base_risk_score: int = 10

class ZoneCreate(ZoneBase):
    pass

class ZoneResponse(ZoneBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Event Schemas
class EventBase(BaseModel):
    child_id: str
    camera_id: Optional[str] = "CAM-01"
    event_type: str
    zone: Optional[str] = None
    confidence: float = 0.92
    risk_score: int = 50
    risk_level: str = "LOW"
    status: str = "ACTIVE"
    description: Optional[str] = None

class EventCreate(EventBase):
    pass

class EventResponse(EventBase):
    id: int
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)

# Alert Schemas
class AlertBase(BaseModel):
    alert_code: str
    event_id: Optional[int] = None
    child_id: str
    risk_level: str = "HIGH"
    event_type: str
    zone: Optional[str] = None
    message: str
    status: str = "NEW"

class AlertCreate(AlertBase):
    pass

class AlertResponse(AlertBase):
    id: int
    created_at: datetime
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    acknowledged_by: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

# User / Auth Schemas
class UserLoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    full_name: str
    model_config = ConfigDict(from_attributes=True)

# Dashboard Stats Schema
class DashboardStats(BaseModel):
    total_children: int
    active_cameras: int
    active_alerts: int
    high_risk_events: int
    low_risk_count: int
    medium_risk_count: int
    high_risk_count: int
    system_status: str
    ai_status: str
    model_config = ConfigDict(from_attributes=True)

# Simulation Request
class SimulationTriggerRequest(BaseModel):
    scenario: str # "restricted_zone", "fall_detected", "child_left_behind"
    child_id: Optional[str] = "C-017"
    zone: Optional[str] = "Main Gate"

# Security Dispatch Request
class DispatchRequest(BaseModel):
    phone_number: str
    alert_id: Optional[int] = None
    channel: str = "WHATSAPP" # "SMS" or "WHATSAPP"
    officer_name: Optional[str] = "Patrol Officer Vikram"
    incident_type: Optional[str] = None
    child_token: Optional[str] = None
    zone: Optional[str] = None
    risk_level: Optional[str] = None

