from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Listing, User, AuditLog, FarmVisit, AssistedRegistration, Notification
from app.schemas.schemas import ListingOut, ModerationAction, ModerationStats
from app.api.deps import require_roles

router = APIRouter(prefix="/moderation", tags=["Panchayat Representative & Admin Moderation"])

@router.get("/stats", response_model=ModerationStats)
def get_moderation_stats(
    current_user: User = Depends(require_roles(["panchayat_rep", "admin"])),
    db: Session = Depends(get_db)
):
    total_listings = db.query(Listing).count()
    pending_review = db.query(Listing).filter(Listing.status == "under_review").count()
    
    # Listings with flags or quality score < 75
    flagged_listings = db.query(Listing).filter(
        (Listing.quality_score < 75.0) | (Listing.status == "under_review")
    ).count()
    
    active_sellers = db.query(User).filter(User.role == "seller").count()
    verified_panchayat_reps = db.query(User).filter(User.role == "panchayat_rep", User.is_verified == True).count()
    assisted_count = db.query(AssistedRegistration).count()
    
    return ModerationStats(
        total_listings=total_listings,
        pending_review=pending_review,
        flagged_listings=flagged_listings,
        active_sellers=active_sellers,
        verified_panchayat_reps=verified_panchayat_reps,
        assisted_registrations_count=assisted_count
    )

@router.get("/queue", response_model=List[ListingOut])
def get_moderation_queue(
    current_user: User = Depends(require_roles(["panchayat_rep", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Returns listings requiring Panchayat or Admin attention (flagged, low quality score, or under review)
    """
    listings = db.query(Listing).filter(
        (Listing.status.in_(["under_review", "available"])) &
        ((Listing.quality_score < 80.0) | (Listing.flag_reasons_json != "[]"))
    ).order_by(Listing.quality_score.asc(), Listing.created_at.desc()).limit(100).all()
    
    return [ListingOut.model_validate(l) for l in listings]

@router.post("/listings/{id}/action")
def take_moderation_action(
    id: int,
    action_in: ModerationAction,
    current_user: User = Depends(require_roles(["panchayat_rep", "admin"])),
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.id == id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    act = action_in.action.lower()
    reason = action_in.reason or "Standard moderation review"
    
    if act == "approve":
        listing.status = "available"
        listing.quality_score = max(85.0, listing.quality_score + 20.0)
        # Endorse seller
        if listing.seller:
            listing.seller.is_verified = True
            
        notif = Notification(
            user_id=listing.seller_id,
            title="Listing Approved & Endorsed",
            title_ta="உங்கள் பதிவு அங்கீகரிக்கப்பட்டது",
            message=f"Panchayat Representative {current_user.full_name} has verified and approved your listing '{listing.title}'.",
            message_ta=f"ஊராட்சி பிரதிநிதி {current_user.full_name} உங்கள் '{listing.title_ta or listing.title}' பதிவை சரிபார்த்து அங்கீகரித்துள்ளார்.",
            notification_type="listing_approved",
            reference_id=listing.id
        )
        db.add(notif)
        
    elif act == "reject":
        listing.status = "rejected"
        notif = Notification(
            user_id=listing.seller_id,
            title="Listing Rejected",
            title_ta="பதிவு நிராகரிக்கப்பட்டது",
            message=f"Your listing '{listing.title}' was rejected by moderation: {reason}",
            message_ta=f"உங்கள் பதிவு நிராகரிக்கப்பட்டது: {reason}",
            notification_type="listing_flagged",
            reference_id=listing.id
        )
        db.add(notif)
        
    elif act == "flag":
        listing.status = "under_review"
        existing = listing.flag_reasons
        existing.append({
            "code": "MODERATOR_FLAGGED",
            "severity": "high",
            "title_en": "Flagged by Moderation",
            "title_ta": "நிர்வாக எச்சரிக்கை",
            "detail_en": f"Moderator note: {reason}",
            "detail_ta": f"நிர்வாகக் குறிப்பு: {reason}"
        })
        listing.flag_reasons = existing
        listing.quality_score = max(10.0, listing.quality_score - 25.0)

    # Log to audit trail
    audit = AuditLog(
        user_id=current_user.id,
        action=f"MODERATION_{act.upper()}",
        entity_type="listing",
        entity_id=listing.id,
        details=f"Moderator {current_user.full_name} executed {act} with reason: {reason}"
    )
    db.add(audit)
    db.commit()
    db.refresh(listing)

    return {"message": f"Action '{act}' executed successfully", "status": listing.status}

@router.get("/audit-logs")
def get_audit_logs(
    current_user: User = Depends(require_roles(["admin"])),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    results = []
    for log in logs:
        user_name = "System"
        user_role = "system"
        if log.user_id:
            u = db.query(User).filter(User.id == log.user_id).first()
            if u:
                user_name = u.full_name
                user_role = u.role
        results.append({
            "id": log.id,
            "user_id": log.user_id,
            "user_name": user_name,
            "user_role": user_role,
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "details": log.details,
            "created_at": log.created_at
        })
    return results

@router.post("/users/{id}/verify")
def verify_user_kyc(
    id: int,
    current_user: User = Depends(require_roles(["admin", "panchayat_rep"])),
    db: Session = Depends(get_db)
):
    target = db.query(User).filter(User.id == id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
        
    target.is_verified = True
    audit = AuditLog(
        user_id=current_user.id,
        action="VERIFY_USER_KYC",
        entity_type="user",
        entity_id=target.id,
        details=f"User {target.full_name} verified by {current_user.full_name}"
    )
    db.add(audit)
    db.commit()
    
    return {"message": f"User {target.full_name} verified successfully", "is_verified": True}
