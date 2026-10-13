import React from 'react';
import { Listing } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { DemoBadge } from './DemoBadge';
import { Heart, MapPin, Milk, Scale, ShieldCheck, AlertTriangle, ExternalLink } from 'lucide-react';

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
  const primaryPhoto = listing.photos && listing.photos.length > 0
    ? listing.photos[0]
    : 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80';

  const hasHighFlag = listing.flag_reasons && listing.flag_reasons.some(f => f.severity === 'high');

  return (
    <div className="group glass-card-hover rounded-3xl overflow-hidden flex flex-col h-full cursor-pointer">
      {/* Media Header */}
      <div className="relative h-48 w-full overflow-hidden" onClick={() => onSelect(listing)}>
        <img
          src={primaryPhoto}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1 items-start">
            {listing.is_demo && <DemoBadge />}
            {listing.assisted_by_id && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                style={{ background: 'rgba(5, 150, 105, 0.85)', color: 'white', backdropFilter: 'blur(8px)' }}
              >
                <ShieldCheck className="w-3 h-3" />
                {lang === 'ta' ? 'ஊராட்சி உதவி' : 'Panchayat Verified'}
              </span>
            )}
          </div>

          {/* Favorite Toggle */}
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(listing.id);
              }}
              className="p-2 rounded-full transition-all duration-200 hover:scale-110"
              style={{
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.15)'
              }}
              title="Save to favorites"
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
            </button>
          )}
        </div>

        {/* Bottom: Price overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <div className="font-display text-xl font-black text-white price-glow">
              ₹{listing.price.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] font-medium text-emerald-300">
              {listing.is_negotiable ? t('negotiable') : t('fixedPrice')}
            </div>
          </div>
          {listing.distance_km !== undefined && listing.distance_km !== null && (
            <div className="px-2 py-1 rounded-lg text-xs font-semibold text-emerald-300 flex items-center gap-1"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            >
              <MapPin className="w-3 h-3" />
              <span>{listing.distance_km} km</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title & Breed */}
          <div className="mb-2">
            <h3
              onClick={() => onSelect(listing)}
              className="font-display font-bold text-white group-hover:text-emerald-300 transition line-clamp-1 text-base"
            >
              {titleText}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs mb-3">
            <span className="font-semibold px-2 py-0.5 rounded-lg"
              style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.25)' }}
            >
              {listing.breed}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">{Math.round(listing.age_months / 12 * 10) / 10} {t('years')}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 capitalize">{listing.gender === 'female' ? t('female') : t('male')}</span>
          </div>

          {/* Livestock Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs rounded-xl p-2.5 mb-3"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(16, 185, 129, 0.1)' }}
          >
            {listing.milk_yield_liters > 0 ? (
              <div className="flex items-center gap-1.5 text-slate-300">
                <Milk className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span className="font-semibold">{listing.milk_yield_liters} L</span>
                <span className="text-[10px] text-slate-500">/day</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-300">
                <Scale className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span className="font-semibold">{listing.weight_kg > 0 ? `${listing.weight_kg} kg` : 'N/A'}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-slate-400 justify-end text-[11px]">
              {listing.lactation_number > 0
                ? <span>{listing.lactation_number} {t('calving')}</span>
                : <span>{listing.pregnancy_status === 'pregnant' ? t('pregnant') : 'Ready'}</span>
              }
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
            <MapPin className="w-3 h-3 text-emerald-700 flex-shrink-0" />
            <span className="truncate">{listing.village ? `${listing.village}, ` : ''}{listing.panchayat}, {listing.district}</span>
          </div>

          {/* Warning Flag */}
          {hasHighFlag && (
            <div className="flex items-center gap-1.5 p-2 rounded-lg text-[11px] mb-2"
              style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#fca5a5' }}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
              <span>{lang === 'ta' ? 'பாதுகாப்பு எச்சரிக்கை' : 'Advisory Flagged'}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 flex items-center justify-between gap-2 mt-auto"
          style={{ borderTop: '1px solid rgba(16, 185, 129, 0.1)' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center font-bold text-xs shadow-glow-sm">
              {listing.seller ? listing.seller.full_name.charAt(0) : 'F'}
            </div>
            <span className="text-xs font-semibold text-slate-400 truncate max-w-[90px]">
              {listing.seller ? listing.seller.full_name : 'Farmer'}
            </span>
          </div>

          <button
            onClick={() => onSelect(listing)}
            className="btn-primary text-xs px-4 py-2"
          >
            <span>{lang === 'ta' ? 'விபரம்' : 'View'}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
