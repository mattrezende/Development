import express from 'express';
import healthCheckHandler from './health-check.js';
import authRouter from './auth.js';
import teachersRouter from './teachers.js';
import studentsRouter from './students.js';
import schedulesRouter from './schedules.js';
import enrollmentsRouter from './enrollments.js';
import mercadoPagoRouter from './mercado-pago.js';
import pricingRouter from './pricing.js';
import serviceAreasRouter from './service-areas.js';
import termsRouter from './terms.js';
import notificationsRouter from './notifications.js';
import expensesRouter from './expenses.js';
import expenseCategoriesRouter from './expense-categories.js';
import publicRouter from './public.js';

export default function routes() {
	const router = express.Router();

	router.get('/health', healthCheckHandler);
	router.use('/auth', authRouter);
	router.use('/teachers', teachersRouter);
	router.use('/students', studentsRouter);
	router.use('/schedules', schedulesRouter);
	router.use('/enrollments', enrollmentsRouter);
	router.use('/mercado-pago', mercadoPagoRouter);
	router.use('/pricing', pricingRouter);
	router.use('/service-areas', serviceAreasRouter);
	router.use('/terms', termsRouter);
	router.use('/notifications', notificationsRouter);
	router.use('/expenses', expensesRouter);
	router.use('/expense-categories', expenseCategoriesRouter);
	router.use('/public', publicRouter);

	return router;
}
