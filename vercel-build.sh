#!/bin/bash
set -euo pipefail

# Ensure NEXT_PUBLIC_WHOP_APP_ID is set for build (required by Whop SDK)
export NEXT_PUBLIC_WHOP_APP_ID="${NEXT_PUBLIC_WHOP_APP_ID:-app_test_build}"

echo "=== PRISMA GENERATE ==="
npx prisma generate

echo "=== VERIFY SOURCE BINARIES ==="
if [ ! -d "node_modules/.prisma/client" ]; then
  echo "ERROR: node_modules/.prisma/client does not exist!"
  exit 1
fi
ls -la node_modules/.prisma/client

echo "=== BUILD NEXT ==="
next build

echo "=== COPYING prisma client into each function bundle ==="
for f in .vercel/output/functions/*; do
  # Handle standard Next.js function structure (flat in .func)
  # or nested structure if present (e.g. other frameworks or configs)

  TARGET_DIR="$f"

  # If 'node' subdirectory exists, use it (legacy/specific structure)
  if [ -d "$f/node" ]; then
    TARGET_DIR="$f/node"
  fi

  if [ -d "$TARGET_DIR" ]; then
    echo ">>> processing $f -> $TARGET_DIR"

    # Create parent directories
    mkdir -p "$TARGET_DIR/node_modules/.prisma"
    mkdir -p "$TARGET_DIR/node_modules/@prisma"

    # Copy .prisma/client (contains the binary)
    # We remove the destination first to ensure a clean copy if it exists
    rm -rf "$TARGET_DIR/node_modules/.prisma/client"
    cp -R node_modules/.prisma/client "$TARGET_DIR/node_modules/.prisma/"

    # Copy @prisma/client (contains the JS client)
    rm -rf "$TARGET_DIR/node_modules/@prisma/client"
    cp -R node_modules/@prisma/client "$TARGET_DIR/node_modules/@prisma/"

    echo ">>> Verifying copy for $TARGET_DIR"
    ls -la "$TARGET_DIR/node_modules/.prisma/client"
  fi
done

echo "=== DONE ==="
