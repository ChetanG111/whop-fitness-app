# API Endpoint Testing Guide

This guide provides instructions on how to test the API endpoints for the Whop Fitness Accountability App.

## Prerequisites

1.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The API will be available at `http://localhost:3000`.

2.  **Get a Test User ID:**
    For local testing, we will use a placeholder `whop_user_id`. You can use the one defined in your `.env.example` file or any other string. For these examples, we will use `user_12345`.

    **Note:** In a live environment, this ID is automatically derived from a secure `x-whop-user-token` provided by Whop. Our backend logic will handle this token, but for direct `curl` tests, we will pass the user ID directly in a custom header `X-Test-User-Id`.

## Testing Commands

As endpoints are built, they will be added here.

---
### 1. User Initialization

#### `GET /api/user/init`
This endpoint gets or creates a user record. It's the first call that should be made for any new user.

**Test Command:**
```bash
curl -X GET http://localhost:3000/api/user/init \
-H "Content-Type: application/json" \
-H "X-Test-User-Id: user_12345"
```

**Expected Success Response (200 OK):**
```json
{
  "whopUserId": "user_12345",
  "name": "Test User",
  "role": "MEMBER",
  "createdAt": "2025-11-13T18:00:00.000Z",
  "updatedAt": "2025-11-13T18:00:00.000Z"
}
```
*(Note: `name` will be pre-filled, and dates will vary.)*

---

### 2. Workout Check-in

#### `POST /api/checkin/workout`
This endpoint allows a user to log a workout.

**Test Command (with photo):**
```bash
curl -X POST http://localhost:3000/api/checkin/workout \
-H "Content-Type: application/json" \
-H "X-Test-User-Id: user_12345" \
-d '{
  "muscleGroup": "Push",
  "note": "Chest and triceps day!",
  "photoUrl": "https://example.com/photo1.jpg",
  "sharedPhoto": true
}'
```

**Test Command (without photo, if compliant):**
```bash
curl -X POST http://localhost:3000/api/checkin/workout \
-H "Content-Type: application/json" \
-H "X-Test-User-Id: user_12345" \
-d '{
  "muscleGroup": "Legs",
  "note": "Heavy squats."
}'
```

**Expected Success Response (201 Created):**
```json
{
  "id": "clp0z00000000000000000000",
  "whopUserId": "user_12345",
  "type": "WORKOUT",
  "muscleGroup": "Push",
  "note": "Chest and triceps day!",
  "photoUrl": "https://example.com/photo1.jpg",
  "sharedPhoto": true,
  "createdAt": "2025-11-13T18:30:00.000Z"
}
```
*(Note: `id` and `createdAt` will vary.)*

**Expected Error Response (400 Bad Request - Missing muscleGroup):**
```json
{
  "message": "Muscle group is required for workout check-in."
}
```

**Expected Error Response (409 Conflict - Already checked in):**
```json
{
  "message": "You have already checked in today."
}
```

**Expected Error Response (400 Bad Request - Photo required):**
```json
{
  "message": "You need to upload a photo for this workout. You have 0 photos this week."
}
```

---

### 3. Rest Day Check-in

#### `POST /api/checkin/rest`
This endpoint allows a user to log a rest day.

**Test Command:**
```bash
curl -X POST http://localhost:3000/api/checkin/rest \
-H "Content-Type: application/json" \
-H "X-Test-User-Id: user_12345" \
-d '{
  "note": "Active recovery walk."
}'
```

**Expected Success Response (201 Created):**
```json
{
  "id": "clp0z00000000000000000001",
  "whopUserId": "user_12345",
  "type": "REST",
  "muscleGroup": null,
  "note": "Active recovery walk.",
  "photoUrl": null,
  "sharedPhoto": false,
  "createdAt": "2025-11-13T18:45:00.000Z"
}
```
*(Note: `id` and `createdAt` will vary.)*

**Expected Error Response (409 Conflict - Already checked in):**
```json
{
  "message": "You have already checked in today."
}
```

---

### 4. Reflection Check-in

