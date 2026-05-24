import { Resend } from 'resend';

const FROM_EMAIL = 'Solscribe <noreply@solscribe.app>';

interface SubscriptionWelcomeEmailParams {
  subscriberEmail: string;
  publicationName: string;
  creatorName: string;
  expiresAt: Date;
}

export async function sendSubscriptionWelcomeEmail({
  subscriberEmail,
  publicationName,
  creatorName,
  expiresAt,
}: SubscriptionWelcomeEmailParams): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key');
  const expiryFormatted = expiresAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to ${publicationName}</title>
</head>
<body style="margin:0;padding:0;background:#09090b;font-family:'Inter',system-ui,sans-serif;color:#fafafa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#18181b;border:1px solid #27272a;border-radius:16px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1c1917 0%,#0c0a09 100%);padding:40px 40px 32px;border-bottom:1px solid #27272a;">
              <p style="margin:0 0 12px;font-size:13px;color:#f59e0b;letter-spacing:0.08em;font-weight:600;text-transform:uppercase;">Solscribe</p>
              <h1 style="margin:0;font-size:28px;font-weight:700;color:#fafafa;line-height:1.3;">
                You're now subscribed to<br/>
                <span style="color:#f59e0b;">${publicationName}</span>
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 24px;font-size:16px;color:#a1a1aa;line-height:1.7;">
                Your USDC payment has been confirmed on-chain. You now have full access to all subscriber-only content from <strong style="color:#fafafa;">${creatorName}</strong>.
              </p>
              <!-- Info box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;border:1px solid #27272a;border-radius:12px;margin-bottom:32px;">
                <tr>
                  <td style="padding:24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #27272a;">
                          <span style="font-size:13px;color:#71717a;">Publication</span>
                        </td>
                        <td style="padding:8px 0;border-bottom:1px solid #27272a;text-align:right;">
                          <span style="font-size:13px;color:#fafafa;font-weight:600;">${publicationName}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #27272a;">
                          <span style="font-size:13px;color:#71717a;">Creator</span>
                        </td>
                        <td style="padding:8px 0;border-bottom:1px solid #27272a;text-align:right;">
                          <span style="font-size:13px;color:#fafafa;font-weight:600;">${creatorName}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0 0;">
                          <span style="font-size:13px;color:#71717a;">Access expires</span>
                        </td>
                        <td style="padding:8px 0 0;text-align:right;">
                          <span style="font-size:13px;color:#f59e0b;font-weight:600;">${expiryFormatted}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#f59e0b;border-radius:8px;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://solscribe.app'}/dashboard"
                       style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#09090b;text-decoration:none;">
                      Go to Dashboard →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #27272a;">
              <p style="margin:0;font-size:12px;color:#52525b;line-height:1.6;">
                This payment was settled on the Solana blockchain. Solscribe never stores your wallet keys.
                If you have any questions, reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: subscriberEmail,
    subject: `You're subscribed to ${publicationName} ✅`,
    html,
  });
}

export async function sendSubscriptionReminderEmail({
  subscriberEmail,
  publicationName,
  creatorName,
  expiresAt,
}: SubscriptionWelcomeEmailParams): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key');
  const expiryFormatted = expiresAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your subscription to ${publicationName} is expiring</title>
</head>
<body style="margin:0;padding:0;background:#09090b;font-family:'Inter',system-ui,sans-serif;color:#fafafa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#18181b;border:1px solid #27272a;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#1c1917 0%,#0c0a09 100%);padding:40px 40px 32px;border-bottom:1px solid #27272a;">
              <p style="margin:0 0 12px;font-size:13px;color:#f59e0b;letter-spacing:0.08em;font-weight:600;text-transform:uppercase;">Solscribe</p>
              <h1 style="margin:0;font-size:28px;font-weight:700;color:#fafafa;line-height:1.3;">
                Your subscription is<br/>
                <span style="color:#f59e0b;">expiring soon</span>
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 24px;font-size:16px;color:#a1a1aa;line-height:1.7;">
                Your subscription to <strong style="color:#fafafa;">${publicationName}</strong> expires on ${expiryFormatted}. Renew now to maintain uninterrupted access to subscriber-only content from ${creatorName}.
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#f59e0b;border-radius:8px;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://solscribe.app'}/dashboard"
                       style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#09090b;text-decoration:none;">
                      Renew Subscription →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #27272a;">
              <p style="margin:0;font-size:12px;color:#52525b;line-height:1.6;">
                If you choose not to renew, your access will be automatically removed.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: subscriberEmail,
    subject: `Your subscription to ${publicationName} expires soon`,
    html,
  });
}
