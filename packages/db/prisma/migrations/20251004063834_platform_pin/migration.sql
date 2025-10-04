/*
  Warnings:

  - You are about to drop the column `userId` on the `UserPlatformPin` table. All the data in the column will be lost.
  - Added the required column `userID` to the `UserPlatformPin` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."UserPlatformPin" DROP CONSTRAINT "UserPlatformPin_userId_fkey";

-- AlterTable
ALTER TABLE "public"."UserPlatformPin" DROP COLUMN "userId",
ADD COLUMN     "userID" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."UserPlatformPin" ADD CONSTRAINT "UserPlatformPin_userID_fkey" FOREIGN KEY ("userID") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
