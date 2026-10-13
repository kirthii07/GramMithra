import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "PashuSetu — Smart Livestock Hub"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Secret Key for JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "pashusetu-super-secret-jwt-key-2026-production-ready")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./pashusetu.db")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "https://*.vercel.app",
        "https://*.onrender.com",
        "*"
    ]
    
    # File Uploads
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
    
    # Synthetic Demo Mode
    SEED_DEMO_DATA: bool = True
    
    model_config = {
        "case_sensitive": True,
        "env_file": ".env"
    }

settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
