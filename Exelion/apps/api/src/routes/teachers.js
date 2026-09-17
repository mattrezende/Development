import express from 'express';
import bcrypt from 'bcryptjs';
import { Teacher } from '../models/index.js';
import authMiddleware from '../middleware/auth.js';
import { uploadImage, relativePath } from '../middleware/upload.js';

const router = express.Router();

const ALLOWED_FIELDS = [
	'name',
	'professionalDescription',
	'contactPhone',
	'contactEmail',
	'baseAddress',
	'baseCity',
	'mercadoPagoPublicKey',
	'mercadoPagoAccessToken',
	'instagramUsername',
	'singleLessonPrice',
];

router.use(authMiddleware);

router.patch('/me', async (req, res) => {
	const updates = {};
	for (const field of ALLOWED_FIELDS) {
		if (field in req.body) updates[field] = req.body[field];
	}

	if (req.body.password) {
		if (req.body.password.length < 8) {
			return res.status(400).json({ error: 'Password must be at least 8 characters' });
		}
		updates.passwordHash = await bcrypt.hash(req.body.password, 10);
	}

	const teacher = await Teacher.findByIdAndUpdate(req.teacher._id, updates, { new: true }).select(
		'+mercadoPagoAccessToken',
	);
	res.json({ teacher });
});

router.patch('/me/banner', uploadImage('banner').single('file'), async (req, res) => {
	if (!req.file) {
		return res.status(400).json({ error: 'No file uploaded' });
	}

	const teacher = await Teacher.findByIdAndUpdate(
		req.teacher._id,
		{ bannerImagePath: relativePath(req.file) },
		{ new: true },
	);
	res.json({ teacher });
});

router.patch('/me/profile-photo', uploadImage('profile').single('file'), async (req, res) => {
	if (!req.file) {
		return res.status(400).json({ error: 'No file uploaded' });
	}

	const teacher = await Teacher.findByIdAndUpdate(
		req.teacher._id,
		{ profilePhotoPath: relativePath(req.file) },
		{ new: true },
	);
	res.json({ teacher });
});

export default router;
