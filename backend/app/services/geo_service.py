import math
from typing import Tuple, Optional

# Earth's mean radius in kilometers
EARTH_RADIUS_KM = 6371.0

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great-circle distance between two points on the Earth 
    using the Haversine formula.
    """
    try:
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)

        a = (math.sin(delta_phi / 2.0) ** 2 +
             math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

        distance = EARTH_RADIUS_KM * c
        return round(distance, 2)
    except Exception:
        return 99999.0

def get_bounding_box(latitude: float, longitude: float, radius_km: float) -> Tuple[float, float, float, float]:
    """
    Calculates a bounding box (min_lat, max_lat, min_lon, max_lon) around a 
    given coordinate for efficient SQL spatial filtering.
    """
    lat_delta = radius_km / 111.0  # Approx 111 km per degree latitude
    # Longitude delta depends on latitude
    lon_delta = radius_km / (111.0 * math.cos(math.radians(latitude)) + 1e-7)
    
    min_lat = latitude - lat_delta
    max_lat = latitude + lat_delta
    min_lon = longitude - abs(lon_delta)
    max_lon = longitude + abs(lon_delta)
    
    return (min_lat, max_lat, min_lon, max_lon)
