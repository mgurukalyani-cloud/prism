from fastapi import APIRouter
from app.services.simulation_service import simulation_service
from app.schemas import SimulationTriggerRequest

router = APIRouter(prefix="/simulation", tags=["Simulation"])

@router.post("/start")
async def start_simulation():
    res = await simulation_service.start()
    return res

@router.post("/stop")
async def stop_simulation():
    res = await simulation_service.stop()
    return res

@router.get("/status")
def get_simulation_status():
    return {
        "is_running": simulation_service.is_running,
        "current_step": simulation_service.step
    }

@router.post("/trigger")
async def trigger_scenario(data: SimulationTriggerRequest):
    res = await simulation_service.trigger_scenario(
        scenario_name=data.scenario,
        child_id=data.child_id,
        zone=data.zone
    )
    return res
