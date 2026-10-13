import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Listing, LivestockType } from '../types';
import { ListingCard } from '../components/ListingCard';
import { LeafletMap } from '../components/LeafletMap';
import {
  Mic,
  Sparkles,
  MapPin,
  ShieldCheck,
  Search,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  TrendingUp,
  Heart,
  Leaf,
  Star,
  Zap,
  Globe,
  Award,
  ChevronRight
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenVoiceModal: () => void;
  onOpenEstimatorModal: () => void;
  onOpenAssistedModal: () => void;
  onSelectListing: (listing: Listing) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenVoiceModal,
  onOpenEstimatorModal,
  onOpenAssistedModal,
  onSelectListing
}) => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();

  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [activeStatIndex, setActiveStatIndex] = useState(0);

  const centerCoords: [number, number] = [11.0042, 77.5612];

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStatIndex(i => (i + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const listings = await api.getListings({ include_demo: true });
      setFeaturedListings(listings.slice(0, 6));
      if (user) {
        const favs = await api.getFavoriteIds();
        setFavoriteIds(favs);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (id: number) => {
    if (!user) { onNavigate('login'); return; }
    try {
      const res = await api.toggleFavorite(id);
      if (res.favorited) setFavoriteIds(prev => [...prev, id]);
      else setFavoriteIds(prev => prev.filter(x => x !== id));
    } catch {}
  };

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('browse', { search: searchTerm, category: selectedCategory });
  };

  const categories = [
    { id: 'cow', name: t('catCow'), icon: '🐄', count: '14+', color: 'from-amber-900/40 to-amber-950/40', border: 'border-amber-700/30' },
    { id: 'buffalo', name: t('catBuffalo'), icon: '🐃', count: '8+', color: 'from-slate-800/60 to-slate-900/60', border: 'border-slate-600/30' },
    { id: 'goat', name: t('catGoat'), icon: '🐐', count: '22+', color: 'from-emerald-900/40 to-emerald-950/40', border: 'border-emerald-700/30' },
    { id: 'sheep', name: t('catSheep'), icon: '🐑', count: '15+', color: 'from-sky-900/40 to-sky-950/40', border: 'border-sky-700/30' },
    { id: 'hen', name: t('catHen'), icon: '🐓', count: '40+', color: 'from-orange-900/40 to-orange-950/40', border: 'border-orange-700/30' },
    { id: 'chicken', name: t('catChicken'), icon: '🐔', count: '35+', color: 'from-yellow-900/40 to-yellow-950/40', border: 'border-yellow-700/30' },
    { id: 'duck', name: t('catDuck'), icon: '🦆', count: '10+', color: 'from-teal-900/40 to-teal-950/40', border: 'border-teal-700/30' },
  ];

  const stats = [
    { value: '40+', label: lang === 'ta' ? 'ஊராட்சிகள்' : 'Active Panchayats', icon: Globe },
    { value: '₹0', label: lang === 'ta' ? 'இடைத்தரகர் கமிஷன்' : 'Middleman Fee', icon: Award },
    { value: 'GPS', label: lang === 'ta' ? 'அருகாமை தேடல்' : 'Radius Search', icon: MapPin },
    { value: '100%', label: lang === 'ta' ? 'சரிபார்க்கப்பட்ட' : 'Verified Data', icon: ShieldCheck },
  ];

  const features = [
    {
      icon: Mic,
      title: lang === 'ta' ? 'குரல் வழி பதிவு' : 'Voice Listing',
      desc: lang === 'ta' ? 'தமிழிலேயே பேசி பதிவு செய்யுங்கள்' : 'Create listings by speaking in Tamil or English',
      color: 'text-amber-400',
      bg: 'from-amber-900/20 to-amber-950/20',
      border: 'border-amber-700/25',
      action: onOpenVoiceModal,
      actionLabel: lang === 'ta' ? 'தொடங்குக' : 'Start',
    },
    {
      icon: Sparkles,
      title: lang === 'ta' ? 'விலை மதிப்பீடு' : 'AI Price Estimator',
      desc: lang === 'ta' ? 'அரசு தரவு அடிப்படையில் நியாய விலை' : 'Government-benchmarked fair price estimation',
      color: 'text-violet-400',
      bg: 'from-violet-900/20 to-violet-950/20',
      border: 'border-violet-700/25',
      action: onOpenEstimatorModal,
      actionLabel: lang === 'ta' ? 'மதிப்பீடு' : 'Estimate',
    },
    {
      icon: UserCheck,
      title: lang === 'ta' ? 'உதவி பதிவு' : 'Assisted Registration',
      desc: lang === 'ta' ? 'பஞ்சாயத்து பிரதிநிதி உதவியுடன் பதிவு' : 'Get help from panchayat rep to register',
      color: 'text-emerald-400',
      bg: 'from-emerald-900/20 to-emerald-950/20',
      border: 'border-emerald-700/25',
      action: onOpenAssistedModal,
      actionLabel: lang === 'ta' ? 'படிவம்' : 'Register',
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#040d0a' }}>
      
      {/* ═══════════════════════════════════════
          HERO SECTION — Immersive 3D Dark
      ═══════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex flex-col justify-center overflow-hidden">
        
        {/* Ambient background orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 grid-pattern opacity-40" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-4xl">
            
            {/* Floating badge */}
            <div className="inline-flex items-center gap-2 mb-8 animate-slide-up">
              <span className="badge-gram">
                <ShieldCheck className="w-3.5 h-3.5" />
                {lang === 'ta' ? 'அரசு & ஊராட்சி அங்கீகரித்த கால்நடை மையம்' : 'Verified Gram Panchayat Livestock Hub'}
              </span>
            </div>

            {/* Hero Heading */}
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              {lang === 'ta' ? (
                <>
                  கிராமத்து <span className="text-gradient-green">விவசாயிகளுக்கு</span><br />
                  நேரடி நியாய விலை சந்தை
                </>
              ) : (
                <>
                  India's Premium<br />
                  <span className="text-gradient-green">Panchayat Livestock</span><br />
                  Marketplace
                </>
              )}
            </h1>

            {/* Sub-tagline */}
            <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {t('subTagline')}
            </p>

            {/* Search Form */}
            <form onSubmit={handleQuickSearch}
              className="flex flex-col sm:flex-row gap-3 max-w-2xl mb-12 animate-slide-up"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  backdropFilter: 'blur(20px)'
                }}
              >
                <Search className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-emerald-700"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onOpenVoiceModal}
                  className="px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all duration-200"
                  style={{
                    background: 'rgba(251, 191, 36, 0.1)',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    color: '#fbbf24'
                  }}
                >
                  <Mic className="w-4 h-4 animate-pulse" />
                  <span className="hidden sm:inline">{lang === 'ta' ? 'பேசு' : 'Voice'}</span>
                </button>
                <button
                  type="submit"
                  className="btn-primary px-8"
                >
                  {t('btnSearch')}
                </button>
              </div>
            </form>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={i}
                    className={`glass-card rounded-2xl p-4 text-center transition-all duration-500 ${
                      activeStatIndex === i ? 'border-emerald-500/40 shadow-glow-sm' : ''
                    }`}
                  >
                    <Icon className="w-4 h-4 text-emerald-500 mx-auto mb-2" />
                    <div className="font-display text-2xl font-black text-white">{stat.value}</div>
                    <div className="text-[11px] text-emerald-500/70 mt-0.5 leading-tight">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce-subtle">
          <div className="w-px h-12 bg-gradient-to-b from-emerald-500/50 to-transparent" />
        </div>
      </section>

      {/* ═══════════════════════════════════════
          LIVESTOCK CATEGORIES
      ═══════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="section-label mb-3">
              <Leaf className="w-3 h-3" />
              {lang === 'ta' ? 'கால்நடை பிரிவுகள்' : 'Categories'}
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-white">
              {lang === 'ta' ? 'கால்நடை வகைகளை ஆராயுங்கள்' : 'Explore Livestock Categories'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {lang === 'ta' ? 'சரிபார்க்கப்பட்ட தரவு மற்றும் நேரடி விலை மதிப்பீட்டுடன்' : 'With verified data and live price estimates'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('browse')}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
          >
            <span>{lang === 'ta' ? 'அனைத்தையும் பார்' : 'View All'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigate('browse', { category: cat.id })}
              className={`category-card bg-gradient-to-b ${cat.color} border ${cat.border}`}
            >
              <div className="text-3xl mb-3 transition-transform duration-300 group-hover:scale-110">
                {cat.icon}
              </div>
              <span className="font-bold text-xs sm:text-sm text-white block mb-1">
                {cat.name}
              </span>
              <span className="text-[10px] text-emerald-500/60">
                {cat.count} listings
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          3 FEATURE PILLARS
      ═══════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc, color, bg, border, action, actionLabel }, i) => (
            <div
              key={i}
              className={`glass-card-hover rounded-3xl p-7 bg-gradient-to-br ${bg} border ${border} flex flex-col justify-between`}
            >
              <div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5`}
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">{desc}</p>
              </div>
              <button
                onClick={action}
                className="flex items-center gap-2 text-xs font-bold transition-all duration-200 group"
                style={{ color: color.replace('text-', '').includes('amber') ? '#fbbf24' : color.includes('violet') ? '#a78bfa' : '#34d399' }}
              >
                <span>{actionLabel}</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURED LISTINGS GRID
      ═══════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="section-label mb-3">
              <Star className="w-3 h-3" />
              {lang === 'ta' ? 'சமீபத்திய கால்நடைகள்' : 'Featured Listings'}
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-white">
              {lang === 'ta' ? 'பரிந்துரைக்கப்பட்ட கால்நடைகள்' : 'Top Livestock Listings'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {lang === 'ta' ? 'உறுதிப்படுத்தப்பட்ட பால் அளவு மற்றும் தடுப்பூசி பதிவுகளுடன்' : 'With verified milk yield, age & health records'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('browse')}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
          >
            <span>{lang === 'ta' ? 'அனைத்தையும் பார்' : 'View All'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-72 rounded-3xl animate-pulse"
                style={{ background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onSelect={onSelectListing}
                isFavorited={favoriteIds.includes(listing.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════
          GPS MAP SECTION
      ═══════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <div className="glass-card rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="section-label mb-3">
                <MapPin className="w-3 h-3" />
                GPS Discovery
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-black text-white">
                {lang === 'ta' ? 'ஜி.பி.எஸ் அருகாமை வரைபடம்' : 'GPS Nearby Livestock Map'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {lang === 'ta'
                  ? 'உங்களைச் சுற்றியுள்ள பண்ணைகளை வரைபடத்தில் காண்க'
                  : 'Visual village-level map with farm locations near Kangeyam / Tiruppur'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('browse')}
              className="btn-ghost text-xs px-5 py-2.5 flex-shrink-0"
            >
              {lang === 'ta' ? 'முழு வரைபடம்' : 'Open Full Map'}
            </button>
          </div>

          <div className="rounded-2xl overflow-hidden h-80 sm:h-[420px] border border-emerald-900/30">
            <LeafletMap
              center={centerCoords}
              radiusKm={40}
              listings={featuredListings}
              onListingSelect={onSelectListing}
              className="h-full w-full"
            />
          </div>
        </div>
      </section>

    </div>
  );
};
