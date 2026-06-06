import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerUser } from '@/lib/auth/privy';
import { db, users } from '@solscribe/db';
import { eq } from '@solscribe/db';
import { getOnboardingProgress, trackOnboardingStep } from '@/lib/onboarding/progress';
import type { OnboardingStep } from '@/lib/onboarding/progress';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onboarding/progress
 * Returns the current user's onboarding progress.
 */
export async function GET(request: NextRequest) {
  try {
    const privyUser = await getServerUser(request);
    if (!privyUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.privyId, privyUser.id),
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found in DB' }, { status: 404 });
    }

    const progress = await getOnboardingProgress(dbUser.id);
    return NextResponse.json(progress);
  } catch (error) {
    console.error('Onboarding progress fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/onboarding/progress
 * Adds a step to the user's completed onboarding checklist.
 */
export async function POST(request: NextRequest) {
  try {
    const privyUser = await getServerUser(request);
    if (!privyUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.privyId, privyUser.id),
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found in DB' }, { status: 404 });
    }

    const body = await request.json();
    const { step } = body as { step: OnboardingStep };

    if (!step) {
      return NextResponse.json({ error: 'Step is required' }, { status: 400 });
    }

    await trackOnboardingStep(dbUser.id, step);
    const progress = await getOnboardingProgress(dbUser.id);
    return NextResponse.json(progress);
  } catch (error) {
    console.error('Onboarding progress track error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
