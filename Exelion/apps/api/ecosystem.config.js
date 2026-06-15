/**
 * PM2 Ecosystem Configuration for Exelion API
 * 
 * This file configures PM2 to manage the Node.js API process.
 * PM2 ensures the application auto-restarts on server reboot and handles crashes.
 * 
 * Usage:
 *   pm2 start ecosystem.config.js --env production
 *   pm2 save
 *   pm2 startup
 */

module.exports = {
  apps: [
    {
      name: 'exelion-api',
      script: './src/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      // Auto-restart on crash
      autorestart: true,
      // Max memory before restart (500MB)
      max_memory_restart: '500M',
      // Watch for file changes (disable in production)
      watch: false,
      // Ignore certain files
      ignore_watch: ['node_modules', 'logs', '.git'],
      // Error log file
      error_file: './logs/error.log',
      // Combined output log file
      out_file: './logs/out.log',
      // Log date format
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Merge logs from multiple instances
      merge_logs: true,
      // Kill timeout (ms) - time to wait before force killing
      kill_timeout: 5000,
      // Listen timeout (ms) - time to wait for app to listen
      listen_timeout: 3000,
      // Shutdown with SIGTERM
      shutdown_with_message: true,
    },
  ],
};