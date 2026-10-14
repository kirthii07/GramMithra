import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Listing, PanchayatItem } from '../types';
import { ListingCard } from '../components/ListingCard';
import {
  Search,
  Filter,
  MapPin,
  Sliders,
  RotateCcw,
  Navigation,
  Compass,
  AlertCircle
} from 'lucide-react';

interface BrowseListingsPageProps {
  initialSearch?: string;
  initialCategory?: string;
  onSelectListing: (listing: Listing) => void;
}

export const BrowseListingsPage: React.FC<BrowseListingsPageProps> = ({
  initialSearch = '',
  initialCategory = 'all',
  onSelectListing
}) => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();

  // Filters state
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBreed, setSelectedBreed] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedPanchayat, setSelectedPanchayat] = useState('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState('newest');
  const [includeDemo, setIncludeDemo] = useState(true);

  // Location Proximity State (GPS or Manual Pin)
  const [useGps, setUseGps] = useState(false);
  const [gpsRadius, setGpsRadius] = useState<number>(50); // Default 50 km
  const [coords, setCoords] = useState<[number, number]>([11.0042, 77.5612]); // Default Kangeyam center
  const [locationLabel, setLocationLabel] = useState<string>('Kongu Valley (Kangeyam / Tiruppur)');

  // Data state
  const [listings, setListings] = useState<Listing[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [panchayats, setPanchayats] = useState<PanchayatItem[]>([]);
  const [breedsCatalog, setBreedsCatalog] = useState<Record<string, string[]>>({});
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  useEffect(() => {
    api.getDistricts().then(setDistricts).catch(() => {});
    api.getSupportedBreeds().then(setBreedsCatalog).catch(() => {});
    if (user) {
      api.getFavoriteIds().then(setFavoriteIds).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (selectedDistrict && selectedDistrict !== 'all') {
      api.getPanchayats(selectedDistrict).then(setPanchayats).catch(() => {});
    } else {
      setPanchayats([]);
    }
  }, [selectedDistrict]);

  useEffect(() => {
    fetchFilteredListings();
  }, [
    selectedCategory,
    selectedBreed,
    selectedDistrict,
    selectedPanchayat,
    sortBy,
    includeDemo,
    useGps,
    gpsRadius,
    coords
  ]);

  const fetchFilteredListings = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        include_demo: includeDemo,
        sort_by: sortBy
      };

      if (searchTerm) params.search = searchTerm;
      if (selectedCategory && selectedCategory !== 'all') params.livestock_type = selectedCategory;
      if (selectedBreed && selectedBreed !== 'all') params.breed = selectedBreed;
      if (selectedDistrict && selectedDistrict !== 'all') params.district = selectedDistrict;
      if (selectedPanchayat && selectedPanchayat !== 'all') params.panchayat = selectedPanchayat;
      if (minPrice) params.min_price = parseFloat(minPrice);
      if (maxPrice) params.max_price = parseFloat(maxPrice);

      if (useGps && coords) {
        params.latitude = coords[0];
        params.longitude = coords[1];
        params.radius_km = gpsRadius;
      }

      const results = await api.getListings(params);
      setListings(results);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords([pos.coords.latitude, pos.coords.longitude]);
          setUseGps(true);
          setLocationLabel('Current GPS Location');
          setSortBy('distance');
        },
        () => {
          // If denied, fallback smoothly to Kangeyam agricultural center
          setUseGps(true);
          setLocationLabel('Kangeyam Market Center');
        }
      );
    } else {
      setUseGps(true);
      setLocationLabel('Kangeyam Market Center');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedBreed('all');
    setSelectedDistrict('all');
    setSelectedPanchayat('all');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setUseGps(false);
    setIncludeDemo(true);
  };

  const handleToggleFavorite = async (id: number) => {
    try {
      const res = await api.toggleFavorite(id);
      if (res.favorited) {
        setFavoriteIds(prev => [...prev, id]);
      } else {
        setFavoriteIds(prev => prev.filter(x => x !== id));
      }
    } catch {}
  };

  const categories = [
    { id: 'all', name: t('catAll') },
    { id: 'cow', name: t('catCow') },
    { id: 'buffalo', name: t('catBuffalo') },
    { id: 'goat', name: t('catGoat') },
    { id: 'sheep', name: t('catSheep') },
    { id: 'hen', name: t('catHen') },
    { id: 'chicken', name: t('catChicken') },
    { id: 'duck', name: t('catDuck') }
  ];

  const currentBreeds =
    selectedCategory !== 'all' && breedsCatalog[selectedCategory]
      ? breedsCatalog[selectedCategory]
      : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-sage-200 shadow-sm">
        <div>
          <div className="section-badge mb-2">
            <Compass className="w-3.5 h-3.5 text-forest-700" />
            <span>{lang === 'ta' ? 'ஊராட்சி கால்நடை சந்தை' : 'Panchayat Discovery'}</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-charcoal-800">
            {lang === 'ta' ? 'கால்நடை சந்தை தேடல்' : 'Livestock Marketplace'}
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            {lang === 'ta'
              ? `${listings.length} கால்நடைகள் காட்சிப்படுத்தப்பட்டுள்ளன (கிராமம் & தூரம் வாரியாக)`
              : `${listings.length} livestock listings found with radius and Panchayat filtering`}
          </p>
        </div>

        {/* Location & Filter Toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleGetCurrentLocation}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
              useGps
                ? 'bg-forest-800 text-white border-forest-900 shadow-sm'
                : 'bg-sage-100 text-forest-800 border-sage-200 hover:bg-sage-200'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{useGps ? `${gpsRadius} km Proximity` : 'Use GPS Location'}</span>
          </button>

          <button
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            className="lg:hidden px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-ivory-200 text-charcoal-800 border border-sage-300"
          >
            <Filter className="w-3.5 h-3.5 text-forest-700" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setSelectedCategory(c.id);
              setSelectedBreed('all');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex-shrink-0 border ${
              selectedCategory === c.id
                ? 'bg-forest-800 text-white border-forest-900 shadow-sm'
                : 'bg-white text-charcoal-700 border-sage-200 hover:bg-sage-50'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Main Grid: Filters Sidebar + Listings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Filters Sidebar */}
        <aside
          className={`lg:block ${
            showFilterDrawer ? 'block' : 'hidden'
          } lg:col-span-1 bg-white p-5 rounded-3xl border border-sage-200 shadow-sm space-y-5`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-sage-100">
            <div className="flex items-center gap-2 font-bold text-charcoal-800 text-sm">
              <Sliders className="w-4 h-4 text-forest-700" />
              <span>{lang === 'ta' ? 'தேடல் வடிகட்டிகள்' : 'Filter Options'}</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-charcoal-500 hover:text-forest-800 flex items-center gap-1 font-semibold transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t('btnReset')}</span>
            </button>
          </div>

          {/* Keyword Search */}
          <div>
            <label className="text-xs font-bold text-charcoal-800 block mb-1.5">
              {lang === 'ta' ? 'முக்கிய சொல்' : 'Keyword'}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') fetchFilteredListings();
                }}
                className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-sage-200 bg-white"
              />
              <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-2.5 top-3" />
            </div>
          </div>

          {/* Location Radius Slider */}
          <div className="p-3.5 rounded-2xl bg-sage-50 border border-sage-200 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-forest-800">
              <span className="flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-forest-700" />
                {t('radiusFilter')}
              </span>
              <span className="text-forest-700 font-extrabold">{gpsRadius} km</span>
            </div>

            <input
              type="range"
              min="5"
              max="150"
              step="5"
              value={gpsRadius}
              onChange={(e) => {
                setGpsRadius(Number(e.target.value));
                setUseGps(true);
              }}
              className="w-full accent-forest-800 cursor-pointer"
            />

            <div className="flex items-center justify-between text-[10px] text-charcoal-500 font-medium">
              <span>5 km</span>
              <span>25 km</span>
              <span>50 km</span>
              <span>150 km</span>
            </div>

            <div className="text-[10px] text-charcoal-500 pt-1 border-t border-sage-200">
              Center: <strong>{locationLabel}</strong>
            </div>
          </div>

          {/* District Selector */}
          <div>
            <label className="text-xs font-bold text-charcoal-800 block mb-1.5">
              {t('selectDistrict')}
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setSelectedPanchayat('all');
              }}
              className="w-full text-xs"
            >
              <option value="all">{t('allDistricts')}</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Gram Panchayat Selector */}
          {selectedDistrict !== 'all' && panchayats.length > 0 && (
            <div>
              <label className="text-xs font-bold text-charcoal-800 block mb-1.5">
                {t('selectPanchayat')}
              </label>
              <select
                value={selectedPanchayat}
                onChange={(e) => setSelectedPanchayat(e.target.value)}
                className="w-full text-xs"
              >
                <option value="all">{t('allPanchayats')}</option>
                {panchayats.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} ({p.taluk})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Breed Selector */}
          {currentBreeds.length > 0 && (
            <div>
              <label className="text-xs font-bold text-charcoal-800 block mb-1.5">
                {lang === 'ta' ? 'கால்நடை இனம்' : 'Breed'}
              </label>
              <select
                value={selectedBreed}
                onChange={(e) => setSelectedBreed(e.target.value)}
                className="w-full text-xs"
              >
                <option value="all">{lang === 'ta' ? 'அனைத்து இனங்கள்' : 'All Breeds'}</option>
                {currentBreeds.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Price Range */}
          <div>
            <label className="text-xs font-bold text-charcoal-800 block mb-1.5">
              {t('priceRange')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder={t('minPrice')}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full text-xs"
              />
              <input
                type="number"
                placeholder={t('maxPrice')}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full text-xs"
              />
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-xs font-bold text-charcoal-800 block mb-1.5">
              {t('sortBy')}
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full text-xs"
            >
              <option value="newest">{t('sortNewest')}</option>
              <option value="distance">{t('sortDistance')}</option>
              <option value="price_asc">{t('sortPriceAsc')}</option>
              <option value="price_desc">{t('sortPriceDesc')}</option>
            </select>
          </div>

          {/* Include Demo Toggle */}
          <div className="pt-2 border-t border-sage-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-charcoal-700">
              <input
                type="checkbox"
                checked={includeDemo}
                onChange={(e) => setIncludeDemo(e.target.checked)}
                className="rounded text-forest-800 focus:ring-forest-800 accent-forest-800"
              />
              <span>{t('includeDemoLabel')}</span>
            </label>
            <p className="text-[10px] text-charcoal-400 mt-1 pl-5">
              {t('demoDataSubtitle')}
            </p>
          </div>

          <button
            onClick={fetchFilteredListings}
            className="w-full py-2.5 rounded-xl btn-forest text-xs font-bold"
          >
            {t('btnSearch')}
          </button>
        </aside>

        {/* Listings Grid (Map removed completely) */}
        <main className="lg:col-span-3 space-y-5">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="h-72 rounded-3xl bg-ivory-200 border border-sage-200 animate-pulse"
                />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-sage-200 shadow-sm space-y-3">
              <div className="text-4xl">🌾</div>
              <h3 className="font-display font-bold text-charcoal-800 text-lg">
                {lang === 'ta' ? 'பொருத்தமான கால்நடைகள் காணப்படவில்லை' : 'No Livestock Matches Found'}
              </h3>
              <p className="text-xs text-charcoal-500 max-w-sm mx-auto leading-relaxed">
                {lang === 'ta'
                  ? 'வேறு ஒரு பஞ்சாயத்து அல்லது அதிக தொலைவு ஆரம் (GPS Radius) தேர்ந்தெடுத்து பார்க்கவும்.'
                  : 'Try adjusting the keyword search, increasing the radius slider, or resetting filters.'}
              </p>
              <button
                onClick={handleResetFilters}
                className="btn-forest text-xs px-5 py-2.5"
              >
                {t('btnReset')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {listings.map((l) => (
                <ListingCard
                  key={l.id}
                  listing={l}
                  onSelect={onSelectListing}
                  isFavorited={favoriteIds.includes(l.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
