from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from app.database import Base

class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, index=True)
    camera_code = Column(String(50), unique=True, index=True, nullable=False) # CAM-01
    name = Column(String(100), nullable=False) # Main Playground Camera
    location = Column(String(100), nullable=False) # Playground North
    zone_name = Column(String(100), default="Main Playground")
    status = Column(String(20), default="ONLINE") # ONLINE, OFFLINE, MAINTENANCE
    stream_url = Column(String(255), nullable=True)
    detection_count = Column(Integer, default=0)
    current_risk = Column(String(20), default="LOW")
    created_at = Column(DateTime, default=datetime.utcnow)
