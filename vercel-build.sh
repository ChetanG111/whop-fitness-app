#!/bin/bash
npx prisma generate
ls -la node_modules/.prisma/client || true
next build
