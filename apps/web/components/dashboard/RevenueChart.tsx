"use client";

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface RevenueChartProps {
  data: { date: string; gross: number; net: number }[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[350px] w-full rounded-2xl border border-zinc-800 bg-zinc-950/20 backdrop-blur-sm flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            Plotting Revenue Curves...
          </span>
        </div>
      </div>
    );
  }

  // Custom tooltips matching luxury dark theme
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/95 shadow-2xl backdrop-blur-md select-none font-mono text-xs flex flex-col gap-2">
          <p className="font-bold text-zinc-400 border-b border-zinc-900 pb-1.5 mb-1">
            🗓️ {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-bold text-zinc-100">
                ${parseFloat(entry.value).toFixed(2)} USDC
              </span>
            </div>
          ))}
        </div>
      );
    };
    return null;
  };

  return (
    <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/10 backdrop-blur-sm shadow-xl flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-bold text-zinc-200">Revenue Stream (Last 60 Days)</h3>
        <p className="text-[10px] text-zinc-500">
          Comparing gross USDC subscriptions with net creator payouts (after 4% platform fee)
        </p>
      </div>

      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#52525b"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#52525b"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              dx={-5}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              iconSize={6}
              wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1px' }}
            />
            <Area
              type="monotone"
              name="Gross Revenue"
              dataKey="gross"
              stroke="#f59e0b"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorGross)"
            />
            <Area
              type="monotone"
              name="Net Payout"
              dataKey="net"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorNet)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
