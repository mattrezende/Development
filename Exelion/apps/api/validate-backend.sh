#!/bin/bash

################################################################################
# Exelion API - Validate Backend Script
################################################################################
# This script validates that the backend API is running and responding correctly.
#
# What it does:
#   1. Tests local endpoint (http://localhost:3001/hcgi/api/health)
#   2. Tests remote endpoint (https://exelion.com.br/hcgi/api/health)
#   3. Checks HTTP status code is 200
#   4. Parses JSON response to confirm status field equals "ok"
#   5. Reports success or failure with clear messaging
#
# Usage:
#   ./validate-backend.sh
#
# Exit codes:
#   0 = All tests passed
#   1 = One or more tests failed
################################################################################

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "${BLUE}========================================${NC}"
echo "${BLUE}Exelion API - Validate Backend${NC}"
echo "${BLUE}========================================${NC}"
echo ""
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Track test results
LOCAL_PASSED=false
REMOTE_PASSED=false
TESTS_PASSED=0
TESTS_FAILED=0

# ============================================
# TEST 1: Local endpoint
# ============================================
echo "${YELLOW}[1/2]${NC} Testing local endpoint..."
echo "URL: http://localhost:3001/hcgi/api/health"
echo ""

if command -v curl &> /dev/null; then
    # Capture response with HTTP status code
    RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3001/hcgi/api/health 2>&1 || echo "Connection failed\n000")
    
    # Extract HTTP status code (last line)
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    # Extract response body (all but last line)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    echo "Response:"
    echo "$BODY"
    echo ""
    echo "HTTP Status: $HTTP_CODE"
    echo ""
    
    # Check HTTP 200
    if [ "$HTTP_CODE" = "200" ]; then
        echo "${GREEN}✓${NC} HTTP 200 OK"
        
        # Check JSON status field
        if echo "$BODY" | grep -q '"status"\s*:\s*"ok"'; then
            echo "${GREEN}✓${NC} Status field: 'ok'"
            LOCAL_PASSED=true
            ((TESTS_PASSED++))
        else
            echo "${RED}✗${NC} Status field not 'ok' or not found"
            ((TESTS_FAILED++))
        fi
    else
        echo "${RED}✗${NC} HTTP $HTTP_CODE (expected 200)"
        ((TESTS_FAILED++))
    fi
else
    echo "${RED}✗${NC} curl not available"
    ((TESTS_FAILED++))
fi

echo ""

# ============================================
# TEST 2: Remote endpoint
# ============================================
echo "${YELLOW}[2/2]${NC} Testing remote endpoint..."
echo "URL: https://exelion.com.br/hcgi/api/health"
echo ""

if command -v curl &> /dev/null; then
    # Capture response with HTTP status code
    RESPONSE=$(curl -s -w "\n%{http_code}" https://exelion.com.br/hcgi/api/health 2>&1 || echo "Connection failed\n000")
    
    # Extract HTTP status code (last line)
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    # Extract response body (all but last line)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    echo "Response:"
    echo "$BODY"
    echo ""
    echo "HTTP Status: $HTTP_CODE"
    echo ""
    
    # Check HTTP 200
    if [ "$HTTP_CODE" = "200" ]; then
        echo "${GREEN}✓${NC} HTTP 200 OK"
        
        # Check JSON status field
        if echo "$BODY" | grep -q '"status"\s*:\s*"ok"'; then
            echo "${GREEN}✓${NC} Status field: 'ok'"
            REMOTE_PASSED=true
            ((TESTS_PASSED++))
        else
            echo "${RED}✗${NC} Status field not 'ok' or not found"
            ((TESTS_FAILED++))
        fi
    else
        echo "${RED}✗${NC} HTTP $HTTP_CODE (expected 200)"
        ((TESTS_FAILED++))
    fi
else
    echo "${RED}✗${NC} curl not available"
    ((TESTS_FAILED++))
fi

echo ""

# ============================================
# SUMMARY
# ============================================
echo "${BLUE}========================================${NC}"
echo "${BLUE}Validation Summary${NC}"
echo "${BLUE}========================================${NC}"
echo ""
echo "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo "${GREEN}✓ All validation tests passed!${NC}"
    echo ""
    echo "Backend Status:"
    echo "  - Local endpoint: ${GREEN}✓ Working${NC}"
    echo "  - Remote endpoint: ${GREEN}✓ Working${NC}"
    echo "  - Health check: ${GREEN}✓ Responding${NC}"
    echo "  - Status field: ${GREEN}✓ OK${NC}"
    echo ""
    echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    exit 0
else
    echo "${RED}✗ Validation failed!${NC}"
    echo ""
    echo "Failed Tests:"
    if [ "$LOCAL_PASSED" = false ]; then
        echo "  - ${RED}✗${NC} Local endpoint (http://localhost:3001/hcgi/api/health)"
    fi
    if [ "$REMOTE_PASSED" = false ]; then
        echo "  - ${RED}✗${NC} Remote endpoint (https://exelion.com.br/hcgi/api/health)"
    fi
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check if server is running: ps aux | grep 'node src/main.js'"
    echo "  2. Check port 3001: netstat -tuln | grep 3001"
    echo "  3. Check logs: npm start (or pm2 logs exelion-api)"
    echo "  4. Restart server: ./restart-backend.sh"
    echo ""
    echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    exit 1
fi