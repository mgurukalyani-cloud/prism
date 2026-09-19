from sqlalchemy import Column, Integer, String, DateTime, Float
from datetime import datetime
from app.database import Base

class Child(Base):
    __tablename__ = "children"

    id = Column(Integer, primary_key=True, index=True)
    anonymous_id = Column(String(32), unique=True, index=True, nullable=False) # e.g. C-017
    current_zone = Column(String(100), default="Main Playground")
    status = Column(String(50), default="Active") # Active, In-Transit, Safe, Attention
    risk_level = Column(String(20), default="LOW") # LOW, MEDIUM, HIGH
    risk_score = Column(Integer, default=10) # 0 - 100
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    last_seen = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
