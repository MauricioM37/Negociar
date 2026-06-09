import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { authRouter } from './routes/auth.routes';
import { productRouter } from './routes/product.routes';

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/products', productRouter);
app.use('/api/auth', authRouter);

app.listen(port, () => {
  console.log(`api listening on http://localhost:${port}`);
});
