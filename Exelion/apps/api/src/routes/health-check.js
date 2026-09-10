import logger from '../utils/logger.js';

console.log('[health-check] Module loading started');

export default function healthCheckHandler(req, res) {
  console.log('[health-check] healthCheckHandler called');
  logger.info('Health check endpoint called', {
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString(),
  });

  try {
    const uptime = process.uptime();
    const timestamp = new Date().toISOString();
    
    console.log('[health-check] Preparing response with status=ok');
    const responseData = {
      status: 'ok',
      timestamp: timestamp,
      uptime: Math.round(uptime),
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 3001
    };
    
    console.log('[health-check] Sending HTTP 200 response');
    res.status(200).json(responseData);
    console.log('[health-check] Response sent successfully');
  } catch (error) {
    console.error('[health-check] Error in healthCheckHandler:', error.message);
    logger.error('Health check error', {
      errorMessage: error.message,
      errorStack: error.stack,
    });
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}

console.log('[health-check] Module loading complete - healthCheckHandler exported');