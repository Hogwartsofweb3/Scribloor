import React from 'react';
import { notFound } from 'next/navigation';
import { db, publications, posts, users, eq, and, desc } from '@solscribe/db';
import { PostCard } from '@/components/shared/PostCard';
import { PaywallGate } from '@/components/shared/PaywallGate';
import { Calendar, Users, ShieldCheck, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

export const revalidate = 60;

interface PublicationPageProps {
  params: {
    publicationSlug: string;
  };
}

// Generate static build paths for all active publications
export async function generateStaticParams() {
  try {
    const activePubs = await db.query.publications.findMany({
      where: (pubs, { eq }) => eq(pubs.isPublished, true),
    });
    return activePubs.map((pub) => ({
      publicationSlug: pub.slug,
    }));
  } catch (err) {
    console.error('Error generating static parameters for publications:', err);
    return [];
  }
}

// Compile SEO and OG meta-tags dynamically
export async function generateMetadata({ params }: PublicationPageProps) {
  const pub = await db.query.publications.findFirst({
    where: (pubs, { eq }) => eq(pubs.slug, params.publicationSlug),
  });

  if (!pub) {
    return {
      title: 'Publication Not Found | Solscribe',
    };
  }

  return {
    title: `${pub.name} | Solscribe`,
    description: pub.description || `Subscribe to ${pub.name} on Solscribe.`,
    openGraph: {
      title: pub.name,
      description: pub.description || `Subscribe to ${pub.name} on Solscribe.`,
      images: pub.coverImageUrl ? [{ url: pub.coverImageUrl }] : [],
    },
  };
}

export default async function PublicPublicationPage({ params }: PublicationPageProps) {
  const { publicationSlug } = params;

  // 1. Resolve target publication by slug
  const pub = await db.query.publications.findFirst({
    where: (pubs, { eq }) => eq(pubs.slug, publicationSlug),
  });

  if (!pub || !pub.isPublished) {
    notFound();
  }

  // 2. Fetch the publication owner creator details
  const owner = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, pub.ownerId),
  });

  // 3. Fetch all published posts inside this publication archives
  const pubPosts = await db.query.posts.findMany({
    where: (posts, { eq, and }) => and(
      eq(posts.publicationId, pub.id),
      eq(posts.status, 'published')
    ),
    orderBy: (posts, { desc }) => [desc(posts.publishedAt)],
  });

  const price = pub.monthlyPriceUsdc ? Number(pub.monthlyPriceUsdc) : 0;

  // Color PRESENTS map
  const colorMap: Record<string, {
    border: string;
    text: string;
    bg: string;
    button: string;
    gradient: string;
  }> = {
    amber: {
      border: 'border-amber-500/20',
      text: 'text-amber-500',
      bg: 'bg-amber-500/10',
      button: 'bg-amber-500 hover:bg-amber-400 text-black',
      gradient: 'from-amber-600/30 to-amber-950/20',
    },
    emerald: {
      border: 'border-emerald-500/20',
      text: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      button: 'bg-emerald-500 hover:bg-emerald-400 text-black',
      gradient: 'from-emerald-600/30 to-emerald-950/20',
    },
    indigo: {
      border: 'border-indigo-500/20',
      text: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
      button: 'bg-indigo-500 hover:bg-indigo-400 text-white',
      gradient: 'from-indigo-600/30 to-indigo-950/20',
    },
    rose: {
      border: 'border-rose-500/20',
      text: 'text-rose-500',
      bg: 'bg-rose-500/10',
      button: 'bg-rose-500 hover:bg-rose-400 text-white',
      gradient: 'from-rose-600/30 to-rose-950/20',
    },
    violet: {
      border: 'border-violet-500/20',
      text: 'text-violet-500',
      bg: 'bg-violet-500/10',
      button: 'bg-violet-500 hover:bg-violet-400 text-white',
      gradient: 'from-violet-600/30 to-violet-950/20',
    },
    sky: {
      border: 'border-sky-500/20',
      text: 'text-sky-500',
      bg: 'bg-sky-500/10',
      button: 'bg-sky-500 hover:bg-sky-400 text-black',
      gradient: 'from-sky-600/30 to-sky-950/20',
    },
  };

  const theme = colorMap.amber;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Dynamic Cover Hero Banner */}
      {pub.coverImageUrl ? (
        <div className="relative h-64 md:h-80 w-full overflow-hidden border-b border-zinc-900 select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pub.coverImageUrl}
            alt={pub.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
      ) : (
        <div className={cn('h-40 w-full bg-gradient-to-br border-b border-zinc-900', theme.gradient)} />
      )}

      {/* Main Container Layout */}
      <div className="max-w-6xl mx-auto px-4 py-8 flex-grow w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Publication Details & Posts feed (span 8) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Creator Branding */}
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl sm:text-5xl font-black font-serif text-zinc-100 leading-tight">
                {pub.name}
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl">
                {pub.description || 'Welcome to my Solscribe publication archive.'}
              </p>

              {/* Creator Card */}
              {owner && (
                <div className="flex items-center gap-3.5 p-4 rounded-2xl border border-zinc-800/60 bg-zinc-950/40 select-none max-w-md mt-2">
                  {owner.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={owner.avatarUrl}
                      alt={owner.displayName || owner.username}
                      className="w-12 h-12 rounded-full object-cover border border-zinc-800"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-zinc-500 text-sm">
                      {owner.displayName?.charAt(0) || owner.username.charAt(0)}
                    </div>
                  )}
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-xs font-bold text-zinc-200 truncate">
                      Written by {owner.displayName || 'Anonymous Author'}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono truncate leading-normal max-w-[280px]" title={owner.walletAddress || ''}>
                      🔑 {owner.walletAddress ? `${owner.walletAddress.substring(0, 6)}...${owner.walletAddress.substring(owner.walletAddress.length - 4)}` : 'On-chain authenticated'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Articles Archive Feed */}
            <div className="flex flex-col gap-6 pt-4">
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono border-b border-zinc-900 pb-2">
                📁 Archive Feed ({pubPosts.length})
              </h2>

              {pubPosts.length === 0 ? (
                <div className="p-12 border border-zinc-800 rounded-2xl bg-zinc-900/5 text-center select-none">
                  <span className="text-3xl block mb-2">✍️</span>
                  <h3 className="text-base font-bold text-zinc-300 mb-1">No articles published yet</h3>
                  <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
                    This author hasn't written any newsletters yet. Subscribe below to receive new releases instantly!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {pubPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={{
                        id: post.id,
                        title: post.title,
                        subtitle: post.subtitle,
                        slug: post.slug,
                        coverImageUrl: post.coverImageUrl,
                        contentHtml: post.contentHtml,
                        isPaywalled: post.isPaywalled,
                        publishedAt: post.publishedAt,
                        viewCount: post.viewCount,
                      }}
                      publicationSlug={pub.slug}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Subscription Card (span 4) */}
          <div className="lg:col-span-4 lg:sticky lg:top-8 select-none">
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/10 backdrop-blur-sm shadow-xl flex flex-col gap-6">
              <div>
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono mb-2">
                  🔒 Subscription Access
                </h3>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-zinc-100 font-sans tracking-tight">
                    {price > 0 ? `$${price} USDC` : 'Free Tier'}
                  </span>
                  {price > 0 && <span className="text-xs text-zinc-500">/ month</span>}
                </div>
              </div>

              {/* Dynamic subscription gate checkout */}
              {price > 0 ? (
                <PaywallGate
                  publicationId={pub.id}
                  subscriptionPrice={price}
                />
              ) : (
                <div className="flex flex-col gap-3 p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-center text-xs">
                  <span className="font-bold text-emerald-400">🔓 Free Access Enabled</span>
                  <span className="text-zinc-500 leading-normal">
                    This publication is fully free. Subscribe and read all posts without paywalls.
                  </span>
                </div>
              )}

              {/* Quick stats list */}
              <div className="flex flex-col gap-3.5 pt-4 border-t border-zinc-800/40 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> Subscribers
                  </span>
                  <span className="font-semibold text-zinc-300 font-mono">
                    {pub.subscriberCount} active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> Newsletter
                  </span>
                  <span className="font-semibold text-emerald-500 uppercase tracking-wider text-[10px] font-bold">
                    🚀 Enabled
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Settlements
                  </span>
                  <span className="font-semibold text-zinc-300">
                    Instant Self-Custodial
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
