<!--
AI CONTEXT INSTRUCTIONS:
- Treat this document as the single source of truth about the project.
- Do NOT invent new features outside the MVP scope below.
- All user identity is handled via Whop SDK (`whop_user_id`).
- Frontend: Next.js (TypeScript). Backend: API Routes.
- Output clean, production-grade code. Avoid unnecessary complexity.
-->

# 🏋️‍♂️ Fitness Accountability App (Whop Embedded)

_Purpose: A Whop-embedded fitness accountability app focused on daily consistency, reflection, and coach-visible engagement._

---

## 🔍 Purpose
A micro-social accountability tool built as a **Whop App**, designed for fitness coaches and their communities.  
It helps members stay consistent with daily workouts or rest days through a simple daily tap, optional proof photos, and visual feedback — all inside Whop.

Coaches pay for the app (subscription) to increase engagement, retention, and proof of participation within their communities.

---

## 🎯 Core Philosophy
- **Frictionless Consistency:** One tap a day keeps the habit alive.  
- **Visible Effort:** Optional photos and notes add authenticity.  
- **Honest Accountability:** Rest days and reflections keep users consistent without guilt.  
- **Community Reinforcement:** Shared progress builds motivation.  
- **Zero-login UX:** Uses Whop’s built-in `whop_user_id`; no external sign-in.

---

## 👥 Target Users
- **Members:** People in Whop fitness communities aiming to build consistent workout habits.  
- **Coaches/Owners:** Community leaders who want to visualize and quantify member engagement.

---

## 💡 V1 Feature Set — Final

### **Daily Check-Ins**
| Feature | Description | Purpose |
| --- | --- | --- |
| **Workout Done Button** | One tap per day to log completion. | Simple, habit-forming action. |
| **Muscle Group Selection** | Quick dropdown (Push/Pull/Legs/Cardio/Full Body/Other). **Required.** | Adds lightweight workout context. |
| **Optional Note/Emoji** | Add a short comment or emoji. | Personal expression & data variety. |
| **Photo Upload** | Mandatory **2× per week**, private by default (optional share). | Ensures authenticity, prevents ghosting. |
| **24-Hour Window** | Check-ins valid only for current day. | Prevents back-logging. |
| **Visual Feedback** | Confetti/streak bar fill animation. | Reinforces dopamine loop. |
| **Public Feed Display** | e.g. “Jane completed a Push workout 💪 2 hours ago.” (photo visible only if shared). | Creates social validation & visibility. |
| **Daily Stats** | Shows “15/40 members checked in today” on feed. | Promotes collective accountability. |

---

### **Rest Day Flow**
| Feature | Description | Purpose |
| --- | --- | --- |
| **"Rest Day" Button** | Member actively logs a rest day. | Keeps streaks fair and honest. |
| **Optional Note** | Add note like “Active recovery walk.” | Adds nuance and personalization. |
| **Maintains Streak** | Rest days count toward consistency. | Encourages healthy recovery. |
| **Public Feed Display** | e.g. “Mike logged a rest day 🔵 5 hours ago.” | Normalizes rest & recovery. |

---

### **Reflection Flow**
| Feature | Description | Purpose |
| --- | --- | --- |
| **"Couldn't Work Out" Button** | Record reason (Busy/Sick/Low Energy/Other). | Encourages honesty, prevents churn. |
| **Calming Message** | Reassuring message post-reflection. | Maintains emotional stability. |
| **Breaks Streak** | Reflections are recorded but do not count toward the streak. They do not break it, but they do not extend it either. | Keeps data authentic. |
| **Tracked Separately** | Coaches see reflections vs total ghosts. | Reveals engagement honesty. |

---

