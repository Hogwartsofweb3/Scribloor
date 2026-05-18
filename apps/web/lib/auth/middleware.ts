import { privy } from './privy';

export async function verifyAuthToken(token: string) {
  try {
    return await privy.verifyAuthToken(token);
  } catch (error) {
    return null;
  }
}
