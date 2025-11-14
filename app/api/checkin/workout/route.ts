import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getTodayCheckin, createCheckin, checkPhotoCompliance, updateTodayStats, getUserByWhopId } from '@/lib/db-helpers';
import { whopsdk } from '@/lib/whop-sdk';
import { CheckinType } from '@prisma/client';

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
    let whopUserId: string | null = null;
    let userName: string = 'Test User'; // Default name for new users

    if (process.env.NODE_ENV === 'development') {
      whopUserId = request.headers.get('X-Test-User-Id');
    } else {
      const token = request.headers.get('x-whop-user-token');
      if (token) {
        try {
          const { userId, name } = await whopsdk.users.verify({ token });
          whopUserId = userId;
          if (name) {
            userName = name;
          }
        } catch (error) {
          console.error('Error verifying Whop token:', error);
          return NextResponse.json({ message: 'Invalid Whop token' }, { status: 401 });
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

    const { muscleGroup, note, photoUrl, sharedPhoto } = await request.json();

    if (!muscleGroup) {
      return NextResponse.json({ message: 'Muscle group is required for workout check-in.' }, { status: 400 });
    }

    const todayCheckin = await getTodayCheckin(whopUserId);
    if (todayCheckin) {
      return NextResponse.json({ message: 'You have already checked in today.' }, { status: 409 });
    }

    // Photo compliance check
    // const { compliant, photoCount } = await checkPhotoCompliance(whopUserId);
    // if (!compliant && !photoUrl) {
    //   return NextResponse.json({ message: `You need to upload a photo for this workout. You have ${photoCount} photos this week.` }, { status: 400 });
    // }

    const checkin = await createCheckin({
      whopUserId,
      type: CheckinType.WORKOUT,
      muscleGroup,
      note,
      photoUrl,
      sharedPhoto,
    });

    // Update community stats asynchronously
    await updateTodayStats();

    return NextResponse.json(checkin, { status: 201 });
  } catch (error) {
    console.error('Error in /api/checkin/workout:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
