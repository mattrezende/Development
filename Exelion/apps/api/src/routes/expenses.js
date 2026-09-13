import express from 'express';
import { Expense } from '../models/index.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
	const expenses = await Expense.find({ teacherId: req.teacher._id }).sort({ date: -1 });
	res.json({ expenses });
});

router.post('/', async (req, res) => {
	const expense = await Expense.create({ ...req.body, teacherId: req.teacher._id });
	res.status(201).json({ expense });
});

router.patch('/:id', async (req, res) => {
	const { teacherId, ...updates } = req.body;
	const expense = await Expense.findOneAndUpdate(
		{ _id: req.params.id, teacherId: req.teacher._id },
		updates,
		{ new: true },
	);
	if (!expense) return res.status(404).json({ error: 'Expense not found' });
	res.json({ expense });
});

router.delete('/:id', async (req, res) => {
	const expense = await Expense.findOneAndDelete({ _id: req.params.id, teacherId: req.teacher._id });
	if (!expense) return res.status(404).json({ error: 'Expense not found' });
	res.json({ success: true });
});

export default router;
