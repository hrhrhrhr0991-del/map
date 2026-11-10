import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, X, Play, Edit3, Sparkles } from 'lucide-react';

interface BatchUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuery: (query: string) => void;
}

export const BatchUploadModal: React.FC<BatchUploadModalProps> = ({
  isOpen,
  onClose,
  onSelectQuery,
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file');
  const [rawText, setRawText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [parsedQueries, setParsedQueries] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const sanitizeAndExtractLines = (text: string, sourceName = '') => {
    if (sourceName) setFileName(sourceName);

    // Split by newlines, semicolons, or commas if on separate lines
    const rawLines = text.split(/[\r\n]+/);
    const cleaned = rawLines
      .map((line) => {
        return line
          // Remove numbering like "1.", "1-", "۱-", "۱.", "- ", "• "
          .replace(/^[0-9۰-۹]+[\.\-\)\s]+/, '')
          .replace(/^[\-\*\•\>\s]+/, '')
          .replace(/^["']+|["']+$/g, '')
          .trim();
      })
      .filter((line) => line.length >= 2 && !line.startsWith('//') && !line.startsWith('#'));

    const deduplicated = Array.from(new Set(cleaned));
    setParsedQueries(deduplicated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || '';
      setRawText(content);
      sanitizeAndExtractLines(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || '';
      setRawText(content);
      sanitizeAndExtractLines(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleManualTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRawText(val);
    sanitizeAndExtractLines(val, 'ورودی دستی');
  };

  const handleExecute = (q: string) => {
    onSelectQuery(q);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">آپلود و ورود دسته‌ای عناوین مشاغل</h3>
              <p className="text-xs text-slate-400">آپلود فایل یا چسباندن متن لیست شهرها و صنف‌ها برای استخراج</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-4 pt-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`px-3 py-2 rounded-t-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'file'
                ? 'bg-slate-900 text-amber-400 border-t border-x border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>آپلود فایل (TXT / CSV)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`px-3 py-2 rounded-t-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'text'
                ? 'bg-slate-900 text-amber-400 border-t border-x border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>چسباندن متن مستقیم (Paste)</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm flex-1">
          {activeTab === 'file' ? (
            /* Dropzone */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-amber-400 bg-amber-500/15'
                  : 'border-slate-700 hover:border-amber-500/60 bg-slate-950/40'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".txt,.csv"
                className="hidden"
              />
              <FileText className="w-10 h-10 mx-auto text-amber-400 mb-2" />
              <p className="text-slate-200 font-semibold mb-1 text-sm sm:text-base">
                {fileName ? `فایل انتخاب‌شده: ${fileName}` : 'برای انتخاب فایل کلیک کنید یا فایل را اینجا رها کنید'}
              </p>
              <p className="text-xs text-slate-500">
                پشتیبانی از انواع فایل‌های متنی <span className="text-amber-400">TXT</span> و <span className="text-amber-400">CSV</span>
              </p>
            </div>
          ) : (
            /* Direct Text Area */
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-medium block">
                لیست عناوین را در کادر زیر بنویسید یا کپی و پیست کنید (هر خط یک عنوان):
              </label>
              <textarea
                value={rawText}
                onChange={handleManualTextChange}
                placeholder={`رستوران‌های بصره\nشیرینی‌فروشی‌های قم\nکافه‌های استانبول\nPersian restaurants in Toronto`}
                rows={5}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 text-slate-200 placeholder:text-slate-600 text-xs sm:text-sm font-mono focus:border-amber-400 outline-none leading-relaxed"
              />
            </div>
          )}

          {/* Parsed List Feedback */}
          {parsedQueries.length > 0 ? (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  تعداد {parsedQueries.length} عنوان شناسایی و آماده استخراج شد:
                </span>
                <span className="text-slate-400 text-[11px]">کلیک کنید تا فوراً استخراج شود</span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-slate-950/80 rounded-xl border border-slate-800">
                {parsedQueries.map((q, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleExecute(q)}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 hover:bg-amber-500/20 text-slate-200 hover:text-amber-200 cursor-pointer transition-all border border-slate-800 hover:border-amber-500/40 group"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-5 h-5 rounded-full bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-[11px] font-bold flex items-center justify-center text-slate-400 shrink-0 transition-colors">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold truncate">{q}</span>
                    </div>
                    <span className="text-xs text-amber-400 flex items-center gap-1 font-bold shrink-0">
                      <Play className="w-3.5 h-3.5 fill-amber-400" /> استخراج
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                می‌توانید لیستی از شهرها یا اصناف مورد نظر خود را در یک فایل متنی یا اکسل ذخیره کرده و اینجا آپلود کنید تا اطلاعات تماس تمام آنها به‌صورت دسته‌بندی‌شده استخراج گردد.
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {parsedQueries.length > 0 ? `${parsedQueries.length} مورد آماده` : 'در انتظار انتخاب یا ورود عناوین'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              انصراف
            </button>
            {parsedQueries.length > 0 && (
              <button
                onClick={() => handleExecute(parsedQueries[0])}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>شروع استخراج («{parsedQueries[0]}»)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
