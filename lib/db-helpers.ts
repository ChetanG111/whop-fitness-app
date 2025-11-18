/**
 * Database Helper Functions
 * 
 * Reusable queries for common database operations.
 * All functions use the singleton Prisma client.
 * 
 * ⚠️ Import these only in server-side code (API routes, server components)
 */

import { prisma } from './prisma'
import { CheckinType, UserRole } from '@prisma/client'

// ============================================
// USER OPERATIONS
// ============================================

/**
 * Get or create a user by Whop user ID
 * This function uses `upsert` to efficiently create a new user or update
 * an existing user's name and role to keep them in sync.
 */
export async function getOrCreateUser(whopUserId: string, name: string, role: UserRole = 'MEMBER') {
  const user = await prisma.user.findUnique({ where: { whopUserId } });
  if (user) {
    return await prisma.user.update({
      where: { whopUserId },
      data: { name },
    });
  }
  return await prisma.user.create({
    data: {
      whopUserId,
      name,
      role,
    },
  });
}

/**
 * Get user by Whop user ID
 */
export async function getUserByWhopId(whopUserId: string) {
  return await prisma.user.findUnique({
    where: { whopUserId },
  })
}

/**
 * Update user role (member → coach)
 */
export async function updateUserRole(whopUserId: string, role: UserRole) {
  return await prisma.user.update({
    where: { whopUserId },
    data: { role },
  })
}

// ============================================
// CHECK-IN OPERATIONS
// ============================================

/**
 * Check if user has already checked in today
 * Returns the check-in if it exists, null otherwise
 */
export async function getTodayCheckin(whopUserId: string) {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  return await prisma.checkin.findFirst({
    where: {
      whopUserId,
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  })
}

/**
 * Create a new check-in
 * Enforces: only 1 check-in per day (caller should check with getTodayCheckin first)
 */
export async function createCheckin(data: {
  whopUserId: string
  type: CheckinType
  muscleGroup?: string
  note?: string | null
  photoUrl?: string
  sharedPhoto?: boolean
  sharedNote?: boolean
}) {
  return await prisma.checkin.create({
    data: {
      whopUserId: data.whopUserId,
      type: data.type,
      muscleGroup: data.muscleGroup,
      note: data.note,
      photoUrl: data.photoUrl,
      sharedPhoto: data.sharedPhoto ?? false,
      sharedNote: data.sharedNote ?? false,
    } as any,
  })
}

/**
 * Get user's check-in history (for calendar/heatmap)
 */
export async function getUserCheckins(whopUserId: string, limit = 30) {
  return await prisma.checkin.findMany({
    where: { whopUserId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

/**
 * Get recent check-ins for public feed
 * Returns check-ins with sharedNote enabled (any type) or WORKOUT/REST with sharedPhoto
 */
export async function getPublicFeedCheckins(limit = 50) {
  return await prisma.checkin.findMany({
    where: {
      OR: [
        { sharedNote: true } as any, // Any check-in with public note enabled
        {
          type: {
            in: [CheckinType.WORKOUT, CheckinType.REST],
          },
          sharedPhoto: true,
        } as any, // WORKOUT/REST with public photo
      ],
    },
    include: {
      user: {
        select: {
          name: true,
          whopUserId: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

// ============================================
// PHOTO COMPLIANCE (2×/week rule)
// ============================================

/**
 * Check if user has uploaded at least 2 photos in the last 7 days
 * Returns { compliant: boolean, photoCount: number }
 */
export async function checkPhotoCompliance(whopUserId: string) {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const photosInLastWeek = await prisma.checkin.count({
    where: {
      whopUserId,
      type: CheckinType.WORKOUT,
      photoUrl: {
        not: null,
      },
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
  })

  return {
    compliant: photosInLastWeek >= 2,
    photoCount: photosInLastWeek,
  }
}

// ============================================
// STREAK CALCULATION
// ============================================

/**
 * Calculate user's current streak
 * Streak counts WORKOUT and REST days (not REFLECTION)
 */
export async function calculateStreak(whopUserId: string) {
  const checkins = await prisma.checkin.findMany({
    where: {
      whopUserId,
      type: {
        in: [CheckinType.WORKOUT, CheckinType.REST],
      },
    },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  })

  if (checkins.length === 0) return 0

  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  for (const checkin of checkins) {
    const checkinDate = new Date(checkin.createdAt)
    checkinDate.setHours(0, 0, 0, 0)

    const diffTime = currentDate.getTime() - checkinDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === streak) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

// ============================================
// COMMUNITY STATS
// ============================================

/**
 * Get or create today's community stats
 */
export async function getTodayStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return await prisma.communityStat.findUnique({
    where: { date: today },
  })
}

/**
 * Update community stats for today
 */
export async function updateTodayStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  // Count total members
  const totalMembers = await prisma.user.count()

  // Count active members today (with WORKOUT or REST check-in)
  const activeToday = await prisma.checkin.groupBy({
    by: ['whopUserId'],
    where: {
      type: {
        in: [CheckinType.WORKOUT, CheckinType.REST],
      },
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    _count: true,
  })
  const activeTodayCount = activeToday.length

  return await prisma.communityStat.upsert({
    where: { date: today },
    update: {
      totalMembers,
      activeToday: activeTodayCount,
    },
    create: {
      date: today,
      totalMembers,
      activeToday: activeTodayCount,
    },
  })
}
