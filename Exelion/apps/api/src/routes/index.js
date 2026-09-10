import express from 'express';
import healthCheckHandler from './health-check.js';
import enrollmentsRouter from './enrollments.js';
import mercadoPagoRouter from './mercado-pago.js';
import adminRouter from './admin.js';

console.log('[routes-index] ========== MODULE LOADING STARTED ==========' );
console.log('[routes-index] Timestamp:', new Date().toISOString());
console.log('[routes-index] Process ID:', process.pid);

// ============================================
// DIAGNOSTIC: Express Import
// ============================================
console.log('[routes-index] DIAGNOSTIC: Express Import');
console.log('[routes-index] typeof express:', typeof express);
console.log('[routes-index] express is object:', express instanceof Object);
console.log('[routes-index] express.Router exists:', typeof express.Router);
console.log('[routes-index] express.Router is function:', typeof express.Router === 'function');
console.log('[routes-index] express.Router constructor:', express.Router.constructor.name);

// ============================================
// DIAGNOSTIC: Health Check Handler Import
// ============================================
console.log('[routes-index] DIAGNOSTIC: Health Check Handler Import');
console.log('[routes-index] typeof healthCheckHandler:', typeof healthCheckHandler);
console.log('[routes-index] healthCheckHandler is function:', typeof healthCheckHandler === 'function');
console.log('[routes-index] healthCheckHandler constructor:', healthCheckHandler.constructor.name);

// ============================================
// EXPORT FUNCTION DEFINITION
// ============================================
console.log('[routes-index] Defining routes() export function');

export default function routes() {
  console.log('[routes-index] ========== routes() FUNCTION CALLED ==========' );
  console.log('[routes-index] Timestamp:', new Date().toISOString());
  console.log('[routes-index] Process ID:', process.pid);
  
  // ============================================
  // STEP 1: Create Router Instance
  // ============================================
  console.log('[routes-index] STEP 1: Creating express.Router() instance');
  console.log('[routes-index] About to call express.Router()');
  console.log('[routes-index] express.Router type:', typeof express.Router);
  console.log('[routes-index] express.Router is callable:', typeof express.Router === 'function');
  
  const router = express.Router();
  
  console.log('[routes-index] STEP 1 COMPLETE: Router instance created');
  console.log('[routes-index] typeof router:', typeof router);
  console.log('[routes-index] router is object:', router instanceof Object);
  console.log('[routes-index] router is truthy:', !!router);
  console.log('[routes-index] router constructor name:', router.constructor.name);
  console.log('[routes-index] router.get exists:', typeof router.get);
  console.log('[routes-index] router.post exists:', typeof router.post);
  console.log('[routes-index] router.use exists:', typeof router.use);
  console.log('[routes-index] router.all exists:', typeof router.all);
  console.log('[routes-index] router._router exists:', !!router._router);
  console.log('[routes-index] router.stack exists:', !!router.stack);
  console.log('[routes-index] router.stack is array:', Array.isArray(router.stack));
  console.log('[routes-index] router.stack length:', router.stack ? router.stack.length : 'N/A');
  
  // ============================================
  // STEP 2: Register Health Check Route
  // ============================================
  console.log('[routes-index] STEP 2: Registering GET /health route');
  console.log('[routes-index] healthCheckHandler type:', typeof healthCheckHandler);
  console.log('[routes-index] healthCheckHandler is function:', typeof healthCheckHandler === 'function');
  console.log('[routes-index] About to call router.get("/health", healthCheckHandler)');
  
  router.get('/health', healthCheckHandler);
  router.use('/enrollments', enrollmentsRouter);
  router.use('/mercado-pago', mercadoPagoRouter);
  router.use('/admin', adminRouter);

  console.log('[routes-index] STEP 2 COMPLETE: Health check route registered');
  console.log('[routes-index] router.stack length after registration:', router.stack ? router.stack.length : 'N/A');
  if (router.stack && router.stack.length > 0) {
    const lastRoute = router.stack[router.stack.length - 1];
    console.log('[routes-index] Last route in stack:', {
      route: lastRoute.route ? lastRoute.route.path : 'N/A',
      methods: lastRoute.route ? Object.keys(lastRoute.route.methods) : 'N/A',
    });
  }
  
  // ============================================
  // STEP 3: Verify Router State Before Return
  // ============================================
  console.log('[routes-index] STEP 3: Verifying router state before return');
  console.log('[routes-index] router type:', typeof router);
  console.log('[routes-index] router is object:', router instanceof Object);
  console.log('[routes-index] router is truthy:', !!router);
  console.log('[routes-index] router constructor name:', router.constructor.name);
  console.log('[routes-index] router has methods:', {
    get: typeof router.get === 'function',
    post: typeof router.post === 'function',
    use: typeof router.use === 'function',
    all: typeof router.all === 'function',
  });
  console.log('[routes-index] router.stack:', {
    exists: !!router.stack,
    isArray: Array.isArray(router.stack),
    length: router.stack ? router.stack.length : 'N/A',
  });
  console.log('[routes-index] router._router:', {
    exists: !!router._router,
    type: typeof router._router,
  });
  
  // ============================================
  // STEP 4: Return Router
  // ============================================
  console.log('[routes-index] STEP 4: Returning router from routes() function');
  console.log('[routes-index] About to return router');
  console.log('[routes-index] Return value type:', typeof router);
  console.log('[routes-index] Return value is object:', router instanceof Object);
  console.log('[routes-index] Return value is truthy:', !!router);
  console.log('[routes-index] Return value constructor:', router.constructor.name);
  
  return router;
}

console.log('[routes-index] ========== MODULE LOADING COMPLETE ==========' );
console.log('[routes-index] routes function exported as default');
console.log('[routes-index] typeof routes:', typeof routes);
console.log('[routes-index] routes is function:', typeof routes === 'function');
console.log('[routes-index] routes constructor:', routes.constructor.name);