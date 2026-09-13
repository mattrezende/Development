import mongoose from 'mongoose';
import logger from './utils/logger.js';

mongoose.connection.on('error', (err) => {
	logger.error('MongoDB connection error', err.message);
});

mongoose.connection.on('disconnected', () => {
	logger.warn('MongoDB disconnected');
});

async function connectDB() {
	const uri = process.env.MONGODB_URI;

	if (!uri) {
		logger.error('MONGODB_URI is not set');
		process.exit(1);
	}

	try {
		await mongoose.connect(uri);
		logger.info('MongoDB connected');
	} catch (err) {
		logger.error('Failed to connect to MongoDB', err.message);
		process.exit(1);
	}
}

export default connectDB;
export { connectDB };
