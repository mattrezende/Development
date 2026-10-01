import express from 'express';
import rateLimit from 'express-rate-limit';
import crypto from 'node:crypto';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { Schedule, Enrollment } from '../models/index.js';
import { createNotification } from '../services/notifications.js';
import logger from '../utils/logger.js';

const router = express.Router();

const client = new MercadoPagoConfig({
	accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

const preference = new Preference(client);
const payment = new Payment(client);

const paymentRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: 'Too many payment requests, please try again later' },
	validate: { trustProxy: false },
});

// Idempotency for webhook deliveries (Mercado Pago may deliver the same event more than once)
const processedWebhooks = new Map();
const MAX_PROCESSED_WEBHOOKS = 1000;

function validateWebhookSignature(req) {
	const webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
	if (!webhookSecret) {
		logger.warn('MERCADO_PAGO_WEBHOOK_SECRET not set — skipping signature validation');
		return true;
	}

	const xSignature = req.headers['x-signature'];
	const xRequestId = req.headers['x-request-id'];
	if (!xSignature) return false;

	const parts = Object.fromEntries(xSignature.split(',').map((p) => p.trim().split('=')));
	const ts = parts['ts'];
	const v1 = parts['v1'];
	if (!ts || !v1) return false;

	const { id } = req.body;
	const manifest = `id:${id};request-id:${xRequestId};ts:${ts};`;
	const expected = crypto.createHmac('sha256', webhookSecret).update(manifest).digest('hex');

	try {
		return crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(expected));
	} catch {
		return false;
	}
}

function isValidCPF(cpf) {
	return /^\d{11}$/.test(cpf);
}

/**
 * POST /mercado-pago/create-preference
 * Reserves a schedule slot, creates a pending enrollment, and creates a Mercado Pago
 * payment preference for it. This is the single, canonical enrollment+payment flow —
 * see routes/enrollments.js for the separate teacher-authenticated manual-enrollment path.
 */
