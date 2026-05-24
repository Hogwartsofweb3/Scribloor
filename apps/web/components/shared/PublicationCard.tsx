"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, CreditCard, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PublicationData {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  coverImageUrl?: string | null;
  monthlyPriceUsdc?: number | string | null;
  subscriberCount?: number;
  freeTierEnabled?: boolean;
  accentColor?: string | null;
}

interface PublicationCardProps {
  publication: PublicationData;
  showSubscribeButton?: boolean;
  onSubscribeClick?: () => void;
  className?: string;
}

export function PublicationCard({
  publication,
  showSubscribeButton = false,
  onSubscribeClick,
  className,
}: PublicationCardProps) {
  const {
    name,
    description,
    coverImageUrl,
    monthlyPriceUsdc,
    subscriberCount = 0,
    accentColor = 'amber',
  } = publication;

  // Map color presets to specific Tailwind CSS styling classes
  const colorMap: Record<string, {
    border: string;
    text: string;
    bg: string;
    button: string;
    gradient: string;
  }> = {
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      text: 'text-amber-500',
      bg: 'bg-amber-500/10',
      button: 'bg-amber-500 hover:bg-amber-400 text-black',
      gradient: 'from-amber-600/30 to-amber-950/20',
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      text: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      button: 'bg-emerald-500 hover:bg-emerald-400 text-black',
      gradient: 'from-emerald-600/30 to-emerald-950/20',
    },
    indigo: {
      border: 'border-indigo-500/20 hover:border-indigo-500/40',
      text: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
      button: 'bg-indigo-500 hover:bg-indigo-400 text-white',
      gradient: 'from-indigo-600/30 to-indigo-950/20',
    },
    rose: {
      border: 'border-rose-500/20 hover:border-rose-500/40',
      text: 'text-rose-500',
      bg: 'bg-rose-500/10',
      button: 'bg-rose-500 hover:bg-rose-400 text-white',
      gradient: 'from-rose-600/30 to-rose-950/20',
    },
    violet: {
      border: 'border-violet-500/20 hover:border-violet-500/40',
      text: 'text-violet-500',
      bg: 'bg-violet-500/10',
      button: 'bg-violet-500 hover:bg-violet-400 text-white',
      gradient: 'from-violet-600/30 to-violet-950/20',
    },
    sky: {
      border: 'border-sky-500/20 hover:border-sky-500/40',
      text: 'text-sky-500',
      bg: 'bg-sky-500/10',
      button: 'bg-sky-500 hover:bg-sky-400 text-black',
      gradient: 'from-sky-600/30 to-sky-950/20',
    },
  };

  const theme = colorMap[accentColor || 'amber'] || colorMap.amber;
  const price = monthlyPriceUsdc ? Number(monthlyPriceUsdc) : 0;

  return (
    <div
      className={cn(
        'group flex flex-col justify-between overflow-hidden rounded-2xl border bg-zinc-900/30 backdrop-blur-sm transition-all duration-300 shadow-xl',
        theme.border,
        className
      )}
    >
      <div>
        {/* Cover Image Canvas */}
        {coverImageUrl ? (
          <div className="relative h-40 w-full overflow-hidden border-b border-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImageUrl}
              alt={`${name} cover`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />
          </div>
        ) : (
          <div
            className={cn(
              'relative h-40 w-full bg-gradient-to-br border-b border-zinc-800 flex items-center justify-center overflow-hidden',
              theme.gradient
            )}
          >
            {/* Ambient visual sparkle design elements */}
            <div className="absolute w-56 h-56 rounded-full bg-zinc-950/40 -top-24 -left-24 blur-2xl" />
            <div className="absolute w-56 h-56 rounded-full bg-zinc-950/40 -bottom-24 -right-24 blur-2xl" />
            <Sparkles className={cn('w-12 h-12 opacity-35', theme.text)} />
          </div>
        )}

        {/* Publication details body */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-xl font-bold text-zinc-100 tracking-tight leading-tight group-hover:text-white transition-colors">
              {name}
            </h3>
            {/* Price Badge */}
            <span
              className={cn(
                'px-3 py-0.5 text-xs font-bold rounded-full border tracking-wide uppercase',
                price > 0
                  ? 'text-amber-500 border-amber-500/20 bg-amber-500/5'
                  : 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5'
              )}
            >
              {price > 0 ? `$${price} USDC` : 'Free'}
            </span>
          </div>

          <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed mb-6">
            {description || 'No description provided.'}
          </p>
        </div>
      </div>

      {/* Stats and buttons footer */}
      <div className="px-6 pb-6 pt-2 border-t border-zinc-800/40 bg-zinc-900/10">
        <div className="flex items-center justify-between text-xs text-zinc-500 font-mono mb-4">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-semibold text-zinc-300">{subscriberCount}</span> subscribers
          </span>
          <span className="flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
            Monthly terms
          </span>
        </div>

        {showSubscribeButton && (
          <Button
            onClick={onSubscribeClick}
            className={cn('w-full font-bold shadow-lg shadow-black/20', theme.button)}
          >
            {price > 0 ? 'Subscribe Now' : 'Join for Free'}
          </Button>
        )}
      </div>
    </div>
  );
}
