/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { SearchHero } from './components/SearchHero';
import { StatsBar } from './components/StatsBar';
import { ExportToolbar } from './components/ExportToolbar';
import { BusinessCards } from './components/BusinessCards';
import { BusinessTable } from './components/BusinessTable';
import { InteractiveMap } from './components/InteractiveMap';
import { BusinessDetailsModal } from './components/BusinessDetailsModal';
import { PhoneListModal } from './components/PhoneListModal';
import { HistoryDrawer, HistoryItem } from './components/HistoryDrawer';
import { BusinessLead, FilterState, SearchExtractionResponse } from './types/business';
import { AlertCircle, RefreshCw, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'map_extractor_history_v1';

export default function App() {
  const [leads, setLeads] = useState<BusinessLead[]>([]);
  const [currentQuery, setCurrentQuery] = useState<string>('شیرینی‌فروشی‌های قم');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'cards' | 'table' | 'map'>('cards');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTimeMs, setSearchTimeMs] = useState<number | undefined>(undefined);
  const [engineUsed, setEngineUsed] = useState<string | undefined>(undefined);

  // Modals & Drawers
  const [activeDetailsLead, setActiveDetailsLead] = useState<BusinessLead | null>(null);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Filter State
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    onlyWithPhone: false,
    onlyWithWebsite: false,
    onlyWithInstagram: false,
    minRating: 0,
    cityFilter: '',
    categoryFilter: '',
    sortBy: 'default',
  });

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, []);

  // Save history helper
  const saveToHistory = (queryText: string, newLeads: BusinessLead[]) => {
    try {
      const newItem: HistoryItem = {
        id: `hist-${Date.now()}`,
        query: queryText,
        timestamp: Date.now(),
        leadsCount: newLeads.length,
        leads: newLeads,
      };
      setHistory((prev) => {
        const filtered = prev.filter((h) => h.query.toLowerCase() !== queryText.toLowerCase());
        const updated = [newItem, ...filtered].slice(0, 30);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch {
      // Ignore
    }
  };

  // Main search & extract execution
  const executeSearch = async (
    queryText: string,
    mode: 'maps_grounding' | 'hybrid' = 'maps_grounding',
    count = 25,
    isAppend = false
  ) => {
    setIsLoading(true);
    setError(null);
    setCurrentQuery(queryText);
    if (!isAppend) setSelectedIds([]);

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          mode,
          count,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || 'خطا در ارتباط با سرور.');
      }

      const data: SearchExtractionResponse = await res.json();
      if (isAppend) {
        setLeads((prev) => {
          const existingNames = new Set(prev.map((l) => l.name.toLowerCase()));
          const newUnique = (data.leads || []).filter((l) => !existingNames.has(l.name.toLowerCase()));
          return [...prev, ...newUnique];
        });
      } else {
        setLeads(data.leads || []);
      }
      setSearchTimeMs(data.searchTimeMs);
      setEngineUsed(data.engineUsed);

      if (data.leads && data.leads.length > 0) {
        saveToHistory(queryText, data.leads);
      }
    } catch (err: any) {
      console.warn('Search notice:', err?.message || err);
      setError(err?.message || 'خطا در بارگذاری اطلاعات، لطفاً مجدداً تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically execute default query on mount if not loaded
  useEffect(() => {
    executeSearch('شیرینی‌فروشی‌های قم', 'maps_grounding');
  }, []);

  // Selection Handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLeads.map((l) => l.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Filtered and sorted leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Text search
      if (filterState.searchQuery.trim()) {
        const q = filterState.searchQuery.toLowerCase();
        const matchName = lead.name.toLowerCase().includes(q);
        const matchCategory = lead.category?.toLowerCase().includes(q);
        const matchAddress = lead.address.toLowerCase().includes(q);
        const matchPhone = lead.phone.includes(q);
        if (!matchName && !matchCategory && !matchAddress && !matchPhone) {
          return false;
        }
      }

      // Has Phone
      if (filterState.onlyWithPhone && !lead.phone) {
        return false;
      }

      // Has Website
      if (filterState.onlyWithWebsite && !lead.website) {
        return false;
      }

      // Has Instagram
      if (filterState.onlyWithInstagram && !lead.instagram) {
        return false;
      }

      // Min Rating
      if (filterState.minRating > 0 && (!lead.rating || lead.rating < filterState.minRating)) {
        return false;
      }

      return true;
    });
  }, [leads, filterState]);

  // History handlers
  const handleSelectHistory = (item: HistoryItem) => {
    setCurrentQuery(item.query);
    setLeads(item.leads);
    setSelectedIds([]);
    setError(null);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((h) => h.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Header */}
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        activeView={activeView}
        setActiveView={setActiveView}
        hasResults={leads.length > 0}
      />

      <main className="flex-1">
        {/* Search Hero Form */}
        <SearchHero
          onSearch={(q, mode, count) => executeSearch(q, mode, count || 25, false)}
          isLoading={isLoading}
          currentQuery={currentQuery}
        />

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                <span className="text-sm">{error}</span>
              </div>
              <button
                onClick={() => executeSearch(currentQuery)}
                className="px-3 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>تلاش مجدد</span>
              </button>
            </div>
          )}

          {/* Stats Summary Bar */}
          <StatsBar
            leads={leads}
            searchTimeMs={searchTimeMs}
            engineUsed={engineUsed}
          />

          {/* Export & Action Toolbar */}
          {leads.length > 0 && (
            <ExportToolbar
              leads={filteredLeads}
              selectedIds={selectedIds}
              onToggleSelectAll={handleToggleSelectAll}
              onClearSelection={handleClearSelection}
              filterState={filterState}
              setFilterState={setFilterState}
              onOpenPhoneListModal={() => setIsPhoneModalOpen(true)}
              queryTitle={currentQuery}
            />
          )}

          {/* Loading Indicator or Views */}
          {isLoading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-4 bg-slate-900/30 rounded-3xl border border-slate-800/80 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
                <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">در حال استخراج هوشمند اطلاعات از گوگل مپ و وب...</h3>
                <p className="text-xs text-slate-400">
                  جستجوی مکان‌ها، شماره‌های تماس، آدرس‌ها و وب‌سایت‌های مرتبط با «{currentQuery}»
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Views: Cards / Table / Map */}
              {activeView === 'cards' && (
                <BusinessCards
                  leads={filteredLeads}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                  onOpenDetails={(lead) => setActiveDetailsLead(lead)}
                />
              )}

              {activeView === 'table' && (
                <BusinessTable
                  leads={filteredLeads}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                  onOpenDetails={(lead) => setActiveDetailsLead(lead)}
                />
              )}

              {activeView === 'map' && (
                <InteractiveMap
                  leads={filteredLeads}
                  onOpenDetails={(lead) => setActiveDetailsLead(lead)}
                />
              )}

              {/* Load More Button */}
              {leads.length > 0 && (
                <div className="text-center pt-6 pb-2">
                  <button
                    onClick={() => executeSearch(currentQuery, 'maps_grounding', 35, true)}
                    disabled={isLoading}
                    className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-slate-700/80 hover:border-amber-500/50 text-xs sm:text-sm font-bold transition-all shadow-lg shadow-black/40 inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>استخراج و بارگذاری ۱۰ مورد دیگر از گوگل مپ (افزایش نتایج)</span>
                  </button>
                  <p className="text-[11px] text-slate-500 mt-2">
                    در حال حاضر {leads.length} کسب‌وکار در لیست قرار دارد
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/50 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            سامانه هوشمند استخراج اطلاعات کسب‌وکار و گوگل مپ — پشتیبانی کامل از ایران و سراسر جهان
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>خروجی استاندارد UTF-8 اکسل</span>
            <span>•</span>
            <span>فرمت مخاطبین VCF</span>
            <span>•</span>
            <span>گوگل مپ و وب</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <BusinessDetailsModal
        lead={activeDetailsLead}
        onClose={() => setActiveDetailsLead(null)}
      />

      <PhoneListModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        leads={selectedIds.length > 0 ? leads.filter((l) => selectedIds.includes(l.id)) : filteredLeads}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistory={handleSelectHistory}
        onClearHistory={handleClearHistory}
        onDeleteHistoryItem={handleDeleteHistoryItem}
      />
    </div>
  );
}
