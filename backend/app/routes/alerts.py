from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.alert import Alert
from app.schemas import AlertResponse
from app.services.alert_service import alert_service

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("", response_model=List[AlertResponse])
def get_alerts(
    status: Optional[str] = None,
    risk: Optional[str] = None,
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if status:
        query = query.filter(Alert.status == status.upper())
    if risk:
        query = query.filter(Alert.risk_level == risk.upper())
    return query.order_by(Alert.created_at.desc()).limit(limit).all()

@router.get("/{id}", response_model=AlertResponse)
def get_alert(id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@router.post("/{id}/acknowledge", response_model=AlertResponse)
async def acknowledge_alert(id: int, db: Session = Depends(get_db)):
    alert = await alert_service.acknowledge_alert(db=db, alert_id=id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@router.post("/{id}/resolve", response_model=AlertResponse)
async def resolve_alert(id: int, db: Session = Depends(get_db)):
    alert = await alert_service.resolve_alert(db=db, alert_id=id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert
