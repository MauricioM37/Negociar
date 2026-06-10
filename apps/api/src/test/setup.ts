import { afterEach, beforeEach, vi } from 'vitest';
import { prismaMock } from './prisma.mock';

const originalEnv = { ...process.env };

vi.doMock('@Negociar/db/src/client', () => ({
  prisma: prismaMock,
}));

beforeEach(() => {
  process.env = { ...originalEnv };
  global.fetch = vi.fn() as unknown as typeof fetch;
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
  process.env = { ...originalEnv };
});
