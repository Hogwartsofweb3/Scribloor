"use client";

import React from 'react';
import {
  UserPlus,
  DollarSign,
  BookOpen,
  AlertCircle,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActivityItem {
  id: string;
  type: 'new_subscriber' | 'new_transaction' | 'post_published' | 'subscription_expired';
  title: string;
  description: string;
  date: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  
  const formatTimeAgo = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    if (diffMs < 0) return 'Just now';
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'new_subscriber':
        return <UserPlus className="w-4 h-4 text-emerald-400" />;
      case 'new_transaction':
        return <DollarSign className="w-4 h-4 text-amber-500" />;
      case 'post_published':
        return <BookOpen className="w-4 h-4 text-sky-400" />;
      case 'subscription_expired':
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      default:
        return <Activity className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getIconBg = (type: ActivityItem['type']) => {
    switch (type) {
      case 'new_subscriber':
        return 'bg-emerald-500/10 border-emerald-500/10';
      case 'new_transaction':
        return 'bg-amber-500/10 border-amber-500/10';
      case 'post_published':
        return 'bg-sky-500/10 border-sky-500/10';
      case 'subscription_expired':
        return 'bg-rose-500/10 border-rose-500/10';
      default:
        return 'bg-zinc-800/60 border-zinc-700/30';
    }
  };

  return (
    <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/10 backdrop-blur-sm shadow-xl flex flex-col gap-5 h-full">
      <div>
        <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-500" /> Recent Activity Feed
        </h3>
        <p className="text-[10px] text-zinc-500">
          Real-time transaction and registration logs for your publication
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center py-12 text-zinc-600 font-mono text-[10px] uppercase tracking-wider gap-2">
          <span>💤 No recent logs recorded</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5 overflow-y-auto max-h-[300px] pr-1">
          {activities.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800/40 bg-zinc-950/30 hover:bg-zinc-950/50 hover:border-zinc-800 transition duration-300"
            >
              {/* Event Icon */}
              <div className={cn('p-2 rounded-lg border shrink-0', getIconBg(item.type))}>
                {getIcon(item.type)}
              </div>

              {/* Event Description */}
              <div className="flex-grow flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[11px] font-bold text-zinc-200 truncate">
                    {item.title}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500 shrink-0">
                    {formatTimeAgo(item.date)}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed truncate">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
