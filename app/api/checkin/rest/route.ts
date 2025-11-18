import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getTodayCheckin, createCheckin, updateTodayStats, getOrCreateUser } from '@/lib/db-helpers';
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
    const whopUserId = request.headers.get('x-whop-user-id') || request.headers.get('X-Test-User-Id');
    if (!whopUserId) {
      return NextResponse.json({ message: 'Unauthorized: missing user id' }, { status: 401 });
    }
    const user = await getOrCreateUser(whopUserId, 'Member');

    const { note, sharedNote } = await request.json();

    const todayCheckin = await getTodayCheckin(whopUserId);
    if (todayCheckin) {
      return NextResponse.json({ message: 'You have already checked in today.' }, { status: 409 });
    }

    const checkin = await createCheckin({
      whopUserId,
      type: CheckinType.REST,
      note: sanitize(note),
      sharedPhoto: false,
      sharedNote,
    });

    // Update community stats asynchronously
    await updateTodayStats();

    return NextResponse.json({ log: checkin, user: { id: user.whopUserId, name: user.name, avatarUrl: null } }, { status: 201 });
  } catch (error) {
    console.error('Error in /api/checkin/rest:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
