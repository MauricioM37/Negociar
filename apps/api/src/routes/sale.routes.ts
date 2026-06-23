import { Router, type Router as ExpressRouter } from 'express';
import { saleController } from '../controllers/sale.controller';

export const saleRouter: ExpressRouter = Router();

saleRouter.post('/checkout', saleController.checkout);
