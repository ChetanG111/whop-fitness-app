#!/bin/bash
set -euo pipefail

echo "=== PRISMA GENERATE ==="
npx prisma generate

echo "=== LIST node_modules/.prisma/client ==="
ls -la node_modules/.prisma/client || true
echo "=== LIST node_modules/@prisma/client ==="
ls -la node_modules/@prisma/client || true

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
    mkdir -p "$TARGET_DIR/node_modules/.prisma"
    mkdir -p "$TARGET_DIR/node_modules/@prisma"

    # Copy .prisma/client (contains the binary)
    cp -a node_modules/.prisma/client "$TARGET_DIR/node_modules/.prisma/client" || true

    # Copy @prisma/client (contains the JS client)
    cp -a node_modules/@prisma/client "$TARGET_DIR/node_modules/@prisma/client" || true

    echo ">>> ls for $TARGET_DIR/node_modules/.prisma/client"
    ls -la "$TARGET_DIR/node_modules/.prisma/client" || true
  fi
done

echo "=== DONE ==="
