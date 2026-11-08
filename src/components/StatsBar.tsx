import React from 'react';
import { Building2, Phone, Globe, Instagram, Star, MapPin } from 'lucide-react';
import { BusinessLead } from '../types/business';

interface StatsBarProps {
  leads: BusinessLead[];
  searchTimeMs?: number;
  engineUsed?: string;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  leads,
  searchTimeMs,
  engineUsed,
}) => {
  if (leads.length === 0) return null;

  const total = leads.length;
  const withPhone = leads.filter((l) => Boolean(l.phone || (l.secondaryPhones && l.secondaryPhones.length > 0))).length;
  const withWebsite = leads.filter((l) => Boolean(l.website)).length;
  const withInstagram = leads.filter((l) => Boolean(l.instagram)).length;
  
  const ratedLeads = leads.filter((l) => l.rating !== undefined && l.rating > 0);
  const avgRating = ratedLeads.length > 0
    ? (ratedLeads.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratedLeads.length).toFixed(1)
    : '-';

  const cities = Array.from(new Set(leads.map((l) => l.city).filter(Boolean)));

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 mb-6 shadow-xl backdrop-blur-sm">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Leads */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-white">{total}</div>
            <div className="text-xs text-slate-400">کسب‌وکار استخراج شده</div>
          </div>
        </div>

        {/* With Phone */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-emerald-400">{withPhone}</div>
            <div className="text-xs text-slate-400">دارای تلفن و تماس</div>
          </div>
        </div>

        {/* With Website */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-sky-400">{withWebsite}</div>
            <div className="text-xs text-slate-400">دارای وب‌سایت</div>
          </div>
        </div>

        {/* With Instagram */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center shrink-0">
            <Instagram className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-pink-400">{withInstagram}</div>
            <div className="text-xs text-slate-400">دارای اینستاگرام</div>
          </div>
        </div>

        {/* Avg Rating */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-lg bg-yellow-500/10 text-yellow-400 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 fill-yellow-400/20" />
          </div>
          <div>
            <div className="text-xl font-black text-yellow-400">{avgRating} <span className="text-xs text-slate-400 font-normal">از ۵</span></div>
            <div className="text-xs text-slate-400">میانگین امتیاز مشتریان</div>
          </div>
        </div>
      </div>

      {(searchTimeMs || engineUsed) && (
        <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>منبع اطلاعات: {engineUsed || 'پایگاه داده گوگل مپ'}</span>
          </div>
          {searchTimeMs && (
            <span>زمان پردازش: {(searchTimeMs / 1000).toFixed(2)} ثانیه</span>
          )}
        </div>
      )}
    </div>
  );
};
