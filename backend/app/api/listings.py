import os
import shutil
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models.models import Listing, User, AuditLog, FarmVisit
from app.schemas.schemas import ListingCreate, ListingUpdate, ListingOut, SellerSummary
from app.api.deps import get_current_user, get_optional_current_user, require_roles
from app.services.geo_service import haversine_distance_km, get_bounding_box
from app.services.quality_service import analyze_listing_quality_and_suspicion

router = APIRouter(prefix="/listings", tags=["Livestock Listings"])

@router.get("", response_model=List[ListingOut])
def get_listings(
    livestock_type: Optional[str] = None,
    breed: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    district: Optional[str] = None,
    panchayat: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    seller_id: Optional[int] = None,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    radius_km: Optional[float] = Query(None, description="GPS search radius in kilometers"),
    include_demo: bool = Query(True, description="Include synthetic demo listings"),
    demo_only: bool = Query(False, description="Filter for synthetic demo listings only"),
    search: Optional[str] = None,
    sort_by: Optional[str] = Query("newest", description="newest, price_asc, price_desc, distance"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    query = db.query(Listing)
    
    # Filter by demo status
    if demo_only:
        query = query.filter(Listing.is_demo == True)
    elif not include_demo:
        query = query.filter(Listing.is_demo == False)
        
    # Status filter (default to available unless specifically requesting all or another status)
    if status_filter:
        query = query.filter(Listing.status == status_filter)
    elif not seller_id:
        query = query.filter(Listing.status.in_(["available", "reserved"]))
        
    if seller_id:
        query = query.filter(Listing.seller_id == seller_id)
        
    if livestock_type and livestock_type != "all":
        query = query.filter(Listing.livestock_type == livestock_type.lower())
        
    if breed and breed != "all":
        query = query.filter(Listing.breed.ilike(f"%{breed}%"))
        
    if min_price is not None:
        query = query.filter(Listing.price >= min_price)
    if max_price is not None:
        query = query.filter(Listing.price <= max_price)
        
    if district and district != "all":
        query = query.filter(Listing.district.ilike(district))
        
    if panchayat and panchayat != "all":
        query = query.filter(Listing.panchayat.ilike(panchayat))
        
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Listing.title.ilike(search_term)) |
            (Listing.title_ta.ilike(search_term)) |
            (Listing.breed.ilike(search_term)) |
            (Listing.description.ilike(search_term)) |
            (Listing.village.ilike(search_term)) |
            (Listing.panchayat.ilike(search_term))
        )

    # Coarse bounding box filter if GPS radius is given
    if latitude is not None and longitude is not None and radius_km is not None and radius_km > 0:
        min_lat, max_lat, min_lon, max_lon = get_bounding_box(latitude, longitude, radius_km)
        query = query.filter(
            Listing.latitude.between(min_lat, max_lat),
            Listing.longitude.between(min_lon, max_lon)
        )

    all_listings = query.all()
    
    # Process results, distances, and privacy filters
    results = []
    for item in all_listings:
        # Distance calculation
        dist = None
        if latitude is not None and longitude is not None:
            dist = haversine_distance_km(latitude, longitude, item.latitude, item.longitude)
            if radius_km is not None and dist > radius_km:
                continue  # Out of exact circular radius
                
        # Seller detail
        seller_obj = None
        if item.seller:
            seller_obj = SellerSummary(
                id=item.seller.id,
                full_name=item.seller.full_name,
                phone=item.seller.phone,
                role=item.seller.role,
                is_verified=item.seller.is_verified,
                village=item.seller.village,
                panchayat=item.seller.panchayat,
                district=item.seller.district
            )

        # Privacy Controls: Hide exact GPS & mask phone if privacy enabled and not owner
        display_lat = item.latitude
        display_lon = item.longitude
        masked_phone = None
        if item.seller:
            phone_raw = item.seller.phone
            masked_phone = f"{phone_raw[:3]}****{phone_raw[-3:]}" if len(phone_raw) >= 6 else phone_raw
            
        if item.hide_exact_location and (not current_user or current_user.id != item.seller_id):
            # Coarsen latitude/longitude to ~1-2km resolution for public search
            display_lat = round(item.latitude, 2)
            display_lon = round(item.longitude, 2)

        out_item = ListingOut(
            id=item.id,
            seller_id=item.seller_id,
            assisted_by_id=item.assisted_by_id,
            title=item.title,
            title_ta=item.title_ta,
            description=item.description,
            description_ta=item.description_ta,
            livestock_type=item.livestock_type,
            breed=item.breed,
            age_months=item.age_months,
            gender=item.gender,
            price=item.price,
            is_negotiable=item.is_negotiable,
            milk_yield_liters=item.milk_yield_liters,
            lactation_number=item.lactation_number,
            pregnancy_status=item.pregnancy_status,
            weight_kg=item.weight_kg,
            vaccination_status=item.vaccination_status,
            vaccination_details=item.vaccination_details,
            vaccination_cert_url=item.vaccination_cert_url,
            health_notes=item.health_notes,
            photos=item.photos,
            documents=item.documents,
            state=item.state,
            district=item.district,
            taluk=item.taluk,
            panchayat=item.panchayat,
            village=item.village,
            latitude=display_lat,
            longitude=display_lon,
            hide_exact_location=item.hide_exact_location,
            is_demo=item.is_demo,
            status=item.status,
            quality_score=item.quality_score,
            flag_reasons=item.flag_reasons,
            views_count=item.views_count,
            created_at=item.created_at,
            updated_at=item.updated_at,
            seller=seller_obj,
            distance_km=dist,
            masked_phone=masked_phone
        )
        results.append(out_item)

    # Sorting
    if sort_by == "distance" and latitude is not None and longitude is not None:
        results.sort(key=lambda x: (x.distance_km if x.distance_km is not None else 99999))
    elif sort_by == "price_asc":
        results.sort(key=lambda x: x.price)
    elif sort_by == "price_desc":
        results.sort(key=lambda x: x.price, reverse=True)
    else:  # newest
        results.sort(key=lambda x: x.created_at, reverse=True)

    return results

