import { describe, expect, it, vi } from 'vitest';
import type { ServicioIA } from '../../adapters/servicio-ia';
import { EstrategiaBusquedaBDD } from '../../strategies/busqueda/estrategia-busqueda-bdd';
import type { EstrategiaBusqueda } from '../../strategies/busqueda/estrategia-busqueda';
import { EstrategiaBusquedaIA } from '../../strategies/busqueda/estrategia-busqueda-ia';
import { prismaMock } from '../../test/prisma.mock';
import type { Product } from '../../types/product';
import { ProductService } from '../product.service';

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
    title: 'Zapatillas',
    description: 'Calzado para correr',
    image: '/uploads/products/zapatillas.jpg',
    category: 'deportes',
    price: 80,
    stock: 8,
    seller: 'Seller 8',
    rating: 4.5,
  },
];

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

  it('delegates text search to the injected strategy', async () => {
    const estrategiaBusqueda: EstrategiaBusqueda = {
      buscar: vi.fn(async (_consulta, productosDisponibles) => [productosDisponibles[1]]),
    };
    const service = new ProductService(estrategiaBusqueda);
    prismaMock.product.findMany.mockResolvedValue([
      productRecord({ id: 1, name: 'Notebook' }),
      productRecord({ id: 2, name: 'Mouse', price: { toNumber: () => 25 } }),
    ]);

    const result = await service.buscarProductos({ search: 'mouse' });

    expect(estrategiaBusqueda.buscar).toHaveBeenCalledWith(
      'mouse',
      expect.arrayContaining([
        expect.objectContaining({ id: '1', title: 'Notebook' }),
        expect.objectContaining({ id: '2', title: 'Mouse' }),
      ]),
    );
    expect(result.map((product) => product.id)).toEqual(['2']);
  });
});

describe('EstrategiaBusquedaBDD', () => {
  it('filters products by title, description, category or seller', async () => {
    const result = await new EstrategiaBusquedaBDD().buscar('correr', products);

    expect(result.map((product) => product.id)).toEqual(['2']);
  });
});

describe('EstrategiaBusquedaIA', () => {
  it('uses the BDD strategy as fallback when the AI service fails', async () => {
    const servicioIA: ServicioIA = {
      buscarProductos: vi.fn(async () => {
        throw new Error('Groq unavailable');
      }),
    };
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const estrategia = new EstrategiaBusquedaIA(servicioIA, new EstrategiaBusquedaBDD());

    const result = await estrategia.buscar('correr', products);

    expect(servicioIA.buscarProductos).toHaveBeenCalledWith('correr', products);
    expect(result.map((product) => product.id)).toEqual(['2']);
    expect(errorSpy).toHaveBeenCalledWith(
      'AI search failed, using fallback search:',
      expect.any(Error),
    );
  });
});
