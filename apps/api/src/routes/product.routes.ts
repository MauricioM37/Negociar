import { Router, type Router as ExpressRouter } from 'express';
import { productController } from '../controllers/product.controller';
import { requireRole, verifyToken } from '../middlewares/auth.middleware';
import { productImageUpload } from '../config/multer';
import { validateRequest } from '../middlewares/validateRequest';
import { createProductSchema, updateProductSchema } from '../schemas/product.schema';

export const productRouter: ExpressRouter = Router();
//traer productos
productRouter.get('/', productController.buscarProductos);
productRouter.get('/featured', productController.obtenerProductosDestacados);
productRouter.get('/:id', productController.obtenerProductoPorId);
productRouter.post(
  '/',
  verifyToken,
  requireRole('seller'),
  productImageUpload.single('image'),
  validateRequest(createProductSchema),
  productController.registrarProducto,
);
productRouter.put(
  '/:id',
  verifyToken,
  requireRole('seller'),
  productImageUpload.single('image'),
  validateRequest(updateProductSchema),
  productController.actualizarProducto,
);
productRouter.delete('/:id', verifyToken, requireRole('seller'), productController.eliminarProducto);
