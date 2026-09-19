"""
ChildGuard AI - Pose & Fall Detection Heuristic Module
------------------------------------------------------
Evaluates posture changes, sudden bounding box aspect ratio shifts,
and rapid vertical position changes to identify potential falls or unusual activity.
"""

from typing import Tuple, Dict, Any, List

class FallDetector:
    def __init__(self):
        self.history = {} # child_id -> list of [aspect_ratio, cy, timestamp]

    def analyze_posture(
        self,
        child_id: str,
        bbox: List[float],
        timestamp: float
    ) -> Tuple[bool, float, str]:
        """
        bbox: [x1, y1, x2, y2]
        Returns (is_fall_suspected, confidence, activity_label)
        """
        x1, y1, x2, y2 = bbox
        width = max(1.0, x2 - x1)
        height = max(1.0, y2 - y1)
        aspect_ratio = height / width
        cy = (y1 + y2) / 2.0

        if child_id not in self.history:
            self.history[child_id] = []

        self.history[child_id].append((aspect_ratio, cy, timestamp))
        if len(self.history[child_id]) > 10:
            self.history[child_id].pop(0)

        # Check for fall criteria
        # A normal standing child has aspect ratio height/width typically > 1.8
        # A fallen child on the ground has aspect ratio < 0.75 (horizontal posture)
        if len(self.history[child_id]) >= 2:
            prev_ratio, prev_cy, prev_time = self.history[child_id][-2]
            ratio_drop = prev_ratio - aspect_ratio
            vertical_drop = cy - prev_cy

            # If aspect ratio collapsed from upright to horizontal rapidly
            if prev_ratio > 1.5 and aspect_ratio < 0.8:
                confidence = min(0.96, 0.75 + (ratio_drop * 0.15))
                return True, round(confidence, 2), "Sudden Posture Collapse / Fall"

            # If horizontal for multiple consecutive frames
            if aspect_ratio < 0.65:
                return True, 0.91, "Ground Level Recumbent / Fall Detected"

        # General activity classifications
        if aspect_ratio > 1.8:
            return False, 0.95, "Standing Upright"
        elif aspect_ratio > 1.2:
            return False, 0.90, "Walking / Active"
        else:
            return False, 0.80, "Bending / Crouching"

fall_detector = FallDetector()
