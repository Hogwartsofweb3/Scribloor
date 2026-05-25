import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getPostAccessLevel } from '../../subscriptions/access';
import * as nftModule from '../../solana/nft';
import { mockDb } from '../../../tests/mocks/mockDb';

vi.mock('../../solana/nft', () => ({
  doesWalletHoldCollectionNft: vi.fn(),
}));

// Mock redis
vi.mock('@/lib/redis', () => ({
  redis: { get: vi.fn(), set: vi.fn() }
}));

describe('getPostAccessLevel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns public for non-paywalled, non-gated post', async () => {
    const result = await getPostAccessLevel({
      userId: null, walletAddress: null,
      post: { isPaywalled: false, nftGateCollection: null, nftGateName: null, publicationId: '1' },
      publication: { ownerId: 'owner1', nftGateCollection: null },
    });
    expect(result).toEqual({ canRead: true, reason: 'public' });
  });

  it('allows creator access regardless of paywall', async () => {
    const result = await getPostAccessLevel({
      userId: 'owner1', walletAddress: null,
      post: { isPaywalled: true, nftGateCollection: null, nftGateName: null, publicationId: '1' },
      publication: { ownerId: 'owner1', nftGateCollection: null },
    });
    expect(result).toEqual({ canRead: true, reason: 'creator' });
  });
});
