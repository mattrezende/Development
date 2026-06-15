#!/bin/bash

################################################################################
# Exelion API Deployment Script
################################################################################
# This script deploys the Node.js API to production.
#
# Prerequisites:
#   - Node.js 18+ installed
#   - PM2 installed globally: npm install -g pm2
#   - SSH access to production server
#
# Usage:
#   ./deploy.sh
################################################################################

set -e  # Exit on error

echo "======================================="
echo "Exelion API Deployment Script"
echo "======================================="
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Script directory: $SCRIPT_DIR"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    exit 1
fi

echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"
echo ""

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "WARNING: PM2 is not installed globally"
    echo "Installing PM2 globally..."
    npm install -g pm2
fi

echo "PM2 version: $(pm2 --version)"
echo ""

# Navigate to API directory
cd "$SCRIPT_DIR"

echo "Step 1: Installing dependencies..."
npm ci --production || npm install --production
echo "✓ Dependencies installed"
echo ""

echo "Step 2: Stopping existing PM2 process (if running)..."
pm2 stop exelion-api || true
echo "✓ Process stopped"
echo ""

echo "Step 3: Starting application with PM2..."
pm2 start ecosystem.config.js --env production
echo "✓ Application started"
echo ""

echo "Step 4: Saving PM2 configuration..."
pm2 save
echo "✓ PM2 configuration saved"
echo ""

echo "Step 5: Setting up PM2 auto-startup..."
pm2 startup || true
echo "✓ PM2 auto-startup configured"
echo ""

echo "Step 6: Verifying application is running..."
sleep 2
pm2 status
echo ""

echo "======================================="
echo "Deployment Complete!"
echo "======================================="
echo ""
echo "API Server Status:"
pm2 info exelion-api || echo "Process not found"
echo ""
echo "Next steps:"
echo "  1. Verify health check: curl http://localhost:3001/hcgi/api/health"
echo "  2. Check logs: pm2 logs exelion-api"
echo "  3. Test frontend: https://exelion.com.br"
echo ""