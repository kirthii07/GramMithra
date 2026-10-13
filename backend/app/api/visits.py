from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import FarmVisit, Listing, User, Notification, AuditLog
from app.schemas.schemas import FarmVisitCreate, FarmVisitStatusUpdate, FarmVisitOut
from app.api.deps import get_current_user

router = APIRouter(prefix="/visits", tags=["Farm Visit Scheduling"])

@router.post("", response_model=FarmVisitOut, status_code=status.HTTP_201_CREATED)
def request_farm_visit(
    data: FarmVisitCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.id == data.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    if listing.seller_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot schedule a visit for your own listing")
        
    visit = FarmVisit(
        listing_id=listing.id,
        buyer_id=current_user.id,
        seller_id=listing.seller_id,
        proposed_date=data.proposed_date,
        time_slot=data.time_slot,
        buyer_notes=data.buyer_notes,
        status="requested"
    )
    db.add(visit)
    db.commit()
    db.refresh(visit)
    
    # Notify Seller
    notif = Notification(
        user_id=listing.seller_id,
        title="New Farm Visit Request",
        title_ta="புதிய பண்ணை பார்வை கோரிக்கை",
        message=f"{current_user.full_name} has requested a farm visit for '{listing.title}' on {data.proposed_date} ({data.time_slot}).",
        message_ta=f"{current_user.full_name} உங்கள் '{listing.title_ta or listing.title}' கால்நடையை {data.proposed_date} அன்று நேரில் பார்வையிட கோரியுள்ளார்.",
        notification_type="visit_requested",
        reference_id=visit.id
    )
    db.add(notif)
    
    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="REQUEST_FARM_VISIT",
        entity_type="visit",
        entity_id=visit.id,
        details=f"Buyer {current_user.full_name} requested visit for listing {listing.id} on {data.proposed_date}"
    )
    db.add(audit)
    db.commit()
    
    return _build_visit_out(visit)

@router.get("", response_model=List[FarmVisitOut])
def get_user_farm_visits(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns all farm visits where current user is either buyer or seller
    """
    visits = db.query(FarmVisit).filter(
        (FarmVisit.buyer_id == current_user.id) | (FarmVisit.seller_id == current_user.id)
    ).order_by(FarmVisit.created_at.desc()).all()
    
    return [_build_visit_out(v) for v in visits]

@router.patch("/{id}/status", response_model=FarmVisitOut)
def update_visit_status(
    id: int,
    data: FarmVisitStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    visit = db.query(FarmVisit).filter(FarmVisit.id == id).first()
    if not visit:
        raise HTTPException(status_code=404, detail="Farm visit request not found")
        
    if current_user.role != "admin" and current_user.id not in [visit.seller_id, visit.buyer_id]:
        raise HTTPException(status_code=403, detail="Not authorized to update this visit")
        
    new_status = data.status.lower()
    if new_status not in ["accepted", "declined", "completed", "cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid status value")
        
    visit.status = new_status
    if data.seller_notes:
        visit.seller_notes = data.seller_notes
        
    db.commit()
    db.refresh(visit)
    
    # Notify Buyer if seller accepted or declined
    if visit.seller_id == current_user.id:
        target_user_id = visit.buyer_id
        if new_status == "accepted":
            t_en = "Farm Visit Confirmed!"
            t_ta = "பண்ணை பார்வை உறுதி செய்யப்பட்டது!"
            m_en = f"The seller has accepted your visit request for {visit.proposed_date}. Exact farm coordinates and contact are now unlocked."
            m_ta = f"விற்பனையாளர் உங்கள் பார்வை கோரிக்கையை ஏற்றுக்கொண்டார். பண்ணையின் துல்லியமான இருப்பிடம் திறக்கப்பட்டுள்ளது."
        else:
            t_en = f"Farm Visit {new_status.title()}"
            t_ta = "பண்ணை பார்வை நிலை புதுப்பிக்கப்பட்டது"
            m_en = f"The seller has marked your visit request as {new_status}."
            m_ta = f"விற்பனையாளர் உங்கள் கோரிக்கையை {new_status} என மாற்றியுள்ளார்."
            
        notif = Notification(
            user_id=target_user_id,
            title=t_en,
            title_ta=t_ta,
            message=m_en,
            message_ta=m_ta,
            notification_type="visit_status_changed",
            reference_id=visit.id
        )
        db.add(notif)
        db.commit()

    return _build_visit_out(visit)

def _build_visit_out(v: FarmVisit) -> FarmVisitOut:
    return FarmVisitOut(
        id=v.id,
        listing_id=v.listing_id,
        buyer_id=v.buyer_id,
        seller_id=v.seller_id,
        proposed_date=v.proposed_date,
        time_slot=v.time_slot,
        buyer_notes=v.buyer_notes,
        seller_notes=v.seller_notes,
        status=v.status,
        created_at=v.created_at,
        listing_title=v.listing.title if v.listing else "Livestock Listing",
        listing_photos=v.listing.photos if v.listing else [],
        listing_district=v.listing.district if v.listing else None,
        listing_panchayat=v.listing.panchayat if v.listing else None,
        exact_latitude=v.listing.latitude if v.listing else None,
        exact_longitude=v.listing.longitude if v.listing else None,
        buyer_name=v.buyer.full_name if v.buyer else None,
        buyer_phone=v.buyer.phone if v.buyer else None,
        seller_name=v.seller.full_name if v.seller else None,
        seller_phone=v.seller.phone if v.seller else None
    )
