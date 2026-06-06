"use client";

import React from 'react';
import Link from 'next/link';
import { Eye, Clock, Lock, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PostCardData {
  id: string;
  title: string;
  subtitle?: string | null;
  slug: string;
  coverImageUrl?: string | null;
  contentHtml: string;
  isPaywalled: boolean;
  publishedAt: string | Date | null;
  viewCount: number;
}

interface PostCardProps {
  post: PostCardData;
  publicationSlug: string;
  publicationName?: string;
  variant?: 'grid' | 'full' | 'default' | 'compact' | 'featured';
  className?: string;
}

export function PostCard({ post, publicationSlug, publicationName, variant = 'default', className }: PostCardProps) {
  const {
    title,
    subtitle,
    slug,
    coverImageUrl,
    contentHtml,
    isPaywalled,
    publishedAt,
    viewCount = 0,
  } = post;

  const calculateReadTime = (html: string) => {
    const text = html?.replace(/<[^>]*>/g, '') || '';
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 225));
  };

  const readTime = calculateReadTime(contentHtml);

  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Draft';

  // COMPACT VARIANT: Horizontal layout (used in trending sidebars, list views)
  if (variant === 'compact') {
    return (
      <Link href={`/${publicationSlug}/${slug}`} className={cn("group flex gap-4 py-3 border-b border-zinc-800/40 select-none items-center cursor-pointer", className)}>
        {/* Cover Thumbnail left (60px) */}
        {coverImageUrl ? (
          <div className="relative w-[60px] h-[60px] shrink-0 overflow-hidden rounded-lg border border-zinc-800/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="relative w-[60px] h-[60px] shrink-0 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/60 rounded-lg flex items-center justify-center overflow-hidden">
            <Globe className="w-5 h-5 text-zinc-700/65 group-hover:text-amber-500/25 transition duration-500" />
          </div>
        )}

        {/* Content right */}
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          {publicationName && (
            <span className="text-[11px] font-semibold text-zinc-500 tracking-wide uppercase truncate">
              {publicationName}
            </span>
          )}
          <h4 className="text-sm font-medium text-zinc-200 group-hover:text-white transition duration-300 line-clamp-2 leading-tight">
            {title}
          </h4>
          <span className="text-[11px] text-zinc-500">
            {formattedDate}
          </span>
        </div>
      </Link>
    );
  }

  // FEATURED VARIANT: Full-width card with cover image top 240px (used in Explore featured section)
  if (variant === 'featured') {
    return (
      <Link href={`/${publicationSlug}/${slug}`} className={cn("group block overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/10 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-500/5 select-none cursor-pointer", className)}>
        {/* Cover Image 240px */}
        {coverImageUrl ? (
          <div className="relative h-60 w-full overflow-hidden border-b border-zinc-800/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
          </div>
        ) : (
          <div className="relative h-60 w-full bg-gradient-to-br from-zinc-900 to-zinc-950 border-b border-zinc-800/60 flex items-center justify-center overflow-hidden">
            <div className="absolute w-60 h-60 rounded-full bg-purple-500/5 blur-3xl" />
            <Globe className="w-12 h-12 text-zinc-700/65 group-hover:text-purple-500/25 transition duration-500" />
          </div>
        )}

        {/* Content */}
        <div className="p-6 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-mono text-zinc-500 font-semibold uppercase tracking-wider">
              {formattedDate}
            </span>
            <span
              className={cn(
                'px-2 py-0.5 text-[10px] font-bold rounded-full border tracking-wide uppercase flex items-center gap-1 select-none',
                isPaywalled
                  ? 'text-amber-500 border-amber-500/20 bg-amber-500/5'
                  : 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5'
              )}
            >
              {isPaywalled ? (
                <>
                  <Lock className="w-2.5 h-2.5" /> Subscriber
                </>
              ) : (
                'Free'
              )}
            </span>
          </div>

          <h3 className="text-2xl font-bold font-sans text-zinc-100 group-hover:text-white transition duration-300 leading-snug">
            {title}
          </h3>

          {subtitle && (
            <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3">
              {subtitle}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs font-mono text-zinc-500 pt-2 border-t border-zinc-800/40 mt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-zinc-600" />
              {readTime} min read
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4 text-zinc-600" />
              {viewCount} views
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // FULL VARIANT: Legacy full display format
  if (variant === 'full') {
    return (
      <div className={cn('w-full py-6 select-none', className)}>
        <Link href={`/${publicationSlug}/${slug}`} className="group block space-y-4">
          {/* Cover Image */}
          {coverImageUrl ? (
            <div className="relative w-full aspect-[16/9] max-h-[200px] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImageUrl}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
          ) : (
            <div className="relative w-full aspect-[16/9] max-h-[200px] bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center overflow-hidden">
              <Globe className="w-8 h-8 text-zinc-500 opacity-40 group-hover:text-violet-500 transition duration-500" />
            </div>
          )}

          {/* Tag row */}
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <span>{formattedDate}</span>
            <span>•</span>
            <span>{readTime} min read</span>
            <span>•</span>
            <span
              className={cn(
                'px-2 py-0.5 text-[10px] font-bold rounded-full border tracking-wide uppercase flex items-center gap-1 select-none',
                isPaywalled
                  ? 'text-amber-600 border-amber-500/20 bg-amber-500/5'
                  : 'text-emerald-600 border-emerald-500/20 bg-emerald-500/5'
              )}
            >
              {isPaywalled ? (
                <>
                  <Lock className="w-2.5 h-2.5 text-amber-500" /> Paid
                </>
              ) : (
                'Free'
              )}
            </span>
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold font-sans text-zinc-100 group-hover:text-violet-400 group-hover:underline decoration-violet-500 transition duration-300">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[15px] text-zinc-400 leading-relaxed line-clamp-2">
                {subtitle}
              </p>
            )}
          </div>
        </Link>
        <hr className="border-zinc-800 mt-6" />
      </div>
    );
  }

  // DEFAULT / GRID VARIANT: default 3-column style
  return (
    <Link href={`/${publicationSlug}/${slug}`}>
      <div
        className={cn(
          'group flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/10 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/40 hover:shadow-2xl hover:shadow-violet-500/5 select-none h-full cursor-pointer',
          className
        )}
      >
        <div>
          {/* Cover Thumbnail */}
          {coverImageUrl ? (
            <div className="relative h-44 w-full overflow-hidden border-b border-zinc-800/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImageUrl}
                alt={title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
            </div>
          ) : (
            <div className="relative h-44 w-full bg-gradient-to-br from-zinc-900 to-zinc-950 border-b border-zinc-800/60 flex items-center justify-center overflow-hidden">
              <div className="absolute w-40 h-40 rounded-full bg-violet-500/5 blur-2xl" />
              <Globe className="w-10 h-10 text-zinc-700/65 group-hover:text-violet-500/25 transition duration-500" />
            </div>
          )}

          {/* Body content */}
          <div className="p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[9px] font-mono text-zinc-500 font-semibold uppercase tracking-wider">
                {formattedDate}
              </span>
              <span
                className={cn(
                  'px-2 py-0.5 text-[9px] font-bold rounded-full border tracking-wide uppercase flex items-center gap-1 select-none',
                  isPaywalled
                    ? 'text-amber-500 border-amber-500/20 bg-amber-500/5'
                    : 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5'
                )}
              >
                {isPaywalled ? (
                  <>
                    <Lock className="w-2.5 h-2.5" /> Subscriber
                  </>
                ) : (
                  'Free'
                )}
              </span>
            </div>

            <h3 className="text-lg font-bold text-zinc-100 font-serif leading-snug tracking-tight group-hover:text-white transition duration-300 line-clamp-2">
              {title}
            </h3>

            {subtitle && (
              <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Footer Metrics */}
        <div className="px-5 pb-5 pt-3 border-t border-zinc-800/40 bg-zinc-900/5 flex items-center justify-between text-[10px] font-mono text-zinc-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-zinc-600" />
            {readTime} min read
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-zinc-600" />
            {viewCount} views
          </span>
        </div>
      </div>
    </Link>
  );
}
