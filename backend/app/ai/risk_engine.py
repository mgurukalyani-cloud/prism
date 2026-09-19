"""
ChildGuard AI - Transparent Rule-Based Risk Engine
--------------------------------------------------
DISCLAIMER: This risk engine is a decision-support heuristic system designed 
for early-warning notifications in supervised environments. It does NOT claim 
medical or scientific validation, nor does it replace trained human supervision.
"""

from typing import Dict, Any, Tuple

class RiskEngine:
    # Base risk score heuristics
    BASE_SCORES = {
        "Safe Zone": 10,
        "Playground": 10,
        "Academic Block": 15,
        "Warning Zone": 40,
        "Parking Area": 50,
        "School Bus Zone": 45,
        "Restricted Zone": 80,
        "Main Gate": 75,
        "Restricted Construction Zone": 85,
        "Restricted Zone Entry": 85,
        "Fall Detected": 90,
        "Child Left Behind": 100,
        "Unusual Activity": 55,
        "Zone Entry": 20,
        "Zone Exit": 35,
        "Crowd/Separation Warning": 65,
        "Manual SOS": 100,
    }

    @staticmethod
    def calculate_score(
        event_type: str,
        zone_type: str = "Safe Zone",
        zone_name: str = "",
        duration_seconds: float = 0.0,
        repeat_count: int = 1,
        confidence: float = 0.90
    ) -> Tuple[int, str, str]:
        """
        Calculates the risk score (0-100), categorical risk level (LOW/MEDIUM/HIGH),
        and reasoning explanation.
        """
        # Start with event type base or zone base
        base = RiskEngine.BASE_SCORES.get(event_type, 30)

        # Factor in zone sensitivity
        if zone_type == "Restricted Zone" or "Restricted" in zone_name or "Construction" in zone_name:
            zone_multiplier = 1.3
        elif zone_type == "Warning Zone" or "Parking" in zone_name:
            zone_multiplier = 1.1
        else:
            zone_multiplier = 0.9

        # Factor in duration anomaly (e.g. staying in warning/restricted area)
        duration_penalty = 0
        if duration_seconds > 60 and zone_multiplier >= 1.1:
            duration_penalty = min(20, int(duration_seconds // 30) * 5)

        # Factor in repeated triggers
        repeat_penalty = min(15, (repeat_count - 1) * 5) if repeat_count > 1 else 0

        # Raw score computation
        raw_score = int((base * zone_multiplier) + duration_penalty + repeat_penalty)

        # Weight by model confidence (if confidence < 0.70, soften penalty slightly)
        if confidence < 0.70:
            raw_score = int(raw_score * 0.85)

        # Clamp between 5 and 100
        final_score = max(5, min(100, raw_score))

        # Categorize
        if final_score <= 30:
            risk_level = "LOW"
            label = "Safe / Normal Activity"
        elif final_score <= 70:
            risk_level = "MEDIUM"
            label = "Attention Required"
        else:
            risk_level = "HIGH"
            label = "Immediate Attention / Alert"

        explanation = (
            f"Event '{event_type}' in '{zone_name or zone_type}' assessed with base {base} "
            f"(zone factor x{zone_multiplier:.1f}, duration penalty +{duration_penalty}, "
            f"repeat +{repeat_penalty}) -> Score {final_score}/100 [{risk_level}]."
        )

        return final_score, risk_level, explanation

risk_engine = RiskEngine()
