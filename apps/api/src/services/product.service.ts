import { prisma } from '@Negociar/db/src/client';
import type {
  Product,
  ProductMutationInput,
  ProductQueryFilters,
  ProductUpdateInput,
} from '../types/product';
import { searchProductsWithAI } from './ai.service';

const categoryMap: Record<string, string> = {
  electronica: 'electrónica',
  hogar: 'hogar',
  moda: 'moda',
  libros: 'libros',
  deportes: 'deportes',
  vehiculos: 'vehículos',
  juegos: 'juegos',
  belleza: 'belleza',
};

export class ProductService {
  private mapProduct(product: {
    id: number;
    name: string;
    description: string | null;
    imagePath: string | null;
    price: { toNumber: () => number } | number;
    stock: number;
    category: { name: string };
    supplier: { id: number; name: string } | null;
  }): Product {
    const priceValue =
      typeof product.price === 'number' ? product.price : Number(product.price.toNumber());

    return {
      id: String(product.id),
      title: product.name,
      description: product.description ?? '',
      image: product.imagePath ?? 'https://placehold.co/600x400?text=Sin+imagen',
      category: product.category.name,
      price: priceValue,
      stock: product.stock,
      seller: product.supplier?.name ?? 'Vendedor',
      rating: 4.5,
      ownerId: product.supplier?.id ?? null,
    };
  }

  private async findSupplierForOwner(ownerId: number): Promise<number | null> {
    const supplierName = `Seller ${ownerId}`;

    const existing = await prisma.supplier.findFirst({
      where: { name: supplierName },
      select: { id: true },
    });

    return existing?.id ?? null;
  }

  private async ensureSupplierForOwner(ownerId: number): Promise<number> {
    const supplierName = `Seller ${ownerId}`;

    const existing = await prisma.supplier.findFirst({
      where: { name: supplierName },
      select: { id: true },
    });

    if (existing) {
      return existing.id;
    }

    const created = await prisma.supplier.create({
      data: {
        name: supplierName,
        activeState: true,
      },
      select: { id: true },
    });

    return created.id;
  }

  private async ensureCategory(category: string): Promise<number> {
    const normalized = (categoryMap[category.toLowerCase()] ?? category).trim();

    const existing = await prisma.category.findFirst({
      where: { name: normalized },
      select: { id: true },
    });

    if (existing) {
      return existing.id;
    }

    const created = await prisma.category.create({
      data: { name: normalized },
      select: { id: true },
    });

    return created.id;
  }

  async getProducts(filters: ProductQueryFilters): Promise<Product[]> {
    const {
      search,
      category,
      minPrice = 0,
      maxPrice = Number.MAX_SAFE_INTEGER,
      sortBy = 'relevance',
      ownerId,
    } = filters;

    let supplierIdFilter: number | undefined;

    if (typeof ownerId === 'number') {
      const ownerSupplierId = await this.findSupplierForOwner(ownerId);
      if (!ownerSupplierId) {
        return [];
      }

      supplierIdFilter = ownerSupplierId;
    }

    const productsFromDb = await prisma.product.findMany({
      where: {
        activeState: true,
        price: {
          gte: minPrice,
          lte: maxPrice,
        },
        ...(supplierIdFilter ? { supplierId: supplierIdFilter } : {}),
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    let products = productsFromDb.map((product) => this.mapProduct(product));

    if (search && search.trim() !== '') {
      try {
        products = await searchProductsWithAI(search, products);
      } catch (error) {
        const term = search.toLowerCase().trim();
        products = products.filter((product) =>
          product.title.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term) ||
          product.seller.toLowerCase().includes(term),
        );

        console.error('AI search failed, using fallback search:', error);
      }
    }

    if (category && category.trim() !== '') {
      const normalizedCategory = categoryMap[category] ?? category.toLowerCase();
      products = products.filter((product) =>
        product.category.toLowerCase().includes(normalizedCategory),
      );
    }

    products = products.filter(
      (product) => product.price >= minPrice && product.price <= maxPrice,
    );

    switch (sortBy) {
      case 'price_asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return products;
  }

  async getById(id: string): Promise<Product | undefined> {
    const productId = Number(id);

    if (!Number.isFinite(productId)) {
      return undefined;
    }

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        activeState: true,
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    if (!product) {
      return undefined;
    }

    return this.mapProduct(product);
  }

  async getFeatured(limit = 8): Promise<Product[]> {
    const products = await prisma.product.findMany({
      where: { activeState: true },
      include: {
        category: true,
        supplier: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return products.map((product) => this.mapProduct(product));
  }

  async create(input: ProductMutationInput): Promise<Product> {
    const [categoryId, supplierId] = await Promise.all([
      this.ensureCategory(input.category),
      this.ensureSupplierForOwner(input.ownerId),
    ]);

    const created = await prisma.product.create({
      data: {
        name: input.title.trim(),
        description: input.description.trim(),
        price: input.price,
        stock: input.stock,
        imagePath: input.image,
        categoryId,
        supplierId,
        activeState: true,
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    return this.mapProduct(created);
  }

  async update(id: string, input: ProductUpdateInput): Promise<Product | undefined> {
    const productId = Number(id);

    if (!Number.isFinite(productId)) {
      return undefined;
    }

    const ownerSupplierId = await this.findSupplierForOwner(input.ownerId);

    if (!ownerSupplierId) {
      return undefined;
    }

    const existing = await prisma.product.findFirst({
      where: {
        id: productId,
        activeState: true,
        supplierId: ownerSupplierId,
      },
    });

    if (!existing) {
      return undefined;
    }

    const categoryId = input.category ? await this.ensureCategory(input.category) : undefined;

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(input.title !== undefined ? { name: input.title.trim() } : {}),
        ...(input.description !== undefined ? { description: input.description.trim() } : {}),
        ...(input.price !== undefined ? { price: input.price } : {}),
        ...(input.stock !== undefined ? { stock: input.stock } : {}),
        ...(input.image !== undefined ? { imagePath: input.image } : {}),
        ...(categoryId ? { categoryId } : {}),
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    return this.mapProduct(updated);
  }

  async delete(id: string, ownerId: number): Promise<boolean> {
    const productId = Number(id);

    if (!Number.isFinite(productId)) {
      return false;
    }

    const ownerSupplierId = await this.findSupplierForOwner(ownerId);

    if (!ownerSupplierId) {
      return false;
    }

    const existing = await prisma.product.findFirst({
      where: {
        id: productId,
        activeState: true,
        supplierId: ownerSupplierId,
      },
      select: { id: true },
    });

    if (!existing) {
      return false;
    }

    await prisma.product.delete({ where: { id: productId } });
    return true;
  }
}

export const productService = new ProductService();
