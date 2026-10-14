import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, Lock, Phone, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { Logo } from '../components/Logo';

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
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white p-8 rounded-3xl border border-sage-200 shadow-card space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Logo size="md" showText={false} />
          </div>
          <h1 className="font-display text-2xl font-black text-charcoal-800">{t('navRegister')}</h1>
          <p className="text-xs text-charcoal-500">
            {lang === 'ta'
              ? 'விவசாயி அல்லது வாங்குபவராக கிராம மித்ராவில் இணையுங்கள்'
              : 'Join Gram Mitra Rural Livestock Marketplace'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-charcoal-800 block mb-1.5">
              Role / பாத்திரம் *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'seller', label: 'Farmer' },
                { id: 'buyer', label: 'Buyer' },
                { id: 'panchayat_rep', label: 'Panchayat' }
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id as any)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition text-center ${
                    role === r.id
                      ? 'bg-forest-800 text-white border-forest-900 shadow-sm'
                      : 'bg-ivory-100 text-charcoal-700 border-sage-200 hover:bg-sage-100'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-charcoal-800 block mb-1.5">
              Full Name / முழுப் பெயர் *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Selvam Periasamy"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-charcoal-800 block mb-1.5">
              Mobile Number / அலைபேசி எண் *
            </label>
            <input
              type="text"
              required
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-charcoal-800 block mb-1.5">
                {t('selectDistrict')} *
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full text-xs"
              >
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-charcoal-800 block mb-1.5">
                Panchayat / ஊராட்சி
              </label>
              <input
                type="text"
                placeholder="e.g. Pappini"
                value={panchayat}
                onChange={(e) => setPanchayat(e.target.value)}
                className="w-full text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-charcoal-800 block mb-1.5">
              Village / கிராமம்
            </label>
            <input
              type="text"
              placeholder="e.g. Pappini Pudur"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              className="w-full text-xs"
            />
          </div>

          {role === 'panchayat_rep' && (
            <div>
              <label className="text-xs font-bold text-charcoal-800 block mb-1.5">
                Panchayat Representative ID / சான்றிதழ் எண் *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. TN-TPR-KGM-REP-042"
                value={panchayatId}
                onChange={(e) => setPanchayatId(e.target.value)}
                className="w-full text-xs"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-charcoal-800 block mb-1.5">
              Password / கடவுச்சொல் *
            </label>
            <input
              type="password"
              required
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-forest w-full py-3 text-xs font-bold shadow-md disabled:opacity-50"
          >
            <span>{loading ? 'Creating Account...' : t('navRegister')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={onNavigateToLogin}
            className="text-xs text-forest-800 font-bold hover:underline"
          >
            {lang === 'ta' ? 'ஏற்கனவே கணக்கு உள்ளதா? உள்நுழையவும்' : 'Already have an account? Login here'}
          </button>
        </div>
      </div>
    </div>
  );
};
