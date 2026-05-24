import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db, posts, publications, users } from '@solscribe/db';
import { eq } from 'drizzle-orm';
import { getServerUser } from '@/lib/auth/privy';

/**
 * PATCH /api/posts/[id]
 *
 * Saves a draft update for a post if the user owns the publication.
 * Mapped to [publicationSlug] directory to conform to Next.js dynamic routing constraints.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { publicationSlug: string } }
) {
  try {
    const postId = params.publicationSlug;

    // 1. Authenticate user
    const privyUser = await getServerUser(request);
    if (!privyUser) {
      return new NextResponse('Unauthorized: No session found', { status: 401 });
    }

    // 2. Resolve database user
    const dbUser = await db.query.users.findFirst({
      where: eq(users.privyId, privyUser.id),
    });

    if (!dbUser) {
      return new NextResponse('Unauthorized: User not registered in database', { status: 401 });
    }

    // 3. Resolve target post
    const targetPost = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    });

    if (!targetPost) {
      return new NextResponse('Post Not Found', { status: 404 });
    }

    // 4. Verify user owns the associated publication
    const publication = await db.query.publications.findFirst({
      where: eq(publications.id, targetPost.publicationId),
    });

    if (!publication || publication.ownerId !== dbUser.id) {
      return new NextResponse('Unauthorized: You do not own this publication', { status: 401 });
    }

    // 5. Parse body parameters
    const body = await request.json();
    const { content_html, preview_html, status = 'draft' } = body;

    if (typeof content_html !== 'string') {
      return new NextResponse('Bad Request: content_html is required', { status: 400 });
    }

    // 6. Execute update
    await db
      .update(posts)
      .set({
        contentHtml: content_html,
        previewHtml: preview_html || null,
        status: status,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, targetPost.id));

    return NextResponse.json({
      success: true,
      id: targetPost.id,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error during auto-save PATCH:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
