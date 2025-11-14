import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateTodayStats } from '@/lib/db-helpers';

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
