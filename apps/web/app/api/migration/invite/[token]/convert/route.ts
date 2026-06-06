import { NextRequest, NextResponse } from 'next/server';
import { db, migrationJobs, migrationContacts, eq, sql } from '@solscribe/db';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    if (!token) {
      return NextResponse.json({ error: 'Missing token parameter' }, { status: 400 });
    }

    // Resolve contact by token
    const contact = await db.query.migrationContacts.findFirst({
      where: eq(migrationContacts.inviteToken, token),
    });

    if (!contact) {
      return NextResponse.json({ error: 'Invalid invite token' }, { status: 404 });
    }

    // Only update stats if this contact hasn't already converted
    if (contact.status !== 'converted') {
      await db
        .update(migrationContacts)
        .set({
          status: 'converted',
          convertedAt: new Date(),
        })
        .where(eq(migrationContacts.id, contact.id));

      // Increment conversions count in job
      await db
        .update(migrationJobs)
        .set({
          conversions: sql`${migrationJobs.conversions} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(migrationJobs.id, contact.jobId));
    }

    return NextResponse.json({ success: true, message: 'Migration conversion tracked successfully.' });
  } catch (err) {
    console.error('[Migration Convert API] Exception:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
