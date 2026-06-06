import { NextRequest, NextResponse } from 'next/server';
import { db, migrationJobs, migrationContacts, publications, users, eq, and, inArray, sql } from '@solscribe/db';
import { getServerDbUser } from '@/lib/auth/privy';
import { resend } from '@/lib/email/resend';
import MigrationInvite from '@/emails/MigrationInvite';
import React from 'react';

export const dynamic = 'force-dynamic';

export async function POST(
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

    // Retrieve and verify job ownership
    const job = await db.query.migrationJobs.findFirst({
      where: and(
        eq(migrationJobs.id, jobId),
        eq(migrationJobs.creatorId, dbUser.id)
      ),
    });

    if (!job) {
      return NextResponse.json({ error: 'Migration job not found' }, { status: 404 });
    }

    // Resolve publication
    const pub = await db.query.publications.findFirst({
      where: eq(publications.id, job.publicationId),
    });

    if (!pub) {
      return NextResponse.json({ error: 'Publication not found' }, { status: 404 });
    }

    // Get creator name
    const creatorName = dbUser.displayName || dbUser.username;

    // Get all pending contacts for this job
    const pendingContacts = await db.query.migrationContacts.findMany({
      where: and(
        eq(migrationContacts.jobId, jobId),
        eq(migrationContacts.status, 'pending')
      ),
      limit: 10000, // Maximum safety cap
    });

    if (pendingContacts.length === 0) {
      // If there are no pending contacts left, make sure job is marked completed
      await db
        .update(migrationJobs)
        .set({ status: 'completed', updatedAt: new Date() })
        .where(eq(migrationJobs.id, jobId));

      return NextResponse.json({ success: true, message: 'No pending contacts to invite.' });
    }

    // Set job status to 'processing'
    await db
      .update(migrationJobs)
      .set({ status: 'processing', updatedAt: new Date() })
      .where(eq(migrationJobs.id, jobId));

    // Execute sends in batches of 50
    const batchSize = 50;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://solscribe.app';
    const emailFrom = process.env.EMAIL_FROM || 'noreply@solscribe.app';

    // Run this process asynchronously to avoid API timeout, but let the database state track it
    (async () => {
      try {
        for (let i = 0; i < pendingContacts.length; i += batchSize) {
          // Verify that job is still marked as 'processing' (handles pause action midway)
          const latestJob = await db.query.migrationJobs.findFirst({
            where: eq(migrationJobs.id, jobId),
          });

          if (!latestJob || latestJob.status !== 'processing') {
            console.log(`[Migration Send] Job ${jobId} status is no longer 'processing' (${latestJob?.status}). Halting.`);
            break;
          }

          const batch = pendingContacts.slice(i, i + batchSize);

          // Build batch email payloads
          const emailPayloads = batch.map((contact) => {
            const inviteUrl = `${appUrl}/api/migration/invite/${contact.inviteToken}`;
            return {
              from: `${pub.name} <${emailFrom}>`,
              to: contact.email,
              subject: `${creatorName} has moved to Solscribe — your subscription continues here`,
              react: React.createElement(MigrationInvite, {
                creatorName,
                publicationName: pub.name,
                readerName: contact.name || 'Subscriber',
                inviteUrl,
                monthlyPriceUsdc: Number(pub.monthlyPriceUsdc || 0),
                publicationDescription: pub.description || '',
              }),
            };
          });

          // Send batch via Resend API
          const { error } = await resend.batch.send(emailPayloads);

          if (error) {
            console.error(`[Migration Send] Resend batch error:`, error);
            // If the whole batch fails, update status to failed and abort
            await db
              .update(migrationJobs)
              .set({ status: 'failed', updatedAt: new Date() })
              .where(eq(migrationJobs.id, jobId));
            return;
          }

          // Update contacts status to 'sent'
          const contactIds = batch.map((c) => c.id);
          await db
            .update(migrationContacts)
            .set({ status: 'sent', inviteSentAt: new Date() })
            .where(inArray(migrationContacts.id, contactIds));

          // Increment sent count in job
          await db
            .update(migrationJobs)
            .set({
              emailsSent: sql`${migrationJobs.emailsSent} + ${batch.length}`,
              updatedAt: new Date(),
            })
            .where(eq(migrationJobs.id, jobId));
        }

        // Finalize job status if it wasn't paused or halted
        const finalJob = await db.query.migrationJobs.findFirst({
          where: eq(migrationJobs.id, jobId),
        });

        if (finalJob && finalJob.status === 'processing') {
          await db
            .update(migrationJobs)
            .set({ status: 'completed', updatedAt: new Date() })
            .where(eq(migrationJobs.id, jobId));
          console.log(`[Migration Send] Job ${jobId} finished successfully.`);
        }
      } catch (loopErr) {
        console.error(`[Migration Send] Error in batch loop:`, loopErr);
        await db
          .update(migrationJobs)
          .set({ status: 'failed', updatedAt: new Date() })
          .where(eq(migrationJobs.id, jobId));
      }
    })();

    return NextResponse.json({ success: true, message: 'Migration send queue initiated.' });
  } catch (err) {
    console.error('[Migration Send POST API] Exception:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
