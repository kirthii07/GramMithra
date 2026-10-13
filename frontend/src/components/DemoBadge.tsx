import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { AlertCircle } from 'lucide-react';

interface DemoBadgeProps {
  className?: string;
  showExplanation?: boolean;
}

export const DemoBadge: React.FC<DemoBadgeProps> = ({ className = '', showExplanation = false }) => {
  const { lang, t } = useLanguage();

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${className}`}
      style={{
        background: 'rgba(251, 191, 36, 0.15)',
        border: '1px solid rgba(251, 191, 36, 0.3)',
        color: '#fbbf24'
      }}
    >
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{t('demoDataBadge')}</span>
      {showExplanation && (
        <span className="text-[11px] font-normal opacity-70 ml-1 hidden sm:inline">
          ({lang === 'ta' ? 'விளக்கத்திற்கான மாதிரி பதிவு' : 'Synthetic demonstration listing'})
        </span>
      )}
    </div>
  );
};
