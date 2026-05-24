import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db, publications } from '@solscribe/db';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * GET /api/publications/check-slug?slug=xxx
 *
 * Verifies if a publication slug is available, returning suggestions if taken.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawSlug = searchParams.get('slug');

    if (!rawSlug) {
      return NextResponse.json({ available: false, error: 'Slug query parameter is required.' }, { status: 400 });
    }

    // Normalize slug to lowercase, trimming whitespaces
    const slug = rawSlug.trim().toLowerCase();

    // Validate slug regex format (3 to 50 lowercase alphanumeric characters and hyphens)
    const slugRegex = /^[a-z0-9-]+$/;
    if (slug.length < 3 || slug.length > 50 || !slugRegex.test(slug)) {
      return NextResponse.json({
        available: false,
        error: 'Slug must be 3-50 characters containing only lowercase alphanumeric characters and hyphens.',
      }, { status: 400 });
    }

    // Query DB for exact conflict
    const existing = await db.query.publications.findFirst({
      where: eq(publications.slug, slug),
    });

    if (!existing) {
      return NextResponse.json({ available: true, slug });
    }

    // If taken, calculate a sequential suggestion
    let suggestion = '';
    let counter = 1;
    let isSuggestedAvailable = false;

    // Search sequentially up to 20 attempts to find an open suggestion
    while (!isSuggestedAvailable && counter <= 20) {
      const candidate = `${slug}-${counter}`;
      const conflict = await db.query.publications.findFirst({
        where: eq(publications.slug, candidate),
      });

      if (!conflict) {
        suggestion = candidate;
        isSuggestedAvailable = true;
      }
      counter++;
    }

    // Fallback if counter exceeded
    if (!suggestion) {
      suggestion = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    return NextResponse.json({
      available: false,
      slug,
      suggestion,
    });
  } catch (error) {
    console.error('Error checking slug availability:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
