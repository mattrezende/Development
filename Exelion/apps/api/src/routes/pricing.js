import express from 'express';
import { Pricing } from '../models/index.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
	const pricing = await Pricing.find({ teacherId: req.teacher._id }).sort({ type: 1, quantity: 1 });
	res.json({ pricing });
});

router.post('/', async (req, res) => {
	const item = await Pricing.create({ ...req.body, teacherId: req.teacher._id });
	res.status(201).json({ pricing: item });
});

router.patch('/:id', async (req, res) => {
	const { teacherId, ...updates } = req.body;
	const item = await Pricing.findOneAndUpdate(
		{ _id: req.params.id, teacherId: req.teacher._id },
		updates,
		{ new: true },
	);
	if (!item) return res.status(404).json({ error: 'Pricing entry not found' });
	res.json({ pricing: item });
});

router.delete('/:id', async (req, res) => {
	const item = await Pricing.findOneAndDelete({ _id: req.params.id, teacherId: req.teacher._id });
	if (!item) return res.status(404).json({ error: 'Pricing entry not found' });
	res.json({ success: true });
});

export default router;
