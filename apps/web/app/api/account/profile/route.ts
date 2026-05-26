import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerUser } from '@/lib/auth/privy';
import { db, users } from '@solscribe/db';
import { eq, and, ne } from '@solscribe/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const profileUpdateSchema = z.object({
  displayName: z.string().min(1).max(60).optional(),
  username: z
    .string()
    .min(2)
    .max(32)
    .regex(/^[a-z0-9_-]+$/, 'Username may only contain lowercase letters, numbers, underscores, and hyphens')
    .optional(),
  bio: z.string().max(200, 'Bio must be 200 characters or fewer').optional().nullable(),
  avatarUrl: z.string().url('Avatar must be a valid URL').optional().nullable(),
});

/**
 * PATCH /api/account/profile
 * Updates the authenticated user's profile. Validates username uniqueness.
 */
export async function PATCH(request: NextRequest) {
  try {
    const privyUser = await getServerUser(request);
    if (!privyUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.privyId, privyUser.id),
    });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = profileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { displayName, username, bio, avatarUrl } = parsed.data;

    // Check username uniqueness (exclude self)
    if (username && username !== dbUser.username) {
      const existingUser = await db.query.users.findFirst({
        where: and(eq(users.username, username), ne(users.id, dbUser.id)),
      });
      if (existingUser) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 409 }
        );
      }
    }

    // Build update payload — only include defined fields
    const updatePayload: Partial<typeof users.$inferInsert> & { updatedAt: Date } = {
      updatedAt: new Date(),
    };
    if (displayName !== undefined) updatePayload.displayName = displayName;
    if (username !== undefined) updatePayload.username = username;
    if (bio !== undefined) updatePayload.bio = bio;
    if (avatarUrl !== undefined) updatePayload.avatarUrl = avatarUrl;

    const [updated] = await db
      .update(users)
      .set(updatePayload)
      .where(eq(users.id, dbUser.id))
      .returning();

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        displayName: updated.displayName,
        username: updated.username,
        bio: updated.bio,
        avatarUrl: updated.avatarUrl,
        email: updated.email,
        role: updated.role,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * GET /api/account/profile
 * Returns the authenticated user's own profile.
 */
export async function GET(request: NextRequest) {
  try {
    const privyUser = await getServerUser(request);
    if (!privyUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.privyId, privyUser.id),
    });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: dbUser.id,
        displayName: dbUser.displayName,
        username: dbUser.username,
        bio: dbUser.bio,
        avatarUrl: dbUser.avatarUrl,
        email: dbUser.email,
        walletAddress: dbUser.walletAddress,
        role: dbUser.role,
        createdAt: dbUser.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
