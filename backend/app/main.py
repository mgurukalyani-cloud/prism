from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.utils.seed_data import seed_database
from app.services.websocket_manager import ws_manager
from app.ai.detector import ai_detector

# Import routes
from app.routes.dashboard import router as dashboard_router
from app.routes.children import router as children_router
from app.routes.events import router as events_router
from app.routes.alerts import router as alerts_router
from app.routes.cameras import router as cameras_router
from app.routes.zones import router as zones_router
from app.routes.reports import router as reports_router
from app.routes.simulation import router as simulation_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("childguard")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified.")

    # Seed initial demo data
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

    yield
    logger.info("ChildGuard AI backend shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="ChildGuard AI - AI-Powered Child Monitoring & Safety Ecosystem (FastAPI Backend)",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for local hackathon development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routes
app.include_router(dashboard_router, prefix=settings.API_PREFIX)
app.include_router(children_router, prefix=settings.API_PREFIX)
app.include_router(events_router, prefix=settings.API_PREFIX)
app.include_router(alerts_router, prefix=settings.API_PREFIX)
app.include_router(cameras_router, prefix=settings.API_PREFIX)
app.include_router(zones_router, prefix=settings.API_PREFIX)
app.include_router(reports_router, prefix=settings.API_PREFIX)
app.include_router(simulation_router, prefix=settings.API_PREFIX)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "ai_engine": ai_detector.get_status(),
        "database": "connected"
    }

@app.websocket("/ws/alerts")
async def websocket_alerts_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    # Send initial greeting
    await websocket.send_json({
        "type": "connection_established",
        "message": "Connected to ChildGuard AI Real-Time Alert Engine",
        "ai_engine": ai_detector.get_status()
    })
    try:
        while True:
            # Keep receiving client pings / messages
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket client error: {e}")
        ws_manager.disconnect(websocket)
