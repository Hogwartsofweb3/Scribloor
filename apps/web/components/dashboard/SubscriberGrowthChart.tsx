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

interface SubscriberGrowthChartProps {
  data: { date: string; count: number }[];
}

export default function SubscriberGrowthChart({ data }: SubscriberGrowthChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[280px] w-full flex items-center justify-center bg-[var(--color-bg-secondary)]/10 rounded-lg">
        <div className="flex flex-col items-center gap-2">
          <div className="w-5 h-5 border-2 border-[var(--color-teal-500)]/30 border-t-[var(--color-teal-500)] rounded-full animate-spin" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-text-muted)]">
            Loading Chart...
          </span>
        </div>
      </div>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const count = parseInt(payload[0].value || 0);
      return (
        <div className="p-3 bg-white dark:bg-[#111110] border border-[var(--color-border-strong)] rounded-lg shadow-md text-xs font-sans text-[var(--color-text-primary)]">
          <p className="font-semibold border-b border-[var(--color-border)] pb-1 mb-1.5 text-[var(--color-text-secondary)]">
            {label}
          </p>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[var(--color-text-muted)]">Active Subscribers:</span>
            <span className="font-bold text-[var(--color-teal-500)]">
              {count}
            </span>
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
          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
        >
          <defs>
            {/* LinearGradient: teal-500 at 30% opacity top, 0% at bottom */}
            <linearGradient id="subscriberGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
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
          
          {/* YAxis: subscriber count, 4 ticks, muted 11px */}
          <YAxis
            stroke="var(--color-text-muted)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dx={-8}
            tickCount={4}
            tickFormatter={(v) => Math.round(v).toString()}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          {/* Area: stroke teal-500, fill url(#subscriberGradient), strokeWidth 2 */}
          <Area
            type="monotone"
            dataKey="count"
            stroke="#14b8a6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#subscriberGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
