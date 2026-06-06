import { NextRequest, NextResponse } from 'next/server';
import { db, migrationJobs, migrationContacts, publications, eq } from '@solscribe/db';
import { getServerDbUser } from '@/lib/auth/privy';
import { parseMigrationCsv } from '@/lib/migration/parseCsv';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const dbUser = await getServerDbUser(request);
    if (!dbUser || dbUser.role !== 'creator') {
      return NextResponse.json({ error: 'Unauthorized. Creators only.' }, { status: 401 });
    }

    // Resolve publication
    const pub = await db.query.publications.findFirst({
      where: eq(publications.ownerId, dbUser.id),
    });

    if (!pub) {
      return NextResponse.json(
        { error: 'You must create a publication before migrating subscribers.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { platform, csvFileUrl, includeFreeTier } = body as {
      platform: 'substack' | 'beehiiv' | 'ghost' | 'other';
      csvFileUrl: string;
      includeFreeTier: boolean;
    };

    if (!csvFileUrl || !platform) {
      return NextResponse.json({ error: 'Missing required fields: csvFileUrl or platform' }, { status: 400 });
    }

    // Parse the CSV
    let parsedContacts;
    try {
      parsedContacts = await parseMigrationCsv(csvFileUrl, platform, includeFreeTier);
    } catch (parseErr) {
      console.error('[Migration API] CSV parsing error:', parseErr);
      return NextResponse.json(
        { error: parseErr instanceof Error ? parseErr.message : 'Failed to parse CSV file.' },
        { status: 400 }
      );
    }

    if (parsedContacts.length === 0) {
      return NextResponse.json(
        { error: 'No valid subscribers found in the uploaded CSV.' },
        { status: 400 }
      );
    }

    // Create migration job
    const [job] = await db
      .insert(migrationJobs)
      .values({
        creatorId: dbUser.id,
        publicationId: pub.id,
        sourcePlatform: platform,
        status: 'pending',
        totalContacts: parsedContacts.length,
        csvFileUrl,
      })
      .returning();

    // Map and insert contacts in chunks to keep db payloads under bounds
    const contactsToInsert = parsedContacts.map((contact) => ({
      jobId: job.id,
      email: contact.email,
      name: contact.name,
      sourceSubscriptionStatus: contact.sourceSubscriptionStatus,
      inviteToken: crypto.randomUUID().replace(/-/g, ''),
      status: 'pending' as const,
    }));

    const chunkSize = 200;
    for (let i = 0; i < contactsToInsert.length; i += chunkSize) {
      const chunk = contactsToInsert.slice(i, i + chunkSize);
      await db.insert(migrationContacts).values(chunk);
    }

    return NextResponse.json({
      jobId: job.id,
      totalContacts: job.totalContacts,
      previewContacts: contactsToInsert.slice(0, 5).map((c) => ({
        email: c.email,
        name: c.name,
        sourceSubscriptionStatus: c.sourceSubscriptionStatus,
      })),
    });
  } catch (err) {
    console.error('[Migration POST API] Unhandled exception:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
