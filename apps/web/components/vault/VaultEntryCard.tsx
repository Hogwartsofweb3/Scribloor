import React from 'react';
import Link from 'next/link';
import { VaultEntry, User } from '@solscribe/db';
import { formatNumber } from '@/lib/utils';
import { Clock, Eye, Lock, Unlock } from 'lucide-react';

interface VaultEntryWithAuthor extends VaultEntry {
  author?: User | null;
}

interface VaultEntryCardProps {
  entry: VaultEntryWithAuthor;
  hasAccess?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  research: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  report: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  analysis: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  guide: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
  data: 'bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20',
  essay: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
};

export function VaultEntryCard({ entry, hasAccess = false }: VaultEntryCardProps) {
  const categoryColor = CATEGORY_COLORS[entry.category] || CATEGORY_COLORS['research'];

  return (
    <Link href={`/vault/${entry.slug}`} className="group block">
      <div className="flex flex-col h-full bg-black/40 border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-colors duration-300">
        
        {/* Cover Image Area */}
        <div className="relative h-48 w-full bg-zinc-900 overflow-hidden">
          {entry.coverImageUrl ? (
            <img 
              src={entry.coverImageUrl} 
              alt={entry.title} 
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900`} />
          )}
          
          <div className="absolute top-4 left-4">
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${categoryColor} uppercase tracking-wider backdrop-blur-md`}>
              {entry.category}
            </span>
          </div>

          <div className="absolute top-4 right-4">
            {hasAccess ? (
              <div className="flex items-center gap-1.5 bg-emerald-500/90 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-md">
                <Unlock className="w-3 h-3" />
                <span>Unlocked</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-black/60 text-white/90 text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10">
                <Lock className="w-3 h-3" />
                <span>{entry.singleAccessPriceUsdc} USDC</span>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-col flex-1 p-5">
          <h3 className="text-xl font-serif font-semibold text-white mb-2 line-clamp-2 group-hover:text-indigo-400 transition-colors">
            {entry.title}
          </h3>
          
          <p className="text-zinc-400 text-sm mb-4 line-clamp-2 flex-1">
            {entry.abstract}
          </p>

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
            <div className="flex items-center gap-2">
              {entry.author?.avatarUrl ? (
                <img src={entry.author.avatarUrl} alt="" className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-zinc-800" />
              )}
              <span className="text-sm font-medium text-zinc-300">
                {entry.author?.displayName || entry.author?.username || 'Unknown'}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-500">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{entry.readTimeMinutes}m</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{formatNumber(entry.accessCount)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
}
