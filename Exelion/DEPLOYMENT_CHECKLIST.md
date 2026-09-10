# Exelion API Deployment Checklist

## Pre-Deployment Verification

### 1. File Structure
- [ ] `apps/api/src/main.js` exists (entry point)
- [ ] `apps/api/package.json` exists with all dependencies
- [ ] `apps/api/.env.production` exists with all required variables
- [ ] `apps/api/src/routes/index.js` exists and exports routes function
- [ ] `apps/api/src/middleware/error.js` exists
- [ ] `apps/api/src/utils/logger.js` exists
- [ ] `apps/api/src/utils/pocketbaseClient.js` exists

### 2. Environment Variables
Verify `.env.production` contains:
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

### 3. Dependencies
- [ ] Run `npm install --production` in `apps/api/`
- [ ] Verify `node_modules/` directory exists
- [ ] Verify all required packages installed:
  - express
  - cors
  - helmet
  - morgan
  - dotenv
  - mercadopago
  - pocketbase
  - express-rate-limit

### 4. Process Management
- [ ] PM2 is installed globally: `npm install -g pm2`
- [ ] `ecosystem.config.js` exists in project root
- [ ] `deploy.sh` is executable: `chmod +x deploy.sh`

## Deployment Steps

### Step 1: Stop Current Process
```bash
pm2 stop exelion-api
pm2 delete exelion-api
```

### Step 2: Install Dependencies
```bash
cd apps/api
npm install --production
cd ../..
```

### Step 3: Verify Environment
```bash
cat apps/api/.env.production
```

### Step 4: Start with PM2
```bash
pm2 start ecosystem.config.js --env production
pm2 save
```

### Step 5: Verify Process
```bash
pm2 list
pm2 logs exelion-api
```

## Post-Deployment Verification

### 1. Process Status
- [ ] `pm2 list` shows `exelion-api` with status `online`
- [ ] Process is listening on port 3001
- [ ] No errors in `pm2 logs exelion-api`

### 2. Health Check Endpoint
```bash
curl http://localhost:3001/hcgi/api/health
```
Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123,
  "environment": "production",
  "port": 3001
}
```

### 3. Test Endpoint
```bash
curl http://localhost:3001/hcgi/api/test
```
Expected response:
```json
{
  "success": true,
  "message": "API server is working correctly",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 4. Status Endpoint
```bash
curl http://localhost:3001/hcgi/api/status
```
Expected response:
```json
{
  "running": true,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123,
  "port": 3001,
  "environment": "production",
  "nodeVersion": "v18.x.x",
  "memoryUsage": {...}
}
```

### 5. Reverse Proxy Configuration
- [ ] `.htaccess` is in `apps/api/` directory
- [ ] Reverse proxy forwards `/hcgi/api/*` to `http://localhost:3001/hcgi/api/*`
- [ ] Apache modules enabled: `mod_rewrite`, `mod_proxy`, `mod_proxy_http`, `mod_headers`
- [ ] CORS headers are set correctly

### 6. Frontend Integration
```bash
curl https://exelion.com.br/hcgi/api/health
```
Expected response: HTTP 200 with health check data

## Troubleshooting

### Issue: GET /hcgi/api/health returns 404

**Cause 1: Process not running**
```bash
pm2 list
pm2 logs exelion-api
```

**Cause 2: Reverse proxy not configured**
- Check `.htaccess` in `apps/api/`
- Verify Apache modules are enabled
- Check reverse proxy rules

**Cause 3: Port 3001 not listening**
```bash
netstat -tlnp | grep 3001
lsof -i :3001
```

**Cause 4: Environment variables not loaded**
```bash
pm2 env exelion-api
```

### Issue: 500 Internal Server Error

**Check logs:**
```bash
pm2 logs exelion-api --lines 100
```

**Common causes:**
- PocketBase not running on `http://localhost:8090`
- Missing environment variables
- Database connection issues

### Issue: CORS errors

**Verify CORS configuration:**
```bash
curl -H "Origin: https://exelion.com.br" http://localhost:3001/hcgi/api/health -v
```

**Check .htaccess CORS headers:**
```bash
grep -A 5 "Access-Control" apps/api/.htaccess
```

## Monitoring

### View Logs
```bash
pm2 logs exelion-api
pm2 logs exelion-api --lines 100
pm2 logs exelion-api --err
```

### Monitor Process
```bash
pm2 monit
```

### Save PM2 Configuration
```bash
pm2 save
pm2 startup
```

## Rollback

If deployment fails:
```bash
pm2 stop exelion-api
pm2 delete exelion-api
# Restore previous version
pm2 start ecosystem.config.js --env production
```

## Success Criteria

✅ All checks passed when:
1. `pm2 list` shows `exelion-api` with status `online`
2. `GET /hcgi/api/health` returns HTTP 200
3. `GET /hcgi/api/test` returns HTTP 200
4. `GET /hcgi/api/status` returns HTTP 200
5. `GET https://exelion.com.br/hcgi/api/health` returns HTTP 200
6. No errors in `pm2 logs exelion-api`
7. PocketBase connection successful
8. Mercado Pago integration working