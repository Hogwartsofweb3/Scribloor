import { Connection } from '@solana/web3.js';
import { USDC_DECIMALS } from './constants';

interface VerifyResult {
  valid: boolean;
  actualAmount: number;
  error?: string;
}

interface VerifySubscriptionTxParams {
  txSignature: string;
  expectedCreatorWallet: string;
  expectedAmountUsdc: number;
  connection: Connection;
}

const MAX_TX_AGE_MS = 5 * 60 * 1000; // 5 minutes
const TOLERANCE_BPS = 10; // 0.1%

/**
 * Verifies that a confirmed Solana transaction:
 *   1. Is not older than 5 minutes
 *   2. Contains an SPL token transfer to the expected creator wallet
 *   3. Transferred at least the expected amount (within 0.1% tolerance)
 */
export async function verifySubscriptionTx({
  txSignature,
  expectedCreatorWallet,
  expectedAmountUsdc,
  connection,
}: VerifySubscriptionTxParams): Promise<VerifyResult> {
  // ── 1. Fetch the confirmed transaction ──────────────────────────────────
  let tx: Awaited<ReturnType<typeof connection.getTransaction>>;
  try {
    tx = await connection.getTransaction(txSignature, {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed',
    });
  } catch (err) {
    return { valid: false, actualAmount: 0, error: 'Failed to fetch transaction' };
  }

  if (!tx) {
    return { valid: false, actualAmount: 0, error: 'Transaction not found' };
  }

  // ── 2. Age check ────────────────────────────────────────────────────────
  if (tx.blockTime) {
    const txAgeMs = Date.now() - tx.blockTime * 1000;
    if (txAgeMs > MAX_TX_AGE_MS) {
      return {
        valid: false,
        actualAmount: 0,
        error: `Transaction is too old (${Math.round(txAgeMs / 1000)}s)`,
      };
    }
  }

  // ── 3. Check for execution errors ───────────────────────────────────────
  if (tx.meta?.err) {
    return { valid: false, actualAmount: 0, error: 'Transaction failed on-chain' };
  }

  // ── 4. Parse SPL token balance changes ──────────────────────────────────
  const preTokenBalances = tx.meta?.preTokenBalances ?? [];
  const postTokenBalances = tx.meta?.postTokenBalances ?? [];
  const accountKeys = tx.transaction.message.staticAccountKeys ?? [];

  let actualRawAmount = BigInt(0);

  for (const postBalance of postTokenBalances) {
    const accountKey = accountKeys[postBalance.accountIndex]?.toBase58();
    if (!accountKey) continue;

    // Find the corresponding pre-balance
    const preBalance = preTokenBalances.find(
      (b) => b.accountIndex === postBalance.accountIndex
    );

    const preAmount = BigInt(preBalance?.uiTokenAmount.amount ?? '0');
    const postAmount = BigInt(postBalance.uiTokenAmount.amount ?? '0');
    const delta = postAmount - preAmount;

    // We want the account that received tokens (positive delta) AND
    // whose owner is the expected creator wallet
    if (delta > BigInt(0) && postBalance.owner === expectedCreatorWallet) {
      actualRawAmount = delta;
      break;
    }
  }

  if (actualRawAmount === BigInt(0)) {
    return {
      valid: false,
      actualAmount: 0,
      error: 'No matching USDC transfer to expected creator wallet found',
    };
  }

  // ── 5. Amount validation with tolerance ─────────────────────────────────
  const actualAmount = Number(actualRawAmount) / Math.pow(10, USDC_DECIMALS);
  const expectedRaw = BigInt(Math.round(expectedAmountUsdc * Math.pow(10, USDC_DECIMALS)));
  const toleranceRaw = (expectedRaw * BigInt(TOLERANCE_BPS)) / BigInt(10_000);
  const minimumRaw = expectedRaw - toleranceRaw;

  if (actualRawAmount < minimumRaw) {
    return {
      valid: false,
      actualAmount,
      error: `Amount too low: expected ~${expectedAmountUsdc} USDC, got ${actualAmount} USDC`,
    };
  }

  return { valid: true, actualAmount };
}
