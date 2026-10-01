import express from 'express';
import { Notification } from '../models/index.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
	const notifications = await Notification.find({ teacherId: req.teacher._id }).sort({ createdAt: -1 });
	res.json({ notifications });
});

router.patch('/:id', async (req, res) => {
	const notification = await Notification.findOneAndUpdate(
		{ _id: req.params.id, teacherId: req.teacher._id },
		{ read: req.body.read },
		{ new: true },
	);
	if (!notification) return res.status(404).json({ error: 'Notification not found' });
	res.json({ notification });
});

router.delete('/:id', async (req, res) => {
	const notification = await Notification.findOneAndDelete({ _id: req.params.id, teacherId: req.teacher._id });
	if (!notification) return res.status(404).json({ error: 'Notification not found' });
	res.json({ success: true });
});

export default router;
