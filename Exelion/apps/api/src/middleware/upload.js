import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_ROOT = path.join(__dirname, '../../uploads');

function storageFor(subdir) {
	return multer.diskStorage({
		destination: (req, _file, cb) => {
			const dir = path.join(UPLOADS_ROOT, String(req.teacher._id), subdir);
			fs.mkdirSync(dir, { recursive: true });
			cb(null, dir);
		},
		filename: (_req, file, cb) => {
			const ext = path.extname(file.originalname);
			cb(null, `${Date.now()}${ext}`);
		},
	});
}

const imageFilter = (_req, file, cb) => {
	if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.mimetype)) {
		return cb(new Error('Only jpeg, png, gif or webp images are allowed'));
	}
	cb(null, true);
};

const documentFilter = (_req, file, cb) => {
	if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.mimetype)) {
		return cb(new Error('Only jpeg, png, webp images or PDF files are allowed'));
	}
	cb(null, true);
};

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const uploadImage = (subdir) =>
	multer({ storage: storageFor(subdir), fileFilter: imageFilter, limits: { fileSize: MAX_FILE_SIZE } });

const uploadDocument = (subdir) =>
	multer({ storage: storageFor(subdir), fileFilter: documentFilter, limits: { fileSize: MAX_FILE_SIZE } });

function relativePath(file) {
	return path.relative(UPLOADS_ROOT, file.path).split(path.sep).join('/');
}

export { UPLOADS_ROOT, uploadImage, uploadDocument, relativePath };
