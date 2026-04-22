import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';

const uploadsRootDir = path.join(__dirname, '../../uploads');
const productsUploadsDir = path.join(uploadsRootDir, 'products');

if (!fs.existsSync(productsUploadsDir)) {
  fs.mkdirSync(productsUploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, productsUploadsDir);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension).replace(/[^a-zA-Z0-9_-]/g, '-');
    const safeBaseName = baseName.slice(0, 80) || 'product';
    callback(null, `${Date.now()}-${safeBaseName}${extension}`);
  },
});

export const productImageUpload = multer({ storage });
