import rateLimit from 'express-rate-limit';

console.log('[Rate Limit] Initializing global rate limiter...');

let globalRateLimit;

try {
  globalRateLimit = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later' },
    validate: { trustProxy: false },
  });
  console.log('[Rate Limit] ✓ Rate limiter created successfully');
} catch (error) {
  console.error('[Rate Limit] ✗ Failed to create rate limiter:', error.message);
  throw error;
}

export { globalRateLimit };