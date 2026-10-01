import express from 'express';
import { ExpenseCategory } from '../models/index.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
	const categories = await ExpenseCategory.find({ teacherId: req.teacher._id });
	res.json({ categories });
});

router.post('/', async (req, res) => {
	const category = await ExpenseCategory.create({ ...req.body, teacherId: req.teacher._id });
	res.status(201).json({ category });
});

router.patch('/:id', async (req, res) => {
	const { teacherId, ...updates } = req.body;
	const category = await ExpenseCategory.findOneAndUpdate(
		{ _id: req.params.id, teacherId: req.teacher._id },
		updates,
		{ new: true },
	);
	if (!category) return res.status(404).json({ error: 'Category not found' });
	res.json({ category });
});

router.delete('/:id', async (req, res) => {
	const category = await ExpenseCategory.findOneAndDelete({ _id: req.params.id, teacherId: req.teacher._id });
	if (!category) return res.status(404).json({ error: 'Category not found' });
	res.json({ success: true });
});

export default router;
