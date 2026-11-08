import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, X, Play, AlertTriangle } from 'lucide-react';

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
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [parsedQueries, setParsedQueries] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessText = (text: string, name: string) => {
    setFileContent(text);
    setFileName(name);
    // Split by newlines or commas
    const lines = text
      .split(/[\r\n]+/)
      .map((l) => l.replace(/^["'\s]+|["'\s]+$/g, '').trim())
      .filter((l) => l.length > 2 && !l.startsWith('//') && !l.startsWith('#'));
    
    // Deduplicate
    const unique = Array.from(new Set(lines));
    setParsedQueries(unique);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleProcessText(content, file.name);
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
      const content = event.target?.result as string;
      handleProcessText(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleSelect = (q: string) => {
    onSelectQuery(q);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">آپلود فایل عناوین و مشاغل</h3>
              <p className="text-xs text-slate-400">آپلود فایل متنی (TXT) یا اکسل/سی‌اس‌وی (CSV) برای استخراج دسته‌ای</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm flex-1">
          {/* Dropzone */}
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
                ? 'border-amber-400 bg-amber-500/10'
                : 'border-slate-700 hover:border-amber-500/50 bg-slate-950/30'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".txt,.csv"
              className="hidden"
            />
            <FileText className="w-10 h-10 mx-auto text-amber-400/80 mb-2" />
            <p className="text-slate-200 font-semibold mb-1">
              {fileName ? fileName : 'برای آپلود فایل کلیک کنید یا فایل را اینجا بکشید'}
            </p>
            <p className="text-xs text-slate-500">
              پشتیبانی از فایل‌های متنی با پسوند <span className="text-amber-400">.txt</span> و <span className="text-amber-400">.csv</span> (هر خط یک عنوان صنف و شهر)
            </p>
          </div>

          {/* Example Format */}
          <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 text-xs text-slate-400">
            <span className="text-slate-300 font-semibold block mb-1">نمونه قالب فایل آپلودی:</span>
            <code className="text-amber-300/90 font-mono block leading-relaxed">
              رستوران‌های بصره<br />
              شیرینی‌فروشی‌های قم<br />
              کافه‌های استانبول<br />
              Persian restaurants in Toronto
            </code>
          </div>

          {/* Parsed List */}
          {parsedQueries.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">
                  عناوین شناسایی‌شده در فایل ({parsedQueries.length} مورد):
                </span>
                <span>برای شروع، روی هر کدام کلیک کنید</span>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-slate-950/60 rounded-xl border border-slate-800">
                {parsedQueries.map((q, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelect(q)}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900 hover:bg-amber-500/20 hover:text-amber-200 text-slate-200 cursor-pointer transition-all border border-slate-800/60"
                  >
                    <span className="text-xs font-medium truncate flex-1">{q}</span>
                    <span className="text-[11px] text-amber-400 flex items-center gap-1 shrink-0 font-bold">
                      <Play className="w-3 h-3 fill-amber-400" /> استخراج
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            بستن
          </button>
          {parsedQueries.length > 0 && (
            <button
              onClick={() => handleSelect(parsedQueries[0])}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>استخراج اولین عنوان («{parsedQueries[0]}»)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
