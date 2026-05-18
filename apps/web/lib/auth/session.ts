import { db, users } from '@solscribe/db';
import { eq } from 'drizzle-orm';
import type { User as PrivyUser } from '@privy-io/server-auth';

export async function syncPrivyUser(privyUser: PrivyUser) {
  if (!privyUser.id) {
    throw new Error('Privy user ID is required');
  }

  // 1. Check if user exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.privyId, privyUser.id),
  });

  if (existingUser) {
    return existingUser;
  }

  // 2. Extract best email and wallet
  const email = privyUser.email?.address || null;
  const walletAddress = privyUser.wallet?.address || null;
  
  // 3. Generate a temporary username (required field)
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const tempUsername = email ? email.split('@')[0] + '_' + randomSuffix : 'user_' + randomSuffix;

  // 4. Create new user
  const [newUser] = await db.insert(users).values({
    privyId: privyUser.id,
    email: email,
    walletAddress: walletAddress,
    username: tempUsername,
  }).returning();

  return newUser;
}
