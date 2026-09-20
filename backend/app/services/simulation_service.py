"""
ChildGuard AI - Demo Simulation Service
---------------------------------------
Runs background event simulation cycling through standard hackathon scenarios:
- Normal (Safe)
- Zone Entry (LOW)
- Unusual Activity (MEDIUM)
- Restricted Zone Entry (HIGH)
- Fall Detected (HIGH)
- Child Left Behind (HIGH)
"""

import asyncio
import logging
from datetime import datetime
from app.database import SessionLocal
from app.services.event_service import event_service
from app.services.websocket_manager import ws_manager

logger = logging.getLogger("simulation")

class SimulationService:
    def __init__(self):
        self.is_running = False
        self._task = None
        self.step = 0
        self.scenarios = [
            {
                "event_type": "Authorized Zone Transit",
                "child_id": "P-101",
                "zone": "KLH Academic Block",
                "camera_id": "CAM-02",
                "confidence": 0.96,
                "description": "Staff Member P-101 traversed academic corridor."
            },
            {
                "event_type": "Unusual Lingering",
                "child_id": "P-104",
                "zone": "Staff Parking",
                "camera_id": "CAM-06",
                "confidence": 0.88,
                "description": "Operations Tech P-104 lingering near parking vehicle lane."
            },
            {
                "event_type": "Restricted Boundary Entry",
                "child_id": "C-200",
                "zone": "Moinabad Road Main Gate",
                "camera_id": "CAM-03",
                "confidence": 0.95,
                "description": "Student Token C-200 approached highway perimeter geofence."
            },
            {
                "event_type": "Fall / Gait Anomaly",
                "child_id": "SR-301",
                "zone": "Central Campus Plaza",
                "camera_id": "CAM-01",
                "confidence": 0.92,
                "description": "Senior Visitor SR-301 gait instability detected; verified safe."
            },
            {
                "event_type": "Vehicle Buffer Warning",
                "child_id": "C-034",
                "zone": "Campus Transit & Bus Terminal",
                "camera_id": "CAM-04",
                "confidence": 0.94,
                "description": "Student C-034 within active vehicle buffer during bus departure."
            }
        ]

    async def start(self):
        if self.is_running:
            return {"status": "already_running"}
        self.is_running = True
        self._task = asyncio.create_task(self._simulation_loop())
        logger.info("Simulation loop started.")
        await ws_manager.broadcast({
            "type": "simulation_status",
            "is_running": True,
            "message": "Demo Simulation Started"
        })
        return {"status": "started"}

    async def stop(self):
        if not self.is_running:
            return {"status": "not_running"}
        self.is_running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("Simulation loop stopped.")
        await ws_manager.broadcast({
            "type": "simulation_status",
            "is_running": False,
            "message": "Demo Simulation Stopped"
        })
        return {"status": "stopped"}

    async def trigger_scenario(self, scenario_name: str, child_id: str = "C-017", zone: str = "Main Gate"):
        """Instantly inject a specific scenario for hackathon demonstration."""
        scenario_map = {
            "restricted_zone": {
                "event_type": "Restricted Boundary Entry",
                "child_id": child_id or "C-200",
                "zone": zone or "Moinabad Road Main Gate",
                "camera_id": "CAM-03",
                "confidence": 0.96,
                "description": f"Individual {child_id or 'C-200'} approached perimeter boundary at {zone or 'Main Gate'}."
            },
            "fall_detected": {
                "event_type": "Fall / Gait Anomaly",
                "child_id": child_id or "SR-301",
                "zone": zone or "Central Campus Plaza",
                "camera_id": "CAM-01",
                "confidence": 0.93,
                "description": f"Posture change / gait anomaly detected for {child_id or 'SR-301'} at {zone or 'Central Plaza'}."
            },
            "child_left_behind": {
                "event_type": "Vehicle Buffer Warning",
                "child_id": child_id or "C-034",
                "zone": zone or "Campus Transit & Bus Terminal",
                "camera_id": "CAM-04",
                "confidence": 0.95,
                "description": f"Individual {child_id or 'C-034'} detected within active vehicle buffer bay at {zone or 'Bus Terminal'}."
            }
        }

        scenario = scenario_map.get(scenario_name, scenario_map["restricted_zone"])
        db = SessionLocal()
        try:
            event = await event_service.process_detection_event(
                db=db,
                child_id=scenario["child_id"],
                event_type=scenario["event_type"],
                zone=scenario["zone"],
                camera_id=scenario["camera_id"],
                confidence=scenario["confidence"],
                description=scenario["description"]
            )
            return {"status": "triggered", "event_id": event.id, "risk_level": event.risk_level}
        finally:
            db.close()

    async def _simulation_loop(self):
        while self.is_running:
            try:
                scenario = self.scenarios[self.step % len(self.scenarios)]
                self.step += 1

                db = SessionLocal()
                try:
                    await event_service.process_detection_event(
                        db=db,
                        child_id=scenario["child_id"],
                        event_type=scenario["event_type"],
                        zone=scenario["zone"],
                        camera_id=scenario["camera_id"],
                        confidence=scenario["confidence"],
                        description=scenario["description"]
                    )
                finally:
                    db.close()

                await asyncio.sleep(5)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Simulation error: {e}")
                await asyncio.sleep(5)

simulation_service = SimulationService()
