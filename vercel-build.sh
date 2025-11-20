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
  # server functions live at $f/node
  if [ -d "$f/node" ]; then
    echo ">>> processing $f"
    mkdir -p "$f/node/node_modules/.prisma"
    mkdir -p "$f/node/node_modules/@prisma"
    cp -a node_modules/.prisma/client "$f/node/node_modules/.prisma/client" || true
    cp -a node_modules/@prisma/client "$f/node/node_modules/@prisma/client" || true

    echo ">>> ls for $f/node/node_modules/.prisma/client"
    ls -la "$f/node/node_modules/.prisma/client" || true

    echo ">>> ls for $f/node/node_modules/@prisma/client/runtime"
    ls -la "$f/node/node_modules/@prisma/client/runtime" || true
  fi
done

echo "=== DONE ==="
