import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: string | number | null;
  deltaLabel?: string;
  icon: React.ReactNode;
  valueColor?: 'teal' | string;
}

export default function MetricCard({
  label,
  value,
  delta,
  deltaLabel = 'vs last month',
  icon,
  valueColor,
}: MetricCardProps) {
  // Determine if delta is positive or negative
  let isPositive = true;
  let hasDelta = delta !== undefined && delta !== null;
  
  if (hasDelta) {
    const deltaStr = String(delta);
    if (deltaStr.startsWith('-')) {
      isPositive = false;
    } else if (typeof delta === 'number' && delta < 0) {
      isPositive = false;
    }
  }

  return (
    <div className="p-5 bg-white dark:bg-[#111110] border border-[var(--color-border)] rounded-[10px] shadow-sm flex items-start justify-between gap-4 select-none hover:border-[var(--color-border-strong)] transition duration-300">
      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-[12px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] truncate">
          {label}
        </span>
        <span
          className={cn(
            'text-[28px] font-sans font-medium tracking-tight leading-none my-1',
            valueColor === 'teal' 
              ? 'text-[var(--color-teal-600)] dark:text-[var(--color-teal-400)]' 
              : 'text-[var(--color-text-primary)]'
          )}
        >
          {value}
        </span>
        
        {hasDelta && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={cn(
                'text-[11px] font-semibold flex items-center gap-0.5',
                isPositive 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-rose-600 dark:text-rose-400'
              )}
            >
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {delta}
            </span>
            <span className="text-[11px] text-[var(--color-text-muted)]">
              {deltaLabel}
            </span>
          </div>
        )}
      </div>

      <div className="w-9 h-9 rounded-full bg-[var(--color-brand-50)] dark:bg-violet-950/40 text-[var(--color-brand-500)] dark:text-violet-400 flex items-center justify-center shrink-0">
        {icon}
      </div>
    </div>
  );
}
