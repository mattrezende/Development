#!/bin/bash

################################################################################
# Exelion API - Restart Backend Script
################################################################################
# This script performs a complete backend restart and validation.
#
# What it does:
#   1. Kills existing Node.js processes (with error suppression)
#   2. Waits 2 seconds for clean shutdown
#   3. Calls start-backend.sh to start the server
#   4. Calls validate-backend.sh to verify it's working
#   5. Reports final status
#
# Usage:
#   ./restart-backend.sh
#
# Exit codes:
#   0 = Restart and validation successful
#   1 = Restart or validation failed
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
echo "${BLUE}Exelion API - Restart Backend${NC}"
echo "${BLUE}========================================${NC}"
echo ""
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo "Script directory: $SCRIPT_DIR"
echo ""

# ============================================
# STEP 1: Kill existing processes
# ============================================
echo "${YELLOW}[1/4]${NC} Killing existing Node.js processes..."
echo ""

# Try pkill (suppress errors)
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

echo ""

# ============================================
# STEP 2: Wait for clean shutdown
# ============================================
echo "${YELLOW}[2/4]${NC} Waiting 2 seconds for clean shutdown..."
sleep 2
echo "${GREEN}✓${NC} Shutdown wait complete"
echo ""

# ============================================
# STEP 3: Start backend
# ============================================
echo "${YELLOW}[3/4]${NC} Starting backend server..."
echo ""

cd "$SCRIPT_DIR"

if [ ! -f "./start-backend.sh" ]; then
    echo "${RED}✗${NC} start-backend.sh not found in $SCRIPT_DIR"
    exit 1
fi

if bash ./start-backend.sh; then
    echo "${GREEN}✓${NC} Backend started successfully"
else
    echo "${RED}✗${NC} Failed to start backend"
    exit 1
fi

echo ""

# ============================================
# STEP 4: Validate backend
# ============================================
echo "${YELLOW}[4/4]${NC} Validating backend..."
echo ""

if [ ! -f "./validate-backend.sh" ]; then
    echo "${RED}✗${NC} validate-backend.sh not found in $SCRIPT_DIR"
    exit 1
fi

if bash ./validate-backend.sh; then
    echo "${GREEN}✓${NC} Backend validation successful"
else
    echo "${RED}✗${NC} Backend validation failed"
    exit 1
fi

echo ""

# ============================================
# FINAL STATUS
# ============================================
echo "${BLUE}========================================${NC}"
echo "${GREEN}✓ Backend restart complete!${NC}"
echo "${BLUE}========================================${NC}"
echo ""
echo "Final Status:"
echo "  - Processes killed: ${GREEN}✓${NC}"
echo "  - Server started: ${GREEN}✓${NC}"
echo "  - Health check: ${GREEN}✓${NC}"
echo "  - Validation: ${GREEN}✓${NC}"
echo ""
echo "API Endpoints:"
echo "  - Local: http://localhost:3001/hcgi/api/health"
echo "  - Remote: https://exelion.com.br/hcgi/api/health"
echo ""
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "Next steps:"
echo "  1. Test frontend: https://exelion.com.br"
echo "  2. Check logs: npm start (or pm2 logs exelion-api)"
echo "  3. Monitor status: ./validate-backend.sh"
echo ""

exit 0