#### `POST /api/checkin/reflection`
This endpoint allows a user to log a reflection (e.g., couldn't work out).

**Test Command:**
```bash
curl -X POST http://localhost:3000/api/checkin/reflection \
-H "Content-Type: application/json" \
-H "X-Test-User-Id: user_12345" \
-d '{
  "note": "Feeling a bit under the weather today."
}'
```

**Expected Success Response (201 Created):**
```json
{
  "id": "clp0z00000000000000000002",
  "whopUserId": "user_12345",
  "type": "REFLECTION",
  "muscleGroup": null,
  "note": "Feeling a bit under the weather today.",
  "photoUrl": null,
  "sharedPhoto": false,
  "createdAt": "2025-11-13T19:00:00.000Z"
}
```
*(Note: `id` and `createdAt` will vary.)*

**Expected Error Response (409 Conflict - Already checked in):**
```json
{
  "message": "You have already checked in today."
}
```

---

### 5. Public Feed

#### `GET /api/feed`
This endpoint retrieves the public activity feed, showing workout and rest day check-ins.

**Test Command:**
```bash
curl -X GET http://localhost:3000/api/feed \
-H "Content-Type: application/json" \
-H "X-Test-User-Id: user_12345"
```

**Expected Success Response (200 OK):**
```json
[
  {
    "id": "clp0z00000000000000000000",
    "whopUserId": "user_12345",
    "type": "WORKOUT",
    "muscleGroup": "Push",
    "note": "Chest and triceps day!",
    "photoUrl": "https://example.com/photo1.jpg",
    "sharedPhoto": true,
    "createdAt": "2025-11-13T18:30:00.000Z",
    "user": {
      "name": "Test User",
      "whopUserId": "user_12345"
    }
  },
  {
    "id": "clp0z00000000000000000001",
    "whopUserId": "user_12345",
    "type": "REST",
    "muscleGroup": null,
    "note": "Active recovery walk.",
    "photoUrl": null,
    "sharedPhoto": false,
    "createdAt": "2025-11-13T18:45:00.000Z",
    "user": {
      "name": "Test User",
      "whopUserId": "user_12345"
    }
  }
]
```
*(Note: `id`, `createdAt`, and content will vary based on previous check-ins.)*

---

### 6. User Calendar/History

#### `GET /api/calendar`
This endpoint retrieves the current user's check-in history for the calendar/heatmap view.

**Test Command:**
```bash
curl -X GET http://localhost:3000/api/calendar \
-H "Content-Type: application/json" \
-H "X-Test-User-Id: user_12345"
```

**Expected Success Response (200 OK):**
```json
[
  {
    "id": "clp0z00000000000000000002",
    "whopUserId": "user_12345",
    "type": "REFLECTION",
    "muscleGroup": null,
    "note": "Feeling a bit under the weather today.",
    "photoUrl": null,
    "sharedPhoto": false,
    "createdAt": "2025-11-13T19:00:00.000Z"
  },
  {
    "id": "clp0z00000000000000000001",
    "whopUserId": "user_12345",
    "type": "REST",
    "muscleGroup": null,
    "note": "Active recovery walk.",
    "photoUrl": null,
    "sharedPhoto": false,
    "createdAt": "2025-11-13T18:45:00.000Z"
  },
  {
    "id": "clp0z00000000000000000000",
    "whopUserId": "user_12345",
    "type": "WORKOUT",
    "muscleGroup": "Push",
    "note": "Chest and triceps day!",
    "photoUrl": "https://example.com/photo1.jpg",
    "sharedPhoto": true,
    "createdAt": "2025-11-13T18:30:00.000Z"
  }
]
```
*(Note: `id`, `createdAt`, and content will vary based on previous check-ins.)*

**Expected Error Response (400 Bad Request - Missing User ID):**
```json
{
  "message": "User ID not found. Provide X-Test-User-Id for testing."
}
```

**Expected Error Response (404 Not Found - User not initialized):**
```json
{
  "message": "User not found. Please initialize user first."
}
```

---

### 7. User Stats

#### `GET /api/stats`
This endpoint retrieves the current user's statistics, including streak and photo compliance.

**Test Command:**
```bash
curl -X GET http://localhost:3000/api/stats \
-H "Content-Type: application/json" \
-H "X-Test-User-Id: user_12345"
```

**Expected Success Response (200 OK):**
```json
{
  "streak": 2,
  "photoCompliance": {
    "compliant": false,
    "photoCount": 0
  }
}
```
*(Note: `streak` and `photoCount` will vary based on user activity.)*

**Expected Error Response (400 Bad Request - Missing User ID):**
```json
{
  "message": "User ID not found. Provide X-Test-User-Id for testing."
}
```

**Expected Error Response (404 Not Found - User not initialized):**
```json
{
  "message": "User not found. Please initialize user first."
}
```

---

### 8. Community Stats

#### `GET /api/community/stats`
This endpoint retrieves today's community-wide statistics.

**Test Command:**
```bash
curl -X GET http://localhost:3000/api/community/stats \
-H "Content-Type: application/json" \
-H "X-Test-User-Id: user_12345"
```

**Expected Success Response (200 OK):**
```json
{
  "id": "clp0z00000000000000000003",
  "date": "2025-11-13T00:00:00.000Z",
  "totalMembers": 1,
  "activeToday": 1,
  "createdAt": "2025-11-13T19:30:00.000Z"
}
```
*(Note: `id`, `date`, `totalMembers`, `activeToday`, and `createdAt` will vary.)*

**Expected Error Response (401 Unauthorized - Invalid Whop token):**
```json
{
  "message": "Invalid Whop token"
}
```

---

### 9. Coach Dashboard

#### `GET /api/coach/dashboard`
This endpoint retrieves data for the coach dashboard. Requires the user to have a `COACH` role.

**Test Command (as Coach):**
```bash
curl -X GET http://localhost:3000/api/coach/dashboard \
-H "Content-Type: application/json" \
-H "X-Test-User-Id: coach_123"
```
*(Note: You will need to manually update a user's role to 'COACH' in your database for this to work, or create a new user with the 'COACH' role.)*

**Expected Success Response (200 OK):**
```json
{
  "coach": {
    "whopUserId": "coach_123",
    "name": "Test Coach"
  },
  "communityStats": {
    "id": "clp0z00000000000000000003",
    "date": "2025-11-13T00:00:00.000Z",
    "totalMembers": 1,
    "activeToday": 1,
    "createdAt": "2025-11-13T19:30:00.000Z"
  },
  "members": [
    {
      "whopUserId": "user_12345",
      "name": "Test User",
      "streak": 2,
      "photoCompliance": {
        "compliant": false,
        "photoCount": 0
      },
      "hasCheckedInToday": true
    }
  ]
}
```
*(Note: Content will vary based on user data.)*

**Expected Error Response (403 Forbidden - Not a coach):**
```json
{
  "message": "Unauthorized: Only coaches can access this dashboard."
}
```

---

