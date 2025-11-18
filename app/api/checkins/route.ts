import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateTodayStats, getOrCreateUser, getUserCheckins } from '@/lib/db-helpers';

/**
 * GET /api/checkins
 * 
 * Retrieves all check-ins for a given user.
 * The user is identified by the 'x-whop-user-id' header or 'X-Test-User-Id' for development.
 * 
 * @param request - The incoming Next.js request.
 * @returns A Response object with the user's check-ins or an error message.
 */
export async function GET(request: NextRequest) {
  try {
    // Get user ID from headers
    const whopUserId = request.headers.get('x-whop-user-id') || request.headers.get('X-Test-User-Id');

    if (!whopUserId) {
      return NextResponse.json({ message: 'User ID not found.' }, { status: 401 });
    }

    // Ensure user exists in database
    await getOrCreateUser(whopUserId, 'User', 'MEMBER');

    // Get user's check-ins
    const checkins = await getUserCheckins(whopUserId, 100);

    return NextResponse.json({ checkins });
  } catch (error) {
    console.error('Error in /api/checkins GET:', error);
    return NextResponse.json({ message: 'An internal server error occurred', error: String(error) }, { status: 500 });
  }
}

/**
 * DELETE /api/checkins
 * 
 * Deletes all check-in records from the database.
 * This is a destructive action intended for testing purposes.
 * 
 * @returns A Response object with a success message or an error.
 */
export async function DELETE() {
  try {
    // This is a destructive operation, ensure it's only used in a controlled environment.
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ message: 'This action is only available in development.' }, { status: 403 });
    }

    const { count } = await prisma.checkin.deleteMany({});

    // After deleting, reset today's community stats
    await updateTodayStats();

    return NextResponse.json({ message: `Successfully deleted ${count} check-ins.` });
  } catch (error) {
    console.error('Error in /api/checkins DELETE:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
