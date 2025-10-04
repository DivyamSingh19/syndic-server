/*
  Warnings:

  - You are about to drop the column `userId` on the `FiatToCryptoTransactions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userID]` on the table `UserPlatformPin` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userEmail` to the `FiatToCryptoTransactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."FiatToCryptoTransactions" DROP CONSTRAINT "FiatToCryptoTransactions_userId_fkey";

-- AlterTable
ALTER TABLE "public"."FiatToCryptoTransactions" DROP COLUMN "userId",
ADD COLUMN     "userEmail" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserPlatformPin_userID_key" ON "public"."UserPlatformPin"("userID");

-- AddForeignKey
ALTER TABLE "public"."FiatToCryptoTransactions" ADD CONSTRAINT "FiatToCryptoTransactions_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "public"."Users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
