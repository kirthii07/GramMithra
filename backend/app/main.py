import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.services.seed_data import seed_database_with_demo_and_benchmarks

from app.api.auth import router as auth_router
from app.api.listings import router as listings_router
from app.api.price_estimator import router as price_router
from app.api.visits import router as visits_router
from app.api.favorites import router as favorites_router
from app.api.notifications import router as notifications_router
from app.api.moderation import router as moderation_router
from app.api.panchayats import router as panchayats_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    Base.metadata.create_all(bind=engine)
    
    # Seed data on startup if configured
    if settings.SEED_DEMO_DATA:
        db = SessionLocal()
        try:
            seed_database_with_demo_and_benchmarks(db)
        finally:
            db.close()
            
    yield

app = FastAPI(
    title="Gram Mitra — Smart Panchayat Livestock Marketplace",
    version=settings.VERSION,
    description="Gram Mitra is India's premium panchayat-level livestock marketplace. AI-powered pricing, GPS discovery, voice listing, verified sellers.",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads static folder
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(listings_router, prefix=settings.API_V1_STR)
app.include_router(price_router, prefix=settings.API_V1_STR)
app.include_router(visits_router, prefix=settings.API_V1_STR)
app.include_router(favorites_router, prefix=settings.API_V1_STR)
app.include_router(notifications_router, prefix=settings.API_V1_STR)
app.include_router(moderation_router, prefix=settings.API_V1_STR)
app.include_router(panchayats_router, prefix=settings.API_V1_STR)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "mode": "production-ready"
    }

@app.get("/")
def root():
    return {
        "message": "Gram Mitra API is active. Access docs at /docs",
        "documentation_url": "/docs"
    }
