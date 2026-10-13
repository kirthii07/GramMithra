from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Favorite, Listing, User
from app.schemas.schemas import ListingOut
from app.api.deps import get_current_user
from app.api.listings import get_listings

router = APIRouter(prefix="/favorites", tags=["Favorites / Saved Listings"])

@router.get("", response_model=List[ListingOut])
def get_user_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    favs = db.query(Favorite).filter(Favorite.user_id == current_user.id).all()
    listing_ids = [f.listing_id for f in favs]
    listings = db.query(Listing).filter(Listing.id.in_(listing_ids)).all()
    
    return [ListingOut.model_validate(item) for item in listings]

@router.get("/ids", response_model=List[int])
def get_favorite_ids(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    favs = db.query(Favorite.listing_id).filter(Favorite.user_id == current_user.id).all()
    return [f[0] for f in favs]

@router.post("/{listing_id}")
def toggle_favorite(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    fav = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.listing_id == listing_id
    ).first()
    
    if fav:
        db.delete(fav)
        db.commit()
        return {"favorited": False, "message": "Removed from favorites"}
    else:
        new_fav = Favorite(user_id=current_user.id, listing_id=listing_id)
        db.add(new_fav)
        db.commit()
        return {"favorited": True, "message": "Added to favorites"}
