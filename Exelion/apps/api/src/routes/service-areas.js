import express from 'express';
import { ServiceArea } from '../models/index.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
	const serviceAreas = await ServiceArea.find({ teacherId: req.teacher._id });
	res.json({ serviceAreas });
});

router.post('/', async (req, res) => {
	const serviceArea = await ServiceArea.create({ ...req.body, teacherId: req.teacher._id });
	res.status(201).json({ serviceArea });
});

router.patch('/:id', async (req, res) => {
	const { teacherId, ...updates } = req.body;
	const serviceArea = await ServiceArea.findOneAndUpdate(
		{ _id: req.params.id, teacherId: req.teacher._id },
		updates,
		{ new: true },
	);
	if (!serviceArea) return res.status(404).json({ error: 'Service area not found' });
	res.json({ serviceArea });
});

router.delete('/:id', async (req, res) => {
	const serviceArea = await ServiceArea.findOneAndDelete({ _id: req.params.id, teacherId: req.teacher._id });
	if (!serviceArea) return res.status(404).json({ error: 'Service area not found' });
	res.json({ success: true });
});

export default router;
