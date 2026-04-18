import express from 'express';
import { userSchema } from '@my-turbo/schema';

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(express.json());

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
