# Exelion API Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Exelion API to production on exelion.com.br.

**Critical Information:**
- **API Port:** 3001 (NOT 3000, NOT 5000)
- **Entry Point:** `apps/api/src/main.js`
- **Process Manager:** PM2
- **Environment:** Production
- **Domain:** https://exelion.com.br
- **API Base URL:** https://exelion.com.br/hcgi/api

## Quick Start (5 minutes)

### 1. SSH into Production Server
```bash
ssh user@exelion.com.br
cd /path/to/project
```

### 2. Run Deployment Script
```bash
chmod +x deploy.sh
./deploy.sh
```

### 3. Verify Deployment
```bash
curl http://localhost:3001/hcgi/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 5,
  "environment": "production",
  "port": 3001
}
```

## Detailed Deployment Steps

### Step 1: Prepare Server

#### 1.1 Install Node.js (if not already installed)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Should be v18.x.x or higher
npm --version   # Should be 9.x.x or higher
```

#### 1.2 Install PM2 Globally
```bash
sudo npm install -g pm2
pm2 --version
```

#### 1.3 Enable PM2 Startup
```bash
pm2 startup
pm2 save
```

### Step 2: Deploy Application

#### 2.1 Clone/Update Repository
```bash
cd /path/to/project
git pull origin main  # or your branch
```

#### 2.2 Install Dependencies
```bash
cd apps/api
npm install --production
cd ../..
```

#### 2.3 Verify Environment Configuration
```bash
cat apps/api/.env.production
```

Must contain:
```
NODE_ENV=production
PORT=3001
POCKETBASE_URL=http://localhost:8090
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-2368236140107101-050102-2c105485ac6271502649a7abdfa6153d-69409323
MERCADO_PAGO_PUBLIC_KEY=APP_USR-404f25e5-3eca-4398-8b36-13cf7371074b
WEBHOOK_URL=https://exelion.com.br
FRONTEND_URL=https://exelion.com.br
CORS_ORIGIN=https://exelion.com.br
```

#### 2.4 Stop Current Process (if running)
```bash
pm2 stop exelion-api || true
pm2 delete exelion-api || true
```

#### 2.5 Start with PM2
```bash
pm2 start ecosystem.config.js --env production
pm2 save
```

#### 2.6 Verify Process is Running
```bash
pm2 list
pm2 logs exelion-api --lines 20
```

Expected output:
```
┌─────┬──────────────┬─────────┬──────┬──────────┬──────────┐
│ id  │ name         │ version │ mode │ status   │ restart  │
├─────┼──────────────┼─────────┼──────┼──────────┼──────────┤
│ 0   │ exelion-api  │ N/A     │ fork │ online   │ 0        │
└─────┴──────────────┴─────────┴──────┴──────────┴──────────┘
```

### Step 3: Verify Backend Connectivity

#### 3.1 Test Local Health Check
```bash
curl http://localhost:3001/hcgi/api/health
```

Expected response (HTTP 200):
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 15,
  "environment": "production",
  "port": 3001
}
```

#### 3.2 Test Status Endpoint
```bash
curl http://localhost:3001/hcgi/api/status
```

Expected response (HTTP 200):
```json
{
  "running": true,
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 20,
  "port": 3001,
  "environment": "production",
  "nodeVersion": "v18.x.x",
  "memoryUsage": {...}
}
```

#### 3.3 Test API Endpoint
```bash
curl http://localhost:3001/hcgi/api/test
```

