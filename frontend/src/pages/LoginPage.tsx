import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Lock, Phone, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Logo } from '../components/Logo';

interface LoginPageProps {
  onSuccess: () => void;
  onNavigateToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onNavigateToRegister
}) => {
  const { lang, t } = useLanguage();
  const { login, quickDemoLogin } = useAuth();

  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(phoneOrEmail, password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoPick = async (role: 'seller' | 'panchayat_rep' | 'admin' | 'buyer') => {
    setLoading(true);
    setError('');
    try {
      await quickDemoLogin(role);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl p-8 border border-sage-200 shadow-card space-y-6">
          
          {/* Logo & Header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <Logo size="lg" showText={false} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-black text-charcoal-800">{t('navLogin')}</h1>
              <p className="text-xs text-charcoal-500 mt-1">
                {lang === 'ta' ? 'கிராம மித்ரா கணக்கில் உள்நுழையவும்' : 'Access your Gram Mitra farmer or buyer account'}
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-800">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-charcoal-800 block mb-1.5">
                Mobile Number or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="10-digit mobile number or email"
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs"
                />
                <Phone className="w-4 h-4 text-forest-700 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-charcoal-800 block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs"
                />
                <Lock className="w-4 h-4 text-forest-700 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-forest w-full py-3 text-xs font-bold shadow-md disabled:opacity-50"
            >
              <span>{loading ? 'Logging in...' : t('navLogin')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Demo Accounts Section */}
          <div className="pt-4 border-t border-sage-100 space-y-3">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
              <span className="text-[11px] uppercase font-extrabold text-amber-900 tracking-wider">
                1-Click Demo Accounts (For Presentations)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  role: 'seller',
                  label: '🌾 Selvam',
                  tag: 'Farmer / Seller',
                  cred: 'Farmer@123',
                  bg: 'bg-forest-50 hover:bg-forest-100 border-forest-200 text-forest-900'
                },
                {
                  role: 'buyer',
                  label: '🛒 Kavitha',
                  tag: 'Prospective Buyer',
                  cred: 'Buyer@123',
                  bg: 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900'
                },
                {
                  role: 'panchayat_rep',
                  label: '🏛️ Murugesan',
                  tag: 'Panchayat Rep',
                  cred: 'Panchayat@123',
                  bg: 'bg-sage-100 hover:bg-sage-200 border-sage-300 text-forest-800'
                },
                {
                  role: 'admin',
                  label: '🛡️ Dr. Sundaram',
                  tag: 'Platform Admin',
                  cred: 'Admin@123',
                  bg: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-900'
                }
              ].map(({ role, label, tag, cred, bg }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleDemoPick(role as any)}
                  className={`p-2.5 rounded-2xl text-left border transition ${bg}`}
                >
                  <span className="block text-[9px] font-bold uppercase tracking-wider opacity-75">
                    {tag}
                  </span>
                  <span className="font-extrabold text-xs block">{label}</span>
                  <span className="text-[9px] font-medium opacity-60">PW: {cred}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Register Link */}
          <div className="text-center pt-2">
            <button
              onClick={onNavigateToRegister}
              className="text-xs text-forest-800 font-bold hover:underline"
            >
              {lang === 'ta' ? 'புதிய கணக்கு உருவாக்க? பதிவு செய்க' : "Don't have an account? Register here"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
