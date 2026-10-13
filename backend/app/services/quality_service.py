from typing import List, Dict, Any, Tuple
from app.services.price_service import estimate_livestock_price
from app.schemas.schemas import PriceEstimateRequest

def analyze_listing_quality_and_suspicion(
    listing_data: Any,
    seller_is_verified: bool = False,
    is_assisted_by_rep: bool = False
) -> Tuple[float, List[Dict[str, Any]]]:
    """
    Evaluates explainable quality metrics and flags suspicious signals 
    for transparent buyer safety and admin moderation.
    """
    flags: List[Dict[str, Any]] = []
    score = 100.0

    # 1. Price Anomaly Detection using Attributable Benchmark
    try:
        est_req = PriceEstimateRequest(
            livestock_type=listing_data.livestock_type,
            breed=listing_data.breed,
            age_months=listing_data.age_months or 36,
            milk_yield_liters=getattr(listing_data, "milk_yield_liters", 0.0) or 0.0,
            lactation_number=getattr(listing_data, "lactation_number", 0) or 0,
            pregnancy_status=getattr(listing_data, "pregnancy_status", "unknown") or "unknown",
            weight_kg=getattr(listing_data, "weight_kg", 0.0) or 0.0,
            vaccination_status=getattr(listing_data, "vaccination_status", "unknown") or "unknown"
        )
        est = estimate_livestock_price(est_req)
        
        bench_price = est.estimated_indicative_price
        actual_price = float(listing_data.price)
        
        # Check for suspiciously low price (Scam / Bait risk)
        if actual_price < (bench_price * 0.40):
            score -= 30.0
            flags.append({
                "code": "SUSPICIOUS_LOW_PRICE",
                "severity": "high",
                "title_en": "Unusually Low Price Alert",
                "title_ta": "சந்தேகத்திற்குரிய குறைந்த விலை எச்சரிக்கை",
                "detail_en": f"Listed price (₹{actual_price:,.0f}) is over 60% below regional benchmark (₹{bench_price:,.0f}). Possible advance-token scam, distress sale, or undisclosed severe illness. Never transfer money before a physical farm visit.",
                "detail_ta": f"குறிப்பிடப்பட்ட விலை (₹{actual_price:,.0f}) அரசு/சந்தை சராசரியை (₹{bench_price:,.0f}) விட 60% குறைவாக உள்ளது. முன்பண மோசடி அல்லது நோய் அபாயம் இருக்கலாம். நேரில் சென்று பார்க்காமல் முன்பணம் செலுத்தாதீர்கள்."
            })
        elif actual_price > (bench_price * 1.90):
            score -= 10.0
            flags.append({
                "code": "HIGH_PRICE_OUTLIER",
                "severity": "medium",
                "title_en": "Above-Market Pricing",
                "title_ta": "சந்தை விலையை விட அதிகம்",
                "detail_en": f"Listed price (₹{actual_price:,.0f}) is significantly above standard market benchmark (₹{bench_price:,.0f}). Request pedigree lineage or verifiable milk certificates.",
                "detail_ta": f"குறிப்பிடப்பட்ட விலை (₹{actual_price:,.0f}) நிலையான சந்தை மதிப்பை (₹{bench_price:,.0f}) விட அதிகமாக உள்ளது. மரபு வழி ஆவணங்கள் அல்லது பால் சான்றிதழ்களைக் கேட்டு அறியவும்."
            })
    except Exception:
        pass

    # 2. Photo Evidence Verification
    photos = getattr(listing_data, "photos", []) or []
    if len(photos) == 0:
        score -= 25.0
        flags.append({
            "code": "NO_PHOTOS",
            "severity": "high",
            "title_en": "No Photographs Uploaded",
            "title_ta": "புகைப்படங்கள் இல்லை",
            "detail_en": "No live photos of the livestock have been provided. Verified buyers strongly prefer side-profile, udder, and facial photos.",
            "detail_ta": "விலங்கின் நேரடி புகைப்படங்கள் பதிவேற்றப்படவில்லை. பக்கவாட்டுத் தோற்றம், மடி மற்றும் முகப் படங்கள் அவசியம்."
        })
    elif len(photos) == 1:
        score -= 10.0
        flags.append({
            "code": "LIMITED_PHOTOS",
            "severity": "low",
            "title_en": "Limited Photo Verification",
            "title_ta": "குறைந்த புகைப்படங்கள்",
            "detail_en": "Only one photo is provided. Multiple angles (udder/teeth/movement) help avoid inspection surprises.",
            "detail_ta": "ஒரே ஒரு புகைப்படம் மட்டுமே உள்ளது. பல கோணப் படங்கள் கால்நடையின் நிலையைத் துல்லியமாக அறிய உதவும்."
        })

    # 3. Health & Vaccination Records
    vac_status = getattr(listing_data, "vaccination_status", "unknown")
    if vac_status in ["not_vaccinated", "unknown"]:
        score -= 15.0
        flags.append({
            "code": "MISSING_VACCINATION",
            "severity": "medium",
            "title_en": "Missing Health / Vaccination Record",
            "title_ta": "தடுப்பூசி பதிவு இணைக்கப்படவில்லை",
            "detail_en": "No verified FMD / Brucellosis vaccination record. Inspect animal teeth, hooves, and temperature during farm visit.",
            "detail_ta": "கோமாரி மற்றும் புரூசெல்லா தடுப்பூசி விபரம் இல்லை. நேரில் சென்று பார்க்கும்போது பற்கள் மற்றும் குளம்புகளை பரிசோதிக்கவும்."
        })

    # 4. Dairy Yield Details Completeness
    livestock_type = (getattr(listing_data, "livestock_type", "") or "").lower()
    if livestock_type in ["cow", "buffalo"]:
        milk = getattr(listing_data, "milk_yield_liters", 0.0) or 0.0
        if milk <= 0.0:
            score -= 10.0
            flags.append({
                "code": "MISSING_MILK_DATA",
                "severity": "medium",
                "title_en": "Milk Yield Not Specified",
                "title_ta": "பால் கறவை அளவு குறிப்பிடப்படவில்லை",
                "detail_en": "Daily milk output is unstated for dairy livestock. Verify morning and evening milk measurements on site.",
                "detail_ta": "கறவை மாட்டிற்கான பால் அளவு விபரம் விடுபட்டுள்ளது. காலை மற்றும் மாலை கறவை அளவை நேரில் பார்த்து உறுதி செய்யவும்."
            })

    # 5. Seller & Representative Verification Status
    if not seller_is_verified and not is_assisted_by_rep:
        score -= 10.0
        flags.append({
            "code": "UNVERIFIED_SELLER",
            "severity": "info",
            "title_en": "Community Seller (Unverified KYC)",
            "title_ta": "சரிபார்க்கப்படாத உறுப்பினர்",
            "detail_en": "Seller profile has not yet completed Panchayat Representative verification or identity badge confirmation.",
            "detail_ta": "விற்பனையாளர் இன்னும் ஊராட்சி பிரதிநிதியால் அல்லது அரசு அடையாளத்தால் சரிபார்க்கப்படவில்லை."
        })
    elif is_assisted_by_rep:
        score = min(100.0, score + 10.0)

    final_score = max(10.0, min(100.0, round(score, 1)))
    return (final_score, flags)
