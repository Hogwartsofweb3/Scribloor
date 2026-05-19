// ─── Helius Enhanced Transaction Webhook Types ──────────────────────────────
// Reference: https://docs.helius.dev/webhooks-and-websockets/enhanced-transactions-api

export type HeliusTransactionType =
  | 'TRANSFER'
  | 'SWAP'
  | 'NFT_SALE'
  | 'NFT_MINT'
  | 'NFT_BID'
  | 'NFT_LISTING'
  | 'NFT_CANCEL_LISTING'
  | 'STAKE_SOL'
  | 'UNSTAKE_SOL'
  | 'UNKNOWN';

export type HeliusSource =
  | 'PHANTOM'
  | 'SOLFLARE'
  | 'BACKPACK'
  | 'MAGIC_EDEN'
  | 'TENSOR'
  | 'UNKNOWN';

export interface TokenTransfer {
  fromTokenAccount: string;
  toTokenAccount: string;
  fromUserAccount: string;
  toUserAccount: string;
  tokenAmount: number;
  mint: string;
  tokenStandard: string;
}

export interface NativeTransfer {
  fromUserAccount: string;
  toUserAccount: string;
  amount: number;
}

export interface AccountData {
  account: string;
  nativeBalanceChange: number;
  tokenBalanceChanges: TokenBalanceChange[];
}

export interface TokenBalanceChange {
  userAccount: string;
  tokenAccount: string;
  mint: string;
  rawTokenAmount: {
    tokenAmount: string;
    decimals: number;
  };
}

export interface Instruction {
  accounts: string[];
  data: string;
  programId: string;
  innerInstructions: InnerInstruction[];
}

export interface InnerInstruction {
  accounts: string[];
  data: string;
  programId: string;
}

export interface EnhancedTransaction {
  /** Solana transaction signature */
  signature: string;
  slot: number;
  timestamp: number;
  fee: number;
  feePayer: string;
  type: HeliusTransactionType;
  source: HeliusSource;
  description: string;
  /** SPL token transfers parsed by Helius */
  tokenTransfers: TokenTransfer[];
  nativeTransfers: NativeTransfer[];
  accountData: AccountData[];
  instructions: Instruction[];
  events: Record<string, unknown>;
}

/** The full Helius webhook POST body */
export type HeliusWebhookPayload = EnhancedTransaction[];
