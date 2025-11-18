import { NextResponse, NextRequest } from 'next/server';
import { getTodayCheckin } from '@/lib/db-helpers';

/**
 * GET /api/checkins/status
 * 
 * Checks if a user has already checked in today.
 * The user is identified by the 'x-whop-user-id' header or 'X-Test-User-Id' for development.
 * 
 * @param request - The incoming Next.js request.
 * @returns A Response object with { hasCheckedIn: boolean } or an error message.
 */
export async function GET(request: NextRequest) {
  try {
    const whopUserId = request.headers.get('x-whop-user-id') || request.headers.get('X-Test-User-Id');

    if (!whopUserId) {
      return NextResponse.json({ message: 'User ID not found.' }, { status: 401 });
    }

    const todayCheckin = await getTodayCheckin(whopUserId);

    return NextResponse.json({ hasCheckedIn: !!todayCheckin });
  } catch (error) {
    console.error('Error in /api/checkins/status GET:', error);
    return NextResponse.json({ message: 'An internal server error occurred', error: String(error) }, { status: 500 });
  }
}
