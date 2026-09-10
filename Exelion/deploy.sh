#!/bin/bash

################################################################################
# Exelion API Deployment Script
################################################################################
# This script deploys the Exelion API to production.
#
# Usage:
#   ./deploy.sh
#
# The script will:
#   1. Stop the current PM2 process
#   2. Install dependencies
#   3. Update environment variables
#   4. Start the process with PM2
#   5. Verify deployment
################################################################################

set -e  # Exit on error

echo "======================================="
echo "Exelion API Deployment Script"
echo "======================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}ERROR: PM2 is not installed${NC}"
    echo "Install PM2 globally: npm install -g pm2"
    exit 1
fi

echo -e "${GREEN}✓ PM2 is installed${NC}"
echo "PM2 version: $(pm2 --version)"
echo ""

# Stop current process
echo "Stopping current process..."
if pm2 list | grep -q "exelion-api"; then
    pm2 stop exelion-api || true
    pm2 delete exelion-api || true
    echo -e "${GREEN}✓ Process stopped${NC}"
else
    echo -e "${YELLOW}⚠ No running process found${NC}"
fi
echo ""

# Install dependencies
echo "Installing dependencies..."
cd apps/api
npm install --production
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Verify .env.production exists
echo "Verifying environment configuration..."
if [ ! -f ".env.production" ]; then
    echo -e "${RED}ERROR: .env.production not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ .env.production exists${NC}"

# Check required environment variables
echo "Checking required environment variables..."
required_vars=("NODE_ENV" "PORT" "POCKETBASE_URL" "MERCADO_PAGO_ACCESS_TOKEN" "WEBHOOK_URL" "FRONTEND_URL" "CORS_ORIGIN")
for var in "${required_vars[@]}"; do
    if grep -q "^$var=" .env.production; then
        echo -e "${GREEN}✓ $var is set${NC}"
    else
        echo -e "${RED}✗ $var is missing${NC}"
        exit 1
    fi
done
echo ""

# Go back to project root
cd ../..

# Start process with PM2
echo "Starting process with PM2..."
pm2 start ecosystem.config.js --env production
echo -e "${GREEN}✓ Process started${NC}"
echo ""

# Wait for process to start
sleep 2

# Verify process is running
echo "Verifying process status..."
if pm2 list | grep -q "exelion-api.*online"; then
    echo -e "${GREEN}✓ Process is running${NC}"
else
    echo -e "${RED}✗ Process failed to start${NC}"
    pm2 logs exelion-api --lines 50
    exit 1
fi
echo ""

# Show logs
echo "Recent logs:"
pm2 logs exelion-api --lines 20
echo ""

echo -e "${GREEN}======================================="
echo "Deployment Complete!"
echo "========================================${NC}"
echo ""
echo "API Server:"
echo "  - Running on port 3001"
echo "  - Health check: GET /hcgi/api/health"
echo "  - Status: GET /hcgi/api/status"
echo "  - Test: GET /hcgi/api/test"
echo ""
echo "To view logs: pm2 logs exelion-api"
echo "To stop: pm2 stop exelion-api"
echo "To restart: pm2 restart exelion-api"
echo ""