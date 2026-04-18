import { z } from 'zod';

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.email(),
  name: z.string().min(1)
});

export type User = z.infer<typeof userSchema>;
