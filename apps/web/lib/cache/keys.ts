export const CACHE_TTL = {
  PUBLICATION: 300, // 5 min
  POST: 60, // 1 min
  SUBSCRIPTION: 300, // 5 min
  NFT: 600, // 10 min
  DASHBOARD: 120, // 2 min
  EXPLORE: 120, // 2 min
} as const;

export const cacheKeys = {
  publication: (slug: string) => `publication:${slug}`,
  post: (pubSlug: string, postSlug: string) => `post:${pubSlug}:${postSlug}`,
  subscription: (userId: string, pubId: string) => `subscription:${userId}:${pubId}`,
  nft: (wallet: string, collection: string) => `nft:${wallet}:${collection}`,
  dashboard: (userId: string) => `dashboard:${userId}:stats`,
  explore: (page: number) => `explore:feed:${page}`,
};
