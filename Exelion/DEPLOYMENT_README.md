# Exelion API - Deployment & Verification Guide

## 🚨 CRITICAL ISSUE: GET /hcgi/api/health returns 404

### Root Causes & Solutions

#### Cause 1: Process Not Running
```bash
# Check if process is running
pm2 list

# If not running, start it
pm2 start ecosystem.config.js --env production

# Verify it's online
pm2 list | grep exelion-api
```

#### Cause 2: Port 3001 Not Listening
```bash
# Check if port is listening
netstat -tlnp | grep 3001
lsof -i :3001

# If not listening, check logs
pm2 logs exelion-api --lines 50

# Restart process
pm2 restart exelion-api
```

#### Cause 3: Reverse Proxy Not Configured
```bash
# Verify .htaccess exists
ls -la apps/api/.htaccess

# Check proxy rules
grep -A 5 "hcgi/api" apps/api/.htaccess

# Verify Apache modules
sudo apache2ctl -M | grep -E "rewrite|proxy|headers"

# Enable modules if needed
sudo a2enmod rewrite
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod headers
sudo systemctl restart apache2
```

#### Cause 4: Environment Variables Not Loaded
```bash
# Check environment variables
pm2 env exelion-api

# Verify .env.production exists
cat apps/api/.env.production

# Restart to reload env vars
pm2 restart exelion-api
```

---

## 🚀 Quick Start (5 Minutes)

### Option 1: Automated Deployment
```bash
# Make scripts executable
chmod +x deploy.sh QUICK_DEPLOY.sh VERIFY_DEPLOYMENT.sh

# Run quick deploy
./QUICK_DEPLOY.sh

# Verify deployment
./VERIFY_DEPLOYMENT.sh
```

### Option 2: Manual Deployment
```bash
# 1. Stop current process
pm2 stop exelion-api || true
pm2 delete exelion-api || true

# 2. Install dependencies
cd apps/api
npm install --production
cd ../..

# 3. Start process
pm2 start ecosystem.config.js --env production
pm2 save

# 4. Verify
pm2 list
pm2 logs exelion-api --lines 20
```

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Node.js v18+ installed: `node --version`
- [ ] PM2 installed globally: `npm install -g pm2`
- [ ] Repository cloned/updated: `git pull origin main`
- [ ] `.env.production` exists with all required variables
- [ ] PocketBase running on `http://localhost:8090`

### Deployment
- [ ] Dependencies installed: `npm install --production` in `apps/api/`
- [ ] Process stopped: `pm2 stop exelion-api`
- [ ] Process started: `pm2 start ecosystem.config.js --env production`
- [ ] Process saved: `pm2 save`

### Post-Deployment
- [ ] Process online: `pm2 list` shows `exelion-api` with status `online`
- [ ] Port listening: `lsof -i :3001` shows Node.js listening
- [ ] Health check passes: `curl http://localhost:3001/hcgi/api/health`
- [ ] Test endpoint works: `curl http://localhost:3001/hcgi/api/test`
- [ ] Status endpoint works: `curl http://localhost:3001/hcgi/api/status`
- [ ] Reverse proxy works: `curl https://exelion.com.br/hcgi/api/health`
- [ ] No errors in logs: `pm2 logs exelion-api | grep ERROR`

---

## 🔍 Verification Tests

### Test 1: Process Status
```bash
pm2 list
```

### Test 2: Health Check (Local)
```bash
curl http://localhost:3001/hcgi/api/health
```

Expected response (HTTP 200):
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 45,
  "environment": "production",
  "port": 3001
}
```

### Test 3: Health Check (Via Domain)
```bash
curl https://exelion.com.br/hcgi/api/health
```

### Test 4: Status Endpoint
```bash
curl http://localhost:3001/hcgi/api/status
```

### Test 5: Test Endpoint
```bash
curl http://localhost:3001/hcgi/api/test
```

### Test 6: PocketBase Connection
```bash
pm2 logs exelion-api | grep -i pocketbase
```

### Test 7: Mercado Pago Configuration
```bash
pm2 env exelion-api | grep MERCADO_PAGO
```

---

## 🛠️ Troubleshooting

### Problem: GET /hcgi/api/health returns 404

**Step 1: Check if process is running**
```bash
pm2 list
```

**Step 2: Check if port 3001 is listening**
```bash
netstat -tlnp | grep 3001
lsof -i :3001
```

**Step 3: Test local endpoint**
```bash
curl http://localhost:3001/hcgi/api/health
```

**Step 4: Check reverse proxy configuration**
```bash
grep -A 5 "hcgi/api" apps/api/.htaccess
```

**Step 5: Check Apache modules**
```bash
sudo apache2ctl -M | grep -E "rewrite|proxy|headers"
```

**Step 6: Check Apache error logs**
```bash
sudo tail -f /var/log/apache2/error.log
```

### Problem: 500 Internal Server Error

**Check API logs:**
```bash
pm2 logs exelion-api --lines 100
```

### Problem: CORS errors

**Check CORS headers:**
```bash
curl -H "Origin: https://exelion.com.br" http://localhost:3001/hcgi/api/health -v
```

### Problem: Process keeps restarting

**Check logs for errors:**
```bash
pm2 logs exelion-api --err
```

---

## 📄 Environment Variables

Required variables in `.env.production`:

```bash
NODE_ENV=production
PORT=3001
POCKETBASE_URL=http://localhost:8090
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-2368236140107101-050102-2c105485ac6271502649a7abdfa6153d-69409323
MERCADO_PAGO_PUBLIC_KEY=APP_USR-404f25e5-3eca-4398-8b36-13cf7371074b
WEBHOOK_URL=https://exelion.com.br
FRONTEND_URL=https://exelion.com.br
CORS_ORIGIN=https://exelion.com.br
```

---

## 🔧 Maintenance Commands

### View Logs
```bash
pm2 logs exelion-api
pm2 logs exelion-api --lines 100
pm2 logs exelion-api --err
```

### Monitor Process
```bash
pm2 monit
pm2 show exelion-api
```

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

### Save PM2 Configuration
```bash
pm2 save
pm2 startup
```

---

## ✅ Success Criteria

Deployment is successful when:

1. **Process Status** - `pm2 list` shows `exelion-api` with status `online`
2. **Health Check (Local)** - `curl http://localhost:3001/hcgi/api/health` returns HTTP 200
3. **Health Check (Domain)** - `curl https://exelion.com.br/hcgi/api/health` returns HTTP 200
4. **Test Endpoint** - `curl https://exelion.com.br/hcgi/api/test` returns HTTP 200
5. **Status Endpoint** - `curl https://exelion.com.br/hcgi/api/status` returns HTTP 200
6. **No Errors in Logs** - `pm2 logs exelion-api | grep ERROR` returns no results
7. **PocketBase Connected** - Logs show successful connection
8. **Mercado Pago Configured** - Environment variables are set

---

## 🚨 Important Notes

### Port Configuration
- **API Port:** 3001 (NOT 3000, NOT 5000)
- **PocketBase Port:** 8090
- **Frontend Port:** 5173 (development only)

### Environment
- **Production:** `NODE_ENV=production`
- **Development:** `NODE_ENV=development`

### Reverse Proxy
- **Path:** `/hcgi/api/*`
- **Target:** `http://localhost:3001/hcgi/api/*`
- **Configuration:** `.htaccess` in `apps/api/`

### Process Manager
- **Tool:** PM2
- **Config:** `ecosystem.config.js`
- **Process Name:** `exelion-api`

---

**Last Updated:** 2024
**Version:** 1.0
**Status:** Production Ready