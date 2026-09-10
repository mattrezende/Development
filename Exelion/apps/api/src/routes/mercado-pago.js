import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import crypto from 'node:crypto';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Initialize Mercado Pago client
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

const preference = new Preference(client);
const payment = new Payment(client);

// Rate limiting for payment endpoints
const paymentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many payment requests, please try again later' },
  validate: { trustProxy: false },
});

// Store for idempotency (in production, use Redis or database)
const processedWebhooks = new Map();

// In-process reservation timeouts with bounded size
const reservationTimeouts = new Map();
const MAX_RESERVATION_TIMEOUTS = 500;

function storeReservationTimeout(scheduleId, timeoutId) {
  if (reservationTimeouts.size >= MAX_RESERVATION_TIMEOUTS) {
    const firstKey = reservationTimeouts.keys().next().value;
    clearTimeout(reservationTimeouts.get(firstKey));
    reservationTimeouts.delete(firstKey);
  }
  reservationTimeouts.set(scheduleId, timeoutId);
}

function clearReservationTimeout(scheduleId) {
  if (reservationTimeouts.has(scheduleId)) {
    clearTimeout(reservationTimeouts.get(scheduleId));
    reservationTimeouts.delete(scheduleId);
  }
}

function validateWebhookSignature(req) {
  const webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.warn('MERCADO_PAGO_WEBHOOK_SECRET not set — skipping signature validation');
    return true;
  }

  const xSignature = req.headers['x-signature'];
  const xRequestId = req.headers['x-request-id'];
  if (!xSignature) return false;

  const parts = Object.fromEntries(
    xSignature.split(',').map((p) => p.trim().split('='))
  );
  const ts = parts['ts'];
  const v1 = parts['v1'];
  if (!ts || !v1) return false;

  const { id } = req.body;
  const manifest = `id:${id};request-id:${xRequestId};ts:${ts};`;
  const expected = crypto
    .createHmac('sha256', webhookSecret)
    .update(manifest)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(expected));
}

/**
 * POST /mercado-pago/create-preference
 * Creates a Mercado Pago preference for lesson enrollment payment
 */
