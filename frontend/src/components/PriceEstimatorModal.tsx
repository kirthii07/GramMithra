import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { PriceEstimateResponse } from '../types';
import { Calculator, X, Sparkles, BookOpen, CheckCircle, TrendingUp, ShieldCheck } from 'lucide-react';

interface PriceEstimatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLivestockType?: string;
  initialBreed?: string;
  onApplyPrice?: (price: number) => void;
}

export const PriceEstimatorModal: React.FC<PriceEstimatorModalProps> = ({
  isOpen,
  onClose,
  initialLivestockType = 'cow',
  initialBreed = 'Kangayam',
  onApplyPrice
}) => {
  const { lang, t } = useLanguage();
  const [livestockType, setLivestockType] = useState(initialLivestockType);
  const [breed, setBreed] = useState(initialBreed);
  const [ageMonths, setAgeMonths] = useState(36);
  const [milkYieldLiters, setMilkYieldLiters] = useState(10.0);
  const [lactationNumber, setLactationNumber] = useState(2);
  const [pregnancyStatus, setPregnancyStatus] = useState('pregnant');
  const [weightKg, setWeightKg] = useState(0.0);
  const [vaccinationStatus, setVaccinationStatus] = useState('fully_vaccinated');

  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<PriceEstimateResponse | null>(null);
  const [breedCatalog, setBreedCatalog] = useState<Record<string, string[]>>({});

  useEffect(() => {
    api.getSupportedBreeds().then(setBreedCatalog).catch(() => {});
  }, []);

  useEffect(() => {
    if (isOpen) {
      calculate();
    }
  }, [isOpen, livestockType, breed]);

  const calculate = async () => {
    setLoading(true);
    try {
      const res = await api.calculatePrice({
        livestock_type: livestockType,
        breed: breed,
        age_months: ageMonths,
        milk_yield_liters: livestockType === 'cow' || livestockType === 'buffalo' ? milkYieldLiters : 0,
        lactation_number: lactationNumber,
        pregnancy_status: pregnancyStatus,
        weight_kg: weightKg,
        vaccination_status: vaccinationStatus
      });
      setEstimate(res);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentBreeds = breedCatalog[livestockType] || [breed];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-earth-300 relative my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-earth-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{t('estimatorTitle')}</h3>
              <p className="text-xs text-slate-500">{t('estimatorSubtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto py-4 space-y-5 pr-1 text-[#19251E]">
          {/* Top Inputs: Category & Breed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#19251E] block mb-1">
                {lang === 'ta' ? 'கால்நடை வகை' : 'Livestock Category'}
              </label>
              <select
                value={livestockType}
                onChange={(e) => {
                  const newType = e.target.value;
                  setLivestockType(newType);
                  const firstBreed = (breedCatalog[newType] && breedCatalog[newType][0]) || 'default';
                  setBreed(firstBreed);
                }}
                className="select-light w-full text-xs font-medium"
              >
                <option value="cow">{t('catCow')}</option>
                <option value="buffalo">{t('catBuffalo')}</option>
                <option value="goat">{t('catGoat')}</option>
                <option value="sheep">{t('catSheep')}</option>
                <option value="hen">{t('catHen')}</option>
                <option value="chicken">{t('catChicken')}</option>
                <option value="duck">{t('catDuck')}</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#19251E] block mb-1">
                {lang === 'ta' ? 'இனம் (Breed)' : 'Breed / Variety'}
              </label>
              <select
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="select-light w-full text-xs font-medium"
              >
                {currentBreeds.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Metric sliders and attributes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-sand-50 p-4 rounded-2xl border border-sand-200">
            {/* Age */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>{t('age')}:</span>
                <span className="text-primary-800 font-bold">{Math.round(ageMonths/12 * 10)/10} {t('years')} ({ageMonths} {t('months')})</span>
              </div>
              <input
                type="range"
                min="6"
                max="120"
                step="2"
                value={ageMonths}
                onChange={(e) => setAgeMonths(parseInt(e.target.value, 10))}
                className="w-full accent-primary-600"
              />
            </div>

            {/* Milk Yield (for cows/buffaloes) or Body Weight */}
            {livestockType === 'cow' || livestockType === 'buffalo' ? (
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>{t('milkYield')}:</span>
                  <span className="text-primary-800 font-bold">{milkYieldLiters} {t('litersPerDay')}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="28"
                  step="0.5"
                  value={milkYieldLiters}
                  onChange={(e) => setMilkYieldLiters(parseFloat(e.target.value))}
                  className="w-full accent-primary-600"
                />
              </div>
            ) : (
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>{t('weight')}:</span>
                  <span className="text-primary-800 font-bold">{weightKg || 25} kg</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="80"
                  step="1"
                  value={weightKg || 25}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value))}
                  className="w-full accent-primary-600"
                />
              </div>
            )}

            {/* Lactation & Pregnancy (for cows/buffaloes) */}
            {livestockType === 'cow' || livestockType === 'buffalo' ? (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">{t('lactation')}</label>
                  <select
                    value={lactationNumber}
                    onChange={(e) => setLactationNumber(parseInt(e.target.value, 10))}
                    className="w-full text-xs p-2 rounded-xl border border-sand-300 bg-white"
                  >
                    <option value={1}>1st Calving (முதல் ஈற்று)</option>
                    <option value={2}>2nd Calving (இரண்டாம் ஈற்று - உச்சநிலை)</option>
                    <option value={3}>3rd Calving (மூன்றாம் ஈற்று)</option>
                    <option value={4}>4th Calving (நான்காம் ஈற்று)</option>
                    <option value={5}>5th+ Calving (முதிய ஈற்று)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">{t('pregnancy')}</label>
                  <select
                    value={pregnancyStatus}
                    onChange={(e) => setPregnancyStatus(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-sand-300 bg-white"
                  >
                    <option value="pregnant">{t('pregnant')}</option>
                    <option value="not_pregnant">{t('notPregnant')}</option>
                    <option value="unknown">Not Tested</option>
                  </select>
                </div>
              </>
            ) : null}

            {/* Vaccination */}
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">{t('vaccination')}</label>
              <div className="flex gap-2">
                {[
                  { id: 'fully_vaccinated', label: t('fullyVaccinated') },
                  { id: 'partially_vaccinated', label: t('partiallyVaccinated') },
                  { id: 'not_vaccinated', label: t('notVaccinated') }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setVaccinationStatus(opt.id)}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold border transition ${
                      vaccinationStatus === opt.id
                        ? 'bg-primary-700 text-white border-primary-700 shadow-sm'
                        : 'bg-white text-slate-700 border-sand-300 hover:bg-sand-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={calculate}
            className="w-full py-2.5 rounded-xl bg-earth-700 hover:bg-earth-800 text-white font-bold text-xs transition shadow flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t('btnCalculatePrice')}</span>
          </button>

          {/* Calculated Output Banner */}
          {estimate && (
            <div className="bg-gradient-to-br from-emerald-900 to-primary-950 text-white p-5 rounded-2xl shadow-lg animate-scale-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-emerald-300 text-xs font-semibold uppercase tracking-wider block">
                    {t('indicativePrice')}
                  </span>
                  <div className="text-3xl font-black tracking-tight text-white mt-1">
                    ₹{estimate.estimated_indicative_price.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-emerald-200 mt-1 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t('expectedRange')}: ₹{estimate.price_range_low.toLocaleString('en-IN')} - ₹{estimate.price_range_high.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {onApplyPrice && (
                  <button
                    onClick={() => {
                      onApplyPrice(estimate.estimated_indicative_price);
                      onClose();
                    }}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-xs transition shadow"
                  >
                    {lang === 'ta' ? 'இந்த விலையை படிவத்தில் சேர்' : 'Use this Price in Listing'}
                  </button>
                )}
              </div>

              {/* Attributable Factors Breakdown */}
              <div className="mt-5 pt-4 border-t border-emerald-800/80">
                <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2">
                  {t('breakdownTitle')}
                </h4>
                <div className="space-y-1.5">
                  {estimate.breakdown_factors.map((f, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800/40">
                      <span className="text-emerald-100 font-medium">
                        {lang === 'ta' ? f.factor_name_ta : f.factor_name}
                      </span>
                      <span className={`font-mono font-bold ${f.impact_amount >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {f.impact_amount >= 0 ? '+' : ''}₹{Math.round(f.impact_amount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Source & Attribution Citation */}
              <div className="mt-4 pt-3 border-t border-emerald-800/80 text-[11px] text-emerald-300/80 flex items-start gap-2">
                <BookOpen className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
                <div>
                  <span className="font-semibold block text-emerald-200">
                    {t('attributionSource')}: {estimate.benchmark_source}
                  </span>
                  <p className="mt-0.5 opacity-80 leading-normal">{estimate.attribution_notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
