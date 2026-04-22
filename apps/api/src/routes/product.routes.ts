import { Router, type Router as ExpressRouter } from 'express';
import { productController } from '../controllers/product.controller';
import { requireRole, verifyToken } from '../middlewares/auth.middleware';
import { productImageUpload } from '../config/multer';

export const productRouter: ExpressRouter = Router();

productRouter.get('/', productController.getProducts);
productRouter.get('/featured', productController.getFeaturedProducts);
productRouter.get('/:id', productController.getProductById);
productRouter.post(
  '/',
  verifyToken,
  requireRole('seller'),
  productImageUpload.single('image'),
  productController.createProduct,
);
productRouter.put(
  '/:id',
  verifyToken,
  requireRole('seller'),
  productImageUpload.single('image'),
  productController.updateProduct,
);
productRouter.delete('/:id', verifyToken, requireRole('seller'), productController.deleteProduct);
