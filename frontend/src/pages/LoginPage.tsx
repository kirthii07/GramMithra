import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Lock, Phone, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-1 opacity-10" />
        <div className="orb orb-2 opacity-10" />
      </div>
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-scale-in">
        <div className="glass-card rounded-3xl p-8 space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-800 flex items-center justify-center text-3xl mx-auto shadow-glow">
              🌿
            </div>
            <div>
              <h1 className="font-display text-2xl font-black text-white">{t('navLogin')}</h1>
              <p className="text-xs text-slate-500 mt-1">
                {lang === 'ta' ? 'கிராம மித்ரா கணக்கில் உள்நுழையவும்' : 'Access your Gram Mitra account'}
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-emerald-400/80 block mb-2">
                Mobile Number or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="10-digit mobile number or email"
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  className="input-dark pl-10"
                />
                <Phone className="w-4 h-4 text-emerald-600 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-emerald-400/80 block mb-2">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-dark pl-10"
                />
                <Lock className="w-4 h-4 text-emerald-600 absolute left-3 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 disabled:opacity-50"
            >
              <span>{loading ? 'Logging in...' : t('navLogin')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="pt-4 space-y-3" style={{ borderTop: '1px solid rgba(16, 185, 129, 0.15)' }}>
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] uppercase font-bold text-amber-400/70 tracking-wider">
                1-Click Demo Accounts
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { role: 'seller', label: '🌾 Selvam', tag: 'Farmer', color: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)', text: '#6ee7b7' },
                { role: 'panchayat_rep', label: '🏛️ Murugesan', tag: 'Panchayat', color: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.3)', text: '#93c5fd' },
                { role: 'admin', label: '🛡️ Dr. Sundaram', tag: 'Admin', color: 'rgba(168, 85, 247, 0.12)', border: 'rgba(168, 85, 247, 0.3)', text: '#c4b5fd' },
                { role: 'buyer', label: '🛒 Kavitha', tag: 'Buyer', color: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.25)', text: '#fbbf24' },
              ].map(({ role, label, tag, color, border, text }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleDemoPick(role as any)}
                  className="p-2.5 rounded-xl text-left text-xs font-bold transition-all duration-200 hover:scale-[1.02]"
                  style={{ background: color, border: `1px solid ${border}` }}
                >
                  <span className="block text-[10px] uppercase mb-0.5" style={{ color: text, opacity: 0.7 }}>{tag}</span>
                  <span style={{ color: text }}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center pt-1">
            <button
              onClick={onNavigateToRegister}
              className="text-xs text-emerald-400 font-bold hover:text-emerald-300 transition"
            >
              {lang === 'ta' ? 'புதிய கணக்கு உருவாக்க? பதிவு செய்க' : "Don't have an account? Register here"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