router.post('/create-preference', paymentRateLimit, async (req, res) => {
	const {
		teacherId,
		teacherName,
		studentData = {},
		enrollmentType,
		lessonType,
		quantity,
		scheduleId,
		dayOfWeek,
		startTime,
		endTime,
		amount,
		paymentMethod,
	} = req.body;

	const {
		firstName,
		lastName,
		email,
		cpf,
		documentType,
		areaCode,
		phoneNumber,
		zipCode,
		street,
		streetNumber,
		neighborhood,
		city,
		state,
	} = studentData;

	if (
		!teacherId ||
		!teacherName ||
		!firstName ||
		!lastName ||
		!email ||
		!cpf ||
		!documentType ||
		!areaCode ||
		!phoneNumber ||
		!enrollmentType ||
		!lessonType ||
		!scheduleId ||
		!dayOfWeek ||
		!startTime ||
		!endTime
	) {
		return res.status(400).json({ error: 'Missing required enrollment fields' });
	}

	if (!isValidCPF(cpf)) {
		return res.status(400).json({ error: 'CPF must have 11 digits' });
	}

	if (!/^\d{2}$/.test(areaCode)) {
		return res.status(400).json({ error: 'areaCode must have 2 digits' });
	}

	if (!/^\d{8,9}$/.test(phoneNumber)) {
		return res.status(400).json({ error: 'phoneNumber must have 8 or 9 digits' });
	}

	if (state && !/^[A-Z]{2}$/.test(state)) {
		return res.status(400).json({ error: 'state must be 2 uppercase letters' });
	}

	if (zipCode && !/^\d{8}$/.test(zipCode)) {
		return res.status(400).json({ error: 'zipCode must have 8 digits' });
	}

	if (!['avulso', 'semanal'].includes(enrollmentType)) {
		return res.status(400).json({ error: 'enrollmentType must be avulso or semanal' });
	}

	if (!['weekly', 'single'].includes(lessonType)) {
		return res.status(400).json({ error: 'lessonType must be weekly or single' });
	}

	if (typeof amount !== 'number' || amount <= 0) {
		return res.status(400).json({ error: 'amount must be a positive number' });
	}

	// Atomically reserve the schedule — fails if it's not currently available
	const schedule = await Schedule.findOneAndUpdate(
		{ _id: scheduleId, teacherId, availabilityStatus: 'Disponível' },
		{ availabilityStatus: 'Reservado', reservedAt: new Date() },
		{ new: true },
	);

	if (!schedule) {
		return res.status(409).json({
			error: 'Este horário acabou de ser preenchido. Por favor, selecione outro horário.',
		});
	}

	const qty = quantity || 1;

	const enrollment = await Enrollment.create({
		teacherId,
		scheduleId,
		firstName,
		lastName,
		email,
		cpf,
		documentType,
		areaCode,
		phoneNumber,
		zipCode,
		street,
		streetNumber,
		neighborhood,
		city,
		state,
		enrollmentType,
		lessonType,
		quantity: qty,
		unitPrice: amount / qty,
		totalPrice: amount,
		paymentMethod: paymentMethod || 'pix',
		paymentStatus: 'pending',
	});

	await createNotification(
		teacherId,
		'new_enrollment',
		'Nova matrícula',
		`${firstName} ${lastName} iniciou uma matrícula`,
		{ enrollmentId: enrollment._id },
	);

	const mpPreference = await preference.create({
		body: {
			items: [
				{
					title: `Aula com ${teacherName}`,
					description: `Aula de ${dayOfWeek} de ${startTime} a ${endTime}`,
					unit_price: amount,
					quantity: 1,
					currency_id: 'BRL',
				},
			],
			payer: {
				name: firstName,
				surname: lastName,
				email,
				phone: { area_code: areaCode, number: phoneNumber },
			},
			notification_url: `${process.env.WEBHOOK_URL || 'http://localhost:3001'}/api/mercado-pago/webhook`,
			back_urls: {
				success: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/enrollment-success/${enrollment._id}`,
				failure: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/enrollment-failed`,
				pending: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/enrollment-success/${enrollment._id}`,
			},
			auto_return: 'approved',
			external_reference: String(enrollment._id),
		},
	});

	enrollment.paymentId = mpPreference.id;
	await enrollment.save();

	logger.info(`Mercado Pago preference ${mpPreference.id} created for enrollment ${enrollment._id}`);

	res.status(201).json({
		enrollmentId: enrollment._id,
		preferenceId: mpPreference.id,
		initPoint: mpPreference.init_point,
	});
});

/**
 * POST /mercado-pago/webhook
 * Receives payment notifications from Mercado Pago.
 */
router.post('/webhook', async (req, res) => {
	const { id, type, data } = req.body;

	if (!validateWebhookSignature(req)) {
		logger.warn(`Webhook signature validation failed for id=${id}`);
		return res.status(401).json({ error: 'Invalid signature' });
	}

	if (processedWebhooks.has(id)) {
		return res.status(200).json({ received: true });
	}

	processedWebhooks.set(id, true);
	if (processedWebhooks.size > MAX_PROCESSED_WEBHOOKS) {
		const firstKey = processedWebhooks.keys().next().value;
		processedWebhooks.delete(firstKey);
	}

	if (type !== 'payment') {
		return res.status(200).json({ received: true });
	}

	const paymentDetails = await payment.get({ id: data.id });

	const paymentStatus = paymentDetails.status;
	const paymentId = paymentDetails.id;
	const externalReference = paymentDetails.external_reference;
	const paymentMethod = paymentDetails.payment_method?.type || 'unknown';

	logger.info(`Processing payment ${paymentId} (${paymentStatus}) for enrollment ${externalReference}`);

	let mappedStatus = 'pending';
	if (paymentStatus === 'approved') mappedStatus = 'approved';
	else if (paymentStatus === 'rejected' || paymentStatus === 'cancelled') mappedStatus = 'rejected';

	const enrollment = await Enrollment.findByIdAndUpdate(
		externalReference,
		{ paymentStatus: mappedStatus, paymentId: String(paymentId), paymentMethod },
		{ new: true },
	);

	if (!enrollment) {
		logger.warn(`Webhook referenced unknown enrollment ${externalReference}`);
		return res.status(200).json({ received: true });
	}

	if (mappedStatus === 'approved' && enrollment.scheduleId) {
		await Schedule.findByIdAndUpdate(enrollment.scheduleId, {
			availabilityStatus: 'Ocupado',
			reservedAt: null,
		});
		await createNotification(
			enrollment.teacherId,
			'payment_approved',
			'Pagamento aprovado',
			`Pagamento de ${enrollment.firstName} ${enrollment.lastName} foi aprovado`,
			{ enrollmentId: enrollment._id },
		);
		await createNotification(
			enrollment.teacherId,
			'schedule_booked',
			'Horário reservado',
			'Um horário foi confirmado',
			{ scheduleId: enrollment.scheduleId },
		);
	} else if (mappedStatus === 'rejected' && enrollment.scheduleId) {
		await Schedule.findByIdAndUpdate(enrollment.scheduleId, {
			availabilityStatus: 'Disponível',
			reservedAt: null,
		});
		await createNotification(
			enrollment.teacherId,
			'payment_failed',
			'Pagamento recusado',
			`Pagamento de ${enrollment.firstName} ${enrollment.lastName} foi recusado`,
			{ enrollmentId: enrollment._id },
		);
	}

	res.status(200).json({ received: true });
});

/**
 * GET /mercado-pago/payment-status/:paymentId
 * Proxies a Mercado Pago payment lookup by its own payment id (not our enrollment id).
 */
router.get('/payment-status/:paymentId', async (req, res) => {
	const { paymentId } = req.params;

	const paymentDetails = await payment.get({ id: paymentId });

	res.json({
		status: paymentDetails.status,
		paymentId: paymentDetails.id,
		amount: paymentDetails.transaction_amount,
		paymentMethod: paymentDetails.payment_method?.type || 'unknown',
		createdAt: paymentDetails.date_created,
	});
});

export default router;
