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
  PlusCircle
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
        setFavoriteListings(prev => prev.filter(l => l.id !== id));
        setFavoriteIds(prev => prev.filter(x => x !== id));
      }
    } catch {}
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Please Login</h2>
        <button onClick={() => onNavigate('login')} className="px-5 py-2.5 rounded-xl btn-primary text-white font-bold text-xs">
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Profile Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-earth-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-primary-800 text-white font-black text-2xl flex items-center justify-center shadow-lg">
            {user.full_name.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{user.full_name}</h1>
              {user.is_verified && (
                <span className="p-1 rounded-full bg-emerald-100 text-emerald-800" title="Verified Profile">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.phone}</span>
              </span>
              {user.panchayat && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.village ? `${user.village}, ` : ''}{user.panchayat}, {user.district}</span>
                </span>
              )}
            </div>
            <div className="pt-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-sand-200 text-slate-800">
                Role: {user.role.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('create-listing')}
            className="px-4 py-2 rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('navPostListing')}</span>
          </button>
          <button
            onClick={logout}
            className="px-3 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 font-bold text-xs flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex gap-2 border-b border-emerald-900/30 pb-2">
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'listings' ? 'bg-emerald-700 text-white shadow' : 'text-slate-300 hover:bg-white/10'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{lang === 'ta' ? 'எனது பதிவுகள்' : 'My Listings'} ({myListings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'favorites' ? 'bg-emerald-700 text-white shadow' : 'text-slate-300 hover:bg-white/10'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>{lang === 'ta' ? 'விருப்பமானவை' : 'Saved Favorites'} ({favoriteListings.length})</span>
        </button>

        {(user.role === 'panchayat_rep' || user.role === 'admin') && (
          <button
            onClick={() => setActiveTab('assisted')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'assisted' ? 'bg-emerald-700 text-white shadow' : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{lang === 'ta' ? 'உதவி பெற்ற விவசாயிகள்' : 'Assisted Farmers'} ({assistedFarmers.length})</span>
          </button>
        )}
      </div>

      {/* Tab Contents */}
      {activeTab === 'listings' && (
        <div>
          {myListings.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-earth-200 space-y-3">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">You haven't posted any livestock yet.</h3>
              <button
                onClick={() => onNavigate('create-listing')}
                className="px-5 py-2.5 rounded-xl bg-primary-700 text-white font-bold text-xs shadow"
              >
                Post Your First Animal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myListings.map(l => (
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

      {activeTab === 'favorites' && (
        <div>
          {favoriteListings.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-earth-200">
              <p className="text-sm text-slate-500">No saved favorites.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteListings.map(l => (
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

      {activeTab === 'assisted' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white text-sm">
              Farmers Registered Under Your Panchayat Representative Authority
            </h3>
            <button
              onClick={onOpenAssistedModal}
              className="px-4 py-2 rounded-xl bg-primary-700 text-white font-bold text-xs flex items-center gap-1"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register Another Farmer</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-earth-300 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sand-100 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Farmer Name</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Panchayat & Village</th>
                    <th className="p-4">Consent Mode</th>
                    <th className="p-4">Witness</th>
                    <th className="p-4">Registered On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-earth-100 text-slate-800">
                  {assistedFarmers.map(f => (
                    <tr key={f.id} className="hover:bg-sand-50">
                      <td className="p-4 font-bold">{f.full_name}</td>
                      <td className="p-4">{f.phone}</td>
                      <td className="p-4">{f.village ? `${f.village}, ` : ''}{f.panchayat}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {f.consent_type}
                        </span>
                      </td>
                      <td className="p-4">{f.witness_name || '—'}</td>
                      <td className="p-4 text-slate-500">{new Date(f.registered_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
