import { redis } from '@/lib/redis';

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || '';
const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

interface HeliusAsset {
  id: string;
  content?: {
    metadata?: { name?: string; symbol?: string; description?: string };
    links?: { image?: string };
    files?: { uri?: string }[];
  };
  grouping?: { group_key: string; group_value: string }[];
}

interface OwnedNft {
  mint: string;
  collection: string | null;
  name: string;
}

/**
 * Fetches all NFTs owned by a wallet using Helius DAS getAssetsByOwner.
 */
export async function getNftCollectionsByOwner(walletAddress: string): Promise<OwnedNft[]> {
  try {
    const response = await fetch(HELIUS_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'solscribe-nft-lookup',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: walletAddress,
          page: 1,
          limit: 1000,
          displayOptions: { showCollectionMetadata: true },
        },
      }),
    });

    const data = await response.json();
    const items: HeliusAsset[] = data?.result?.items ?? [];

    return items.map((item) => {
      const collectionGroup = item.grouping?.find((g) => g.group_key === 'collection');
      return {
        mint: item.id,
        collection: collectionGroup?.group_value ?? null,
        name: item.content?.metadata?.name ?? 'Unknown NFT',
      };
    });
  } catch (error) {
    console.error('[NFT] Error fetching assets by owner:', error);
    return [];
  }
}

/**
 * Checks if a wallet holds at least one NFT from a given collection.
 * Cached in Redis for 10 minutes.
 */
export async function doesWalletHoldCollectionNft({
  walletAddress,
  collectionAddress,
}: {
  walletAddress: string;
  collectionAddress: string;
}): Promise<boolean> {
  const cacheKey = `nft:hold:${walletAddress}:${collectionAddress}`;

  // 1. Check Redis cache
  try {
    const cached = await redis.get<boolean>(cacheKey);
    if (cached !== null) return cached;
  } catch (err) {
    console.error('[NFT] Redis cache read error:', err);
  }

  // 2. Query Helius DAS
  try {
    const response = await fetch(HELIUS_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'solscribe-nft-check',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: walletAddress,
          page: 1,
          limit: 1000,
          grouping: ['collection', collectionAddress],
        },
      }),
    });

    const data = await response.json();
    const items: HeliusAsset[] = data?.result?.items ?? [];

    // Check if any returned asset belongs to the target collection
    const holdsNft = items.some((item) =>
      item.grouping?.some(
        (g) => g.group_key === 'collection' && g.group_value === collectionAddress
      )
    );

    // 3. Cache result for 10 minutes
    try {
      await redis.set(cacheKey, holdsNft, { ex: 600 });
    } catch (err) {
      console.error('[NFT] Redis cache write error:', err);
    }

    return holdsNft;
  } catch (error) {
    console.error('[NFT] Error checking collection ownership:', error);
    return false;
  }
}

/**
 * Fetches collection metadata from Helius DAS getAsset endpoint.
 */
export async function getCollectionMetadata(collectionAddress: string) {
  try {
    const response = await fetch(HELIUS_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'solscribe-collection-meta',
        method: 'getAsset',
        params: { id: collectionAddress },
      }),
    });

    const data = await response.json();
    const asset = data?.result;

    if (!asset) return null;

    return {
      address: collectionAddress,
      name: asset.content?.metadata?.name ?? 'Unknown Collection',
      symbol: asset.content?.metadata?.symbol ?? '',
      image: asset.content?.links?.image ?? asset.content?.files?.[0]?.uri ?? null,
      description: asset.content?.metadata?.description ?? null,
    };
  } catch (error) {
    console.error('[NFT] Error fetching collection metadata:', error);
    return null;
  }
}
