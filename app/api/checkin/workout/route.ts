import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getTodayCheckin, createCheckin, updateTodayStats, getOrCreateUser } from '@/lib/db-helpers';
import { CheckinType } from '@prisma/client';
import { sanitize } from '@/lib/sanitize';

// Force Node.js runtime for Prisma compatibility
export const runtime = 'nodejs';

/**
 * POST /api/checkin/workout
 * 
 * Handles the creation of a new workout check-in.
 * 
 * @param request - The incoming Next.js request.
 * @returns A Response object with the created check-in data or an error message.
 */
export async function POST(request: NextRequest) {
  try {
    const whopUserId =
      request.headers.get('x-whop-user-id') ||
      request.headers.get('X-Whop-User-Id') ||
      request.headers.get('x-whop-userid') ||
      request.headers.get('whop-user-id') ||
      // scan any unusual casing
      (() => {
        for (const [k, v] of request.headers.entries()) {
          const key = k.toLowerCase();
          if (key.includes('whop') && key.includes('user') && key.includes('id')) return v;
        }
        return null as string | null;
      })() ||
      // explicit test header (works in prod too if set by client)
      request.headers.get('X-Test-User-Id') ||
      // last-resort env value for emergency testing
      (process.env.NEXT_PUBLIC_TEST_USER_ID || null);
    if (!whopUserId) {
      return NextResponse.json({ message: 'Unauthorized: missing user id' }, { status: 401 });
    }
    const user = await getOrCreateUser(whopUserId, 'Member');

    const { muscleGroup, note, photoUrl, sharedPhoto, sharedNote } = await request.json();

    if (!muscleGroup) {
      return NextResponse.json({ message: 'Muscle group is required for workout check-in.' }, { status: 400 });
    }

    const todayCheckin = await getTodayCheckin(whopUserId);
    if (todayCheckin) {
      return NextResponse.json({ message: 'You have already checked in today.' }, { status: 409 });
    }

    // Photo compliance check intentionally skipped for MVP

    const checkin = await createCheckin({
      whopUserId,
      type: CheckinType.WORKOUT,
      muscleGroup,
      note: sanitize(note),
      photoUrl,
      sharedPhoto,
      sharedNote,
    });

    // Update community stats asynchronously
    await updateTodayStats();

    return NextResponse.json({ log: checkin, user: { id: user.whopUserId, name: user.name, avatarUrl: null } }, { status: 201 });
  } catch (error) {
    console.error('Error in /api/checkin/workout:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
