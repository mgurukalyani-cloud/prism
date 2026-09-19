from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.child import Child
from app.models.event import Event
from app.schemas import ChildResponse, ChildCreate

router = APIRouter(prefix="/children", tags=["Children"])

@router.get("", response_model=List[ChildResponse])
def get_children(
    risk: Optional[str] = None,
    zone: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Child)
    if risk:
        query = query.filter(Child.risk_level == risk.upper())
    if zone:
        query = query.filter(Child.current_zone == zone)
    return query.order_by(Child.anonymous_id.asc()).all()

@router.get("/{id}")
def get_child_detail(id: int, db: Session = Depends(get_db)):
    child = db.query(Child).filter(Child.id == id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")

    # Get recent events for this child
    events = (
        db.query(Event)
        .filter(Event.child_id == child.anonymous_id)
        .order_by(Event.timestamp.desc())
        .limit(10)
        .all()
    )

    return {
        "child": child,
        "recent_events": events
    }

@router.post("", response_model=ChildResponse)
def create_child(data: ChildCreate, db: Session = Depends(get_db)):
    existing = db.query(Child).filter(Child.anonymous_id == data.anonymous_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Child with this ID already exists")

    child = Child(**data.model_dump())
    db.add(child)
    db.commit()
    db.refresh(child)
    return child
