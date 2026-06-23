import { prisma } from '@Negociar/db/src/client';
import type {
  Product,
  ProductMutationInput,
  ProductQueryFilters,
  ProductUpdateInput,
} from '../types/product';
import { GroqAdapter } from '../adapters/groq.adapter';
import type { EstrategiaBusqueda } from '../strategies/busqueda/estrategia-busqueda';
import { EstrategiaBusquedaBDD } from '../strategies/busqueda/estrategia-busqueda-bdd';
import { EstrategiaBusquedaIA } from '../strategies/busqueda/estrategia-busqueda-ia';

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

interface ProductRecord {
  id: number;
  name: string;
  description: string | null;
  imagePath: string | null;
  price: { toNumber: () => number } | number;
  stock: number;
  category: { name: string };
  supplier: { id: number; name: string } | null;
}

const crearEstrategiaBusquedaDefault = (): EstrategiaBusqueda => {
  return new EstrategiaBusquedaIA(new GroqAdapter(), new EstrategiaBusquedaBDD());
};

export class ProductService {
  constructor(
    private readonly estrategiaBusqueda: EstrategiaBusqueda = crearEstrategiaBusquedaDefault(),
  ) {}

  private mapProduct(product: ProductRecord): Product {
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

  async buscarProductos(filtros: ProductQueryFilters): Promise<Product[]> {
    const {
      search: busqueda,
      category: categoria,
      minPrice: precioMinimo = 0,
      maxPrice: precioMaximo = Number.MAX_SAFE_INTEGER,
      sortBy: orden = 'relevance',
      ownerId: idPropietario,
    } = filtros;

    let filtroIdProveedor: number | undefined;

    if (typeof idPropietario === 'number') {
      const idProveedorPropietario = await this.findSupplierForOwner(idPropietario);
      if (!idProveedorPropietario) {
        return [];
      }

      filtroIdProveedor = idProveedorPropietario;
    }

    const productosDesdeDb = await prisma.product.findMany({
      where: {
        activeState: true,
        price: {
          gte: precioMinimo,
          lte: precioMaximo,
        },
        ...(filtroIdProveedor ? { supplierId: filtroIdProveedor } : {}),
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    let productos: Product[] = productosDesdeDb.map((producto: ProductRecord) =>
      this.mapProduct(producto),
    );

    if (busqueda && busqueda.trim() !== '') {
      productos = await this.estrategiaBusqueda.buscar(busqueda, productos);
    }

    if (categoria && categoria.trim() !== '') {
      const categoriaNormalizada = categoryMap[categoria] ?? categoria.toLowerCase();
      productos = productos.filter((producto) =>
        producto.category.toLowerCase().includes(categoriaNormalizada),
      );
    }

    productos = productos.filter(
      (producto) => producto.price >= precioMinimo && producto.price <= precioMaximo,
    );

    switch (orden) {
      case 'price_asc':
        productos.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        productos.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        productos.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return productos;
  }

  async obtenerPorId(id: string): Promise<Product | undefined> {
    const idProducto = Number(id);

    if (!Number.isFinite(idProducto)) {
      return undefined;
    }

    const producto = await prisma.product.findFirst({
      where: {
        id: idProducto,
        activeState: true,
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    if (!producto) {
      return undefined;
    }

    return this.mapProduct(producto);
  }

  async obtenerDestacados(limite = 8): Promise<Product[]> {
    const productos = await prisma.product.findMany({
      where: { activeState: true },
      include: {
        category: true,
        supplier: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limite,
    });

    return productos.map((producto: ProductRecord) => this.mapProduct(producto));
  }

  async registrarProducto(entrada: ProductMutationInput): Promise<Product> {
    const [idCategoria, idProveedor] = await Promise.all([
      this.ensureCategory(entrada.category),
      this.ensureSupplierForOwner(entrada.ownerId),
    ]);

    const creado = await prisma.product.create({
      data: {
        name: entrada.title.trim(),
        description: entrada.description.trim(),
        price: entrada.price,
        stock: entrada.stock,
        imagePath: entrada.image,
        categoryId: idCategoria,
        supplierId: idProveedor,
        activeState: true,
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    return this.mapProduct(creado);
  }

  async actualizarProducto(id: string, entrada: ProductUpdateInput): Promise<Product | undefined> {
    const idProducto = Number(id);

    if (!Number.isFinite(idProducto)) {
      return undefined;
    }

    const idProveedorPropietario = await this.findSupplierForOwner(entrada.ownerId);

    if (!idProveedorPropietario) {
      return undefined;
    }

    const existente = await prisma.product.findFirst({
      where: {
        id: idProducto,
        activeState: true,
        supplierId: idProveedorPropietario,
      },
    });

    if (!existente) {
      return undefined;
    }

    const idCategoria = entrada.category ? await this.ensureCategory(entrada.category) : undefined;

    const actualizado = await prisma.product.update({
      where: { id: idProducto },
      data: {
        ...(entrada.title !== undefined ? { name: entrada.title.trim() } : {}),
        ...(entrada.description !== undefined ? { description: entrada.description.trim() } : {}),
        ...(entrada.price !== undefined ? { price: entrada.price } : {}),
        ...(entrada.stock !== undefined ? { stock: entrada.stock } : {}),
        ...(entrada.image !== undefined ? { imagePath: entrada.image } : {}),
        ...(idCategoria ? { categoryId: idCategoria } : {}),
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    return this.mapProduct(actualizado);
  }

  async eliminarProducto(id: string, idPropietario: number): Promise<boolean> {
    const idProducto = Number(id);

    if (!Number.isFinite(idProducto)) {
      return false;
    }

    const idProveedorPropietario = await this.findSupplierForOwner(idPropietario);

    if (!idProveedorPropietario) {
      return false;
    }

    const existente = await prisma.product.findFirst({
      where: {
        id: idProducto,
        activeState: true,
        supplierId: idProveedorPropietario,
      },
      select: { id: true },
    });

    if (!existente) {
      return false;
    }

    await prisma.product.delete({ where: { id: idProducto } });
    return true;
  }
}

export const productService = new ProductService();
