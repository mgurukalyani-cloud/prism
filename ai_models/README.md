# AI Models Directory - ChildGuard AI

This directory is designed to store YOLOv8, YOLOv11, or custom trained ONNX / PyTorch computer-vision model weights.

## Standard Models

To enable live local YOLO inference:
1. Download the YOLOv8 nano weights:
   ```bash
   # In python
   from ultralytics import YOLO
   model = YOLO("yolov8n.pt")
   ```
2. Place `yolov8n.pt` in this `ai_models/` folder.
3. ChildGuard AI's `AIEngine` will automatically detect the weights and switch from **AI Demo Mode** to **YOLO Active**.

## Zero-Crash Hackathon Guarantee

If no weights file is present in this directory, ChildGuard AI seamlessly operates in **AI Demo Mode** with high-fidelity synthetic bounding boxes, centroid tracking, and posture heuristics. The system will **never crash** during a live hackathon presentation due to missing model weights or CUDA errors.
