import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserByWhopId, getUserCheckins } from '@/lib/db-helpers';
import { whopsdk } from '@/lib/whop-sdk';
import { UserRole } from '@prisma/client';

// Force Node.js runtime for Prisma compatibility
export const runtime = 'nodejs';

/**
 * GET /api/coach/member-calendar
 * 
 * Retrieves the check-in history for a specific member.
 * Requires the requester to have the COACH role.
 * 
 * @param request - The incoming Next.js request.
 * @returns A Response object with the member's check-in history or an error message.
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Verify the requester is a coach
    let coachId: string | null = null;
    if (process.env.NODE_ENV === 'development') {
      coachId = request.headers.get('X-Test-User-Id');
    } else {
      const userId = request.headers.get('x-whop-user-id');
      if (userId) {
        try {
          await whopsdk.users.retrieve(userId);
          coachId = userId;
        } catch (error) {
          return NextResponse.json({ message: 'Invalid Whop user' }, { status: 401 });
        }
      }
    }

    if (!coachId) {
      return NextResponse.json({ message: 'User ID not found.' }, { status: 400 });
    }

    const coachUser = await getUserByWhopId(coachId);
    if (!coachUser || coachUser.role !== UserRole.COACH) {
      return NextResponse.json({ message: 'Unauthorized: Only coaches can access this data.' }, { status: 403 });
    }

    // 2. Get the target member's ID from the query params
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('userId');

    if (!memberId) {
      return NextResponse.json({ message: 'Member user ID is required.' }, { status: 400 });
    }

    // 3. Fetch and return the member's check-ins
    const checkins = await getUserCheckins(memberId);
    return NextResponse.json(checkins);

  } catch (error) {
    console.error('Error in /api/coach/member-calendar:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
