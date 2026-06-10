import { z } from 'zod';

const requiredText = z.string().trim().min(1, { error: 'Required field must not be empty' });

const numberInput = (schema: z.ZodType<number>) =>
  z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    schema,
  );

const priceInput = numberInput(
  z.coerce.number({ error: 'Price must be a number' }).min(0, { error: 'Price must be non-negative' }),
);
const stockInput = numberInput(
  z.coerce
    .number({ error: 'Stock must be a number' })
    .int({ error: 'Stock must be an integer' })
    .min(0, { error: 'Stock must be non-negative' }),
);

export const createProductSchema = z.object({
  title: requiredText,
  description: requiredText,
  category: requiredText,
  price: priceInput,
  stock: stockInput,
});

export const updateProductSchema = createProductSchema
  .partial()
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    error: 'At least one field is required to update the product',
  });

export type CreateProductBody = z.infer<typeof createProductSchema>;
export type UpdateProductBody = z.infer<typeof updateProductSchema>;
