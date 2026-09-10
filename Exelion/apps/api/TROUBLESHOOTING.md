# Exelion API Troubleshooting Guide

## Quick Diagnosis

### Step 1: Check if Node.js Process is Running

```bash
pm2 status
```

**Expected output:**
```
id  name         version  mode  status   restart
0   exelion-api  0.0.0    fork  online   0
```

If status is **stopped** or **errored**:
```bash
pm2 start ecosystem.config.js --env production
pm2 save
```

### Step 2: Check if Port 3001 is Listening

```bash
netstat -tuln | grep 3001
# OR
lsof -i :3001
```

**Expected output:**
```
tcp        0      0 :::3001                 :::*                    LISTEN
```

If port is NOT listening:
```bash
pm2 logs exelion-api --lines 50
pm2 restart exelion-api
```

### Step 3: Test Health Endpoint Locally

```bash
curl http://localhost:3001/hcgi/api/health
```

**Expected response (HTTP 200):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "uptime": 125,
  "environment": "production",
  "port": 3001
}
```

**If 404 or connection refused:**
- Process not running: `pm2 start ecosystem.config.js --env production`
- Port in use: `lsof -i :3001` and kill the process
- Check logs: `pm2 logs exelion-api`

### Step 4: Test Through Reverse Proxy

```bash
curl https://exelion.com.br/hcgi/api/health
```

**If 404:**
- Reverse proxy not forwarding correctly
- Check .htaccess configuration
- Verify Apache modules are enabled

**If 500:**
- Backend error
- Check PM2 logs: `pm2 logs exelion-api`

---

## Common Issues & Solutions

### Issue 1: "Cannot GET /hcgi/api/health" (404)

**Cause:** Backend process not running or port not listening

**Solution:**
```bash
pm2 status
pm2 start ecosystem.config.js --env production
netstat -tuln | grep 3001
pm2 logs exelion-api --lines 100
```

### Issue 2: "Connection refused" (ECONNREFUSED)

**Cause:** Port 3001 not listening or process crashed

**Solution:**
```bash
lsof -i :3001
kill -9 <PID>
pm2 restart exelion-api
pm2 status
```

### Issue 3: "Internal Server Error" (500)

**Cause:** Application error, missing environment variables, or service unavailable

**Solution:**
```bash
pm2 logs exelion-api --lines 100
cat .env.production
curl http://localhost:8090/api/health
pm2 restart exelion-api
```

### Issue 4: "502 Bad Gateway" (Reverse Proxy Error)

**Cause:** Reverse proxy can't reach backend or misconfigured

**Solution:**
```bash
pm2 status
netstat -tuln | grep 3001
cat ../.htaccess | grep -A 5 "hcgi/api"
apache2ctl -M | grep -E "rewrite|proxy"
sudo systemctl restart apache2
tail -f /var/log/apache2/error.log
```

### Issue 5: "CORS error" in Browser Console

**Cause:** CORS headers not set correctly or origin mismatch

**Solution:**
```bash
grep CORS_ORIGIN .env.production
pm2 restart exelion-api
curl -H "Origin: https://exelion.com.br" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://exelion.com.br/hcgi/api/enrollments/create -v
```

### Issue 6: "Port 3001 already in use"

**Cause:** Another process is using port 3001

**Solution:**
```bash
lsof -i :3001
kill -9 <PID>
pm2 delete exelion-api
pm2 start ecosystem.config.js --env production
```

### Issue 7: "Dependencies not installed"

**Cause:** node_modules directory missing or incomplete

**Solution:**
```bash
npm ci --production
pm2 restart exelion-api
```

### Issue 8: "PocketBase connection failed"

**Cause:** PocketBase not running or URL incorrect

**Solution:**
```bash
curl http://localhost:8090/api/health
grep POCKETBASE_URL .env.production
pm2 restart exelion-api
```

### Issue 9: "Mercado Pago API error"

**Cause:** Invalid API credentials or API rate limit

**Solution:**
```bash
grep MERCADO_PAGO .env.production
pm2 restart exelion-api
pm2 logs exelion-api --lines 100
```

### Issue 10: "Process keeps crashing"

**Cause:** Memory leak, infinite loop, or unhandled error

**Solution:**
```bash
pm2 logs exelion-api --lines 200
pm2 monit
pm2 info exelion-api | grep memory
pm2 restart exelion-api
```

---

## Diagnostic Commands

### View PM2 Logs

```bash
pm2 logs exelion-api --lines 50
pm2 logs exelion-api --lines 100
pm2 logs exelion-api --follow
cat logs/error.log
cat logs/out.log
```

### Check Process Status

```bash
pm2 status
pm2 info exelion-api
pm2 monit
pm2 list
```

### Check Port & Network

```bash
netstat -tuln | grep 3001
lsof -i :3001
netstat -tuln
telnet localhost 3001
```

### Check Environment

```bash
cat .env.production
grep POCKETBASE_URL .env.production
node --version
npm --version
pm2 --version
```

### Check Apache/Reverse Proxy

```bash
sudo systemctl status apache2
tail -f /var/log/apache2/error.log
tail -f /var/log/apache2/access.log
sudo apache2ctl configtest
apache2ctl -M | grep -E "rewrite|proxy"
cat ../.htaccess
```

### Test API Endpoints

```bash
curl http://localhost:3001/hcgi/api/health
curl https://exelion.com.br/hcgi/api/health
curl https://exelion.com.br/hcgi/api/status
curl https://exelion.com.br/hcgi/api/test
curl -v https://exelion.com.br/hcgi/api/health
curl -i https://exelion.com.br/hcgi/api/health
```

---

## Recovery Procedures

### Full Restart

```bash
pm2 stop exelion-api
pm2 delete exelion-api
rm -rf node_modules package-lock.json
npm ci --production
pm2 start ecosystem.config.js --env production
pm2 save
pm2 status
curl http://localhost:3001/hcgi/api/health
```

### Clear PM2 Cache

```bash
pm2 stop all
pm2 delete all
pm2 kill
pm2 start ecosystem.config.js --env production
pm2 save
```

### Reset to Clean State

```bash
pm2 stop all
pm2 delete all
pm2 kill
rm -rf node_modules package-lock.json
npm ci --production
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
pm2 status
curl http://localhost:3001/hcgi/api/health
```

---

## Performance Monitoring

### Monitor CPU & Memory

```bash
pm2 monit
pm2 info exelion-api | grep memory
pm2 info exelion-api | grep cpu
```

### View Request Logs

```bash
pm2 logs exelion-api --follow
pm2 logs exelion-api --lines 100
cat logs/error.log | tail -50
```

### Check Uptime

```bash
pm2 info exelion-api | grep uptime
pm2 info exelion-api | grep restart
```

---

## When All Else Fails

1. **Check PM2 logs:** `pm2 logs exelion-api --lines 200`
2. **Check Apache logs:** `tail -f /var/log/apache2/error.log`
3. **Verify environment:** `cat .env.production`
4. **Test locally:** `curl http://localhost:3001/hcgi/api/health`
5. **Full restart:** Follow "Full Restart" procedure above
6. **Contact support:** Provide PM2 logs and Apache error logs

---

**Last Updated:** 2024-01-15
**Version:** 1.0.0