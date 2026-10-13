from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.models import User, AssistedRegistration, AuditLog, Notification
from app.schemas.schemas import UserRegister, UserLogin, UserOut, Token, AssistedUserRegister
from app.api.deps import get_current_user, require_roles

router = APIRouter(prefix="/auth", tags=["Authentication & Assisted Registration"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check phone duplicate
    if db.query(User).filter(User.phone == user_in.phone).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this mobile number is already registered"
        )
    
    # Check email duplicate if provided
    if user_in.email and db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address is already registered"
        )
        
    new_user = User(
        full_name=user_in.full_name,
        email=user_in.email,
        phone=user_in.phone,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role if user_in.role in ["buyer", "seller", "panchayat_rep", "admin"] else "buyer",
        panchayat_id_number=user_in.panchayat_id_number,
        village=user_in.village,
        panchayat=user_in.panchayat,
        taluk=user_in.taluk,
        district=user_in.district,
        state=user_in.state or "Tamil Nadu",
        latitude=user_in.latitude,
        longitude=user_in.longitude,
        is_verified=True if user_in.role == "buyer" else False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Log registration
    audit = AuditLog(
        user_id=new_user.id,
        action="USER_REGISTRATION",
        entity_type="user",
        entity_id=new_user.id,
        details=f"New user registered with role {new_user.role}"
    )
    db.add(audit)
    db.commit()
    
    token = create_access_token(subject=new_user.id)
    return Token(access_token=token, token_type="bearer", user=UserOut.model_validate(new_user))

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    # Authenticate by phone or email
    user = db.query(User).filter(
        (User.phone == login_in.phone_or_email) | (User.email == login_in.phone_or_email)
    ).first()
    
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please check your phone/email and password."
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated. Contact support."
        )
        
    token = create_access_token(subject=user.id)
    return Token(access_token=token, token_type="bearer", user=UserOut.model_validate(user))

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)

@router.post("/assisted-register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def assisted_register(
    data: AssistedUserRegister,
    current_user: User = Depends(require_roles(["panchayat_rep", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Assisted Registration Workflow:
    Enables authorized Panchayat Representatives and Admins to register rural, 
    elderly, or digitally constrained farmers with explicit informed consent.
    """
    # Check if farmer phone is already registered
    existing_user = db.query(User).filter(User.phone == data.farmer_phone).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A farmer account with this mobile number already exists."
        )
        
    farmer_user = User(
        full_name=data.farmer_name,
        email=None,
        phone=data.farmer_phone,
        hashed_password=get_password_hash(data.default_password or "Farmer@123"),
        role="seller",
        village=data.village,
        panchayat=data.panchayat,
        taluk=data.taluk,
        district=data.district,
        state=data.state or "Tamil Nadu",
        latitude=data.latitude or current_user.latitude,
        longitude=data.longitude or current_user.longitude,
        is_verified=True  # Representative direct verification!
    )
    db.add(farmer_user)
    db.commit()
    db.refresh(farmer_user)
    
    # Create Assisted Registration Consent Record
    asst_record = AssistedRegistration(
        representative_id=current_user.id,
        farmer_user_id=farmer_user.id,
        consent_type=data.consent_type,
        consent_statement=data.consent_statement,
        witness_name=data.witness_name,
        witness_phone=data.witness_phone,
        proof_image_url=data.proof_image_url
    )
    db.add(asst_record)
    
    # Audit trail
    audit = AuditLog(
        user_id=current_user.id,
        action="ASSISTED_REGISTRATION",
        entity_type="user",
        entity_id=farmer_user.id,
        details=f"Panchayat Rep {current_user.full_name} registered farmer {farmer_user.full_name} via {data.consent_type} consent."
    )
    db.add(audit)
    
    # Welcome notification
    notif = Notification(
        user_id=farmer_user.id,
        title="Welcome to PashuSetu",
        title_ta="பசுசேதுவிற்கு நல்வரவு",
        message=f"You have been successfully registered by Panchayat Representative {current_user.full_name}.",
        message_ta=f"ஊராட்சி பிரதிநிதி {current_user.full_name} மூலமாக உங்கள் கணக்கு பதிவு செய்யப்பட்டுள்ளது.",
        notification_type="assisted_registration",
        reference_id=current_user.id
    )
    db.add(notif)
    db.commit()
    
    return UserOut.model_validate(farmer_user)

@router.get("/assisted-farmers")
def get_my_assisted_farmers(
    current_user: User = Depends(require_roles(["panchayat_rep", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Returns list of farmers onboarded by this representative
    """
    records = db.query(AssistedRegistration).filter(
        AssistedRegistration.representative_id == current_user.id
    ).all()
    
    results = []
    for r in records:
        f = r.farmer
        if f:
            results.append({
                "id": f.id,
                "full_name": f.full_name,
                "phone": f.phone,
                "panchayat": f.panchayat,
                "village": f.village,
                "consent_type": r.consent_type,
                "consent_statement": r.consent_statement,
                "witness_name": r.witness_name,
                "registered_at": r.created_at,
                "listings_count": len(f.listings)
            })
    return results
