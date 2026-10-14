import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Listing, ModerationStats, AuditLogItem } from '../types';
import {
  Shield,
  ShieldCheck,
  AlertTriangle,
  Check,
  X,
  FileText,
  Users,
  Search,
  ExternalLink,
  RotateCcw
} from 'lucide-react';

interface ModerationPageProps {
  onNavigateToListing: (listingId: number) => void;
}

export const ModerationPage: React.FC<ModerationPageProps> = ({ onNavigateToListing }) => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();

  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [queue, setQueue] = useState<Listing[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [activeTab, setActiveTab] = useState<'queue' | 'audit'>('queue');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModerationData();
  }, [user]);

  const loadModerationData = async () => {
    setLoading(true);
    try {
      const [s, q] = await Promise.all([
        api.getModerationStats(),
        api.getModerationQueue()
      ]);
      setStats(s);
      setQueue(q);

      if (user?.role === 'admin') {
        const logs = await api.getAuditLogs();
        setAuditLogs(logs);
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (listingId: number, action: string, reason?: string) => {
    try {
      await api.takeModerationAction(listingId, action, reason);
      loadModerationData();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  if (!user || (user.role !== 'panchayat_rep' && user.role !== 'admin')) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <Shield className="w-12 h-12 text-sage-300 mx-auto" />
        <h2 className="font-display font-bold text-xl text-charcoal-800">Restricted Access</h2>
        <p className="text-xs text-charcoal-500">
          This portal is reserved for authorized Panchayat Representatives and Platform Administrators. Switch to a demo account using the Demo Switcher in the top bar.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-sage-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="section-badge">
              {user.role === 'admin' ? 'Platform Administrator' : 'Panchayat Representative'}
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-charcoal-800 mt-2">
            {lang === 'ta' ? 'ஊராட்சி & நிர்வாக கண்காணிப்பு மையம்' : 'Panchayat & Moderation Hub'}
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            {lang === 'ta'
              ? 'மோசடி தடுப்பு, விலை சரிபார்ப்பு மற்றும் தணிக்கைப் பதிவுகள் (Audit Logs)'
              : 'Audit trail, suspicious low-price detection, and seller verification queue'}
          </p>
        </div>

        <button
          onClick={loadModerationData}
          className="btn-sage text-xs py-2 px-3.5 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total Listings', val: stats.total_listings, color: 'text-charcoal-800' },
            { label: 'Pending Review', val: stats.pending_review, color: 'text-amber-800' },
            { label: 'Flagged Warnings', val: stats.flagged_listings, color: 'text-rose-700' },
            { label: 'Active Sellers', val: stats.active_sellers, color: 'text-forest-800' },
            { label: 'Panchayat Reps', val: stats.verified_panchayat_reps, color: 'text-forest-700' },
            { label: 'Assisted Onboardings', val: stats.assisted_registrations_count, color: 'text-forest-900' }
          ].map((st, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white border border-sage-200 shadow-sm text-center">
              <div className={`font-display font-black text-xl ${st.color}`}>{st.val}</div>
              <div className="text-[10px] text-charcoal-400 font-semibold mt-0.5">{st.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-sage-200 pb-2">
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'queue'
              ? 'bg-forest-800 text-white shadow-sm'
              : 'bg-white text-charcoal-700 border border-sage-200 hover:bg-sage-50'
          }`}
        >
          Moderation Queue ({queue.length})
        </button>

        {user.role === 'admin' && (
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'audit'
                ? 'bg-forest-800 text-white shadow-sm'
                : 'bg-white text-charcoal-700 border border-sage-200 hover:bg-sage-50'
            }`}
          >
            Audit Logs ({auditLogs.length})
          </button>
        )}
      </div>

      {/* Tab 1: Moderation Queue */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {queue.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-sage-200 shadow-sm space-y-2">
              <div className="text-3xl">🛡️</div>
              <h3 className="font-display font-bold text-charcoal-800 text-sm">
                Queue Clear
              </h3>
              <p className="text-xs text-charcoal-500">
                All livestock listings have passed baseline quality heuristics.
              </p>
            </div>
          ) : (
            queue.map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-3xl border border-sage-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      Score: {item.quality_score}/100
                    </span>
                    <span className="text-xs font-semibold text-charcoal-500">
                      #{item.id} • {item.breed}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base text-charcoal-800">
                    {item.title}
                  </h3>

                  {item.flag_reasons && item.flag_reasons.length > 0 && (
                    <div className="space-y-1">
                      {item.flag_reasons.map((f, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-rose-800 bg-rose-50 p-2 rounded-xl border border-rose-200 flex items-center gap-1.5"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{f.detail_en || f.title_en}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigateToListing(item.id)}
                    className="btn-sage text-xs py-2 px-3"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleAction(item.id, 'approve', 'Approved by authorized representative')}
                    className="btn-forest text-xs py-2 px-3"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleAction(item.id, 'reject', 'Rejected for suspicious or invalid parameters')}
                    className="btn-terracotta text-xs py-2 px-3"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-sage-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-sage-100 font-bold text-xs text-charcoal-800">
            System Activity & Moderation Audit Trail
          </div>
          <div className="divide-y divide-sage-100 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-charcoal-800">{log.user_name}</span>
                    <span className="text-[10px] text-charcoal-400">({log.user_role})</span>
                    <span className="px-2 py-0.5 rounded bg-sage-100 text-forest-800 font-bold text-[10px]">
                      {log.action}
                    </span>
                  </div>
                  <p className="text-charcoal-600">{log.details}</p>
                </div>
                <span className="text-[10px] text-charcoal-400 whitespace-nowrap">
                  {log.created_at ? new Date(log.created_at).toLocaleDateString() : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
