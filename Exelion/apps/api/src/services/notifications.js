import { Notification } from '../models/index.js';
import logger from '../utils/logger.js';

async function createNotification(teacherId, type, title, message, relatedData) {
	try {
		await Notification.create({ teacherId, type, title, message, relatedData });
	} catch (err) {
		logger.error(`Failed to create notification (${type}) for teacher ${teacherId}`, err.message);
	}
}

export { createNotification };
