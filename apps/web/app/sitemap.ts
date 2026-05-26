import { MetadataRoute } from 'next';
import { db, publications, posts } from '@solscribe/db';
import { eq } from '@solscribe/db';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://solscribe.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: APP_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${APP_URL}/explore`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${APP_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  try {
    // All published publications
    const pubs = await db.query.publications.findMany({
      where: eq(publications.isPublished, true),
    });

    for (const pub of pubs) {
      entries.push({
        url: `${APP_URL}/${pub.slug}`,
        lastModified: pub.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }

    // All published posts
    const publishedPosts = await db.query.posts.findMany({
      where: eq(posts.status, 'published'),
      with: { publication: true },
    });

    for (const post of publishedPosts) {
      if (!post.publication) continue;
      entries.push({
        url: `${APP_URL}/${post.publication.slug}/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  } catch (error) {
    console.error('[Sitemap] Error generating sitemap:', error);
  }

  return entries;
}
