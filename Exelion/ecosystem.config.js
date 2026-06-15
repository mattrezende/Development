module.exports = {
  apps: [
    {
      name: 'exelion-api',
      script: './apps/api/src/main.js',
      cwd: './',
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
      error_file: './logs/exelion-api-error.log',
      out_file: './logs/exelion-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      ignore_watch: ['node_modules', 'logs', '.git'],
      listen_timeout: 10000,
      kill_timeout: 5000,
    },
  ],
};