import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getPublicFeedCheckins } from '@/lib/db-helpers';
import { whopsdk } from '@/lib/whop-sdk';

/**
 * GET /api/feed
 * 
 * Retrieves the public activity feed, showing workout and rest day check-ins.
 * 
 * @param request - The incoming Next.js request.
 * @returns A Response object with the public feed data or an error message.
 */
export async function GET(request: NextRequest) {
  try {
    // Although the feed is public, we still verify the user for context/security
    let whopUserId: string | null = null;

    if (process.env.NODE_ENV === 'development') {
      whopUserId = request.headers.get('X-Test-User-Id');
    } else {
      const token = request.headers.get('x-whop-user-token');
      if (token) {
        try {
          const { userId } = await whopsdk.users.verify({ token });
          whopUserId = userId;
        } catch (error) {
          console.error('Error verifying Whop token:', error);
          return NextResponse.json({ message: 'Invalid Whop token' }, { status: 401 });
        }
      }
    }

    // If no user ID is present (e.g., unauthenticated public access), proceed without user-specific filtering
    // The getPublicFeedCheckins function does not require a whopUserId
    const feed = await getPublicFeedCheckins();

    return NextResponse.json(feed);
  } catch (error) {
    console.error('Error in /api/feed:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
