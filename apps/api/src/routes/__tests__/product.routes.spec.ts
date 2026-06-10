import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { productService } from '../../services/product.service';

vi.mock('../../middlewares/auth.middleware', () => ({
  verifyToken: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    req.user = { id: 7, role: 'seller', email: 'seller@example.com', name: 'Seller' };
    next();
  },
  requireRole: () => (_req: express.Request, _res: express.Response, next: express.NextFunction) => next(),
}));

import { productRouter } from '../product.routes';

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/products', productRouter);
  return app;
};

describe('product routes validation', () => {
  beforeEach(() => {
    vi.spyOn(productService, 'registrarProducto').mockResolvedValue({
      id: '1',
      title: 'Notebook',
      description: 'Portable computer',
      image: '/uploads/products/notebook.jpg',
      category: 'electrónica',
      price: 1200,
      stock: 5,
      seller: 'Seller 7',
      rating: 4.5,
      ownerId: 7,
    });
    vi.spyOn(productService, 'actualizarProducto').mockResolvedValue({
      id: '1',
      title: 'Notebook Pro',
      description: 'Portable computer',
      image: '/uploads/products/notebook.jpg',
      category: 'electrónica',
      price: 1400,
      stock: 3,
      seller: 'Seller 7',
      rating: 4.5,
      ownerId: 7,
    });
  });

  it('rejects empty product names before create reaches the service', async () => {
    const response = await request(buildApp())
      .post('/api/products')
      .send({ title: '   ', description: 'Portable computer', category: 'electronica', price: '1200', stock: '5' });

    expect(response.status).toBe(400);
    expect(productService.registrarProducto).not.toHaveBeenCalled();
  });

  it('rejects negative prices before create reaches the service', async () => {
    const response = await request(buildApp())
      .post('/api/products')
      .send({ title: 'Notebook', description: 'Portable computer', category: 'electronica', price: '-1', stock: '5' });

    expect(response.status).toBe(400);
    expect(productService.registrarProducto).not.toHaveBeenCalled();
  });

  it('rejects negative stock before update reaches the service', async () => {
    const response = await request(buildApp())
      .put('/api/products/1')
      .send({ title: 'Notebook', description: 'Portable computer', category: 'electronica', price: '1200', stock: '-1' });

    expect(response.status).toBe(400);
    expect(productService.actualizarProducto).not.toHaveBeenCalled();
  });

  it('passes coerced numeric values to the service for valid create payloads', async () => {
    const response = await request(buildApp())
      .post('/api/products')
      .send({ title: 'Notebook', description: 'Portable computer', category: 'electronica', price: '1200', stock: '5' });

    expect(response.status).toBe(201);
    expect(productService.registrarProducto).toHaveBeenCalledWith({
      title: 'Notebook',
      description: 'Portable computer',
      category: 'electronica',
      price: 1200,
      stock: 5,
      image: undefined,
      ownerId: 7,
    });
  });
});
