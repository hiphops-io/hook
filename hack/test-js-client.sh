#!/bin/bash

# Exit on any error, and print commands before executing
set -ex

# Get the project root directory (adjust if needed)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "Project root: $PROJECT_ROOT"

# Path for the build output
BUILD_DIR="$PROJECT_ROOT/dist"
mkdir -p "$BUILD_DIR"

# Determine the OS and architecture for binary naming
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
if [[ "$OS" == "darwin" ]]; then
  OS="darwin"
elif [[ "$OS" == "linux" ]]; then
  OS="linux"
else
  echo "Unsupported OS: $OS"
  exit 1
fi

# Determine architecture
ARCH=$(uname -m)
if [[ "$ARCH" == "x86_64" ]]; then
  ARCH="amd64"
elif [[ "$ARCH" == "arm64" ]]; then
  ARCH="arm64"
else
  echo "Unsupported architecture: $ARCH"
  exit 1
fi

# Define the binary name
BINARY_NAME="hook-$OS-$ARCH"
BINARY_PATH="$BUILD_DIR/$BINARY_NAME"

echo "Building hook binary for $OS-$ARCH..."

# Build the hook binary
go build -o "$BINARY_PATH" ./cmd/hook
echo "Binary built at: $BINARY_PATH"

# Make binary executable
chmod +x "$BINARY_PATH"

# Navigate to the JS client directory
JS_DIR="$PROJECT_ROOT/clients/js"
cd "$JS_DIR"
echo "Changed to JavaScript client directory: $JS_DIR"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing JavaScript dependencies..."
  SKIP_HOOK_DOWNLOAD=true pnpm install
fi

# Build the TypeScript code
echo "Building TypeScript client..."
pnpm build

# Run the test script with the local binary
echo "Running test with local binary..."
HIPHOPS_HOOK_BIN="$BINARY_PATH" node scripts/test.js

# Return the exit code of the test
exit $?
