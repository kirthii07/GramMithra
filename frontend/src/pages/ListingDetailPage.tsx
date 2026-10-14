import React, { useState, useEffect } from 'react';
import { Listing } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DemoBadge } from '../components/DemoBadge';
import { SuspiciousAlertBox } from '../components/SuspiciousAlertBox';
import { FarmVisitModal } from '../components/FarmVisitModal';
import { PriceEstimatorModal } from '../components/PriceEstimatorModal';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Milk,
  Scale,
  ShieldCheck,
  Phone,
  MessageCircle,
  AlertTriangle,
  Heart,
  Share2,
  Sparkles,
  Eye,
  CheckCircle2,
  Lock,
  Compass,
  FileCheck
} from 'lucide-react';

interface ListingDetailPageProps {
  listingId: number;
  onBack: () => void;
  onNavigateToLogin: () => void;
}

export const ListingDetailPage: React.FC<ListingDetailPageProps> = ({
  listingId,
  onBack,
  onNavigateToLogin
}) => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [estimatorModalOpen, setEstimatorModalOpen] = useState(false);
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [flagSubmitted, setFlagSubmitted] = useState(false);

  useEffect(() => {
    loadListing();
  }, [listingId]);

  const loadListing = async () => {
    setLoading(true);
    try {
      const data = await api.getListing(listingId);
      setListing(data);

      if (user) {
        const favs = await api.getFavoriteIds();
        setIsFavorited(favs.includes(data.id));
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFav = async () => {
    if (!user) {
      onNavigateToLogin();
      return;
    }
    try {
      const res = await api.toggleFavorite(listingId);
      setIsFavorited(res.favorited);
    } catch {}
  };

  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagReason) return;
    try {
      await api.flagListing(listingId, flagReason);
      setFlagSubmitted(true);
      setTimeout(() => {
        setFlagModalOpen(false);
        setFlagSubmitted(false);
        loadListing();
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to report listing');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-6">
        <div className="h-8 w-40 bg-sage-200 rounded animate-pulse" />
        <div className="h-96 bg-sage-200 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-charcoal-800">Listing Not Found</h2>
        <button onClick={onBack} className="btn-forest text-xs px-5 py-2.5">
          Go Back
        </button>
      </div>
    );
  }

  const titleText = lang === 'ta' && listing.title_ta ? listing.title_ta : listing.title;
  const descText = lang === 'ta' && listing.description_ta ? listing.description_ta : listing.description;
  const photos =
    listing.photos && listing.photos.length > 0
      ? listing.photos
      : ['https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80'];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-forest-800 hover:text-forest-900 bg-white border border-sage-200 px-3.5 py-2 rounded-xl transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'ta' ? 'பட்டியலுக்கு திரும்பு' : 'Back to Marketplace'}</span>
        </button>

        <div className="flex items-center gap-2">
          {listing.is_demo && <DemoBadge showExplanation />}
          <button
            onClick={handleToggleFav}
            className="p-2 rounded-xl border border-sage-200 bg-white text-charcoal-700 hover:text-terracotta-500 transition shadow-sm"
            title="Save to favorites"
          >
            <Heart
              className={`w-4 h-4 ${isFavorited ? 'fill-terracotta-500 text-terracotta-500' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Main Grid: Gallery + Livestock Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Photos + Attributes (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Photo Card */}
          <div className="relative h-80 sm:h-[420px] rounded-3xl overflow-hidden bg-ivory-200 border border-sage-200 shadow-card">
            <img
              src={photos[selectedPhotoIndex] || photos[0]}
              alt={titleText}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-forest-800 text-white shadow">
                {listing.breed}
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {photos.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {photos.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`w-20 h-16 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition ${
                    selectedPhotoIndex === idx
                      ? 'border-forest-800 ring-2 ring-forest-800/20'
                      : 'border-sage-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={p} alt="Thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Description & Health Notes */}
          <div className="bg-white p-6 rounded-3xl border border-sage-200 shadow-sm space-y-4">
            <h2 className="font-display font-bold text-lg text-charcoal-800">
              {lang === 'ta' ? 'கால்நடை விபரம்' : 'Livestock Description'}
            </h2>
            <p className="text-sm text-charcoal-600 leading-relaxed whitespace-pre-line">
              {descText || 'No extended description provided.'}
            </p>

            {listing.health_notes && (
              <div className="p-3.5 rounded-2xl bg-sage-50 border border-sage-200 text-xs space-y-1">
                <span className="font-bold text-forest-800 block">
                  {lang === 'ta' ? 'மருத்துவ மற்றும் உணவு பழக்க விபரம்:' : 'Veterinary & Feeding Notes:'}
                </span>
                <span className="text-charcoal-600">{listing.health_notes}</span>
              </div>
            )}
          </div>

          {/* Quality & Suspicious Listing Advisory Box */}
          <div className="bg-white p-6 rounded-3xl border border-sage-200 shadow-sm space-y-3">
            <h3 className="font-display font-bold text-sm text-charcoal-800">
              {lang === 'ta' ? 'பாதுகாப்பு & நம்பகத்தன்மை பகுப்பாய்வு' : 'AI Safety & Quality Analyzer'}
            </h3>
            <SuspiciousAlertBox
              flags={listing.flag_reasons || []}
              qualityScore={listing.quality_score || 90}
            />
          </div>

          {/* Attributable Fair-Price Estimator Banner */}
          <div className="p-5 rounded-3xl bg-forest-50 border border-forest-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-forest-800" />
                <span className="font-display font-bold text-sm text-forest-900">
                  {lang === 'ta' ? 'அரசு அங்கீகரித்த நியாய விலை' : 'TANUVAS / NDDB Benchmark Analysis'}
                </span>
              </div>
              <p className="text-xs text-forest-700">
                {lang === 'ta'
                  ? 'இந்த இன மாட்டிற்கான நியாய விலை வரம்பைக் கணக்கிட்டு ஒப்பிடலாம்.'
                  : 'Compare asking price against official research benchmarks and yield factors.'}
              </p>
            </div>
            <button
              onClick={() => setEstimatorModalOpen(true)}
              className="btn-forest text-xs px-4 py-2 flex-shrink-0"
            >
              {lang === 'ta' ? 'விலை சரிபார்க்க' : 'Check Fair Price'}
            </button>
          </div>
        </div>

        {/* Right Column: Pricing & Purchase Call to Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
          {/* Main Action Card */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-sage-200 shadow-card space-y-6">
            <div>
              <span className="text-xs font-bold text-charcoal-400 uppercase tracking-wider block mb-1">
                {listing.is_negotiable ? t('negotiable') : t('fixedPrice')}
              </span>
              <div className="font-display text-3xl sm:text-4xl font-black text-forest-800">
                ₹{listing.price.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-ivory-100 border border-sage-200">
                <div className="text-charcoal-400 text-[11px] mb-0.5">{t('milkYield')}</div>
                <div className="font-display font-black text-base text-charcoal-800">
                  {listing.milk_yield_liters > 0 ? `${listing.milk_yield_liters} L` : 'N/A'}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-ivory-100 border border-sage-200">
                <div className="text-charcoal-400 text-[11px] mb-0.5">{t('age')}</div>
                <div className="font-display font-black text-base text-charcoal-800">
                  {Math.round((listing.age_months / 12) * 10) / 10} {t('years')}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-ivory-100 border border-sage-200">
                <div className="text-charcoal-400 text-[11px] mb-0.5">{t('vaccination')}</div>
                <div className="font-bold text-forest-800 capitalize">
                  {listing.vaccination_status.replace('_', ' ')}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-ivory-100 border border-sage-200">
                <div className="text-charcoal-400 text-[11px] mb-0.5">{t('pregnancy')}</div>
                <div className="font-bold text-charcoal-800 capitalize">
                  {listing.pregnancy_status === 'pregnant' ? t('pregnant') : 'Ready'}
                </div>
              </div>
            </div>

            {/* Seller Contact & Verification */}
            <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-forest-800 text-white font-bold flex items-center justify-center">
                  {listing.seller ? listing.seller.full_name.charAt(0) : 'F'}
                </div>
                <div>
                  <div className="font-bold text-sm text-charcoal-800">
                    {listing.seller ? listing.seller.full_name : 'Farmer'}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-forest-700 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Panchayat Seller</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-charcoal-600 pt-2 border-t border-sage-200 space-y-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-forest-700" />
                  <span>
                    {listing.village ? `${listing.village}, ` : ''}{listing.panchayat}, {listing.district}
                  </span>
                </div>
                {listing.distance_km !== undefined && (
                  <div className="text-[11px] text-forest-800 font-bold pl-5">
                    Approx. {listing.distance_km} km away from your location
                  </div>
                )}
              </div>
            </div>

            {/* Direct Interaction Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={() => setVisitModalOpen(true)}
                className="btn-forest w-full py-3 text-xs sm:text-sm font-bold shadow-md"
              >
                <Calendar className="w-4 h-4" />
                <span>{t('btnScheduleVisit')}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${listing.seller?.phone || '9876500003'}`}
                  className="btn-sage py-2.5 text-xs font-bold"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{t('btnCallSeller')}</span>
                </a>

                <a
                  href={`https://wa.me/91${listing.seller?.phone || '9876500003'}?text=${encodeURIComponent(
                    `Hello, I am inquiring about your listing #${listing.id} (${listing.title}) on Gram Mitra.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <button
                onClick={() => setFlagModalOpen(true)}
                className="w-full text-center py-1.5 text-[11px] font-semibold text-charcoal-400 hover:text-rose-600 transition"
              >
                {lang === 'ta' ? 'சந்தேகத்திற்கிடமான பதிவை தெரிவிக்க' : 'Report / Flag this Listing'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Flag / Report Modal */}
      {flagModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-sage-300 shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-base text-charcoal-800">
              {lang === 'ta' ? 'பதிவு புகார் அளிக்கவும்' : 'Report Suspicious Listing'}
            </h3>
            {flagSubmitted ? (
              <div className="p-4 rounded-xl bg-forest-50 text-forest-800 text-xs font-semibold text-center">
                Report submitted for Panchayat Representative review.
              </div>
            ) : (
              <form onSubmit={handleFlagSubmit} className="space-y-3">
                <p className="text-xs text-charcoal-500">
                  Help protect rural buyers against advance-token fraud, undisclosed animal illness, or fake pricing.
                </p>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your concern..."
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  className="w-full text-xs"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setFlagModalOpen(false)}
                    className="btn-sage text-xs py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-terracotta text-xs py-2 px-4">
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Farm Visit Modal */}
      <FarmVisitModal
        isOpen={visitModalOpen}
        onClose={() => setVisitModalOpen(false)}
        listingId={listing.id}
        listingTitle={titleText}
        sellerName={listing.seller?.full_name}
      />

      {/* Price Estimator Modal */}
      <PriceEstimatorModal
        isOpen={estimatorModalOpen}
        onClose={() => setEstimatorModalOpen(false)}
        initialLivestockType={listing.livestock_type}
        initialBreed={listing.breed}
      />
    </div>
  );
};
