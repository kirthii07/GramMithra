import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Listing, PanchayatItem } from '../types';
import { ListingCard } from '../components/ListingCard';
import { LeafletMap } from '../components/LeafletMap';
import {
  Search,
  Filter,
  MapPin,
  Compass,
  Sliders,
  RotateCcw,
  LayoutGrid,
  Map as MapIcon,
  Columns,
  Navigation,
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

  // GPS Radius state
  const [useGps, setUseGps] = useState(false);
  const [gpsRadius, setGpsRadius] = useState<number>(50); // Default 50 km
  const [coords, setCoords] = useState<[number, number]>([11.0042, 77.5612]); // Default Kangeyam

  // Data state
  const [listings, setListings] = useState<Listing[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [panchayats, setPanchayats] = useState<PanchayatItem[]>([]);
  const [breedsCatalog, setBreedsCatalog] = useState<Record<string, string[]>>({});
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Layout view mode: 'grid' | 'map' | 'split'
  const [viewMode, setViewMode] = useState<'grid' | 'map' | 'split'>('split');
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
          setSortBy('distance');
        },
        () => {
          // If denied, use default Kangeyam center
          setUseGps(true);
        }
      );
    } else {
      setUseGps(true);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6" style={{ minHeight: '100vh' }}>
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-4 sm:p-6 rounded-3xl">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-black text-white">
            {lang === 'ta' ? 'கால்நடை சந்தை தேடல்' : 'Livestock Discovery Hub'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'ta'
              ? `${listings.length} கால்நடைகள் கண்டுபிடிக்கப்பட்டன (ஜி.பி.எஸ் & ஊராட்சி வாரியாக)`
              : `${listings.length} live livestock found with GPS radius & Panchayat filtering`}
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="p-1 rounded-xl flex items-center gap-1 text-xs" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-emerald-700 text-white font-bold' : 'text-emerald-500 hover:bg-emerald-900/30'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`hidden lg:block p-1.5 rounded-lg transition ${viewMode === 'split' ? 'bg-emerald-700 text-white font-bold' : 'text-emerald-500 hover:bg-emerald-900/30'}`}
              title="Split View (Listings + Map)"
            >
              <Columns className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-lg transition ${viewMode === 'map' ? 'bg-emerald-700 text-white font-bold' : 'text-emerald-500 hover:bg-emerald-900/30'}`}
              title="Map View"
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            className="lg:hidden px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 text-emerald-400"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => { setSelectedCategory(c.id); setSelectedBreed('all'); }}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition flex-shrink-0 ${
              selectedCategory === c.id
                ? 'bg-emerald-700 text-white shadow-glow-sm'
                : 'text-emerald-400 hover:bg-emerald-900/30'
            }`}
            style={selectedCategory !== c.id ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(16,185,129,0.2)' } : {}}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Filters Sidebar */}
        <aside className={`lg:block ${showFilterDrawer ? 'block' : 'hidden'} lg:col-span-1 glass-card p-5 rounded-3xl space-y-5 relative z-20`}>
          <div className="flex items-center justify-between pb-3 border-b border-emerald-900/30">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'ta' ? 'தேடல் வடிகட்டிகள்' : 'Filter Options'}</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-slate-400 hover:text-emerald-300 flex items-center gap-1 font-semibold transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t('btnReset')}</span>
            </button>
          </div>

          {/* Keyword Search */}
          <div>
            <label className="text-xs font-bold text-emerald-200 block mb-1">
              {lang === 'ta' ? 'முக்கிய சொல்' : 'Keyword'}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') fetchFilteredListings(); }}
                className="input-light w-full text-xs pl-8"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>
          </div>

          {/* GPS Proximity / Radius Filter */}
          <div className="p-3.5 rounded-2xl border space-y-3" style={{ background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.25)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('radiusFilter')}</span>
              </div>
              <button
                onClick={handleGetCurrentLocation}
                className="text-[10px] text-emerald-400 font-bold hover:underline"
              >
                📍 {lang === 'ta' ? 'என் இருப்பிடம்' : 'My GPS'}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-200 font-semibold">
              <span>{useGps ? `${gpsRadius} km radius active` : 'Off (All distances)'}</span>
              <button
                onClick={() => setUseGps(!useGps)}
                className={`text-[10px] px-2 py-0.5 rounded font-bold transition ${useGps ? 'bg-emerald-600 text-white' : 'bg-white/10 text-slate-300'}`}
              >
                {useGps ? 'ON' : 'OFF'}
              </button>
            </div>

            {useGps && (
              <div>
                <input
                  type="range"
                  min="5"
                  max="150"
                  step="5"
                  value={gpsRadius}
                  onChange={(e) => setGpsRadius(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>5 km</span>
                  <span>50 km</span>
                  <span>150 km</span>
                </div>
              </div>
            )}
          </div>

          {/* District & Panchayat Filter */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-emerald-200 block mb-1">
                {t('selectDistrict')}
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                  setSelectedPanchayat('all');
                }}
                className="select-light w-full text-xs"
              >
                <option value="all">{t('allDistricts')}</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {panchayats.length > 0 && (
              <div>
                <label className="text-xs font-bold text-emerald-200 block mb-1">
                  {t('selectPanchayat')}
                </label>
                <select
                  value={selectedPanchayat}
                  onChange={(e) => {
                    const pName = e.target.value;
                    setSelectedPanchayat(pName);
                    // Center map on this panchayat
                    const found = panchayats.find(p => p.name === pName);
                    if (found) setCoords([found.lat, found.lon]);
                  }}
                  className="select-light w-full text-xs"
                >
                  <option value="all">{t('allPanchayats')}</option>
                  {panchayats.map(p => <option key={p.name} value={p.name}>{p.name} ({p.taluk})</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Breed Dropdown */}
          {selectedCategory !== 'all' && breedsCatalog[selectedCategory] && (
            <div>
              <label className="text-xs font-bold text-emerald-200 block mb-1">
                {lang === 'ta' ? 'இனம் (Breed)' : 'Breed'}
              </label>
              <select
                value={selectedBreed}
                onChange={(e) => setSelectedBreed(e.target.value)}
                className="select-light w-full text-xs"
              >
                <option value="all">All Breeds</option>
                {breedsCatalog[selectedCategory].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          )}

          {/* Price Range */}
          <div>
            <label className="text-xs font-bold text-emerald-200 block mb-1">
              {t('priceRange')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder={t('minPrice')}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="input-light text-xs w-full"
              />
              <input
                type="number"
                placeholder={t('maxPrice')}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="input-light text-xs w-full"
              />
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-xs font-bold text-emerald-200 block mb-1">
              {t('sortBy')}
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="select-light w-full text-xs"
            >
              <option value="newest">{t('sortNewest')}</option>
              {useGps && <option value="distance">{t('sortDistance')}</option>}
              <option value="price_asc">{t('sortPriceAsc')}</option>
              <option value="price_desc">{t('sortPriceDesc')}</option>
            </select>
          </div>

          {/* Synthetic Demo Data Toggle */}
          <div className="pt-2 border-t border-emerald-900/30">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-200">
              <input
                type="checkbox"
                checked={includeDemo}
                onChange={(e) => setIncludeDemo(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 bg-white/20"
              />
              <span>{t('includeDemoLabel')}</span>
            </label>
            <p className="text-[10px] text-slate-400 mt-1 pl-5">
              {t('demoDataSubtitle')}
            </p>
          </div>

          <button
            onClick={fetchFilteredListings}
            className="w-full py-2.5 rounded-xl btn-primary font-bold text-xs shadow-md"
          >
            {t('btnSearch')}
          </button>
        </aside>

        {/* Content View: Grid, Map or Split */}
        <div className={`space-y-6 ${viewMode === 'grid' ? 'lg:col-span-3' : viewMode === 'split' ? 'lg:col-span-3' : 'lg:col-span-3'}`}>
          {viewMode === 'map' ? (
            <div className="bg-white p-4 rounded-3xl border border-earth-300 shadow-sm">
              <LeafletMap
                center={coords}
                radiusKm={useGps ? gpsRadius : undefined}
                listings={listings}
                onListingSelect={onSelectListing}
                className="h-[650px] w-full"
              />
            </div>
          ) : viewMode === 'split' ? (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* Left: Cards */}
              <div className="xl:col-span-7 space-y-4">
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(n => <div key={n} className="h-64 rounded-2xl bg-sand-200 animate-pulse" />)}
                  </div>
                ) : listings.length === 0 ? (
                  <div className="bg-white p-12 text-center rounded-3xl border border-earth-200 space-y-3">
                    <div className="text-4xl">🌾</div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {lang === 'ta' ? 'பொருத்தமான கால்நடைகள் காணப்படவில்லை' : 'No Livestock Matches Found'}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {lang === 'ta' ? 'வேறு ஒரு பஞ்சாயத்து அல்லது அதிக தொலைவு ஆரம் (GPS Radius) தேர்ந்தெடுத்து பார்க்கவும்.' : 'Try expanding the GPS radius slider or resetting the filter options.'}
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="px-4 py-2 rounded-xl bg-primary-700 text-white text-xs font-bold"
                    >
                      {t('btnReset')}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {listings.map(l => (
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
              </div>

              {/* Right: Sticky Map View */}
              <div className="hidden xl:block xl:col-span-5 sticky top-28 bg-white p-3 rounded-3xl border border-earth-300 shadow-sm">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-earth-100 text-xs font-bold text-slate-800">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary-700" />
                    <span>{lang === 'ta' ? 'வரைபடம் (GPS)' : 'Live GPS Radar'}</span>
                  </div>
                  <span className="text-[11px] font-normal text-slate-500">{listings.length} pins</span>
                </div>
                <LeafletMap
                  center={coords}
                  radiusKm={useGps ? gpsRadius : undefined}
                  listings={listings}
                  onListingSelect={onSelectListing}
                  className="h-[580px] w-full"
                />
              </div>
            </div>
          ) : (
            /* Pure Grid View */
            <div>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(n => <div key={n} className="h-64 rounded-2xl bg-sand-200 animate-pulse" />)}
                </div>
              ) : listings.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-3xl border border-earth-200">
                  <p className="text-sm text-slate-600">No listings found matching criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map(l => (
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
