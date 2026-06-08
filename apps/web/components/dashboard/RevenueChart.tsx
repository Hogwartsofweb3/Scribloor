'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

import { formatLocalCurrency } from '@/lib/currency/exchangeRates';

interface RevenueChartProps {
  data: { date: string; gross: number; net: number }[];
  exchangeRate?: { currency: string; rate: number; updatedAt?: string | number } | null;
}

export default function RevenueChart({ data, exchangeRate }: RevenueChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[280px] w-full flex items-center justify-center bg-[var(--color-bg-secondary)]/10 rounded-lg">
        <div className="flex flex-col items-center gap-2">
          <div className="w-5 h-5 border-2 border-[var(--color-brand-500)]/30 border-t-[var(--color-brand-500)] rounded-full animate-spin" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-text-muted)]">
            Loading Chart...
          </span>
        </div>
      </div>
    );
  }

  // Custom tooltip component — white bg card, border, date + amount USDC + local currency equiv
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const netValue = parseFloat(payload[0].value || 0);
      const formattedUsdc = `${netValue.toFixed(2)} USDC`;

      let localValueStr = null;
      if (exchangeRate && exchangeRate.rate) {
        const localValue = netValue * exchangeRate.rate;
        localValueStr = formatLocalCurrency(localValue, exchangeRate.currency);
      }

      return (
        <div className="p-3 bg-white dark:bg-[#111110] border border-[var(--color-border-strong)] rounded-lg shadow-md text-xs font-sans text-[var(--color-text-primary)]">
          <p className="font-semibold border-b border-[var(--color-border)] pb-1 mb-1.5 text-[var(--color-text-secondary)]">
            {label}
          </p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[var(--color-text-muted)]">Net revenue:</span>
              <span className="font-semibold text-[var(--color-text-primary)]">
                {formattedUsdc}
              </span>
            </div>
            {localValueStr ? (
              <div className="flex items-center justify-between gap-4 text-[10px] text-[var(--color-text-muted)]">
                <span>≈ {exchangeRate?.currency} Equivalent:</span>
                <span className="font-semibold text-[var(--color-text-primary)]">
                  ≈ {localValueStr}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4 text-[10px] text-[var(--color-text-muted)]">
                <span>USD Equivalent:</span>
                <span>
                  ${netValue.toFixed(2)} USD
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            {/* LinearGradient: purple-500 at 30% opacity top, 0% at bottom */}
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          
          {/* CartesianGrid: horizontal only, dashed, very light */}
          <CartesianGrid 
            strokeDasharray="4 4" 
            stroke="rgba(0,0,0,0.06)" 
            className="dark:stroke-white/5" 
            vertical={false} 
          />
          
          {/* XAxis: formatted dates, 6 ticks max, muted 11px */}
          <XAxis
            dataKey="date"
            stroke="var(--color-text-muted)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={8}
            tickCount={6}
          />
          
          {/* YAxis: USDC amounts, 4 ticks, muted 11px */}
          <YAxis
            stroke="var(--color-text-muted)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dx={-8}
            tickCount={4}
            tickFormatter={(v) => `$${v}`}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          {/* Area: stroke purple-500, fill url(#revenueGradient), strokeWidth 2 */}
          <Area
            type="monotone"
            dataKey="net"
            stroke="#8b5cf6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#revenueGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
