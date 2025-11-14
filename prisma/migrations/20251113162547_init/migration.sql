-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('MEMBER', 'COACH');

-- CreateEnum
CREATE TYPE "CheckinType" AS ENUM ('WORKOUT', 'REST', 'REFLECTION');

-- CreateTable
CREATE TABLE "users" (
    "whop_user_id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("whop_user_id")
);

-- CreateTable
CREATE TABLE "checkins" (
    "id" TEXT NOT NULL,
    "whop_user_id" VARCHAR(255) NOT NULL,
    "type" "CheckinType" NOT NULL,
    "muscle_group" VARCHAR(50),
    "note" TEXT,
    "photo_url" TEXT,
    "shared_photo" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checkins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_stats" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "total_members" INTEGER NOT NULL,
    "active_today" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "checkins_whop_user_id_created_at_idx" ON "checkins"("whop_user_id", "created_at");

-- CreateIndex
CREATE INDEX "checkins_type_idx" ON "checkins"("type");

-- CreateIndex
CREATE INDEX "checkins_created_at_idx" ON "checkins"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "community_stats_date_key" ON "community_stats"("date");

-- CreateIndex
CREATE INDEX "community_stats_date_idx" ON "community_stats"("date");

-- AddForeignKey
ALTER TABLE "checkins" ADD CONSTRAINT "checkins_whop_user_id_fkey" FOREIGN KEY ("whop_user_id") REFERENCES "users"("whop_user_id") ON DELETE CASCADE ON UPDATE CASCADE;
