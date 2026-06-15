# Exelion API - Quick Reference Guide

## 🚀 Quick Start

### First-Time Deployment
```bash
# 1. Make scripts executable
chmod +x deploy.sh apps/api/start.sh

# 2. Run deployment
./deploy.sh

# 3. Verify it's working
curl http://localhost:3001/hcgi/api/health

# 4. Setup auto-restart on reboot
pm2 startup
pm2 save
```

### Daily Operations
```bash
# Check status
pm2 status

# View logs
pm2 logs exelion-api

# Restart app
pm2 restart exelion-api

# Monitor in real-time
pm2 monit
```

---

## 📋 Configuration Files

### apps/api/.env.production
**Purpose**: Production environment variables

**Key Variables**:
- `NODE_ENV=production` - Environment mode
- `PORT=3001` - Server port
- `POCKETBASE_URL=http://localhost:8090` - PocketBase connection
- `MERCADO_PAGO_ACCESS_TOKEN=APP_USR-...` - Payment API token
- `MERCADO_PAGO_PUBLIC_KEY=APP_USR-...` - Payment public key
- `CORS_ORIGIN=https://exelion.com.br` - Allowed origin
- `WEBHOOK_URL=https://exelion.com.br` - Webhook endpoint
- `FRONTEND_URL=https://exelion.com.br` - Frontend URL

**⚠️ Important**: Never commit this file to git. Add to `.gitignore`.

---

### ecosystem.config.js
**Purpose**: PM2 process management configuration

**Key Settings**:
- `instances: 'max'` - Auto-scale to CPU cores
- `exec_mode: 'cluster'` - Load-balanced cluster mode
- `max_memory_restart: '500M'` - Auto-restart if memory exceeds 500MB
- `watch: false` - Disabled for production

**Usage**:
```bash
pm2 start ecosystem.config.js --env production
```

---

### deploy.sh
**Purpose**: Automated deployment script

**What it does**:
1. Pulls latest code from git
2. Installs dependencies
3. Builds frontend
4. Stops old PM2 process
5. Starts new PM2 process
6. Verifies health endpoint

**Usage**:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

### apps/api/.htaccess
**Purpose**: Apache reverse proxy configuration

**What it does**:
- Routes `/hcgi/api/*` to `http://localhost:3001`
- Sets CORS headers
- Enables compression
- Handles WebSocket (optional)

**Requirements**:
- mod_rewrite enabled
- mod_proxy enabled
- mod_proxy_http enabled
- mod_headers enabled

---

### apps/api/start.sh
**Purpose**: Manual application startup

**What it does**:
- Loads environment variables
- Validates Node.js installation
- Starts Node.js application

**Usage**:
```bash
chmod +x apps/api/start.sh
./apps/api/start.sh
```

---

## 🔍 Verification

### Health Check
```bash
# Local
curl http://localhost:3001/hcgi/api/health

# Remote
curl https://exelion.com.br/hcgi/api/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 120,
  "environment": "production",
  "port": 3001
}
```

### Status Endpoint
```bash
curl http://localhost:3001/hcgi/api/status
```

### PM2 Status
```bash
pm2 status
pm2 show exelion-api
```

---

## 📊 Monitoring

### View Logs
```bash
# All logs
pm2 logs exelion-api

# Last 100 lines
pm2 logs exelion-api --lines 100

# Real-time
pm2 logs exelion-api --follow

# Error logs only
pm2 logs exelion-api --err
```

### Monitor in Real-Time
```bash
pm2 monit
# Press Ctrl+C to exit
```

### Check Memory/CPU
```bash
pm2 status exelion-api
```

---

## 🔧 Common Tasks

### Restart Application
```bash
pm2 restart exelion-api
```

### Stop Application
```bash
pm2 stop exelion-api
```

### Start Application
```bash
pm2 start ecosystem.config.js --env production
```

### Delete Application from PM2
```bash
pm2 delete exelion-api
```

### Reload Application (Graceful)
```bash
pm2 reload exelion-api
```

### Save Process List
```bash
pm2 save
```

### Restore Process List
```bash
pm2 resurrect
```

---

## 🚨 Troubleshooting

### Port 3001 Already in Use
```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>

# Or restart PM2
pm2 restart exelion-api
```

