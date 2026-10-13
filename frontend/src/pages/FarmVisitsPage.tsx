import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { FarmVisit } from '../types';
import { LeafletMap } from '../components/LeafletMap';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  User,
  ArrowRight,
  Navigation
} from 'lucide-react';

interface FarmVisitsPageProps {
  onNavigateToListing: (listingId: number) => void;
}

export const FarmVisitsPage: React.FC<FarmVisitsPageProps> = ({ onNavigateToListing }) => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();

  const [visits, setVisits] = useState<FarmVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisitForMap, setSelectedVisitForMap] = useState<FarmVisit | null>(null);

  useEffect(() => {
    fetchVisits();
  }, [user]);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const items = await api.getVisits();
      setVisits(items);
      const acceptedWithCoords = items.find(v => v.status === 'accepted' && v.exact_latitude && v.exact_longitude);
      if (acceptedWithCoords) {
        setSelectedVisitForMap(acceptedWithCoords);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (visitId: number, newStatus: string) => {
    try {
      await api.updateVisitStatus(visitId, newStatus);
      fetchVisits();
    } catch (err: any) {
      alert(err.message || 'Failed to update visit status');
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Please Login to View Farm Visits</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
          {lang === 'ta' ? 'பண்ணை பார்வைகள் & நேரடி பரிசோதனை' : 'Farm Visit Appointments'}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {lang === 'ta'
            ? 'வாங்குபவர் மற்றும் விற்பனையாளர் இடையேயான நேரடி சந்திப்பு மற்றும் கறவை பரிசோதனை அட்டவணை'
            : 'Track inspection dates, morning/evening milking slots, and unlocked farm directions'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Visit Cards List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(n => <div key={n} className="h-40 rounded-2xl bg-sand-200 animate-pulse" />)}
            </div>
          ) : visits.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-earth-200 space-y-3">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-900 text-base">No Farm Visits Scheduled</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {lang === 'ta'
                  ? 'கால்நடை விபரப் பக்கத்திற்குச் சென்று "நேரடி பண்ணை பார்வை" பட்டனை அழுத்தி முன்பதிவு செய்யவும்.'
                  : 'Browse livestock listings and request an on-farm milking inspection.'}
              </p>
            </div>
          ) : (
            visits.map((visit) => {
              const isSeller = visit.seller_id === user.id;
              const isAccepted = visit.status === 'accepted';
              const isDeclined = visit.status === 'declined';
              const isPending = visit.status === 'requested';

              return (
                <div
                  key={visit.id}
                  className={`bg-white rounded-3xl border p-5 sm:p-6 shadow-sm space-y-4 transition ${
                    isAccepted ? 'border-emerald-300' : isDeclined ? 'border-rose-200 opacity-80' : 'border-earth-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        isAccepted ? 'bg-emerald-100 text-emerald-800' :
                        isDeclined ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {visit.status}
                      </span>
                      <h3
                        onClick={() => onNavigateToListing(visit.listing_id)}
                        className="font-extrabold text-slate-900 hover:text-primary-700 cursor-pointer text-base mt-2 line-clamp-1"
                      >
                        {visit.listing_title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{visit.listing_panchayat}, {visit.listing_district}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900">{visit.proposed_date}</div>
                      <div className="text-[11px] text-slate-500 max-w-[160px] truncate">{visit.time_slot}</div>
                    </div>
                  </div>

                  {/* Notes */}
                  {visit.buyer_notes && (
                    <div className="p-3 bg-sand-50 rounded-xl border border-sand-200 text-xs text-slate-700">
                      <span className="font-bold block mb-0.5">Buyer Notes:</span>
                      <p>{visit.buyer_notes}</p>
                    </div>
                  )}

                  {/* Contact detail unlocked on acceptance */}
                  {isAccepted && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>
                          {isSeller ? `Buyer: ${visit.buyer_name} (${visit.buyer_phone})` : `Seller: ${visit.seller_name} (${visit.seller_phone})`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isSeller ? (
                          <a href={`tel:${visit.buyer_phone}`} className="px-3 py-1 bg-emerald-700 text-white rounded-lg font-bold text-[11px]">
                            Call Buyer
                          </a>
                        ) : (
                          <a href={`tel:${visit.seller_phone}`} className="px-3 py-1 bg-emerald-700 text-white rounded-lg font-bold text-[11px]">
                            Call Farmer
                          </a>
                        )}
                        {visit.exact_latitude && visit.exact_longitude && (
                          <button
                            onClick={() => setSelectedVisitForMap(visit)}
                            className="px-3 py-1 bg-primary-800 text-white rounded-lg font-bold text-[11px] flex items-center gap-1"
                          >
                            <Navigation className="w-3 h-3" />
                            <span>Show GPS Pin</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Seller Action Buttons */}
                  {isSeller && isPending && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-earth-100">
                      <button
                        onClick={() => handleUpdateStatus(visit.id, 'declined')}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(visit.id, 'accepted')}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow"
                      >
                        Accept Visit & Unlock GPS
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Directions & Map Preview (5 Cols) */}
        <div className="lg:col-span-5 sticky top-28 bg-white p-5 rounded-3xl border border-earth-300 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-earth-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Navigation className="w-4 h-4 text-primary-700" />
              <span>{lang === 'ta' ? 'உறுதி செய்யப்பட்ட பண்ணை வரைபடம்' : 'Confirmed Inspection Map'}</span>
            </div>
            {selectedVisitForMap && (
              <span className="text-[11px] text-emerald-700 font-semibold truncate max-w-[150px]">
                {selectedVisitForMap.listing_title}
              </span>
            )}
          </div>

          {selectedVisitForMap && selectedVisitForMap.exact_latitude && selectedVisitForMap.exact_longitude ? (
            <div className="space-y-3">
              <LeafletMap
                center={[selectedVisitForMap.exact_latitude, selectedVisitForMap.exact_longitude]}
                listings={[{
                  id: selectedVisitForMap.listing_id,
                  title: selectedVisitForMap.listing_title || 'Farm',
                  livestock_type: 'cow',
                  breed: 'Livestock',
                  price: 0,
                  is_negotiable: true,
                  milk_yield_liters: 0,
                  lactation_number: 0,
                  pregnancy_status: '',
                  weight_kg: 0,
                  vaccination_status: '',
                  photos: selectedVisitForMap.listing_photos || [],
                  documents: [],
                  state: 'Tamil Nadu',
                  district: selectedVisitForMap.listing_district || '',
                  panchayat: selectedVisitForMap.listing_panchayat || '',
                  latitude: selectedVisitForMap.exact_latitude,
                  longitude: selectedVisitForMap.exact_longitude,
                  hide_exact_location: false,
                  is_demo: false,
                  status: 'available',
                  quality_score: 100,
                  flag_reasons: [],
                  views_count: 0,
                  created_at: '',
                  updated_at: '',
                  age_months: 36,
                  gender: 'female',
                  seller_id: selectedVisitForMap.seller_id
                }]}
                className="h-80 w-full"
              />
              <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-950 border border-emerald-200">
                <strong>Unlocked Coordinates:</strong> {selectedVisitForMap.exact_latitude}, {selectedVisitForMap.exact_longitude}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-xs text-slate-400 space-y-2">
              <MapPin className="w-8 h-8 mx-auto text-slate-300" />
              <p>Accept an appointment or select an accepted visit to view unlocked farm coordinates.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