Expected response (HTTP 200):
```json
{
  "success": true,
  "message": "API server is working correctly",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Step 4: Verify Reverse Proxy Configuration

#### 4.1 Check .htaccess
```bash
cat apps/api/.htaccess
```

Must contain proxy rules for `/hcgi/api/*` → `http://localhost:3001/hcgi/api/*`

#### 4.2 Verify Apache Modules
```bash
sudo apache2ctl -M | grep -E "rewrite|proxy|headers"
```

Expected output:
```
 rewrite_module (shared)
 proxy_module (shared)
 proxy_http_module (shared)
 headers_module (shared)
```

If missing, enable them:
```bash
sudo a2enmod rewrite
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod headers
sudo systemctl restart apache2
```

#### 4.3 Test Reverse Proxy
```bash
curl https://exelion.com.br/hcgi/api/health
```

Expected response (HTTP 200):
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 30,
  "environment": "production",
  "port": 3001
}
```

### Step 5: Verify PocketBase Connection

#### 5.1 Check PocketBase is Running
```bash
curl http://localhost:8090/api/health
```

Expected response (HTTP 200):
```json
{
  "code": 200,
  "message": "OK"
}
```

#### 5.2 Check API Logs for PocketBase Connection
```bash
pm2 logs exelion-api | grep -i pocketbase
```

Expected output:
```
PocketBase connected successfully
```

### Step 6: Verify Mercado Pago Integration

#### 6.1 Check Environment Variables
```bash
pm2 env exelion-api | grep MERCADO_PAGO
```

Expected output:
```
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-2368236140107101-050102-2c105485ac6271502649a7abdfa6153d-69409323
MERCADO_PAGO_PUBLIC_KEY=APP_USR-404f25e5-3eca-4398-8b36-13cf7371074b
```

#### 6.2 Check API Logs for Mercado Pago
```bash
pm2 logs exelion-api | grep -i mercado
```

Expected output:
```
Mercado Pago configured
```

## Troubleshooting

### Issue: GET /hcgi/api/health returns 404

**Step 1: Check if process is running**
```bash
pm2 list
```

If status is not `online`, check logs:
```bash
pm2 logs exelion-api --lines 100
```

**Step 2: Check if port 3001 is listening**
```bash
netstat -tlnp | grep 3001
lsof -i :3001
```

If not listening, restart:
```bash
pm2 restart exelion-api
```

**Step 3: Check reverse proxy configuration**
```bash
grep -A 5 "hcgi/api" apps/api/.htaccess
```

Must contain:
```
RewriteRule ^hcgi/api/(.*)$ http://localhost:3001/hcgi/api/$1 [P,L]
```

**Step 4: Check Apache error logs**
```bash
sudo tail -f /var/log/apache2/error.log
```

Look for proxy errors.

### Issue: 500 Internal Server Error

**Check API logs:**
```bash
pm2 logs exelion-api --lines 100
```

**Common causes:**
1. PocketBase not running
   ```bash
   curl http://localhost:8090/api/health
   ```

2. Missing environment variables
   ```bash
   pm2 env exelion-api
   ```

3. Database connection issues
   ```bash
   pm2 logs exelion-api | grep -i error
   ```

### Issue: CORS errors

**Check CORS headers:**
```bash
curl -H "Origin: https://exelion.com.br" http://localhost:3001/hcgi/api/health -v
```

Look for `Access-Control-Allow-Origin` header.

**Verify .htaccess CORS configuration:**
```bash
grep -A 10 "CORS Headers" apps/api/.htaccess
```

### Issue: Process keeps restarting

**Check logs for errors:**
```bash
pm2 logs exelion-api --err
```

**Common causes:**
1. Out of memory
   ```bash
   pm2 monit
   ```

2. Unhandled exceptions
   ```bash
   pm2 logs exelion-api | grep -i exception
   ```

3. Port already in use
   ```bash
   lsof -i :3001
   ```

## Monitoring

### View Real-time Logs
```bash
pm2 logs exelion-api
```

### View Last 100 Lines
```bash
pm2 logs exelion-api --lines 100
```

### View Error Logs Only
```bash
pm2 logs exelion-api --err
```

### Monitor Process Resources
```bash
pm2 monit
```

### View Process Details
```bash
pm2 show exelion-api
```

## Maintenance

### Restart Process
```bash
pm2 restart exelion-api
```

### Stop Process
```bash
pm2 stop exelion-api
```

### Start Process
```bash
pm2 start ecosystem.config.js --env production
```

### Delete Process
```bash
pm2 delete exelion-api
```

### Update Dependencies
```bash
cd apps/api
npm update --production
cd ../..
pm2 restart exelion-api
```

### View Environment Variables
```bash
pm2 env exelion-api
```

## Rollback

If deployment fails:

```bash
# Stop current process
pm2 stop exelion-api
pm2 delete exelion-api

# Restore previous version
git checkout HEAD~1
cd apps/api
npm install --production
cd ../..

# Start previous version
pm2 start ecosystem.config.js --env production
```

## Success Criteria

✅ Deployment is successful when:

1. **Process Status**
   ```bash
   pm2 list
   ```
   Shows `exelion-api` with status `online`

2. **Health Check**
   ```bash
   curl https://exelion.com.br/hcgi/api/health
   ```
   Returns HTTP 200 with `{"status": "ok", ...}`

3. **Test Endpoint**
   ```bash
   curl https://exelion.com.br/hcgi/api/test
   ```
   Returns HTTP 200 with `{"success": true, ...}`

4. **Status Endpoint**
   ```bash
   curl https://exelion.com.br/hcgi/api/status
   ```
   Returns HTTP 200 with process information

5. **No Errors in Logs**
   ```bash
   pm2 logs exelion-api | grep ERROR
   ```
   Should return no results

6. **PocketBase Connected**
   ```bash
   pm2 logs exelion-api | grep "PocketBase connected"
   ```
   Should show successful connection

7. **Mercado Pago Configured**
   ```bash
   pm2 logs exelion-api | grep "MERCADO_PAGO"
   ```
   Should show configuration is set

## Support

For issues or questions:
1. Check logs: `pm2 logs exelion-api`
2. Review this guide
3. Check DEPLOYMENT_CHECKLIST.md
4. Contact DevOps team