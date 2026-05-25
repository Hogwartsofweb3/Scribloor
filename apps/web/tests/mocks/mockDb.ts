import { vi } from 'vitest';

export const mockDb = {
  query: {
    subscriptions: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    publications: {
      findFirst: vi.fn(),
    },
    posts: {
      findFirst: vi.fn(),
    },
  },
  insert: vi.fn(() => ({ values: vi.fn(() => ({ returning: vi.fn() })) })),
  update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => ({ returning: vi.fn() })) })) })),
};

vi.mock('@solscribe/db', () => ({
  db: mockDb,
  subscriptions: {},
  publications: {},
  posts: {},
  users: {},
}));
