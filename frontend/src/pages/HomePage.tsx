import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Listing } from '../types';
import { ListingCard } from '../components/ListingCard';
import {
  Mic,
  Sparkles,
  MapPin,
  ShieldCheck,
  Search,
  ArrowRight,
  UserCheck,
  Award,
  Globe,
  Star,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Sliders,
  Compass
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
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [districts, setDistricts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    api.getDistricts().then(setDistricts).catch(() => {});
  }, [user]);

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
    if (!user) {
      onNavigate('login');
      return;
    }
    try {
      const res = await api.toggleFavorite(id);
      if (res.favorited) setFavoriteIds((prev) => [...prev, id]);
      else setFavoriteIds((prev) => prev.filter((x) => x !== id));
    } catch {}
  };

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('browse', {
      search: searchTerm,
      category: selectedCategory,
      district: selectedDistrict !== 'all' ? selectedDistrict : undefined
    });
  };

  const categories = [
    { id: 'cow', name: t('catCow'), icon: '🐄', count: '14+' },
    { id: 'buffalo', name: t('catBuffalo'), icon: '🐃', count: '8+' },
    { id: 'goat', name: t('catGoat'), icon: '🐐', count: '22+' },
    { id: 'sheep', name: t('catSheep'), icon: '🐑', count: '15+' },
    { id: 'hen', name: t('catHen'), icon: '🐓', count: '40+' },
    { id: 'chicken', name: t('catChicken'), icon: '🐔', count: '35+' },
    { id: 'duck', name: t('catDuck'), icon: '🦆', count: '10+' }
  ];

  const stats = [
    {
      value: '40+',
      label: lang === 'ta' ? 'ஊராட்சிகள்' : 'Active Panchayats',
      icon: Globe
    },
    {
      value: '₹0',
      label: lang === 'ta' ? 'இடைத்தரகர் கட்டணம்' : 'Zero Middleman Fee',
      icon: Award
    },
    {
      value: 'GPS',
      label: lang === 'ta' ? 'அருகாமை தொலைவு தேடல்' : 'Radius Proximity',
      icon: Compass
    },
    {
      value: '100%',
      label: lang === 'ta' ? 'சரிபார்க்கப்பட்ட கால்நடை' : 'Attributable Benchmarks',
      icon: ShieldCheck
    }
  ];

  const features = [
    {
      icon: Mic,
      title: lang === 'ta' ? 'குரல் வழி பதிவு' : 'Tamil Voice Assistant',
      desc:
        lang === 'ta'
          ? 'தமிழிலேயே பேசி கால்நடை வகை, இனம், பால் அளவு மற்றும் விலையை எளிதாகப் பதிவு செய்யுங்கள்.'
          : 'List cattle effortlessly by speaking in colloquial Tamil or English via browser speech recognition.',
      color: 'text-terracotta-500',
      bg: 'bg-terracotta-50',
      action: onOpenVoiceModal,
      actionLabel: lang === 'ta' ? 'குரலில் பேசுங்கள்' : 'Start Voice Listing'
    },
    {
      icon: Sparkles,
      title: lang === 'ta' ? 'அரசு நியாய விலை மதிப்பீடு' : 'Fair-Price Benchmark',
      desc:
        lang === 'ta'
          ? 'TANUVAS மற்றும் NDDB அதிகாரப்பூர்வ ஆராய்ச்சி தரவு அடிப்படையில் கால்நடையின் நியாய விலையை அறியலாம்.'
          : 'Attributable price breakdown based on official TANUVAS and NDDB dairy survey parameters.',
      color: 'text-forest-800',
      bg: 'bg-forest-50',
      action: onOpenEstimatorModal,
      actionLabel: lang === 'ta' ? 'விலை கணக்கிடுங்கள்' : 'Estimate Price'
    },
    {
      icon: UserCheck,
      title: lang === 'ta' ? 'ஊராட்சி உதவிப் பதிவு' : 'Panchayat Representative',
      desc:
        lang === 'ta'
          ? 'முதிய மற்றும் ஸ்மார்ட்போன் இல்லாத விவசாயிகளுக்கு கிராம சபை சான்றுடன் நேரடி உதவிப் பதிவு.'
          : 'Enables Panchayat reps to onboard digitally constrained farmers with verified informed consent.',
      color: 'text-forest-700',
      bg: 'bg-sage-100',
      action: onOpenAssistedModal,
      actionLabel: lang === 'ta' ? 'உதவிப் பதிவு செய்க' : 'Assisted Onboarding'
    }
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-sage-200 bg-gradient-to-b from-sage-50/60 via-ivory-100 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 section-badge shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-forest-800" />
              <span>{lang === 'ta' ? 'அங்கீகரிக்கப்பட்ட கிராம ஊராட்சி கால்நடை மையம்' : 'Gram Panchayat Verified Livestock Marketplace'}</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-charcoal-800 tracking-tight leading-[1.1]">
              {lang === 'ta' ? (
                <>
                  கிராமத்து விவசாயிகளுக்கு<br />
                  <span className="text-forest-800">நேரடி நியாய விலை</span> சந்தை
                </>
              ) : (
                <>
                  Connecting Farmers,<br />
                  <span className="text-forest-800">Empowering Villages.</span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-charcoal-500 leading-relaxed max-w-2xl mx-auto">
              {t('subTagline')}
            </p>

            {/* Unified Search Box */}
            <form
              onSubmit={handleQuickSearch}
              className="mt-8 p-3 rounded-3xl bg-white border border-sage-200 shadow-card flex flex-col md:flex-row gap-2 max-w-3xl mx-auto"
            >
              <div className="flex-1 flex items-center gap-2.5 px-3 py-2 border-b md:border-b-0 md:border-r border-sage-200">
                <Search className="w-4 h-4 text-forest-800 flex-shrink-0" />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-transparent border-0 outline-none text-charcoal-800 placeholder:text-charcoal-400 p-0"
                />
              </div>

              <div className="w-full md:w-44 flex items-center gap-2 px-2 py-1 border-b md:border-b-0 md:border-r border-sage-200">
                <MapPin className="w-4 h-4 text-forest-700 flex-shrink-0" />
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full text-xs bg-transparent border-0 outline-none text-charcoal-800 font-semibold p-0 cursor-pointer"
                >
                  <option value="all">{lang === 'ta' ? 'அனைத்து மாவட்டம்' : 'All Districts'}</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1 md:pt-0">
                <button
                  type="button"
                  onClick={onOpenVoiceModal}
                  className="px-3.5 py-2.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 transition flex items-center gap-1.5 flex-shrink-0"
                  title="Speak in Tamil to search or list"
                >
                  <Mic className="w-4 h-4 text-amber-700" />
                  <span className="hidden sm:inline">{lang === 'ta' ? 'குரல்' : 'Voice'}</span>
                </button>

                <button
                  type="submit"
                  className="btn-forest w-full md:w-auto text-xs px-6 py-2.5"
                >
                  <span>{t('btnSearch')}</span>
                </button>
              </div>
            </form>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-6">
              {stats.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-white border border-sage-200 shadow-sm text-center"
                  >
                    <Icon className="w-4 h-4 text-forest-700 mx-auto mb-1.5" />
                    <div className="font-display font-black text-xl text-charcoal-800">{s.value}</div>
                    <div className="text-[11px] text-charcoal-500 mt-0.5">{s.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Livestock Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="section-badge mb-2">
              <Star className="w-3.5 h-3.5 text-forest-800" />
              <span>{lang === 'ta' ? 'பிரிவுகள்' : 'Livestock Categories'}</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-charcoal-800">
              {lang === 'ta' ? 'கால்நடை வகைகளைத் தேர்ந்தெடுக்கவும்' : 'Explore by Category'}
            </h2>
          </div>
          <button
            onClick={() => onNavigate('browse')}
            className="text-xs font-bold text-forest-800 hover:text-forest-900 flex items-center gap-1"
          >
            <span>{lang === 'ta' ? 'அனைத்தையும் காண்க' : 'View All'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => onNavigate('browse', { category: c.id })}
              className="premium-card p-4 text-center group flex flex-col items-center justify-center transition-all hover:border-forest-700"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                {c.icon}
              </div>
              <span className="font-display font-bold text-xs sm:text-sm text-charcoal-800 group-hover:text-forest-800">
                {c.name}
              </span>
              <span className="text-[10px] text-charcoal-400 mt-0.5">{c.count} listings</span>
            </button>
          ))}
        </div>
      </section>

      {/* 3 Pillar Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="premium-card p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className={`w-12 h-12 rounded-2xl ${f.bg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${f.color}`} />
                  </div>
                  <h3 className="font-display font-bold text-lg text-charcoal-800">{f.title}</h3>
                  <p className="text-xs text-charcoal-500 leading-relaxed">{f.desc}</p>
                </div>

                <button
                  onClick={f.action}
                  className="btn-sage w-full text-xs font-bold py-2 justify-between mt-2"
                >
                  <span>{f.actionLabel}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Livestock Listings Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="section-badge mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-forest-800" />
              <span>{lang === 'ta' ? 'சமீபத்திய கால்நடைகள்' : 'Featured Marketplace'}</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-charcoal-800">
              {lang === 'ta' ? 'சரிபார்க்கப்பட்ட பண்ணை கால்நடைகள்' : 'Verified Livestock Available Nearby'}
            </h2>
            <p className="text-xs text-charcoal-500 mt-1">
              {lang === 'ta'
                ? 'உறுதிப்படுத்தப்பட்ட பால் அளவு, தடுப்பூசி சான்றிதழ் மற்றும் நேரடி பண்ணை பார்வை வாய்ப்புடன்'
                : 'With verified daily milk yield, vaccination records, and scheduled physical milking inspections'}
            </p>
          </div>

          <button
            onClick={() => onNavigate('browse')}
            className="btn-forest text-xs px-4 py-2"
          >
            <span>{lang === 'ta' ? 'அனைத்து கால்நடைகள்' : 'Browse All'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-72 rounded-3xl bg-ivory-200 border border-sage-200 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((listing) => (
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
    </div>
  );
};
