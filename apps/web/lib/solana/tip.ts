import { Connection, PublicKey, SystemProgram, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, createAssociatedTokenAccountInstruction } from '@solana/spl-token';

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || '';
const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

export interface TipParams {
  tipperWallet: string;
  recipientWallet: string;
  amountUsdc: number;
}

export async function buildTipTransaction({
  tipperWallet,
  recipientWallet,
  amountUsdc,
}: TipParams): Promise<string> {
  const connection = new Connection(HELIUS_RPC);
  const tipperPubkey = new PublicKey(tipperWallet);
  const recipientPubkey = new PublicKey(recipientWallet);

  // Get ATAs
  const tipperAta = await getAssociatedTokenAddress(USDC_MINT, tipperPubkey);
  const recipientAta = await getAssociatedTokenAddress(USDC_MINT, recipientPubkey);

  const instructions = [];

  // Check if recipient has USDC ATA
  const recipientAtaInfo = await connection.getAccountInfo(recipientAta);
  if (!recipientAtaInfo) {
    instructions.push(
      createAssociatedTokenAccountInstruction(
        tipperPubkey,
        recipientAta,
        recipientPubkey,
        USDC_MINT
      )
    );
  }

  // Pure transfer instruction (100% to creator, 6 decimals for USDC)
  const amountToTransfer = BigInt(Math.floor(amountUsdc * 1000000));

  instructions.push(
    createTransferInstruction(
      tipperAta,
      recipientAta,
      tipperPubkey,
      amountToTransfer
    )
  );

  const { blockhash } = await connection.getLatestBlockhash('confirmed');

  const messageV0 = new TransactionMessage({
    payerKey: tipperPubkey,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message();

  const transaction = new VersionedTransaction(messageV0);

  return Buffer.from(transaction.serialize()).toString('base64');
}
