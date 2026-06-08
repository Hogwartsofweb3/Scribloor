/**
 * Shared type for the dashboard stats API response.
 * Used by components that read from the 'dashboard-stats' React Query cache.
 */

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  netRevenue?: number;
}

export interface SubscriberGrowthPoint {
  date: string;
  count: number;
}

export interface RevenueStats {
  thisMonth: number;
  lastMonth: number;
  total?: number;
  [key: string]: unknown;
}

export interface SubscribersStats {
  total: number;
  newThisMonth: number;
  [key: string]: unknown;
}

export interface PostsStats {
  published: number;
  drafts?: number;
  [key: string]: unknown;
}

export interface EmailStats {
  openRate: number;
  sent?: number;
  [key: string]: unknown;
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  [key: string]: unknown;
}

export interface TopPost {
  id: string;
  title: string;
  views?: number;
  [key: string]: unknown;
}

export interface SubscriberListItem {
  id: string;
  wallet: string;
  displayName: string | null;
  username: string | null;
  startedAt: string;
  expiresAt: string;
  status: string;
  totalPaid: number;
}

export interface DashboardStats {
  // Revenue
  revenue?: RevenueStats;
  revenueTimeline?: RevenueDataPoint[];

  // Subscribers
  subscribers?: SubscribersStats;
  subscriberGrowth?: SubscriberGrowthPoint[];
  subscribersList?: SubscriberListItem[];

  // Content
  posts?: PostsStats;
  emailStats?: EmailStats;

  // Activity
  recentActivity?: RecentActivity[];
  topPosts?: TopPost[];

  // Misc
  noPublication?: boolean;

  // Currency conversion
  exchangeRate?: {
    currency: string;
    rate: number;
    symbol?: string;
    updatedAt?: number;
  };

  // Index signature for any other fields returned by the API
  [key: string]: unknown;
}
