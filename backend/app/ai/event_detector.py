"""
ChildGuard AI - Event Detector & Temporal Validation Module
-----------------------------------------------------------
Implements temporal smoothing and multi-frame consistency checks
to prevent false alerts triggered by brief occlusions or single-frame noise.
"""

from typing import Dict, Any, List, Optional
import time

class EventDetector:
    def __init__(self, persistence_threshold: int = 3):
        # child_id:event_type -> list of timestamps
        self.candidate_events = {}
        self.persistence_threshold = persistence_threshold
        self.cooldown_window = 15.0 # Seconds before same event can re-trigger alert
        self.last_confirmed = {}

    def register_candidate(
        self,
        child_id: str,
        event_type: str,
        metadata: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Registers candidate detection. Returns confirmed event payload ONLY when
        persisting for >= persistence_threshold occurrences without active cooldown.
        """
        key = f"{child_id}:{event_type}"
        now = time.time()

        if key not in self.candidate_events:
            self.candidate_events[key] = []

        # Prune older candidate occurrences (> 5 seconds old)
        self.candidate_events[key] = [t for t in self.candidate_events[key] if now - t < 5.0]
        self.candidate_events[key].append(now)

        # Check cooldown
        last_time = self.last_confirmed.get(key, 0)
        if now - last_time < self.cooldown_window:
            return None # In cooldown

        # Check if threshold reached
        if len(self.candidate_events[key]) >= self.persistence_threshold:
            self.last_confirmed[key] = now
            self.candidate_events[key] = [] # Reset candidate stack
            return {
                "confirmed": True,
                "child_id": child_id,
                "event_type": event_type,
                "occurrences": self.persistence_threshold,
                "timestamp": now,
                "metadata": metadata
            }

        return None

event_detector = EventDetector()
