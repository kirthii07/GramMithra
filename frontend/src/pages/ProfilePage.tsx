import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Listing } from '../types';
import { ListingCard } from '../components/ListingCard';
import {
  User,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Heart,
  Package,
  Users,
  LogOut,
  PlusCircle,
  RotateCcw
} from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
  onSelectListing: (listing: Listing) => void;
  onOpenAssistedModal: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onNavigate,
  onSelectListing,
  onOpenAssistedModal
}) => {
  const { lang, t } = useLanguage();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'listings' | 'favorites' | 'assisted'>('listings');
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [favoriteListings, setFavoriteListings] = useState<Listing[]>([]);
  const [assistedFarmers, setAssistedFarmers] = useState<any[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const [allListings, favs, favIds] = await Promise.all([
        api.getListings({ seller_id: user?.id, include_demo: true }),
        api.getFavorites(),
        api.getFavoriteIds()
      ]);
      setMyListings(allListings);
      setFavoriteListings(favs);
      setFavoriteIds(favIds);

      if (user?.role === 'panchayat_rep' || user?.role === 'admin') {
        const farmers = await api.getAssistedFarmers();
        setAssistedFarmers(farmers);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (id: number) => {
    try {
      const res = await api.toggleFavorite(id);
      if (!res.favorited) {
        setFavoriteListings((prev) => prev.filter((l) => l.id !== id));
        setFavoriteIds((prev) => prev.filter((x) => x !== id));
      }
    } catch {}
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h2 className="font-display font-bold text-xl text-charcoal-800">Please Login</h2>
        <button onClick={() => onNavigate('login')} className="btn-forest text-xs px-6 py-2.5">
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sage-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-forest-800 text-white font-black text-2xl flex items-center justify-center shadow-md">
            {user.full_name.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl sm:text-2xl font-bold text-charcoal-800">
                {user.full_name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-forest-50 text-forest-800 border border-forest-200">
                {user.role}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-charcoal-500">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-forest-700" />
                {user.phone}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-forest-700" />
                {user.village ? `${user.village}, ` : ''}{user.panchayat || 'Kangeyam'}, {user.district || 'Tiruppur'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => onNavigate('create-listing')}
            className="btn-forest text-xs py-2 px-3.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Animal</span>
          </button>
          <button
            onClick={logout}
            className="btn-sage text-xs py-2 px-3 text-charcoal-600 hover:text-terracotta-500"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-sage-200 pb-2">
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'listings'
              ? 'bg-forest-800 text-white shadow-sm'
              : 'bg-white text-charcoal-700 border border-sage-200 hover:bg-sage-50'
          }`}
        >
          My Livestock ({myListings.length})
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'favorites'
              ? 'bg-forest-800 text-white shadow-sm'
              : 'bg-white text-charcoal-700 border border-sage-200 hover:bg-sage-50'
          }`}
        >
          Saved Favorites ({favoriteListings.length})
        </button>

        {(user.role === 'panchayat_rep' || user.role === 'admin') && (
          <button
            onClick={() => setActiveTab('assisted')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'assisted'
                ? 'bg-forest-800 text-white shadow-sm'
                : 'bg-white text-charcoal-700 border border-sage-200 hover:bg-sage-50'
            }`}
          >
            Assisted Farmers ({assistedFarmers.length})
          </button>
        )}
      </div>

      {/* Tab 1: My Listings */}
      {activeTab === 'listings' && (
        <div>
          {myListings.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-sage-200 shadow-sm space-y-3">
              <div className="text-3xl">🌾</div>
              <h3 className="font-display font-bold text-charcoal-800 text-base">
                No active livestock posted yet
              </h3>
              <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
                Ready to sell your cow, buffalo, goat, sheep or poultry? Post your listing now with Tamil voice assistance.
              </p>
              <button
                onClick={() => onNavigate('create-listing')}
                className="btn-forest text-xs px-5 py-2.5 mt-2"
              >
                + Post Livestock Listing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myListings.map((l) => (
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

      {/* Tab 2: Saved Favorites */}
      {activeTab === 'favorites' && (
        <div>
          {favoriteListings.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-sage-200 shadow-sm space-y-2">
              <Heart className="w-8 h-8 mx-auto text-sage-300" />
              <h3 className="font-display font-bold text-charcoal-800 text-base">
                No saved favorites
              </h3>
              <p className="text-xs text-charcoal-500">
                Browse the marketplace and tap the heart icon on any listing to bookmark it here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteListings.map((l) => (
                <ListingCard
                  key={l.id}
                  listing={l}
                  onSelect={onSelectListing}
                  isFavorited={true}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Assisted Farmers */}
      {activeTab === 'assisted' && (
        <div className="bg-white p-6 rounded-3xl border border-sage-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-sage-100">
            <div>
              <h3 className="font-display font-bold text-charcoal-800 text-base">
                Assisted Farmers Roster
              </h3>
              <p className="text-xs text-charcoal-500">
                Farmers registered with official Panchayat representative witness and consent.
              </p>
            </div>
            <button
              onClick={onOpenAssistedModal}
              className="btn-forest text-xs py-2 px-3.5"
            >
              + Onboard New Farmer
            </button>
          </div>

          <div className="divide-y divide-sage-100">
            {assistedFarmers.map((f) => (
              <div key={f.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-charcoal-800">{f.full_name}</div>
                  <div className="text-charcoal-500">
                    {f.phone} • {f.village || f.panchayat}, {f.district}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-sage-100 text-forest-800 font-bold text-[10px]">
                  Verified Seller
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
