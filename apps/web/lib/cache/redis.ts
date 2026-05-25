import { redis } from '@/lib/redis';

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      return await redis.get<T>(key);
    } catch (error) {
      console.error(`[Cache] Error getting key ${key}:`, error);
      return null;
    }
  },

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    try {
      await redis.set(key, value, { ex: ttlSeconds });
    } catch (error) {
      console.error(`[Cache] Error setting key ${key}:`, error);
    }
  },

  async del(key: string | string[]): Promise<void> {
    try {
      if (Array.isArray(key) && key.length > 0) {
        await redis.del(...key);
      } else if (typeof key === 'string') {
        await redis.del(key);
      }
    } catch (error) {
      console.error(`[Cache] Error deleting key(s):`, error);
    }
  },

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      let cursor: number | string = 0;
      do {
        const [nextCursor, keys] = (await redis.scan(cursor as any, { match: pattern, count: 100 })) as [number | string, string[]];
        cursor = nextCursor;
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } while (cursor !== 0 && cursor !== '0');
    } catch (error) {
      console.error(`[Cache] Error invalidating pattern ${pattern}:`, error);
    }
  }
};
