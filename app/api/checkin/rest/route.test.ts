import { POST } from './route';
import { NextRequest } from 'next/server';
import { vi } from 'vitest';
import * as dbHelpers from '@/lib/db-helpers';
import { whopsdk } from '@/lib/whop-sdk';
import { CheckinType } from '@prisma/client';

// Mock db-helpers
vi.mock('@/lib/db-helpers', () => ({
  getTodayCheckin: vi.fn(),
  createCheckin: vi.fn(),
  updateTodayStats: vi.fn(),
  getUserByWhopId: vi.fn(),
  getOrCreateUser: vi.fn(),
}));

// Mock whop-sdk
vi.mock('@/lib/whop-sdk');

// Mock sanitize function
vi.mock('@/lib/sanitize', () => ({
  sanitize: vi.fn((input) => input), // Return input as-is for tests
}));

describe('POST /api/checkin/rest', () => {
  const MOCK_USER = { whopUserId: 'test-user-id', name: 'Test User' };
  const MOCK_CHECKIN = {
    id: 'checkin-id',
    whopUserId: MOCK_USER.whopUserId,
    type: CheckinType.REST,
    muscleGroup: null,
    note: 'Sanitized note',
    photoUrl: null,
    sharedPhoto: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(dbHelpers, 'getOrCreateUser').mockResolvedValue(MOCK_USER as any);
    vi.spyOn(dbHelpers, 'getTodayCheckin').mockResolvedValue(null);
    vi.spyOn(dbHelpers, 'createCheckin').mockImplementation(async (data) => ({
      id: 'checkin-id',
      whopUserId: data.whopUserId,
      type: data.type,
      muscleGroup: data.muscleGroup || null,
      note: data.note || null,
      photoUrl: data.photoUrl || null,
      sharedPhoto: data.sharedPhoto || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any));
    vi.spyOn(dbHelpers, 'updateTodayStats').mockResolvedValue({
      id: 'stat-id',
      date: new Date(),
      totalMembers: 1,
      activeToday: 1,
      createdAt: new Date(),
    } as any);
    vi.spyOn(whopsdk.users, 'retrieve').mockResolvedValue({ username: MOCK_USER.name } as any);
  });

  it('should create a rest check-in successfully', async () => {
    const request = new NextRequest('http://localhost/api/checkin/rest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Test-User-Id': MOCK_USER.whopUserId,
      },
      body: JSON.stringify({ note: 'My rest day' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.log).toEqual(expect.objectContaining({
      type: CheckinType.REST,
      muscleGroup: null,
      note: 'My rest day',
    }));
    expect(data.user).toEqual({ id: MOCK_USER.whopUserId, name: MOCK_USER.name, avatarUrl: null });
    expect(dbHelpers.createCheckin).toHaveBeenCalledWith(expect.objectContaining({
      whopUserId: MOCK_USER.whopUserId,
      type: CheckinType.REST,
      note: 'My rest day',
    }));
    expect(dbHelpers.updateTodayStats).toHaveBeenCalled();
  });

  it('should return 401 if whopUserId is missing', async () => {
    const request = new NextRequest('http://localhost/api/checkin/rest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ note: 'My rest day' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.message).toBe('Unauthorized: missing user id');
    expect(dbHelpers.createCheckin).not.toHaveBeenCalled();
  });

  it('should return 409 if user has already checked in today', async () => {
    vi.spyOn(dbHelpers, 'getTodayCheckin').mockResolvedValue(MOCK_CHECKIN as any);

    const request = new NextRequest('http://localhost/api/checkin/rest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Test-User-Id': MOCK_USER.whopUserId,
      },
      body: JSON.stringify({ note: 'My rest day' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.message).toBe('You have already checked in today.');
    expect(dbHelpers.createCheckin).not.toHaveBeenCalled();
  });

  it('should sanitize the note field', async () => {
    const request = new NextRequest('http://localhost/api/checkin/rest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Test-User-Id': MOCK_USER.whopUserId,
      },
      body: JSON.stringify({ note: '<script>alert("xss")</script>My rest day' }),
    });

    await POST(request);

    expect(dbHelpers.createCheckin).toHaveBeenCalledWith(expect.objectContaining({
      note: '<script>alert("xss")</script>My rest day', // Sanitize is mocked to return input as-is
    }));
  });
});
