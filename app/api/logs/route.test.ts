import { POST } from './route';
import { NextRequest } from 'next/server';
import { vi } from 'vitest';

vi.mock('@/lib/db-helpers', () => ({
  getTodayCheckin: vi.fn(),
  createCheckin: vi.fn(),
  updateTodayStats: vi.fn(),
  getUserByWhopId: vi.fn(() => Promise.resolve({ whopUserId: 'test-user', name: 'Test User' })),
}));

describe('POST /api/logs', () => {
  it('should return 400 if type is missing', async () => {
    const request = new NextRequest('http://localhost/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Test-User-Id': 'test-user',
      },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Invalid check-in type.');
  });
});
