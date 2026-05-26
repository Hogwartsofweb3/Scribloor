import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { calculateMonthlyDistributions } from '@/lib/vault/revenue';
import { Resend } from 'resend';
import { db, users } from '@solscribe/db';
import { eq } from '@solscribe/db';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Calculate distributions for the previous month
    const now = new Date();
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    console.log(`[Vault Cron] Calculating distributions for ${previousMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}`);

    const distributions = await calculateMonthlyDistributions(previousMonth);

    if (distributions.length === 0) {
      console.log('[Vault Cron] No distributions to process this month.');
      return NextResponse.json({ success: true, processed: 0, message: 'No Vault Pass accesses recorded this month.' });
    }

    // Send email notifications to each author about their earnings
    let emailsSent = 0;
    for (const dist of distributions) {
      try {
        const author = await db.query.users.findFirst({
          where: eq(users.id, dist.authorId),
        });

        if (author?.email) {
          const monthLabel = previousMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
          await resend.emails.send({
            from: process.env.EMAIL_FROM || 'noreply@solscribe.xyz',
            to: author.email,
            subject: `📊 Your Vault earnings for ${monthLabel}`,
            html: `
              <h2>Your Vault Earnings — ${monthLabel}</h2>
              <p>Hi ${author.displayName || author.username},</p>
              <p>Here's your Vault Pass revenue summary for last month:</p>
              <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #333;"><strong>Your Accesses</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #333;">${dist.accessCount} reads</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #333;"><strong>Total Vault Pass Pool</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #333;">${parseFloat(dist.totalPoolUsdc).toFixed(2)} USDC</td>
                </tr>
                <tr>
                  <td style="padding: 8px;"><strong>Your Earnings (85% share)</strong></td>
                  <td style="padding: 8px; font-size: 1.2em; font-weight: bold; color: #6366f1;">${parseFloat(dist.authorShareUsdc).toFixed(4)} USDC</td>
                </tr>
              </table>
              <p style="color: #888; font-size: 0.9em;">
                Payments are distributed manually via Multisig by the Solscribe team within 3-5 business days.
                Your earnings will be sent to your connected wallet address.
              </p>
              <p>Thank you for contributing to The Vault!</p>
            `,
          });
          emailsSent++;
        }
      } catch (emailErr) {
        console.error(`[Vault Cron] Failed to send email to author ${dist.authorId}:`, emailErr);
      }
    }

    console.log(`[Vault Cron] Processed ${distributions.length} distributions. Sent ${emailsSent} emails.`);

    return NextResponse.json({
      success: true,
      processed: distributions.length,
      emailsSent,
      totalAuthorShareUsdc: distributions.reduce((sum, d) => sum + parseFloat(d.authorShareUsdc), 0).toFixed(4),
    });
  } catch (error) {
    console.error('[Vault Distributions Cron Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
