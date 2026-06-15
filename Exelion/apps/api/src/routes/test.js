import express from 'express';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * POST /test
 * Simple test endpoint to verify API server is working
 */
router.post('/', async (req, res) => {
  logger.info('TEST ENDPOINT CALLED', {
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString(),
  });

  res.status(200).json({
    success: true,
    message: 'API server is working correctly',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /test
 * Simple GET test endpoint
 */
router.get('/', async (req, res) => {
  logger.info('TEST ENDPOINT CALLED (GET)', {
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString(),
  });

  res.status(200).json({
    success: true,
    message: 'API server is working correctly',
    timestamp: new Date().toISOString(),
  });
});

export default router;