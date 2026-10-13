import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Mic, MicOff, Sparkles, X, Volume2, Check, ArrowRight } from 'lucide-react';

interface ExtractedAttributes {
  livestock_type?: string;
  breed?: string;
  age_months?: number;
  milk_yield_liters?: number;
  price?: number;
  description?: string;
}

interface VoiceListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttributesExtracted: (attrs: ExtractedAttributes) => void;
}

export const VoiceListingModal: React.FC<VoiceListingModalProps> = ({
  isOpen,
  onClose,
  onAttributesExtracted
}) => {
  const { lang, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [extracted, setExtracted] = useState<ExtractedAttributes | null>(null);
  const [voiceLang, setVoiceLang] = useState<'ta-IN' | 'en-IN'>(lang === 'ta' ? 'ta-IN' : 'en-IN');
  const [hasSpeechSupport, setHasSpeechSupport] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setHasSpeechSupport(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = voiceLang;

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
        setTranscript(currentTranscript.trim());
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch {
      setHasSpeechSupport(false);
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, [voiceLang]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      // Fallback: test phrase simulation
      simulateSampleVoice(voiceLang === 'ta-IN' ? 'sample_ta' : 'sample_en');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setExtracted(null);
      try {
        recognitionRef.current.lang = voiceLang;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn(err);
        setIsListening(false);
      }
    }
  };

  // Heuristic Natural Language Parser for Tamil & English Livestock phrases
  const parseLivestockVoice = (text: string) => {
    const lower = text.toLowerCase();
    const result: ExtractedAttributes = { description: text };

    // 1. Livestock Type
    if (lower.includes('மாடு') || lower.includes('பசு') || lower.includes('கறவை') || lower.includes('cow')) {
      result.livestock_type = 'cow';
    } else if (lower.includes('எருமை') || lower.includes('buffalo')) {
      result.livestock_type = 'buffalo';
    } else if (lower.includes('ஆடு') || lower.includes('வெள்ளாடு') || lower.includes('goat')) {
      result.livestock_type = 'goat';
    } else if (lower.includes('செம்மறி') || lower.includes('sheep')) {
      result.livestock_type = 'sheep';
    } else if (lower.includes('சேவல்') || lower.includes('சண்டை சேவல்') || lower.includes('hen') || lower.includes('rooster')) {
      result.livestock_type = 'hen';
    } else if (lower.includes('கோழி') || lower.includes('chicken')) {
      result.livestock_type = 'chicken';
    } else if (lower.includes('வாத்து') || lower.includes('duck')) {
      result.livestock_type = 'duck';
    }

    // 2. Breed
    if (lower.includes('காங்கேயம்') || lower.includes('kangayam')) {
      result.breed = 'Kangayam';
    } else if (lower.includes('முர்ரா') || lower.includes('murrah')) {
      result.breed = 'Murrah';
    } else if (lower.includes('கிர்') || lower.includes('gir')) {
      result.breed = 'Gir';
    } else if (lower.includes('சாஹிவால்') || lower.includes('sahiwal')) {
      result.breed = 'Sahiwal';
    } else if (lower.includes('தலைச்சேரி') || lower.includes('tellicherry')) {
      result.breed = 'Tellicherry';
    } else if (lower.includes('மேச்சேரி') || lower.includes('mecheri')) {
      result.breed = 'Mecheri';
    } else if (lower.includes('ஜெர்சி') || lower.includes('jersey')) {
      result.breed = 'Jersey Cross';
    } else if (lower.includes('அசல்') || lower.includes('aseel')) {
      result.breed = 'Aseel';
    }

    // 3. Milk yield
    const milkMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:லிட்டர்|liter|litres|l)/);
    if (milkMatch) {
      result.milk_yield_liters = parseFloat(milkMatch[1]);
    }

    // 4. Age (years or months)
    const ageYearMatch = lower.match(/(\d+)\s*(?:வயது|year|years|yr)/);
    if (ageYearMatch) {
      result.age_months = parseInt(ageYearMatch[1], 10) * 12;
    } else {
      const ageMonthMatch = lower.match(/(\d+)\s*(?:மாதம்|மாதங்கள்|month|months)/);
      if (ageMonthMatch) {
        result.age_months = parseInt(ageMonthMatch[1], 10);
      }
    }

    // 5. Price
    const thousandMatch = lower.match(/(\d+)\s*(?:ஆயிரம்|thousand|k)/);
    if (thousandMatch) {
      result.price = parseInt(thousandMatch[1], 10) * 1000;
    } else {
      const rawPriceMatch = lower.match(/(?:ரூபாய்|rs|inr|price)?\s*(\d{4,6})/);
      if (rawPriceMatch) {
        result.price = parseFloat(rawPriceMatch[1]);
      }
    }

    setExtracted(result);

    // Speak synthesis confirmation if available
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(
        voiceLang === 'ta-IN' ? 'விபரங்கள் அடையாளம் காணப்பட்டன' : 'Livestock attributes recognized'
      );
      msg.lang = voiceLang;
      window.speechSynthesis.speak(msg);
    }
  };

  const simulateSampleVoice = (type: 'sample_ta' | 'sample_en') => {
    const sample = type === 'sample_ta'
      ? 'நான் 3 வயது காங்கேயம் கறவை மாடு விற்கிறேன், தினசரி 12 லிட்டர் பால், விலை 65 ஆயிரம் ரூபாய்'
      : 'I want to sell 3 year old Murrah buffalo with 14 liters milk yield, price 85000 rupees';
    setTranscript(sample);
    parseLivestockVoice(sample);
  };

  const handleApply = () => {
    if (extracted) {
      onAttributesExtracted(extracted);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-earth-300 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center shadow-inner">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{t('voiceTitle')}</h3>
            <p className="text-xs text-slate-500">
              {lang === 'ta' ? 'பேசிய குரலில் இருந்து தானாகவே விபரங்களை எடுக்கும்' : 'AI parses animal, breed, yield & price from voice'}
            </p>
          </div>
        </div>

        {/* Language selector toggle */}
        <div className="flex items-center justify-between bg-sand-100 p-1.5 rounded-xl text-xs font-semibold mb-5">
          <span className="text-slate-600 pl-2">Speaking Language:</span>
          <div className="flex gap-1">
            <button
              onClick={() => setVoiceLang('ta-IN')}
              className={`px-3 py-1.5 rounded-lg transition ${voiceLang === 'ta-IN' ? 'bg-primary-700 text-white shadow' : 'text-slate-700 hover:bg-white/60'}`}
            >
              தமிழ் (Tamil)
            </button>
            <button
              onClick={() => setVoiceLang('en-IN')}
              className={`px-3 py-1.5 rounded-lg transition ${voiceLang === 'en-IN' ? 'bg-primary-700 text-white shadow' : 'text-slate-700 hover:bg-white/60'}`}
            >
              English (India)
            </button>
          </div>
        </div>

        {/* Main Microphone Button with Pulsing Wave */}
        <div className="flex flex-col items-center justify-center py-6">
          <div className="relative">
            {isListening && (
              <span className="absolute -inset-4 rounded-full bg-primary-500/25 animate-ping" />
            )}
            <button
              onClick={toggleListening}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition shadow-lg ${
                isListening
                  ? 'bg-rose-600 text-white scale-110 shadow-rose-300'
                  : 'bg-primary-700 hover:bg-primary-800 text-white hover:scale-105 shadow-primary-200'
              }`}
            >
              {isListening ? <MicOff className="w-8 h-8 animate-pulse" /> : <Mic className="w-8 h-8" />}
            </button>
          </div>

          <p className="mt-4 text-xs font-medium text-slate-600 text-center max-w-xs">
            {isListening ? t('voiceListening') : t('voiceStopped')}
          </p>

          {/* Quick Sample Voice Fillers */}
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => simulateSampleVoice('sample_ta')}
              className="text-[11px] px-2.5 py-1 rounded-full bg-earth-100 text-earth-800 hover:bg-earth-200 font-medium transition"
            >
              🎙️ மாதிரி தமிழ் குரல்
            </button>
            <button
              onClick={() => simulateSampleVoice('sample_en')}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 hover:bg-slate-200 font-medium transition"
            >
              🎙️ Sample English Voice
            </button>
          </div>
        </div>

        {/* Speech Transcript Output */}
        {transcript && (
          <div className="mb-4">
            <label className="text-xs font-bold text-slate-700 mb-1 block">
              {lang === 'ta' ? 'கேட்கப்பட்ட உரை:' : 'Spoken Transcript:'}
            </label>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed max-h-24 overflow-y-auto">
              "{transcript}"
            </div>
            {!isListening && !extracted && (
              <button
                onClick={() => parseLivestockVoice(transcript)}
                className="mt-2 text-xs font-bold text-primary-700 hover:text-primary-800 flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'ta' ? 'விபரங்களை பிரித்தெடு' : 'Extract Attributes'}</span>
              </button>
            )}
          </div>
        )}

        {/* Recognized Attributes Display */}
        {extracted && (
          <div className="p-3.5 bg-primary-50 rounded-2xl border border-primary-200 mb-4 animate-scale-in">
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary-900 mb-2">
              <Check className="w-4 h-4 text-primary-600" />
              <span>{t('voiceParseSuccess')}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 rounded-lg border border-primary-100">
                <span className="text-[10px] text-slate-500 block">Animal & Breed</span>
                <span className="font-bold text-slate-900">
                  {extracted.livestock_type?.toUpperCase() || '—'} {extracted.breed ? `(${extracted.breed})` : ''}
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-primary-100">
                <span className="text-[10px] text-slate-500 block">Estimated Price</span>
                <span className="font-bold text-emerald-700">
                  {extracted.price ? `₹${extracted.price.toLocaleString('en-IN')}` : '—'}
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-primary-100">
                <span className="text-[10px] text-slate-500 block">Age</span>
                <span className="font-bold text-slate-900">
                  {extracted.age_months ? `${Math.round(extracted.age_months/12 * 10)/10} yrs (${extracted.age_months}m)` : '—'}
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-primary-100">
                <span className="text-[10px] text-slate-500 block">Daily Milk Yield</span>
                <span className="font-bold text-slate-900">
                  {extracted.milk_yield_liters ? `${extracted.milk_yield_liters} Liters` : '—'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-earth-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            {t('btnCancel')}
          </button>
          <button
            onClick={handleApply}
            disabled={!extracted}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary-700 hover:bg-primary-800 disabled:opacity-50 text-white transition flex items-center gap-1.5 shadow-md"
          >
            <span>{lang === 'ta' ? 'படிவத்தில் நிரப்பு' : 'Apply to Listing'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
