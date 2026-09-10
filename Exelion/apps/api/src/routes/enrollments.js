import 'dotenv/config';
import express from 'express';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// ============================================
// MERCADO PAGO INITIALIZATION
// ============================================
if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
  logger.warn('MERCADO_PAGO_ACCESS_TOKEN is not set - payment functionality will not work');
}

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
});

const preference = new Preference(client);

logger.info('Enrollments router loaded');

/**
 * POST /enrollments/create
 * Creates a new enrollment record and initializes Mercado Pago payment
 * Returns HTTP 201 with payment initialization data
 *
 * Required fields in request body:
 * - teacherId: string (valid teacher ID)
 * - teacherName: string (teacher name)
 * - studentData: object with firstName, lastName, email, cpf, documentType, areaCode, phoneNumber, and optional address fields
 * - amount: number (positive)
 * - enrollmentType: 'semanal' | 'avulso'
 * - lessonType: 'weekly' | 'single'
 * - dayOfWeek: string (day of week for lesson)
 * - startTime: string (lesson start time)
 * - endTime: string (lesson end time)
 * - scheduleId: string (schedule ID for the lesson)
 * - enrollmentDate: ISO string (optional, defaults to now)
 * - paymentMethod: 'pix' | 'credit_card' | 'debit_card' | 'recurring' (optional, defaults to 'pix')
 * - quantity: number (optional, defaults to 1)
 */
