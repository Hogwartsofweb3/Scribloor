import { db, users } from '@solscribe/db';
import { eq } from '@solscribe/db';

export type OnboardingStep =
  | 'profile_created'
  | 'wallet_connected'
  | 'publication_created'
  | 'first_post_published'
  | 'first_subscriber';

export interface OnboardingProgress {
  steps: OnboardingStep[];
  completedCount: number;
  totalCount: number;
  isComplete: boolean;
}

export async function getOnboardingProgress(userId: string): Promise<OnboardingProgress> {
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  const steps = (dbUser?.onboardingSteps as OnboardingStep[]) || [];
  const totalCount = 5;

  return {
    steps,
    completedCount: steps.length,
    totalCount,
    isComplete: steps.length === totalCount,
  };
}

export async function trackOnboardingStep(userId: string, step: OnboardingStep): Promise<void> {
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!dbUser) return;

  const currentSteps = (dbUser.onboardingSteps as OnboardingStep[]) || [];

  if (!currentSteps.includes(step)) {
    const newSteps = [...currentSteps, step];
    
    // Automatically flag hasCompletedOnboarding if they finished the first 3 critical onboarding steps
    const hasCompletedCore =
      newSteps.includes('profile_created') &&
      newSteps.includes('wallet_connected') &&
      newSteps.includes('publication_created');

    await db
      .update(users)
      .set({
        onboardingSteps: newSteps,
        ...(hasCompletedCore ? { hasCompletedOnboarding: true } : {}),
      })
      .where(eq(users.id, userId));
  }
}
