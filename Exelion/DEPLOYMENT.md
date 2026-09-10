# Exelion API Deployment Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Deployment Instructions](#deployment-instructions)
3. [Verification](#verification)
4. [Monitoring](#monitoring)
5. [Troubleshooting](#troubleshooting)
6. [Auto-Restart on Server Reboot](#auto-restart-on-server-reboot)
7. [Common Commands](#common-commands)

---

## Prerequisites

Before deploying the Exelion API, ensure the following are installed and configured:

### 1. Node.js 18+

Verify Node.js installation:

```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be 9.0.0 or higher
```

If not installed, install Node.js:

```bash
# Using NodeSource repository (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or using nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

### 2. PM2 (Process Manager)

Install PM2 globally:

```bash
sudo npm install -g pm2
```

Verify PM2 installation:

```bash
pm2 --version
```

### 3. Git

Verify Git installation:

```bash
git --version
```

### 4. PocketBase

Ensure PocketBase is running on `http://localhost:8090`:

```bash
# Check if PocketBase is running
curl http://localhost:8090/api/health
```

### 5. Apache Configuration (Hostinger)

Ensure the following Apache modules are enabled:

- `mod_rewrite` - For URL rewriting
- `mod_proxy` - For reverse proxy
- `mod_proxy_http` - For HTTP proxying
- `mod_headers` - For header manipulation

Contact Hostinger support if these modules are not enabled.

---

## Deployment Instructions

### Step 1: Clone or Pull Repository

```bash
# Navigate to your project directory
cd /path/to/exelion

# Clone the repository (if not already cloned)
git clone <repository-url> .

# Or pull latest changes
git pull origin main
```

### Step 2: Make Deploy Script Executable

```bash
chmod +x deploy.sh
chmod +x apps/api/start.sh
```

### Step 3: Run Deployment Script

```bash
./deploy.sh
```

The script will:

1. Navigate to project root
2. Pull latest code from git
3. Install dependencies (root and API)
4. Build frontend (if applicable)
5. Stop existing PM2 process
6. Start new PM2 process with production environment
7. Save PM2 process list
8. Verify health endpoint
9. Display application status

### Step 4: Verify Deployment

After the script completes, verify the deployment:

```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs exelion-api

# Test health endpoint
curl http://localhost:3001/hcgi/api/health
```

---

## Verification

### 1. Backend Health Check

Verify the backend is running:

```bash
curl http://localhost:3001/hcgi/api/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 120,
  "environment": "production",
  "port": 3001
}
```

### 2. Status Endpoint

Check detailed application status:

```bash
curl http://localhost:3001/hcgi/api/status
```

Expected response:

```json
{
  "running": true,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 120,
  "port": 3001,
  "environment": "production",
  "nodeVersion": "v18.x.x",
  "memoryUsage": { ... }
}
```

### 3. Frontend Access

Verify frontend can access the API:

```bash
# From your local machine
curl https://exelion.com.br/hcgi/api/health
```

### 4. PM2 Process Status

Check PM2 process status:

```bash
pm2 list
pm2 status exelion-api
```

---

## Monitoring

### 1. View Application Logs

```bash
# View all logs
pm2 logs exelion-api

# View last 100 lines
pm2 logs exelion-api --lines 100

# View logs in real-time
pm2 logs exelion-api --follow

# View error logs only
pm2 logs exelion-api --err

# View output logs only
pm2 logs exelion-api --out
```

### 2. Monitor Application in Real-Time

```bash
# Interactive monitoring dashboard
pm2 monit

# Exit with Ctrl+C
```

### 3. Check Memory and CPU Usage

```bash
pm2 status exelion-api
```

Look for:

- **CPU**: Should be low when idle
- **Memory**: Should not exceed 500MB (max_memory_restart threshold)
- **Status**: Should be "online"
- **Uptime**: Shows how long the process has been running

### 4. View Process Details

```bash
pm2 show exelion-api
```

### 5. Set Up Log Rotation

Prevent logs from consuming too much disk space:

```bash
# Install PM2 log rotation module
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 save
```

---

## Troubleshooting

### Issue 1: Port 3001 Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::3001`

**Solution**:

```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or use PM2 to stop the process
pm2 stop exelion-api
pm2 delete exelion-api
pm2 start ecosystem.config.js --env production
```

### Issue 2: Permission Denied

**Error**: `Permission denied` when running deploy.sh

**Solution**:

```bash
# Make script executable
chmod +x deploy.sh
chmod +x apps/api/start.sh

# Run with proper permissions
./deploy.sh
```

### Issue 3: Environment Variables Not Loaded

**Error**: `MERCADO_PAGO_ACCESS_TOKEN is not set`

**Solution**:

```bash
# Verify .env.production exists
ls -la apps/api/.env.production

# Check environment variables
pm2 show exelion-api

# Restart with environment variables
pm2 restart exelion-api --env production

# Or delete and restart
pm2 delete exelion-api
pm2 start ecosystem.config.js --env production
```

### Issue 4: PocketBase Connection Failed

**Error**: `PocketBase connection failed`

**Solution**:

```bash
# Verify PocketBase is running
curl http://localhost:8090/api/health

# Check PocketBase logs
# (depends on how PocketBase is running)

# Verify POCKETBASE_URL in .env.production
cat apps/api/.env.production | grep POCKETBASE_URL

# Restart API after PocketBase is running
pm2 restart exelion-api
```

### Issue 5: Mercado Pago API Errors

**Error**: `Mercado Pago API error`

**Solution**:

```bash
# Verify Mercado Pago credentials
cat apps/api/.env.production | grep MERCADO_PAGO

# Check if credentials are correct
# - MERCADO_PAGO_ACCESS_TOKEN should start with "APP_USR-"
# - MERCADO_PAGO_PUBLIC_KEY should start with "APP_USR-"

# Update credentials if needed
nano apps/api/.env.production

# Restart application
pm2 restart exelion-api
```

### Issue 6: CORS Errors

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:

```bash
# Verify CORS_ORIGIN in .env.production
cat apps/api/.env.production | grep CORS_ORIGIN

# Should be: CORS_ORIGIN=https://exelion.com.br

# Verify .htaccess has correct CORS headers
cat apps/api/.htaccess | grep -A 5 "CORS Headers"

# Restart application
pm2 restart exelion-api
```

### Issue 7: Application Crashes Frequently

**Error**: `exelion-api has restarted X times`

**Solution**:

```bash
# Check logs for errors
pm2 logs exelion-api --err

# Check memory usage
pm2 status exelion-api

# If memory is high, increase max_memory_restart in ecosystem.config.js
# Then restart:
pm2 restart exelion-api

# Check for unhandled exceptions
pm2 logs exelion-api --follow
```

### Issue 8: Health Check Endpoint Not Responding

**Error**: `curl: (7) Failed to connect to localhost port 3001`

**Solution**:

```bash
# Check if process is running
pm2 status exelion-api

# Check logs
pm2 logs exelion-api

# Restart process
pm2 restart exelion-api

# Wait a few seconds and try again
sleep 5
curl http://localhost:3001/hcgi/api/health
```

---

## Auto-Restart on Server Reboot

Configure PM2 to automatically restart the application when the server reboots.

### Step 1: Generate Startup Script

```bash
pm2 startup
```

This command will output something like:

```
[PM2] To setup the Startup Hook, copy/paste this command:
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u username --hp /home/username
```

### Step 2: Run the Generated Command

Copy and paste the command from Step 1:

```bash
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u username --hp /home/username
```

### Step 3: Save PM2 Process List

```bash
pm2 save
```

This saves the current process list to be restored on reboot.

### Step 4: Verify Auto-Startup Configuration

```bash
# Check if PM2 startup is configured
sudo systemctl status pm2-username

# View PM2 startup configuration
cat ~/.pm2/dump.pm2
```

### Step 5: Test Auto-Restart (Optional)

```bash
# Simulate server reboot
sudo reboot

# After reboot, verify process is running
pm2 list
pm2 status exelion-api
```

---

## Common Commands

### Process Management

```bash
# Start application
pm2 start ecosystem.config.js --env production

# Stop application
pm2 stop exelion-api

# Restart application
pm2 restart exelion-api

# Reload application (graceful restart)
pm2 reload exelion-api

# Delete application from PM2
pm2 delete exelion-api

# List all processes
pm2 list

# Show process details
pm2 show exelion-api
```

### Logging

```bash
# View logs
pm2 logs exelion-api

# View last 100 lines
pm2 logs exelion-api --lines 100

# View logs in real-time
pm2 logs exelion-api --follow

# Clear logs
pm2 flush

# View error logs
pm2 logs exelion-api --err

# View output logs
pm2 logs exelion-api --out
```

### Monitoring

```bash
# Interactive monitoring
pm2 monit

# Show process status
pm2 status

# Show process details
pm2 show exelion-api

# Show memory and CPU usage
pm2 status exelion-api
```

### Configuration

```bash
# Save process list
pm2 save

# Restore process list
pm2 resurrect

# Setup auto-startup
pm2 startup

# Remove auto-startup
pm2 unstartup
```

### Deployment

```bash
# Deploy using ecosystem.config.js
pm2 start ecosystem.config.js --env production

# Reload all processes
pm2 reload all

# Restart all processes
pm2 restart all

# Stop all processes
pm2 stop all

# Delete all processes
pm2 delete all
```

---

## Environment Variables

The application uses the following environment variables (configured in `.env.production`):

```bash
# Node environment
NODE_ENV=production

# Server port
PORT=3001

# PocketBase configuration
POCKETBASE_URL=http://localhost:8090

# Mercado Pago credentials
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-...
MERCADO_PAGO_PUBLIC_KEY=APP_USR-...

# URLs
WEBHOOK_URL=https://exelion.com.br
FRONTEND_URL=https://exelion.com.br
CORS_ORIGIN=https://exelion.com.br
```

---

## Support and Resources

- **PM2 Documentation**: https://pm2.keymetrics.io/docs/usage/quick-start/
- **Node.js Documentation**: https://nodejs.org/en/docs/
- **Hostinger Support**: https://support.hostinger.com/
- **PocketBase Documentation**: https://pocketbase.io/docs/
- **Mercado Pago Documentation**: https://www.mercadopago.com.br/developers/en/docs

---

## Deployment Checklist

Before deploying to production, ensure:

- [ ] Node.js 18+ is installed
- [ ] PM2 is installed globally
- [ ] Git repository is configured
- [ ] `.env.production` file is created with correct credentials
- [ ] PocketBase is running on `http://localhost:8090`
- [ ] Apache modules are enabled (mod_rewrite, mod_proxy, mod_headers)
- [ ] `.htaccess` file is in place
- [ ] `deploy.sh` script is executable
- [ ] `apps/api/start.sh` script is executable
- [ ] `ecosystem.config.js` is configured correctly
- [ ] Mercado Pago credentials are valid
- [ ] CORS_ORIGIN is set to `https://exelion.com.br`
- [ ] WEBHOOK_URL is set to `https://exelion.com.br`
- [ ] FRONTEND_URL is set to `https://exelion.com.br`
- [ ] Health endpoint responds correctly
- [ ] Frontend can access API endpoints
- [ ] Auto-restart on reboot is configured
- [ ] Log rotation is configured
- [ ] Monitoring is set up

---

## Deployment History

Keep track of deployments:

```bash
# View PM2 process history
pm2 logs exelion-api | head -50

# Check last deployment time
pm2 show exelion-api | grep "created at"
```

---

**Last Updated**: January 2024
**Version**: 1.0.0