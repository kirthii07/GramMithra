import React, { useState, useEffect } from 'react';
import { Listing } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DemoBadge } from '../components/DemoBadge';
import { SuspiciousAlertBox } from '../components/SuspiciousAlertBox';
import { LeafletMap } from '../components/LeafletMap';
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
  FileText,
  Sparkles,
  Eye,
  CheckCircle2,
  Lock
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
        <div className="h-8 w-40 bg-sand-200 rounded animate-pulse" />
        <div className="h-96 bg-sand-200 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Listing Not Found</h2>
        <button onClick={onBack} className="px-4 py-2 rounded-xl bg-primary-700 text-white font-bold text-xs">
          Go Back
        </button>
      </div>
    );
  }

  const titleText = lang === 'ta' && listing.title_ta ? listing.title_ta : listing.title;
  const descText = lang === 'ta' && listing.description_ta ? listing.description_ta : listing.description;

  const defaultPhoto = 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80';
  const photos = listing.photos && listing.photos.length > 0 ? listing.photos : [defaultPhoto];

  // WhatsApp click-to-chat message
  const rawPhone = listing.seller?.phone || '9876500003';
  const waMessage = encodeURIComponent(
    `Hello ${listing.seller?.full_name || 'Farmer'}, I saw your Gram Mitra listing for "${titleText}" in ${listing.panchayat}. I am interested in inspecting the animal.`
  );
  const waUrl = `https://wa.me/91${rawPhone.replace(/\D/g, '')}?text=${waMessage}`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-earth-300 bg-white hover:bg-sand-50 text-xs font-bold text-slate-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'ta' ? 'பட்டியலுக்கு திரும்பு' : 'Back to Catalog'}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleFav}
            className={`p-2 rounded-xl border border-earth-300 bg-white hover:bg-sand-50 transition shadow-sm ${isFavorited ? 'text-rose-600' : 'text-slate-600'}`}
            title="Save to favorites"
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-600' : ''}`} />
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: titleText, url: window.location.href }).catch(() => {});
              }
            }}
            className="p-2 rounded-xl border border-earth-300 bg-white hover:bg-sand-50 text-slate-600 transition shadow-sm"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Listing Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Media Gallery + Details (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Photo Viewer */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-earth-300 shadow-md h-80 sm:h-96">
            <img
              src={photos[selectedPhotoIndex] || defaultPhoto}
              alt={titleText}
              className="w-full h-full object-cover"
            />
            {listing.is_demo && (
              <div className="absolute top-4 left-4">
                <DemoBadge showExplanation />
              </div>
            )}
            {listing.assisted_by_id && (
              <div className="absolute top-4 right-4 bg-emerald-800/90 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>{lang === 'ta' ? 'ஊராட்சி அங்கீகாரம்' : 'Panchayat Endorsed'}</span>
              </div>
            )}
          </div>

          {/* Photo Thumbnails */}
          {photos.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {photos.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition ${
                    selectedPhotoIndex === idx ? 'border-primary-600 scale-105 shadow' : 'border-earth-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Explainable Suspicious Warnings & Quality Box */}
          <SuspiciousAlertBox
            flags={listing.flag_reasons}
            qualityScore={listing.quality_score}
          />

          {/* Animal Specifications Cards */}
          <div className="bg-white p-6 rounded-3xl border border-earth-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">
              {lang === 'ta' ? 'கால்நடை உற்பத்தி & மருத்துவ விபரங்கள்' : 'Livestock Production & Health Attributes'}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-sand-50 p-3 rounded-xl border border-sand-200">
                <span className="text-slate-500 block text-[11px]">{t('age')}</span>
                <span className="font-bold text-slate-900 text-sm">
                  {Math.round(listing.age_months / 12 * 10) / 10} {t('years')}
                </span>
                <span className="text-[10px] text-slate-400 block">({listing.age_months} {t('months')})</span>
              </div>

              {listing.milk_yield_liters > 0 && (
                <div className="bg-primary-50 p-3 rounded-xl border border-primary-200">
                  <span className="text-primary-800 block text-[11px] font-semibold">{t('milkYield')}</span>
                  <span className="font-black text-primary-900 text-sm">{listing.milk_yield_liters} L</span>
                  <span className="text-[10px] text-primary-700 block">{t('litersPerDay')}</span>
                </div>
              )}

              {listing.lactation_number > 0 && (
                <div className="bg-sand-50 p-3 rounded-xl border border-sand-200">
                  <span className="text-slate-500 block text-[11px]">{t('lactation')}</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {listing.lactation_number}{t('calving')}
                  </span>
                </div>
              )}

              {listing.weight_kg > 0 && (
                <div className="bg-sand-50 p-3 rounded-xl border border-sand-200">
                  <span className="text-slate-500 block text-[11px]">{t('weight')}</span>
                  <span className="font-bold text-slate-900 text-sm">{listing.weight_kg} kg</span>
                </div>
              )}

              <div className="bg-sand-50 p-3 rounded-xl border border-sand-200">
                <span className="text-slate-500 block text-[11px]">{t('pregnancy')}</span>
                <span className="font-bold text-slate-900 text-sm capitalize">
                  {listing.pregnancy_status === 'pregnant' ? t('pregnant') : listing.pregnancy_status}
                </span>
              </div>

              <div className="bg-sand-50 p-3 rounded-xl border border-sand-200">
                <span className="text-slate-500 block text-[11px]">{t('vaccination')}</span>
                <span className="font-bold text-slate-900 text-sm capitalize">
                  {listing.vaccination_status === 'fully_vaccinated' ? t('fullyVaccinated') : listing.vaccination_status}
                </span>
              </div>
            </div>

            {/* Vaccination Details & Health Notes */}
            {listing.vaccination_details && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950">
                <span className="font-bold block mb-0.5">💉 {t('vaccination')}:</span>
                <p>{listing.vaccination_details}</p>
              </div>
            )}

            {listing.health_notes && (
              <div className="p-3 bg-sand-50 rounded-xl border border-sand-200 text-xs text-slate-800">
                <span className="font-bold block mb-0.5">{t('healthNotes')}:</span>
                <p className="leading-relaxed">{listing.health_notes}</p>
              </div>
            )}
          </div>

          {/* Description Section */}
          <div className="bg-white p-6 rounded-3xl border border-earth-200 shadow-sm space-y-3">
            <h3 className="font-extrabold text-slate-900 text-base">
              {lang === 'ta' ? 'விவசாயியின் விபரம்' : 'Livestock Description'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {descText || 'No additional notes provided.'}
            </p>
          </div>

          {/* Leaflet Location Map */}
          <div className="bg-white p-6 rounded-3xl border border-earth-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                <MapPin className="w-4 h-4 text-primary-700" />
                <span>{listing.panchayat}, {listing.district}</span>
              </div>
              <span className="text-xs text-slate-500">
                {listing.village ? `${listing.village}, ` : ''}{listing.taluk ? `${listing.taluk} Taluk` : ''}
              </span>
            </div>

            <div className="p-3 bg-sand-50 rounded-xl border border-sand-200 text-[11px] text-slate-600 flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
              <span>{t('privacyNotice')}</span>
            </div>

            <LeafletMap
              center={[listing.latitude, listing.longitude]}
              listings={[listing]}
              selectedListingId={listing.id}
              className="h-64 w-full"
            />
          </div>
        </div>

        {/* Right Column: Price Card & Farmer Direct Contact (5 Cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
          {/* Price & Action Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-earth-300 shadow-lg space-y-6">
            <div>
              <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
                {lang === 'ta' ? 'விற்பனையாளர் கேட்கும் விலை' : 'Asking Price'}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  ₹{listing.price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {listing.is_negotiable ? t('negotiable') : t('fixedPrice')}
                </span>
              </div>
            </div>

            {/* Benchmark Compare Button */}
            <button
              onClick={() => setEstimatorModalOpen(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{lang === 'ta' ? 'அரசு வழிகாட்டுதல் விலையுடன் ஒப்பிடுக' : 'Compare with Attributable Benchmark'}</span>
            </button>

            {/* Direct Contact Buttons */}
            <div className="space-y-2.5 pt-2 border-t border-earth-100">
              {/* WhatsApp direct click-to-chat */}
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t('btnWhatsApp')}</span>
              </a>

              {/* Direct phone call */}
              <a
                href={`tel:${rawPhone}`}
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>
                  {t('btnCallSeller')} ({listing.masked_phone || rawPhone})
                </span>
              </a>

              {/* Schedule on-farm visit */}
              <button
                onClick={() => {
                  if (!user) {
                    onNavigateToLogin();
                    return;
                  }
                  setVisitModalOpen(true);
                }}
                className="w-full py-3 rounded-2xl bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-md"
              >
                <Calendar className="w-4 h-4" />
                <span>{t('btnScheduleVisit')}</span>
              </button>
            </div>

            {/* Seller profile box */}
            <div className="pt-4 border-t border-earth-100 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-800 font-bold text-base flex items-center justify-center">
                {listing.seller ? listing.seller.full_name.charAt(0) : 'F'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-sm">
                    {listing.seller ? listing.seller.full_name : 'Local Farmer'}
                  </span>
                  {listing.seller?.is_verified && (
                    <span title="Verified Seller"><CheckCircle2 className="w-4 h-4 text-emerald-600" /></span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {listing.seller?.village ? `${listing.seller.village}, ` : ''}{listing.panchayat}
                </p>
              </div>
            </div>

            {/* Flag Suspicious Listing */}
            <div className="pt-3 border-t border-earth-100 text-center">
              <button
                onClick={() => setFlagModalOpen(true)}
                className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 transition flex items-center justify-center gap-1 mx-auto"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{lang === 'ta' ? 'சந்தேகத்திற்கிடமான பதிவா? புகார் அளிக்கவும்' : 'Report Suspicious / Fake Listing'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Farm Visit Modal */}
      <FarmVisitModal
        isOpen={visitModalOpen}
        onClose={() => setVisitModalOpen(false)}
        listingId={listing.id}
        listingTitle={titleText}
        sellerName={listing.seller?.full_name}
      />

      {/* Benchmark Estimator Modal */}
      <PriceEstimatorModal
        isOpen={estimatorModalOpen}
        onClose={() => setEstimatorModalOpen(false)}
        initialLivestockType={listing.livestock_type}
        initialBreed={listing.breed}
      />

      {/* Report Listing Modal */}
      {flagModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white text-[#19251E] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#D7E2D8] relative">
            <h3 className="text-base font-bold text-[#19251E] mb-1">
              {lang === 'ta' ? 'பதிவு மீது புகார் அளிக்கவும்' : 'Report Listing to Moderation'}
            </h3>
            <p className="text-xs text-[#58665D] mb-4">
              {lang === 'ta'
                ? 'முன்பண மோசடி, போலியான விலைகள் அல்லது தவறான விபரங்கள் இருந்தால் ஊராட்சி நிர்வாகத்திற்கு தெரிவியுங்கள்.'
                : 'Help keep Gram Mitra safe. Report scam prices, fake pictures, or unresponsive sellers.'}
            </p>

            {flagSubmitted ? (
              <div className="py-4 text-center text-xs font-bold text-emerald-700">
                Report submitted for Panchayat Representative review.
              </div>
            ) : (
              <form onSubmit={handleFlagSubmit} className="space-y-3">
                <textarea
                  rows={3}
                  required
                  placeholder={lang === 'ta' ? 'புகாருக்கான காரணம்...' : 'Reason for report...'}
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  className="input-light w-full text-xs"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setFlagModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
