import mongoose from 'mongoose';

export default function healthCheckHandler(req, res) {
	res.status(200).json({
		status: 'ok',
		timestamp: new Date().toISOString(),
		uptime: Math.round(process.uptime()),
		environment: process.env.NODE_ENV || 'development',
		mongoConnected: mongoose.connection.readyState === 1,
	});
}
