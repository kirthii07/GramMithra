import React from 'react';
import { Listing } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { DemoBadge } from './DemoBadge';
import { Heart, MapPin, Milk, Scale, ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
  onSelect: (listing: Listing) => void;
  isFavorited?: boolean;
  onToggleFavorite?: (id: number) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onSelect,
  isFavorited = false,
  onToggleFavorite
}) => {
  const { lang, t } = useLanguage();

  const titleText = lang === 'ta' && listing.title_ta ? listing.title_ta : listing.title;
  const primaryPhoto =
    listing.photos && listing.photos.length > 0
      ? listing.photos[0]
      : 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80';

  const hasHighFlag = listing.flag_reasons && listing.flag_reasons.some(f => f.severity === 'high');

  return (
    <div
      onClick={() => onSelect(listing)}
      className="group premium-card overflow-hidden flex flex-col h-full cursor-pointer relative"
    >
      {/* Photo Container */}
      <div className="relative h-48 w-full overflow-hidden bg-ivory-200">
        <img
          src={primaryPhoto}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Subtle Bottom Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-1.5 z-10">
          <div className="flex flex-wrap gap-1 items-start">
            {listing.is_demo && <DemoBadge />}
            {listing.assisted_by_id && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-forest-800 text-white shadow-sm">
                <ShieldCheck className="w-3 h-3 text-sage-200" />
                {lang === 'ta' ? 'ஊராட்சி உதவி' : 'Panchayat Verified'}
              </span>
            )}
          </div>

          {/* Favorite Button */}
          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(listing.id);
              }}
              className="p-2 rounded-full bg-white/90 backdrop-blur-sm text-charcoal-700 hover:text-terracotta-500 hover:scale-110 transition shadow-sm"
              title="Save to favorites"
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  isFavorited ? 'fill-terracotta-500 text-terracotta-500' : 'text-charcoal-700'
                }`}
              />
            </button>
          )}
        </div>

        {/* Bottom Image Overlay: Price & Distance */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between text-white z-10">
          <div>
            <div className="font-display text-xl font-extrabold tracking-tight drop-shadow-md">
              ₹{listing.price.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] font-medium text-sage-100 drop-shadow">
              {listing.is_negotiable ? t('negotiable') : t('fixedPrice')}
            </div>
          </div>

          {listing.distance_km !== undefined && listing.distance_km !== null && (
            <div className="px-2 py-1 rounded-lg text-xs font-bold bg-charcoal-900/80 backdrop-blur-sm text-sage-100 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-forest-300" />
              <span>{listing.distance_km} km</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Title */}
          <h3 className="font-display font-bold text-charcoal-800 group-hover:text-forest-800 transition line-clamp-1 text-base">
            {titleText}
          </h3>

          {/* Attributes Row */}
          <div className="flex items-center gap-2 text-xs text-charcoal-500 mt-1.5 mb-2.5">
            <span className="font-bold px-2 py-0.5 rounded-md bg-sage-100 text-forest-800 border border-sage-200">
              {listing.breed}
            </span>
            <span>•</span>
            <span>{Math.round((listing.age_months / 12) * 10) / 10} {t('years')}</span>
            <span>•</span>
            <span className="capitalize">{listing.gender === 'female' ? t('female') : t('male')}</span>
          </div>

          {/* Metrics Pill Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs rounded-xl p-2.5 bg-ivory-100 border border-sage-200">
            {listing.milk_yield_liters > 0 ? (
              <div className="flex items-center gap-1.5 text-charcoal-700">
                <Milk className="w-3.5 h-3.5 text-forest-700 flex-shrink-0" />
                <span className="font-bold">{listing.milk_yield_liters} L</span>
                <span className="text-[10px] text-charcoal-400">/day</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-charcoal-700">
                <Scale className="w-3.5 h-3.5 text-terracotta-500 flex-shrink-0" />
                <span className="font-bold">{listing.weight_kg > 0 ? `${listing.weight_kg} kg` : 'Standard'}</span>
              </div>
            )}

            <div className="text-right text-[11px] font-medium text-charcoal-500 flex items-center justify-end">
              {listing.lactation_number > 0
                ? `${listing.lactation_number} ${t('calving')}`
                : listing.pregnancy_status === 'pregnant'
                ? t('pregnant')
                : 'Prime Health'}
            </div>
          </div>

          {/* Location Line */}
          <div className="flex items-center gap-1.5 text-xs text-charcoal-500 mt-2.5">
            <MapPin className="w-3.5 h-3.5 text-forest-700 flex-shrink-0" />
            <span className="truncate">
              {listing.village ? `${listing.village}, ` : ''}{listing.panchayat}, {listing.district}
            </span>
          </div>

          {/* Suspicious warning badge if any */}
          {hasHighFlag && (
            <div className="flex items-center gap-1.5 p-2 rounded-lg text-[11px] mt-2 bg-rose-50 border border-rose-200 text-rose-800">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
              <span className="font-semibold">{lang === 'ta' ? 'பாதுகாப்பு எச்சரிக்கை' : 'Quality Advisory'}</span>
            </div>
          )}
        </div>

        {/* Footer: Seller & Details Button */}
        <div className="pt-2.5 border-t border-sage-100 flex items-center justify-between gap-2 mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-forest-800 text-white font-bold text-[10px] flex items-center justify-center">
              {listing.seller ? listing.seller.full_name.charAt(0) : 'F'}
            </div>
            <span className="text-xs font-semibold text-charcoal-600 truncate max-w-[90px]">
              {listing.seller ? listing.seller.full_name.split(' ')[0] : 'Farmer'}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-bold text-forest-800 group-hover:translate-x-0.5 transition-transform">
            <span>{lang === 'ta' ? 'விபரம்' : 'View'}</span>
            <ArrowRight className="w-3 h-3 text-forest-700" />
          </span>
        </div>
      </div>
    </div>
  );
};
