from app.ai.risk_engine import risk_engine

def test_safe_zone_risk():
    score, level, explanation = risk_engine.calculate_score(
        event_type="Zone Entry",
        zone_type="Safe Zone",
        zone_name="Main Playground"
    )
    assert level == "LOW"
    assert score <= 30

def test_restricted_zone_risk():
    score, level, explanation = risk_engine.calculate_score(
        event_type="Restricted Zone Entry",
        zone_type="Restricted Zone",
        zone_name="Main Gate"
    )
    assert level == "HIGH"
    assert score >= 71

def test_fall_detection_risk():
    score, level, explanation = risk_engine.calculate_score(
        event_type="Fall Detected",
        zone_type="Safe Zone",
        zone_name="Main Playground"
    )
    assert level == "HIGH"
    assert score >= 71

def test_child_left_behind_risk():
    score, level, explanation = risk_engine.calculate_score(
        event_type="Child Left Behind",
        zone_type="Warning Zone",
        zone_name="School Bus Zone"
    )
    assert level == "HIGH"
    assert score == 100
