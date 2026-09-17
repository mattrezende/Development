import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { globalRateLimit } from './middleware/global-rate-limit.js';
import errorMiddleware from './middleware/error.js';
import logger from './utils/logger.js';
import routes from './routes/index.js';
import connectDB from './db.js';
import { startReservationSweep } from './jobs/reservation-sweep.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

await connectDB();
startReservationSweep();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }));
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));
app.use(cookieParser());
app.use(globalRateLimit);

app.use('/api', routes());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const webDist = path.join(__dirname, '../../../dist/apps/web');
app.use(express.static(webDist));
app.use((req, res, next) => {
	if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
		return next();
	}
	res.sendFile(path.join(webDist, 'index.html'), (err) => {
		if (err) next(err);
	});
});

app.use((req, res) => {
	res.status(404).json({ error: 'Not Found' });
});

app.use(errorMiddleware);

const server = app.listen(PORT, () => {
	logger.info(`Server listening on port ${PORT} (${NODE_ENV})`);
});

server.on('error', (error) => {
	logger.error('Server error', error.message);
	process.exit(1);
});

function shutdown(signal) {
	logger.info(`${signal} received, shutting down gracefully`);
	server.close(() => {
		logger.info('Server closed');
		process.exit(0);
	});
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('uncaughtException', (error) => {
	logger.error('Uncaught exception', error.message, error.stack);
	process.exit(1);
});

process.on('unhandledRejection', (reason) => {
	logger.error('Unhandled rejection', String(reason));
});

export default app;
