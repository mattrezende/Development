import express from 'express';

console.log('[test-routes] ========== MODULE LOADING STARTED ==========' );
console.log('[test-routes] Timestamp:', new Date().toISOString());
console.log('[test-routes] Process ID:', process.pid);

// ============================================
// DIAGNOSTIC: Express Import
// ============================================
console.log('[test-routes] DIAGNOSTIC: Express Import');
console.log('[test-routes] typeof express:', typeof express);
console.log('[test-routes] express is object:', express instanceof Object);
console.log('[test-routes] express.Router exists:', typeof express.Router);
console.log('[test-routes] express.Router is function:', typeof express.Router === 'function');
console.log('[test-routes] express.Router constructor:', express.Router.constructor.name);

// ============================================
// EXPORT FUNCTION DEFINITION
// ============================================
console.log('[test-routes] Defining testRoutes() export function');

export default function testRoutes() {
  console.log('[test-routes] ========== testRoutes() FUNCTION CALLED ==========' );
  console.log('[test-routes] Timestamp:', new Date().toISOString());
  console.log('[test-routes] Process ID:', process.pid);
  
  // ============================================
  // STEP 1: Create Router Instance
  // ============================================
  console.log('[test-routes] STEP 1: Creating express.Router() instance');
  console.log('[test-routes] About to call express.Router()');
  console.log('[test-routes] express.Router type:', typeof express.Router);
  console.log('[test-routes] express.Router is callable:', typeof express.Router === 'function');
  
  const router = express.Router();
  
  console.log('[test-routes] STEP 1 COMPLETE: Router instance created');
  console.log('[test-routes] typeof router:', typeof router);
  console.log('[test-routes] router is object:', router instanceof Object);
  console.log('[test-routes] router is truthy:', !!router);
  console.log('[test-routes] router constructor name:', router.constructor.name);
  console.log('[test-routes] router.get exists:', typeof router.get);
  console.log('[test-routes] router.post exists:', typeof router.post);
  console.log('[test-routes] router.use exists:', typeof router.use);
  console.log('[test-routes] router.all exists:', typeof router.all);
  console.log('[test-routes] router._router exists:', !!router._router);
  console.log('[test-routes] router.stack exists:', !!router.stack);
  console.log('[test-routes] router.stack is array:', Array.isArray(router.stack));
  console.log('[test-routes] router.stack length:', router.stack ? router.stack.length : 'N/A');
  
  // ============================================
  // STEP 2: Register Test GET /test Route
  // ============================================
  console.log('[test-routes] STEP 2: Registering GET /test route');
  console.log('[test-routes] About to call router.get("/test", handler)');
  
  router.get('/test', (req, res) => {
    console.log('[test-routes] GET /test handler called');
    res.status(200).json({
      success: true,
      message: 'Test route working correctly',
      timestamp: new Date().toISOString(),
    });
  });
  
  console.log('[test-routes] STEP 2 COMPLETE: Test route registered');
  console.log('[test-routes] router.stack length after registration:', router.stack ? router.stack.length : 'N/A');
  if (router.stack && router.stack.length > 0) {
    const lastRoute = router.stack[router.stack.length - 1];
    console.log('[test-routes] Last route in stack:', {
      route: lastRoute.route ? lastRoute.route.path : 'N/A',
      methods: lastRoute.route ? Object.keys(lastRoute.route.methods) : 'N/A',
    });
  }
  
  // ============================================
  // STEP 3: Verify Router State Before Return
  // ============================================
  console.log('[test-routes] STEP 3: Verifying router state before return');
  console.log('[test-routes] router type:', typeof router);
  console.log('[test-routes] router is object:', router instanceof Object);
  console.log('[test-routes] router is truthy:', !!router);
  console.log('[test-routes] router constructor name:', router.constructor.name);
  console.log('[test-routes] router has methods:', {
    get: typeof router.get === 'function',
    post: typeof router.post === 'function',
    use: typeof router.use === 'function',
    all: typeof router.all === 'function',
  });
  console.log('[test-routes] router.stack:', {
    exists: !!router.stack,
    isArray: Array.isArray(router.stack),
    length: router.stack ? router.stack.length : 'N/A',
  });
  console.log('[test-routes] router._router:', {
    exists: !!router._router,
    type: typeof router._router,
  });
  
  // ============================================
  // STEP 4: Return Router
  // ============================================
  console.log('[test-routes] STEP 4: Returning router from testRoutes() function');
  console.log('[test-routes] About to return router');
  console.log('[test-routes] Return value type:', typeof router);
  console.log('[test-routes] Return value is object:', router instanceof Object);
  console.log('[test-routes] Return value is truthy:', !!router);
  console.log('[test-routes] Return value constructor:', router.constructor.name);
  
  return router;
}

console.log('[test-routes] ========== MODULE LOADING COMPLETE ==========' );
console.log('[test-routes] testRoutes function exported as default');
console.log('[test-routes] typeof testRoutes:', typeof testRoutes);
console.log('[test-routes] testRoutes is function:', typeof testRoutes === 'function');
console.log('[test-routes] testRoutes constructor:', testRoutes.constructor.name);