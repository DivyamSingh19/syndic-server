/*
  Warnings:

  - You are about to drop the column `platformPin` on the `UserProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."UserProfile" DROP COLUMN "platformPin";

-- CreateTable
CREATE TABLE "public"."UserPlatformPin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platformPin" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPlatformPin_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."UserPlatformPin" ADD CONSTRAINT "UserPlatformPin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
