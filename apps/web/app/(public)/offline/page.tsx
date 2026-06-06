'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { WifiOff, RefreshCw, BookOpen, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  const [cachedPosts, setCachedPosts] = useState<{ title: string; url: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCachedPosts() {
      if (typeof window === 'undefined' || !('caches' in window)) {
        setLoading(false);
        return;
      }

      try {
        const postList: { title: string; url: string }[] = [];
        const cacheNames = await caches.keys();
        
        for (const name of cacheNames) {
          const cache = await caches.open(name);
          const requests = await cache.keys();
          
          for (const req of requests) {
            const url = new URL(req.url);
            const path = url.pathname;
            const parts = path.split('/').filter(Boolean);
            
            // Matches /[pubSlug]/[postSlug] (exactly 2 parts in path)
            if (parts.length === 2) {
              const [pub, post] = parts;
              const excluded = [
                'explore',
                'vault',
                'dashboard',
                'api',
                'login',
                'onboarding',
                'account',
                'privacy',
                'terms',
              ];

              if (!excluded.includes(pub) && !excluded.includes(post)) {
                if (!postList.some((p) => p.url === path)) {
                  // Format slug into clean title
                  const formattedTitle = post
                    .split('-')
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ');
                  postList.push({
                    title: formattedTitle,
                    url: path,
                  });
                }
              }
            }
          }
        }
        setCachedPosts(postList);
      } catch (err) {
        console.error('[Offline fallbacks] Error reading caches:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCachedPosts();
  }, []);

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center select-none max-w-md mx-auto">
      {/* Solscribe Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg font-bold text-white text-lg font-serif">
          S
        </div>
        <span className="font-serif font-semibold text-lg text-zinc-200 tracking-tight">
          Solscribe
        </span>
      </div>

      {/* Offline Status */}
      <div className="p-4 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-4 animate-pulse">
        <WifiOff className="w-8 h-8" />
      </div>

      <h1 className="text-2xl font-bold text-zinc-100 font-sans">
        You're offline
      </h1>
      <p className="text-xs text-zinc-400 mt-2 leading-relaxed mb-8">
        Check your internet connection and try reloading the page to access live releases.
      </p>

      {/* Cached Posts Roster */}
      <div className="w-full text-left bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 mb-6">
        <h3 className="text-xs font-bold text-zinc-500 font-mono uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          Recently read posts
        </h3>

        {loading ? (
          <div className="py-6 text-center text-xs text-zinc-650 font-mono">
            Scanning offline caches...
          </div>
        ) : cachedPosts.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-600 italic leading-relaxed">
            No cached posts found in your browser cache yet.
          </div>
        ) : (
          <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
            {cachedPosts.map((post) => (
              <Link key={post.url} href={post.url}>
                <div className="p-2.5 rounded-lg border border-zinc-850 bg-zinc-950/20 hover:border-zinc-800 hover:bg-zinc-900/10 transition text-xs font-semibold text-zinc-300 truncate block">
                  {post.title}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-2.5 w-full">
        <Button
          onClick={handleReload}
          className="w-full font-bold bg-violet-500 hover:bg-violet-600 text-white h-11 rounded-xl shadow-lg flex items-center justify-center gap-1.5"
        >
          <RefreshCw className="w-4 h-4" /> Try again
        </Button>
        <Link href="/explore" className="w-full">
          <Button
            variant="outline"
            className="w-full font-bold border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 h-11 rounded-xl flex items-center justify-center gap-1.5"
          >
            <Compass className="w-4 h-4" /> Go to Explore
          </Button>
        </Link>
      </div>
    </div>
  );
}
