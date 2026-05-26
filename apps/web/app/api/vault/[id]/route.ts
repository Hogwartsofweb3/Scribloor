import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db, vaultEntries, users } from '@solscribe/db';
import { eq } from '@solscribe/db';
import { getServerDbUser } from '@/lib/auth/privy';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getServerDbUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { status, rejectionReason } = body;

    if (!['published', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be "published" or "rejected"' }, { status: 400 });
    }

    if (status === 'rejected' && !rejectionReason) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
    }

    // Get the entry to find the author
    const entry = await db.query.vaultEntries.findFirst({
      where: eq(vaultEntries.id, params.id),
    });

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    const updateData: any = {
      status,
      rejectionReason: rejectionReason || null,
      updatedAt: new Date(),
    };

    if (status === 'published') {
      updateData.publishedAt = new Date();
    }

    await db.update(vaultEntries)
      .set(updateData)
      .where(eq(vaultEntries.id, params.id));

    // Notify the author
    const author = await db.query.users.findFirst({
      where: eq(users.id, entry.authorId),
    });

    if (author?.email) {
      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'noreply@solscribe.xyz',
          to: author.email,
          subject: status === 'published'
            ? `✅ Your Vault entry "${entry.title}" is now live!`
            : `Your Vault entry "${entry.title}" requires changes`,
          html: status === 'published'
            ? `<h2>Your research is now live in The Vault!</h2><p>Readers can now access "${entry.title}".</p>`
            : `<h2>Your submission needs revision</h2><p><strong>Reason:</strong> ${rejectionReason}</p><p>Please update your submission and resubmit.</p>`,
        });
      } catch (emailErr) {
        console.error('[Vault Review] Author notification email failed:', emailErr);
      }
    }

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error('[Vault Review API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
