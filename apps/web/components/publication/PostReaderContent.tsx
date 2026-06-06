'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { PaywallGate } from '@/components/shared/PaywallGate';
import { PostCard } from '@/components/shared/PostCard';
import { SubscribeButton } from '@/components/subscribe/SubscribeButton';
import { 
  Twitter, 
  Send, 
  Share2, 
  Check, 
  Link2,
  Lock,
  Globe
} from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface PostReaderContentProps {
  post: {
    id: string;
    title: string;
    subtitle: string | null;
    slug: string;
    coverImageUrl: string | null;
    contentHtml: string;
    previewHtml: string | null;
    isPaywalled: boolean;
    publicationId: string;
  };
  publication: {
    id: string;
    name: string;
    slug: string;
    monthlyPriceUsdc: number | string | null;
    subscriberCount: number;
  };
  author: {
    displayName: string | null;
    username: string;
    avatarUrl: string | null;
    bio: string | null;
  };
  recommendations: any[];
}

export default function PostReaderContent({
  post,
  publication,
  author,
  recommendations,
}: PostReaderContentProps) {
  const { authenticated } = usePrivy();
  
  // Content states
  const [content, setContent] = useState(post.isPaywalled ? (post.previewHtml || '') : post.contentHtml);
  const [hasFullAccess, setHasFullAccess] = useState(!post.isPaywalled);
  const [loading, setLoading] = useState(post.isPaywalled);
  
  // UI states
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  // 1. Fetch full content client-side if the post is paywalled and user is logged in
  useEffect(() => {
    async function checkAccessAndFetchContent() {
      if (!post.isPaywalled) {
        setHasFullAccess(true);
        setLoading(false);
        return;
      }

      if (!authenticated) {
        setHasFullAccess(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`/api/posts/${publication.slug}/${post.slug}`);
        if (res.ok) {
          const data = await res.json();
          setContent(data.contentToShow);
          setHasFullAccess(data.hasFullAccess);
        }
      } catch (err) {
        console.error('Error fetching full post content:', err);
      } finally {
        setLoading(false);
      }
    }

    checkAccessAndFetchContent();
  }, [authenticated, post.isPaywalled, post.slug, publication.slug]);

  // 2. Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      // Progress percentage
      if (docHeight > 0) {
        setScrollProgress((scrollTop / docHeight) * 100);
      }
      
      // Show progress bar only after scrolling 100px
      setShowProgress(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 3. Share Handlers
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`Check out "${post.title}" on Solscribe! 🚀`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleFarcasterShare = () => {
    const text = encodeURIComponent(`Check out "${post.title}" on Solscribe!`);
    window.open(`https://warpcast.com/~/compose?text=${text}&embeds[]=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Check out "${post.title}" on Solscribe! ${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const price = publication.monthlyPriceUsdc ? Number(publication.monthlyPriceUsdc) : 0;
  const authorName = author.displayName || author.username;
  const sanitizedContent = DOMPurify.sanitize(content);

  return (
    <div className="w-full">
      {/* Reading Progress Bar: fixed, top 0, full viewport width, 2px height, purple fill, z-index 50 */}
      {showProgress && (
        <div className="fixed top-0 left-0 w-full h-[2px] bg-zinc-200 dark:bg-zinc-800 z-50">
          <div
            className="h-full bg-[var(--color-brand-500)] transition-all duration-100 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      )}

      {/* Article Body */}
      <section className="relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500 select-none">
            <div className="w-8 h-8 border-2 border-[var(--color-brand-500)]/30 border-t-[var(--color-brand-500)] rounded-full animate-spin mb-4" />
            <span className="text-xs font-mono uppercase tracking-widest text-[var(--color-text-muted)] animate-pulse">
              Unlocking premium text...
            </span>
          </div>
        ) : (
          <div
            className="prose max-w-none text-[var(--color-text-primary)]"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        )}

        {/* Paywall Gate Overlay */}
        {!hasFullAccess && !loading && (
          <div className="mt-8">
            {/* Gradient fade (white/dark over 80px) */}
            <div className="relative -mt-24 h-24 bg-gradient-to-t from-[var(--color-bg-primary)] to-transparent z-10 pointer-events-none" />
            
            <div className="relative z-20 mt-4">
              <PaywallGate
                publicationId={post.publicationId}
                subscriptionPrice={price}
              />
            </div>
          </div>
        )}
      </section>

      {/* Footer Share & Creator Sections */}
      {hasFullAccess && !loading && (
        <div className="mt-12 space-y-8">
          <hr className="border-[var(--color-border)]" />

          {/* Share Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 text-xs select-none">
            <span className="font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Share this post
            </span>
            <div className="flex items-center gap-2">
              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="p-2.5 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-border-strong)] bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition relative"
                title="Copy link"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 text-white text-[10px] rounded shadow-md font-sans">
                      Copied!
                    </span>
                  </>
                ) : (
                  <Link2 className="w-4 h-4" />
                )}
              </button>

              {/* Twitter */}
              <button
                onClick={handleTwitterShare}
                className="p-2.5 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-border-strong)] bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-sky-500 transition"
                title="Share on Twitter"
              >
                <Twitter className="w-4 h-4 fill-current" />
              </button>

              {/* Farcaster */}
              <button
                onClick={handleFarcasterShare}
                className="p-2.5 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-border-strong)] bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-violet-500 transition"
                title="Share on Farcaster"
              >
                <Send className="w-4 h-4" />
              </button>

              {/* WhatsApp */}
              <button
                onClick={handleWhatsAppShare}
                className="p-2.5 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-border-strong)] bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-emerald-500 transition"
                title="Share on WhatsApp"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <hr className="border-[var(--color-border)]" />

          {/* Author Card: large */}
          <div className="p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/30 flex flex-col md:flex-row gap-5 items-start">
            {author.avatarUrl ? (
              <div className="relative w-14 h-14 rounded-full overflow-hidden border border-[var(--color-border-strong)] shrink-0">
                <Image
                  src={author.avatarUrl}
                  alt={authorName}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-[var(--color-brand-50)] dark:bg-zinc-900 border border-[var(--color-border)] flex items-center justify-center font-bold text-[var(--color-brand-500)] text-lg shrink-0 select-none">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex-1 space-y-3">
              <div>
                <h4 className="text-lg font-bold text-[var(--color-text-primary)]">
                  {authorName}
                </h4>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Author of {publication.name}
                </p>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {author.bio || `Support ${authorName} by subscribing to their Solscribe publication archives.`}
              </p>
              <div className="pt-2 max-w-xs">
                <SubscribeButton
                  publication={{
                    id: publication.id,
                    name: publication.name,
                    monthlyPriceUsdc: publication.monthlyPriceUsdc,
                    slug: publication.slug,
                  }}
                  variant="full"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations roster */}
      {recommendations.length > 0 && (
        <section className="mt-16 pt-12 border-t border-[var(--color-border)] select-none">
          <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest font-mono border-b border-[var(--color-border)] pb-2 mb-6">
            📚 More from {publication.name}
          </h3>

          {/* Mobile: horizontal scroll, Desktop: grid */}
          <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto pb-4 md:pb-0 scrollbar-thin scrollbar-none">
            {recommendations.map((rec) => (
              <div key={rec.id} className="min-w-[280px] md:min-w-0 flex-shrink-0">
                <PostCard
                  post={rec}
                  publicationSlug={publication.slug}
                  variant="grid"
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
