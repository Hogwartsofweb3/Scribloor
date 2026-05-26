import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db, vaultEntries } from '@solscribe/db';
import { getServerDbUser } from '@/lib/auth/privy';
import { Resend } from 'resend';
import { slugify } from '@/lib/utils';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

export async function POST(request: NextRequest) {
  try {
    const user = await getServerDbUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'creator' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Only creators can submit Vault entries' }, { status: 403 });
    }

    const body = await request.json();
    const { title, abstract, contentHtml, category, tags, singleAccessPriceUsdc, coverImageUrl } = body;

    if (!title || !abstract || !contentHtml || !category) {
      return NextResponse.json({ error: 'Title, abstract, content, and category are required' }, { status: 400 });
    }

    if (singleAccessPriceUsdc < 0.50 || singleAccessPriceUsdc > 50) {
      return NextResponse.json({ error: 'Price must be between 0.50 and 50 USDC' }, { status: 400 });
    }

    // Calculate word count and read time
    const wordCount = contentHtml.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
    const readTimeMinutes = Math.ceil(wordCount / 200);

    // Generate a unique slug
    const baseSlug = slugify(title);
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const entry = await db.insert(vaultEntries).values({
      authorId: user.id,
      title,
      slug,
      abstract,
      contentHtml,
      category,
      tags: tags || [],
      singleAccessPriceUsdc: singleAccessPriceUsdc.toString(),
      coverImageUrl: coverImageUrl || null,
      wordCount,
      readTimeMinutes,
      status: 'pending_review',
    }).returning();

    // Notify admin via email
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'noreply@solscribe.xyz',
        to: process.env.ADMIN_EMAIL || 'admin@solscribe.xyz',
        subject: `[Vault Review] New submission: "${title}"`,
        html: `
          <h2>New Vault Entry Submitted</h2>
          <p><strong>Title:</strong> ${title}</p>
          <p><strong>Author:</strong> ${user.displayName || user.username} (${user.email})</p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Price:</strong> ${singleAccessPriceUsdc} USDC</p>
          <p><strong>Abstract:</strong> ${abstract}</p>
          <p>Review this entry via the admin dashboard.</p>
        `,
      });
    } catch (emailErr) {
      console.error('[Vault Submit] Admin email failed (non-blocking):', emailErr);
    }

    return NextResponse.json({ success: true, entryId: entry[0].id, slug: entry[0].slug });
  } catch (error) {
    console.error('[Vault Submit API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
