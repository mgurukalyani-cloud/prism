import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "ChildGuard AI" in data["service"]

def test_dashboard_stats(client):
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total_children"] >= 100
    assert data["active_cameras"] >= 4
    assert "system_status" in data

def test_get_children(client):
    response = client.get("/api/children")
    assert response.status_code == 200
    children = response.json()
    assert len(children) > 0
    assert any(c["anonymous_id"] == "C-017" for c in children)

def test_get_cameras(client):
    response = client.get("/api/cameras")
    assert response.status_code == 200
    cameras = response.json()
    assert len(cameras) >= 4

def test_get_zones(client):
    response = client.get("/api/zones")
    assert response.status_code == 200
    zones = response.json()
    assert len(zones) >= 4

def test_get_events(client):
    response = client.get("/api/events")
    assert response.status_code == 200
    events = response.json()
    assert len(events) > 0

def test_get_alerts(client):
    response = client.get("/api/alerts")
    assert response.status_code == 200
    alerts = response.json()
    assert len(alerts) > 0

def test_simulation_status(client):
    response = client.get("/api/simulation/status")
    assert response.status_code == 200
    data = response.json()
    assert "is_running" in data
