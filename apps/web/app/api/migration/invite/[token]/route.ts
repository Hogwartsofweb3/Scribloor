import { NextRequest, NextResponse } from 'next/server';
import { db, migrationJobs, migrationContacts, publications, eq, sql } from '@solscribe/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    if (!token) {
      return NextResponse.json({ error: 'Missing token parameter' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://solscribe.app';

    // Look up contact by token
    const contact = await db.query.migrationContacts.findFirst({
      where: eq(migrationContacts.inviteToken, token),
    });

    if (!contact) {
      return NextResponse.redirect(`${appUrl}/not-found`);
    }

    // Resolve job
    const job = await db.query.migrationJobs.findFirst({
      where: eq(migrationJobs.id, contact.jobId),
    });

    if (!job) {
      return NextResponse.redirect(`${appUrl}/not-found`);
    }

    // Resolve publication slug
    const pub = await db.query.publications.findFirst({
      where: eq(publications.id, job.publicationId),
    });

    if (!pub) {
      return NextResponse.redirect(`${appUrl}/not-found`);
    }

    // Track open metrics if the status is not already opened or converted
    if (contact.status === 'pending' || contact.status === 'sent') {
      await db
        .update(migrationContacts)
        .set({
          status: 'opened',
          inviteOpenedAt: new Date(),
        })
        .where(eq(migrationContacts.id, contact.id));

      // Increment emailsOpened count in job
      await db
        .update(migrationJobs)
        .set({
          emailsOpened: sql`${migrationJobs.emailsOpened} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(migrationJobs.id, job.id));
    }

    // Redirect to the publication page with migration options
    const redirectUrl = new URL(`/${pub.slug}`, appUrl);
    redirectUrl.searchParams.set('migrate', 'true');
    redirectUrl.searchParams.set('token', token);

    return NextResponse.redirect(redirectUrl.toString());
  } catch (err) {
    console.error('[Migration Invite Redirect API] Exception:', err);
    const fallbackUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://solscribe.app';
    return NextResponse.redirect(fallbackUrl);
  }
}
