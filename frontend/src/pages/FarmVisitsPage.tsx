import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { FarmVisit } from '../types';
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
  Navigation,
  ShieldCheck
} from 'lucide-react';

interface FarmVisitsPageProps {
  onNavigateToListing: (listingId: number) => void;
}

export const FarmVisitsPage: React.FC<FarmVisitsPageProps> = ({ onNavigateToListing }) => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();

  const [visits, setVisits] = useState<FarmVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisit, setSelectedVisit] = useState<FarmVisit | null>(null);

  useEffect(() => {
    fetchVisits();
  }, [user]);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const items = await api.getVisits();
      setVisits(items);
      if (items.length > 0) {
        setSelectedVisit(items[0]);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-sage-200 shadow-sm">
        <div>
          <div className="section-badge mb-2">
            <Calendar className="w-3.5 h-3.5 text-forest-800" />
            <span>{lang === 'ta' ? 'நேரடி பண்ணை பார்வை' : 'Physical Milking Tests'}</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-charcoal-800">
            {lang === 'ta' ? 'நேரடி பண்ணை பார்வைகள்' : 'On-Farm Milking Visits'}
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            {lang === 'ta'
              ? 'நேரில் சென்று பால் கறவை பார்த்து, கால்நடை உடல்நலனை சரிபார்த்து வாங்கும் வசதி'
              : 'Schedule on-farm inspection appointments to personally observe live milking and veterinary health'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-sage-100 text-forest-800 text-xs font-bold border border-sage-200">
            {visits.length} {visits.length === 1 ? 'Appointment' : 'Appointments'}
          </span>
        </div>
      </div>

      {/* Main Grid: Visits List + Inspection Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Visits List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="h-44 rounded-3xl bg-ivory-200 animate-pulse border border-sage-200" />
              ))}
            </div>
          ) : visits.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-sage-200 shadow-sm space-y-3">
              <div className="text-4xl">📅</div>
              <h3 className="font-display font-bold text-charcoal-800 text-base">
                {lang === 'ta' ? 'பார்வை பதிவுகள் எதுவும் இல்லை' : 'No Scheduled Farm Visits'}
              </h3>
              <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
                {lang === 'ta'
                  ? 'கால்நடை விவரப் பக்கத்தில் "பண்ணை பார்வை கோரிக்கை" பொத்தானை அழுத்தி முன்பதிவு செய்யவும்.'
                  : 'Open any livestock detail page and click "Request Farm Visit" to inspect live milking in person.'}
              </p>
            </div>
          ) : (
            visits.map((v) => {
              const isSeller = user?.role === 'seller' || user?.id === v.seller_id;
              const isAccepted = v.status === 'accepted';
              const isRequested = v.status === 'requested';

              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVisit(v)}
                  className={`bg-white p-5 rounded-3xl border transition cursor-pointer shadow-sm space-y-3 ${
                    selectedVisit?.id === v.id
                      ? 'border-forest-800 ring-2 ring-forest-800/10'
                      : 'border-sage-200 hover:border-sage-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            v.status === 'accepted'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : v.status === 'requested'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {v.status}
                        </span>
                        <span className="text-[11px] text-charcoal-400 font-medium">#{v.id}</span>
                      </div>
                      <h3 className="font-display font-bold text-sm sm:text-base text-charcoal-800">
                        {v.listing_title}
                      </h3>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToListing(v.listing_id);
                      }}
                      className="text-xs font-bold text-forest-800 hover:underline flex items-center gap-1 flex-shrink-0"
                    >
                      <span>Listing</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Date & Time Slot */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs p-3 rounded-2xl bg-ivory-100 border border-sage-200">
                    <div className="flex items-center gap-2 text-charcoal-700">
                      <Calendar className="w-3.5 h-3.5 text-forest-700 flex-shrink-0" />
                      <span>Proposed Date: <strong>{v.proposed_date}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-charcoal-700">
                      <Clock className="w-3.5 h-3.5 text-forest-700 flex-shrink-0" />
                      <span className="truncate">{v.time_slot}</span>
                    </div>
                  </div>

                  {/* Buyer Notes */}
                  {v.buyer_notes && (
                    <p className="text-xs text-charcoal-600 bg-sage-50 p-2.5 rounded-xl border border-sage-200">
                      <strong>Buyer Note:</strong> "{v.buyer_notes}"
                    </p>
                  )}

                  {/* Actions for Farmer / Seller */}
                  {isSeller && isRequested && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-sage-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(v.id, 'declined');
                        }}
                        className="btn-sage text-xs py-1.5 px-3"
                      >
                        Decline
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(v.id, 'accepted');
                        }}
                        className="btn-forest text-xs py-1.5 px-4"
                      >
                        Accept Appointment
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Confirmed Farm Location & Inspection Protocol (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-sage-200 shadow-card space-y-5 lg:sticky lg:top-28">
          <div className="flex items-center gap-2 pb-3 border-b border-sage-100">
            <Navigation className="w-4 h-4 text-forest-800" />
            <h3 className="font-display font-bold text-sm text-charcoal-800">
              {lang === 'ta' ? 'உறுதி செய்யப்பட்ட பண்ணை முகவரி' : 'Inspection & Location Details'}
            </h3>
          </div>

          {selectedVisit && selectedVisit.status === 'accepted' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-forest-50 border border-forest-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-forest-900">
                  <ShieldCheck className="w-4 h-4 text-forest-800" />
                  <span>Farm Coordinates Unlocked</span>
                </div>
                <p className="text-xs text-forest-800 leading-relaxed">
                  Seller has accepted this appointment. You may visit during the agreed morning or evening milking window.
                </p>
                <div className="pt-2 text-xs text-charcoal-700 font-semibold space-y-1">
                  <div><strong>Farmer Name:</strong> {selectedVisit.seller_name || 'Selvam Periasamy'}</div>
                  <div><strong>Farmer Contact:</strong> {selectedVisit.seller_phone || '9876500003'}</div>
                  <div><strong>Village & Taluk:</strong> {selectedVisit.listing_panchayat}, {selectedVisit.listing_district}</div>
                </div>
              </div>

              <a
                href={`tel:${selectedVisit.seller_phone || '9876500003'}`}
                className="btn-forest w-full text-xs py-2.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Farmer for Farm Directions</span>
              </a>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-charcoal-500 space-y-2">
              <MapPin className="w-8 h-8 mx-auto text-sage-300" />
              <p>
                Precise village coordinates and direct seller contacts unlock automatically once the appointment is accepted by the farmer.
              </p>
            </div>
          )}

          {/* Due Diligence Checklist */}
          <div className="p-4 rounded-2xl bg-ivory-100 border border-sage-200 space-y-2">
            <h4 className="text-xs font-bold text-charcoal-800">
              {lang === 'ta' ? 'நேரடி பரிசோதனை வழிகாட்டுதல்:' : 'On-Farm Inspection Checklist:'}
            </h4>
            <ul className="text-[11px] text-charcoal-600 space-y-1.5 list-disc list-inside">
              <li>Observe both morning and evening milking outputs in person.</li>
              <li>Check udder symmetry and test for mastitis swelling.</li>
              <li>Verify government Animal Husbandry ear-tag and vaccination card.</li>
              <li>Never send online advance deposits prior to physical inspection.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
