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

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  publications: many(publications),
  subscriptions: many(subscriptions),
  emailSends: many(emailSends),
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
