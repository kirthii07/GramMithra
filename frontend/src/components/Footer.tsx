import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, PhoneCall, Leaf } from 'lucide-react';

export const Footer: React.FC = () => {
  const { lang, t } = useLanguage();

  return (
    <footer className="relative border-t border-emerald-900/30 mt-24 overflow-hidden"
      style={{ background: '#040d0a' }}
    >
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-5"
        style={{ background: 'radial-gradient(circle, #10b981, transparent)', filter: 'blur(80px)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-800 flex items-center justify-center text-xl shadow-glow-sm">
                🌿
              </div>
              <div>
                <span className="font-display text-xl font-black text-white">Gram Mitra</span>
                <span className="text-sm text-emerald-400/60 ml-2">— கிராம மித்ரா</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              {t('subTagline')}
            </p>
            
            {/* Safety Advisory */}
            <div className="flex items-start gap-3 text-xs p-4 rounded-2xl"
              style={{
                background: 'rgba(16, 185, 129, 0.06)',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}
            >
              <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-400 mt-0.5" />
              <span className="text-emerald-300/80 leading-relaxed">
                {lang === 'ta'
                  ? 'பாதுகாப்பு அறிவுறுத்தல்: நேரில் சென்று கால்நடையைப் பார்க்காமல் முன்பணம் எதுவும் செலுத்தாதீர்கள்.'
                  : 'Farmer Safety Advisory: Never send advance money prior to inspecting the animal during a physical farm visit.'}
              </span>
            </div>
          </div>

          {/* Research & Benchmark References */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400/70 mb-4">
              {lang === 'ta' ? 'அரசு & ஆராய்ச்சி ஆதாரங்கள்' : 'Advisory Standards'}
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              {[
                'TANUVAS Cattle Benchmarks',
                'National Dairy Development Board (NDDB)',
                'ICAR Indigenous Livestock Registry',
                'Tamil Nadu Animal Husbandry Dept (1962)',
              ].map(item => (
                <li key={item} className="hover:text-emerald-400 transition cursor-pointer flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-emerald-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Emergency Helpline */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400/70 mb-4">
              {lang === 'ta' ? 'உதவி & ஆதரவு' : 'Support & Helpline'}
            </h4>
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-2.5 p-3 rounded-xl"
                style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}
              >
                <PhoneCall className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="text-white font-bold">1962</div>
                  <div className="text-emerald-500/70">Toll-Free Veterinary Emergency</div>
                </div>
              </div>
              <p className="text-slate-500 leading-relaxed">
                Gram Panchayat Animal Welfare Center<br />
                Mon–Sat 08:00 AM – 06:00 PM
              </p>
            </div>
          </div>
        </div>

        <div className="divider-gradient mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Leaf className="w-3.5 h-3.5 text-emerald-700" />
            <span>&copy; {new Date().getFullYear()} Gram Mitra. {t('footerRights')}</span>
          </div>
          <div className="text-[11px] text-center sm:text-right opacity-60">
            {t('footerDisclaimer')}
          </div>
        </div>
      </div>
    </footer>
  );
};
