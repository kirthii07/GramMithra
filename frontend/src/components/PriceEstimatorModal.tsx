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
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-sage-200 relative my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-sage-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-forest-50 text-forest-800 flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5 text-forest-800" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-charcoal-800">
                {lang === 'ta' ? 'அரசு அங்கீகரித்த நியாய விலை மதிப்பீட்டாளர்' : 'Attributable Fair-Price Estimator'}
              </h3>
              <p className="text-xs text-charcoal-500">
                TANUVAS, NDDB & ICAR research-benchmarked livestock pricing engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-charcoal-400 hover:text-charcoal-700 hover:bg-sage-50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto py-4 space-y-5 pr-1">
          {/* Top Inputs: Category & Breed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-charcoal-800 block mb-1.5">
                {lang === 'ta' ? 'கால்நடை வகை' : 'Livestock Category'}
              </label>
              <select
                value={livestockType}
                onChange={(e) => {
                  const newType = e.target.value;
                  setLivestockType(newType);
                  const firstBreed = (breedCatalog[newType] || [])[0] || 'Local';
                  setBreed(firstBreed);
                }}
                className="w-full text-xs"
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
              <label className="text-xs font-bold text-charcoal-800 block mb-1.5">
                {lang === 'ta' ? 'இனம்' : 'Breed'}
              </label>
              <select
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full text-xs"
              >
                {currentBreeds.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sliders & Numeric Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-charcoal-800 mb-1.5">
                <span>{t('age')}:</span>
                <span className="text-forest-800">{Math.round((ageMonths / 12) * 10) / 10} {t('years')} ({ageMonths} m)</span>
              </div>
              <input
                type="range"
                min="6"
                max="120"
                step="2"
                value={ageMonths}
                onChange={(e) => setAgeMonths(parseInt(e.target.value, 10))}
                className="w-full accent-forest-800 cursor-pointer"
              />
            </div>

            {(livestockType === 'cow' || livestockType === 'buffalo') && (
              <div>
                <div className="flex justify-between text-xs font-bold text-charcoal-800 mb-1.5">
                  <span>{t('milkYield')}:</span>
                  <span className="text-forest-800">{milkYieldLiters} L / day</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="0.5"
                  value={milkYieldLiters}
                  onChange={(e) => setMilkYieldLiters(parseFloat(e.target.value))}
                  className="w-full accent-forest-800 cursor-pointer"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-charcoal-800 block mb-1.5">{t('pregnancy')}</label>
              <select
                value={pregnancyStatus}
                onChange={(e) => setPregnancyStatus(e.target.value)}
                className="w-full text-xs"
              >
                <option value="pregnant">{t('pregnant')}</option>
                <option value="not_pregnant">{t('notPregnant')}</option>
                <option value="not_applicable">Not Applicable</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-charcoal-800 block mb-1.5">{t('vaccination')}</label>
              <select
                value={vaccinationStatus}
                onChange={(e) => setVaccinationStatus(e.target.value)}
                className="w-full text-xs"
              >
                <option value="fully_vaccinated">{t('fullyVaccinated')}</option>
                <option value="partially_vaccinated">{t('partiallyVaccinated')}</option>
                <option value="not_vaccinated">{t('notVaccinated')}</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={calculate}
                className="btn-forest w-full py-2.5 text-xs font-bold"
              >
                {loading ? 'Recalculating...' : 'Recalculate Price'}
              </button>
            </div>
          </div>

          {/* Price Calculation Output Box */}
          {estimate && (
            <div className="p-5 rounded-2xl bg-forest-50 border border-forest-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-forest-200">
                <div>
                  <span className="text-[11px] font-bold text-forest-800 uppercase tracking-wider">
                    Indicative Fair-Price Estimate
                  </span>
                  <div className="font-display text-3xl font-black text-forest-900">
                    ₹{estimate.estimated_indicative_price.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-right sm:text-right">
                  <span className="text-[11px] text-charcoal-500 font-medium block">
                    Healthy Valuation Range:
                  </span>
                  <span className="text-xs font-bold text-forest-900">
                    ₹{estimate.price_range_low.toLocaleString('en-IN')} — ₹{estimate.price_range_high.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Factor Breakdown */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-forest-900">Line-Item Valuation Factors:</div>
                <div className="space-y-1.5">
                  {estimate.breakdown_factors.map((f, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-white border border-forest-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-charcoal-800">
                          {lang === 'ta' && f.factor_name_ta ? f.factor_name_ta : f.factor_name}
                        </div>
                        <div className="text-[10px] text-charcoal-400">
                          {lang === 'ta' && f.explanation_ta ? f.explanation_ta : f.explanation_en}
                        </div>
                      </div>
                      <span className="font-extrabold text-forest-800">
                        {f.impact_amount >= 0 ? `+₹${f.impact_amount.toLocaleString('en-IN')}` : `-₹${Math.abs(f.impact_amount).toLocaleString('en-IN')}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attribution Notes */}
              <div className="text-[10px] text-charcoal-500 pt-2 border-t border-forest-200">
                <strong>Attribution Source:</strong> {estimate.benchmark_source}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-sage-100 flex items-center justify-end gap-2 mt-auto">
          <button
            onClick={onClose}
            className="btn-sage text-xs py-2 px-4"
          >
            {t('btnCancel')}
          </button>
          {onApplyPrice && estimate && (
            <button
              onClick={() => {
                onApplyPrice(estimate.estimated_indicative_price);
                onClose();
              }}
              className="btn-forest text-xs py-2 px-5 font-bold"
            >
              Apply This Price (₹{estimate.estimated_indicative_price.toLocaleString('en-IN')})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