router.post('/create', async (req, res) => {
  logger.info('========== POST /enrollments/create CALLED ==========');

  // Log request headers
  logger.info('REQUEST HEADERS RECEIVED', {
    headers: req.headers,
    contentType: req.headers['content-type'],
    userAgent: req.headers['user-agent'],
  });

  // Log request body
  logger.info('REQUEST BODY RECEIVED', {
    bodyKeys: Object.keys(req.body),
    bodySize: JSON.stringify(req.body).length,
    fullBody: req.body,
  });

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

  logger.info('PARAMETERS EXTRACTED', {
    teacherId,
    teacherName,
    studentDataKeys: studentData ? Object.keys(studentData) : [],
    amount,
    enrollmentType,
    lessonType,
    quantity,
    scheduleIds,
    paymentMethod,
    enrollmentDate,
    dayOfWeek,
    startTime,
    endTime,
    scheduleId,
  });

  // ============================================
  // STEP 1: Validate input fields
  // ============================================
  logger.info('VALIDATION_START', { step: 'Starting input validation' });

  if (!teacherId || typeof teacherId !== 'string') {
    logger.error('VALIDATION_FAILED: Invalid teacherId', {
      receivedTeacherId: teacherId,
      type: typeof teacherId,
    });
    return res.status(400).json({
      error: 'O ID do professor é obrigatório e deve ser uma string.',
    });
  }
  logger.info('VALIDATION_PASS: teacherId', { teacherId });

  if (!teacherName || typeof teacherName !== 'string') {
    logger.error('VALIDATION_FAILED: Invalid teacherName', {
      receivedTeacherName: teacherName,
      type: typeof teacherName,
    });
    return res.status(400).json({
      error: 'Nome do professor é obrigatório.',
    });
  }
  logger.info('VALIDATION_PASS: teacherName', { teacherName });

  if (!studentData || typeof studentData !== 'object') {
    logger.error('VALIDATION_FAILED: Invalid studentData', {
      receivedStudentData: studentData,
      type: typeof studentData,
    });
    return res.status(400).json({
      error: 'Os dados do aluno são obrigatórios.',
    });
  }
  logger.info('VALIDATION_PASS: studentData object');

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

  // Validate firstName
  if (!firstName || typeof firstName !== 'string') {
    logger.error('VALIDATION_FAILED: Invalid firstName', {
      receivedFirstName: firstName,
      type: typeof firstName,
    });
    return res.status(400).json({
      error: 'Nome é obrigatório.',
    });
  }
  logger.info('VALIDATION_PASS: firstName', { firstName });

  // Validate lastName
  if (!lastName || typeof lastName !== 'string') {
    logger.error('VALIDATION_FAILED: Invalid lastName', {
      receivedLastName: lastName,
      type: typeof lastName,
    });
    return res.status(400).json({
      error: 'Sobrenome é obrigatório.',
    });
  }
  logger.info('VALIDATION_PASS: lastName', { lastName });

  // Validate email
  if (!email || typeof email !== 'string') {
    logger.error('VALIDATION_FAILED: Invalid email', {
      receivedEmail: email,
      type: typeof email,
    });
    return res.status(400).json({
      error: 'Email é obrigatório.',
    });
  }
  logger.info('VALIDATION_PASS: email', { email });

  // Validate CPF
  if (!cpf || typeof cpf !== 'string') {
    logger.error('VALIDATION_FAILED: Invalid cpf', {
      receivedCpf: cpf,
      type: typeof cpf,
    });
    return res.status(400).json({
      error: 'CPF é obrigatório.',
    });
  }
  const cleanedCPF = cpf.replace(/\D/g, '');
  if (cleanedCPF.length !== 11) {
    logger.error('VALIDATION_FAILED: CPF must be 11 digits', {
      receivedCpf: cpf,
      cleanedCPF,
      length: cleanedCPF.length,
    });
    return res.status(400).json({
      error: 'CPF deve ter 11 dígitos.',
    });
  }
  logger.info('VALIDATION_PASS: cpf', { cpf, cleanedCPF });

  // Validate documentType
  if (!documentType || typeof documentType !== 'string') {
    logger.error('VALIDATION_FAILED: Invalid documentType', {
      receivedDocumentType: documentType,
      type: typeof documentType,
    });
    return res.status(400).json({
      error: 'Tipo de documento é obrigatório.',
    });
  }
  logger.info('VALIDATION_PASS: documentType', { documentType });

  // Validate areaCode
  if (!areaCode || typeof areaCode !== 'string') {
    logger.error('VALIDATION_FAILED: Invalid areaCode', {
      receivedAreaCode: areaCode,
      type: typeof areaCode,
    });
    return res.status(400).json({
      error: 'DDD é obrigatório.',
    });
  }
  const cleanedAreaCode = areaCode.replace(/\D/g, '');
  if (cleanedAreaCode.length !== 2) {
    logger.error('VALIDATION_FAILED: Area code must be 2 digits', {
      receivedAreaCode: areaCode,
      cleanedAreaCode,
      length: cleanedAreaCode.length,
    });
    return res.status(400).json({
      error: 'DDD deve ter 2 dígitos.',
    });
  }
  logger.info('VALIDATION_PASS: areaCode', { areaCode, cleanedAreaCode });

  // Validate phoneNumber
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    logger.error('VALIDATION_FAILED: Invalid phoneNumber', {
      receivedPhoneNumber: phoneNumber,
      type: typeof phoneNumber,
    });
    return res.status(400).json({
      error: 'Telefone é obrigatório.',
    });
  }
  const cleanedPhoneNumber = phoneNumber.replace(/\D/g, '');
  if (cleanedPhoneNumber.length < 8 || cleanedPhoneNumber.length > 9) {
    logger.error('VALIDATION_FAILED: Phone number must be 8-9 digits', {
      receivedPhoneNumber: phoneNumber,
      cleanedPhoneNumber,
      length: cleanedPhoneNumber.length,
    });
    return res.status(400).json({
      error: 'Telefone deve ter 8 ou 9 dígitos.',
    });
  }
  logger.info('VALIDATION_PASS: phoneNumber', {
    phoneNumber,
    cleanedPhoneNumber,
  });

  // Validate state (optional)
  if (state && typeof state !== 'string') {
    logger.error('VALIDATION_FAILED: Invalid state', {
      receivedState: state,
      type: typeof state,
    });
    return res.status(400).json({
      error: 'Estado inválido.',
    });
  }
  if (state && !/^[A-Z]{2}$/.test(state)) {
    logger.error('VALIDATION_FAILED: State must be 2 uppercase letters', {
      receivedState: state,
    });
    return res.status(400).json({
      error: 'Estado deve ter 2 letras maiúsculas.',
    });
  }
  logger.info('VALIDATION_PASS: state', { state });

  // Validate zipCode (optional)
  if (zipCode && typeof zipCode !== 'string') {
    logger.error('VALIDATION_FAILED: Invalid zipCode', {
      receivedZipCode: zipCode,
      type: typeof zipCode,
    });
    return res.status(400).json({
      error: 'CEP inválido.',
    });
  }
  if (zipCode) {
    const cleanedZipCode = zipCode.replace(/\D/g, '');
    if (cleanedZipCode.length !== 8) {
      logger.error('VALIDATION_FAILED: Zip code must be 8 digits', {
        receivedZipCode: zipCode,
        cleanedZipCode,
        length: cleanedZipCode.length,
      });
      return res.status(400).json({
        error: 'CEP deve ter 8 dígitos.',
      });
    }
  }
  logger.info('VALIDATION_PASS: zipCode', { zipCode });

  if (typeof amount !== 'number' || amount <= 0) {
    logger.error('VALIDATION_FAILED: Invalid amount', {
      receivedAmount: amount,
      type: typeof amount,
    });
    return res.status(400).json({
      error: 'O valor total da matrícula deve ser um número maior que zero.',
    });
  }
  logger.info('VALIDATION_PASS: amount', { amount });

  if (!enrollmentType || !['semanal', 'avulso'].includes(enrollmentType)) {
    logger.error('VALIDATION_FAILED: Invalid enrollmentType', {
      receivedEnrollmentType: enrollmentType,
      validOptions: ['semanal', 'avulso'],
    });
    return res.status(400).json({
      error: "O tipo de plano deve ser 'semanal' ou 'avulso'.",
    });
  }
  logger.info('VALIDATION_PASS: enrollmentType', { enrollmentType });

  if (!lessonType || !['weekly', 'single'].includes(lessonType)) {
    logger.error('VALIDATION_FAILED: Invalid lessonType', {
      receivedLessonType: lessonType,
      validOptions: ['weekly', 'single'],
    });
    return res.status(400).json({
      error: "O tipo de aula deve ser 'weekly' ou 'single'.",
    });
  }
  logger.info('VALIDATION_PASS: lessonType', { lessonType });

  if (!dayOfWeek || typeof dayOfWeek !== 'string') {
    logger.error('VALIDATION_FAILED: Invalid dayOfWeek', {
      receivedDayOfWeek: dayOfWeek,
      type: typeof dayOfWeek,
    });
    return res.status(400).json({
      error: 'Dia da semana é obrigatório.',
    });
  }
  logger.info('VALIDATION_PASS: dayOfWeek', { dayOfWeek });

  if (!startTime || typeof startTime !== 'string') {
    logger.error('VALIDATION_FAILED: Invalid startTime', {
      receivedStartTime: startTime,
      type: typeof startTime,
    });
    return res.status(400).json({
      error: 'Hora de início é obrigatória.',
    });
  }
  logger.info('VALIDATION_PASS: startTime', { startTime });

  if (!endTime || typeof endTime !== 'string') {
    logger.error('VALIDATION_FAILED: Invalid endTime', {
      receivedEndTime: endTime,
      type: typeof endTime,
    });
    return res.status(400).json({
      error: 'Hora de término é obrigatória.',
    });
  }
  logger.info('VALIDATION_PASS: endTime', { endTime });

  if (!scheduleId || typeof scheduleId !== 'string') {
    logger.error('VALIDATION_FAILED: Invalid scheduleId', {
      receivedScheduleId: scheduleId,
      type: typeof scheduleId,
    });
    return res.status(400).json({
      error: 'ID do horário é obrigatório.',
    });
  }
  logger.info('VALIDATION_PASS: scheduleId', { scheduleId });

  logger.info('VALIDATION_COMPLETE', { message: 'All input validations passed' });

  // ============================================
  // STEP 2: Create enrollment record in PocketBase
  // ============================================
  logger.info('POCKETBASE_CREATE_START', {
    message: 'Starting enrollment record creation in PocketBase',
  });

  const enrollmentData = {
    teacher_id: teacherId,
    first_name: firstName,
    last_name: lastName,
    email: email,
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
    amount: amount,
    total_price: amount,
    payment_method: paymentMethod || 'pix',
    quantity: quantity || 1,
    enrollment_date: enrollmentDate || new Date().toISOString(),
    payment_status: 'pending',
    payment_id: null,
  };

  logger.info('POCKETBASE_CREATE_REQUEST', {
    message: 'Enrollment data prepared for PocketBase',
    enrollmentData,
  });

  const enrollment = await pb.collection('enrollments').create(enrollmentData);

  logger.info('POCKETBASE_CREATE_SUCCESS', {
    message: 'Enrollment record created successfully in PocketBase',
    enrollmentId: enrollment.id,
    createdRecord: {
      id: enrollment.id,
      teacher_id: enrollment.teacher_id,
      first_name: enrollment.first_name,
      last_name: enrollment.last_name,
      email: enrollment.email,
      cpf: enrollment.cpf,
      document_type: enrollment.document_type,
      area_code: enrollment.area_code,
      phone_number: enrollment.phone_number,
      zip_code: enrollment.zip_code,
      street: enrollment.street,
      street_number: enrollment.street_number,
      neighborhood: enrollment.neighborhood,
      city: enrollment.city,
      state: enrollment.state,
      enrollment_type: enrollment.enrollment_type,
      lesson_type: enrollment.lesson_type,
      amount: enrollment.amount,
      total_price: enrollment.total_price,
      payment_method: enrollment.payment_method,
      quantity: enrollment.quantity,
      enrollment_date: enrollment.enrollment_date,
      payment_status: enrollment.payment_status,
      payment_id: enrollment.payment_id,
      created: enrollment.created,
      updated: enrollment.updated,
    },
  });

  // ============================================
  // STEP 3: Create Mercado Pago preference
  // ============================================
  logger.info('MERCADO_PAGO_CREATE_START', {
    message: 'Starting Mercado Pago preference creation',
  });

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
      email: email,
      phone: {
        area_code: cleanedAreaCode,
        number: cleanedPhoneNumber,
      },
      identification: {
        type: documentType,
        number: cleanedCPF,
      },
      address:
        zipCode && street && streetNumber
          ? {
              zip_code: zipCode.replace(/\D/g, ''),
              street_name: street,
              street_number: streetNumber,
            }
          : undefined,
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

  logger.info('MERCADO_PAGO_REQUEST', {
    message: 'EXACT preference object being sent to Mercado Pago API',
    preferenceData,
  });

  let mpPreference;
  try {
    mpPreference = await preference.create({ body: preferenceData });
    logger.info('MERCADO_PAGO_API_RESPONSE', {
      message: 'EXACT response received from Mercado Pago API',
      statusCode: 201,
      responseBody: mpPreference,
      fullResponse: JSON.stringify(mpPreference),
    });
  } catch (error) {
    logger.error('MERCADO_PAGO_API_ERROR', {
      message: 'Mercado Pago API call failed',
      errorMessage: error.message,
      statusCode: error.status || error.statusCode || 'unknown',
      responseBody: error.response || error.body || 'no response body',
      fullStackTrace: error.stack,
      errorObject: error,
    });
    throw new Error(
      `Mercado Pago API error: ${error.message}. Status: ${error.status || error.statusCode || 'unknown'}`
    );
  }

  // Verify Mercado Pago response contains required fields
  logger.info('MERCADO_PAGO_RESPONSE_VALIDATION', {
    message: 'Validating Mercado Pago response fields',
    hasId: !!mpPreference.id,
    hasInitPoint: !!mpPreference.init_point,
    hasSandboxInitPoint: !!mpPreference.sandbox_init_point,
    id: mpPreference.id,
    init_point: mpPreference.init_point,
    sandbox_init_point: mpPreference.sandbox_init_point,
  });

  if (!mpPreference.id) {
    logger.error('MERCADO_PAGO_RESPONSE_MISSING_FIELD', {
      message: 'Mercado Pago response missing required field: id',
      response: mpPreference,
    });
    throw new Error('Mercado Pago response missing required field: id');
  }

  if (!mpPreference.init_point) {
    logger.error('MERCADO_PAGO_RESPONSE_MISSING_FIELD', {
      message: 'Mercado Pago response missing required field: init_point',
      response: mpPreference,
    });
    throw new Error('Mercado Pago response missing required field: init_point');
  }

  if (!mpPreference.sandbox_init_point) {
    logger.error('MERCADO_PAGO_RESPONSE_MISSING_FIELD', {
      message: 'Mercado_PAGO response missing required field: sandbox_init_point',
      response: mpPreference,
    });
    throw new Error(
      'Mercado Pago response missing required field: sandbox_init_point'
    );
  }

  logger.info('MERCADO_PAGO_RESPONSE_VALIDATION_SUCCESS', {
    message: 'All required fields present in Mercado Pago response',
    id: mpPreference.id,
    init_point: mpPreference.init_point,
    sandbox_init_point: mpPreference.sandbox_init_point,
  });

  // ============================================
  // STEP 4: Update enrollment with payment data
  // ============================================
  logger.info('POCKETBASE_UPDATE_START', {
    message: 'Updating enrollment with payment data',
  });

  const updateData = {
    payment_id: mpPreference.id,
  };

  logger.info('POCKETBASE_UPDATE_REQUEST', {
    message: 'Enrollment update data prepared',
    enrollmentId: enrollment.id,
    updateData,
  });

  const updatedEnrollment = await pb
    .collection('enrollments')
    .update(enrollment.id, updateData);

  logger.info('POCKETBASE_UPDATE_SUCCESS', {
    message: 'Enrollment updated with payment data',
    enrollmentId: updatedEnrollment.id,
    updatedFields: {
      payment_id: updatedEnrollment.payment_id,
      payment_status: updatedEnrollment.payment_status,
    },
  });

  // ============================================
  // STEP 5: Prepare and send response
  // ============================================
  logger.info('RESPONSE_PREPARE', {
    message: 'Preparing success response',
  });

  const responseData = {
    success: true,
    message: 'Matrícula criada com sucesso. Redirecionando para pagamento...',
    enrollmentId: enrollment.id,
    paymentId: mpPreference.id,
    preferenceId: mpPreference.id,
    payment_id: mpPreference.id,
    payment_status: 'pending',
    initPoint: mpPreference.init_point,
    sandboxInitPoint: mpPreference.sandbox_init_point,
    studentName: `${firstName} ${lastName}`,
    studentEmail: email,
    amount,
    enrollmentType,
    lessonType,
    dayOfWeek,
    startTime,
    endTime,
    firstName,
    lastName,
    cpf: cleanedCPF,
    documentType,
    areaCode: cleanedAreaCode,
    phoneNumber: cleanedPhoneNumber,
    zipCode,
    street,
    streetNumber,
    neighborhood,
    city,
    state,
  };

  logger.info('RESPONSE_HEADERS_SET', {
    message: 'Response headers being set',
    contentType: 'application/json',
    cacheControl: 'no-cache',
  });

  logger.info('RESPONSE_FINAL_OBJECT', {
    message: 'EXACT final response object before sending to frontend',
    statusCode: 201,
    responseObject: responseData,
    responseKeys: Object.keys(responseData),
    fullResponse: JSON.stringify(responseData),
  });

  res.status(201).json(responseData);

  logger.info('RESPONSE_SENT', {
    message: 'Response sent to frontend successfully',
    enrollmentId: enrollment.id,
    preferenceId: mpPreference.id,
    statusCode: 201,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /enrollments/debug
 * Debug endpoint to verify API and service connectivity
 * Returns status of API server and connected services
 */
router.get('/debug', async (req, res) => {
  logger.info('GET /enrollments/debug CALLED', {
    timestamp: new Date().toISOString(),
  });

  const debugInfo = {
    status: 'ok',
    mercadoPagoConfigured: !!process.env.MERCADO_PAGO_ACCESS_TOKEN,
    pocketbaseConnected: false,
    timestamp: new Date().toISOString(),
  };

  logger.info('DEBUG_ENDPOINT_MERCADO_PAGO_CHECK', {
    mercadoPagoConfigured: debugInfo.mercadoPagoConfigured,
    hasAccessToken: !!process.env.MERCADO_PAGO_ACCESS_TOKEN,
  });

  // Try to ping PocketBase
  try {
    logger.info('DEBUG_ENDPOINT_POCKETBASE_CHECK_START', {
      message: 'Attempting to connect to PocketBase',
    });

    const testList = await pb.collection('enrollments').getList(1, 1);

    debugInfo.pocketbaseConnected = true;

    logger.info('DEBUG_ENDPOINT_POCKETBASE_CHECK_SUCCESS', {
      message: 'PocketBase connection successful',
      pocketbaseConnected: true,
      testListItems: testList.items.length,
    });
  } catch (error) {
    logger.error('DEBUG_ENDPOINT_POCKETBASE_CHECK_FAILED', {
      message: 'PocketBase connection failed',
      errorMessage: error.message,
      pocketbaseConnected: false,
      errorStack: error.stack,
    });

    debugInfo.pocketbaseConnected = false;
  }

  logger.info('DEBUG_ENDPOINT_RESPONSE', {
    message: 'Sending debug endpoint response',
    debugInfo,
  });

  res.json(debugInfo);
});

export default router;