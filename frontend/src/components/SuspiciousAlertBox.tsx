import React from 'react';
import { FlagReason } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { ShieldAlert, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

interface SuspiciousAlertBoxProps {
  flags: FlagReason[];
  qualityScore: number;
}

export const SuspiciousAlertBox: React.FC<SuspiciousAlertBoxProps> = ({ flags, qualityScore }) => {
  const { lang, t } = useLanguage();

  if (!flags || flags.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-emerald-900">{t('qualityScore')}: {qualityScore}/100</h4>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              {lang === 'ta' ? 'சரிபார்க்கப்பட்டது' : 'High Reliability'}
            </span>
          </div>
          <p className="text-xs text-emerald-700 mt-1">{t('noWarnings')}</p>
        </div>
      </div>
    );
  }

  const hasHigh = flags.some(f => f.severity === 'high');

  return (
    <div className={`border rounded-xl p-4 space-y-3 ${hasHigh ? 'bg-rose-50/70 border-rose-200' : 'bg-amber-50/70 border-amber-200'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {hasHigh ? (
            <ShieldAlert className="w-5 h-5 text-rose-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          )}
          <h4 className={`text-sm font-bold ${hasHigh ? 'text-rose-900' : 'text-amber-900'}`}>
            {t('suspiciousWarnings')}
          </h4>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-600">{t('qualityScore')}:</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
            qualityScore >= 80 ? 'bg-emerald-100 text-emerald-800' :
            qualityScore >= 50 ? 'bg-amber-100 text-amber-800' :
            'bg-rose-100 text-rose-800'
          }`}>
            {qualityScore}/100
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {flags.map((flag, idx) => {
          const isHigh = flag.severity === 'high';
          const isMedium = flag.severity === 'medium';
          return (
            <div
              key={idx}
              className={`p-3 rounded-lg text-xs border ${
                isHigh ? 'bg-rose-100/60 border-rose-300 text-rose-950' :
                isMedium ? 'bg-amber-100/60 border-amber-300 text-amber-950' :
                'bg-blue-50 border-blue-200 text-blue-950'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-1">
                {isHigh ? <AlertTriangle className="w-4 h-4 text-rose-600" /> : <Info className="w-4 h-4 text-amber-600" />}
                <span>{lang === 'ta' ? flag.title_ta : flag.title_en}</span>
                <span className="uppercase tracking-wider text-[10px] px-1.5 py-0.2 rounded font-semibold ml-auto opacity-75">
                  {flag.severity}
                </span>
              </div>
              <p className="leading-relaxed opacity-90 pl-5">
                {lang === 'ta' ? flag.detail_ta : flag.detail_en}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
