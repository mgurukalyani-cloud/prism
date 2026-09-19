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
                "event_type": "Zone Entry",
                "child_id": "C-001",
                "zone": "Main Playground",
                "camera_id": "CAM-01",
                "confidence": 0.94,
                "description": "Child C-001 entered safe zone (Main Playground)."
            },
            {
                "event_type": "Unusual Activity",
                "child_id": "C-002",
                "zone": "Parking Area",
                "camera_id": "CAM-02",
                "confidence": 0.88,
                "description": "Unusual lingering trajectory detected near vehicle parking."
            },
            {
                "event_type": "Restricted Zone Entry",
                "child_id": "C-017",
                "zone": "Main Gate",
                "camera_id": "CAM-03",
                "confidence": 0.95,
                "description": "Child C-017 crossed perimeter geofence toward Main Gate road."
            },
            {
                "event_type": "Fall Detected",
                "child_id": "C-021",
                "zone": "Main Playground",
                "camera_id": "CAM-01",
                "confidence": 0.93,
                "description": "Sudden posture collapse detected; child C-021 remains recumbent."
            },
            {
                "event_type": "Child Left Behind",
                "child_id": "C-034",
                "zone": "School Bus Zone",
                "camera_id": "CAM-04",
                "confidence": 0.97,
                "description": "Bus trip status completed; stationary child detection remains inside vehicle."
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
                "event_type": "Restricted Zone Entry",
                "child_id": child_id or "C-017",
                "zone": zone or "Main Gate",
                "camera_id": "CAM-03",
                "confidence": 0.96,
                "description": f"Child {child_id or 'C-017'} entered restricted zone at {zone or 'Main Gate'}."
            },
            "fall_detected": {
                "event_type": "Fall Detected",
                "child_id": child_id or "C-021",
                "zone": zone or "Main Playground",
                "camera_id": "CAM-01",
                "confidence": 0.93,
                "description": f"Fall posture detected for {child_id or 'C-021'} at {zone or 'Main Playground'}."
            },
            "child_left_behind": {
                "event_type": "Child Left Behind",
                "child_id": child_id or "C-034",
                "zone": zone or "School Bus Zone",
                "camera_id": "CAM-04",
                "confidence": 0.98,
                "description": f"Trip ended but {child_id or 'C-034'} remains detected inside School Bus."
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
