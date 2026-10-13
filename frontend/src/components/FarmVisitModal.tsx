import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Calendar, Clock, X, Check, MapPin, ShieldCheck, UserCheck } from 'lucide-react';

interface FarmVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: number;
  listingTitle: string;
  sellerName?: string;
  onSuccess?: () => void;
}

export const FarmVisitModal: React.FC<FarmVisitModalProps> = ({
  isOpen,
  onClose,
  listingId,
  listingTitle,
  sellerName,
  onSuccess
}) => {
  const { lang, t } = useLanguage();
  const [proposedDate, setProposedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('Morning 08:00 AM - 11:00 AM (Ideal for live milking)');
  const [buyerNotes, setBuyerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.requestVisit(listingId, proposedDate, timeSlot, buyerNotes);
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-earth-300 relative">
        <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{t('visitRequestTitle')}</h3>
            <p className="text-xs text-slate-500 line-clamp-1">{listingTitle}</p>
          </div>
        </div>

        {success ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              {lang === 'ta' ? 'பார்வை கோரிக்கை அனுப்பப்பட்டது!' : 'Visit Request Sent Successfully!'}
            </h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              {lang === 'ta'
                ? 'விவசாயி உங்கள் கோரிக்கையை ஏற்றதும் பண்ணையின் துல்லியமான ஜி.பி.எஸ் இருப்பிடம் திறக்கப்படும்.'
                : 'The seller will be notified. Exact farm coordinates will unlock on acceptance.'}
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs shadow"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-[#19251E] block mb-1">
                {t('visitDate')}
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={proposedDate}
                onChange={(e) => setProposedDate(e.target.value)}
                className="input-light w-full text-xs font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#19251E] block mb-1">
                {t('visitSlot')}
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="select-light w-full text-xs font-medium"
              >
                <option value="Morning 08:00 AM - 11:00 AM (Ideal for live milking)">{t('visitMorning')}</option>
                <option value="Afternoon 02:00 PM - 04:00 PM">{t('visitAfternoon')}</option>
                <option value="Evening 04:30 PM - 06:30 PM (Ideal for evening milking)">{t('visitEvening')}</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#19251E] block mb-1">
                {t('visitNotes')}
              </label>
              <textarea
                rows={3}
                placeholder={lang === 'ta' ? 'எ.கா: உள்ளூர் கால்நடை மருத்துவருடன் நேரில் வருகிறேன்...' : 'e.g., Bringing local veterinarian for physical check...'}
                value={buyerNotes}
                onChange={(e) => setBuyerNotes(e.target.value)}
                className="input-light w-full text-xs font-medium"
              />
            </div>

            {/* Privacy notice banner */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <span>{t('privacyNotice')}</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-earth-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                {t('btnCancel')}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary-700 hover:bg-primary-800 disabled:opacity-50 text-white shadow"
              >
                {submitting ? 'Submitting...' : t('btnScheduleVisit')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
