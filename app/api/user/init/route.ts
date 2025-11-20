import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getOrCreateUser } from '@/lib/db-helpers';
import { whopsdk } from '@/lib/whop-sdk';

// Force Node.js runtime for Prisma compatibility
export const runtime = 'nodejs';

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

    if (process.env.NODE_ENV === 'development') {
      whopUserId = request.headers.get('X-Test-User-Id');
      whopUserName = 'Test User';
    } else {
      const userId = request.headers.get('x-whop-user-id');
      if (userId) {
        try {
          const user: any = await whopsdk.users.retrieve(userId);
          whopUserId = userId;
          whopUserName = user?.username || user?.name || null;
        } catch (error) {
          console.error('Error retrieving Whop user:', error);
          return NextResponse.json({ message: 'Invalid Whop user' }, { status: 401 });
        }
      }
    }

    if (!whopUserId) {
      return NextResponse.json({ message: 'User ID not found. Provide X-Test-User-Id for testing.' }, { status: 400 });
    }

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
