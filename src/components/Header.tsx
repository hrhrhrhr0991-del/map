import React from 'react';
import { Compass, History, Sparkles, MapPin, Globe, Share2, Layers } from 'lucide-react';

interface HeaderProps {
  onOpenHistory: () => void;
  historyCount: number;
  activeView: 'cards' | 'table' | 'map';
  setActiveView: (view: 'cards' | 'table' | 'map') => void;
  hasResults: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHistory,
  historyCount,
  activeView,
  setActiveView,
  hasResults,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 p-0.5 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Compass className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                مپ‌اکسترکتور <span className="text-amber-400 font-black">پرو</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30">
                Maps & Web AI
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              استخراج جامع اطلاعات، تلفن و آدرس کسب‌وکارها با یک جمله از گوگل مپ و وب
            </p>
          </div>
        </div>

        {/* View Switchers & History */}
        <div className="flex items-center gap-2 sm:gap-3">
          {hasResults && (
            <div className="bg-slate-950/80 p-1 rounded-xl border border-slate-800 flex items-center">
              <button
                onClick={() => setActiveView('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeView === 'cards'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
                aria-label="نمایش کارتی"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden md:inline">کارت‌ها</span>
              </button>
              <button
                onClick={() => setActiveView('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeView === 'table'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
                aria-label="نمایش جدولی"
              >
                <span className="font-mono text-xs">#</span>
                <span className="hidden md:inline">جدول داده‌ها</span>
              </button>
              <button
                onClick={() => setActiveView('map')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeView === 'map'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
                aria-label="نمایش روی نقشه"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span className="hidden md:inline">نقشه زنده</span>
              </button>
            </div>
          )}

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="relative px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
            title="تاریخچه جستجوهای من"
            aria-label="تاریخچه جستجو"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">تاریخچه</span>
            {historyCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
