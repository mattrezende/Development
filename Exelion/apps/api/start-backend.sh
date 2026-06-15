#!/bin/bash

################################################################################
# Exelion API - Start Backend Script
################################################################################
# This script starts the Node.js Express API server on port 3001.
#
# What it does:
#   1. Navigates to apps/api directory
#   2. Kills any existing Node.js processes on port 3001
#   3. Installs production dependencies
#   4. Starts the server with 'npm start'
#   5. Waits 3 seconds for startup
#   6. Tests health check endpoint
#   7. Confirms HTTP 200 response
#   8. Keeps process running
#
# Usage:
#   ./start-backend.sh
#
# Exit codes:
#   0 = Success
#   1 = Failed to start or health check failed
################################################################################

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo "${BLUE}========================================${NC}"
echo "${BLUE}Exelion API - Start Backend${NC}"
echo "${BLUE}========================================${NC}"
echo ""
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo "Script directory: $SCRIPT_DIR"
echo ""

# ============================================
# STEP 1: Kill existing processes
# ============================================
echo "${YELLOW}[1/5]${NC} Killing existing Node.js processes on port 3001..."

# Try pkill first (suppress errors)
if pkill -f "node src/main.js" 2>/dev/null; then
    echo "${GREEN}✓${NC} Killed process using pkill"
else
    echo "${YELLOW}⚠${NC} No process found with pkill (this is OK)"
fi

# Try lsof as backup (suppress errors)
if command -v lsof &> /dev/null; then
    PIDS=$(lsof -ti:3001 2>/dev/null || true)
    if [ -n "$PIDS" ]; then
        echo "$PIDS" | xargs kill -9 2>/dev/null || true
        echo "${GREEN}✓${NC} Killed process using lsof"
    else
        echo "${YELLOW}⚠${NC} No process found on port 3001 (this is OK)"
    fi
else
    echo "${YELLOW}⚠${NC} lsof not available (this is OK)"
fi

# Wait a moment for processes to fully terminate
sleep 1

echo ""

# ============================================
# STEP 2: Install dependencies
# ============================================
echo "${YELLOW}[2/5]${NC} Installing production dependencies..."

cd "$SCRIPT_DIR"

if npm ci --production 2>&1 | tail -5; then
    echo "${GREEN}✓${NC} Dependencies installed successfully"
else
    echo "${RED}✗${NC} Failed to install dependencies"
    exit 1
fi

echo ""

# ============================================
# STEP 3: Start the server
# ============================================
echo "${YELLOW}[3/5]${NC} Starting Node.js server..."

if npm start &
    SERVER_PID=$!
    echo "${GREEN}✓${NC} Server started with PID: $SERVER_PID"
else
    echo "${RED}✗${NC} Failed to start server"
    exit 1
fi

echo ""

# ============================================
# STEP 4: Wait for startup
# ============================================
echo "${YELLOW}[4/5]${NC} Waiting 3 seconds for server startup..."
sleep 3
echo "${GREEN}✓${NC} Startup wait complete"
echo ""

# ============================================
# STEP 5: Test health check endpoint
# ============================================
echo "${YELLOW}[5/5]${NC} Testing health check endpoint..."
echo ""

if command -v curl &> /dev/null; then
    echo "Sending request to: http://localhost:3001/hcgi/api/health"
    echo ""
    
    # Capture response with HTTP status code
    RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3001/hcgi/api/health 2>&1 || echo "Connection failed\n000")
    
    # Extract HTTP status code (last line)
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    # Extract response body (all but last line)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    echo "Response body:"
    echo "$BODY"
    echo ""
    echo "HTTP Status Code: $HTTP_CODE"
    echo ""
    
    # Check if HTTP 200
    if [ "$HTTP_CODE" = "200" ]; then
        echo "${GREEN}✓${NC} Health check successful (HTTP 200)"
        
        # Try to parse JSON status field
        if echo "$BODY" | grep -q '"status"\s*:\s*"ok"'; then
            echo "${GREEN}✓${NC} Status field confirmed: 'ok'"
        else
            echo "${YELLOW}⚠${NC} Could not verify status field in response"
        fi
    else
        echo "${RED}✗${NC} Health check failed (HTTP $HTTP_CODE)"
        echo ""
        echo "Troubleshooting:"
        echo "  - Check if server is still running: ps aux | grep 'node src/main.js'"
        echo "  - Check logs: npm start (run directly to see output)"
        echo "  - Check port: netstat -tuln | grep 3001"
        exit 1
    fi
else
    echo "${YELLOW}⚠${NC} curl not available, skipping health check"
    echo "   Install curl to enable health check testing"
fi

echo ""
echo "${BLUE}========================================${NC}"
echo "${GREEN}✓ Backend started successfully!${NC}"
echo "${BLUE}========================================${NC}"
echo ""
echo "API Server Status:"
echo "  - Local endpoint: http://localhost:3001/hcgi/api/health"
echo "  - Remote endpoint: https://exelion.com.br/hcgi/api/health"
echo "  - Process ID: $SERVER_PID"
echo "  - Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "Next steps:"
echo "  1. Verify remote endpoint: ./validate-backend.sh"
echo "  2. Check logs: npm start (or pm2 logs exelion-api)"
echo "  3. Test frontend: https://exelion.com.br"
echo ""

# Keep the process running
wait $SERVER_PID