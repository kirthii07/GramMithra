from fastapi import APIRouter
from typing import Dict, List, Any

router = APIRouter(prefix="/panchayats", tags=["Panchayats & Locations"])

# Hierarchical directory of key livestock-trading districts and gram panchayats in Tamil Nadu
PANCHAYAT_DIRECTORY: Dict[str, Dict[str, Any]] = {
    "Tiruppur": {
        "taluks": ["Kangeyam", "Dharapuram", "Udumalaipettai", "Avinashi", "Palladam"],
        "panchayats": [
            {"name": "Pappini", "taluk": "Kangeyam", "lat": 11.0042, "lon": 77.5612},
            {"name": "Nathakadaiyur", "taluk": "Kangeyam", "lat": 11.0822, "lon": 77.6251},
            {"name": "Vellakovil", "taluk": "Kangeyam", "lat": 10.9320, "lon": 77.7120},
            {"name": "Kundadam", "taluk": "Dharapuram", "lat": 10.7812, "lon": 77.5310},
            {"name": "Alangiyam", "taluk": "Dharapuram", "lat": 10.7245, "lon": 77.5890},
            {"name": "Madathukulam", "taluk": "Udumalaipettai", "lat": 10.5830, "lon": 77.3820},
            {"name": "Pongalur", "taluk": "Palladam", "lat": 10.9912, "lon": 77.3712}
        ]
    },
    "Erode": {
        "taluks": ["Perundurai", "Gobichettipalayam", "Bhavani", "Sathyamangalam", "Modakkurichi"],
        "panchayats": [
            {"name": "Vijayamangalam", "taluk": "Perundurai", "lat": 11.2333, "lon": 77.5000},
            {"name": "Chennimalai", "taluk": "Perundurai", "lat": 11.1645, "lon": 77.6120},
            {"name": "Kavindapadi", "taluk": "Bhavani", "lat": 11.4320, "lon": 77.5510},
            {"name": "Nambiyur", "taluk": "Gobichettipalayam", "lat": 11.3610, "lon": 77.3210},
            {"name": "Bhavanisagar", "taluk": "Sathyamangalam", "lat": 11.4820, "lon": 77.1510}
        ]
    },
    "Coimbatore": {
        "taluks": ["Pollachi", "Sulur", "Kinathukadavu", "Mettupalayam", "Annur"],
        "panchayats": [
            {"name": "Anaimalai", "taluk": "Pollachi", "lat": 10.6609, "lon": 76.9934},
            {"name": "Sulur", "taluk": "Sulur", "lat": 11.0264, "lon": 77.1278},
            {"name": "Kinathukadavu", "taluk": "Kinathukadavu", "lat": 10.8210, "lon": 77.0210},
            {"name": "Annur", "taluk": "Annur", "lat": 11.2310, "lon": 77.1820},
            {"name": "Sirumugai", "taluk": "Mettupalayam", "lat": 11.3210, "lon": 77.0010}
        ]
    },
    "Salem": {
        "taluks": ["Mettur", "Omalur", "Attur", "Sankari", "Edappadi"],
        "panchayats": [
            {"name": "Mecheri", "taluk": "Mettur", "lat": 11.8312, "lon": 77.9389},
            {"name": "Nangavalli", "taluk": "Mettur", "lat": 11.7510, "lon": 77.8820},
            {"name": "Konganapuram", "taluk": "Edappadi", "lat": 11.5820, "lon": 77.9120},
            {"name": "Sankari", "taluk": "Sankari", "lat": 11.4810, "lon": 77.8710},
            {"name": "Thalaivasal", "taluk": "Attur", "lat": 11.5810, "lon": 78.7610}
        ]
    },
    "Madurai": {
        "taluks": ["Usilampatti", "Melur", "Thirumangalam", "Vadipatti", "Peraiyur"],
        "panchayats": [
            {"name": "Sedapatti", "taluk": "Usilampatti", "lat": 9.8732, "lon": 77.7712},
            {"name": "Chellampatti", "taluk": "Usilampatti", "lat": 9.9610, "lon": 77.8920},
            {"name": "Kallikudi", "taluk": "Thirumangalam", "lat": 9.6810, "lon": 77.9510},
            {"name": "Alanganallur", "taluk": "Vadipatti", "lat": 10.0410, "lon": 78.0910},
            {"name": "Kottampatti", "taluk": "Melur", "lat": 10.2210, "lon": 78.4310}
        ]
    },
    "Dindigul": {
        "taluks": ["Palani", "Oddanchatram", "Natham", "Vedasandur", "Nilakottai"],
        "panchayats": [
            {"name": "Ayakudi", "taluk": "Palani", "lat": 10.4500, "lon": 77.5500},
            {"name": "Oddanchatram", "taluk": "Oddanchatram", "lat": 10.4810, "lon": 77.7510},
            {"name": "Gujiliamparai", "taluk": "Vedasandur", "lat": 10.6510, "lon": 78.1210},
            {"name": "Batlagundu", "taluk": "Nilakottai", "lat": 10.1610, "lon": 77.7610}
        ]
    },
    "Thanjavur": {
        "taluks": ["Pattukkottai", "Orathanadu", "Kumbakonam", "Peravurani", "Thiruvaiyaru"],
        "panchayats": [
            {"name": "Orathanadu", "taluk": "Orathanadu", "lat": 10.6310, "lon": 79.2510},
            {"name": "Madukkur", "taluk": "Pattukkottai", "lat": 10.4810, "lon": 79.4010},
            {"name": "Thiruvonam", "taluk": "Orathanadu", "lat": 10.5120, "lon": 79.1820},
            {"name": "Budalur", "taluk": "Thiruvaiyaru", "lat": 10.7910, "lon": 79.0210}
        ]
    }
}

@router.get("/districts")
def get_districts():
    return list(PANCHAYAT_DIRECTORY.keys())

@router.get("/directory")
def get_full_directory():
    return PANCHAYAT_DIRECTORY

@router.get("/{district}/panchayats")
def get_district_panchayats(district: str):
    dist_data = PANCHAYAT_DIRECTORY.get(district)
    if not dist_data:
        return []
    return dist_data.get("panchayats", [])
