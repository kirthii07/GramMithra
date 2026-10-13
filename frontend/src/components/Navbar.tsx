import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Notification } from '../types';
import {
  Sparkles,
  Globe,
  Bell,
  User,
  PlusCircle,
  LogOut,
  Shield,
  Calendar,
  Compass,
  CheckCheck,
  ChevronDown,
  UserCheck,
  Menu,
  X,
  Leaf,
  Zap
} from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  onOpenVoiceModal?: () => void;
  onOpenEstimatorModal?: () => void;
  onOpenAssistedModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  currentPage,
  onOpenVoiceModal,
  onOpenEstimatorModal,
  onOpenAssistedModal
}) => {
  const { lang, setLang, t } = useLanguage();
  const { user, logout, quickDemoLogin } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchNotifs = async () => {
    if (!user) return;
    try {
      const items = await api.getNotifications();
      setNotifications(items);
      setUnreadCount(items.filter(n => !n.is_read).length);
    } catch {}
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    fetchNotifs();
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#040d0a]/90 backdrop-glass border-b border-emerald-900/40 shadow-[0_4px_24px_rgba(0,0,0,0.5)]'
          : 'bg-[#040d0a]/70 backdrop-glass border-b border-emerald-900/20'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          
          {/* Logo & Brand */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
          >
            {/* Logo Icon */}
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0">
              <div className="w-full h-full rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-800 flex items-center justify-center text-xl shadow-glow-sm group-hover:shadow-glow transition-all duration-300 group-hover:scale-110">
                🌿
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#040d0a] animate-pulse-slow" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg sm:text-xl font-black tracking-tight text-white group-hover:text-emerald-300 transition">
                  Gram Mitra
                </span>
                <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                  கிராம மித்ரா
                </span>
              </div>
              <p className="text-[10px] text-emerald-400/60 font-medium hidden sm:block">
                {lang === 'ta' ? 'ஸ்மார்ட் கால்நடை மையம்' : 'Smart Panchayat Marketplace'}
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onNavigate('browse')}
              className={`nav-item ${currentPage === 'browse' ? 'active' : ''}`}
            >
              <Compass className="w-4 h-4" />
              <span>{t('navBrowse')}</span>
            </button>

            <button
              onClick={() => {
                if (onOpenEstimatorModal) onOpenEstimatorModal();
                else onNavigate('estimator');
              }}
              className="nav-item"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{t('navEstimator')}</span>
            </button>

            {user && (
              <button
                onClick={() => onNavigate('visits')}
                className={`nav-item ${currentPage === 'visits' ? 'active' : ''}`}
              >
                <Calendar className="w-4 h-4" />
                <span>{t('navVisits')}</span>
              </button>
            )}

            {(user?.role === 'panchayat_rep' || user?.role === 'admin') && (
              <button
                onClick={() => onNavigate('moderation')}
                className={`nav-item ${currentPage === 'moderation' ? 'active' : ''}`}
              >
                <Shield className="w-4 h-4" />
                <span>{t('navModeration')}</span>
              </button>
            )}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === 'ta' ? 'en' : 'ta')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200"
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                color: '#6ee7b7'
              }}
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'ta' ? 'English' : 'தமிழ்'}</span>
            </button>

            {/* Demo Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all duration-200"
                style={{
                  background: 'rgba(251, 191, 36, 0.1)',
                  border: '1px solid rgba(251, 191, 36, 0.25)',
                  color: '#fbbf24'
                }}
              >
                <Zap className="w-3 h-3" />
                <span>Demo</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {demoMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl p-2 z-50 animate-scale-in"
                  style={{
                    background: '#0d2318',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
                  }}
                >
                  <div className="px-2 py-1 text-[10px] uppercase font-bold text-emerald-500/60 tracking-wider mb-1">
                    Switch Test Account
                  </div>
                  {[
                    { role: 'seller', label: '🌾 Farmer Selvam', badge: 'Seller', color: 'emerald' },
                    { role: 'panchayat_rep', label: '🏛️ Rep Murugesan', badge: 'Panchayat', color: 'blue' },
                    { role: 'admin', label: '🛡️ Dr. Sundaram', badge: 'Admin', color: 'purple' },
                    { role: 'buyer', label: '🛒 Buyer Kavitha', badge: 'Buyer', color: 'amber' },
                  ].map(({ role, label, badge, color }) => (
                    <button
                      key={role}
                      onClick={() => { quickDemoLogin(role as any); setDemoMenuOpen(false); }}
                      className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-emerald-900/30 text-slate-200 font-medium flex items-center justify-between text-xs transition"
                    >
                      <span>{label}</span>
                      <span className={`text-[10px] bg-${color}-900/50 text-${color}-400 px-1.5 py-0.5 rounded-lg border border-${color}-700/50`}>{badge}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 rounded-xl transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(16, 185, 129, 0.15)' }}
                >
                  <Bell className="w-4 h-4 text-emerald-400" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl p-3 z-50 animate-scale-in max-h-96 overflow-y-auto"
                    style={{
                      background: '#0d2318',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.7)'
                    }}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-900/50 mb-2">
                      <span className="text-xs font-bold text-emerald-300">Notifications ({unreadCount} new)</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] text-emerald-400 font-semibold hover:text-emerald-300 flex items-center gap-1"
                        >
                          <CheckCheck className="w-3 h-3" />
                          <span>Mark all read</span>
                        </button>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-emerald-600">
                        No notifications yet
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-2.5 rounded-xl text-xs border transition ${
                              n.is_read
                                ? 'bg-emerald-950/20 border-emerald-900/30 text-slate-400'
                                : 'bg-emerald-900/20 border-emerald-700/30 text-emerald-200'
                            }`}
                          >
                            <div className="font-bold mb-0.5">{lang === 'ta' && n.title_ta ? n.title_ta : n.title}</div>
                            <p className="text-[11px] opacity-80">{lang === 'ta' && n.message_ta ? n.message_ta : n.message}</p>
                            <span className="text-[9px] text-emerald-600 mt-1 block">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Post Listing */}
            <button
              onClick={() => onNavigate('create-listing')}
              className="btn-primary hidden sm:inline-flex text-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('navPostListing')}</span>
            </button>

            {/* User Account */}
            {user ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onNavigate('profile')}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl transition-all duration-200"
                  style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-bold flex items-center justify-center text-xs shadow-glow-sm">
                    {user.full_name.charAt(0)}
                  </div>
                  <span className="text-xs font-semibold text-emerald-300 hidden lg:inline max-w-[100px] truncate">
                    {user.full_name}
                  </span>
                </button>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-emerald-600 hover:text-rose-400 hover:bg-rose-900/20 transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="btn-ghost text-xs px-4 py-2"
              >
                {t('navLogin')}
              </button>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-emerald-400 hover:bg-emerald-900/20 transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-emerald-900/30 px-4 pt-3 pb-4 space-y-2 animate-fade-in"
          style={{ background: '#040d0a' }}
        >
          <button
            onClick={() => { onNavigate('browse'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-emerald-900/20 flex items-center gap-2 text-sm font-medium text-emerald-300 transition"
          >
            <Compass className="w-4 h-4" />
            <span>{t('navBrowse')}</span>
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (onOpenEstimatorModal) onOpenEstimatorModal();
            }}
            className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-emerald-900/20 flex items-center gap-2 text-sm font-medium text-emerald-300 transition"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{t('navEstimator')}</span>
          </button>
          <button
            onClick={() => { onNavigate('create-listing'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2.5 px-3 rounded-xl btn-primary text-xs flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('navPostListing')}</span>
          </button>
          {user && (
            <button
              onClick={() => { onNavigate('visits'); setMobileMenuOpen(false); }}
              className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-emerald-900/20 flex items-center gap-2 text-sm font-medium text-emerald-300 transition"
            >
              <Calendar className="w-4 h-4" />
              <span>{t('navVisits')}</span>
            </button>
          )}
          {(user?.role === 'panchayat_rep' || user?.role === 'admin') && (
            <button
              onClick={() => { onNavigate('moderation'); setMobileMenuOpen(false); }}
              className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-emerald-900/20 flex items-center gap-2 text-sm font-medium text-emerald-300 transition"
            >
              <Shield className="w-4 h-4" />
              <span>{t('navModeration')}</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
