import express from 'express';
import {
	Teacher,
	Schedule,
	Pricing,
	ServiceArea,
	TermsAndCondition,
	Enrollment,
} from '../models/index.js';

const router = express.Router();

router.get('/teachers/:id', async (req, res) => {
	const teacher = await Teacher.findById(req.params.id);
	if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
	res.json({ teacher });
});

router.get('/teachers/:id/schedules', async (req, res) => {
	const schedules = await Schedule.find({ teacherId: req.params.id }).sort({ dayOfWeek: 1, startTime: 1 });
	res.json({ schedules });
});

router.get('/teachers/:id/pricing', async (req, res) => {
	const pricing = await Pricing.find({ teacherId: req.params.id }).sort({ type: 1, quantity: 1 });
	res.json({ pricing });
});

router.get('/teachers/:id/service-areas', async (req, res) => {
	const serviceAreas = await ServiceArea.find({ teacherId: req.params.id });
	res.json({ serviceAreas });
});

router.get('/teachers/:id/terms', async (req, res) => {
	const terms = await TermsAndCondition.findOne({ teacherId: req.params.id });
	res.json({ terms });
});

router.get('/enrollments/:id', async (req, res) => {
	const enrollment = await Enrollment.findById(req.params.id)
		.populate('teacherId')
		.populate('studentId')
		.populate('scheduleId');
	if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });
	res.json({ enrollment });
});

export default router;
