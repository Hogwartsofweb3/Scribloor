import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCollectionMetadata } from '@/lib/solana/nft';
import { redis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

/**
 * GET /api/nft/collection/[address]
 * Fetches NFT collection metadata from Helius DAS. Cached 1 hour.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  const { address } = params;

  if (!address || address.length < 32 || address.length > 44) {
    return NextResponse.json({ error: 'Invalid collection address' }, { status: 400 });
  }

  // Check Redis cache (1 hour TTL)
  const cacheKey = `nft:collection:meta:${address}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }
  } catch (err) {
    console.error('[NFT API] Redis cache read error:', err);
  }

  const metadata = await getCollectionMetadata(address);

  if (!metadata) {
    return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
  }

  // Cache for 1 hour
  try {
    await redis.set(cacheKey, metadata, { ex: 3600 });
  } catch (err) {
    console.error('[NFT API] Redis cache write error:', err);
  }

  return NextResponse.json(metadata);
}
