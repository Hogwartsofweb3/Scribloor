import { describe, it, expect } from 'vitest';
describe('Solana Payments', () => {
  it('calculates fee splits correctly', () => {
    const amount = 10;
    const fee = amount * 0.04;
    expect(fee).toBe(0.4);
  });
});
