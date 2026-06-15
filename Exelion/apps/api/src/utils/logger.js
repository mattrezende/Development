const logger = {
    // Application errors - goes to stderr
    error: (...args) => {
        console.error('[ERROR]', ...args);
    },

    // Critical system errors - goes to stderr
    fatal: (...args) => {
        console.error('[FATAL]', ...args);
    },

    info: (...args) => {
        console.log('[INFO]', ...args);
    },

    debug: (...args) => {
        console.log('[DEBUG]', ...args);
    },

    warn: (...args) => {
        console.log('[WARN]', ...args);
    }
};

export default logger;

export { logger };

