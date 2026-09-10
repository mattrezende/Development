import 'dotenv/config';
import logger from '../utils/logger.js';

const adminValidateHandler = async (req, res) => {
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
};

export default adminValidateHandler;