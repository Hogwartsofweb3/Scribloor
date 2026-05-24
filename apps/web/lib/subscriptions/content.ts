import { db, posts, publications } from '@solscribe/db';
import { eq, and } from 'drizzle-orm';
import { hasActiveSubscription } from './access';

export interface PostWithAccess {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  publishedAt: Date | null;
  hasFullAccess: boolean;
  contentToShow: string;
  subscriptionRequired: boolean;
  subscriptionPrice: number | null;
  publicationId: string;
}

export async function getPostForUser({
  postSlug,
  publicationSlug,
  userId,
}: {
  postSlug: string;
  publicationSlug: string;
  userId: string | null;
}): Promise<PostWithAccess | null> {
  // 1. Resolve publication by slug
  const pub = await db.query.publications.findFirst({
    where: eq(publications.slug, publicationSlug),
  });

  if (!pub) return null;

  // 2. Resolve post by slug and publication ID
  const post = await db.query.posts.findFirst({
    where: and(
      eq(posts.slug, postSlug),
      eq(posts.publicationId, pub.id),
      eq(posts.status, 'published')
    ),
  });

  if (!post) return null;

  const isPaywalled = post.isPaywalled;
  const price = pub.monthlyPriceUsdc ? Number(pub.monthlyPriceUsdc) : null;

  // 3. Free post or Free tier publication logic
  if (!isPaywalled || !pub.monthlyPriceUsdc) {
    return {
      id: post.id,
      title: post.title,
      subtitle: post.subtitle,
      slug: post.slug,
      publishedAt: post.publishedAt,
      hasFullAccess: true,
      contentToShow: post.contentHtml,
      subscriptionRequired: false,
      subscriptionPrice: price,
      publicationId: pub.id,
    };
  }

  // 4. Paywalled post - check authentication
  if (!userId) {
    return {
      id: post.id,
      title: post.title,
      subtitle: post.subtitle,
      slug: post.slug,
      publishedAt: post.publishedAt,
      hasFullAccess: false,
      contentToShow: post.previewHtml ?? '',
      subscriptionRequired: true,
      subscriptionPrice: price,
      publicationId: pub.id,
    };
  }

  // 5. Check subscription access
  const hasAccess = await hasActiveSubscription({ userId, publicationId: pub.id });

  return {
    id: post.id,
    title: post.title,
    subtitle: post.subtitle,
    slug: post.slug,
    publishedAt: post.publishedAt,
    hasFullAccess: hasAccess,
    contentToShow: hasAccess ? post.contentHtml : (post.previewHtml ?? ''),
    subscriptionRequired: true,
    subscriptionPrice: price,
    publicationId: pub.id,
  };
}
