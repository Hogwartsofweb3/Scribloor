import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { db, publications, posts, users, eq, and, desc, ne } from '@solscribe/db';
import PostReaderContent from '@/components/publication/PostReaderContent';

export const revalidate = 60;

interface PostPageProps {
  params: {
    publicationSlug: string;
    postSlug: string;
  };
}

// Generate static build paths for all published posts
export async function generateStaticParams() {
  try {
    const publishedPosts = await db
      .select({
        postSlug: posts.slug,
        publicationSlug: publications.slug,
      })
      .from(posts)
      .innerJoin(publications, eq(posts.publicationId, publications.id))
      .where(eq(posts.status, 'published'));

    return publishedPosts.map((p) => ({
      publicationSlug: p.publicationSlug,
      postSlug: p.postSlug,
    }));
  } catch (err) {
    console.error('Error generating static parameters for posts:', err);
    return [];
  }
}

// Generate metadata dynamically for SEO
export async function generateMetadata({ params }: PostPageProps) {
  const { publicationSlug, postSlug } = params;

  const pub = await db.query.publications.findFirst({
    where: eq(publications.slug, publicationSlug),
  });

  if (!pub) return { title: 'Publication Not Found | Solscribe' };

  const post = await db.query.posts.findFirst({
    where: and(
      eq(posts.slug, postSlug),
      eq(posts.publicationId, pub.id),
      eq(posts.status, 'published')
    ),
  });

  if (!post) return { title: 'Post Not Found | Solscribe' };

  return {
    title: `${post.title} | ${pub.name}`,
    description: post.subtitle || `Read ${post.title} on ${pub.name}.`,
    openGraph: {
      title: post.title,
      description: post.subtitle || `Read ${post.title} on ${pub.name}.`,
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : [],
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
    },
  };
}

