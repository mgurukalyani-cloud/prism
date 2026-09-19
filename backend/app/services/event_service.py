from sqlalchemy.orm import Session
from app.models.event import Event
from app.models.child import Child
from app.ai.risk_engine import risk_engine
from app.services.alert_service import alert_service
from app.services.websocket_manager import ws_manager
from datetime import datetime

class EventService:
    @staticmethod
    async def process_detection_event(
        db: Session,
        child_id: str,
        event_type: str,
        zone: str = "Playground",
        camera_id: str = "CAM-01",
        confidence: float = 0.92,
        description: str = None
    ) -> Event:
        # Calculate risk score and level
        score, risk_level, explanation = risk_engine.calculate_score(
            event_type=event_type,
            zone_name=zone,
            confidence=confidence
        )

        desc = description or explanation

        # Create Event record
        event = Event(
            child_id=child_id,
            camera_id=camera_id,
            event_type=event_type,
            zone=zone,
            confidence=confidence,
            risk_score=score,
            risk_level=risk_level,
            status="ACTIVE",
            description=desc,
            timestamp=datetime.utcnow()
        )
        db.add(event)

        # Update child record if exists
        child = db.query(Child).filter(Child.anonymous_id == child_id).first()
        if child:
            child.current_zone = zone
            child.risk_level = risk_level
            child.risk_score = score
            child.last_seen = datetime.utcnow()
            if risk_level == "HIGH":
                child.status = "Attention"
            else:
                child.status = "Active"

        db.commit()
        db.refresh(event)

        # Broadcast event telemetry over WebSocket
        await ws_manager.broadcast({
            "type": "event",
            "event_id": event.id,
            "child_id": event.child_id,
            "camera_id": event.camera_id,
            "event_type": event.event_type,
            "zone": event.zone,
            "risk_score": event.risk_score,
            "risk_level": event.risk_level,
            "confidence": event.confidence,
            "timestamp": event.timestamp.isoformat(),
            "description": event.description
        })

        # Trigger alert automatically if risk is HIGH or MEDIUM
        if risk_level in ["HIGH", "MEDIUM"]:
            await alert_service.create_alert(db=db, event=event)

        return event

event_service = EventService()
