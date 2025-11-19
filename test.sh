#!/bin/bash
if [ ! -f "node_modules/vitest/vitest.mjs" ]; then
  npm install
fi
npm test