import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db, posts, publications, users } from '@solscribe/db';
import { eq, and, desc } from 'drizzle-orm';
import { getServerUser } from '@/lib/auth/privy';

export const dynamic = 'force-dynamic';

// Helper to convert text into URL-friendly slug
const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove special chars
    .replace(/[\s_]+/g, '-')     // replace spaces/underscores with hyphens
    .replace(/-+/g, '-')         // collapse duplicate hyphens
    .replace(/^-+|-+$/g, '');    // trim leading/trailing hyphens
};

/**
 * GET /api/posts
 *
 * Lists all posts belonging to the authenticated creator's publication.
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const privyUser = await getServerUser(request);
    if (!privyUser) {
      return NextResponse.json({ error: 'Unauthorized: Session not found' }, { status: 401 });
    }

    // 2. Resolve database user
    const dbUser = await db.query.users.findFirst({
      where: eq(users.privyId, privyUser.id),
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized: User not found in database' }, { status: 401 });
    }

    // 3. Resolve publication owned by the creator
    const pub = await db.query.publications.findFirst({
      where: eq(publications.ownerId, dbUser.id),
    });

    if (!pub) {
      return NextResponse.json({ success: true, posts: [] }); // No publication means no posts yet
    }

    // 4. Fetch posts
    const publicationPosts = await db.query.posts.findMany({
      where: eq(posts.publicationId, pub.id),
      orderBy: [desc(posts.createdAt)],
    });

    return NextResponse.json({
      success: true,
      posts: publicationPosts.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        subtitle: p.subtitle,
        status: p.status,
        publishedAt: p.publishedAt?.toISOString() || null,
        viewCount: p.viewCount,
        isPaywalled: p.isPaywalled,
        emailSentAt: p.emailSentAt?.toISOString() || null,
        createdAt: p.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching creator posts:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * POST /api/posts
 *
 * Creates a new draft post under the authenticated user's publication.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const privyUser = await getServerUser(request);
    if (!privyUser) {
      return NextResponse.json({ error: 'Unauthorized: Session not found' }, { status: 401 });
    }

    // 2. Resolve database user
    const dbUser = await db.query.users.findFirst({
      where: eq(users.privyId, privyUser.id),
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized: User not found in database' }, { status: 401 });
    }

    // 3. Resolve creator publication
    const pub = await db.query.publications.findFirst({
      where: eq(publications.ownerId, dbUser.id),
    });

    if (!pub) {
      return NextResponse.json(
        { error: 'No publication found. You must create a publication before writing posts.' },
        { status: 400 }
      );
    }

    // 4. Parse request parameters
    const body = await request.json();
    const { title = 'Untitled Post', subtitle, cover_image_url, content_html = '', preview_html, is_paywalled = false } = body;

    // 5. Automatically generate unique URL-friendly slug
    const baseSlug = slugify(title) || 'untitled';
    let uniqueSlug = baseSlug;
    let counter = 1;
    let isSlugAvailable = false;

    while (!isSlugAvailable && counter <= 20) {
      const conflict = await db.query.posts.findFirst({
        where: and(
          eq(posts.publicationId, pub.id),
          eq(posts.slug, uniqueSlug)
        ),
      });

      if (!conflict) {
        isSlugAvailable = true;
      } else {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    // Force unique suffix fallback
    if (!isSlugAvailable) {
      uniqueSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // 6. Insert new post draft
    const [newPost] = await db
      .insert(posts)
      .values({
        publicationId: pub.id,
        slug: uniqueSlug,
        title,
        subtitle: subtitle || null,
        coverImageUrl: cover_image_url || null,
        contentHtml: content_html,
        previewHtml: preview_html || null,
        isPaywalled: is_paywalled,
        status: 'draft',
      })
      .returning();

    return NextResponse.json({
      success: true,
      post: newPost,
    });
  } catch (error) {
    console.error('Error creating post draft:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
