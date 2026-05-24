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
  className?: string;
}

export function PostCard({ post, publicationSlug, className }: PostCardProps) {
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

  return (
    <Link href={`/${publicationSlug}/${slug}`}>
      <div
        className={cn(
          'group flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/10 backdrop-blur-sm transition-all duration-300 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/5 select-none h-full cursor-pointer',
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
              <div className="absolute w-40 h-40 rounded-full bg-amber-500/5 blur-2xl" />
              <Globe className="w-10 h-10 text-zinc-700/65 group-hover:text-amber-500/25 transition duration-500" />
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
