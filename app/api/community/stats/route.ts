import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getTodayStats, updateTodayStats } from '@/lib/db-helpers';
import { whopsdk } from '@/lib/whop-sdk';

/**
 * GET /api/community/stats
 * 
 * Retrieves today's community-wide statistics.
 * 
 * @param request - The incoming Next.js request.
 * @returns A Response object with the community stats or an error message.
 */
export async function GET(request: NextRequest) {
  try {
    // Although community stats are public, we still verify the user for context/security
    let whopUserId: string | null = null;

    if (process.env.NODE_ENV === 'development') {
      whopUserId = request.headers.get('X-Test-User-Id');
    } else {
      const token = request.headers.get('x-whop-user-token');
      if (token) {
        try {
          const { userId } = await whopsdk.users.verify({ token });
          whopUserId = userId;
        } catch (error) {
          console.error('Error verifying Whop token:', error);
          return NextResponse.json({ message: 'Invalid Whop token' }, { status: 401 });
        }
      }
    }

    let communityStats = await getTodayStats();

    // If no stats for today, generate them
    if (!communityStats) {
      communityStats = await updateTodayStats();
    }

    return NextResponse.json(communityStats);
  } catch (error) {
    console.error('Error in /api/community/stats:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
