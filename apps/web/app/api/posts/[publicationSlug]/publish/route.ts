import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db, posts, publications, users } from '@solscribe/db';
import { eq } from '@solscribe/db';
import { getServerUser } from '@/lib/auth/privy';
import { sendPostToSubscribers } from '@/lib/email/postDelivery';

export const dynamic = 'force-dynamic';

/**
 * POST /api/posts/[id]/publish
 *
 * Transitions a post draft to published, setting stamps and dispatching newsletters.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { publicationSlug: string } }
) {
  try {
    const postId = params.publicationSlug;

    // 1. Authenticate Privy session
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

    // 3. Resolve target post
    const targetPost = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    });

    if (!targetPost) {
      return new NextResponse('Post Not Found', { status: 404 });
    }

    // 4. Verify publication owner status
    const publication = await db.query.publications.findFirst({
      where: eq(publications.id, targetPost.publicationId),
    });

    if (!publication || publication.ownerId !== dbUser.id) {
      return new NextResponse('Forbidden: You do not own this publication', { status: 403 });
    }

    // 5. Enforce safety gate: paywalled posts must have teaser/preview HTML
    if (targetPost.isPaywalled) {
      const teaserText = targetPost.previewHtml ? targetPost.previewHtml.trim().replace(/<[^>]*>/g, '') : '';
      if (!targetPost.previewHtml || teaserText.length < 5) {
        return NextResponse.json(
          { error: 'Publish blocked: You must define a paywall preview snippet before publishing paywalled posts.' },
          { status: 400 }
        );
      }
    }

    // 6. Transition post status to published
    await db
      .update(posts)
      .set({
        status: 'published',
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(posts.id, targetPost.id));

    // 7. Dispatch subscriber newsletters in the background
    // Await it to return precise metrics in the immediate publish response
    const deliveryStats = await sendPostToSubscribers(targetPost.id);

    return NextResponse.json({
      success: true,
      id: targetPost.id,
      status: 'published',
      sentEmails: deliveryStats.sent,
      failedEmails: deliveryStats.failed,
      publishedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error publishing post:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
