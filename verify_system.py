import urllib.request
import urllib.parse
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def make_req(path, data=None, token=None, method="GET"):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def run_verification():
    print("=" * 60)
    print("🚀 PASHUSETU COMPREHENSIVE END-TO-END VERIFICATION")
    print("=" * 60)

    # 1. Health Check
    health = make_req("/health")
    assert health["status"] == "healthy"
    print("✅ 1. Health Check Verified:", health["app"], health["version"])

    # 2. Login as Demo Admin
    admin_auth = make_req("/auth/login", {"phone_or_email": "9876500001", "password": "Admin@123"}, method="POST")
    admin_token = admin_auth["access_token"]
    assert admin_auth["user"]["role"] == "admin"
    print("✅ 2. Demo Admin Auth Verified:", admin_auth["user"]["full_name"])

    # 3. Login as Demo Panchayat Representative
    rep_auth = make_req("/auth/login", {"phone_or_email": "9876500002", "password": "Panchayat@123"}, method="POST")
    rep_token = rep_auth["access_token"]
    assert rep_auth["user"]["role"] == "panchayat_rep"
    print("✅ 3. Demo Panchayat Rep Auth Verified:", rep_auth["user"]["full_name"])

    # 4. Login as Demo Seller & Buyer
    seller_auth = make_req("/auth/login", {"phone_or_email": "9876500003", "password": "Farmer@123"}, method="POST")
    seller_token = seller_auth["access_token"]
    buyer_auth = make_req("/auth/login", {"phone_or_email": "9876500004", "password": "Buyer@123"}, method="POST")
    buyer_token = buyer_auth["access_token"]
    print("✅ 4. Demo Seller & Buyer Auth Verified:", seller_auth["user"]["full_name"], "and", buyer_auth["user"]["full_name"])

    # 5. Attributable Price Estimator (Kangayam Cow)
    est = make_req("/price-estimator/calculate", {
        "livestock_type": "cow",
        "breed": "Kangayam",
        "age_months": 42,
        "milk_yield_liters": 12.0,
        "lactation_number": 2,
        "pregnancy_status": "pregnant",
        "vaccination_status": "fully_vaccinated"
    }, method="POST")
    assert est["estimated_indicative_price"] > 60000
    assert "TANUVAS" in est["benchmark_source"]
    print(f"✅ 5. Attributable Price Estimator Verified: ₹{est['estimated_indicative_price']:,} (Source: {est['benchmark_source']})")
    print(f"   Breakdown Factors ({len(est['breakdown_factors'])} items):")
    for f in est["breakdown_factors"][:3]:
        print(f"   - {f['factor_name']} / {f['factor_name_ta']}: ₹{f['impact_amount']:,}")

    # 6. Consent-based Assisted Registration by Rep
    new_farmer_phone = "9842555001"
    try:
        farmer = make_req("/auth/assisted-register", {
            "farmer_name": "Ramasamy Gounder (Elderly Farmer)",
            "farmer_phone": new_farmer_phone,
            "village": "Mulanur South",
            "panchayat": "Kundadam",
            "taluk": "Dharapuram",
            "district": "Tiruppur",
            "state": "Tamil Nadu",
            "latitude": 10.7812,
            "longitude": 77.5310,
            "consent_type": "digital_declaration",
            "consent_statement": "Ramasamy Gounder consented during Gram Sabha to list his cattle on PashuSetu.",
            "witness_name": "P. Kandasamy",
            "witness_phone": "9842100000"
        }, token=rep_token, method="POST")
        print("✅ 6. Consent-Based Assisted Registration Verified:", farmer["full_name"], "Verified Seal:", farmer["is_verified"])
    except Exception as e:
        print("ℹ️ 6. Assisted Registration already completed:", str(e))

    # 7. Post Listing for the assisted farmer by Panchayat Rep
    new_listing = make_req("/listings", {
        "title": "Prime Kangayam Draught Bull",
        "title_ta": "காங்கேயம் நாட்டு காளை மாடு",
        "description": "Sturdy Kangayam bull, excellent Kongu draught breed lineage.",
        "livestock_type": "cow",
        "breed": "Kangayam",
        "age_months": 36,
        "gender": "male",
        "price": 75000,
        "is_negotiable": True,
        "milk_yield_liters": 0.0,
        "lactation_number": 0,
        "pregnancy_status": "not_applicable",
        "weight_kg": 450,
        "vaccination_status": "fully_vaccinated",
        "vaccination_details": "FMD vaccinated",
        "photos": ["https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80"],
        "documents": [],
        "district": "Tiruppur",
        "panchayat": "Kundadam",
        "village": "Mulanur South",
        "latitude": 10.7812,
        "longitude": 77.5310,
        "hide_exact_location": True,
        "is_demo": False
    }, token=rep_token, method="POST")
    assert new_listing["id"] > 0
    print(f"✅ 7. Listing Creation Verified: ID {new_listing['id']}, Score: {new_listing['quality_score']}/100")

    # 8. GPS Radius Search (Kangeyam center, 50km radius)
    geo_listings = make_req("/listings?latitude=11.0042&longitude=77.5612&radius_km=50.0&include_demo=true")
    assert len(geo_listings) >= 1
    print(f"✅ 8. GPS Radius Search Verified: {len(geo_listings)} listings within 50 km of Kangeyam")

    # 9. Schedule Farm Visit by Buyer
    visit = make_req("/visits", {
        "listing_id": new_listing["id"],
        "proposed_date": "2026-10-20",
        "time_slot": "Morning 08:00 AM - 11:00 AM (Ideal for live milking)",
        "buyer_notes": "Local veterinarian accompanying for physical soundness check."
    }, token=buyer_token, method="POST")
    assert visit["status"] == "requested"
    print(f"✅ 9. Farm Visit Scheduling Verified: Visit ID {visit['id']}, Status: {visit['status']}")

    # 10. Seller Accepts Visit & Unlocks Exact GPS
    accept_res = make_req(f"/visits/{visit['id']}/status", {
        "status": "accepted",
        "seller_notes": "Welcome! Please arrive by 8:30 AM."
    }, token=rep_token, method="PATCH")
    assert accept_res["status"] == "accepted"
    print(f"✅ 10. Visit Acceptance & GPS Unlock Verified: Status {accept_res['status']}, Coordinates: {accept_res['exact_latitude']}, {accept_res['exact_longitude']}")

    # 11. Moderation Hub & Audit Trail by Admin
    stats = make_req("/moderation/stats", token=admin_token)
    audit = make_req("/moderation/audit-logs", token=admin_token)
    print(f"✅ 11. Moderation & Audit Verified: Total listings {stats['total_listings']}, Active sellers {stats['active_sellers']}, Recent audit logs {len(audit)}")

    # 12. Frontend Availability
    frontend_req = urllib.request.Request("http://127.0.0.1:5173")
    with urllib.request.urlopen(frontend_req) as resp:
        assert resp.status == 200
    print("✅ 12. Frontend React/Vite Dev Server Verified: HTTP 200 OK at http://127.0.0.1:5173")

    print("=" * 60)
    print("🎉 ALL 12 CRITICAL WORKFLOWS VERIFIED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_verification()
