import { relations } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  boolean,
  numeric,
  integer,
  uniqueIndex,
  index,
  unique,
} from 'drizzle-orm/pg-core';

// Enums
export const roleEnum = pgEnum('role', ['reader', 'creator', 'admin']);
export const postStatusEnum = pgEnum('post_status', ['draft', 'published', 'scheduled']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['pending', 'active', 'expired', 'cancelled']);
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'confirmed', 'failed']);
export const emailStatusEnum = pgEnum('email_status', ['sent', 'bounced', 'opened']);
export const vaultCategoryEnum = pgEnum('vault_category', ['research', 'report', 'analysis', 'guide', 'data', 'essay']);
export const vaultEntryStatusEnum = pgEnum('vault_entry_status', ['draft', 'pending_review', 'published', 'rejected']);
export const vaultAccessTypeEnum = pgEnum('vault_access_type', ['single_purchase', 'vault_pass']);
export const vaultPassStatusEnum = pgEnum('vault_pass_status', ['pending', 'active', 'expired', 'cancelled']);
export const vaultRevenueStatusEnum = pgEnum('vault_revenue_status', ['pending', 'paid']);

// Tables
export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    privyId: text('privy_id').notNull().unique(),
    walletAddress: text('wallet_address').unique(),
    email: text('email').unique(),
    username: text('username').notNull().unique(),
    displayName: text('display_name'),
    avatarUrl: text('avatar_url'),
    bio: text('bio'),
    role: roleEnum('role').default('reader').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    walletIdx: index('users_wallet_idx').on(table.walletAddress),
  })
);

export const publications = pgTable(
  'publications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),
    coverImageUrl: text('cover_image_url'),
    monthlyPriceUsdc: numeric('monthly_price_usdc', { precision: 12, scale: 6 }),
    freeTierEnabled: boolean('free_tier_enabled').default(true).notNull(),
    payoutWallet: text('payout_wallet').notNull(),
    subscriberCount: integer('subscriber_count').default(0).notNull(),
    isPublished: boolean('is_published').default(false).notNull(),
    nftGateCollection: text('nft_gate_collection'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex('publications_slug_idx').on(table.slug),
  })
);

export const posts = pgTable(
  'posts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    publicationId: uuid('publication_id')
      .notNull()
      .references(() => publications.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    subtitle: text('subtitle'),
    coverImageUrl: text('cover_image_url'),
    contentHtml: text('content_html').notNull(),
    previewHtml: text('preview_html'),
    isPaywalled: boolean('is_paywalled').default(false).notNull(),
    nftGateCollection: text('nft_gate_collection'),
    nftGateName: text('nft_gate_name'),
    status: postStatusEnum('status').notNull(),
    scheduledAt: timestamp('scheduled_at'),
    publishedAt: timestamp('published_at'),
    emailSentAt: timestamp('email_sent_at'),
    viewCount: integer('view_count').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    pubSlugUnique: unique('posts_pub_slug_unique').on(table.publicationId, table.slug),
    pubStatusPubAtIdx: index('posts_pub_status_pub_at_idx').on(
      table.publicationId,
      table.status,
      table.publishedAt
    ),
  })
);

export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    subscriberId: uuid('subscriber_id')
      .notNull()
      .references(() => users.id),
    publicationId: uuid('publication_id')
      .notNull()
      .references(() => publications.id),
    subscriberWallet: text('subscriber_wallet').notNull(),
    status: subscriptionStatusEnum('status').notNull(),
    startedAt: timestamp('started_at').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    lastTxSignature: text('last_tx_signature'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    subPubUnique: unique('subscriptions_sub_pub_unique').on(table.subscriberId, table.publicationId),
    subPubStatusIdx: index('subscriptions_sub_pub_status_idx').on(
      table.subscriberId,
      table.publicationId,
      table.status
    ),
  })
);

export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  subscriptionId: uuid('subscription_id')
    .notNull()
    .references(() => subscriptions.id),
  txSignature: text('tx_signature').notNull().unique(),
  amountUsdc: numeric('amount_usdc', { precision: 12, scale: 6 }).notNull(),
  platformFeeUsdc: numeric('platform_fee_usdc', { precision: 12, scale: 6 }).notNull(),
  creatorReceivedUsdc: numeric('creator_received_usdc', { precision: 12, scale: 6 }).notNull(),
  status: transactionStatusEnum('status').notNull(),
  confirmedAt: timestamp('confirmed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const emailSends = pgTable('email_sends', {
  id: uuid('id').defaultRandom().primaryKey(),
  postId: uuid('post_id')
    .notNull()
    .references(() => posts.id),
  recipientId: uuid('recipient_id')
    .notNull()
    .references(() => users.id),
  sentAt: timestamp('sent_at').notNull(),
  openedAt: timestamp('opened_at'),
  status: emailStatusEnum('status').notNull(),
});

