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
  Navigation,
  ArrowUpDown,
} from 'lucide-react';
import { BusinessLead } from '../types/business';

interface BusinessTableProps {
  leads: BusinessLead[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onOpenDetails: (lead: BusinessLead) => void;
}

export const BusinessTable: React.FC<BusinessTableProps> = ({
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
        <p className="text-slate-400 text-sm">هیچ رکوردی یافت نشد.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl mb-8">
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[11px] border-b border-slate-800">
            <tr>
              <th className="p-3 w-10 text-center">#</th>
              <th className="p-3">نام کسب‌وکار</th>
              <th className="p-3">دسته‌بندی</th>
              <th className="p-3">شماره تماس اصلی</th>
              <th className="p-3">شهر / آدرس</th>
              <th className="p-3 text-center">امتیاز</th>
              <th className="p-3 text-center">ارتباطات و وب</th>
              <th className="p-3 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {leads.map((lead, idx) => {
              const isSelected = selectedIds.includes(lead.id);

              return (
                <tr
                  key={lead.id}
                  onClick={() => onToggleSelect(lead.id)}
                  className={`hover:bg-slate-800/50 transition-colors cursor-pointer ${
                    isSelected ? 'bg-amber-500/10' : ''
                  }`}
                >
                  {/* Checkbox */}
                  <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(lead.id)}
                      className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                      aria-label={`انتخاب ${lead.name}`}
                    />
                  </td>

                  {/* Business Name */}
                  <td className="p-3 font-semibold text-white">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{lead.name}</span>
                      {lead.latinName && (
                        <span className="text-[10px] text-slate-400 font-sans" dir="ltr">
                          {lead.latinName}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 text-[11px] font-medium border border-slate-700">
                      {lead.category || 'کسب‌وکار'}
                    </span>
                  </td>

                  {/* Phone */}
                  <td className="p-3 font-mono" onClick={(e) => e.stopPropagation()}>
                    {lead.phone ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-100 font-bold text-xs" dir="ltr">
                          {lead.phone}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyPhone(lead.id, lead.phone, e)}
                          className="p-1 rounded text-slate-400 hover:text-white"
                          title="کپی شماره تماس"
                        >
                          {copiedId === lead.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic text-[11px]">-</span>
                    )}
                  </td>

                  {/* City & Address */}
                  <td className="p-3 max-w-xs">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-200 text-xs">
                        {lead.city} {lead.neighborhood ? `(${lead.neighborhood})` : ''}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate" title={lead.address}>
                        {lead.address}
                      </span>
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="p-3 text-center">
                    {lead.rating ? (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-300 font-bold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{lead.rating}</span>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-[11px]">-</span>
                    )}
                  </td>

                  {/* Communication & Web links */}
                  <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      {lead.website && (
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-800 text-sky-400 hover:bg-slate-700"
                          title="وب‌سایت"
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {lead.instagram && (
                        <a
                          href={`https://instagram.com/${lead.instagram.replace(/^@/, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-800 text-pink-400 hover:bg-slate-700"
                          title="اینستاگرام"
                        >
                          <Instagram className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {lead.whatsapp && (
                        <a
                          href={`https://wa.me/${lead.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-800 text-emerald-400 hover:bg-slate-700"
                          title="واتساپ"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {lead.googleMapsUrl && (
                        <a
                          href={lead.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-800 text-amber-400 hover:bg-slate-700"
                          title="گوگل مپ"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onOpenDetails(lead)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-all"
                    >
                      جزئیات
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
