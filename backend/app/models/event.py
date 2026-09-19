from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(String(32), index=True, nullable=False) # e.g. C-017
    camera_id = Column(String(50), nullable=True) # e.g. CAM-01
    event_type = Column(String(100), index=True, nullable=False) # Restricted Zone Entry, Fall Detected, etc.
    zone = Column(String(100), nullable=True)
    confidence = Column(Float, default=0.92)
    risk_score = Column(Integer, default=50) # 0-100
    risk_level = Column(String(20), index=True, default="LOW") # LOW, MEDIUM, HIGH
    status = Column(String(50), default="ACTIVE") # ACTIVE, CONFIRMED, RESOLVED
    description = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
