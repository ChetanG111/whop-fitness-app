import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { calculateStreak, checkPhotoCompliance, getUserByWhopId } from '@/lib/db-helpers';
import { whopsdk } from '@/lib/whop-sdk';

/**
 * GET /api/stats
 * 
 * Retrieves the current user's statistics, including streak and photo compliance.
 * 
 * @param request - The incoming Next.js request.
 * @returns A Response object with the user's stats or an error message.
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

    // Ensure user exists
    const user = await getUserByWhopId(whopUserId);
    if (!user) {
      return NextResponse.json({ message: 'User not found. Please initialize user first.' }, { status: 404 });
    }

    const streak = await calculateStreak(whopUserId);
    const photoCompliance = await checkPhotoCompliance(whopUserId);

    return NextResponse.json({
      streak,
      photoCompliance,
    });
  } catch (error) {
    console.error('Error in /api/stats:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
