#!/bin/bash
set -e

# generate prisma client and list files (diagnostic)
npx prisma generate
echo "=== LIST node_modules/.prisma/client ==="
ls -la node_modules/.prisma/client || true
echo "=== LIST node_modules/@prisma/client ==="
ls -la node_modules/@prisma/client || true

# build next
next build

# copy prisma client and @prisma client into every serverless function folder so Vercel includes the native engine
echo "=== COPYING prisma client into functions ==="
for f in .vercel/output/functions/*; do
  if [ -d "$f/node" ]; then
    mkdir -p "$f/node/node_modules/.prisma"
    mkdir -p "$f/node/node_modules/@prisma"
    cp -r node_modules/.prisma/client "$f/node/node_modules/.prisma/client" || true
    cp -r node_modules/@prisma/client "$f/node/node_modules/@prisma/client" || true
    echo "copied to $f"
  fi
done

echo "=== DONE ==="