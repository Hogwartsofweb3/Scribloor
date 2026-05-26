import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db, subscriptions, publications } from '@solscribe/db';
import { eq, and, lt, gt, lte, sql } from '@solscribe/db';
import { sendSubscriptionReminderEmail } from '@/lib/email/subscription';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/subscription-reminders
 *
 * Designed to be called daily by Vercel Cron.
 * 1. Finds active subscriptions expiring in exactly <= 3 days and sends reminders.
 *    (Uses a flag or window to avoid duplicate emails).
 * 2. Finds active subscriptions that have already expired, marks them as 'expired',
 *    and decrements the publication subscriber count.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const expectedSecret = process.env.CRON_SECRET;

  if (
    process.env.NODE_ENV === 'production' &&
    (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`)
  ) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // ── 1. Handle Expirations ──────────────────────────────────────────────
    // Find all active subscriptions where expiresAt < now
    const expiredSubs = await db.query.subscriptions.findMany({
      where: and(
        eq(subscriptions.status, 'active'),
        lt(subscriptions.expiresAt, now)
      ),
      with: { publication: true },
    });

    if (expiredSubs.length > 0) {
      await db.transaction(async (tx) => {
        // Mark them as expired
        const expiredIds = expiredSubs.map((s) => s.id);
        
        // chunk the update if there are many, but for now we do it directly
        // Note: Drizzle ORM array `inArray` can be used, but updating individually allows
        // proper tracking. Let's do a bulk update.
        await tx
          .update(subscriptions)
          .set({ status: 'expired' })
          .where(sql`${subscriptions.id} IN ${expiredIds}`);

        // Decrement subscriber counts safely
        // To avoid deadlocks/race conditions, we iterate the unique publications
        const pubIds = Array.from(new Set(expiredSubs.map((s) => s.publicationId)));
        
        for (const pubId of pubIds) {
          const expiredCountForPub = expiredSubs.filter(s => s.publicationId === pubId).length;
          
          await tx
            .update(publications)
            .set({
              subscriberCount: sql`GREATEST(0, ${publications.subscriberCount} - ${expiredCountForPub})`,
            })
            .where(eq(publications.id, pubId));
        }
      });
      
      console.log(`Expired ${expiredSubs.length} subscriptions`);
    }

    // ── 2. Handle Reminders ────────────────────────────────────────────────
    // We want to notify users expiring between now and 3 days from now.
    // In a full production app, you'd add a `reminderSentAt` column to avoid spamming.
    // For this implementation, we will query them but assume idempotency is handled
    // externally or we only process the 3-day exact window. Let's find those 
    // expiring between 2.5 and 3 days from now to hit them once daily.
    
    const twoAndHalfDaysFromNow = new Date(now.getTime() + 2.5 * 24 * 60 * 60 * 1000);

    const expiringSubs = await db.query.subscriptions.findMany({
      where: and(
        eq(subscriptions.status, 'active'),
        gt(subscriptions.expiresAt, twoAndHalfDaysFromNow),
        lte(subscriptions.expiresAt, threeDaysFromNow)
      ),
      with: {
        publication: true,
        subscriber: true,
      },
    });

    for (const sub of expiringSubs) {
      if (sub.subscriber.email) {
        try {
          await sendSubscriptionReminderEmail({
            subscriberEmail: sub.subscriber.email,
            publicationName: sub.publication.name,
            creatorName: sub.publication.name, // Simplified: use pub name
            expiresAt: sub.expiresAt,
          });
        } catch (error) {
          console.error(`Failed to send reminder for sub ${sub.id}:`, error);
        }
      }
    }

    console.log(`Sent ${expiringSubs.length} reminders`);

    return NextResponse.json({
      success: true,
      expired: expiredSubs.length,
      remindersSent: expiringSubs.length,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
