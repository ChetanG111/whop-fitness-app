import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateUserRole } from '@/lib/db-helpers';
import { UserRole } from '@prisma/client';

/**
 * POST /api/user/set-role
 * 
 * Updates a user's role. Intended for development/testing purposes.
 * 
 * @param request - The incoming Next.js request.
 * @returns A Response object with the updated user data or an error message.
 */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ message: 'This action is only available in development.' }, { status: 403 });
  }

  try {
    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json({ message: 'userId and role are required.' }, { status: 400 });
    }

    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json({ message: 'Invalid role provided.' }, { status: 400 });
    }

    const updatedUser = await updateUserRole(userId, role);

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error in /api/user/set-role:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