### **Progress Tracking**
| Feature | Description | Purpose |
| --- | --- | --- |
| **Streak Counter** | Counts workout + rest days. | Simple consistency indicator. |
| **Heatmap/Calendar** | Visual overview of daily activity. Colors: 🟩 Workout (#3AC2C8), 🔵 Rest (#C8BFAF), 🟨 Reflection (#E56A6A). Days with no check-in are empty. | Clear visual effort overview. |
| **Weekly Summary** | “5 workouts + 2 rest days = 7/7 engaged (100%).” | Reinforces consistent effort. |

---

### **Community Layer**
| Feature | Description | Purpose |
| --- | --- | --- |
| **Public Feed** | Displays all check-ins (workout/rest day) with timestamps. | Fosters social accountability. |
| **Activity Stats** | Shows total active members today. | Motivates collective effort. |

---

### **Coach Dashboard**
| Feature | Description | Purpose |
| --- | --- | --- |
| **Member Overview** | All members with streak colors: 🟢 active, 🟡 slipping, 🔴 ghosting. | At-a-glance engagement map. |
| **Stats Summary** | % engaged this week, avg consistency rate. | Tracks community health. |
| **Reflection Visibility** | See who reflected vs ghosted. | Enables human connection & support. |
| **Photo Tracking** | Shows who met 2×/week photo rule (no private photo access). | Accountability without invasion. |

---

### ❌ **Cut from V1 (Future Versions)**
- Time-locked button  
- Announcements/scheduling feature  
- Public check-in reactions  
- Leaderboard  
- Monthly snapshot  
- Progress photo gallery/timeline  
- Reflection streak tracking  

---

## 🧩 Tech Stack
| Layer | Tool | Notes |
| --- | --- | --- |
| **Frontend** | Next.js + React (TypeScript) | Whop app template-based. |
| **Backend** | Next.js API Routes | Modular monolith for fast iteration. |
| **Database** | PostgreSQL (Prisma ORM) | Hosted on Supabase or Neon. |
| **Storage** | Supabase / S3 | For uploaded photos. |
| **Auth** | Whop SDK (uses `user_id`) | No extra sign-in required. |
| **Deployment** | Vercel | Auto-deploy from GitHub CI/CD. |
| **Testing** | Jest + Playwright | Unit + E2E happy-path tests. |
| **Monitoring** | Sentry + Vercel logs | Basic error tracking. |

---

## 🔒 Identity & Authentication
- Uses `x-whop-user-token` header from Whop’s embedded context.  
- Backend verifies token → extracts `user_id` and `community_id`.  
- First-time users auto-created in DB via `/api/init-user`.  
- No manual sign-in. Whop manages session and permissions.

---

## 🧠 App Data Model (Simplified)
```plaintext
users (whop_user_id PK, name, role)
checkins (id, whop_user_id, type [workout/rest/reflection], muscle_group, note, photo_url, shared_photo, created_at)
community_stats (id, date, total_members, active_today)
```

## 🗄️ Database Layer — Source of Truth

### **Backend Architecture**
- **Database:** PostgreSQL hosted on **Supabase**
- **ORM:** Prisma v6.19.0
- **Storage:** Supabase Storage (`workout-photos` bucket)
- **Connection:** Transaction pooling (port 6543) for serverless optimization

### **Critical File Paths**
| File | Purpose | Import Location |
|------|---------|----------------|
| `lib/prisma.ts` | Singleton Prisma Client | ✅ API routes, server components |
| `lib/db-helpers.ts` | Reusable database queries | ✅ API routes, server components |
| `lib/supabase-server.ts` | Admin Supabase client (service_role) | ❌ Server-side ONLY |
| `lib/supabase-client.ts` | Public Supabase client (anon key) | ✅ Client components |
| `prisma/schema.prisma` | Database schema (single source of truth) | N/A (auto-generated) |
| `app/experiences/[experienceId]/page.module.css` | CSS Modules for the main client page | ✅ Client components |

### **Environment Variables (Required)**
```bash
# Database (Prisma)
DATABASE_URL=postgresql://...@...pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://...@db....supabase.co:5432/postgres

# Supabase (Storage & Auth)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx... (safe for browser)
SUPABASE_SERVICE_ROLE_KEY=eyJxxx... (⚠️ server-only, never expose)

# Whop SDK
WHOP_API_KEY=apik_xxx...
NEXT_PUBLIC_WHOP_APP_ID=app_xxx...
NEXT_PUBLIC_WHOP_AGENT_USER_ID=user_xxx...
NEXT_PUBLIC_WHOP_COMPANY_ID=biz_xxx...
```

### **Database Rules (CRITICAL)**
1. ✅ **ALWAYS import from `lib/prisma.ts`** (never instantiate `new PrismaClient()`)
2. ✅ **ALWAYS use helper functions from `lib/db-helpers.ts`** when available
3. ❌ **NEVER import Prisma in client components** (`'use client'`)
4. ❌ **NEVER write raw SQL** (use Prisma queries only)
5. ✅ **ALWAYS check `getTodayCheckin()` before creating a new check-in**
6. ✅ **ALWAYS validate photo compliance with `checkPhotoCompliance()`**
7. ✅ **ALWAYS use UTC timestamps** (Prisma handles this automatically)

### **Prisma Client Usage Pattern**
```typescript
// ✅ CORRECT (API Route)
import { prisma } from '@/lib/prisma'

export async function GET() {
  const users = await prisma.user.findMany()
  return Response.json(users)
}

// ❌ WRONG (Client Component)
'use client'
import { prisma } from '@/lib/prisma' // Will fail at runtime
```

### **Styling `react-calendar-heatmap`**
The `react-calendar-heatmap` library uses CSS classes to style the heatmap. To customize the colors, you need to:
1.  In your component, use the `classForValue` prop to assign a class name based on the value of each day.
2.  In your CSS file (e.g., `page.module.css`), define the styles for these class names.

**Example:**
```javascript
// in your component.tsx
const classForValue = (value: any) => {
  if (!value) {
    return 'color-empty';
  }
  switch (value.count) {
    case 1: return 'color-scale-1'; // REFLECTION
    case 2: return 'color-scale-2'; // REST
    case 3: return 'color-scale-3'; // WORKOUT
    default: return 'color-empty';
  }
};
```
```css
/* in your page.module.css */
.color-scale-1 { background-color: #E56A6A; } /* REFLECTION */
.color-scale-2 { background-color: #C8BFAF; } /* REST */
.color-scale-3 { background-color: #3AC2C8; } /* WORKOUT */
.color-empty { background-color: #ebedf0; }
```

### **Database Helper Functions (lib/db-helpers.ts)**
**Always use these instead of writing raw Prisma queries:**

| Function | Purpose | Returns |
|----------|---------|---------|
| `getOrCreateUser(whopUserId, name)` | Get or create user on first visit | User object |
| `getTodayCheckin(whopUserId)` | Check if user already checked in today | Checkin \| null |
| `createCheckin(data)` | Create new check-in | Checkin object |
| `getUserCheckins(whopUserId, limit?)` | Get user's check-in history | Checkin[] |
| `getPublicFeedCheckins(limit?)` | Get feed (WORKOUT + REST only) | Checkin[] with user |
| `checkPhotoCompliance(whopUserId)` | Check 2×/week photo rule | `{ compliant: boolean, photoCount: number }` |
| `calculateStreak(whopUserId)` | Calculate current streak | number |
| `getTodayStats()` | Get today's community stats | CommunityStat \| null |
| `updateTodayStats()` | Update community stats | CommunityStat |

### **Supabase Storage (Photos)**
- **Bucket:** `workout-photos` (public access enabled)
- **Max Size:** 5 MB per file
- **Allowed Types:** `image/jpeg`, `image/png`, `image/webp`
- **Upload Flow:**
  1. Client uploads to Supabase Storage via `lib/supabase-client.ts`
  2. Get public URL from storage response
  3. Save URL in database via API route (`photo_url` column)
- **Privacy:** Controlled by `shared_photo` boolean (not file permissions)

---

## 📦 Database Schema (Prisma Models)

### **User Model**
```prisma
model User {
  whopUserId String   @id @map("whop_user_id")
  name       String
  role       UserRole @default(MEMBER)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  checkins   Checkin[]
}

enum UserRole {
  MEMBER
  COACH
}
```

**Rules:**
- `whopUserId` is the **primary key** (matches Whop's user ID)
- Auto-created via `getOrCreateUser()` on first visit
- `role` defaults to `MEMBER` (can be upgraded to `COACH`)

---

### **Checkin Model**
```prisma
model Checkin {
  id          String      @id @default(cuid())
  whopUserId  String      @map("whop_user_id")
  type        CheckinType
  muscleGroup String?     @map("muscle_group")
  note        String?
  photoUrl    String?     @map("photo_url")
  sharedPhoto Boolean     @default(false)
  createdAt   DateTime    @default(now())
  user        User        @relation(fields: [whopUserId], references: [whopUserId], onDelete: Cascade)
}

enum CheckinType {
  WORKOUT    // 🟩 Counts toward streak, requires muscle_group
  REST       // 🔵 Counts toward streak
  REFLECTION // 🟨 Does NOT count toward streak
}
```

**Rules:**
- Only **1 check-in per user per day** (enforced server-side via `getTodayCheckin()`)
- `type=WORKOUT` **requires** `muscleGroup` field
- `type=WORKOUT` can include `photoUrl` (Supabase Storage URL)
- `sharedPhoto=true` makes photo visible on public feed
- `createdAt` stored as UTC timestamp (no timezone)
- Cascade delete: if user deleted, all their check-ins deleted

**Indexes:**
- `[whopUserId, createdAt]` for fast daily check-in lookups
- `[type]` for filtering feed by check-in type
- `[createdAt]` for chronological sorting

---

### **CommunityStat Model**
```prisma
model CommunityStat {
  id           String   @id @default(cuid())
  date         DateTime @unique @db.Date
  totalMembers Int
  activeToday  Int
  createdAt    DateTime @default(now())
}
```

**Rules:**
- One row per day (`date` is unique)
- `activeToday` counts distinct users with WORKOUT or REST check-ins
- Updated via `updateTodayStats()` (call after each check-in)
- Used for coach dashboard aggregate stats

---

## 🧠 Streak Logic
Streak **increases** on:
- Workout days  
- Rest days  

Streak **does not increase but does not break** on:
- Reflection days

Streak **breaks** on:
- Ghost days (no check-in)

Heatmap:
- 🟩 workout  
- 🔵 rest  
- 🟨 reflection  
- 🟥 ghost  

---

## 📸 Photo Requirement Logic (Weekly)
- Users must upload **2 photos per week** (rolling 7 days).
- Only **workout check-ins** count toward the requirement.
- If user hasn’t met requirement:
  - Next workout check-in prompts for a required photo.
- `photo_url` stored in DB; actual file stored in Supabase Storage.
- `shared_photo` determines if photo is visible on feed.

Coaches can see:
- Whether user met the 2×/week photo requirement  
Not the private photos themselves.

---

## 📰 Feed Rules
The public feed shows:
- Workout check-ins  
- Rest day check-ins  

It does **not** show:
- Reflection entries

Feed entries include:
- User name
- Check-in type
- Muscle group (if workout)
- Emoji/note
- Timestamp

If `shared_photo = true`, the photo is visible on feed.

---

## 🔥 API Contract (Conceptual)

### POST
- `/api/checkin/workout`
- `/api/checkin/rest`
- `/api/checkin/reflection`

### GET
- `/api/feed`
- `/api/calendar`
- `/api/stats`
- `/api/coach-dashboard`

API responsibilities:
- Enforce 1 check-in/day rule.
- Validate workout → requires muscle group.
- Validate photo rule.
- Insert record via Prisma.
- Return updated state.

---

## 🔐 Identity Rules
- All requests validated using Whop header `x-whop-user-token`.
- Token resolves to `whop_user_id`.
- This is the **only** user identity.
- No separate login system.

---

## ⚙️ AI Development Rules

### **Database Rules (CRITICAL)**
1. ✅ **ALWAYS import `prisma` from `lib/prisma.ts`** (singleton pattern)
2. ✅ **ALWAYS use helper functions from `lib/db-helpers.ts`** when available
3. ❌ **NEVER import Prisma in client components** (`'use client'`)
4. ❌ **NEVER write raw SQL queries** (use Prisma queries only)
5. ❌ **NEVER instantiate `new PrismaClient()`** directly (causes connection issues)
6. ✅ **ALWAYS check `getTodayCheckin()` before creating a new check-in**
7. ✅ **ALWAYS validate photo compliance with `checkPhotoCompliance()`**
8. ✅ **ALWAYS use Supabase Storage for file uploads** (never save files to disk)
9. ✅ **ALWAYS run migrations via `npx prisma migrate dev`** (never edit migration.sql)
10. ❌ **NEVER modify `prisma/schema.prisma` without explicit instruction**

### **API Route Rules**
1. All mutations = server-only (API routes or server actions)
2. All Whop identity validation happens server-side
3. Enforce 1 check-in/day rule server-side (never trust client)
4. Validate workout → requires `muscle_group`
5. Validate photo requirement before allowing check-in
6. Return updated state to client after mutations

### **Security Rules**
1. ❌ **NEVER expose `SUPABASE_SERVICE_ROLE_KEY` to browser**
2. ❌ **NEVER expose `DATABASE_URL` to browser**
3. ✅ **ALWAYS use `NEXT_PUBLIC_*` prefix for client-safe variables**
4. ✅ **ALWAYS validate Whop token server-side** before DB operations
5. ✅ **ALWAYS sanitize user inputs** before database queries

### **File Upload Rules**
1. Upload flow: Client → Supabase Storage → Get URL → Save to DB
2. Use `lib/supabase-client.ts` for browser uploads
3. Store only `photo_url` (string) in database, never binary data
4. Validate file type/size client-side AND server-side
5. Photos in `workout-photos` bucket are public (URL security via obscurity)
6. Privacy controlled by `shared_photo` boolean (hide URL from feed if false)

### **Prisma Commands Reference**
```bash
# Generate Prisma Client after schema changes
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name migration_name

# Open Prisma Studio (visual database editor)
npx prisma studio

# Reset database (⚠️ DANGER: deletes all data)
npx prisma migrate reset

# Check migration status
npx prisma migrate status
```

