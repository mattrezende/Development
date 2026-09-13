import express from 'express';
import { Schedule } from '../models/index.js';
import authMiddleware from '../middleware/auth.js';
import { createNotification } from '../services/notifications.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
	const schedules = await Schedule.find({ teacherId: req.teacher._id }).sort({ dayOfWeek: 1, startTime: 1 });
	res.json({ schedules });
});

router.post('/', async (req, res) => {
	const schedule = await Schedule.create({ ...req.body, teacherId: req.teacher._id });
	res.status(201).json({ schedule });
});

router.patch('/:id', async (req, res) => {
	const { teacherId, ...updates } = req.body;

	const existing = await Schedule.findOne({ _id: req.params.id, teacherId: req.teacher._id });
	if (!existing) return res.status(404).json({ error: 'Schedule not found' });

	const wasOcupado = existing.availabilityStatus === 'Ocupado';

	const schedule = await Schedule.findOneAndUpdate(
		{ _id: req.params.id, teacherId: req.teacher._id },
		updates,
		{ new: true },
	);

	if (!wasOcupado && schedule.availabilityStatus === 'Ocupado') {
		await createNotification(
			req.teacher._id,
			'schedule_booked',
			'Horário ocupado',
			'Um horário foi marcado como ocupado',
			{ scheduleId: schedule._id },
		);
	}

	res.json({ schedule });
});

router.delete('/:id', async (req, res) => {
	const schedule = await Schedule.findOneAndDelete({ _id: req.params.id, teacherId: req.teacher._id });
	if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
	res.json({ success: true });
});

export default router;