export default async function PublicPostPage({ params }: PostPageProps) {
  const { publicationSlug, postSlug } = params;

  // 1. Fetch publication
  const pub = await db.query.publications.findFirst({
    where: eq(publications.slug, publicationSlug),
  });

  if (!pub || !pub.isPublished) {
    notFound();
  }

  // 2. Fetch post
  const post = await db.query.posts.findFirst({
    where: and(
      eq(posts.slug, postSlug),
      eq(posts.publicationId, pub.id),
      eq(posts.status, 'published')
    ),
  });

  if (!post) {
    notFound();
  }

  // 3. Fetch author
  const author = await db.query.users.findFirst({
    where: eq(users.id, pub.ownerId),
  });

  if (!author) {
    notFound();
  }

  // 4. Fetch up to 3 recommendations (other published posts from same publication)
  const dbRecommendations = await db.query.posts.findMany({
    where: and(
      eq(posts.publicationId, pub.id),
      eq(posts.status, 'published'),
      ne(posts.id, post.id)
    ),
    orderBy: [desc(posts.publishedAt)],
    limit: 3,
  });

  // Calculate read time
  const wordCount = (post.contentHtml || '').replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 225));

  const formattedDate = post.publishedAt
    ? post.publishedAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Draft';

  // Format recommendations for PostCard
  const formattedRecs = dbRecommendations.map((rec) => ({
    id: rec.id,
    title: rec.title,
    subtitle: rec.subtitle,
    slug: rec.slug,
    coverImageUrl: rec.coverImageUrl,
    contentHtml: rec.contentHtml || '',
    isPaywalled: rec.isPaywalled,
    publishedAt: rec.publishedAt ? rec.publishedAt.toISOString() : null,
    viewCount: rec.viewCount,
  }));

  // Schema.org Article JSON-LD
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    description: post.subtitle || '',
    image: post.coverImageUrl ? [post.coverImageUrl] : [],
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.publishedAt?.toISOString(),
    author: [
      {
        '@type': 'Person',
        name: author.displayName || author.username,
      },
    ],
    publisher: {
      '@type': 'Organization',
      name: pub.name,
      logo: {
        '@type': 'ImageObject',
        url: pub.coverImageUrl || '',
      },
    },
  };

  const truncatedTitle = post.title.length > 25 ? `${post.title.substring(0, 25)}...` : post.title;

  return (
    <article className="min-h-screen bg-[var(--color-bg-primary)] py-8 font-sans">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Reading container: max-width 680px, margin 0 auto */}
      <div className="max-w-[680px] mx-auto px-5 md:px-10">
        
        {/* Top bar (above the article): breadcrumb style */}
        <nav className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] font-mono select-none mb-6">
          <Link href={`/${pub.slug}`} className="hover:text-[var(--color-text-primary)] transition-colors">
            {pub.name}
          </Link>
          <span>/</span>
          <span className="text-[var(--color-text-secondary)] truncate" title={post.title}>
            {truncatedTitle}
          </span>
        </nav>

        {/* Cover image (full reading width, max 420px height) */}
        {post.coverImageUrl && (
          <div className="relative w-full h-[240px] md:h-[360px] max-h-[420px] rounded-[10px] overflow-hidden border border-[var(--color-border)] mb-8 select-none">
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              priority
              unoptimized
              className="object-cover"
            />
          </div>
        )}

        {/* Article header */}
        <header className="mb-8 select-none">
          <span className="text-[12px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">
            {pub.name}
          </span>
          
          <h1 className="font-serif font-semibold text-3xl md:text-[42px] leading-[1.25] text-[var(--color-text-primary)] mt-3">
            {post.title}
          </h1>

          {post.subtitle && (
            <p className="text-lg md:text-[20px] text-[var(--color-text-secondary)] leading-[1.5] mt-2 font-normal">
              {post.subtitle}
            </p>
          )}

          {/* Author row */}
          <div className="flex items-center gap-3 mt-6 border-t border-b border-[var(--color-border)] py-4 flex-wrap">
            {author.avatarUrl ? (
              <div className="relative w-[36px] h-[36px] rounded-full overflow-hidden border border-[var(--color-border-strong)] shrink-0">
                <Image
                  src={author.avatarUrl}
                  alt={author.displayName || author.username}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-[36px] h-[36px] rounded-full bg-[var(--color-brand-50)] dark:bg-zinc-900 border border-[var(--color-border)] flex items-center justify-center font-bold text-[var(--color-brand-500)] text-xs shrink-0">
                {(author.displayName || author.username).charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex items-center gap-1.5 text-[14px] text-[var(--color-text-secondary)]">
              <span className="font-medium text-[var(--color-text-primary)]">
                {author.displayName || author.username}
              </span>
              <span>in</span>
              <Link
                href={`/${pub.slug}`}
                className="text-[var(--color-brand-500)] font-semibold hover:underline"
              >
                {pub.name}
              </Link>
              <span className="text-[var(--color-text-muted)]">•</span>
              <span className="text-[var(--color-text-muted)] font-mono">{formattedDate}</span>
              <span className="text-[var(--color-text-muted)]">•</span>
              <span className="text-[var(--color-text-muted)] font-mono">{readTime} min read</span>
            </div>
          </div>
        </header>

        {/* Dynamic client content reader */}
        <PostReaderContent
          post={{
            id: post.id,
            title: post.title,
            subtitle: post.subtitle,
            slug: post.slug,
            coverImageUrl: post.coverImageUrl,
            contentHtml: post.contentHtml || '',
            previewHtml: post.previewHtml,
            isPaywalled: post.isPaywalled,
            publicationId: post.publicationId,
          }}
          publication={{
            id: pub.id,
            name: pub.name,
            slug: pub.slug,
            monthlyPriceUsdc: pub.monthlyPriceUsdc,
            subscriberCount: pub.subscriberCount,
          }}
          author={{
            displayName: author.displayName,
            username: author.username,
            avatarUrl: author.avatarUrl,
            bio: author.bio,
          }}
          recommendations={formattedRecs}
        />

      </div>
    </article>
  );
}
