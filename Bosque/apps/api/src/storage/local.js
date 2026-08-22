import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';

const UPLOAD_ROOT = path.join(process.cwd(), 'uploads');
const POSTAGENS_DIR = path.join(UPLOAD_ROOT, 'postagens');

fs.mkdirSync(POSTAGENS_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_FILES = 10;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, POSTAGENS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  }
});

export const uploadPostagemImagens = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error('Formato de imagem não suportado (use JPEG, PNG, GIF ou WebP)'));
      return;
    }
    cb(null, true);
  }
}).array('imagens', MAX_FILES);

export function urlFor(filename) {
  const relative = `/uploads/postagens/${filename}`;
  const base = process.env.PUBLIC_API_URL;
  return base ? `${base.replace(/\/$/, '')}${relative}` : relative;
}

export function filesToImagens(files = []) {
  return files.map((file) => ({ filename: file.filename, url: urlFor(file.filename) }));
}

export function deleteImagens(imagens = []) {
  for (const { filename } of imagens) {
    fs.rm(path.join(POSTAGENS_DIR, filename), { force: true }, () => {});
  }
}

export { UPLOAD_ROOT };
