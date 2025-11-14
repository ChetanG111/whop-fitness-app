/**
 * Singleton Prisma Client for Next.js
 * 
 * Prevents "too many connections" errors in development by reusing
 * the same PrismaClient instance across hot reloads.
 * 
 * ⚠️ USAGE RULES:
 * - Import this in API routes and server components only
 * - Never import in client components (browser code)
 * - Always use server-side rendering or API routes for DB queries
 */

import { PrismaClient } from '@prisma/client'

// PrismaClient is attached to the `global` object in development
// to prevent exhausting your database connection limit.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
