import express from 'express';
import { Student } from '../models/index.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
	const students = await Student.find({ teacherId: req.teacher._id }).sort({ createdAt: -1 });
	res.json({ students });
});

router.get('/:id', async (req, res) => {
	const student = await Student.findOne({ _id: req.params.id, teacherId: req.teacher._id });
	if (!student) return res.status(404).json({ error: 'Student not found' });
	res.json({ student });
});

router.post('/', async (req, res) => {
	const student = await Student.create({ ...req.body, teacherId: req.teacher._id });
	res.status(201).json({ student });
});

router.patch('/:id', async (req, res) => {
	const { teacherId, ...updates } = req.body;
	const student = await Student.findOneAndUpdate(
		{ _id: req.params.id, teacherId: req.teacher._id },
		updates,
		{ new: true },
	);
	if (!student) return res.status(404).json({ error: 'Student not found' });
	res.json({ student });
});

router.delete('/:id', async (req, res) => {
	const student = await Student.findOneAndDelete({ _id: req.params.id, teacherId: req.teacher._id });
	if (!student) return res.status(404).json({ error: 'Student not found' });
	res.json({ success: true });
});

export default router;
