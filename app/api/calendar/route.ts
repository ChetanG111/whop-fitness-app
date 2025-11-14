import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserCheckins, getUserByWhopId } from '@/lib/db-helpers';
import { whopsdk } from '@/lib/whop-sdk';

/**
 * GET /api/calendar
 * 
 * Retrieves the current user's check-in history for the calendar/heatmap view.
 * 
 * @param request - The incoming Next.js request.
 * @returns A Response object with the user's check-in history or an error message.
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

    const checkins = await getUserCheckins(whopUserId);

    return NextResponse.json(checkins || []);
  } catch (error) {
    console.error('Error in /api/calendar:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
