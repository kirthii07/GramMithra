import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, Lock, Phone, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';

interface RegisterPageProps {
  onSuccess: () => void;
  onNavigateToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onSuccess,
  onNavigateToLogin
}) => {
  const { lang, t } = useLanguage();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller' | 'panchayat_rep'>('seller');
  const [district, setDistrict] = useState('Tiruppur');
  const [panchayat, setPanchayat] = useState('');
  const [village, setVillage] = useState('');
  const [panchayatId, setPanchayatId] = useState('');

  const [districts, setDistricts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getDistricts().then(setDistricts).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register({
        full_name: fullName,
        phone: phone,
        email: email || undefined,
        password: password,
        role: role,
        district: district,
        panchayat: panchayat,
        village: village,
        panchayat_id_number: role === 'panchayat_rep' ? panchayatId : undefined
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 animate-fade-in">
      <div className="bg-white text-[#19251E] p-8 rounded-3xl border border-[#D7E2D8] shadow-xl space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-[#19251E]">{t('navRegister')}</h1>
          <p className="text-xs text-[#58665D]">
            {lang === 'ta' ? 'விவசாயி அல்லது வாங்குபவராக கிராம மித்ராவில் இணையுங்கள்' : 'Join Gram Mitra Livestock Marketplace'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#19251E] block mb-1">Role / பாத்திரம் *</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'seller', label: 'Farmer / Seller' },
                { id: 'buyer', label: 'Buyer' },
                { id: 'panchayat_rep', label: 'Panchayat Rep' }
              ].map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id as any)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition text-center ${
                    role === r.id
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow'
                      : 'bg-[#FAF8F2] text-[#19251E] border-[#D7E2D8] hover:bg-[#EAF5EC]'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#19251E] block mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Selvam Periasamy"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-light w-full text-xs font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#19251E] block mb-1">Mobile Number (10 digits) *</label>
            <input
              type="tel"
              required
              pattern="[0-9]{10}"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-light w-full text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#19251E] block mb-1">{t('selectDistrict')}</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="select-light w-full text-xs"
              >
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#19251E] block mb-1">{t('selectPanchayat')} *</label>
              <input
                type="text"
                required
                placeholder="Panchayat Name"
                value={panchayat}
                onChange={(e) => setPanchayat(e.target.value)}
                className="input-light w-full text-xs"
              />
            </div>
          </div>

          {role === 'panchayat_rep' && (
            <div>
              <label className="text-xs font-bold text-[#19251E] block mb-1">Panchayat ID / Ward Number *</label>
              <input
                type="text"
                required
                placeholder="Official representative reference"
                value={panchayatId}
                onChange={(e) => setPanchayatId(e.target.value)}
                className="input-light w-full text-xs"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-[#19251E] block mb-1">Password *</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-light w-full text-xs font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl btn-primary text-white font-bold text-xs sm:text-sm transition shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <span>{loading ? 'Creating account...' : t('navRegister')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={onNavigateToLogin}
            className="text-xs text-primary-700 font-bold hover:underline"
          >
            {lang === 'ta' ? 'ஏற்கனவே கணக்கு உள்ளதா? உள்நுழையவும்' : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};
