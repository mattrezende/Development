// Clean rebuild: 2026-05-25T00:00:00Z
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { globalRateLimit } from './middleware/global-rate-limit.js';
import errorMiddleware from './middleware/error.js';
import logger from './utils/logger.js';
import routes from './routes/index.js';

// ============================================
// STARTUP LOGGING - FIRST LINE
// ============================================
console.log('\n========== BACKEND STARTING ==========');
console.log('Timestamp:', new Date().toISOString());
console.log('Process ID:', process.pid);
console.log('Node version:', process.version);
console.log('[main] express imported:', typeof express);

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';
const SERVER_START_TIME = Date.now();

console.log('\n========== CONFIGURATION ==========');
console.log('PORT:', PORT);
console.log('NODE_ENV:', NODE_ENV);
console.log('POCKETBASE_URL:', process.env.POCKETBASE_URL || 'NOT SET');
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN || '*');

// ============================================
// POCKETBASE CONNECTION CHECK (NON-BLOCKING)
// ============================================
console.log('\n========== POCKETBASE INITIALIZATION ==========');
let pbConnected = false;

try {
  console.log('Importing PocketBase client...');
  const pb = await import('./utils/pocketbaseClient.js').then(m => m.default);
  console.log('PocketBase client imported successfully');
  
  // Non-blocking health check
  (async () => {
    try {
      console.log('Attempting PocketBase health check...');
      const healthCheck = await pb.health.check();
      pbConnected = true;
      console.log('✓ PocketBase connected successfully');
      logger.info('PocketBase connected', {
        status: healthCheck.code,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.log('⚠ PocketBase health check failed (non-blocking):', error.message);
      logger.warn('PocketBase connection failed: ' + error.message, {
        errorMessage: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  })();
} catch (error) {
  console.log('⚠ PocketBase import failed (non-blocking):', error.message);
  logger.warn('PocketBase import failed: ' + error.message, {
    errorMessage: error.message,
    timestamp: new Date().toISOString(),
  });
}

// ============================================
// SECURITY & LOGGING MIDDLEWARE
// ============================================
console.log('\n========== MIDDLEWARE INITIALIZATION ==========');

try {
  console.log('Applying helmet middleware...');
  app.use(helmet());
  console.log('✓ Helmet applied');
} catch (error) {
  console.error('✗ Helmet initialization failed:', error.message);
  throw error;
}

try {
  console.log('Applying CORS middleware...');
  app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
  console.log('✓ CORS applied');
} catch (error) {
  console.error('✗ CORS initialization failed:', error.message);
  throw error;
}

try {
  console.log('Applying morgan middleware...');
  app.use(morgan('combined'));
  console.log('✓ Morgan applied');
} catch (error) {
  console.error('✗ Morgan initialization failed:', error.message);
  throw error;
}

// ============================================
// BODY PARSING MIDDLEWARE
// ============================================
try {
  console.log('Applying body parsing middleware...');
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ limit: '20mb', extended: true }));
  console.log('✓ Body parsing applied');
} catch (error) {
  console.error('✗ Body parsing initialization failed:', error.message);
  throw error;
}

// ============================================
// RATE LIMITING
// ============================================
try {
  console.log('Applying global rate limiting...');
  app.use(globalRateLimit);
  console.log('✓ Rate limiting applied');
} catch (error) {
  console.error('✗ Rate limiting initialization failed:', error.message);
  throw error;
}

// ============================================
// MOUNT ALL ROUTES AT /hcgi/api
// ============================================
console.log('\n========== MOUNTING ROUTES ==========');

try {
  app.use('/hcgi/api', routes());
  console.log('✓ All routes mounted at /hcgi/api');
  console.log('  - GET  /hcgi/api/health');
  console.log('  - POST /hcgi/api/enrollments/create');
  console.log('  - POST /hcgi/api/mercado-pago/create-preference');
  console.log('  - POST /hcgi/api/mercado-pago/webhook');
  console.log('  - GET  /hcgi/api/mercado-pago/payment-status/:id');
  console.log('  - POST /hcgi/api/admin/restart-backend');
  console.log('  - GET  /hcgi/api/admin/validate-backend');
  console.log('  - GET  /hcgi/api/admin/backend-status');
} catch (error) {
  console.error('✗ ROUTES MOUNTING FAILED:', error.message);
  console.error('Stack trace:', error.stack);
  throw error;
}

// ============================================
// STATUS DIAGNOSTIC ENDPOINT
// ============================================
try {
  console.log('\nRegistering GET /hcgi/api/status endpoint...');
  app.get('/hcgi/api/status', (req, res) => {
    const uptime = Math.floor((Date.now() - SERVER_START_TIME) / 1000);
    res.status(200).json({
      running: true,
      timestamp: new Date().toISOString(),
      uptime,
      port: PORT,
      environment: NODE_ENV,
      nodeVersion: process.version,
      pocketbaseConnected: pbConnected,
    });
  });
  console.log('✓ Status endpoint registered');
} catch (error) {
  console.error('✗ Status endpoint registration failed:', error.message);
  throw error;
}

// ============================================
// 404 HANDLER
// ============================================
try {
  console.log('Registering 404 handler...');
  app.use((req, res) => {
    console.log('404 Not Found:', req.method, req.path);
    logger.warn('404 Not Found', {
      method: req.method,
      path: req.path,
      url: req.url,
    });
    res.status(404).json({ error: 'Not Found' });
  });
  console.log('✓ 404 handler registered');
} catch (error) {
  console.error('✗ 404 handler registration failed:', error.message);
  throw error;
}

// ============================================
// ERROR MIDDLEWARE (MUST BE LAST)
// ============================================
try {
  console.log('Registering error middleware...');
  app.use(errorMiddleware);
  console.log('✓ Error middleware registered');
} catch (error) {
  console.error('✗ Error middleware registration failed:', error.message);
  throw error;
}

// ============================================
// SERVER STARTUP
// ============================================
console.log('\n========== SERVER STARTUP ==========');
console.log('About to listen on port', PORT);

const server = app.listen(PORT, () => {
  console.log('\n========== SERVER LISTENING ==========');
  console.log('✓ Server listening on port', PORT);
  console.log('✓ API available at http://localhost:' + PORT + '/hcgi/api');
  console.log('✓ Health check at http://localhost:' + PORT + '/hcgi/api/health');
  console.log('✓ Status at http://localhost:' + PORT + '/hcgi/api/status');
  console.log('========== SERVER READY ==========\n');
  
  logger.info('========== SERVER LISTENING ==========' );
  logger.info('Server running on port ' + PORT);
  logger.info('API available at http://localhost:' + PORT + '/hcgi/api');
  logger.info('Health check available at http://localhost:' + PORT + '/hcgi/api/health');
  logger.info('Status endpoint available at http://localhost:' + PORT + '/hcgi/api/status');
  logger.info('========== SERVER READY ==========' );
});

server.on('error', (error) => {
  console.error('\n✗ SERVER ERROR:', error.message);
  console.error('Code:', error.code);
  console.error('Stack:', error.stack);
  logger.error('Server error', {
    errorMessage: error.message,
    code: error.code,
    stack: error.stack,
  });
  process.exit(1);
});

server.on('listening', () => {
  console.log('Server listening event fired');
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
process.on('SIGTERM', () => {
  console.log('\nSIGTERM received, shutting down gracefully');
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully');
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  console.error('\n✗ UNCAUGHT EXCEPTION:', error.message);
  console.error('Stack:', error.stack);
  logger.error('Uncaught exception', {
    errorMessage: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n✗ UNHANDLED REJECTION:', reason);
  logger.error('Unhandled rejection', {
    reason: String(reason),
    promise: String(promise),
  });
});

export default app;