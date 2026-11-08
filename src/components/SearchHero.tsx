import React, { useState } from 'react';
import { Search, Sparkles, MapPin, Globe, Loader2, ArrowLeft, X, Upload } from 'lucide-react';
import { BatchUploadModal } from './BatchUploadModal';

interface SearchHeroProps {
  onSearch: (query: string, mode: 'maps_grounding' | 'hybrid', count?: number) => void;
  isLoading: boolean;
  currentQuery: string;
}

const PRESET_QUERIES = [
  { label: '🍽️ رستوران‌های بصره (عراق)', query: 'رستوران‌های بصره' },
  { label: '🍰 شیرینی‌فروشی‌های قم', query: 'شیرینی‌فروشی‌های قم' },
  { label: '☕ کافه‌های دنج تهران', query: 'کافه‌های دنج و معروف تهران' },
  { label: '🏨 هتل‌های نزدیک حرم مشهد', query: 'هتل‌های نزدیک حرم مشهد' },
  { label: '🏢 صرافی‌های ایرانی استانبول', query: 'صرافی‌های ایرانی در استانبول' },
  { label: '🏖️ رستوران‌های دبی', query: 'رستوران‌های دبی' },
  { label: '🦷 دندانپزشکی‌های اصفهان', query: 'کلینیک‌های دندانپزشکی اصفهان' },
  { label: '🍲 Persian restaurants in Toronto', query: 'Persian restaurants in Toronto' },
];

export const SearchHero: React.FC<SearchHeroProps> = ({
  onSearch,
  isLoading,
  currentQuery,
}) => {
  const [query, setQuery] = useState(currentQuery || '');
  const [mode, setMode] = useState<'maps_grounding' | 'hybrid'>('maps_grounding');
  const [targetCount, setTargetCount] = useState<number>(25);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim(), mode, targetCount);
    }
  };

  const handleSelectPreset = (presetText: string) => {
    setQuery(presetText);
    onSearch(presetText, mode, targetCount);
  };

  return (
    <div className="relative py-8 md:py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60 bg-gradient-to-b from-slate-900/60 to-slate-950/40">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>استخراج هوشمند اطلاعات تماس، آدرس و مشخصات از گوگل مپ و وب</span>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-3">
          فقط با یک عنوان،{' '}
          <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
            تمام کسب‌وکارها و شماره‌ها
          </span>{' '}
          را دریافت کنید
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
          فرقی نمی‌کند داخل ایران باشد یا خارج؛ نام صنف و شهر را بنویسید تا تمام اطلاعات از جمله تلفن ثابت، موبایل، آدرس، سایت، اینستاگرام و لوکیشن دقیق گوگل مپ استخراج شود.
        </p>

        {/* Main Search Input Form */}
        <form onSubmit={handleSubmit} className="mb-5">
          <div className="relative max-w-3xl mx-auto bg-slate-900/90 border-2 border-slate-700/80 hover:border-amber-500/60 focus-within:border-amber-400 rounded-2xl p-1.5 shadow-2xl shadow-black/60 transition-all flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-3 flex-1 px-3 py-2">
              <Search className="w-5 h-5 text-amber-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="مثال: شیرینی‌فروشی‌های قم، کافه‌های تهران، یا Dentists in Toronto..."
                disabled={isLoading}
                className="w-full bg-transparent border-none outline-none text-slate-100 placeholder:text-slate-500 text-sm sm:text-base font-medium"
                aria-label="عنوان جستجوی کسب‌وکار"
              />
              {query && !isLoading && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 rounded-md text-slate-400 hover:text-white"
                  aria-label="پاک کردن متن"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer shrink-0"
              aria-label="شروع استخراج اطلاعات"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>در حال استخراج...</span>
                </>
              ) : (
                <>
                  <span>استخراج اطلاعات</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Engine mode selector */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs mb-6">
          <span className="text-slate-400 font-medium">موتور کاوشگر:</span>
          <button
            type="button"
            onClick={() => setMode('maps_grounding')}
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === 'maps_grounding'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-semibold'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>پایگاه داده زنده گوگل مپ (Google Maps Live)</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('hybrid')}
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === 'hybrid'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-semibold'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-orange-400" />
            <span>ترکیبی: گوگل مپ + وب و اینستاگرام</span>
          </button>

          {/* Result volume selector */}
          <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-lg p-0.5">
            <span className="text-slate-500 px-2 text-[11px]">حجم نتایج:</span>
            <button
              type="button"
              onClick={() => setTargetCount(15)}
              className={`px-2 py-0.5 rounded text-[11px] transition-all cursor-pointer ${
                targetCount === 15 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              ۱۵ مورد
            </button>
            <button
              type="button"
              onClick={() => setTargetCount(25)}
              className={`px-2 py-0.5 rounded text-[11px] transition-all cursor-pointer ${
                targetCount === 25 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              ۲۵ مورد
            </button>
            <button
              type="button"
              onClick={() => setTargetCount(35)}
              className={`px-2 py-0.5 rounded text-[11px] transition-all cursor-pointer ${
                targetCount === 35 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              ۳۵+ مورد (عمیق)
            </button>
          </div>
        </div>

        {/* Presets Chips & Batch File Upload */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-slate-500 font-medium">پیشنهادهای آماده:</span>
          {PRESET_QUERIES.map((preset) => (
            <button
              key={preset.query}
              type="button"
              onClick={() => handleSelectPreset(preset.query)}
              disabled={isLoading}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700/80 hover:text-amber-300 text-slate-300 border border-slate-700/50 transition-all cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            disabled={isLoading}
            className="text-xs px-3 py-1 rounded-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 transition-all cursor-pointer flex items-center gap-1 font-semibold"
          >
            <Upload className="w-3 h-3 text-amber-400" />
            <span>آپلود فایل عناوین (TXT/CSV)</span>
          </button>
        </div>
      </div>

      {/* Batch Upload Modal */}
      <BatchUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSelectQuery={(selectedQuery) => {
          setQuery(selectedQuery);
          onSearch(selectedQuery, mode, targetCount);
        }}
      />
    </div>
  );
};