@router.get("/{id}", response_model=ListingOut)
def get_listing_detail(
    id: int,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    listing = db.query(Listing).filter(Listing.id == id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    # Increment views
    listing.views_count += 1
    db.commit()
    db.refresh(listing)
    
    dist = None
    if latitude is not None and longitude is not None:
        dist = haversine_distance_km(latitude, longitude, listing.latitude, listing.longitude)
        
    seller_obj = None
    masked_phone = None
    if listing.seller:
        seller_obj = SellerSummary.model_validate(listing.seller)
        p = listing.seller.phone
        masked_phone = f"{p[:3]}****{p[-3:]}" if len(p) >= 6 else p

    # Check if this buyer has an accepted visit, which unlocks exact coordinates
    has_accepted_visit = False
    if current_user:
        accepted_visit = db.query(FarmVisit).filter(
            FarmVisit.listing_id == listing.id,
            FarmVisit.buyer_id == current_user.id,
            FarmVisit.status == "accepted"
        ).first()
        if accepted_visit:
            has_accepted_visit = True

    display_lat = listing.latitude
    display_lon = listing.longitude
    if listing.hide_exact_location and not has_accepted_visit and (not current_user or current_user.id != listing.seller_id):
        display_lat = round(listing.latitude, 2)
        display_lon = round(listing.longitude, 2)

    return ListingOut(
        id=listing.id,
        seller_id=listing.seller_id,
        assisted_by_id=listing.assisted_by_id,
        title=listing.title,
        title_ta=listing.title_ta,
        description=listing.description,
        description_ta=listing.description_ta,
        livestock_type=listing.livestock_type,
        breed=listing.breed,
        age_months=listing.age_months,
        gender=listing.gender,
        price=listing.price,
        is_negotiable=listing.is_negotiable,
        milk_yield_liters=listing.milk_yield_liters,
        lactation_number=listing.lactation_number,
        pregnancy_status=listing.pregnancy_status,
        weight_kg=listing.weight_kg,
        vaccination_status=listing.vaccination_status,
        vaccination_details=listing.vaccination_details,
        vaccination_cert_url=listing.vaccination_cert_url,
        health_notes=listing.health_notes,
        photos=listing.photos,
        documents=listing.documents,
        state=listing.state,
        district=listing.district,
        taluk=listing.taluk,
        panchayat=listing.panchayat,
        village=listing.village,
        latitude=display_lat,
        longitude=display_lon,
        hide_exact_location=listing.hide_exact_location,
        is_demo=listing.is_demo,
        status=listing.status,
        quality_score=listing.quality_score,
        flag_reasons=listing.flag_reasons,
        views_count=listing.views_count,
        created_at=listing.created_at,
        updated_at=listing.updated_at,
        seller=seller_obj,
        distance_km=dist,
        masked_phone=masked_phone
    )

@router.post("", response_model=ListingOut, status_code=status.HTTP_201_CREATED)
def create_listing(
    data: ListingCreate,
    target_farmer_id: Optional[int] = Query(None, description="Optional target farmer ID when assisted by Panchayat Rep"),
    current_user: User = Depends(require_roles(["seller", "panchayat_rep", "admin"])),
    db: Session = Depends(get_db)
):
    seller_id = current_user.id
    assisted_by_id = None
    
    # If a Panchayat Representative or Admin is creating listing on behalf of an onboarded farmer
    if target_farmer_id and current_user.role in ["panchayat_rep", "admin"]:
        farmer = db.query(User).filter(User.id == target_farmer_id).first()
        if not farmer:
            raise HTTPException(status_code=404, detail="Assisted farmer account not found")
        seller_id = farmer.id
        assisted_by_id = current_user.id

    new_listing = Listing(
        seller_id=seller_id,
        assisted_by_id=assisted_by_id,
        title=data.title,
        title_ta=data.title_ta or data.title,
        description=data.description,
        description_ta=data.description_ta,
        livestock_type=data.livestock_type.lower(),
        breed=data.breed,
        age_months=data.age_months,
        gender=data.gender,
        price=data.price,
        is_negotiable=data.is_negotiable,
        milk_yield_liters=data.milk_yield_liters,
        lactation_number=data.lactation_number,
        pregnancy_status=data.pregnancy_status,
        weight_kg=data.weight_kg,
        vaccination_status=data.vaccination_status,
        vaccination_details=data.vaccination_details,
        vaccination_cert_url=data.vaccination_cert_url,
        health_notes=data.health_notes,
        state=data.state,
        district=data.district,
        taluk=data.taluk,
        panchayat=data.panchayat,
        village=data.village,
        latitude=data.latitude,
        longitude=data.longitude,
        hide_exact_location=data.hide_exact_location,
        is_demo=data.is_demo,
        status="available"
    )
    new_listing.photos = data.photos
    new_listing.documents = data.documents

    # Run explainable quality and suspicious listing analyzer
    seller_user = db.query(User).filter(User.id == seller_id).first()
    seller_is_verified = seller_user.is_verified if seller_user else False
    score, flags = analyze_listing_quality_and_suspicion(
        new_listing,
        seller_is_verified=seller_is_verified,
        is_assisted_by_rep=bool(assisted_by_id)
    )
    new_listing.quality_score = score
    new_listing.flag_reasons = flags

    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="CREATE_LISTING",
        entity_type="listing",
        entity_id=new_listing.id,
        details=f"Created {new_listing.livestock_type} listing '{new_listing.title}' for ₹{new_listing.price}"
    )
    db.add(audit)
    db.commit()

    return ListingOut.model_validate(new_listing)

@router.put("/{id}", response_model=ListingOut)
def update_listing(
    id: int,
    data: ListingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.id == id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    if current_user.role != "admin" and listing.seller_id != current_user.id and listing.assisted_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this listing")

    update_dict = data.model_dump(exclude_unset=True)
    if "photos" in update_dict:
        listing.photos = update_dict.pop("photos")
        
    for key, value in update_dict.items():
        setattr(listing, key, value)
        
    # Re-evaluate quality
    score, flags = analyze_listing_quality_and_suspicion(
        listing,
        seller_is_verified=listing.seller.is_verified if listing.seller else False,
        is_assisted_by_rep=bool(listing.assisted_by_id)
    )
    listing.quality_score = score
    listing.flag_reasons = flags
    
    db.commit()
    db.refresh(listing)
    return ListingOut.model_validate(listing)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.id == id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    if current_user.role != "admin" and listing.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this listing")

    db.delete(listing)
    db.commit()
    return None

@router.post("/{id}/flag")
def flag_listing(
    id: int,
    reason: str = Query(..., description="Reason for flagging this listing as suspicious"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.id == id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    existing_flags = listing.flag_reasons
    existing_flags.append({
        "code": "USER_REPORTED",
        "severity": "high",
        "title_en": "Community User Report",
        "title_ta": "பயனாளர் புகார்",
        "detail_en": f"Flagged by user ({current_user.full_name}): {reason}",
        "detail_ta": f"பயனாளர் புகார்: {reason}"
    })
    listing.flag_reasons = existing_flags
    listing.quality_score = max(10.0, listing.quality_score - 20.0)
    
    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="FLAG_LISTING",
        entity_type="listing",
        entity_id=listing.id,
        details=f"Listing flagged by {current_user.full_name}: {reason}"
    )
    db.add(audit)
    db.commit()

    return {"message": "Listing successfully flagged for Panchayat/Admin moderation review"}

@router.post("/upload")
def upload_listing_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Handles photo and medical document uploads
    """
    allowed_extensions = [".jpg", ".jpeg", ".png", ".webp", ".pdf"]
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Allowed file types: JPG, PNG, WEBP, PDF")
        
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    file_url = f"/uploads/{filename}"
    return {"url": file_url, "filename": filename}