export const vaultEntries = pgTable('vault_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  authorId: uuid('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  abstract: text('abstract').notNull(),
  coverImageUrl: text('cover_image_url'),
  contentHtml: text('content_html').notNull(),
  category: vaultCategoryEnum('category').notNull(),
  tags: text('tags').array(),
  singleAccessPriceUsdc: numeric('single_access_price_usdc', { precision: 12, scale: 6 }),
  isVaultPassIncluded: boolean('is_vault_pass_included').default(true).notNull(),
  wordCount: integer('word_count').notNull(),
  readTimeMinutes: integer('read_time_minutes').notNull(),
  accessCount: integer('access_count').default(0).notNull(),
  status: vaultEntryStatusEnum('status').notNull(),
  rejectionReason: text('rejection_reason'),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const vaultAccessRecords = pgTable(
  'vault_access_records',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    entryId: uuid('entry_id')
      .notNull()
      .references(() => vaultEntries.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accessType: vaultAccessTypeEnum('access_type').notNull(),
    txSignature: text('tx_signature').unique(),
    amountPaidUsdc: numeric('amount_paid_usdc', { precision: 12, scale: 6 }),
    accessedAt: timestamp('accessed_at').defaultNow().notNull(),
  },
  (table) => ({
    entryUserUnique: unique('vault_access_records_entry_user_unique').on(table.entryId, table.userId),
  })
);

export const vaultPassSubscriptions = pgTable('vault_pass_subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  subscriberId: uuid('subscriber_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  status: vaultPassStatusEnum('status').notNull(),
  startedAt: timestamp('started_at').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  lastTxSignature: text('last_tx_signature'),
  monthlyPriceUsdc: numeric('monthly_price_usdc', { precision: 12, scale: 6 }).default('5.00').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const vaultRevenueDistributions = pgTable('vault_revenue_distributions', {
  id: uuid('id').defaultRandom().primaryKey(),
  authorId: uuid('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  accessCount: integer('access_count').notNull(),
  totalPoolUsdc: numeric('total_pool_usdc', { precision: 12, scale: 6 }).notNull(),
  authorShareUsdc: numeric('author_share_usdc', { precision: 12, scale: 6 }).notNull(),
  distributionTxSignature: text('distribution_tx_signature'),
  status: vaultRevenueStatusEnum('status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  publications: many(publications),
  subscriptions: many(subscriptions),
  emailSends: many(emailSends),
  vaultEntries: many(vaultEntries),
  vaultAccessRecords: many(vaultAccessRecords),
  vaultPassSubscriptions: many(vaultPassSubscriptions),
  vaultRevenueDistributions: many(vaultRevenueDistributions),
  pushSubscriptions: many(pushSubscriptions),
}));

export const publicationsRelations = relations(publications, ({ one, many }) => ({
  owner: one(users, {
    fields: [publications.ownerId],
    references: [users.id],
  }),
  posts: many(posts),
  subscriptions: many(subscriptions),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  publication: one(publications, {
    fields: [posts.publicationId],
    references: [publications.id],
  }),
  emailSends: many(emailSends),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  subscriber: one(users, {
    fields: [subscriptions.subscriberId],
    references: [users.id],
  }),
  publication: one(publications, {
    fields: [subscriptions.publicationId],
    references: [publications.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  subscription: one(subscriptions, {
    fields: [transactions.subscriptionId],
    references: [subscriptions.id],
  }),
}));

export const emailSendsRelations = relations(emailSends, ({ one }) => ({
  post: one(posts, {
    fields: [emailSends.postId],
    references: [posts.id],
  }),
  recipient: one(users, {
    fields: [emailSends.recipientId],
    references: [users.id],
  }),
}));

export const vaultEntriesRelations = relations(vaultEntries, ({ one, many }) => ({
  author: one(users, {
    fields: [vaultEntries.authorId],
    references: [users.id],
  }),
  accessRecords: many(vaultAccessRecords),
}));

export const vaultAccessRecordsRelations = relations(vaultAccessRecords, ({ one }) => ({
  entry: one(vaultEntries, {
    fields: [vaultAccessRecords.entryId],
    references: [vaultEntries.id],
  }),
  user: one(users, {
    fields: [vaultAccessRecords.userId],
    references: [users.id],
  }),
}));

export const vaultPassSubscriptionsRelations = relations(vaultPassSubscriptions, ({ one }) => ({
  subscriber: one(users, {
    fields: [vaultPassSubscriptions.subscriberId],
    references: [users.id],
  }),
}));

export const vaultRevenueDistributionsRelations = relations(vaultRevenueDistributions, ({ one }) => ({
  author: one(users, {
    fields: [vaultRevenueDistributions.authorId],
    references: [users.id],
  }),
}));

// Inferred Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Publication = typeof publications.$inferSelect;
export type NewPublication = typeof publications.$inferInsert;

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export type EmailSend = typeof emailSends.$inferSelect;
export type NewEmailSend = typeof emailSends.$inferInsert;

export type VaultEntry = typeof vaultEntries.$inferSelect;
export type NewVaultEntry = typeof vaultEntries.$inferInsert;

export type VaultAccessRecord = typeof vaultAccessRecords.$inferSelect;
export type NewVaultAccessRecord = typeof vaultAccessRecords.$inferInsert;

export type VaultPassSubscription = typeof vaultPassSubscriptions.$inferSelect;
export type NewVaultPassSubscription = typeof vaultPassSubscriptions.$inferInsert;

export type VaultRevenueDistribution = typeof vaultRevenueDistributions.$inferSelect;
export type NewVaultRevenueDistribution = typeof vaultRevenueDistributions.$inferInsert;

export const pushSubscriptions = pgTable('push_subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  endpoint: text('endpoint').notNull(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [pushSubscriptions.userId],
    references: [users.id],
  }),
}));

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type NewPushSubscription = typeof pushSubscriptions.$inferInsert;

export const landingEvents = pgTable('landing_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventType: text('event_type').notNull(),
  country: text('country'),
  metadata: text('metadata'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export type LandingEvent = typeof landingEvents.$inferSelect;
export type NewLandingEvent = typeof landingEvents.$inferInsert;
