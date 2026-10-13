import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Listing } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface LeafletMapProps {
  center: [number, number]; // [lat, lon]
  radiusKm?: number;
  listings?: Listing[];
  selectedListingId?: number;
  onListingSelect?: (listing: Listing) => void;
  onLocationPick?: (lat: number, lon: number) => void;
  isPickerMode?: boolean;
  className?: string;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  center,
  radiusKm,
  listings = [],
  selectedListingId,
  onListingSelect,
  onLocationPick,
  isPickerMode = false,
  className = 'h-96 w-full'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);
  const { lang, t } = useLanguage();

  // Custom marker icon factory
  const createAnimalIcon = (isSelected: boolean, isDemo: boolean) => {
    const bgColor = isDemo ? '#d97706' : isSelected ? '#059669' : '#047857';
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="
          background-color: ${bgColor};
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          transform: translate(-50%, -50%);
          cursor: pointer;
        ">
          🐄
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });
  };

  const createCenterIcon = () => {
    return L.divIcon({
      className: 'center-leaflet-marker',
      html: `
        <div style="
          background-color: #2563eb;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 0 0 4px rgba(37,99,235,0.35);
          transform: translate(-50%, -50%);
        "></div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: 10,
        scrollWheelZoom: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | Gram Mitra'
      }).addTo(map);

      markerGroupRef.current = L.layerGroup().addTo(map);

      map.on('click', (e: L.LeafletMouseEvent) => {
        if (onLocationPick) {
          onLocationPick(e.latlng.lat, e.latlng.lng);
        }
      });

      mapInstanceRef.current = map;
    }

    return () => {
      // Map cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map view & markers on center/radius/listings change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.setView(center, map.getZoom());

    // Update Radius Circle
    if (radiusKm && radiusKm > 0) {
      if (circleRef.current) {
        circleRef.current.setLatLng(center);
        circleRef.current.setRadius(radiusKm * 1000);
      } else {
        circleRef.current = L.circle(center, {
          radius: radiusKm * 1000,
          color: '#10b981',
          weight: 2,
          fillColor: '#10b981',
          fillOpacity: 0.12
        }).addTo(map);
      }
    } else if (circleRef.current) {
      circleRef.current.remove();
      circleRef.current = null;
    }

    // Picker Marker
    if (isPickerMode) {
      if (!pickerMarkerRef.current) {
        pickerMarkerRef.current = L.marker(center, { icon: createCenterIcon(), draggable: true }).addTo(map);
        pickerMarkerRef.current.on('dragend', (e) => {
          const latlng = (e.target as L.Marker).getLatLng();
          if (onLocationPick) {
            onLocationPick(latlng.lat, latlng.lng);
          }
        });
      } else {
        pickerMarkerRef.current.setLatLng(center);
      }
    } else if (pickerMarkerRef.current) {
      pickerMarkerRef.current.remove();
      pickerMarkerRef.current = null;
    }

    // Render Listings Markers
    if (markerGroupRef.current) {
      markerGroupRef.current.clearLayers();

      // Add center marker if not in picker mode
      if (!isPickerMode) {
        L.marker(center, { icon: createCenterIcon() })
          .bindTooltip(lang === 'ta' ? 'உங்கள் தேடல் மையம்' : 'Search Center', { permanent: false })
          .addTo(markerGroupRef.current);
      }

      listings.forEach((listing) => {
        const isSelected = listing.id === selectedListingId;
        const marker = L.marker([listing.latitude, listing.longitude], {
          icon: createAnimalIcon(isSelected, listing.is_demo)
        });

        const popupHtml = document.createElement('div');
        popupHtml.className = 'p-1 text-slate-900 max-w-[200px]';
        popupHtml.innerHTML = `
          ${listing.photos && listing.photos[0] ? `<img src="${listing.photos[0]}" style="width:100%; height:90px; object-fit:cover; border-radius:6px; margin-bottom:6px;" alt="${listing.breed}" />` : ''}
          <div style="font-weight:700; font-size:13px; line-height:1.2;">${lang === 'ta' && listing.title_ta ? listing.title_ta : listing.title}</div>
          <div style="font-size:11px; color:#475569; margin-top:2px;">📍 ${listing.panchayat}, ${listing.district}</div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
            <span style="font-weight:800; color:#047857; font-size:14px;">₹${listing.price.toLocaleString('en-IN')}</span>
            ${listing.distance_km ? `<span style="font-size:11px; color:#64748b;">${listing.distance_km} km</span>` : ''}
          </div>
          <button id="view-listing-${listing.id}" style="
            width:100%;
            margin-top:6px;
            padding:5px;
            background-color:#047857;
            color:white;
            border:none;
            border-radius:4px;
            font-size:11px;
            font-weight:600;
            cursor:pointer;
          ">
            ${lang === 'ta' ? 'விபரங்களைப் பார்' : 'View Details'}
          </button>
        `;

        const viewBtn = popupHtml.querySelector(`#view-listing-${listing.id}`);
        if (viewBtn) {
          viewBtn.addEventListener('click', () => {
            if (onListingSelect) onListingSelect(listing);
          });
        }

        marker.bindPopup(popupHtml);
        marker.addTo(markerGroupRef.current!);
      });
    }
  }, [center, radiusKm, listings, selectedListingId, isPickerMode, lang]);

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-earth-300 shadow-sm ${className}`}>
      <div ref={mapContainerRef} className="h-full w-full" />
      {isPickerMode && (
        <div className="absolute top-3 left-12 z-[1000] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-300 shadow text-xs font-semibold text-slate-700">
          {lang === 'ta' ? 'வரைபடத்தில் கிளிக் செய்து இடத்தை மாற்றலாம்' : 'Click map or drag blue pin to set location'}
        </div>
      )}
    </div>
  );
};
