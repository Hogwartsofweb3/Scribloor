import { db, premiumUpgradePrompts, premiumSubscriptions, users } from '@solscribe/db';
import { eq, and, desc } from '@solscribe/db';
import type { MilestoneType } from '@/lib/milestones/check';

// ─── Trigger → milestone mapping ──────────────────────────────────────────────

/**
 * Maps a milestone type to the upgrade trigger label stored in the DB.
 * Only certain milestones are considered meaningful upgrade moments.
 */
export type UpgradeTrigger =
  | 'milestone_100_subscribers'
  | 'milestone_1k_subscribers'
  | 'milestone_1k_revenue'
  | 'milestone_10k_revenue'
  | 'manual_settings_click';

const MILESTONE_TO_TRIGGER: Partial<Record<MilestoneType, UpgradeTrigger>> = {
  subscribers_100: 'milestone_100_subscribers',
  subscribers_1k: 'milestone_1k_subscribers',
  usdc_1k: 'milestone_1k_revenue',
  usdc_10k: 'milestone_10k_revenue',
};

// ─── Upgrade prompt titles/descriptions per trigger ───────────────────────────

export interface UpgradePromptContent {
  title: string;
  body: string;
  badge: string;
  ctaLabel: string;
}

const PROMPT_CONTENT: Record<UpgradeTrigger, UpgradePromptContent> = {
  milestone_100_subscribers: {
    badge: '🚀 100 Subscribers!',
    title: "You've crossed 100 subscribers!",
    body: "You're growing fast. Unlock Solscribe Pro to publish with a custom domain, get advanced analytics, and remove the platform branding.",
    ctaLabel: 'Upgrade to Pro →',
  },
  milestone_1k_subscribers: {
    badge: '🎉 1,000 Subscribers!',
    title: "1,000 subscribers — you're a real creator now.",
    body: "Level up with Pro: custom domain, priority support, advanced reader analytics, and NFT-gating for exclusive drops.",
    ctaLabel: 'Upgrade to Pro →',
  },
  milestone_1k_revenue: {
    badge: '💰 $1,000 Revenue!',
    title: "You've earned $1,000 USDC!",
    body: "Protect your earnings with Pro. Get reduced platform fees, a custom sending domain, and verified creator badge.",
    ctaLabel: 'Unlock Lower Fees →',
  },
  milestone_10k_revenue: {
    badge: '🏆 $10,000 Revenue!',
    title: "You've earned $10,000 USDC. Serious business.",
    body: "Time for Pro. Priority support, white-label emails, advanced analytics, and a dedicated account manager.",
    ctaLabel: 'Go Pro Today →',
  },
  manual_settings_click: {
    badge: '✨ Go Pro',
    title: 'Unlock Solscribe Pro',
    body: "Custom domain, lower platform fees, advanced analytics, NFT gating, and your own branded sending domain — all in one upgrade.",
    ctaLabel: 'Upgrade to Pro →',
  },
};

export function getUpgradePromptContent(trigger: UpgradeTrigger): UpgradePromptContent {
  return PROMPT_CONTENT[trigger];
}

// ─── Check if user has already been shown a prompt for this trigger ────────────

export async function hasShownUpgradePrompt(
  userId: string,
  trigger: UpgradeTrigger
): Promise<boolean> {
  const existing = await db.query.premiumUpgradePrompts.findFirst({
    where: and(
      eq(premiumUpgradePrompts.userId, userId),
      eq(premiumUpgradePrompts.trigger, trigger)
    ),
  });
  return !!existing;
}

// ─── Record a shown upgrade prompt ────────────────────────────────────────────

export async function recordUpgradePrompt(
  userId: string,
  trigger: UpgradeTrigger
): Promise<void> {
  try {
    await db
      .insert(premiumUpgradePrompts)
      .values({ userId, trigger, shownAt: new Date() })
      .onConflictDoNothing();
  } catch (err) {
    console.error('[upgradePrompts] Failed to record prompt:', err);
  }
}

// ─── Check milestones and return pending upgrade triggers ────────────────────

/**
 * Given a list of newly-awarded milestones, filters them down to those
 * that should trigger an upgrade prompt that the user has NOT yet seen.
 */
export async function getPendingUpgradeTriggers(
  userId: string,
  newMilestones: MilestoneType[]
): Promise<UpgradeTrigger[]> {
  const triggers: UpgradeTrigger[] = [];

  for (const milestone of newMilestones) {
    const trigger = MILESTONE_TO_TRIGGER[milestone];
    if (!trigger) continue;

    const alreadyShown = await hasShownUpgradePrompt(userId, trigger);
    if (!alreadyShown) {
      triggers.push(trigger);
    }
  }

  return triggers;
}

// ─── Check if the user is currently a premium subscriber ─────────────────────

export async function isUserPremium(userId: string): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  return user?.isPremium ?? false;
}

// ─── Get the user's active premium subscription ───────────────────────────────

export async function getActivePremiumSubscription(userId: string) {
  return db.query.premiumSubscriptions.findFirst({
    where: and(
      eq(premiumSubscriptions.userId, userId),
      eq(premiumSubscriptions.status, 'active')
    ),
    orderBy: desc(premiumSubscriptions.activatedAt),
  });
}
