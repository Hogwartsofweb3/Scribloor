import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db, publications, users } from '@solscribe/db';
import { eq, and, ne } from '@solscribe/db';
import { getServerUser } from '@/lib/auth/privy';
import { PublicationSchema } from '@/lib/validations/publication';

/**
 * GET /api/publications/[slug]
 *
 * Fetches the public details of a publication.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const publication = await db.query.publications.findFirst({
      where: and(
        eq(publications.slug, params.slug.toLowerCase()),
        eq(publications.isPublished, true)
      ),
    });

    if (!publication) {
      return new NextResponse('Publication Not Found', { status: 404 });
    }

    return NextResponse.json({
      success: true,
      publication: {
        id: publication.id,
        name: publication.name,
        slug: publication.slug,
        description: publication.description,
        coverImageUrl: publication.coverImageUrl,
        monthlyPriceUsdc: Number(publication.monthlyPriceUsdc),
        freeTierEnabled: publication.freeTierEnabled,
        payoutWallet: publication.payoutWallet,
        subscriberCount: publication.subscriberCount,
      },
    });
  } catch (error) {
    console.error('Error fetching publication:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * PATCH /api/publications/[slug]
 *
 * Updates publication metadata (owner only). Supports partial updates.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // 1. Authenticate Privy session
    const privyUser = await getServerUser(request);
    if (!privyUser) {
      return new NextResponse('Unauthorized: Session not found', { status: 401 });
    }

    // 2. Resolve database user
    const dbUser = await db.query.users.findFirst({
      where: eq(users.privyId, privyUser.id),
    });

    if (!dbUser) {
      return new NextResponse('Unauthorized: User not registered in database', { status: 401 });
    }

    // 3. Resolve target publication
    const publication = await db.query.publications.findFirst({
      where: eq(publications.slug, params.slug.toLowerCase()),
    });

    if (!publication) {
      return new NextResponse('Publication Not Found', { status: 404 });
    }

    // 4. Assert owner identity
    if (publication.ownerId !== dbUser.id) {
      return new NextResponse('Forbidden: You do not own this publication', { status: 403 });
    }

    // 5. Parse and partially validate payload
    const body = await request.json();
    const PartialPublicationSchema = PublicationSchema.partial();
    const result = PartialPublicationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation Failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const {
      name,
      slug,
      description,
      monthlyPriceUsdc,
      freeTierEnabled,
      payoutWallet,
      coverImageUrl,
    } = result.data;

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description || null;
    if (coverImageUrl !== undefined) updateData.coverImageUrl = coverImageUrl || null;
    if (monthlyPriceUsdc !== undefined) updateData.monthlyPriceUsdc = monthlyPriceUsdc.toString();
    if (freeTierEnabled !== undefined) updateData.freeTierEnabled = freeTierEnabled;
    if (payoutWallet !== undefined) updateData.payoutWallet = payoutWallet;

    // Handle slug change with uniqueness validation
    if (slug !== undefined && slug.toLowerCase() !== publication.slug) {
      const slugConflict = await db.query.publications.findFirst({
        where: and(
          eq(publications.slug, slug.toLowerCase()),
          ne(publications.id, publication.id)
        ),
      });

      if (slugConflict) {
        return NextResponse.json(
          { error: 'Slug Conflict', details: { fieldErrors: { slug: ['This URL slug is already taken.'] } } },
          { status: 400 }
        );
      }
      updateData.slug = slug.toLowerCase();
    }

    updateData.updatedAt = new Date();

    // 6. Commit updates
    const [updatedPub] = await db
      .update(publications)
      .set(updateData)
      .where(eq(publications.id, publication.id))
      .returning();

    return NextResponse.json({
      success: true,
      publication: updatedPub,
    });
  } catch (error) {
    console.error('Error updating publication:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * DELETE /api/publications/[slug]
 *
 * Soft deletes the publication (owner only).
 * Sets isPublished = false and renames the slug to free up namespace.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // 1. Authenticate Privy session
    const privyUser = await getServerUser(request);
    if (!privyUser) {
      return new NextResponse('Unauthorized: Session not found', { status: 401 });
    }

    // 2. Resolve database user
    const dbUser = await db.query.users.findFirst({
      where: eq(users.privyId, privyUser.id),
    });

    if (!dbUser) {
      return new NextResponse('Unauthorized: User not registered in database', { status: 401 });
    }

    // 3. Resolve target publication
    const publication = await db.query.publications.findFirst({
      where: eq(publications.slug, params.slug.toLowerCase()),
    });

    if (!publication) {
      return new NextResponse('Publication Not Found', { status: 404 });
    }

    // 4. Assert owner identity
    if (publication.ownerId !== dbUser.id) {
      return new NextResponse('Forbidden: You do not own this publication', { status: 403 });
    }

    // 5. Soft delete: set unpublished and rename slug namespace
    const timestamp = Date.now();
    const deletedSlug = `deleted-${publication.slug}-${timestamp}`;

    await db
      .update(publications)
      .set({
        isPublished: false,
        slug: deletedSlug,
        updatedAt: new Date(),
      })
      .where(eq(publications.id, publication.id));

    return NextResponse.json({
      success: true,
      message: 'Publication soft-deleted successfully and slug namespace released.',
    });
  } catch (error) {
    console.error('Error deleting publication:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
