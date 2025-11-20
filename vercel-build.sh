#!/bin/bash
npx prisma generate
echo "=== LIST .prisma/client ==="
ls -la node_modules/.prisma/client || true
echo "=== LIST @prisma/client ==="
ls -la node_modules/@prisma/client || true
next build