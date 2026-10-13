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
  ExternalLink
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
        <Shield className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Restricted Access</h2>
        <p className="text-xs text-slate-500">
          This portal is reserved for authorized Panchayat Representatives and Platform Administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
              {user.role === 'admin' ? 'Platform Administrator' : 'Panchayat Representative'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-display mt-1">
            {lang === 'ta' ? 'ஊராட்சி & நிர்வாக கண்காணிப்பு மையம்' : 'Panchayat & Moderation Hub'}
          </h1>
          <p className="text-xs text-slate-400">
            {lang === 'ta'
              ? 'மோசடி தடுப்பு, விலை சரிபார்ப்பு மற்றும் தணிக்கைப் பதிவுகள் (Audit Logs)'
              : 'Audit trail, suspicious price inspection, and farmer verification queue'}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-earth-200 shadow-sm">
            <span className="text-xs text-slate-500 font-semibold block">Total Listings</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.total_listings}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-earth-200 shadow-sm">
            <span className="text-xs text-amber-700 font-semibold block">Flagged / Low Score</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{stats.flagged_listings}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-earth-200 shadow-sm">
            <span className="text-xs text-slate-500 font-semibold block">Active Sellers</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.active_sellers}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-earth-200 shadow-sm">
            <span className="text-xs text-primary-700 font-semibold block">Panchayat Reps</span>
            <div className="text-2xl font-black text-primary-800 mt-1">{stats.verified_panchayat_reps}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-earth-200 shadow-sm">
            <span className="text-xs text-blue-700 font-semibold block">Assisted Farmers</span>
            <div className="text-2xl font-black text-blue-800 mt-1">{stats.assisted_registrations_count}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-emerald-900/30 pb-2">
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'queue'
              ? 'bg-emerald-700 text-white shadow'
              : 'text-slate-300 hover:bg-white/10'
          }`}
        >
          {lang === 'ta' ? 'கண்காணிப்பு வரிசை (Review Queue)' : 'Review Queue'} ({queue.length})
        </button>
        {user.role === 'admin' && (
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'audit'
                ? 'bg-emerald-700 text-white shadow'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            {lang === 'ta' ? 'நிர்வாக தணிக்கை பதிவுகள் (Audit Logs)' : 'Administrative Audit Trail'} ({auditLogs.length})
          </button>
        )}
      </div>

      {/* Tab 1: Queue */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {queue.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-earth-200 space-y-2">
              <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-slate-900">All Listings Verified</h3>
              <p className="text-xs text-slate-500">No pending flags or suspicious items in queue.</p>
            </div>
          ) : (
            queue.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-earth-300 p-5 sm:p-6 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.photos[0] || 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=400&q=80'}
                      alt=""
                      className="w-14 h-14 rounded-2xl object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">{item.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800">
                          Score: {item.quality_score}/100
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        📍 {item.panchayat}, {item.district} • Asking: ₹{item.price.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigateToListing(item.id)}
                    className="self-start sm:self-auto px-3 py-1.5 rounded-xl border border-earth-300 hover:bg-sand-100 text-xs font-semibold text-slate-700 flex items-center gap-1"
                  >
                    <span>View Detail</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Flags list */}
                {item.flag_reasons.length > 0 && (
                  <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-200 space-y-1.5">
                    <span className="text-[11px] font-bold text-rose-900 block">Flagged Quality Rules:</span>
                    {item.flag_reasons.map((f, i) => (
                      <div key={i} className="text-xs text-rose-950 flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>{f.title_en}:</strong> {f.detail_en}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-earth-100">
                  <button
                    onClick={() => handleAction(item.id, 'reject', 'Violation of listing standards')}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200"
                  >
                    Reject & Deactivate
                  </button>
                  <button
                    onClick={() => handleAction(item.id, 'approve', 'Verified by Panchayat Representative')}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Approve & Endorse Seller</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Administrative Audit Trail */}
      {activeTab === 'audit' && user.role === 'admin' && (
        <div className="bg-white rounded-3xl border border-earth-300 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sand-100 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-100 text-slate-800 font-medium">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-sand-50">
                    <td className="p-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 font-bold">{log.user_name}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 text-slate-700">
                        {log.user_role}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-primary-900">{log.action}</td>
                    <td className="p-4 text-slate-600 max-w-xs truncate">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
