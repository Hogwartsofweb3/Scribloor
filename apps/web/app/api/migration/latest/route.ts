import { NextRequest, NextResponse } from 'next/server';
import { db, migrationJobs, eq } from '@solscribe/db';
import { getServerDbUser } from '@/lib/auth/privy';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const dbUser = await getServerDbUser(request);
    if (!dbUser || dbUser.role !== 'creator') {
      return NextResponse.json({ error: 'Unauthorized. Creators only.' }, { status: 401 });
    }

    // Resolve the latest migration job owned by this creator
    const latestJob = await db.query.migrationJobs.findFirst({
      where: eq(migrationJobs.creatorId, dbUser.id),
      orderBy: (jobs, { desc }) => desc(jobs.createdAt),
    });

    return NextResponse.json({ job: latestJob || null });
  } catch (err) {
    console.error('[Migration Latest GET API] Exception:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
