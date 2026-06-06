import { NextResponse } from 'next/server';
import { db, publications, posts, vaultEntries, users, eq, and, or, ilike, desc } from '@solscribe/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!query.trim()) {
      return NextResponse.json({ publications: [], posts: [], research: [] });
    }

    const searchPattern = `%${query}%`;

    // 1. Search publications (joining owner details)
    const matchedPublications = await db
      .select({
        id: publications.id,
        name: publications.name,
        slug: publications.slug,
        description: publications.description,
        coverImageUrl: publications.coverImageUrl,
        subscriberCount: publications.subscriberCount,
        monthlyPriceUsdc: publications.monthlyPriceUsdc,
        ownerName: users.displayName,
        ownerAvatar: users.avatarUrl,
      })
      .from(publications)
      .innerJoin(users, eq(publications.ownerId, users.id))
      .where(
        and(
          eq(publications.isPublished, true),
          or(
            ilike(publications.name, searchPattern),
            ilike(publications.description, searchPattern)
          )
        )
      )
      .limit(limit);

    // 2. Search posts (joining publication details)
    const matchedPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        subtitle: posts.subtitle,
        slug: posts.slug,
        coverImageUrl: posts.coverImageUrl,
        isPaywalled: posts.isPaywalled,
        publishedAt: posts.publishedAt,
        viewCount: posts.viewCount,
        publicationName: publications.name,
        publicationSlug: publications.slug,
      })
      .from(posts)
      .innerJoin(publications, eq(posts.publicationId, publications.id))
      .where(
        and(
          eq(posts.status, 'published'),
          or(
            ilike(posts.title, searchPattern),
            ilike(posts.subtitle, searchPattern)
          )
        )
      )
      .orderBy(desc(posts.publishedAt))
      .limit(limit);

    // 3. Search Vault Entries (Research) (joining author details)
    const matchedResearch = await db
      .select({
        id: vaultEntries.id,
        title: vaultEntries.title,
        slug: vaultEntries.slug,
        abstract: vaultEntries.abstract,
        coverImageUrl: vaultEntries.coverImageUrl,
        category: vaultEntries.category,
        wordCount: vaultEntries.wordCount,
        readTimeMinutes: vaultEntries.readTimeMinutes,
        singleAccessPriceUsdc: vaultEntries.singleAccessPriceUsdc,
        isVaultPassIncluded: vaultEntries.isVaultPassIncluded,
        publishedAt: vaultEntries.publishedAt,
        authorName: users.displayName,
        authorAvatar: users.avatarUrl,
      })
      .from(vaultEntries)
      .innerJoin(users, eq(vaultEntries.authorId, users.id))
      .where(
        and(
          eq(vaultEntries.status, 'published'),
          or(
            ilike(vaultEntries.title, searchPattern),
            ilike(vaultEntries.abstract, searchPattern)
          )
        )
      )
      .orderBy(desc(vaultEntries.publishedAt))
      .limit(limit);

    return NextResponse.json({
      publications: matchedPublications.map((p) => ({
        ...p,
        monthlyPriceUsdc: p.monthlyPriceUsdc ? Number(p.monthlyPriceUsdc) : 0,
      })),
      posts: matchedPosts,
      research: matchedResearch.map((r) => ({
        ...r,
        singleAccessPriceUsdc: r.singleAccessPriceUsdc ? Number(r.singleAccessPriceUsdc) : 0,
      })),
    });
  } catch (error) {
    console.error('[Search API] Error:', error);
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
  }
}
