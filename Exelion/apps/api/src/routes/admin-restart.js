import 'dotenv/config';
import express from 'express';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import logger from '../utils/logger.js';

const router = express.Router();
const execAsync = promisify(exec);

/**
 * POST /admin/restart-backend
 * Restarts the Node.js backend server on port 3001
 * 
 * Process:
 * 1. Kill existing Node.js processes on port 3001
 * 2. Wait 2 seconds for clean shutdown
 * 3. Start backend server fresh using child_process.spawn
 * 4. Wait 3 seconds for startup
 * 5. Test health check endpoint
 * 6. Return validation results
 */
const handler = async (req, res) => {
  logger.info('========== POST /admin/restart-backend CALLED ==========');

  const startTime = Date.now();

  // ============================================
  // STEP 1: Kill existing processes on port 3001
  // ============================================
  logger.info('RESTART_STEP_1: Killing existing processes on port 3001');

  try {
    await execAsync('lsof -ti:3001 | xargs kill -9 2>/dev/null || true');
    logger.info('RESTART_STEP_1_SUCCESS: Existing processes killed');
  } catch (error) {
    logger.warn('RESTART_STEP_1_WARNING: Could not kill processes', {
      errorMessage: error.message,
    });
    // Don't throw - this is not critical
  }

  // ============================================
  // STEP 2: Wait 2 seconds for clean shutdown
  // ============================================
  logger.info('RESTART_STEP_2: Waiting 2 seconds for clean shutdown');
  await new Promise((resolve) => setTimeout(resolve, 2000));
  logger.info('RESTART_STEP_2_SUCCESS: Shutdown wait complete');

  // ============================================
  // STEP 3: Start backend server fresh
  // ============================================
  logger.info('RESTART_STEP_3: Starting backend server with spawn');

  const serverProcess = spawn('node', ['src/main.js'], {
    cwd: process.cwd(),
    detached: true,
    stdio: 'ignore',
  });

  serverProcess.unref();

  logger.info('RESTART_STEP_3_SUCCESS: Backend server spawned', {
    pid: serverProcess.pid,
  });

  // ============================================
  // STEP 4: Wait 3 seconds for startup
  // ============================================
  logger.info('RESTART_STEP_4: Waiting 3 seconds for server startup');
  await new Promise((resolve) => setTimeout(resolve, 3000));
  logger.info('RESTART_STEP_4_SUCCESS: Startup wait complete');

  // ============================================
  // STEP 5: Test health check endpoint
  // ============================================
  logger.info('RESTART_STEP_5: Testing health check endpoint');

  let healthCheckResponse;
  let healthCheckStatus = 'unknown';
  let healthCheckData = null;

  try {
    const response = await fetch('http://localhost:3001/hcgi/api/health');

    if (!response.ok) {
      throw new Error(
        `Health check returned HTTP ${response.status} ${response.statusText}`
      );
    }

    healthCheckStatus = response.status;
    healthCheckData = await response.json();

    logger.info('RESTART_STEP_5_SUCCESS: Health check passed', {
      httpStatus: healthCheckStatus,
      responseData: healthCheckData,
    });
  } catch (error) {
    logger.error('RESTART_STEP_5_FAILED: Health check failed', {
      errorMessage: error.message,
      errorStack: error.stack,
    });
    throw new Error(`Health check failed: ${error.message}`);
  }

  // ============================================
  // STEP 6: Prepare and send response
  // ============================================
  logger.info('RESTART_STEP_6: Preparing response');

  const elapsedTime = Date.now() - startTime;

  const responseData = {
    success: true,
    message: 'Backend server restarted successfully',
    restartTime: elapsedTime,
    healthCheck: {
      status: healthCheckData?.status || 'ok',
      timestamp: healthCheckData?.timestamp || new Date().toISOString(),
      uptime: healthCheckData?.uptime || 0,
      environment: healthCheckData?.environment || 'production',
      port: healthCheckData?.port || 3001,
    },
    validation: {
      localEndpoint: 'http://localhost:3001/hcgi/api/health',
      httpStatus: healthCheckStatus,
      statusField: healthCheckData?.status || 'ok',
      responseReceived: !!healthCheckData,
    },
    timestamp: new Date().toISOString(),
  };

  logger.info('RESTART_STEP_6_SUCCESS: Response prepared', {
    responseData,
  });

  res.status(200).json(responseData);

  logger.info('RESTART_COMPLETE: Response sent to client', {
    elapsedTime,
    timestamp: new Date().toISOString(),
  });
};

// Export as default export (for direct route handler)
export default handler;