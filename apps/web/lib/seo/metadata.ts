import type { Metadata } from 'next';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://solscribe.app';
const SITE_NAME = 'Solscribe';

interface PublicationMeta {
  slug: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  subscriberCount: number;
}

interface CreatorMeta {
  displayName: string | null;
  username: string;
  avatarUrl: string | null;
}

interface PostMeta {
  slug: string;
  title: string;
  subtitle: string | null;
  coverImageUrl: string | null;
  isPaywalled: boolean;
  status: string;
  publishedAt: Date | null;
  updatedAt: Date;
  contentHtml: string;
}

/**
 * Generates full SEO metadata for a publication page.
 */
export function generatePublicationMetadata(
  publication: PublicationMeta,
  creator: CreatorMeta
): Metadata {
  const title = `${publication.name} | ${SITE_NAME}`;
  const description =
    publication.description ||
    `Subscribe to ${publication.name} by ${creator.displayName || creator.username} on ${SITE_NAME}.`;
  const url = `${APP_URL}/${publication.slug}`;
  const creatorName = creator.displayName || creator.username;

  return {
    title,
    description,
    openGraph: {
      title: publication.name,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      ...(publication.coverImageUrl && {
        images: [{ url: publication.coverImageUrl, width: 1200, height: 630, alt: publication.name }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: publication.name,
      description,
    },
    alternates: { canonical: url },
    other: {
      'script:ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: publication.name,
        description,
        url,
        ...(publication.coverImageUrl && { logo: publication.coverImageUrl }),
        founder: {
          '@type': 'Person',
          name: creatorName,
          ...(creator.avatarUrl && { image: creator.avatarUrl }),
        },
      }),
    },
  };
}

/**
 * Generates full SEO metadata for a post page.
 */
export function generatePostMetadata(
  post: PostMeta,
  publication: PublicationMeta,
  creator: CreatorMeta
): Metadata {
  const title = `${post.title} | ${publication.name}`;
  const description =
    post.subtitle ||
    post.contentHtml
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 160) + '...';
  const url = `${APP_URL}/${publication.slug}/${post.slug}`;
  const creatorName = creator.displayName || creator.username;
  const imageUrl = post.coverImageUrl ?? publication.coverImageUrl;

  // noindex drafts
  const robots = post.status === 'draft' ? { index: false, follow: false } : undefined;

  return {
    title,
    description,
    ...(robots && { robots }),
    openGraph: {
      title: post.title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'article',
      ...(post.publishedAt && { publishedTime: post.publishedAt.toISOString() }),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [creatorName],
      ...(imageUrl && {
        images: [{ url: imageUrl, width: 1200, height: 630, alt: post.title }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
    },
    alternates: { canonical: url },
    other: {
      'script:ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        ...(post.subtitle && { alternativeHeadline: post.subtitle }),
        description,
        url,
        ...(imageUrl && { image: [imageUrl] }),
        ...(post.publishedAt && { datePublished: post.publishedAt.toISOString() }),
        dateModified: post.updatedAt.toISOString(),
        author: {
          '@type': 'Person',
          name: creatorName,
          ...(creator.avatarUrl && { image: creator.avatarUrl }),
        },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: APP_URL,
        },
        isAccessibleForFree: !post.isPaywalled,
      }),
    },
  };
}
