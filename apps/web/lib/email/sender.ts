import { Resend } from 'resend';
import type { ReactElement } from 'react';
import { db, suppressions } from '@solscribe/db';
import { eq } from '@solscribe/db';

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key');
const FROM_EMAIL = process.env.EMAIL_FROM ?? 'Solscribe <noreply@solscribe.app>';

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react?: ReactElement;
  html?: string;
  tags?: { name: string; value: string }[];
}

/**
 * Returns true if the recipient email is in our suppression list
 * (bounced, complained, or unsubscribed). Suppressed addresses are
 * silently skipped to protect deliverability reputation.
 */
async function isSuppressed(email: string): Promise<boolean> {
  try {
    const row = await db.query.suppressions.findFirst({
      where: eq(suppressions.email, email.toLowerCase().trim()),
    });
    return !!row;
  } catch (err) {
    // If we can't query, fail open (allow send) to avoid blocking all email
    console.warn('[sendEmail] Suppression check failed — allowing send:', err);
    return false;
  }
}

/**
 * Sends an email via Resend with 3-attempt exponential-backoff retry.
 * Automatically skips suppressed addresses.
 */
export async function sendEmail(
  options: SendEmailOptions
): Promise<{ id: string } | { error: string } | { skipped: true }> {
  const recipient = Array.isArray(options.to) ? options.to[0] : options.to;

  // Suppression guard — don't send to bounced/complained addresses
  if (recipient && await isSuppressed(recipient)) {
    console.log(`[sendEmail] Skipping suppressed address: ${recipient}`);
    return { skipped: true };
  }

  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        ...(options.react ? { react: options.react } : {}),
        ...(options.html ? { html: options.html } : {}),
        tags: options.tags,
      });

      if (error) {
        throw new Error(error.message ?? 'Resend API error');
      }

      return { id: data?.id ?? 'sent' };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      const isLast = attempt === maxAttempts;

      if (isLast) {
        console.error(
          `[sendEmail] All ${maxAttempts} attempts failed for "${options.subject}":`,
          errorMessage
        );
        return { error: errorMessage };
      }

      // Exponential backoff: 500ms, 1000ms, 2000ms
      const delayMs = Math.pow(2, attempt - 1) * 500;
      console.warn(
        `[sendEmail] Attempt ${attempt}/${maxAttempts} failed. Retrying in ${delayMs}ms…`,
        errorMessage
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return { error: 'Max retry attempts exceeded' };
}
