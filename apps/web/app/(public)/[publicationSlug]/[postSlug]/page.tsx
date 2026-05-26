"use client";

import React, { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { PaywallGate } from '@/components/shared/PaywallGate';
import { PostCard } from '@/components/shared/PostCard';
import {
  Calendar,
  Clock,
  Share2,
  Twitter,
  Link2,
  Check,
  Eye,
  Globe,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import DOMPurify from 'isomorphic-dompurify';

export default function EditorialReaderPage() {
  const params = useParams();
  const publicationSlug = params?.publicationSlug as string;
  const postSlug = params?.postSlug as string;

  const { authenticated } = usePrivy();

  // Content states
  const [post, setPost] = useState<any>(null);
  const [pub, setPub] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchPostContent = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/posts/${publicationSlug}/${postSlug}`);
      if (!res.ok) {
        if (res.status === 404) {
          notFound();
        }
        throw new Error('Failed to load post content');
      }
      const data = await res.json();
      setPost(data);

      // Load associated publication
      const pubRes = await fetch(`/api/publications/${publicationSlug}`);
      if (pubRes.ok) {
        const pubData = await pubRes.json();
        setPub(pubData.publication);

        // Fetch up to 3 more posts from this publication for recommendation
        const moreRes = await fetch(`/api/posts`);
        if (moreRes.ok) {
          const moreData = await moreRes.json();
          // Filter to this pub and exclude current post
          const recs = (moreData.posts || [])
            .filter((p: any) => p.slug !== postSlug)
            .slice(0, 3);
          setRecommendations(recs);
        }
      }
    } catch (err) {
      console.error('Error fetching dynamic post content:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (publicationSlug && postSlug) {
      fetchPostContent();
    }
  }, [publicationSlug, postSlug, authenticated]);

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTwitterShare = () => {
    if (typeof window === 'undefined' || !post) return;
    const shareText = encodeURIComponent(`Check out "${post.title}" on Solscribe! 🚀`);
    const shareUrl = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`, '_blank');
  };

  const calculateReadTime = (html: string) => {
    const text = html?.replace(/<[^>]*>/g, '') || '';
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 225));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-6 text-zinc-500 select-none">
        <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4" />
        <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
          Unlocking Article...
        </span>
      </div>
    );
  }

  if (!post) {
    return notFound();
  }

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Draft';

  return (
    <article className="flex flex-col min-h-screen">
      {/* Article Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.subtitle || "",
            "image": post.coverImageUrl ? [post.coverImageUrl] : [],
            "datePublished": post.publishedAt,
            "author": [{
              "@type": "Person",
              "name": pub?.name || "Solscribe Author"
            }]
          })
        }}
      />

      {/* Hero Header */}
      <div className="max-w-4xl mx-auto px-4 pt-12 pb-6 w-full select-none">
        {/* Back Link */}
        <Link href={`/${publicationSlug}`} className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition mb-6">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to {pub?.name || 'publication'}
        </Link>

        {/* Cover Photo */}
        {post.coverImageUrl && (
          <div className="relative rounded-2xl border border-zinc-800 overflow-hidden mb-8 max-h-[400px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full object-cover max-h-[400px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
          </div>
        )}

        <div className="max-w-[680px] mx-auto flex flex-col gap-4">
          <h1 className="text-3xl sm:text-5xl font-black font-serif text-zinc-100 leading-[1.1] tracking-tight">
            {post.title}
          </h1>

          {post.subtitle && (
            <p className="text-base sm:text-lg text-zinc-400 font-medium leading-relaxed">
              {post.subtitle}
            </p>
          )}

          {/* Author Byline & Social Metadata */}
          <div className="flex items-center justify-between gap-4 py-4 border-y border-zinc-900 mt-2 text-xs text-zinc-500 font-mono">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                {formattedDate}
              </span>
              <span className="text-zinc-800">•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-600" />
                {calculateReadTime(post.contentToShow)} min read
              </span>
            </div>

            {/* Sharing Bar */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTwitterShare}
                className="p-2 rounded-lg border border-zinc-850 hover:border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:text-sky-400 transition"
                title="Share on Twitter"
              >
                <Twitter className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-2 rounded-lg border border-zinc-850 hover:border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:text-amber-500 transition relative"
                title="Copy Link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Link2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Editorial Canvas (Max-width 680px Centered) */}
      <div className="max-w-[680px] mx-auto px-4 py-4 w-full flex flex-col gap-6">
        {/* Render HTML content safely inside styled prose Serif typography */}
        <div
          className="prose prose-invert prose-serif prose-amber max-w-none text-zinc-200 leading-relaxed font-serif text-[17px]"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.contentToShow) }}
        />

        {/* Interactive Paywall Gate Overlay */}
        {!post.hasFullAccess && post.subscriptionRequired && (
          <PaywallGate
            publicationId={post.publicationId}
            subscriptionPrice={post.subscriptionPrice || 0}
          />
        )}
      </div>

      {/* Recommendation Roster Footer */}
      {recommendations.length > 0 && (
        <section className="border-t border-zinc-900 bg-zinc-950/20 py-16 mt-16 select-none">
          <div className="max-w-4xl mx-auto px-4 flex flex-col gap-8 w-full">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono border-b border-zinc-900 pb-2">
              📚 More from {pub?.name || 'this publication'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {recommendations.map((rec) => (
                <PostCard
                  key={rec.id}
                  post={{
                    id: rec.id,
                    title: rec.title,
                    subtitle: rec.subtitle,
                    slug: rec.slug,
                    coverImageUrl: rec.coverImageUrl,
                    contentHtml: rec.contentHtml || '',
                    isPaywalled: rec.isPaywalled,
                    publishedAt: rec.publishedAt,
                    viewCount: rec.viewCount,
                  }}
                  publicationSlug={publicationSlug}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
