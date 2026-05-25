import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/lib/redis';

// Define different rate limiters
const limiters = {
  subscribe: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '1 h'), prefix: 'ratelimit:subscribe' }),
  apiGeneral: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(100, '1 m'), prefix: 'ratelimit:api' }),
  webhookHelius: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(1000, '1 m'), prefix: 'ratelimit:webhook' }),
  emailSend: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '1 h'), prefix: 'ratelimit:email' }),
};

type RateLimitType = keyof typeof limiters;

export async function applyRateLimit(identifier: string, type: RateLimitType): Promise<{ success: boolean; remaining: number }> {
  try {
    const { success, remaining } = await limiters[type].limit(identifier);
    return { success, remaining };
  } catch (error) {
    console.error(`[RateLimit] Error applying rate limit for ${type}:`, error);
    return { success: true, remaining: 1 }; // Fail open
  }
}
