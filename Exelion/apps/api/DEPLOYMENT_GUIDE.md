# Exelion API Deployment Guide

## Overview

This guide provides step-by-step instructions to deploy the Node.js Express API to production on Hostinger.

**Critical Requirements:**
- Node.js 18+ installed on server
- PM2 installed globally: `npm install -g pm2`
- Apache with mod_rewrite, mod_proxy, mod_proxy_http enabled
- Port 3001 available (NOT 3000, NOT 5000)

---

## Quick Start (5 minutes)

### 1. SSH into Production Server

```bash
ssh user@exelion.com.br
cd /path/to/apps/api
```

### 2. Install Dependencies

```bash
npm ci --production
```

### 3. Verify Environment Configuration

```bash
cat .env.production
```

### 4. Deploy with PM2

```bash
chmod +x deploy.sh
./deploy.sh
```

### 5. Verify Deployment

```bash
chmod +x verify-deployment.sh
./verify-deployment.sh
```

### 6. Test Health Check

```bash
curl https://exelion.com.br/hcgi/api/health
```

---

## Detailed Deployment Steps

### Step 1: Prepare Server

```bash
# Check Node.js
node --version  # Should be v18.0.0 or higher
npm --version   # Should be v9.0.0 or higher

# Install PM2 globally
sudo npm install -g pm2
pm2 --version

# Verify Apache modules
apache2ctl -M | grep -E "rewrite|proxy"
```

### Step 2: Deploy Backend Code

```bash
cd /path/to/apps/api
npm ci --production
ls -la src/main.js
```

### Step 3: Configure Environment

```bash
cat .env.production
# Verify all required variables are present
```

### Step 4: Start Node.js Process

```bash
pm2 start ecosystem.config.js --env production
pm2 status
pm2 info exelion-api
```

### Step 5: Configure Auto-Startup

```bash
pm2 startup
pm2 save
```

### Step 6: Test Connectivity

```bash
# Local test
curl http://localhost:3001/hcgi/api/health

# Remote test
curl https://exelion.com.br/hcgi/api/health
```

---

## Troubleshooting

### Backend returns 404

```bash
pm2 status
netstat -tuln | grep 3001
pm2 logs exelion-api --lines 50
pm2 start ecosystem.config.js --env production
```

### Backend returns 500

```bash
pm2 logs exelion-api --lines 100
cat .env.production
curl http://localhost:8090/api/health
pm2 restart exelion-api
```

### Reverse proxy not forwarding

```bash
tail -f /var/log/apache2/error.log
apache2ctl -M | grep -E "rewrite|proxy"
sudo systemctl restart apache2
```

---

## Monitoring

```bash
pm2 logs exelion-api --follow
pm2 monit
pm2 status
```

---

## Maintenance

```bash
pm2 restart exelion-api
pm2 stop exelion-api
pm2 start ecosystem.config.js --env production
pm2 delete exelion-api
```