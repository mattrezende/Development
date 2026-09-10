import 'dotenv/config';
import express from 'express';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Initialize Mercado Pago client
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

const preference = new Preference(client);

/**
 * POST /enrollments
 * Creates a new enrollment record and initializes Mercado Pago payment
 * Returns HTTP 201 with payment initialization data
 */
router.post('/', async (req, res) => {
  logger.info('========== POST /enrollments CALLED ==========');

  const {
    teacherId,
    teacherName,
    studentData,
    lessonType,
    enrollmentType,
    quantity,
    scheduleIds,
    amount,
    paymentMethod,
    enrollmentDate,
    dayOfWeek,
    startTime,
    endTime,
    scheduleId,
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

  // ============================================
  // VALIDATIONS
  // ============================================

  if (!teacherId || typeof teacherId !== 'string') {
    return res.status(400).json({
      error: 'O ID do professor é obrigatório.',
    });
  }

  if (!teacherName || typeof teacherName !== 'string') {
    return res.status(400).json({
      error: 'Nome do professor é obrigatório.',
    });
  }

  if (!studentData || typeof studentData !== 'object') {
    return res.status(400).json({
      error: 'Os dados do aluno são obrigatórios.',
    });
  }

  if (!firstName || !lastName || !email) {
    return res.status(400).json({
      error: 'Nome, sobrenome e email são obrigatórios.',
    });
  }

  if (!cpf) {
    return res.status(400).json({
      error: 'CPF é obrigatório.',
    });
  }

  const cleanedCPF = cpf.replace(/\D/g, '');

  if (cleanedCPF.length !== 11) {
    return res.status(400).json({
      error: 'CPF inválido.',
    });
  }

  const cleanedAreaCode = areaCode.replace(/\D/g, '');
  const cleanedPhoneNumber = phoneNumber.replace(/\D/g, '');

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({
      error: 'Valor inválido.',
    });
  }

  // ============================================
  // CREATE ENROLLMENT
  // ============================================

  const enrollment = await pb.collection('enrollments').create({
    teacher_id: teacherId,
    first_name: firstName,
    last_name: lastName,
    email,
    cpf: cleanedCPF,
    document_type: documentType,
    area_code: cleanedAreaCode,
    phone_number: cleanedPhoneNumber,
    zip_code: zipCode ? zipCode.replace(/\D/g, '') : '',
    street: street || '',
    street_number: streetNumber || '',
    neighborhood: neighborhood || '',
    city: city || '',
    state: state || '',
    enrollment_type: enrollmentType,
    lesson_type: lessonType,
    amount,
    total_price: amount,
    payment_method: paymentMethod || 'pix',
    quantity: quantity || 1,
    enrollment_date: enrollmentDate || new Date().toISOString(),
    payment_status: 'pending',
    payment_id: null,
  });

  // ============================================
  // MERCADO PAGO
  // ============================================

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
      name: firstName,
      surname: lastName,
      email,
      phone: {
        area_code: cleanedAreaCode,
        number: cleanedPhoneNumber,
      },
      identification: {
        type: documentType,
        number: cleanedCPF,
      },
    },

    notification_url: `${process.env.WEBHOOK_URL}/hcgi/api/mercado-pago/webhook`,

    back_urls: {
      success: `${process.env.FRONTEND_URL}/enrollment-success/${enrollment.id}`,
      failure: `${process.env.FRONTEND_URL}/enrollment-failed`,
      pending: `${process.env.FRONTEND_URL}/enrollment-pending`,
    },

    auto_return: 'approved',

    external_reference: enrollment.id,
  };

  const mpPreference = await preference.create({
    body: preferenceData,
  });

  // ============================================
  // UPDATE ENROLLMENT
  // ============================================

  await pb.collection('enrollments').update(enrollment.id, {
    payment_id: mpPreference.id,
  });

  // ============================================
  // RESPONSE
  // ============================================

  return res.status(201).json({
    success: true,
    enrollmentId: enrollment.id,
    paymentId: mpPreference.id,
    initPoint: mpPreference.init_point,
    sandboxInitPoint: mpPreference.sandbox_init_point,
  });
});

/**
 * GET /enrollments/debug
 */
router.get('/debug', async (req, res) => {
  res.json({
    success: true,
    message: 'Enrollments route working',
    timestamp: new Date().toISOString(),
  });
});

export default router;