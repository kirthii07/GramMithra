import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserCheck, X, ShieldAlert, CheckCircle, FileText, Users } from 'lucide-react';

interface AssistedRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (farmer: any) => void;
}

export const AssistedRegisterModal: React.FC<AssistedRegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();

  const [districts, setDistricts] = useState<string[]>([]);
  const [farmerName, setFarmerName] = useState('');
  const [farmerPhone, setFarmerPhone] = useState('');
  const [district, setDistrict] = useState(user?.district || 'Tiruppur');
  const [panchayat, setPanchayat] = useState(user?.panchayat || 'Kangeyam');
  const [village, setVillage] = useState('');
  const [consentType, setConsentType] = useState('digital_declaration');
  const [consentStatement, setConsentStatement] = useState(
    'விவசாயி தனது கால்நடைகளை கிராம மித்ரா தளத்தில் விற்பனை செய்ய முழு சம்மதம் அளித்துள்ளார்.'
  );
  const [witnessName, setWitnessName] = useState('');
  const [witnessPhone, setWitnessPhone] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdFarmer, setCreatedFarmer] = useState<any | null>(null);

  useEffect(() => {
    api.getDistricts().then(setDistricts).catch(() => {});
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await api.assistedRegister({
        farmer_name: farmerName,
        farmer_phone: farmerPhone,
        district: district,
        panchayat: panchayat,
        village: village,
        consent_type: consentType,
        consent_statement: consentStatement,
        witness_name: witnessName || user?.full_name,
        witness_phone: witnessPhone || user?.phone
      });
      setCreatedFarmer(res);
      if (onSuccess) onSuccess(res);
    } catch (err: any) {
      setError(err.message || 'Failed to complete assisted registration');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-earth-300 relative my-6">
        <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-primary-100 text-primary-800 flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{t('assistedRegTitle')}</h3>
            <p className="text-xs text-slate-500">{t('assistedRegSubtitle')}</p>
          </div>
        </div>

        {createdFarmer ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              {lang === 'ta' ? 'விவசாயி கணக்கு வெற்றிகரமாக பதிவு செய்யப்பட்டது!' : 'Farmer Successfully Onboarded!'}
            </h4>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 max-w-sm mx-auto text-left space-y-1">
              <div><strong>{t('farmerName')}:</strong> {createdFarmer.full_name}</div>
              <div><strong>{t('farmerPhone')}:</strong> {createdFarmer.phone}</div>
              <div><strong>Status:</strong> Verified Seller (ஊராட்சி சான்றுடன் சரிபார்க்கப்பட்டது)</div>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs shadow"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#19251E] block mb-1">
                  {t('farmerName')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marimuthu Gounder"
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  className="input-light w-full text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#19251E] block mb-1">
                  {t('farmerPhone')} *
                </label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  placeholder="10-digit mobile number"
                  value={farmerPhone}
                  onChange={(e) => setFarmerPhone(e.target.value)}
                  className="input-light w-full text-xs font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-[#19251E] block mb-1">{t('selectDistrict')}</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="select-light w-full text-xs font-medium"
                >
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#19251E] block mb-1">{t('selectPanchayat')} *</label>
                <input
                  type="text"
                  required
                  value={panchayat}
                  onChange={(e) => setPanchayat(e.target.value)}
                  className="input-light w-full text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#19251E] block mb-1">{t('village')}</label>
                <input
                  type="text"
                  placeholder="Village / Hamlet"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="input-light w-full text-xs font-medium"
                />
              </div>
            </div>

            {/* Consent Declaration Section */}
            <div className="p-4 bg-[#FAF8F2] rounded-2xl border border-[#D7E2D8] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#19251E]">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>{t('consentType')}</span>
              </div>

              <select
                value={consentType}
                onChange={(e) => setConsentType(e.target.value)}
                className="select-light w-full text-xs font-medium"
              >
                <option value="digital_declaration">{t('consentDigital')}</option>
                <option value="voice_recording">{t('consentVoice')}</option>
                <option value="written_declaration">{t('consentWritten')}</option>
              </select>

              <div>
                <label className="text-xs font-bold text-[#19251E] block mb-1">{t('consentStatement')}</label>
                <textarea
                  rows={2}
                  required
                  value={consentStatement}
                  onChange={(e) => setConsentStatement(e.target.value)}
                  className="input-light w-full text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">{t('witnessName')}</label>
                  <input
                    type="text"
                    placeholder="Ward Member / Witness"
                    value={witnessName}
                    onChange={(e) => setWitnessName(e.target.value)}
                    className="input-light w-full text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-0.5">{t('witnessPhone')}</label>
                  <input
                    type="tel"
                    placeholder="Witness Phone"
                    value={witnessPhone}
                    onChange={(e) => setWitnessPhone(e.target.value)}
                    className="input-light w-full text-xs font-medium"
                  />
                </div>
              </div>
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
                {submitting ? 'Registering...' : lang === 'ta' ? 'உறுதிசெய்து பதிவு செய்' : 'Confirm & Register Farmer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
