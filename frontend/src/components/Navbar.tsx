import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Notification } from '../types';
import { Logo } from './Logo';
import {
  Globe,
  Bell,
  User,
  PlusCircle,
  LogOut,
  Shield,
  Calendar,
  Compass,
  ChevronDown,
  Menu,
  X,
  Zap,
  Sparkles,
  RotateCcw,
  CheckCircle2
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
  const [resetDone, setResetDone] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (demoRef.current && !demoRef.current.contains(e.target as Node)) {
        setDemoMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
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

  const handleDemoSwitch = async (role: 'seller' | 'buyer' | 'panchayat_rep' | 'admin') => {
    setDemoMenuOpen(false);
    setMobileMenuOpen(false);
    await quickDemoLogin(role);
    onNavigate('home');
  };

  const handleResetDemoData = () => {
    api.resetDemoData();
    setResetDone(true);
    setDemoMenuOpen(false);
    setTimeout(() => {
      setResetDone(false);
      window.location.reload();
    }, 800);
  };

  return (
    <>
      {/* Presentation Demo Banner */}
      <div className="demo-banner px-4 py-1.5 text-xs flex items-center justify-between border-b border-amber-200">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-bold text-[10px] tracking-wider uppercase">
              Demo Mode
            </span>
            <span className="hidden sm:inline">
              Safe demonstration environment for college evaluation & field presentation.
            </span>
            <span className="sm:hidden">Demo Mode Active</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetDemoData}
              className="text-[11px] font-bold text-amber-900 hover:text-amber-950 flex items-center gap-1 underline underline-offset-2"
              title="Reset all demo listings, visits, and favorites to defaults"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{resetDone ? 'Resetting...' : 'Reset Demo Data'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sage-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
            
            {/* Logo */}
            <div
              onClick={() => onNavigate('home')}
              className="cursor-pointer group flex-shrink-0"
            >
              <Logo size="md" />
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => onNavigate('home')}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                  currentPage === 'home'
                    ? 'bg-sage-100 text-forest-800'
                    : 'text-charcoal-500 hover:text-forest-800 hover:bg-sage-50'
                }`}
              >
                {t('navHome')}
              </button>

              <button
                onClick={() => onNavigate('browse')}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                  currentPage === 'browse'
                    ? 'bg-sage-100 text-forest-800'
                    : 'text-charcoal-500 hover:text-forest-800 hover:bg-sage-50'
                }`}
              >
                {t('navBrowse')}
              </button>

              <button
                onClick={onOpenEstimatorModal}
                className="px-3.5 py-2 rounded-xl text-sm font-semibold text-charcoal-500 hover:text-forest-800 hover:bg-sage-50 transition flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-forest-700" />
                <span>{t('navEstimator')}</span>
              </button>

              {user && (
                <button
                  onClick={() => onNavigate('visits')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                    currentPage === 'visits'
                      ? 'bg-sage-100 text-forest-800'
                      : 'text-charcoal-500 hover:text-forest-800 hover:bg-sage-50'
                  }`}
                >
                  {t('navVisits')}
                </button>
              )}

              {(user?.role === 'panchayat_rep' || user?.role === 'admin') && (
                <button
                  onClick={() => onNavigate('moderation')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
                    currentPage === 'moderation'
                      ? 'bg-sage-100 text-forest-800'
                      : 'text-charcoal-500 hover:text-forest-800 hover:bg-sage-50'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-forest-700" />
                  <span>{t('navModeration')}</span>
                </button>
              )}
            </nav>

            {/* Right Action Bar */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Language Switcher */}
              <button
                onClick={() => setLang(lang === 'ta' ? 'en' : 'ta')}
                className="px-3 py-1.5 rounded-xl border border-sage-200 bg-sage-50 text-forest-800 text-xs font-bold hover:bg-sage-100 transition flex items-center gap-1.5"
                title="Switch Language"
              >
                <Globe className="w-3.5 h-3.5 text-forest-700" />
                <span>{lang === 'ta' ? 'English' : 'தமிழ்'}</span>
              </button>

              {/* 1-Click Demo Account Switcher Dropdown */}
              <div className="relative" ref={demoRef}>
                <button
                  onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                  className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-xs font-bold hover:bg-amber-100 transition flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                  <span className="hidden sm:inline">Demo Switcher</span>
                  <ChevronDown className="w-3 h-3 text-amber-800" />
                </button>

                {demoMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-elevated border border-sage-200 p-2 z-50">
                    <div className="px-3 py-2 border-b border-sage-100 mb-1">
                      <div className="text-xs font-bold text-charcoal-800">1-Click Demo Accounts</div>
                      <div className="text-[10px] text-charcoal-400">Instantly switch role for project presentation</div>
                    </div>

                    <div className="space-y-1">
                      {[
                        { role: 'seller', label: '🌾 Selvam (Farmer / Seller)', desc: 'Manage cattle, list livestock' },
                        { role: 'buyer', label: '🛒 Kavitha (Buyer)', desc: 'Browse, schedule farm visits' },
                        { role: 'panchayat_rep', label: '🏛️ Murugesan (Panchayat Rep)', desc: 'Assisted farmer registration' },
                        { role: 'admin', label: '🛡️ Dr. Sundaram (Admin)', desc: 'Audit logs & moderation queue' }
                      ].map(item => (
                        <button
                          key={item.role}
                          onClick={() => handleDemoSwitch(item.role as any)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs transition flex flex-col ${
                            user?.role === item.role
                              ? 'bg-forest-50 border border-forest-200 text-forest-800 font-bold'
                              : 'hover:bg-sage-50 text-charcoal-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">{item.label}</span>
                            {user?.role === item.role && <CheckCircle2 className="w-3.5 h-3.5 text-forest-800" />}
                          </div>
                          <span className="text-[10px] text-charcoal-400 font-normal mt-0.5">{item.desc}</span>
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-sage-100 mt-2 pt-2 px-1">
                      <button
                        onClick={handleResetDemoData}
                        className="w-full text-center py-1.5 text-[11px] font-bold text-terracotta-500 hover:bg-terracotta-50 rounded-lg transition"
                      >
                        Reset All Demo Records
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Notification Bell */}
              {user && (
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="p-2 rounded-xl border border-sage-200 text-charcoal-600 hover:bg-sage-50 hover:text-forest-800 transition relative"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-terracotta-500 text-white text-[9px] font-black flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-elevated border border-sage-200 p-3 z-50">
                      <div className="flex items-center justify-between pb-2 border-b border-sage-100 mb-2">
                        <span className="text-xs font-bold text-charcoal-800">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[10px] text-forest-700 hover:underline font-semibold"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {notifications.length === 0 ? (
                          <div className="text-center py-6 text-xs text-charcoal-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map(n => (
                            <div
                              key={n.id}
                              className={`p-2.5 rounded-xl text-xs ${
                                n.is_read ? 'bg-sage-50/50 text-charcoal-500' : 'bg-forest-50 text-forest-900 border border-forest-100'
                              }`}
                            >
                              <div className="font-bold">{lang === 'ta' && n.title_ta ? n.title_ta : n.title}</div>
                              <p className="text-[11px] mt-0.5 opacity-90">{lang === 'ta' && n.message_ta ? n.message_ta : n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sell Livestock CTA */}
              <button
                onClick={() => onNavigate('create-listing')}
                className="btn-forest text-xs px-3 sm:px-4 py-2 hidden sm:inline-flex"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t('navPostListing')}</span>
              </button>

              {/* Account / Login */}
              {user ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onNavigate('profile')}
                    className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-sage-200 bg-sage-50 text-forest-800 text-xs font-bold hover:bg-sage-100 transition flex items-center gap-1.5"
                    title={user.full_name}
                  >
                    <User className="w-4 h-4 text-forest-700" />
                    <span className="hidden md:inline truncate max-w-[100px]">{user.full_name}</span>
                  </button>
                  <button
                    onClick={logout}
                    className="p-2 rounded-xl text-charcoal-400 hover:text-terracotta-500 hover:bg-terracotta-50 transition"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onNavigate('login')}
                  className="btn-sage text-xs px-3 sm:px-4 py-2"
                >
                  <span>{t('navLogin')}</span>
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl border border-sage-200 text-charcoal-600 hover:bg-sage-50 transition"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-sage-200 bg-white px-4 py-4 space-y-2 shadow-lg">
            <button
              onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold ${
                currentPage === 'home' ? 'bg-sage-100 text-forest-800 font-bold' : 'text-charcoal-700'
              }`}
            >
              {t('navHome')}
            </button>
            <button
              onClick={() => { onNavigate('browse'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold ${
                currentPage === 'browse' ? 'bg-sage-100 text-forest-800 font-bold' : 'text-charcoal-700'
              }`}
            >
              {t('navBrowse')}
            </button>
            <button
              onClick={() => { onOpenEstimatorModal?.(); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-charcoal-700 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-forest-700" />
              <span>{t('navEstimator')}</span>
            </button>

            {user && (
              <button
                onClick={() => { onNavigate('visits'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold ${
                  currentPage === 'visits' ? 'bg-sage-100 text-forest-800 font-bold' : 'text-charcoal-700'
                }`}
              >
                {t('navVisits')}
              </button>
            )}

            {(user?.role === 'panchayat_rep' || user?.role === 'admin') && (
              <button
                onClick={() => { onNavigate('moderation'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 ${
                  currentPage === 'moderation' ? 'bg-sage-100 text-forest-800 font-bold' : 'text-charcoal-700'
                }`}
              >
                <Shield className="w-4 h-4 text-forest-700" />
                <span>{t('navModeration')}</span>
              </button>
            )}

            <button
              onClick={() => { onNavigate('create-listing'); setMobileMenuOpen(false); }}
              className="btn-forest w-full text-xs py-2.5 mt-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('navPostListing')}</span>
            </button>
          </div>
        )}
      </header>
    </>
  );
};
