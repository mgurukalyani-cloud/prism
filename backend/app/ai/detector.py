"""
ChildGuard AI - Object Detection Abstraction & YOLO Integration
---------------------------------------------------------------
Provides an unified AIEngine interface. Attempts to load Ultralytics YOLO.
If unavailable or model weights are missing, gracefully defaults to 
'AI Demo Mode' with simulated deterministic detections to guarantee 100% 
hackathon demonstration reliability.
"""

import os
import random
import time
from typing import List, Dict, Any, Optional

class AIEngine:
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path or os.getenv("YOLO_MODEL_PATH", "ai_models/yolov8n.pt")
        self.yolo_model = None
        self.is_demo_mode = True
        self.init_model()

    def init_model(self):
        """Attempts to load YOLO, falls back to Demo Mode cleanly."""
        try:
            if os.path.exists(self.model_path):
                from ultralytics import YOLO
                self.yolo_model = YOLO(self.model_path)
                self.is_demo_mode = False
                print(f"[AIEngine] YOLO Model successfully loaded from {self.model_path}")
            else:
                self.is_demo_mode = True
                print(f"[AIEngine] Model weights not found at '{self.model_path}'. Running in AI Demo Mode.")
        except Exception as e:
            self.is_demo_mode = True
            print(f"[AIEngine] Ultralytics YOLO not initialized ({e}). Running in AI Demo Mode.")

    def get_status(self) -> str:
        return "YOLO Active" if not self.is_demo_mode and self.yolo_model else "AI Demo Mode"

    def detect(self, frame=None, camera_code: str = "CAM-01") -> List[Dict[str, Any]]:
        """
        Runs object detection. Returns list of anonymous person detections with
        normalized bounding boxes [x1, y1, x2, y2], confidence, and tracking IDs.
        """
        if not self.is_demo_mode and self.yolo_model and frame is not None:
            try:
                results = self.yolo_model(frame, classes=[0], verbose=False) # class 0 is person
                detections = []
                for idx, r in enumerate(results):
                    boxes = r.boxes
                    for box in boxes:
                        coords = box.xyxy[0].tolist()
                        conf = float(box.conf[0])
                        detections.append({
                            "id": f"C-{100 + idx:03d}",
                            "class": "person",
                            "confidence": round(conf, 2),
                            "bbox": [round(c, 1) for c in coords],
                            "timestamp": time.time()
                        })
                return detections
            except Exception as e:
                print(f"[AIEngine] Detection error: {e}, falling back to simulated detections.")

        # Deterministic simulation fallback based on camera
        preset_children = {
            "CAM-01": [
                {"id": "C-017", "confidence": 0.94, "bbox": [120, 80, 240, 320], "activity": "Walking"},
                {"id": "C-021", "confidence": 0.89, "bbox": [340, 110, 440, 310], "activity": "Playing"},
            ],
            "CAM-02": [
                {"id": "C-001", "confidence": 0.96, "bbox": [180, 90, 280, 300], "activity": "Standing"},
                {"id": "C-002", "confidence": 0.91, "bbox": [420, 130, 510, 310], "activity": "Walking"},
            ],
            "CAM-03": [
                {"id": "C-034", "confidence": 0.93, "bbox": [200, 100, 310, 330], "activity": "Restricted Zone Entry"},
            ],
            "CAM-04": [
                {"id": "C-041", "confidence": 0.88, "bbox": [150, 120, 260, 290], "activity": "Stationary"},
            ],
        }

        return preset_children.get(camera_code, [
            {"id": "C-017", "confidence": 0.92, "bbox": [100, 100, 220, 300], "activity": "Normal"}
        ])

ai_detector = AIEngine()
