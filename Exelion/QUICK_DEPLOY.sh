#!/bin/bash

################################################################################
# Quick Deploy Script for Exelion API
################################################################################
# This script provides a quick way to deploy the API with minimal steps.
#
# Usage:
#   ./QUICK_DEPLOY.sh
#
# What it does:
#   1. Stops current process
#   2. Installs dependencies
#   3. Starts process with PM2
#   4. Verifies deployment
################################################################################

set -e

echo "========================================"
echo "Exelion API - Quick Deploy"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}ERROR: PM2 not installed${NC}"
    echo "Install with: npm install -g pm2"
    exit 1
fi

echo -e "${GREEN}✓ PM2 installed${NC}"
echo ""

# Stop process
echo "Stopping current process..."
pm2 stop exelion-api 2>/dev/null || true
pm2 delete exelion-api 2>/dev/null || true
echo -e "${GREEN}✓ Process stopped${NC}"
echo ""

# Install dependencies
echo "Installing dependencies..."
cd apps/api
npm install --production --silent
cd ../..
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Start process
echo "Starting process..."
pm2 start ecosystem.config.js --env production > /dev/null
sleep 2
echo -e "${GREEN}✓ Process started${NC}"
echo ""

# Verify
echo "Verifying deployment..."
if pm2 list | grep -q "exelion-api.*online"; then
    echo -e "${GREEN}✓ Process is online${NC}"
else
    echo -e "${RED}✗ Process failed to start${NC}"
    pm2 logs exelion-api --lines 20
    exit 1
fi
echo ""

# Test health check
echo "Testing health check..."
if curl -s http://localhost:3001/hcgi/api/health | grep -q '"status":"ok"'; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${YELLOW}⚠ Health check failed (may be normal if reverse proxy not configured)${NC}"
fi
echo ""

echo -e "${GREEN}========================================"
echo "Deployment Complete!"
echo "========================================${NC}"
echo ""
echo "API Server:"
echo "  - Port: 3001"
echo "  - Health: GET /hcgi/api/health"
echo "  - Status: GET /hcgi/api/status"
echo "  - Test: GET /hcgi/api/test"
echo ""
echo "Commands:"
echo "  - View logs: pm2 logs exelion-api"
echo "  - Monitor: pm2 monit"
echo "  - Restart: pm2 restart exelion-api"
echo ""