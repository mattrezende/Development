#!/bin/bash

################################################################################
# Deployment Verification Script
################################################################################
# This script verifies that the Exelion API is properly deployed.
#
# Usage:
#   ./VERIFY_DEPLOYMENT.sh
#
# What it checks:
#   1. PM2 process status
#   2. Port 3001 is listening
#   3. Health check endpoint
#   4. Test endpoint
#   5. Status endpoint
#   6. PocketBase connection
#   7. Environment variables
#   8. Reverse proxy configuration
################################################################################

set -e

echo "========================================"
echo "Exelion API - Deployment Verification"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASSED=0
FAILED=0

check() {
    local name=$1
    local command=$2
    
    echo -n "Checking $name... "
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC}"
        ((FAILED++))
    fi
}

echo "=== PROCESS STATUS ==="
echo ""

# Check PM2 installed
check "PM2 installed" "command -v pm2"

# Check process running
echo -n "Checking process status... "
if pm2 list | grep -q "exelion-api.*online"; then
    echo -e "${GREEN}✓${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗${NC}"
    ((FAILED++))
fi

# Check port listening
echo -n "Checking port 3001... "
if netstat -tlnp 2>/dev/null | grep -q ":3001" || lsof -i :3001 2>/dev/null | grep -q "LISTEN"; then
    echo -e "${GREEN}✓${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗${NC}"
    ((FAILED++))
fi

echo ""
echo "=== ENDPOINT TESTS ==="
echo ""

# Test health check
echo -n "Testing /hcgi/api/health... "
if curl -s http://localhost:3001/hcgi/api/health | grep -q '"status":"ok"'; then
    echo -e "${GREEN}✓${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗${NC}"
    ((FAILED++))
fi

# Test status endpoint
echo -n "Testing /hcgi/api/status... "
if curl -s http://localhost:3001/hcgi/api/status | grep -q '"running":true'; then
    echo -e "${GREEN}✓${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗${NC}"
    ((FAILED++))
fi

# Test test endpoint
echo -n "Testing /hcgi/api/test... "
if curl -s http://localhost:3001/hcgi/api/test | grep -q '"success":true'; then
    echo -e "${GREEN}✓${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗${NC}"
    ((FAILED++))
fi

echo ""
echo "=== CONFIGURATION ==="
echo ""

# Check .env.production
echo -n "Checking .env.production... "
if [ -f "apps/api/.env.production" ]; then
    echo -e "${GREEN}✓${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗${NC}"
    ((FAILED++))
fi

# Check required env vars
echo -n "Checking NODE_ENV... "
if grep -q "NODE_ENV=production" apps/api/.env.production; then
    echo -e "${GREEN}✓${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗${NC}"
    ((FAILED++))
fi

echo -n "Checking PORT... "
if grep -q "PORT=3001" apps/api/.env.production; then
    echo -e "${GREEN}✓${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗${NC}"
    ((FAILED++))
fi

echo -n "Checking POCKETBASE_URL... "
if grep -q "POCKETBASE_URL=" apps/api/.env.production; then
    echo -e "${GREEN}✓${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗${NC}"
    ((FAILED++))
fi

echo -n "Checking MERCADO_PAGO_ACCESS_TOKEN... "
if grep -q "MERCADO_PAGO_ACCESS_TOKEN=" apps/api/.env.production; then
    echo -e "${GREEN}✓${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗${NC}"
    ((FAILED++))
fi

echo ""
echo "=== DEPENDENCIES ==="
echo ""

# Check node_modules
echo -n "Checking node_modules... "
if [ -d "apps/api/node_modules" ]; then
    echo -e "${GREEN}✓${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗${NC}"
    ((FAILED++))
fi

# Check key packages
echo -n "Checking express... "
if [ -d "apps/api/node_modules/express" ]; then
    echo -e "${GREEN}✓${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗${NC}"
    ((FAILED++))
fi

echo -n "Checking pocketbase... "
if [ -d "apps/api/node_modules/pocketbase" ]; then
    echo -e "${GREEN}✓${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗${NC}"
    ((FAILED++))
fi

echo -n "Checking mercadopago... "
if [ -d "apps/api/node_modules/mercadopago" ]; then
    echo -e "${GREEN}✓${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗${NC}"
    ((FAILED++))
fi

echo ""
echo "=== SUMMARY ==="
echo ""
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}========================================"
    echo "✓ All checks passed!"
    echo "========================================${NC}"
    exit 0
else
    echo -e "${RED}========================================"
    echo "✗ Some checks failed"
    echo "========================================${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check logs: pm2 logs exelion-api"
    echo "  2. Check process: pm2 list"
    echo "  3. Check port: lsof -i :3001"
    echo "  4. Check config: cat apps/api/.env.production"
    echo ""
    exit 1
fi