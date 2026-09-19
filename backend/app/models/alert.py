from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from datetime import datetime
from app.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_code = Column(String(50), unique=True, index=True, nullable=False) # e.g. ALT-2026-001
    event_id = Column(Integer, ForeignKey("events.id"), nullable=True)
    child_id = Column(String(32), index=True, nullable=False) # e.g. C-017
    risk_level = Column(String(20), index=True, default="HIGH") # LOW, MEDIUM, HIGH
    event_type = Column(String(100), nullable=False)
    zone = Column(String(100), nullable=True)
    message = Column(Text, nullable=False)
    status = Column(String(30), default="NEW") # NEW, ACKNOWLEDGED, RESOLVED
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    acknowledged_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    acknowledged_by = Column(String(100), nullable=True)
