import React from 'react';
import { X, History, Trash2, ArrowLeft, Building2, Calendar } from 'lucide-react';
import { BusinessLead } from '../types/business';

export interface HistoryItem {
  id: string;
  query: string;
  timestamp: number;
  leadsCount: number;
  leads: BusinessLead[];
}

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistory,
  onClearHistory,
  onDeleteHistoryItem,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border-r border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">تاریخچه جستجوها</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-20 text-slate-500 text-xs">
              هنوز جستجویی ذخیره نشده است.
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectHistory(item);
                  onClose();
                }}
                className="group p-4 rounded-2xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">
                    {item.query}
                  </h4>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-amber-400" />
                      {item.leadsCount} کسب‌وکار
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(item.timestamp).toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onDeleteHistoryItem(item.id)}
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800/80 transition-all"
                    title="حذف این مورد"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <span className="text-xs text-slate-400">{history.length} مورد ذخیره شده</span>
            <button
              onClick={onClearHistory}
              className="text-xs px-3 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 font-medium transition-all"
            >
              پاک‌سازی کل تاریخچه
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
