import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { userSchema } from '@Negociar/schema';
import { productRouter } from './routes/product.routes';
import { authRouter } from './routes/auth.routes';

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/products', productRouter);
app.use('/api/auth', authRouter);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/users/validate', (req, res) => {
  const parsed = userSchema.safeParse(req.body?.user);

  if (!parsed.success) {
    return res.status(400).json({ ok: false, issues: parsed.error.issues });
  }

  return res.json({ ok: true, data: parsed.data });
});

app.listen(port, () => {
  console.log(`api listening on http://localhost:${port}`);
});
