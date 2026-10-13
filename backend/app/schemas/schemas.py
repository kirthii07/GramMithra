from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, EmailStr, ConfigDict

# ----------------- User Schemas -----------------
class UserBase(BaseModel):
    full_name: str
    email: Optional[str] = None
    phone: str
    role: str = Field(default="buyer", description="buyer, seller, panchayat_rep, admin")
    village: Optional[str] = None
    panchayat: Optional[str] = None
    taluk: Optional[str] = None
    district: Optional[str] = None
    state: str = "Tamil Nadu"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    panchayat_id_number: Optional[str] = None

class UserRegister(UserBase):
    password: str

class UserLogin(BaseModel):
    phone_or_email: str
    password: str

class AssistedUserRegister(BaseModel):
    farmer_name: str
    farmer_phone: str
    village: Optional[str] = None
    panchayat: str
    taluk: Optional[str] = None
    district: str
    state: str = "Tamil Nadu"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    consent_type: str = "digital_declaration"  # voice_recording, written_declaration, digital_declaration, biometric_witness
    consent_statement: str
    witness_name: Optional[str] = None
    witness_phone: Optional[str] = None
    proof_image_url: Optional[str] = None
    default_password: Optional[str] = "Farmer@123"

class UserOut(UserBase):
    id: int
    is_verified: bool
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# ----------------- Listing Schemas -----------------
class FlagReason(BaseModel):
    code: str
    severity: str  # high, medium, low, info
    title_en: str
    title_ta: str
    detail_en: str
    detail_ta: str

class ListingBase(BaseModel):
    title: str
    title_ta: Optional[str] = None
    description: Optional[str] = None
    description_ta: Optional[str] = None
    livestock_type: str  # cow, buffalo, goat, sheep, hen, chicken, duck, other
    breed: str
    age_months: int
    gender: str = "female"
    price: float
    is_negotiable: bool = True
    milk_yield_liters: float = 0.0
    lactation_number: int = 0
    pregnancy_status: str = "unknown"
    weight_kg: float = 0.0
    vaccination_status: str = "unknown"
    vaccination_details: Optional[str] = None
    vaccination_cert_url: Optional[str] = None
    health_notes: Optional[str] = None
    photos: List[str] = []
    documents: List[str] = []
    state: str = "Tamil Nadu"
    district: str
    taluk: Optional[str] = None
    panchayat: str
    village: Optional[str] = None
    latitude: float
    longitude: float
    hide_exact_location: bool = True
    is_demo: bool = False

class ListingCreate(ListingBase):
    pass

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    title_ta: Optional[str] = None
    description: Optional[str] = None
    description_ta: Optional[str] = None
    price: Optional[float] = None
    is_negotiable: Optional[bool] = None
    milk_yield_liters: Optional[float] = None
    lactation_number: Optional[int] = None
    pregnancy_status: Optional[str] = None
    weight_kg: Optional[float] = None
    vaccination_status: Optional[str] = None
    vaccination_details: Optional[str] = None
    health_notes: Optional[str] = None
    photos: Optional[List[str]] = None
    status: Optional[str] = None
    hide_exact_location: Optional[bool] = None

class SellerSummary(BaseModel):
    id: int
    full_name: str
    phone: str
    role: str
    is_verified: bool
    village: Optional[str] = None
    panchayat: Optional[str] = None
    district: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ListingOut(ListingBase):
    id: int
    seller_id: int
    assisted_by_id: Optional[int] = None
    status: str
    quality_score: float
    flag_reasons: List[Dict[str, Any]] = []
    views_count: int
    created_at: datetime
    updated_at: datetime
    seller: Optional[SellerSummary] = None
    distance_km: Optional[float] = None
    masked_phone: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# ----------------- Price Benchmark & Estimator -----------------
class PriceEstimateRequest(BaseModel):
    livestock_type: str
    breed: str
    age_months: int
    milk_yield_liters: float = 0.0
    lactation_number: int = 0
    pregnancy_status: str = "unknown"
    weight_kg: float = 0.0
    vaccination_status: str = "unknown"

class PriceFactorDetail(BaseModel):
    factor_name: str
    factor_name_ta: str
    impact_amount: float
    explanation_en: str
    explanation_ta: str

class PriceEstimateResponse(BaseModel):
    livestock_type: str
    breed: str
    estimated_indicative_price: float
    price_range_low: float
    price_range_high: float
    currency: str = "INR"
    breakdown_factors: List[PriceFactorDetail]
    benchmark_source: str
    attribution_notes: str
    confidence_level: str  # high, medium, standard

# ----------------- Farm Visit Schemas -----------------
class FarmVisitCreate(BaseModel):
    listing_id: int
    proposed_date: str
    time_slot: str
    buyer_notes: Optional[str] = None

class FarmVisitStatusUpdate(BaseModel):
    status: str  # accepted, declined, completed, cancelled
    seller_notes: Optional[str] = None

class FarmVisitOut(BaseModel):
    id: int
    listing_id: int
    buyer_id: int
    seller_id: int
    proposed_date: str
    time_slot: str
    buyer_notes: Optional[str] = None
    seller_notes: Optional[str] = None
    status: str
    created_at: datetime
    listing_title: Optional[str] = None
    listing_photos: Optional[List[str]] = None
    listing_district: Optional[str] = None
    listing_panchayat: Optional[str] = None
    exact_latitude: Optional[float] = None
    exact_longitude: Optional[float] = None
    buyer_name: Optional[str] = None
    buyer_phone: Optional[str] = None
    seller_name: Optional[str] = None
    seller_phone: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# ----------------- Notifications & Favorites -----------------
class NotificationOut(BaseModel):
    id: int
    title: str
    title_ta: Optional[str] = None
    message: str
    message_ta: Optional[str] = None
    notification_type: str
    reference_id: Optional[int] = None
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ----------------- Moderation Schemas -----------------
class ModerationAction(BaseModel):
    action: str  # approve, reject, flag
    reason: Optional[str] = None

class ModerationStats(BaseModel):
    total_listings: int
    pending_review: int
    flagged_listings: int
    active_sellers: int
    verified_panchayat_reps: int
    assisted_registrations_count: int
