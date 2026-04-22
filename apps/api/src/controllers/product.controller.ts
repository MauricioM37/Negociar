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

  getProducts = async (req: Request, res: Response): Promise<void> => {
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

    const products = await productService.getProducts(filters);
    res.json(products);
  };

  getProductById = async (req: Request, res: Response): Promise<void> => {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!id) {
      res.status(400).json({ message: 'Product id is required' });
      return;
    }

    const product = await productService.getById(id);

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json(product);
  };

  getFeaturedProducts = async (_req: Request, res: Response): Promise<void> => {
    const products = await productService.getFeatured();
    res.json(products);
  };

  createProduct = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const title = typeof req.body?.title === 'string' ? req.body.title : '';
    const description = typeof req.body?.description === 'string' ? req.body.description : '';
    const category = typeof req.body?.category === 'string' ? req.body.category : '';
    const price = this.parseNumberParam(req.body?.price);
    const stock = this.parseNumberParam(req.body?.stock);
    const imagePath = req.file ? `/uploads/products/${req.file.filename}` : undefined;

    if (!title || !description || !category || price === undefined || stock === undefined) {
      res.status(400).json({ message: 'Title, description, category, price and stock are required' });
      return;
    }

    const created = await productService.create({
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

  updateProduct = async (req: Request, res: Response): Promise<void> => {
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

    const title = typeof req.body?.title === 'string' ? req.body.title : undefined;
    const description = typeof req.body?.description === 'string' ? req.body.description : undefined;
    const category = typeof req.body?.category === 'string' ? req.body.category : undefined;
    const price = this.parseNumberParam(req.body?.price);
    const stock = this.parseNumberParam(req.body?.stock);
    const imagePath = req.file ? `/uploads/products/${req.file.filename}` : undefined;

    if (!title && !description && !category && price === undefined && stock === undefined && !imagePath) {
      res.status(400).json({ message: 'At least one field is required to update the product' });
      return;
    }

    const updated = await productService.update(id, {
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

  deleteProduct = async (req: Request, res: Response): Promise<void> => {
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

    const deleted = await productService.delete(id, userId);

    if (!deleted) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.status(204).send();
  };
}

export const productController = new ProductController();
