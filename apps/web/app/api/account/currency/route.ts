import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerUser } from '@/lib/auth/privy';
import { db, users } from '@solscribe/db';
import { eq } from '@solscribe/db';
import { z } from 'zod';
import { getSupportedCurrencies } from '@/lib/currency/exchangeRates';

export const dynamic = 'force-dynamic';

const currencySchema = z.object({
  currency: z.string().toUpperCase(),
});

/**
 * PATCH /api/account/currency
 * Updates the authenticated user's preferred currency setting in the database.
 */
export async function PATCH(request: NextRequest) {
  try {
    // 1. Authenticate privy session
    const privyUser = await getServerUser(request);
    if (!privyUser) {
      return NextResponse.json({ error: 'Unauthorized: Session not found' }, { status: 401 });
    }

    // 2. Resolve database user
    const dbUser = await db.query.users.findFirst({
      where: eq(users.privyId, privyUser.id),
    });
    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized: User not found in database' }, { status: 404 });
    }

    // 3. Parse and validate currency input
    const body = await request.json();
    const parsed = currencySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid currency code format' }, { status: 400 });
    }

    const { currency } = parsed.data;
    const supported = getSupportedCurrencies();
    if (!supported.some(c => c.code === currency)) {
      return NextResponse.json({ error: `Unsupported currency code: ${currency}` }, { status: 400 });
    }

    // 4. Update the user setting in db
    await db
      .update(users)
      .set({
        preferredCurrency: currency,
        updatedAt: new Date(),
      })
      .where(eq(users.id, dbUser.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Preferred Currency API] Error updating preference:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
