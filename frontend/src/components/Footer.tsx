import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, PhoneCall, Leaf, Heart } from 'lucide-react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  const { lang, t } = useLanguage();

  return (
    <footer className="border-t border-sage-200 bg-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="md" />
            <p className="text-sm text-charcoal-500 max-w-md leading-relaxed">
              Gram Mitra (கிராம மித்ரா) connects cattle, buffalo, goat, sheep, and poultry farmers directly with verified buyers across rural panchayat communities, eliminating middlemen through attributable pricing and transparent discovery.
            </p>
            
            {/* Safety Advisory Banner */}
            <div className="flex items-start gap-3 text-xs p-4 rounded-2xl bg-sage-50 border border-sage-200 text-forest-900 max-w-md">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 text-forest-700 mt-0.5" />
              <span className="leading-relaxed">
                {lang === 'ta'
                  ? 'விவசாயி பாதுகாப்பு: நேரில் பண்ணைக்கு சென்று கால்நடையை பார்த்து பால் கறவை சரிபார்க்காமல் முன்பணம் எதுவும் செலுத்தாதீர்கள்.'
                  : 'Farmer Safety Advisory: Always inspect livestock during scheduled farm milking tests prior to sending any payment or token.'}
              </span>
            </div>
          </div>

          {/* Research & Benchmark References */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-800">
              {lang === 'ta' ? 'அரசு & ஆராய்ச்சி ஆதாரங்கள்' : 'Advisory Standards'}
            </h4>
            <ul className="space-y-2 text-xs text-charcoal-500">
              {[
                'TANUVAS Indigenous Survey (Kongu Cattle)',
                'National Dairy Development Board (NDDB)',
                'ICAR Indigenous Breed Registries',
                'Tamil Nadu Animal Husbandry Guidelines'
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-forest-700" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Emergency Helpline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-800">
              {lang === 'ta' ? 'அரசு உதவி எண்' : 'Emergency Helpline'}
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-forest-50 border border-forest-200 text-forest-900">
                <PhoneCall className="w-4 h-4 text-forest-800 flex-shrink-0" />
                <div>
                  <div className="font-extrabold text-sm text-forest-900">1962</div>
                  <div className="text-[11px] text-forest-700">Toll-Free Veterinary Emergency</div>
                </div>
              </div>
              <p className="text-charcoal-400 text-[11px] leading-relaxed">
                Gram Sabha Livestock Welfare Cell<br />
                Panchayat Service Hours: Mon–Sat 08:00 AM – 06:00 PM
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-sage-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-400">
          <div className="flex items-center gap-1.5">
            <span>&copy; {new Date().getFullYear()} Gram Mitra. All rights reserved.</span>
          </div>
          <div className="text-[11px] text-center sm:text-right text-charcoal-400">
            Attributable agricultural fair benchmarks • Safe demonstration mode active
          </div>
        </div>
      </div>
    </footer>
  );
};
