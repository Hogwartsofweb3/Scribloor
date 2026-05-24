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
      <div className="h-[350px] w-full rounded-2xl border border-zinc-800 bg-zinc-950/20 backdrop-blur-sm flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            Mapping Subscriber Growth...
          </span>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/95 shadow-2xl backdrop-blur-md select-none font-mono text-xs flex flex-col gap-1.5">
          <p className="font-bold text-zinc-400 border-b border-zinc-900 pb-1.5 mb-1">
            🗓️ {label}
          </p>
          <div className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-amber-500">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Subscribers:
            </span>
            <span className="font-bold text-zinc-100">
              {payload[0].value} Active
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/10 backdrop-blur-sm shadow-xl flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-bold text-zinc-200">Subscriber Growth (Last 60 Days)</h3>
        <p className="text-[10px] text-zinc-500">
          Cumulative active newsletter subscribers over time
        </p>
      </div>

      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorSubscribers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
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
              tickFormatter={(value) => Math.round(value).toString()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              name="Active Subscribers"
              dataKey="count"
              stroke="#f59e0b"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSubscribers)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
