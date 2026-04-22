import { Router, type Router as ExpressRouter } from 'express';
import { authController } from '../controllers/auth.controller';

export const authRouter: ExpressRouter = Router();

authRouter.post('/login', authController.login);
authRouter.post('/register', authController.register);
