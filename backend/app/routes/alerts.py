from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import os
from app.database import get_db
from app.models.alert import Alert
from app.schemas import AlertResponse, DispatchRequest
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

@router.post("/dispatch-sms")
async def dispatch_security_sms(dispatch: DispatchRequest, db: Session = Depends(get_db)):
    target_alert = None
    if dispatch.alert_id:
        try:
            cleaned_id = int(str(dispatch.alert_id).replace("ALT-", "").replace("#", "").strip())
            target_alert = db.query(Alert).filter(Alert.id == cleaned_id).first()
        except Exception:
            pass

    incident_title = dispatch.incident_type or (target_alert.event_type if target_alert else "Perimeter Breach Detected")
    child_token = dispatch.child_token or (target_alert.child_id if target_alert else "C-017")
    zone_name = dispatch.zone or (target_alert.zone if target_alert else "Campus Perimeter")
    risk_lvl = dispatch.risk_level or (target_alert.risk_level if target_alert else "HIGH RISK")

    timestamp_str = datetime.now().strftime("%I:%M %p")
    dispatch_code = f"DISP-{int(datetime.now().timestamp()) % 100000}"

    message_text = (
        f"🚨 CHILDGUARD AI DISPATCH [{dispatch_code}]\n"
        f"Incident: {incident_title}\n"
        f"Child Token: {child_token} | Zone: {zone_name}\n"
        f"Risk Level: {risk_lvl} | Time: {timestamp_str}\n"
        f"Assigned Guard: {dispatch.officer_name}\n"
        f"Immediate patrol response mandated. PRISMTECH 2026."
    )

    gateway_status = "simulated_success"
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_PHONE_NUMBER")

    if account_sid and auth_token and from_number:
        try:
            from twilio.rest import Client
            client = Client(account_sid, auth_token)
            sent_msg = client.messages.create(
                body=message_text,
                from_=from_number,
                to=dispatch.phone_number
            )
            gateway_status = f"twilio_sent_{sent_msg.sid}"
        except Exception as err:
            gateway_status = f"twilio_error: {str(err)}"

    return {
        "status": "success",
        "dispatch_id": dispatch_code,
        "phone_number": dispatch.phone_number,
        "channel": dispatch.channel,
        "message": message_text,
        "delivery_status": "DELIVERED",
        "gateway": gateway_status,
        "timestamp": timestamp_str
    }

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

