import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserByWhopId, calculateStreak, checkPhotoCompliance, getTodayStats, updateTodayStats, getTodayCheckin } from '@/lib/db-helpers';
import { whopsdk } from '@/lib/whop-sdk';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

/**
 * GET /api/coach/dashboard
 * 
 * Retrieves data for the coach dashboard, including member overview, stats summary,
 * and photo tracking. Requires COACH role.
 * 
 * @param request - The incoming Next.js request.
 * @returns A Response object with the coach dashboard data or an error message.
 */
export async function GET(request: NextRequest) {
  try {
    let whopUserId: string | null = null;

    if (process.env.NODE_ENV === 'development') {
      whopUserId = request.headers.get('X-Test-User-Id');
    } else {
      const userId = request.headers.get('x-whop-user-id');
      if (userId) {
        try {
          await whopsdk.users.retrieve(userId);
          whopUserId = userId;
        } catch (error) {
          console.error('Error verifying Whop user:', error);
          return NextResponse.json({ message: 'Invalid Whop user' }, { status: 401 });
        }
      }
    }

    if (!whopUserId) {
      return NextResponse.json({ message: 'User ID not found. Provide X-Test-User-Id for testing.' }, { status: 400 });
    }

    const coachUser = await getUserByWhopId(whopUserId);
    if (!coachUser || coachUser.role !== UserRole.COACH) {
      return NextResponse.json({ message: 'Unauthorized: Only coaches can access this dashboard.' }, { status: 403 });
    }

    // Fetch all members
    const allMembers = await prisma.user.findMany({
      where: { role: UserRole.MEMBER },
      select: { whopUserId: true, name: true },
    });

    const membersData = await Promise.all(
      allMembers.map(async (member) => {
        const streak = await calculateStreak(member.whopUserId);
        const photoCompliance = await checkPhotoCompliance(member.whopUserId);
        const todayCheckin = await getTodayCheckin(member.whopUserId);
        const hasCheckedInToday = !!todayCheckin;

        return {
          whopUserId: member.whopUserId,
          name: member.name,
          streak,
          photoCompliance,
          hasCheckedInToday,
        };
      })
    );

    let communityStats = await getTodayStats();
    if (!communityStats) {
      communityStats = await updateTodayStats();
    }

    return NextResponse.json({
      coach: {
        whopUserId: coachUser.whopUserId,
        name: coachUser.name,
      },
      communityStats,
      members: membersData,
    });
  } catch (error) {
    console.error('Error in /api/coach/dashboard:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
