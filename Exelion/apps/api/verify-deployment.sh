#!/bin/bash

################################################################################
# Exelion API Deployment Verification Script
################################################################################
# This script verifies that the API is properly deployed and running.
#
# Usage:
#   ./verify-deployment.sh
################################################################################

set -e  # Exit on error

echo "======================================="
echo "Exelion API Deployment Verification"
echo "======================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Script directory: $SCRIPT_DIR"
echo ""

# Check 1: Node.js installed
echo "[1/8] Checking Node.js installation..."
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓${NC} Node.js installed: $(node --version)"
else
    echo -e "${RED}✗${NC} Node.js not installed"
    exit 1
fi
echo ""

# Check 2: PM2 installed
echo "[2/8] Checking PM2 installation..."
if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}✓${NC} PM2 installed: $(pm2 --version)"
else
    echo -e "${YELLOW}⚠${NC} PM2 not installed globally (optional but recommended)"
fi
echo ""

# Check 3: Dependencies installed
echo "[3/8] Checking dependencies..."
if [ -d "$SCRIPT_DIR/node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules directory exists"
else
    echo -e "${RED}✗${NC} node_modules directory not found"
    echo "   Run: npm ci --production"
    exit 1
fi
echo ""

# Check 4: Environment files
echo "[4/8] Checking environment files..."
if [ -f "$SCRIPT_DIR/.env.production" ]; then
    echo -e "${GREEN}✓${NC} .env.production exists"
else
    echo -e "${RED}✗${NC} .env.production not found"
    exit 1
fi

if [ -f "$SCRIPT_DIR/.env" ]; then
    echo -e "${GREEN}✓${NC} .env exists"
else
    echo -e "${YELLOW}⚠${NC} .env not found (using .env.production)"
fi
echo ""

# Check 5: Main application file
echo "[5/8] Checking application files..."
if [ -f "$SCRIPT_DIR/src/main.js" ]; then
    echo -e "${GREEN}✓${NC} src/main.js exists"
else
    echo -e "${RED}✗${NC} src/main.js not found"
    exit 1
fi
echo ""

# Check 6: Process running
echo "[6/8] Checking if API process is running..."
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "exelion-api"; then
        echo -e "${GREEN}✓${NC} PM2 process 'exelion-api' is running"
        pm2 info exelion-api | grep -E "(status|pid|memory|cpu)"
    else
        echo -e "${YELLOW}⚠${NC} PM2 process 'exelion-api' not found"
        echo "   Run: pm2 start ecosystem.config.js --env production"
    fi
else
    echo -e "${YELLOW}⚠${NC} PM2 not available, checking port 3001 directly..."
    if netstat -tuln 2>/dev/null | grep -q ":3001 "; then
        echo -e "${GREEN}✓${NC} Port 3001 is listening"
    else
        echo -e "${RED}✗${NC} Port 3001 is not listening"
        echo "   Start the application: node src/main.js"
    fi
fi
echo ""

# Check 7: Health check endpoint
echo "[7/8] Testing health check endpoint (localhost:3001)..."
if command -v curl &> /dev/null; then
    HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3001/hcgi/api/health 2>/dev/null || echo "000")
    HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
    BODY=$(echo "$HEALTH_RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓${NC} Health check returned HTTP 200"
        echo "   Response: $BODY"
    else
        echo -e "${RED}✗${NC} Health check returned HTTP $HTTP_CODE"
        echo "   Response: $BODY"
    fi
else
    echo -e "${YELLOW}⚠${NC} curl not available, skipping health check"
fi
echo ""

# Check 8: Reverse proxy configuration
echo "[8/8] Checking reverse proxy configuration..."
if [ -f "$SCRIPT_DIR/../.htaccess" ]; then
    echo -e "${GREEN}✓${NC} .htaccess file exists"
    if grep -q "hcgi/api" "$SCRIPT_DIR/../.htaccess"; then
        echo -e "${GREEN}✓${NC} .htaccess contains /hcgi/api routing"
    else
        echo -e "${RED}✗${NC} .htaccess does not contain /hcgi/api routing"
    fi
else
    echo -e "${YELLOW}⚠${NC} .htaccess not found in parent directory"
fi
echo ""

echo "======================================="
echo "Verification Complete!"
echo "======================================="
echo ""
echo "Summary:"
echo "  - If all checks passed (✓), the API is properly deployed"
echo "  - If any checks failed (✗), follow the suggested remediation steps"
echo "  - If warnings (⚠) appear, they are optional but recommended"
echo ""
echo "Troubleshooting:"
echo "  - View logs: pm2 logs exelion-api"
echo "  - Restart process: pm2 restart exelion-api"
echo "  - Stop process: pm2 stop exelion-api"
echo "  - Start process: pm2 start ecosystem.config.js --env production"
echo ""