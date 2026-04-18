# my-turbo-app

Turborepo monorepo using pnpm with:

- `apps/web`: React + Vite
- `apps/api`: Express API
- `packages/db`: Prisma (PostgreSQL) package
- `packages/schema`: Shared Zod schemas
- `packages/config`: Shared ESLint, Jest and TS config

## Quick start

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Generate Prisma client:

   ```bash
   pnpm db:generate
   ```

3. Optional migration (requires PostgreSQL and `DATABASE_URL`):

   ```bash
   pnpm db:migrate
   ```
