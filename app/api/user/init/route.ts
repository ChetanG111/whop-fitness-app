import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getOrCreateUser } from '@/lib/db-helpers';
import { whopsdk } from '@/lib/whop-sdk';
import { UserRole } from '@prisma/client';

/**
 * GET /api/user/init
 * 
 * Initializes a user by creating them if they don't exist, or updating their
 * name and role if they do.
 */
export async function GET(request: NextRequest) {
  try {
    let whopUserId: string | null = null;
    let whopUserName: string | null = null;

    // Determine the source-of-truth name for the user
    const name = whopUserName || 'New User';
      
    // Create or update the user in the database
    const user = await getOrCreateUser(whopUserId, name);

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error in /api/user/init:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