### Environment Variables Not Loaded
```bash
# Check if .env.production exists
ls -la apps/api/.env.production

# Verify variables are set
pm2 show exelion-api

# Restart with environment
pm2 restart exelion-api --env production
```

### PocketBase Connection Failed
```bash
# Check if PocketBase is running
curl http://localhost:8090/api/health

# Verify POCKETBASE_URL
cat apps/api/.env.production | grep POCKETBASE_URL

# Restart API
pm2 restart exelion-api
```

### Mercado Pago API Errors
```bash
# Verify credentials
cat apps/api/.env.production | grep MERCADO_PAGO

# Check logs
pm2 logs exelion-api --err

# Restart
pm2 restart exelion-api
```

### CORS Errors
```bash
# Verify CORS_ORIGIN
cat apps/api/.env.production | grep CORS_ORIGIN

# Should be: https://exelion.com.br

# Restart
pm2 restart exelion-api
```

### Application Crashes Frequently
```bash
# Check error logs
pm2 logs exelion-api --err

# Check memory usage
pm2 status exelion-api

# Increase max_memory_restart if needed
# Edit ecosystem.config.js and restart
```

---

## 🔐 Security

### Environment Variables
- ✅ Stored in `.env.production` (not in code)
- ✅ Not committed to git
- ✅ Loaded at runtime via `process.env`
- ✅ Never logged or exposed

### CORS Configuration
- ✅ Restricted to `https://exelion.com.br`
- ✅ Credentials allowed in requests
- ✅ Preflight cached for 1 hour

### Security Headers
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: SAMEORIGIN
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Referrer-Policy: strict-origin-when-cross-origin

---

## 📈 Performance

### Memory Management
- Max memory restart: 500MB
- Monitor with: `pm2 status exelion-api`
- Alert if exceeds 400MB

### CPU Usage
- Cluster mode with auto-scaling
- Monitor with: `pm2 monit`
- Alert if exceeds 80% for 5+ minutes

### Log Rotation
```bash
# Install log rotation
pm2 install pm2-logrotate

# Configure
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 save
```

---

## 🔄 Auto-Restart on Reboot

### Setup
```bash
pm2 startup
pm2 save
```

### Verify
```bash
sudo systemctl status pm2-username
```

### Test
```bash
sudo reboot
# After reboot:
pm2 list
```

---

## 📞 Support Resources

- **PM2**: https://pm2.keymetrics.io/
- **Node.js**: https://nodejs.org/
- **Hostinger**: https://support.hostinger.com/
- **PocketBase**: https://pocketbase.io/
- **Mercado Pago**: https://www.mercadopago.com.br/developers/

---

## 📝 Deployment Checklist

### Before Deployment
- [ ] Node.js 18+ installed
- [ ] PM2 installed globally
- [ ] Git configured
- [ ] `.env.production` created
- [ ] PocketBase running
- [ ] Apache modules enabled

### During Deployment
- [ ] Make scripts executable
- [ ] Run `./deploy.sh`
- [ ] Verify health endpoint
- [ ] Check PM2 status
- [ ] View logs

### After Deployment
- [ ] Test health endpoint
- [ ] Test enrollment endpoint
- [ ] Test payment flow
- [ ] Monitor logs
- [ ] Setup auto-restart
- [ ] Configure log rotation

---

## 🎯 Key Endpoints

### Health Check
```
GET /hcgi/api/health
```

### Status
```
GET /hcgi/api/status
```

### Create Enrollment
```
POST /hcgi/api/enrollments/create
```

### Mercado Pago Webhook
```
POST /hcgi/api/mercado-pago/webhook
```

### Payment Status
```
GET /hcgi/api/mercado-pago/payment-status/:paymentId
```

---

## 🌐 URLs

- **Frontend**: https://exelion.com.br
- **API Base**: https://exelion.com.br/hcgi/api
- **Health**: https://exelion.com.br/hcgi/api/health
- **Status**: https://exelion.com.br/hcgi/api/status

---

## 📚 Documentation

- **Full Guide**: See `DEPLOYMENT.md`
- **Verification**: See `DEPLOYMENT_VERIFICATION.md`
- **This Guide**: `QUICK_REFERENCE.md`

---

**Last Updated**: January 2024
**Version**: 1.0.0