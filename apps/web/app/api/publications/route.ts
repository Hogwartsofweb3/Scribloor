import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db, publications, users } from '@solscribe/db';
import { eq } from '@solscribe/db';
import { getServerUser } from '@/lib/auth/privy';
import { PublicationSchema } from '@/lib/validations/publication';

export const dynamic = 'force-dynamic';

/**
 * GET /api/publications
 *
 * Retrieves the publication owned by the currently authenticated user.
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate Privy session
    const privyUser = await getServerUser(request);
    if (!privyUser) {
      return NextResponse.json({ error: 'Unauthorized: Session not found' }, { status: 401 });
    }

    // 2. Resolve database user record
    const dbUser = await db.query.users.findFirst({
      where: eq(users.privyId, privyUser.id),
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized: User not found in database' }, { status: 401 });
    }

    // 3. Query publication owned by the current user
    const userPub = await db.query.publications.findFirst({
      where: eq(publications.ownerId, dbUser.id),
    });

    return NextResponse.json({
      success: true,
      publication: userPub
        ? {
            id: userPub.id,
            name: userPub.name,
            slug: userPub.slug,
            description: userPub.description,
            coverImageUrl: userPub.coverImageUrl,
            monthlyPriceUsdc: Number(userPub.monthlyPriceUsdc),
            freeTierEnabled: userPub.freeTierEnabled,
            payoutWallet: userPub.payoutWallet,
            subscriberCount: userPub.subscriberCount,
            isPublished: userPub.isPublished,
          }
        : null,
    });
  } catch (error) {
    console.error('Error fetching creator publication:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * POST /api/publications
 *
 * Creates a new publication for the authenticated user (restricted to 1 per user for MVP).
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate Privy session
    const privyUser = await getServerUser(request);
    if (!privyUser) {
      return NextResponse.json({ error: 'Unauthorized: Session not found' }, { status: 401 });
    }

    // 2. Resolve database user record
    const dbUser = await db.query.users.findFirst({
      where: eq(users.privyId, privyUser.id),
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized: User not registered in database' }, { status: 401 });
    }

    // 3. Enforce MVP restriction: maximum of 1 publication per creator
    const existingPub = await db.query.publications.findFirst({
      where: eq(publications.ownerId, dbUser.id),
    });

    if (existingPub) {
      return NextResponse.json(
        { error: 'MVP Restriction: Only one publication is allowed per creator account.' },
        { status: 400 }
      );
    }

    // 4. Parse and validate payload
    const body = await request.json();
    const result = PublicationSchema.safeParse(body);

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

    // 5. Verify slug uniqueness again before committing
    const slugConflict = await db.query.publications.findFirst({
      where: eq(publications.slug, slug),
    });

    if (slugConflict) {
      return NextResponse.json(
        { error: 'Slug Conflict', details: { fieldErrors: { slug: ['This URL slug is already taken.'] } } },
        { status: 400 }
      );
    }

    // 6. Insert new publication
    const [newPub] = await db
      .insert(publications)
      .values({
        ownerId: dbUser.id,
        slug: slug.toLowerCase(),
        name,
        description: description || null,
        coverImageUrl: coverImageUrl || null,
        monthlyPriceUsdc: monthlyPriceUsdc.toString(),
        freeTierEnabled: freeTierEnabled ?? true,
        payoutWallet,
        isPublished: true, // Active immediately on Wizard completion
      })
      .returning();

    return NextResponse.json({
      success: true,
      publication: newPub,
    });
  } catch (error) {
    console.error('Error creating publication:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
