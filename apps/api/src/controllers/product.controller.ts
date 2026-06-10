import type { Request, Response } from 'express';
import type { ProductQueryFilters, ProductSortOption } from '../types/product';
import { productService } from '../services/product.service';

const isSortOption = (value: string): value is ProductSortOption => {
  return ['relevance', 'price_asc', 'price_desc', 'rating'].includes(value);
};

export class ProductController {
  private parseNumberParam(value: unknown): number | undefined {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value !== 'string' || value.trim() === '') {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  buscarProductos = async (req: Request, res: Response): Promise<void> => {
    const sortParam = typeof req.query.sortBy === 'string' ? req.query.sortBy : undefined;
    const sortBy = sortParam && isSortOption(sortParam) ? sortParam : 'relevance';

    const filters: ProductQueryFilters = {
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      category: typeof req.query.category === 'string' ? req.query.category : undefined,
      minPrice: this.parseNumberParam(req.query.minPrice),
      maxPrice: this.parseNumberParam(req.query.maxPrice),
      sortBy,
      ownerId: typeof req.query.ownerId === 'string' ? this.parseNumberParam(req.query.ownerId) : undefined,
    };

    const products = await productService.buscarProductos(filters);
    res.json(products);
  };

  obtenerProductoPorId = async (req: Request, res: Response): Promise<void> => {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!id) {
      res.status(400).json({ message: 'Product id is required' });
      return;
    }

    const product = await productService.obtenerPorId(id);

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json(product);
  };

  obtenerProductosDestacados = async (_req: Request, res: Response): Promise<void> => {
    const products = await productService.obtenerDestacados();
    res.json(products);
  };

  registrarProducto = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { title, description, category, price, stock } = req.body;
    const imagePath = req.file ? `/uploads/products/${req.file.filename}` : undefined;

    const created = await productService.registrarProducto({
      title,
      description,
      category,
      price,
      stock,
      image: imagePath,
      ownerId: userId,
    });

    res.status(201).json(created);
  };

  actualizarProducto = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!id) {
      res.status(400).json({ message: 'Product id is required' });
      return;
    }

    const { title, description, category, price, stock } = req.body;
    const imagePath = req.file ? `/uploads/products/${req.file.filename}` : undefined;

    if (!title && !description && !category && price === undefined && stock === undefined && !imagePath) {
      res.status(400).json({ message: 'At least one field is required to update the product' });
      return;
    }

    const updated = await productService.actualizarProducto(id, {
      title,
      description,
      category,
      price,
      stock,
      image: imagePath,
      ownerId: userId,
    });

    if (!updated) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json(updated);
  };

  eliminarProducto = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!id) {
      res.status(400).json({ message: 'Product id is required' });
      return;
    }

    const deleted = await productService.eliminarProducto(id, userId);

    if (!deleted) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.status(204).send();
  };
}

export const productController = new ProductController();
