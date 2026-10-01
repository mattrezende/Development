import express from 'express';
import { Enrollment, Schedule, Student } from '../models/index.js';
import authMiddleware from '../middleware/auth.js';
import { createNotification } from '../services/notifications.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
	const enrollments = await Enrollment.find({ teacherId: req.teacher._id })
		.sort({ createdAt: -1 })
		.populate('studentId')
		.populate('scheduleId');
	res.json({ enrollments });
});

// Manual/offline enrollment created directly by the teacher (no payment flow involved —
// see routes/mercado-pago.js for the public, payment-driven creation path).
router.post('/', async (req, res) => {
	const { studentId, scheduleId, enrollmentDate, status } = req.body;

	if (!studentId || !scheduleId) {
		return res.status(400).json({ error: 'studentId and scheduleId are required' });
	}

	const student = await Student.findOne({ _id: studentId, teacherId: req.teacher._id });
	if (!student) return res.status(404).json({ error: 'Student not found' });

	const schedule = await Schedule.findOne({ _id: scheduleId, teacherId: req.teacher._id });
	if (!schedule) return res.status(404).json({ error: 'Schedule not found' });

	const [firstName, ...rest] = (student.name || '').split(' ');

	const enrollment = await Enrollment.create({
		teacherId: req.teacher._id,
		studentId: student._id,
		scheduleId: schedule._id,
		firstName: firstName || student.name,
		lastName: rest.join(' '),
		email: student.email,
		phoneNumber: student.phone,
		enrollmentDate: enrollmentDate || new Date(),
		status: status || 'active',
	});

	if (enrollment.status === 'active') {
		await Schedule.findByIdAndUpdate(schedule._id, { availabilityStatus: 'Ocupado' });
	}

	await createNotification(
		req.teacher._id,
		'new_enrollment',
		'Nova matrícula',
		`${student.name} foi matriculado(a)`,
		{ studentId: student._id, enrollmentId: enrollment._id },
	);

	res.status(201).json({ enrollment });
});

router.get('/:id', async (req, res) => {
	const enrollment = await Enrollment.findOne({ _id: req.params.id, teacherId: req.teacher._id });
	if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });
	res.json({ enrollment });
});

router.patch('/:id', async (req, res) => {
	const { teacherId, paymentStatus, ...updates } = req.body;

	const existing = await Enrollment.findOne({ _id: req.params.id, teacherId: req.teacher._id });
	if (!existing) return res.status(404).json({ error: 'Enrollment not found' });

	if (paymentStatus && paymentStatus !== existing.paymentStatus) {
		updates.paymentStatus = paymentStatus;
	}

	const enrollment = await Enrollment.findOneAndUpdate(
		{ _id: req.params.id, teacherId: req.teacher._id },
		updates,
		{ new: true },
	);

	if (paymentStatus === 'rejected' && existing.paymentStatus !== 'rejected') {
		await createNotification(
			req.teacher._id,
			'student_cancelled',
			'Matrícula cancelada',
			'Um aluno cancelou a matrícula',
			{ enrollmentId: enrollment._id },
		);

		if (enrollment.scheduleId) {
			await Schedule.findOneAndUpdate(
				{ _id: enrollment.scheduleId, teacherId: req.teacher._id },
				{ availabilityStatus: 'Disponível', reservedAt: null },
			);
		}
	}

	if (updates.status && updates.status !== existing.status && enrollment.scheduleId) {
		await Schedule.findOneAndUpdate(
			{ _id: enrollment.scheduleId, teacherId: req.teacher._id },
			{ availabilityStatus: updates.status === 'active' ? 'Ocupado' : 'Disponível' },
		);
	}

	res.json({ enrollment });
});

router.delete('/:id', async (req, res) => {
	const enrollment = await Enrollment.findOneAndDelete({ _id: req.params.id, teacherId: req.teacher._id });
	if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });

	if (enrollment.status === 'active' && enrollment.scheduleId) {
		await Schedule.findOneAndUpdate(
			{ _id: enrollment.scheduleId, teacherId: req.teacher._id },
			{ availabilityStatus: 'Disponível', reservedAt: null },
		);
	}

	res.json({ success: true });
});

export default router;
