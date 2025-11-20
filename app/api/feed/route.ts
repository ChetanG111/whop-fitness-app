import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getPublicFeedCheckins } from '@/lib/db-helpers';

// Force Node.js runtime for Prisma compatibility
export const runtime = 'nodejs';

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
    // Feed is public, no authentication required
    const feed = await getPublicFeedCheckins(50);

    return NextResponse.json(feed);
  } catch (error) {
    console.error('Error in /api/feed:', error);
    return NextResponse.json({ message: 'An internal server error occurred', error: String(error) }, { status: 500 });
  }
}
