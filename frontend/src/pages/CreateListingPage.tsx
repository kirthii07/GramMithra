import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { VoiceListingModal } from '../components/VoiceListingModal';
import { PriceEstimatorModal } from '../components/PriceEstimatorModal';
import { LeafletMap } from '../components/LeafletMap';
import {
  Mic,
  Upload,
  Sparkles,
  MapPin,
  Check,
  ShieldCheck,
  Lock,
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
  const [coords, setCoords] = useState<[number, number]>([
    user?.latitude || 11.0042,
    user?.longitude || 77.5612
  ]);
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
      setPhotos(prev => [...prev, res.url]);
    } catch {
      // Fallback: use simulated image
      setPhotos(prev => [...prev, 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=800&q=80']);
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
        latitude: coords[0],
        longitude: coords[1],
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Top Banner with Voice Assistant Button */}
      <div className="bg-gradient-to-r from-primary-900 to-emerald-800 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-emerald-300 block mb-1">
            {lang === 'ta' ? 'புதிய கால்நடை விற்பனைப் பதிவு' : 'New Livestock Marketplace Listing'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">
            {lang === 'ta' ? 'கால்நடை விபரங்களை உள்ளிடுக' : 'Post Livestock for Sale'}
          </h1>
          <p className="text-xs text-emerald-100/80 mt-1 max-w-md">
            {lang === 'ta'
              ? 'குரல் வழியாகவோ அல்லது கீழேயுள்ள எளிய படிவத்தின் மூலமாகவோ கால்நடையை விற்பனைக்கு பட்டியலிடுங்கள்.'
              : 'Add photo, milk yield, vaccination papers, and GPS location.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setVoiceModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg flex-shrink-0"
        >
          <Mic className="w-5 h-5 animate-pulse text-slate-900" />
          <span>{lang === 'ta' ? 'குரல் வழி பதிவு (Voice Assist)' : 'Voice-Assist Listing'}</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8 bg-white text-[#19251E] p-6 sm:p-8 rounded-3xl border border-[#D7E2D8] shadow-sm">
        {/* Representative Assisted Mode selector if applicable */}
        {(user?.role === 'panchayat_rep' || user?.role === 'admin') && assistedFarmers.length > 0 && (
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>{lang === 'ta' ? 'ஊராட்சி உதவிப் பதிவு: விவசாயியைத் தேர்ந்தெடு' : 'Assisted Mode: Post for Onboarded Farmer'}</span>
            </div>
            <select
              value={selectedFarmerId}
              onChange={(e) => setSelectedFarmerId(e.target.value)}
              className="select-light w-full text-xs"
            >
              <option value="">Post as Myself ({user.full_name})</option>
              {assistedFarmers.map(f => (
                <option key={f.id} value={f.id}>
                  Farmer: {f.full_name} ({f.phone}) — {f.panchayat}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Section 1: Animal Type & Breed */}
        <div>
          <h2 className="text-base font-extrabold text-[#19251E] mb-3 pb-2 border-b border-[#E3E9E1]">
            1. {lang === 'ta' ? 'கால்நடை வகை & இனம்' : 'Animal Category & Breed'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-[#19251E] block mb-1">{t('catAll')}</label>
              <select
                value={livestockType}
                onChange={(e) => {
                  const newType = e.target.value;
                  setLivestockType(newType);
                  const firstBreed = (breedsCatalog[newType] && breedsCatalog[newType][0]) || 'default';
                  setBreed(firstBreed);
                }}
                className="select-light w-full text-xs"
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
              <label className="text-xs font-bold text-[#19251E] block mb-1">Breed / Variety</label>
              <select
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="select-light w-full text-xs"
              >
                {currentBreeds.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#19251E] block mb-1">{t('gender')}</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="select-light w-full text-xs"
              >
                <option value="female">{t('female')}</option>
                <option value="male">{t('male')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Pricing & Benchmark Guidance */}
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-[#E3E9E1] mb-3">
            <h2 className="text-base font-extrabold text-[#19251E]">
              2. {t('price')} & Fair Market Benchmark
            </h2>
            <button
              type="button"
              onClick={() => setEstimatorModalOpen(true)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{t('btnCalculatePrice')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#19251E] block mb-1">Asking Price (₹) *</label>
              <input
                type="number"
                required
                min="100"
                step="500"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value))}
                className="input-light w-full text-base font-bold"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#19251E]">
                <input
                  type="checkbox"
                  checked={isNegotiable}
                  onChange={(e) => setIsNegotiable(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>{t('negotiable')} (விலை பேசித் தீர்க்கலாம்)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Production & Physical Specs */}
        <div>
          <h2 className="text-base font-extrabold text-[#19251E] mb-3 pb-2 border-b border-[#E3E9E1]">
            3. {lang === 'ta' ? 'உற்பத்தி & உடல் விபரங்கள்' : 'Productivity & Specifications'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-[#19251E] block mb-1">{t('age')} ({t('months')})</label>
              <input
                type="number"
                required
                min="1"
                max="180"
                value={ageMonths}
                onChange={(e) => setAgeMonths(parseInt(e.target.value, 10))}
                className="input-light w-full text-xs"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block font-medium">
                Approx {Math.round(ageMonths/12 * 10)/10} {t('years')}
              </span>
            </div>

            {livestockType === 'cow' || livestockType === 'buffalo' ? (
              <>
                <div>
                  <label className="text-xs font-bold text-[#19251E] block mb-1">{t('milkYield')} (L/day)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={milkYieldLiters}
                    onChange={(e) => setMilkYieldLiters(parseFloat(e.target.value))}
                    className="input-light w-full text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#19251E] block mb-1">{t('lactation')}</label>
                  <select
                    value={lactationNumber}
                    onChange={(e) => setLactationNumber(parseInt(e.target.value, 10))}
                    className="select-light w-full text-xs"
                  >
                    <option value={1}>1st Calving</option>
                    <option value={2}>2nd Calving</option>
                    <option value={3}>3rd Calving</option>
                    <option value={4}>4th Calving</option>
                    <option value={5}>5th+ Calving</option>
                  </select>
                </div>
              </>
            ) : (
              <div>
                <label className="text-xs font-bold text-[#19251E] block mb-1">{t('weight')} (kg)</label>
                <input
                  type="number"
                  min="0"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value))}
                  className="input-light w-full text-xs"
                />
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Health & Vaccination Status */}
        <div>
          <h2 className="text-base font-extrabold text-[#19251E] mb-3 pb-2 border-b border-[#E3E9E1]">
            4. {t('vaccination')} & Health
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#19251E] block mb-1">{t('vaccination')}</label>
              <select
                value={vaccinationStatus}
                onChange={(e) => setVaccinationStatus(e.target.value)}
                className="select-light w-full text-xs"
              >
                <option value="fully_vaccinated">{t('fullyVaccinated')}</option>
                <option value="partially_vaccinated">{t('partiallyVaccinated')}</option>
                <option value="not_vaccinated">{t('notVaccinated')}</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#19251E] block mb-1">Vaccine Details</label>
              <input
                type="text"
                placeholder="e.g. FMD, Brucellosis, Anthrax card"
                value={vaccinationDetails}
                onChange={(e) => setVaccinationDetails(e.target.value)}
                className="input-light w-full text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Photos */}
        <div>
          <h2 className="text-base font-extrabold text-[#19251E] mb-3 pb-2 border-b border-[#E3E9E1]">
            5. {lang === 'ta' ? 'புகைப்படங்கள் (குறைந்தது 2 படங்கள் பரிந்துரை)' : 'Live Photographs'}
          </h2>

          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {photos.map((p, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-[#D7E2D8] shadow-sm group">
                  <img src={p} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-[#D7E2D8] hover:border-emerald-500 bg-[#FAF8F2] flex flex-col items-center justify-center cursor-pointer text-slate-500 hover:text-emerald-700 transition">
                <Upload className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-bold">Upload</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* Section 6: Location & Privacy Safeguard */}
        <div>
          <h2 className="text-base font-extrabold text-[#19251E] mb-3 pb-2 border-b border-[#E3E9E1]">
            6. {t('location')} & Privacy
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 relative z-10">
            <div>
              <label className="text-xs font-bold text-[#19251E] block mb-1">{t('selectDistrict')}</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="select-light w-full text-xs"
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
                className="input-light w-full text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#19251E] block mb-1">{t('village')}</label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="input-light w-full text-xs"
              />
            </div>
          </div>

          {/* Privacy toggle */}
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 mb-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-900">
              <input
                type="checkbox"
                checked={hideExactLocation}
                onChange={(e) => setHideExactLocation(e.target.checked)}
                className="rounded text-amber-700 focus:ring-amber-500 w-4 h-4"
              />
              <Lock className="w-4 h-4 text-amber-700" />
              <span>{lang === 'ta' ? 'தனியுரிமை பாதுகாப்பு: நேரடி பண்ணை ஜி.பி.எஸ் இடத்தை பொதுப் பார்வைக்கு மறை' : 'Privacy Protection: Mask exact farm GPS pin until visit confirmation'}</span>
            </label>
          </div>

          <div className="space-y-1 relative z-0">
            <span className="text-xs font-semibold text-slate-700 block">
              {lang === 'ta' ? 'வரைபடத்தில் கிளிக் செய்து துல்லிய இருப்பிடத்தைக் குறிக்கவும்' : 'Click on map or drag pin to set exact coordinates:'}
            </span>
            <LeafletMap
              center={coords}
              isPickerMode={true}
              onLocationPick={(lat, lon) => setCoords([lat, lon])}
              className="h-60 w-full"
            />
          </div>
        </div>

        {/* Section 7: Title & Description */}
        <div>
          <h2 className="text-base font-extrabold text-[#19251E] mb-3 pb-2 border-b border-[#E3E9E1]">
            7. Titles & Description
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-[#19251E] block mb-1">Title (English)</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-light w-full text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#19251E] block mb-1">தலைப்பு (தமிழ்)</label>
              <input
                type="text"
                value={titleTa}
                onChange={(e) => setTitleTa(e.target.value)}
                className="input-light w-full text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#19251E] block mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-light w-full text-xs"
              />
            </div>
          </div>
        </div>

        {/* Form Footer Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-earth-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            {t('btnCancel')}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 rounded-2xl bg-primary-700 hover:bg-primary-800 disabled:opacity-50 text-white font-black text-sm shadow-lg transition"
          >
            {submitting ? 'Publishing...' : lang === 'ta' ? 'கால்நடையை சந்தையில் பதிவிடு' : 'Publish Livestock Listing'}
          </button>
        </div>
      </form>

      {/* Modals */}
      <VoiceListingModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onAttributesExtracted={handleVoiceExtracted}
      />

      <PriceEstimatorModal
        isOpen={estimatorModalOpen}
        onClose={() => setEstimatorModalOpen(false)}
        initialLivestockType={livestockType}
        initialBreed={breed}
        onApplyPrice={(val) => setPrice(val)}
      />
    </div>
  );
};
