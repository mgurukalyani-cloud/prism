from sqlalchemy.orm import Session
from app.models.alert import Alert
from app.models.event import Event
from app.services.websocket_manager import ws_manager
from datetime import datetime
import uuid

class AlertService:
    @staticmethod
    async def create_alert(
        db: Session,
        event: Event,
        custom_message: str = None
    ) -> Alert:
        alert_code = f"ALT-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        
        default_messages = {
            "Restricted Zone Entry": f"Child {event.child_id} entered a restricted zone ({event.zone})",
            "Fall Detected": f"Fall posture detected for Child {event.child_id} at {event.zone}",
            "Child Left Behind": f"CRITICAL: Child {event.child_id} remained detected on vehicle in {event.zone}",
            "Unusual Activity": f"Unusual trajectory/activity observed for {event.child_id} in {event.zone}",
            "Crowd/Separation Warning": f"Child {event.child_id} separated from primary group at {event.zone}",
            "Manual SOS": f"Manual SOS triggered for child {event.child_id} at {event.zone}"
        }

        msg = custom_message or default_messages.get(event.event_type, f"Safety alert: {event.event_type} for {event.child_id}")

        alert = Alert(
            alert_code=alert_code,
            event_id=event.id,
            child_id=event.child_id,
            risk_level=event.risk_level,
            event_type=event.event_type,
            zone=event.zone,
            message=msg,
            status="NEW",
            created_at=datetime.utcnow()
        )
        db.add(alert)
        db.commit()
        db.refresh(alert)

        # Broadcast real-time WebSocket notification
        payload = {
            "type": "alert",
            "alert_id": alert.id,
            "alert_code": alert.alert_code,
            "risk": alert.risk_level,
            "child_id": alert.child_id,
            "event_type": alert.event_type,
            "zone": alert.zone,
            "message": alert.message,
            "timestamp": alert.created_at.isoformat(),
            "status": alert.status
        }
        await ws_manager.broadcast(payload)
        return alert

    @staticmethod
    async def acknowledge_alert(db: Session, alert_id: int, user: str = "Campus Security") -> Alert:
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if alert:
            alert.status = "ACKNOWLEDGED"
            alert.acknowledged_at = datetime.utcnow()
            alert.acknowledged_by = user
            db.commit()
            db.refresh(alert)
            active_count = db.query(Alert).filter(Alert.status.in_(["NEW", "ACKNOWLEDGED"])).count()
            await ws_manager.broadcast({
                "type": "alert_status_update",
                "alert_id": alert.id,
                "status": "ACKNOWLEDGED",
                "active_alerts": active_count
            })
        return alert

    @staticmethod
    async def resolve_alert(db: Session, alert_id: int) -> Alert:
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if alert:
            alert.status = "RESOLVED"
            alert.resolved_at = datetime.utcnow()
            db.commit()
            db.refresh(alert)
            active_count = db.query(Alert).filter(Alert.status.in_(["NEW", "ACKNOWLEDGED"])).count()
            await ws_manager.broadcast({
                "type": "alert_status_update",
                "alert_id": alert.id,
                "status": "RESOLVED",
                "active_alerts": active_count
            })
        return alert

alert_service = AlertService()
