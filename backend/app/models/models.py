import json
from datetime import datetime, timezone
from typing import List
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=True)
    phone = Column(String(30), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="buyer", nullable=False)  # buyer, seller, panchayat_rep, admin
    panchayat_id_number = Column(String(100), nullable=True)  # For panchayat reps or official identity
    village = Column(String(150), nullable=True)
    panchayat = Column(String(150), nullable=True)
    taluk = Column(String(150), nullable=True)
    district = Column(String(150), nullable=True)
    state = Column(String(150), default="Tamil Nadu")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    listings = relationship("Listing", back_populates="seller", foreign_keys="Listing.seller_id")
    assisted_registrations_given = relationship("AssistedRegistration", back_populates="representative", foreign_keys="AssistedRegistration.representative_id")
    assisted_registration_record = relationship("AssistedRegistration", back_populates="farmer", foreign_keys="AssistedRegistration.farmer_user_id", uselist=False)
    visit_requests_made = relationship("FarmVisit", back_populates="buyer", foreign_keys="FarmVisit.buyer_id")
    visit_requests_received = relationship("FarmVisit", back_populates="seller", foreign_keys="FarmVisit.seller_id")
    favorites = relationship("Favorite", back_populates="user")
    notifications = relationship("Notification", back_populates="user")


class AssistedRegistration(Base):
    __tablename__ = "assisted_registrations"

    id = Column(Integer, primary_key=True, index=True)
    representative_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farmer_user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    consent_type = Column(String(50), default="digital_declaration", nullable=False)  # voice_recording, written_declaration, digital_declaration, biometric_witness
    consent_statement = Column(Text, nullable=False)
    witness_name = Column(String(255), nullable=True)
    witness_phone = Column(String(30), nullable=True)
    proof_image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    # Relationships
    representative = relationship("User", foreign_keys=[representative_id], back_populates="assisted_registrations_given")
    farmer = relationship("User", foreign_keys=[farmer_user_id], back_populates="assisted_registration_record")


class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assisted_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    title = Column(String(255), nullable=False)
    title_ta = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    description_ta = Column(Text, nullable=True)
    
    # Categorization
    livestock_type = Column(String(50), nullable=False, index=True)  # cow, buffalo, goat, sheep, hen, chicken, duck, other
    breed = Column(String(100), nullable=False, index=True)
    age_months = Column(Integer, nullable=False)
    gender = Column(String(20), default="female")  # female, male
    price = Column(Float, nullable=False, index=True)
    is_negotiable = Column(Boolean, default=True)
    
    # Livestock Production & Health Attributes
    milk_yield_liters = Column(Float, default=0.0)  # Liters per day
    lactation_number = Column(Integer, default=0)   # 1st, 2nd, etc.
    pregnancy_status = Column(String(50), default="unknown")  # pregnant, not_pregnant, unknown, not_applicable
    weight_kg = Column(Float, default=0.0)
    
    vaccination_status = Column(String(50), default="unknown")  # fully_vaccinated, partially_vaccinated, not_vaccinated, unknown
    vaccination_details = Column(String(255), nullable=True)
    vaccination_cert_url = Column(String(500), nullable=True)
    health_notes = Column(Text, nullable=True)
    
    # Photos and Documentation stored as JSON
    photos_json = Column(Text, default="[]")  # List of image URLs
    documents_json = Column(Text, default="[]")  # Medical/Breed papers
    
    # Location Hierarchy
    state = Column(String(100), default="Tamil Nadu", index=True)
    district = Column(String(100), nullable=False, index=True)
    taluk = Column(String(100), nullable=True, index=True)
    panchayat = Column(String(100), nullable=False, index=True)
    village = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    hide_exact_location = Column(Boolean, default=True)  # Privacy protection: hides exact farm lat/lon to public until approved visit
    
    # Listing Lifecycle & Integrity
    status = Column(String(50), default="available", index=True)  # available, reserved, sold, under_review, rejected
    is_demo = Column(Boolean, default=False, index=True)  # Strictly isolates synthetic demonstration listings from real seller data
    quality_score = Column(Float, default=100.0)  # Calculated quality rating (0-100)
    flag_reasons_json = Column(Text, default="[]")  # Explainable suspicious warnings / missing information list
    
    views_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    seller = relationship("User", foreign_keys=[seller_id], back_populates="listings")
    assisted_by = relationship("User", foreign_keys=[assisted_by_id])
    visits = relationship("FarmVisit", back_populates="listing", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="listing", cascade="all, delete-orphan")

    @property
    def photos(self) -> List[str]:
        try:
            return json.loads(self.photos_json) if self.photos_json else []
        except Exception:
            return []

    @photos.setter
    def photos(self, val: List[str]):
        self.photos_json = json.dumps(val or [])

    @property
    def documents(self) -> List[str]:
        try:
            return json.loads(self.documents_json) if self.documents_json else []
        except Exception:
            return []

    @documents.setter
    def documents(self, val: List[str]):
        self.documents_json = json.dumps(val or [])

    @property
    def flag_reasons(self) -> List[dict]:
        try:
            return json.loads(self.flag_reasons_json) if self.flag_reasons_json else []
        except Exception:
            return []

    @flag_reasons.setter
    def flag_reasons(self, val: List[dict]):
        self.flag_reasons_json = json.dumps(val or [])


class PriceBenchmark(Base):
    __tablename__ = "price_benchmarks"

    id = Column(Integer, primary_key=True, index=True)
    livestock_type = Column(String(50), nullable=False, index=True)
    breed = Column(String(100), nullable=False, index=True)
    base_price_min = Column(Float, nullable=False)
    base_price_max = Column(Float, nullable=False)
    milk_yield_factor = Column(Float, default=0.0)  # Value added per liter/day
    peak_age_min_months = Column(Integer, default=24)
    peak_age_max_months = Column(Integer, default=60)
    age_depreciation_rate = Column(Float, default=0.05)
    health_premium_percent = Column(Float, default=10.0)
    benchmark_source = Column(String(255), nullable=False)
    source_attribution = Column(Text, nullable=True)


class FarmVisit(Base):
    __tablename__ = "farm_visits"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    proposed_date = Column(String(50), nullable=False)  # YYYY-MM-DD
    time_slot = Column(String(100), nullable=False)  # Morning 9-11 AM, etc.
    buyer_notes = Column(Text, nullable=True)
    seller_notes = Column(Text, nullable=True)
    
    status = Column(String(50), default="requested", index=True)  # requested, accepted, declined, completed, cancelled
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    listing = relationship("Listing", back_populates="visits")
    buyer = relationship("User", foreign_keys=[buyer_id], back_populates="visit_requests_made")
    seller = relationship("User", foreign_keys=[seller_id], back_populates="visit_requests_received")


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    created_at = Column(DateTime, default=utc_now)

    # Relationships
    user = relationship("User", back_populates="favorites")
    listing = relationship("Listing", back_populates="favorites")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    title_ta = Column(String(255), nullable=True)
    message = Column(Text, nullable=False)
    message_ta = Column(Text, nullable=True)
    notification_type = Column(String(50), default="general")
    reference_id = Column(Integer, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="notifications")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)  # APPROVE_LISTING, REJECT_LISTING, etc.
    entity_type = Column(String(50), nullable=False)  # listing, user, visit
    entity_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=utc_now)
