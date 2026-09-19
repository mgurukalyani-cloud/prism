from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.zone import Zone
from app.schemas import ZoneResponse, ZoneCreate

router = APIRouter(prefix="/zones", tags=["Zones"])

@router.get("", response_model=List[ZoneResponse])
def get_zones(db: Session = Depends(get_db)):
    return db.query(Zone).order_by(Zone.id.asc()).all()

@router.post("", response_model=ZoneResponse)
def create_zone(data: ZoneCreate, db: Session = Depends(get_db)):
    existing = db.query(Zone).filter(Zone.name == data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Zone name already exists")

    zone = Zone(**data.model_dump())
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return zone
