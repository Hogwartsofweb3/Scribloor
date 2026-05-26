import { PrivyClient } from '@privy-io/server-auth';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { syncPrivyUser } from '@/lib/auth/session';

export const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'clq8xyz123abc456def789gh',
  process.env.PRIVY_APP_SECRET || 'clq8xyz123abc456def789ghclq8xyz123abc456def789gh'
);

export async function verifyPrivyToken(token: string) {
  try {
    return await privy.verifyAuthToken(token);
  } catch (error) {
    console.error('Privy token verification failed:', error);
    return null;
  }
}

/** For use in API route handlers (have NextRequest) */
export async function getServerUser(request: NextRequest) {
  const token = request.cookies.get('privy-token')?.value;
  if (!token) return null;

  const verifiedUser = await verifyPrivyToken(token);
  if (!verifiedUser) return null;

  return privy.getUser(verifiedUser.userId);
}

/** For use in Server Components / pages (no NextRequest, use next/headers) */
export async function getServerUserFromCookies() {
  const cookieStore = cookies();
  const token = cookieStore.get('privy-token')?.value;
  if (!token) return null;

  const verifiedUser = await verifyPrivyToken(token);
  if (!verifiedUser) return null;

  const privyUser = await privy.getUser(verifiedUser.userId);
  if (!privyUser) return null;

  // Sync/create user record in our DB and return the DB user
  return syncPrivyUser(privyUser);
}
/** For use in API route handlers (have NextRequest) - returns DB User */
export async function getServerDbUser(request: NextRequest) {
  const token = request.cookies.get('privy-token')?.value;
  if (!token) return null;

  const verifiedUser = await verifyPrivyToken(token);
  if (!verifiedUser) return null;

  const privyUser = await privy.getUser(verifiedUser.userId);
  if (!privyUser) return null;

  return syncPrivyUser(privyUser);
}
