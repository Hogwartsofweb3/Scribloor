import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerUser } from '@/lib/auth/privy';
import { db, users } from '@solscribe/db';
import { eq } from 'drizzle-orm';
import { getPostForUser } from '@/lib/subscriptions/content';

/**
 * GET /api/posts/[publicationSlug]/[postSlug]
 *
 * Fetches a post and enforces paywall logic.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { publicationSlug: string; postSlug: string } }
) {
  try {
    const privyUser = await getServerUser(request);
    let dbUserId: string | null = null;

    if (privyUser) {
      const dbUser = await db.query.users.findFirst({
        where: eq(users.privyId, privyUser.id),
      });
      dbUserId = dbUser?.id ?? null;
    }

    const post = await getPostForUser({
      postSlug: params.postSlug,
      publicationSlug: params.publicationSlug,
      userId: dbUserId,
    });

    if (!post) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // Configure caching headers based on paywall status
    // If it's completely public and free, we can cache it heavily at the edge
    const headers = new Headers();
    if (!post.subscriptionRequired) {
      headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    } else {
      headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    }

    return NextResponse.json(post, { headers });
  } catch (error) {
    console.error('Error fetching post:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
