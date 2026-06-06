import React from 'react';
import { cn } from '@/lib/utils';

interface StatChipProps {
  label: string;
  value: string | number;
  className?: string;
}

export default function StatChip({ label, value, className }: StatChipProps) {
  return (
    <div
      className={cn(
        'px-4 py-3 rounded-lg border border-[var(--color-border)] bg-white dark:bg-[#111110] flex flex-col justify-center min-w-[120px] shadow-sm',
        className
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] select-none">
        {label}
      </span>
      <span className="text-lg font-bold text-[var(--color-text-primary)] mt-0.5 font-mono">
        {value}
      </span>
    </div>
  );
}
