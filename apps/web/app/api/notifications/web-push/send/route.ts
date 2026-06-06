import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db, pushSubscriptions, eq } from '@solscribe/db';
import webpush from 'web-push';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const internalSecret = req.headers.get('x-internal-secret');
  const expectedSecret = process.env.INTERNAL_API_SECRET;

  if (!expectedSecret || internalSecret !== expectedSecret) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { userId, title, body: messageBody, url } = body;

    if (!userId || !title || !messageBody) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Fetch user's web push registrations
    const userSubs = await db.query.pushSubscriptions.findMany({
      where: eq(pushSubscriptions.userId, userId),
    });

    if (userSubs.length === 0) {
      return NextResponse.json({ success: true, message: 'No active push subscriptions found for user' });
    }

    // 2. Set VAPID credentials
    const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@solscribe.app';
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';

    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json({ error: 'VAPID credentials not configured on server' }, { status: 500 });
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    const payload = JSON.stringify({
      title,
      body: messageBody,
      url: url || '/',
    });

    const sendPromises = userSubs.map(async (sub) => {
      const pushSub = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(pushSub, payload);
      } catch (err: any) {
        console.warn(`[Web Push Send] Failed sending to sub endpoint: ${sub.endpoint}. Error code: ${err.statusCode}`);
        // Cleanup expired (410) or invalid (404) registrations
        if (err.statusCode === 410 || err.statusCode === 404) {
          await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
          console.log(`[Web Push Cleanup] Deleted stale subscription registration id: ${sub.id}`);
        }
      }
    });

    await Promise.all(sendPromises);

    return NextResponse.json({ success: true, message: `Dispatched push alerts to ${userSubs.length} device(s)` });
  } catch (error: any) {
    console.error('[Web Push API] Push dispatch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
