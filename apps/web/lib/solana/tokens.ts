import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import { getConnection } from './connection';
import { USDC_MINT, USDC_DECIMALS } from './constants';

/**
 * Returns the USDC balance for the given wallet address.
 * Returns 0 if the token account does not exist.
 */
export async function getUsdcBalance(walletAddress: string): Promise<number> {
  try {
    const connection = getConnection();
    const owner = new PublicKey(walletAddress);
    const ata = await getAssociatedTokenAddress(USDC_MINT, owner);
    const account = await getAccount(connection, ata);
    return Number(account.amount) / Math.pow(10, USDC_DECIMALS);
  } catch {
    // Token account doesn't exist — wallet has 0 USDC
    return 0;
  }
}
