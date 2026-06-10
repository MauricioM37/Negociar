import { vi } from 'vitest';

export const prismaMock = {
  product: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  category: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
  supplier: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
};
