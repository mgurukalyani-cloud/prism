"""
ChildGuard AI - Zone Detection & Geofencing Module
-------------------------------------------------
Determines whether a child centroid falls within Safe, Warning, or Restricted zones.
"""

from typing import Dict, Any, List, Optional

class ZoneDetector:
    def __init__(self):
        # Default virtual zones mapped to camera pixel dimensions (e.g. 640x480)
        self.camera_zones = {
            "CAM-01": [ # Playground
                {"name": "Playground Safe Zone", "type": "Safe Zone", "rect": [50, 50, 580, 420], "color": "#10B981"}
            ],
            "CAM-02": [ # Academic Block
                {"name": "Academic Corridor", "type": "Safe Zone", "rect": [40, 40, 600, 440], "color": "#10B981"}
            ],
            "CAM-03": [ # Main Gate
                {"name": "Main Gate Perimeter", "type": "Warning Zone", "rect": [50, 50, 300, 400], "color": "#F59E0B"},
                {"name": "Restricted Exit / Road", "type": "Restricted Zone", "rect": [300, 50, 600, 400], "color": "#EF4444"}
            ],
            "CAM-04": [ # School Bus
                {"name": "Bus Boarding Zone", "type": "Safe Zone", "rect": [50, 50, 350, 400], "color": "#10B981"},
                {"name": "Bus Engine / Turning Zone", "type": "Restricted Zone", "rect": [350, 50, 600, 400], "color": "#EF4444"}
            ]
        }

    def check_point_in_rect(self, point: tuple, rect: list) -> bool:
        x, y = point
        x1, y1, x2, y2 = rect
        return x1 <= x <= x2 and y1 <= y <= y2

    def evaluate_location(self, camera_code: str, centroid: tuple) -> Dict[str, Any]:
        zones = self.camera_zones.get(camera_code, [])
        for z in zones:
            if self.check_point_in_rect(centroid, z["rect"]):
                return {
                    "zone_name": z["name"],
                    "zone_type": z["type"],
                    "is_restricted": z["type"] == "Restricted Zone",
                    "is_warning": z["type"] == "Warning Zone",
                }

        return {
            "zone_name": "General Campus",
            "zone_type": "Safe Zone",
            "is_restricted": False,
            "is_warning": False,
        }

zone_detector = ZoneDetector()
