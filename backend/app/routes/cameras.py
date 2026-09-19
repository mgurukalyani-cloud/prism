from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.camera import Camera
from app.schemas import CameraResponse, CameraCreate
from app.ai.detector import ai_detector

router = APIRouter(prefix="/cameras", tags=["Cameras"])

@router.get("", response_model=List[CameraResponse])
def get_cameras(db: Session = Depends(get_db)):
    return db.query(Camera).order_by(Camera.camera_code.asc()).all()

@router.post("", response_model=CameraResponse)
def create_camera(data: CameraCreate, db: Session = Depends(get_db)):
    existing = db.query(Camera).filter(Camera.camera_code == data.camera_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Camera code already exists")

    cam = Camera(**data.model_dump())
    db.add(cam)
    db.commit()
    db.refresh(cam)
    return cam

@router.get("/{camera_code}/detections")
def get_camera_detections(camera_code: str, db: Session = Depends(get_db)):
    cam = db.query(Camera).filter(Camera.camera_code == camera_code).first()
    if not cam:
        raise HTTPException(status_code=404, detail="Camera not found")

    detections = ai_detector.detect(camera_code=camera_code)
    return {
        "camera_code": camera_code,
        "name": cam.name,
        "status": cam.status,
        "ai_status": ai_detector.get_status(),
        "detection_count": len(detections),
        "detections": detections
    }
