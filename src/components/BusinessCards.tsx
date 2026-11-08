import React, { useState } from 'react';
import {
  Phone,
  MapPin,
  Globe,
  Instagram,
  Star,
  ExternalLink,
  MessageCircle,
  Copy,
  Check,
  Info,
  Clock,
  Sparkles,
  Navigation,
} from 'lucide-react';
import { BusinessLead } from '../types/business';

interface BusinessCardsProps {
  leads: BusinessLead[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onOpenDetails: (lead: BusinessLead) => void;
}

export const BusinessCards: React.FC<BusinessCardsProps> = ({
  leads,
  selectedIds,
  onToggleSelect,
  onOpenDetails,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyPhone = (id: string, phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (leads.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
        <p className="text-slate-400 text-sm">هیچ کسب‌وکاری با فیلترهای انتخابی مطابقت ندارد.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {leads.map((lead) => {
        const isSelected = selectedIds.includes(lead.id);

        return (
          <div
            key={lead.id}
            onClick={() => onToggleSelect(lead.id)}
            className={`group relative rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between ${
              isSelected
                ? 'bg-slate-900/90 border-amber-500/80 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/30'
                : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md'
            }`}
          >
            {/* Top Bar: Selection Checkbox & Category */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}} // handled by container onClick
                    className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                    aria-label={`انتخاب ${lead.name}`}
                  />
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 border border-slate-700/60">
                    {lead.category || 'کسب‌وکار'}
                  </span>
                </div>

                {/* Rating Badge */}
                {lead.rating && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{lead.rating}</span>
                    {lead.reviewsCount && (
                      <span className="text-slate-400 text-[10px] font-normal">({lead.reviewsCount})</span>
                    )}
                  </div>
                )}
              </div>

              {/* Title & Latin Name */}
              <h3 className="font-bold text-base sm:text-lg text-white mb-1 group-hover:text-amber-300 transition-colors line-clamp-1">
                {lead.name}
              </h3>
              {lead.latinName && (
                <p className="text-xs text-slate-400 font-sans mb-3 line-clamp-1" dir="ltr">
                  {lead.latinName}
                </p>
              )}

              {/* Description Snippet */}
              {lead.description && (
                <p className="text-xs text-slate-400 mb-3 line-clamp-2 leading-relaxed">
                  {lead.description}
                </p>
              )}

              {/* Phone Numbers Section */}
              <div className="space-y-1.5 mb-3 pt-2 border-t border-slate-800/60">
                {lead.phone ? (
                  <div className="flex items-center justify-between text-xs bg-slate-950/70 p-2 rounded-xl border border-slate-800/80">
                    <div className="flex items-center gap-2 text-slate-200">
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="font-mono text-xs font-bold tracking-wider" dir="ltr">
                        {lead.phone}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleCopyPhone(lead.id, lead.phone, e)}
                        className="p-1 rounded text-slate-400 hover:text-white"
                        title="کپی شماره"
                      >
                        {copiedId === lead.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <a
                        href={`tel:${lead.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-bold hover:bg-emerald-500/30 transition-all flex items-center gap-1"
                      >
                        تماس
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic py-1">شماره تلفن مستقیم ثبت نشده</div>
                )}

                {/* Secondary phones if exist */}
                {lead.secondaryPhones && lead.secondaryPhones.length > 0 && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 px-1">
                    <span className="text-slate-500">شماره‌های دیگر:</span>
                    <span className="font-mono" dir="ltr">
                      {lead.secondaryPhones.join(' ، ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="flex items-start gap-2 text-xs text-slate-300 mb-3">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span className="line-clamp-2 leading-relaxed">
                  {lead.address}
                </span>
              </div>

              {/* Tags / Features */}
              {lead.features && lead.features.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {lead.features.slice(0, 3).map((feat, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/50"
                    >
                      {feat}
                    </span>
                  ))}
                  {lead.features.length > 3 && (
                    <span className="text-[10px] text-slate-500 px-1 py-0.5">
                      +{lead.features.length - 3} بیشتر
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions Row */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
              <div className="flex items-center gap-1.5">
                {/* Website link */}
                {lead.website && (
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-lg bg-slate-800 text-sky-400 hover:bg-slate-700 transition-all"
                    title={`مشاهده سایت: ${lead.website}`}
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )}

                {/* Instagram link */}
                {lead.instagram && (
                  <a
                    href={`https://instagram.com/${lead.instagram.replace(/^@/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-lg bg-slate-800 text-pink-400 hover:bg-slate-700 transition-all"
                    title={`اینستاگرام: ${lead.instagram}`}
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}

                {/* WhatsApp button */}
                {lead.whatsapp && (
                  <a
                    href={`https://wa.me/${lead.whatsapp}?text=${encodeURIComponent(`سلام، از طریق گوگل مپ پیام می‌دهم.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-lg bg-slate-800 text-emerald-400 hover:bg-slate-700 transition-all"
                    title="ارسال پیام در واتساپ"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                )}

                {/* Google Maps link */}
                {lead.googleMapsUrl && (
                  <a
                    href={lead.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-lg bg-slate-800 text-amber-400 hover:bg-slate-700 transition-all"
                    title="مسیریابی در گوگل مپ"
                  >
                    <Navigation className="w-4 h-4" />
                  </a>
                )}
              </div>

              {/* Open Details Modal */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetails(lead);
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-1 transition-all"
              >
                <Info className="w-3.5 h-3.5 text-amber-400" />
                <span>مشاهده کامل</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
