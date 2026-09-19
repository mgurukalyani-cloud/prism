"""
ChildGuard AI - Anonymous Multi-Object Tracking Abstraction
----------------------------------------------------------
Assigns and maintains consistent anonymous tracking IDs (C-001, C-017, etc.)
over time using centroid association and distance heuristics.
"""

import math
import time
from typing import List, Dict, Any, Optional

class CentroidTracker:
    def __init__(self, max_disappeared: int = 30):
        self.next_id_counter = 1
        self.objects = {} # id -> centroid (cx, cy)
        self.disappeared = {} # id -> frame count
        self.max_disappeared = max_disappeared
        self.trajectories = {} # id -> list of recent positions

    def register(self, centroid: tuple, custom_id: Optional[str] = None) -> str:
        child_id = custom_id or f"C-{self.next_id_counter:03d}"
        self.next_id_counter += 1
        self.objects[child_id] = centroid
        self.disappeared[child_id] = 0
        self.trajectories[child_id] = [centroid]
        return child_id

    def deregister(self, child_id: str):
        if child_id in self.objects:
            del self.objects[child_id]
        if child_id in self.disappeared:
            del self.disappeared[child_id]
        if child_id in self.trajectories:
            del self.trajectories[child_id]

    def update(self, rects: List[List[float]]) -> Dict[str, Dict[str, Any]]:
        """
        rects: list of bounding boxes [x1, y1, x2, y2]
        Returns tracked objects with their centroids, bounding boxes, and velocity.
        """
        if len(rects) == 0:
            for child_id in list(self.disappeared.keys()):
                self.disappeared[child_id] += 1
                if self.disappeared[child_id] > self.max_disappeared:
                    self.deregister(child_id)
            return {}

        input_centroids = []
        for (x1, y1, x2, y2) in rects:
            cx = (x1 + x2) / 2.0
            cy = (y1 + y2) / 2.0
            input_centroids.append((cx, cy))

        if len(self.objects) == 0:
            for i, c in enumerate(input_centroids):
                self.register(c)
        else:
            object_ids = list(self.objects.keys())
            object_centroids = list(self.objects.values())

            # Distance matching
            used_rows = set()
            used_cols = set()

            for row, (ox, oy) in enumerate(object_centroids):
                min_dist = float("inf")
                min_col = -1
                for col, (ix, iy) in enumerate(input_centroids):
                    if col in used_cols:
                        continue
                    dist = math.hypot(ox - ix, oy - iy)
                    if dist < min_dist:
                        min_dist = dist
                        min_col = col

                if min_col != -1 and min_dist < 150: # distance threshold
                    child_id = object_ids[row]
                    self.objects[child_id] = input_centroids[min_col]
                    self.disappeared[child_id] = 0
                    self.trajectories[child_id].append(input_centroids[min_col])
                    if len(self.trajectories[child_id]) > 20:
                        self.trajectories[child_id].pop(0)
                    used_rows.add(row)
                    used_cols.add(min_col)

            # Mark unmatched existing
            for row in range(len(object_ids)):
                if row not in used_rows:
                    child_id = object_ids[row]
                    self.disappeared[child_id] += 1
                    if self.disappeared[child_id] > self.max_disappeared:
                        self.deregister(child_id)

            # Register unmatched new
            for col in range(len(input_centroids)):
                if col not in used_cols:
                    self.register(input_centroids[col])

        # Return results
        results = {}
        for child_id, centroid in self.objects.items():
            results[child_id] = {
                "centroid": centroid,
                "history_length": len(self.trajectories.get(child_id, [])),
                "last_seen": time.time()
            }
        return results

tracker = CentroidTracker()
