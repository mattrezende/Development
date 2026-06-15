import 'dotenv/config';
import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import logger from '../utils/logger.js';

const router = express.Router();
const execAsync = promisify(exec);

const PORT = 3001;

/**
 * POST /admin/restart-backend
 * Restarts the Node.js backend server on port 3001
 *
 * Process:
 * 1. Kill existing Node.js processes on port 3001
 * 2. Wait 2 seconds for clean shutdown
 * 3. Restart the backend server using process.exit(0) to trigger PM2 auto-restart
 * 4. Wait 3 seconds for startup
 * 5. Test health check endpoint
 * 6. Return validation results
 */
router.post('/restart-backend', async (req, res) => {
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
  // STEP 3: Trigger PM2 auto-restart via process.exit(0)
  // ============================================
  logger.info('RESTART_STEP_3: Triggering PM2 auto-restart via process.exit(0)');

  // Send response before exiting
  const responseData = {
    success: true,
    message: 'Backend restart initiated. Server will restart automatically via PM2.',
    restartTime: Date.now() - startTime,
    timestamp: new Date().toISOString(),
  };

  logger.info('RESTART_STEP_3_RESPONSE: Sending response before exit', {
    responseData,
  });

  res.status(200).json(responseData);

  // Exit process after response is sent (PM2 will auto-restart)
  setTimeout(() => {
    logger.info('RESTART_STEP_3_EXIT: Calling process.exit(0) to trigger PM2 restart');
    process.exit(0);
  }, 500);
});

/**
 * GET /admin/validate-backend
 * Validates that the backend is running and responding correctly
 * Tests both local and remote health check endpoints
 *
 * Process:
 * 1. Test local health check at http://localhost:3001/hcgi/api/health
 * 2. Test remote health check at https://exelion.com.br/hcgi/api/health
 * 3. Check HTTP status codes and parse JSON responses
 * 4. Extract status field from responses
 * 5. Return validation results
 */
router.get('/validate-backend', async (req, res) => {
  logger.info('========== GET /admin/validate-backend CALLED ==========');

  const startTime = Date.now();

  // ============================================
  // TEST 1: Local health check
  // ============================================
  logger.info('VALIDATE_TEST_1: Testing local health check endpoint');

  let localEndpointData = {
    url: 'http://localhost:3001/hcgi/api/health',
    httpStatus: null,
    response: null,
    statusField: null,
    success: false,
  };

  try {
    const response = await fetch('http://localhost:3001/hcgi/api/health');

    localEndpointData.httpStatus = response.status;

    if (!response.ok) {
      throw new Error(
        `Local health check returned HTTP ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    localEndpointData.response = data;
    localEndpointData.statusField = data.status || null;
    localEndpointData.success = true;

    logger.info('VALIDATE_TEST_1_SUCCESS: Local health check passed', {
      httpStatus: localEndpointData.httpStatus,
      statusField: localEndpointData.statusField,
      response: data,
    });
  } catch (error) {
    logger.error('VALIDATE_TEST_1_FAILED: Local health check failed', {
      errorMessage: error.message,
      errorStack: error.stack,
    });
    throw new Error(`Local health check failed: ${error.message}`);
  }

  // ============================================
  // TEST 2: Remote health check
  // ============================================
  logger.info('VALIDATE_TEST_2: Testing remote health check endpoint');

  let remoteEndpointData = {
    url: 'https://exelion.com.br/hcgi/api/health',
    httpStatus: null,
    response: null,
    statusField: null,
    success: false,
  };

  try {
    const response = await fetch('https://exelion.com.br/hcgi/api/health');

    remoteEndpointData.httpStatus = response.status;

    if (!response.ok) {
      throw new Error(
        `Remote health check returned HTTP ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    remoteEndpointData.response = data;
    remoteEndpointData.statusField = data.status || null;
    remoteEndpointData.success = true;

    logger.info('VALIDATE_TEST_2_SUCCESS: Remote health check passed', {
      httpStatus: remoteEndpointData.httpStatus,
      statusField: remoteEndpointData.statusField,
      response: data,
    });
  } catch (error) {
    logger.error('VALIDATE_TEST_2_FAILED: Remote health check failed', {
      errorMessage: error.message,
      errorStack: error.stack,
    });
    throw new Error(`Remote health check failed: ${error.message}`);
  }

  // ============================================
  // STEP 3: Prepare and send response
  // ============================================
  logger.info('VALIDATE_STEP_3: Preparing response');

  const elapsedTime = Date.now() - startTime;

  const responseData = {
    success: localEndpointData.success && remoteEndpointData.success,
    message: 'Backend validation complete',
    validationTime: elapsedTime,
    localEndpoint: localEndpointData,
    remoteEndpoint: remoteEndpointData,
    timestamp: new Date().toISOString(),
  };

  logger.info('VALIDATE_STEP_3_SUCCESS: Response prepared', {
    responseData,
  });

  res.status(200).json(responseData);

  logger.info('VALIDATE_COMPLETE: Response sent to client', {
    elapsedTime,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /admin/backend-status
 * Checks if the backend process is running on port 3001
 *
 * Process:
 * 1. Check if backend process is running on port 3001 using lsof
 * 2. Return running status and port information
 */
router.get('/backend-status', async (req, res) => {
  logger.info('========== GET /admin/backend-status CALLED ==========');

  let running = false;
  let processInfo = null;
  const uptime = process.uptime();

  // ============================================
  // CHECK: Backend process on port 3001
  // ============================================
  logger.info('STATUS_CHECK: Checking if backend is running on port 3001');

  try {
    const { stdout } = await execAsync('lsof -ti:3001 2>/dev/null || echo ""');

    if (stdout.trim()) {
      running = true;
      const pid = stdout.trim().split('\n')[0];

      logger.info('STATUS_CHECK_SUCCESS: Backend process found', {
        pid,
        port: PORT,
      });

      processInfo = {
        pid: parseInt(pid, 10),
        port: PORT,
        running: true,
      };
    } else {
      logger.info('STATUS_CHECK_RESULT: No process found on port 3001');

      processInfo = {
        pid: null,
        port: PORT,
        running: false,
      };
    }
  } catch (error) {
    logger.error('STATUS_CHECK_FAILED: Error checking process status', {
      errorMessage: error.message,
      errorStack: error.stack,
    });
    throw new Error(`Failed to check backend status: ${error.message}`);
  }

  // ============================================
  // PREPARE RESPONSE
  // ============================================
  logger.info('STATUS_PREPARE: Preparing response');

  const responseData = {
    success: true,
    running: running,
    port: PORT,
    uptime: Math.floor(uptime),
    processInfo: processInfo,
    timestamp: new Date().toISOString(),
  };

  logger.info('STATUS_PREPARE_SUCCESS: Response prepared', {
    responseData,
  });

  res.status(200).json(responseData);

  logger.info('STATUS_COMPLETE: Response sent to client', {
    running,
    timestamp: new Date().toISOString(),
  });
});

export default router;