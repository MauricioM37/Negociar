import { describe, expect, it, vi } from 'vitest';
import type { Product } from '../../types/product';
import { buscarProductosIA, GroqAdapter } from '../ai.service';

const products: Product[] = [
  {
    id: '1',
    title: 'Notebook',
    description: 'Portable computer',
    image: '/uploads/products/notebook.jpg',
    category: 'electrónica',
    price: 1200,
    stock: 5,
    seller: 'Seller 7',
    rating: 4.5,
  },
  {
    id: '2',
    title: 'Mouse',
    description: 'Wireless mouse',
    image: '/uploads/products/mouse.jpg',
    category: 'electrónica',
    price: 25,
    stock: 20,
    seller: 'Seller 8',
    rating: 4.5,
  },
];

describe('GroqAdapter', () => {
  it('CP-001-04 orders products from a mocked Groq response without real network calls', async () => {
    process.env.GROQ_API_KEY = 'test-api-key';
    const fetchMock = global.fetch as ReturnType<typeof vi.fn>;

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '["2", "2", "999", "1"]' } }],
      }),
    });

    const result = await new GroqAdapter().buscarProductos('mouse para notebook', products);

    expect(result.map((product) => product.id)).toEqual(['2', '1']);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.groq.com/openai/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer test-api-key' }),
      }),
    );
  });
});

describe('buscarProductosIA', () => {
  it('keeps the compatibility facade delegating to GroqAdapter', async () => {
    process.env.GROQ_API_KEY = 'test-api-key';
    const fetchMock = global.fetch as ReturnType<typeof vi.fn>;

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '["1"]' } }],
      }),
    });

    const result = await buscarProductosIA('notebook', products);

    expect(result.map((product) => product.id)).toEqual(['1']);
  });
});
