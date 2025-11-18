import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getTodayCheckin, createCheckin, updateTodayStats, getUserByWhopId } from '@/lib/db-helpers';
import { whopsdk } from '@/lib/whop-sdk';
import { CheckinType } from '@prisma/client';
import { sanitize } from '@/lib/sanitize';

/**
 * POST /api/checkin/rest
 * 
 * Handles the creation of a new rest day check-in.
 * 
 * @param request - The incoming Next.js request.
 * @returns A Response object with the created check-in data or an error message.
 */
export async function POST(request: NextRequest) {
  try {
    let whopUserId: string | null = null;
    let userName: string = 'Test User'; // Default name for new users

    if (process.env.NODE_ENV === 'development') {
      whopUserId = request.headers.get('X-Test-User-Id');
    } else {
      const userId = request.headers.get('x-whop-user-id');
      if (userId) {
        try {
          const user: any = await whopsdk.users.retrieve(userId);
          whopUserId = userId;
          if (user?.username || user?.name) {
            userName = user.username || user.name;
          }
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

    const { note } = await request.json();

    const todayCheckin = await getTodayCheckin(whopUserId);
    if (todayCheckin) {
      return NextResponse.json({ message: 'You have already checked in today.' }, { status: 409 });
    }

    const checkin = await createCheckin({
      whopUserId,
      type: CheckinType.REST,
      note: sanitize(note),
      sharedPhoto: false,
    });

    // Update community stats asynchronously
    await updateTodayStats();

    return NextResponse.json({ log: checkin, user: { id: user.whopUserId, name: user.name, avatarUrl: null } }, { status: 201 });
  } catch (error) {
    console.error('Error in /api/checkin/rest:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
