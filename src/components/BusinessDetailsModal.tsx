import React, { useState } from 'react';
import {
  X,
  Phone,
  MapPin,
  Globe,
  Instagram,
  Star,
  ExternalLink,
  MessageCircle,
  Copy,
  Check,
  Navigation,
  Clock,
  Sparkles,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { BusinessLead } from '../types/business';

interface BusinessDetailsModalProps {
  lead: BusinessLead | null;
  onClose: () => void;
}

export const BusinessDetailsModal: React.FC<BusinessDetailsModalProps> = ({
  lead,
  onClose,
}) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!lead) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/40">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {lead.category || 'کسب‌وکار'}
              </span>
              {lead.rating && (
                <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{lead.rating}</span>
                  {lead.reviewsCount && (
                    <span className="text-slate-400 text-[10px]">({lead.reviewsCount} نظر)</span>
                  )}
                </div>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">{lead.name}</h3>
            {lead.latinName && (
              <p className="text-xs text-slate-400 font-sans mt-0.5" dir="ltr">
                {lead.latinName}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Call */}
            {lead.phone ? (
              <a
                href={`tel:${lead.phone}`}
                className="p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex flex-col items-center justify-center gap-1.5 font-bold transition-all"
              >
                <Phone className="w-5 h-5 text-emerald-400" />
                <span className="text-xs">تماس مستقیم</span>
              </a>
            ) : null}

            {/* WhatsApp */}
            {lead.whatsapp ? (
              <a
                href={`https://wa.me/${lead.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-600/30 text-emerald-400 flex flex-col items-center justify-center gap-1.5 font-bold transition-all"
              >
                <MessageCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-xs">پیام در واتساپ</span>
              </a>
            ) : null}

            {/* Google Maps Navigation */}
            {lead.googleMapsUrl ? (
              <a
                href={lead.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 flex flex-col items-center justify-center gap-1.5 font-bold transition-all"
              >
                <Navigation className="w-5 h-5 text-amber-400" />
                <span className="text-xs">مسیریابی در نقشه</span>
              </a>
            ) : null}

            {/* Website */}
            {lead.website ? (
              <a
                href={lead.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 flex flex-col items-center justify-center gap-1.5 font-bold transition-all"
              >
                <Globe className="w-5 h-5 text-sky-400" />
                <span className="text-xs">بازدید وب‌سایت</span>
              </a>
            ) : null}
          </div>

          {/* Description */}
          {lead.description && (
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-bold text-slate-400 mb-2">درباره این کسب‌وکار:</h4>
              <p className="text-slate-200 leading-relaxed text-xs sm:text-sm">{lead.description}</p>
            </div>
          )}

          {/* Contact Details Grid */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 mb-2">اطلاعات تماس و نشانی:</h4>

            {/* Main Phone */}
            {lead.phone && (
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  شماره اصلی:
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white" dir="ltr">
                    {lead.phone}
                  </span>
                  <button
                    onClick={() => handleCopy(lead.phone, 'mainPhone')}
                    className="p-1 rounded text-slate-400 hover:text-white"
                    title="کپی"
                  >
                    {copiedText === 'mainPhone' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Secondary phones */}
            {lead.secondaryPhones && lead.secondaryPhones.length > 0 && (
              <div className="flex items-center justify-between text-xs sm:text-sm pt-2 border-t border-slate-800/60">
                <span className="text-slate-400">سایر شماره‌ها:</span>
                <span className="font-mono text-slate-300" dir="ltr">
                  {lead.secondaryPhones.join(' ، ')}
                </span>
              </div>
            )}

            {/* Address */}
            <div className="flex items-start justify-between text-xs sm:text-sm pt-2 border-t border-slate-800/60">
              <span className="text-slate-400 flex items-center gap-1.5 shrink-0">
                <MapPin className="w-4 h-4 text-amber-400" />
                آدرس کامل:
              </span>
              <span className="text-slate-200 text-left font-medium max-w-sm mr-2 leading-relaxed">
                {lead.address}
              </span>
            </div>

            {/* City & Country */}
            <div className="flex items-center justify-between text-xs sm:text-sm pt-2 border-t border-slate-800/60">
              <span className="text-slate-400">شهر و کشور:</span>
              <span className="text-slate-200 font-bold">
                {lead.city} - {lead.country}
              </span>
            </div>

            {/* Hours */}
            {lead.hours && (
              <div className="flex items-center justify-between text-xs sm:text-sm pt-2 border-t border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  ساعت کاری:
                </span>
                <span className="text-slate-200">{lead.hours}</span>
              </div>
            )}

            {/* Instagram */}
            {lead.instagram && (
              <div className="flex items-center justify-between text-xs sm:text-sm pt-2 border-t border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Instagram className="w-4 h-4 text-pink-400" />
                  اینستاگرام:
                </span>
                <a
                  href={`https://instagram.com/${lead.instagram.replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-400 font-mono font-bold hover:underline"
                  dir="ltr"
                >
                  {lead.instagram}
                </a>
              </div>
            )}
          </div>

          {/* Features Tags */}
          {lead.features && lead.features.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                ویژگی‌ها و تخصص‌ها:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {lead.features.map((feat, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl bg-slate-800/80 text-amber-200 border border-slate-700/60 text-xs font-medium"
                  >
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Grounding sources requirement */}
          {lead.groundingSources && lead.groundingSources.length > 0 && (
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs">
              <h4 className="font-bold text-slate-400 mb-2">لینک‌ها و منابع تایید شده نقشه:</h4>
              <div className="space-y-1.5">
                {lead.groundingSources.map((source, i) => (
                  <a
                    key={i}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 transition-all"
                  >
                    <span className="truncate max-w-md">{source.title || source.uri}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
