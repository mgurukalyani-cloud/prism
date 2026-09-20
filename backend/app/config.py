import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SafeGuard AI"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./childguard.db")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    DEMO_MODE: bool = True
    YOLO_MODEL_PATH: str = os.getenv("YOLO_MODEL_PATH", "ai_models/yolov8n.pt")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "childguard-secret-key-2026")
    TEMPORAL_WINDOW_FRAMES: int = 3
    SIMULATION_INTERVAL_SECONDS: int = 5

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
