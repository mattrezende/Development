import 'dotenv/config';
import { exec } from 'child_process';
import { promisify } from 'util';
import logger from '../utils/logger.js';

const execAsync = promisify(exec);

const adminStatusHandler = async (req, res) => {
  logger.info('========== GET /admin/backend-status CALLED ==========');

  const PORT = 3001;
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
};

export default adminStatusHandler;