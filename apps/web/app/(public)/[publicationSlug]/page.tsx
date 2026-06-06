import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { db, publications, posts, users, eq, and, desc } from '@solscribe/db';
import { getServerUserFromCookies } from '@/lib/auth/privy';
import PublicationPostsList from '@/components/publication/PublicationPostsList';
import SubscriptionCard from '@/components/publication/SubscriptionCard';
import MigrationTrigger from '@/components/publication/MigrationTrigger';

export const revalidate = 60;

interface PublicationPageProps {
  params: {
    publicationSlug: string;
  };
}

// Generate static build paths for active publications
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

// Compile SEO and OpenGraph metadata dynamically
export async function generateMetadata({ params }: PublicationPageProps) {
  const pub = await db.query.publications.findFirst({
    where: eq(publications.slug, params.publicationSlug),
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

  // 1. Resolve publication by slug
  const pub = await db.query.publications.findFirst({
    where: eq(publications.slug, publicationSlug),
  });

  if (!pub || !pub.isPublished) {
    notFound();
  }

  // 2. Fetch the creator details
  const creator = await db.query.users.findFirst({
    where: eq(users.id, pub.ownerId),
  });

  if (!creator) {
    notFound();
  }

  // 3. Fetch all published posts inside this publication
  const dbPosts = await db.query.posts.findMany({
    where: and(
      eq(posts.publicationId, pub.id),
      eq(posts.status, 'published')
    ),
    orderBy: [desc(posts.publishedAt)],
  });

  // 4. Check if current viewer is the creator
  const dbUser = await getServerUserFromCookies();
  const isCreator = dbUser ? dbUser.id === pub.ownerId : false;

  // Format posts for the client list component
  const formattedPosts = dbPosts.map((p) => ({
    id: p.id,
    title: p.title,
    subtitle: p.subtitle,
    slug: p.slug,
    coverImageUrl: p.coverImageUrl,
    contentHtml: p.contentHtml || '',
    isPaywalled: p.isPaywalled,
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    viewCount: p.viewCount,
  }));

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg-primary)]">
      <MigrationTrigger
        publicationId={pub.id}
        publicationName={pub.name}
        publicationPrice={Number(pub.monthlyPriceUsdc || 0)}
        creatorName={creator.displayName || creator.username}
      />
      {/* Hero Section */}
      <section className="relative w-full h-[320px] select-none overflow-hidden">
        {pub.coverImageUrl ? (
          <div className="relative w-full h-full">
            <Image
              src={pub.coverImageUrl}
              alt={pub.name}
              fill
              priority
              unoptimized
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-violet-600 to-violet-900" />
        )}
        
        {/* Overlay gradient: linear from transparent to rgba(0,0,0,0.5) at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* Title & Description Overlay */}
        <div className="absolute bottom-6 left-6 right-6 max-w-6xl mx-auto px-4 md:px-8">
          <div className="max-w-3xl">
            <h1 className="text-white font-serif font-semibold text-3xl md:text-[40px] leading-tight drop-shadow-md">
              {pub.name}
            </h1>
            {pub.description && (
              <p className="text-white/95 text-[16px] leading-relaxed mt-2 line-clamp-2 drop-shadow-sm font-sans">
                {pub.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Two-column Layout */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-10 w-full flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT COLUMN (65% width / span 8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Creator info row */}
            <div className="flex items-center gap-3 select-none flex-wrap">
              {creator.avatarUrl ? (
                <div className="relative w-[40px] h-[40px] rounded-full overflow-hidden border border-[var(--color-border-strong)]">
                  <Image
                    src={creator.avatarUrl}
                    alt={creator.displayName || creator.username}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-[40px] h-[40px] rounded-full bg-[var(--color-brand-50)] dark:bg-zinc-900 border border-[var(--color-border)] flex items-center justify-center font-bold text-[var(--color-brand-500)] text-sm">
                  {(creator.displayName || creator.username).charAt(0).toUpperCase()}
                </div>
              )}
              
              <div className="flex items-center gap-1.5 text-sm">
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {creator.displayName || creator.username}
                </span>
                <span className="text-[var(--color-text-muted)]">by</span>
                <span className="text-[var(--color-text-secondary)] font-medium">
                  Solscribe
                </span>
              </div>

              {/* Subscriber count badge */}
              <span className="px-2.5 py-0.5 rounded-full border border-[var(--color-brand-500)]/20 bg-[var(--color-brand-50)] dark:bg-violet-950/20 text-[10px] font-bold text-[var(--color-brand-500)] dark:text-violet-400 uppercase tracking-wider">
                {pub.subscriberCount} subscriber{pub.subscriberCount !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Description (full, not truncated) */}
            <p className="text-[15px] font-sans text-[var(--color-text-secondary)] leading-relaxed mb-6">
              {pub.description || 'Welcome to this Solscribe publication page.'}
            </p>

            {/* Client-side Posts List Filter and Pagination */}
            <PublicationPostsList
              posts={formattedPosts}
              publicationSlug={pub.slug}
              isCreator={isCreator}
            />
          </div>

          {/* RIGHT COLUMN (35% width / span 4) */}
          <div className="lg:col-span-4 lg:sticky lg:top-[80px]">
            <SubscriptionCard
              publication={{
                id: pub.id,
                name: pub.name,
                slug: pub.slug,
                monthlyPriceUsdc: pub.monthlyPriceUsdc,
                subscriberCount: pub.subscriberCount,
              }}
              creator={{
                displayName: creator.displayName,
                username: creator.username,
                bio: creator.bio,
              }}
            />
          </div>

        </div>
      </main>
    </div>
  );
}
