import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db, posts, publications, users } from '@solscribe/db';
import { eq, and } from '@solscribe/db';
import { getServerUser } from '@/lib/auth/privy';

export const dynamic = 'force-dynamic';

/**
 * GET /api/posts/[id]
 *
 * Retrieves a single post for editing (owner only).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { publicationSlug: string } }
) {
  try {
    const postId = params.publicationSlug;

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

    // 3. Query post
    const targetPost = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    });

    if (!targetPost) {
      return new NextResponse('Post Not Found', { status: 404 });
    }

    // 4. Verify owner status
    const publication = await db.query.publications.findFirst({
      where: eq(publications.id, targetPost.publicationId),
    });

    if (!publication || publication.ownerId !== dbUser.id) {
      return new NextResponse('Forbidden: You do not own this publication', { status: 403 });
    }

    return NextResponse.json({
      success: true,
      post: targetPost,
    });
  } catch (error) {
    console.error('Error fetching post for editing:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * PATCH /api/posts/[id]
 *
 * Updates draft or metadata settings for a post (owner only).
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

    // 4. Verify user owns the associated publication
    const publication = await db.query.publications.findFirst({
      where: eq(publications.id, targetPost.publicationId),
    });

    if (!publication || publication.ownerId !== dbUser.id) {
      return new NextResponse('Forbidden: You do not own this publication', { status: 403 });
    }

    // 5. Parse request body parameters
    const body = await request.json();
    const {
      title,
      subtitle,
      cover_image_url,
      content_html,
      preview_html,
      is_paywalled,
      status,
      scheduled_at,
    } = body;

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (subtitle !== undefined) updateData.subtitle = subtitle || null;
    if (cover_image_url !== undefined) updateData.coverImageUrl = cover_image_url || null;
    if (content_html !== undefined) updateData.contentHtml = content_html;
    if (preview_html !== undefined) updateData.previewHtml = preview_html || null;
    if (is_paywalled !== undefined) updateData.isPaywalled = is_paywalled;
    if (status !== undefined) updateData.status = status;
    if (scheduled_at !== undefined) {
      updateData.scheduledAt = scheduled_at ? new Date(scheduled_at) : null;
    }

    updateData.updatedAt = new Date();

    // 6. Execute update
    const [updatedPost] = await db
      .update(posts)
      .set(updateData)
      .where(eq(posts.id, targetPost.id))
      .returning();

    return NextResponse.json({
      success: true,
      post: updatedPost,
    });
  } catch (error) {
    console.error('Error saving post PATCH updates:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * DELETE /api/posts/[id]
 *
 * Deletes a post draft or published post permanently (owner only).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { publicationSlug: string } }
) {
  try {
    const postId = params.publicationSlug;

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

    // 3. Resolve target post
    const targetPost = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    });

    if (!targetPost) {
      return new NextResponse('Post Not Found', { status: 404 });
    }

    // 4. Verify owner status
    const publication = await db.query.publications.findFirst({
      where: eq(publications.id, targetPost.publicationId),
    });

    if (!publication || publication.ownerId !== dbUser.id) {
      return new NextResponse('Forbidden: You do not own this publication', { status: 403 });
    }

    // 5. Execute hard deletion
    await db
      .delete(posts)
      .where(eq(posts.id, targetPost.id));

    return NextResponse.json({
      success: true,
      message: 'Post deleted permanently.',
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
