from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import PriceBenchmark
from app.schemas.schemas import PriceEstimateRequest, PriceEstimateResponse
from app.services.price_service import estimate_livestock_price, BENCHMARK_DATABASE

router = APIRouter(prefix="/price-estimator", tags=["Indicative Price Estimator"])

@router.post("/calculate", response_model=PriceEstimateResponse)
def calculate_price_estimate(data: PriceEstimateRequest):
    """
    Transparent, attributable livestock price estimation using ICAR, NDDB, and TANUVAS benchmarks.
    Provides line-item breakdown factors in English and Tamil.
    """
    return estimate_livestock_price(data)

@router.get("/benchmarks")
def get_benchmarks(db: Session = Depends(get_db)):
    """
    Returns attributable government and market reference benchmarks
    """
    records = db.query(PriceBenchmark).all()
    results = []
    for r in records:
        results.append({
            "id": r.id,
            "livestock_type": r.livestock_type,
            "breed": r.breed,
            "base_price_min": r.base_price_min,
            "base_price_max": r.base_price_max,
            "milk_yield_factor": r.milk_yield_factor,
            "peak_age_min_months": r.peak_age_min_months,
            "peak_age_max_months": r.peak_age_max_months,
            "benchmark_source": r.benchmark_source,
            "source_attribution": r.source_attribution
        })
    return results

@router.get("/supported-breeds")
def get_supported_breeds():
    """
    Returns breeds catalog for the frontend selection
    """
    return {
        "cow": ["Kangayam", "Gir", "Sahiwal", "Jersey Cross", "HF Cross", "Umblachery", "Other Cow"],
        "buffalo": ["Murrah", "Mehsana", "Jaffarabadi", "Surti", "Other Buffalo"],
        "goat": ["Tellicherry", "Jamnapari", "Kanni Adu", "Salem Black", "Boer Cross", "Other Goat"],
        "sheep": ["Mecheri", "Ramnad White", "Vembur", "Nellore", "Other Sheep"],
        "hen": ["Aseel", "Kadaknath", "Country Hen (Nattu Kozhi)", "Other Hen"],
        "chicken": ["Aseel", "Country Chicken", "Broiler/Layer Breeder", "Other Chicken"],
        "duck": ["Kuttanad", "Indian Runner", "Vigova", "Other Duck"],
        "other": ["Horse/Pony", "Donkey", "Rabbit", "Other Livestock"]
    }
