'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Info, AlertCircle } from 'lucide-react';
import { formatLocalCurrency, convertUsdc } from '@/lib/currency/exchangeRates';
import { cn } from '@/lib/utils';
import { DashboardStats } from '@/lib/types/dashboard';

interface LocalCurrencyAmountProps {
  amountUsdc: number;
  currency?: string;
  rate?: number;
  updatedAt?: number;
  size?: 'sm' | 'md' | 'lg';
  showBothCurrencies?: boolean;
}

export default function LocalCurrencyAmount({
  amountUsdc,
  currency,
  rate,
  updatedAt,
  size = 'md',
  showBothCurrencies = true,
}: LocalCurrencyAmountProps) {
  // Try to read dashboard-stats cache for currency and rates if not provided
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    enabled: false, // Read only, don't trigger refetch
  });

  const resolvedCurrency = currency || stats?.exchangeRate?.currency || 'USD';
  const resolvedRate = rate !== undefined ? rate : (stats?.exchangeRate?.currency === resolvedCurrency ? stats?.exchangeRate?.rate : undefined);
  const resolvedUpdatedAt = updatedAt !== undefined ? updatedAt : (stats?.exchangeRate?.currency === resolvedCurrency ? stats?.exchangeRate?.updatedAt : undefined);

  const isRatesFetching = statsLoading && rate === undefined;

  // 1. Loading State (Shimmer skeleton)
  if (isRatesFetching) {
    return (
      <div className="flex flex-col gap-1 animate-pulse">
        {showBothCurrencies && (
          <span className="text-zinc-400 font-medium">
            {amountUsdc.toFixed(2)} USDC
          </span>
        )}
        <div className={cn(
          "bg-zinc-800 rounded-md",
          size === 'sm' && "h-3.5 w-16",
          size === 'md' && "h-4 w-24",
          size === 'lg' && "h-6 w-32"
        )} />
      </div>
    );
  }

  // 2. Error State (No rate available)
  if (resolvedRate === undefined || resolvedRate === null) {
    return (
      <div className="flex items-center gap-1.5 select-none">
        <span className={cn(
          "font-sans font-medium text-[var(--color-text-primary)]",
          size === 'sm' && "text-xs",
          size === 'md' && "text-sm",
          size === 'lg' && "text-lg"
        )}>
          {amountUsdc.toFixed(2)} USDC
        </span>
        <div className="relative group inline-flex items-center">
          <Info className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-300 cursor-pointer" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-zinc-950 text-zinc-200 border border-zinc-800 text-[10px] px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap z-50 leading-none pointer-events-none transition duration-150">
            Local currency rate temporarily unavailable.
          </div>
        </div>
      </div>
    );
  }

  // 3. Active Conversion Calculations
  const localValue = convertUsdc(amountUsdc, resolvedRate);
  const formattedLocal = formatLocalCurrency(localValue, resolvedCurrency);

  // Check if cache is stale (> 20 mins)
  const isStale = resolvedUpdatedAt ? (Date.now() - resolvedUpdatedAt > 20 * 60 * 1000) : false;
  const minutesAgo = resolvedUpdatedAt ? Math.round((Date.now() - resolvedUpdatedAt) / (60 * 1000)) : 0;
  const warningText = `Exchange rate last updated ${minutesAgo} minute${minutesAgo !== 1 ? 's' : ''} ago. Rates are updated every 10 minutes.`;

  // Render both currencies
  if (showBothCurrencies) {
    return (
      <div className="flex flex-col gap-0.5 select-none">
        <span className={cn(
          "font-sans font-medium text-[var(--color-text-primary)] leading-none",
          size === 'sm' && "text-xs",
          size === 'md' && "text-base",
          size === 'lg' && "text-2xl"
        )}>
          {amountUsdc.toFixed(2)} USDC
        </span>
        <div className="flex items-center gap-1.5 text-[var(--color-text-muted)] mt-0.5">
          <span className={cn(
            "font-sans font-normal text-[var(--color-text-muted)]",
            size === 'sm' && "text-[10px]",
            size === 'md' && "text-xs",
            size === 'lg' && "text-sm"
          )}>
            ≈ {formattedLocal}
          </span>
          {isStale && (
            <div className="relative group inline-flex items-center">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 hover:text-amber-400 cursor-pointer shrink-0" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-zinc-950 text-zinc-200 border border-zinc-800 text-[10px] px-2.5 py-1.5 rounded-lg shadow-xl w-60 z-50 text-center leading-normal pointer-events-none transition duration-150">
                {warningText}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render only local currency amount
  return (
    <div className="flex items-center gap-1.5 select-none">
      <span className={cn(
        "font-sans font-medium text-[var(--color-text-primary)]",
        size === 'sm' && "text-xs",
        size === 'md' && "text-sm",
        size === 'lg' && "text-lg"
      )}>
        {formattedLocal}
      </span>
      {isStale && (
        <div className="relative group inline-flex items-center">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500 hover:text-amber-400 cursor-pointer shrink-0" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-zinc-950 text-zinc-200 border border-zinc-800 text-[10px] px-2.5 py-1.5 rounded-lg shadow-xl w-60 z-50 text-center leading-normal pointer-events-none transition duration-150">
            {warningText}
          </div>
        </div>
      )}
    </div>
  );
}
