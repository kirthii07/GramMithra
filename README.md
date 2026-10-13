# 🌿 Gram Mitra — Smart Panchayat Livestock Marketplace | கிராம மித்ரா

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com)
[![PostGIS](https://img.shields.io/badge/PostGIS-16--3.4-336791.svg?logo=postgresql)](https://postgis.net)

> **Gram Mitra (கிராம மித்ரா)** is a complete, production-ready, full-stack livestock marketplace designed for Indian farmers and rural panchayat communities. It connects cattle, buffalo, goat, sheep, and poultry farmers directly with verified buyers, eliminating exploitative middlemen through **attributable fair-price benchmarks**, **GPS radius discovery**, **Tamil-friendly voice assistance**, and **Gram Panchayat representative onboarding**.

---

## 🌟 Key Innovations & Workflows

### 1. 🎙️ Tamil-Friendly Voice-Assisted Listing (குரல் வழி பதிவு)
- Powered by the browser **Web Speech API** (`ta-IN` Tamil and `en-IN` Indian English) with audio wave recording fallback.
- **Natural Language Parsing**: Automatically extracts animal type (மாடு, எருமை, ஆடு, கோழி), breed (காங்கேயம், முர்ரா, தலைச்சேரி), age, daily milk yield (லிட்டர் பால்), and asking price directly from spoken audio.
- Audio synthesis verbal feedback confirms extracted fields to rural sellers.

### 2. 🏛️ Consent-Based Assisted Farmer Registration (உதவிப் பதிவு)
- Enables authorized **Panchayat Representatives (ஊராட்சி பிரதிநிதிகள்)** and Sahayaks to onboard elderly, non-smartphone, or digitally constrained farmers.
- Records structured consent declarations (Digital declaration in Gram Sabha presence, Voice declaration, or Written roster signature) with witness verification.
- Instantly generates verified seller accounts for rural farmers without requiring personal smartphone ownership.

### 3. 📊 Attributable Fair-Price Estimator
- Fully transparent, explainable livestock benchmark engine using official research data from **TANUVAS** (Tamil Nadu Veterinary and Animal Sciences University), **NDDB** (National Dairy Development Board), and **ICAR**.
- Generates line-item price factor breakdowns (Base Breed Value + Daily Milk Yield Premium + Lactation Parity Multiplier + Age Depreciation Curve + Confirmed Pregnancy Bonus + Full Vaccination Certificate Premium).

### 4. 🛡️ Explainable Suspicious-Listing & Quality Analyzer
- Automated rule-based AI scanner that flags:
  - **Suspicious Low-Price Alert** (>60% below regional benchmark; warns buyers against advance-token fraud or undisclosed disease).
  - **Missing Vaccination Records** (flags risk of Foot-and-Mouth Disease / FMD).
  - **Missing Photo / Limited Photo Warnings**.
  - **Missing Milk Output on Milking Stock**.
  - **Unverified Community Seller Notice**.
- Generates an explainable 0–100 **Quality Score** with bilingual advisories.

### 5. 📍 GPS Radar & Gram Panchayat Discovery
- **Leaflet + OpenStreetMap** interactive radar with configurable radius filters (**5 km, 15 km, 25 km, 50 km, 100 km**).
- Hierarchical Tamil Nadu district & Gram Panchayat catalog (Tiruppur, Erode, Coimbatore, Salem, Madurai, Thanjavur, Dindigul).
- **Privacy Protection**: Masks exact farm GPS pins to approximate ~1.5 km village centers until a physical farm visit request is accepted by the farmer.

### 6. 📅 On-Farm Milking Visit Scheduling
- Buyers schedule on-farm inspection appointments with morning (08:00–11:00 AM) or evening (04:30–06:30 PM) slots to personally observe live milking tests.
- Upon farmer acceptance, precise GPS navigation pins and direct unmasked contact channels are unlocked.

### 7. 🏷️ Strict Isolation of Synthetic Demo Data
- Synthetic demonstration listings are strictly flagged with `is_demo=true`, prominent `DEMO DATA / மாதிரி தரவு` badges, and a dedicated toggle to filter them from real transactions.

---

## 🏗️ Architecture & Technology Stack

```
pashusetu/
├── backend/
│   ├── app/
│   │   ├── api/             # REST Endpoints (auth, listings, price, visits, moderation, panchayats)
│   │   ├── core/            # Config, security (Bcrypt + PyJWT), Database
│   │   ├── models/          # SQLAlchemy relational models
│   │   ├── schemas/         # Pydantic v2 validation models
│   │   ├── services/        # Geo Haversine, Attributable Price Engine, Quality Analyzer, Seeder
│   │   └── main.py          # FastAPI application entrypoint
│   ├── alembic/             # Database migrations
│   ├── tests/               # Pytest automated test suite (100% pass)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # LeafletMap, ListingCard, VoiceModal, EstimatorModal, VisitModal, Badges
│   │   ├── pages/           # Home, Browse, Detail, CreateListing, Visits, Moderation, Profile, Login
│   │   ├── context/         # AuthContext, LanguageContext (Tamil + English)
│   │   ├── locales/         # en.ts & ta.ts bilingual dictionaries
│   │   ├── services/        # Typed API client
│   │   └── types/           # TypeScript interfaces
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml       # Full-stack orchestrator with PostGIS 16
├── render.yaml              # Render deployment configuration
├── vercel.json              # Vercel deployment configuration
├── .env.example
└── README.md
```

---

## ⚡ Quick Start Guide (Local Development)

### Prerequisites
- Python 3.12+
- Node.js 20+ & npm

### Step 1: Run Backend
```bash
# 1. Navigate to backend
cd backend

# 2. Activate virtual environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1
# On Linux/macOS: source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run database migrations
alembic upgrade head

# 5. Start FastAPI development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be live at: **http://localhost:8000/docs**

### Step 2: Run Frontend
```bash
# In a new terminal:
cd frontend

# Install packages
npm install

# Start Vite dev server
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## 🐳 Docker Compose Deployment (PostgreSQL + PostGIS)

To launch the complete production stack including **PostGIS 16** with a single command:
```bash
docker compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/docs`
- PostGIS Database: `localhost:5432`

---

## 🧪 Automated Test Suite

PashuSetu includes an automated test suite verifying:
- JWT Authentication & RBAC permissions
- Consent-based assisted farmer registration
- Attributable indicative price calculation algorithms
- Haversine great-circle distance formulas
- Suspicious price outlier & missing information detection
- Farm visit scheduling & notification flows

Run tests with:
```bash
cd backend
.\venv\Scripts\pytest .\tests -v
```
All 8 test suites pass with zero failures.

---

## 🔑 Demo Evaluation Accounts (1-Click Switcher Available in UI)

For testing and judge evaluation, PashuSetu includes a **1-Click Demo Switcher** in the navbar:

| Role | Name | Phone / Login | Password | Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Seller** | Selvam Periasamy | `9876500003` | `Farmer@123` | Create listings, accept visits, manage cattle |
| **Panchayat Rep** | Murugesan V | `9876500002` | `Panchayat@123` | Assisted farmer onboarding, approve local listings |
| **Admin** | Dr. Sundaram | `9876500001` | `Admin@123` | Full moderation queue, audit logs, verify users |
| **Buyer** | Kavitha Rajesh | `9876500004` | `Buyer@123` | Search, schedule visits, contact farmers, favorites |

---

## 🚀 Cloud Deployment

### Deploy to Render
1. Connect your repository to Render.
2. Select **Blueprint** and point to `render.yaml`.
3. Render automatically provisions the PostGIS 16 instance, runs Alembic migrations, and deploys the FastAPI backend and static frontend.

### Deploy to Vercel
1. Import repository on [Vercel](https://vercel.com).
2. Root directory: `./`
3. Vercel reads `vercel.json` and builds the React + Vite frontend with automatic API routing to the backend service.

---

## 📜 Compliance & Attribution
- All benchmark data cited from **TANUVAS** (Tamil Nadu Veterinary and Animal Sciences University) Kongu livestock surveys, **NDDB** dairy cattle guidelines, and **ICAR** indigenous cattle registries.
- Never fabricates real listings or fake price claims.
- Synthetic demo records are strictly tagged with `is_demo=true` and explicit visual badges.
