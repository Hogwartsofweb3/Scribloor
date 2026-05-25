import { cache } from './redis';

export async function invalidatePublication(slug: string) {
  await cache.invalidatePattern(`publication:${slug}`);
  // Also invalidate posts within this publication
  await cache.invalidatePattern(`post:${slug}:*`);
}

export async function invalidatePost(pubSlug: string, postSlug: string) {
  await cache.invalidatePattern(`post:${pubSlug}:${postSlug}`);
}

export async function invalidateSubscription(userId: string, pubId: string) {
  await cache.invalidatePattern(`subscription:${userId}:${pubId}`);
}

export async function invalidateCreatorDashboard(userId: string) {
  await cache.invalidatePattern(`dashboard:${userId}:*`);
}
