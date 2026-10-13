import pytest
from app.services.geo_service import haversine_distance_km
from app.services.price_service import estimate_livestock_price
from app.schemas.schemas import PriceEstimateRequest

def test_haversine_distance():
    # Coimbatore (11.0168, 76.9558) to Tiruppur (11.1085, 77.3411) is ~43-45 km
    dist = haversine_distance_km(11.0168, 76.9558, 11.1085, 77.3411)
    assert 40.0 <= dist <= 50.0

def test_price_estimator_kangayam_cow():
    req = PriceEstimateRequest(
        livestock_type="cow",
        breed="Kangayam",
        age_months=42,
        milk_yield_liters=10.0,
        lactation_number=2,
        pregnancy_status="pregnant",
        vaccination_status="fully_vaccinated"
    )
    res = estimate_livestock_price(req)
    assert res.estimated_indicative_price > 60000
    assert res.price_range_low < res.estimated_indicative_price < res.price_range_high
    assert len(res.breakdown_factors) >= 4
    # Check that Tamil translations exist
    assert any("பால்" in f.factor_name_ta for f in res.breakdown_factors)
    assert "TANUVAS" in res.benchmark_source

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_login_demo_admin(client):
    response = client.post("/api/auth/login", json={
        "phone_or_email": "9876500001",
        "password": "Admin@123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"

def test_login_demo_panchayat_rep(client):
    response = client.post("/api/auth/login", json={
        "phone_or_email": "9876500002",
        "password": "Panchayat@123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "panchayat_rep"

def test_assisted_registration_by_rep(client):
    # Log in as rep
    login_res = client.post("/api/auth/login", json={
        "phone_or_email": "9876500002",
        "password": "Panchayat@123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Rep onboards an elderly farmer with consent
    farmer_data = {
        "farmer_name": "Arumugam C (Elderly Farmer)",
        "farmer_phone": "9842000099",
        "village": "Mulanur South",
        "panchayat": "Kundadam",
        "taluk": "Dharapuram",
        "district": "Tiruppur",
        "state": "Tamil Nadu",
        "latitude": 10.7812,
        "longitude": 77.5310,
        "consent_type": "digital_declaration",
        "consent_statement": "Farmer Arumugam verbally consented to digital listing during Gram Sabha camp.",
        "witness_name": "G. Palanisamy (Panchayat Clerk)",
        "witness_phone": "9842100000"
    }
    asst_res = client.post("/api/auth/assisted-register", json=farmer_data, headers=headers)
    assert asst_res.status_code == 201
    farmer = asst_res.json()
    assert farmer["full_name"] == "Arumugam C (Elderly Farmer)"
    assert farmer["role"] == "seller"
    assert farmer["is_verified"] == True

def test_get_listings_with_geo_radius(client):
    # Query listings within 100km of Kangeyam (11.0042, 77.5612)
    response = client.get("/api/listings", params={
        "latitude": 11.0042,
        "longitude": 77.5612,
        "radius_km": 100.0,
        "include_demo": True
    })
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    for item in data:
        assert item["distance_km"] <= 100.0
        # Demo listings must be explicitly flagged
        if item["is_demo"]:
            assert "[DEMO DATA]" in item["title"]

def test_suspicious_listing_flagging(client):
    # Retrieve the deliberately anomalous low-priced listing seeded in demo data
    response = client.get("/api/listings", params={"search": "Unusually Low Priced"})
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    target = data[0]
    # Check that quality score is penalized and alert flags exist
    assert target["quality_score"] < 80
    assert any(f["code"] == "SUSPICIOUS_LOW_PRICE" for f in target["flag_reasons"])
    # Check explainable detail exists in English and Tamil
    flag = next(f for f in target["flag_reasons"] if f["code"] == "SUSPICIOUS_LOW_PRICE")
    assert "Unusually Low Price" in flag["title_en"]
    assert "குறைந்த விலை" in flag["title_ta"]
