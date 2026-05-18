import {
  PublicKey,
  Connection,
  VersionedTransaction,
  TransactionMessage,
  ComputeBudgetProgram,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { USDC_MINT, USDC_DECIMALS, PLATFORM_FEE_BPS } from './constants';

interface BuildSubscriptionTransactionParams {
  payerWallet: PublicKey;
  creatorWallet: PublicKey;
  amountUsdc: number;
  platformFeeWallet: PublicKey;
  connection: Connection;
}

/**
 * Converts a USDC amount (e.g. 5.00) to raw token units using BigInt
 * to avoid floating point precision issues.
 */
function toRawUsdc(amount: number): bigint {
  // Work in integer arithmetic: multiply by 10^6, round, then convert
  const scaled = Math.round(amount * Math.pow(10, USDC_DECIMALS));
  return BigInt(scaled);
}

/**
 * Returns the ATA for an owner, and optionally queues a creation instruction
 * if the account does not yet exist on-chain.
 */
async function resolveAta(
  connection: Connection,
  mint: PublicKey,
  owner: PublicKey,
  payer: PublicKey,
  instructions: ReturnType<typeof createAssociatedTokenAccountInstruction>[]
): Promise<PublicKey> {
  const ata = await getAssociatedTokenAddress(
    mint,
    owner,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const info = await connection.getAccountInfo(ata);
  if (!info) {
    instructions.push(
      createAssociatedTokenAccountInstruction(
        payer,
        ata,
        owner,
        mint,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
  }

  return ata;
}

/**
 * Builds an unsigned VersionedTransaction that splits an incoming USDC
 * payment between the creator (96%) and the platform fee wallet (4%).
 *
 * All arithmetic is performed using BigInt to eliminate floating-point risk.
 */
export async function buildSubscriptionTransaction({
  payerWallet,
  creatorWallet,
  amountUsdc,
  platformFeeWallet,
  connection,
}: BuildSubscriptionTransactionParams): Promise<VersionedTransaction> {
  // ── 1. Calculate amounts using integer arithmetic ───────────────────────
  const totalRaw = toRawUsdc(amountUsdc);
  const feeRaw = (totalRaw * BigInt(PLATFORM_FEE_BPS)) / BigInt(10_000);
  const creatorRaw = totalRaw - feeRaw;

  // ── 2. Resolve ATAs (create if missing) ────────────────────────────────
  const ataInstructions: ReturnType<
    typeof createAssociatedTokenAccountInstruction
  >[] = [];

  const [payerAta, creatorAta, feeAta] = await Promise.all([
    resolveAta(connection, USDC_MINT, payerWallet, payerWallet, ataInstructions),
    resolveAta(connection, USDC_MINT, creatorWallet, payerWallet, ataInstructions),
    resolveAta(connection, USDC_MINT, platformFeeWallet, payerWallet, ataInstructions),
  ]);

  // ── 3. Build transfer instructions ─────────────────────────────────────
  const transferToCreator = createTransferInstruction(
    payerAta,
    creatorAta,
    payerWallet,
    creatorRaw,
    [],
    TOKEN_PROGRAM_ID
  );

  const transferToFee = createTransferInstruction(
    payerAta,
    feeAta,
    payerWallet,
    feeRaw,
    [],
    TOKEN_PROGRAM_ID
  );

  // ── 4. Priority fee ─────────────────────────────────────────────────────
  const priorityFeeIx = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 50_000,
  });

  // ── 5. Assemble VersionedTransaction ────────────────────────────────────
  const { blockhash } = await connection.getLatestBlockhash('confirmed');

  const message = new TransactionMessage({
    payerKey: payerWallet,
    recentBlockhash: blockhash,
    instructions: [
      priorityFeeIx,
      ...ataInstructions,
      transferToCreator,
      transferToFee,
    ],
  }).compileToV0Message();

  return new VersionedTransaction(message);
}
