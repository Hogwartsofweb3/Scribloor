import { z } from 'zod';
import { PublicKey } from '@solana/web3.js';

const isValidSolanaWallet = (val: string) => {
  try {
    const key = new PublicKey(val);
    return PublicKey.isOnCurve(key.toBuffer());
  } catch {
    return false;
  }
};

export const PublicationSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Name must be at least 3 characters.' })
    .max(100, { message: 'Name cannot exceed 100 characters.' }),
  slug: z
    .string()
    .min(3, { message: 'Slug must be at least 3 characters.' })
    .max(50, { message: 'Slug cannot exceed 50 characters.' })
    .regex(/^[a-z0-9-]+$/, {
      message: 'Slug can only contain lowercase letters, numbers, and hyphens.',
    }),
  description: z
    .string()
    .max(500, { message: 'Description cannot exceed 500 characters.' })
    .optional()
    .nullable()
    .or(z.literal('')),
  monthlyPriceUsdc: z.coerce
    .number()
    .min(0, { message: 'Price cannot be negative.' })
    .max(999, { message: 'Price cannot exceed 999 USDC.' })
    .refine((val) => val === 0 || val >= 1, {
      message: 'Price must be 0 (free) or at least 1 USDC.',
    }),
  freeTierEnabled: z.boolean().default(true),
  /**
   * payoutWallet is required IF a paid price is set, but can be omitted or empty
   * for free publications and during onboarding (before wallet is connected).
   * If provided, it must be a valid base58 Solana address.
   */
  payoutWallet: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        // Allow empty / missing for free publications
        if (!val || val.trim() === '') return true;
        return isValidSolanaWallet(val);
      },
      { message: 'Payout wallet must be a valid base58 Solana wallet address.' }
    ),
  coverImageUrl: z.string().url({ message: 'Must be a valid URL.' }).optional().or(z.literal('')),
  accentColor: z.string().default('amber'),
});

export type PublicationInput = z.infer<typeof PublicationSchema>;
