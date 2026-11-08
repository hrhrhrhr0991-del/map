import React, { useState } from 'react';
import { X, Copy, Check, Download, Phone } from 'lucide-react';
import { BusinessLead } from '../types/business';
import { extractPhoneNumbersList, downloadFile } from '../utils/exportUtils';
import { formatForWhatsApp } from '../utils/parserUtils';

interface PhoneListModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: BusinessLead[];
}

export const PhoneListModal: React.FC<PhoneListModalProps> = ({
  isOpen,
  onClose,
  leads,
}) => {
  const [format, setFormat] = useState<'newline' | 'comma' | 'international'>('newline');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Extract and format numbers
  const rawNumbers: string[] = [];
  leads.forEach((l) => {
    if (l.phone && !rawNumbers.includes(l.phone)) {
      rawNumbers.push(l.phone);
    }
    if (l.secondaryPhones) {
      l.secondaryPhones.forEach((p) => {
        if (p && !rawNumbers.includes(p)) {
          rawNumbers.push(p);
        }
      });
    }
  });

  let formattedText = '';
  if (format === 'newline') {
    formattedText = rawNumbers.join('\n');
  } else if (format === 'comma') {
    formattedText = rawNumbers.join(', ');
  } else if (format === 'international') {
    formattedText = rawNumbers
      .map((num) => {
        const intl = formatForWhatsApp(num);
        return intl ? `+${intl}` : num;
      })
      .join('\n');
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    downloadFile(formattedText, `extracted_phone_numbers_${Date.now()}.txt`, 'text/plain');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">لیست شماره‌های تماس استخراج شده</h3>
              <p className="text-xs text-slate-400">مناسب برای پنل‌های پیامکی و بازاریابی تلفنی</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="بستن پنجره شماره‌ها"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Format Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">قالب خروجی:</span>
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
              <button
                onClick={() => setFormat('newline')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  format === 'newline'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                خط به خط (سطری)
              </button>
              <button
                onClick={() => setFormat('comma')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  format === 'comma'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                با کاما (,)
              </button>
              <button
                onClick={() => setFormat('international')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  format === 'international'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                بین‌المللی (+98...)
              </button>
            </div>
          </div>

          {/* Text Area */}
          <div className="relative">
            <textarea
              readOnly
              value={formattedText}
              rows={8}
              dir="ltr"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 resize-none selection:bg-amber-500/30"
            />
            <span className="absolute left-3 bottom-3 text-[11px] text-slate-500 font-mono">
              تعداد شماره‌ها: {rawNumbers.length}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={handleDownloadTxt}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>دانلود فایل TXT</span>
          </button>

          <button
            onClick={handleCopy}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>کپی شد!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>کپی تمام شماره‌ها</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
