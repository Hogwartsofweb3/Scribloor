import { Resend } from 'resend';
import type { ReactElement } from 'react';

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key');
const FROM_EMAIL = 'Solscribe <noreply@solscribe.app>';

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: ReactElement;
  tags?: { name: string; value: string }[];
}

/**
 * Sends an email via Resend with 3-attempt exponential-backoff retry.
 */
export async function sendEmail(
  options: SendEmailOptions
): Promise<{ id: string } | { error: string }> {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        react: options.react,
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
