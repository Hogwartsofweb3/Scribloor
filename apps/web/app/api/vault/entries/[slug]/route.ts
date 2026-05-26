import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db, vaultEntries, users } from '@solscribe/db';
import { eq, sql } from '@solscribe/db';
import { getServerDbUser } from '@/lib/auth/privy';
import { hasVaultAccess } from '@/lib/vault/access';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await getServerDbUser(request);
    const { slug } = params;

    const result = await db
      .select({ entry: vaultEntries, author: users })
      .from(vaultEntries)
      .innerJoin(users, eq(vaultEntries.authorId, users.id))
      .where(eq(vaultEntries.slug, slug))
      .limit(1);

    if (!result.length) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    const { entry, author } = result[0];

    if (entry.status !== 'published') {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    const hasAccess = user ? await hasVaultAccess(user.id, entry.id) : false;

    // Increment access count when user has access
    if (hasAccess) {
      db.update(vaultEntries)
        .set({ accessCount: sql`${vaultEntries.accessCount} + 1` })
        .where(eq(vaultEntries.id, entry.id))
        .execute()
        .catch(console.error);
    }

    // Strip full content if no access
    const responseEntry = hasAccess
      ? { ...entry, author }
      : { ...entry, contentHtml: null, author };

    return NextResponse.json(responseEntry);
  } catch (error) {
    console.error('[Vault Entry API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
