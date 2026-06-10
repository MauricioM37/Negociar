import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt';

export interface AuthTokenPayload {
  id: number;
  role: string;
  email: string | null;
  name: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const token = authHeader.slice('Bearer '.length).trim();

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded === 'string' || !decoded) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }

    const user = {
      id: Number(decoded.id),
      role: String(decoded.role),
      email: decoded.email ? String(decoded.email) : null,
      name: String(decoded.name ?? ''),
    };

    if (!Number.isFinite(user.id) || !user.role) {
      res.status(401).json({ message: 'Invalid token payload' });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

export const requireRole = (roleName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (req.user.role !== roleName) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    next();
  };
};
