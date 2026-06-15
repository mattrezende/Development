# Exelion API - Quick Reference

## Essential Commands

### Check Status
```bash
pm2 status                    # View process status
pm2 info exelion-api          # View detailed info
pm2 logs exelion-api          # View logs
pm2 monit                      # Monitor CPU/memory
```

### Start/Stop/Restart
```bash
pm2 start ecosystem.config.js --env production   # Start
pm2 stop exelion-api                             # Stop
pm2 restart exelion-api                          # Restart
pm2 reload exelion-api                           # Zero-downtime restart
pm2 delete exelion-api                           # Remove from PM2
```

### Test Connectivity
```bash
curl http://localhost:3001/hcgi/api/health       # Local test
curl https://exelion.com.br/hcgi/api/health      # Remote test
```

### View Logs
```bash
pm2 logs exelion-api --lines 50                 # Last 50 lines
pm2 logs exelion-api --follow                    # Real-time
cat logs/error.log                                # Error log
cat logs/out.log                                  # Output log
```

### Check Port
```bash
netstat -tuln | grep 3001                        # Check if listening
lsof -i :3001                                     # Check process using port
```

### Environment
```bash
cat .env.production                               # View environment
grep POCKETBASE_URL .env.production               # Check specific variable
```

### Deploy
```bash
chmod +x deploy.sh                                # Make executable
./deploy.sh                                       # Run deployment
```

### Verify
```bash
chmod +x verify-deployment.sh                     # Make executable
./verify-deployment.sh                            # Run verification
```

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| 404 Not Found | Backend not running | `pm2 start ecosystem.config.js --env production` |
| 500 Internal Error | Application error | `pm2 logs exelion-api` |
| 502 Bad Gateway | Reverse proxy issue | Check `.htaccess`, restart Apache |
| ECONNREFUSED | Port not listening | `pm2 restart exelion-api` |
| CORS error | Wrong origin | Check `CORS_ORIGIN` in `.env.production` |
| PocketBase error | Service unavailable | `curl http://localhost:8090/api/health` |

---

## Critical Files

| File | Purpose |
|------|----------|
| `src/main.js` | Express server entry point |
| `.env.production` | Production environment variables |
| `ecosystem.config.js` | PM2 configuration |
| `deploy.sh` | Deployment script |
| `verify-deployment.sh` | Verification script |
| `../.htaccess` | Apache reverse proxy config |

---

## Environment Variables

| Variable | Value | Required |
|----------|-------|----------|
| `NODE_ENV` | `production` | Yes |
| `PORT` | `3001` | Yes |
| `POCKETBASE_URL` | `http://localhost:8090` | Yes |
| `MERCADO_PAGO_ACCESS_TOKEN` | `APP_USR-...` | Yes |
| `MERCADO_PAGO_PUBLIC_KEY` | `APP_USR-...` | Yes |
| `WEBHOOK_URL` | `https://exelion.com.br` | Yes |
| `FRONTEND_URL` | `https://exelion.com.br` | Yes |
| `CORS_ORIGIN` | `https://exelion.com.br` | Yes |

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|----------|
| GET | `/hcgi/api/health` | Health check |
| GET | `/hcgi/api/status` | Server status |
| GET | `/hcgi/api/test` | Test endpoint |
| POST | `/hcgi/api/test` | Test endpoint |
| POST | `/hcgi/api/enrollments/create` | Create enrollment |
| GET | `/hcgi/api/enrollments/debug` | Debug endpoint |
| POST | `/hcgi/api/mercado-pago/create-preference` | Create payment |
| POST | `/hcgi/api/mercado-pago/webhook` | Payment webhook |
| GET | `/hcgi/api/mercado-pago/payment-status/:id` | Payment status |

---

## Port Mapping

| Service | Port | Status |
|---------|------|--------|
| Node.js API | 3001 | Must be listening |
| PocketBase | 8090 | Must be running |
| Apache | 80/443 | Must be running |

---

## Troubleshooting Flowchart

```
API not responding at /hcgi/api/health?
│
├─ Test locally: curl http://localhost:3001/hcgi/api/health
│  │
│  ├─ Works locally? → Reverse proxy issue
│  │  └─ Check .htaccess, Apache modules, restart Apache
│  │
│  └─ Doesn't work? → Backend issue
│     │
│     ├─ Check PM2 status: pm2 status
│     │  │
│     │  ├─ Process stopped? → pm2 start ecosystem.config.js --env production
│     │  │
│     │  └─ Process running? → Check logs: pm2 logs exelion-api
│     │     │
│     │     ├─ Port error? → lsof -i :3001 and kill process
│     │     │
│     │     ├─ Missing dependencies? → npm ci --production
│     │     │
│     │     ├─ Environment error? → cat .env.production
│     │     │
│     │     └─ PocketBase error? → curl http://localhost:8090/api/health
│
└─ Test remotely: curl https://exelion.com.br/hcgi/api/health
   │
   ├─ 404? → Backend not responding or reverse proxy misconfigured
   │
   ├─ 500? → Backend error (check PM2 logs)
   │
   └─ 502? → Reverse proxy can't reach backend
```

---

**Last Updated:** 2024-01-15
**Version:** 1.0.0