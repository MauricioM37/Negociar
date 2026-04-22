const FALLBACK_JWT_SECRET = 'dev-jwt-secret-change-me';

export const JWT_SECRET = process.env.JWT_SECRET ?? FALLBACK_JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET is required in production');
}
