from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.event import Event
from app.schemas import EventResponse, EventCreate
from app.services.event_service import event_service

router = APIRouter(prefix="/events", tags=["Events"])

@router.get("", response_model=List[EventResponse])
def get_events(
    child_id: Optional[str] = None,
    event_type: Optional[str] = None,
    risk: Optional[str] = None,
    zone: Optional[str] = None,
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Event)
    if child_id:
        query = query.filter(Event.child_id.ilike(f"%{child_id}%"))
    if event_type:
        query = query.filter(Event.event_type == event_type)
    if risk:
        query = query.filter(Event.risk_level == risk.upper())
    if zone:
        query = query.filter(Event.zone == zone)

    return query.order_by(Event.timestamp.desc()).limit(limit).all()

@router.get("/{id}", response_model=EventResponse)
def get_event(id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.post("", response_model=EventResponse)
async def create_event(data: EventCreate, db: Session = Depends(get_db)):
    event = await event_service.process_detection_event(
        db=db,
        child_id=data.child_id,
        event_type=data.event_type,
        zone=data.zone or "Main Playground",
        camera_id=data.camera_id or "CAM-01",
        confidence=data.confidence,
        description=data.description
    )
    return event
