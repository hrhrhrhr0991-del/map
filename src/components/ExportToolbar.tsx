import React, { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  Contact,
  Code,
  Printer,
  Copy,
  Check,
  Filter,
  CheckSquare,
  Square,
  Search,
} from 'lucide-react';
import { BusinessLead, FilterState } from '../types/business';
import { generateCsv, generateVcf, downloadFile, extractPhoneNumbersList } from '../utils/exportUtils';

interface ExportToolbarProps {
  leads: BusinessLead[];
  selectedIds: string[];
  onToggleSelectAll: () => void;
  onClearSelection: () => void;
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  onOpenPhoneListModal: () => void;
  queryTitle: string;
}

export const ExportToolbar: React.FC<ExportToolbarProps> = ({
  leads,
  selectedIds,
  onToggleSelectAll,
  onClearSelection,
  filterState,
  setFilterState,
  onOpenPhoneListModal,
  queryTitle,
}) => {
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Targets either selected leads or all filtered leads
  const targetLeads = selectedIds.length > 0
    ? leads.filter((l) => selectedIds.includes(l.id))
    : leads;

  const sanitizedQuery = (queryTitle || 'business-leads').replace(/[\s\/\\?%*:|"<>]/g, '_');

  const handleExportCsv = () => {
    const csvData = generateCsv(targetLeads);
    downloadFile(csvData, `${sanitizedQuery}_leads.csv`, 'text/csv');
  };

  const handleExportVcf = () => {
    const vcfData = generateVcf(targetLeads);
    downloadFile(vcfData, `${sanitizedQuery}_contacts.vcf`, 'text/vcard');
  };

  const handleExportJson = () => {
    const jsonData = JSON.stringify(targetLeads, null, 2);
    downloadFile(jsonData, `${sanitizedQuery}_data.json`, 'application/json');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = async () => {
    const phoneList = extractPhoneNumbersList(targetLeads, '\n');
    try {
      await navigator.clipboard.writeText(phoneList);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2500);
    } catch {
      // Fallback
    }
  };

  const isAllSelected = leads.length > 0 && selectedIds.length === leads.length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 shadow-xl space-y-4">
      {/* Top action bar: Export Buttons & Select All */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left: Selection indicators */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSelectAll}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border border-slate-700/60"
            aria-label={isAllSelected ? 'لغو انتخاب همه' : 'انتخاب همه'}
          >
            {isAllSelected ? (
              <CheckSquare className="w-4 h-4 text-amber-400" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>{isAllSelected ? 'لغو انتخاب' : 'انتخاب همه'}</span>
          </button>

          {selectedIds.length > 0 && (
            <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-lg font-bold">
              {selectedIds.length} مورد انتخاب شده
            </span>
          )}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
              showFilters
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>فیلتر و جستجو</span>
          </button>
        </div>

        {/* Right: Export options */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Excel / CSV */}
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            title="دانلود فایل اکسل با فرمت UTF-8 بدون مشکل فونت فارسی"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>دانلود اکسل (CSV)</span>
          </button>

          {/* VCF Phone Contacts */}
          <button
            onClick={handleExportVcf}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            title="دانلود مستقیم به عنوان مخاطبین تلفن همراه (vCard)"
          >
            <Contact className="w-4 h-4" />
            <span>خروجی مخاطبین (VCF)</span>
          </button>

          {/* Copy Phone numbers */}
          <button
            onClick={onOpenPhoneListModal}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="کپی لیست شماره‌ها جهت ارسال پیامک تبلیغاتی یا بازاریابی"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>لیست شماره‌ها</span>
          </button>

          {/* JSON Export */}
          <button
            onClick={handleExportJson}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="دانلود به صورت JSON ساختاریافته"
          >
            <Code className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>

          {/* Print Report */}
          <button
            onClick={handlePrint}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="پرینت یا ذخیره به عنوان PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>چاپ / PDF</span>
          </button>
        </div>
      </div>

      {/* Filter panel (Collapsible) */}
      {showFilters && (
        <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Quick search input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400" />
            <input
              type="text"
              value={filterState.searchQuery}
              onChange={(e) => setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="جستجو در نام، صنف، خیابان..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Has Phone Filter */}
          <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:bg-slate-950 text-slate-300">
            <input
              type="checkbox"
              checked={filterState.onlyWithPhone}
              onChange={(e) => setFilterState((prev) => ({ ...prev, onlyWithPhone: e.target.checked }))}
              className="rounded accent-amber-500"
            />
            <span>فقط مواردی که شماره دارند</span>
          </label>

          {/* Has Website Filter */}
          <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:bg-slate-950 text-slate-300">
            <input
              type="checkbox"
              checked={filterState.onlyWithWebsite}
              onChange={(e) => setFilterState((prev) => ({ ...prev, onlyWithWebsite: e.target.checked }))}
              className="rounded accent-amber-500"
            />
            <span>فقط مواردی که وب‌سایت دارند</span>
          </label>

          {/* Min Rating select */}
          <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800/80 rounded-xl px-2.5 py-1">
            <span className="text-slate-400 text-xs shrink-0">امتیاز:</span>
            <select
              value={filterState.minRating}
              onChange={(e) => setFilterState((prev) => ({ ...prev, minRating: Number(e.target.value) }))}
              className="bg-transparent text-slate-200 text-xs focus:outline-none w-full cursor-pointer py-1"
            >
              <option value="0" className="bg-slate-900">همه امتیازها</option>
              <option value="4" className="bg-slate-900">حداقل ۴.۰ و بالاتر</option>
              <option value="4.5" className="bg-slate-900">حداقل ۴.۵ و بالاتر</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
