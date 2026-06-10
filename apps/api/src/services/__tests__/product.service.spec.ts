import { describe, expect, it } from 'vitest';
import { ProductService } from '../product.service';
import { prismaMock } from '../../test/prisma.mock';

const productRecord = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  name: 'Notebook',
  description: 'Portable computer',
  imagePath: '/uploads/products/notebook.jpg',
  price: { toNumber: () => 1200 },
  stock: 5,
  category: { name: 'electrónica' },
  supplier: { id: 7, name: 'Seller 7' },
  ...overrides,
});

describe('ProductService', () => {
  it('CP-001-02 creates a valid product with normalized write data', async () => {
    const service = new ProductService();
    prismaMock.category.findFirst.mockResolvedValue({ id: 10 });
    prismaMock.supplier.findFirst.mockResolvedValue({ id: 7 });
    prismaMock.product.create.mockResolvedValue(productRecord());

    const result = await service.registrarProducto({
      title: ' Notebook ',
      description: ' Portable computer ',
      category: 'electronica',
      price: 1200,
      stock: 5,
      image: '/uploads/products/notebook.jpg',
      ownerId: 7,
    });

    expect(result).toMatchObject({ title: 'Notebook', price: 1200, stock: 5 });
    expect(prismaMock.product.create).toHaveBeenCalledWith({
      data: {
        name: 'Notebook',
        description: 'Portable computer',
        price: 1200,
        stock: 5,
        imagePath: '/uploads/products/notebook.jpg',
        categoryId: 10,
        supplierId: 7,
        activeState: true,
      },
      include: {
        category: true,
        supplier: true,
      },
    });
  });

  it('CP-001-03 updates a valid product owned by the seller', async () => {
    const service = new ProductService();
    prismaMock.supplier.findFirst.mockResolvedValue({ id: 7 });
    prismaMock.product.findFirst.mockResolvedValue({ id: 1 });
    prismaMock.category.findFirst.mockResolvedValue({ id: 10 });
    prismaMock.product.update.mockResolvedValue(
      productRecord({ name: 'Notebook Pro', price: { toNumber: () => 1400 }, stock: 3 }),
    );

    const result = await service.actualizarProducto('1', {
      title: ' Notebook Pro ',
      description: ' Updated portable computer ',
      category: 'electronica',
      price: 1400,
      stock: 3,
      ownerId: 7,
    });

    expect(result).toMatchObject({ title: 'Notebook Pro', price: 1400, stock: 3 });
    expect(prismaMock.product.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        name: 'Notebook Pro',
        description: 'Updated portable computer',
        price: 1400,
        stock: 3,
        categoryId: 10,
      },
      include: {
        category: true,
        supplier: true,
      },
    });
  });

  it('sorts searched products deterministically by ascending price', async () => {
    const service = new ProductService();
    prismaMock.product.findMany.mockResolvedValue([
      productRecord({ id: 1, name: 'Expensive', price: { toNumber: () => 30 } }),
      productRecord({ id: 2, name: 'Cheap', price: { toNumber: () => 10 } }),
    ]);

    const result = await service.buscarProductos({ sortBy: 'price_asc' });

    expect(result.map((product) => product.id)).toEqual(['2', '1']);
    expect(prismaMock.product.findMany).toHaveBeenCalledWith({
      where: {
        activeState: true,
        price: {
          gte: 0,
          lte: Number.MAX_SAFE_INTEGER,
        },
      },
      include: {
        category: true,
        supplier: true,
      },
    });
  });
});