router.post('/create-preference', paymentRateLimit, async (req, res) => {
  const {
    amount,
    studentName,
    studentEmail,
    studentPhone,
    teacherName,
    dayOfWeek,
    startTime,
    endTime,
    scheduleId,
    enrollmentId,
  } = req.body;

  // Input validation
  if (
    !amount ||
    !studentName ||
    !studentEmail ||
    !studentPhone ||
    !teacherName ||
    !dayOfWeek ||
    !startTime ||
    !endTime ||
    !scheduleId ||
    !enrollmentId
  ) {
    return res.status(400).json({
      error: 'Missing required fields: amount, studentName, studentEmail, studentPhone, teacherName, dayOfWeek, startTime, endTime, scheduleId, enrollmentId',
    });
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }

  // Atomically verify and reserve the schedule — getFirstListItem throws if not found
  let schedule;
  try {
    schedule = await pb
      .collection('schedules')
      .getFirstListItem(`id="${scheduleId}" && availability_status="Disponível"`);
  } catch {
    return res.status(409).json({
      error: 'Este horário acabou de ser preenchido. Por favor, selecione outro horário.',
    });
  }

  await pb.collection('schedules').update(schedule.id, {
    availability_status: 'Reservado',
  });

  logger.info(`Schedule ${scheduleId} marked as reserved`);

  // Set timeout to revert reservation after 10 minutes
  const reservationTimeout = setTimeout(async () => {
    try {
      const current = await pb.collection('schedules').getOne(scheduleId);
      if (current.availability_status === 'Reservado') {
        await pb.collection('schedules').update(scheduleId, {
          availability_status: 'Disponível',
        });
        logger.info(`Schedule ${scheduleId} reservation expired, reverted to Disponível`);
      }
    } catch (err) {
      logger.error(`Failed to revert reservation for schedule ${scheduleId}: ${err.message}`);
    }
    reservationTimeouts.delete(scheduleId);
  }, 10 * 60 * 1000);

  storeReservationTimeout(scheduleId, reservationTimeout);

  // Create temporary enrollment record with pending status
  const enrollmentData = {
    student_name: studentName,
    student_email: studentEmail,
    student_phone: studentPhone,
    teacher_name: teacherName,
    day_of_week: dayOfWeek,
    start_time: startTime,
    end_time: endTime,
    schedule_id: scheduleId,
    payment_status: 'pending',
    payment_id: null,
    payment_method: null,
  };

  // Update or create enrollment
  let enrollment;
  if (enrollmentId && enrollmentId !== 'new') {
    enrollment = await pb.collection('enrollments').update(enrollmentId, enrollmentData);
  } else {
    enrollment = await pb.collection('enrollments').create(enrollmentData);
  }

  logger.info(`Enrollment ${enrollment.id} created with pending status`);

  // Create Mercado Pago preference
  const preferenceData = {
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
      name: studentName,
      email: studentEmail,
      phone: {
        area_code: studentPhone.substring(0, 2),
        number: studentPhone.substring(2),
      },
    },
    notification_url: `${process.env.WEBHOOK_URL || 'http://localhost:3001'}/hcgi/api/mercado-pago/webhook`,
    back_urls: {
      success: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/enrollment-success/${enrollment.id}`,
      failure: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/enrollment-failed`,
      pending: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/enrollment-pending`,
    },
    auto_return: 'approved',
    external_reference: enrollment.id,
  };

  const mpPreference = await preference.create({ body: preferenceData });

  logger.info(
    `Mercado Pago preference created: ${mpPreference.id} for enrollment ${enrollment.id}`
  );

  res.json({
    preferenceId: mpPreference.id,
    initPoint: mpPreference.init_point,
    enrollmentId: enrollment.id,
  });
});

/**
 * POST /mercado-pago/webhook
 * Receives payment notifications from Mercado Pago
 */
router.post('/webhook', async (req, res) => {
  const { id, type, data } = req.body;

  // Validate Mercado Pago signature
  if (!validateWebhookSignature(req)) {
    logger.warn(`Webhook signature validation failed for id=${id}`);
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Idempotency check
  if (processedWebhooks.has(id)) {
    logger.info(`Webhook ${id} already processed, returning 200`);
    return res.status(200).json({ received: true });
  }

  // Mark webhook as processed
  processedWebhooks.set(id, true);

  // Clean up old entries (keep last 1000)
  if (processedWebhooks.size > 1000) {
    const firstKey = processedWebhooks.keys().next().value;
    processedWebhooks.delete(firstKey);
  }

  logger.info(`Webhook received: type=${type}, id=${id}`);

  // Only process payment notifications
  if (type !== 'payment') {
    logger.info(`Ignoring webhook type: ${type}`);
    return res.status(200).json({ received: true });
  }

  // Retrieve payment details from Mercado Pago
  const paymentDetails = await payment.get({ id: data.id });

  const paymentStatus = paymentDetails.status;
  const paymentId = paymentDetails.id;
  const externalReference = paymentDetails.external_reference;
  const paymentMethod = paymentDetails.payment_method?.type || 'unknown';

  logger.info(
    `Processing payment ${paymentId} with status ${paymentStatus} for enrollment ${externalReference}`
  );

  // Map Mercado Pago status to enrollment status
  let enrollmentStatus = 'pending';
  if (paymentStatus === 'approved') {
    enrollmentStatus = 'approved';
  } else if (paymentStatus === 'pending') {
    enrollmentStatus = 'pending';
  } else if (paymentStatus === 'rejected' || paymentStatus === 'cancelled') {
    enrollmentStatus = 'rejected';
  }

  // Update enrollment with payment details
  const enrollment = await pb.collection('enrollments').getOne(externalReference);
  const scheduleId = enrollment.schedule_id;

  await pb.collection('enrollments').update(externalReference, {
    payment_status: enrollmentStatus,
    payment_id: paymentId,
    payment_method: paymentMethod,
  });

  logger.info(
    `Enrollment ${externalReference} updated with payment status: ${enrollmentStatus}`
  );

  // If payment approved, mark schedule as occupied and clear reservation timeout
  if (paymentStatus === 'approved') {
    clearReservationTimeout(scheduleId);
    await pb.collection('schedules').update(scheduleId, {
      availability_status: 'Ocupado',
    });
    logger.info(`Schedule ${scheduleId} marked as Ocupado`);
  } else if (paymentStatus === 'rejected' || paymentStatus === 'cancelled') {
    clearReservationTimeout(scheduleId);
    await pb.collection('schedules').update(scheduleId, {
      availability_status: 'Disponível',
    });
    logger.info(`Schedule ${scheduleId} reverted to Disponível due to payment ${paymentStatus}`);
  }

  res.status(200).json({ received: true });
});

/**
 * GET /mercado-pago/payment-status/:paymentId
 * Retrieves payment details from Mercado Pago API
 */
router.get('/payment-status/:paymentId', async (req, res) => {
  const { paymentId } = req.params;

  if (!paymentId) {
    return res.status(400).json({ error: 'Payment ID is required' });
  }

  const paymentDetails = await payment.get({ id: paymentId });

  logger.info(`Payment status retrieved for ${paymentId}: ${paymentDetails.status}`);

  res.json({
    status: paymentDetails.status,
    paymentId: paymentDetails.id,
    amount: paymentDetails.transaction_amount,
    paymentMethod: paymentDetails.payment_method?.type || 'unknown',
    createdAt: paymentDetails.date_created,
  });
});

export default router;