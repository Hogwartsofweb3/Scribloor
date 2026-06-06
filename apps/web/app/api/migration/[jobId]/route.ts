import { NextRequest, NextResponse } from 'next/server';
import { db, migrationJobs, migrationContacts, eq, and } from '@solscribe/db';
import { getServerDbUser } from '@/lib/auth/privy';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;
    if (!jobId) {
      return NextResponse.json({ error: 'Missing jobId parameter' }, { status: 400 });
    }

    const dbUser = await getServerDbUser(request);
    if (!dbUser || dbUser.role !== 'creator') {
      return NextResponse.json({ error: 'Unauthorized. Creators only.' }, { status: 401 });
    }

    // Retrieve migration job
    const job = await db.query.migrationJobs.findFirst({
      where: and(
        eq(migrationJobs.id, jobId),
        eq(migrationJobs.creatorId, dbUser.id)
      ),
    });

    if (!job) {
      return NextResponse.json({ error: 'Migration job not found or unauthorized' }, { status: 404 });
    }

    // Retrieve all contacts for this job
    const contactsList = await db.query.migrationContacts.findMany({
      where: eq(migrationContacts.jobId, jobId),
      orderBy: (c, { asc }) => asc(c.email),
    });

    // Compute stats
    const total = job.totalContacts;
    const sent = job.emailsSent;
    const opened = job.emailsOpened;
    const converted = job.conversions;
    const conversionRate = total > 0 ? Number(((converted / total) * 100).toFixed(1)) : 0;

    return NextResponse.json({
      job: {
        ...job,
        contacts: contactsList,
      },
      stats: {
        total,
        sent,
        opened,
        converted,
        conversionRate,
      },
    });
  } catch (err) {
    console.error('[Migration GET API] Unhandled exception:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;
    if (!jobId) {
      return NextResponse.json({ error: 'Missing jobId parameter' }, { status: 400 });
    }

    const dbUser = await getServerDbUser(request);
    if (!dbUser || dbUser.role !== 'creator') {
      return NextResponse.json({ error: 'Unauthorized. Creators only.' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body as { status: 'pending' | 'failed' };

    if (status !== 'pending' && status !== 'failed') {
      return NextResponse.json({ error: 'Invalid status transition. Allowed values: pending, failed' }, { status: 400 });
    }

    const [updatedJob] = await db
      .update(migrationJobs)
      .set({ status, updatedAt: new Date() })
      .where(
        and(
          eq(migrationJobs.id, jobId),
          eq(migrationJobs.creatorId, dbUser.id)
        )
      )
      .returning();

    if (!updatedJob) {
      return NextResponse.json({ error: 'Job not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true, job: updatedJob });
  } catch (err) {
    console.error('[Migration PATCH API] Unhandled exception:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
