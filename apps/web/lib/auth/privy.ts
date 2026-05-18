import { PrivyClient } from '@privy-io/server-auth';
import type { NextRequest } from 'next/server';

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

export async function getServerUser(request: NextRequest) {
  const token = request.cookies.get('privy-token')?.value;
  if (!token) return null;

  const verifiedUser = await verifyPrivyToken(token);
  if (!verifiedUser) return null;

  return privy.getUser(verifiedUser.userId);
}
