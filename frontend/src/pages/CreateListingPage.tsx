import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { VoiceListingModal } from '../components/VoiceListingModal';
import { PriceEstimatorModal } from '../components/PriceEstimatorModal';
import {
  Mic,
  Upload,
  Sparkles,
  MapPin,
  Check,
  ShieldCheck,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';

interface CreateListingPageProps {
  onSuccess: (listingId: number) => void;
  onCancel: () => void;
}

export const CreateListingPage: React.FC<CreateListingPageProps> = ({
  onSuccess,
  onCancel
}) => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();

  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [estimatorModalOpen, setEstimatorModalOpen] = useState(false);

  // Form Fields
  const [livestockType, setLivestockType] = useState('cow');
  const [breed, setBreed] = useState('Kangayam');
  const [title, setTitle] = useState('');
  const [titleTa, setTitleTa] = useState('');
  const [description, setDescription] = useState('');
  const [ageMonths, setAgeMonths] = useState(36);
  const [gender, setGender] = useState('female');
  const [price, setPrice] = useState<number>(65000);
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [milkYieldLiters, setMilkYieldLiters] = useState<number>(11.0);
  const [lactationNumber, setLactationNumber] = useState(2);
  const [pregnancyStatus, setPregnancyStatus] = useState('pregnant');
  const [weightKg, setWeightKg] = useState<number>(360);
  const [vaccinationStatus, setVaccinationStatus] = useState('fully_vaccinated');
  const [vaccinationDetails, setVaccinationDetails] = useState('FMD & Brucellosis government vaccinated');
  const [healthNotes, setHealthNotes] = useState('Calm temperament, healthy feeder');

  // Location
  const [district, setDistrict] = useState(user?.district || 'Tiruppur');
  const [panchayat, setPanchayat] = useState(user?.panchayat || 'Kangeyam');
  const [village, setVillage] = useState(user?.village || '');
  const [hideExactLocation, setHideExactLocation] = useState(true);

  // Assisted mode for Panchayat Reps
  const [assistedFarmers, setAssistedFarmers] = useState<any[]>([]);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>('');

  // Photos
  const [photos, setPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=800&q=80'
  ]);

  const [districts, setDistricts] = useState<string[]>([]);
  const [breedsCatalog, setBreedsCatalog] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getDistricts().then(setDistricts).catch(() => {});
    api.getSupportedBreeds().then(setBreedsCatalog).catch(() => {});
    if (user?.role === 'panchayat_rep' || user?.role === 'admin') {
      api.getAssistedFarmers().then(setAssistedFarmers).catch(() => {});
    }
  }, [user]);

  // Set default title when type/breed changes if not user-edited
  useEffect(() => {
    if (!title || title.includes('Cow') || title.includes('Buffalo') || title.includes('Goat')) {
      const enT = `${breed} ${livestockType.charAt(0).toUpperCase() + livestockType.slice(1)}`;
      const taT = `${breed} ${livestockType === 'cow' ? 'மாடு' : livestockType === 'buffalo' ? 'எருமை' : livestockType === 'goat' ? 'ஆடு' : 'கால்நடை'}`;
      setTitle(enT);
      setTitleTa(taT);
    }
  }, [livestockType, breed]);

  const handleVoiceExtracted = (attrs: any) => {
    if (attrs.livestock_type) setLivestockType(attrs.livestock_type);
    if (attrs.breed) setBreed(attrs.breed);
    if (attrs.age_months) setAgeMonths(attrs.age_months);
    if (attrs.milk_yield_liters) setMilkYieldLiters(attrs.milk_yield_liters);
    if (attrs.price) setPrice(attrs.price);
    if (attrs.description) setDescription(attrs.description);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const res = await api.uploadFile(files[0]);
      setPhotos((prev) => [...prev, res.url]);
    } catch {
      setPhotos((prev) => [
        ...prev,
        'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80'
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const listingData = {
        title: title || `${breed} ${livestockType}`,
        title_ta: titleTa || title,
        description: description,
        livestock_type: livestockType,
        breed: breed,
        age_months: ageMonths,
        gender: gender,
        price: price,
        is_negotiable: isNegotiable,
        milk_yield_liters: livestockType === 'cow' || livestockType === 'buffalo' ? milkYieldLiters : 0,
        lactation_number: lactationNumber,
        pregnancy_status: pregnancyStatus,
        weight_kg: weightKg,
        vaccination_status: vaccinationStatus,
        vaccination_details: vaccinationDetails,
        health_notes: healthNotes,
        photos: photos,
        documents: [],
        state: 'Tamil Nadu',
        district: district,
        panchayat: panchayat,
        village: village,
        latitude: 11.0042,
        longitude: 77.5612,
        hide_exact_location: hideExactLocation,
        is_demo: false
      };

      const targetId = selectedFarmerId ? parseInt(selectedFarmerId, 10) : undefined;
      const res = await api.createListing(listingData, targetId);
      onSuccess(res.id);
    } catch (err: any) {
      setError(err.message || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  const currentBreeds = breedsCatalog[livestockType] || [breed];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-3xl border border-sage-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="section-badge mb-2">
            <Plus className="w-3.5 h-3.5 text-forest-800" />
            <span>{lang === 'ta' ? 'புதிய பதிவு' : 'New Listing'}</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-charcoal-800">
            {lang === 'ta' ? 'கால்நடையைப் பதிவு செய்க' : 'List Livestock for Sale'}
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            {lang === 'ta'
              ? 'தமிழ் குரல் வழி உதவியுடன் அல்லது கீழே உள்ள படிவத்தை பூர்த்தி செய்து பதிவு செய்யுங்கள்.'
              : 'Direct farmer-to-buyer listing. Use Tamil voice assistance or fill in details below.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setVoiceModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 transition flex items-center gap-2 shadow-sm"
          >
            <Mic className="w-4 h-4 text-amber-700" />
            <span>{lang === 'ta' ? 'குரல் வழி பதிவு' : 'Voice Assistant'}</span>
          </button>

          <button
            type="button"
            onClick={() => setEstimatorModalOpen(true)}
            className="btn-sage text-xs py-2 px-3.5"
          >
            <Sparkles className="w-4 h-4 text-forest-800" />
            <span>{t('btnCalculatePrice')}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-sage-200 shadow-card space-y-6">
        {/* Assisted Farmer Selector for Panchayat Reps */}
        {(user?.role === 'panchayat_rep' || user?.role === 'admin') && assistedFarmers.length > 0 && (
          <div className="p-4 rounded-2xl bg-forest-50 border border-forest-200 space-y-2">
            <label className="text-xs font-bold text-forest-900 block">
              {lang === 'ta' ? 'உதவிப் பதிவு: விவசாயியைத் தேர்ந்தெடுக்கவும்' : 'Assisted Mode: Select Registered Farmer'}
            </label>
            <select
              value={selectedFarmerId}
              onChange={(e) => setSelectedFarmerId(e.target.value)}
              className="w-full text-xs font-semibold"
            >
              <option value="">Posting as Myself ({user.full_name})</option>
              {assistedFarmers.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.full_name} ({f.phone}) — {f.village || f.panchayat}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Section 1: Livestock Classification */}
        <div className="space-y-4">
          <h2 className="font-display font-bold text-base text-charcoal-800 pb-2 border-b border-sage-100">
            1. {lang === 'ta' ? 'கால்நடை வகை மற்றும் இனம்' : 'Livestock Classification'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-charcoal-800 block mb-1.5">
                {lang === 'ta' ? 'கால்நடை வகை *' : 'Animal Category *'}
              </label>
              <select
                value={livestockType}
                onChange={(e) => setLivestockType(e.target.value)}
                className="w-full text-xs"
              >
                <option value="cow">{t('catCow')}</option>
                <option value="buffalo">{t('catBuffalo')}</option>
                <option value="goat">{t('catGoat')}</option>
                <option value="sheep">{t('catSheep')}</option>
                <option value="hen">{t('catHen')}</option>
                <option value="chicken">{t('catChicken')}</option>
                <option value="duck">{t('catDuck')}</option>
                <option value="other">{t('catOther')}</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-charcoal-800 block mb-1.5">
                {lang === 'ta' ? 'இனம் *' : 'Breed *'}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-charcoal-800 block mb-1.5">
                {lang === 'ta' ? 'தலைப்பு (ஆங்கிலம்) *' : 'Listing Title (English) *'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-charcoal-800 block mb-1.5">
                {lang === 'ta' ? 'தலைப்பு (தமிழ்)' : 'Title (Tamil)'}
              </label>
              <input
                type="text"
                value={titleTa}
                onChange={(e) => setTitleTa(e.target.value)}
                className="w-full text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Health, Milking & Vital Metrics */}
        <div className="space-y-4">
          <h2 className="font-display font-bold text-base text-charcoal-800 pb-2 border-b border-sage-100">
            2. {lang === 'ta' ? 'பால் அளவு மற்றும் உடல் தகுதி' : 'Milk Yield & Vitals'}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-charcoal-800 block mb-1.5">
                {t('age')} (Months)
              </label>
              <input
                type="number"
                min="1"
                max="240"
                value={ageMonths}
                onChange={(e) => setAgeMonths(parseInt(e.target.value, 10))}
                className="w-full text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-charcoal-800 block mb-1.5">
                {t('gender')}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full text-xs"
              >
                <option value="female">{t('female')}</option>
                <option value="male">{t('male')}</option>
              </select>
            </div>

            {(livestockType === 'cow' || livestockType === 'buffalo') && (
              <>
                <div>
                  <label className="text-xs font-bold text-charcoal-800 block mb-1.5">
                    {t('milkYield')} (L/day)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={milkYieldLiters}
                    onChange={(e) => setMilkYieldLiters(parseFloat(e.target.value))}
                    className="w-full text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-charcoal-800 block mb-1.5">
                    {t('lactation')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={lactationNumber}
                    onChange={(e) => setLactationNumber(parseInt(e.target.value, 10))}
                    className="w-full text-xs"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-bold text-charcoal-800 block mb-1.5">
                {t('pregnancy')}
              </label>
              <select
                value={pregnancyStatus}
                onChange={(e) => setPregnancyStatus(e.target.value)}
                className="w-full text-xs"
              >
                <option value="not_pregnant">{t('notPregnant')}</option>
                <option value="pregnant">{t('pregnant')}</option>
                <option value="not_applicable">Not Applicable</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-charcoal-800 block mb-1.5">
                {t('vaccination')}
              </label>
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-charcoal-800 block mb-1.5">
                Vaccination Details / தடுப்பூசி விபரம்
              </label>
              <input
                type="text"
                placeholder="e.g. FMD, Anthrax, TN Animal Husbandry card details"
                value={vaccinationDetails}
                onChange={(e) => setVaccinationDetails(e.target.value)}
                className="w-full text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-charcoal-800 block mb-1.5">
                {t('healthNotes')}
              </label>
              <input
                type="text"
                placeholder="e.g. Docile, feeds on green fodder, oilcake accustomed"
                value={healthNotes}
                onChange={(e) => setHealthNotes(e.target.value)}
                className="w-full text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Pricing & Location */}
        <div className="space-y-4">
          <h2 className="font-display font-bold text-base text-charcoal-800 pb-2 border-b border-sage-100">
            3. {lang === 'ta' ? 'விலை மற்றும் இருப்பிடம்' : 'Pricing & Panchayat Location'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-charcoal-800 block mb-1.5">
                {t('price')} (₹) *
              </label>
              <input
                type="number"
                required
                min="500"
                value={price}
                onChange={(e) => setPrice(parseInt(e.target.value, 10))}
                className="w-full text-xs font-bold text-forest-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-charcoal-800 block mb-1.5">
                {t('selectDistrict')} *
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full text-xs"
              >
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-charcoal-800 block mb-1.5">
                {t('village')} & Gram Panchayat *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Pappini Pudur"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-charcoal-800 block mb-1.5">
              Extended Description / விரிவான விளக்கம்
            </label>
            <textarea
              rows={3}
              placeholder="Describe temperament, feeding habits, past yields, or reason for selling..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs"
            />
          </div>
        </div>

        {/* Section 4: Photos */}
        <div className="space-y-4">
          <h2 className="font-display font-bold text-base text-charcoal-800 pb-2 border-b border-sage-100">
            4. {lang === 'ta' ? 'புகைப்படங்கள்' : 'Livestock Photos'}
          </h2>

          <div className="flex flex-wrap gap-3">
            {photos.map((p, idx) => (
              <div
                key={idx}
                className="relative w-24 h-24 rounded-2xl overflow-hidden border border-sage-200 bg-ivory-200 group shadow-sm"
              >
                <img src={p} alt="Animal" className="w-full h-full object-cover" />
                {photos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition shadow"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}

            <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-sage-300 hover:border-forest-700 bg-sage-50/50 flex flex-col items-center justify-center cursor-pointer transition">
              <Upload className="w-5 h-5 text-forest-700 mb-1" />
              <span className="text-[10px] font-bold text-forest-800">Add Photo</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="pt-4 border-t border-sage-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn-sage text-xs py-2.5 px-5"
          >
            {t('btnCancel')}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-forest text-xs py-2.5 px-6 font-bold disabled:opacity-50"
          >
            {submitting ? 'Publishing...' : 'Publish Listing'}
          </button>
        </div>
      </form>

      {/* Voice Assistant Modal */}
      <VoiceListingModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onAttributesExtracted={handleVoiceExtracted}
      />

      {/* Estimator Modal */}
      <PriceEstimatorModal
        isOpen={estimatorModalOpen}
        onClose={() => setEstimatorModalOpen(false)}
        initialLivestockType={livestockType}
        initialBreed={breed}
        onApplyPrice={(p) => setPrice(p)}
      />
    </div>
  );
};
