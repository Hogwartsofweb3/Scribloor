import { NextRequest, NextResponse } from 'next/server';
import { db, suppressions, emailSends } from '@solscribe/db';
import { eq } from '@solscribe/db';
import { createHmac, timingSafeEqual } from 'crypto';

// ─── Resend webhook event shape ──────────────────────────────────────────────

type ResendEventType =
  | 'email.bounced'
  | 'email.complained'
  | 'email.delivery_delayed'
  | 'email.sent'
  | 'email.delivered';

interface ResendEvent {
  type: ResendEventType;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject?: string;
    bounce?: { message: string };
    complaint?: { feedback_type: string };
  };
}

// ─── SVIX-compatible signature verification ───────────────────────────────────

function verifyResendSignature(request: NextRequest, rawBody: string): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('[resend-webhook] RESEND_WEBHOOK_SECRET not set — skipping verification');
    return process.env.NODE_ENV !== 'production';
  }

  const svixId = request.headers.get('svix-id') ?? '';
  const svixTimestamp = request.headers.get('svix-timestamp') ?? '';
  const svixSignature = request.headers.get('svix-signature') ?? '';

  if (!svixId || !svixTimestamp || !svixSignature) return false;

  // Validate timestamp is within 5 minutes to prevent replay attacks
  const timestampMs = parseInt(svixTimestamp, 10) * 1000;
  if (Math.abs(Date.now() - timestampMs) > 5 * 60 * 1000) return false;

  const toSign = `${svixId}.${svixTimestamp}.${rawBody}`;
  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const expected = createHmac('sha256', secretBytes).update(toSign).digest('base64');

  // svix-signature may be comma-separated list of "v1,<base64>" pairs
  const signatures = svixSignature.split(' ');
  return signatures.some((sig) => {
    const parts = sig.split(',');
    if (parts.length < 2) return false;
    const receivedB64 = parts.slice(1).join(',');
    try {
      return timingSafeEqual(Buffer.from(expected), Buffer.from(receivedB64));
    } catch {
      return false;
    }
  });
}

// ─── Suppression reason mapping ───────────────────────────────────────────────

type SuppressionReason = 'bounce' | 'complaint' | 'unsubscribe';

function eventToSuppressionReason(type: ResendEventType): SuppressionReason | null {
  switch (type) {
    case 'email.bounced':
      return 'bounce';
    case 'email.complained':
      return 'complaint';
    default:
      return null;
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: 'Failed to read body' }, { status: 400 });
  }

  // 1. Verify signature
  if (!verifyResendSignature(request, rawBody)) {
    console.warn('[resend-webhook] Signature verification failed');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse event
  let event: ResendEvent;
  try {
    event = JSON.parse(rawBody) as ResendEvent;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { type, data } = event;
  const recipientEmail = data.to?.[0] ?? '';
  const resendEmailId = data.email_id;

  console.log(`[resend-webhook] Received event: ${type} for ${recipientEmail}`);

  // 3. Handle delivery-delay — just log, no suppression needed
  if (type === 'email.delivery_delayed') {
    console.warn(`[resend-webhook] Delivery delayed for ${recipientEmail} (email_id: ${resendEmailId})`);
    return NextResponse.json({ received: true });
  }

  // 4. Handle bounce and complaint — suppress the address
  const reason = eventToSuppressionReason(type);
  if (reason && recipientEmail) {
    try {
      await db
        .insert(suppressions)
        .values({
          email: recipientEmail.toLowerCase().trim(),
          reason,
          resendEventId: resendEmailId,
          suppressedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: suppressions.email,
          set: {
            reason,
            resendEventId: resendEmailId,
            suppressedAt: new Date(),
          },
        });

      console.log(`[resend-webhook] Suppressed ${recipientEmail} — reason: ${reason}`);
    } catch (err) {
      console.error('[resend-webhook] Failed to upsert suppression:', err);
      // Return 200 so Resend does not keep retrying for a DB write failure
      return NextResponse.json({ received: true, warning: 'suppression write failed' });
    }

    // Also mark the email_sends row if we can find it
    if (resendEmailId) {
      try {
        const emailSendStatus = type === 'email.bounced' ? 'bounced' : 'complained';
        await db
          .update(emailSends)
          .set({ status: emailSendStatus as 'bounced' | 'complained' })
          .where(eq(emailSends.resendEmailId, resendEmailId));
      } catch (err) {
        console.warn('[resend-webhook] Could not update email_sends row:', err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
