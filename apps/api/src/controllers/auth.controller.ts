import type { Request, Response } from 'express';
import { authService } from '../services/auth.service';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unexpected error';
};

class AuthController {
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const email = typeof req.body?.email === 'string' ? req.body.email : '';
      const password = typeof req.body?.password === 'string' ? req.body.password : '';

      if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
      }

      const result = await authService.login({ email, password });
      res.json(result);
    } catch (error) {
      const message = getErrorMessage(error);
      const statusCode = message === 'Invalid credentials' ? 401 : 400;
      res.status(statusCode).json({ message });
    }
  };

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const email = typeof req.body?.email === 'string' ? req.body.email : '';
      const password = typeof req.body?.password === 'string' ? req.body.password : '';
      const name = typeof req.body?.name === 'string' ? req.body.name : '';

      if (!email || !password || !name) {
        res.status(400).json({ message: 'Name, email and password are required' });
        return;
      }

      const result = await authService.register({ email, password, name });
      res.status(201).json(result);
    } catch (error) {
      const message = getErrorMessage(error);
      const statusCode = message === 'Email already registered' ? 409 : 400;
      res.status(statusCode).json({ message });
    }
  };
}

export const authController = new AuthController();
