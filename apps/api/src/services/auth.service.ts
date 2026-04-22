import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@Negociar/db/src/client';
import { JWT_EXPIRES_IN, JWT_SECRET } from '../config/jwt';

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface AuthUser {
  id: number;
  email: string | null;
  name: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

const SALT_ROUNDS = 10;
const JWT_SIGN_OPTIONS: jwt.SignOptions = {
  expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
};

const sanitizeUsername = (email: string): string => {
  return email.split('@')[0]?.replace(/[^a-zA-Z0-9_.-]/g, '').slice(0, 120) || 'user';
};

const buildAuthResponse = (payload: AuthUser): AuthResponse => {
  const token = jwt.sign(payload, JWT_SECRET, JWT_SIGN_OPTIONS);
  return { token, user: payload };
};

class AuthService {
  async login(input: LoginInput): Promise<AuthResponse> {
    const email = input.email.trim().toLowerCase();

    const user = await prisma.user.findFirst({
      where: { email },
      include: { role: true },
    });

    if (!user?.passwordHash) {
      throw new Error('Invalid credentials');
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);

    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.fullName,
      role: user.role?.name ?? 'user',
    };

    return buildAuthResponse(authUser);
  }

  async register(input: RegisterInput): Promise<AuthResponse> {
    const email = input.email.trim().toLowerCase();
    const existingUser = await prisma.user.findFirst({ where: { email } });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    const userRole = await prisma.role.findFirst({ where: { name: 'user' } });

    if (!userRole) {
      throw new Error("Role 'user' not found");
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const createdUser = await prisma.user.create({
      data: {
        email,
        fullName: input.name.trim(),
        username: sanitizeUsername(email),
        passwordHash,
        roleId: userRole.id,
        activeState: true,
      },
      include: { role: true },
    });

    const authUser: AuthUser = {
      id: createdUser.id,
      email: createdUser.email,
      name: createdUser.fullName,
      role: createdUser.role?.name ?? 'user',
    };

    return buildAuthResponse(authUser);
  }
}

export const authService = new AuthService();
