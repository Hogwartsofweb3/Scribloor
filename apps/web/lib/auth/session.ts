import { db, users } from '@solscribe/db';
import { eq } from '@solscribe/db';
import type { User as PrivyUser } from '@privy-io/server-auth';

export async function syncPrivyUser(privyUser: PrivyUser) {
  if (!privyUser.id) {
    throw new Error('Privy user ID is required');
  }

  // Find a solana wallet in linked accounts, fallback to .wallet
  let walletAddress = privyUser.wallet?.address || null;
  if (!walletAddress && privyUser.linkedAccounts) {
    const solanaWallet = privyUser.linkedAccounts.find(
      (acct) => acct.type === 'wallet' && acct.chainType === 'solana'
    );
    if (solanaWallet && 'address' in solanaWallet) {
      walletAddress = solanaWallet.address;
    }
  }

  // 1. Check if user exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.privyId, privyUser.id),
  });

  if (existingUser) {
    // If the wallet changed or was newly linked, update it
    if (walletAddress && existingUser.walletAddress !== walletAddress) {
      const [updated] = await db
        .update(users)
        .set({ walletAddress })
        .where(eq(users.privyId, privyUser.id))
        .returning();
      return updated;
    }
    return existingUser;
  }

  // 2. Extract best email
  const email = privyUser.email?.address || null;
  
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
