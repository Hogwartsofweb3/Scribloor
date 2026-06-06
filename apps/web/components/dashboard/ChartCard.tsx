import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export default function ChartCard({
  title,
  subtitle,
  actions,
  children,
}: ChartCardProps) {
  return (
    <div className="bg-white dark:bg-[#111110] border border-[var(--color-border)] rounded-[10px] p-5 shadow-sm flex flex-col gap-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-1.5 shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Chart Canvas Area */}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
