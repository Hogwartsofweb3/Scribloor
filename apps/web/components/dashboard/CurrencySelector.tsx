'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Search, ChevronDown } from 'lucide-react';
import { getSupportedCurrencies } from '@/lib/currency/exchangeRates';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { DashboardStats } from '@/lib/types/dashboard';

export default function CurrencySelector() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Retrieve stats to extract current preferred currency
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    enabled: true,
  });

  const currencies = useMemo(() => getSupportedCurrencies(), []);
  const currentCurrency = stats?.exchangeRate?.currency || 'USD';

  const selectedCurrencyObj = useMemo(() => {
    return currencies.find(c => c.code === currentCurrency) || currencies[currencies.length - 1]; // Fallback to USD
  }, [currencies, currentCurrency]);

  // Handle outside clicks to close the dropdown
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Reset search query when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Filter currencies by search query
  const filteredCurrencies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return currencies;
    return currencies.filter(
      c =>
        c.code.toLowerCase().includes(query) ||
        c.name.toLowerCase().includes(query) ||
        c.country.toLowerCase().includes(query)
    );
  }, [currencies, searchQuery]);

  const handleSelectCurrency = async (code: string) => {
    if (code === currentCurrency) {
      setIsOpen(false);
      return;
    }

    try {
      const response = await fetch('/api/account/currency', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: code }),
      });

      if (!response.ok) {
        throw new Error('Failed to update currency settings');
      }

      toast.success(`Currency switched to ${code}`);
      
      // Invalidate stats cache to refresh all amounts instantly
      await queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    } catch (err) {
      console.error(err);
      toast.error('Failed to change currency. Please try again.');
    } finally {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative select-none" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-white dark:bg-[#111110] hover:bg-black/5 dark:hover:bg-white/5 transition-all text-xs font-semibold text-[var(--color-text-primary)] shadow-sm"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-sm leading-none">{selectedCurrencyObj.flag}</span>
        <span>{selectedCurrencyObj.code}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-[var(--color-text-secondary)] transition-transform", isOpen && "rotate-180")} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#111110] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-2xl z-[100] py-1.5 flex flex-col max-h-[380px] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Search Bar */}
          <div className="px-3 pb-2 pt-1 border-b border-[var(--color-border)] relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 -mt-0.5 w-3.5 h-3.5 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search country or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-primary)] focus:bg-[var(--color-bg-primary)] text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-500)] transition-all"
              autoFocus
            />
          </div>

          {/* List Options */}
          <div className="flex-1 overflow-y-auto scrollbar-thin py-1" role="listbox">
            {filteredCurrencies.length === 0 ? (
              <div className="px-4 py-3 text-center text-xs text-[var(--color-text-muted)] font-mono">
                No matching currencies
              </div>
            ) : (
              filteredCurrencies.map((c) => (
                <button
                  key={c.code}
                  onClick={() => handleSelectCurrency(c.code)}
                  role="option"
                  aria-selected={c.code === currentCurrency}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors",
                    c.code === currentCurrency && "bg-[var(--color-brand-50)]/50 dark:bg-[var(--color-brand-500)]/5 text-[var(--color-brand-500)] font-semibold"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base leading-none shrink-0">{c.flag}</span>
                    <div className="flex flex-col min-w-0 leading-tight">
                      <span className="text-xs text-[var(--color-text-primary)] font-bold">{c.code}</span>
                      <span className="text-[10px] text-[var(--color-text-muted)] truncate">{c.name}</span>
                    </div>
                  </div>
                  {c.code === currentCurrency && (
                    <Check className="w-3.5 h-3.5 text-[var(--color-brand-500)] shrink-0 ml-2" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
