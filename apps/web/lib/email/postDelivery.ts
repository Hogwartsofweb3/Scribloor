import { Resend } from 'resend';
import { db, posts, publications, subscriptions, emailSends } from '@solscribe/db';
import { eq, and } from '@solscribe/db';

/**
 * sendPostToSubscribers
 *
 * Distributes a published post to all active subscribers of the publication.
 * Enforces paywalls (sends preview teaser + CTA link if paywalled; full HTML if free).
 * Utilizes Resend's Batch Send API (max 100/batch) and audits sends in database.
 */
export async function sendPostToSubscribers(postId: string): Promise<{ sent: number; failed: number }> {
  const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key');
  let sentCount = 0;
  let failedCount = 0;

  try {
    // 1. Fetch post and verify existence
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    });

    if (!post) {
      console.warn(`[postDelivery] Post with ID ${postId} not found.`);
      return { sent: 0, failed: 0 };
    }

    // 2. Fetch associated publication
    const pub = await db.query.publications.findFirst({
      where: eq(publications.id, post.publicationId),
    });

    if (!pub) {
      console.warn(`[postDelivery] Publication with ID ${post.publicationId} not found.`);
      return { sent: 0, failed: 0 };
    }

    // 3. Query all active subscribers
    const activeSubscribers = await db.query.subscriptions.findMany({
      where: and(
        eq(subscriptions.publicationId, pub.id),
        eq(subscriptions.status, 'active')
      ),
      with: {
        subscriber: true,
      },
    });

    // Filter subscribers with registered emails
    const targets = activeSubscribers.filter((s) => s.subscriber && s.subscriber.email);

    if (targets.length === 0) {
      console.log(`[postDelivery] No active email subscribers found for publication ${pub.name}.`);
      return { sent: 0, failed: 0 };
    }

    // 4. Construct the visual HTML newsletter template matching Solscribe's theme
    const postUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://solscribe.app'}/pub/${pub.slug}/${post.slug}`;
    const headerTitle = pub.name;
    const coverImageTag = post.coverImageUrl
      ? `<div style="margin-bottom: 24px;"><img src="${post.coverImageUrl}" alt="Post Cover" style="width: 100%; border-radius: 12px; border: 1px solid #27272a; max-height: 280px; object-fit: cover;" /></div>`
      : '';

    // Choose body content based on paywall status
    let contentBody = '';
    let paywallFooter = '';

    if (post.isPaywalled) {
      // Paywalled post: send teaser + premium subscriber gate CTA
      contentBody = post.previewHtml || '<p style="color: #a1a1aa; font-style: italic;">No preview content available.</p>';
      paywallFooter = `
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px; border-top: 1px solid #27272a; padding-top: 32px; text-align: center;">
          <tr>
            <td align="center">
              <div style="background: #1c1917; border: 1px solid #d97706; border-radius: 12px; padding: 24px; max-width: 440px; display: inline-block;">
                <p style="margin: 0 0 8px; font-size: 16px; font-weight: bold; color: #fafafa;">🔒 Subscriber Content Locked</p>
                <p style="margin: 0 0 16px; font-size: 13px; color: #a1a1aa; line-height: 1.6;">
                  This is a paywalled post. Support the creator by renewing or signing up for a subscription to unlock the full edition and archives.
                </p>
                <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                  <tr>
                    <td style="background: #f59e0b; border-radius: 8px;">
                      <a href="${postUrl}" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 600; color: #09090b; text-decoration: none;">
                        Unlock Full Story →
                      </a>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
        </table>
      `;
    } else {
      // Free post: send full content
      contentBody = post.contentHtml;
    }

    const emailHtmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${post.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #fafafa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #09090b; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #121214; border: 1px solid #1f1f23; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1c1917 0%, #0c0a09 100%); padding: 32px 40px; border-bottom: 1px solid #1f1f23;">
              <span style="font-size: 11px; font-weight: 700; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 8px;">
                ${headerTitle}
              </span>
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #fafafa; line-height: 1.3;">
                ${post.title}
              </h1>
              ${post.subtitle ? `<p style="margin: 8px 0 0; font-size: 14px; color: #71717a; line-height: 1.5;">${post.subtitle}</p>` : ''}
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 40px; line-height: 1.7; font-size: 15px; color: #d4d4d8;">
              ${coverImageTag}
              <div style="font-size: 15px; color: #d4d4d8;">
                ${contentBody}
              </div>
              ${paywallFooter}
            </td>
          </tr>
          <!-- Footer Branding -->
          <tr>
            <td style="padding: 24px 40px; border-top: 1px solid #1f1f23; background-color: #0a0a0c; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #52525b; line-height: 1.6;">
                You are receiving this because you subscribed to <strong style="color: #a1a1aa;">${pub.name}</strong> on Solscribe.<br/>
                Monthly USDC subscriptions settled securely and instantly on the Solana blockchain.
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

    // 5. Partition subscriber targets into chunks of 100 (Resend Batch API limit)
    const batchSize = 100;
    const batches = [];
    for (let i = 0; i < targets.length; i += batchSize) {
      batches.push(targets.slice(i, i + batchSize));
    }

    // 6. Dispatch emails in batches
    for (const batch of batches) {
      const emailPayload = batch.map((target) => ({
        from: 'Solscribe Newsletter <noreply@solscribe.app>',
        to: target.subscriber.email!,
        subject: post.title,
        html: emailHtmlTemplate,
      }));

      try {
        const response = await resend.batch.send(emailPayload);
        
        // Log individual successful dispatches
        const inserts = batch.map((target) => ({
          postId: post.id,
          recipientId: target.subscriber.id,
          sentAt: new Date(),
          status: 'sent' as const,
        }));

        await db.insert(emailSends).values(inserts);
        sentCount += batch.length;
      } catch (err) {
        console.error(`[postDelivery] Batch send failed:`, err);
        failedCount += batch.length;
      }
    }

    // 7. Mark the post as delivered
    await db
      .update(posts)
      .set({
        emailSentAt: new Date(),
      })
      .where(eq(posts.id, post.id));

    console.log(`[postDelivery] Delivery complete for post ${post.title}. Sent: ${sentCount}, Failed: ${failedCount}`);
  } catch (error) {
    console.error(`[postDelivery] Fatal delivery error:`, error);
  }

  return { sent: sentCount, failed: failedCount };
}
