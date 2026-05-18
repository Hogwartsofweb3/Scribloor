import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

export const wallets = pgTable('wallets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  address: text('address').notNull().unique(),
  chain: text('chain').notNull().default('solana'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
