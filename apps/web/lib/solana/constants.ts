import { PublicKey } from '@solana/web3.js';

export const USDC_MINT = new PublicKey(
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
);

export const PLATFORM_FEE_WALLET = process.env.NEXT_PUBLIC_PLATFORM_FEE_WALLET ?? '';

export const PLATFORM_FEE_BPS = 400; // 4%

export const USDC_DECIMALS = 6;
