#!/bin/bash

################################################################################
# Exelion API Startup Script
################################################################################
# This script starts the Node.js API server with proper environment setup.
#
# Usage:
#   ./start.sh
#
# The script will:
#   1. Load environment variables from .env.production
#   2. Start the Node.js application
#   3. Handle errors gracefully
################################################################################

set -e  # Exit on error

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$PROJECT_ROOT")"

echo "========================================"
echo "Exelion API Startup Script"
echo "========================================"
echo ""
echo "Script directory: $SCRIPT_DIR"
echo "Project root: $PROJECT_ROOT"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    exit 1
fi

echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"
echo ""

# Load environment variables from .env.production
if [ -f "$SCRIPT_DIR/.env.production" ]; then
    echo "Loading environment variables from .env.production..."
    set -a
    source "$SCRIPT_DIR/.env.production"
    set +a
    echo "Environment variables loaded successfully"
else
    echo "WARNING: .env.production not found at $SCRIPT_DIR/.env.production"
    echo "Using system environment variables or defaults"
fi

echo ""
echo "Environment Configuration:"
echo "  NODE_ENV: ${NODE_ENV:-development}"
echo "  PORT: ${PORT:-3001}"
echo "  POCKETBASE_URL: ${POCKETBASE_URL:-http://localhost:8090}"
echo "  CORS_ORIGIN: ${CORS_ORIGIN:-*}"
echo "  WEBHOOK_URL: ${WEBHOOK_URL:-http://localhost:3001}"
echo "  FRONTEND_URL: ${FRONTEND_URL:-http://localhost:5173}"
echo "  MERCADO_PAGO_ACCESS_TOKEN: $([ -n "$MERCADO_PAGO_ACCESS_TOKEN" ] && echo 'SET' || echo 'NOT SET')"
echo "  MERCADO_PAGO_PUBLIC_KEY: $([ -n "$MERCADO_PAGO_PUBLIC_KEY" ] && echo 'SET' || echo 'NOT SET')"
echo ""

# Check if main.js exists
if [ ! -f "$SCRIPT_DIR/src/main.js" ]; then
    echo "ERROR: src/main.js not found at $SCRIPT_DIR/src/main.js"
    exit 1
fi

echo "Starting Node.js application..."
echo "========================================"
echo ""

# Start the application
cd "$SCRIPT_DIR"
node src/main.js