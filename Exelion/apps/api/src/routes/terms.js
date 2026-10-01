import express from 'express';
import { TermsAndCondition } from '../models/index.js';
import authMiddleware from '../middleware/auth.js';
import { uploadDocument, relativePath } from '../middleware/upload.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
	const terms = await TermsAndCondition.findOne({ teacherId: req.teacher._id });
	res.json({ terms });
});

router.put('/', async (req, res) => {
	const { contentText } = req.body;
	const terms = await TermsAndCondition.findOneAndUpdate(
		{ teacherId: req.teacher._id },
		{ contentText },
		{ new: true, upsert: true },
	);
	res.json({ terms });
});

router.patch('/document', uploadDocument('terms').single('file'), async (req, res) => {
	if (!req.file) {
		return res.status(400).json({ error: 'No file uploaded' });
	}

	const terms = await TermsAndCondition.findOneAndUpdate(
		{ teacherId: req.teacher._id },
		{ documentUrlPath: relativePath(req.file) },
		{ new: true, upsert: true },
	);
	res.json({ terms });
});

export default router;
