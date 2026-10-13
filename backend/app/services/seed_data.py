import json
from sqlalchemy.orm import Session
from app.models.models import User, Listing, PriceBenchmark, AssistedRegistration
from app.core.security import get_password_hash
from app.services.quality_service import analyze_listing_quality_and_suspicion

def seed_database_with_demo_and_benchmarks(db: Session):
    """
    Seeds database with official price benchmarks and clearly labeled synthetic demo data.
    Ensures absolute separation between real production records and synthetic demonstration entries.
    """
    # 1. Seed Price Benchmarks
    if db.query(PriceBenchmark).count() == 0:
        benchmarks = [
            PriceBenchmark(
                livestock_type="cow", breed="Kangayam",
                base_price_min=45000, base_price_max=75000, milk_yield_factor=3200,
                peak_age_min_months=30, peak_age_max_months=72,
                benchmark_source="TANUVAS Indigenous Cattle Field Advisory 2024 & Kongu Santhai Benchmark",
                source_attribution="Attributable data based on Tamil Nadu Veterinary and Animal Sciences University Kongu Cattle Field Trial & Tiruppur/Kangeyam agricultural markets."
            ),
            PriceBenchmark(
                livestock_type="cow", breed="Gir",
                base_price_min=55000, base_price_max=85000, milk_yield_factor=3500,
                peak_age_min_months=32, peak_age_max_months=75,
                benchmark_source="NDDB A2 Gir Cattle Benchmark & National Dairy Fair Averages",
                source_attribution="Attributable data based on National Dairy Development Board pedigree and milk yield performance records."
            ),
            PriceBenchmark(
                livestock_type="cow", breed="Jersey Cross",
                base_price_min=42000, base_price_max=68000, milk_yield_factor=2800,
                peak_age_min_months=26, peak_age_max_months=65,
                benchmark_source="Tamil Nadu Cooperative Milk Producers' Federation (Aavin) Farmer Pricing Guide",
                source_attribution="Attributable commercial crossbred dairy pricing indices across Coimbatore and Erode milk unions."
            ),
            PriceBenchmark(
                livestock_type="buffalo", breed="Murrah",
                base_price_min=65000, base_price_max=110000, milk_yield_factor=4200,
                peak_age_min_months=36, peak_age_max_months=84,
                benchmark_source="Central Institute for Research on Buffaloes (CIRB) & NDDB Benchmark",
                source_attribution="CIRB standard high-yield dairy buffalo valuation parameters."
            ),
            PriceBenchmark(
                livestock_type="goat", breed="Tellicherry",
                base_price_min=9000, base_price_max=19000, milk_yield_factor=0,
                peak_age_min_months=12, peak_age_max_months=40,
                benchmark_source="TANUVAS Tellicherry Goat Breeding Station Advisory",
                source_attribution="TANUVAS Small Ruminants Livestock Field Performance Guide."
            ),
            PriceBenchmark(
                livestock_type="goat", breed="Kanni Adu",
                base_price_min=7500, base_price_max=16500, milk_yield_factor=0,
                peak_age_min_months=12, peak_age_max_months=38,
                benchmark_source="Southern Tamil Nadu Native Goat Breeders Federation",
                source_attribution="Regional livestock baseline for Virudhunagar, Ramanathapuram, and Tuticorin districts."
            ),
            PriceBenchmark(
                livestock_type="sheep", breed="Mecheri",
                base_price_min=6500, base_price_max=14500, milk_yield_factor=0,
                peak_age_min_months=12, peak_age_max_months=36,
                benchmark_source="TANUVAS Mecheri Sheep Research Station, Pottaneri",
                source_attribution="Liveweight meat and breeding sheep market survey."
            ),
            PriceBenchmark(
                livestock_type="hen", breed="Aseel",
                base_price_min=1400, base_price_max=3800, milk_yield_factor=0,
                peak_age_min_months=6, peak_age_max_months=24,
                benchmark_source="Indigenous Poultry Conservation Society & Sandhai Rate",
                source_attribution="Native fighter poultry and breeding cock market benchmarks."
            ),
            PriceBenchmark(
                livestock_type="chicken", breed="Country Chicken",
                base_price_min=500, base_price_max=1200, milk_yield_factor=0,
                peak_age_min_months=5, peak_age_max_months=18,
                benchmark_source="Tamil Nadu Poultry Farmers Association Rural Standard",
                source_attribution="Live country bird retail and village market indices."
            )
        ]
        db.add_all(benchmarks)
        db.commit()

    # 2. Seed Default Demo Users
    admin_user = db.query(User).filter(User.phone == "9876500001").first()
    if not admin_user:
        admin_user = User(
            full_name="Dr. Sundaram (PashuSetu Admin)",
            email="admin@pashusetu.gov.in",
            phone="9876500001",
            hashed_password=get_password_hash("Admin@123"),
            role="admin",
            village="Secretariat Block",
            panchayat="Chennai Central",
            taluk="Egmore",
            district="Chennai",
            state="Tamil Nadu",
            latitude=13.0827,
            longitude=80.2707,
            is_verified=True
        )
        db.add(admin_user)

    rep_user = db.query(User).filter(User.phone == "9876500002").first()
    if not rep_user:
        rep_user = User(
            full_name="Murugesan V (Panchayat Representative)",
            email="panchayat.rep@kangayam.tn.gov.in",
            phone="9876500002",
            hashed_password=get_password_hash("Panchayat@123"),
            role="panchayat_rep",
            panchayat_id_number="TN-TPR-KGM-REP-042",
            village="Nathakadaiyur",
            panchayat="Nathakadaiyur",
            taluk="Kangeyam",
            district="Tiruppur",
            state="Tamil Nadu",
            latitude=11.0822,
            longitude=77.6251,
            is_verified=True
        )
        db.add(rep_user)

    seller_user = db.query(User).filter(User.phone == "9876500003").first()
    if not seller_user:
        seller_user = User(
            full_name="Selvam Periasamy (Organic Dairy Farmer)",
            email="selvam.farmer@gmail.com",
            phone="9876500003",
            hashed_password=get_password_hash("Farmer@123"),
            role="seller",
            village="Pappini Village",
            panchayat="Pappini",
            taluk="Kangeyam",
            district="Tiruppur",
            state="Tamil Nadu",
            latitude=11.0042,
            longitude=77.5612,
            is_verified=True
        )
        db.add(seller_user)

    buyer_user = db.query(User).filter(User.phone == "9876500004").first()
    if not buyer_user:
        buyer_user = User(
            full_name="Kavitha Rajesh (Prospective Dairy Buyer)",
            email="kavitha.buyer@gmail.com",
            phone="9876500004",
            hashed_password=get_password_hash("Buyer@123"),
            role="buyer",
            village="Sulur Rural",
            panchayat="Sulur",
            taluk="Sulur",
            district="Coimbatore",
            state="Tamil Nadu",
            latitude=11.0264,
            longitude=77.1278,
            is_verified=True
        )
        db.add(buyer_user)

    # Elderly Farmer assisted by Panchayat Rep
    assisted_farmer = db.query(User).filter(User.phone == "9876500005").first()
    if not assisted_farmer:
        assisted_farmer = User(
            full_name="Marimuthu Gounder (Assisted Farmer)",
            email=None,
            phone="9876500005",
            hashed_password=get_password_hash("Farmer@123"),
            role="seller",
            village="Vellakovil South",
            panchayat="Vellakovil",
            taluk="Kangeyam",
            district="Tiruppur",
            state="Tamil Nadu",
            latitude=10.9320,
            longitude=77.7120,
            is_verified=True
        )
        db.add(assisted_farmer)

    db.commit()

    # Assisted Registration Record for Marimuthu Gounder
    if not db.query(AssistedRegistration).filter(AssistedRegistration.farmer_user_id == assisted_farmer.id).first():
        asst = AssistedRegistration(
            representative_id=rep_user.id,
            farmer_user_id=assisted_farmer.id,
            consent_type="digital_declaration",
            consent_statement="Marimuthu Gounder verbally confirmed consent in the presence of Gram Panchayat ward members to register his Kangayam livestock on PashuSetu platform.",
            witness_name="P. Kandasamy (Ward 4 Member)",
            witness_phone="9842109876"
        )
        db.add(asst)
        db.commit()

    # 3. Seed Clearly Labeled Synthetic Demonstration Listings
    # Note: Every demo listing has is_demo=True and includes [DEMO DATA / மாதிரி தரவு] label
    if db.query(Listing).filter(Listing.is_demo == True).count() == 0:
        demo_listings_data = [
            {
                "seller_id": seller_user.id,
                "assisted_by_id": None,
                "title": "[DEMO DATA] Pure Kangayam Milking Cow (2nd Calving)",
                "title_ta": "[மாதிரி தரவு] காங்கேயம் கறவை மாடு (2-ம் ஈற்று)",
                "description": "Authentic Kangayam native breed cow in prime health. Active daily yield of 11-12 liters with high fat percentage. Fully vaccinated with government animal husbandry record.",
                "description_ta": "தூய காங்கேயம் இன கறவை மாடு. தினசரி 11-12 லிட்டர் பால் கறவை. அரசு கால்நடை மருத்துவ சான்றிதழ் மற்றும் கோமாரி தடுப்பூசி போடப்பட்டுள்ளது.",
                "livestock_type": "cow",
                "breed": "Kangayam",
                "age_months": 42,
                "gender": "female",
                "price": 68000,
                "is_negotiable": True,
                "milk_yield_liters": 11.5,
                "lactation_number": 2,
                "pregnancy_status": "pregnant",
                "weight_kg": 380,
                "vaccination_status": "fully_vaccinated",
                "vaccination_details": "FMD, Brucellosis, Anthrax (TN Animal Husbandry Card #TN-2025-998)",
                "health_notes": "Calm temperament, feeds on green fodder & oilcakes, dewormed last month.",
                "photos": [
                    "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80"
                ],
                "documents": ["https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80"],
                "state": "Tamil Nadu",
                "district": "Tiruppur",
                "taluk": "Kangeyam",
                "panchayat": "Pappini",
                "village": "Pappini Pudur",
                "latitude": 11.0042,
                "longitude": 77.5612,
                "hide_exact_location": True,
                "status": "available",
                "is_demo": True
            },
            {
                "seller_id": assisted_farmer.id,
                "assisted_by_id": rep_user.id,
                "title": "[DEMO DATA] High-Yield Murrah Buffalo with 1st Calf",
                "title_ta": "[மாதிரி தரவு] முர்ரா எருமை மற்றும் இளம் கன்று",
                "description": "Heavy built Murrah buffalo yielding 14 liters creamy milk per day. Assisted onboarding via Nathakadaiyur Panchayat Representative.",
                "description_ta": "தினசரி 14 லிட்டர் கெட்டிப் பால் தரும் தரமான முர்ரா எருமை. ஊராட்சி பிரதிநிதி உதவியுடன் பதிவு செய்யப்பட்டது.",
                "livestock_type": "buffalo",
                "breed": "Murrah",
                "age_months": 48,
                "gender": "female",
                "price": 88000,
                "is_negotiable": True,
                "milk_yield_liters": 14.0,
                "lactation_number": 1,
                "pregnancy_status": "not_pregnant",
                "weight_kg": 490,
                "vaccination_status": "fully_vaccinated",
                "vaccination_details": "Regularly vaccinated at Vellakovil veterinary dispensary",
                "health_notes": "Well cared buffalo, high milk fat percentage (7.8%).",
                "photos": [
                    "https://images.unsplash.com/photo-1596733430284-f7437764b14d?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=800&q=80"
                ],
                "documents": [],
                "state": "Tamil Nadu",
                "district": "Tiruppur",
                "taluk": "Kangeyam",
                "panchayat": "Vellakovil",
                "village": "Vellakovil South",
                "latitude": 10.9320,
                "longitude": 77.7120,
                "hide_exact_location": False,
                "status": "available",
                "is_demo": True
            },
            {
                "seller_id": seller_user.id,
                "assisted_by_id": None,
                "title": "[DEMO DATA] Breeding Tellicherry Female Goats (Pair)",
                "title_ta": "[மாதிரி தரவு] தலைச்சேரி இன பெண் ஆடுகள் (ஜோடி)",
                "description": "Pair of healthy Tellicherry breeding does. Weighing approx 28kg each. High twinning rate lineage.",
                "description_ta": "ஆரோக்கியமான தலைச்சேரி இன பெண் ஆடுகள் ஜோடி. தலா 28 கிலோ எடை. இரட்டை குட்டிகள் ஈனும் பாரம்பரியம்.",
                "livestock_type": "goat",
                "breed": "Tellicherry",
                "age_months": 16,
                "gender": "female",
                "price": 22000,
                "is_negotiable": True,
                "milk_yield_liters": 1.5,
                "lactation_number": 1,
                "pregnancy_status": "pregnant",
                "weight_kg": 56,
                "vaccination_status": "fully_vaccinated",
                "vaccination_details": "PPR and Enterotoxaemia (ET) vaccines given.",
                "health_notes": "Stall-fed and grazing accustomed.",
                "photos": [
                    "https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=800&q=80"
                ],
                "documents": [],
                "state": "Tamil Nadu",
                "district": "Erode",
                "taluk": "Perundurai",
                "panchayat": "Vijayamangalam",
                "village": "Vijayamangalam Rural",
                "latitude": 11.2333,
                "longitude": 77.5000,
                "hide_exact_location": True,
                "status": "available",
                "is_demo": True
            },
            {
                "seller_id": seller_user.id,
                "assisted_by_id": None,
                "title": "[DEMO DATA] Traditional Mecheri Sheep Ram (Salem Breed)",
                "title_ta": "[மாதிரி தரவு] பாரம்பரிய மேச்சேரி செம்மறி கிடா",
                "description": "Sturdy Mecheri mutton breed ram with lustrous light brown coat. Highly adaptable to drought and local pastures.",
                "description_ta": "மேச்சேரி செம்மறி கிடா. தரமான இறைச்சி இனம். வறட்சியைத் தாங்கி வளரக்கூடியது.",
                "livestock_type": "sheep",
                "breed": "Mecheri",
                "age_months": 18,
                "gender": "male",
                "price": 11500,
                "is_negotiable": False,
                "milk_yield_liters": 0.0,
                "lactation_number": 0,
                "pregnancy_status": "not_applicable",
                "weight_kg": 34,
                "vaccination_status": "partially_vaccinated",
                "vaccination_details": "ET vaccine completed, FMD due next month.",
                "health_notes": "Vigorous male, excellent for flock improvement.",
                "photos": [
                    "https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=800&q=80"
                ],
                "documents": [],
                "state": "Tamil Nadu",
                "district": "Salem",
                "taluk": "Mettur",
                "panchayat": "Mecheri",
                "village": "Pottaneri",
                "latitude": 11.8312,
                "longitude": 77.9389,
                "hide_exact_location": True,
                "status": "available",
                "is_demo": True
            },
            {
                "seller_id": assisted_farmer.id,
                "assisted_by_id": rep_user.id,
                "title": "[DEMO DATA] Genuine Aseel Country Roosters (நாட்டு சண்டை சேவல்)",
                "title_ta": "[மாதிரி தரவு] அசல் நாட்டு சண்டை சேவல்",
                "description": "Pure long-tail Aseel breed rooster. Strong bone structure and aggressive stance. Raised on natural grains.",
                "description_ta": "தூய அசல் நாட்டு சண்டை சேவல். கம்பீரமான தோற்றம் மற்றும் திடகாத்திரமான உடல்வாகு.",
                "livestock_type": "hen",
                "breed": "Aseel",
                "age_months": 12,
                "gender": "male",
                "price": 2800,
                "is_negotiable": True,
                "milk_yield_liters": 0.0,
                "lactation_number": 0,
                "pregnancy_status": "not_applicable",
                "weight_kg": 3.4,
                "vaccination_status": "fully_vaccinated",
                "vaccination_details": "Ranikhet (RDV) and Lasota given.",
                "health_notes": "Active and completely free-range reared.",
                "photos": [
                    "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80"
                ],
                "documents": [],
                "state": "Tamil Nadu",
                "district": "Madurai",
                "taluk": "Usilampatti",
                "panchayat": "Sedapatti",
                "village": "Sedapatti North",
                "latitude": 9.8732,
                "longitude": 77.7712,
                "hide_exact_location": False,
                "status": "available",
                "is_demo": True
            },
            {
                "seller_id": seller_user.id,
                "assisted_by_id": None,
                "title": "[DEMO DATA] Jersey Cross Dairy Cow (High Milker)",
                "title_ta": "[மாதிரி தரவு] ஜெர்சி கலப்பின கறவை மாடு",
                "description": "Docile Jersey cross cow with daily morning+evening yield of 16 liters. Clean medical book available.",
                "description_ta": "அமைதியான சுபாவம் கொண்ட ஜெர்சி கலப்பின மாடு. தினசரி 16 லிட்டர் பால் கறவை திறன்.",
                "livestock_type": "cow",
                "breed": "Jersey Cross",
                "age_months": 38,
                "gender": "female",
                "price": 62000,
                "is_negotiable": True,
                "milk_yield_liters": 16.0,
                "lactation_number": 2,
                "pregnancy_status": "not_pregnant",
                "weight_kg": 395,
                "vaccination_status": "fully_vaccinated",
                "vaccination_details": "Annual booster doses up to date.",
                "health_notes": "Machine milking trained.",
                "photos": [
                    "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=800&q=80"
                ],
                "documents": [],
                "state": "Tamil Nadu",
                "district": "Coimbatore",
                "taluk": "Pollachi",
                "panchayat": "Anaimalai",
                "village": "Vettaikaranpudur",
                "latitude": 10.6609,
                "longitude": 76.9934,
                "hide_exact_location": True,
                "status": "available",
                "is_demo": True
            },
            {
                "seller_id": seller_user.id,
                "assisted_by_id": None,
                "title": "[DEMO DATA] Unusually Low Priced Cow (Example Flagged Listing)",
                "title_ta": "[மாதிரி தரவு] சந்தேகத்திற்கிடமான குறைந்த விலை மாடு (எச்சரிக்கை மாதிரி)",
                "description": "Demo listing demonstrating PashuSetu explainable suspicious-price alert. Price listed at ₹15,000 for a Murrah cross, triggering safety warning.",
                "description_ta": "பரிசோதனைக்கான குறைந்த விலை எச்சரிக்கை கொண்ட மாதிரி பதிவு.",
                "livestock_type": "cow",
                "breed": "Kangayam",
                "age_months": 36,
                "gender": "female",
                "price": 15000,  # Deliberately anomalous to test explainable warning
                "is_negotiable": False,
                "milk_yield_liters": 0.0,
                "lactation_number": 1,
                "pregnancy_status": "unknown",
                "weight_kg": 300,
                "vaccination_status": "not_vaccinated",
                "vaccination_details": None,
                "health_notes": "Needs urgent sale.",
                "photos": [],  # Intentionally empty to test missing photo detection
                "documents": [],
                "state": "Tamil Nadu",
                "district": "Dindigul",
                "taluk": "Palani",
                "panchayat": "Ayakudi",
                "village": "Ayakudi Rural",
                "latitude": 10.4500,
                "longitude": 77.5500,
                "hide_exact_location": True,
                "status": "available",
                "is_demo": True
            }
        ]

        for item in demo_listings_data:
            new_listing = Listing(
                seller_id=item["seller_id"],
                assisted_by_id=item["assisted_by_id"],
                title=item["title"],
                title_ta=item["title_ta"],
                description=item["description"],
                description_ta=item["description_ta"],
                livestock_type=item["livestock_type"],
                breed=item["breed"],
                age_months=item["age_months"],
                gender=item["gender"],
                price=item["price"],
                is_negotiable=item["is_negotiable"],
                milk_yield_liters=item["milk_yield_liters"],
                lactation_number=item["lactation_number"],
                pregnancy_status=item["pregnancy_status"],
                weight_kg=item["weight_kg"],
                vaccination_status=item["vaccination_status"],
                vaccination_details=item["vaccination_details"],
                health_notes=item["health_notes"],
                state=item["state"],
                district=item["district"],
                taluk=item["taluk"],
                panchayat=item["panchayat"],
                village=item["village"],
                latitude=item["latitude"],
                longitude=item["longitude"],
                hide_exact_location=item["hide_exact_location"],
                status=item["status"],
                is_demo=True
            )
            new_listing.photos = item["photos"]
            new_listing.documents = item["documents"]

            # Run quality & suspicious-listing rules
            score, flags = analyze_listing_quality_and_suspicion(
                new_listing,
                seller_is_verified=True,
                is_assisted_by_rep=bool(item["assisted_by_id"])
            )
            new_listing.quality_score = score
            new_listing.flag_reasons = flags

            db.add(new_listing)

        db.commit()
