from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from app.database import Base

class Zone(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False) # e.g. "Main Gate", "Playground"
    zone_type = Column(String(50), nullable=False) # "Safe Zone", "Warning Zone", "Restricted Zone"
    description = Column(Text, nullable=True)
    color = Column(String(20), default="#10B981") # Hex color for map visualization
    coordinates_json = Column(Text, nullable=True) # GeoJSON or Polygon coords array
    base_risk_score = Column(Integer, default=10)
    created_at = Column(DateTime, default=datetime.utcnow)
