import cron from 'node-cron';
import { Schedule } from '../models/index.js';
import logger from '../utils/logger.js';

const RESERVATION_TIMEOUT_MS = 10 * 60 * 1000;

async function sweepExpiredReservations() {
	const cutoff = new Date(Date.now() - RESERVATION_TIMEOUT_MS);

	const result = await Schedule.updateMany(
		{ availabilityStatus: 'Reservado', reservedAt: { $lt: cutoff } },
		{ availabilityStatus: 'Disponível', reservedAt: null },
	);

	if (result.modifiedCount > 0) {
		logger.info(`Reservation sweep reverted ${result.modifiedCount} expired schedule reservation(s)`);
	}
}

function startReservationSweep() {
	cron.schedule('*/1 * * * *', () => {
		sweepExpiredReservations().catch((err) => {
			logger.error('Reservation sweep failed', err.message);
		});
	});
	logger.info('Reservation sweep job scheduled (every 1 minute)');
}

export { startReservationSweep, sweepExpiredReservations };
