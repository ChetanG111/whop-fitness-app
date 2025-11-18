# Pre-push checks

Run these commands locally before pushing to main to reduce Vercel build failures.

1) Type check
```sh
npx tsc --noEmit
```

2) Lint (Biome)
```sh
npx biome check .
```

3) Unit tests with coverage (Vitest)
```sh
npx vitest run --coverage
```

4) Build (Next.js)
```sh
npm run build
```

Fast loop while coding
```sh
npx vitest --changed
# or
npx vitest
```

One-liner (Windows PowerShell/CMD)
```sh
npm run lint && npm run typecheck && npm run test:ci && npm run build
```

Optional: match Vercel as closely as possible
```sh
npx vercel build
```

Notes
- Ensure required env vars exist locally (.env or .env.local) so build passes.
- Keep Node version aligned with Vercel (package.json "engines": { "node": ">=18" }).

Optional: automate with a pre-push hook (Husky)
```sh
npm i -D husky cross-env
npx husky init
```
Create .husky/pre-push:
```sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run lint && npm run typecheck && npm run test:ci && npm run build || exit 1
```